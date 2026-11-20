# Skills especialistas

<!-- markdownlint-disable MD013 -->

As skills base conduzem a metodologia. As
`specsfy-specialist-*` acrescentam orientação para a tecnologia encontrada no
projeto, como Laravel, Next.js, Postgres ou Redis. Assim, você instala
somente o conhecimento técnico usado pela aplicação.

Na interface, cada uma usa o padrão `Specsfy - Especialista - Nome`, como
`Specsfy - Especialista - Laravel`. O identificador de comando continua
`specsfy-specialist-laravel`.

Para criar ou alterar interfaces, `specsfy-specialist-interface-experience`
coordena a entrega e carrega `specsfy-specialist-design-system` antes dos
especialistas de UX, UI e componentes. O design system mantém as orientações
gerais, os defaults e os cenários de CRUD. A experiência de interface examina
a stack e o sistema atual, conduz as perguntas sobre telas e menus e garante
uma fase específica de interface nas tarefas.

## Detectar e instalar

O comando `detect` lê o projeto e mostra recomendações sem instalar arquivos.
O catálogo local só deve ser alterado depois que você revisar os nomes
retornados:

```bash
specsfy skills detect
```

Depois da revisão, instale apenas os especialistas usados pela aplicação. A
instalação usa `npx skills add` e registra cada escolha no
`skills-lock.json`, permitindo conferir depois quais arquivos são gerenciados:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-laravel \
  --skill specsfy-specialist-postgres \
  --skill specsfy-specialist-redis \
  --agent universal --copy --full-depth
```

As skills base podem sugerir um especialista. Quando ele já estiver instalado,
a transição é anunciada e continua na mesma conversa. Quando estiver ausente, o
agente informa o especialista, a finalidade e as dependências, avisa que usará
`npx skills add` e solicita autorização específica para instalar. A transição
entre skills não instala o catálogo inteiro de forma automática.

## Instalação no setup

Ao iniciar o setup, você autoriza o Specsfy a detectar e instalar os
especialistas diretamente ligados à stack encontrada, além de um núcleo comum
de modelagem de dados, domínio, arquitetura e interfaces ReUI. Ele mostra os
itens e usa `npx skills add` no projeto atual. Tecnologias sem sinal no código não entram na
instalação.

| Stack encontrada | Especialista |
| --- | --- |
| Laravel | Laravel e gestor de pacotes Laravel |
| Supabase, PostgreSQL ou Redis | Supabase, PostgreSQL ou Redis correspondente |
| React, Next.js ou TypeScript | especialista correspondente |
| Tailwind CSS ou shadcn/ui | Tailwind CSS ou shadcn/ui correspondente |
| ReUI solicitado para React e Tailwind | ReUI, React, Tailwind CSS e shadcn/ui |
| Docker, Swarm ou Ansible | especialista de plataforma e versionamento correspondente |
| OpenAPI, OpenTelemetry, Prometheus ou CI/CD | API, observabilidade ou entrega correspondente |

## Instalação manual

Você pode instalar qualquer especialista do catálogo fora do setup. Essa opção
serve para uma necessidade pontual que a stack ainda não revela, como revisão,
acessibilidade ou pesquisa técnica:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-web-accessibility --agent universal --copy --full-depth
```

O setup não remove especialistas instalados manualmente. Eles permanecem no
projeto e podem ser usados quando a entrega precisar deles.

