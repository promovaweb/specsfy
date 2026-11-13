# Specsfy

`specsfy`: Install the Specsfy framework, run the spec lifecycle and its gates, and serve them to agents over MCP.

## Purpose

Quem conduz um projeto com o Specsfy, aluno ou dev da Promovaweb, trabalha
com um agente de IA que cria e move specs em Markdown por `specs/<estado>/`.
As regras do método vivem em scripts `.mjs` copiados dentro de cada skill
(`verify_evidence`, `check_database_safety`, `inspect_project` e outros), que
quebram em casos de borda, como Windows, layouts de raiz e migrations
antigas, e que cada agente chama de um jeito. O CLI anterior instalava as
skills e mostrava o progresso, mas não participava do ciclo da spec.

O `specsfy` é a ferramenta única do método: instala e atualiza o framework,
lê e altera o estado das specs dentro das regras, roda os gates de
evidência, banco e testes, e expõe essas operações ao agente pelo MCP e ao
CI pelo `--json`.

## Audiences

| Público | Modo | Necessidade |
| --- | --- | --- |
| dev ou aluno no terminal | TUI e CLI texto | acompanhar specs e progresso ao vivo, instalar e atualizar skills, rodar testes |
| agente de IA (Claude Code, Codex, OpenCode) | MCP | ler spec, tarefas e gates, transicionar estados, registrar inbox e effort, rodar gates sem chamar scripts `.mjs` |
| CI | CLI `--json` | barrar o PR quando uma spec não tem evidência ou deixa gate pendente, publicar o progresso |

## Out of scope

- Escrever o conteúdo das specs: redação, entrevista e decisões de produto
  continuam com o agente e as skills; o binário cria esqueletos, move estados
  e valida.
- Publicar, fazer deploy ou mexer em servidores: o especialista
  `specsfy-specialist-deploy` mantém o próprio fluxo.
- Integração direta com ClickUp, GitHub Issues ou outros gestores; o
  binário só aponta o handoff para o ClickUpfy quando a skill existe.
- Rodar migrations ou comandos que alteram o banco de dados do projeto.
- Banco local próprio: o estado fica nos arquivos do projeto.

## Surface

### Commands

