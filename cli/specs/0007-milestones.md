# 0007 Milestones

Status: done

## Goal

Sincronizar o progresso das milestones com as specs e importar o MVP
entrevistado, pelos três modos.

## Behavior

`milestones sync` atualiza `specs/milestones/` a partir das specs;
`milestones import-mvp` repassa os campos ao `importar_mvp.mjs`.

## Design

`src/cli/commands/milestones.ts` sobre `src/domain/milestones.ts` e a
definição de script do `importar_mvp`.

## Surface

- Adiciona os commands `milestones sync` e `milestones import-mvp`.
- Adiciona as tools `milestones_sync` e `milestones_import_mvp`.

## Tasks

- [x] Commands `#termfy-cli`
- [x] Tools MCP `#termfy-mcp`
- [x] Testes `#termfy-test`

## Tests

- [x] `milestones sync --json` devolve as milestones atualizadas

## Notes
