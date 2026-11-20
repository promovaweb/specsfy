# Padrões e referências Redis

## Seleção de estrutura e complexidade

| Estrutura | Uso típico | Operação | Complexidade |
| --- | --- | --- | --- |
| String | cache, contador, token compacto | `GET`/`SET`, `INCR` | O(1) |
| Hash | objeto com campos, atualização parcial | `HGET`/`HSET` | O(1) por campo |
| List | fila simples FIFO/LIFO | `LPUSH`/`RPOP` | O(1) nas pontas |
| Set | unicidade, pertencimento | `SADD`/`SISMEMBER` | O(1) |
| Sorted Set | ranking, janela por score/tempo | `ZADD`/`ZRANGE` | O(log N) |
| Stream | log de eventos com consumer group | `XADD`/`XREADGROUP` | O(1) append |

- Evite `LRANGE`/`SMEMBERS`/`HGETALL` em coleção grande dentro do caminho de
  produção sem limite — custo O(N) inteiro; prefira paginação (`LPOS` com
  contagem, `SSCAN`, `HSCAN`) para coleções que crescem sem bound conhecido.
- Sorted set com score = timestamp implementa janela deslizante
  (`ZREMRANGEBYSCORE` para expirar, `ZRANGEBYSCORE` para consultar) — base
  de rate limiter por janela.

## Padrões de cache

- **Cache-aside** (mais comum): aplicação lê o cache; em miss, lê a fonte,
  grava no cache com TTL, retorna. Simples, mas primeira leitura após miss
  paga o custo da fonte.
- **Write-through**: aplicação escreve no cache e na fonte na mesma
  operação — leitura sempre quente, escrita mais lenta.
- **Read-through/write-behind**: delegado a uma camada intermediária que
  sincroniza cache e fonte de forma assíncrona — maior complexidade,
  raramente necessário fora de uma camada de cache dedicada.
- **Cache stampede**: quando uma chave quente expira, muitas requisições
  concorrentes recalculam a mesma fonte ao mesmo tempo. Mitigar com jitter
  no TTL, lock de recomputação (`SET key value NX PX ttl` só o primeiro
  recalcula, os demais aguardam ou servem valor stale) ou refresh
  antecipado (recalcular antes do TTL expirar).

## Locks distribuídos

- Lock de instância única: `SET lock:<recurso> <token> NX PX <ttl>` adquire;
  liberar exige script Lua que compara o token antes do `DEL` (evita liberar
  lock de outro dono após o TTL expirar e outro processo assumir).
- TTL do lock precisa cobrir o pior caso de duração da seção crítica mais
  margem — lock que expira antes do trabalho terminar permite dois donos
  simultâneos.
- Para garantia mais forte em Redis distribuído (múltiplos nós
  independentes), avalie o algoritmo Redlock e suas críticas conhecidas
  antes de depender dele para invariante de dados crítica — para a maioria
  dos casos de aplicação, lock de instância única com lease e fencing token
  é suficiente e mais simples.

## Persistência e durabilidade

- **RDB**: snapshot binário em intervalos — recuperação rápida, mas perde
  escritas desde o último snapshot em um crash.
- **AOF**: log de comandos append-only — menor perda (configurável por
  `fsync` a cada escrita, por segundo, ou nunca), arquivo maior, restart mais
  lento para replay.
- **Nenhuma persistência**: aceitável quando o dado é 100% reconstruível a
  partir da fonte de verdade (cache puro) e o cold start após restart é
  tolerável pela fonte.
- Escolha pelo RPO/RTO exigido pelo papel do dado, não por padrão do
  provedor gerenciado.

## Eviction e memória

- `maxmemory-policy noeviction` (padrão): ao atingir o limite, **rejeita
  escritas** — trate esse erro explicitamente na aplicação ou evite esse
  modo para uso como cache.
- `allkeys-lru`/`allkeys-lfu`: evictam a chave menos recentemente usada/
  frequentemente usada entre todas — apropriado quando tudo no banco é
  cache.
