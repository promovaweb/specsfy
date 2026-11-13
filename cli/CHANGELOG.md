# Changelog

Todas as mudanças relevantes do Specsfy CLI são registradas neste arquivo.

## [Unreleased]

## [0.27.0] - 2026-11-13

### Alterado

- O CLI foi reescrito em Bun sobre o Termfy e passa a ser um binário
  compilado para Linux (x64 e arm64), macOS (x64 e arm64) e Windows (x64),
  sem Node.js nem Bun na máquina. Os executáveis e o `SHA256SUMS` saem em cada
  GitHub Release; o pacote npm `@promovaweb/specsfy` vira um wrapper que baixa
  o binário da plataforma na primeira execução, e `scripts/install-cli.sh`
  instala o binário direto.
- O binário carrega a árvore `skills/` e executa os scripts das skills com o
  próprio runtime. As skills base passam a indicar o command do `specsfy` e a
  tool MCP equivalente, e mantêm os scripts `.mjs` como alternativa.
- `transition`, `effort` e `migrate` passam para `specs transition`,
  `specs effort` e `specs migrate`. Os nomes antigos continuam aceitos como
  aliases ocultos.
- Saída `--json` em envelope `{ ok, command, data }`, com `ok: false` e `code`
  quando o exit code não é 0. Gates reprovados saem com o exit code 10
  (`GATE_FAILED`).
  Scripts que liam o JSON direto, como o `progress --json` da 0.26, passam a
  ler o campo `data`.
- `config show`, `config set --watch-interval` e `progress --interval`
  continuam aceitos, e o `watch_interval` de `.specsfy/config.json` segue
  valendo para o `progress --watch`.
- O token do GitHub vem da credencial cifrada `github.token`, de `GH_TOKEN`,
  de `GITHUB_TOKEN` ou de `gh auth token`, nesta ordem. `upgrade` troca o
  binário a partir da última release, conferindo o `SHA256SUMS`.

### Adicionado

- Servidor MCP (`specsfy mcp`) com tools para ler o projeto
  (`project_status`, `specs_list`, `spec_get`), mover o trabalho pelo método
  (`spec_transition`, `spec_effort`, `task_check`, `inbox_capture`,
  `inbox_process`), rodar gates (`gate_*`, `verify`), testes
  (`project_test`), contexto, milestones, documentação e gerenciar skills.
- Commands `status`, `specs list|show|new|research|change`,
  `tasks next|check|delivery`, `inbox list|capture`, `backlog list|start`,
  `gate spec|tasks|interface|trace|acceptance|evidence|findings|database`,
  `verify`, `context setup|inspect|interface|monitor|stack|rule|database|data|usage`,
  `milestones import-mvp`, `docs build`, `scripts list|run`.
- `<spec>` aceita número, nome da pasta, slug ou caminho, e todo command de
  projeto acha a raiz subindo a partir da pasta atual ou usa `--project`.
- TUI com as abas Overview, Specs, Backlog, Gates, Tests, Skills e About,
  atualizada sozinha quando os arquivos das specs mudam.
- Documentação embutida (`specsfy --skill`), descrição OpenCLI
  (`specsfy --opencli`), settings em `~/.specsfy/settings.json` e
  `CLISPEC.md` com as specs 0001 a 0011 do binário.

### Corrigido

- `skills remove` volta a tirar a entrada do `skills-lock.json`.
- Saídas grandes deixam de ser cortadas quando o stdout é um pipe.
- Identificadores de spec, nomes de skill e o `--attestation` ficam presos ao
  projeto: nenhum command ou tool MCP lê, grava ou remove arquivos fora dele.
- Gates que executam código do projeto (`gate tasks`, `gate evidence`,
  `gate database`) deixam de se anunciar como só leitura no MCP.
- Um token do GitHub vencido não impede mais a checagem de versão.
- O `upgrade` de uma instalação npm local ou via `npx` não instala o pacote
  globalmente.

