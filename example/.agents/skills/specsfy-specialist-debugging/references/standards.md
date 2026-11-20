# Padrões e referências de diagnóstico

## Técnicas de isolamento, da mais barata à mais cara

- **Bisseção** (`git bisect`, ou busca binária manual no espaço de
  configuração/dados): localiza a mudança mínima que introduziu a falha em
  `O(log n)` passos sobre `n` commits/estados candidatos, em vez de revisar
  linearmente.
- **Differential debugging**: comparar sistematicamente ambiente que falha
  contra ambiente que funciona, fixando todas as variáveis exceto uma por
  rodada (versão, config, dados, ordem, carga).
- **Delta debugging**: reduzir o caso que reproduz a falha removendo partes
  e testando se a falha persiste, até chegar ao menor caso que ainda falha.
- **Tracing distribuído**: seguir um `trace id` através de boundaries de
  serviço para localizar onde a causalidade diverge do esperado — essencial
  quando o sintoma aparece em um serviço mas a causa está em outro.
- **Profiling**: medir onde o tempo/memória/CPU realmente é gasto antes de
  qualquer mudança — otimizar sem profiling ataca o gargalo imaginado, não o
  real, na maioria dos casos.
- **Fault injection**: introduzir falha controlada (latência, erro,
  partição) para confirmar hipótese de dependência — só em ambiente onde o
  blast radius é conhecido e autorizado, nunca em produção sem esse aval.

## Causas comuns de flakiness, por categoria

- **Concorrência**: race condition entre duas operações que assumem ordem
  não garantida; ausência de lock ou de sincronização em recurso
  compartilhado.
- **Tempo**: timeout justo demais para o ambiente de CI, relógio do sistema
  ou fuso horário não controlado no teste, `sleep` fixo em vez de esperar
  por condição.
- **Estado compartilhado**: teste que depende de ordem de execução, dado
  deixado por outro teste, cache ou singleton não resetado entre execuções.
- **Dependência externa**: rede, serviço de terceiro ou banco compartilhado
  sem isolamento, sensível a carga concorrente de outros processos no CI.
- **Não-determinismo intencional mal controlado**: `random`, UUID ou
  timestamp sem seed fixa no teste.

Trate cada teste flaky como um desses até ter evidência do mecanismo — nunca
como "instabilidade do CI" sem investigar, porque isso mascara bugs de
concorrência que também existem em produção.

## Sintoma vs. causa: onde procurar

- O ponto onde a exceção é lançada ou o erro é logado raramente é a origem —
  é onde o efeito de um estado inválido anterior se torna visível. Percorra
  para trás: quem produziu o dado/estado que chegou inválido até aqui?
- Em bugs de estado, pergunte "quem escreveu por último" antes de "quem leu
  por último" — o valor errado geralmente já estava errado antes da leitura
  que falhou.
- Em regressão após deploy, comparar o diff exato do release, não apenas a
  janela de tempo — "começou depois do deploy" não localiza a linha, só
  reduz o universo de candidatos.

## Ferramentas por ambiente

- Node.js/browser: `--inspect` + Chrome DevTools, `node --prof` para CPU
  profiling, `console.trace()` para stack em ponto de interesse.
- Python: `pdb`/`breakpoint()`, `cProfile` para CPU, `tracemalloc` para
  memória, `faulthandler` para travas.
- Bancos: `EXPLAIN (ANALYZE, BUFFERS)` no Postgres para causa de query lenta;
  `pg_stat_activity` para lock e query em execução.
- Distribuído: trace com OpenTelemetry, correlação por `trace id` em todos
  os logs estruturados dos serviços envolvidos.

## Registro do diagnóstico

Ao concluir, registre: sintoma observado, reprodução (comando/passos),
hipóteses descartadas e por quê, causa no nível do mecanismo, evidência que a
comprova, correção aplicada (se autorizada) e o teste de regressão. Isso vale
tanto para transferir o achado a quem vai corrigir quanto para acelerar o
próximo diagnóstico parecido.

## Fontes oficiais

- git-bisect: https://git-scm.com/docs/git-bisect
- Chrome DevTools (debugging JS): https://developer.chrome.com/docs/devtools/
- Python `pdb`: https://docs.python.org/3/library/pdb.html
- Python `cProfile`/`profile`: https://docs.python.org/3/library/profile.html
- PostgreSQL monitoring e `pg_stat_activity`: https://www.postgresql.org/docs/current/monitoring.html
- PostgreSQL `EXPLAIN`: https://www.postgresql.org/docs/current/using-explain.html
- OpenTelemetry traces: https://opentelemetry.io/docs/concepts/signals/traces/
