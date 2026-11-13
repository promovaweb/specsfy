# Contribuindo com o Specsfy

Este guia serve para quem altera o monorepo. Para instalar e usar o Specsfy em
um projeto, comece pelo [README](README.md).

O Specsfy reúne a metodologia, o CLI e a documentação em um único monorepo. As
skills base ficam em [`skills/`](skills/). O CLI e a TUI ficam em
[`cli/`](cli/). Os guias ficam em [`docs/`](docs/). O CLI é escrito em
TypeScript e compilado com [Bun](https://github.com/oven-sh/bun). Ele usa o
[Termfy](https://github.com/promovaweb/termfy) como framework de CLI, TUI e
MCP.

## Antes de começar

- Converse no [Discord](https://promovaweb.com/discord) antes de um trabalho
  grande. Alinhe o escopo com quem mantém o projeto.
- Abra uma [issue](https://github.com/promovaweb/specsfy/issues) para cada
  mudança. Descreva o comportamento atual, o esperado e como reproduzir.
- Leia o [`AGENTS.md`](AGENTS.md) da raiz e o do módulo afetado. Essas
  instruções prevalecem sobre este guia em fluxo e validação.

## Ambiente

Requisitos:

- Node.js 22.20 ou superior, com npm.
- Git.
- Bun 1.4.4 para o CLI.
- PHP 8.4 e Composer para a aplicação em [`example/`](example/).
- `xmllint`, `pdftohtml` e `unzip` para conferir o ebook.
- `shellcheck` para os testes dos especialistas de deploy.

Clone e prepare a raiz:

```bash
git clone https://github.com/promovaweb/specsfy.git
cd specsfy
npm ci --ignore-scripts
```

Prepare o CLI:

```bash
cd cli
bun install --frozen-lockfile
```

Prepare o ebook quando for alterar a documentação do usuário:

```bash
npm --prefix .ebook ci --ignore-scripts
```

A aplicação de validação usa banco separado, descrito em
[`example/README.md`](example/README.md). Os testes de deploy abrem um terminal
de teste com `script` e não acessam servidores nem executam Ansible.

## Organização do código

| Caminho | Responsabilidade |
| --- | --- |
| `./` | integração, automação e testes transversais |
| [`brand/`](brand/) | identidade visual e verbal |
| [`skills/`](skills/) | metodologia executável e skills base |
| [`specialists/`](specialists/) | skills técnicas opcionais |
| [`cli/`](cli/) | CLI, TUI, instalação e atualização |
| [`docs/user/`](docs/user/) | documentação para usuários finais |
| [`docs/develop/`](docs/develop/) | metodologia e contexto técnico |
| [`specsfy/`](specsfy/) | visão geral pública detalhada |
| [`example/`](example/) | aplicação interna de validação |
| [`tests/`](tests/) | contratos integrados do monorepo |

Todos os caminhos compartilham a mesma raiz Git, o mesmo histórico, as mesmas
issues, tags e releases. Não crie `.gitmodules`, raízes Git internas ou
`.gitignore` dentro de módulos. A raiz oficial não cria `specs/` nem instala
skills de consumidor.

O mapa completo de responsabilidades está em
[`docs/develop/modules.md`](docs/develop/modules.md).

## Fluxo de trabalho

1. Localize o módulo responsável pela mudança.
2. Carregue o contexto mínimo por
   [`docs/develop/context/README.md`](docs/develop/context/README.md). Leia
   arquitetura, dados ou engenharia apenas quando a mudança alcançar esses
   assuntos.
3. Descreva o cenário BDD para uma mudança de comportamento.
4. Derive o teste TDD e execute antes da implementação. Confirme um RED causado
   pelo comportamento ausente. Falha de import, ambiente ou fixture não conta
   como RED.
5. Faça a menor alteração coerente no módulo responsável. Se o contrato
   atravessar módulos, altere todos no mesmo commit ou pull request.
6. Obtenha GREEN, refatore e repita. Em mudança de interface, revise bordas,
   espaçamento, margens, padding e tipografia nos estados e viewports
   aplicáveis.
7. Atualize a documentação aplicável na mesma entrega.
8. Rode a regressão da raiz e revise o diff integrado.

Exemplos de mudança transversal:

- novo campo de spec: template, validador, skills consumidoras e documentação.
- novo comando: parser, implementação, testes, README do CLI e guia do usuário.
- nova regra de skill: `SKILL.md`, teste focal, metadata e referência.

## Regras do código

- Diretórios e slugs usam kebab-case. Módulos Python e testes usam snake_case.
- Os identificadores do método usam `US`, `FR`, `NFR`, `AC`, `DEC` e `T`.
- Scripts retornam código diferente de zero para contrato inválido.
- Mensagens de erro identificam o caminho, a regra violada e a correção
  possível.
- Nenhum validador corrige um requisito material em silêncio.
- Não grave segredos, dados de produção ou conteúdo interno no repositório.
- Use links relativos entre módulos. Links públicos apontam para
  `https://github.com/promovaweb/specsfy`.
- Não copie fonte normativa para facilitar a navegação. Publique um link.

## Validar

Na raiz:

```bash
npm ci --ignore-scripts
npm test
npm run validate:skills
make verify-version
git diff --check
```

`npm test` executa os contratos da raiz, das skills e dos especialistas.

| Comando | Escopo |
| --- | --- |
| `npm run test:integration` | contratos da raiz |
| `npm run test:skills` | metodologia e validadores |
| `npm run test:specialists` | catálogo e utilitários opcionais |
| `npm run test:example` | documentação e cenários Pest do exemplo |
| `npm run validate:skills` | frontmatter e placeholders das skills |
| `make verify-version` | `VERSION` e todas as projeções publicáveis |
| `make verify-ebook` | PDF, EPUB e manifesto da edição |
| `make brand-guide` | manual de marca em PDF |

O validador de skills aceita diretórios e `--json`. Ele retorna `0` quando tudo
passa, `1` para falha de contrato e `2` para argumentos ou diretórios inválidos:

```bash
node scripts/validate-skills.mjs skills/specsfy-setup
node scripts/validate-skills.mjs specialists/specsfy-specialist-deploy
node scripts/validate-skills.mjs skills/specsfy-setup --json
```

No CLI:

```bash
cd cli
bun install --frozen-lockfile
bun run validate
./dist/specsfy --version
```

`bun run validate` cobre `embed:check`, `launcher:check`, `typecheck`,
`bun test`, `skills:check`, `opencli:check`, `docs:check` e `build`. Depois de
alterar `skills/`, rode `bun run embed` para atualizar as skills embutidas no
binário.

Na aplicação de validação:

```bash
cd example
composer install --no-interaction --prefer-dist
npm ci --ignore-scripts
npm run build
composer ci:check
node --test tests/*.test.mjs
```

## Documentação

- Mudança de uso atualiza [`docs/user/`](docs/user/).
- Mudança de arquitetura, metodologia ou convenção atualiza
  [`docs/develop/`](docs/develop/).
- Mudança que afeta uso e implementação atualiza os dois percursos.
- Detalhes internos de `example/` permanecem em
  [`example/README.md`](example/README.md).
- A visão pública detalhada fica em [`specsfy/README.md`](specsfy/README.md).
- A instalação canônica é [`docs/user/installation.md`](docs/user/installation.md).

Depois de alterar `docs/user/`, reconstrua os formatos portáteis:

```bash
make ebook
make verify-ebook
```

Depois de alterar `brand/`, reconstrua o manual:

```bash
make brand-guide
```

Não copie listas extensas de manifests, rotas ou schemas para a documentação.
Descreva a responsabilidade e aponte para a fonte executável.

## Commits e pull requests

Use o formato `tipo(escopo): resumo no imperativo`, por exemplo
`fix(cli): corrige leitura do catálogo`. Tipos comuns: `feat`, `fix`, `docs`,
`test`, `refactor` e `chore`. Um commit trata de um tema.

Um pull request deve trazer:

- a descrição do comportamento alterado;
- a issue relacionada;
- os comandos de validação executados e o resultado;
- a documentação atualizada no mesmo diff;
- capturas da TUI quando a mudança for visual.

O CI executa os workflows `Specsfy` e `CLI`. Confira o resultado antes de pedir
revisão.

## Releases

`VERSION` na raiz é a fonte única da versão pública. O CLI, as skills, os
especialistas, o ebook, a tag e a GitHub Release usam o mesmo SemVer.

1. Atualize `VERSION` e repita o valor em `cli/package.json` e
   `cli/npm/package.json`.
2. Registre a mudança em [`cli/CHANGELOG.md`](cli/CHANGELOG.md), no formato
   Keep a Changelog.
3. Regenere o lançador `cli/bin/specsfy` com `bun run launcher` em `cli/`.
4. Reconstrua o ebook com `make ebook`.
5. Rode `make verify-version`.
6. Crie a tag `vX.Y.Z` e envie a branch e a tag.

A tag dispara [`cli-release.yml`](.github/workflows/cli-release.yml). O workflow
compila os cinco executáveis, gera o `SHA256SUMS`, cria a GitHub Release e
publica o wrapper no npm. Uma tag publicada não é movida. Correções recebem uma
nova versão.

O passo a passo detalhado está em [`cli/docs/release.md`](cli/docs/release.md) e
na skill local
[`specsfy-release-cli`](cli/.agents/skills/specsfy-release-cli/). Publicar uma
versão é uma operação de quem mantém o projeto.

## Licença

O CLI em `cli/` usa a licença MIT, registrada em
[`cli/LICENSE`](cli/LICENSE). A raiz do monorepo ainda não tem um arquivo
`LICENSE`. Contribuições para o CLI entram sob a mesma licença MIT.
