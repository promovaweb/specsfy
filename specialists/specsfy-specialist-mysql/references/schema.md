# Schema, tipos, charset e índices

## Ordem de decisão

1. Qual invariante o schema precisa garantir sozinho.
2. Qual tipo representa o valor sem perda e no menor espaço aceitável.
3. Qual chave primária serve ao índice clusterizado.
4. Quais consultas reais existem hoje e qual índice cada uma usa.
5. Qual DDL entrega a mudança com o menor bloqueio possível.

## Charset e collation

```sql
CREATE DATABASE app
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE app;

CREATE TABLE customer (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(254) NOT NULL,
  name VARCHAR(160) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY customer_email_unique (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

- `utf8mb4` representa toda a faixa Unicode em UTF-8, inclusive emoji e
  caracteres CJK que precisam de quatro bytes.
- `utf8` é alias depreciado de `utf8mb3`: três bytes, sem emoji. Em 8.x ele
  continua aceito em 8.4, inclusive na definição de schema, mas está depreciado.
- A conexão precisa do mesmo charset. Driver antigo que abre em `latin1` grava
  byte errado e a corrupção só aparece na leitura.
- Verificação:

```sql
SELECT table_name, table_collation
FROM information_schema.TABLES
WHERE table_schema = DATABASE();

SELECT column_name, character_set_name, collation_name
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE() AND character_set_name <> 'utf8mb4';
```

- Conversão:

```sql
ALTER TABLE customer CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci, ALGORITHM=COPY, LOCK=SHARED;
```

`COPY` reescreve a tabela e pede espaço temporário equivalente ao tamanho dela.
Em tabela grande, isso é janela agendada com backup recente, não execução
oportunista.

## Tipos

| Necessidade | Evite | Use | Consequência |
| --- | --- | --- | --- |
| Dinheiro | `FLOAT`, `DOUBLE` | `DECIMAL(15,2)` | Ponto flutuante arredonda em soma e comparação |
| Contador | `INT` com sinal | `BIGINT UNSIGNED` | `INT` estoura em 2,1 bilhões |
| Instante | `TIMESTAMP` | `DATETIME(6)` em UTC | `TIMESTAMP` converte por sessão e termina em 2038 |
| Texto longo | `VARCHAR(4000)` | `TEXT` em coluna separada | Linha grande reduz densidade do buffer pool |
| Documento | `TEXT` com JSON serializado | `JSON` + coluna gerada | Sem tipo, filtro por caminho lê tudo |
| Enum | `ENUM` | `VARCHAR` + `CHECK` | Incluir valor no `ENUM` altera a tabela |
| UUID | `CHAR(36)` | `BINARY(16)` | 36 bytes na primária se repetem em cada índice |
| Binário pequeno | `BLOB` na tabela quente | tabela e storage separados | `BLOB` grande empurra linha para overflow |

- `VARCHAR(n)` em `utf8mb4` reserva até `4 * n` bytes na linha temporária, então
  `n` grande encarece ordenação e tabela temporária.
- `TEXT` e `BLOB` aceitam default expresso como expressão em 8.4, mesmo
  para literal, como `TEXT DEFAULT ('')`. Índices B-tree nesses tipos exigem
  prefixo. Em uma igualdade, confirme o valor completo após filtrar pelo
  prefixo.
- Coluna gerada indexada para consultar `JSON`. O exemplo parte de uma
  tabela InnoDB `event` com coluna `payload JSON` no schema selecionado:

```sql
ALTER TABLE event
  ADD COLUMN tenant_id VARCHAR(64)
    GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(payload, '$.tenant.id'))) VIRTUAL,
  ADD KEY event_tenant_idx (tenant_id);
```

InnoDB aceita índice secundário sobre coluna gerada virtual. O valor
materializado ocupa espaço no índice, enquanto `STORED` também o guarda na
linha. Escolha `STORED` se houver requisito que a coluna virtual não atende
ou se a medição justificar o custo.

- `TIMESTAMP` e `DATETIME` com `ON UPDATE CURRENT_TIMESTAMP` são úteis para
  `updated_at`, desde que a aplicação aceite a regra no banco.

## Chave primária e índices

Os comandos com `invoice` usam a tabela criada na seção Constraints.

- InnoDB organiza a tabela pela chave primária. Secundária guarda a chave
  primária como ponteiro, então chave primária larga engorda todos os índices.
- Chave crescente concentra escrita no fim da árvore. UUID aleatório espalha a
  escrita, gera divisão de página e fragmenta o cluster.
- Regra prática para composto: colunas de igualdade, depois colunas de
  ordenação, depois colunas de faixa. Exemplo:

```sql
-- WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC
ALTER TABLE invoice
  ADD KEY invoice_tenant_status_created_idx (tenant_id, status, created_at);
