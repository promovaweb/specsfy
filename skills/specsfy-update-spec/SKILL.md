---
name: specsfy-update-spec
description: "Incorpora à spec existente um pedido que surgiu depois da definição, invalida somente os gates afetados e coordena a retomada do fluxo. Use quando o usuário esqueceu algo ou quer adicionar, remover, corrigir ou mudar um pedido em uma spec existente que já foi definida, planejada, está sendo implementada ou foi concluída, e quando uma transição automática detectar mudança tardia de comportamento, escopo, aceite, dados, segurança ou plano. Não cria spec nova nem implementa: para criar a spec inicial use specsfy-03-specify, para decidir uma ambiguidade use specsfy-02-backlog e para implementar use specsfy-07-implement."
---

# Atualizar uma especificação existente

Incorpore um pedido surgido depois da definição inicial sem esconder a
mudança, duplicar a fonte normativa ou obrigar a pessoa a conhecer atos e
gates. O objetivo é reabrir apenas o que a mudança realmente invalida, para
preservar o trabalho ainda válido.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`. Perguntas sobre
decisões materiais pertencem ao refinamento em `$specsfy-02-backlog`.

## Pronto quando

- o pedido está preservado literalmente e classificado;
- a `spec.md` reflete a mudança com IDs preservados, e a razão está registrada
  na seção adequada;
- somente os gates afetados voltaram para `Pending`, e
  `specsfy gate spec <spec> --allow-draft` passa;
- a próxima skill do fluxo foi carregada, ou as lacunas foram relatadas quando
  o refinamento terminou por `avançar`.

## Orquestrar a conversa

Ao concluir esta etapa ou detectar trabalho de outra etapa, anuncie
`Pendência detectada: <descrição> — ação: resolvendo nesta etapa` e resolva-a
quando pertencer ao próprio escopo. Quando houver troca de responsabilidade,
anuncie `Transição automática: $specsfy-update-spec → $<destino> — motivo:
<motivo> — resultado esperado: <resultado>` e carregue imediatamente a skill de
destino, sem pedir confirmação nem repetir o comando. Continue na mesma
conversa. Depois de uma correção necessária a esta etapa, anuncie `Retomada
automática: $<destino> → $specsfy-update-spec — pendência resolvida:
<resultado>` e retome-a imediatamente. Reavalie o estado após cada handoff para
evitar ciclos. Não peça confirmação para o handoff; ações sensíveis continuam
exigindo autorização específica.

## Confirmar a entrada

1. Preserve literalmente o novo pedido antes de interpretá-lo.
2. Leia em paralelo a spec canônica em
   `specs/<estado>/<NNNN>-<slug>/spec.md` (metadados, requisitos, cenários,
   plano, tarefas, gates e evidências), as instruções do projeto,
   `PROJECT.md`, `.specsfy/STACK.md`, `.specsfy/RULES.md`,
   `.specsfy/DATABASE.md` e o research indexado aplicável.
3. Inspecione mudanças Git preexistentes na spec para não atribuí-las ao
   pedido atual.
4. Se não existir uma spec, anuncie a pendência e carregue
   `$specsfy-02-backlog` para uma ideia superficial ou `$specsfy-03-specify`
   quando já houver intenção explícita de criar a fatia.
5. Se a spec ainda estiver em `Draft` e nunca tiver obtido
   `Definition Gate: Passed`, carregue `$specsfy-03-specify`. Esta skill
   governa somente a revisão de uma definição que já avançou.

## Classificar antes de escrever

Leia [a matriz de classificação](references/change-classification.md) quando o
pedido puder alterar comportamento, plano ou fronteira entre specs.

| Tipo de pedido | O que fazer |
| --- | --- |
| correção interna reversível sem efeito observável | não altere a spec; registre a avaliação na evidência da tarefa e retome `$specsfy-07-implement` |
| esclarecimento editorial sem mudança de significado | preserve os gates e altere somente a redação necessária |
| mudança de comportamento, aceite, escopo, dados, segurança ou interface | reabra desde o Ato I |
| mudança somente de solução, tarefas ou estratégia de testes | reabra desde o Ato II |
| capacidade independente da finalidade e dos atores da fatia atual | não acrescente em silêncio; carregue `$specsfy-02-backlog` ou `$specsfy-03-specify` conforme a maturidade do pedido |

Quando opções plausíveis mudarem materialmente o resultado, faça handoff para
`$specsfy-02-backlog`, execute o ciclo adaptativo e retome esta skill ao final
do ciclo. Se a pessoa escolher `avançar`, aplique a confirmação e o registro
definidos no contrato central, reabra o Ato I quando restarem pontos
aplicáveis, não encaminhe a definição como aprovada e não reabra o mesmo ciclo
nesta retomada.

Esta skill não cria uma spec nova, não decide requisito material pela pessoa,
não altera código de produção e não implementa o pedido.

## Incorporar a mudança

### Corrigir checklists residuais

Quando o progresso apontar itens do ciclo sem tarefa, confira as linhas na
spec e localize a tarefa correspondente.

- Se o texto apenas repetir uma tarefa concluída, ofereça convertê-lo em
  anotação sem checkbox, preservando o texto e citando o ID da tarefa que o
  substituiu. Preserve status e gates somente se nenhum trabalho ou
  significado mudar. Não apague o registro automaticamente.
- Se o trecho representar trabalho necessário, reconcilie o plano pelo Ato II.
  Ao promover um rascunho para tarefa, converta o bloco de origem em anotação
  com a referência à tarefa criada.

Execute o progresso novamente para conferir as contagens e as linhas
remanescentes.

### Atualizar a fonte canônica

1. Confirme que a pessoa autorizou incorporar o pedido à spec atual. O pedido
   explícito para mudar, adicionar, remover ou corrigir já constitui essa
   autorização, então não repita a confirmação.
2. Edite somente `spec.md` e o research indexado necessário, sem criar
   `change-request.md`, `plan.md`, `tasks.md`, `research.md` ou outra fonte
   paralela.
3. Atualize todas as seções normativas afetadas e preserve IDs e decisões
   ainda válidos, sem renumerar IDs existentes. Para mudança de
   comportamento, registre razão, decisão e IDs impactados na seção 17. Para
   mudança somente de plano, registre a razão na seção de plano ou risco
   afetada, sem criar uma decisão de produto artificial.
4. Mantenha a evidência histórica como foi produzida e marque como pendente
   toda prova posterior que dependa da versão invalidada.
5. Execute a projeção de impacto:

   ```bash
   specsfy specs change <spec> --base HEAD --mode impact
   ```

   Pelo MCP, use a tool `spec_change_analyze`. Sem o binário instalado, rode o
   script equivalente:

   ```bash
   node .agents/skills/specsfy-update-spec/scripts/analyze_change.mjs \
     specs/<estado>/<NNNN>-<slug>/spec.md --base HEAD --mode impact
   ```

   Use `--mode changelog` para listar IDs adicionados, removidos e alterados.
   A classificação usa títulos canônicos, não números de seção, e `unknown`
   reabre do Ato I por segurança. O comando é somente leitura e não substitui a
   comparação semântica com o pedido.

## Invalidar somente o necessário

| Alcance | Status e gates |
| --- | --- |
| Ato I | `Status: Draft`, `Definition Gate: Pending`, `Plan Gate: Pending` e `Delivery Gate: Pending` |
| somente Ato II | `Status: Defined`, preserve `Definition Gate: Passed` e retorne `Plan Gate` e `Delivery Gate` para `Pending` |
| esclarecimento editorial comprovadamente sem mudança semântica | preserve status e gates |

Um gate posterior não permanece aprovado sobre uma entrada invalidada.
Preserve tarefas e evidências ainda válidas; `$specsfy-05-tasks` reconcilia os
itens afetados e suas dependências antes de novo RED.

Valide a estrutura intermediária:

```bash
specsfy gate spec <spec> --allow-draft
```

Pelo MCP, use a tool `gate_spec`. Sem o binário instalado, rode o script
equivalente:

```bash
node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs \
  specs/<estado>/<NNNN>-<slug>/spec.md --allow-draft
```

## Retomar o fluxo

- Mudança desde o Ato I: carregue `$specsfy-04-validate` e depois percorra
  tarefas, TDD/BDD e a etapa que originou a mudança. Se o refinamento do
  backlog terminou por `avançar`, não faça esse handoff na mesma retomada:
  relate as lacunas e encerre com os gates pendentes.
- Mudança somente do Ato II: carregue `$specsfy-05-tasks`, que reconcilia o
  plano, chama `$specsfy-06-tdd-bdd` e retoma a origem.
- Mudança detectada durante a implementação: retome `$specsfy-07-implement`
  somente depois de Definition e Plan Gate voltarem a `Passed` e existir RED
  válido para o comportamento novo ou alterado.
- Mudança detectada depois de `Complete`: percorra novamente os atos
  invalidados e só restaure `Complete` com Delivery Gate e DoD comprovados.

## Relatar

Comece dizendo que o pedido foi incorporado e que o fluxo necessário será
retomado automaticamente; a complexidade do framework vem depois do resultado.
Em seguida, informe o pedido preservado, a spec alterada, a classificação, os
IDs e as seções afetados, os gates invalidados, as evidências preservadas ou
tornadas pendentes e a próxima skill carregada.
