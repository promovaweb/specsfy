# Backup, replicação, upgrade e configuração

## Escolher a recuperação

| Cenário | Ferramenta | RPO típico | Custo |
| --- | --- | --- | --- |
| Base pequena, janela longa | `mysqldump` consistente | até o último dump | Restore lento, arquivo legível |
| Base grande, janela curta | XtraBackup ou snapshot de volume | até o ponto do backup, sem binlogs | Restore rápido, exige espaço e processo |
| Recuperação pontual | Backup físico ou lógico + binlog | até a última transação recuperável | Depende de backup consistente e cadeia de binlogs |
| Falha de nó | Réplica promovida | perda conforme atraso de replicação | Exige topologia e verificação |

RPO é quanto dado pode desaparecer; RTO é quanto tempo até voltar. Escreva os
dois antes de escolher ferramenta. Sem isso, "temos backup" não significa nada.

## Dump lógico

Para exportar só `app`, use um cliente Oracle MySQL compatível. Configure os
perfis `source` e `recovery` com `mysql_config_editor` (senha via prompt).
Aponte `recovery` para uma instância isolada, vazia e compatível. Execute os
blocos em Bash. O gzip só recebe o nome definitivo se todo o pipeline funcionar:

```bash
(
  set -euo pipefail
  dump="app-$(date +%F-%H%M%S).sql.gz"
  partial=$(mktemp "${dump}.XXXXXX")
  trap 'rm -f -- "$partial"' EXIT
  mysqldump --login-path=source --single-transaction --quick \
    --routines --triggers --events --set-gtid-purged=OFF \
    --default-character-set=utf8mb4 --databases app | gzip > "$partial"
  mv -- "$partial" "$dump"
  gzip -dc -- "$dump" | mysql --login-path=recovery
)
```

Use InnoDB e suspenda DDL durante o dump. `--quick` lê em fluxo.
`--set-gtid-purged=ON` inclui GTIDs de todo o servidor, mesmo quando o dump
omite dados. Reserve-o para uma cópia lógica integral de réplica GTID.
Na restauração de teste, confira objetos, contagens, checksums e RTO.
Mantenha o agendador de eventos desabilitado no destino de teste.

## XtraBackup

Use a versão de XtraBackup compatível com o servidor de origem e o destino.
Configure as credenciais da conta de backup em arquivo de opções protegido.
Use diretórios novos em um volume de backup protegido. Para um backup apenas
completo, copie a base para `/backup/restore-full` e prepare com
`xtrabackup --prepare --target-dir=/backup/restore-full`. Para a cadeia abaixo,
prepare cópias e preserve os originais:

```bash
xtrabackup --backup --target-dir=/backup/full --user=backup &&
  xtrabackup --backup --target-dir=/backup/inc1 \
    --incremental-basedir=/backup/full --user=backup &&
  cp -a -- /backup/full /backup/restore-full &&
  cp -a -- /backup/inc1 /backup/restore-inc1 &&
  xtrabackup --prepare --apply-log-only --target-dir=/backup/restore-full &&
  xtrabackup --prepare --target-dir=/backup/restore-full \
    --incremental-dir=/backup/restore-inc1
```

Com mais deltas, mescle-os em ordem, usando `--apply-log-only` até o
penúltimo e omitindo-o no último. Depois da preparação bem-sucedida, pare
o MySQL no destino isolado. Confirme que o `datadir` configurado está vazio.
Neste exemplo, o arquivo de opções do destino aponta para `/var/lib/mysql`
e o serviço roda como `mysql`:

```bash
sudo xtrabackup --copy-back --target-dir=/backup/restore-full \
  --datadir=/var/lib/mysql &&
  sudo chown -R mysql:mysql /var/lib/mysql
```

Suba o servidor e confira dados gravados tanto na base quanto no incremental.

## Point-in-time recovery por posição

1. Faça um backup consistente do escopo integral que os binlogs vão afetar.
   Para o dump lógico em origem InnoDB, use `--all-databases` no lugar de
   `--databases app`, troque o prefixo do arquivo para `instance` e acrescente
   `--source-data=2` ao comando de dump, com os privilégios exigidos pelo MySQL.
   Essa opção exige binlog habilitado e pode adquirir um lock global breve.
   O comentário
   `CHANGE REPLICATION SOURCE TO` registra arquivo e posição do snapshot.
   Para XtraBackup, use as coordenadas correspondentes ao último backup
   incorporado, registradas em `xtrabackup_binlog_info`.
2. Restaure em uma instância isolada e compatível. Retenha todos os binlogs
   desde a posição do backup até o incidente. Inspecione a saída de
   `mysqlbinlog` e encontre a posição inicial da transação a excluir,
   preservando os limites de transação.
3. Passe os arquivos em ordem, em uma só chamada. Neste exemplo, o snapshot
   começa em `binlog.000123` na posição 456 e a transação indesejada começa
   na posição 890 de `binlog.000125`. Substitua pelos valores verificados:

```bash
mysqlbinlog --start-position=456 --stop-position=890 \
  binlog.000123 binlog.000124 binlog.000125 > replay.sql &&
  mysql --login-path=recovery < replay.sql
```

4. Valide o dado afetado, as transações vizinhas e o tempo de recuperação
   antes de liberar o serviço. O banco inicial do cliente `mysql` não
   restringe quais schemas os eventos podem alterar. Ajuste
   `binlog_expire_logs_seconds` e o arquivamento para cobrir a janela
   prometida, inclusive se um binlog for removido do servidor.

