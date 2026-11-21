# Mapa de composição

Use este mapa, junto de `$specsfy-specialist-interface` (modo ui), para decidir quais
famílias de `assets/components/` consultar e em qual ordem. Os nomes `ui-*`
abaixo são rótulos de família herdados pelas composições; consulte a
correspondência em [catalog.md](catalog.md).

## Landing page SaaS

Sequência comum:

1. `ui-hero`: primeira dobra com barra de navegação e prova visual.
2. `ui-marketing-features`: seção de recursos ou grade de benefícios.
3. `ui-marketing-proof`: estatísticas, depoimentos ou logos como prova.
4. `ui-marketing-conversion` ou `ui-marketing-content`: preços, FAQ ou CTA final.
5. `ui-layout-navigation`: rodapé.

Boas combinações:

<!-- markdownlint-disable MD013 -->

- `hero-with-navbar-screenshot` + `feature-grid-with-screenshot` + `testimonial-masonry-grid` + `pricing-three-tier-frequency-toggle` + `faq-disclosure-list` + `footer-newsletter-row`.
- `hero-with-navbar-screenshot` + `feature-grid-three-column` + `logo-cloud-trusted-teams` + `pricing-two-tier-card-highlight` + `footer-newsletter-row`.
- `ui-layout-navigation/navbar-marketing-mega-menu` + `hero-with-navbar-screenshot` + `feature-grid-inline-icons` + `testimonial-masonry-grid` + `footer-newsletter-row`.
- `ui-layout-navigation/navbar-marketing-mega-menu-full-width` + `hero-with-background-image-navbar` + `feature-grid-with-screenshot` + `pricing-two-tier-card-highlight` + `footer-newsletter-row`.
- `ui-layout-navigation/navbar-marketing-dual-popover` + `hero-with-navbar-screenshot` + `content-mission-stats` + `team-image-social-grid` + `footer-multi-column-social`.
- `ui-layout-navigation/navbar-marketing-dual-popover-sticky-mobile-cta` + `hero-with-code-panel` + `feature-grid-with-screenshot` + `cta-dark-centered` + `footer-newsletter-row`.
- `ui-layout-navigation/navbar-marketing-popover-overlay` + `hero-with-navbar-screenshot` + `feature-grid-with-screenshot` + `logo-cloud-trusted-teams` + `footer-newsletter-row`.
- `ui-layout-navigation/navbar-marketing-popover-enterprise` + `hero-with-code-panel` + `pricing-two-tier-card-highlight` + `stats-trust-grid` + `footer-newsletter-row`.
- `ui-layout-navigation/navbar-marketing-popover-enterprise-split-nav` + `hero-with-code-panel` + `feature-grid-with-screenshot` + `pricing-two-tier-card-highlight` + `footer-newsletter-row`.
- `ui-layout-navigation/navbar-marketing-popover-editorial-blog` + `hero-with-navbar-screenshot` + `blog-featured-list.tsx` + `cta-dark-centered.tsx` + `footer-newsletter-row`.
- `ui-layout-navigation/navbar-marketing-simple` + `hero-with-code-panel` + `feature-grid-three-column` + `logo-cloud-trusted-teams` + `footer-centered-links-social`.
- `ui-layout-navigation/navbar-marketing-centered-logo` + `hero-with-navbar-image-collage` + `content-mission-stats` + `footer-centered-links-social`.
- `ui-layout-navigation/navbar-marketing-simple-full-bleed` + `hero-with-navbar-image-collage` + `content-mission-stats` + `footer-centered-links-social`.
- `ui-layout-navigation/navbar-marketing-simple-inline-login` + `hero-with-navbar-screenshot` + `feature-grid-three-column` + `footer-centered-links-social`.
- `ui-layout-navigation/navbar-marketing-simple-left-grouped` + `hero-with-navbar-image-collage` + `content-mission-stats` + `footer-multi-column-social`.
- `ui-layout-navigation/navbar-marketing-simple-signup-cta` + `hero-with-code-panel` + `pricing-two-tier-card-highlight` + `cta-dark-centered` + `footer-newsletter-row`.
- `ui-layout-navigation/navbar-marketing-simple-indigo` + `hero-with-background-image-navbar` + `stats-trust-grid` + `cta-dark-centered` + `footer-social-simple`.
- `ui-layout-navigation/navbar-marketing-indigo-stacked-mobile-links` + `hero-with-background-image-navbar` + `logo-cloud-trusted-teams` + `cta-dark-centered` + `footer-social-simple`.
- `hero-with-code-panel` + `feature-grid-inline-icons` + `stats-trust-grid` + `cta-dark-centered` + `footer-social-simple`.
- `support-contact-split-form` + `ui-forms/input` + `ui-forms/textarea`.
- `contact-project-brief-form` + `support-contact-cards-background` + `ui-forms/input`.
- `contact-work-together-form` + `ui-forms/radio` + `ui-forms/input`.
- `contact-info-form-panel` + `ui-forms/input` + `ui-forms/textarea`.
- `contact-side-info-form` + `ui-forms/input` + `ui-forms/textarea`.
- `contact-info-form-panel` + `ui-forms/input` + `ui-forms/textarea`.

