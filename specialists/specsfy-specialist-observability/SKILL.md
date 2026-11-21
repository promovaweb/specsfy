---
name: specsfy-specialist-observability
description: "Projetar e revisar logs, métricas, traces, correlação, SLOs, alertas e dashboards (modo signals) e diagnosticar performance com orçamento, medição, profiling, teste de carga, Web Vitals e regressão (modo performance). Use quando a tarefa envolve instrumentação, incidente, telemetria, SLI/SLO, alerta, dashboard, lentidão, throughput, uso de recursos, bundle ou capacidade. Não confunda volume de logs com observabilidade; para isolar a causa de uma falha funcional use `$specsfy-specialist-debugging`; para contrato HTTP, arquitetura e atributos de qualidade use `$specsfy-specialist-architecture`; para cache, índice e query use `$specsfy-specialist-postgres` ou `$specsfy-specialist-redis`."
---

# Observabilidade

Desenhe o sistema de sinais que explica o comportamento em produção e use a
mesma disciplina para diagnosticar um problema de performance já detectado. O
modo signals define o que é medido, por quê e com qual custo; o modo
performance mede, localiza o boundary do gargalo e prova a mudança com baseline
arquivado.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Instrumentação (logs, métricas, traces), investigação de incidente, SLI/SLO, dashboard, alerta ou o sinal que decide um rollout | signals | [Pilares, RED/USE, SLOs e cardinalidade](references/standards.md) |
| Lentidão, throughput baixo, uso excessivo de recursos, bundle grande, dúvida de capacidade ou revisão de uma otimização já proposta | performance | [Metodologia, Web Vitals, carga e profiling](references/performance.md) |

Não use para:

- Diagnosticar a causa raiz de uma latência já detectada no modo signals: siga
  no modo performance, que faz profiling e otimização.
- Isolar uma falha funcional que aparece sob carga. Use
  `$specsfy-specialist-debugging`; o defeito não é oportunidade de otimização.
- Decidir boundary de serviço, contrato HTTP ou atributo de qualidade
  estrutural. Use `$specsfy-specialist-architecture`.
- Coletar inventário de host, serviços e disco. Use
  `$specsfy-specialist-server` quando ele estiver disponível; aqui o foco é o
  sinal que explica o comportamento do serviço.

## No Specsfy

1. **Fonte de entrada por fase**
   - Em `specsfy-02-backlog`, leia o item em `specs/backlog/` e registre ali
     as decisões e sinais do especialista, além das dúvidas abertas.
   - Em `specsfy-03-specify` e `specsfy-04-validate`, use a
     spec aberta e devolva a conclusão à seção trabalhada pela fase.
   - Em `specsfy-05-tasks`, ajude a sugerir e sincronizar especialistas e modos
     entre o cabeçalho, a seção 8 e as tarefas. Só essa fase escreve a seção 14.
   - Em `specsfy-06-implement`, limite-se à tarefa indicada e ao passo carregado.

   Nas fases com spec, leia a spec aberta indicada pela skill chamadora ou
   localizada por `specsfy status`. Consulte a linha `| Especialistas |`,
   a subseção `#### Especialistas` em `### 8. Plano técnico` e a seção
   pertinente à fase.
   Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md` para confirmar runtime, backend de telemetria e limites.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-observability (signals|performance)`.
   Sem indicação, escolha o modo pelo "Quando usar" acima.
3. Devolva a conclusão e as dúvidas abertas no destino indicado no item 1,
   no próprio backlog, na spec ou na tarefa da fase.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Quando a fase trabalhar requisitos, plano técnico ou testes na spec,
   escreva SLI, SLO e alerta como NFR mensurável em `### 7. Requisitos` e a
   instrumentação na seção 8; o baseline medido entra em `### 12. Plano de
   testes e rastreabilidade` como verificação do requisito.

## Fluxo

