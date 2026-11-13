# 0006 Testes do projeto

Status: in_progress

## Goal

Rodar a suíte do projeto pelo Specsfy com a proteção de banco de teste
separado, no terminal, no CI, na TUI e pelo agente.

## Behavior

`test [--project]` detecta o runner (Pest em Laravel), exige `.env.testing`
com banco separado e transmite a saída; sai com o código do runner. Sem a
comprovação do banco, sai com 10 antes de iniciar o PHP.

## Design

`src/cli/commands/testing.ts` sobre `src/domain/project-testing.ts`; tool
`project_test` em `src/mcp/tools/testing.ts`.

## Surface

- Adiciona o command `test`: Run the project test suite; `data`
  `{ runner, command, exitCode, durationMs, summary }`; exit code 10.
- Adiciona a tool `project_test` (efeito `execute`).

## Tasks

- [x] Command `test` `#termfy-cli`
- [x] Tool `project_test` `#termfy-mcp`
- [x] Testes `#termfy-test`

## Tests

- [x] Projeto sem runner conhecido sai com 6

## Notes
