# 0003 Ciclo da spec

Status: done

## Goal

O agente e a pessoa movem o trabalho pelo método sem editar Markdown à mão:
capturar no inbox, abrir backlog e spec, transicionar estados, registrar
effort, descobrir a próxima tarefa e marcar itens. Pelo MCP, o agente altera
o estado dentro das regras.

## Behavior

`inbox capture`, `inbox process <captura> --spec <ids>`, `backlog start`,
`specs new`, `specs transition <spec> <estado>`, `specs effort <spec>
<nota> --reason <texto>`, `specs migrate`, `specs research <spec>`,
`specs change <spec>`, `tasks next <spec> [--all]`, `tasks check <spec>
<tarefa> [item] [--undo]` e `tasks delivery <spec>`. Transição fora da
ordem do método sai com 2 e explica os destinos aceitos.

## Design

`src/cli/commands/lifecycle.ts`: definições de script (`capturar_inbox`,
`iniciar_backlog`, `iniciar_spec`, `load_research`, `analyze_change`,
`next_task`, `render_delivery`) e commands nativos sobre
`src/domain/lifecycle.ts` e `inbox.ts`. `tasks check` é nativo e altera o
checkbox da tarefa ou do item no `spec.md`.

## Surface

- Adiciona os commands `inbox capture`, `inbox process`, `backlog start`,
  `specs new`, `specs transition`, `specs effort`, `specs migrate`,
  `specs research`, `specs change`, `tasks next`, `tasks check` e
  `tasks delivery`.
- Adiciona as tools `inbox_capture`, `inbox_process`, `backlog_start`,
  `spec_create`, `spec_transition`, `spec_effort`, `specs_migrate`,
  `spec_research`, `spec_change_analyze`, `task_next`, `task_check` e
  `delivery_render`.

## Tasks

- [x] Definições de script do ciclo `#termfy-cli`
- [x] Commands nativos `transition`, `effort`, `migrate`, `inbox process`, `tasks check` `#termfy-cli`
- [x] Tools MCP `#termfy-mcp`
- [x] Testes `#termfy-test`

## Tests

- [x] `specs transition 0001 defined` move a pasta e atualiza o Status
- [x] `tasks check` marca e desmarca o checkbox
- [x] `inbox capture --json` cria o arquivo em `specs/inbox/`

## Notes