1. Definir as perguntas operacionais reais ("o checkout está funcionando para o
   usuário?") e as jornadas críticas antes de escolher qualquer ferramenta.
2. Descobrir o estado observado: telemetria existente, custo, retenção,
   backend de métricas, volume de tráfego e limites do runtime.
3. Estabelecer SLIs (indicadores medíveis) e SLOs (alvo aceitável) com
   orçamento de erro explícito quando o serviço tiver criticidade que
   justifique.
4. Executar o fluxo do modo escolhido e registrar a consequência no artefato do
   projeto.

### Modo signals

1. Mapear os trust/system boundaries (HTTP, fila, job, banco) e o contexto de
   correlação que precisa atravessá-los (trace id, request id).
2. Instrumentar eventos, métricas e spans com cardinalidade controlada desde o
   desenho, não como correção posterior.
3. Proteger dados sensíveis na telemetria (redaction, mascaramento) e definir
   política de retenção por tipo de sinal.
4. Construir dashboards organizados por decisão (o que essa tela me ajuda a
   decidir?) e alertas organizados por ação (o que eu faço quando esse alerta
   dispara?).
5. Validar a telemetria nos três estados (sucesso, falha e degradação parcial)
   antes de confiar nela durante um incidente real.

### Modo performance

1. Definir a jornada, a métrica, o percentil-alvo, a carga esperada e o
   orçamento de performance antes de tocar em qualquer código.
2. Reproduzir o problema com ambiente e volume de dados representativos, nunca
   diagnosticar sobre um dataset de desenvolvimento minúsculo.
3. Medir o baseline atual e decompor o tempo por boundary (cliente, rede,
   aplicação, banco, dependência externa) para saber onde o tempo é gasto.
4. Formular uma suposição específica e usar o profiler/trace adequado ao
   boundary identificado, não um chute de otimização genérica.
5. Alterar um único fator relevante por vez e medir novamente sob as mesmas
   condições do baseline.
6. Testar que a correção preserva a corretude sob carga real, timeout e retry:
   uma otimização que quebra sob concorrência não é uma otimização.
7. Criar um guardrail (teste de regressão de performance, orçamento no
   pipeline) que impeça a regressão voltar despercebida.

## Padrões

- Logs estruturados (chave-valor ou JSON) com evento nomeado, severidade,
  identificador de correlação e contexto mínimo necessário, nunca uma string
  livre concatenada que exige regex para extrair dado.
- Métricas usam apenas labels de cardinalidade limitada e conhecida (endpoint
  normalizado, código de status, tenant se o volume de tenants for baixo);
  nunca user id, URL crua com query string ou mensagem de erro bruta como
  label: cada valor único de label multiplica as séries armazenadas.
- Propagar o contexto em HTTP e filas. Em consumo em lote ou com outro
  contexto pai, usar span links para preservar a correlação entre traces.
- Preservar 100% dos traces com erro e transações críticas é a política
  local. Se o erro só puder ser detectado ao concluir os spans, usar tail
  sampling e verificar a retenção real, inclusive sob carga. (regra da casa)
- Alertas refletem impacto real ao usuário ou ameaça iminente de violar o SLO.
  Todo alerta tem owner e runbook alcançável: alerta sem ação associada é ruído
  que treina a equipe a ignorar alertas.
- Dashboards começam pela visão de saúde agregada (RED/USE) e permitem
  drill-down até o sinal granular, não o inverso.
- A própria telemetria falha de modo seguro (degrada, não derruba o produto):
  um exportador de métricas fora do ar nunca pode derrubar a aplicação que
  instrumenta.
- Usar percentis (p50, p95, p99) e a distribuição completa, nunca apenas a
  média: a média esconde a cauda longa que mais afeta a experiência real.
- Separar explicitamente latência de cliente, rede, aplicação, banco e
  dependências externas antes de decidir onde otimizar.
- Medir tanto cache frio quanto cache quente, sempre sob condição concorrente
  real, não apenas uma requisição isolada. (regra da casa)
- Não adicionar camada de cache antes de provar o custo do caminho sem cache e
  definir a estratégia de invalidação: cache é a fonte mais comum de bug de
  dado obsoleto quando adicionado sem essa prova.
- Preservar corretude sob carga, timeout e retry: uma otimização que reduz
  latência média mas introduz race condition ou perda de retry não é
  aceitável.
- Controlar o observer effect (o próprio profiler/instrumentação alterando o
  resultado medido) e garantir aquecimento (warm-up) antes de medir JIT, cache
  de disco ou connection pool.
- Definir capacidade e headroom a partir do cenário de pico real esperado, não
  da média de tráfego observada hoje.

## Antipadrões

- "Logar tudo" sem estrutura nem nível de severidade consistente: aumenta custo
  de armazenamento e reduz a capacidade real de encontrar o evento relevante
  durante um incidente, volume de log não é observabilidade.
- Métrica com label de alta cardinalidade (ex.: `user_id` ou `order_id` como
  label): explode o número de séries temporais armazenadas e pode derrubar ou
  encarecer drasticamente o backend de métricas.
- Alerta configurado em uma métrica de causa em vez de uma métrica de sintoma
  (ex.: alertar em "CPU alta" em vez de "taxa de erro/latência acima do SLO"):
  gera ruído em picos benignos e não necessariamente detecta o impacto real ao
  usuário.
- Dashboard que só existe porque "parecia útil na hora", sem revisão periódica:
  acumula painéis obsoletos que competem por atenção com os painéis que
  realmente importam durante um incidente.
- Otimizar a partir de "isso parece lento" sem baseline medido: sem número
  antes e depois, é impossível saber se a mudança ajudou, não teve efeito ou
  piorou em outro percentil.
- Adicionar índice, cache ou paralelismo para resolver um sintoma sem
  identificar o boundary real do gargalo: resolve o sintoma medido no ambiente
  de teste e não move a agulha em produção, ou move o gargalo para outro lugar
  sem reduzir a latência percebida.
- Comparar médias entre duas versões em vez de comparar a mesma distribuição de
  percentis sob a mesma carga: uma média melhor pode esconder uma cauda p99
  pior.
- Escalar hardware/réplicas antes de investigar N+1 query, chamada serial que
  poderia ser paralela, ou round-trip de rede evitável: a causa mais comum de
  lentidão em sistemas web é excesso de round-trips, não falta de CPU.

## Validação

- Gerar telemetria ponta a ponta em um cenário controlado e confirmar que a
  correlação atravessa os pontos mapeados por trace id ou span links.
- Verificar cardinalidade projetada, custo estimado, retenção configurada e que
  campos sensíveis passam por redaction antes de sair do serviço.
- Confirmar que os alertas configurados realmente disparam no cenário que
  deveriam (teste ou simulação) e que o runbook vinculado é executável por
  alguém que não escreveu o código.
- Rodar, contra um cenário de falha conhecido, as queries que a equipe usaria
  durante um incidente real, confirmando que elas retornam o sinal esperado
  dentro de um tempo útil.
- Manter benchmark repetível com o baseline arquivado (não apenas anotado
  informalmente) para comparação futura.
- Fazer profiling de CPU, memória, I/O ou queries conforme a comprovação do
  passo de decomposição, não um profiler genérico "por garantia".
- Executar teste de carga com metas de sucesso explícitas (percentil-alvo sob
  carga-alvo) e limites seguros para não afetar produção real durante o teste.
- Configurar regressão automática no pipeline, com sensibilidade proporcional à
  estabilidade histórica da métrica: métrica ruidosa precisa de margem maior
  para não gerar falso positivo constante.
- Não declarar um sistema "observável" apenas por existir dashboard; a prova é
  a equipe conseguir responder à pergunta operacional original usando apenas a
  telemetria, sem acesso a código ou banco.
- Não declarar uma mudança "mais rápida" sem o baseline antes/depois nas mesmas
  condições; "parece mais rápido" não é comprovação.

## Skills relacionadas

- `$specsfy-specialist-architecture` define o boundary, o contrato HTTP e o
  atributo de qualidade mensurável que este especialista mede.
- `$specsfy-specialist-laravel` define o runtime Octane, as filas, o scheduler e
  o cache que produzem os sinais do modo app.
- `$specsfy-specialist-debugging` consome os sinais para isolar causa e pede
  instrumentação adicional quando a comprovação é insuficiente.
- `$specsfy-specialist-docker` expõe runtime, service e node signals; esta
  skill define correlação e escolha.
- `$specsfy-specialist-postgres` e `$specsfy-specialist-redis` produzem sinais
  de dados e cache com cardinalidade e retenção controladas aqui.
- `$specsfy-specialist-nextjs` aplica budgets e correções no framework depois
  que a medição localiza o gargalo.
- `$specsfy-specialist-application-security` define quais eventos de segurança
  entram ou ficam fora da telemetria.
- `$specsfy-specialist-delivery` usa o sinal de saúde definido aqui para
  continuar, pausar ou reverter um rollout.
- `$specsfy-specialist-mysql`, `$specsfy-specialist-mongodb`,
  `$specsfy-specialist-n8n` e `$specsfy-specialist-cloudflare` entregam os
  sinais de dados, execução e borda que este especialista transforma em SLO,
  alerta e dashboard.

Leia [references/standards.md](references/standards.md) para os pilares de
observabilidade, frameworks de dashboard (RED/USE), SLIs/SLOs, sinais por tipo
de componente e fontes oficiais de OpenTelemetry. Leia
[references/performance.md](references/performance.md) para metodologia de
benchmark, Web Vitals, tipos de teste de carga, teoria das filas e escolha de
profiler por boundary.
