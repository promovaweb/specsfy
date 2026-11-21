# Skills especialistas

<!-- markdownlint-disable MD013 -->

As skills base conduzem a metodologia. As
`specsfy-specialist-*` acrescentam orientação para a tecnologia encontrada no
projeto, como Laravel, Next.js, Postgres ou Redis. Assim, você instala
somente o conhecimento técnico usado pela aplicação.

Na interface, cada uma usa o padrão `Specsfy - Especialista - Nome`, como
`Specsfy - Especialista - Laravel`. O identificador de comando continua
`specsfy-specialist-laravel`.

Para criar ou alterar interfaces, `specsfy-specialist-interface` reúne a
experiência de interface, o design system, o UI design, o UX design e a
acessibilidade web. Ele examina a stack e o sistema atual, conduz as perguntas
sobre telas e menus, mantém as orientações gerais, os defaults e os cenários de
CRUD e garante uma fase específica de interface nas tarefas. Os componentes
visuais prontos ficam com `specsfy-specialist-ui-components`.

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
de modelagem, arquitetura e componentes de interface. Ele mostra os
itens e usa `npx skills add` no projeto atual. Tecnologias sem sinal no código não entram na
instalação.

| Stack encontrada | Especialista |
| --- | --- |
| Laravel | Laravel |
| Supabase, PostgreSQL, MySQL, MongoDB ou Redis | banco ou plataforma correspondente |
| React, Next.js ou TypeScript | especialista correspondente |
| Tailwind CSS, shadcn/ui ou ReUI | Tailwind CSS ou componentes de interface |
| Docker, Swarm, Traefik ou Ansible | Docker e servidor correspondentes |
| Cloudflare, Workers ou wrangler | Cloudflare |
| n8n | n8n |
| OpenAPI, OpenTelemetry, Prometheus ou CI/CD | arquitetura, observabilidade ou entrega correspondente |
| `laravel/mcp` ou Route Handlers do Next.js | MCP |
| Pest, Playwright ou Vitest | testes |

## Instalação manual

Você pode instalar qualquer especialista do catálogo fora do setup. Essa opção
serve para uma necessidade pontual que a stack ainda não revela, como revisão,
acessibilidade ou pesquisa técnica:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-interface --agent universal --copy --full-depth
```

O setup não remove especialistas instalados manualmente. Eles permanecem no
projeto e podem ser usados quando a entrega precisar deles.

Para usar os componentes gratuitos do ReUI e as primitives shadcn/ui, instale o
especialista de componentes e suas dependências resolvidas pelo catálogo:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-ui-components --agent universal --copy --full-depth
```

Ele prepara o registry ReUI para React 19, Tailwind CSS v4 e shadcn/ui. Em
Laravel, atende projetos com Inertia e Vite, enquanto em outros frameworks
React preserva o padrão já existente. Nos CRUDs e dashboards compatíveis, o ReUI é a
base da consulta e dos filtros, dos formulários e dos indicadores, além das
ações contextuais e das mensagens de retorno. A
skill consulta o catálogo gratuito antes de permitir a criação de componente
manual equivalente.

## Pacotes Laravel

No modo de pacotes, `specsfy-specialist-laravel` recebe a URL de um repositório
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
exceções por alcance. O `specsfy-specialist-interface` mantém esse arquivo.

Cada bloco registrado informa:

- arquivo, origem e finalidade
- props, eventos e estados
- acessibilidade e consumidores
- a forma de reaproveitar ou estender o bloco

A seção 10 de cada spec com interface usa a mesma relação para declarar os
blocos React e os componentes shadcn/ui e ReUI escolhidos. As tarefas de
interface atualizam o `INTERFACE.md` antes de serem concluídas.

Antes de desenvolver uma tela React, o planejamento e a implementação carregam
`$specsfy-specialist-ui-components`. A skill procura primeiro os blocos
existentes, orienta o reaproveitamento ou a adaptação e mantém `INTERFACE.md`
alinhado ao código. Se a skill estiver ausente, o agente propõe a instalação
e pede autorização antes de escrever JSX ou TSX.

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
| backend e banco de dados | Laravel, Supabase, PostgreSQL, MySQL, MongoDB, Redis e MCP |
| frontend | React, Next.js, TypeScript e Tailwind CSS |
| interface | interface e componentes de UI |
| plataforma | Docker com Traefik, servidor, Cloudflare e entrega |
| automação | n8n |
| qualidade | segurança de aplicações, code review, testes e observabilidade |
| design técnico | arquitetura e modelagem |
| engenharia | debugging, pesquisa e Git |

