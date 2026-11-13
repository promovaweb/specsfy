# Release

A versão do CLI acompanha a versão do framework Specsfy. O `VERSION` na raiz
do monorepo é a fonte única: o `cli/package.json`, as skills e o ebook usam o
mesmo SemVer. Uma publicação do CLI sai com versão, changelog, tag e GitHub
Release.

## Antes de publicar

1. Confira o `VERSION` da raiz. O CLI não abre uma numeração própria.
2. Atualize `version` em `cli/package.json` para o mesmo valor.
3. Registre a mudança em `cli/CHANGELOG.md`, no formato Keep a Changelog,
   dentro da seção da versão que está sendo publicada.
4. Rode a validação do CLI:

   ```bash
   cd cli
   bun run validate
   ```

   O encadeamento cobre `embed:check`, `typecheck`, `bun test`, `skills:check`,
   `opencli:check`, `docs:check` e `build`.
5. Confira que `src/engine/skills.gen.ts` está atualizado. Depois de mudar
   `../skills/`, rode `bun run embed`.
6. Revise o diff e o `git status --short`. Mudanças que já existiam ficam
   preservadas.

## Tag e GitHub Release

O CLI fica no monorepo `promovaweb/specsfy`, e a tag pertence ao monorepo:

```bash
git tag -a vX.Y.Z -m "Specsfy CLI vX.Y.Z"
git push --atomic origin main vX.Y.Z
```

A tag dispara o workflow `cli-release.yml`, que:

1. compila os cinco executáveis: linux-x64, linux-arm64, darwin-x64,
   darwin-arm64 e windows-x64;
2. gera `SHA256SUMS`;
3. publica a GitHub Release `vX.Y.Z` com os cinco binários, os checksums e as
   notas do `CHANGELOG.md`.

Uma tag publicada nunca é movida. Correção posterior recebe nova versão.

A versão aparece em `{{bin}} --version`, em `{{bin}} about`, em
`~/.specsfy/runtime/<version>-<digest>/skills/` e no payload de atestação do
`verify`.

## npm

O pacote `@promovaweb/specsfy` é o wrapper de instalação. Ele baixa o binário
da plataforma na primeira execução e não contém uma segunda implementação:

```bash
npm install --global @promovaweb/specsfy
{{bin}} --version
{{bin}} upgrade --check
```

O `upgrade` consulta a última release e troca o executável em uso. Com
`--check`, apenas informa a versão publicada.

O workflow de release não publica no npm. Depois que a GitHub Release
`vX.Y.Z` existe com os binários, quem mantém o projeto publica o wrapper pela
máquina local, logado como `contatopromovaweb`:

```bash
git switch --detach vX.Y.Z
cd cli/npm
SPECSFY_CACHE_DIR="$(mktemp -d)" node bin/specsfy.cjs --version
npm pack
npm publish promovaweb-specsfy-X.Y.Z.tgz --access public
npm view @promovaweb/specsfy version license
```

O passo a passo completo está na skill
[`specsfy-release-cli`](../.agents/skills/specsfy-release-cli/SKILL.md).

## Build local

O OpenTUI carrega um pacote nativo por plataforma. `bun run build` marca
como externos os que não estão instalados, então funciona depois de um
`bun install` comum. O build cruzado precisa dos pacotes de todos os alvos,
instalados a partir do lockfile.

```bash
cd cli
bun run build          # dist/<bin> para a plataforma atual
bun install --frozen-lockfile --os="*" --cpu="*" --libc="*"  # pacotes nativos de todos os alvos
bun run build:all      # dist/<bin>-<platform> para todas
./dist/<bin> --version
```

O binário compilado não depende de Bun nem de Node.js na máquina que o
executa. Ele carrega `docs/`, `package.json` e a árvore de `skills/` embutida
em `src/engine/skills.gen.ts`.
