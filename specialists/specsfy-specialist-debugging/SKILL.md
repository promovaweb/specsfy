---
name: specsfy-specialist-debugging
description: Diagnosticar bugs, regressões, falhas intermitentes e problemas de performance por reprodução, minimização, hipótese falsificável e instrumentação até a causa no nível do mecanismo. Use quando o usuário pedir diagnóstico ou relatar algo quebrado, incluindo falhas intermitentes e degradação de performance; não implementar correção quando o pedido for somente diagnóstico; não use para otimizar algo que já funciona corretamente sem sintoma, use `$specsfy-specialist-performance-engineering` para isso.
---

# Diagnóstico

## Quando usar

- Acionar quando houver um comportamento observado divergente do esperado,
  com ou sem reprodução confiável ainda estabelecida.
- Acionar também para falha intermitente ("flaky"), regressão após deploy ou
  degradação de performance com sintoma concreto (timeout, erro, lentidão
  reportada).
- Não acionar para otimizar um sistema que já se comporta corretamente e sem
  sintoma — isso é `$specsfy-specialist-performance-engineering`, que parte de
  um SLO e não de uma falha.
- Combinar com `$specsfy-specialist-observability` quando o ambiente de
  produção não expuser sinal suficiente para instrumentar o boundary certo.

## Fluxo

1. Capturar comportamento esperado, comportamento observado, ambiente exato e
   o momento/frequência da última ocorrência — sem isso a hipótese é chute.
2. Construir uma reprodução confiável ou, quando reprodução direta não for
   viável, um sinal observável e repetível (log, métrica, trace) que
   correlacione com a falha.
3. Reduzir input, componentes envolvidos e janela de tempo até o menor caso
   que ainda reproduz a falha — cada elemento removido que não muda o
   resultado é uma variável eliminada da hipótese.
4. Formular hipóteses falsificáveis e ordená-las pela facilidade de teste e
   pela probabilidade dado o sintoma observado, não pela mais interessante.
5. Instrumentar o boundary mais discriminante entre as hipóteses restantes —
   o ponto onde uma hipótese prevê um valor e a outra prevê outro.
6. Identificar causa, extensão do impacto (só esse caminho, ou a classe
   inteira de chamadas) e o mecanismo exato pelo qual ela produz o sintoma.
7. Se autorizado a corrigir, aplicar a menor mudança que remove a causa e
   adicionar teste de regressão que falha sem a correção.

## Padrões

- Não alterar mais de uma causa candidata por vez — mudar duas coisas ao
  mesmo tempo invalida a atribuição de causa quando o sintoma desaparece.
- Separar correlação temporal de causalidade: "começou depois do deploy X"
  é uma pista, não uma prova, até isolar o mecanismo.
- Preservar evidência (logs, estado, dump) antes de reiniciar processo ou
  limpar estado — o ambiente que falhou pode ser irreproduzível depois.
- Comparar ambiente bom e ruim sistematicamente: mesma versão, config,
  dados, carga e ordem de operações, variando um fator por vez.
- Tratar flakiness como sintoma de concorrência, timing, estado compartilhado
  ou dependência externa até haver prova do contrário — nunca como "só
  rodar de novo".
- Remover instrumentação temporária, verbosa ou sensível (dado pessoal,
  segredo) antes de concluir o diagnóstico.
- Descrever a causa no nível do mecanismo ("a race entre X e Y permite
  leitura antes da escrita completar"), nunca só no nível do sintoma
  ("às vezes falha").

## Antipadrões

- "Adicionar print e rodar de novo" sem hipótese prévia — gera ruído,
  raramente reduz o espaço de busca e é frequentemente indistinguível de
  tentativa aleatória.
- Corrigir o primeiro ponto onde o erro aparece, sem verificar se ali é a
  origem ou apenas onde o efeito se torna visível (o `NullPointerException`
  raramente nasce onde é lançado).
- Declarar "corrigido" porque a reprodução manual parou de falhar uma vez —
  sem reprodução automatizada e determinística, a ausência do sintoma pode
  ser apenas sorte ou mudança de timing.
- Ignorar teste flaky como "instável, não relacionado" sem investigar —
  flakiness é evidência de bug real de concorrência ou estado compartilhado
  na maioria dos casos, não ruído a suprimir.

## Validação

- A reprodução falha de forma determinística antes da correção e passa de
  forma determinística depois, no mesmo ambiente.
- O teste de regressão adicionado falha pelo motivo correto quando a
  correção é revertida (não por outro motivo incidental).
- Cenários adjacentes ao caminho corrigido foram verificados quanto a efeito
  colateral da mudança.
- Existe registro conciso de causa (mecanismo), evidência que a comprova e
  prevenção (teste, invariante, alarme) adicionada.
- Não declarar a causa "resolvida" sem essa evidência — atribuir causa por
  intuição sem reprodução ou teste de regressão é proibido.

## Skills relacionadas

- `$specsfy-specialist-technical-research` confirma comportamento externo,
  errata ou compatibilidade quando a causa depende de documentação primária.
- `$specsfy-specialist-observability` para instrumentar produção quando o
  sinal disponível não é suficiente para discriminar hipóteses.
- `$specsfy-specialist-performance-engineering` quando o sintoma for
  degradação sem erro funcional — o diagnóstico de causa raiz aqui pode
  entregar a esta skill a decisão de qual otimização vale o custo.
- `$specsfy-specialist-code-quality-review` encaminha para cá o achado que
  não se explica sem reprodução, e recebe de volta a causa raiz.
- `$specsfy-specialist-code-review` para revisar a correção e o teste de
  regressão antes do merge.

Leia [references/standards.md](references/standards.md) para técnicas de
reprodução e isolamento, causas comuns de flakiness, ferramentas por
ambiente e fontes oficiais.
