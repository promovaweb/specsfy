# 0013 Showcase da TUI

Status: done

## Goal

Manter em `docs/user/assets/showcase/` um print de cada tela da TUI que
acompanha o código: quem lê o repositório vê a TUI atual sem instalar o
binário, e uma mudança de tela não passa sem atualizar a pasta. Os prints servem à documentação, ao site
e ao material de divulgação.

## Behavior

`bun run showcase` monta a TUI com o projeto `example/` nos temas `night` e
`day`, numa tela de 140×40, e grava um PNG e um quadro em texto para cada aba
e para o help de teclas. Só as telas cujo quadro mudou ganham PNG novo;
`--all` gera todas. `bun run showcase:check` compara a TUI com os quadros
gravados e falha, com o nome da tela, quando algum difere ou falta. A
verificação entra em `bun run validate`, então roda no CI do CLI e no
workflow de release. Versão, plataforma e runtime ficam de fora da
comparação. Caminhos da máquina, a pasta de dados e o PID aparecem com
valores fixos nos quadros e nas imagens. Os prints night de Overview,
Backlog, Specs e Skills são copiados para `docs/user/assets/cli/` com os nomes
que o guia do CLI, o site e os READMEs já usam.

## Design

`scripts/showcase.ts` usa `createTestRenderer` de `@opentui/core/testing` e
`mountTui` com os serviços reais de leitura, catálogo local de
`../specialists/catalog.json` e testes desligados. A captura espera o quadro
ficar estável antes de gravar. `captureCharFrame` gera o quadro em texto e
`captureSpans` gera um HTML com as cores de cada célula, convertido em PNG
pelo Playwright de `../.ebook/node_modules`, o mesmo do ebook. Nenhuma
dependência nova entra no `package.json` do CLI.

## Surface

- Novos scripts de desenvolvimento: `showcase` e `showcase:check`.
- `validate` passa a incluir `showcase:check`.
- Nova pasta `docs/user/assets/showcase/` com os PNGs; quadros em texto em
  `cli/tests/showcase-frames/`; galeria e fluxo em `docs/develop/showcase.md`.
- `docs/user/assets/cli/` passa a ser gerada pelo showcase.

## Tasks

- [x] `scripts/showcase.ts` com captura, anonimização e geração incremental `#termfy-tui`
- [x] Scripts `showcase` e `showcase:check` e `validate` `#termfy-test`
- [x] `docs/develop/showcase.md` com a galeria e o fluxo de atualização `#termfy-docs`
- [x] README do CLI com link para o showcase; percurso visual de `docs/user/cli.md` alinhado às telas atuais; `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md` e `docs/release.md` com a etapa nova `#termfy-docs`

## Tests

- [x] `bun run showcase:check` verde logo depois de `bun run showcase`
- [x] Mudança simulada numa tela faz o check falhar com o nome da tela
- [x] Quadros e imagens sem caminho, pasta temporária ou PID da máquina

## Notes

- 2026-11-20: pedido do Luiz para manter na pasta `showcase` os prints de
  todas as telas, atualizados conforme a TUI muda, dentro de `docs/` do
  Specsfy, para uso em marketing.