### Observações

- A primeira execução pelo npm ou pelo `get.specsfy.dev` baixa o binário da
  plataforma, com cerca de 125 MB.
- Não há build para musl; em Alpine, use uma imagem com glibc.

## [0.26.2] - 2026-11-11

### Corrigido

- O manifesto do ebook volta a refletir as fontes atuais. A 0.26.1 alterou
  `.ebook/build-ebook.sh`, que também entra no `source_sha256`, sem regenerar o
  ebook; o CI da tag v0.26.1 falhou e o pacote não chegou ao npm. A 0.26.2
  regenera a edição e substitui a 0.26.1.
- A validação da ordem de leitura em `build-ebook.sh` também ordena com
  `LC_ALL=C`.

## [0.26.1] - 2026-11-11

### Corrigido

- O hash das fontes do ebook (`source_sha256` em `ebook/build.json`) deixa de
  depender do idioma do sistema. `build-ebook.sh` ordena `docs/user/` com
  `LC_ALL=C`, e o manifesto gerado numa máquina em `en_US.UTF-8` passa na
  verificação do CI, que roda com a ordenação C. Com isso, o job da tag volta a
  publicar `@promovaweb/specsfy` no npm.

## [0.26.0] - 2026-11-11

### Alterado

- As 19 skills base foram reescritas para agentes atuais da OpenAI e da
  Anthropic. Cada `SKILL.md` abre com o objetivo, declara `Pronto quando`,
  separa leituras paralelas de passos sequenciais e descreve na `description`
  quando usar e quando não usar a skill. A ênfase excessiva deu lugar a
  instruções com motivo, e trechos duplicados do `Spec.md` viraram referências.
  Os prompts de `agents/openai.yaml` ficaram mais específicos.
- `Spec.md` ganhou a seção `Compatibilidade entre agentes`, com a leitura de
  `$<nome>` no Codex, no Claude Code e nos demais agentes, e a regra dos
  caminhos de script.

### Corrigido

- Os estados canônicos em `Spec.md`, `skills/README.md` e
  `quality-gates.md` passam a incluir `Reviewing`.
- Listas numeradas que reiniciavam depois de blocos de código em
  `specsfy-02-backlog`, `specsfy-03-specify`, `specsfy-04-validate` e
  `specsfy-07-implement` voltaram a ter sequência contínua.
- `specsfy-05-tasks` lista `[MIGRATION]` entre as tags aceitas pelo
  `validate_tasks.mjs`.
- Skills auxiliares, `specsfy-setup` e `specsfy-documentator` citam scripts com
  o caminho completo `.agents/skills/<skill>/scripts/`.
- `specsfy-mvp-milestone-interviewer` usa o formato canônico de transição e
  oferece `Gere outras opções` em cada rodada.
- `$specsfy-documentator` respeita o `.gitignore` do projeto. Dentro de um
  repositório Git, `build_documentation.mjs` lê a lista de
  `git ls-files --cached --others --exclude-standard` e mantém a lista fixa de
  pastas como reserva fora do Git. Saídas de build e de teste, como `.astro/`
  e `.teste/` de projetos Astro, deixam de entrar em `docs/application.md` e
  `docs/frontend.md`, e o `--check` não acusa documentação desatualizada a cada
  build de teste. Contribuição de Lucas Fuad na PR #53.

## [0.25.0] - 2026-11-02

### Adicionado

- `specsfy inbox process <captura.md>` arquiva capturas em `inbox/processed/`
  depois de conferir todas as specs relacionadas e atualizar suas referências.
  O comando exige `Definition Gate: Passed` e `Status` explícitos na tabela
  inicial. Recusa Draft, aprovação ausente e tabelas de exemplo no corpo.
  Contribuição de Fabio Righetti na PR #44, adaptada com testes em Node.js e
  verificação adicional do cabeçalho da spec.
