---
name: specsfy-release-cli
description: Publicar uma versão estável do Specsfy a partir do monorepo promovaweb/specsfy, mantendo VERSION, CLI, skills, especialistas, ebook, changelog, tag e GitHub Release com o mesmo SemVer. Use quando a pessoa pedir para lançar ou retomar uma versão do Specsfy. Não use para pré-releases nem para atualizar somente um projeto consumidor.
---

# Publicar o Specsfy

Executar na raiz do checkout oficial. Exigir versão `X.Y.Z`, notas
confirmadas e autorização explícita antes de push.

`VERSION` na raiz é a fonte única. Skills e especialistas recebem a versão da
tag do monorepo, sem arquivos de versão próprios. Hub e website não participam
desse número.

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
  --json tagName,targetCommitish,body
```

Exigir remoto `https://github.com/promovaweb/specsfy`, branch `main`, acesso ao
mesmo repositório, worktree limpa, `HEAD` igual a `origin/main` e ausência da
tag e do release para publicação nova.

Em estado parcial, não recriar commit, tag ou versão. Compare tag, commit,
artefatos e seção do changelog e retome apenas a etapa ausente.

## 2. Preparar versão

```bash
python3 -B \
  cli/.agents/skills/specsfy-release-cli/scripts/release_changelog.py prepare \
  --cli cli --version X.Y.Z --date YYYY-MM-DD \
  --notes-file /caminho/notas.md
cd cli
npm install --package-lock-only --ignore-scripts
npm ci
npm run build:executable
npm run typecheck
npm test
npm run build
node dist/main.js --help
./bin/specsfy --version
npm publish --dry-run
cd ..
make ebook
make verify-ebook
make verify-version
python3 -B \
  cli/.agents/skills/specsfy-release-cli/scripts/release_changelog.py extract \
  --changelog cli/CHANGELOG.md --version X.Y.Z \
  --output /caminho/release-notes.md
```

Exigir `X.Y.Z` em `VERSION`, `package.json`, `src/version.ts`,
`package-lock.json`, CLI instalado, binário, `bin/specsfy.build.json`, ebook e
`ebook/build.json`. O changelog promove as notas sob
`## [X.Y.Z] - YYYY-MM-DD`.

## 3. Revisar e versionar

Incluir na entrega:

- `VERSION`;
- `cli/CHANGELOG.md`;
- `cli/package.json`;
- `cli/package-lock.json`;
- `cli/src/version.ts`;
- `cli/bin/specsfy`;
- `cli/bin/specsfy.build.json`.
- `ebook/build.json` e os artefatos da edição atual;
- documentação, skills e especialistas alterados pela entrega.

Apresentar notas e diff. Após confirmação:

```bash
make verify-version
git add VERSION cli/CHANGELOG.md cli/package.json cli/package-lock.json \
  cli/src/version.ts \
  cli/bin/specsfy cli/bin/specsfy.build.json
git commit -m "chore(release): vX.Y.Z"
git tag -a vX.Y.Z -m "Specsfy CLI vX.Y.Z"
git rev-parse HEAD
git rev-list -n 1 vX.Y.Z
```

Os hashes devem ser idênticos. A tag pertence ao monorepo.

## 4. Publicar e comprovar

```bash
git push --atomic origin main vX.Y.Z
gh run watch --repo promovaweb/specsfy \
  "$(gh run list --repo promovaweb/specsfy --branch vX.Y.Z \
    --workflow Specsfy --limit 1 --json databaseId --jq '.[0].databaseId')"
gh release create vX.Y.Z \
  --repo promovaweb/specsfy --verify-tag \
  --title "Specsfy CLI vX.Y.Z" \
  --notes-file /caminho/release-notes.md
gh release view vX.Y.Z --repo promovaweb/specsfy \
  --json url,tagName,targetCommitish,body
gh release view vX.Y.Z --repo promovaweb/specsfy \
  --json body > /caminho/release-publicado.json
python3 -B \
  cli/.agents/skills/specsfy-release-cli/scripts/release_changelog.py verify \
  --changelog cli/CHANGELOG.md --version X.Y.Z \
  --release-json /caminho/release-publicado.json
git ls-remote origin "refs/tags/vX.Y.Z^{}"
gh run list --repo promovaweb/specsfy --branch vX.Y.Z --workflow Specsfy
```

Confirmar tag remota, CI e equivalência exata das notas. Em falha, preservar o
estado e reclassificar. O job da tag publica `@promovaweb/specsfy` no npm. A
proveniência é incluída quando o repositório estiver público. Nunca crie uma tag
compensatória.
