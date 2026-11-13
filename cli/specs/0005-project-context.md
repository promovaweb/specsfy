# 0005 Contexto do projeto

Status: done

## Goal

Os arquivos de contexto (`.specsfy/Project.md`, `Stack.md`, `Rules.md`,
`Database.md`, `Interface.md`) são criados e mantidos por comandos, e não por
scripts copiados dentro das skills.

## Behavior

`context setup`, `context inspect`, `context interface`, `context monitor
[--check]`, `context stack`, `context rule`, `context database`,
`context data` e `context usage <spec>` repassam os parâmetros aos scripts
de `specsfy-setup`, `specsfy-aux-*`, `specsfy-data-discovery` e
`specsfy-progress/analyze_context`.

## Design

`src/cli/commands/context.ts` com definições de script; tools em
`src/mcp/tools/context.ts` via `registerScriptTools`.

## Surface

- Adiciona os commands `context setup|inspect|interface|monitor|stack|rule|database|data|usage`.
- Adiciona as tools `context_setup`, `context_inspect`, `context_interface`,
  `context_monitor`, `context_stack`, `context_rule`, `context_database`,
  `context_data` e `context_usage`.

## Tasks

- [x] Definições de script `#termfy-cli`
- [x] Tools MCP `#termfy-mcp`
- [x] Testes `#termfy-test`

## Tests

- [x] `context inspect --json` no `example/` identifica Laravel

## Notes
