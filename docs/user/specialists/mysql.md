# MySQL

O especialista MySQL orienta o agente em três frentes do mesmo banco. O modo
**Schema** decide tipos, chave primária, charset, collation e índices. O modo
**Queries** lê o plano de execução, escolhe índice composto e explica lock,
isolation level e deadlock. O modo **Operação** cuida de backup, restauração,
replicação, upgrade e configuração do servidor.

O fio que liga os três modos é a evidência: o schema é validado por constraint e
por consulta real, a consulta é validada por `EXPLAIN`, e a operação é validada
por restauração cronometrada.

## Quando usar

- Você vai criar ou revisar tabela, tipo de coluna, chave primária, charset
  `utf8mb4`, collation, constraint ou índice composto.
- Uma consulta está lenta e você precisa interpretar `EXPLAIN`, `rows`,
  `filtered` e as notas `Using filesort` e `Using temporary`.
- Você precisa diagnosticar lock esperando, deadlock, timeout de lock ou
  escolher entre `READ COMMITTED` e `REPEATABLE READ`.
- Você vai planejar backup, testar restauração, configurar replicação com GTID
  ou preparar upgrade de 8.0 para 8.4.
- Você precisa ajustar parâmetro do servidor com cálculo e medição, em vez de
  copiar receita de blog.

O agente confirma a versão com `SELECT VERSION()`, o engine das tabelas, o
`sql_mode` e o charset antes de recomendar. MySQL 8.4 e 9.7 são linhas LTS.
O ciclo público de 8.0 terminou em abril de 2026 com a versão 8.0.46.
Desde 26.7.0, Innovation e LTS usam ano, mês e patch no formato `YY.M.P`.
Consulte a trilha de upgrade para as versões instaladas e planejadas.

## No Specsfy

O especialista lê a spec e a tarefa indicadas pela fase. A fase registra a
conclusão, as dúvidas e as evidências na spec. A criação e a decomposição
das tarefas da seção 14 cabem a `specsfy-05-tasks`.

## Fluxo

1. Confirma banco, versão, volume por tabela, workload e o contrato de
   recuperação que o produto assume.
2. Classifica o pedido em Schema, Queries ou Operação e confirma o modo com
   você quando o pedido atravessa mais de um.
3. Modela a invariante no banco com constraint e tipo preciso, não apenas na
   aplicação.
4. Mede a consulta com dados representativos e compara plano antes e depois.
5. Confere o custo de escrita e o bloqueio do DDL antes de agendar qualquer
   mudança em tabela grande.
6. Entrega à fase chamadora o arquivo versionado, o comando de aplicação e a
   consequência da decisão que ainda precisa ser acompanhada.

## Schema

O modo Schema define a estrutura que o banco consegue garantir sozinho.

- Toda tabela nasce em InnoDB, com `utf8mb4` e collation explícita.
- Dinheiro usa `DECIMAL`, nunca `FLOAT` ou `DOUBLE`.
- Instante real usa `DATETIME(6)` em UTC. `TIMESTAMP` converte pelo fuso da
  sessão e termina em 2038.
- Chave primária é `BIGINT UNSIGNED AUTO_INCREMENT` ou `VARBINARY(16)` para
  UUID. `CHAR(36)` engorda toda secundária do InnoDB.
- Índice composto segue a ordem de uso: igualdade, ordenação, faixa. O índice
  atende o prefixo mais à esquerda e ignora o resto.
- `CHECK` é aplicado desde 8.0.16, e FK exige índice e tipo compatível.
- Valide se o DDL reconstrói a tabela, permite escrita concorrente e
  espera por metadata lock. Com `ALGORITHM=INSTANT`, use o comportamento
  padrão de `LOCK`. Declare `LOCK=NONE` quando a operação aceitar e a escrita
  concorrente for requisito.
- Mudança incompatível segue expandir, preencher, migrar leitura, remover.

O detalhe de tipo, conversão de charset, coluna gerada sobre `JSON`, matriz de
DDL e o passo a passo de expansão está em
[schema.md](../../../specialists/specsfy-specialist-mysql/references/schema.md).

## Queries

O modo Queries parte do plano real, não da intuição.

- `EXPLAIN` estima linhas e mostra `filtered` em percentual. `1.00` é 1%.
  `EXPLAIN ANALYZE` executa a consulta e mostra tempo e linhas reais.
- `type: ALL` em tabela grande com filtro seletivo é o sinal mais direto de
  índice ausente ou inaplicável.
- `Using index` significa consulta coberta pelo índice. `Using filesort` e
  `Using temporary` aparecem quando a ordem ou o agrupamento não têm índice
  correspondente.
- Função na coluna, conversão implícita, collation divergente e curinga à
  esquerda derrubam o uso do índice.
- InnoDB bloqueia por registro de índice: consulta sem índice adequado bloqueia
  faixa grande.
