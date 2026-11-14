# Debugging

O especialista Debugging orienta o agente no diagnóstico de bugs, falhas
intermitentes e regressões. O trabalho parte do comportamento observado,
constrói uma reprodução e descreve a causa pelo mecanismo que produz o
sintoma.

## Quando usar

- O sistema se comporta de forma diferente do esperado, com ou sem reprodução
  confiável.
- Um teste falha de forma intermitente ou uma regressão apareceu depois de um
  deploy.
- Um timeout, um erro ou uma lentidão foi relatado com sintoma concreto.

Para otimizar um sistema que funciona sem falhas, use o especialista
Performance, que parte de uma meta de desempenho.

## Como ele trabalha

1. Registra o comportamento esperado, o comportamento observado, o ambiente e
   o horário da última ocorrência.
2. Constrói uma reprodução confiável. Quando ela é inviável, usa um log, uma
   métrica ou um trace repetível que acompanhe a falha.
3. Reduz a entrada, os componentes e a janela de tempo até o menor caso que
   ainda reproduz o problema.
4. Formula suposições testáveis e as ordena pela facilidade de teste e pela
   probabilidade diante do sintoma.
5. Instrumenta o ponto que separa as suposições restantes, onde cada uma prevê
   um valor diferente.
6. Identifica a causa, a extensão do impacto e o mecanismo que gera o sintoma.
7. Com autorização para corrigir, aplica a menor mudança que remove a causa e
   adiciona um teste de regressão.

## Padrões aplicados

- O agente altera uma causa candidata por vez, para manter a atribuição de
  causa válida.
- Uma falha que começou depois de um deploy é uma pista até o mecanismo ser
  isolado.
- Logs, estado e dumps são preservados antes de reiniciar um processo.
- Ambientes com e sem falha são comparados variando um fator por vez.
- Um teste intermitente é investigado como concorrência, timing, estado
  compartilhado ou dependência externa.
- Instrumentação temporária e trechos com dados pessoais ou segredos saem do
  código ao final do diagnóstico.
- A causa é descrita pelo mecanismo (por exemplo, uma condição de corrida
  entre duas escritas) em vez do sintoma.

## Erros que ele evita

- Adicionar prints e rodar de novo sem uma suposição prévia.
- Corrigir o ponto onde o erro aparece sem confirmar a origem.
- Declarar a falha corrigida porque a reprodução manual passou uma vez.
- Ignorar um teste instável como ruído sem investigação.

## Como conferir o resultado

- A reprodução falha de forma determinística sem a correção e passa com ela,
  no mesmo ambiente.
- O teste de regressão falha pelo motivo correto quando a correção é
  revertida.
- Os cenários vizinhos ao caminho corrigido foram verificados.
- Há um registro curto da causa, da comprovação e da prevenção adicionada,
  como um teste, uma invariante ou um alarme.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-debugging --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Pesquisa Técnica](technical-research.md) confirma comportamento externo e
  compatibilidade em fontes primárias.
- [Observabilidade](observability.md) instrumenta produção quando os sinais
  atuais não separam as suposições.
- [Performance](performance-engineering.md) entra quando o sintoma é
  degradação sem erro funcional.
- [Code Review](code-review.md) revisa a correção e o teste de regressão.
- [Relatório de servidor](server-report.md) reúne logs e uso de disco por
  host.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-debugging/SKILL.md),
com técnicas de reprodução e de isolamento no arquivo de referência da mesma
pasta.
