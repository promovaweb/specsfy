---
name: specsfy-release-cli
description: Publicar uma versão estável do Specsfy a partir do monorepo promovaweb/specsfy, mantendo VERSION, o binário Bun do CLI, o wrapper npm, skills, especialistas, ebook, changelog, tag e GitHub Release com o mesmo SemVer. Use quando a pessoa pedir para lançar ou retomar uma versão do Specsfy. Não use para pré-releases nem para atualizar somente um projeto consumidor.
---

# Publicar o Specsfy

Executar na raiz do checkout oficial. Exigir versão `X.Y.Z`, notas
confirmadas e autorização explícita antes de push.

`VERSION` na raiz é a fonte única. `cli/package.json` repete a versão e o
build a embute no binário; `cli/npm/package.json` repete a versão do wrapper
`@promovaweb/specsfy`. Skills e especialistas recebem a versão da tag do
monorepo, sem arquivos de versão próprios. Hub e website não participam desse
número.

A publicação padrão é `node scripts/release.mjs X.Y.Z` seguido de
`node scripts/release.mjs X.Y.Z --publish`. Dentro do Hub, esse `--publish`
sincroniza o CLI, as skills, o ebook, a documentação do repositório, as páginas
de `/docs/specsfy/` do site com o ebook e as imagens no R2, e os gitlinks e a
release do Hub. Não pergunte se o site deve ser atualizado: a etapa do site faz
parte da publicação, junto com a do Hub. O registro na lista Website do ClickUp
é feito em seguida, pelo MCP `website`.

Os binários não são versionados no Git. O workflow `CLI Release`
(`.github/workflows/cli-release.yml`) compila os cinco alvos de
`cli/scripts/build.ts --all` (`specsfy-linux-x64`, `specsfy-linux-arm64`,
`specsfy-darwin-x64`, `specsfy-darwin-arm64`, `specsfy-windows-x64.exe`),
gera o `SHA256SUMS` e cria o GitHub Release da tag com a seção do changelog e
os assets já anexados, depois de o workflow `Specsfy` passar. O workflow não
publica no npm e não usa `NPM_TOKEN`. O wrapper `@promovaweb/specsfy`, que
baixa o binário dessa release, é publicado só pela máquina local de quem
mantém o projeto, logado no npm como `contatopromovaweb`, depois que a GitHub
Release existe.

## 1. Classificar o estado

```bash
git remote get-url origin
git branch --show-current
gh auth status
npm whoami
git fetch origin main --tags
git status --porcelain
git rev-parse HEAD
git rev-parse origin/main
git rev-parse --verify refs/tags/vX.Y.Z
gh release view vX.Y.Z --repo promovaweb/specsfy \
  --json tagName,targetCommitish,body,assets
```

Exigir remoto `https://github.com/promovaweb/specsfy`, branch `main`, acesso ao
mesmo repositório, worktree limpa, `HEAD` igual a `origin/main` e ausência da
tag e do release para publicação nova.

Em estado parcial, não recriar commit, tag ou versão. Compare tag, commit,
assets do release e seção do changelog e retome apenas a etapa ausente.

## 2. Preparar versão

O caminho padrão é o script da raiz, que não commita:

```bash
node scripts/release.mjs X.Y.Z
```

Ele grava `X.Y.Z` em `VERSION`, `cli/package.json` e `cli/npm/package.json`,
regenera as skills embutidas, o lançador, o `opencli` e todo o showcase,
recompila o ebook, confere a versão e roda os testes da raiz, a validação das
skills e o `validate` do CLI. O `validate` inclui o `smoke` do binário
compilado. Depois dele, revisar o diff e escrever `## [X.Y.Z]` em
`cli/CHANGELOG.md`. O script não escreve as notas: a extração abaixo continua
sendo o caminho para o release.

A sequência manual continua válida e serve de conferência do que o script
produziu:

```bash
bun \
  cli/.agents/skills/specsfy-release-cli/scripts/release-changelog.mjs prepare \
  --cli cli --version X.Y.Z --date YYYY-MM-DD \
  --notes-file /caminho/notas.md
cd cli
bun install --frozen-lockfile
bun run launcher
bun run opencli
bun test
bun run validate
./dist/specsfy --version
bun install --frozen-lockfile --os="*" --cpu="*" --libc="*"
bun run build:all
cd npm
npm publish --dry-run
cd ../..
npm --prefix .ebook ci --ignore-scripts
npm exec --prefix .ebook -- playwright install chromium
make ebook
make verify-ebook
make verify-version
bun \
  cli/.agents/skills/specsfy-release-cli/scripts/release-changelog.mjs extract \
  --changelog cli/CHANGELOG.md --version X.Y.Z \
  --output /caminho/release-notes.md
```

Exigir `X.Y.Z` em `VERSION`, `cli/package.json`, `cli/npm/package.json`,
`./dist/specsfy --version`, `cli/docs/opencli.json`, ebook e
`ebook/build.json`. `bun run validate` é o mesmo gate do job `binaries` do
workflow de release: inclui typecheck, testes, `opencli:check`,
`showcase:check`, `docs:check` e build. Quando a TUI mudou desde a última
release, rodar `bun run showcase -- --all` em `cli/` e incluir os prints de
`docs/user/assets/showcase/` e `docs/user/assets/cli/`. Um arquivo gerado com a versão antiga reprova a tag depois do push. O changelog promove as
notas sob `## [X.Y.Z] - YYYY-MM-DD`. Os executáveis de `cli/dist/` servem só
para conferência local e não entram no commit.

## 3. Revisar e versionar

Incluir na entrega:

- `VERSION`;
- `cli/CHANGELOG.md`;
- `cli/package.json`;
- `cli/npm/package.json`;
- `cli/bin/specsfy`, o lançador servido por `get.specsfy.dev`, regenerado por
  `bun run launcher` com a versão nova;
- `cli/docs/opencli.json`, regenerado por `bun run opencli` com a versão nova;
- `ebook/build.json` e os artefatos da edição atual;
- documentação, skills e especialistas alterados pela entrega.

Apresentar notas e diff. Com o `--publish` do passo 4, o commit, a tag e o
push saem do script; a lista acima continua sendo o que a release contém. Após
confirmação:

```bash
make verify-version
git add VERSION cli/CHANGELOG.md cli/package.json cli/npm/package.json \
  cli/bin/specsfy cli/docs/opencli.json
git commit -m "chore(release): vX.Y.Z"
git tag -a vX.Y.Z -m "Specsfy CLI vX.Y.Z"
git rev-parse HEAD
git rev-list -n 1 vX.Y.Z
```

Os hashes devem ser idênticos. A tag pertence ao monorepo.

## 4. Publicar e comprovar

O caminho padrão é o script da raiz, depois da seção `## [X.Y.Z]` escrita no
changelog e do diff revisado:

```bash
node scripts/release.mjs X.Y.Z --publish
```

Ele commita tudo o que estiver no working tree como `chore(release): vX.Y.Z`,
cria a tag, faz push de `main` e da tag, espera o workflow `CLI Release`, refaz
uma vez um job que falhar, confere os cinco executáveis com o `SHA256SUMS` e
publica o wrapper npm. Recusa a execução sem a seção do changelog, com a tag já
existente ou com o `VERSION` diferente de `X.Y.Z`. O trabalho de
funcionalidade se commita antes: tudo o que sobrar no working tree entra no
commit de release.

O caminho padrão para o site e o Hub é o próprio script. Depois do npm, o
`--publish` executa a etapa do site e depois a do Hub; `--no-site` e `--no-hub`
pulam a etapa correspondente, e `--site` ou `--hub`, sozinhos, executam somente
aquela etapa depois de uma publicação:

```bash
node scripts/release.mjs X.Y.Z --publish            # Specsfy, site e Hub
node scripts/release.mjs X.Y.Z --publish --no-site  # Specsfy e Hub
node scripts/release.mjs X.Y.Z --site               # somente o site
node scripts/release.mjs X.Y.Z --hub                # somente o Hub
```