```

- `ORDER BY created_at DESC` usa o mesmo índice nos dois sentidos desde 8.0, que
  suporta índice descendente real.
- Índice que cobre a consulta evita leitura da tabela:

```sql
EXPLAIN SELECT tenant_id, status FROM invoice
WHERE tenant_id = 42 AND status = 'open';
-- Extra: Using index
```

- Índice redundante é o que tem prefixo igual a outro já existente:
  `(tenant_id)` é redundante quando existe `(tenant_id, status)`.
- Índice em FK é obrigatório para evitar lock de tabela na verificação da
  constraint; o InnoDB cria automaticamente se não existir, e o nome gerado
  fica fora do padrão do projeto.

## Constraints

```sql
CREATE TABLE IF NOT EXISTS tenant (
  id BIGINT UNSIGNED PRIMARY KEY
) ENGINE=InnoDB;

CREATE TABLE invoice (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(16) NOT NULL,
  total_cents BIGINT NOT NULL,
  issued_on DATE NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY invoice_tenant_idx (tenant_id),
  CONSTRAINT invoice_status_check
    CHECK (status IN ('draft','open','paid','void')),
  CONSTRAINT invoice_total_check CHECK (total_cents >= 0),
  CONSTRAINT invoice_tenant_fk FOREIGN KEY (tenant_id)
    REFERENCES tenant (id) ON DELETE RESTRICT
) ENGINE=InnoDB;
```

- `CHECK` violado retorna erro 3819 com `sql_mode` estrito e nome da constraint;
  teste o erro, não só o caminho felizmente válido.
- FK com `ON DELETE CASCADE` só quando o filho não tem valor sem o pai.
  `RESTRICT` protege histórico financeiro e auditoria.
- `UNIQUE` com nulo: o MySQL permite múltiplos nulos em índice único. Se o
  nulo não deve repetir, a coluna é `NOT NULL` ou a regra vive em coluna gerada.

## DDL online

| Operação | Algoritmo possível | Reconstrói a tabela? | DML concorrente? | Metadata lock |
| --- | --- | --- | --- | --- |
| Adicionar coluna elegível | `INSTANT` | Não | Sim | Breve, sujeito a espera |
| Renomear coluna elegível | `INSTANT` | Não | Sim | Breve, sujeito a espera |
| Adicionar índice secundário comum | `INPLACE` | Não, constrói o índice | Sim com `LOCK=NONE` | Exclusivo ao publicar a definição |
| Remover índice secundário comum | `INPLACE` | Não | Sim com `LOCK=NONE` | Exclusivo ao publicar a definição |
| Alterar tipo, na maioria dos casos | `COPY` | Sim | Não | Bloqueia escrita durante a cópia |
| Converter charset de colunas com dados | `COPY` | Sim | Não | Bloqueia escrita durante a cópia |

Desde 8.0.29, `INSTANT` pode adicionar coluna em qualquer posição quando a
operação é elegível. Confira restrições de formato de linha, índices, tipo
de default e versão. Para `INSTANT`, omita `LOCK` ou use `LOCK=DEFAULT`.
Para operações que aceitam `LOCK=NONE`, declare-o quando DML concorrente
for requisito. Mesmo DDL online pode esperar transações que seguram metadata
lock e bloquear acessos enquanto aguarda. Meça em cópia representativa.

```sql
ALTER TABLE invoice ADD COLUMN paid_at DATETIME(6) NULL,
  ALGORITHM=INSTANT;

ALTER TABLE invoice ADD KEY invoice_paid_idx (paid_at),
  ALGORITHM=INPLACE, LOCK=NONE;
```

Medir antes:

```sql
SELECT table_name, table_rows,
       ROUND(data_length/1024/1024) AS data_mb,
       ROUND(index_length/1024/1024) AS index_mb
FROM information_schema.TABLES
WHERE table_schema = DATABASE();
```

## Expansão e contração

1. Expandir: coluna ou tabela nova, anulável ou com default barato, sem remover
   o que a versão antiga da aplicação ainda lê.
2. Preencher em lote, com `WHERE` sobre chave, não em uma transação única.
3. Escrever nos dois lugares enquanto as duas versões convivem no deploy.
4. Contração: remover a estrutura antiga só quando nenhuma versão em produção a
   usa, com backup e janela definidos.

Nunca renomear ou remover coluna usada em produção no mesmo passo em que a nova
nasce: o deploy raramente é atômico entre todas as instâncias.
