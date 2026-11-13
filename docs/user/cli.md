# CLI e TUI do Specsfy

O `specsfy` é um binário compilado em Bun. Ele instala e atualiza o framework,
move specs pelo ciclo, roda os gates, mantém o contexto do projeto, executa os
testes detectados e abre a TUI no terminal. O binário embute as skills e os
scripts do framework, portanto não exige Node.js nem Bun instalados na máquina.

Instale primeiro o CLI e o framework seguindo o
[guia de instalação](installation.md). Este guia assume que `specsfy --version`
já responde no terminal e que o framework foi publicado no projeto consumidor.
Para conduzir a primeira fatia depois da instalação, siga o
[guia do primeiro projeto](getting-started.md). Para seleção técnica, automação
e reabertura de gates, consulte o [uso avançado](advanced-usage.md).
Para cada argumento, opção, efeito e formato de saída, use a
[referência dos comandos](cli-reference.md).

Os templates de ideia, backlog, spec, tarefas e informações permanentes ficam
em `.specsfy/templates/`. Customizações com o mesmo nome ficam em
`.specsfy/templates/custom/` e têm precedência sobre os arquivos padrão. Ao
criar uma especificação, `specsfy specs new` renderiza o template resolvido em
`specs/draft/<NNNN>-<slug>/spec.md`. O cabeçalho renderizado é uma tabela
Markdown de duas colunas, `Campo` e `Valor`, com um metadado por linha.

## Instalação e atualização

Baixe o binário da plataforma em `get.specsfy.dev` ou instale pelo npm:

```bash
npm install --global @promovaweb/specsfy
specsfy --version
```

O pacote npm é um wrapper: na primeira execução ele baixa o binário correto para
o sistema operacional. O download direto em `get.specsfy.dev` entrega o mesmo
executável, sem depender de Node.js.

Depois de instalar o programa, prepare o projeto consumidor:

```bash
specsfy doctor --project .
specsfy install --project . --detected
```

Para atualizar o framework do projeto, use `specsfy update`. Para trocar o
próprio binário pela última release, use `specsfy upgrade`. Os dois comandos não
se confundem:

```bash
specsfy update --project .
specsfy upgrade
specsfy upgrade --check
```

`specsfy update` atualiza skills, templates e blocos gerenciados do projeto.
`specsfy upgrade` consulta a release publicada e substitui o executável em uso.
`--check` apenas informa se existe versão nova.

## Skills e especialistas

O comando `install` publica as bases, os templates e os especialistas
detectados:

```bash
specsfy install --project . --detected
specsfy install --project . \
  --specialist specsfy-specialist-laravel \
  --specialist specsfy-specialist-postgres
```

Depois da instalação inicial, os subcomandos de `skills` gerenciam o catálogo:

```bash
specsfy skills list
specsfy skills detect --project .
specsfy skills install specsfy-specialist-laravel --project .
specsfy skills remove specsfy-specialist-laravel --project .
specsfy skills update --project .
```

`skills list` e `skills detect` apenas leem. `skills install`, `skills remove` e
`skills update` alteram o projeto, sempre limitados aos nomes informados. Uma
skill externa ou com alteração local não é removida sem `--force`.

## Ciclo da spec

O ciclo canônico é `draft`, `defined`, `planned`, `in-progress`, `review` e
`completed`. O comando atualiza o campo `Status` junto com a pasta:

```bash
specsfy specs list
specsfy specs show 0001 --content
specsfy specs transition 0001 defined --project .
specsfy specs transition 0001 planned --project .
specsfy specs transition 0001 in-progress --project .
specsfy specs transition 0001 review --project .
specsfy specs transition 0001 completed --project .
```

O identificador da spec aceita número, nome da pasta, slug ou caminho. A raiz do
projeto vem de `--project <dir>`; sem a opção, o CLI usa o diretório atual e
sobe até a raiz mais próxima que contenha `specs/` ou `.specsfy/`.

Para abrir uma spec nova, use:

```bash
specsfy specs new --title "Recuperar senha" --project .
```

O comando aloca o próximo identificador e cria
`specs/draft/<NNNN>-<slug>/spec.md`. Para incorporar um pedido tardio, consulte a
projeção de impacto sem editar a spec:

```bash
specsfy specs change 0001 --base HEAD --mode impact
specsfy specs research 0001
```

Para recalibrar a execução, registre o Effort e a justificativa:

```bash
specsfy specs effort 0001 7 \
  --reason "Inclui migração e integração externa." --project .
```

## Gates e verificação

