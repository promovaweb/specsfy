# Padrões e referências de performance

## Metodologia

1. Definir o SLO/orçamento antes de otimizar — sem alvo, "melhorar" não tem
   critério de parada.
2. Medir o baseline sob condição representativa antes de mudar qualquer
   código.
3. Formular uma hipótese sobre o boundary responsável, apoiada em
   decomposição de tempo, não em intuição.
4. Alterar um único fator relevante por vez; mudanças compostas impedem
   saber qual delas teve efeito.
5. Medir de novo nas mesmas condições do baseline e comparar a distribuição
   completa, não só a média.

## Web Vitals (thresholds públicos)

| Métrica | Bom | Precisa melhorar | Ruim | O que mede |
|---|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5s | 2.5s–4s | > 4s | Tempo até o maior elemento visível renderizar |
| INP (Interaction to Next Paint) | ≤ 200ms | 200ms–500ms | > 500ms | Responsividade a interações ao longo da sessão |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 | Estabilidade visual (deslocamento de layout) |

Meça no percentil 75 de sessões reais (field data), não apenas em lab —
condições de rede/dispositivo reais divergem do ambiente de desenvolvimento.
INP substituiu o antigo FID (First Input Delay) como métrica oficial de
responsividade do Core Web Vitals.

## Métricas por tipo de sistema

- **API/backend**: latência em p50/p95/p99 (nunca só média), throughput
  (requisições/s), taxa de erro, saturação de recursos (CPU, memória,
  conexões de pool).
- **Jobs assíncronos**: idade da fila (tempo entre enfileirar e processar),
  duração de processamento, taxa de retry, taxa de conclusão vs falha.
- **Banco de dados**: tempo de execução de query, buffers lidos (cache hit
  vs disco), tempo de espera em lock, número de linhas examinadas vs
  retornadas (seletividade).

## Testes de carga: tipos e o que cada um prova

| Tipo | Pergunta que responde | Como conduzir |
|---|---|---|
| Load test | O sistema atende a carga esperada dentro do SLO? | Carga constante no nível de pico esperado |
| Stress test | Onde o sistema quebra e como degrada? | Aumentar carga além do esperado até falhar |
| Soak test | O sistema vaza recurso ou degrada com o tempo? | Carga moderada sustentada por horas |
| Spike test | O sistema se recupera de um pico súbito? | Carga normal, pico abrupto, volta ao normal |

Sempre defina critério de sucesso e limite de segurança antes de rodar
contra um ambiente compartilhado — um teste de stress mal isolado pode
derrubar produção.

```bash
# k6: carga com usuários virtuais e duração sustentada
k6 run --vus 50 --duration 5m load-test.js

# ab (Apache Bench): throughput/latência simples contra um único endpoint
ab -n 10000 -c 100 https://staging.exemplo.com/api/rota
```

## Teoria das filas (qualitativo)

- **Lei de Little**: em regime estável, `L = λ × W` (itens em média no
  sistema = taxa de chegada × tempo médio no sistema). Use-a para checar
  consistência entre métricas medidas — se a fila/concorrência observada for
  muito maior que `λ × W` previsto, há acúmulo (backpressure) não explicado
  pelas métricas coletadas.
- Perto da saturação de um recurso (CPU, pool de conexões, thread pool), a
  fila de espera cresce de forma não linear: um pequeno aumento de carga
  produz um aumento desproporcional de latência. Por isso headroom de
  capacidade não é só uma folga de custo, é o que mantém a curva de
  latência na região previsível.
- Throughput máximo medido em um teste de carga só vale para o perfil de
  requisição testado (mix de endpoints, tamanho de payload, cache hit
  rate); não extrapole o número para o tráfego misto real de produção sem
  medir o mix real.

## Profiling: escolher a ferramenta pelo boundary

- CPU-bound (aplicação): profiler de amostragem da linguagem/runtime (ex.:
  `React Profiler` para render, profiler nativo da linguagem de backend).
- I/O-bound (rede, disco): tracing de chamadas externas e medição de
  round-trips; frequentemente o gargalo é número de chamadas seriais, não
  velocidade de cada uma.
- Banco de dados: `EXPLAIN (ANALYZE, BUFFERS)` para decompor tempo de
  planejamento, execução, buffers e I/O real por query.
- Sempre aquecer (warm-up) antes de medir quando o runtime tiver JIT, cache
  de página ou connection pool — a primeira execução mede custo de
  inicialização, não o estado estacionário.

## Fontes

- Web Vitals: https://web.dev/articles/vitals
- INP em detalhe: https://web.dev/articles/inp
- User Timing API: https://www.w3.org/TR/user-timing/
- Navigation Timing API: https://www.w3.org/TR/navigation-timing-2/
- k6 (teste de carga): https://grafana.com/docs/k6/latest/
- PostgreSQL EXPLAIN: https://www.postgresql.org/docs/current/using-explain.html
- React Profiler: https://react.dev/reference/react/Profiler
- Brendan Gregg, USE Method: https://www.brendangregg.com/usemethod.html
- Brendan Gregg, Systems Performance (metodologia de diagnóstico): https://www.brendangregg.com/systems-performance-2nd-edition-book.html
