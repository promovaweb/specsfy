---
name: specsfy-specialist-redis
description: Projetar e operar Redis para cache, filas, sessões, rate limiting, locks distribuídos, streams e dados efêmeros com limites e falhas explícitos. Use quando houver Redis ou clientes compatíveis (Valkey), TTLs, Lua, Cluster, Sentinel ou persistência RDB/AOF; não trate Redis como source of truth durável sem requisito explícito e comprovação de RPO/RTO aceitável.
---

# Redis

## Quando usar

- Acionar para desenhar cache, sessão, rate limiter, lock distribuído, fila
  simples ou stream sobre Redis/Valkey, ou para diagnosticar cache stampede,
  hot key, eviction inesperada ou indisponibilidade.
- Acionar também para revisar configuração de persistência (RDB/AOF),
  Cluster/Sentinel ou política de memória em produção.
- Não acionar para modelar o dado durável de origem: Redis é acelerador ou
  estrutura efêmera; a fonte de verdade e sua integridade pertencem a
  `$specsfy-specialist-postgres` (ou ao banco relevante).
- Combinar com `$specsfy-specialist-observability` para métricas e alertas
  de cache em produção e com `$specsfy-specialist-laravel`/outro framework
  quando o driver de cache/fila da aplicação for Redis.

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a linha `| Especialistas |` da tabela de
   metadados, a subseção `#### Especialistas` em `### 8. Plano técnico` e a
   seção que a fase está escrevendo. Leia também `.specsfy/STACK.md`,
   `.specsfy/RULES.md` e, quando a chave ou a fila derivar de tabela
   existente, `.specsfy/DATABASE.md`.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-redis`. Sem indicação, confirme pelo
   "Quando usar" acima qual dado fica no Redis e qual é a fonte de verdade.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Registre chave, TTL, eviction e o comportamento com o Redis indisponível
   como decisão da seção 8, dizendo qual dado volta ao banco quando a chave
   expira ou o serviço cai.

## Fluxo

1. Definir a finalidade do dado (cache, sessão, fila, lock, contador),
   quem é o source of truth, a consistência necessária e a tolerância real
   à perda daquele dado se o Redis reiniciar vazio.
2. Estimar cardinalidade, tamanho médio do valor, taxa de escrita/leitura,
   TTL necessário e o padrão de acesso (aleatório, sequencial, hot key
   concentrada).
3. Escolher a estrutura de dado e um esquema de chave namespaced e estável
   (`app:recurso:id`), evitando chave dinâmica demais que exploda a
   cardinalidade de chaves.
4. Projetar explicitamente cache stampede, estratégia de invalidação,
   retry e o comportamento da aplicação quando o Redis está indisponível
   (fail open vs fail closed).
5. Configurar limite de memória, política de eviction e persistência
   (ou ausência dela) conforme o papel do dado: cache tolera perda, lock
   e contador de negócio não.
6. Testar concorrência (duas escritas simultâneas na mesma chave),
   expiração no meio de uma operação, indisponibilidade do Redis e
   recuperação (cold start após restart/failover).
7. Medir hit rate, latência (p50/p99), uso de memória, número de conexões e
   hot keys antes de declarar a solução pronta.

## Padrões

- Dar TTL explícito a toda chave de cache e definir, por chave, quem é
  responsável por invalidá-la (evento de escrita, TTL curto, ambos).
- Evitar comandos que travam o event loop single-threaded do Redis em
  produção: `KEYS *`, `FLUSHALL`/`FLUSHDB` fora de manutenção controlada,
  `SORT` sem `LIMIT` em coleção grande; usar `SCAN` com cursor para
  iteração.
- Usar operações atômicas nativas (`INCR`, `SETNX`, `GETEX`) ou script Lua
  (`EVAL`/`EVALSHA`, executado atomicamente pelo Redis) quando a invariante
  exigir "ler e escrever" sem condição de corrida.
- Tratar lock distribuído como lease com timeout e dono verificável: gerar
  um token único no `SET key token NX PX ttl`. Só liberar com script que
  confirma `GET key == token` antes do `DEL`, nunca `DEL` incondicional.
- Separar namespace/database lógico e política de eviction por workload
  incompatível: cache volátil e dado que não pode ser evictado (fila,
  lock) não competem pela mesma política de memória.
- Não serializar objeto sem versão de schema embutida (dificulta migração
  futura do formato) nem guardar segredo (senha, token bruto) em valor sem
  necessidade: Redis não é cofre de segredo.
- Confirmar a semântica de entrega antes de tratar Redis como fila: Pub/Sub
  é fire-and-forget (assinante ausente perde a mensagem); Streams com
  consumer group oferece at-least-once com ACK explícito e precisa de
  reprocessamento idempotente do lado consumidor.

## Antipadrões

- Cache sem jitter no TTL: muitas chaves expirando no mesmo instante geram
  thundering herd contra o banco, adicionar variação aleatória ao TTL ou
  usar lock/refresh antecipado evita o pico simultâneo.
- Retry cego de comando não idempotente após timeout: se o comando
  original foi processado mas a resposta se perdeu, o retry duplica o
  efeito; use operação idempotente ou token de deduplicação.
- Chave com cardinalidade não controlada (`session:<uuid>` sem TTL,
  acumulando para sempre): memória cresce sem bound até o Redis começar a
  evictar ou cair por OOM.
- Lock distribuído implementado com `SETNX` + `DEL` simples, sem TTL: um
  processo que trava ou morre antes do `DEL` deixa o lock preso
  indefinidamente.
- Tratar `maxmemory-policy` padrão (`noeviction`) como cache automático, com
  `noeviction`, ao atingir o limite de memória o Redis passa a **rejeitar
  escritas** em vez de evictar, o que derruba a aplicação se ela não trata
  esse erro.

## Validação

- Exercitar miss, hit, expiração no meio da operação, cache stampede
  simulado e Redis indisponível: cada cenário com o comportamento esperado
  documentado, não "deve funcionar".
- Verificar limite de memória, política de eviction, persistência e
  failover (Sentinel/Cluster) em ambiente que reproduz a topologia real, não
  apenas uma instância única de desenvolvimento.
- Observar `INFO`, slow log (`SLOWLOG GET`) e métricas do cliente sem expor
  valor sensível nos logs.
- Comparar o comportamento da aplicação com e sem cache para provar que o
  cache não introduziu dado desatualizado ou inconsistente no caminho
  crítico.
- Não declarar um lock "seguro" sem o teste de dois processos concorrentes
  disputando a mesma chave, nem uma fila "confiável" sem o teste de
  reprocessamento por reentrega.

## Skills relacionadas

- `$specsfy-specialist-observability` mede se Redis reduz o gargalo, verifica
  custo, cauda de latência e regressão sob carga e entrega as métricas e os
  alertas de cache em produção.
- `$specsfy-specialist-postgres` quando Redis for cache derivado de dado
  cuja fonte de verdade e integridade são do banco relacional.
- `$specsfy-specialist-observability` para métricas, alertas e dashboards
  de cache em produção.
- `$specsfy-specialist-laravel` quando o cliente for o driver de cache/
  fila/sessão do framework.
- `$specsfy-specialist-docker` para empacotar e operar Redis/Sentinel/Cluster,
  inclusive no cluster de produção.

Leia [references/standards.md](references/standards.md) para estruturas de
dado, persistência, cluster, segurança e padrões de cache.
