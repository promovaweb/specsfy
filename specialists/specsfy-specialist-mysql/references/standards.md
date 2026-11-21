# Padrões e referências MySQL

Reúne as regras que valem para schema, query e operação, além do índice das
referências por modo e das fontes oficiais.

Revisado em 2026-11-20 contra: MySQL 8.4 Reference Manual (documento gerado em
2026-11-17), que também publica as linhas 8.0, 9.7 e 26.x; documentação do
Percona XtraBackup; e `util.checkForServerUpgrade` do MySQL Shell.

## Versão antes de regra

8.4 e 9.7 são linhas LTS. A série 8.0 chegou ao fim de vida no ciclo
público em abril de 2026, com 8.0.46. Para suporte comercial, confira a
modalidade contratada. A série 9.7 encerrou a numeração sequencial.
A partir de 26.7.0, Innovation e LTS usam `YY.M.P`, com ano, mês e patch.
Identifique a linha e a versão efetivas antes de aplicar as regras:

```sql
SELECT VERSION(), @@version_comment, @@sql_mode;
SELECT @@character_set_server, @@collation_server, @@default_storage_engine;
SELECT table_schema, engine, table_collation
FROM information_schema.TABLES WHERE table_schema = DATABASE();
```

Diferenças que mudam decisão entre 8.0 e 8.4: `mysql_native_password`
desabilitado por padrão, opções removidas, mudança de default de alguns
parâmetros e o ciclo de vida das variáveis de replication. Confirme na nota de
release da versão instalada antes de aplicar receita de blog ou de outra linha.

## Índice dos modos

| Modo | Abre | Conteúdo |
| --- | --- | --- |
| schema | [schema.md](schema.md) | tipos, chave primária, charset, collation, índices, constraints e DDL online |
| queries | [queries.md](queries.md) | EXPLAIN, índice composto, lock InnoDB, isolation, deadlock e consulta lenta |
| operation | [operation.md](operation.md) | backup, restore, PITR, replicação, upgrade e configuração |

## Regras comuns

- A engine é InnoDB, salvo motivo declarado. MyISAM não tem transação, não tem
  crash recovery confiável e não entra em schema novo.
- `sql_mode` inclui `STRICT_TRANS_TABLES`, `ONLY_FULL_GROUP_BY`,
  `NO_ZERO_DATE` e `ERROR_FOR_DIVISION_BY_ZERO`. Modo permissivo transforma
  erro de dado em truncamento silencioso.
- Toda tabela tem chave primária. Sem ela, o InnoDB cria índice clusterizado
  oculto, a réplica baseada em linha fica mais lenta e o lock de faixa piora.
- `utf8mb4` no servidor, banco, tabela, coluna e conexão. Divergência de
  charset entre coluna e literal força conversão e pode descartar índice.
- Constraint no banco para invariante que sempre vale. `CHECK` é aplicado desde
  8.0.16; FK exige índice na coluna filha e o tipo tem de coincidir.
- Toda coluna é `NOT NULL` com default explícito ou aceita nulo por decisão
  registrada. Nulo implícito esconde ausência de dado em consulta e agregação.
- Privilégio mínimo e por papel. `GRANT ALL ON *.* TO app` transforma qualquer
  injeção em perda total de dado.
- Toda mudança de estrutura nasce como DDL versionado e passa pela tarefa
  `[MIGRATION]` da spec, com o comando de aplicação e a consulta de estado.

## Escolha de tipo

| Valor | Tipo | Motivo |
| --- | --- | --- |
| Identificador interno | `BIGINT UNSIGNED AUTO_INCREMENT` | Estreito, crescente e cabe em 20 dígitos |
| Identificador gerado fora do banco | `VARBINARY(16)` ou `BINARY(16)` | UUID binário ocupa 16 bytes; `CHAR(36)` ocupa 36 em toda secundária |
| Dinheiro | `DECIMAL(15,2)` ou inteiro em centavos | Exato em soma e comparação |
| Instante | `DATETIME(6)` em UTC | Sem conversão por fuso de sessão e sem limite de 2038 |
| Data sem hora | `DATE` | Evita meia-noite artificial e fuso |
| Booleano | `TINYINT(1)` com `CHECK (col IN (0,1))` | O MySQL não tem tipo booleano real |
| Texto curto | `VARCHAR(n)` com `n` justificado | Linha menor melhora cache e leitura |
| Texto longo | `TEXT`/`LONGTEXT` em tabela separada quando possível | `TEXT` fora da linha dificulta índice e ordenação |
| Documento variável | `JSON` com coluna gerada indexada | Consulta por caminho sem índice percorre tudo |
| Enum fechado | `VARCHAR` + `CHECK` ou tabela de domínio | `ENUM` reordena valor e altera a tabela para incluir opção |