- `.specsfy/migrations.json` aceita padrões `apply` e `status` para reconhecer
  comprovantes de runners de migrations próprios, preservando os padrões
  nativos e recusando configuração inválida. Corrige a issue #52, de
  @sandrolborges. A verificação não executa migrations.

### Corrigido

- O progresso considera somente o ciclo canônico de cada task. Checkboxes
  residuais aparecem com seus números de linha, sem reduzir o progresso das
  tasks concluídas. Corrige a issue #51, de @ricardolrm.
- Os testes de arquivamento recusam aprovação em exemplos, em tabelas do corpo
  e em specs sem Status escrito. Falhas de pré-validação preservam a captura.
- O exemplo Laravel recebe as skills canônicas atuais, seus scripts Node.js e
  os registros do instalador. O ESLint ignora as dependências instaladas.

### Alterado

- Scripts de regressão, validação de skills, versão, release, documentação,
  geração de PDF/EPUB e utilitários de deploy usam Node.js. Os arquivos Python
  do workspace foram removidos, incluindo as cópias instaladas no exemplo.
- O CI executa as suítes Node.js de integração, skills e especialistas, além
  das verificações nativas do CLI e da aplicação Laravel. Um teste impede a
  reintrodução de arquivos Python e de etapas Python nos workflows.
- PDFs usam Chromium, Playwright e Paged.js, com dependências fixadas em
  `.ebook/package-lock.json`. O manual de marca e o ebook foram recompilados.
- Os utilitários de vault e hosts usam Node.js e continuam chamando o Ansible
  externo. O cancelamento aguarda o processo filho antes de remover arquivos
  temporários de credenciais.

### Atualização

- Requer Node.js 22.20 ou superior. Atualize o CLI com
  `npm install -g @promovaweb/specsfy@0.25.0` e atualize as skills do projeto
  pelo instalador, preservando alterações locais.
- Para contribuir: execute `npm ci --ignore-scripts` na raiz e use `npm test`,
  `npm run validate:skills` e os comandos documentados dos módulos. Os antigos
  comandos Python foram substituídos pelas entradas Node.js.
- Para compilar PDFs: instale as dependências de `.ebook/` e o Chromium do
  Playwright. O Ansible continua sendo uma dependência externa das operações
  de deploy; não é instalado pelo workspace.

### Validação

- Regressão integrada em Node.js; testes, typecheck, build e empacotamento do
  CLI; verificações nativas da aplicação Laravel; contratos de skills;
  ShellCheck e sintaxe Bash; integridade do ebook e alinhamento de versões.
- Os testes de deploy usam processos substitutos para verificar argumentos,
  permissões, limpeza e cancelamento. Não comprovam criptografia real do
  Ansible nem conexão com servidores de produção.

## [0.24.3] - 2026-10-20

### Corrigido

- Corrige a procura de executáveis pelo PATHEXT no Windows e chama o entrypoint JavaScript do npx pelo Node, preservando argumentos com espaços.
- Restaura regras, templates, skills e locks gerenciados quando o instalador delegado falha.
- Detecta stacks e arquivos de aplicação em subprojetos, excluindo dependências, skills instaladas e ambientes virtuais.
- Preserva linhas com pipes escapados nas tabelas da stack.
- Reconhece palavras Unicode nos validadores para aceitar palavras como MÉTODO e identificar alterações de índice que exigem migration.
- Inclui testes .mjs e .cjs e limita a rastreabilidade aos testes declarados pela spec, sem selecionar arquivos com o mesmo sufixo.
- Respeita specs Draft na verificação do repositório e aceita o título atual da seção de dependências no exemplo canônico.
- Atualiza caminhos de research nas transições, permite reabrir specs concluídas e preserva a origem quando o destino está ocupado.
- Corrige caminhos com espaços e a procura da raiz de projetos nos validadores.
- Consulta o estado das migrations no banco de teste separado para distinguir operações históricas já executadas de operações pendentes.
- Corrige a documentação gerada para excluir skills e dependências, reconhecer PHPUnit e identificar diagramas genéricos como exemplos.
- Alinha o Node da CI ao mínimo 22.20.0 do CLI e atualiza as actions com SHAs fixos.

