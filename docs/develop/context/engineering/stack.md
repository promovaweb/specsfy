# Stack de engenharia

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | tecnologias estruturais |
| Autoridade | função, restrições e condições das escolhas tecnológicas |

## Papel

Explicar tecnologias estruturais, suas responsabilidades e as condições para
mudá-las sem duplicar versões mantidas por fontes executáveis.

## Como usar

Leia ao introduzir linguagem, runner, formato ou ferramenta transversal. Use
[packages.md](packages.md) para dependências e
[testing.md](testing.md) para comandos.

## Atualize quando

- uma tecnologia estrutural for adotada ou removida.
- a responsabilidade de uma ferramenta mudar.
- uma nova fonte executável de versão for criada.

## Não use para

- copiar uma árvore completa de dependências.
- fixar versão fora de manifest ou lockfile.
- transformar preferência pessoal em regra do projeto.

## Fonte da verdade e precedência

Este arquivo explica escolhas. Manifests, lockfiles, workflows e comandos são
fontes executáveis de versão e configuração. O CLI mantém manifest e lockfile
Bun próprios (`cli/package.json` e `cli/bun.lock`). As automações da raiz usam
Node.js, com dependências em `package.json` e `package-lock.json`.

## Stack vigente

| Tecnologia | Responsabilidade | Fonte executável |
| --- | --- | --- |
| Markdown | skills, specs e contexto legível | arquivos versionados |
| Node.js 22.20 ou superior | validadores, testes de contrato e ebook | `package.json` da raiz e `.ebook/package.json` |
| Bun e TypeScript | CLI, TUI, servidor MCP e executável compilado | `cli/package.json` e `cli/bun.lock` |
| `node:test` | TDD, regressão e aceite Gherkin (`tests/bdd.mjs`) | `tests/*.test.mjs` e `tests/features/` |
| GitHub Actions | verificação em CI | `.github/workflows/` |

## Aplicação de validação

`example/`, no repositório `example/`, é uma aplicação interna Laravel com
cliente Inertia React. Ela exercita a metodologia em uma superfície real, mas
não transforma PHP, JavaScript ou seu runtime em dependências do Specsfy.

<!-- markdownlint-disable MD013 -->
| Área do exemplo | Responsabilidade | Fonte executável |
| --- | --- | --- |
| Laravel e PHP | domínio, HTTP, autenticação e persistência | `example/composer.json` e lockfile |
| Inertia, React e TypeScript | páginas e interação web | `example/package.json` e lockfile |
| SQLite | estado local da aplicação | migrations e configuração de `example/` |
| Pest, linters e build | regressão da superfície de validação | scripts dos manifests do exemplo |
<!-- markdownlint-enable MD013 -->

## CLI e catálogos

<!-- markdownlint-disable MD013 -->
| Área | Responsabilidade | Fonte executável |
| --- | --- | --- |
| TypeScript sobre Bun, com registry próprio de commands | comandos, instalação, projeção, runners e detecção de versões | `cli/src/` |
| OpenTUI (`@opentui/core`) | interface terminal | `cli/package.json` e `cli/bun.lock` |
| MCP SDK e Zod | servidor MCP via stdio e schemas das tools | `cli/package.json` e `cli/bun.lock` |
| `bun build --compile` | executáveis de linux-x64, linux-arm64, darwin-x64, darwin-arm64 e windows-x64 | `cli/scripts/build.ts` |
| npm | wrapper que baixa o binário e publicação local desse wrapper | `cli/npm/package.json` |
| Markdown/YAML | instruções e metadata das skills | `skills/` e `specialists/` |
| JSON | catálogo detectável e lock de instalação | `specialists/catalog.json` e lock do consumidor |
<!-- markdownlint-enable MD013 -->

O CLI é ferramenta de distribuição. Suas dependências não passam a ser
dependências dos projetos consumidores nem do workspace `promovaweb/specsfy`.

## Condições de escolha

- Preferir biblioteca padrão para scripts determinísticos.
- Exigir benefício observável antes de adicionar dependência.
- Manter equivalência entre execução local e CI.
- Registrar versão em fonte executável, não neste contexto.
- Evitar rede, instalação global e ação destrutiva por padrão.
- Manter a stack de `example/` isolada da implementação da metodologia. Sua
  adoção demonstra integração, não cria requisito para projetos usuários.