Os gates usam o mesmo código de saída: `0` aprovado e `10` reprovado. O
resultado em texto lista os problemas; com `--json`, o campo `data` traz o
resultado estruturado.

```bash
specsfy gate spec 0001 --allow-draft
specsfy gate tasks 0001
specsfy gate interface 0001
specsfy gate trace 0001
specsfy gate acceptance 0001
specsfy gate evidence 0001 --delivery
specsfy gate findings 0001
specsfy gate database --project .
specsfy verify --boundary local
```

`specsfy verify` executa a política completa e é a entrada do CI. As fronteiras
`local`, `git` e `ci` aplicam a mesma política. A atestação opcional registra o
commit, os comandos aprovados e os arquivos cobertos.

## Inbox e backlog

Uma captura entra na fila ativa com `inbox capture` e só sai depois que specs
aprovadas cobrem o pedido:

```bash
specsfy inbox list
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
specsfy inbox process 2026-07-28-143205-recuperar-senha.md \
  --spec 0001 --project .
```

O processamento move a captura para `specs/inbox/processed/`, marca
`Status: Processada` e preserva o texto original. O backlog é refinado e
registrado com:

```bash
specsfy backlog list
specsfy backlog start \
  --title "Avisar clientes sobre atrasos" \
  --idea "Clientes ficam sem contexto quando a entrega atrasa." \
  --problem "Falta de contexto durante atrasos." \
  --person "Clientes com entrega em andamento." \
  --result "Reduzir incerteza." \
  --context "Durante a revisão semanal do produto." \
  --project .
```

## Tarefas e progresso

O plano vive dentro da spec. Estes comandos consultam a próxima tarefa,
marcam itens e projetam a entrega:

```bash
specsfy tasks next 0001
specsfy tasks check 0001 T001 PREP
specsfy tasks check 0001 T001 PREP --undo
specsfy tasks delivery 0001 --format markdown
specsfy progress
specsfy progress --spec 0001 --json
specsfy status
```

`tasks delivery` escreve somente em `stdout`; publicar o texto exige pedido
explícito. `progress --watch` atualiza a cada mudança das specs e `--json`
entrega `summary` e `specs` para automação.

## Contexto do projeto

Os arquivos de contexto são mantidos por comandos:

```bash
specsfy context setup --project .
specsfy context inspect --project .
specsfy context interface --project .
specsfy context monitor --project . --check
specsfy context stack --project .
specsfy context rule --project . --section "Testes" --rule "Pest em PHP."
specsfy context database --project .
specsfy context data --project . --name "Pedido" --purpose "Acompanhar a entrega."
specsfy context usage 0001 --json
specsfy docs build --project .
specsfy docs build --project . --check
```

`context monitor --check` retorna `PENDING` quando um documento derivado ficou
desatualizado. `context usage` estima o custo de leitura de uma spec. `docs
build --check` sai com `10` quando a documentação está desatualizada.

## Milestones

```bash
specsfy milestones sync --project .
specsfy milestones import-mvp --project .
```

`milestones sync` projeta os vínculos das specs para `specs.md` e
`specs/milestones/MNN.md`. `milestones import-mvp` converte `MVP.md` em `M01`,
backlog e specs Draft.

## Testes do projeto

O comando `test` detecta o runner da stack, transmite a saída e preserva o
código de saída:

```bash
specsfy test --project .
```

Em Laravel com Pest, ele chama `php artisan test`. Antes de iniciar o processo,
confere `.env.testing`, `APP_ENV=testing` e um banco de teste diferente do banco
de desenvolvimento. Comandos capazes de apagar estruturas são recusados.

## TUI

Execute sem argumentos dentro do projeto consumidor para abrir a TUI:

```bash
specsfy
```

`specsfy tui --project PATH` abre explicitamente outro projeto. A TUI tem sete
abas:

- **Overview**, com o resumo de specs, tarefas, gates, backlog e inbox.
- **Specs**, com a lista e o progresso de cada especificação.
- **Backlog**, com leitura e acompanhamento dos itens.
- **Gates**, com o estado dos gates por spec.
- **Tests**, com a execução do runner detectado.
- **Skills**, com catálogo, detalhes e plano de instalação ou remoção.
- **About**, com versão, runtime, plataforma e créditos.

No dashboard, os cards e as tabelas combinam o estado global com a situação de
cada spec:

- quantidade total e concluída de specs.
- tarefas `T...` concluídas, pendentes e totais.
- itens de checklist concluídos, pendentes e totais.
- gates aprovados por spec.
- porcentagem e barra de progresso global.
- porcentagem e barra de progresso de cada spec.