### Validação

- 121 testes do CLI, typecheck, build, executável e empacotamento local.
- 20 testes de regressão em Node.js para as skills.
- Windows validado por injeção de plataforma. A confirmação em Windows nativo e a integração com Laravel real permanecem pendentes.
- Os testes integrados do projeto serão conferidos na CI antes da publicação da tag. Python não foi executado neste workspace.

### Atualização

- Atualize o CLI com `npm install --global @promovaweb/specsfy@0.24.3` e confirme `specsfy --version`.
- As skills já instaladas em projetos consumidores precisam ser atualizadas separadamente. Execute `specsfy skills update --help` e preserve customizações locais antes de atualizar.
- Os relatos permanecem abertos para confirmação dos autores no ambiente original.

### Contribuições aproveitadas

- Adapta contribuições dos PRs #7, #9, #12, #19, #22, #32, #38, #39, #40, #49 e #50, com testes e ajustes adicionais. A relação de autores e SHAs originais acompanha o commit desta versão.

## [0.24.2] - 2026-10-20

### Corrigido

- Recompila o executável do CLI e seu manifesto para corresponder à versão pública do Specsfy.
- Mantém o catálogo de relatório de servidor e suas referências recíprocas.

## [0.24.1] - 2026-10-20

### Corrigido

- Inclui o novo especialista no conjunto esperado pelos testes do catálogo.
- Completa as referências recíprocas entre o relatório de servidor e os especialistas de plataforma e diagnóstico.

## [0.24.0] - 2026-10-20

### Adicionado

- Adiciona o especialista de relatório de servidor com coleta somente leitura por Ansible, diagnóstico Docker e Swarm e relatórios por host.
- Registra o especialista no catálogo para instalação pelo CLI.

## [0.23.0] - 2026-09-15

### Adicionado

- Mantém o deploy manual e adiciona `./deploy run --non-interactive` para
  execução por agentes com fontes externas da senha do Ansible Vault.
- Inclui `./deploy configure-vault` com entrada oculta, armazenamento fora do
  Git, permissões restritas e confirmação antes de substituir a senha.
- Aceita arquivos, scripts de cofre, Vault IDs e configuração nativa do Ansible.
- Reaproveita a fonte externa no cadastro de segredos e verifica a
  descriptografia local antes de conectar aos servidores.
- Documenta configuração, troca, remoção e migração de projetos existentes,
  com testes de terminal e Ansible em alvo local descartável.

### Migração

- Projetos existentes devem incorporar as mudanças em `deploy`,
  `ansible/create-vault.sh` e `ansible/check-hosts.py`, além do novo
  `ansible/vault.py`, preservando suas personalizações. Depois, execute
  `./deploy configure-vault` no terminal humano para preparar a fonte local.

### Validação

- 113 testes integrados, 38 testes de especialistas e 106 testes do CLI.
- 54 cenários BDD integrados e 12 cenários dos especialistas.
- ShellCheck, validação das skills, `make verify-ebook` e `make verify-version`.

## [0.22.2] - 2026-09-04

### Corrigido

- Publica o reforço que impede o Delivery Gate quando uma migration planejada
  permanece aberta.
- Limita a exigência automática de migration às mudanças estruturais do banco.
- Reconstrói o manifesto do executável depois da atualização completa da
  versão.

### Validação

- `cd cli && npm run check`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `make verify-ebook`
- `make verify-version`

## [0.22.1] - 2026-09-04

### Corrigido

- Limita a exigência automática de migration a mudanças que criam ou alteram
  a estrutura do banco.
- Impede o Delivery Gate quando uma tarefa `[MIGRATION]` planejada permanece
  aberta.
