# Padrões e referências de observabilidade

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
  (taxa de erro), **D**uration (latência, em percentis). Ideal para serviços
  request-driven (APIs, web).
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

- Cardinalidade de uma métrica é o produto do número de valores possíveis de
  cada label; um label com 10 valores e outro com 1000 gera até 10.000
  séries só para essa métrica.
- Nunca use como label: identificador de usuário, e-mail, URL não
  normalizada (com IDs ou query string), mensagem de erro livre. Normalize a
  rota (`/users/{id}`, não `/users/123`) antes de usá-la como label.
- Trate cardinalidade como orçamento explícito: revise antes de adicionar um
  novo label a uma métrica de alto volume, não depois que o backend de
  métricas já degradou.

## Correlação e contexto distribuído

- Propague o contexto de trace (W3C Trace Context: `traceparent`/
  `tracestate`) por todos os boundaries síncronos (HTTP) e assíncronos
  (mensagem de fila, job agendado) para que um trace único cubra a jornada
  completa.
- Sampling: preserve 100% dos traces com erro e das transações marcadas como
  criticamente importantes para o negócio; aplique amostragem estatística
  apenas no volume "feliz" de alto tráfego.

## Fontes primárias

- OpenTelemetry (instrumentação): https://opentelemetry.io/docs/
- Semantic conventions (nomes padronizados de atributos): https://opentelemetry.io/docs/specs/semconv/
- W3C Trace Context: https://www.w3.org/TR/trace-context/
- Prometheus practices (nomeação e cardinalidade de métricas): https://prometheus.io/docs/practices/
- Google SRE Book — SLOs: https://sre.google/workbook/implementing-slos/
- Google SRE Book — Monitoring Distributed Systems (RED/USE na prática): https://sre.google/sre-book/monitoring-distributed-systems/
- OpenMetrics (formato de exposição): https://openmetrics.io/
- Brendan Gregg, USE Method: https://www.brendangregg.com/usemethod.html
