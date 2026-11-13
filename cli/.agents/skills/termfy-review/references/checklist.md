# Consultas para a revisão

Execute na raiz do starter kit ou do projeto derivado. Guarde o exit code de
cada comando. `rg` retorna 1 quando não encontra correspondências; isso não
é uma falha da aplicação. As buscas abaixo localizam candidatos e não provam,
sozinhas, que o comportamento esteja correto. Confirme cada achado no código.

## Escopo e itens da spec

Troque `0002` pelo número da spec sob revisão.

```bash
git status --short
git diff --stat
git diff
git diff --cached
rg -n '^Status:|^- \[[xX ]\]' specs/0002-*.md
rg -n '^Status:' specs
bun run typecheck
bun test
```

Para cada item `[x]` de Tasks e Tests, localize um teste que exercite sua
entrega e confira que passou nesta revisão. Procure testes ignorados ou limitados por `.only`:

```bash
rg -n '\b(test|it|describe)\.(skip|todo|only)|expect\(' tests
```

Um item marcado sem teste pertinente é achado mesmo quando a suíte passa.
Confira na spec a linha `Status:` com um dos valores `draft`,
`in_progress`, `done` ou `archived`, as seções na ordem do contrato e a tag
da skill responsável no fim de cada tarefa. Front matter YAML, IDs de item entre chaves
nos itens, itens marcados no `CLISPEC.md` em vez da spec, trabalho
pendente no `CLISPEC.md` ou seção `## Checklist` nele também são achados.

## Behavior, Design e fechamento

Leia o Behavior e confronte cada fluxo, saída em texto e em `--json`,
mensagem de erro, exit code, tecla e tool com o código e os testes. Leia o
Design e confira os arquivos criados, a camada de cada função, as funções
compartilhadas entre CLI, MCP e TUI e as dependências novas. Confira que
cada item de Surface da spec existe no código com o nome, as options, o
`data`, os exit codes e as credenciais descritos. A spec pode ser fechada
quando Goal, Behavior e Design têm texto, todos os itens estão `[x]` e a
conferência manual abaixo não acha divergências. Relate essa condição sem
fechar a spec, pois o fechamento grava o `CLISPEC.md`.
Leia também arquivos novos apontados por `git status`, pois `git diff` não
mostra seu conteúdo. Não rode `bun run validate` nesta revisão, pois inclui
build; execute suas verificações sem geração de artefatos separadamente.

## Conferência manual do CLISPEC.md

Nenhum script lê `CLISPEC.md` nem `specs/`. Confronte os documentos com o
código pela leitura. As buscas abaixo listam os nomes do lado do código:

```bash
rg -n 'name: "' src/cli/commands.ts src/cli/commands
rg -n 'export const screens' src/tui/screens/index.ts
rg -n '^  id: "' src/tui/screens
rg -n 'registerTool|registerResource|registerPrompt' src/mcp
rg -n 'key: "' src/config/settings.ts
rg -no 'getCredential\("[^"]+"\)' src
rg -n 'CREATE TABLE|ALTER TABLE' src
ls specs
```

- Cada linha de Commands, Screens, MCP e Settings do `CLISPEC.md` existe no
  registry, em `src/tui/screens/index.ts`, em `src/mcp/` e em
  `SETTINGS_SCHEMA`, e nada entregue falta nas tabelas.
- Options, exit codes e `data` de cada command batem com o registry e com
  `docs/cli.md`.
- Cada `getCredential("<nome>")` de `src/` aparece em Credentials, com os
  commands e tools que a usam. Credencial listada sem chamada no código
  também é achado.
- Quando há banco, cada tabela das migrations aparece em `### Storage` com
  colunas, tipo, chave primária e `NOT NULL` iguais aos dos `CREATE TABLE` e
  `ALTER TABLE` lidos em ordem.
- O índice `## Specs` tem uma linha por arquivo de `specs/`, com título e
  status iguais aos da spec. Spec `done` tem Surface aplicada ao
  `CLISPEC.md` e uma linha datada em Notes.
- A linha abaixo do título traz `bin` e `description` iguais aos do
  `package.json`.

## Descriptions e registry

A consulta percorre commands, options e arguments sem chamar `run`:

```bash
bun -e '
import { root } from "./src/cli/commands.ts";
import { GLOBAL_OPTIONS } from "./src/cli/registry.ts";
let failed = false;
function check(entry, label) {
  if (typeof entry.description !== "string" || !entry.description.trim()) {
    console.error(`Missing description: ${label}`);
    failed = true;
  }
}
function visit(command, parent = "") {
  const path = [parent, command.name].filter(Boolean).join(" ");
  check(command, path);
  for (const option of command.options ?? []) check(option, `${path} ${option.name}`);
  for (const argument of command.arguments ?? []) check(argument, `${path} <${argument.name}>`);
  for (const child of command.subcommands ?? []) visit(child, path);
}
for (const option of GLOBAL_OPTIONS) check(option, option.name);
visit(root);
process.exitCode = failed ? 1 : 0;
'
rg -n 'description:|arguments:|options:|exitCodes:' src/cli
bun run opencli:check
```

O `argument` interno de uma option usa a description da própria option;
não exija um campo ausente de `OptionDefinition`. Confira `Command`, `run`,
`data` e `text` em `src/cli/registry.ts`. Para tool, leia a configuração de
`registerTool` e as descriptions dos campos Zod.

```bash
rg -n 'registerTool|inputSchema|describe\(' src/mcp
```

## Exit codes

```bash
cat src/app/exit-codes.ts
rg -n 'process\.exit|exitCode\s*=|\bcode\s*:|new AppError|exitCodes:' src scripts
rg -n 'ExitCode|error\.(usage|config|credentials|network|notFound|permission|noTty|mcp|interrupted)' src
```

Confira se cada saída usa a família declarada em `src/app/exit-codes.ts`.
Um número literal no command exige revisão; não invente uma família local.
Diferencie exit code do processo de status HTTP ou campo de domínio. Leia
`src/app/errors.ts`, por exemplo `error.network`, antes de sugerir troca.

## Credenciais e canais de saída

```bash
rg -n 'getCredential|readVault|readSecret|reveal|masked' src
rg -n 'console\.(log|info|debug|error|warn)|stdout|stderr|JSON\.stringify|structuredContent|content:|throw ' src
rg -n 'credentials|reveal|masked|captureCharFrame|stderr|stdout' tests
```

Siga o valor desde `getCredential` até cada consumidor. Confira ausência em
log, erro, JSON sem `--reveal`, resposta MCP e frame TUI. Teste com marcador
sintético e procure sua presença nos canais capturados, sem usar o cofre real.
Apenas citar `mask` não comprova ausência do segredo. Não mostre um valor
real encontrado, nem execute buscas que leiam a configuração pessoal.

## Stdout do MCP

```bash
rg -n 'console\.(log|info|debug)|process\.stdout|Bun\.stdout' src
rg -n '^import |import\(|registerTool|registerAll|startStdioServer' src/mcp src/cli
bun test tests/mcp.test.ts
```

Siga imports e callbacks desde `src/mcp/server.ts`, inclusive coletores
compartilhados de CLI. `console.log` em qualquer trecho alcançado pelo MCP
pode contaminar o JSON-RPC. `console.error` usa stderr, mas também precisa
ser conferido quanto a segredos. Mensagens do protocolo escritas pelo SDK
não são logs da aplicação.

## Cores da TUI

```bash
rg -n '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' src/tui --glob '!theme.ts'
rg -n 'fg:|bg:|Color:|color:|theme\.' src/tui
```

Inspecione também nomes de cor literais e variáveis locais apontadas pela
segunda busca. Cores de screens e componentes devem vir de `src/tui/theme.ts`.
Não confunda essa regra com as sequências ANSI do CLI em `src/cli/format.ts`.

## Documentação e idioma

```bash
bun run docs:check
rg -n -i 'risco|decisão|evidência|critério|inventário|atrito|bloqueio|\bem\s+que\b|—' docs --glob '*.md'
rg -n '[À-ÿ]|\b(obter|salvar|arquivo|chave|valor|erro|saida|comando|credencial|nao|retorna|cria)\b' src scripts template tests --glob '*.ts'
```

A lista literal no comando de busca é material de auditoria, não prosa para
reutilizar nos docs. Inspecione a prosa de `docs/`, excluindo código citado
quando necessário. Leia strings, comentários, JSDoc e identificadores do
código, inclusive os sem acento que a busca não detecta. Termos como `data`,
`global` e `terminal` também existem em inglês; não os sinalize por aparência.
Documentação embutida importada como texto pode estar em português.

`docs:check` confirma cobertura automática, mas não garante idioma, clareza
ou correspondência de cada exemplo ao comportamento real. Confira os nomes
contra `SETTINGS_SCHEMA`, registry e catalog, não apenas contra o texto.

## Encerrar sem editar

```bash
git status --short
git diff --stat
```

Compare com o estado inicial. Não execute formatadores, correções automáticas,
`bun run opencli` ou comandos de publicação. Relate alterações inesperadas
sem revertê-las. Escreva os achados conforme `severity.md`, com linha real e
correção sugerida, e liste as verificações que não puderam concluir.