| Command | Função | Options | `data` no `--json` | Exit codes | Credenciais |
| --- | --- | --- | --- | --- | --- |
| `tui` | Open the terminal interface (Overview, Specs, Backlog, Gates, Tests, Skills and About). Requires a TTY. | `--tab <tab>`, `--project <dir>` | ver `--skill reference` | 8, 6 | n/a |
| `status` | Show the project overview: specs by state, progress, gates, backlog and inbox. | `--project <dir>` | ver `--skill reference` | n/a | n/a |
| `specs list` | List specs with state, gates and task progress. | `--state <state>`, `--project <dir>` | ver `--skill reference` | n/a | n/a |
| `specs show` | Show one spec: metadata, gates, tasks and, with --content, the Markdown. | `<spec>`, `--content`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `specs new` | Create a spec in specs/draft/ with the next number, from the installed template. | `--title <title>`, `--slug <slug>`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `specs transition` | Move a spec to another state folder and mirror its Status; only adjacent states of the method are accepted. | `<spec>`, `<state>`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `specs effort` | Record the estimated effort of a spec (integer 1 to 10) with a rationale. | `<spec>`, `<effort>`, `--reason <text>`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `specs migrate` | Move specs from the legacy layouts (`specs/<slug>/`, `specs/specs/<slug>/`) to the state folders, by their Status. | `--project <dir>` | ver `--skill reference` | n/a | n/a |
| `specs research` | List and load the local research indexed by a spec and check its claims. | `<spec>`, `--emit-content`, `--max-bytes <bytes>`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `specs change` | Analyze the impact between the spec in Git and the worktree version: changed IDs, sections and gates to reopen. | `<spec>`, `--base <rev>`, `--mode <value>`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `tasks next` | Show the next ready task of a spec, with its next checklist item; --all lists every ready task. | `<spec>`, `--all`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `tasks check` | Mark (or with --undo unmark) a task or one item of its checklist in spec.md. | `<spec>`, `<task>`, `[item]`, `--undo`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `tasks delivery` | Render the delivery summary of a spec: gates, delivered IDs, tasks, evidence and rollback. | `<spec>`, `--format <value>`, `--preview`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `inbox list` | List captures in specs/inbox/; --all includes processed ones. | `--all`, `--project <dir>` | ver `--skill reference` | n/a | n/a |
| `inbox capture` | Record a capture in specs/inbox/ from the original text, without interaction. | `--input <text>`, `--title <title>`, `--slug <slug>`, `--summary <text>`, `--problem <text>`, `--people <text>`, `--value <text>`, `--signals <text>`, `--data <text>`, `--risks <text>`, `--directions <text>`, `--review <text>`, `--session <text>`, `--turn <text>`, `--sources <text>`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `inbox process` | Move a capture out of the active inbox queue once specs with the Definition Gate passed cover it. | `<capture>`, `--spec <ids>`, `--project <dir>` | ver `--skill reference` | 6, 10 | n/a |
| `backlog list` | List backlog items in specs/backlog/. | `--project <dir>` | ver `--skill reference` | n/a | n/a |
| `backlog start` | Create a numbered backlog item in specs/backlog/ without promoting a spec. | `--title <title>`, `--idea <text>`, `--problem <text>`, `--person <text>`, `--result <text>`, `--context <text>`, `--slug <slug>`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `progress` | Report progress of every spec or of one spec; --watch keeps refreshing on changes. | `--spec <spec>`, `--watch`, `--project <dir>` | ver `--skill reference` | 6, 130 | n/a |
| `gate spec` | Validate the structure of a spec (Specsfy/2.0 contract). | `<spec>`, `--allow-draft`, `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `gate tasks` | Validate the tasks in section 14 of a spec. | `<spec>`, `--allow-draft`, `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `gate interface` | Validate the interface phase of the tasks of a spec with a human interface. | `<spec>`, `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `gate trace` | Check traceability between the spec IDs and the test markers. | `<spec>`, `--kinds <kinds>`, `--full-chain`, `--minimum-tests <n>`, `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `gate acceptance` | Verify that every acceptance criterion (AC) of a spec has a passing result. | `<spec>`, `--attestation <file>`, `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `gate evidence` | Verify the material evidence of the tasks of a spec (Evidence Contract 1). | `<spec>`, `--delivery`, `--task <id>`, `--attestation <file>`, `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `gate findings` | Validate the product, architecture and security findings recorded in a spec. | `<spec>`, `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `gate database` | Check that tests use a separate database and that a command cannot wipe data. | `--command <command>`, `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `verify` | Run the whole Specsfy policy on the project: the CI entry point. | `--boundary <boundary>`, `--attestation <file>`, `--timeout-seconds <seconds>`, `--max-output-bytes <bytes>`, `--self-test`, `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `test` | Run the project test suite. | `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `context setup` | Create the minimum project context (PROJECT.md, .specsfy/STACK.md, RULES.md, DATABASE.md...) without overwriting existing files. | `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `context inspect` | Summarize the relevant sources of the project by group (instructions, manifests, routes, persistence, tests...) without changing files. | `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `context interface` | Summarize the interface stack (frameworks, routing, styling, components, forms, tests) and the current routes and components. | `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `context monitor` | Point out the context documents that need review for the changed files (Git diff or --paths). | `--check`, `--acknowledge-project-no-change`, `--acknowledge-rules-no-change`, `--paths <paths>`, `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `context stack` | Update the detected stack block in .specsfy/STACK.md, keeping human rows and notes. | `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `context rule` | Append a confirmed rule to a section of .specsfy/RULES.md without changing the rest of the document. | `--section <title>`, `--rule <text>`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `context database` | Update the detected structures block in .specsfy/DATABASE.md from migrations, SQL and Prisma schemas. | `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `context data` | Record information confirmed in conversation in the data map of .specsfy/DATABASE.md, one row per information name. | `--name <text>`, `--purpose <text>`, `--store <text>`, `--format <text>`, `--links <text>`, `--access <text>`, `--lifecycle <text>`, `--sources <text>`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `context usage` | Estimate the context size of a spec by section, or ingest measured token usage from a JSON file. | `<spec>`, `--usage-json <file>`, `--compare <file>`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `milestones sync` | Rebuild the progress of specs/milestones/ and the index in specs.md from the specs and backlog. | `--project <dir>` | ver `--skill reference` | n/a | n/a |
| `milestones import-mvp` | Import the development requirements of MVP.md as backlog items, Draft specs and milestone M01. | `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `docs build` | Rebuild the project documentation in docs/ and .specsfy/PACKAGES.md; --check only verifies it is up to date. | `--check`, `--project <dir>` | ver `--skill reference` | 10, 6 | n/a |
| `install` | Install the Specsfy framework in the project: base skills, .specsfy/ and the managed blocks of AGENTS.md and CLAUDE.md. | `--detected`, `--specialist <name>`, `--force`, `--project <dir>` | ver `--skill reference` | 4, 5, 6, 7 | `github.token` |
| `update` | Update the installed Specsfy skills, framework files and specialists that have no local changes. | `--force`, `--project <dir>` | ver `--skill reference` | 5, 6, 7 | `github.token` |
| `upgrade` | Upgrade the specsfy binary to the latest GitHub Release; --check only reports the versions. | `--check` | ver `--skill reference` | 5, 7 | `github.token` |
| `skills list` | List the specialist catalog of the framework repository. | n/a | ver `--skill reference` | 4, 5 | `github.token` |
| `skills detect` | Detect the specialists that match the project's files and dependencies. | `--project <dir>` | ver `--skill reference` | 4, 5, 6 | `github.token` |
| `skills install` | Install specialists from the catalog, with their requirements. | `<names>`, `--force`, `--project <dir>` | ver `--skill reference` | 4, 5, 6, 7 | `github.token` |
| `skills remove` | Remove Specsfy skills from the project; skills outside the Specsfy namespace are refused. | `<names>`, `--force`, `--project <dir>` | ver `--skill reference` | 6, 7 | `github.token` |
| `skills update` | Update every installed Specsfy skill; same as the top-level update. | `--force`, `--project <dir>` | ver `--skill reference` | 5, 6, 7 | `github.token` |
| `scripts list` | List the framework scripts embedded in the binary. | n/a | ver `--skill reference` | n/a | n/a |
| `scripts run` | Run an embedded framework script by name, passing the remaining arguments unchanged. | `<script>`, `[args]`, `--project <dir>` | ver `--skill reference` | 6 | n/a |
| `about` | identidade, runtime e créditos | n/a | ver `--skill reference` | n/a | n/a |
| `config list` | List every key with its effective value (file merged with defaults). | n/a | ver `--skill reference` | 3, 7, 6 | n/a |
| `config get` | Show the value of a key. | `<key>` | ver `--skill reference` | 3, 7, 6 | n/a |
| `config set` | Write a value to settings.json, converting the type according to the schema. | `<key>`, `<value>` | ver `--skill reference` | 3, 7, 6 | n/a |
| `config unset` | Remove a key from the file. The key falls back to its default, if any. | `<key>` | ver `--skill reference` | 3, 7, 6 | n/a |
| `config path` | Print the data directory and file paths. | n/a | ver `--skill reference` | n/a | n/a |
| `config schema` | List the known keys with type, default and description. | n/a | ver `--skill reference` | n/a | n/a |
| `credentials set` | Save or replace a credential. The value is read without echo or from stdin. | `<name>`, `--stdin` | ver `--skill reference` | 4, 7, 130 | n/a |
| `credentials get` | Show a masked credential. Use --reveal for the full value. | `<name>`, `--reveal` | ver `--skill reference` | 4, 7, 130 | n/a |
| `credentials list` | List saved names. Never shows values. | n/a | ver `--skill reference` | 4, 7, 130 | n/a |
| `credentials remove` | Remove a credential from the vault. | `<name>` | ver `--skill reference` | 4, 7, 130 | n/a |
| `credentials status` | Show file, master key source and number of credentials. | n/a | ver `--skill reference` | n/a | n/a |
| `credentials clear` | Delete credentials.json entirely. Keeps master.key. Asks for confirmation on a terminal. | `--yes` | ver `--skill reference` | 4, 7, 130 | n/a |
| `credentials rotate-key` | Re-encrypt the existing vault with a new master key and write master.key with mode 0600. | `--from-env` | ver `--skill reference` | 4, 7, 130 | n/a |
| `mcp` | Start the MCP server (stdio) with tools, resources and prompts for agents. | `--list` | ver `--skill reference` | 9 | n/a |
| `skill` | Print the embedded documentation, whole or by topic. Same effect as --skill. | `[topic]` | ver `--skill reference` | n/a | n/a |
| `doctor` | Check runtime, terminal, settings, key source and vault readability without changing files; --project adds the project checks. | `--project <dir>` | ver `--skill reference` | 3, 6 | `github.token` (só a origem, com `--project`) |
| `completion` | Print a registry-generated completion script for bash, zsh or fish. | `<shell>` | ver `--skill reference` | n/a | n/a |

Commands de projeto que repassam a um script do framework devolvem `data` `{ project, script, exitCode, ok, result, stderr }`, com o JSON do script em `result`. Os aliases ocultos `transition`, `effort` e `migrate` chamam os subcommands de `specs`.

### Screens

| Screen | Função | Teclas |
| --- | --- | --- |
| `overview` | projeto, resumo de progresso, estados, backlog, inbox, próximos passos e MCP | `r` reload |
| `specs` | specs por estado com gates, tarefas e o Markdown da selecionada | `↑/↓` spec, `PgUp/PgDn` scroll, `g` gates, `r` reload |
| `backlog` | backlog e inbox com preview | `↑/↓` item, `PgUp/PgDn` scroll, `r` reload |
| `gates` | roda os gates da spec selecionada e mostra o resultado de cada um | `↑/↓` spec, `Enter` run gates, `PgUp/PgDn` scroll |
| `tests` | roda a suíte do projeto com a proteção de banco e mostra resumo e saída | `Enter` run tests, `PgUp/PgDn` scroll |
| `skills` | skills instaladas e disponíveis, com instalar, remover e atualizar confirmados | `↑/↓` skill, `i` install, `x` remove, `u` update all, `c` catalog |
| `about` | About | globais |

### MCP

| Tipo | Nome | Função | Efeito |
| --- | --- | --- | --- |
| tool | `about` | Version, executable, runtime, platform and credits of the binary. | `read` |
| tool | `exit_codes` | Process exit-code table. | `read` |
| tool | `skill` | Embedded documentation, whole or by topic. | `read` |
| tool | `config_list` | Every settings.json key with its effective value. | `read` |
| tool | `config_get` | Value of a settings.json key. | `read` |
| tool | `credentials_status` | Saved names and master key source, without values. | `read` |
| tool | `doctor` | Diagnose runtime, terminal and configuration health; with project, also Git, skills CLI, lock, GitHub token and release check. Returns checks and ok without credential values or file changes. | `read` |
| tool | `project_status` | Project overview: specs by state, progress, gates, backlog and inbox. | `read` |
| tool | `specs_list` | List specs with state, gates and task progress. | `read` |
| tool | `spec_get` | One spec with metadata, gates, tasks and optionally the Markdown. | `read` |
| tool | `backlog_list` | Backlog items in specs/backlog/. | `read` |
| tool | `inbox_list` | Captures in specs/inbox/. | `read` |
| tool | `scripts_list` | Framework scripts embedded in the binary. | `read` |
| tool | `inbox_capture` | Record a capture in specs/inbox/ from the original text, without interaction. | `write` |
| tool | `backlog_start` | Create a numbered backlog item in specs/backlog/ without promoting a spec. | `write` |
| tool | `spec_create` | Create a spec in specs/draft/ with the next number, from the installed template. | `write` |
| tool | `spec_research` | List and load the local research indexed by a spec and check its claims. | `read` |
| tool | `spec_change_analyze` | Analyze the impact between the spec in Git and the worktree version: changed IDs, sections and gates to reopen. | `read` |
| tool | `task_next` | Show the next ready task of a spec, with its next checklist item; --all lists every ready task. | `read` |
| tool | `delivery_render` | Render the delivery summary of a spec: gates, delivered IDs, tasks, evidence and rollback. | `read` |
| tool | `inbox_process` | Move a capture to specs/inbox/processed/ once specs with the Definition Gate passed cover it. | `write` |
| tool | `spec_transition` | Move a spec to an adjacent state folder and mirror its Status. | `write` |
| tool | `spec_effort` | Record the effort (1 to 10) of a spec with a rationale. | `write` |
| tool | `specs_migrate` | Move legacy specs to the state folders by their Status. | `write` |
| tool | `task_check` | Mark or unmark a task, or an item of its checklist, in spec.md. | `read` |
| tool | `gate_spec` | Validate the structure of a spec (Specsfy/2.0 contract). | `read` |
| tool | `gate_tasks` | Validate the tasks in section 14 of a spec. | `read` |
| tool | `gate_interface` | Validate the interface phase of the tasks of a spec with a human interface. | `read` |
| tool | `gate_trace` | Check traceability between the spec IDs and the test markers. | `read` |
| tool | `gate_acceptance` | Verify that every acceptance criterion (AC) of a spec has a passing result. | `read` |
| tool | `gate_evidence` | Verify the material evidence of the tasks of a spec (Evidence Contract 1). | `read` |
| tool | `gate_findings` | Validate the product, architecture and security findings recorded in a spec. | `read` |
| tool | `gate_database` | Check that tests use a separate database and that a command cannot wipe data. | `read` |
| tool | `verify` | Run the whole Specsfy policy on the project (CI entry point). | `read` |
| tool | `context_setup` | Create the minimum project context (PROJECT.md, .specsfy/STACK.md, RULES.md, DATABASE.md...) without overwriting existing files. | `write` |
| tool | `context_inspect` | Summarize the relevant sources of the project by group (instructions, manifests, routes, persistence, tests...) without changing files. | `read` |
| tool | `context_interface` | Summarize the interface stack (frameworks, routing, styling, components, forms, tests) and the current routes and components. | `read` |
| tool | `context_monitor` | Point out the context documents that need review for the changed files (Git diff or --paths). | `write` |
| tool | `context_stack` | Update the detected stack block in .specsfy/STACK.md, keeping human rows and notes. | `write` |
| tool | `context_rule` | Append a confirmed rule to a section of .specsfy/RULES.md without changing the rest of the document. | `write` |
| tool | `context_database` | Update the detected structures block in .specsfy/DATABASE.md from migrations, SQL and Prisma schemas. | `write` |
| tool | `context_data` | Record information confirmed in conversation in the data map of .specsfy/DATABASE.md, one row per information name. | `write` |
| tool | `context_usage` | Estimate the context size of a spec by section, or ingest measured token usage from a JSON file. | `read` |
| tool | `project_test` | Run the project test suite with the separate test database guard. | `execute` |
| tool | `milestones_sync` | Rebuild milestone progress and the specs.md index from the specs. | `write` |
| tool | `milestones_import_mvp` | Import the development requirements of MVP.md as backlog items, Draft specs and milestone M01. | `write` |
| tool | `docs_build` | Rebuild the project documentation in docs/ and .specsfy/PACKAGES.md; --check only verifies it is up to date. | `write` |
| tool | `skills_list` | List the specialist catalog of the framework repository. | `read` |
| tool | `skills_detect` | Detect the specialists that match the project. | `read` |
| tool | `framework_install` | Install the Specsfy framework in the project. | `write` |
| tool | `framework_update` | Update the installed Specsfy skills. | `write` |
| tool | `skills_install` | Install specialists with their requirements. | `write` |
| tool | `skills_remove` | Remove Specsfy skills from the project. | `write` |
| tool | `update_check` | Compare the running version with the latest release. | `read` |
| resource | `specsfy://about` | Binary identity and runtime as JSON. | `read` |
| resource | `specsfy://exit-codes` | Exit-code table as JSON. | `read` |
| resource | `specsfy://skill` | Full documentation in Markdown. | `read` |
| resource | `specsfy://skill/{topic}` | One documentation section. Topics: cli, tui, mcp, config, exit-codes, reference. | `read` |
| prompt | `operate` | Guides the agent to read the documentation and run a task through the CLI. | n/a |

