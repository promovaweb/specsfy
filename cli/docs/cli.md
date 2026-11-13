# CLI

## Convenções

- `{{bin}} <command> [subcommand] [arguments] [options]`.
- Options aceitam `--key value` e `--key=value`. Não há agrupamento de flags
  curtas (`-abc`).
- `--` encerra a leitura de options; o que vem depois é argument.
- Options globais valem em qualquer posição, antes ou depois do command.
- Sem argumentos, em terminal interativo, o binário abre a TUI. Sem TTY,
  imprime o help e sai com exit code 2.
- Toda saída de dados vai para stdout. Avisos, progresso e erros em modo
  texto vão para stderr.
- Nomes de commands, subcommands, options, arguments, keys e campos de saída
  são em inglês. Mensagens do binário também.

## Projeto e identificador da spec

Todo command de projeto aceita `--project <dir>`. Sem a option, o binário
sobe a partir da pasta atual até encontrar `specs/`, `.specsfy/` ou
`skills-lock.json`, o que permite rodar de qualquer subpasta. Um Hub com
vários repositórios filhos continua sendo um projeto quando a raiz tem um
desses marcadores.

Onde o command pede `<spec>`, valem quatro formas:

| Forma | Exemplo |
| --- | --- |
| número | `1` ou `0001` |
| nome da pasta | `0001-recuperar-senha` |
| slug sem número | `recuperar-senha` |
| caminho | `specs/in-progress/0001-recuperar-senha/spec.md` |

O binário resolve a forma recebida para o caminho absoluto do `spec.md`
antes de chamar o domínio ou o script do framework.

## Options globais

| Option | Efeito |
| --- | --- |
| `-h`, `--help` | Help do command atual. Exit code 0. |
| `-V`, `--version` | Imprime `{{bin}} <version>`. Exit code 0. |
| `--json` | Saída em JSON com envelope estável. Erros também saem em JSON, em stdout. |
| `--skill [topic]` | Documentação embutida. Topics: `cli`, `tui`, `mcp`, `config`, `exit-codes`, `reference`. |
| `--opencli` | Descrição OpenCLI 0.1 da árvore de commands em JSON. |
| `--no-color` | Desliga cores ANSI. `NO_COLOR=1` tem o mesmo efeito. |

## Saída em texto e em JSON

Texto é o padrão quando `output.format` em settings.json é `text`. Com
`--json`, ou com `output.format = json`, a saída segue este envelope:

```json
{ "ok": true, "command": "{{bin}} config get", "data": { "key": "tui.theme", "value": "night" } }
```

`ok` acompanha o exit code. Quando o command termina com código diferente de
0 e ainda produz dados, o envelope traz `ok: false`, o `code` numérico e o
`data` do command. Um gate reprovado, por exemplo, sai com 10 e mostra os
problemas encontrados:

```json
{
  "ok": false,
  "command": "{{bin}} gate spec",
  "code": 10,
  "data": {
    "project": "/home/pessoa/app",
    "script": "specsfy-04-validate/scripts/validate_spec.mjs",
    "exitCode": 1,
    "ok": false,
    "result": { "status": "failed", "findings": ["FR-002 has no BDD scenario"] },
    "stderr": ""
  }
}
```

Falha prevista que interrompe o command antes de produzir `data` usa o
envelope de erro:

```json
{
  "ok": false,
  "command": "{{bin}} credentials get",
  "error": { "code": 4, "name": "CREDENTIALS", "message": "Credential \"x\" not found.", "details": { "name": "x" } }
}
```

O exit code do processo é sempre o mesmo de `error.code` ou de `code`. Um
agente deve ler os dois: o envelope para a mensagem e a lista de problemas, o
code para a classe da falha.

No CI, o `verify` roda a política inteira e falha o job quando encontra
problemas:

```bash
{{bin}} verify --boundary ci --json
```

Com `--attestation .specsfy/attestation.json`, o payload fica gravado para a
etapa seguinte do pipeline.

