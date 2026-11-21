# Padrões e referências PostgreSQL

Revisado em 2026-11-20 contra: PostgreSQL 19.0 (release notes 19, funções UUID, eviction/índices, concorrência, backup) com conferência nas versões 18 e 17 ainda suportadas.

## Tipos e modelagem

- Use `NOT NULL`, `CHECK`, `UNIQUE`, FKs e tipos de domínio quando expressarem
  invariante real, não apenas documentação.
- Prefira `numeric`/inteiro em menor unidade (centavos) para dinheiro; nunca
  `float`/`double precision`, que perde precisão em soma/comparação.
- `timestamptz` para instantes reais (armazena em UTC, exibe convertido); use
  `timestamp` sem timezone apenas para valores que representam um horário
  "local" sem instante associado (ex.: horário de expediente recorrente).
- `jsonb` para dados realmente variáveis (schema não conhecido a priori),
  nunca como atalho para evitar modelar colunas conhecidas — colunas
  tipadas são indexáveis, checáveis e mais baratas de consultar.
- IDs: `bigint identity`/sequência para chave interna sequencial; UUID quando
  a chave precisar ser gerada fora do banco ou não expor ordem/volume. No
  PostgreSQL 18 ou superior, `uuidv7()` gera UUID ordenado por tempo, com
  localidade de índice melhor que `gen_random_uuid()`; em versão anterior,
  aceite o custo de inserção aleatória ou gere a chave na aplicação.
- Defina política explícita de soft delete (`deleted_at`) vs hard delete —
  soft delete exige índice parcial (`WHERE deleted_at IS NULL`) para manter
  unicidade e performance corretas.

## Índices

- **B-tree** (padrão): igualdade e faixa (`=`, `<`, `>`, `BETWEEN`,
  `ORDER BY`). Cobre a maioria dos casos.
- **GIN**: `jsonb`, arrays, full-text search (`tsvector`) — bom para
  contém/sobrepõe, custo de escrita maior que B-tree.
- **GiST**: dados geométricos, range types, busca por proximidade/exclusão
  (`EXCLUDE USING gist`).
- **BRIN**: tabelas muito grandes com correlação física-lógica forte (ex.:
  coluna de timestamp de inserção em tabela append-only) — índice minúsculo,
  mas inútil se os dados não estiverem fisicamente ordenados pela coluna.
- **Parcial** (`WHERE status = 'pending'`): quando a consulta sempre filtra
  por um subconjunto pequeno e estável — menor, mais rápido que indexar a
  coluna inteira.
- **Por expressão** (`(lower(email))`): quando o predicado usa função sobre a
  coluna; sem ele, o planner não pode usar B-tree para `WHERE lower(email) =
  ...`.
- **Composto**: ordem das colunas importa — a coluna de maior seletividade
  usada em igualdade geralmente vem primeiro, e o índice serve prefixos
  (índice em `(a, b)` serve consultas por `a` e por `a, b`; no PostgreSQL 18
  ou superior o *skip scan* também permite usá-lo quando `a` não aparece no
  filtro, desde que `a` tenha poucos valores distintos). Não conte com skip
  scan para substituir um índice dedicado em versão anterior.
- Todo índice tem custo de escrita e espaço; não crie por especulação —
  crie a partir do plano de uma consulta real e revise a fração de índices
  não usados (`pg_stat_user_indexes.idx_scan = 0`) periodicamente.

## Concorrência e isolation

- MVCC: leitores não bloqueiam escritores nem vice-versa; escritores
  concorrentes na mesma linha ainda serializam.
- `READ COMMITTED` (padrão): cada statement vê um snapshot novo; permite
  non-repeatable read e phantom read entre statements da mesma transação.
- `REPEATABLE READ`: snapshot único para toda a transação; prova contra
  non-repeatable read e phantom read, mas pode falhar com erro de
  serialização em escrita concorrente conflitante (aplicação deve tratar e
  retentar).
- `SERIALIZABLE`: garante equivalente a execução serial; maior taxa de
  abort sob concorrência alta, correto por padrão só quando a aplicação
  retenta transações abortadas.
- Deadlock: causado por ordem inconsistente de aquisição de locks entre
  transações concorrentes — padronize a ordem (ex.: sempre por PK crescente)
  para eliminar a classe de problema, não apenas capturar a exceção.
- `SELECT ... FOR UPDATE`/`FOR UPDATE SKIP LOCKED` para fila de trabalho
  processada por múltiplos workers sem contenção.

## Leitura de EXPLAIN

- `EXPLAIN (ANALYZE, BUFFERS)` executa a consulta de verdade e mostra tempo
  real, linhas reais vs estimadas, e buffers lidos do cache/disco — só use
  em ambiente onde executar a consulta é seguro (evite em produção sem
  transação com `ROLLBACK` ou em réplica). Desde o PostgreSQL 18,
  `EXPLAIN ANALYZE` já inclui `BUFFERS` por padrão; escrever a opção continua
  correto e deixa a intenção explícita.
