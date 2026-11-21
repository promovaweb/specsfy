# Backup, replicação, upgrade e configuração

## Escolher a recuperação

| Cenário | Ferramenta | RPO típico | Custo |
| --- | --- | --- | --- |
| Base pequena, janela longa | `mysqldump` consistente | até o último dump | Restore lento, arquivo legível |
| Base grande, janela curta | XtraBackup ou snapshot de volume | até o último binlog aplicado | Restore rápido, exige espaço e processo |
| Recuperação pontual | Backup físico ou lógico + binlog | zero até o instante do último binlog | Depende de binlog retido |
| Falha de nó | Réplica promovida | perda conforme atraso de replicação | Exige topologia e verificação |

RPO é quanto dado pode desaparecer; RTO é quanto tempo até voltar. Escreva os
dois antes de escolher ferramenta. Sem isso, "temos backup" não significa nada.

## mysqldump

```bash
mysqldump --single-transaction --quick --routines --triggers --events \
  --set-gtid-purged=ON --default-character-set=utf8mb4 \
  --databases app | gzip > app-$(date +%F).sql.gz
```

- `--single-transaction` abre transação consistente e libera a leitura sem
  bloquear escrita, válido para InnoDB.
- `--quick` evita carregar a tabela inteira em memória.
- `--set-gtid-purged=ON` mantém o GTID no dump, necessário para clonar réplica
  em topologia com GTID.
- `--routines --triggers --events` inclui objeto que o dump padrão deixa de
  fora.
- Não use `--all-databases` com `mysql` do sistema nem misture `mysql` schema de
  versões diferentes.
- Meça o restore: um dump de 40 GB que restaura em 6 horas define o RTO real.

## XtraBackup

```bash
xtrabackup --backup --target-dir=/backup/full --user=backup
xtrabackup --prepare --target-dir=/backup/full
xtrabackup --copy-back --target-dir=/backup/full
```

- Backup físico a quente, sem parar o servidor, com consistência de InnoDB.
- `--prepare` aplica redo pendente; sem ele o backup não abre.
- `--copy-back` exige `datadir` vazio e `chown` correto para o usuário do
  `mysqld` depois da cópia.
- Incremental:

```bash
xtrabackup --backup --target-dir=/backup/inc1 \
  --incremental-basedir=/backup/full
xtrabackup --prepare --apply-log-only --target-dir=/backup/full
xtrabackup --prepare --target-dir=/backup/full
```

- Snapshot de volume (LVM, EBS) segue a mesma lógica: `FLUSH TABLES WITH READ
  LOCK` ou `LOCK INSTANCE FOR BACKUP` no instante do snapshot e liberação
  imediata depois.

## Point-in-time recovery

1. Restaure o último backup completo.
2. Confirme o GTID ou a posição de binlog do backup: `xtrabackup_binlog_info` ou
   `CHANGE REPLICATION SOURCE TO` no dump.
3. Aplique binlog até o instante anterior ao erro:

```bash
mysqlbinlog --start-position=... --stop-datetime='2026-11-20 10:29:00' \
  binlog.000123 | mysql -u root -p app
```

4. Valide a linha afetada antes de liberar o serviço.
5. Binlog expira por `binlog_expire_logs_seconds` (padrão 30 dias na linha 8.x).
   Retenção menor que a janela de recuperação declarada é RPO quebrado.

## Replicação

```ini
[mysqld]
server_id = 1
log_bin = /var/lib/mysql/binlog
binlog_format = ROW
gtid_mode = ON
enforce_gtid_consistency = ON
sync_binlog = 1
innodb_flush_log_at_trx_commit = 1
```

```sql
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST = '10.0.0.11',
  SOURCE_USER = 'repl',
  SOURCE_AUTO_POSITION = 1,
  SOURCE_SSL = 1;
START REPLICA;
SHOW REPLICA STATUS\G
```

- `SOURCE_AUTO_POSITION = 1` usa GTID e elimina cálculo manual de posição.
- `binlog_format = ROW` replica o efeito por linha. `STATEMENT` depende de
  contexto de sessão e de função não determinística.
- `sync_binlog = 1` e `innodb_flush_log_at_trx_commit = 1` priorizam durabilidade
  sobre throughput. Confirme a decisão com o negócio, não por hábito.
- `Seconds_Behind_Source` mede atraso do thread SQL e pode mentir. Meça
  heartbeat com `pt-heartbeat` ou uma tabela de marca temporal.
- `replica_parallel_workers` maior que 1 ajuda desde que o workload tenha
  transações independentes; monitore `Replica_SQL_Running_State`.
