# Publicação e conferência

Execute os exemplos no repositório do binário. Substitua os valores de
exemplo antes de rodar; use variáveis próprias da tarefa.

## Preparar e enviar

- Confira `git status --short`, `git branch --show-current`, `git remote -v`
  e `gh auth status`. Confirme que o remoto pertence ao binário derivado.
- Atualize a visão do remoto com `git fetch origin`. Se `main` estiver atrás,
  integre as mudanças sem reescrever commits publicados e valide de novo.
- Confira a versão em `package.json` e a seção correspondente em `CHANGELOG.md`.
- Exija sucesso de `bun run validate`. Revise o diff e adicione somente os
  arquivos da versão. O build local não substitui os assets publicados.

```bash
release_bin='mycli'
release_version='0.6.2'
release_tag="v$release_version"
git tag --list "$release_tag"
git ls-remote --tags origin "refs/tags/$release_tag"
```

Se qualquer consulta encontrar a tag, não a recrie. Para trabalho novo,
escolha outra versão. Para uma publicação já enviada, apenas confira o
workflow e os assets dessa tag.

Após revisar e preparar o stage da versão:

```bash
git commit -m "release: $release_bin $release_tag"
release_commit=$(git rev-parse HEAD)
git tag "$release_tag" "$release_commit"
git push origin main
git push origin "$release_tag"
```

Se o push de `main` for rejeitado, pare antes do push da tag. Resolva a
atualização da branch e valide novamente. Não mova a tag criada; use outra
versão se a correção exigir um novo commit de release.

## Acompanhar o workflow

```bash
gh run list --workflow release.yml --commit "$release_commit" --json databaseId,headSha,status,conclusion,url
```

Escolha o ID cuja execução corresponde ao commit e ao evento da tag.
Substitua o número abaixo pelo ID retornado:

```bash
release_run_id='123456789'
gh run watch "$release_run_id" --exit-status
gh release view "$release_tag" --json url,tagName,isDraft,assets
```

Se a execução ainda não aparecer, confira o push e o gatilho `v*` em
`.github/workflows/release.yml`. Não crie uma release manual para esconder
uma falha do workflow. Ao final, a release deve estar publicada, com a tag
correta e notas correspondentes ao changelog.

## Assets e teste do executável

Compare os nomes com `scripts/build.ts`. Exija estes assets, trocando
`<bin>` pelo nome real:

| Alvo | Asset |
| --- | --- |
| Linux x64 | `<bin>-linux-x64` |
| Linux arm64 | `<bin>-linux-arm64` |
| macOS x64 | `<bin>-darwin-x64` |
| macOS arm64 | `<bin>-darwin-arm64` |
| Windows x64 | `<bin>-windows-x64.exe` |
| Checksums | `SHA256SUMS` |

O workflow também pode anexar o build da plataforma local. Isso não substitui
nenhum dos cinco alvos. Confira se `SHA256SUMS` lista todos os cinco nomes.

Exemplo para uma máquina Linux x64, em uma pasta temporária nova:

```bash
release_download=$(mktemp -d)
release_asset="$release_bin-linux-x64"
gh release download "$release_tag" --pattern "$release_asset" --pattern SHA256SUMS --dir "$release_download"
(cd "$release_download" && sha256sum --check --ignore-missing SHA256SUMS)
chmod u+x "$release_download/$release_asset"
"$release_download/$release_asset" --version
```

Só execute o asset se a verificação SHA-256 retornar sucesso e mencionar o
arquivo baixado. A saída deve identificar o binário e a versão X.Y.Z. No
macOS, selecione darwin e use `shasum -a 256` para comparar o hash com a
linha correspondente. No Windows, selecione o `.exe`, confira o hash com
`Get-FileHash -Algorithm SHA256` e execute `--version` pelo PowerShell.
Não tente executar um alvo incompatível com a máquina.

## Quando falhar

Leia a etapa e o log antes de alterar código:

```bash
gh run view "$release_run_id"
gh run view "$release_run_id" --log-failed
```

Confira instalação de dependências, validação, pacotes nativos do OpenTUI,
compilação dos alvos e permissão `contents: write`, conforme a etapa que
falhou. Corrija a causa no projeto, registre a correção no changelog e
avance a versão. Rode `bun run validate`, crie outro commit e outra tag e
repita a conferência. Preserve a tag anterior e relate se ela ficou sem
release ou com assets incompletos. Se a mesma causa persistir, encerre a
tentativa com o diagnóstico em vez de gerar versões em sequência.
