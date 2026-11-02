# Glossário do projeto

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | vocabulário transversal do Specsfy |
| Autoridade | significado operacional dos termos canônicos |

## Papel

Manter a linguagem transversal usada por pessoas, agentes, specs, skills e
validadores com significado operacional consistente.

## Como usar

Consulte antes de criar nomes para estados, gates, tarefas ou artefatos do
método. Preserve IDs e termos canônicos nas specs e testes.

## Atualize quando

- um termo transversal ganhar definição nova.
- duas palavras forem confirmadas como equivalentes.
- um termo legado precisar ser distinguido do termo vigente.

## Não use para

- definir vocabulário exclusivo de uma feature.
- acumular toda palavra encontrada no código.
- mudar silenciosamente o significado de IDs existentes.

## Fonte da verdade e precedência

Este glossário governa vocabulário transversal. Uma spec pode definir termos
locais sem contradizê-lo. Em conflito material, a decisão deve ser recomposta na
fonte normativa antes de alterar usos.

## Termos canônicos

<!-- markdownlint-disable MD013 -->
| Termo | Definição operacional | Não confundir com |
| --- | --- | --- |
| Fatia vertical | Entrega demonstrável com problema, aceite, testes, tarefas e evidência próprios | camada técnica |
| Ideia capturada | Input preservado e pré-processado sem perguntas em `specs/inbox/<data-hora>-<slug>.md` | backlog, requisito ou autorização |
| Captura processada | Captura movida para `specs/inbox/processed/` porque specs com Definition Gate aprovado cobrem o pedido inteiro; texto original e vínculos preservados | entrega concluída, exclusão ou arquivo morto |
| Backlog | Item priorizável em `specs/backlog/<NNNN>-<slug>.md` que amadurece uma necessidade antes da promoção | captura bruta, spec ou tarefa |
| Descoberta adaptativa | Conversa que aprofunda ideia, backlog ou spec e prepara o handoff | captura superficial ou especificação |
| Spec | `specs/<estado>/<NNNN>-<slug>/spec.md`, fonte normativa única de uma fatia. Somente o diretório é numerado | documento de contexto |
| Estado operacional | Pasta canônica da spec: `draft`, `defined`, `planned`, `in-progress`, `review` ou `completed` | estado de uma entidade do produto |
| Status | Campo da spec que espelha o estado operacional como `Draft`, `Defined`, `Planned`, `Implementing`, `Reviewing` ou `Complete` | porcentagem de progresso ou estado de um gate |
| Transição | Movimento permitido da pasta e do Status pelo CLI, preservando o pacote da spec | renomear diretório manualmente |
| Effort | Inteiro de 1 a 10 que estima a capacidade de raciocínio e execução requerida, acompanhado de data, justificativa e histórico | prazo, prioridade, preço ou escolha de modelo |
| Atualização de spec | incorporação explícita de pedido surgido depois do Definition Gate, com análise de impacto e reabertura seletiva dos atos | nova spec ou edição silenciosa de código |
| Research | Evidência externa consultada e indexada pela spec | requisito |
| Definition Gate | Comprovação de que problema, escopo, requisitos e cenários permitem planejar | autorização para implementar |
| Plan Gate | Comprovação de que plano, tarefas e RED permitem iniciar execução | lista de tarefas sem RED válido |
| Delivery Gate | Comprovação de tarefas, aceite, regressão, rastreabilidade e documentação atual | aceite final em `completed` |
| Gate | Resultado verificável que autoriza o handoff entre atos | checkbox editorial |
| RED | Falha válida causada pelo comportamento ausente ou incorreto | erro de ambiente ou sintaxe |
| GREEN | Passagem do teste pela menor implementação que atende ao comportamento | conclusão sem regressão e refatoração |
| REFACTOR | Melhoria do código protegida por testes verdes, sem mudar comportamento | nova funcionalidade |
| Cenário BDD | `AC-NNN` distinto, mantido em Gherkin na `spec.md` e associado por `**Cobre**` a histórias e requisitos | arquivo `.feature` executável |
| Caso TDD | Definição de teste executável com marcador `SPECSFY:` próprio e RED/GREEN observável | arquivo de teste ou marcador compartilhado por vários testes |
| Rastreabilidade | Relação verificável entre história, requisito, cenário, teste, tarefa e registro de execução | lista de IDs sem ligações reais |
| Contrato de comprovação | Versão do esquema que governa os registros de teste e entrega na spec | gate isolado |
| Projeção de progresso | Leitura somente de specs, gates, tarefas e checklists pelo CLI ou pela TUI | fonte normativa ou autorização para mudar a spec |
| Contexto transversal | Decisão vigente aplicável a várias fatias | comportamento de uma feature |
| Contexto persistente | PROJECT.md e arquivos .specsfy que preservam finalidade, stack, regras, dados e pacotes do projeto consumidor | spec ou documentação técnica reconstruída |
| Documentação reconstruída | Visão técnica derivada do código em docs/ do projeto consumidor, atualizada pelo documentador | documentação oficial do framework |
| ADR | Registro histórico de uma decisão arquitetural e suas consequências | arquitetura vigente |
<!-- markdownlint-enable MD013 -->

## Regras de vocabulário

- Use `spec` para a fonte normativa e `contexto` para decisões transversais.
- Use `tarefa` somente para itens da seção 14 de uma spec.
- Use `Passed` apenas para um gate comprovado.
- Preserve `FR`, `NFR`, `AC`, `US`, `DEC` e `T` como IDs rastreáveis.
