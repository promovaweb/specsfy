# Referência dos comandos do Specsfy

Esta referência descreve a interface pública do `specsfy` gerado a partir do
framework. O caminho informado por `--project` aponta para a raiz do projeto
consumidor. Sem a opção, o CLI usa o diretório atual e sobe até a raiz mais
próxima que contenha `specs/` ou `.specsfy/`. Os comandos que consultam catálogo
ou releases usam a credencial `github.token`, `GH_TOKEN`, `GITHUB_TOKEN` ou a
sessão de `gh auth token`, nesta ordem.

Para aprender o percurso pela interface visual, consulte o
[guia do CLI e da TUI](cli.md). Para preparar o primeiro projeto, comece pela
[instalação](installation.md).

## `specsfy`

Abre a TUI no diretório atual. Não recebe argumentos. A TUI reúne as abas
Overview, Specs, Backlog, Gates, Tests, Skills e About.

```bash
specsfy
cd aplicativo && specsfy
specsfy --help
specsfy --version
```

## `specsfy --skill`

Imprime a documentação do framework embutida. O argumento opcional escolhe um
tema. A saída é Markdown e também fica disponível no recurso MCP
`specsfy://skill`.

```bash
specsfy --skill
specsfy skill cli
specsfy skill gates
```

## `specsfy install`

Publica as skills base, `.specsfy/`, templates e blocos gerenciados de
`AGENTS.md` e `CLAUDE.md`. `--detected` instala os especialistas encontrados
pela stack. `--specialist <nome>` pode ser repetido. `--force` substitui
conteúdo gerenciado que recebeu alteração local. `--json` emite a lista de
caminhos alterados.

```bash
specsfy install --project .
specsfy install --project . --detected
specsfy install --project . --specialist specsfy-specialist-laravel
specsfy install --project . --detected --force --json
```

## Framework e skills

| Comando | O que faz |
| --- | --- |
| `specsfy update` | Atualiza skills, templates e blocos gerenciados do projeto. Skills externas e arquivos de `.specsfy/templates/custom/` permanecem intactos. `--force` substitui conteúdo gerenciado alterado e `--json` informa os caminhos modificados. |
| `specsfy upgrade` | Consulta a última release e substitui o próprio binário em uso. `--check` apenas informa se existe versão nova. O projeto não é alterado. |
| `specsfy skills list` | Lista o catálogo do framework e dos especialistas. `--json` entrega objetos estruturados. A leitura usa a credencial `github.token`. |
| `specsfy skills detect` | Compara o projeto com as regras do catálogo e retorna as skills recomendadas. O comando apenas consulta, sem instalar arquivos. |
| `specsfy skills install` | Materializa as skills nomeadas no projeto. Não instala o catálogo inteiro. |
| `specsfy skills remove` | Remove somente as skills nomeadas e preserva skills externas. Conteúdo local divergente impede a remoção, a menos que `--force` seja informado. |
| `specsfy skills update` | Atualiza as skills Specsfy já instaladas. `--force` substitui conteúdo gerenciado alterado e `--json` retorna os caminhos. Skills externas e templates personalizados permanecem intactos. |

Opções e exemplos completos saem em `specsfy <comando> --help`.

## `specsfy status` e `specsfy progress`

`status` mostra o resumo do projeto: specs por estado, gates, tarefas,
checklists, backlog e inbox. `progress` projeta o mesmo conjunto com filtro por
spec e modo contínuo.

Opções de `progress`: `--spec <spec>`, `--watch` e `--json`. O identificador
aceita número, nome da pasta, slug ou caminho. `--watch` emite um novo retrato
somente quando as specs mudam; com `--json`, imprime uma linha por mudança.

```bash
specsfy status
specsfy status --json
specsfy progress
specsfy progress --spec 0001 --json
specsfy progress --watch
```

## Specs e tarefas

