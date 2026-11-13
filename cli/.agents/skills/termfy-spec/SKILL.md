---
name: termfy-spec
description: Entrevista a pessoa e escreve à mão uma spec de evolução em specs/NNNN-slug.md, em Markdown puro (status, Goal, Behavior de como o binário vai funcionar, Design de como o código deve ser feito, Surface, Tasks e Tests), para que as skills de implementação trabalhem com o pedido claro.
---

# Escrever uma spec de evolução

Use esta skill antes de implementar qualquer command, screen, tool,
setting, credencial ou tabela em um projeto derivado do starter kit,
sempre que nenhuma spec aberta cobrir o pedido. Cada evolução do binário
tem a sua spec em `specs/NNNN-slug.md`; o `CLISPEC.md`, mantido pela
`termfy-clispec`, segue único e guarda a visão macro.

Uma spec define duas coisas: como o binário vai funcionar depois da
mudança (`## Behavior` e `## Surface`) e como o código deve ser feito
(`## Design`). `## Tasks` e `## Tests` transformam isso em entregas
verificáveis. As skills `termfy-cli`, `termfy-tui`, `termfy-mcp`,
`termfy-config`, `termfy-api` e `termfy-database` leem a spec antes de
tocar no código e marcam os itens conforme avançam.

Os dois documentos são Markdown puro, sem front matter, schema ou IDs de
item. O binário não os lê e não tem command para editá-los: o agente cria
e edita os arquivos diretamente.

## Leia antes

- `AGENTS.md` do repositório.
- `CLISPEC.md` e os arquivos de `specs/`, para saber o que já foi
  entregue e o que está aberto.
- `references/spec-contract.md`: forma da spec, regras das seções, ciclo
  e conferência manual.
- `references/interview.md`: os blocos da entrevista e o que cada resposta
  preenche.
- `references/behavior-design.md`: como escrever Behavior e Design com
  detalhe suficiente para outra skill implementar sem perguntar de novo.
- `docs/architecture.md`, `docs/cli.md`, `docs/tui.md`, `docs/mcp.md` e
  `docs/configuration.md` do starter kit, para saber o que o esqueleto já
  oferece e quais padrões o Design deve seguir.

## Regras

1. Entreviste antes de escrever. Uma spec registra o que a pessoa pediu,
   não o que o agente imagina. Dúvida sem resposta vai para `## Notes`,
   datada, e a spec fica em `draft` até ser respondida.
2. Blocos curtos: poucas perguntas por vez, confirmação em uma frase, até
   três caminhos por escolha aberta, com o recomendado primeiro, e espaço
   para resposta livre. Pule a pergunta que a pessoa já respondeu.
3. Uma spec por evolução entregável. Se o pedido mistura capacidades
   independentes, proponha dividir em specs separadas.
4. `## Surface` lista o que a spec adiciona, altera ou remove, um item por
   entrada, com os nomes do código, em inglês, e os mesmos campos das
   tabelas do `CLISPEC.md`. Cada command entra com função, options, `data`
   do `--json`, exit codes e credenciais; cada tool com o efeito (`read`,
   `write` ou `network`); cada credencial com o nome em `service.purpose`
   e quem a usa. Spec sem mudança de superfície escreve
   `Nenhuma mudança de superfície.`
5. `## Behavior` diz como o binário funciona para quem usa: fluxo, saída em
   texto e em `--json`, mensagens de erro, exit codes, teclas da TUI,
   entrada e saída das tools. `## Design` diz como o código deve ser
   feito: arquivos novos e alterados, funções compartilhadas entre CLI,
   MCP e TUI, dependências, tratamento de erro e o padrão do starter kit
   que se aplica. Antes de `in_progress`, as duas seções precisam de texto.
6. Use os exit codes de `src/app/exit-codes.ts`. Família nova entra como
   tarefa da spec, implementada antes do command que a usa.