### Percurso visual

#### Overview: visão consolidada

![Dashboard Home](assets/cli/cli-dash.png)

A Overview reúne o total de specs, o avanço das tarefas e checklists e a
porcentagem global. O diretório selecionado aparece no topo e o rodapé confirma
quantas specs estão completas.

#### Backlog: lista e leitura lado a lado

![Backlogs](assets/cli/cli-backlogs.png)

A aba Backlog mantém a seleção na coluna esquerda e renderiza o Markdown do item
na direita. Assim é possível conferir metainformação, status e conteúdo sem
abandonar o dashboard.

#### Specs: gates, tarefas e progresso

![Specs](assets/cli/cli-specs.png)

A aba Specs compara status, gates, tarefas, checklists e porcentagem por
especificação. A linha destacada abre a spec completa em um modal Markdown. Use
`Esc` para voltar à lista.

#### Skills: planejar antes de aplicar

![Skills](assets/cli/cli-skills.png)

A aba Skills combina busca, filtros, plano, categoria e estado com o painel de
detalhes da seleção. Nada muda no projeto até a ação **Aplicar**.

## Servidor MCP

O agente usa o mesmo binário pela entrada `mcp`:

```bash
specsfy mcp
```

A configuração do cliente MCP é:

```json
{
  "command": "specsfy",
  "args": ["mcp"]
}
```

O servidor expõe os commands como tools, entre elas `inbox_capture`,
`backlog_start`, `spec_create`, `spec_transition`, `spec_effort`, `task_next`,
`task_check`, `delivery_render`, `gate_spec`, `gate_tasks`, `gate_interface`,
`gate_trace`, `gate_acceptance`, `gate_evidence`, `gate_findings`,
`gate_database`, `verify`, `context_setup`, `context_inspect`,
`context_interface`, `context_monitor`, `context_stack`, `context_rule`,
`context_database`, `context_data`, `context_usage`, `docs_build`,
`milestones_sync` e `milestones_import_mvp`. O agente não precisa chamar script
algum.

## Documentação embutida

`specsfy --skill` imprime a documentação do framework embutida no binário. Um
tema específico pode ser consultado com `specsfy skill <tema>`. A mesma
documentação fica disponível pelo MCP no recurso `specsfy://skill`.

## Configuração e credenciais

As preferências ficam em `~/.specsfy/settings.json` e são lidas por:

```bash
specsfy config list
specsfy config get output.format
specsfy config set output.colors false
specsfy config unset output.colors
specsfy config path
specsfy config schema
```

Os segredos ficam cifrados em `~/.specsfy/credentials.json`:

```bash
specsfy credentials set github.token --stdin
specsfy credentials status
specsfy credentials list
specsfy credentials remove github.token
```

A credencial `github.token` é usada para consultar o catálogo e as releases.
`GH_TOKEN`, `GITHUB_TOKEN` e `gh auth token` continuam aceitos nesta ordem.

## Diagnóstico

`specsfy doctor` confere o runtime embutido, o terminal, as configurações, a
origem da chave e a leitura do cofre. `--project <dir>` acrescenta as checagens
do projeto, como `git`, `npx`, o lock de skills e o token do GitHub. Qualquer
requisito ausente produz código de saída `1`.

## Justificativa de tamanho

Comandos, TUI e MCP operam os mesmos arquivos do projeto. Reuni-los nesta página
permite comparar a ação no terminal com o resultado mostrado na TUI, sem
duplicar explicações sobre progresso e proteção de alterações locais.

## Segurança e reversibilidade

- O destino padrão das skills é `<projeto>/.agents/skills`.
- As regras centrais ficam em `<projeto>/.specsfy/Spec.md`.
- Template e exemplo ficam em `<projeto>/.specsfy/templates/Spec.md` e
  `<projeto>/.specsfy/examples/Spec.md`.
- Templates personalizados ficam em `<projeto>/.specsfy/templates/custom/`, fora
  do lock e protegidos até mesmo de operações com `--force`.
- `AGENTS.md` e `CLAUDE.md` recebem somente blocos delimitados e atualizáveis.
- O registro fica em `<projeto>/.specsfy/skills-lock.json` e cada skill
  gerenciada registra um fingerprint de conteúdo.
- Uma execução repetida sobre a mesma versão não altera arquivos nem o lock.
- Alterações locais fazem a atualização e a remoção serem recusadas. Use
  `--force` somente depois de confirmar que a versão customizada pode ser
  descartada.
- `specsfy skills remove <nome>` remove somente o nome explícito e preserva
  conteúdo local divergente.
