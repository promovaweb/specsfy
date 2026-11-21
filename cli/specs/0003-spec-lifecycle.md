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

Transições e migrações também atualizam a célula `Spec promovida` no backlog.
Um caminho de texto é relativo ao projeto. Um link Markdown é relativo ao
arquivo que o contém. A formatação da célula permanece e a próxima
transição corrige vínculos antigos, mesmo quando a spec fica no mesmo estado.

## Design

`src/cli/commands/lifecycle.ts`: definições de script (`capturar_inbox`,
`iniciar_backlog`, `iniciar_spec`, `load_research`, `analyze_change`,
`next_task`, `render_delivery`) e commands nativos sobre
`src/domain/lifecycle.ts` e `inbox.ts`. `tasks check` é nativo e altera o
checkbox da tarefa ou do item no `spec.md`.
O domínio lê os itens com `scanBacklogs` e compara os caminhos resolvidos
com as localizações conhecidas do mesmo identificador. Um lock por projeto
serializa transições e migrações, desde a busca pelo seletor até a atualização
dos vínculos e das projeções de milestones.

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
- [x] Atualizar os vínculos do backlog durante a transição. `#termfy-cli`

## Tests

- [x] `specs transition 0001 defined` move a pasta e atualiza o Status
- [x] `tasks check` marca e desmarca o checkbox
- [x] `inbox capture --json` cria o arquivo em `specs/inbox/`
- [x] Transição atualiza vínculos com e sem crases e preserva as outras specs.
- [x] Transições concorrentes serializam as escritas e uma nova transição
  corrige vínculos antigos após uma interrupção.
- [x] Dois processos CLI usando o mesmo número de spec concluem a operação.
  Um move a spec e o outro encontra o estado de destino. O `Status` e o
  vínculo do backlog apontam para o estado final.
- [x] Transição e migração reescrevem vínculos Markdown e caminhos
  equivalentes preservando o formato da célula.

## Notes

- 2026-11-20: teste focal confirmou a restauração após falha de gravação no
  backlog. `bun run validate` passou com 348 testes aprovados.
- 2026-11-21: a versão anterior reproduziu `NOT_FOUND` na 11ª execução sob
  carga. Com a busca dentro da trava, o teste passou 200 vezes seguidas
  sob a mesma carga.
