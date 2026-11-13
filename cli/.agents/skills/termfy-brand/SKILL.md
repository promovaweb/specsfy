---
name: termfy-brand
description: Ajusta a identidade do binário em um só lugar (nome, título, descrição, autor, site, repositório, créditos, paleta da TUI) e os dados exibidos em --version, about, na aba About, no OpenCLI e no servidor MCP.
---

# Ajustar a identidade do binário

Use esta skill quando a pessoa pedir para mudar como o binário se apresenta:
nome do executável, título, descrição, autor, links, licença, créditos,
cores da TUI ou o que a aba About e o command `about` mostram. `bun run init`
cuida do rename inicial; esta skill cuida de tudo que vem depois e do que o
`init` não toca.

## Leia antes

- `AGENTS.md` do repositório.
- `references/identity-map.md`: onde cada dado de identidade vive e quem o
  consome.
- `src/app/manifest.ts`, o bloco `termfy` do `package.json`,
  `src/tui/theme.ts` e `src/tui/screens/about.ts`.
- `CLISPEC.md`: a identidade fica no título `# <title>` e na linha logo
  abaixo dele, com o `bin` e a `description`. As specs de `specs/` não
  guardam identidade.

## Regras

1. Identidade tem uma fonte: o bloco `termfy` do `package.json` mais
   `name`, `version`, `description` e `license`. `src/app/manifest.ts` lê
   dali; `--version`, `about`, a aba About, o OpenCLI (`info`) e o nome do
   servidor MCP leem do manifest. Não duplique valores em outro arquivo.
2. Créditos vivem em `credits` de `src/app/manifest.ts`: nome, papel e URL.
   Acrescente dependências relevantes do projeto; não remova Bun, OpenTUI e
   MCP SDK enquanto o binário os usar.
3. Mudar `bin` é um rename: use `bun run init -- --name <bin>`, que
   reescreve `package.json`, `.env.example`, `README.md`, `AGENTS.md`,
   `CHANGELOG.md` e workflows. Depois ajuste o título e a linha do `bin`
   no `CLISPEC.md`, sem tocar na superfície nem no índice `## Specs`, e
   acrescente a mudança às Notes dele. A pasta `~/.<bin>/`, o prefixo `<BIN>_` e o esquema
   `<bin>://` mudam junto; avise a pessoa que dados antigos ficam na pasta
   antiga.
4. `description` é uma frase em inglês, sem ponto final duplicado, e aparece
   no `--help`, no cabeçalho da TUI e no OpenCLI. Mantenha abaixo de 80
   caracteres para caber no cabeçalho.
5. Cores entram só em `src/tui/theme.ts`, nas duas paletas, com nomes de
   papel. Uma cor de marca entra como `accent` (e `accentSecondary` quando
   houver duas), nunca como novo campo usado por uma screen só. Mantenha
   contraste mínimo 4.5:1 entre `text` e `surface`.
6. A aba About (`src/tui/screens/about.ts`) e o command `about`
   (`aboutData()` em `src/cli/commands/about.ts`) mostram os mesmos dados.
   Um campo novo entra em `aboutData()` e nas duas superfícies.
7. Nada de logo em ASCII ocupando linhas: o cabeçalho da TUI usa o glifo
   `▌` mais o título. Se a pessoa quiser um glifo próprio, troque
   `glyphs.block` em `src/tui/theme.ts`.
8. Depois de qualquer mudança: `bun run opencli` (o `info` do OpenCLI muda)
   e `bun run validate`. Confira à mão que o título, o `bin` e a
   `description` do `CLISPEC.md` batem com o `package.json`.

## Passos

1. Rode `git status --short` e `bun run dev -- about --json` para ver o
   estado atual.
2. Confirme com a pessoa cada campo que muda: `bin`, `title`,
   `description`, `author`, `site`, `repository`, `license`, créditos,
   paleta. Mostre o valor atual e o proposto lado a lado.
3. Aplique no `package.json` (bloco `termfy` e campos raiz) e, para
   créditos e paleta, em `src/app/manifest.ts` e `src/tui/theme.ts`.
4. Se `bin` mudou, rode `bun run init` e ajuste `CLISPEC.md`.
5. Rode `bun run opencli` e `bun run validate`.
6. Confira as superfícies: `bun run dev -- --version`,
   `bun run dev -- about`, `bun run dev -- --help | head`, a aba About no
   teste `tests/tui.test.ts` (ou `bun run dev` em terminal) e
   `bun run dev -- mcp --list`.
7. Registre a mudança em `CHANGELOG.md` do projeto.

## Marcos

Campos confirmados; `package.json` e manifest ajustados; superfícies
conferidas; `validate` verde.

## Saída

Liste os campos alterados com valor anterior e novo, os arquivos tocados e
as superfícies conferidas. Lembre a pessoa do rename da pasta `~/.<bin>/`
quando `bin` mudou.

## Compatibilidade

Starter kit a partir da v0.9.0 (specs em Markdown puro, sem command
`spec`). Caminhos citados: `package.json`, `src/app/manifest.ts`,
`src/tui/theme.ts`, `src/tui/screens/about.ts`, `src/cli/commands/about.ts`,
`scripts/init.ts`, `CLISPEC.md` e os scripts `init`, `opencli` e
`validate`.
