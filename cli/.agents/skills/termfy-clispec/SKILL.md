---
name: termfy-clispec
description: Entrevista a pessoa para entender o que o binário precisa fazer e escreve à mão ou revisa o CLISPEC.md, a visão macro única do binário em Markdown puro (identidade, propósito, públicos, modos, fora de escopo, superfície entregue e índice das specs).
---

# Descrever o binário no CLISPEC.md

Use esta skill quando o projeto ainda não tem `CLISPEC.md`, quando o
propósito, os públicos ou os limites do binário mudarem, ou quando a
pessoa pedir uma visão geral do que o binário é. O resultado é um único
arquivo na raiz, `CLISPEC.md`, em Markdown puro, no contrato de
`termfy-spec/references/spec-contract.md`. O starter kit não traz esse
arquivo: o primeiro nasce desta entrevista.

O `CLISPEC.md` descreve o binário como um todo. Ele não planeja trabalho:
cada evolução fica em uma spec de `specs/`, escrita pela `termfy-spec`. A
seção `## Surface` (commands, screens, MCP, settings, credenciais)
registra o que já foi entregue e cresce quando uma spec é fechada.

## Leia antes

- `AGENTS.md` do repositório.
- `CLISPEC.md` atual, quando existir, e os arquivos de `specs/`.
- `../termfy-spec/references/spec-contract.md`: os dois documentos, as
  seções, o ciclo das specs e a conferência manual.
- `references/interview.md`: os blocos da entrevista e o que cada resposta
  preenche.
- `references/macro-view.md`: como escrever Purpose, Audiences e Out of
  scope, e como transformar a entrevista na lista de specs iniciais.

## Regras

1. Entreviste antes de escrever. O objetivo é entender o que a pessoa
   precisa fazer com o binário, quem vai usá-lo e por qual modo. Não
   preencha uma seção com suposição: pergunte, ou registre a dúvida em
   `## Notes` com data.
2. Blocos curtos: poucas perguntas por vez, confirmação em uma frase, até
   três caminhos por escolha aberta, com o recomendado primeiro, e espaço
   para resposta livre. Quando a frase da pessoa já responde um bloco, pule
   a pergunta e confirme o que entendeu.
3. O `CLISPEC.md` tem as seções `## Purpose`, `## Audiences`,
   `## Out of scope`, `## Surface`, `## Specs` e `## Notes`, nesta ordem.
   Notes existe mesmo vazia. Não crie checklist nem `## Tasks` nele;
   tarefas e testes ficam nas specs.
4. `## Surface` descreve só o que já foi entregue. Ela muda quando uma
   spec é fechada, pela aplicação da Surface da spec às tabelas. O índice
   `## Specs` ganha uma linha a cada spec criada e muda de status junto com
   ela. Para adotar código que já existe sem spec, crie uma spec de adoção
   que liste esse código na Surface dela e feche-a; o fechamento traz as
   entradas para o `CLISPEC.md` e deixa a adoção no histórico.
5. A linha logo abaixo do título traz `bin` e `description` do
   `package.json`; quando a pessoa quiser mudar a identidade, encaminhe
   para `termfy-brand`.
6. Armazenamento local não é padrão. Só registre que o binário guarda
   dados quando a pessoa disser que precisa; nesse caso, anote em
   `## Purpose` o que é guardado e indique `termfy-database` na spec que
   criar as tabelas. A subseção `### Storage` entra em Surface quando essa
   spec for fechada.
7. Prosa em português (ou no idioma da pessoa); nomes de commands, keys,
   tools e screens em inglês, como no código.

## Passos

1. Rode `git status --short` e leia `CLISPEC.md`, quando existir, e
   `specs/` para ver o estado de partida.
2. Conduza a entrevista de `references/interview.md` na ordem: problema,
   públicos e modos, capacidades, dados e integrações, limites.
3. A cada bloco respondido, escreva a seção correspondente do
   `CLISPEC.md` e mostre o trecho à pessoa. Em um arquivo novo, comece
   pelo título, pela linha de identidade e pelas seções vazias do
   contrato.
   Preencha `## Surface` com o que o esqueleto já entrega, lido do código:
   commands do registry (`bun run dev -- --opencli`), screens de
   `src/tui/screens/index.ts`, tools, resources e prompts de
   `bun run dev -- mcp --list`, keys de `SETTINGS_SCHEMA` e as credenciais
   que o código lê com `getCredential()`. Assim a conferência manual parte
   de uma Surface igual ao código.
4. Monte com a pessoa a lista de specs iniciais (`references/macro-view.md`):
   uma por capacidade entregável, na ordem de entrega. Para cada uma
   aprovada, grave `specs/NNNN-slug.md` com o próximo número livre,
   `Status: draft` e as seções do contrato, e acrescente a linha ao índice
   `## Specs`.
5. Faça a conferência manual: seções na ordem, identidade igual ao
   `package.json`, uma linha do índice por arquivo de `specs/`, com título
   e status iguais aos da spec.
6. Indique a próxima skill: `termfy-spec` para detalhar a primeira spec da
   lista.

## Marcos

Problema e públicos confirmados; modos escolhidos; capacidades listadas;
dados e integrações nomeados; limites registrados; specs iniciais criadas;
conferência manual sem divergência.

## Saída

Relate o caminho do `CLISPEC.md`, os públicos e modos registrados, as specs
criadas (número e título), as dúvidas abertas em `## Notes`, o resultado da
conferência manual e a spec sugerida para a `termfy-spec`.

## Compatibilidade

Starter kit a partir da v0.9.0: specs em Markdown puro, sem command
`spec`. Caminhos citados: `CLISPEC.md`, `specs/` e `package.json`.
