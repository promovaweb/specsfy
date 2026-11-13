# Specsfy

Esqueleto de binário em [Bun](https://bun.sh) para construir ferramentas de
terminal com três modos no mesmo executável. É o template do GitHub do
framework [Termfy](https://github.com/promovaweb/termfy), e já vem com as
skills do framework instaladas em `.agents/skills/`.

| Modo | Entrada | Para quem |
| --- | --- | --- |
| TUI | `specsfy` sem argumentos, em terminal interativo | pessoas |
| CLI | `specsfy <command> [options]`, saída em texto ou `--json` | pessoas, scripts e agentes |
| MCP | `specsfy mcp`, servidor Model Context Protocol via stdio | agentes de IA |

Os três modos compartilham identidade, configuração (`~/.specsfy/settings.json`),
cofre de credenciais cifrado (`~/.specsfy/credentials.json`) e a tabela de
exit codes. A TUI usa o [OpenTUI](https://opentui.com); o CLI publica sua
interface no formato [OpenCLI](https://opencli.org); o MCP usa o
[SDK oficial](https://github.com/modelcontextprotocol/typescript-sdk).

Todo o código é em inglês: arquivos, identificadores, comentários, mensagens,
commands, options, keys e campos do `--json`. A documentação é em português.

```text
 ▌ Specsfy v0.9.2  │  CLI, TUI and MCP stdio server skeleton in Bun, with the  linux-x64 • Bun 1.4.4
 ──────────────────────────────────────────────────────────────────────────────────────────────────
 Overview      About
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ╭─ Environment ────────────────────────────────────╮╭─ State ────────────────────────────────────╮
 │ Binary    specsfy v0.9.2                          ││ settings.json     • defaults               │
 │ Runtime   Bun 1.4.4                              ││ credentials.json  • empty                  │
 │ Platform  linux-x64                              ││ master key        not created              │
 │ Terminal  100×24  xterm-256color                 ││ MCP               specsfy mcp               │
 │ Data      ~/.specsfy                              ││                                            │
 ╰──────────────────────────────────────────────────╯╰────────────────────────────────────────────╯
 ╭─ Settings in effect ─────────────────────────────╮╭─ Next steps ───────────────────────────────╮
 │ output.colors      true                          ││ In the terminal                            │
 │ output.format      "text"                        ││ → specsfy --help                            │
 │ telemetry.enabled  false                         ││ → specsfy credentials set <name>            │
 │ tui.initialTab     "overview"                    ││ → specsfy config set tui.theme day          │
 │ tui.theme          "night"                       ││ → specsfy --skill                           │
 │                                                  ││                                            │
 │                                                  ││ For agents                                 │
 │                                                  ││ MCP client: { "command": "specsfy", "args": │
 │                                                  ││ ["mcp"] }                                  │
 │                                                  ││                                            │
 ╰──────────────────────────────────────────────────╯╰────────────────────────────────────────────╯
  ←/→  tab   1-9  go   ?  help   q  quit
```

## Sobre o template

Este repositório é um template do GitHub. Clique em **Use this template**,
abra o clone no agente e peça: "Use termfy-init para fazer o setup deste
projeto". Informe o nome do executável e o propósito da ferramenta. O agente
conduz a configuração e as verificações pela skill.

O guia completo está em [docs/customize-template.md](docs/customize-template.md).
Para atualizar ou reparar as skills, use `termfy-init` no modo de
manutenção. O guia do método e o ebook ficam no
[framework](https://github.com/promovaweb/termfy).

## Requisitos

Bun 1.4.4 ou superior. Node.js não é usado.

## Rodar em desenvolvimento

```bash
bun install
bun run dev                 # TUI
bun run dev -- --help       # help do CLI
bun run dev -- about --json
bun run dev -- mcp --list
```

## Commands

| Command | Função |
| --- | --- |
| `specsfy` | abre a TUI (abas Overview e About) |
| `specsfy tui [--tab overview\|about]` | abre a TUI em uma aba |
| `specsfy about` | version, executable, runtime, platform e credits |
| `specsfy config list\|get\|set\|unset\|path\|schema` | preferências em `settings.json` |
| `specsfy credentials set\|get\|list\|remove\|status\|clear` | segredos cifrados em `credentials.json` |
| `specsfy mcp [--list]` | servidor MCP via stdio |
| `specsfy skill [topic]` | documentação embutida |

Options globais: `--help`, `--version`, `--json`, `--skill [topic]`,
`--opencli`, `--no-color`. Referência completa em [docs/cli.md](docs/cli.md).

## Documentação embutida

```bash
specsfy --skill            # tudo, em Markdown
specsfy --skill mcp        # uma seção: cli, tui, mcp, config, exit-codes
specsfy --opencli          # descrição OpenCLI em JSON
```

A pasta [docs/](docs/README.md) entra no binário em tempo de build. Um agente
lê a documentação sem acesso ao repositório.

## Exit codes

| Code | Name |
| --- | --- |
| 0 | `SUCCESS` |
| 1 | `GENERIC_ERROR` |
| 2 | `USAGE` |
| 3 | `CONFIG` |
| 4 | `CREDENTIALS` |
| 5 | `NETWORK_OR_API` |
| 6 | `NOT_FOUND` |
| 7 | `PERMISSION` |
| 8 | `NO_TTY` |
| 9 | `MCP` |
| 130 | `INTERRUPTED` |

Detalhes em [docs/exit-codes.md](docs/exit-codes.md).

## Configuração e credenciais

```bash
specsfy config set tui.theme day
specsfy credentials set openai.api_key        # digita sem eco
printf '%s' "$TOKEN" | specsfy credentials set github.token --stdin
specsfy credentials status
```

Os arquivos ficam em `~/.specsfy/` com permissão 0600. As credenciais são
cifradas com AES-256-GCM; a master key vem de `SPECSFY_MASTER_KEY` ou de
`~/.specsfy/master.key`. Veja [docs/configuration.md](docs/configuration.md).

## MCP

```json
{ "mcpServers": { "specsfy": { "command": "specsfy", "args": ["mcp"] } } }
```

Tools: `about`, `exit_codes`, `skill`, `config_list`, `config_get`,
`credentials_status`. Resources: `specsfy://about`, `specsfy://exit-codes`,
`specsfy://skill`, `specsfy://skill/{topic}`. Prompt: `operate`.
Detalhes em [docs/mcp.md](docs/mcp.md).

## Estrutura

```text
src/        código do binário (app, cli, config, mcp, tui, skill)
docs/       documentação embutida e opencli.json
template/   stubs de command, screen e tool
.agents/    skills do framework instaladas via npx skills (skills-lock.json)
scripts/    build, init e checks
tests/      bun test
```

Arquitetura em [docs/architecture.md](docs/architecture.md).

## Validar, compilar e publicar

```bash
bun run validate      # typecheck, testes, skills:check, opencli:check, docs:check, build
bun run build         # dist/specsfy
bun run build:all     # linux-x64, linux-arm64, darwin-x64, darwin-arm64, windows-x64
```

Releases seguem [docs/release.md](docs/release.md): versão em
`package.json`, entrada no `CHANGELOG.md`, tag `vX.Y.Z` e GitHub Release com
binários gerados pelo workflow. O guia do método em PDF e EPUB fica no
framework, não aqui.

## Licença

Repositório privado da Promovaweb. Uso interno e dos alunos autorizados.
