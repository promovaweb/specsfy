# Skills especialistas

<!-- markdownlint-disable MD013 -->

As skills base conduzem a metodologia. As
`specsfy-specialist-*` acrescentam orientação para a tecnologia encontrada no
projeto, como Laravel, Astro, Next.js, Postgres ou Redis. Assim, você instala
somente o conhecimento técnico usado pela aplicação.

Na interface, cada uma usa o padrão `Specsfy - Especialista - Nome`, como
`Specsfy - Especialista - Laravel`. O identificador de comando continua
`specsfy-specialist-laravel`.

Para criar ou alterar interfaces, `specsfy-specialist-interface-experience`
coordena a entrega e carrega `specsfy-specialist-design-system` antes dos
especialistas de UX, UI e componentes. O design system mantém as regras macro,
defaults e cenários CRUD; a experiência examina a stack e o sistema atual,
organiza as perguntas sobre telas e menus e garante uma fase específica de
interface nas tarefas.

## Detectar e instalar

O comando `detect` lê o projeto e mostra recomendações sem instalar arquivos.
O catálogo local só deve ser alterado depois que você revisar os nomes
retornados:

```bash
specsfy skills detect
```

Depois da revisão, instale apenas os especialistas usados pela aplicação. A
instalação sempre usa `npx skills add` e registra cada escolha no
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
`npx skills add` e pede autorização específica para instalar. A transição entre
skills nunca instala o catálogo inteiro automaticamente.

## Instalação no setup

Ao iniciar o setup, você autoriza o Specsfy a detectar e instalar os
especialistas diretamente ligados à stack encontrada, além de um núcleo comum
para modelar dados, domínio, arquitetura e interfaces ReUI. Ele mostra os itens e usa `npx
skills add` no projeto atual. Tecnologias sem sinal no código não entram na
instalação.

| Stack encontrada | Especialista |
| --- | --- |
| Laravel, Supabase, PostgreSQL ou Redis | Laravel, Supabase, PostgreSQL ou Redis correspondente |
| React, Astro, Next.js ou TypeScript | especialista correspondente |
| Tailwind CSS ou shadcn/ui | Tailwind CSS ou shadcn/ui correspondente |
| ReUI solicitado para React e Tailwind | ReUI, React, Tailwind CSS e shadcn/ui |
| Docker, Swarm ou Ansible | especialista de plataforma correspondente |
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

Ele prepara o registry ReUI para React 19, Tailwind CSS v4 e shadcn/ui, atende
Laravel com Inertia e Vite e preserva o padrão de outros frameworks React.
Nos CRUDs e dashboards compatíveis, ReUI é a base para consulta, filtros,
formulários, indicadores, ações contextuais, anexos e mensagens de retorno. A
skill consulta o catálogo gratuito antes de permitir a criação de componente
manual equivalente.

## Contrato de interfaces React

Em Laravel com React, shadcn/ui e ReUI trabalham juntos: shadcn/ui fornece as
primitives e ReUI fornece as composições gratuitas. Toda tela é construída por
componentes React. A rota ou página coordena dados e compõe blocos; não reúne
grade, formulário, filtros, diálogos, painel lateral e cartões reutilizáveis
no mesmo arquivo.

O setup cria `INTERFACE.md` e `DESIGNSYSTEM.MD` na raiz do projeto quando eles
estão ausentes. O primeiro registra tokens,
registries, telas e todos os blocos criados ou reaproveitados. O arquivo
`DESIGNSYSTEM.MD` guarda as regras macro, defaults, padrões de CRUD e dashboard,
estados e exceções com alcance; a skill especialista o mantém.
Para cada bloco, informe arquivo, origem, finalidade, props e eventos, estados,
acessibilidade, consumidores e como reaproveitar ou estender. A seção 10 de
cada spec com interface usa a mesma relação para declarar os blocos React e os
componentes shadcn/ui e ReUI escolhidos. As tarefas de interface atualizam o
mapa antes de serem concluídas.

Nas superfícies CRUD, a regra padrão é `PageHeader` e `DataGrid` para listas,
com a linha inteira abrindo o detalhe por clique ou teclado; `PageHeader` e
`DetailLists` para detalhes; e `PageHeader` com seções de formulário em duas
colunas responsivas para criar e editar. Botões, checkboxes e menus internos
ficam independentes da navegação da linha. Erros de campo ficam vermelhos e
recebem mensagem abaixo do campo. Toda tela também exibe `Breadcrumb` com a
equipe ativa, o módulo e o título atual. Em Laravel, o padrão reaproveita o
`Breadcrumb` ou `Breadcrumbs` existente no layout.

## Catálogo por domínio

| Domínio | Especialistas |
| --- | --- |
| backend e dados | Laravel, Supabase, Postgres, Redis e APIs web |
| frontend | React, Astro, Next.js, TypeScript e Tailwind CSS |
| interface | design system, experiência de interface, shadcn/ui, UI, UX e acessibilidade web |
| plataforma | Docker, Docker Swarm, Ansible e engenharia de entrega |
| qualidade | segurança, observabilidade e performance |
| design técnico | arquitetura e modelagem de domínio |
| engenharia | code review, revisão de qualidade, debugging, prototipação, pesquisa e conflitos Git |

