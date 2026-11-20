# 0018 Projeto de demonstração do showcase

Status: done

## Goal

Gerar os prints da TUI a partir de um projeto de demonstração com specs em
todos os estados, para a Overview e as demais telas mostrarem o ciclo completo
em vez de um único estado, como acontece com o `example/`, que está no layout
legado.

## Behavior

`bun run demo:build` escreve `tests/fixtures/showcase-project/`, uma loja
online com 8 specs em todos os estados (duas `completed`, uma `review`, duas
`in-progress`, uma `planned`, uma `defined` e uma `draft`), 3 itens de backlog
e 2 capturas de inbox, uma delas ainda pendente. Cada spec reutiliza o corpo
de uma spec real do `example/`, para o parser ler as mesmas seções, com título,
ID, slug, status, gates e tarefas marcadas próprios. A saída é determinística e
fica no repositório.

O showcase usa essa pasta como projeto e mostra a raiz como
`~/projects/loja-online` nos prints e nos quadros em texto. O fluxo de
atualização é `bun run demo:build` e depois `bun run showcase`.
`bun run showcase:check` compara a TUI com os quadros gravados e roda dentro
de `bun run validate`.

## Design

`scripts/build-demo-project.ts` declara as specs, o backlog e o inbox em
listas, copia o corpo da spec base do `example/`, reescreve a tabela do
cabeçalho (ID, Slug, Status, gates e data) e marca as tarefas da seção 14
conforme o estado. `scripts/showcase.ts` lê a pasta de
`tests/fixtures/showcase-project/` e mascara o caminho com
`~/projects/loja-online`.

## Surface

- Novo script de desenvolvimento: `demo:build`.
- Nova pasta `tests/fixtures/showcase-project/` com as specs, o backlog e o
  inbox do projeto de demonstração.
- Os prints de `docs/user/assets/showcase/` passam a vir do projeto de
  demonstração.

Nenhum command, option ou tool novo.

## Tasks

- [x] `scripts/build-demo-project.ts` com specs, backlog e inbox `#termfy-test`
- [x] Script `demo:build` no `package.json` `#termfy-test`
- [x] `scripts/showcase.ts` lendo o projeto de demonstração `#termfy-tui`
- [x] `docs/develop/showcase.md` com o caminho, o comando e o conteúdo `#termfy-docs`
- [x] Showcase regenerado com os prints novos `#termfy-docs`

## Tests

- [x] `bun run showcase:check` verde

## Notes

- 2026-11-20: pedido do Luiz para fazer todas as melhorias levantadas.
