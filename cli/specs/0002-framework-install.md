# 0002 Instalar e atualizar o framework

Status: done

## Goal

Quem adota o Specsfy instala as skills base, os templates e os especialistas
em um comando, e atualiza sem perder customizações locais. A paridade com o
CLI anterior (`install`, `update`, `skills ...`) é obrigatória.

## Behavior

`specsfy install [--detected] [--specialist <nome>] [--force]` publica as
skills base, `.specsfy/` e os blocos gerenciados de `AGENTS.md` e
`CLAUDE.md`, idempotente, preservando `.specsfy/templates/custom/`.
`specsfy update [--force]` atualiza o que está intacto. `skills list`,
`skills detect`, `skills install <nomes>`, `skills remove <nomes>` e
`skills update` gerenciam os especialistas. `doctor --project <dir>`
acrescenta as checagens do projeto (git, `npx skills`, lock, token do
GitHub). O token vem do cofre (`github.token`), de `GH_TOKEN`,
`GITHUB_TOKEN` ou de `gh auth token`, nesta ordem.

## Design

Commands em `src/cli/commands/framework.ts` sobre `src/domain/installer.ts`,
`catalog.ts`, `skill-lock.ts`, `prerequisites.ts` e `github.ts`. Tools em
`src/mcp/tools/framework.ts`. O `github.ts` passa a consultar
`getCredential("github.token")` antes das variáveis.

## Surface

- Adiciona o command `install`: Install the Specsfy framework in the
  project; `--detected`, `--specialist <name>`, `--force`, `--project <dir>`;
  `data` `{ installed[], skipped[], specialists[] }`; exit codes 4, 5, 7.
- Adiciona o command `update`: Update installed Specsfy skills; `--force`.
- Adiciona os commands `skills list|detect|install|remove|update`.
- Altera o command `doctor`: `--project <dir>` inclui as checagens do
  projeto.
- Adiciona as tools `skills_list`, `skills_detect`, `framework_install`,
  `framework_update`, `skills_install`, `skills_remove` (efeitos `read` e
  `write`).
- Adiciona a credencial `github.token`.
- Adiciona as settings `catalog.repository` e `skills.agents`.

## Tasks

- [x] Commands `install`, `update` e `skills ...` `#termfy-cli`
- [x] `doctor --project` `#termfy-cli`
- [x] Credencial `github.token` no `github.ts` `#termfy-config`
- [x] Tools MCP `#termfy-mcp`
- [x] Testes de command `#termfy-test`

## Tests

- [x] `install --json` em projeto vazio cria `.specsfy/` e o lock
- [x] Repetir `install` não altera arquivos
- [x] `skills remove` de skill externa ao Specsfy sai com 2

## Notes
