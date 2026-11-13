# 0011 Distribuição

Status: done

## Goal

Instalar o Specsfy sem Node.js nem Bun: binário compilado por plataforma em
`get.specsfy.dev` e nos GitHub Releases, com o npm `@promovaweb/specsfy` como
wrapper e `upgrade` trocando o próprio binário.

## Behavior

`specsfy upgrade [--check]` consulta a última release e substitui o
executável em uso. `npm install -g @promovaweb/specsfy` instala um wrapper
que baixa o binário da plataforma na primeira execução. O script
`scripts/install-cli.sh` baixa o binário certo.

## Design

`scripts/build.ts --all` gera os cinco alvos; workflow na raiz do repositório
publica os binários na release `vX.Y.Z`; `cli/npm/` guarda o wrapper.
`src/cli/commands/framework.ts` ganha `upgrade` sobre `src/domain/updater.ts`
adaptado ao binário.

## Surface

- Adiciona o command `upgrade`: Upgrade the specsfy binary; `--check`;
  `data` `{ current, latest, upgraded }`; exit code 5.
- Adiciona a tool `update_check` (efeito `network`).
- Adiciona a setting `update.check`.

## Tasks

- [x] `upgrade` para o binário `#termfy-release`
- [x] Workflow de release com os cinco alvos `#termfy-release`
- [x] Wrapper npm `#termfy-release`
- [x] `install-cli.sh` `#termfy-release`

## Tests

- [x] `upgrade --check --json` com fetch simulado devolve `latest`

## Notes
