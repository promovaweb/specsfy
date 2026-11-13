# Arquitetura

```text
src/
  main.ts                 entry point: decide TUI, CLI ou help
  app/
    manifest.ts           identidade do binário (name, version, author, links)
    exit-codes.ts         tabela de exit codes
    errors.ts             AppError e atalhos error.*
  cli/
    index.ts              runCli(argv): parse, options globais, envelope JSON
    registry.ts           tipos Command, OptionDefinition, Context, Result
    parser.ts             argv → command, arguments e options
    help.ts               renderização do --help a partir do registry
    opencli.ts            descrição OpenCLI a partir do registry
    format.ts             cores, tabelas e seções da saída de texto
    input.ts              leitura de segredos e confirmações
    commands.ts           raiz da árvore de commands
    commands/             um arquivo por command
  config/
    paths.ts              ~/.<bin>/ e variáveis de ambiente
    settings.ts           settings.json e SETTINGS_SCHEMA
    crypto.ts             AES-256-GCM e master key
    credentials.ts        cofre cifrado
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
template/                 stubs de command, screen, tool e banco SQLite opcional
.agents/skills/           skills do framework Termfy, instaladas via npx skills
scripts/                  build, init e checks
tests/                    bun test
```

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
- `cli/`, `mcp/` e `tui/` importam de `app/` e `config/`. `mcp/` e `tui/`
  podem reutilizar funções de `cli/commands/*` que coletam dados (como
  `aboutData`), nunca o contrário.
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
no executável; o `docs/` entra como texto; o `package.json` entra como JSON.