- Mantém a conferência do arquivo versionado, da aplicação no banco de teste e
  da consulta posterior do estado.

### Validação

- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `PYTHONPATH=skills uv run --quiet --with behave behave skills/tests/features --no-capture`
- `make verify-ebook`
- `make verify-version`

## [0.22.0] - 2026-09-04

### Adicionado

- Exige uma tarefa `[MIGRATION]` quando o plano altera banco de dados,
  schema, tabela, coluna, índice, relação ou modelo persistente.
- Confere o arquivo versionado, a aplicação no banco de teste e a consulta do
  estado antes de aceitar a conclusão da migration.
- Inclui testes unitários e cenários BDD para impedir planos e entregas sem a
  migration necessária.

### Alterado

- Alinha planejamento, implementação, validação, Laravel, PostgreSQL e
  modelagem de dados ao mesmo contrato de migrations.
- Documenta o fluxo nos guias do usuário, na referência técnica e no ebook.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `PYTHONPATH=skills uv run --quiet --with behave behave skills/tests/features --no-capture`
- `make verify-ebook`
- `make verify-version`

## [0.21.0] - 2026-09-03

### Adicionado

- Adota Cloudflare Tunnel como ingresso padrão das stacks Docker Swarm.
- Executa `cloudflared` na rede overlay da aplicação e entrega o token por
  Docker Secret criado a partir do Ansible Vault.
- Permite escolher outro proxy com `--proxy external`.

### Alterado

- Documenta o fluxo do túnel no guia do usuário, no capítulo de deploy e na
  referência técnica das skills.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `make verify-ebook`
- `make verify-version`

## [0.20.1] - 2026-09-03

### Corrigido

- Renomeia o capítulo de deploy para “Como funciona o Deploy da aplicação”.
- Mantém o título alinhado no guia do usuário, ebook e website.
- Garante que o setup inicial não crie `SEMVER` nem arquivos de deploy sem um
  pedido explícito do usuário.
- Confirma por teste que repetir o setup com as mesmas entradas não altera o
  projeto consumidor.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `make verify-ebook`
- `make verify-version`

## [0.20.0] - 2026-09-03

### Adicionado

- Define `VERSION` na raiz como fonte única para todo o ecossistema Specsfy.
- Inclui uma verificação automática entre CLI, ebook, manifests e artefatos.
- Publica a documentação completa do deploy com Docker Swarm, Ansible,
  Laravel Octane e Open Swoole.

### Alterado

- Alinha framework, CLI, skills, especialistas e ebook na versão `0.20.0`.
- Mantém Hub e website em ciclos de versão independentes.

### Segurança

- Documenta Ansible Vault e Docker Secrets como meios obrigatórios para
  valores sensíveis usados no deploy.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `make verify-ebook`
- `make verify-version`

## [0.13.0] - 2026-09-03

### Adicionado

- Cria o especialista orquestrador de deploy para coordenar versionamento,
  Laravel, Docker, Docker Swarm, Debian Server e Ansible pela mesma conversa.
- Gera `Dockerfile`, Compose local, stack de produção, playbooks multi-host e
  utilitários curtos para conexões, chaves públicas, Vault e deploy.
- Publica o capítulo operacional de servidores e deploy no guia do usuário e
  no ebook `v1.9.0`.

### Alterado

- Torna Laravel Octane com Open Swoole o runtime obrigatório das aplicações
  Laravel atendidas pelo Specsfy.
- Adota `deploy` como usuário operacional do servidor e mantém `app` como
  usuário interno do container.
- Faz o arquivo `SEMVER` governar a tag da imagem e a versão usada no deploy.

### Segurança

- Mantém valores sensíveis no Ansible Vault e os converte em Docker Secrets
  externos sem gravar senhas na stack.
- Sincroniza somente chaves públicas locais e preserva acessos SSH existentes.

### Validação

