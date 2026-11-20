# 0020 Example nas pastas de estado e release do Hub

Status: done

## Goal

Levar o projeto `example/` para as pastas de estado que o CLI já lê, para que a
TUI e o showcase mostrem a contagem por estado em vez de `Legacy`, e fechar a
publicação do Hub no mesmo script que publica o Specsfy, sem uma sequência
manual de gitlink, versão, changelog, tag e release.

## Behavior

O `example/` deixa o layout `specs/specs/`: as specs 0001 a 0005 ficam em
`specs/completed/` e a 0006-produtos em `specs/defined/`, todas com a mesma
pasta `<NNNN>-<slug>/spec.md`. A migração também cria `example/specs.md` com o
índice de sequência, estado e milestones.

Na TUI, a aba Specs agrupa o exemplo em `Defined · 1` e `Completed · 5`. O
cabeçalho `Legacy` só aparece quando existe spec no layout antigo
`specs/specs/`, como antes.

O script de release aceita duas formas de publicar o Hub da Promovaweb:
`node scripts/release.mjs X.Y.Z --publish --hub` publica o Specsfy e segue para
o Hub, e `node scripts/release.mjs X.Y.Z --hub` executa somente a etapa do Hub,
depois de uma publicação. A etapa do Hub avança para o `origin/main` sem tocar
nos arquivos não commitados de outras pessoas e recusa um Hub com arquivos
preparados (staged). Depois, sobe o patch do `VERSION` do Hub, escreve a
entrada do `CHANGELOG.md` do Hub com os itens da seção `## [X.Y.Z]` de
`cli/CHANGELOG.md` (ou com o texto de `--hub-note "..."`), commita apenas
`VERSION`, `CHANGELOG.md` e o gitlink `specsfy`, cria a tag, faz push e cria a
GitHub Release do Hub.

## Design

`example/specs/` foi migrado com `specsfy specs migrate`, que usa `migrateSpecs`
de `src/domain/lifecycle.ts` para mover cada pasta pelo campo `Status` e
atualizar os caminhos citados nas specs. O command chama `syncMilestones`
depois da migração, e é isso que grava o `example/specs.md`. A leitura de
`progress.ts` e o agrupamento de `src/tui/screens/specs.ts` não mudaram: com as
pastas de estado, `folderLabel` devolve `Defined` e `Completed` e o cabeçalho
recebe a contagem.

`scripts/release.mjs` lê `--hub` e `--hub-note` junto de `--publish`. A função
`releaseHub()` confere o submódulo `specsfy` em `git submodule status`, recusa
`git diff --cached --name-only` não vazio, faz `git fetch` e
`git merge --ff-only origin/main` no Hub, calcula o próximo patch do `VERSION`,
monta a nota com `changelogSummary()` (a primeira frase de cada item da seção
`## [X.Y.Z]`) ou com o texto de `--hub-note`, prepara somente `VERSION`,
`CHANGELOG.md` e `specsfy`, commita, cria a tag `vX.Y.Z` do Hub, faz push e
chama `gh release create`.

No Hub, `scripts/conferir-site-specsfy.mjs` (`npm run site:specsfy:check`)
confere a documentação publicada depois do deploy; ele é do Hub e fica aqui
como trabalho relacionado, não como parte desta spec.

## Surface

- `example/specs/completed/` com as specs 0001 a 0005 e
  `example/specs/defined/` com a 0006-produtos.
- `example/specs.md` criado pela migração.
- Aba Specs da TUI com `Defined · 1` e `Completed · 5` no exemplo.
- `scripts/release.mjs` com `--hub` e `--hub-note`.

Nenhum command, option ou tool novo no binário.

## Tasks

- [x] `example/specs/` migrado para `completed/` e `defined/` `#termfy-cli`
- [x] `example/specs.md` gerado pela migração `#termfy-cli`
- [x] TUI e showcase com `Defined · 1` e `Completed · 5` no exemplo `#termfy-tui`
- [x] `--hub` e `--hub-note` em `scripts/release.mjs` com a etapa do Hub `#termfy-release`
- [x] `cli/docs/release.md` com o uso de `--hub` `#termfy-docs`
- [x] Skill `specsfy-release-cli` com o caminho padrão do Hub `#termfy-docs`
- [x] `CLISPEC.md` com a spec 0020 no índice e nas Notes `#termfy-docs`

## Tests

- [x] `tests/domain/lifecycle.test.ts`: `migrateSpecs` move as pastas legadas
  para o estado do `Status` e reescreve o caminho de `research/`
- [x] `tests/tui/screens.test.ts`: a aba Specs mostra `Defined · 1` e
  `Completed · 5` no projeto de demonstração
- [x] `showcase:check` cobre os quadros do exemplo migrado na TUI

## Notes

- 2026-11-20: pedido do Luiz para fazer todas as melhorias levantadas.
