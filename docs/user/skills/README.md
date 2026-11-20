# Skills base

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="../../../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../../../brand/logo/icon.png" alt="Logo do Specsfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

As skills base dividem o método por responsabilidade. Você pode chamar uma
delas pelo nome ou explicar o resultado esperado. O agente lê o estado da spec,
seleciona a etapa responsável e anuncia cada transição necessária.

O framework tem 11 skills, nove delas base: `specsfy-setup`,
`specsfy-documentator`, `specsfy-01-inbox`, `specsfy-02-backlog`,
`specsfy-03-specify`, `specsfy-04-validate`, `specsfy-05-tasks`,
`specsfy-06-implement`, `specsfy-update-spec`, `specsfy-interviewer` e
`specsfy-milestones`.

## Nomes exibidos

Os comandos técnicos continuam com o nome técnico, como `$specsfy-02-backlog`.
Na interface, as seis etapas centrais aparecem como `Specsfy - 01 - Inbox` até
`Specsfy - 06 - Testar e implementar`. As skills adicionais usam `Specsfy - Nome`,
enquanto as técnicas usam `Specsfy - Especialista - Nome`.

## Como responder às perguntas

Toda skill que precisa perguntar segue o mesmo formato desde a primeira rodada:

1. apresenta uma pergunta com o rótulo `Pergunta 1` e espera sua resposta;
2. oferece pelo menos três respostas sugeridas e numeradas abaixo dela;
3. acrescenta `Escrever outra resposta` para você informar seu próprio texto;
4. acrescenta `Gere outras opções` para mostrar alternativas diferentes à mesma
   pergunta;
5. acrescenta `Avançar` para abrir a confirmação de encerramento da área,
   adiamento ou retomada imediata.

Você pode responder com combinações como `1.2` ou `1.4: meu texto`. O número
da opção é convertido no texto completo antes de gerar qualquer contexto.
Ao escolher `Avançar`, a rodada seguinte pergunta se você quer encerrar
definitivamente as perguntas daquela área, responder depois ou voltar a
responder agora. Se encerrar, a skill registra sua escolha e não pergunta sobre
a área novamente, a menos que você a reabra. Se adiar, os pontos ficam
registrados para retomada. Nenhuma das escolhas inventa uma resposta ou aprova
uma etapa incompleta.

Inbox, progresso, `specsfy-documentator` e a `specsfy-setup` nos modos `stack`
e `database` não conduzem entrevista. Essas skills registram ou projetam o que
já existe e encaminham qualquer pergunta para uma etapa conversacional.

| Etapa | Skill | Resultado principal |
| --- | --- | --- |
| capturar sem perguntas | [`specsfy-01-inbox`](specsfy-01-inbox.md) | arquivo em `specs/inbox/` |
| refinar uma entrada e aprofundar definições | [`specsfy-02-backlog`](specsfy-02-backlog.md) | item em `specs/backlog/` e brief na conversa |
| criar a fonte única | [`specsfy-03-specify`](specsfy-03-specify.md) | `spec.md` |
| revisar definição | [`specsfy-04-validate`](specsfy-04-validate.md) | Definition Gate confiável |
| decompor o plano | [`specsfy-05-tasks`](specsfy-05-tasks.md) | tarefas dentro da spec |
| preparar os testes e produzir a mudança | [`specsfy-06-implement`](specsfy-06-implement.md) | RED/GREEN rastreável no modo `tests`; código, testes e evidência no modo `implement` |
| incorporar mudança posterior | [`specsfy-update-spec`](specsfy-update-spec.md) | spec atualizada e gates reabertos |
| conversar conforme a fase | [`specsfy-interviewer`](specsfy-interviewer.md) | respostas confirmadas e Effort recalibrado |
| definir o MVP, planejar a evolução e manter a projeção | [`specsfy-milestones`](specsfy-milestones.md) | milestones do MVP e pós-MVP, `specs.md` e progresso derivado |
| descobrir o que o sistema precisa guardar | [`specsfy-setup` (modo `data-discovery`)](../project-context.md#conversar-sobre-os-dados) | respostas confirmadas em `DATABASE.md` |

## Encontre a skill pelo estado do trabalho

Uma anotação que precisa ser preservada vai para `specsfy-01-inbox`. Quando
você quiser comparar essa ideia com itens existentes e esclarecer o mínimo
necessário, `specsfy-02-backlog` cria ou atualiza o arquivo numerado e
aprofunda as definições que mudam o comportamento e
entrega um brief na conversa.

Com a intenção de criar uma entrega confirmada,
`specsfy-03-specify` monta a `spec.md` e `specsfy-04-validate` comprova o
Ato I. A skill `specsfy-05-tasks` monta o plano, chama
`specsfy-06-implement` no modo `tests` para materializar os testes e só aprova
o Plan Gate depois de um RED válido. A mesma skill, no modo `implement`,
executa as tarefas com evidência e documentação atualizada.

Uma necessidade surgida depois da definição retorna à mesma spec por
`specsfy-update-spec`. Para apenas consultar gates, tarefas e o próximo
trabalho sem alterar arquivos, rode `specsfy progress`, descrito em
[Ver o progresso](../reference.md#ver-o-progresso).

Quando uma lacuna puder alterar a próxima etapa, chame
`specsfy-interviewer`. Ele conversa com a spec sem substituir a skill que
valida, planeja, implementa ou conclui.

Para planejar um produto inteiro, comece pelo modo `mvp` de
`specsfy-milestones` e, depois do aceite do MVP, use o modo `roadmap`. O modo
`sync` mantém o painel derivado de specs e backlog, detalhado no guia
[Milestones](../milestones.md) com arquivos, relações e sincronização.

Quando uma conversa revelar informações que o sistema precisa guardar, use
a `specsfy-setup` no modo `data-discovery`. Ela pergunta em linguagem simples
e mantém o registro em `.specsfy/DATABASE.md` antes de o backlog ou a spec
avançar.

Volte ao [guia completo](../README.md) ou leia [como a metodologia
funciona](../method.md).
