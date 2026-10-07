# Referência dos comandos do Specsfy CLI

Esta referência descreve a interface pública do `specsfy` 0.8.1. O caminho
informado por `--project` deve apontar para a raiz do projeto consumidor. Sem
essa opção, o CLI usa o diretório atual. Os comandos que consultam catálogo ou
versões privadas usam `GH_TOKEN`, `GITHUB_TOKEN` ou a sessão de `gh auth token`.

Para aprender o percurso pela interface visual, consulte o
[guia do CLI e da TUI](cli.md). Para preparar o primeiro projeto, comece pela
[instalação](installation.md).

## `specsfy`

Abre a TUI no diretório atual. Não recebe argumentos. Antes do dashboard, pode
consultar uma versão estável mais recente e pedir autorização para atualizar o
pacote global. A recusa ou uma falha de rede preserva a versão instalada.

Exemplos:

```bash
specsfy
cd aplicativo && specsfy
GH_TOKEN="$TOKEN_SPECSFY" specsfy
GITHUB_TOKEN="$TOKEN_SPECSFY" specsfy
SPECSFY_SPECIALISTS_CATALOG=/tmp/catalog.json specsfy
```

## `specsfy install`

Instala as skills base, regras, templates, exemplo e blocos gerenciados no
projeto. `--detected` acrescenta os especialistas encontrados pela stack.
`--specialist <nome>` pode ser repetido. `--force` permite substituir conteúdo
gerenciado que recebeu alteração local. `--json` emite a lista de caminhos
alterados como JSON. O comando recusa a raiz do monorepo oficial.

Exemplos:

```bash
specsfy install --project .
specsfy install --project ./aplicativo --json
specsfy install --project . --detected
specsfy install --project . --specialist specsfy-specialist-laravel
specsfy install --project . --detected --force --json
```

## `specsfy doctor`

Verifica Node.js, Git, npm, acesso de leitura e escrita ao projeto e a
disponibilidade do `npx`. A resolução usa `npx` encontrado no `PATH` ou o
override técnico `SPECSFY_NPX_COMMAND`; a instalação materializa skills por
`npx skills add`. `--json` retorna cada item, seu estado e o comando
encontrado. Qualquer requisito ausente produz exit code 1.

Exemplos:

```bash
specsfy doctor
specsfy doctor --project .
specsfy doctor --project ./api
specsfy doctor --json
specsfy doctor --project ./api --json
```

## `specsfy update`

Atualiza todas as skills Specsfy registradas no projeto, incluindo skills base,
auxiliares, setup, documentador e especialistas. Skills externas e templates
customizados permanecem intocados. `--force` substitui conteúdo gerenciado
alterado e `--json` informa os caminhos modificados. O comando executa o
diagnóstico de instalação antes do download.

Exemplos:

```bash
specsfy update
specsfy update --project .
specsfy update --project ./api
specsfy update --force
specsfy update --project ./api --force --json
```

## `specsfy upgrade`

Consulta novamente a versão publicada no npm e atualiza o próprio CLI pelo
pacote `@promovaweb/specsfy@latest`. O npm só é executado quando a versão
encontrada é superior à versão atual, o que impede downgrade e ignora um
adiamento anterior. `--json` informa se houve atualização e as versões
envolvidas. O projeto não é alterado.

Exemplos:

```bash
specsfy upgrade
specsfy upgrade --json
GH_TOKEN="$TOKEN_SPECSFY" specsfy upgrade
GITHUB_TOKEN="$TOKEN_SPECSFY" specsfy upgrade --json
PATH="$HOME/.npm-global/bin:$PATH" specsfy upgrade
```

## `specsfy skills list`

Lista o catálogo do framework e dos especialistas. `--json` entrega objetos
estruturados para automação. A leitura consulta o catálogo remoto, exceto
quando `SPECSFY_SPECIALISTS_CATALOG` aponta para uma fonte local.

Exemplos:

```bash
specsfy skills list
specsfy skills list --json
specsfy skills list --json > /tmp/specsfy-skills.json
GH_TOKEN="$TOKEN_SPECSFY" specsfy skills list
SPECSFY_SPECIALISTS_CATALOG=./catalog.json specsfy skills list --json
```

## `specsfy skills detect`

Compara os arquivos do projeto com as regras do catálogo e retorna as skills
recomendadas. `--project <caminho>` seleciona a raiz e `--json` fornece saída
estruturada. O comando apenas consulta, sem instalar arquivos.

Exemplos:

```bash
specsfy skills detect
specsfy skills detect --project .
specsfy skills detect --project ./api --json
GH_TOKEN="$TOKEN_SPECSFY" specsfy skills detect --project .
SPECSFY_SPECIALISTS_CATALOG=./catalog.json specsfy skills detect --json
```

