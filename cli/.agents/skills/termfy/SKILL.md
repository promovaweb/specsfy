---
name: termfy
description: Ponto de entrada do Termfy, a skill para chamar primeiro. A pessoa descreve a ferramenta em linguagem natural e esta skill conduz o ciclo inteiro (init, brand, CLISPEC, specs, implementação, docs e release) chamando as outras skills na ordem certa, com poucos checkpoints.
---

# Termfy: ponto de entrada

Esta é a primeira skill a chamar em qualquer projeto Termfy. Use-a quando
a pessoa disser o que quer em linguagem natural ("quero um CLI que liste
meus pedidos da loja e avise no terminal"), pedir para continuar o
trabalho de um binário ou não nomear uma skill específica. Ela não
implementa nada por conta própria:
decide a ordem, chama as skills certas, mantém o `CLISPEC.md` como visão
macro do binário e cada evolução em uma spec de `specs/`, e para em poucos
pontos para a pessoa confirmar.

## Leia antes

- `AGENTS.md` do repositório.
- `CLISPEC.md` e os arquivos de `specs/`, para saber se o projeto está no
  esqueleto (sem `CLISPEC.md`), com visão macro, com spec aberta ou com
  specs fechadas. Os dois são Markdown puro, editados pelo agente.
- `references/flow.md`: os estágios, o que entra e o que sai de cada um, e
  os checkpoints.
- `references/first-prompt.md`: como transformar a frase da pessoa em
  respostas para as entrevistas da `termfy-clispec` e da `termfy-spec`.

## Regras

1. Poucas perguntas, cedo. Antes de qualquer skill, confirme em uma única
   mensagem: nome do executável, uma frase de propósito e os públicos (quem
   digita, quem roda por script, qual agente). O resto vem das entrevistas da
   `termfy-clispec` e da `termfy-spec`, e só o que a frase da pessoa não
   respondeu.
2. Checkpoints fixos: depois do `CLISPEC.md` e da primeira spec (a pessoa
   aprova a visão macro, a lista de specs e os commands e telas da primeira)
   e antes da release (a pessoa aprova o `--help`, a TUI e o `mcp --list`). O
   resto corre sem parar, relatando marcos.
3. Uma entrega por vez, na ordem de `references/flow.md`. Cada entrega
   termina com teste verde e item marcado em Tasks ou Tests da spec aberta;
   só então a próxima.
4. Reutilize as skills; não reescreva o que elas fazem. `termfy`
   lê a saída de cada uma e decide o próximo passo.
5. Quando algo falhar duas vezes seguidas (teste, `validate`, build),
   pare, mostre o erro e pergunte. Não insista em loop.
6. Nunca peça segredo no chat. Quando um command precisar de credencial,
   oriente `<bin> credentials set <name>` no terminal da pessoa e siga com
   o restante.
7. Relate em cada marco: o que ficou pronto, o que vem a seguir, como a
   pessoa testa agora (um comando).

## Setup e manutenção

Quando a solicitação for somente setup ou instalação, atualização ou reparo
das skills, encaminhe para `termfy-init` no modo correspondente. Não abra
a entrevista do produto nem inicie implementação ou release durante uma
manutenção. Os comandos de setup e de gestão das skills são executados pelo
agente dentro da skill, sem exigir que o usuário os rode manualmente.

## Passos

1. Diagnóstico: `git status --short`, `bun run dev -- --version`,
   `bun run skills:check` e a leitura de `CLISPEC.md` e `specs/`. Escolha
   o estágio: esqueleto, visão macro sem specs, spec aberta sem código,
   spec em andamento ou todas fechadas.
2. Se o projeto está no esqueleto: `termfy-init` (com a identidade
   confirmada) e `termfy-brand` se houver cor, créditos ou links a ajustar.
3. `termfy-clispec`, alimentando a entrevista com
   `references/first-prompt.md`. Ela grava a visão macro e cria os
   arquivos das specs iniciais em `specs/`, como `draft`.
4. `termfy-spec` para a primeira spec da lista (ou `termfy-api-import`
   quando o ponto de partida é a documentação de uma API). Checkpoint 1:
   mostre o Purpose, os públicos, a lista de specs e a tabela de commands,
   screens e tools da primeira spec, e peça aprovação.
5. Para cada tarefa pendente da spec, na ordem config → api → database →
   cli → mcp → tui: `termfy-config`, `termfy-api` quando houver serviço
   externo, `termfy-database` só quando a spec pede armazenamento,
   `termfy-cli` (ou `termfy-command-set` para uma família
   `recurso verbo`), `termfy-mcp`, `termfy-tui`. Cada skill lê o arquivo
   da spec e segue Behavior, Design e Surface. Depois de cada tarefa:
   `termfy-test` para os itens de Tests.
6. `termfy-review` sobre a spec; corrija o que ela apontar. `termfy-docs`
   em seguida. Com todos os itens marcados, feche a spec como descreve a
   `termfy-spec`: Surface aplicada ao `CLISPEC.md`, status `done` na spec
   e no índice e a linha datada em Notes. Repita os passos 4 a 6 para a próxima
   spec da lista; a entrevista da `termfy-spec` continua, e o checkpoint 1
   só volta quando a spec mudar a visão macro aprovada.
7. Checkpoint 2: mostre `--help`, o frame da TUI de teste e
   `mcp --list`, e peça aprovação para a release.
8. `termfy-release`. Se a pessoa for usar com um agente, `termfy-mcp-client`.
9. Feche com o resumo: como instalar, como rodar os três modos, as specs
   fechadas e abertas e o que ficou em `## Notes`.

## Marcos

Identidade confirmada; `CLISPEC.md` e primeira spec aprovados; cada tarefa
da spec com teste verde; review limpa; docs conferidas; spec fechada;
release publicada.

## Saída

Relate o estágio alcançado, os commands, screens e tools entregues, as
specs fechadas, os testes executados, as pendências de `## Notes` e os comandos para a pessoa
experimentar.

## Compatibilidade

Starter kit a partir da v0.9.0: specs em Markdown puro, sem command
`spec`. Caminhos citados: `CLISPEC.md`, `specs/`, `AGENTS.md` e os
scripts `dev`, `skills:check`, `validate`.