- `volatile-lru`/`volatile-ttl`: evictam apenas entre chaves com TTL
  definido — necessário quando o mesmo banco lógico mistura cache (com TTL)
  e dado que não pode ser evictado (sem TTL, ex.: lock, contador de
  negócio).
- Monitore `used_memory` vs `maxmemory` e a taxa de eviction
  (`evicted_keys`) — eviction alta e crescente indica subdimensionamento ou
  TTL mal calibrado, não um estado normal.

## Cluster e Sentinel

- **Sentinel**: alta disponibilidade para topologia primary/replica única —
  monitora, detecta falha do primary e promove um replica automaticamente;
  não faz sharding.
- **Cluster**: sharding automático por hash slot (16384 slots) entre nós,
  mais failover por shard — necessário quando o dataset ou o throughput de
  um nó único não é suficiente; comandos multi-chave só funcionam se as
  chaves estiverem no mesmo slot (hash tags `{tenant}:key`).
- Cliente precisa entender a topologia (cluster-aware) — driver que não
  suporta Cluster/Sentinel corretamente falha de forma confusa no failover.

## Resiliência do cliente

- Defina timeout de conexão/comando baixo, pool limitado e circuit breaking
  no cliente — uma chamada Redis travada não pode travar a requisição
  inteira da aplicação indefinidamente.
- Evite retry cego de operação não idempotente (`INCR` duplicado muda o
  valor; reenviar é seguro só se a operação for idempotente por natureza ou
  usar token de deduplicação).
- Planeje o efeito de um cold start (cache vazio após flush, restart ou
  failover) na fonte de verdade — um cache que sempre existiu pode mascarar
  que a fonte não aguenta 100% do tráfego direto.

## Segurança

- Ative autenticação (`requirepass`/ACL com usuários e permissões por
  comando/chave) e TLS em trânsito quando a rede não for totalmente
  confiável.
- ACL permite restringir um cliente a um subconjunto de comandos/chaves —
  prefira a um único usuário com acesso total quando múltiplos serviços
  compartilham a instância.
- Nunca exponha a porta do Redis diretamente à internet pública.

## Comandos de diagnóstico

- `redis-cli --latency` mede a latência de ida e volta contra a instância em
  tempo real; `redis-cli --latency-history` mostra a série ao longo do tempo
  para correlacionar picos com eventos (rewrite de AOF, snapshot RDB,
  eviction em massa).
- `redis-cli --bigkeys` varre o keyspace (amostrado) e reporta a maior chave
  por tipo — ponto de partida para achar a chave que está distorcendo
  memória ou latência; rodar em horário de baixo tráfego, pois a varredura
  consome ciclo de CPU do servidor.
- `SLOWLOG GET`/`SLOWLOG RESET` lista os comandos mais lentos executados
  recentemente (acima do limiar de `slowlog-log-slower-than`) — use antes de
  concluir "Redis está lento" de forma genérica.
- `INFO memory`/`INFO stats` para `used_memory`, `evicted_keys`,
  `keyspace_hits`/`keyspace_misses` (hit rate) e `connected_clients`; `MEMORY
  USAGE <chave>` para o custo de uma chave específica.
- `MONITOR` imprime todo comando recebido em tempo real — útil para depurar
  localmente, mas nunca rodar em produção sob carga real: ele próprio
  degrada a performance do servidor por observar cada comando.

## Fontes oficiais

- Documentação: https://redis.io/docs/latest/
- Estruturas de dados: https://redis.io/docs/latest/develop/data-types/
- Streams: https://redis.io/docs/latest/develop/data-types/streams/
- Expiração: https://redis.io/docs/latest/commands/expire/
- Eviction (políticas de maxmemory): https://redis.io/docs/latest/develop/reference/eviction/
- Persistência (RDB/AOF): https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/
- Distributed locks (Redlock): https://redis.io/docs/latest/develop/use/patterns/distributed-locks/
- Segurança: https://redis.io/docs/latest/operate/oss_and_stack/management/security/
- Clustering: https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/
- Sentinel: https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/
