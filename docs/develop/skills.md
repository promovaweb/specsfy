# Arquitetura das skills

Skills são unidades executáveis de orientação. Cada uma possui gatilho,
responsabilidade, limites, fluxo, validação e relações com outras skills.

## Catálogos

| Diretório | Conteúdo |
| --- | --- |
| `skills/` | método base, setup, auxiliares e documentador do consumidor |
| `specialists/` | conhecimento técnico opcional |
| `.agents/skills/` | operações exclusivas do monorepo |

Skills locais do monorepo não são instaladas em consumidores.

## Estrutura

Uma skill típica usa:

```text
<nome>/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── scripts/
├── references/
└── assets/
```

Somente `SKILL.md` é obrigatório em todos os casos. Os demais diretórios
existem quando a responsabilidade exige.

## Frontmatter e descoberta

`SKILL.md` declara:

```yaml
---
name: specsfy-08-exemplo
description: "Use quando...; não use para..."
---
```

`name` deve coincidir com o diretório. `description` é o contrato de
descoberta: contém gatilhos observáveis e limites negativos. Se duas skills
disputam a mesma solicitação, corrija as descrições e os limites antes de
adicionar mais instruções.

`agents/openai.yaml` fornece o prompt padrão, menciona `$<nome-da-skill>` e
define o nome exibido. Os identificadores técnicos permanecem em minúsculas,
mas o nome exibido segue estes padrões: `Specsfy - 01 - Nome` para as seis
skills centrais numeradas, `Specsfy - Nome` para as demais skills base e
`Specsfy - Especialista - Nome` para o catálogo técnico opcional.

## Corpo e referências

O corpo usa instruções imperativas e mantém o fluxo essencial perto da ação.
Em `references/`, indique quando ler detalhes, padrões externos e matrizes.

As skills base usam sinais da demanda, da spec e do código. O
[gerador de sinais](../../scripts/specialist-signals.mjs) replica a tabela
de `specialists/catalog.json` nas referências. Após alterar os sinais, rode
`npm run signals` e `npm run signals:check` na raiz.
[specialist-flow.test.mjs](../../skills/tests/specialist-flow.test.mjs) também
confere as tabelas e os modos com o catálogo.
Em `No Specsfy`, **Fonte de entrada por fase** precede a leitura da spec.

O [template da spec](../../skills/templates/Spec.md) armazena os nomes curtos
no cabeçalho e associa modo, sinal e fases na seção 8. A fase 05 escreve a
seção 14 e registra cada `Especialista:` sem checkbox, entre a tarefa e seu
checklist. Isso preserva a seleção da próxima tarefa e a contagem dos seis
itens canônicos.

Scripts automatizam transformações determinísticas, retornam códigos úteis
e evitam instalação global ou ações destrutivas por padrão.
`scripts/semver.mjs` do especialista de entrega gerencia o `SEMVER` na raiz
do consumidor, gera a referência Docker e recusa tags com versão divergente.

O planejador marca mudanças na estrutura do banco com `[MIGRATION]`. O
validador exige um arquivo versionado em um diretório de migrations. No Ato
III, `verify_evidence.mjs` exige o arquivo, o comando de aplicação e uma
consulta posterior do estado.

O consumidor pode ampliar o reconhecimento dos comandos por meio de
`.specsfy/migrations.json`, relativo à raiz passada ao validador. O objeto
contém `apply` e `status`, ambos arrays não vazios de strings com expressões
regulares JavaScript, compiladas sem flags. Os padrões complementam os
runners nativos. Erros de leitura, JSON ou expressão são devolvidos em
`errors`, com `result: failed` e código de saída 1 no contrato estrito.
A ausência do arquivo preserva o comportamento nativo, e o modo legado
continua ignorando a configuração quando não há `Evidence Contract`.

