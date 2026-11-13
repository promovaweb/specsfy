# 0001 Leitura do projeto

Status: in_progress

## Goal

Pessoas, agentes e o CI precisam saber o estado de um projeto Specsfy sem
abrir arquivo por arquivo: specs por estado, gates, tarefas, backlog e inbox.
Esta spec cria o núcleo de leitura que todas as outras reutilizam. Alterar
specs fica para a 0003.

## Behavior

`specsfy status` acha a raiz subindo a partir da pasta atual (ou usa
`--project`) e imprime progresso, estados, backlog e inbox; `--json` devolve
`{ root, summary, states, specs[], backlog[], inbox[] }`. `specs list
[--state]`, `specs show <spec> [--content]`, `progress [--spec] [--watch]`,
`backlog list` e `inbox list [--all]` leem a mesma estrutura. `<spec>` aceita
número (`1`, `0001`), nome da pasta, slug sem número ou caminho. Spec
inexistente sai com 6; identificador ambíguo sai com 2. `scripts list` e
`scripts run <nome> -- <args>` dão acesso a qualquer script embutido do
framework.

## Design

`src/core/project.ts` resolve a raiz (`findProjectRoot`, `resolveProject`) e
o identificador da spec (`resolveSpecPath`). `src/core/overview.ts` monta o
modelo de leitura sobre `src/domain/progress.ts`, `backlog.ts` e `inbox.ts`,
portados do CLI anterior. `src/engine/runner.ts` grava a árvore `skills/`
embutida (`skills.gen.ts`, gerado por `scripts/embed-skills.ts`) em
`~/.specsfy/runtime/<versão>-<digest>/skills/` e executa o script com o
próprio binário (`BUN_BE_BUN=1`), sem Node.js. `src/engine/script-command.ts`
transforma uma definição de script em command e tool MCP.

## Surface

- Adiciona o command `status`: Show the project overview; `--project <dir>`;
  `data` `{ root, summary, states, specs[], backlog[], inbox[] }`.
- Adiciona o command `specs list`: List specs; `--state <state>`,
  `--project <dir>`; `data` `{ count, specs[] }`.
- Adiciona o command `specs show`: Show one spec; `<spec>`, `--content`,
  `--project <dir>`; `data` spec com gates e tarefas; exit code 6.
- Adiciona o command `progress`: Report progress; `--spec <spec>`,
  `--watch`, `--project <dir>`; `data` igual a `status`; exit codes 6, 130.
- Adiciona o command `backlog list`: List backlog items; `data`
  `{ count, backlog[] }`.
- Adiciona o command `inbox list`: List captures; `--all`; `data`
  `{ count, inbox[] }`.
- Adiciona o command `scripts list` e `scripts run`: embedded framework
  scripts; `data` `{ script, exitCode, ok, result, stderr }`; exit code 6.
- Adiciona as tools `project_status`, `specs_list`, `spec_get`,
  `backlog_list`, `inbox_list`, `scripts_list` (efeito `read`).
- Adiciona o exit code 10 `GATE_FAILED`.
- Adiciona a setting `tui.watchInterval` (`number`, `0.75`).

## Tasks

- [x] Portar os módulos de domínio do CLI anterior para `src/domain/` com os testes em `bun:test` `#termfy-cli`
- [x] Motor de scripts embutidos e gerador `embed-skills` `#termfy-cli`
- [x] `findProjectRoot`, `resolveProject` e `resolveSpecPath` `#termfy-cli`
- [x] Commands `status`, `specs list|show`, `progress`, `backlog list`, `inbox list`, `scripts list|run` `#termfy-cli`
- [x] Tools MCP de leitura `#termfy-mcp`
- [ ] Testes do núcleo (`tests/core/`) `#termfy-test`
- [ ] Documentação em `docs/cli.md` e `docs/mcp.md` `#termfy-docs`

## Tests

- [ ] `resolveSpecPath` aceita número, pasta, slug e caminho; ambíguo sai com 2
- [ ] `status --json` no projeto `example/` devolve 6 specs
- [ ] `findProjectRoot` sobe de uma subpasta até a raiz com `specs/`
- [ ] `scripts run specsfy-progress/progress` executa o script embutido

## Notes

- 2026-11-13: mensagens dos módulos de domínio seguem em português até a
  revisão de cada spec que os toca; o código novo é em inglês.