| Comando | O que faz |
| --- | --- |
| `specsfy specs list` | Lista as specs com estado, gates e progresso de tarefas. `--state` filtra por `draft`, `defined`, `planned`, `in-progress`, `review`, `completed` ou `legacy`. `--json` entrega objetos estruturados. |
| `specsfy specs show` | Mostra metadados, gates, tarefas e checklist de uma spec. `--content` inclui o Markdown completo. |
| `specsfy specs new` | Cria `specs/draft/<NNNN>-<slug>/spec.md` a partir do template resolvido. Aceita `--title`, `--slug` e `--project`. O comando aloca o próximo identificador local e imprime o caminho absoluto. |
| `specsfy specs effort` | Registra a pontuação inteira de 1 a 10 e sua justificativa na spec. O identificador, a pontuação e `--reason <texto>` são obrigatórios. Pontuação fora do intervalo ou spec ambígua é recusada. |
| `specsfy specs research` | Carrega e confere a pesquisa indexada da spec. O identificador é obrigatório e aceita número, nome da pasta, slug ou caminho. |
| `specsfy specs change` | Projeta o impacto de um pedido tardio sem editar a spec. `--base <ref>` escolhe a referência de comparação e `--mode impact\|changelog` escolhe a leitura. `changelog` lista IDs adicionados, removidos e alterados. |
| `specsfy specs migrate` | Converte o layout anterior `specs/specs/` e alinha o campo `Status`. Quando não há fonte legada, a execução não altera arquivos. |
| `specsfy tasks next` | Mostra a próxima tarefa pronta da spec e diferencia trabalho concluído de dependência ainda aberta. `--all` lista todas as tarefas prontas. |
| `specsfy tasks check` | Marca ou desmarca o checkbox da tarefa ou de um item do checklist. `--undo` desfaz a marcação. |
| `specsfy tasks delivery` | Projeta o resumo de entrega sem criar arquivo. Escreve somente em `stdout`. `--format markdown\|text` escolhe o formato. `--preview` é usado enquanto a entrega estiver aberta. |

Opções e exemplos completos saem em `specsfy <comando> --help`.

## `specsfy specs transition`

Move a spec para `draft`, `defined`, `planned`, `in-progress`, `review` ou
`completed` e atualiza o campo `Status` no mesmo ato. O identificador e o estado
são obrigatórios. Uma transição fora da ordem do método sai com código `2` e
explica os destinos aceitos.

```bash
specsfy specs transition 0001 defined
specsfy specs transition 0001 planned --project .
specsfy specs transition 0001 in-progress --json
specsfy specs transition 0001 review --project ./api
specsfy specs transition 0001 completed --project .
```

## Inbox e backlog

| Comando | O que faz |
| --- | --- |
| `specsfy inbox list` | Lista capturas de `specs/inbox/`. `--all` inclui as processadas em `specs/inbox/processed/`. |
| `specsfy backlog list` | Lista itens de `specs/backlog/` com identificador, status e título. |
| `specsfy backlog start` | Cria um item de backlog a partir de uma ideia, formulação original, problema, pessoa, resultado e contexto. Aceita `--slug` e `--project`. |

Opções e exemplos completos saem em `specsfy <comando> --help`.

## `specsfy inbox capture`

Cria uma captura timestampada com o texto integral e a análise silenciosa. Os
campos aceitam `--input`, `--title`, `--summary`, `--problem`, `--people`,
`--value`, `--signals`, `--risks`, `--directions`, `--review`, `--data`,
`--session`, `--turn` e `--sources`. O comando não sobrescreve capturas
existentes.

```bash
specsfy inbox capture \
  --input "Clientes ficam sem contexto quando a entrega atrasa." \
  --title "Avisar clientes sobre atrasos" \
  --summary "Notificar clientes afetados." \
  --problem "Falta de contexto durante atrasos." \
  --people "Clientes com entrega em andamento." \
  --value "Reduzir incerteza." \
  --signals "Canal sugerido: e-mail." \
  --review "Definir gatilho e conteúdo." \
  --project .
```

## `specsfy inbox process`

Retira de `specs/inbox/` uma captura integralmente coberta por specs com
`Definition Gate: Passed` e a guarda em `specs/inbox/processed/`. `--spec` é
obrigatório e pode ser repetido. Cada spec precisa estar fora de `draft`,
declarar `Status` diferente de `Draft` e `Definition Gate: Passed` na primeira
tabela de metadados. Se qualquer spec falhar, nada é movido.

```bash
specsfy inbox process \
  2026-07-28-143205-avisar-clientes.md \
  --spec 0007-avisos-de-atraso
specsfy inbox process \
  2026-07-28-143205-avisar-clientes.md \
  --spec 0007-avisos-por-email \
  --spec 0008-avisos-por-sms \
  --project . --json
```