## Commands

### Projeto

Leitura do estado do projeto. Nenhum command deste grupo altera arquivos.

| Command | Função | Options principais |
| --- | --- | --- |
| `tui` | Abre a interface de terminal. Exige TTY. | `--tab <tab>`, `--project <dir>` |
| `status` | Visão geral: specs por estado, progresso, gates, backlog e inbox. | `--project <dir>` |
| `specs list` | Lista specs com estado, gates e progresso das tarefas. | `--state <state>`, `--project <dir>` |
| `specs show` | Mostra uma spec com metadados, gates e tarefas. | `<spec>`, `--content`, `--project <dir>` |
| `backlog list` | Lista os itens de `specs/backlog/`. | `--project <dir>` |
| `inbox list` | Lista as capturas de `specs/inbox/`. | `--all`, `--project <dir>` |
| `progress` | Progresso de todas as specs ou de uma spec; `--watch` atualiza a cada mudança. | `--spec <spec>`, `--watch`, `--project <dir>` |

### Ciclo da spec

Criação, captura e movimentação do trabalho pelo método.

| Command | Função | Options principais |
| --- | --- | --- |
| `specs new` | Cria uma spec em `specs/draft/` com o próximo número, a partir do template instalado. | `--title <title>`, `--slug <slug>`, `--project <dir>` |
| `specs transition` | Move a spec para uma pasta de estado vizinha e espelha o Status. Ordem: `draft`, `defined`, `planned`, `in-progress`, `review`, `completed`. | `<spec>`, `<state>`, `--project <dir>` |
| `specs effort` | Registra o esforço estimado de 1 a 10 com uma justificativa. | `<spec>`, `<effort>`, `--reason <text>`, `--project <dir>` |
| `specs migrate` | Move specs dos layouts antigos para as pastas de estado, pelo Status. | `--project <dir>` |
| `specs research` | Lista e carrega a pesquisa local indexada pela spec e confere as afirmações. | `<spec>`, `--emit-content`, `--max-bytes <bytes>`, `--project <dir>` |
| `specs change` | Compara a spec no Git com a versão do worktree: IDs e seções alterados e gates a reabrir. | `<spec>`, `--base <rev>`, `--mode impact\|changelog`, `--project <dir>` |
| `inbox capture` | Registra uma captura em `specs/inbox/` a partir do texto original, sem interação. | `--input <text>`, `--title <title>`, `--slug <slug>`, `--summary`, `--problem`, `--people`, `--value`, `--signals`, `--data`, `--risks`, `--directions`, `--review`, `--session`, `--turn`, `--sources`, `--project <dir>` |
| `inbox process` | Move a captura para `specs/inbox/processed/` quando specs com o Definition Gate aprovado a cobrem. | `<capture>`, `--spec <ids>`, `--project <dir>` |
| `backlog start` | Cria um item numerado em `specs/backlog/` sem promover uma spec. | `--title <title>`, `--idea <text>`, `--problem`, `--person`, `--result`, `--context`, `--slug <slug>`, `--project <dir>` |
| `tasks next` | Mostra a próxima tarefa pronta da spec com o próximo item da checklist. | `<spec>`, `--all`, `--project <dir>` |
| `tasks check` | Marca ou desmarca uma tarefa, ou um item da checklist, no `spec.md`. | `<spec>`, `<task>`, `[item]`, `--undo`, `--project <dir>` |
| `tasks delivery` | Monta o resumo de entrega: gates, IDs entregues, tarefas, provas e rollback. | `<spec>`, `--format markdown\|json`, `--preview`, `--project <dir>` |

`tasks check` aceita como `[item]` uma key de checklist (`PREP`, `EXECUTE`,
`VERIFY`, `VISUAL`, `EVIDENCE`, `IMPROVE`) ou a posição do item a partir de
1. Sem `[item]`, a própria linha da tarefa muda. `tasks delivery` sem
`--preview` exige Delivery Gate aprovado e nenhuma tarefa aberta.