7. Banco de dados não é padrão. Só proponha SQLite quando a pessoa disser
   que precisa guardar dados entre execuções. Nesse caso, Surface lista as
   tabelas com colunas e tipos; o Design descreve o arquivo
   `~/.<bin>/data.db`, a migration nova e as funções de repositório; a
   tarefa leva a tag `#termfy-database`.
8. `## Tasks` tem um item por entrega, em checkbox GFM (`- [ ]`), com a
   tag da skill responsável no fim (`#termfy-cli`, `#termfy-tui`,
   `#termfy-mcp`, `#termfy-config`, `#termfy-api`, `#termfy-database`,
   `#termfy-docs`). `## Tests` tem um item por teste de aceite, escrito
   como comando e resultado esperado. Cada item de Surface aparece pelo
   nome no texto de ao menos uma tarefa ou teste. Item novo entra no fim
   da seção.
9. A entrevista cria itens pendentes. Quem implementa e testa marca o item
   com `[x]`. Não marque uma entrega como concluída só por descrevê-la.
10. Siga o ciclo de `references/spec-contract.md` editando os arquivos:
    criar (próximo número livre em `specs/`, `Status: draft`, linha no
    índice do `CLISPEC.md`), começar (`in_progress` na spec e no índice),
    avançar, fechar e arquivar. Uma spec parada por dependência externa
    continua `in_progress`, com o motivo datado em Notes.
11. Código que já existe sem spec entra por uma spec de adoção: leia o
    registry, as screens, as tools e o `SETTINGS_SCHEMA`, liste em Surface
    o que falta no `CLISPEC.md` e feche a spec para levar essas entradas
    às tabelas.

## Passos

1. Rode `git status --short` e leia `CLISPEC.md` e `specs/`. Se o
   `CLISPEC.md` não existe ou não descreve o binário, passe antes pela
   `termfy-clispec`.
2. Se a `termfy-clispec` já criou a spec, abra-a. Senão, escolha o próximo
   número livre de quatro dígitos, grave `specs/NNNN-slug.md` com o título,
   `Status: draft` e as seções do contrato, e acrescente a linha ao índice
   `## Specs` do `CLISPEC.md`.
3. Conduza a entrevista de `references/interview.md` na ordem: objetivo,
   comportamento, superfície, dados e integrações, desenho do código,
   aceite.
4. A cada bloco respondido, escreva a seção correspondente da spec e
   mostre o trecho à pessoa.
5. Faça a conferência manual de `references/spec-contract.md`: título e
   status iguais no índice, seções na ordem, Surface com os campos das
   tabelas, cada item de Surface citado em tarefa ou teste. Entradas que a
   spec planeja e o código ainda não tem são esperadas.
6. Releia a spec inteira com a pessoa: Behavior responde como usar, Design
   responde onde e como implementar, cada item de Surface tem tarefa e
   teste.
7. Liste as dúvidas de `## Notes` e pergunte se a pessoa quer resolvê-las
   agora ou seguir para a implementação. Ao seguir, troque o status para
   `in_progress` na spec e no índice.
8. Indique a próxima skill pela primeira tarefa pendente. Ao final da
   implementação, com todos os itens marcados, feche a spec: aplique
   Surface às tabelas do `CLISPEC.md`, troque o status para `done` na spec
   e no índice e acrescente `- AAAA-MM-DD: spec NNNN (título) closed.` às
   Notes do `CLISPEC.md`.

## Marcos

Objetivo confirmado; comportamento descrito; superfície listada em
Surface; dados e integrações nomeados; Design aprovado; tarefas e testes
gravados; conferência manual sem divergência.

## Saída

Relate o caminho da spec, o status, a contagem de itens de Surface
(adiciona, altera, remove), o número de tarefas e testes, o resultado da
conferência manual, as dúvidas abertas e a skill sugerida para a primeira
tarefa.

## Compatibilidade

Starter kit a partir da v0.9.0: specs em Markdown puro, sem command
`spec`. Caminhos citados: `CLISPEC.md`, `specs/`, `src/app/exit-codes.ts`
e os documentos de `docs/` listados em Leia antes.
