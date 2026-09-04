# Changelog

Todas as mudanças relevantes do Specsfy CLI são registradas neste arquivo.

## [Unreleased]

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