Para usar os componentes gratuitos do ReUI, instale o especialista e suas
dependências resolvidas pelo catálogo:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-reui --agent universal --copy --full-depth
```

Ele prepara o registry ReUI para React 19, Tailwind CSS v4 e shadcn/ui. Em
Laravel, atende projetos com Inertia e Vite, enquanto em outros frameworks
React preserva o padrão já existente. Nos CRUDs e dashboards compatíveis, o ReUI é a
base da consulta e dos filtros, dos formulários e dos indicadores, além das
ações contextuais e das mensagens de retorno. A
skill consulta o catálogo gratuito antes de permitir a criação de componente
manual equivalente.

## Gestor de pacotes Laravel

`specsfy-specialist-laravel-package-manager` recebe a URL de um repositório
GitHub, lê seu contrato Composer e sua documentação e compara o pacote com o
que já existe no projeto. Quando a solicitação autoriza a instalação, executa
`composer require` na raiz Laravel e confere o lockfile atualizado.

O resultado documental fica em `docs/packages/`:

- `README.md` é o índice dos pacotes Composer diretos, com versão, finalidade e
  link para cada ficha;
- `<vendor>-<nome>.md` explica instalação, configuração, uso local, testes e
  fontes consultadas;
- `.specsfy/PACKAGES.md` continua sendo a relação completa, incluindo
  dependências transitivas.

O especialista não repete uma instalação quando o pacote já aparece no
manifest, no lockfile ou em `vendor/`. Se o repositório não expuser um pacote
Composer compatível com Laravel, ele registra a lacuna e não altera os
arquivos.

## Contrato de interfaces React

Em Laravel com React, shadcn/ui e ReUI trabalham juntos: shadcn/ui fornece as
primitives e ReUI fornece as composições gratuitas. Toda tela é construída por
componentes React. A rota ou a página coordena as informações e compõe os
blocos. Grade, formulário e filtros ficam em componentes próprios, assim como
os diálogos e os cartões reutilizáveis.

O setup cria `INTERFACE.md` e `DESIGNSYSTEM.MD` na raiz do projeto quando eles
estão ausentes. O `INTERFACE.md` registra tokens e registries, além das telas
e de todos os blocos criados ou reaproveitados. O `DESIGNSYSTEM.MD` guarda as
orientações gerais, os defaults e os padrões de CRUD e dashboard, com estados e
exceções por alcance. O especialista Design System mantém esse arquivo.

Cada bloco registrado informa:

- arquivo, origem e finalidade
- props, eventos e estados
- acessibilidade e consumidores
- a forma de reaproveitar ou estender o bloco

A seção 10 de cada spec com interface usa a mesma relação para declarar os
blocos React e os componentes shadcn/ui e ReUI escolhidos. As tarefas de
interface atualizam o `INTERFACE.md` antes de serem concluídas.

Antes de desenvolver uma tela React, o planejamento e a implementação carregam
`$specsfy-specialist-react-ui-components`. A skill procura primeiro os blocos
existentes, orienta o reaproveitamento ou a adaptação e mantém `INTERFACE.md`
alinhado ao código. Se ela ainda não estiver instalada, o fluxo retorna ao
setup e instala o especialista detectado antes de escrever JSX ou TSX.

Nas superfícies CRUD, o padrão é `PageHeader` e `DataGrid` para listas,
com a linha inteira abrindo o detalhe por clique ou teclado; `PageHeader` e
`DetailLists` para detalhes, além de `PageHeader` com seções de formulário em duas
colunas responsivas para criar e editar. Botões, checkboxes e menus internos
ficam independentes da navegação da linha. Erros de campo ficam vermelhos e
recebem mensagem abaixo do campo. Toda tela também exibe `Breadcrumb` com o
team ativo, o módulo e o título atual. Em Laravel, o padrão reaproveita o
`Breadcrumb` ou `Breadcrumbs` existente no layout.

## Catálogo por domínio

| Domínio | Especialistas |
| --- | --- |
| backend e banco de dados | Laravel, Supabase, Postgres, Redis e APIs web |
| frontend | React, Next.js, TypeScript e Tailwind CSS |
| interface | design system, experiência de interface, shadcn/ui, UI, UX e acessibilidade web |
| plataforma | versionamento, Docker, Docker Swarm, Ansible e engenharia de entrega |
| qualidade | segurança, observabilidade e performance |
| design técnico | arquitetura e modelagem de domínio |
| engenharia | code review, debugging, prototipação, pesquisa e conflitos Git |

Cada especialista explica o fluxo de trabalho e as validações próprias da sua
tecnologia. Uma mudança em Eloquent pode combinar Laravel e Postgres, por
exemplo, mas uma alteração isolada em uma página Astro não precisa carregar
orientações de todo o catálogo.

## Guia de cada especialista

Esta é a referência de entrada para todos os especialistas distribuídos pelo
Specsfy, com um guia do usuário para cada um. Use o nome de comando na
instalação. O setup instala o núcleo e os especialistas detectados; os demais permanecem disponíveis para instalação
manual quando a entrega pedir aquele domínio.

| Especialista | Quando usar |
| --- | --- |
| [Laravel](specialists/laravel.md) | Domínio PHP, HTTP, filas, autorização, persistência e testes Laravel. |
| [Gestor de pacotes Laravel](specialists/laravel-package-manager.md) | Pacotes Composer recebidos por URL GitHub, instalação e fichas em `docs/packages/`. |
| [Supabase](specialists/supabase.md) | Postgres gerenciado, Auth, RLS, Storage, Realtime e Edge Functions. |
| [PostgreSQL](specialists/postgres.md) | Modelagem relacional, SQL, índices, migrations e operação do banco. |
| [Redis](specialists/redis.md) | Cache, filas, locks, rate limiting e estruturas de dados em memória. |
| [Modelagem de Dados](specialists/data-modeling.md) | Entidades, relações, ciclos de vida e contratos persistentes. |
| [Modelagem de Domínio](specialists/domain-modeling.md) | Linguagem do negócio, invariantes e limites entre módulos. |
| [Arquitetura de Software](specialists/software-architecture.md) | Módulos, dependências, atributos de qualidade e fronteiras técnicas. |
| [Design System](specialists/design-system.md) | Regras macro, defaults, estados, padrões CRUD e exceções com alcance. |
| [React](specialists/react.md) | Componentes, estado, efeitos, acessibilidade e testes de interface. |
| [Tailwind CSS](specialists/tailwind-css.md) | Tokens, responsividade, variantes e CSS do design system. |
| [shadcn/ui](specialists/shadcn-ui.md) | Primitives, registry, tema e padrões acessíveis de aplicação. |
| [ReUI](specialists/reui.md) | Composições gratuitas para interfaces React e Tailwind, especialmente CRUDs. |
| [Componentes React](specialists/react-ui-components.md) | Catálogos copiáveis que complementam UI design em projetos React. |
| [UI Design](specialists/ui-design.md) | Layouts, dashboards, tabelas, formulários, estados e hierarquia visual. |
| [UX Design](specialists/ux-design.md) | Fluxos, arquitetura de informação, pesquisa e validação de uso. |
| [Experiência de Interface](specialists/interface-experience.md) | Leitura do sistema atual, telas, formulários e tarefas de interface. |
| [Acessibilidade Web](specialists/web-accessibility.md) | WCAG, semântica, teclado, foco e tecnologias assistivas. |
| [Next.js](specialists/nextjs.md) | App Router, fronteiras server/client, cache, dados e deploy. |
| [TypeScript](specialists/typescript.md) | Tipos, strictness, módulos e contratos de API. |
| [Docker](specialists/docker.md) | Imagens, Compose, segurança, builds e ambiente local. |
| [Deploy](specialists/deploy.md) | Orquestra `SEMVER`, inventário, conexões, chaves públicas, Compose local, stack Swarm e Ansible. |
| [Versionamento](specialists/versioning.md) | Arquivo `SEMVER`, incrementos e alinhamento entre artefato, tag e deploy. |
| [Debian Server](specialists/debian-server.md) | APT, systemd, SSH, nftables, sysctl, storage e Docker Engine no host. |
| [Relatório de servidor](specialists/server-report.md) | Diagnóstico somente leitura de containers, serviços Swarm e disco por host. |
| [Docker Swarm](specialists/docker-swarm.md) | Stacks, serviços, redes, secrets, rollout e recuperação. |
| [Ansible](specialists/ansible.md) | Playbooks, roles, Vault e automação de infraestrutura. |
| [APIs Web](specialists/web-api-design.md) | Contratos HTTP, erros, paginação, idempotência e evolução de API. |
| [Observabilidade](specialists/observability.md) | Logs, métricas, traces, SLOs e alertas acionáveis. |
| [Engenharia de Entrega](specialists/delivery-engineering.md) | CI/CD, artefatos, promoções, migrations, rollout e rollback. |
| [Segurança de Aplicações](specialists/application-security.md) | Ameaças, controles, segredos e verificações de segurança. |
| [Performance](specialists/performance-engineering.md) | Orçamentos, medição, profiling, carga e regressões. |
| [Code Review](specialists/code-review.md) | Revisão técnica guiada pelo contrato e pelos testes. |
| [Debugging](specialists/debugging.md) | Diagnóstico de bugs, falhas intermitentes e regressões. |
| [Prototipação](specialists/prototyping.md) | Protótipos descartáveis para dúvidas técnicas ou de interface. |
| [Pesquisa Técnica](specialists/technical-research.md) | Pesquisa rastreável em fontes primárias e artefatos observáveis. |
| [Resolução de Conflitos Git](specialists/merge-conflict-resolution.md) | Conflitos Git preservando intenção e integração do código. |
| [Gitflow](specialists/gitflow.md) | Branches, merges e ciclo de release quando o projeto adotá-lo. |

Cada linha corresponde ao comando `specsfy-specialist-<nome-em-inglês>` do
catálogo. A listagem completa de nomes, tags, dependências e sinais de
detecção está em `specialists/catalog.json` no repositório do Specsfy.

## Relação com as bases

- `specsfy-02-backlog` identifica a necessidade.
- `specsfy-03-specify` registra requisitos e atributos de qualidade.
- `specsfy-04-validate` seleciona lentes de revisão.
- `specsfy-05-tasks` usa checklists técnicos para decompor trabalho.
- `specsfy-06-implement` preserva RED/GREEN no modo `tests` e executa de
  acordo com a stack no modo `implement`.
- `specsfy-update-spec` revisa requisitos e atributos de qualidade
  afetados por uma mudança posterior.

A presença de um especialista não aprova nenhum gate do Specsfy, porque o Plan
Gate continua exigindo um RED válido e o Delivery Gate continua dependendo dos
testes e das comprovações registradas na spec.

<!-- markdownlint-enable MD013 -->
