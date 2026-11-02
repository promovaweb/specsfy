# Specsfy

O arquivo [`VERSION`](VERSION) define a versão pública única do Specsfy. A
mesma versão identifica o framework, o CLI, as skills, os especialistas, o
ebook, a tag Git e a GitHub Release. O website e o Hub têm ciclos próprios.

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="brand/logo/icon.svg" type="image/svg+xml">
    <img src="brand/logo/icon.png" alt="Logo do Specsfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

> Especifique. Prove. Entregue.

Esta apresentação reúne os caminhos públicos do Specsfy, uma metodologia
prática para desenvolver software a partir de uma especificação única,
executável e rastreável. Todo o projeto é mantido no monorepo
[`promovaweb/specsfy`](https://github.com/promovaweb/specsfy).

## Estrutura

| Caminho | Responsabilidade |
| --- | --- |
| [`skills/`](skills/) | metodologia executável e skills base |
| [`specialists/`](specialists/) | skills técnicas opcionais |
| [`cli/`](cli/) | CLI, TUI, instalação e atualização |
| [`docs/`](docs/) | documentação oficial e contexto transversal |
| [`brand/`](brand/) | identidade visual e verbal |
| [`example/`](example/) | aplicação interna de validação |
| [`specsfy/`](specsfy/) | tutorial público detalhado |
| [`tests/`](tests/) | contratos integrados do monorepo |

Todos os caminhos compartilham a mesma raiz, histórico, branch, issues, tags e
releases Git.

## Instalação

Requer Node.js 22.20 ou superior, npm e o comando
[`skills`](https://github.com/vercel-labs/skills) ou `npx`.
Enquanto o repositório for privado, autentique uma vez com `gh auth login`.
o CLI reutiliza essa sessão. Em automações, defina `GH_TOKEN` ou
`GITHUB_TOKEN` com acesso de leitura ao repositório.

O executável versionado está disponível pelo download oficial
`get.specsfy.dev`. Para instalar o pacote publicado e receber atualizações
gerenciadas pelo npm:

```bash
npm install --global @promovaweb/specsfy
specsfy --version
cd caminho/do/projeto
specsfy doctor --project .
specsfy install --project .
```

Depois da instalação, `specsfy update --project .` atualiza as skills do
projeto e `specsfy upgrade` atualiza o próprio CLI.

Em um projeto iniciado com GitHub Spec Kit, `$specsfy-setup` lê
`.specify/memory/constitution.md` e os arquivos existentes em `specs/`. A skill
publica uma ponte de leitura em `.specsfy/SPECKIT.md` e preserva os artefatos
originais nos mesmos caminhos.

O CLI instala a metodologia de `skills/` e, sob demanda, especialistas de
`specialists/`. Veja o [guia de instalação](docs/user/installation.md), o
[primeiro uso](docs/user/getting-started.md) e o
[guia do CLI](docs/user/cli.md).
Release, cadastro de servidores e produção em Docker Swarm usam a entrada única
[`specsfy-specialist-deploy`](docs/user/deploy.md), com inventário Ansible,
teste das conexões e sincronização de chaves públicas.
O deploy manual continua pedindo a senha do Vault. Para permitir a execução
pela IA, `./deploy configure-vault` prepara uma senha externa por projeto e
`./deploy run --non-interactive` usa essa fonte sem perguntas. O
[guia de operações](docs/user/deploy-vault.md) documenta também arquivos,
scripts de cofre e a configuração nativa do Ansible.

O portal completo está em [`docs/README.md`](docs/README.md).

Para desenvolver a partir do checkout:

```bash
git clone https://github.com/promovaweb/specsfy.git
cd specsfy
npm ci --ignore-scripts
npm --prefix .ebook ci --ignore-scripts
./scripts/install-cli.sh
```

Para reconstruir o manual de marca após alterar suas fontes:

```bash
npm --prefix .ebook ci --ignore-scripts
npm exec --prefix .ebook -- playwright install chromium
make brand-guide
```

O build usa Pandoc, Paged.js e Chromium. Um Chromium já instalado pode ser
selecionado por `SPECSFY_CHROMIUM_PATH`.

Esta raiz não é um projeto consumidor e não recebe `specs/` ou skills
instaladas.

## Inspirações e fontes

O Specsfy desenvolve uma metodologia própria, mas reconhece três referências
que ajudaram a organizar seu vocabulário e seu fluxo:

- [GitHub Spec Kit](https://github.github.com/spec-kit/), pela aplicação de
  specification-driven development em etapas executáveis próximas ao código.
- [OpenSpec](https://openspec.dev/), pela proposta de manter especificações e
  mudanças como um acordo leve entre a pessoa responsável e o agente.
- [*Categorias*, de Aristóteles](https://classics.mit.edu/Aristotle/categories.html),
  pela atenção dada à classificação explícita de objetos, atributos, relações
  e estados antes de formular afirmações sobre eles.

Essas referências são fontes de inspiração, não dependências nem declarações
de equivalência. O comportamento do Specsfy continua definido pelas skills,
templates, validadores e testes deste repositório.

## Validação

```bash
npm ci --ignore-scripts
npm test
npm run validate:skills
```

Os módulos possuem verificações focais descritas em seus `AGENTS.md`. Consulte
[`AGENTS.md`](AGENTS.md) antes de contribuir.

O `package.json` da raiz organiza os contratos Node.js. Os testes de ebook
também precisam de `xmllint`, `pdftohtml` e `unzip`, além das dependências de
`.ebook/`. Os testes de deploy usam `shellcheck` e o comando `script` para
abrir um terminal de teste. Eles não acessam servidores nem executam Ansible.

| Comando | Escopo |
| --- | --- |
| `npm test` | integração, skills e especialistas |
| `npm run test:integration` | contratos da raiz |
| `npm run test:skills` | metodologia e validadores |
| `npm run test:specialists` | catálogo e utilitários opcionais |
| `npm run test:example` | documentação e cenários Pest do exemplo |
| `npm run validate:skills` | frontmatter e placeholders das skills |

Prepare as dependências e o banco separado conforme
[`example/README.md`](example/README.md) antes de executar `test:example`.
O validador de skills aceita diretórios opcionais e `--json`. Sem diretórios,
ele confere as bibliotecas e as skills operacionais locais. Ele apenas lê os
arquivos, retorna `0` quando todos passam, `1` para falha de contrato e `2`
para argumentos ou diretórios inválidos.

```bash
# Conferir todas as bibliotecas
npm run validate:skills
# Conferir uma skill base
node scripts/validate-skills.mjs skills/specsfy-setup
# Conferir um especialista
node scripts/validate-skills.mjs specialists/specsfy-specialist-deploy
# Conferir a skill operacional de documentação
node scripts/validate-skills.mjs .agents/skills/specsfy-monorepo-documentator
# Obter resultados estruturados de duas skills
node scripts/validate-skills.mjs skills/specsfy-setup \
  skills/specsfy-progress --json
```

As skills locais [`specsfy-monorepo-documentator`][documentator] e
[`specsfy-release-cli`](cli/.agents/skills/specsfy-release-cli/) mantêm,
respectivamente, a documentação oficial e as releases estáveis do CLI. A
segunda pertence ao módulo `cli/` e não integra o framework instalado em
projetos consumidores.

[documentator]: .agents/skills/specsfy-monorepo-documentator/