### Settings

| Key | Tipo | Padrão | Função |
| --- | --- | --- | --- |
| `output.format` | `enum` (`text`, `json`) | `text` | Default CLI output format when --json is not given. |
| `output.colors` | `boolean` | `true` | Use ANSI colors in text output. NO_COLOR=1 always disables them. |
| `tui.initialTab` | `enum` (`overview`, `specs`, `backlog`, `gates`, `tests`, `skills`, `about`) | `overview` | Tab opened when the TUI starts. |
| `tui.theme` | `enum` (`night`, `day`) | `night` | TUI palette. `night` is the default modern unix palette. |
| `tui.watchInterval` | `number` | `0.75` | Seconds between checks for changed spec files in the TUI and in progress --watch. |
| `catalog.repository` | `string` | `https://github.com/promovaweb/specsfy` | Git repository the framework skills are installed from. |
| `skills.agents` | `string` | `universal` | Comma-separated agent targets passed to npx skills add (universal, claude-code, codex, opencode). |
| `update.check` | `boolean` | `true` | Check once a day for a newer Specsfy release and mention it in the TUI and in doctor. |
| `gate.timeoutSeconds` | `number` | `300` | Time limit for each check run by verify. |
| `telemetry.enabled` | `boolean` | `false` | Reserved for derived projects. The skeleton sends nothing. |