### Gates

Cada gate sai com 0 quando aprova e com 10 quando encontra problemas. O
`--json` traz a lista em `data.result`.

| Command | Função | Options principais |
| --- | --- | --- |
| `gate spec` | Valida a estrutura da spec no contrato Specsfy/2.0: cabeçalho, seções obrigatórias, IDs US/FR/NFR/AC, cenários BDD e contrato de interface. | `<spec>`, `--allow-draft`, `--project <dir>` |
| `gate tasks` | Valida as tarefas da seção 14: contrato, dependências, cobertura dos IDs e migrations. | `<spec>`, `--allow-draft`, `--project <dir>` |
| `gate interface` | Valida a fase de interface das tarefas de uma spec com interface para pessoas. | `<spec>`, `--project <dir>` |
| `gate trace` | Confere a rastreabilidade entre os IDs da spec e os marcadores dos testes. | `<spec>`, `--kinds <kinds>`, `--full-chain`, `--minimum-tests <n>`, `--project <dir>` |
| `gate acceptance` | Confere se cada item de aceite (AC) tem um resultado aprovado. | `<spec>`, `--attestation <file>`, `--project <dir>` |
| `gate evidence` | Confere as provas materiais das tarefas no Evidence Contract 1. | `<spec>`, `--delivery`, `--task <id>`, `--attestation <file>`, `--project <dir>` |
| `gate findings` | Valida os achados de produto, arquitetura e segurança registrados na spec. | `<spec>`, `--project <dir>` |
| `gate database` | Confere que os testes usam um banco separado e que um comando não apaga dados. | `--command <command>`, `--project <dir>` |
| `verify` | Roda a política inteira do Specsfy e devolve o payload de atestação. É a entrada do CI. | `--boundary local\|git\|ci`, `--attestation <file>`, `--timeout-seconds <seconds>`, `--max-output-bytes <bytes>`, `--self-test`, `--project <dir>` |

`verify` usa os scripts de `.agents/skills/` do projeto. Quando essa pasta
não existe, usa os scripts embutidos no binário e a checagem de skills falha.
O Node.js não é necessário. O `--self-test` exercita a política e os canários
sem olhar as specs.

### Contexto

| Command | Função | Options principais |
| --- | --- | --- |
| `context setup` | Cria o contexto mínimo do projeto (`PROJECT.md`, `.specsfy/STACK.md`, `RULES.md`, `DATABASE.md`) e os blocos em `AGENTS.md` e `CLAUDE.md`, sem sobrescrever arquivos existentes. | `--project <dir>` |
| `context inspect` | Resume as fontes relevantes por grupo: instruções, manifests, rotas, persistência e testes. | `--project <dir>` |
| `context interface` | Resume a stack de interface e as rotas e componentes atuais. | `--project <dir>` |
| `context monitor` | Aponta os documentos de contexto que precisam de revisão para os arquivos alterados. | `--check`, `--paths <paths>`, `--acknowledge-project-no-change`, `--acknowledge-rules-no-change`, `--project <dir>` |
| `context stack` | Atualiza o bloco de stack detectada em `.specsfy/STACK.md`, preservando linhas e notas humanas. | `--project <dir>` |
| `context rule` | Acrescenta uma regra confirmada a uma seção de `.specsfy/RULES.md`. | `--section <title>`, `--rule <text>`, `--project <dir>` |
| `context database` | Atualiza o bloco de estruturas detectadas em `.specsfy/DATABASE.md` a partir de migrations, SQL e schemas Prisma. | `--project <dir>` |
| `context data` | Registra no mapa de dados uma informação confirmada em conversa, uma linha por nome. | `--name <text>`, `--purpose`, `--store`, `--format`, `--links`, `--access`, `--lifecycle`, `--sources`, `--project <dir>` |
| `context usage` | Estima o tamanho do contexto de uma spec por seção ou ingere o uso de tokens medido em JSON. | `<spec>`, `--usage-json <file>`, `--compare <file>`, `--project <dir>` |

