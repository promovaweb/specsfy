# Stubs

Modelos para estender o binário. Cada arquivo compila dentro do repositório
(os imports apontam para `src/`), então eles servem de teste de contrato:
quando a API interna muda, o `bun run typecheck` denuncia o stub quebrado.

| Stub | Copiar para | Registrar em |
| --- | --- | --- |
| `command/example.ts` | `src/cli/commands/<name>.ts` | `src/cli/commands.ts` |
| `screen/example.ts` | `src/tui/screens/<id>.ts` | `src/tui/screens/index.ts` |
| `tool/example.ts` | `src/mcp/tools/<name>.ts` | `registerAll` em `src/mcp/server.ts` |
| `db/database.ts` | `src/db/database.ts` | nenhum: commands, tools e screens chamam `openDatabase()` |
| `db/migrations/index.ts` | `src/db/migrations/index.ts` | registro das migrations, em ordem |
| `db/migrations/0001-create-notes.ts` | `src/db/migrations/NNNN-<name>.ts` | `src/db/migrations/index.ts` |
| `db/command.ts` | `src/cli/commands/db.ts` | `src/cli/commands.ts` (`db status` e `db migrate`) |
| `db/repository.ts` | `src/db/<resource>.ts` | nenhum: funções importadas por quem usa a tabela |
| `db/example-test.ts` | `tests/<resource>.test.ts` | nenhum |

Depois de copiar, troque os imports `../../src/` por caminhos relativos ao
novo local (`../../app/`, `../components.ts`, `../server.ts`).

O esqueleto não tem banco de dados. Os stubs de `db/` só entram quando a
pessoa pede armazenamento e uma spec descreve as tabelas; a skill
`termfy-database` conduz a cópia. O banco fica em `~/.<bin>/data.db`, usa
`bun:sqlite` (sem dependência nova) e muda de schema só por migrations: uma
por arquivo, numeradas a partir de 1, nunca editadas depois de publicadas,
com a versão aplicada em `PRAGMA user_version`. As migrations são módulos
importados estaticamente, então o build as embute no executável; o binário
não lê SQL do disco. Ele recusa um banco mais novo que ele e, antes de
aplicar migrations num banco que já tem schema, copia o arquivo para
`data.db.v<versão>.bak`. As tabelas ficam descritas na spec que
as criou e na superfície do `CLISPEC.md`.
