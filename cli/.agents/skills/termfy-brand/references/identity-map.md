# Mapa da identidade

| Dado | Fonte | Quem lê |
| --- | --- | --- |
| `bin` | `package.json` → `termfy.bin` (ou `name`) | `manifest.bin`: pasta `~/.<bin>/`, prefixo `<BIN>_HOME` e `<BIN>_MASTER_KEY`, esquema `<bin>://`, nome do servidor MCP, `--version`, usage do `--help`, completion |
| `title` | `package.json` → `termfy.title` | cabeçalho da TUI, aba About, `about`, `info.title` do OpenCLI, título da tool `operate` |
| `description` | `package.json` → `description` | `--help`, cabeçalho da TUI, aba About, `about`, `info.summary` do OpenCLI, `instructions` do servidor MCP |
| `version` | `package.json` → `version` | `--version`, `about`, aba About, `info.version` do OpenCLI, versão do servidor MCP |
| `author` | `package.json` → `termfy.author` | `about`, aba About, `info.contact.name` do OpenCLI |
| `site` | `package.json` → `termfy.site` | `about`, aba About, `info.contact.url` do OpenCLI |
| `repository` | `package.json` → `termfy.repository` | `about`, aba About; `repository.url` do `package.json` acompanha |
| `license` | `package.json` → `license` | `about`, aba About, `info.license` do OpenCLI |
| `framework` | `package.json` → `termfy.framework` | documentação; não aparece no binário |
| créditos | `credits` em `src/app/manifest.ts` | `about`, aba About, tool MCP `about` |
| paleta | `themes.night` e `themes.day` em `src/tui/theme.ts` | toda a TUI, por nome de papel |
| glifos | `glyphs` em `src/tui/theme.ts` | cabeçalho, listas e estados da TUI |
| padrões seguidos | painel "Standards" em `src/tui/screens/about.ts` | aba About |

## O que `bun run init` toca

`package.json` (`name`, `bin`, `description`, bloco `termfy`,
`repository`), `.env.example`, `README.md`, `AGENTS.md`, `CHANGELOG.md` e
`.github/workflows/*.yml`. Não toca em `src/`, `docs/` nem `CLISPEC.md`.

## O que `bun run init` não toca e esta skill cuida

Créditos, paleta, glifos, painel "Standards", `license`, os campos de
identidade do `CLISPEC.md` (título, `bin` e `description`) e qualquer texto
do `README.md` além das substituições literais do nome anterior. A
superfície, o índice `## Specs` e os arquivos de `specs/` não mudam com a
identidade.

## Paleta: papéis e uso

| Papel | Uso |
| --- | --- |
| `background`, `surface`, `surfaceHigh` | fundo geral, painéis, aba ativa e caixa de ajuda |
| `border`, `borderActive` | borda normal e do painel em foco |
| `text`, `textDim`, `textStrong` | valor, rótulo, título |
| `accent`, `accentSecondary` | ativo e ação; links e origens externas |
| `ok`, `warn`, `error` | estado, sempre com texto ao lado |
| `barBackground`, `barText`, `keyBackground`, `keyText` | barra inferior |

Para uma cor de marca: `accent` recebe a cor principal; `accentSecondary` a
segunda cor ou uma variação mais clara; `borderActive` e `keyBackground`
costumam acompanhar `accent`. Confira o contraste de `text` sobre `surface`
e de `keyText` sobre `keyBackground`.