## `specsfy gate`

Roda um gate sobre a spec. O código de saída `0` aprova e `10` reprova. Com
`--json`, o campo `data` traz o resultado estruturado.

| Gate | Opções principais |
| --- | --- |
| `gate spec <spec>` | `--allow-draft` |
| `gate tasks <spec>` | `--allow-draft`, `--delivery` |
| `gate interface <spec>` | nenhuma |
| `gate trace <spec>` | `--kinds`, `--full-chain`, `--minimum-tests` |
| `gate acceptance <spec>` | `--attestation <arquivo>` |
| `gate evidence <spec>` | `--delivery`, `--task`, `--attestation <arquivo>` |
| `gate findings <spec>` | nenhuma |
| `gate database` | `--project <dir>`, `--command` |

```bash
specsfy gate spec 0001 --allow-draft
specsfy gate tasks 0001
specsfy gate interface 0001
specsfy gate trace 0001 --full-chain
specsfy gate acceptance 0001 --attestation run.json
specsfy gate evidence 0001 --task T001
specsfy gate findings 0001
specsfy gate database --project . --command "php artisan test"
```

## `specsfy verify`

Executa a política inteira e é a entrada do CI. `--boundary local|git|ci`
escolhe a fronteira, `--attestation <arquivo>` grava a atestação e
`--timeout-seconds` e `--max-output-bytes` limitam a execução. O código de saída
`10` indica gate reprovado.

```bash
specsfy verify --boundary local
specsfy verify --boundary ci --json
specsfy verify --attestation run.json
```

## Contexto do projeto

| Comando | O que faz |
| --- | --- |
| `specsfy context setup` | Renderiza `PROJECT.md`, `STACK.md`, `RULES.md`, `DATABASE.md`, `INTERFACE.md`, `DESIGNSYSTEM.MD` e `.specsfy/USER-PROFILE.md`. Prefere `.specsfy/templates/custom/<Nome>.md` e recorre aos templates gerenciados. O comando é idempotente e não substitui arquivos existentes. |
| `specsfy context inspect` | Lê o projeto e devolve as fontes na ordem recomendada: instruções, manifests, configuração, aplicação, rotas, persistência, integrações, interface, testes e documentação. |
| `specsfy context interface` | Inspeciona rotas, componentes e telas para orientar uma descoberta de interface. |
| `specsfy context monitor` | Classifica mudanças staged, unstaged e untracked e aponta contexto derivado desatualizado. `--check` retorna `PENDING` quando existe pendência. `--acknowledge-project-no-change` e `--acknowledge-rules-no-change` registram uma avaliação sem impacto material. |
| `specsfy context stack` | Atualiza o bloco `specsfy:stack` de `.specsfy/STACK.md` a partir de manifests, lockfiles e configurações, preservando o conteúdo humano. |
| `specsfy context rule` | Registra uma regra confirmada em `.specsfy/RULES.md` com `--section` e `--rule`. |
| `specsfy context database` | Atualiza o bloco `specsfy:database` de `.specsfy/DATABASE.md` a partir de schemas, migrations, models e configurações, sem copiar dados ou segredos. |
| `specsfy context data` | Registra informações confirmadas na seção `Informações a guardar confirmadas`. Aceita `--name`, `--purpose`, `--store`, `--format`, `--links`, `--access`, `--lifecycle` e `--sources`. |
| `specsfy context usage` | Estima o custo de leitura de uma spec. `--json` devolve a leitura estruturada. |

Opções e exemplos completos saem em `specsfy <comando> --help`.

## Documentação e milestones

| Comando | O que faz |
| --- | --- |
| `specsfy docs build` | Reconstrói `docs/` e `.specsfy/PACKAGES.md` a partir do código e das specs. `--check` sai com `10` quando a documentação está desatualizada. |
| `specsfy milestones sync` | Projeta os vínculos das specs para `specs.md` e `specs/milestones/MNN.md`. Somente blocos gerados são substituídos. |
| `specsfy milestones import-mvp` | Converte `MVP.md` em `M01`, backlog e specs Draft. Aceita os mesmos campos da entrevista de MVP e `--project`. |

Opções e exemplos completos saem em `specsfy <comando> --help`.