<!-- markdownlint-enable MD013 -->

## Site institucional

Sequência comum:

1. `ui-hero`: imagem editorial, colagem ou imagem dividida.
2. `ui-marketing-content` ou `ui-marketing-proof`: apresentação, missão e
   estatísticas.
3. `ui-marketing-company`: equipe, escritórios, carreiras ou contato.
4. `ui-layout-navigation`: rodapé com várias colunas.

Boas combinações:

<!-- markdownlint-disable MD013 -->

- `hero-with-background-image-navbar` + `content-mission-stats` + `team-image-social-grid` + `offices-simple-grid` + `footer-multi-column-social`.
- `hero-with-navbar-image-collage` + `careers-job-openings` + `team-avatar-dense-grid` + `footer-centered-links-social`.

<!-- markdownlint-enable MD013 -->

## Produto móvel

Sequência comum:

1. `ui-hero`: aplicativo móvel em uma moldura de dispositivo.
2. `ui-marketing-features`: recursos compactos.
3. `ui-marketing-proof`: depoimentos ou estatísticas.
4. `ui-marketing-conversion`: CTA ou newsletter.

Use `ui-forms` se houver lista de espera, captura de e-mail ou acesso
antecipado.

## Aplicativo autenticado

Sequência comum:

1. `ui-layout-navigation`: `sidebar-layout` ou `stacked-layout`.
2. `PageHeader`: um componente compartilhado de contexto, título, descrição e
   ação principal da tela, configurado por props ou configuração.
3. Lista: `ui-data-display` com `DataGrid` em largura total, coluna `ID`,
   resumo, busca, filtros, ordenação, paginação e as ações das operações
   incluídas no Contrato CRUD; uma tela só de listagem e cadastro não ganha
   editar e apagar.
4. Detalhe: `ui-data-display` com `DetailLists`, status, atributos agrupados,
   atividade e relações quando o domínio pedir.
5. Criar ou editar: seções com coluna de contexto e painel em duas colunas nos
   breakpoints largos, uma coluna no mobile, labels acima dos campos, ajuda
   contextual e feedback por campo.
6. `ui-actions-feedback`: menus suspensos, diálogos, alertas e estados
   vazios.
7. `ui-typography`: títulos, descrições, labels, mensagens e divisores.

Regras do fluxo:

- `DESIGNSYSTEM.MD` define a composição macro antes da seleção de assets.
- O erro de campo aparece em vermelho abaixo do campo e leva foco ao primeiro
  erro sem apagar os valores já preenchidos.
- A linha inteira do DataGrid abre o detalhe por clique e teclado; os controles
  das operações incluídas (editar e apagar quando declaradas) usam uma camada
  acima do link da linha e não propagam o clique.
- A personalidade vem do domínio, dos dados, da linguagem e dos estados, não
  de uma sequência genérica de cards.

Evite `ui-hero` e seções de marketing dentro de painéis, salvo em telas
públicas ou de integração inicial.

### Dashboard autenticado

Sequência comum:

1. `PageHeader` com pergunta operacional, período ou escopo e filtros.
2. Indicadores `KPI` com valor, unidade, período, comparação e fonte.
3. Tendência ou distribuição principal com alternativa textual ou tabular.
4. Lista ou `DataGrid` para investigar os registros que explicam os números.
5. Estados de loading, vazio, erro e atualização próximos da área afetada.

Use primitives shadcn/ui para controles fundamentais e blocos gratuitos ReUI
para acelerar a composição. Adapte os dados, tokens, permissões e textos ao
projeto e registre os blocos em `INTERFACE.md`.

## Formulário público

Sequência comum:

1. `ui-marketing-company` ou `ui-marketing-features` para contextualizar uma
   seção de apresentação ou contato.
2. `ui-forms` para campos e controles.
3. `ui-actions-feedback` para envio, erro, sucesso e confirmação.
4. `ui-typography` para rótulos, textos de ajuda e avisos de política.

Boas combinações:

<!-- markdownlint-disable MD013 -->

- `contact-sales-form-gradient` + `ui-forms/input` + `ui-forms/select` + `ui-forms/textarea` + `ui-forms/switch`.

<!-- markdownlint-enable MD013 -->

## Página de conteúdo ou artigo

Sequência comum:

1. `ui-marketing-content` para a seção do artigo ou conteúdo.
2. `ui-typography` para hierarquia de texto.
3. `ui-marketing-content` ou `ui-marketing-conversion` para publicações
   relacionadas, FAQ ou CTA final.
4. `ui-layout-navigation` para o rodapé.

## Componente Isolado

Escolha a skill pelo papel do componente:

- botão, menu, diálogo ou alerta → `ui-actions-feedback`;
- entrada, seleção, opção ou interruptor → `ui-forms`;
- tabela, avatar, selo ou detalhe → `ui-data-display`;
- título, link, divisor ou texto → `ui-typography`;
- rodapé, barra de navegação, barra lateral ou paginação →
  `ui-layout-navigation`.

O shell de cada tela também renderiza `Breadcrumb` com equipe, módulo e tela
atual. Em Laravel, reutilize o `Breadcrumb` ou `Breadcrumbs` já presente no
layout e sua tipagem de rotas.
