---
name: specsfy-specialist-performance-engineering
description: "Diagnosticar e melhorar performance com orçamento, medição, profiling, testes de carga, Web Vitals e regressão. Use para lentidão, throughput, uso de recursos, bundle ou capacidade; use também para revisar se uma otimização proposta tem baseline e suposição; não otimize sem medir antes, e para desenhar o sinal de saúde que monitora o sistema em produção use `$specsfy-specialist-observability`."
---

# Engenharia de performance

## Quando usar

- Acionar quando há relato de lentidão, throughput baixo, uso excessivo de
  recursos, bundle grande ou dúvida de capacidade para um pico esperado.
- Acionar também para revisar uma otimização já proposta e confirmar se ela
  tem baseline medido e suposição, ou se é apenas intuição.
- Não acionar para desenhar o sistema de métricas/alertas de produção em si:
  usar `$specsfy-specialist-observability` para isso; aqui o foco é
  diagnosticar e resolver um problema de performance específico já
  observado ou suspeitado.
- Combinar com `$specsfy-specialist-postgres` quando o gargalo estiver em
  query/índice e com `$specsfy-specialist-delivery-engineering` quando a
  correção precisa de um guardrail automático no pipeline.

## Fluxo

1. Definir a jornada, a métrica, o percentil-alvo, a carga esperada e o
   orçamento de performance antes de tocar em qualquer código.
2. Reproduzir o problema com ambiente e volume de dados representativos,
   nunca diagnosticar sobre um dataset de desenvolvimento minúsculo.
3. Medir o baseline atual e decompor o tempo por boundary (cliente, rede,
   aplicação, banco, dependência externa) para saber onde o tempo é gasto.
4. Formular uma suposição específica e usar o profiler/trace adequado ao
   boundary identificado, não um chute de otimização genérica.
5. Alterar um único fator relevante por vez e medir novamente sob as mesmas
   condições do baseline.
6. Testar que a correção preserva a corretude sob carga real, timeout e
   retry: uma otimização que quebra sob concorrência não é uma otimização.
7. Criar um guardrail (teste de regressão de performance, orçamento no
   pipeline) que impeça a regressão voltar despercebida.

## Padrões

- Usar percentis (p50, p95, p99) e a distribuição completa, nunca apenas a
  média: a média esconde a cauda longa que mais afeta a experiência real.
- Separar explicitamente latência de cliente, rede, aplicação, banco e
  dependências externas antes de decidir onde otimizar.
- Medir tanto cache frio quanto cache quente, sempre sob condição concorrente
  real, não apenas uma requisição isolada.
- Não adicionar camada de cache antes de provar o custo do caminho sem cache
  e definir a estratégia de invalidação: cache é a fonte mais comum de bug
  de dado obsoleto quando adicionado sem essa prova.
- Preservar corretude sob carga, timeout e retry: uma otimização que reduz
  latência média mas introduz race condition ou perda de retry não é
  aceitável.
- Controlar o observer effect (o próprio profiler/instrumentação alterando o
  resultado medido) e garantir aquecimento (warm-up) antes de medir JIT,
  cache de disco ou connection pool.
- Definir capacidade e headroom a partir do cenário de pico real esperado,
  não da média de tráfego observada hoje.

## Antipadrões

- Otimizar a partir de "isso parece lento" sem baseline medido: sem número
  antes e depois, é impossível saber se a mudança ajudou, não teve efeito ou
  piorou em outro percentil.
- Adicionar índice, cache ou paralelismo para resolver um sintoma sem
  identificar o boundary real do gargalo: resolve o sintoma medido no
  ambiente de teste e não move a agulha em produção, ou move o gargalo para
  outro lugar sem reduzir a latência percebida.
- Comparar médias entre duas versões em vez de comparar a mesma distribuição
  de percentis sob a mesma carga: uma média melhor pode esconder uma cauda
  p99 pior.
- Escalar hardware/réplicas antes de investigar N+1 query, chamada
  serial que poderia ser paralela, ou round-trip de rede evitável: a causa
  mais comum de lentidão em sistemas web é excesso de round-trips, não falta
  de CPU.

## Validação

- Benchmark repetível com o baseline arquivado (não apenas anotado
  informalmente) para comparação futura.
- Profiling de CPU, memória, I/O ou queries conforme a comprovação do passo de
  decomposição, não um profiler genérico "por garantia".
- Teste de carga com metas de sucesso explícitas (percentil-alvo sob
  carga-alvo) e limites seguros para não afetar produção real durante o
  teste.
- Regressão automática no pipeline, com sensibilidade proporcional à
  estabilidade histórica da métrica: métrica ruidosa precisa de margem
  maior para não gerar falso positivo constante.
- Não declarar uma mudança "mais rápida" sem o baseline antes/depois nas
  mesmas condições; "parece mais rápido" não é comprovação.

## Skills relacionadas

- `$specsfy-specialist-astro` e `$specsfy-specialist-nextjs` aplicam budgets e
  correções no framework depois que a medição localiza o gargalo.
- `$specsfy-specialist-debugging` isola defeitos funcionais que aparecem sob
  carga sem confundi-los com oportunidade de otimização.
- `$specsfy-specialist-software-architecture` trata mudança estrutural quando o
  boundary limita capacidade, em vez de uma implementação local.
- `$specsfy-specialist-web-api-design` preserva retry, paginação e contrato
  durante otimizações de throughput e latência.
- `$specsfy-specialist-observability` para o sistema de sinais que detecta
  degradação em produção antes que vire incidente.
- `$specsfy-specialist-postgres` e `$specsfy-specialist-redis` quando o
  gargalo identificado está em query, índice ou estratégia de cache.
- `$specsfy-specialist-delivery-engineering` para transformar o guardrail de
  performance em um gate automático do pipeline.

Leia [references/standards.md](references/standards.md) para Web Vitals,
metodologia de benchmark, teste de carga, profiling e orçamentos de
performance, com fontes oficiais.
