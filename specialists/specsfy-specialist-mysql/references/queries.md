# Plano, índice e concorrência

## Ler o EXPLAIN

```sql
EXPLAIN SELECT id, total_cents FROM invoice
WHERE tenant_id = 42 AND status = 'open'
ORDER BY created_at DESC
LIMIT 20;
```

Colunas que decidem:

| Coluna | O que revela | Sinal de problema |
| --- | --- | --- |
| `type` | Como a tabela é acessada | `ALL` em tabela grande com filtro seletivo |
| `possible_keys` | Índices candidatos | Vazio com predicado seletivo |
| `key` | Índice escolhido | `NULL` quando existia candidato melhor |
| `key_len` | Quantas colunas do composto foram usadas | Menor que o esperado |
| `rows` | Linhas estimadas por acesso | Muito acima do resultado real |
| `filtered` | Fração estimada após o filtro | 1.00 com `rows` alto |
| `Extra` | Estratégia adicional | `Using temporary`, `Using filesort`, `Using where` com `type: ALL` |

Ordem de acesso do melhor para o pior: `system`, `const`, `eq_ref`, `ref`,
`range`, `index`, `ALL`. `index` é varredura do índice inteiro, não leitura
pontual. `ALL` é varredura da tabela.

`EXPLAIN ANALYZE` executa a consulta e mostra tempo real e linhas reais por
operador. Use quando estimativa e realidade divergirem, em ambiente onde rodar a
consulta é seguro.

```sql
EXPLAIN ANALYZE SELECT ...;
SHOW WARNINGS;
```

`SHOW WARNINGS` depois do `EXPLAIN` mostra a consulta reescrita pelo otimizador.
É ali que aparece conversão implícita, subconsulta transformada ou condição
empurrada.

## Índice composto na prática

Consulta:

```sql
SELECT id FROM invoice
WHERE tenant_id = 42 AND status = 'open'
ORDER BY created_at DESC
LIMIT 20;

ALTER TABLE invoice
  ADD KEY invoice_tenant_status_created_idx (tenant_id, status, created_at);
```

- Igualdade em `tenant_id` e `status`, ordenação em `created_at`: o índice é lido
  em ordem e o `LIMIT` para cedo. Sem ele, o plano ordena todo o resultado.
- Faixa interrompe o uso das colunas seguintes para busca, mas o índice ainda
  pode filtrar (`Using index condition`). `WHERE tenant_id = 42 AND created_at >
  ?` usa só `tenant_id` na busca.
- `ORDER BY created_at DESC` com `LIMIT` pequeno é o caso em que índice cobre
  ordenação. `ORDER BY` sem índice correspondente aparece como `Using filesort`.
- `GROUP BY` também se beneficia da ordem do índice quando as colunas coincidem.
- Prefixo mais à esquerda que nenhuma consulta usa é custo puro: revise com
  `sys.schema_unused_indexes`.

## Por que o índice é ignorado

| Causa | Exemplo | Correção |
| --- | --- | --- |
| Função na coluna | `WHERE DATE(created_at) = ?` | Faixa `created_at >= ? AND created_at < ?` |
| Conversão implícita | `WHERE code = 123` com `code VARCHAR` | Comparar com string |
| Collation divergente | coluna `utf8mb4_0900_ai_ci` e literal `utf8mb4_unicode_ci` | Padronizar collation |
| Curinga à esquerda | `LIKE '%termo'` | Índice de texto completo ou busca externa |
| `OR` entre colunas diferentes | `a = 1 OR b = 2` | `UNION` de duas consultas indexadas |
| Baixa seletividade | `WHERE active = 1` com 98% ativo | Composto ou coluna gerada |
| Tipo incompatível | `BIGINT` comparado a `VARCHAR` | Alinhar tipo no schema |

`USE INDEX` e `FORCE INDEX` existem, mas escondem problema de estatística ou de
índice mal desenhado. Só use com motivo medido e registro do motivo.

## Estatística

```sql
ANALYZE TABLE invoice;
SHOW INDEX FROM invoice;
SELECT * FROM mysql.innodb_index_stats
WHERE table_name = 'invoice';
```

Estimativa distante do real indica estatística desatualizada ou distribuição
muito enviesada. `innodb_stats_persistent` é o default da linha 8.x; tabela
temporária e tabela pequena mudam o comportamento de coleta.

## Locks e isolation

InnoDB bloqueia por registro de índice, não por linha da tabela. A
granularidade vem do índice usado: consulta sem índice adequado bloqueia faixa
grande.

| Isolation | Leitura comum | Lock em leitura de bloqueio | Risco |
| --- | --- | --- | --- |
| `READ UNCOMMITTED` | vê dado não confirmado | record lock | leitura suja |
| `READ COMMITTED` | snapshot por statement | record lock, sem gap lock | leitura não repetível |
| `REPEATABLE READ` (default) | snapshot por transação | next-key lock | gap lock bloqueia inserção |
| `SERIALIZABLE` | leitura vira bloqueio compartilhado | next-key lock | contenção alta |

- `SELECT ... FOR UPDATE` é leitura de bloqueio exclusiva; `FOR SHARE` é
  compartilhada. `SELECT` comum em `REPEATABLE READ` é leitura consistente e
  não bloqueia escrita.
- `READ COMMITTED` desabilita gap lock para busca e varredura, mantendo-o para
  checagem de FK e chave duplicada. É a escolha comum para reduzir deadlock em
  fila de trabalho.
- Fila processada por vários workers:

```sql
START TRANSACTION;
SELECT id FROM job
WHERE status = 'pending'
ORDER BY id
LIMIT 10
FOR UPDATE SKIP LOCKED;
```

- Transação longa: mantenha curta. Chamada HTTP, espera de usuário e
  processamento de arquivo dentro da transação seguram lock e inflam undo.

## Diagnóstico de lock

```sql
SELECT * FROM performance_schema.data_locks;
SELECT * FROM performance_schema.data_lock_waits;
SELECT * FROM sys.innodb_lock_waits;
SHOW ENGINE INNODB STATUS;
```

- `data_lock_waits` mostra quem espera e quem bloqueia, com o índice e a faixa
  bloqueada.
- `SHOW ENGINE INNODB STATUS` traz o último deadlock completo, com as duas
  transações e as consultas. O texto é a evidência que decide a correção.
- `innodb_lock_wait_timeout` (50 s por padrão) define quanto tempo a espera
  aguenta antes de erro 1205. Aumentar o timeout esconde a causa.
- Deadlock é ordem diferente de aquisição. Padronize a ordem por chave
  crescente e capture o erro 1213 para retentar a transação inteira.
- `innodb_deadlock_detect` ligado resolve rápido, mas consome CPU em carga alta;
  desligar transfere a decisão para o timeout.

## Consulta lenta

```sql
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 0.5;
SELECT * FROM sys.statements_with_runtimes_in_95th_percentile;
SELECT * FROM sys.statement_analysis ORDER BY total_latency DESC LIMIT 10;
```

- Olhe latência total, não só média: uma consulta de 200 ms chamada milhares de
  vezes pesa mais que uma de 3 s executada uma vez por dia.
- `performance_schema` precisa estar habilitado; `sys` é visão sobre ele.
- `EXPLAIN` da consulta normalizada (`?` no lugar do literal) reproduz o plano
  de produção sem o valor específico.
- Compare antes e depois com a mesma massa de dados. Mudança de plano entre
  ambientes diferentes não é regressão nem melhora.
