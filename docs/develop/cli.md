# Arquitetura do CLI e da TUI

O módulo `cli/` é o binário `specsfy`, a ferramenta do método. Um único
executável em Bun, construído sobre o Termfy Starter Kit do framework
[Termfy](https://github.com/promovaweb/termfy), instala e atualiza
o framework, lê e altera o estado das specs dentro das regras, roda os gates e
serve essas operações a agentes. O código é TypeScript e não define requisitos
nem aprova gates por conta própria.

As fontes executáveis deste resumo são [`cli/AGENTS.md`](../../cli/AGENTS.md),
[`cli/CLISPEC.md`](../../cli/CLISPEC.md), as specs de evolução em
[`cli/specs/`](../../cli/specs/) e a documentação embutida em
[`cli/docs/`](../../cli/docs/). Em caso de divergência, elas prevalecem.

## Entradas

O mesmo executável tem três modos, decididos em `cli/src/main.ts`:

| Modo | Como abre | Uso |
| --- | --- | --- |
| TUI | `specsfy` sem argumentos, em um TTY | acompanhar specs, gates, testes e skills ao vivo |
| CLI | `specsfy <command> [subcommand]` | saída em texto ou envelope `--json` para pessoas e CI |
| MCP | `specsfy mcp` | servidor Model Context Protocol via stdio para agentes |

Sem argumentos e sem TTY, o binário imprime o help e sai com exit code 2.
`specsfy tui` existe para passar `--project <dir>` ou `--tab <tab>`; abrir a
TUI não exige escrever `tui`. A TUI tem as abas Overview, Specs, Backlog,
Gates, Tests, Skills e About e fecha com `q`, `Esc` ou `Ctrl+C`.

A lista completa de commands, screens, tools, resources e prompts fica na
seção `Surface` do `CLISPEC.md` e em `cli/docs/cli.md`, `cli/docs/tui.md` e
`cli/docs/mcp.md`. Este documento não repete esse registro.

## Camadas

`cli/docs/architecture.md` descreve a árvore de `cli/src/`. Em resumo:

| Camada | Responsabilidade |
| --- | --- |
| `app/` | manifest do binário, tabela de exit codes e `AppError` |
| `config/` | `~/.specsfy/`, `settings.json`, cofre cifrado e master key |
| `core/` | raiz do projeto, resolução do identificador da spec e visão de leitura |
| `domain/` | estados da spec, progresso, backlog, inbox, instalador, catálogo, lock, updater, testes do projeto, milestones e GitHub |
| `engine/` | `ScriptCommandDef` e o runner dos scripts `.mjs` embutidos |
| `cli/` | registry próprio de commands, parser, help, OpenCLI e formatação |
| `mcp/` | `McpServer` sobre stdio, tools, resources e prompts |
| `tui/` | montagem com OpenTUI (`@opentui/core`), tema e uma screen por arquivo |
| `skill/` | `docs/` embutida e referência gerada do registry para `--skill` |

As regras de dependência valem para toda mudança: `app/` não importa de outra
camada, `domain/` não conhece CLI, MCP ou TUI, e `mcp/` e `tui/` podem
reutilizar funções de coleta de `cli/commands/*`, nunca o contrário. Cores da
TUI ficam somente em `src/tui/theme.ts`. O parser valida options e arguments
contra o registry, e as tools MCP declaram o `inputSchema` com Zod.

Um command apoiado em script do framework usa `ScriptCommandDef` em
`src/cli/commands/<grupo>.ts`. A mesma definição gera o command do CLI e a
tool MCP, por isso os dois nunca divergem.

## Scripts embutidos

A árvore de [`skills/`](../../skills/) entra no binário como texto em
`src/engine/skills.gen.ts`, gerado por `bun run embed`. Na primeira execução
de cada versão, `runner.ts` grava essa árvore em
`~/.specsfy/runtime/<version>-<digest>/skills/` e roda cada `.mjs` com o
próprio executável e `BUN_BE_BUN=1`, sem Node.js na máquina. Quando um script
chama `node`, um shim no `PATH` reexecuta o binário como Bun. Depois de mudar
qualquer arquivo de `skills/`, rode `bun run embed` e inclua o módulo gerado.

## Instalação

`specsfy doctor --project .` apresenta os requisitos do ambiente. Antes de
qualquer escrita, `install`, `update` e `skills` exigem Git, um projeto
legível e gravável e o CLI `skills`. Esse CLI roda no próprio runtime Bun do
binário (`<binário> x --bun skills@<versão>`), sem Node.js nem `npx`;
`SPECSFY_SKILLS_CLI` e `SPECSFY_NPX_COMMAND` substituem esse caminho nos
testes.

`SkillInstaller`, em `src/domain/installer.ts`, recusa a raiz oficial do
monorepo, clona o repositório definido em `catalog.repository` e delega a
materialização ao `skills add`, com os agentes de `skills.agents`. O módulo
mantém o `skills-lock.json`, os fingerprints e os blocos gerenciados de
`AGENTS.md` e `CLAUDE.md`.

Conteúdo gerenciado recebe fingerprint. Se a cópia local divergir do último
fingerprint registrado, atualização e remoção recusam a operação sem
`--force`. Os templates publicados em `.specsfy/templates/` têm digest próprio,
então a customização de um deles impede somente a substituição desse arquivo.
`.specsfy/templates/custom/` pertence ao usuário: fica fora do lock, prevalece
sobre o homônimo gerenciado e nunca é alterado por atualização, remoção ou
`--force`.

## Catálogo

`specialists/catalog.json` é a fonte executável do catálogo de especialistas.
`src/domain/catalog.ts` lê o arquivo pela API de conteúdo do GitHub quando
`catalog.repository` aponta para o GitHub e por clone raso nos demais
repositórios Git. `SPECSFY_SPECIALISTS_CATALOG` aponta para um arquivo local e
dispensa a rede.

A autenticação do GitHub, em `src/domain/github.ts`, procura o token nesta
ordem:

1. credencial `github.token` do cofre.
2. `GH_TOKEN`.
3. `GITHUB_TOKEN`.
4. `gh auth token`.

O token nunca é impresso nem copiado para outro arquivo. Sem token, as
requisições públicas continuam funcionando.

## Progresso

`src/domain/progress.ts` lê `specs/<estado>/*/spec.md`, com leitura
compatível dos layouts legados. Status, gates, tarefas e checklists são
projeções. A TUI e `specsfy progress --watch` recalculam quando o fingerprint
das fontes muda, a cada `tui.watchInterval` segundos. O mesmo módulo faz a
edição de checkbox de `tasks check`, com as mesmas expressões usadas na
contagem.

## Milestones

`specsfy milestones sync --project .` lê o campo `Milestones` das specs e do
backlog e atualiza os blocos gerados em `specs.md` e em
`specs/milestones/MNN.md`, preservando o restante do Markdown. Consulte
[Milestones](milestones.md) para o contrato, os limites de escrita e os
testes do módulo.

## Testes do consumidor

`src/domain/project-testing.ts` detecta hoje Laravel com Pest. Antes de criar
o processo, o módulo exige um banco de teste separado em `.env.testing`; sem
essa prova, a execução para com `GATE_FAILED` e o PHP não inicia. Projeto sem
runner conhecido recebe `NOT_FOUND`. O command `test`, a tool MCP
`project_test` e a aba Tests usam o mesmo caminho.

## Atualização

`specsfy update` reconcilia o projeto com `skills/inventory.json`, a lista
única de skills do framework, nomes trocados (`renamed`) e skills aposentadas
(`retired`). `SkillInstaller.reconcile()` clona o repositório na tag `v<versão>`
do binário (ou na branch padrão com `--latest` ou sem essa tag), lê o
inventário do clone e monta um `UpdatePlan`: instala as skills que faltam,
atualiza as que mudaram, remove nomes antigos e atualiza os especialistas
instalados, sempre pelo CLI `skills`. Skill com mudança local entra em `kept`
sem `--force`. `--check` devolve só o plano. O binário embute o inventário da
própria versão (`src/domain/inventory.ts`), usado sem rede por `doctor` e pela
aba Skills. Um `renamed` aponta sempre para uma skill atual: ao renomear de
novo, atualize as entradas antigas. `specsfy skills update` usa a mesma
função.

`specsfy upgrade` compara a versão em execução com a última GitHub Release de
`promovaweb/specsfy` e troca a instalação conforme a origem detectada em
`src/domain/updater.ts`:

| Origem | Como é trocada |
| --- | --- |
| wrapper npm `@promovaweb/specsfy` | `npm install --global @promovaweb/specsfy@latest`; o wrapper baixa o binário novo na próxima execução |
| launcher de `get.specsfy.dev` | o launcher é substituído; ele baixa o próprio binário depois |
| executável avulso | baixa o asset da plataforma, confere `SHA256SUMS` e `--version` e troca o arquivo atomicamente |
| código-fonte | recusa; atualize o checkout com Git |

`upgrade --check` apenas informa as versões. A checagem diária do `doctor`
usa o cache `~/.specsfy/update.json` e é desligada por `update.check`. Falha
de rede não impede a abertura da TUI nem dos commands de leitura.

## Artefato versionado

`bun run build` compila `src/main.ts` em `cli/dist/specsfy` com
`bun build --compile`. `bun run build:all` gera os cinco alvos: linux-x64,
linux-arm64, darwin-x64, darwin-arm64 e windows-x64. O executável carrega o
OpenTUI nativo, `docs/`, `package.json` e a árvore de skills, e não depende de
Bun nem de Node.js na máquina que o executa.

O workflow `CLI Release` compila esses alvos a partir da tag e publica a
GitHub Release com `SHA256SUMS`. O pacote npm `@promovaweb/specsfy` é só um
wrapper que baixa o binário da plataforma e sai pela máquina local. O
`cli/bin/specsfy` versionado é o launcher servido por `get.specsfy.dev`,
gerado por `bun run launcher` a partir de `cli/npm/bin/specsfy.cjs`. O fluxo
completo está em `cli/docs/release.md` e em
[Release do CLI](context/flows/cli-release.md).

## Testes

A suíte usa `bun test` em `cli/tests/`, separada por área: `core/`,
`domain/`, `lifecycle/`, `gates/`, `framework/` e `tui/`. Os testes de
framework rodam `install`, `update`, `skills` e `doctor --project` em
subprocesso contra um repositório Git local, com um CLI `skills` simulado e
uma pasta de dados isolada. O teste do wrapper npm baixa o binário de um
espelho local e confere `SHA256SUMS`.

As screens são montadas com `createTestRenderer` de `@opentui/core/testing`,
com serviços simulados para catálogo, gates, testes e `skills`, sem rede.
`tui-theme.test.ts` confere as paletas `terminal`, `night` e `day` e o
contraste dos pares usados em texto e borda.

```bash
cd cli
bun install
bun run validate
./dist/specsfy --version
```

`validate` encadeia `embed:check`, `launcher:check`, `typecheck`, `bun test`,
`skills:check`, `opencli:check`, `showcase:check`, `docs:check`, `build` e
`smoke`. O `smoke` roda o binário compilado `dist/specsfy` sem rede
(`--version`, `--skill tui`, `mcp --list`, `doctor --json`, `install` num
projeto temporário a partir do próprio repositório e `update --check`) e pega
falha que só aparece no binário compilado, antes da tag. `docs:check` exige
que todo command, screen, tool, resource, prompt, key e exit code do código
apareça em `cli/docs/`. Quando o registry muda, rode `bun run opencli` e
revise o diff de `cli/docs/opencli.json`.

Mudanças de interface atualizam também
[`docs/user/cli.md`](../user/cli.md) e a
[`referência pública dos comandos`](../user/cli-reference.md).

Os prints de todas as telas da TUI e o fluxo para atualizá-los estão em
[`showcase.md`](showcase.md).
