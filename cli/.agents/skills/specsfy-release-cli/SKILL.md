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

```bash
bun \
  cli/.agents/skills/specsfy-release-cli/scripts/release-changelog.mjs prepare \
  --cli cli --version X.Y.Z --date YYYY-MM-DD \
  --notes-file /caminho/notas.md
cd cli
bun install --frozen-lockfile
bun run launcher
bun run typecheck
bun test
bun run build
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
`./dist/specsfy --version`, ebook e `ebook/build.json`. O changelog promove as
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
- `ebook/build.json` e os artefatos da edição atual;
- documentação, skills e especialistas alterados pela entrega.

Apresentar notas e diff. Após confirmação:

```bash
make verify-version
git add VERSION cli/CHANGELOG.md cli/package.json cli/npm/package.json cli/bin/specsfy
git commit -m "chore(release): vX.Y.Z"
git tag -a vX.Y.Z -m "Specsfy CLI vX.Y.Z"
git rev-parse HEAD
git rev-list -n 1 vX.Y.Z
```

Os hashes devem ser idênticos. A tag pertence ao monorepo.

## 4. Publicar e comprovar

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
