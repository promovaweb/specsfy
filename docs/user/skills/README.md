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

## Nomes exibidos

Os comandos técnicos continuam com o nome técnico, como `$specsfy-02-backlog`.
Na interface, as sete etapas centrais aparecem como `Specsfy - 01 - Inbox` até
`Specsfy - 07 - Implementar`. As skills adicionais usam `Specsfy - Nome`,
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

Inbox, progresso, auxiliares de stack e banco e documentador não conduzem
entrevista. Essas skills registram ou projetam o que já existe e encaminham
qualquer pergunta para uma etapa conversacional.

| Etapa | Skill | Resultado principal |
| --- | --- | --- |
| capturar sem perguntas | [`specsfy-01-inbox`](specsfy-01-inbox.md) | arquivo em `specs/inbox/` |
| refinar uma entrada e aprofundar definições | [`specsfy-02-backlog`](specsfy-02-backlog.md) | item em `specs/backlog/` e brief na conversa |
| criar a fonte única | [`specsfy-03-specify`](specsfy-03-specify.md) | `spec.md` |
| revisar definição | [`specsfy-04-validate`](specsfy-04-validate.md) | Definition Gate confiável |
| decompor o plano | [`specsfy-05-tasks`](specsfy-05-tasks.md) | tarefas dentro da spec |
| preparar e executar testes | [`specsfy-06-tdd-bdd`](specsfy-06-tdd-bdd.md) | RED/GREEN rastreável |
| produzir a mudança | [`specsfy-07-implement`](specsfy-07-implement.md) | código, testes e evidência |
| incorporar mudança posterior | [`specsfy-update-spec`](specsfy-update-spec.md) | spec atualizada e gates reabertos |
| consultar o estado | [`specsfy-progress`](specsfy-progress.md) | relatório somente leitura |
| conversar conforme a fase | [`specsfy-interviewer`](specsfy-interviewer.md) | respostas confirmadas e Effort recalibrado |
| definir o MVP e seus marcos | [`specsfy-mvp-milestone-interviewer`](specsfy-mvp-milestone-interviewer.md) | milestones aprováveis do MVP |
| descobrir o que o sistema precisa guardar | [`specsfy-data-discovery`](specsfy-data-discovery.md) | respostas confirmadas em `DATABASE.md` |
| planejar a evolução | [`specsfy-roadmap-milestone-interviewer`](specsfy-roadmap-milestone-interviewer.md) | milestones pós-MVP |
| manter a projeção | [`specsfy-milestone-governor`](specsfy-milestone-governor.md) | `specs.md` e progresso derivado |

## Encontre a skill pelo estado do trabalho

Uma anotação que precisa ser preservada vai para `specsfy-01-inbox`. Quando
você quiser comparar essa ideia com itens existentes e esclarecer o mínimo
necessário, `specsfy-02-backlog` cria ou atualiza o arquivo numerado e
aprofunda as definições que mudam o comportamento e
entrega um brief na conversa.

Com a intenção de criar uma entrega confirmada,
`specsfy-03-specify` monta a `spec.md` e `specsfy-04-validate` comprova o
Ato I. A skill `specsfy-05-tasks` monta o plano, chama
`specsfy-06-tdd-bdd` para materializar os testes e só aprova o Plan Gate
depois de um RED válido. `specsfy-07-implement` executa as tarefas com
evidência e documentação atualizada.

Uma necessidade surgida depois da definição retorna à mesma spec por
`specsfy-update-spec`. Para apenas consultar gates, tarefas e o próximo
trabalho sem alterar arquivos, use `specsfy-progress`.

Quando uma lacuna puder alterar a próxima etapa, chame
`specsfy-interviewer`. Ele conversa com a spec sem substituir a skill que
valida, planeja, implementa ou conclui.

Para planejar um produto inteiro, comece pelo
`specsfy-mvp-milestone-interviewer` e, depois do aceite do MVP, use o
`specsfy-roadmap-milestone-interviewer`. O `specsfy-milestone-governor` mantém
o painel derivado de specs e backlog, detalhado no guia
[Milestones](../milestones.md) com arquivos, relações e sincronização.

Quando uma conversa revelar informações que o sistema precisa guardar, use
`specsfy-data-discovery`. A skill pergunta em linguagem simples e mantém o
registro em `.specsfy/DATABASE.md` antes de o backlog ou a spec avançar.

Volte ao [guia completo](../README.md) ou leia [como a metodologia
funciona](../method.md).
