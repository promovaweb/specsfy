# 0016 Consolidação das skills do framework

Status: done

## Goal

Reduzir as skills do framework de 19 para 11, juntando as do mesmo assunto,
para o agente escolher entre menos descrições e a pessoa decorar menos nomes.

## Behavior

As 11 skills ficam em duas categorias. Nove são base: `specsfy-01-inbox`,
`specsfy-02-backlog`, `specsfy-03-specify`, `specsfy-04-validate`,
`specsfy-05-tasks`, `specsfy-06-implement`, `specsfy-update-spec`,
`specsfy-interviewer` e `specsfy-milestones`. As outras duas são
`specsfy-setup`, com o contexto do projeto, e `specsfy-documentator`, com a
documentação.

`specsfy-setup` ganha os modos `stack`, `rules`, `database` e
`data-discovery`, que antes eram `specsfy-aux-stack`, `specsfy-aux-rules`,
`specsfy-aux-database` e `specsfy-data-discovery`. `specsfy-06-implement`
reúne `specsfy-06-tdd-bdd`, no modo `tests`, e `specsfy-07-implement`, no modo
`implement`. `specsfy-milestones` reúne
`specsfy-mvp-milestone-interviewer`, no modo `mvp`,
`specsfy-roadmap-milestone-interviewer`, no modo `roadmap`, e
`specsfy-milestone-governor`, no modo `sync`. `specsfy-progress` sai, porque
o command `specsfy progress` e a tool MCP `project_status` fazem o mesmo.
`specsfy-update-spec` e `specsfy-interviewer` ficam separadas porque são
intenções diferentes: aplicar uma mudança já decidida, sem perguntas, e
conversar para descobrir o que mudar. Quem roda `specsfy update` migra
sozinho, porque o inventário registra os nomes antigos em `renamed` e
`retired`.

## Design

Nas skills com modos, o `SKILL.md` identifica o modo pelo pedido e o texto de
cada modo fica em `references/<modo>.md`. Os scripts mudam de pasta com as
skills: os scripts da `specsfy-progress` foram para `specsfy-05-tasks`
(`progress.mjs` e `parse_tasks.mjs`) e para `specsfy-setup`
(`analyze_context.mjs`). Os commands do CLI e as tools MCP mantêm os nomes.
`bun run example:sync` migra o `example/` pelo próprio instalador.

## Surface

- Altera os caminhos dos scripts usados pelos commands `context`, `gates`,
  `milestones import-mvp`, `tasks` e `scripts run`.
- Altera a screen `skills`: grupos `Framework · 9` e `Context · 1`.

Nenhum command, option ou tool novo.

## Tasks

- [x] `specsfy-milestones` com os modos `mvp`, `roadmap` e `sync` `#termfy-config`
- [x] `specsfy-06-implement` com os modos `tests` e `implement` `#termfy-config`
- [x] Aposentar `specsfy-progress` `#termfy-config`
- [x] `specsfy-setup` com os modos `stack`, `rules`, `database` e
  `data-discovery` `#termfy-config`
- [x] Inventário com `renamed` e `retired` `#termfy-cli`
- [x] `example/` migrado `#termfy-cli`
- [x] Documentação e páginas de skill `#termfy-docs`

## Tests

- [x] Suítes da raiz, das skills e do `example/` verdes
- [x] Suíte do CLI verde
- [x] Migração real do `example/` pelo instalador

## Notes

- 2026-11-20: pedido do Luiz para reduzir o número de skills agrupando
  conteúdo. `specsfy-update-spec` e `specsfy-interviewer` ficaram separadas a
  pedido dele. A versão 0.33.0 entregou a consolidação.
