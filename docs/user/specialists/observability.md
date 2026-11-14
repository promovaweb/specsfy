# Observabilidade

O especialista Observabilidade orienta o agente no desenho de logs, métricas,
traces, SLOs e alertas. Os sinais partem das perguntas operacionais do
serviço. Cada alerta indica uma ação concreta e aponta o responsável por ela.

## Quando usar

- A tarefa envolve instrumentação, investigação de incidente, definição de
  SLI e SLO ou construção de dashboards e alertas.
- Você precisa definir o sinal que mantém, pausa ou reverte um rollout.
  Nesse caso, combine com o especialista Engenharia de Entrega.

A investigação da causa de uma latência já detectada fica com o especialista
Performance. Este especialista desenha o sistema de sinais.

## Como ele trabalha

1. Define as jornadas principais do serviço e as perguntas operacionais sobre
   elas, como "o checkout funciona para o cliente".
2. Estabelece SLIs e SLOs, com orçamento de erro quando a importância do
   serviço justifica.
3. Levanta os pontos de passagem (HTTP, fila, job, banco) e o identificador de
   correlação que precisa atravessá-los, como o trace id.
4. Instrumenta eventos, métricas e spans com cardinalidade controlada desde o
   desenho.
5. Protege informações sensíveis com mascaramento e define a retenção de cada
   tipo de sinal.
6. Monta dashboards guiados pelas escolhas que eles apoiam e alertas guiados
   pela ação esperada quando disparam.
7. Valida a telemetria em sucesso, falha e degradação parcial antes de usá-la
   em um incidente.

## Padrões aplicados

- Logs estruturados em chave-valor ou JSON, com evento nomeado, severidade e
  identificador de correlação.
- Labels de métricas com cardinalidade limitada, como endpoint normalizado e
  código de status. IDs de usuário e URLs com query string ficam fora dos
  labels.
- Traces que mantêm a correlação ao atravessar HTTP, filas e jobs
  assíncronos.
- Alertas ligados ao impacto no cliente ou à ameaça de violar o SLO, cada um
  com responsável e runbook.
- Dashboards que começam pela saúde agregada (RED ou USE) e permitem descer
  até o sinal detalhado.
- Amostragem de traces que preserva todos os erros e as transações de negócio
  importantes.
- Telemetria que falha de modo seguro, sem derrubar a aplicação quando o
  exportador sai do ar.

## Erros que ele evita

- Registrar tudo sem estrutura nem severidade consistente.
- Métrica com `user_id` como label, que multiplica as séries armazenadas.
- Alerta de CPU alta no lugar de um alerta de taxa de erro ou latência acima
  do SLO.
- Dashboards antigos que disputam atenção com os painéis úteis em um
  incidente.

## Como conferir o resultado

- A telemetria gerada em um cenário controlado mantém o trace id em todos os
  pontos de passagem.
- Cardinalidade, custo, retenção e mascaramento de campos sensíveis foram
  conferidos.
- Os alertas disparam no cenário previsto e o runbook pode ser executado por
  outro desenvolvedor.
- As consultas usadas em um incidente devolvem o sinal esperado em tempo útil.
- A pergunta operacional original pode ser respondida só com a telemetria,
  sem acesso ao código ou ao banco.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-observability --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Debugging](debugging.md) usa os sinais para isolar a causa de uma falha.
- [Docker](docker.md) e [Docker Swarm](docker-swarm.md) expõem sinais de
  runtime, serviços e nodes.
- [PostgreSQL](postgres.md) e [Redis](redis.md) produzem sinais de banco e de
  cache.
- [APIs Web](web-api-design.md) define correlação e erros no contrato.
- [Performance](performance-engineering.md) investiga a causa de uma latência
  detectada.
- [Engenharia de Entrega](delivery-engineering.md) usa os sinais de saúde no
  rollout.
- [Segurança de Aplicações](application-security.md) define quais eventos de
  segurança entram ou ficam fora da telemetria.
- [Relatório de servidor](server-report.md) reúne logs e uso de disco por
  host.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-observability/SKILL.md),
com dashboards RED e USE, SLIs, SLOs e OpenTelemetry no arquivo de referência
da mesma pasta.