## `specsfy test`

Detecta o runner da stack, executa os testes e preserva o código de saída. Em
Laravel com Pest, chama `php artisan test`. O comando não aceita uma string
arbitrária de shell e recusa projeto sem runner compatível. Antes de iniciar o
processo PHP, exige `.env.testing`, `APP_ENV=testing` e um banco de teste
separado do banco de desenvolvimento.

```bash
specsfy test
specsfy test --project .
specsfy test --project ./api
NO_COLOR=1 specsfy test --project .
```

## `specsfy tui`

Abre explicitamente a TUI para o projeto selecionado. `--tab` escolhe a aba
inicial. A TUI só escreve configuração, instala skills e executa testes depois
de uma ação da pessoa. `Ctrl+Q` encerra a interface.

```bash
specsfy tui
specsfy tui --project .
specsfy tui --project ./api --tab about
```

## Utilitários

| Comando | O que faz |
| --- | --- |
| `specsfy config` | Lê e grava preferências em `~/.specsfy/settings.json`. Os subcomandos são `list`, `get`, `set`, `unset`, `path` e `schema`. |
| `specsfy credentials` | Guarda segredos cifrados em `~/.specsfy/credentials.json`. Os subcomandos são `set`, `get`, `list`, `remove`, `status` e `clear`. `--stdin` lê o valor da entrada padrão. A credencial `github.token` alimenta o catálogo, as releases e o diagnóstico do projeto. |
| `specsfy doctor` | Confere o runtime embutido, o terminal, as configurações, a origem da chave e a leitura do cofre. `--project <dir>` acrescenta as checagens do projeto (Git, `npx`, lock de skills e token do GitHub). Qualquer checagem reprovada produz código de saída `3`. |
| `specsfy scripts run` | Executa um script embutido pelo nome impresso em `specsfy scripts list`. É a saída de emergência para um script sem command dedicado. Os argumentos depois de `--` chegam ao script sem alteração. |

Opções e exemplos completos saem em `specsfy <comando> --help`.

## `specsfy mcp`

Inicia o servidor MCP sobre `stdio`. `--list` lista tools, recursos e prompts. A
configuração do cliente é:

```json
{
  "command": "specsfy",
  "args": ["mcp"]
}
```

```bash
specsfy mcp
specsfy mcp --list
```

## Códigos de saída

| Código | Nome | Significado |
| --- | --- | --- |
| `0` | `SUCCESS` | sucesso |
| `1` | `GENERIC_ERROR` | falha geral, sem classificação específica |
| `2` | `USAGE` | uso inválido de argumentos, opções ou subcomando |
| `3` | `CONFIG` | `settings.json` ausente ou inválido, chave desconhecida ou diagnóstico com requisito reprovado |
| `4` | `CREDENTIALS` | cofre ilegível, chave mestra ausente ou credencial não encontrada |
| `5` | `NETWORK_OR_API` | falha de rede ou resposta inesperada da API |
| `6` | `NOT_FOUND` | recurso não encontrado, como o projeto, a spec ou o arquivo |
| `7` | `PERMISSION` | permissão negada ao ler ou gravar no sistema de arquivos |
| `8` | `NO_TTY` | a TUI exige um terminal interativo (TTY) |
| `9` | `MCP` | o servidor MCP falhou ao iniciar ou perdeu o transporte stdio |
| `10` | `GATE_FAILED` | gate ou validação do Specsfy reprovada |
| `130` | `INTERRUPTED` | entrada cancelada ou processo interrompido (Ctrl+C) |

A tabela segue `cli/src/app/exit-codes.ts`, a mesma fonte de `specsfy --help`
e de `specsfy --skill exit-codes`.

## Confirmação e diagnóstico

Depois de qualquer escrita, confirme o resultado com uma leitura compatível:
`specs show`, `progress`, `milestones sync --json` ou `config list`. Falhas do
CLI são impressas em `stderr` com o prefixo `erro:` e retornam código diferente
de zero. `--help` mostra a gramática instalada e `--version` confirma qual
release está em execução.

## Justificativa de tamanho

Esta página reúne todos os comandos do binário em um só lugar, para consulta
rápida. Os grupos de menor uso aparecem em tabelas; os comandos centrais do
método mantêm seção própria com exemplos.
