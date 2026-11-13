# Specsfy CLI

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="https://promovaweb.com/opensource/specsfy/icon.svg"
    type="image/svg+xml">
    <img
      src="https://promovaweb.com/opensource/specsfy/icon.png"
      alt="Logo do Specsfy"
      width="128"
    >
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

O `specsfy` é a ferramenta do método Specsfy no terminal. O mesmo executável
instala e atualiza o framework, lê e altera o estado das specs dentro das
regras do método, roda os gates de definição, plano e entrega e serve tudo
isso a agentes de IA pelo MCP. Este módulo reúne CLI e TUI no mesmo
executável, para acompanhar o progresso das specs e agir sobre ele. Ele tem
três modos:

| Modo | Entrada | Para quem |
| --- | --- | --- |
| TUI | `specsfy` sem argumentos, em terminal interativo | pessoas acompanhando o projeto |
| CLI | `specsfy <command> [options]`, saída em texto ou `--json` | pessoas, scripts e CI |
| MCP | `specsfy mcp`, servidor Model Context Protocol via stdio | Claude Code, Codex, OpenCode e outros agentes |

O binário é compilado com o [Bun](https://bun.sh) e não depende de Node.js nem
de Bun na máquina. Ele carrega dentro de si os scripts, templates e regras das
skills do framework e os executa com o próprio runtime. As skills continuam
trazendo os scripts `.mjs` como alternativa para quem ainda não instalou o
binário.

## Instalação

O executável de cada plataforma (Linux x64 e arm64, macOS x64 e arm64,
Windows x64) é publicado em `get.specsfy.dev` e anexado a cada GitHub
Release do repositório. Coloque o arquivo em um diretório do `PATH` e
preserve a permissão de execução.

Pelo npm, o pacote `@promovaweb/specsfy` instala um wrapper que baixa o
binário da plataforma na primeira execução:

```bash
npm install --global @promovaweb/specsfy
specsfy --version
```

Para atualizar, rode `specsfy upgrade`. Com `--check`, o comando só informa
se existe versão nova.

## Primeiros passos

```bash
specsfy install                 # skills base, .specsfy/ e blocos do AGENTS.md
specsfy status                  # visão geral do projeto
specsfy                         # abre a TUI
specsfy --skill                 # documentação completa, escrita para agentes
```

Todo command de projeto aceita `--project <dir>`. Sem ele, o `specsfy` sobe a
partir da pasta atual até encontrar `specs/`, `.specsfy/` ou
`skills-lock.json`. Onde um command pede `<spec>`, vale o número (`1` ou
`0001`), o nome da pasta (`0001-recuperar-senha`), o slug sem número ou o
caminho do `spec.md`.

## Commands

| Grupo | Commands |
| --- | --- |
| Projeto | `status`, `progress [--watch]`, `specs list`, `specs show`, `backlog list`, `inbox list` |
| Ciclo da spec | `inbox capture`, `inbox process`, `backlog start`, `specs new`, `specs transition`, `specs effort`, `specs migrate`, `specs research`, `specs change`, `tasks next`, `tasks check`, `tasks delivery` |
| Gates | `gate spec`, `gate tasks`, `gate interface`, `gate trace`, `gate acceptance`, `gate evidence`, `gate findings`, `gate database`, `verify` |
| Contexto | `context setup`, `context inspect`, `context interface`, `context monitor`, `context stack`, `context rule`, `context database`, `context data`, `context usage` |
| Entrega | `test`, `milestones sync`, `milestones import-mvp`, `docs build` |
| Framework | `install`, `update`, `upgrade`, `skills list`, `skills detect`, `skills install`, `skills remove`, `skills update` |
| Utilitários | `scripts list`, `scripts run`, `doctor`, `config`, `credentials`, `about`, `mcp`, `skill`, `completion` |

A referência completa, gerada do registry de commands, sai em
`specsfy --skill cli`. A descrição em OpenCLI sai em `specsfy --opencli`.

## Gates no CI

Os gates saem com o código 0 quando aprovam e com o código 10
(`GATE_FAILED`) quando encontram problemas. O `verify` roda a política
inteira do framework e é a entrada indicada para o CI:

```bash
specsfy verify --boundary ci --json
specsfy gate spec 0001 --json
```

## MCP

Configure o agente com:

```json
{ "mcpServers": { "specsfy": { "command": "specsfy", "args": ["mcp"] } } }
```

O agente lê o projeto (`project_status`, `specs_list`, `spec_get`), move o
trabalho pelo método (`spec_transition`, `spec_effort`, `task_check`,
`inbox_capture`), roda os gates (`gate_spec`, `verify`) e os testes
(`project_test`). `specsfy mcp --list` mostra todas as tools, resources e
prompts.

## TUI

A TUI abre na raiz do projeto e se atualiza sozinha quando os arquivos das
specs mudam. As abas são Overview, Specs, Backlog, Gates, Tests, Skills e
About.

![Dashboard Home](https://promovaweb.com/docs/specsfy/cli/cli-dash.png)

![Backlogs](https://promovaweb.com/docs/specsfy/cli/cli-backlogs.png)

![Specs](https://promovaweb.com/docs/specsfy/cli/cli-specs.png)

![Skills](https://promovaweb.com/docs/specsfy/cli/cli-skills.png)

## Configuração e credenciais

As preferências ficam em `~/.specsfy/settings.json` e os segredos em
`~/.specsfy/credentials.json`, cifrados com AES-256-GCM:

```bash
specsfy config set tui.watchInterval 0.5
printf '%s' "$TOKEN" | specsfy credentials set github.token --stdin
```

O catálogo de especialistas e a checagem de versões usam a API do GitHub. O
token vem da credencial `github.token`, de `GH_TOKEN`, de `GITHUB_TOKEN` ou da
sessão de `gh auth token`, nesta ordem.

## Desenvolvimento

O código fica em `src/` (TypeScript, Bun 1.4.4 ou superior) e segue o
[Termfy](https://github.com/promovaweb/termfy). A visão macro do binário está
em [CLISPEC.md](CLISPEC.md) e cada evolução em [specs/](specs/).

```bash
bun install
bun run dev -- status --project ../example
bun run validate                # tipos, testes, docs embutidas, OpenCLI e build
bun run build:all               # executáveis das cinco plataformas em dist/
```

Depois de mudar qualquer arquivo de `../skills/`, rode `bun run embed` para
regenerar a árvore embutida.

## Versões e publicação

A versão do CLI acompanha a do framework. Cada publicação atualiza o
`CHANGELOG.md`, cria a tag `vX.Y.Z` e a GitHub Release com os executáveis.
O fluxo completo está na skill
[`specsfy-release-cli`](.agents/skills/specsfy-release-cli/SKILL.md).
