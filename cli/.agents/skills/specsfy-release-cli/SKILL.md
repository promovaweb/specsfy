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
gera o `SHA256SUMS`, anexa tudo ao GitHub Release da tag e só depois publica
o wrapper no npm, que baixa o binário dessa release.

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
- `ebook/build.json` e os artefatos da edição atual;
- documentação, skills e especialistas alterados pela entrega.

Apresentar notas e diff. Após confirmação:

```bash
make verify-version
git add VERSION cli/CHANGELOG.md cli/package.json cli/npm/package.json
git commit -m "chore(release): vX.Y.Z"
git tag -a vX.Y.Z -m "Specsfy CLI vX.Y.Z"
git rev-parse HEAD
git rev-list -n 1 vX.Y.Z
```

Os hashes devem ser idênticos. A tag pertence ao monorepo.

## 4. Publicar e comprovar

Crie o GitHub Release logo depois do push, com a seção exata do changelog. O
workflow `CLI Release` anexa os binários ao release existente; se ele chegar
antes, cria o release com a mesma seção, e o passo abaixo vira
`gh release edit vX.Y.Z --notes-file /caminho/release-notes.md`.

```bash
git push --atomic origin main vX.Y.Z
gh release create vX.Y.Z \
  --repo promovaweb/specsfy --verify-tag \
  --title "Specsfy CLI vX.Y.Z" \
  --notes-file /caminho/release-notes.md
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
npm view @promovaweb/specsfy@X.Y.Z version
```

Confirmar tag remota, os seis assets (cinco binários e `SHA256SUMS`), CI e
equivalência exata das notas. Em falha, preservar o estado e reclassificar.
O job `npm` do workflow publica `@promovaweb/specsfy` a partir de `cli/npm/`
depois que os binários estão no release. A proveniência é incluída quando o
repositório estiver público. Nunca crie uma tag compensatória.