Cada especialista explica o fluxo de trabalho e as validações próprias da sua
tecnologia. Uma mudança em Eloquent pode combinar Laravel e Postgres, por
exemplo, mas uma alteração isolada em uma página Astro não precisa carregar
orientações de todo o catálogo.

## Guia de cada especialista

Esta é a referência de entrada para os 27 especialistas distribuídos pelo
Specsfy, com um guia do usuário para cada um. Use o nome de comando na
instalação. O setup instala o núcleo e os especialistas detectados; os demais
permanecem disponíveis para instalação manual quando a entrega pedir aquele
domínio.

| Especialista | Modos e quando usar |
| --- | --- |
| [Laravel](specialists/laravel.md) | Modos `app`, `packages` e `mcp`: domínio PHP, HTTP, filas, autorização, persistência, testes, pacotes Composer recebidos por URL GitHub e servidor MCP com `laravel/mcp`. |
| [MCP](specialists/mcp.md) | Modos `protocol`, `laravel` e `nextjs`: Streamable HTTP, capacidades, descoberta OAuth, servidores com `laravel/mcp` e Route Handlers do Next.js com o SDK oficial. |
| [Supabase](specialists/supabase.md) | Sem modos: Postgres gerenciado, Auth, RLS, Storage, Realtime e Edge Functions. |
| [PostgreSQL](specialists/postgres.md) | Sem modos: modelagem relacional, SQL, índices, concorrência, migrations e operação do banco. |
| [MySQL](specialists/mysql.md) | Modos `schema`, `queries` e `operation`: schema com utf8mb4, índices e tipos, `EXPLAIN` e locks InnoDB, backup, replicação e upgrade 8.x. |
| [MongoDB](specialists/mongodb.md) | Modos `modeling`, `queries` e `operation`: documento embutido ou referência, schema validation, aggregation, replica set, backup e transações. |
| [Redis](specialists/redis.md) | Sem modos: cache, filas, locks, rate limiting, estruturas e operação em memória. |
| [Modelagem](specialists/modeling.md) | Modos `domain` e `data`: linguagem do negócio, invariantes e transições no `domain`; tabelas, migrations, cardinalidade e cotas no `data`. |
| [Arquitetura](specialists/architecture.md) | Modos `system` e `web-api`: módulos, dependências e atributos de qualidade no `system`; contrato HTTP, erros, paginação e idempotência no `web-api`. |
| [Interface](specialists/interface.md) | Modos `discovery`, `system`, `ux`, `ui` e `accessibility`: do levantamento do sistema atual e do design system às telas, aos fluxos e à acessibilidade WCAG. |
| [Componentes de UI](specialists/ui-components.md) | Modos `components`, `reui` e `shadcn`: catálogo copiável de blocos React, composições gratuitas do ReUI e primitives com theming. |
| [React](specialists/react.md) | Sem modos: componentes, estado, efeitos, acessibilidade e testes de interface. |
| [Tailwind CSS](specialists/tailwind-css.md) | Sem modos: tokens, responsividade, variantes e CSS do design system. |
| [Next.js](specialists/nextjs.md) | Sem modos: App Router, fronteiras server/client, cache, dados e deploy. |
| [TypeScript](specialists/typescript.md) | Sem modos: modelagem de tipos, strictness, módulos e contratos de API. |
| [Docker](specialists/docker.md) | Modos `compose`, `swarm` e `proxy`: imagens e ambiente local, stack Swarm com rollout e recuperação, e Traefik como reverse proxy. |
| [Servidor](specialists/server.md) | Modos `debian`, `ansible` e `report`: APT, systemd, SSH e nftables, automação com Ansible e relatório de servidor somente leitura. |
| [Cloudflare](specialists/cloudflare.md) | Modos `dns`, `workers` e `security`: DNS, proxy e TLS, Workers com wrangler, KV, D1, R2 e Pages, WAF, Access e Tunnel. |
| [Entrega](specialists/delivery.md) | Modos `deploy`, `versioning` e `ci-cd`: deploy em Docker e Swarm via Ansible, SEMVER e GitHub Actions com promoções, migrations e rollback. |
| [n8n](specialists/n8n.md) | Modos `workflows`, `self-hosting` e `integration`: nós, expressões, credenciais e retries, queue mode com Postgres e Redis, API e webhooks. |
| [Git](specialists/git.md) | Modos `gitflow` e `conflicts`: branches, merge e ciclo de release no `gitflow`; resolução de conflito preservando a intenção no `conflicts`. |
| [Observabilidade](specialists/observability.md) | Modos `signals` e `performance`: logs, métricas, traces, SLOs e alertas no `signals`; profiling, carga e regressão no `performance`. |
| [Testes](specialists/testing.md) | Modos `pest`, `playwright` e `vitest`: Pest e PHPUnit no Laravel, E2E no navegador e unidade e componente em TypeScript. |
| [Segurança de Aplicações](specialists/application-security.md) | Sem modos: ameaças, controles, segredos e verificação de autenticação, autorização, dado sensível e isolamento entre tenants. |
| [Code Review](specialists/code-review.md) | Sem modos: revisão técnica guiada pelo contrato, pelos padrões e pelos testes. |
| [Debugging](specialists/debugging.md) | Sem modos: diagnóstico de bugs, falhas intermitentes e regressões. |
| [Pesquisa](specialists/research.md) | Modos `sources` e `prototype`: pesquisa rastreável em fontes primárias e protótipo descartável para reduzir incerteza. |