### Credentials

| Nome | Usada por | Como obter |
| --- | --- | --- |
| `github.token` | `install`, `update`, `upgrade`, `skills ...`, `doctor --project` | token pessoal do GitHub com leitura do repositório; alternativas: `GH_TOKEN`, `GITHUB_TOKEN`, `gh auth token` |

## Specs

| ID | Título | Status |
| --- | --- | --- |
| 0001 | Leitura do projeto | done |
| 0002 | Instalar e atualizar o framework | done |
| 0003 | Ciclo da spec | done |
| 0004 | Gates e verificação | done |
| 0005 | Contexto do projeto | done |
| 0006 | Testes do projeto | done |
| 0007 | Milestones | done |
| 0008 | Documentação do projeto | done |
| 0009 | TUI do projeto | done |
| 0010 | Skills chamam o binário | done |
| 0011 | Distribuição | done |

## Notes

- 2026-11-13: CLI reescrito sobre o Termfy Starter Kit 0.9.2, na branch
  `cli-termfy`, no mesmo caminho `cli/` do CLI anterior (Node 22). A
  versão continua a do framework (0.26.2).
- 2026-11-13: os quatro ganhos fazem parte do escopo: MCP para agentes, CI
  e automação, TUI mais rica e substituição dos scripts `.mjs` das skills.