Cada especialista explica o fluxo de trabalho e as validações próprias da sua
tecnologia. Uma mudança em Eloquent pode combinar Laravel e Postgres, por
exemplo, mas uma alteração isolada em uma página Astro não precisa carregar
orientações de todo o catálogo.

## Guia de cada especialista

Esta é a referência de entrada para todos os especialistas distribuídos pelo
Specsfy. Use o nome de comando na instalação. O setup instala o núcleo e os
especialistas detectados; os demais permanecem disponíveis para instalação
manual quando a entrega pedir aquele domínio.

| Especialista | Quando usar |
| --- | --- |
| Laravel | Domínio PHP, HTTP, filas, autorização, persistência e testes Laravel. |
| Supabase | Postgres gerenciado, Auth, RLS, Storage, Realtime e Edge Functions. |
| PostgreSQL | Modelagem relacional, SQL, índices, migrations e operação do banco. |
| Redis | Cache, filas, locks, rate limiting e estruturas de dados em memória. |
| Modelagem de Dados | Entidades, relações, ciclos de vida e contratos persistentes. |
| Modelagem de Domínio | Linguagem do negócio, invariantes e limites entre módulos. |
| Arquitetura de Software | Módulos, dependências, atributos de qualidade e fronteiras técnicas. |
| Design System | Regras macro, defaults, estados, padrões CRUD e exceções com alcance. |
| React | Componentes, estado, efeitos, acessibilidade e testes de interface. |
| Tailwind CSS | Tokens, responsividade, variantes e CSS do design system. |
| shadcn/ui | Primitives, registry, tema e padrões acessíveis de aplicação. |
| ReUI | Composições gratuitas para interfaces React e Tailwind, especialmente CRUDs. |
| Componentes React | Catálogos copiáveis que complementam UI design em projetos React. |
| UI Design | Layouts, dashboards, tabelas, formulários, estados e hierarquia visual. |
| UX Design | Fluxos, arquitetura de informação, pesquisa e validação de uso. |
| Experiência de Interface | Leitura do sistema atual, telas, formulários e tarefas de interface. |
| Acessibilidade Web | WCAG, semântica, teclado, foco e tecnologias assistivas. |
| Astro | Ilhas, conteúdo, renderização, integrações e performance em Astro. |
| Next.js | App Router, fronteiras server/client, cache, dados e deploy. |
| TypeScript | Tipos, strictness, módulos e contratos de API. |
| Docker | Imagens, Compose, segurança, builds e ambiente local. |
| Docker Swarm | Stacks, serviços, redes, secrets, rollout e recuperação. |
| Ansible | Playbooks, roles, Vault e automação de infraestrutura. |
| APIs Web | Contratos HTTP, erros, paginação, idempotência e evolução de API. |
| Observabilidade | Logs, métricas, traces, SLOs e alertas acionáveis. |
| Engenharia de Entrega | CI/CD, artefatos, promoções, migrations, rollout e rollback. |
| Segurança de Aplicações | Ameaças, controles, segredos e verificações de segurança. |
| Performance | Orçamentos, medição, profiling, carga e regressões. |
| Code Review | Revisão técnica guiada pelo contrato e pelos testes. |
| Revisão de Qualidade | Conformidade do código recém-escrito com os padrões do projeto, por severidade. |
| Debugging | Diagnóstico de bugs, falhas intermitentes e regressões. |
| Prototipação | Protótipos descartáveis para dúvidas técnicas ou de interface. |
| Pesquisa Técnica | Pesquisa rastreável em fontes primárias e artefatos observáveis. |
| Resolução de Conflitos Git | Conflitos Git preservando intenção e integração do código. |
| Gitflow | Branches, merges e ciclo de release quando o projeto adotá-lo. |

Cada linha corresponde ao comando `specsfy-specialist-<nome-em-inglês>` do
catálogo. A listagem completa de nomes, tags, dependências e sinais de
detecção está em `specialists/catalog.json` no repositório do Specsfy.

## Relação com as bases

- `specsfy-02-backlog` identifica a necessidade.
- `specsfy-03-specify` registra requisitos e atributos de qualidade.
- `specsfy-04-validate` seleciona lentes de revisão.
- `specsfy-05-tasks` usa checklists técnicos para decompor trabalho.
- `specsfy-06-tdd-bdd` preserva RED/GREEN.
- `specsfy-07-implement` executa de acordo com a stack.
- `specsfy-update-spec` revisa requisitos e atributos de qualidade
  afetados por uma mudança posterior.
- `specsfy-progress` identifica a orientação técnica aplicável e executa a
  transição automática.

A presença de um especialista não aprova gates. O Plan Gate ainda exige um RED
válido, e o Delivery Gate depende dos testes e das evidências registradas na
spec.

<!-- markdownlint-enable MD013 -->