Cada linha corresponde ao comando `specsfy-specialist-<nome-em-inglês>` do
catálogo. A listagem completa de nomes, tags, dependências e sinais de
detecção está em `specialists/catalog.json` no repositório do Specsfy.

## Especialistas dentro do fluxo

A linha `Especialistas` no cabeçalho da spec lista os nomes curtos separados
por vírgula, como `interface, laravel`. Na seção 8, a tabela `Especialistas`
registra o modo, o sinal observado e as fases em que a skill será carregada.
Uma spec sem demanda especializada deixa esses campos vazios.

Use `specsfy specialists suggest 0001` para consultar os sinais de uma spec.
O comando só sugere especialista de tecnologia quando a stack do projeto
confirma a tecnologia, pela detecção do catálogo ou pelo `.specsfy/STACK.md`.
O especialista declarado na spec aparece sempre, mesmo que a detecção não o
encontre no projeto. O `specsfy verify` avisa sobre especialistas desconhecidos,
sem instalação ou sugeridos por um sinal e ainda sem declaração.

- **Backlog** identifica sinais no pedido e anota os especialistas prováveis
  no item refinado.
- **Especificação (`specify`)** confirma os sinais, preenche o cabeçalho e a
  tabela e carrega a skill ao escrever a seção que depende dela.
- **Validação (`validate`)** confere a instalação, as exigências aplicáveis e
  os sinais cobertos e registra os achados no gate.
- **Planejamento de tarefas (`tasks`)** carrega as orientações aplicáveis e
  anota cada tarefa que precisa de um especialista com o nome e o modo, por
  exemplo, `Especialista: $specsfy-specialist-ui-components (components)`.
- **Implementação e testes (`implement`)** carregam, antes de cada tarefa,
  os especialistas aplicáveis da spec e da tarefa nos modos indicados.
- **Atualização da spec (`update-spec`)** atualiza o cabeçalho e a tabela da
  seção 8 quando a mudança traz um novo sinal.

A presença de um especialista não aprova nenhum gate do Specsfy, porque o Plan
Gate continua exigindo um RED válido e o Delivery Gate continua dependendo dos
testes e das comprovações registradas na spec.

## Justificativa de tamanho

Esta página reúne o índice, as regras de detecção e a tabela dos 27 guias de
especialista. A tabela precisa ficar no mesmo lugar que explica a instalação e
o filtro de stack, porque a escolha de um especialista nasce da comparação
entre domínios e modos. Repartir o índice em outras páginas obrigaria você a
saltar entre arquivos para decidir qual skill instalar.

<!-- markdownlint-enable MD013 -->
