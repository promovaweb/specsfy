# Arquitetura

```text
src/
  main.ts                 entry point: decide TUI, CLI ou help
  app/
    manifest.ts           identidade do binário (name, version, author, links)
    exit-codes.ts         tabela de exit codes
    errors.ts             AppError e atalhos error.*
  config/
    paths.ts              ~/.<bin>/ e variáveis de ambiente
    settings.ts           settings.json e SETTINGS_SCHEMA
    crypto.ts             AES-256-GCM e master key
    credentials.ts        cofre cifrado
  core/
    project.ts            raiz do projeto e resolução do identificador da spec
    overview.ts           leitura do projeto: specs, progresso, backlog e inbox
  domain/
    lifecycle.ts          pastas de estado, transições e scanners de spec
    progress.ts           progresso, gates e resumo das specs
    backlog.ts            itens de specs/backlog/
    inbox.ts              capturas de specs/inbox/
    installer.ts          instalação das skills, .specsfy/ e blocos gerenciados
    catalog.ts            catálogo de especialistas
    skill-lock.ts         skills-lock.json
    prerequisites.ts      checagens de ambiente
    github.ts             API do GitHub e resolução do token
    updater.ts            troca do próprio binário
    project-testing.ts    runner da suíte do projeto
    milestones.ts         milestones e índice de specs.md
    clickupfy.ts          ponte com o ClickUpfy
  engine/
    script-command.ts     ScriptCommandDef, toCommand e registerScriptTools
    runner.ts             materializa skills/ e executa os scripts .mjs
    skills.gen.ts         árvore de ../skills/ embutida (gerada)
  cli/
    index.ts              runCli(argv): parse, options globais, envelope JSON
    registry.ts           tipos Command, OptionDefinition, Context, Result
    parser.ts             argv → command, arguments e options
    help.ts               renderização do --help a partir do registry
    opencli.ts            descrição OpenCLI a partir do registry
    format.ts             cores, tabelas e seções da saída de texto
    input.ts              leitura de segredos e confirmações
    commands.ts           raiz da árvore de commands
    commands/             um arquivo por grupo de commands
  mcp/
    server.ts             McpServer, stdio e catalog para `mcp --list`
    tools/                uma função de registro por grupo de tools
    resources/            resources e templates
    prompts.ts            prompts
  tui/
    index.ts              montagem: header, tabs, content, status bar
    theme.ts              paletas night e day
    screen.ts             contrato Screen e ScreenContext
    components.ts         panel, keyValueTable, list, heading, dim
    screens/              uma aba por arquivo
  skill/
    index.ts              docs/ embutida + referência gerada do registry
docs/                     documentação do binário; entra no --skill
scripts/
  embed-skills.ts         gera src/engine/skills.gen.ts a partir de ../skills/
  check-docs.ts           confere a cobertura de commands, screens, tools e keys
  build.ts                compila o executável com bun build --compile
template/                 stubs de command, screen, tool e banco SQLite opcional
.agents/skills/           skills do framework Termfy, instaladas via npx skills
tests/                    bun test
```

## Camadas do domínio

`src/core/` lê o projeto. `project.ts` encontra a raiz a partir de `specs/`,
`.specsfy/` ou `skills-lock.json` e resolve o identificador da spec (número,
pasta, slug ou caminho). `overview.ts` monta a visão de leitura usada por
`status`, `specs list`, `specs show`, as tools MCP e as screens da TUI. Nada
em `core/` escreve arquivos.

`src/domain/` guarda as regras portadas do CLI anterior: estados da spec,
transições aceitas, escrita de inbox e backlog, instalação e atualização do
framework, catálogo de especialistas, lock, testes do projeto, milestones e
GitHub. Os commands nativos chamam essas funções diretamente, sem passar por
um script.

`src/engine/` executa os scripts do framework embutidos. A árvore de
`../skills/` é importada como texto em `skills.gen.ts`, gerado por
`scripts/embed-skills.ts` com `bun run embed`. Na primeira execução de cada
versão, `runner.ts` grava a árvore em
`~/.specsfy/runtime/<version>-<digest>/skills/` e roda cada `.mjs` com o
próprio executável e `BUN_BE_BUN=1`, sem Node.js na máquina. Quando um script
chama `node` por conta própria, `ensureNodeShim()` coloca no `PATH` um shim
que reexecuta o binário como Bun, inclusive para processos netos. A variável
`SPECSFY_SKILLS_DIR` aponta para uma árvore já existente, usada nos testes do
framework.

## ScriptCommandDef

`ScriptCommandDef` é a ponte declarativa entre os scripts e os três modos. Uma
definição diz qual script roda, quais parâmetros ele recebe, como a raiz do
projeto chega e qual é o efeito (`read` ou `write`). A partir dela:

- `toCommand` monta o `Command` do CLI, com arguments, options, exemplos e
  exit codes;
- `registerScriptTools` monta a tool MCP com o mesmo `inputSchema`;
- `executeScriptCommand` resolve a spec para o caminho do `spec.md`, roda o
  script com a raiz do projeto como diretório de trabalho e mapeia o código
  de saída (0 sucesso; gate diferente de 0 vira `GATE_FAILED`; 2 vira
  `USAGE`).

Assim o command e a tool nunca divergem: os dois nascem da mesma definição.

## Fluxo de execução

1. `main.ts` lê `argv`. Sem argumentos e com TTY, chama `runCli(["tui"])`.
   Sem TTY, imprime o help e sai com 2. Com argumentos, passa adiante.
2. `parser.ts` caminha pela árvore do registry, separa options e arguments e
   valida contra as definições. Falhas viram `AppError(2)`.
3. `index.ts` trata `--version`, `--opencli`, `--skill` e `--help`. Depois
   chama `run(ctx)` do command.
4. O command devolve `{ data, text }`. `index.ts` imprime texto ou o
   envelope JSON e devolve o exit code.
5. `main.ts` encerra o processo com esse code.

`mcp` e `tui` são commands como os demais; eles só não devolvem antes de o
transporte ou o renderer fechar.

## Regras de dependência

- `app/` não importa de nenhuma outra camada.
- `config/` importa só de `app/`.
- `domain/` importa de `app/` e não conhece CLI, MCP ou TUI.
- `core/` importa de `app/` e `domain/`.
- `cli/`, `mcp/` e `tui/` importam de `app/`, `config/`, `core/` e `domain/`.
  `mcp/` e `tui/` podem reutilizar funções de `cli/commands/*` que coletam
  dados (como `aboutData`), nunca o contrário.
- `engine/` importa de `core/` e usa os tipos de `cli/registry.ts` e
  `mcp/server.ts` para gerar command e tool da mesma definição.
- `skill/` importa de `cli/registry.ts` para gerar a referência.

## Idioma do código

Todo o código é em inglês: nomes de arquivos, identificadores, comentários,
mensagens do binário, commands, options, keys e campos do `--json`. A
documentação em `docs/`, o `README.md`, o `AGENTS.md` e as skills são em
português do Brasil com os termos técnicos em inglês.

## Build

`bun run build` compila `src/main.ts` em `dist/<bin>` para a plataforma atual
com `bun build --compile`. `bun run build:all` gera linux-x64, linux-arm64,
darwin-x64, darwin-arm64 e windows-x64. O OpenTUI embute a biblioteca nativa
no executável; o `docs/` entra como texto; o `package.json` entra como JSON;
`skills.gen.ts` carrega a árvore de skills.