## Collation

- `utf8mb4_0900_ai_ci` é o default da linha 8.x: sem acento, sem diferença de
  caixa, comparação Unicode 9.0. É a escolha para busca textual comum.
- `utf8mb4_0900_as_cs` quando caixa e acento distinguem valor real, como
  código, token e senha derivada.
- `utf8mb4_bin` para comparação byte a byte, quando a ordenação Unicode não é
  desejada.
- `utf8mb4_unicode_ci` só por compatibilidade com schema antigo; misturar
  `unicode_ci` e `0900_ai_ci` na mesma consulta gera erro de collation
  incompatível.
- Conversão de charset em tabela grande é DDL que reescreve dado: planeje
  espaço temporário, janela e validação de tamanho de índice.

## Índice e limite

- Chave de índice no InnoDB tem limite de 3072 bytes em `DYNAMIC`/`COMPRESSED`;
  o prefixo de 191 caracteres herdado do MySQL 5.7 existe por causa do limite
  antigo de 767 bytes e não é regra atual.
- Índice composto serve o prefixo mais à esquerda. `(tenant_id, created_at)`
  atende `tenant_id` e `tenant_id + created_at`, não `created_at` isolado.
- Índice cobre a consulta quando todas as colunas lidas estão nele (`Using
  index` no plano). Cobrir a consulta quente evita leitura da tabela.
- Coluna de baixa cardinalidade isolada raramente acelera: o otimizador prefere
  varredura. Combine com outra coluna ou use índice em coluna gerada.
- Use índice funcional ou uma coluna gerada indexada para expressão.
  Um índice simples em `email` não atende diretamente `LOWER(email)`.
- Revise `sys.schema_unused_indexes` e o número de índices por tabela: cada um
  custa escrita, buffer e tempo de DDL.

## DDL

- `ALGORITHM=INSTANT` para adicionar coluna, renomear coluna e mudar default
  quando a versão suportar; não reescreve tabela.
- `ALGORITHM=INPLACE, LOCK=NONE` quando a operação permite escrita concorrente;
  o servidor recusa a combinação quando não é possível, o que já é informação.
- `COPY` reescreve a tabela e bloqueia escrita durante a cópia: em tabela grande
  isso é janela, não `ALTER` no meio do dia.
- `ADD INDEX` em tabela grande é o caso clássico de ferramenta externa
  (`pt-online-schema-change` ou `gh-ost`) quando o lock não cabe na janela.
- Mudança incompatível segue expand/contract: adiciona, preenche, passa a ler do
  novo, remove o antigo depois que nenhuma versão em produção usa.

## Fontes oficiais

- Fim de vida da série 8.0: https://dev.mysql.com/doc/relnotes/mysql/8.0/en/news-8-0-46.html
- Numeração e linhagens: https://dev.mysql.com/doc/refman/26.7/en/mysql-releases.html
- Upgrade para 9.7: https://dev.mysql.com/doc/refman/9.7/en/upgrade-paths.html

- Manual 8.4: https://dev.mysql.com/doc/refman/8.4/en/
- Tipos de dados: https://dev.mysql.com/doc/refman/8.4/en/data-types.html
- utf8mb4: https://dev.mysql.com/doc/refman/8.4/en/charset-unicode-utf8mb4.html
- Nomes de collation: https://dev.mysql.com/doc/refman/8.4/en/charset-collation-names.html
- Índices múltiplos: https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html
- Otimização com índice: https://dev.mysql.com/doc/refman/8.4/en/optimization-indexes.html
- EXPLAIN: https://dev.mysql.com/doc/refman/8.4/en/using-explain.html
- Saída do EXPLAIN: https://dev.mysql.com/doc/refman/8.4/en/explain-output.html
- Locks InnoDB: https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html
- Isolation level: https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html
- Deadlock: https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks.html
- Online DDL: https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl.html
- Buffer pool: https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html
- Backup e recuperação: https://dev.mysql.com/doc/refman/8.4/en/backup-and-recovery.html
- mysqldump: https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html
- Replicação: https://dev.mysql.com/doc/refman/8.4/en/replication.html
- GTID: https://dev.mysql.com/doc/refman/8.4/en/replication-gtids.html
- Upgrade: https://dev.mysql.com/doc/refman/8.4/en/upgrading.html
- Trilhas de upgrade: https://dev.mysql.com/doc/refman/8.4/en/upgrade-paths.html
- Variáveis de servidor: https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html
- Percona XtraBackup: https://docs.percona.com/percona-xtrabackup/latest/