- Promoção: valide `read_only`, `super_read_only`, GTID executado
  (`gtid_executed`) e atraso zero antes de redirecionar a aplicação.
- Falha de rede transitória: `SOURCE_RETRY_COUNT` e `SOURCE_CONNECT_RETRY`
  evitam parada definitiva por oscilação.

## Upgrade

Trilha suportada:

| Origem | Destino | Caminho |
| --- | --- | --- |
| 8.0 | 8.4 LTS | direto, após verificador |
| 5.7 | 8.4 | via 8.0 |
| 8.4 | linha de inovação | conforme nota de release da linha |

Procedimento:

1. Faça backup completo e teste o restore antes de tocar a versão.
2. Rode o verificador oficial no servidor de origem:

```bash
mysqlsh -- util check-for-server-upgrade root@localhost:3306 \
  --target-version=8.4.0 --output-format=JSON
```

3. Trate cada item: charset `utf8mb3`, objeto removido, usuário com plugin
   desabilitado, variável removida, nome reservado.
4. Confirme plugin de autenticação. Em 8.4, `mysql_native_password` está
   desabilitado por padrão; conta que dependia dele não autentica.
5. Valide em cópia com volume equivalente, com a aplicação apontada para ela.
6. Em produção, pare escrita, faça backup final, suba a versão e acompanhe a
   atualização do dicionário de dados no log. `mysql_upgrade` não existe mais
   desde 8.0.16: a atualização do dicionário acontece na subida do servidor.
7. Tenha rollback testado: binário anterior com `datadir` compatível. Downgrade
   de 8.4 para 8.0 não é suportado de forma geral.

## Configuração

| Parâmetro | Regra | Efeito |
| --- | --- | --- |
| `innodb_buffer_pool_size` | 70% a 80% da RAM em servidor dedicado | Cache de dado e índice |
| `innodb_redo_log_capacity` | dimensionar por pico de escrita | Absorve rajada sem checkpoint agressivo |
| `max_connections` | pela concorrência real + pool da aplicação | Cada conexão custa memória |
| `innodb_flush_log_at_trx_commit` | 1 quando durabilidade importa | 2 perde até 1 s em queda de energia |
| `sync_binlog` | 1 quando replicação/durabilidade importa | Cada commit força binlog em disco |
| `character_set_server` | `utf8mb4` | Default de schema novo |
| `collation_server` | `utf8mb4_0900_ai_ci` | Default de comparação |
| `time_zone` | `+00:00` | Evita conversão implícita em `TIMESTAMP` |
| `sql_mode` | estrito | Erro em vez de truncamento |
| `slow_query_log` | ligado com `long_query_time` medido | Diagnóstico contínuo |
| `tmp_table_size` / `max_heap_table_size` | iguais e moderados | Tabela temporária em disco |

- `sort_buffer_size` e `join_buffer_size` são por conexão e por operação. Valor
  alto multiplicado por conexão consome memória e derruba o servidor.
- `innodb_buffer_pool_instances` ajuda acima de 1 GB de pool, com múltiplos de
  1 GB.
- Pool da aplicação menor que `max_connections`; conexão ociosa ainda ocupa
  memória no servidor.

## Segurança operacional

```sql
CREATE ROLE app_rw, app_ro, migrator;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.* TO app_rw;
GRANT SELECT ON app.* TO app_ro;
GRANT ALL PRIVILEGES ON app.* TO migrator;
SET DEFAULT ROLE app_rw TO 'app'@'%';
```

- `REQUIRE SSL` no usuário e `require_secure_transport = ON` no servidor quando
  o tráfego sai do host.
- `caching_sha2_password` é o plugin padrão da linha 8.x.
- `mysql` schema e `performance_schema` não recebem escrita da aplicação.
- Audite conta sem senha, `%` como host e privilégio global.

## Monitoramento mínimo

```sql
SHOW GLOBAL STATUS LIKE 'Threads_connected';
SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_read_requests';
SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_reads';
SHOW GLOBAL STATUS LIKE 'Innodb_row_lock_waits';
SHOW REPLICA STATUS;
SELECT * FROM sys.schema_table_lock_waits;
```

- Taxa de acerto do buffer pool: `1 - reads/read_requests`. Queda constante
  indica pool pequeno ou varredura nova.
- `Innodb_row_lock_waits` crescente junto com latência indica contenção de
  escrita.
- Disco: espaço livre, IOPS e latência de fsync são o limite mais comum.
- Alerta sem ação definida é ruído; cada alerta aponta o que fazer.
