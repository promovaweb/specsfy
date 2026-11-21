# Release do Specsfy CLI

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | publicação de versões estáveis do CLI |
| Autoridade | ordem e identidade das notas |

## Papel

Preservar a versão e a origem das notas entre commit, tag, GitHub Release e
pacote npm. Quando a publicação roda no Hub, sincronizar também o website e
os gitlinks do Hub, que têm versões próprias.

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
       └──máquina local─► npm publish ─► pacote npm
                                             │
                                             ▼ (no Hub, por padrão)
               sincronização e release do website ─► atualização e release do Hub
```

- A skill local do módulo `cli/` governa a sequência.
- `cli/` contém changelog, versão, lock e o launcher `bin/specsfy`; o CI
  compila os cinco executáveis da GitHub Release.
- A raiz Git contém commit e tag.
- GitHub hospeda o remoto, CI e release.
- O registro npm hospeda `@promovaweb/specsfy`. Após a GitHub Release, o
  script publica o wrapper a partir de `cli/npm/` na máquina local. O
  procedimento manual usa `npm pack` no commit da tag e
  `npm publish <tgz> --access public`.
- A seção `## [X.Y.Z] - YYYY-MM-DD` origina o corpo do release.
- O GitHub Release usa a mesma seção do changelog, sem regeneração.
- Na preparação, o build conserva em `ebook/` a edição de `VERSION` e a maior
  edição SemVer anterior. Cada edição tem PDF e EPUB.
- Após a publicação no npm, o script sincroniza a documentação em um worktree
  do website. Após `media:publicar`, executa `media:podar-ebook-specsfy` para
  aplicar a retenção nos downloads locais, no manifesto de mídia e no R2.
  O script registra o destino das páginas removidas, publica a release do
  website quando há mudanças versionadas e confere a documentação em produção.
- Em seguida, o script atualiza o gitlink do Specsfy no Hub e, quando houve
  publicação do site, o gitlink do website. Ele incrementa o patch do Hub e
  publica a release correspondente. O
  [guia operacional](../../../../cli/docs/release.md#script-de-release)
  descreve as opções para executar cada etapa.

O script faz o push de `main` e da tag do Specsfy em comandos separados. O
procedimento manual usa push atômico. Uma retomada reutiliza o estado válido
e não cria outra versão.

## Evidência

- `cli/.agents/skills/specsfy-release-cli/SKILL.md`.
- `cli/.agents/skills/specsfy-release-cli/scripts/release-changelog.mjs`.
- [Script de release do monorepo](../../../../scripts/release.mjs).
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
o pacote distribuído. A publicação do website e os gitlinks do Hub registram
as versões que chegaram às etapas seguintes do fluxo.
