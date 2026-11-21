# Release

A versão do CLI acompanha a versão do framework Specsfy. O `VERSION` na raiz
do monorepo é a fonte única: o `cli/package.json`, as skills e o ebook usam o
mesmo SemVer. Uma publicação do CLI sai com versão, changelog, tag e GitHub
Release.

## Antes de publicar

O script da seção seguinte faz os passos 1, 2 e 4; a lista fica para conferir o
que ele deixou e para a publicação feita sem o script.

1. Confira o `VERSION` da raiz. O CLI não abre uma numeração própria.
2. Atualize `version` em `cli/package.json` para o mesmo valor.
3. Registre a mudança em `cli/CHANGELOG.md`, no formato Keep a Changelog,
   dentro da seção da versão que está sendo publicada.
4. Rode a validação do CLI:

   ```bash
   cd cli
   bun run validate
   ```

   O encadeamento cobre `embed:check`, `launcher:check`, `typecheck`,
   `bun test`, `skills:check`, `opencli:check`, `showcase:check`,
   `docs:check`, `build` e `smoke`. O `smoke` roda o binário compilado
   `dist/specsfy` sem rede (`--version`,
   `--skill tui`, `mcp --list`, `doctor --json`, `install` num projeto
   temporário a partir do próprio repositório e `update --check`) e pega
   falha que só aparece no binário compilado, antes da tag. Se a TUI mudou
   desde a última release, rode `bun run showcase -- --all` para que os
   prints de `docs/user/assets/showcase/` mostrem a versão nova. Para rodar o
   `smoke` sozinho, use `bun run build` e depois `bun run smoke`.
5. Confira que `src/engine/skills.gen.ts` está atualizado. Depois de mudar
   `../skills/`, rode `bun run embed`.
6. Revise o diff e o `git status --short`. Mudanças que já existiam ficam
   preservadas.

## Script de release

`scripts/release.mjs`, na raiz do monorepo, executa os dois passos. O mesmo
comando atende por `npm run release -- X.Y.Z`:

```bash
node scripts/release.mjs X.Y.Z
node scripts/release.mjs X.Y.Z --publish
node scripts/release.mjs X.Y.Z --publish --no-site
node scripts/release.mjs X.Y.Z --publish --no-hub
node scripts/release.mjs X.Y.Z --site
node scripts/release.mjs X.Y.Z --hub
```

O primeiro comando prepara e não commita. Ele grava `X.Y.Z` em `VERSION`,
`cli/package.json` e `cli/npm/package.json`, regenera as skills embutidas, o
lançador, o `opencli` e todo o showcase, recompila o ebook, confere a versão e
roda os testes da raiz, a validação das skills e o `validate` do CLI. Depois
dele, revise o diff e escreva `## [X.Y.Z]` em `cli/CHANGELOG.md`.

O segundo comando publica a versão do Specsfy. Quando o monorepo está
registrado como submódulo do Hub, `--publish` também sincroniza as páginas de
`/docs/specsfy/` e publica a atualização do Hub.

Ele commita o que estiver no working tree como `chore(release): vX.Y.Z`, cria a
tag, faz push de `main` e da tag em comandos separados e espera os workflows,
incluindo `CLI Release`. O script reexecuta uma vez os jobs que falharem,
confere se a GitHub Release tem seis arquivos e publica o wrapper npm. Em
seguida, roda as etapas habilitadas do site e do Hub, nessa ordem. Ele recusa
a execução sem a seção do changelog, com a tag já existente ou com o
`VERSION` diferente de `X.Y.Z`.

O trabalho de funcionalidade se commita antes do `--publish`: tudo o que
sobrar no working tree entra no commit de release.

As opções controlam as etapas seguintes. `--no-site` e `--no-hub` pulam a
etapa correspondente; `--site` e `--hub` executam somente aquela etapa, depois
de uma publicação.

A etapa do site roda `npm run sync:docs:specsfy` no Hub. Se a documentação já
estiver sincronizada, a etapa termina. Quando há mudanças, o script leva os
arquivos listados pelo comando para um worktree limpo do website, baseado em
`origin/main`. O script restaura do `HEAD` os arquivos versionados que a
sincronização listou no checkout do website. Depois publica a mídia no R2 com
`npm run media:publicar`, escreve uma sitespec, sobe o patch do website e
registra a mudança no changelog. O commit inclui as páginas, o manifesto do
ebook, o manifesto de mídia, a sitespec, a versão, o changelog e as
configurações de rotas. Por fim, o script cria a tag, faz push, cria a GitHub
Release do website e roda `npm run site:specsfy:check` em produção.

Se a sincronização remover uma página, o script registra automaticamente o
destino da rota no worktree do website.

- Para um especialista absorvido, registra um 301 em
  `src/config/redirects.mjs` apontando para a seção do modo que o absorveu. O
  vínculo vem de `modes[].absorbs` em `specialists/catalog.json` e a âncora
  deriva do título do modo.
- Para um especialista renomeado em `skills/inventory.json` sem âncora de
  absorção, registra um 301 para a página com o novo nome.
- Para uma rota retirada sem destino, registra um 410 em
  `src/config/gone.mjs`.

O registro de rotas removidas só cria entradas para rotas sem 301 ou 410.
Na etapa de sincronização, o script também atualiza os 301 existentes de
especialistas absorvidos para a âncora do modo correspondente.

A etapa do Hub roda depois da do site. O script avança para o `origin/main` sem
tocar nos arquivos não commitados de outras pessoas e recusa um repositório com
arquivos preparados (staged). Em seguida, sobe o patch do `VERSION` do Hub,
escreve a entrada do `CHANGELOG.md` do Hub com os itens da seção `## [X.Y.Z]` de
`cli/CHANGELOG.md` (ou com o texto de `--hub-note "..."`), aponta o gitlink do
`specsfy` para a versão publicada e o gitlink do `website` para o commit que a
etapa do site publicou, commita apenas `VERSION`, `CHANGELOG.md` e esses
gitlinks, cria a tag, faz push e cria a GitHub Release do Hub.

O registro na lista Website do ClickUp continua manual, pelo MCP `website`,
depois que a etapa do site termina.

## Tag e GitHub Release

O CLI fica no monorepo `promovaweb/specsfy`, e a tag pertence ao monorepo.
Na publicação manual, a criação da tag e o push seguem esta sequência.

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
