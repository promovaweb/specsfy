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
mas o nome exibido segue estes padrões: `Specsfy - 01 - Nome` para as sete
skills centrais numeradas, `Specsfy - Nome` para as demais skills base e
`Specsfy - Especialista - Nome` para o catálogo técnico opcional.

## Corpo e referências

O corpo usa instruções imperativas e mantém o fluxo essencial perto da ação.
Conteúdo extenso, padrões externos e matrizes de decisão ficam em
`references/`, com indicação explícita de quando devem ser lidos.

Scripts automatizam transformações determinísticas. Eles retornam códigos úteis,
não instalam globalmente e não realizam ações destrutivas por padrão.

O especialista `specsfy-specialist-versioning` inclui
`scripts/semver.mjs`. O utilitário cria, consulta, incrementa e confere o
arquivo `SEMVER` na raiz do projeto consumidor. Ele também gera a referência
Docker com essa versão e recusa uma tag diferente.

O planejador usa `[MIGRATION]` para toda tarefa que cria ou altera a estrutura
do banco. O validador
de tarefas exige um arquivo versionado em um diretório de migrations. No Ato
III, `verify_evidence.mjs` só aceita a conclusão depois de encontrar o arquivo,
o comando que aplicou a migration e uma consulta posterior do estado.

`specsfy-specialist-deploy` é a entrada para o fluxo completo de release ou
deploy. Seu catálogo instala Versioning, Docker, Debian Server, Ansible e Docker
Swarm como dependências. O gerador cria `compose.yaml` para desenvolvimento,
`stack.yaml` para produção e os arquivos Ansible que preparam o usuário `deploy`,
o Docker Engine e o Swarm. Os outros especialistas continuam atendendo tarefas
focais sem assumir a coordenação da entrega. Toda publicação ou alteração
remota depende de autorização explícita.

O scaffold usa `cloudflare-tunnel` como valor padrão de `--proxy`. Nesse modo,
ele acrescenta `cloudflared` à rede overlay da aplicação, cria a referência ao
Docker Secret `cloudflare_tunnel_token` e inclui
`vault_cloudflare_tunnel_token` nos campos protegidos pelo Ansible Vault. O
valor `external` omite esses componentes quando a pessoa escolhe outro proxy.

### Contrato operacional do deploy

O gerador publica um wrapper `deploy` na raiz do consumidor. Esse arquivo
mantém a interface humana curta e encaminha cada ação para a implementação em
`ansible/`:

| Entrada | Implementação | Contrato |
| --- | --- | --- |
| `check-hosts` | `check-hosts.py` | mostra hosts e testa conexões |
| `secrets` | `create-vault.sh` | inclui valores ausentes no Vault |
| `sync-keys` | `sync-keys.yml` e `keys.yml` | inclui chaves `.pub` |
| `run` | `check-hosts.py` e `deploy.yml` | confere e publica a stack |

`ANSIBLE_INVENTORY` seleciona um inventário alternativo somente para o
processo atual. Sem a variável, o wrapper exige
`ansible/inventory.yml`. O arquivo `inventory.example.yml` não pode ser usado
silenciosamente como alvo real.

A descoberta de máquinas pertence ao especialista Debian sob coordenação do
deploy. Ele coleta um host por rodada e registra alias, `ansible_host`,
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
| Modo | Skills |
| --- | --- |
| perguntas | `specsfy-02-backlog`, `specsfy-03-specify`, `specsfy-04-validate`, `specsfy-05-tasks`, `specsfy-06-tdd-bdd`, `specsfy-07-implement`, `specsfy-aux-rules`, `specsfy-interviewer`, `specsfy-milestone-governor`, `specsfy-mvp-milestone-interviewer`, `specsfy-data-discovery`, `specsfy-roadmap-milestone-interviewer`, `specsfy-setup`, `specsfy-update-spec` |
| sem perguntas | `specsfy-01-inbox`, `specsfy-aux-database`, `specsfy-aux-stack`, `specsfy-documentator`, `specsfy-progress` |
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

`specsfy-mvp-milestone-interviewer` combina conversa e captura: ele lê
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
nem passa gates. Quando necessário, chama `$specsfy-data-discovery`; depois
sincroniza milestones, sem sobrescrever arquivos existentes.

`specsfy-data-discovery` traduz a conversa de produto em informações a guardar
no `DATABASE.md`. Ela não escolhe estrutura interna; backlog, descoberta de MVP
e especificação a carregam quando a jornada depender de dados persistidos.

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
       → tasks → tdd-bdd → implement → progress
                         ↑
                    update-spec
```

`update-spec` pode reabrir definição, plano ou entrega. `progress` é somente
leitura. `documentator` atua depois de mudanças implementadas no consumidor e
projeta `docs/` junto de `.specsfy/PACKAGES.md`.

## Instalação

`cli/src/installer.ts` define o conjunto instalado. O instalador:

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
`specsfy-specialist-design-system` cria ou atualiza o arquivo na raiz do
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
6. rode `quick_validate.py`.
7. atualize a página de usuário e este contexto quando a interface mudar.

## Inventário de pacotes do consumidor

`specsfy-documentator/scripts/build_documentation.mjs` percorre os manifests npm
e Composer fora de árvores geradas. O script combina dependências diretas com
entradas transitivas de `package-lock.json` e `composer.lock`, usa descrições
locais quando disponíveis e escreve o bloco reconstruível de
`.specsfy/PACKAGES.md`. O modo `--check` trata esse arquivo como parte do mesmo
contrato de atualização de `docs/`.

`specsfy-setup/scripts/monitor_context.mjs` encaminha mudanças em manifests ou
lockfiles para o documentador. O inventário é derivado e não substitui os
manifests nem autoriza instalar, atualizar ou remover dependências.

Em projetos Laravel, `specsfy-specialist-laravel-package-manager` amplia esse
fluxo para pacotes recebidos por URL GitHub. Ele consulta os pacotes atuais,
instala somente após autorização e mantém `docs/packages/README.md` mais uma
ficha por pacote. `specsfy-03-specify` consulta essas fontes antes de registrar
uma dependência na spec; `specsfy-07-implement` faz a mesma leitura antes de
alterar Composer e carrega o especialista quando a tarefa envolve pacote.

## Validação

O validador verifica frontmatter, nome, metadata e estrutura. Testes focais
devem verificar o comportamento específico. Validação estrutural não prova a
metodologia.

## Justificativa de tamanho

Este contexto reúne a estrutura, a descoberta, a interação, o handoff, a
instalação e as interfaces operacionais das skills. Esses contratos precisam
permanecer juntos porque uma mudança de catálogo pode afetar o instalador, a
transição entre responsabilidades e a documentação publicada no mesmo ciclo.
