---
name: specsfy-specialist-observability
description: "Projetar e revisar logs, métricas, traces, correlação, SLOs, alertas e dashboards para explicar comportamento de sistemas. Use quando a tarefa envolve instrumentação, incidentes, telemetry ou operação; use também para definir o sinal que decide um rollout ou dispara um alerta; não confunda volume de logs com observabilidade, e para o diagnóstico de causa de latência específica use `$specsfy-specialist-performance-engineering`."
---

# Observabilidade

## Quando usar

- Acionar quando o pedido envolve instrumentação (logs, métricas, traces),
  investigação de incidente, definição de SLI/SLO ou construção de
  dashboard/alerta.
- Acionar também para definir o sinal objetivo que autoriza continuar, pausar
  ou reverter um rollout.
- Não acionar para diagnosticar a causa raiz de uma latência específica já
  detectada: usar `$specsfy-specialist-performance-engineering` para
  profiling e otimização; observability aqui é sobre desenhar o sistema de
  sinais, não sobre investigar um caso pontual já instrumentado.
- Combinar com `$specsfy-specialist-delivery-engineering` quando o sinal
  definido aqui vai decidir um `failure_action` de rollout.

## Fluxo

1. Definir as perguntas operacionais reais ("o checkout está funcionando
   para o usuário?") e as jornadas críticas antes de escolher qualquer
   ferramenta.
2. Estabelecer SLIs (indicadores medíveis) e SLOs (alvo aceitável) com
   orçamento de erro explícito quando o serviço tiver criticidade que
   justifique.
3. Mapear os trust/system boundaries (HTTP, fila, job, banco) e o contexto de
   correlação que precisa atravessá-los (trace id, request id).
4. Instrumentar eventos, métricas e spans com cardinalidade controlada desde
   o desenho, não como correção posterior.
5. Proteger dados sensíveis na telemetry (redaction, mascaramento) e definir
   política de retenção por tipo de sinal.
6. Construir dashboards organizados por escolha (o que essa tela me ajuda a
   decidir?) e alertas organizados por ação (o que eu faço quando esse
   alerta dispara?).
7. Validar a telemetry nos três estados (sucesso, falha e degradação
   parcial) antes de confiar nela durante um incidente real.

## Padrões

- Logs estruturados (chave-valor ou JSON) com evento nomeado, severidade,
  identificador de correlação e contexto mínimo necessário, nunca uma
  string livre concatenada que exige regex para extrair dado.
- Métricas usam apenas labels de cardinalidade limitada e conhecida
  (endpoint normalizado, código de status, tenant se o volume de tenants for
  baixo); nunca user id, URL crua com query string ou mensagem de erro bruta
  como label: cada valor único de label multiplica as séries armazenadas.
- Traces preservam o mesmo contexto de correlação atravessando HTTP, fila e
  job assíncrono: um trace que "quebra" na borda de uma fila não serve para
  depurar o problema mais comum (latência distribuída entre serviços).
- Alertas refletem impacto real ao usuário ou ameaça iminente de violar o
  SLO. Todo alerta tem owner e runbook alcançável: alerta sem ação
  associada é ruído que treina a equipe a ignorar alertas.
- Dashboards começam pela visão de saúde agregada (RED/USE) e permitem
  drill-down até o sinal granular, não o inverso.
- Sampling de traces preserva 100% dos erros e das transações de negócio
  crítico, mesmo reduzindo a amostragem do caminho feliz de alto volume.
- A própria telemetry falha de modo seguro (degrada, não derruba o produto):
  um exportador de métricas fora do ar nunca pode derrubar a aplicação que
  instrumenta.

## Antipadrões

- "Logar tudo" sem estrutura nem nível de severidade consistente: aumenta
  custo de armazenamento e reduz a capacidade real de encontrar o evento
  relevante durante um incidente, volume de log não é observabilidade.
- Métrica com label de alta cardinalidade (ex.: `user_id` ou `order_id` como
  label): explode o número de séries temporais armazenadas e pode derrubar
  ou encarecer drasticamente o backend de métricas.
- Alerta configurado em uma métrica de causa em vez de uma métrica de
  sintoma (ex.: alertar em "CPU alta" em vez de "taxa de erro/latência
  acima do SLO"): gera ruído em picos benignos e não necessariamente
  detecta o impacto real ao usuário.
- Dashboard que só existe porque "parecia útil na hora", sem revisão
  periódica: acumula painéis obsoletos que competem por atenção com os
  painéis que realmente importam durante um incidente.

## Validação

- Gerar telemetry ponta a ponta em um cenário controlado e confirmar que a
  correlação (trace id) atravessa todos os boundaries mapeados.
- Verificar cardinalidade projetada, custo estimado, retenção configurada e
  que campos sensíveis passam por redaction antes de sair do serviço.
- Confirmar que os alertas configurados realmente disparam no cenário que
  deveriam (teste ou simulação) e que o runbook vinculado é executável por
  alguém que não escreveu o código.
- Rodar, contra um cenário de falha conhecido, as queries que a equipe usaria
  durante um incidente real, confirmando que elas retornam o sinal esperado
  dentro de um tempo útil.
- Não declarar um sistema "observável" apenas por existir dashboard; a prova
  é a equipe conseguir responder à pergunta operacional original usando
  apenas a telemetry, sem acesso a código ou banco.

## Skills relacionadas

- `$specsfy-specialist-server-report` reúne logs, serviços e uso de disco
  em relatórios por host, com coleta somente leitura via Ansible.

- `$specsfy-specialist-debugging` consome os sinais para isolar causa e pede
  instrumentação adicional quando a comprovação é insuficiente.
- `$specsfy-specialist-docker` e `$specsfy-specialist-docker-swarm` expõem
  runtime, service e node signals; esta skill define correlação e escolha.
- `$specsfy-specialist-postgres` e `$specsfy-specialist-redis` produzem sinais
  de dados/cache com cardinalidade e retenção controladas aqui.
- `$specsfy-specialist-web-api-design` define correlação e erro no contrato;
  esta skill mede o comportamento do endpoint em operação.
- `$specsfy-specialist-performance-engineering` para diagnóstico de causa
  raiz de uma latência ou gargalo já detectado pelos sinais aqui definidos.
- `$specsfy-specialist-delivery-engineering` quando o sinal de saúde definido
  aqui alimenta a escolha de continuar ou reverter um rollout.
- `$specsfy-specialist-application-security` quando a telemetry precisa
  registrar (ou deliberadamente não registrar) eventos de segurança.

Leia [references/standards.md](references/standards.md) para os pilares de
observabilidade, frameworks de dashboard (RED/USE), SLIs/SLOs e fontes
oficiais de OpenTelemetry.
