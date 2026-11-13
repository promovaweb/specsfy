# 0008 Documentação do projeto

Status: in_progress

## Goal

Gerar e conferir a documentação do projeto a partir das specs, como faz a
skill `specsfy-documentator`.

## Behavior

`docs build [--check]` repassa ao `build_documentation.mjs`; `--check` sai
com 10 quando a documentação está desatualizada.

## Design

`src/cli/commands/project-docs.ts` com uma definição de script.

## Surface

- Adiciona o command `docs build`; exit code 10 com `--check`.
- Adiciona a tool `docs_build`.

## Tasks

- [x] Command e tool `#termfy-cli`
- [x] Teste `#termfy-test`

## Tests

- [x] `docs build --check` em projeto atualizado sai com 0

## Notes
