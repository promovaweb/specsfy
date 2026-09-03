# Specsfy

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
O portal completo está em [`docs/README.md`](docs/README.md).

Para desenvolver a partir do checkout:

```bash
git clone https://github.com/promovaweb/specsfy.git
cd specsfy
./scripts/install-cli.sh
```

Para reconstruir o manual de marca após alterar suas fontes:

```bash
make brand-guide
```

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
python3 -B -m unittest discover -s tests -p 'test_*.py'
uv run --quiet --with behave behave tests/features --no-capture
```

Os módulos possuem verificações focais descritas em seus `AGENTS.md`. Consulte
[`AGENTS.md`](AGENTS.md) antes de contribuir.

As skills locais [`specsfy-monorepo-documentator`][documentator] e
[`specsfy-release-cli`](cli/.agents/skills/specsfy-release-cli/) mantêm,
respectivamente, a documentação oficial e as releases estáveis do CLI. A
segunda pertence ao módulo `cli/` e não integra o framework instalado em
projetos consumidores.

[documentator]: .agents/skills/specsfy-monorepo-documentator/