`context monitor` sem `--paths` lê o diff do Git, incluindo staged e arquivos
não rastreados. Com `--check`, um documento pendente sai com 10.

### Entrega

| Command | Função | Options principais |
| --- | --- | --- |
| `test` | Detecta o runner e executa a suíte do projeto, exigindo `.env.testing` com `APP_ENV=testing` e um banco separado. | `--project <dir>` |
| `milestones sync` | Reconstrói o progresso de `specs/milestones/` e o índice de `specs.md`. | `--project <dir>` |
| `milestones import-mvp` | Importa os requisitos de `MVP.md` como itens de backlog, specs em Draft e o milestone M01. | `--project <dir>` |
| `docs build` | Reconstrói a documentação do projeto em `docs/` e `.specsfy/PACKAGES.md`; `--check` só confere. | `--check`, `--project <dir>` |

`test` sem a prova do banco separado sai com 10 antes de o PHP iniciar; sem
runner conhecido, sai com 6. Uma suíte que falha sai com 1 e mantém o código
do runner em `data.exitCode`.

### Framework

O grupo instala e mantém o próprio framework no projeto. `install` publica as
skills base, a pasta `.specsfy/` e os blocos gerenciados de `AGENTS.md` e
`CLAUDE.md`; `--detected` usa os agentes encontrados no projeto,
`--specialist <name>` instala um especialista junto com as skills base e
`--force` reescreve o que já existe. `update` atualiza o que está intacto e
preserva arquivos alterados; `--force` atualiza também esses arquivos.
`upgrade` troca o binário em uso pela última release; `--check` apenas
consulta a versão publicada. `skills` gerencia os especialistas do catálogo.

| Command | Função | Options principais |
| --- | --- | --- |
| `install` | Instala as skills base, `.specsfy/` e os blocos gerenciados do projeto. | `--detected`, `--specialist <name>`, `--force`, `--project <dir>` |
| `update` | Atualiza as skills instaladas que continuam intactas. | `--force`, `--project <dir>` |
| `upgrade` | Troca o executável pela última versão publicada. | `--check` |
| `skills list` | Lista as skills instaladas e as disponíveis no catálogo. | `--project <dir>` |
| `skills detect` | Detecta os agentes e skills presentes no projeto. | `--project <dir>` |
| `skills install` | Instala um ou mais especialistas. | `<names>`, `--project <dir>` |
| `skills remove` | Remove especialistas instalados. | `<names>`, `--project <dir>` |
| `skills update` | Atualiza os especialistas instalados. | `--project <dir>` |

Este grupo pertence às specs 0002 (instalação e skills) e 0011 (upgrade do
binário). Quando uma versão ainda não trouxer um dos commands, o `--help`
daquela versão é a lista efetiva.

### Utilitários

| Command | Função | Options principais |
| --- | --- | --- |
| `scripts list` | Lista os scripts do framework embutidos no binário. | nenhuma |
| `scripts run` | Executa um script embutido pelo nome, repassando os arguments. | `<script>`, `[args]`, `--project <dir>` |
| `config list` | Lista cada key de settings.json com o valor efetivo. | nenhuma |
| `config get` | Mostra o valor de uma key. | `<key>` |
| `config set` | Grava um valor em settings.json, convertendo o tipo pelo schema. | `<key>`, `<value>` |
| `config unset` | Remove uma key do arquivo; a key volta ao padrão. | `<key>` |
| `config path` | Imprime a pasta de dados e os caminhos dos arquivos. | nenhuma |
| `config schema` | Lista as keys conhecidas com tipo, padrão e descrição. | nenhuma |
| `credentials set` | Salva ou substitui uma credencial, lendo sem eco ou do stdin. | `<name>`, `--stdin` |
| `credentials get` | Mostra uma credencial mascarada; `--reveal` mostra em claro. | `<name>`, `--reveal` |
| `credentials list` | Lista os nomes salvos, sem valores. | nenhuma |
| `credentials remove` | Remove uma credencial do cofre. | `<name>` |
| `credentials status` | Mostra arquivo, origem da master key e quantidade de credenciais. | nenhuma |
| `credentials clear` | Apaga credentials.json e mantém master.key. | `-y`, `--yes` |
| `credentials rotate-key` | Recifra o cofre com uma chave nova. | `--from-env` |
| `about` | Mostra versão, executável, runtime, plataforma e créditos. | nenhuma |
| `mcp` | Inicia o servidor MCP via stdio. | `--list` |
| `skill` | Imprime a documentação embutida, inteira ou por topic. | `[topic]` |
| `doctor` | Confere runtime, terminal, settings, origem da chave e leitura do cofre. | `--project <dir>` |
| `completion` | Gera o script de completion para um shell. | `<bash\|zsh\|fish>` |