- `python3 -B -m unittest discover -s specialists/tests -p 'test_*.py'`
- `uv run --with behave behave specialists/tests/features`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `PYTHONPATH=skills uv run --with behave behave skills/tests/features`
- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `make verify-ebook`
- `ansible-playbook ansible/deploy.yml --syntax-check`

## [0.12.0] - 2026-09-03

### Adicionado

- Adiciona o especialista de versionamento para criar, consultar, incrementar
  e conferir o arquivo `SEMVER` na raiz do projeto consumidor.
- Adiciona o especialista de Debian Server e amplia o fluxo de deploy com
  Docker, Docker Swarm, Ansible e engenharia de entrega.
- Publica o capítulo "Da versão ao servidor" no guia do usuário e inclui a
  edição `v1.8.0` do ebook em PDF e EPUB.

### Alterado

- Faz Ansible, Docker Swarm e engenharia de entrega carregarem o especialista
  de versionamento durante a preparação do deploy.
- Faz Docker consultar `SEMVER` quando a imagem representar uma release.

### Validação

- `python3 -B -m unittest discover -s specialists/tests -p 'test_*.py'`
- `uv run --quiet --with behave==1.3.3 behave specialists/tests/features --no-capture`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `cd skills && uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`
- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `make verify-ebook`

## [0.11.2] - 2026-08-31

### Corrigido

- Declara no especialista de componentes React a relação recíproca com o
  especialista de experiência de interface.
- Restaura os contratos Python e BDD do catálogo de especialistas após a
  publicação do roteamento obrigatório para componentes de UI.

### Validação

- `cd specialists && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd specialists && uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`
- `cd skills && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd skills && uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`

## [0.11.1] - 2026-08-31

### Adicionado

- Exige `$specsfy-specialist-react-ui-components` no planejamento e na
  implementação de telas React antes da escrita de JSX ou TSX.
- Faz o setup instalar o especialista de componentes quando React for
  detectado no projeto.
- Adiciona um contrato automatizado para manter o roteamento presente nas
  skills, nos templates e no especialista de experiência de interface.

### Documentação

- Atualiza os guias de tarefas, implementação e especialistas com a sequência
  de seleção, reaproveitamento e adaptação de componentes.
- Reconstrói o guia do usuário em PDF e EPUB com as fontes documentais atuais.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `uv run --quiet --with behave behave tests/features --no-capture`
- `cd skills && node specsfy-04-validate/scripts/verify_repo.mjs . --boundary local`
- `make verify-ebook`

## [0.11.0] - 2026-08-30

### Adicionado

- Verifica durante o setup que projetos Laravel possuem `.env.testing` com
  banco explícito e separado do ambiente de desenvolvimento.
- Inclui um gate reutilizável que inspeciona comandos diretos, aliases de
  Composer e npm, traits de teste e o método `up` das migrations antes da
  execução.
- Faz o setup confirmar cobertura de CRUD, caminhos de menu e reconstrução da
  documentação técnica do sistema existente.

### Corrigido

- Suspende testes no CLI, na TUI e nas skills de TDD e implementação quando o
  ambiente de teste não está comprovadamente separado.
- Recusa resets, wipes, drops, truncates, `RefreshDatabase` e
  `DatabaseMigrations`, sem permitir execução forçada.
- Atualiza a aplicação de exemplo para usar SQLite exclusivo de teste,
  migrations de avanço inspecionadas e `DatabaseTransactions`.

### Documentação

- Publica as regras de proteção no guia Laravel, na referência do CLI, nas
  páginas das skills, na documentação técnica e no ebook `v1.7.20`.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`
- `cd skills && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd specialists && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `node skills/specsfy-setup/scripts/check_database_safety.mjs --project example --command 'composer test'`
- `composer --working-dir=example test`
- `make verify-ebook`

## [0.10.5] - 2026-08-27

## Correções

