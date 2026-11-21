---
name: specsfy-specialist-debugging
description: Diagnosticar bugs, regressões, falhas intermitentes e problemas de performance por reprodução, minimização, suposição falsificável e instrumentação até a causa no nível do mecanismo. Use quando o usuário pedir diagnóstico ou relatar algo quebrado, incluindo falhas intermitentes e degradação de performance; não implementar correção quando o pedido for somente diagnóstico; não use para otimizar algo que já funciona corretamente sem sintoma, use `$specsfy-specialist-observability` para isso.
---

# Diagnóstico

## Quando usar

- Acionar quando houver um comportamento observado divergente do esperado,
  com ou sem reprodução confiável ainda estabelecida.
- Acionar também para falha intermitente ("flaky"), regressão após deploy ou
  degradação de performance com sintoma concreto (timeout, erro, lentidão
  reportada).
- Não acionar para otimizar um sistema que já se comporta corretamente e sem
  sintoma: isso é `$specsfy-specialist-observability`, que parte de
  um SLO e não de uma falha.
- Combinar com `$specsfy-specialist-observability` quando o ambiente de
  produção não expuser sinal suficiente para instrumentar o boundary certo.

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a linha `| Especialistas |` da tabela de
   metadados, a subseção `#### Especialistas` em `### 8. Plano técnico` e a
   seção que a fase está escrevendo. Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md` para reproduzir no ambiente real, não no suposto.
   - Fonte de entrada por fase: em `specsfy-02-backlog`, sem spec, leia e
     registre no item de `specs/backlog/`; em specify e validate, leia a spec
     aberta (linha `| Especialistas |`, subseção `#### Especialistas`, seção
     em escrita) e escreva nela; em `specsfy-06-implement`, siga a tarefa
     indicada. Só `specsfy-05-tasks` escreve a seção 14: aqui apenas se indica
     o que a tarefa deve prever, sem criar tarefa.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-debugging`. Sem indicação, confirme pelo
   "Quando usar" acima se existe sintoma observado antes de investigar.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Registre reprodução, causa no nível do mecanismo e o teste de regressão
   que falha sem a correção na seção 8 e em `### 12. Plano de testes e
   rastreabilidade`; sem autorização para corrigir, devolva o diagnóstico
   como dúvida aberta.

## Fluxo

1. Capturar comportamento esperado, comportamento observado, ambiente exato e
   o momento/frequência da última ocorrência, sem isso a suposição é chute.
2. Construir uma reprodução confiável ou, quando reprodução direta não for
   viável, um sinal observável e repetível (log, métrica, trace) que
   correlacione com a falha.
3. Reduzir input, componentes envolvidos e janela de tempo até o menor caso
   que ainda reproduz a falha: cada elemento removido que não muda o
   resultado é uma variável eliminada da suposição.
4. Formular suposições falsificáveis e ordená-las pela facilidade de teste e
   pela probabilidade dado o sintoma observado, não pela mais interessante.
5. Instrumentar o boundary mais discriminante entre as suposições restantes:
   o ponto onde uma suposição prevê um valor e a outra prevê outro.
6. Identificar causa, extensão do impacto (só esse caminho, ou a classe
   inteira de chamadas) e o mecanismo exato pelo qual ela produz o sintoma.
7. Se autorizado a corrigir, aplicar a menor mudança que remove a causa e
   adicionar teste de regressão que falha sem a correção.

## Padrões

- Não alterar mais de uma causa candidata por vez: mudar duas coisas ao
  mesmo tempo invalida a atribuição de causa quando o sintoma desaparece.
- Separar correlação temporal de causalidade: "começou depois do deploy X"
  é uma pista, não uma prova, até isolar o mecanismo.
- Preservar comprovação (logs, estado, dump) antes de reiniciar processo ou
  limpar estado: o ambiente que falhou pode ser irreproduzível depois.
- Comparar ambiente bom e ruim sistematicamente: mesma versão, config,
  dados, carga e ordem de operações, variando um fator por vez.
- Tratar flakiness como sintoma de concorrência, timing, estado compartilhado
  ou dependência externa até haver prova do contrário, nunca como "só
  rodar de novo".
- Remover instrumentação temporária, verbosa ou sensível (dado pessoal,
  segredo) antes de concluir o diagnóstico.
- Descrever a causa no nível do mecanismo ("a race entre X e Y permite
  leitura antes da escrita completar"), nunca só no nível do sintoma
  ("às vezes falha").

## Antipadrões

- "Adicionar print e rodar de novo" sem suposição prévia: gera ruído,
  raramente reduz o espaço de busca e é frequentemente indistinguível de
  tentativa aleatória.
- Corrigir o primeiro ponto onde o erro aparece, sem verificar se ali é a
  origem ou apenas onde o efeito se torna visível (o `NullPointerException`
  raramente surge onde é lançado).
- Declarar "corrigido" porque a reprodução manual parou de falhar uma vez,
  sem reprodução automatizada e determinística, a ausência do sintoma pode
  ser apenas sorte ou mudança de timing.
- Ignorar teste flaky como "instável, não relacionado" sem investigar:
  flakiness é comprovação de bug real de concorrência ou estado compartilhado
  na maioria dos casos, não ruído a suprimir.

## Validação

- A reprodução falha de forma determinística antes da correção e passa de
  forma determinística depois, no mesmo ambiente.
- O teste de regressão adicionado falha pelo motivo correto quando a
  correção é revertida (não por outro motivo incidental).
- Cenários adjacentes ao caminho corrigido foram verificados quanto a efeito
  colateral da mudança.
- Existe registro conciso de causa (mecanismo), comprovação que a comprova e
  prevenção (teste, invariante, alarme) adicionada.
- Não declarar a causa "resolvida" sem essa comprovação: atribuir causa por
  intuição sem reprodução ou teste de regressão é proibido.

## Skills relacionadas

- `$specsfy-specialist-server` reúne logs, serviços e uso de disco
  em relatórios por host, com coleta somente leitura via Ansible.

- `$specsfy-specialist-research` confirma comportamento externo,
  errata ou compatibilidade quando a causa depende de documentação primária.
- `$specsfy-specialist-observability` para instrumentar produção quando o
  sinal disponível não é suficiente para discriminar suposições e quando o
  sintoma for degradação sem erro funcional: o diagnóstico de causa raiz aqui
  pode entregar a esta skill a escolha de qual otimização vale o custo.
- `$specsfy-specialist-code-review` para revisar a correção e o teste de
  regressão antes do merge.
- `$specsfy-specialist-testing` transforma a causa confirmada em teste de
  regressão executável, com comando e saída registrados.

Leia [references/standards.md](references/standards.md) para técnicas de
reprodução e isolamento, causas comuns de flakiness, ferramentas por
ambiente e fontes oficiais.
