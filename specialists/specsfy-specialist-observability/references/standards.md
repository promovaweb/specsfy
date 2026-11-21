# Padrões e referências de observabilidade

Revisado em 2026-11-20 contra: OpenTelemetry Specification 1.62.0, Semantic Conventions 1.45.0, W3C Trace Context Level 1, Prometheus, Google SRE Workbook, Core Web Vitals e Grafana k6.

## Índice das referências

| Modo | Arquivo | Conteúdo |
| --- | --- | --- |
| signals | [standards.md](standards.md) | este arquivo: pilares, RED/USE, SLI/SLO, sinais por componente, cardinalidade e correlação |
| performance | [performance.md](performance.md) | metodologia de benchmark, Web Vitals, teste de carga, teoria das filas e profiling |

## Os três pilares e quando cada um resolve o quê

| Pilar | Responde | Não substitui |
|---|---|---|
| Logs estruturados | "O que exatamente aconteceu neste evento específico?" | Não mostra tendência agregada nem caminho entre serviços sem correlação |
| Métricas | "Como o sistema se comporta ao longo do tempo, agregado?" | Não explica o evento individual que causou um pico |
| Traces | "Por onde essa requisição passou e onde ela gastou tempo?" | Não é barato o suficiente para reter 100% em alto volume; depende de sampling |

Um incidente típico usa os três em sequência: a métrica detecta o desvio, o
trace localiza o serviço/etapa responsável, o log explica o evento exato.

## Frameworks de dashboard

- **RED** (por requisição/serviço): **R**ate (taxa de requisições), **E**rrors
  (taxa de erro), **D**uration (duração, analisada pela distribuição ou por
  percentis). Ideal para serviços request-driven (APIs, web).
- **USE** (por recurso): **U**tilization, **S**aturation, **E**rrors. Ideal
  para recursos finitos (CPU, memória, conexões de pool, disco).
- Combine os dois: RED no nível do serviço para detectar impacto ao usuário,
  USE no nível do recurso para localizar o gargalo depois que o RED indicou
  degradação.

## SLI, SLO e orçamento de erro

- **SLI** (Service Level Indicator): a métrica medida (ex.: proporção de
  requisições respondidas em menos de 300ms).
- **SLO** (Service Level Objective): o alvo aceitável para o SLI num período
  (ex.: 99.9% das requisições em 30 dias).
- **Error budget**: o complemento do SLO (0.1% no exemplo acima) é o quanto o
  serviço pode "gastar" de falha antes de violar o objetivo; um budget
  esgotado é sinal para priorizar confiabilidade sobre novas features, não
  apenas um número decorativo em dashboard.
- Defina SLOs por jornada crítica de usuário, não por métrica de
  infraestrutura isolada — "CPU abaixo de 80%" não é um SLO, é um sinal de
  saturação que pode ou não afetar o SLO real.

## Sinais por tipo de componente

- **Request/API**: taxa, taxa de erro por código de status, duração em
  p50/p95/p99, saturação de conexões.
- **Fila/mensageria**: profundidade da fila, idade da mensagem mais antiga,
  throughput de consumo, taxa de retry, taxa de dead-letter.
- **Banco de dados**: conexões ativas vs limite do pool, locks e tempo de
  espera, latência de query, taxa de erro, lag de replicação.
- **Cache**: hit rate, latência de hit vs miss, taxa de eviction, uso de
  memória, falhas de conexão.
- **Deployment**: versão em execução por instância, progresso do rollout,
  health check, comparação de taxa de erro antes/depois do deploy.

## Cardinalidade e custo

- A cardinalidade máxima por métrica é limitada pelo produto da quantidade de
  valores possíveis de cada label. Um label com 10 valores e outro com 1000
  permitem até 10.000 combinações, antes de considerar buckets de histogramas.
- Nunca use como label: identificador de usuário, e-mail, URL não
  normalizada (com IDs ou query string), mensagem de erro livre. Normalize a
  rota (`/users/{id}`, não `/users/123`) antes de usá-la como label.
- Trate cardinalidade como orçamento explícito: revise antes de adicionar um
  novo label a uma métrica de alto volume, não depois que o backend de
  métricas já degradou.

## Correlação e contexto distribuído

- Em HTTP, propague `traceparent` e, quando presente, `tracestate` conforme
  W3C Trace Context. Na mensageria, propague o contexto de criação na
  mensagem. Use links no span de consumo como padrão, inclusive quando o
  consumo ocorre em lote ou já tem outro contexto pai. Um job agendado
  sem contexto de origem inicia seu próprio trace.
- Para métricas HTTP do OpenTelemetry, use `http.server.request.duration`
  (histograma em segundos). Use `http.route` com o template de baixa
  cardinalidade do framework quando disponível. Deixe o atributo ausente
  se o framework não expuser a rota.
- A política local de sampling é preservar 100% dos traces com erro e
  transações marcadas como críticas, amostrando o restante. Quando o erro
  só é conhecido nos spans finais, a decisão antecipada (head sampling)
  não garante essa retenção. Use tail sampling com spans do mesmo trace
  encaminhados à mesma instância. Monitore perdas, spans atrasados e
  limites de memória e confirme a taxa de retenção observada. (regra da casa)

## Fontes primárias

- OpenTelemetry (instrumentação): https://opentelemetry.io/docs/
- Semantic conventions (nomes padronizados de atributos): https://opentelemetry.io/docs/specs/semconv/
- W3C Trace Context: https://www.w3.org/TR/trace-context/
- Prometheus practices (nomeação e cardinalidade de métricas): https://prometheus.io/docs/practices/
- Google SRE Book — SLOs: https://sre.google/workbook/implementing-slos/
- Google SRE Book — Monitoring Distributed Systems (quatro sinais de ouro): https://sre.google/sre-book/monitoring-distributed-systems/
- OpenMetrics (formato de exposição): https://openmetrics.io/
- Brendan Gregg, USE Method: https://www.brendangregg.com/usemethod.html
- OpenTelemetry Specification: https://opentelemetry.io/docs/specs/otel/
- OpenTelemetry — métricas HTTP: https://opentelemetry.io/docs/specs/semconv/http/http-metrics/
- OpenTelemetry — spans de mensageria: https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/
- OpenTelemetry — head e tail sampling: https://opentelemetry.io/docs/concepts/sampling/
- OpenTelemetry Collector — tail sampling: https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector-contrib/main/processor/tailsamplingprocessor/README.md
- Google SRE Workbook — alertas por burn rate: https://sre.google/workbook/alerting-on-slos/
- Core Web Vitals e thresholds: https://web.dev/articles/vitals
- Grafana k6 — opções de execução: https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/
- John D. C. Little — condições e aplicações da lei de Little: https://pubsonline.informs.org/doi/abs/10.1287/opre.1110.0940?journalCode=opre
