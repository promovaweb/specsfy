# Observabilidade

O especialista Observabilidade orienta o agente no desenho de logs, métricas,
traces, SLOs e alertas e no diagnóstico de problemas de desempenho. Os sinais
partem das perguntas operacionais do serviço, cada alerta indica uma ação
concreta e cada otimização começa com uma linha de base medida e termina com uma
proteção contra regressões.

## Quando usar

- A tarefa envolve instrumentação, investigação de incidente, definição de SLI e
  SLO ou construção de dashboards e alertas.
- Você precisa definir o sinal que mantém, pausa ou reverte um rollout.
- Há relato de lentidão, throughput baixo, uso excessivo de recursos ou bundle
  grande.
- Você tem dúvida sobre a capacidade do sistema para um pico esperado.
- Uma otimização foi proposta e você quer saber se ela tem uma linha de base
  medida.

Uma falha funcional que aparece sob carga fica com o [Debugging](debugging.md),
e o limite estrutural que restringe a capacidade com a
[Arquitetura](architecture.md). Contrato HTTP, índice e plano de query ficam com
[Arquitetura](architecture.md) e [PostgreSQL](postgres.md).

## Como ele trabalha

1. Define as jornadas principais do serviço e as perguntas operacionais sobre
   elas, como "o checkout funciona para o cliente".
2. Levanta a telemetria existente, o custo, a retenção, o volume de tráfego e os
   limites do runtime.
3. Estabelece SLIs e SLOs, com orçamento de erro quando a importância do serviço
   justifica.
4. Define a métrica, o percentil-alvo e o orçamento antes de qualquer mudança de
   código.
5. Executa o fluxo do modo escolhido e registra a consequência no artefato do
   projeto.

## Sinais

1. Levanta os pontos de passagem (HTTP, fila, job, banco) e o identificador de
   correlação que precisa atravessá-los, como o trace id.
2. Instrumenta eventos, métricas e spans com cardinalidade controlada desde o
   desenho.
3. Protege informações sensíveis com mascaramento e define a retenção de cada
   tipo de sinal.
4. Monta dashboards guiados pelas escolhas que eles apoiam e alertas guiados pela
   ação esperada quando disparam.
5. Valida a telemetria em sucesso, falha e degradação parcial antes de usá-la em
   um incidente.

## Performance

1. Define a jornada, a métrica, o percentil-alvo, a carga esperada e o orçamento
   de desempenho antes de alterar o código.
2. Reproduz o problema com ambiente e volume representativos.
3. Mede a linha de base e separa o tempo entre cliente, rede, aplicação, banco e
   dependências externas.
4. Formula uma suposição específica e usa o profiler ou o trace adequado ao ponto
   identificado.
5. Altera um fator por vez e mede de novo nas mesmas condições.
6. Confirma que a correção mantém o comportamento correto sob carga, timeout e
   retry.
7. Cria uma proteção contra regressão, como um teste de desempenho ou um
   orçamento no pipeline.

## Padrões aplicados

- Logs estruturados em chave-valor ou JSON, com evento nomeado, severidade e
  identificador de correlação.
- Labels de métricas com cardinalidade limitada, como endpoint normalizado e
  código de status. IDs de usuário e URLs com query string ficam fora dos
  labels.
- Traces que mantêm a correlação ao atravessar HTTP, filas e jobs assíncronos.
- Amostragem de traces que preserva todos os erros e as transações de negócio
  importantes.
- Alertas ligados ao impacto no cliente ou à ameaça de violar o SLO, cada um com
  responsável e runbook.
- Dashboards que começam pela saúde agregada (RED ou USE) e permitem descer até
  o sinal detalhado.
- Telemetria que falha de modo seguro, sem derrubar a aplicação quando o
  exportador sai do ar.
- Os resultados de desempenho usam percentis (p50, p95, p99) e a distribuição
  completa, porque a média esconde a cauda longa.
- Cache frio e cache quente são medidos sob concorrência.
- Uma camada de cache só entra depois de medir o caminho sem cache e de definir a
  invalidação.
- O efeito do próprio profiler é controlado. O aquecimento acontece antes das
  medições de JIT, cache de disco ou pool de conexões.
- Capacidade e folga são calculadas a partir do pico esperado de tráfego, em vez
  da média atual.

## Erros que ele evita

- Registrar tudo sem estrutura nem severidade consistente.
- Métrica com `user_id` como label, que multiplica as séries armazenadas.
- Alerta de CPU alta no lugar de um alerta de taxa de erro ou latência acima do
  SLO.
- Dashboards antigos que disputam atenção com os painéis úteis em um incidente.
- Otimizar porque algo parece lento, sem números de antes e depois.
- Adicionar índice, cache ou paralelismo sem localizar o ponto lento.
- Comparar médias de duas versões em vez dos mesmos percentis sob a mesma carga.
- Escalar hardware antes de investigar consultas N+1, chamadas em série ou idas
  e voltas de rede evitáveis.

## Como conferir o resultado

- A telemetria gerada em um cenário controlado mantém o trace id em todos os
  pontos de passagem.
- Cardinalidade, custo, retenção e mascaramento de campos sensíveis foram
  conferidos.
- Os alertas disparam no cenário previsto e o runbook pode ser executado por
  outro desenvolvedor.
- As consultas usadas em um incidente devolvem o sinal esperado em tempo útil.
- A pergunta operacional original pode ser respondida só com a telemetria, sem
  acesso ao código ou ao banco.
- Um benchmark repetível tem a linha de base arquivada para comparação futura.
- O profiling de CPU, memória, I/O ou queries segue o ponto identificado na
  decomposição do tempo.
- O teste de carga tem metas explícitas e limites que não afetam a produção.
- A verificação de regressão no pipeline usa uma margem compatível com a variação
  histórica da métrica.
- Uma mudança só é descrita como mais rápida com a comparação de antes e depois
  nas mesmas condições.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-observability --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Arquitetura](architecture.md) define o limite, o contrato HTTP e o atributo de
  qualidade que este especialista mede.
- [Debugging](debugging.md) usa os sinais para isolar a causa de uma falha.
- [Docker](docker.md) expõe sinais de runtime, serviços e nodes.
- [PostgreSQL](postgres.md) e [Redis](redis.md) produzem sinais de banco e de
  cache.
- [Next.js](nextjs.md) aplica orçamentos e correções no framework.
- [Segurança de Aplicações](application-security.md) define quais eventos de
  segurança entram ou ficam fora da telemetria.
- [Delivery](delivery.md) usa o sinal de saúde para continuar, pausar ou
  reverter um rollout.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-observability/SKILL.md),
com dashboards RED e USE, SLIs, SLOs e OpenTelemetry em
`references/standards.md` e Web Vitals, benchmark, teste de carga e profiling em
`references/performance.md`.