- `REPEATABLE READ` usa next-key lock e bloqueia inserção na faixa;
  `READ COMMITTED` remove gap lock para busca e reduz deadlock em fila de
  trabalho.
- Deadlock é ordem diferente de aquisição. `SHOW ENGINE INNODB STATUS` traz as
  duas transações e as consultas do último caso.

Os comandos de diagnóstico, a tabela de isolation e a leitura de
`performance_schema` estão em
[queries.md](../../../specialists/specsfy-specialist-mysql/references/queries.md).

## Operação

O modo Operação define como o banco volta depois de uma falha.

- RPO e RTO são escritos antes da escolha da ferramenta.
- Para exportar só um banco InnoDB, use dump consistente com
  `--single-transaction` e `--set-gtid-purged=OFF`. Teste a restauração.
- Para recuperar um ponto no tempo, use backup compatível com o escopo
  dos binlogs. Capture as coordenadas do snapshot (por exemplo, com
  `--source-data=2`) e reaplique a cadeia completa até a posição anterior
  à transação indesejada, em destino isolado.
- XtraBackup exige preparação da base e incorporação dos incrementais em ordem.
- Uma réplica GTID começa com cópia consistente e os GTIDs correspondentes.
  Use `server_id` único, TLS com verificação do servidor e isole o primário
  antigo antes de promover a réplica.
- `Seconds_Behind_Source` pode mentir; heartbeat mede atraso de verdade.
- Rode `util.checkForServerUpgrade` com o alvo exato. Sem downgrade in-place
  suportado, teste a restauração do backup anterior em instância compatível.
- Parâmetro é ajustado por cálculo e medição, com o valor anterior registrado.

Os comandos de backup, o procedimento de promoção de réplica, a trilha de
upgrade e a tabela de parâmetros estão em
[operation.md](../../../specialists/specsfy-specialist-mysql/references/operation.md).

## Padrões

- Valide invariantes no banco com constraints e tipos adequados.
- Derive índices das consultas reais e confirme o plano com dados representativos.
- Conte o backup na política de recuperação depois de testar a restauração.

## Antipadrões

- `utf8` ou `utf8mb3` em schema novo, que não armazena emoji.
- `FLOAT` para dinheiro.
- UUID em `CHAR(36)` como chave primária.
- Índice criado para cada coluna citada no `WHERE`.
- `EXPLAIN` aprovado em tabela vazia.
- Transação aberta durante chamada HTTP.
- Paginação por `OFFSET` alto.
- `mysqldump` sem `--single-transaction`.
- Réplica promovida sem conferir GTID executado e atraso.
- Backup nunca restaurado.

## Validação

Em Laravel, confirme que `.env.testing` aponta para um banco separado.
Reserve `RefreshDatabase` e `migrate:fresh` para bancos descartáveis.

- `EXPLAIN` e `EXPLAIN ANALYZE` antes e depois, com a mesma massa de dados.
- `SHOW CREATE TABLE` e `information_schema.COLUMNS` confirmando `utf8mb4`.
- Teste com caractere de quatro bytes em gravação, leitura, ordenação e busca.
- Cada constraint rejeitando o valor inválido com o erro esperado.
- Dois writers simultâneos preservando a invariante e deadlock reproduzido com
  ordem corrigida.
- DDL medido em cópia com volume equivalente, com `ALGORITHM`, `LOCK`, tempo e
  espaço observados.
- Restauração cronometrada a partir do backup real, com checksum das tabelas
  críticas.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-mysql --agent universal --copy --full-depth
```

## Skills relacionadas

- [Modelagem](modeling.md) decide entidade, relação e ciclo de vida antes do
  schema.
- [PostgreSQL](postgres.md) cobre o outro banco relacional, com semântica
  própria de índice, lock e DDL.
- [Laravel](laravel.md) cuida de domínio, migrations, Eloquent e transações
  na aplicação. O especialista de schema e plano segue a engine observada.
- [Testing](testing.md) implementa o teste indicado pelo método com o runner
  instalado.
- [Redis](redis.md) cuida do cache na frente da consulta.
- [Docker](docker.md) empacota e opera o servidor MySQL em container.
- [Observabilidade](observability.md) define métrica, alerta e SLO de banco.
- [Segurança de Aplicações](application-security.md) define ameaça e
  autorização que o privilégio do banco materializa.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-mysql/SKILL.md),
com o índice e as regras comuns em
[standards.md](../../../specialists/specsfy-specialist-mysql/references/standards.md),
o schema em
[schema.md](../../../specialists/specsfy-specialist-mysql/references/schema.md),
o plano e a concorrência em
[queries.md](../../../specialists/specsfy-specialist-mysql/references/queries.md)
e a operação em
[operation.md](../../../specialists/specsfy-specialist-mysql/references/operation.md).
