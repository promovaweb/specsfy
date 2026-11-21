# Redis

O especialista Redis orienta o agente no uso de Redis ou Valkey em cache,
sessões e rate limiting, além de locks, filas e streams. O Redis atua como
camada rápida ou estrutura efêmera, enquanto a fonte oficial dos registros
continua no banco relacional.

## Quando usar

- Você vai desenhar um cache, uma sessão, um rate limiter, um lock distribuído,
  uma fila simples ou um stream.
- Você precisa investigar cache stampede, hot keys, eviction inesperada ou
  indisponibilidade.
- Você vai revisar persistência (RDB ou AOF), Cluster, Sentinel ou a política
  de memória em produção.

A modelagem do registro durável fica com o especialista PostgreSQL ou com o
especialista do banco usado no projeto. O Redis guarda apenas cópias e
estruturas temporárias.

## Como ele trabalha

1. Define a finalidade de cada chave, a fonte oficial da informação, a
   consistência necessária e o impacto de perder o conteúdo quando o Redis
   reinicia vazio.
2. Estima cardinalidade, tamanho dos valores, taxas de leitura e escrita, TTL e
   padrão de acesso.
3. Escolhe a estrutura e um esquema de chaves estável, como
   `app:recurso:id`.
4. Planeja a invalidação, a proteção contra cache stampede, o retry e o
   comportamento da aplicação com o Redis fora do ar (fail open ou fail
   closed).
5. Configura limite de memória, eviction e persistência conforme o papel de
   cada chave. Um cache tolera perda, mas um lock ou um contador de negócio
   não tolera.
6. Testa escritas simultâneas, expiração no meio de uma operação,
   indisponibilidade e recuperação depois de um restart ou failover.
7. Mede hit rate, latência (p50 e p99), memória, conexões e hot keys.

## Padrões aplicados

- Toda chave de cache tem TTL explícito e um responsável pela invalidação.
- `KEYS *`, `FLUSHALL` e `SORT` sem `LIMIT` ficam fora de produção. A
  iteração usa `SCAN` com cursor.
- Leituras e escritas que precisam ser atômicas usam `INCR`, `SETNX`, `GETEX`
  ou um script Lua.
- O lock distribuído usa `SET key token NX PX ttl` com token único. A
  liberação confere o token antes do `DEL`.
- Cache volátil e chaves que não podem ser removidas, como filas e locks, usam
  políticas de memória separadas.
- Os valores serializados levam a versão do formato. Segredos ficam fora do
  Redis.
- A semântica de entrega é confirmada. O Pub/Sub perde mensagens sem
  assinante, enquanto Streams com consumer group entregam pelo menos uma vez e
  exigem processamento idempotente.

## Erros que ele evita

- TTLs iguais que expiram ao mesmo tempo e sobrecarregam o banco. Uma variação
  aleatória no TTL espalha as expirações.
- Retry de comando não idempotente depois de um timeout.
- Chaves como `session:<uuid>` sem TTL, que crescem até o Redis ficar sem
  memória.
- Lock com `SETNX` e `DEL` sem TTL, que fica preso quando o processo cai.
- Usar a política padrão `noeviction` como se fosse cache, o que faz o Redis
  rejeitar escritas ao atingir o limite. Sem `maxmemory` definido não existe
  limite nem eviction, e o processo cresce até faltar memória no host.

## Como conferir o resultado

- Miss, hit, expiração no meio da operação, stampede simulado e Redis
  indisponível têm o comportamento esperado documentado.
- Memória, eviction, persistência e failover foram verificados em uma
  topologia equivalente à de produção.
- `INFO`, `SLOWLOG GET` e as métricas do cliente foram observados sem expor
  valores sensíveis.
- A aplicação foi comparada com e sem cache para provar que o cache não exibe
  conteúdo desatualizado no caminho principal.
- Locks foram testados com dois processos concorrentes. Filas foram testadas
  com reentrega.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-redis --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Observabilidade](observability.md) mede se o Redis resolve a lentidão
  observada e cuida de métricas e alertas de cache.
- [PostgreSQL](postgres.md) guarda a fonte oficial dos registros.
- [Laravel](laravel.md) entra quando o Redis é o driver de cache, fila ou
  sessão.
- [Docker](docker.md) empacota e opera Redis, Sentinel ou Cluster, inclusive no
  cluster de produção.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-redis/SKILL.md),
com estruturas, persistência, cluster e padrões de cache no arquivo de
referência da mesma pasta.