- Alinha os testes automatizados da importação de `MVP.md` ao fluxo atual: somente requisitos desenvolvíveis criam backlog e spec Draft; a milestone mantém proveniência e triagem, sem Inboxes ou cópia de contexto de negócio.

## Validação

- Testes unitários e cenários BDD da biblioteca de skills executados com sucesso.

## [0.10.4] - 2026-08-27

## Corrigido

- Importa do `MVP.md` somente requisitos de desenvolvimento, criando backlogs
  e specs Draft sem gerar Inboxes automáticas.
- Mantém contexto de negócio, público, métricas e posicionamento no arquivo de
  origem, enquanto `M01` registra apenas a proveniência e a triagem.

## Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `uv run --quiet --with behave behave tests/features --no-capture`
- `make verify-ebook`

## [0.10.3] - 2026-08-27

### Adicionado

- Expande o contrato de Design System, a composição de interfaces e os
  especialistas disponíveis, com documentação, testes e templates alinhados.
- Publica o guia do usuário do Specsfy na edição `v1.7.18`.

## [0.10.2] - 2026-08-24

### Corrigido

- Atualiza o cenário BDD de composição React para reconhecer o Design System
  como requisito do especialista de componentes e inclui essa skill no grupo
  de interface do catálogo.
- Mantém testes unitários, cenários BDD, metadados e requisitos do catálogo
  alinhados com o conjunto publicado de especialistas.

## [0.10.1] - 2026-08-24

### Corrigido

- Alinha o catálogo, os metadados e o contrato de qualidade do especialista de
  Design System, incluindo seus padrões de referência e os requisitos dos
  componentes de interface.
- Mantém a suíte de especialistas compatível com o catálogo publicado e
  recompõe o executável com a versão `0.10.1`.

## [0.10.0] - 2026-08-24

### Adicionado

- Cria o template `UserProfile.md` e faz `$specsfy-setup` materializar
  `.specsfy/USER-PROFILE.md` para registrar o nível de conhecimento, respostas
  confirmadas, fonte, data e alcance.
- Adapta as perguntas do setup ao nível `iniciante`, `intermediário` ou
  `experiente`, consultando a conversa e os arquivos do projeto para não
  repetir assuntos já respondidos.
- Define defaults de interface para CRUD, dashboard, Breadcrumb, navegação por
  equipe e formulários responsivos em duas colunas, com documentação e
  especialistas correspondentes.

### Corrigido

- Torna as linhas do DataGrid clicáveis por inteiro, preservando ações internas
  e a navegação por teclado.
- Reaproveita o Breadcrumb existente em aplicações Laravel e garante a equipe
  atual no contexto das telas autenticadas.
- Atualiza o CLI, os templates, os testes, a documentação e o ebook para o
  fluxo de contexto e interface publicado nesta versão.

## [0.9.3] - 2026-08-23

### Corrigido

- Corrige o modal de leitura de specs: `Esc` e o botão **Fechar Esc** encerram a visualização, removem seus controles da pilha de foco e devolvem a seleção à lista de origem.
- Mantém `Tab` e `Shift+Tab` no conteúdo do modal e no fechamento, sem levar o foco para controles ocultos atrás da visualização.
- Adiciona regressões com byte Escape de TTY, foco após o fechamento e controle de mouse, além de atualizar os guias e o ebook.

## [0.9.2] - 2026-08-22

- Evita repetir a mesma oferta de atualização depois de uma recusa ou falha,
  respeitando o intervalo configurado e mantendo `specsfy upgrade` como
  consulta forçada.
- Atualiza corretamente executáveis avulsos expostos por symlink, substituindo
  o arquivo real sem remover o caminho usado no `PATH`.
- Adiciona regressões para adiamento, bypass explícito, fluxo de inicialização
  e atualização de symlink.

## [0.9.1] - 2026-08-22

- Corrige a navegação da TUI, o foco após fechar telas, o fechamento por
  `Ctrl+Q` e a atualização de painéis durante a execução de testes.