## Replicação

Exemplo de configuração para MySQL 8.4. Ajuste o `server_id` para cada membro:

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

Use um `server_id` e um `server_uuid` distintos em cada instância. Antes de
iniciar a réplica, restaure uma cópia consistente e integral da origem, com
os GTIDs correspondentes ao snapshot. Por exemplo, use o dump lógico integral
de uma origem GTID com `--set-gtid-purged=ON` em destino novo com GTID
habilitado e sem histórico conflitante. Confirme que a origem ainda retém no
binlog as transações que faltam. Auto-position só solicita esses GTIDs.

Na origem, provisione uma conta restrita ao host da réplica. Recolha a senha
gerada diretamente em um gerenciador de segredos:

```sql
CREATE USER 'repl'@'replica.example.com' IDENTIFIED BY RANDOM PASSWORD REQUIRE SSL;
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'replica.example.com';
```

Na réplica, instale a CA que assina o certificado da origem e use em
`SOURCE_HOST` o DNS coberto pelo certificado. Configure com o canal parado.
`START REPLICA` recebe a senha em sessão administrativa protegida. Injete o
valor do cofre pelo cliente de provisionamento, sem histórico nem logs de
comandos. O valor entre chaves é um substituto para o segredo, que deve ser
escapado como literal SQL:

```sql
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST = 'primary.example.com',
  SOURCE_AUTO_POSITION = 1,
  SOURCE_SSL = 1,
  SOURCE_SSL_CA = '/etc/mysql/tls/source-ca.pem',
  SOURCE_SSL_VERIFY_SERVER_CERT = 1;
START REPLICA USER = 'repl' PASSWORD = '{senha-do-cofre}';
SHOW REPLICA STATUS\G
```

Como a senha fornecida a `START REPLICA` fica apenas em memória, reinicie
o canal com a mesma credencial após reiniciar o servidor. Mantenha
`super_read_only` habilitado na réplica em operação normal.

- `binlog_format = ROW` replica o efeito por linha. `STATEMENT` depende de
  contexto de sessão e de função não determinística.
- `sync_binlog = 1` e `innodb_flush_log_at_trx_commit = 1` priorizam durabilidade
  sobre throughput. Confirme a decisão com o negócio, não por hábito.
- `Seconds_Behind_Source` mede atraso do thread SQL e pode mentir. Meça
  heartbeat com `pt-heartbeat` ou uma tabela de marca temporal.
- `replica_parallel_workers` maior que 1 ajuda desde que o workload tenha
  transações independentes; monitore `Replica_SQL_Running_State`.
- Promoção planejada: bloqueie escritas e isole o primário antigo, capture
  seu conjunto final `@@GLOBAL.gtid_executed` e espere a candidata aplicá-lo.
  Use `GTID_SUBSET` nos dois sentidos para detectar lacunas e GTIDs errantes.
  Só abra escrita no novo primário depois da verificação e do isolamento.
  Se o primário caiu e o conjunto final é desconhecido, quantifique a perda
  possível antes de promover.
- Falha de rede transitória: `SOURCE_RETRY_COUNT` e `SOURCE_CONNECT_RETRY`
  evitam parada definitiva por oscilação.

## Upgrade

Trilha suportada:

| Origem | Destino | Caminho |
| --- | --- | --- |
| 8.0 | 8.4 LTS | direto, após verificador |
| 5.7 | 8.4 | via 8.0 |
| 8.4 LTS | 9.7 LTS | direto, após verificador |
| 8.4 LTS | Innovation da sua linhagem | conforme matriz de compatibilidade da versão |

Procedimento:

1. Faça backup completo e teste o restore antes de tocar a versão.
2. Confira a matriz para a origem e o destino exatos. Rode o verificador
   oficial com MySQL Shell que suporte o destino:

```bash
mysqlsh -- util check-for-server-upgrade root@localhost:3306 \
  --target-version="${MYSQL_TARGET_VERSION:?Informe a versão exata planejada}" \
  --output-format=JSON
```

3. Trate cada item: charset `utf8mb3`, objeto removido, usuário com plugin
   desabilitado, variável removida, nome reservado.
4. Confirme plugin de autenticação. Em 8.4, `mysql_native_password` está
   desabilitado por padrão; conta que dependia dele não autentica.
5. Valide em cópia com volume equivalente, com a aplicação apontada para ela.
6. Em produção, pare escrita, faça backup final, suba a versão e acompanhe a
   atualização do dicionário de dados no log. Desde 8.0.16, o servidor
   executa na inicialização as etapas que exigiam `mysql_upgrade`.
7. Confirme o caminho de downgrade documentado para as duas versões. Quando
   downgrade in-place não for suportado, restaure o backup anterior numa
   instância compatível com a origem. Defina como reconciliar as escritas
   aceitas após a troca e teste o retorno antes da janela.

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

Com a conta de aplicação já provisionada para o host abaixo:

```sql
CREATE ROLE app_rw, app_ro, migrator;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.* TO app_rw;
GRANT SELECT ON app.* TO app_ro;
GRANT ALL PRIVILEGES ON app.* TO migrator;
GRANT app_rw TO 'app'@'app.example.com';
SET DEFAULT ROLE app_rw TO 'app'@'app.example.com';
```

- Reconecte como a aplicação e rode `SELECT CURRENT_ROLE();`. Confira a role
  ativa e teste uma operação permitida e outra fora dos privilégios.
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