`scripts run` usa o nome impresso por `scripts list`
(`specsfy-04-validate/validate_spec`). Prefira os commands dedicados
(`gate`, `specs`, `tasks`, `context`), que resolvem o identificador da spec e
mapeiam os exit codes. `doctor` não cria arquivos nem mostra segredos; uma
verificação com `fail` sai com 3.

## Diagnóstico e completion

`{{bin}} doctor` confere Bun 1.4.4 ou superior, TTY de stdin/stdout, pasta de
dados com 0700, leitura de settings.json, origem da master key, decifragem do
cofre, versão e plataforma. Cada linha usa ✓, ! ou ✗. Em JSON, `data` contém
`{ checks, ok }`; cada check tem `name`, `status` e `detail`. Ausência de TTY
ou de arquivos ainda não criados gera `warn`. Uma verificação com `fail`
produz exit code 3; as demais retornam 0. O diagnóstico não cria arquivos nem
mostra segredos.

`{{bin}} completion <shell>` imprime o script em stdout. O argument `shell`
aceita `bash`, `zsh` ou `fish`; subcommands, options locais e globais e
valores de enum vêm do registry. Com `--json`, `data` contém
`{ shell, script }`. O script Zsh usa `compdef` e `compadd`, sem
`bashcompinit`. Instale na sessão atual ou acrescente a linha ao arquivo de
inicialização:

```bash
eval "$({{bin}} completion bash)"
eval "$({{bin}} completion zsh)"
# fish
{{bin}} completion fish | source
```

`{{bin}} --skill reference` retorna somente a referência gerada, com
commands, arguments, options e exit codes. `skill reference` tem o mesmo
resultado, sem os capítulos da documentação.

## Como adicionar um command

1. Para um command apoiado em script do framework, declare um
   `ScriptCommandDef` em `src/cli/commands/<grupo>.ts` com `name`, `tool`,
   `script`, `project`, `params`, `effect` e `gate`. A mesma definição gera o
   command CLI e a tool MCP, então os dois não divergem.
2. Para um command nativo, copie `template/command/example.ts` para
   `src/cli/commands/<name>.ts` e preencha `name`, `description`,
   `arguments`, `options`, `examples` e `exitCodes`. Toda option precisa de
   `description`; é ela que aparece no `--help`, no `--skill` e no OpenCLI.
3. Implemente `run(ctx)` devolvendo `{ data, text }`. `data` é o que sai em
   `--json`; `text` é o que sai para humanos. Lance `AppError` (ou use
   `error.*`) para falhas previstas, com o exit code certo.
4. Registre o command em `src/cli/commands.ts` e, quando houver tool, no
   grupo correspondente de `src/mcp/`.
5. Rode `bun test`, `bun run opencli` e confira `docs/opencli.json`.

Segredos nunca entram por argument de linha de comando. Leia pelo stdin ou
por `readSecret()`; grave com `setCredential()`; recupere com
`getCredential()`, que encerra com exit code 4 quando o valor não existe.
