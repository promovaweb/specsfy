---
name: termfy-release
description: Publica versões de binários derivados do Termfy com SemVer, changelog, validação, tag imutável e conferência dos executáveis da GitHub Release.
---

# Publicar uma versão do binário

Use esta skill quando a pessoa pedir a publicação de um binário derivado.
Execute no repositório desse binário, não no framework de skills.

## Leia antes

- `package.json`, `CHANGELOG.md` e `docs/release.md` do projeto derivado.
- O índice `## Specs` do `CLISPEC.md` e a linha `Status:` de cada arquivo
  em `specs/`, para saber quais specs foram fechadas desde a última versão
  e se alguma continua aberta.
- `.github/workflows/release.yml` e `scripts/build.ts`, que definem o evento
  de publicação, os alvos e os nomes dos arquivos.
- [references/versioning.md](references/versioning.md) para escolher a versão
  a partir das mudanças descritas no changelog.
- [references/checklist.md](references/checklist.md) para publicar, conferir
  os assets e tratar falhas do workflow.

## Regras

1. Use SemVer. Escolha o maior incremento exigido pelas mudanças reunidas
   na versão e descreva incompatibilidades e migração no changelog.
2. Mantenha o changelog em português do Brasil no formato Keep a Changelog.
   Preserve versões anteriores e registre a data real da publicação.
3. Publique apenas após `bun run validate` terminar com exit code 0.
4. A release vem depois do fechamento das specs. Uma versão reúne specs
   `done`; uma spec `in_progress` com código já no repositório indica entrega
   incompleta. Feche-a pelo fluxo de `termfy-spec` antes de publicar. Se ela
   não puder ser fechada, pergunte à pessoa se a versão sai com a entrega
   parcial e registre isso no changelog.
5. Preserve alterações de outras tarefas. Inclua no commit somente os
   arquivos pertencentes à versão revisada; não use `git add .` sem revisão.
6. Nunca mova, apague ou recrie uma tag publicada. Não use force push.
   Uma correção posterior recebe outra versão, mesmo se o workflow falhou.
7. O pedido de publicação autoriza o fluxo de commit, tag e push. Um pedido
   apenas de preparação termina com os arquivos e verificações prontos.
8. Considere a publicação concluída após conferir o workflow, os cinco
   executáveis, os checksums e `--version` de um asset baixado.

## Passos

1. Confira `git status --short`, branch, remoto e autenticação do `gh`.
   Trabalhe na `main` atualizada. Não descarte mudanças locais nem inclua
   alterações de outra pessoa para obter uma árvore limpa.
2. Leia o changelog, o diff desde a última versão e o índice
   `## Specs` do `CLISPEC.md`. As entradas do changelog podem citar os IDs das specs fechadas, como
   `(spec 0002)`. Escolha X.Y.Z conforme
   a referência de versionamento; confira se a tag ainda não existe localmente
   nem no remoto. Leia o nome do executável em `package.json`, no bloco `termfy`.
3. Atualize `version` em `package.json`. Transfira as mudanças prontas de
   `Unreleased` para `## [X.Y.Z] - YYYY-MM-DD` no `CHANGELOG.md`.
4. Se o registry mudou, rode `bun run opencli` e revise `docs/opencli.json`.
   Rode `bun run validate`; corrija as falhas antes de continuar.
5. Revise o diff completo da versão e faça commit com a mensagem
   `release: <bin> vX.Y.Z`. Confira que o commit contém a versão e as notas.
6. Crie a tag `vX.Y.Z` nesse commit. Faça push de `main` e dessa tag específica,
   conforme a checklist. Não envie tags de outras entregas.
7. Localize a execução de `.github/workflows/release.yml` pelo commit da tag,
   acompanhe o resultado e confira a GitHub Release criada pelo workflow.
8. Confira os cinco alvos e `SHA256SUMS`. Baixe o executável compatível com a
   máquina, valide seu SHA-256 e rode `--version`. Compare com X.Y.Z.
9. Se o workflow falhar, leia o log com `gh run view`, corrija a causa e
   publique uma nova versão após validar. Não repita a publicação se a mesma
   causa continuar; informe o erro e o que falta para prosseguir.

## Marcos

Versão e changelog concordam; validação passou; commit e tag estão no remoto;
workflow terminou com sucesso; cinco alvos e checksums estão na release;
o executável baixado informa a versão publicada.

## Saída

Informe versão anterior e nova, motivo do incremento, commit, tag, URL da
release, resultado da validação e do workflow, nomes dos assets e resultado
do checksum e de `--version`. Se algo falhar, informe a etapa e o log útil.

## Compatibilidade

Starter kit a partir da v0.9.0, com specs em Markdown puro e sem command
`spec`. Caminhos do projeto derivado citados nesta skill:
`package.json`, `CHANGELOG.md`, `docs/release.md`, `CLISPEC.md`, `specs/`,
`docs/opencli.json`, `.github/workflows/release.yml` e `scripts/build.ts`.
Scripts usados: `bun run validate` e `bun run opencli`.
