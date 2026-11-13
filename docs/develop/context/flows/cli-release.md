# Release do Specsfy CLI

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | publicação de versões estáveis do CLI |
| Autoridade | ordem e identidade das notas |

## Papel

Preservar uma versão e uma fonte de notas entre pacote npm, commit, tag e
release.

## Como usar

Leia antes de publicar ou retomar uma versão estável do CLI.

## Gatilho

O fluxo começa após autorização explícita para lançar `X.Y.Z`. O monorepo deve
estar na `main`, limpo, sincronizado e sem a tag ou release alvo.

## Sequência

```text
notas confirmadas
       │
       ▼
release-cli ──promove──► cli/CHANGELOG.md
       │                 + versão + lock + binário
       ├──valida──► testes do CLI + regressão aplicável
       ├──publica─► commit ─► tag vX.Y.Z ─► CI ─► GitHub Release
       │                                            ▲
       │                                            └─ mesma seção
       └──máquina local─► npm pack na tag ─► npm publish ─► pacote npm
```

- A skill local do módulo `cli/` governa a sequência.
- `cli/` contém changelog, versão, lock e executável.
- A raiz Git contém commit e tag.
- GitHub hospeda o remoto, CI e release.
- O registro npm hospeda `@promovaweb/specsfy`. O CI não publica no npm; o
  pacote sai pela máquina local, com `npm pack` no commit da tag e
  `npm publish <tgz> --access public`, depois que a GitHub Release existe.
- A seção `## [X.Y.Z] - YYYY-MM-DD` origina o corpo do release.
- O GitHub Release usa a mesma seção do changelog, sem regeneração.

O push de `main` e da tag é atômico. Uma retomada reutiliza o estado válido e
não cria outra versão.

## Evidência

- `cli/.agents/skills/specsfy-release-cli/SKILL.md`.
- `cli/.agents/skills/specsfy-release-cli/scripts/release-changelog.mjs`.
- `tests/release-changelog.test.mjs`, `tests/release-documentation.test.mjs`
  e `tests/release-bdd.test.mjs`.
- testes e artefatos em `cli/`.

## Atualize quando

Atualize este fluxo quando mudar origem das notas, versão, ordem de publicação
ou ownership de qualquer efeito.

## Não use para

- autorizar publicação.
- lançar pré-release.
- substituir testes e manifests.

## Fonte da verdade e precedência

As notas confirmadas governam o conteúdo. `cli/CHANGELOG.md` governa a seção
publicada. GitHub comprova tag, CI e release, enquanto o registro npm comprova
o pacote distribuído.