## `specsfy skills install`

Depois de revisar a recomendação e autorizar a instalação, este comando usa
`npx skills add` com o repositório oficial e somente os nomes necessários. Ele
materializa a skill no projeto atual; não instale o catálogo inteiro por padrão.

Exemplos:

```bash
specsfy skills install specsfy-specialist-laravel
specsfy skills install specsfy-specialist-postgres --project ./api
specsfy skills install specsfy-specialist-laravel specsfy-specialist-postgres
specsfy skills install specsfy-specialist-react-ui-components --project .
specsfy skills install specsfy-specialist-interface-experience --project .
```

## `specsfy skills remove`

Remove somente as skills nomeadas e preserva skills externas presentes no
mesmo lock. Os nomes são obrigatórios. Conteúdo local divergente impede a
remoção, a menos que `--force` seja informado. A saída lista os caminhos
alterados.

Exemplos:

```bash
specsfy skills remove specsfy-specialist-laravel
specsfy skills remove specsfy-specialist-postgres --project ./api
specsfy skills remove specsfy-specialist-laravel specsfy-specialist-postgres
specsfy skills remove specsfy-specialist-react-ui-components --project .
specsfy skills remove specsfy-specialist-laravel --project . --force
```

## `specsfy skills update`

Alias compatível de `specsfy update`. Atualiza todas as skills Specsfy já
instaladas. `--project <caminho>` seleciona o projeto. `--force` permite
substituir conteúdo gerenciado alterado e `--json` retorna os caminhos. Skills
externas e arquivos de `.specsfy/templates/custom/` permanecem intocados.

Exemplos:

```bash
specsfy skills update
specsfy skills update --project .
specsfy skills update --project ./api
specsfy skills update --force
specsfy skills update --project ./api --force
```

## `specsfy transition`

Move uma spec para `draft`, `defined`, `planned`, `in-progress`, `review` ou
`completed` e atualiza o campo `Status` no mesmo ato. O identificador e o
estado são obrigatórios. `--json` inclui o caminho resultante e o handoff
opcional do ClickUpfy. O comando recusa transições não permitidas e sincroniza
os milestones após a escrita.

Exemplos:

```bash
specsfy transition 0001-recuperar-senha defined
specsfy transition 0001-recuperar-senha planned --project .
specsfy transition 0001-recuperar-senha in-progress --json
specsfy transition 0001-recuperar-senha review --project ./api
specsfy transition 0001-recuperar-senha completed --project . --json
```

## `specsfy migrate`

Move specs do layout anterior para as pastas do ciclo de vida e alinha o campo
`Status`. `--project <caminho>` seleciona a raiz. `--json` retorna a coleção
`migrated`. Quando não há fonte legada, a execução não altera arquivos.

Exemplos:

```bash
specsfy migrate
specsfy migrate --project .
specsfy migrate --project ./api
specsfy migrate --json
specsfy migrate --project ./api --json
```

## `specsfy effort`

Registra a pontuação inteira de 1 a 10 e sua justificativa na spec. O
identificador, a pontuação e `--reason <texto>` são obrigatórios. `--json`
inclui o resultado e o handoff opcional do ClickUpfy. Pontuação fora do
intervalo ou spec ambígua é recusada.

Exemplos:

```bash
specsfy effort 0001-recuperar-senha 3 --reason "Alteração local."
specsfy effort 0001-recuperar-senha 5 --reason "Inclui testes de integração."
specsfy effort 0001-recuperar-senha 7 --reason "Inclui migração." --project .
specsfy effort 0001-recuperar-senha 8 --reason "Depende de API externa." --json
specsfy effort 0001-recuperar-senha 10 \
  --reason "Entrega distribuída." --project ./api --json
```

## `specsfy inbox process`

Retira de `specs/inbox/` uma captura cujo pedido já está integralmente coberto
por specs com `Definition Gate: Passed` e a guarda em
`specs/inbox/processed/`. O comando marca `Status: Processada`, registra as
specs derivadas e a data em `Processada em`, atualiza as referências à captura
em `specs/backlog/` e nas specs e preserva o texto original. A captura pode ser
indicada pelo nome do arquivo ou pelo caminho. `--spec` é obrigatório e pode
ser repetido quando mais de uma spec cobre o pedido. O comando recusa specs em
`draft` ou com o gate pendente e nunca sobrescreve uma captura já processada.
Decidir se o pedido está inteiro coberto é tarefa da validação; o comando só
executa a mudança.

Exemplos:

```bash
specsfy inbox process 2026-07-28-143205-avisar-clientes.md --spec 0007-avisos-de-atraso
specsfy inbox process specs/inbox/2026-07-28-143205-avisar-clientes.md --spec 0007-avisos-de-atraso --project .
specsfy inbox process 2026-07-28-143205-avisar-clientes.md --spec 0007-avisos-por-email --spec 0008-avisos-por-sms
specsfy inbox process 2026-07-28-143205-avisar-clientes.md --spec 0007-avisos-de-atraso --json
specsfy inbox process 2026-07-28-143205-avisar-clientes.md --spec 0007-avisos-de-atraso --project ./api --json
```

## `specsfy progress`

Lê specs e calcula estados, gates, Effort, tarefas, checklists e porcentagens.
`--json` retorna `summary` e `specs`. `--watch` permanece ativo e só emite um
novo snapshot após mudança das fontes. `--interval <segundos>` configura a
espera do watch e deve ser maior que zero. O comando não altera o projeto.

Exemplos:

```bash
specsfy progress
specsfy progress --project .
specsfy progress --project ./api --json
specsfy progress --watch
specsfy progress --project . --watch --interval 0.5 --json
```

## `specsfy milestones sync`

Projeta os vínculos declarados nas specs e no backlog para `specs.md` e
`specs/milestones/MNN.md`. Somente blocos gerados são substituídos. `--json`
retorna o caminho do índice e os totais de cada milestone. Referências
inválidas ou metadados ambíguos interrompem a escrita.

Exemplos:

```bash
specsfy milestones sync
specsfy milestones sync --project .
specsfy milestones sync --project ./api
specsfy milestones sync --json
specsfy milestones sync --project ./api --json
```

## `specsfy test`

Detecta um projeto Laravel com Pest, executa `php artisan test`, transmite a
saída e devolve o mesmo exit code. `--project <caminho>` seleciona a raiz. O
comando não aceita uma string arbitrária de shell e recusa projetos sem runner
compatível. Antes de iniciar o processo PHP, exige `.env.testing` com
`APP_ENV=testing` e um `DB_DATABASE` ou `DB_URL` explícito, separado do `.env`.
Também recusa `RefreshDatabase` e `DatabaseMigrations`. A TUI aplica o mesmo
gate; quando a configuração estiver pendente, nenhum teste é iniciado.

Exemplos:

```bash
specsfy test
specsfy test --project .
specsfy test --project ./api
NO_COLOR=1 specsfy test --project .
specsfy test --project "./aplicativo Laravel"
```

## `specsfy tui`

Abre explicitamente o dashboard para o projeto selecionado. `--project`
recebe um caminho e usa o diretório atual por padrão. A TUI pode escrever
configuração, instalar skills e executar testes somente após uma ação da
pessoa. `Ctrl+Q` encerra a interface.

Exemplos:

```bash
specsfy tui
specsfy tui --project .
specsfy tui --project ./api
GH_TOKEN="$TOKEN_SPECSFY" specsfy tui --project .
SPECSFY_SPECIALISTS_CATALOG=./catalog.json specsfy tui --project .
```

## `specsfy config show`

Lê a configuração efetiva de `.specsfy/config.json`. `--project` seleciona a
raiz e `--json` fornece saída estruturada. A ausência do arquivo usa os valores
padrão e não cria configuração.

Exemplos:

```bash
specsfy config show
specsfy config show --project .
specsfy config show --project ./api
specsfy config show --json
specsfy config show --project ./api --json
```

## `specsfy config set`

Grava o intervalo de atualização da TUI em `.specsfy/config.json`.
`--watch-interval <segundos>` é obrigatório e aceita número positivo.
`--project` seleciona a raiz e `--json` retorna a configuração resultante.
Chaves desconhecidas existentes são preservadas.

Exemplos:

```bash
specsfy config set --watch-interval 0.5
specsfy config set --project . --watch-interval 0.75
specsfy config set --project ./api --watch-interval 1
specsfy config set --watch-interval 2 --json
specsfy config set --project ./api --watch-interval 5 --json
```

## Justificativa de tamanho

A referência mantém comandos, parâmetros, efeitos, recusas e exemplos no mesmo
arquivo para que a cobertura automatizada compare a gramática executável com
uma única fonte. Separar cada comando impediria essa conferência direta e
espalharia opções compartilhadas por várias páginas.

## Confirmação e diagnóstico

Depois de qualquer escrita, confirme o resultado com uma leitura compatível:
`skills list`, `progress`, `milestones sync --json` ou `config show --json`.
Falhas do CLI são impressas em `stderr` com o prefixo `erro:` e retornam exit
code diferente de zero. `--help` mostra a gramática instalada e `--version`
confirma qual release está sendo executada.