- 2026-11-13: distribuição por binário compilado (`bun build --compile`)
  por plataforma, em `get.specsfy.dev` e GitHub Releases. O npm
  `@promovaweb/specsfy` vira um wrapper que baixa o binário.
- 2026-11-13: pelo MCP, o agente altera estado (transition, effort,
  inbox, tarefas) desde a primeira fase, sempre dentro das regras do
  método.
- 2026-11-13: blocos 3 a 5 fechados pelo agente com as opções
  recomendadas, por pedido do Luiz para seguir sem novas perguntas: ordem das
  specs como no índice; scripts dos especialistas (`scaffold.mjs`,
  `semver.mjs`) ficam nas skills; as skills passam a indicar o binário e
  mantêm os `.mjs` como alternativa.
- 2026-11-13: o binário embute a árvore `skills/` e executa os scripts com
  o próprio runtime (`BUN_BE_BUN=1`), sem Node.js na máquina.
- 2026-11-13: dados e integrações: API do GitHub (credencial
  `github.token`, com `GH_TOKEN`, `GITHUB_TOKEN` e `gh auth token` como
  alternativas), `npx skills` para materializar skills e os arquivos do
  projeto. Nenhum banco local.
- 2026-11-13: spec 0001 (Leitura do projeto) closed.
- 2026-11-13: spec 0002 (Instalar e atualizar o framework) closed.
- 2026-11-13: spec 0003 (Ciclo da spec) closed.
- 2026-11-13: spec 0004 (Gates e verificação) closed.
- 2026-11-13: spec 0005 (Contexto do projeto) closed.
- 2026-11-13: spec 0006 (Testes do projeto) closed.
- 2026-11-13: spec 0007 (Milestones) closed.
- 2026-11-13: spec 0008 (Documentação do projeto) closed.
- 2026-11-13: spec 0009 (TUI do projeto) closed.
- 2026-11-13: spec 0010 (Skills chamam o binário) closed.
- 2026-11-13: spec 0011 (Distribuição) closed.