- Estimativa muito distante do real (`rows=10` estimado vs `rows=100000`
  reais) indica estatística desatualizada — rode `ANALYZE` na tabela.
- `Seq Scan` não é sempre ruim: em tabela pequena ou quando a consulta lê
  grande fração das linhas, é mais barato que usar índice.
- `Nested Loop` com muitas iterações do lado externo é caro; `Hash Join`
  favorece grandes conjuntos sem ordem; `Merge Join` favorece entradas já
  ordenadas pela chave de junção.
- Buffers `shared hit` (cache) vs `read` (disco) indicam se o working set
  cabe em `shared_buffers`/cache do SO.

## Migrations (expand/contract)

1. **Expand**: adicionar coluna/tabela nova, nullable ou com default barato,
   sem remover nada usado pela versão antiga da aplicação.
2. **Migrar dado**: backfill em lote (não uma transação gigante) e, se
   necessário, dual-write enquanto ambas as versões da aplicação coexistem
   no deploy.
3. **Contract**: só depois que 100% do tráfego usa o código novo, remover
   coluna/tabela antiga.
- DDL que reescreve a tabela (`ALTER COLUMN TYPE` incompatível, adicionar
  coluna `NOT NULL` com `DEFAULT` volátil) toma lock exclusivo pelo tempo da
  reescrita — meça o tamanho da tabela antes de agendar em produção.
- Adicionar índice com `CREATE INDEX CONCURRENTLY` para não bloquear escrita
  na tabela (não pode rodar dentro de transação, e falha exige `DROP INDEX
  CONCURRENTLY` do índice inválido antes de tentar de novo).

## Mudanças recentes que alteram recomendação

- **PostgreSQL 19** (19/11/2026): `REPACK` unifica `VACUUM FULL` e `CLUSTER`
  e `REPACK (CONCURRENTLY)` reorganiza a tabela sem bloqueio exclusivo de
  leitura e escrita; JIT passou a vir desabilitado por padrão; `log_lock_waits`
  vem ligado; `EXPLAIN (ANALYZE, IO)` reporta I/O assíncrono;
  `max_locks_per_transaction` passou de 64 para 128; autenticação RADIUS foi
  removida e MD5 emite aviso (descontinuada desde a 18).
- **PostgreSQL 18** (25/09/2025): `uuidv7()` e `uuidv4()` nativas; colunas
  geradas virtuais como padrão; subsistema de I/O assíncrono; skip scan em
  B-tree; `EXPLAIN ANALYZE` inclui buffers; `initdb` liga data checksums por
  padrão.
- Versões com suporte em 20/11/2026: 19, 18, 17, 16 e 15. A 14 e anteriores
  não recebem mais correção; não recomende recurso novo sobre versão sem
  suporte sem registrar a consequência.

## Segurança e operação

- Role de aplicação sem privilégio de DDL; role de migration separado e
  usado só no pipeline de deploy; role de leitura (`SELECT` apenas) para
  relatórios/BI.
- Monitore conexões ativas vs `max_connections`, locks esperando, deadlocks,
  replicação (lag), bloat de tabela/índice e queries lentas
  (`pg_stat_statements`).
- Dimensione o pool de conexões (PgBouncer ou pool do driver) pela
  concorrência efetiva do banco, não pelo número de instâncias da aplicação —
  conexão ociosa ainda consome memória do backend Postgres.
- Planeje RPO (quanto dado pode se perder) e RTO (quanto tempo até
  recuperar) explicitamente; WAL archiving/streaming replication reduz RPO,
  mas só o restore testado prova o RTO real.

## Fontes oficiais

- Manual atual: https://www.postgresql.org/docs/current/
- Notas da versão 19: https://www.postgresql.org/docs/19/release-19.html
- Notas da versão 18: https://www.postgresql.org/docs/19/release-18.html
- Comando `REPACK`: https://www.postgresql.org/docs/current/sql-repack.html
- Tipos de dados: https://www.postgresql.org/docs/current/datatype.html
- Funções UUID (`uuidv7()`): https://www.postgresql.org/docs/current/functions-uuid.html
- Constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- Índices e índices multicoluna: https://www.postgresql.org/docs/current/indexes.html
- Concorrência (MVCC): https://www.postgresql.org/docs/current/mvcc.html
- Transaction isolation: https://www.postgresql.org/docs/current/transaction-iso.html
- Using EXPLAIN: https://www.postgresql.org/docs/current/using-explain.html
- Roles e privilégios: https://www.postgresql.org/docs/current/user-manag.html
- Backup e restore: https://www.postgresql.org/docs/current/backup.html
- Routine vacuuming: https://www.postgresql.org/docs/current/routine-vacuuming.html