A etapa do site roda `npm run sync:docs:specsfy` no Hub, leva os arquivos que o
comando escreveu em `website/` para um worktree limpo do `origin/main` do
website e devolve o checkout do website como estava, então o trabalho de outras
sessões continua intacto. Em seguida publica a mídia no R2 com
`npm run media:publicar`, escreve uma sitespec, sobe o patch do website com o
changelog e commita apenas esses caminhos, nunca o registro de imagens
responsivas. Por fim cria a tag, faz push, cria a GitHub Release do website e
roda `npm run site:specsfy:check` em produção. O registro na lista Website do
ClickUp continua manual, pelo MCP `website`, depois dessa etapa.

Na etapa do Hub, o script avança para o `origin/main` sem tocar nos arquivos não
commitados de outras pessoas e recusa um repositório com arquivos preparados
(staged). Em seguida, sobe o patch do `VERSION` do Hub, escreve a entrada do
`CHANGELOG.md` do Hub com os itens da seção `## [X.Y.Z]` de
`cli/CHANGELOG.md` (ou com o texto de `--hub-note "..."`), aponta o gitlink
`specsfy` para a versão publicada e o gitlink `website` para o commit que a
etapa do site publicou, commita apenas `VERSION`, `CHANGELOG.md` e esses
gitlinks, cria a tag, faz push e cria a GitHub Release do Hub. Conferir no Hub o
commit, a tag e a release depois da execução continua obrigatório.

As conferências abaixo continuam obrigatórias, inclusive depois de uma
publicação pelo script que parou no meio.

Não crie o GitHub Release à mão. O workflow `CLI Release` roda o workflow
`Specsfy`, compila os binários e cria o release com a seção do changelog e os
seis assets de uma vez (`gh release create vX.Y.Z --verify-tag` com os
binários), para que o release mais recente nunca fique sem
binários. Se a tag falhar antes disso, nada é publicado: corrija e publique uma
versão nova.

```bash
git push --atomic origin main vX.Y.Z
gh run watch --repo promovaweb/specsfy \
  "$(gh run list --repo promovaweb/specsfy --branch vX.Y.Z \
    --workflow "CLI Release" --limit 1 --json databaseId --jq '.[0].databaseId')"
gh release view vX.Y.Z --repo promovaweb/specsfy \
  --json url,tagName,targetCommitish,body,assets
gh release view vX.Y.Z --repo promovaweb/specsfy \
  --json body > /caminho/release-publicado.json
bun \
  cli/.agents/skills/specsfy-release-cli/scripts/release-changelog.mjs verify \
  --changelog cli/CHANGELOG.md --version X.Y.Z \
  --release-json /caminho/release-publicado.json
git ls-remote origin "refs/tags/vX.Y.Z^{}"
gh run list --repo promovaweb/specsfy --branch vX.Y.Z --workflow Specsfy
```

Confirmar tag remota, os seis assets (cinco binários e `SHA256SUMS`), CI e
equivalência exata das notas. Se as notas divergirem, corrija com
`gh release edit vX.Y.Z --notes-file /caminho/release-notes.md`. Em outra
falha, preservar o estado e reclassificar.
Nunca crie uma tag compensatória.

## 5. Publicar o wrapper no npm pela máquina local

Só depois de o `CLI Release` terminar verde e a GitHub Release ter os seis
assets, gere o tarball no commit da tag e publique pela máquina local:

```bash
npm whoami
git switch --detach vX.Y.Z
cd cli/npm
SPECSFY_CACHE_DIR="$(mktemp -d)" node bin/specsfy.cjs --version
npm pack
tar -tzf promovaweb-specsfy-X.Y.Z.tgz
sha256sum promovaweb-specsfy-X.Y.Z.tgz
npm publish promovaweb-specsfy-X.Y.Z.tgz --access public
npm view @promovaweb/specsfy version license
```

`npm whoami` deve responder `contatopromovaweb`. O teste com
`node bin/specsfy.cjs --version` baixa o binário da release, confere o
`SHA256SUMS` e deve imprimir `X.Y.Z`. O tarball contém só
`package/bin/specsfy.cjs`, `package/LICENSE`, `package/README.md` e
`package/package.json`, com `version` igual a `X.Y.Z`. O `npm view` pode
levar alguns minutos para mostrar a versão nova, com a licença
`AGPL-3.0-only`. A release só está completa quando o npm mostra a mesma
versão da tag. Apague o tarball depois da publicação; ele não entra no Git.
