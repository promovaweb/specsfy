# Performance

O especialista Performance orienta o agente no diagnóstico e na correção de
problemas de desempenho. O trabalho parte de uma meta medida, isola onde o
tempo é gasto e termina com uma proteção automática contra regressões.

## Quando usar

- Há relato de lentidão, throughput baixo, uso excessivo de recursos ou bundle
  grande.
- Você tem dúvida sobre a capacidade do sistema para um pico esperado.
- Uma otimização foi proposta e você quer saber se ela tem uma linha de base
  medida.

O desenho de métricas e alertas de produção fica com o especialista
Observabilidade. Este especialista resolve um problema de desempenho
observado ou suspeito.

## Como ele trabalha

1. Define a jornada, a métrica, o percentil-alvo, a carga esperada e o
   orçamento de desempenho antes de alterar o código.
2. Reproduz o problema com ambiente e volume representativos.
3. Mede a linha de base e separa o tempo entre cliente, rede, aplicação, banco
   e dependências externas.
4. Formula uma suposição específica e usa o profiler ou o trace adequado ao
   ponto identificado.
5. Altera um fator por vez e mede de novo nas mesmas condições.
6. Confirma que a correção mantém o comportamento correto sob carga, timeout e
   retry.
7. Cria uma proteção contra regressão, como um teste de desempenho ou um
   orçamento no pipeline.

## Padrões aplicados

- Os resultados usam percentis (p50, p95, p99) e a distribuição completa,
  porque a média esconde a cauda longa.
- Cache frio e cache quente são medidos sob concorrência.
- Uma camada de cache só entra depois de medir o caminho sem cache e de
  definir a invalidação.
- O efeito do próprio profiler é controlado. O aquecimento acontece antes das
  medições de JIT, cache de disco ou pool de conexões.
- Capacidade e folga são calculadas a partir do pico esperado de tráfego, em
  vez da média atual.

## Erros que ele evita

- Otimizar porque algo parece lento, sem números de antes e depois.
- Adicionar índice, cache ou paralelismo sem localizar o ponto lento.
- Comparar médias de duas versões em vez dos mesmos percentis sob a mesma
  carga.
- Escalar hardware antes de investigar consultas N+1, chamadas em série ou
  idas e voltas de rede evitáveis.

## Como conferir o resultado

- Um benchmark repetível tem a linha de base arquivada para comparação futura.
- O profiling de CPU, memória, I/O ou queries segue o ponto identificado na
  decomposição do tempo.
- O teste de carga tem metas explícitas e limites que não afetam a produção.
- A verificação de regressão no pipeline usa uma margem compatível com a
  variação histórica da métrica.
- Uma mudança só é descrita como mais rápida com a comparação de antes e
  depois nas mesmas condições.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-performance-engineering \
  --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Astro](astro.md) e [Next.js](nextjs.md) aplicam orçamentos e correções no
  framework.
- [Debugging](debugging.md) isola defeitos funcionais que aparecem sob carga.
- [Arquitetura de Software](software-architecture.md) trata mudanças
  estruturais quando a estrutura limita a capacidade.
- [APIs Web](web-api-design.md) preserva retry, paginação e contrato.
- [Observabilidade](observability.md) detecta degradação em produção.
- [PostgreSQL](postgres.md) e [Redis](redis.md) entram quando o ponto lento
  está em query, índice ou cache.
- [Engenharia de Entrega](delivery-engineering.md) transforma a proteção em um
  gate do pipeline.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-performance-engineering/SKILL.md),
com Web Vitals, benchmark, teste de carga e profiling no arquivo de referência
da mesma pasta.