O reconhecimento apenas examina os comandos registrados; nenhum runner é
executado por essa configuração. A conferência de arquivos e de saída zero
permanece obrigatória. `update_stack.mjs` registra a declaração do runner sem
reescrever sua configuração. Os casos executáveis ficam em
`skills/tests/migration-runner.test.mjs`; o guia de
[implementação](../user/skills/specsfy-06-implement.md#runner-próprio-de-migrations)
mostra a configuração do consumidor.

`specsfy-specialist-delivery` coordena release e deploy, com Docker e Servidor
como dependências do catálogo. O scaffold gera `compose.yaml` para
desenvolvimento, `stack.yaml` para produção e os arquivos Ansible para
preparar o usuário `deploy`, o Docker Engine e o Swarm. Publicações e
alterações remotas exigem autorização explícita.

O scaffold usa `cloudflare-tunnel` como valor padrão de `--proxy`. Nesse modo,
ele acrescenta `cloudflared` à rede overlay da aplicação, cria a referência ao
Docker Secret `cloudflare_tunnel_token` e inclui
`vault_cloudflare_tunnel_token` nos campos protegidos pelo Ansible Vault. O
valor `external` omite esses componentes quando a pessoa escolhe outro proxy.

Com `--pipeline`, o scaffold gera também `.github/workflows/deploy.yml`,
`ansible/stack-deploy.yml` e `ansible/stack-verify.yml`. A
[referência do pipeline](../../specialists/specsfy-specialist-delivery/references/pipeline.md)
explica a configuração.

### Contrato operacional do deploy

O gerador publica um wrapper `deploy` na raiz do consumidor. Esse arquivo
mantém a interface humana curta e encaminha cada ação para a implementação em
`ansible/`:

<!-- markdownlint-disable MD013 -->
| Entrada | Implementação | Contrato |
| --- | --- | --- |
| `check-hosts` | `check-hosts.mjs` | mostra hosts e testa conexões |
| `secrets` | `create-vault.sh` | inclui valores ausentes no Vault |
| `sync-keys` | `sync-keys.yml` e `keys.yml` | inclui chaves `.pub` |
| `configure-vault` | `vault.mjs` | cadastra a senha fora do repositório |
| `run` | `vault.mjs`, `check-hosts.mjs` e `deploy.yml` | confere e publica a stack |
<!-- markdownlint-enable MD013 -->

`run` sem opções mantém o prompt oculto. `run --non-interactive` resolve fontes
explícitas, configuração nativa via `ansible-config` e cadastro local, nessa
ordem. O utilitário remove prompts herdados do ambiente e executa subprocessos
sem stdin nem terminal controlador. O preflight local força a descriptografia
com `to_json(vault_to_text=True)` e `no_log`, pois carregar o inventário não
descriptografa necessariamente todas as strings. Uma falha nessa etapa ocorre
antes das conexões e não tenta outra fonte.

`configure-vault` deriva o destino externo do caminho real do checkout,
respeita `XDG_CONFIG_HOME`, recusa destinos internos e links simbólicos e grava
com substituição atômica. A pasta recebe `700` e o arquivo `600` antes da
publicação. O cadastro humano exige confirmação antes de sobrescrever e não
altera o Vault criptografado. A senha manual usa temporário `600`, removido ao
final do contexto de execução. `secrets` compartilha a resolução de fontes e
preserva o YAML anterior quando um campo novo falha.

Os assets `deploy.sh`, `create-vault.sh` e `vault.mjs` são copiados pelo scaffold.
Projetos existentes precisam de migração por diff dos quatro utilitários,
incluindo `check-hosts.mjs`; o gerador continua recusando sobrescrita. O manual
de [operações de deploy](../user/deploy-vault.md) documenta cada comando,
suas opções, permissões, falhas e exemplos.

Os testes `specialists/tests/deploy-node.test.mjs` executam os utilitários
Node.js em projetos temporários e exercitam prompts em um terminal PTY. Os
comandos Ansible são substituídos por processos Node.js que verificam argumentos,
ordem das chamadas e configuração do ambiente. Esses contratos cobrem arquivo,
script, ambiente, `ansible.cfg`, Vault ID, cadastro, permissões e falhas antes
das conexões. Eles não executam a criptografia do Ansible nem acessam servidores.
A suíte integrada compara as opções do parser com o manual e exige cinco
exemplos por comando.

O job de especialistas instala ShellCheck e executa os mesmos contratos Node.js
de terminal no CI. A suíte usa substitutos dos comandos Ansible e não precisa
instalar `ansible-core`.

`ANSIBLE_INVENTORY` seleciona um inventário alternativo somente para o
processo atual. Sem a variável, o wrapper exige
`ansible/inventory.yml`. O arquivo `inventory.example.yml` não pode ser usado
silenciosamente como alvo real.

A descoberta de máquinas pertence ao modo Debian do especialista Servidor, sob
coordenação da entrega. Ele coleta um host por rodada e registra alias, `ansible_host`,
`ansible_port`, `ansible_user` e grupo do Swarm. Uma solicitação para adicionar
servidor mescla a nova entrada, preserva os hosts atuais e executa a sequência
conexão, chave pública, baseline Debian, Docker Engine e ingresso no Swarm.

O host usa `deploy` como conta operacional com acesso ao Docker e diretórios em
`/opt/apps`. O container mantém `app` como usuário sem privilégios do processo.
Essa separação impede que um nome represente ao mesmo tempo a administração do
servidor e o runtime da aplicação.

Templates de documentos gerenciados vivem em `skills/templates/` e são
publicados juntos em `.specsfy/templates/`. Nos projetos consumidores, um
arquivo homônimo em `.specsfy/templates/custom/` tem precedência. Esse
diretório pertence ao usuário e não entra no lock nem nas atualizações do CLI.
Assets internos permanecem materiais de saída específicos de uma skill, nunca
uma segunda fonte normativa.

## Modos de interação

Cada `SKILL.md` declara `perguntas` ou `sem perguntas`. Uma skill no primeiro
modo aplica o contrato de `skills/Spec.md` sempre que solicitar escolha,
confirmação, autorização, runner, arquivo ou próximo passo. A rodada contém
uma pergunta numerada; ela contém três ou mais opções, `Escrever outra resposta`,
`Gere outras opções` e `Avançar` desde a primeira rodada. Ao
escolher outras opções, a mesma pergunta retorna com alternativas diferentes.
O rótulo é `Pergunta 1`.
Ao receber `Avançar`, a próxima rodada confirma encerramento definitivo da
área, adiamento ou retomada imediata. A skill registra
`Área encerrada pelo usuário: <área>` ou `Área adiada pelo usuário: <área>` no
artefato aplicável. Uma área encerrada só volta ao roteiro após reabertura
explícita da pessoa.

As skills sem perguntas não improvisam uma entrevista. Elas preservam a
entrada, atualizam projeções derivadas ou encaminham a lacuna para uma skill
conversacional.

<!-- markdownlint-disable MD013 -->
<!-- markdownlint-disable MD013 -->
| Modo | Skills |
| --- | --- |
| perguntas | `specsfy-02-backlog`, `specsfy-03-specify`, `specsfy-04-validate`, `specsfy-05-tasks`, `specsfy-06-implement`, `specsfy-interviewer`, `specsfy-milestones`, `specsfy-setup`, `specsfy-update-spec` |
| sem perguntas | `specsfy-01-inbox`, `specsfy-documentator` |

A `specsfy-setup` pergunta nos modos `setup`, `rules` e `data-discovery` e não
pergunta nos modos `stack` e `database`.

<!-- markdownlint-enable MD013 -->
<!-- markdownlint-enable MD013 -->

## Handoff

As skills base participam da orquestração:

```text
Pendência detectada → Transição automática → execução da skill de destino
→ Retomada automática
```

O handoff é usado quando a responsabilidade muda. A skill de origem não executa
silenciosamente o trabalho da vizinha. A skill de destino relê a spec e valida
suas próprias pré-condições.

`specsfy-01-inbox` é a exceção de entrada: ela registra a entrada antes de
qualquer handoff, não pergunta e apenas sugere a próxima etapa. Esse limite
impede que uma anotação simples se transforme em refinamento implícito.

O modo `mvp` de `specsfy-milestones` combina conversa e captura: ele lê
`MVP.md` e `BRAND.md` na raiz do consumidor e, quando o consumidor é um
submódulo Git sem os arquivos locais, na raiz do superprojeto. O arquivo local
tem prioridade. Ele importa `MVP.md` como `M01`, classifica o que representa
desenvolvimento e cria backlog apenas para esses itens, sem criar Inboxes.
Visão, público, princípios e contexto sem comportamento executável permanecem
somente no `MVP.md` e não viram artefato do Specsfy. Antes de perguntar, o
backlog lê o trecho importado, aplica
respostas já declaradas e defaults inequívocos e cobre somente lacunas,
ambiguidades ou contradições. Ao terminar cada backlog, a skill cria sua spec
Draft, marca o que não foi respondido como `Pendente` e não implementa código
nem passa gates. Quando necessário, chama `$specsfy-setup` no modo
`data-discovery`; depois sincroniza milestones, sem sobrescrever arquivos
existentes.

O modo `data-discovery` de `$specsfy-setup` traduz a conversa de produto em
informações a guardar no `DATABASE.md`. Ele não escolhe estrutura interna;
backlog, descoberta de MVP e especificação a carregam quando a jornada
depender de dados persistidos.

`specsfy-02-backlog` é a responsável exclusiva pelas perguntas de escolha
material. `specify`, `update-spec` e `validate` fazem handoff para seu ciclo e
retomam depois. O ciclo reanalisa cada rodada, faz no máximo oito perguntas por
área e oferece `Avançar` desde a primeira pergunta. A rodada seguinte
distingue encerramento da área, adiamento e retomada imediata. O encerramento
é respeitado até uma reabertura explícita; o adiamento preserva a definição
pendente.

## Relação das skills base

```text
inbox → backlog → specify → validate
       → tasks → implement (tests → implement)
                         ↑
                    update-spec
```

`update-spec` pode reabrir definição, plano ou entrega. A etapa 06 tem os
modos `tests` e `implement` na mesma skill. O progresso sai do command
`specsfy progress`, somente leitura. `documentator` atua depois de mudanças implementadas no consumidor e
projeta `docs/` junto de `.specsfy/PACKAGES.md`.

## Instalação

`cli/src/domain/installer.ts` define o conjunto instalado. O instalador:

- clona somente o diretório necessário do monorepo.
- delega materialização ao instalador `skills`.
- mantém `skills-lock.json` e fingerprints Specsfy.
- preserva conteúdo local alterado sem `--force`.
- mescla blocos gerenciados em `AGENTS.md` e `CLAUDE.md`.
- recusa a raiz oficial como consumidor.

Os arquivos `Inbox.md`, `Backlog.md`, `Spec.md`, `Tasks.md`, `Project.md`,
`Stack.md`, `Rules.md`, `Database.md`, `UserProfile.md`, `Interface.md` e
`DESIGNSYSTEM.MD` são
gerenciados individualmente, com
fingerprints próprios e proteção contra sobrescrita local. A resolução usada
pelas skills segue `custom/<Nome>.md`, template gerenciado e, somente no
monorepo, `skills/templates/<Nome>.md`.

`DESIGNSYSTEM.MD` é o template das regras macro do produto consumidor. A skill
`specsfy-specialist-interface` cria ou atualiza o arquivo na raiz do
consumidor. `Interface.md` registra componentes e telas locais, sem repetir as
regras macro.

`UserProfile.md` é o template do perfil de interação. O setup materializa
`.specsfy/USER-PROFILE.md`, registra o nível confirmado e as respostas já dadas,
e usa esse contexto para não repetir perguntas. O nível ajusta a linguagem e a
profundidade das perguntas, preservando o contrato numerado.

### Ponte com GitHub Spec Kit

`specsfy-setup/scripts/sync_speckit_context.mjs` ativa a integração somente
quando encontra `.specify/memory/constitution.md`. O script lê essa fonte como
bytes, percorre recursivamente os arquivos regulares em `specs/` e atualiza o
bloco `specsfy:speckit` de `.specsfy/SPECKIT.md`. Cada linha registra caminho,
tipo, título e SHA-256.

O script não escreve nas árvores do GitHub Spec Kit. Texto fora do bloco
gerenciado em `SPECKIT.md` permanece intacto. O bloco publicado em `AGENTS.md`
obriga o agente a abrir a constituição e as fontes listadas, mantendo os
artefatos anteriores sem conversão para a estrutura nativa do Specsfy.

O setup recebe a raiz do consumidor por `--project`. Esse caminho pode ser um
subdiretório de um Hub e se torna a raiz obrigatória para contexto, specs,
testes e implementação. O framework publicado em `AGENTS.md` proíbe promover
o trabalho para a raiz Git do Hub.

## Alterar uma skill

1. escreva ou atualize o contrato BDD/TDD.
2. observe RED.
3. altere `SKILL.md`, scripts, referências ou assets do owner.
4. sincronize fixtures instaladas quando o teste exigir.
5. execute a suíte do módulo.
6. rode `npm run validate:skills`.
7. atualize a página de usuário e este contexto quando a interface mudar.
8. ao criar, renomear ou remover uma skill, atualize `skills/inventory.json`
   (`skills`, `renamed` ou `retired`); o `specsfy update` migra os projetos por
   ele.

## Inventário de pacotes do consumidor

`specsfy-documentator/scripts/build_documentation.mjs` percorre os manifests npm
e Composer fora de árvores geradas. Dentro de um repositório Git, a varredura
usa `git ls-files --cached --others --exclude-standard` e respeita o
`.gitignore` do projeto, de modo que saídas de build e de teste, como `.astro/`
ou `.teste/`, não entram em `docs/`. A lista fixa de pastas (`.git`,
`node_modules`, `dist`, `docs`, `vendor` e outras) vale nos dois caminhos e é a
única regra quando o projeto não está no Git. O script combina dependências
diretas com entradas transitivas de `package-lock.json` e `composer.lock`, usa
descrições locais quando disponíveis e escreve o bloco reconstruível de
`.specsfy/PACKAGES.md`. O modo `--check` trata esse arquivo como parte do mesmo
contrato de atualização de `docs/`.

`specsfy-setup/scripts/monitor_context.mjs` encaminha mudanças em manifests ou
lockfiles para o documentador. O inventário é derivado e não substitui os
manifests nem autoriza instalar, atualizar ou remover dependências.

Em projetos Laravel, `specsfy-specialist-laravel` amplia esse
fluxo para pacotes recebidos por URL GitHub. Ele consulta os pacotes atuais,
instala somente após autorização e mantém `docs/packages/README.md` mais uma
ficha por pacote. `specsfy-03-specify` usa `.specsfy/PACKAGES.md` e consulta
as fichas quando existirem ou no modo Laravel `packages`. Antes de alterar
Composer, `specsfy-06-implement` consulta essas fontes e carrega o especialista
quando a tarefa envolve pacote.

## Validação

Em `Defined`, cada chamada de `tests` no passo `prepare` prova um RED e
retorna à fase de tarefas. A seção 14 define a ordem de dependências das
tarefas `[TEST] [TDD]`. O Plan Gate permanece `Pending` até o último RED
exigido. Testes de regressão pós-código ficam fora dessa contagem.

Os scripts que leem evidências encontram a raiz pelo marcador `.specsfy/` ou
pelo diretório `specs/` que contém a spec. Em um layout exportado, os scripts
de tarefas e de findings aceitam raiz explícita com `--project` e `--root`,
respectivamente. O monitor informa `source` como `git`, `paths` ou
`baseline`. Em uma cópia sem Git e sem lista, `status: baseline` inclui
diagnóstico e recuperação e preserva a estrutura das listas `changed_paths`
e `pending`. `--check` falha por pendências detectadas. A comparação pode ser
retomada com `--paths`; a lista vazia conhecida passa com `--paths '[]'`.

`validate_spec.mjs` e `review_findings.mjs` leem as mesmas declarações de IDs.
Requisitos aceitam dois pontos e travessão após o ID, inclusive em negrito.
O Definition Gate verifica a reserva do ID do Contrato CRUD. Quando existem
tarefas ou o plano está aprovado, o ID precisa apontar para a tarefa `[CODE]`
da seção 14 que implementa o controle.

O validador verifica frontmatter, nome, metadata e estrutura. Testes focais
devem verificar o comportamento específico. Validação estrutural não prova a
metodologia.

## Justificativa de tamanho

Este contexto reúne a estrutura, a descoberta, a interação, o handoff, a
instalação e as interfaces operacionais das skills. Esses contratos precisam
permanecer juntos porque uma mudança de catálogo pode afetar o instalador, a
transição entre responsabilidades e a documentação publicada no mesmo ciclo.
