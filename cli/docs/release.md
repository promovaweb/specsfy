# Release

Toda alteração publicada sai com versão, changelog, tag e GitHub Release.

1. Atualize `version` em `package.json` (SemVer).
2. Registre a mudança em `CHANGELOG.md`, no formato Keep a Changelog.
3. Rode `bun run validate`.
4. Commit: `release: <bin> vX.Y.Z`.
5. Tag: `git tag vX.Y.Z`.
6. Push da `main` e só desta tag: `git push origin main vX.Y.Z`. Tags de
   outras entregas ficam fora.
7. O workflow `release.yml` compila os binários para linux-x64, linux-arm64,
   darwin-x64, darwin-arm64 e windows-x64, gera `SHA256SUMS` e publica a
   GitHub Release com as notas do changelog.
8. Confira a release em `https://github.com/<org>/<repo>/releases/tag/vX.Y.Z`.

Uma tag publicada nunca é movida. Correção posterior recebe nova versão.

## Build local

O OpenTUI carrega um pacote nativo por plataforma. `bun run build` marca
como externos os que não estão instalados, então funciona depois de um
`bun install` comum. O build cruzado precisa dos pacotes de todos os alvos,
instalados a partir do lockfile.

```bash
bun run build          # dist/<bin> para a plataforma atual
bun install --frozen-lockfile --os="*" --cpu="*" --libc="*"  # pacotes nativos de todos os alvos
bun run build:all      # dist/<bin>-<platform> para todas
./dist/<bin> --version
```