- Preserva seleções de skills durante refresh e impede que operações
  assíncronas devolvam a pessoa para uma aba antiga.
- Faz o updater comparar a versão publicada no npm, evita avisos repetidos e
  atualiza executáveis avulsos com validação e substituição atômica.
- Completa a importação de MVP com defaults óbvios, pendências explícitas,
  backlogs somente para desenvolvimento e specs derivadas desses backlogs.

## [0.9.0] - 2026-08-21

- Adiciona especialistas essenciais ao setup e amplia o catálogo de
  especialistas do Specsfy.
- Torna a descoberta de MVP contextual e preserva seu resultado em inboxes.
- Suporta projetos em subdiretórios do Hub e padroniza interfaces React com
  ReUI.
- Publica aliases estáveis do ebook e amplia o contexto auxiliar do CLI.

## [0.8.1] - 2026-08-13

- Inclui o pacote oficial `skills` como dependência do CLI e o localiza mesmo
  quando um launcher inicia o Specsfy com um `PATH` reduzido.
- Alinha o requisito mínimo ao Node.js 22.20 exigido pelo materializador.
- Adiciona `specsfy setup` como alias de `specsfy install`, com o mesmo
  diagnóstico de Node.js, Git, projeto e materializador de skills.
- Adiciona `specsfy doctor` e executa o mesmo diagnóstico antes do setup para
  conferir Node.js, Git, npm, projeto e disponibilidade do `skills` ou `npx`.
- Adiciona `specsfy update` para atualizar todas as skills Specsfy instaladas e
  preserva `specsfy skills update` como comando compatível.
- Adiciona `specsfy upgrade` para consultar uma versão estável mais recente e
  atualizar o próprio CLI pelo pacote oficial do npm sem fazer downgrade.
- Documenta separadamente instalação, atualização das skills e atualização do
  CLI nos guias, na referência de comandos, no ebook e no site.

## [0.8.0] - 2026-08-12

- Adiciona os comandos `transition`, `migrate` e `effort` para manter pasta,
  status e estimativa das specs pela mesma interface, com saída JSON e
  integração opcional com o ClickUpfy.
- Adiciona `milestones sync` para projetar o progresso dos milestones em
  `specs.md` e `specs/milestones/`, preservando o conteúdo escrito pelo
  usuário.
- Passa a ler o ciclo de vida em `specs/<estado>/`, mantém compatibilidade com
  o layout anterior e inclui Effort e perfil de execução no progresso.
- Amplia o bootstrap com as skills de entrevista e governança de milestones e
  mantém a instalação protegida por fingerprints.
- Reorganiza a paleta escura da TUI com cores semânticas e contraste verificado
  para texto, foco, seleção, bordas, campos, botões e barras de rolagem.
- Atualiza capturas, documentação de usuário e desenvolvimento, referência de
  comandos, ebook e publicação dos guias no site da Promovaweb.

## [0.7.0] - 2026-07-30

- Migra o CLI e a TUI de Python para Node.js 22, com instalação global por
  `@promovaweb/specsfy`.
- Mantém as seis abas da TUI e adiciona execução do Pest com resumo e saída
  rolável.
- Corrige os atalhos de controle interpretados pelo `neo-blessed` e evita o
  encerramento da TUI durante a atualização da saída dos testes.
- Adiciona o fluxo de release com changelog, commit, tag anotada, GitHub
  Actions, publicação npm e GitHub Release vinculados à mesma versão.
- Atualiza o instalador, o catálogo de especialistas e a documentação do
  usuário para os comandos do CLI em Node.js.

- Autentica catálogo e verificação de tags em repositórios privados com
  `GH_TOKEN`, `GITHUB_TOKEN` ou a sessão do GitHub CLI.
- Torna o fingerprint do executável estável entre permissões equivalentes do
  Git e ambientes locais/CI.
