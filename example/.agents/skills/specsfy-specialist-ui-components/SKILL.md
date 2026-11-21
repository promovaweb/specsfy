---
name: specsfy-specialist-ui-components
description: Selecionar, compor e adaptar UI React e Tailwind CSS nos modos components (assets TSX copiáveis), reui (registry gratuito) e shadcn (primitives, registry e theming). Use para reutilizar componentes, preparar uma base shadcn/ui ou montar blocos de produto compatíveis com a stack. Para decidir jornada, composição ou auditar WCAG, use specsfy-specialist-interface; para estado, effects ou concorrência sem trabalho visual, use specsfy-specialist-react; para tokens e utilitários Tailwind, use specsfy-specialist-tailwind-css.
---

# Componentes de UI

Adapte componentes existentes à interface, à stack e aos contratos do
projeto. Em React e Tailwind da Promovaweb, shadcn/ui fornece primitives e
ReUI gratuito fornece composições de produto. O catálogo TSX oferece
referências copiáveis para interfaces com ou sem essa base.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Comparar ou adaptar variantes TSX de marketing, navegação, formulários, dados, feedback ou tipografia | components | [Padrões de adaptação](references/components-standards.md) e [catálogo TSX](references/catalog.md) |
| Compor CRUD ou dashboard com itens gratuitos do registry ReUI em uma stack compatível | reui | [Setup ReUI](references/reui-setup.md) e [mapa CRUD](references/reui-catalog-free.md) |
| Preparar ou auditar `components.json`, aliases, tema e primitives, ou compor Data Table, Sidebar, Dialog, Form ou Chart | shadcn | [Identificação de primitives](references/shadcn-primitives.md) e [padrões shadcn/ui](references/shadcn-standards.md) |

Não use para:

- Determinar jornada, layout, densidade ou auditar conformidade WCAG. Use
  `$specsfy-specialist-interface`.
- Corrigir estado, effects ou concorrência sem alteração visual. Use
  `$specsfy-specialist-react`.
- Definir o sistema de tokens e utilitários Tailwind. Use
  `$specsfy-specialist-tailwind-css`.
- Introduzir ReUI em uma stack não confirmada ou usar itens premium. Avalie
  o modo components se houver React ou use `$specsfy-specialist-interface`
  com o especialista da stack existente. Para outra biblioteca visual já
  adotada, avalie o modo components junto do modo ui de interface.

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a linha `| Especialistas |` da tabela de
   metadados, a subseção `#### Especialistas` em `### 8. Plano técnico` e a
   seção que a fase está escrevendo. Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md` e, como a tarefa compõe telas, `INTERFACE.md`.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-ui-components (components|reui|shadcn)`.
   Sem indicação, escolha o modo pelo "Quando usar" acima.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Confirme componentes, primitives e telas em `INTERFACE.md` e descreva a
   composição na subseção `Views e experiência` da seção 8, sem trocar
   primitive já registrada nem instalar registry novo sem decisão.

## Fluxo

1. Abra [references/standards.md](references/standards.md) para regras comuns
   e o índice por modo. Leia `DESIGNSYSTEM.MD` e `INTERFACE.md` antes da
   seleção. Carregue `$specsfy-specialist-interface` para regras macro e
   composição. No modo reui, rode `$specsfy-setup` se faltar `INTERFACE.md`.
2. Inspecione telas, framework, manifests, lockfile, versões de React e
   Tailwind, ícones, primitives locais, testes e `components.json`, quando
   presente. Preserve roteamento, hidratação e convenções da stack.
3. Confirme com os modos ux e ui de interface a tarefa, o fluxo de
   informação, as telas, a abertura de ações, os formulários, a densidade,
   os estados e os breakpoints. Fixe as superfícies CRUD e dashboard antes
   de buscar componentes.
4. Escolha o menor conjunto de componentes que atenda ao comportamento.
   Prefira o equivalente local. Resolva dependências e peça autorização
   antes de instalar pacotes.
5. Adapte dados, rotas, ações, permissões, textos, estados, tokens e
   composição. Mantenha primitives e blocos reutilizáveis nos diretórios
   definidos pelo projeto. A página compõe o fluxo e os componentes de
   domínio implementam grade, filtros, formulário e ações.
6. Registre em `INTERFACE.md` cada bloco ReUI, primitive shadcn/ui ou bloco
   React próprio criado, alterado ou reaproveitado. Inclua caminho, origem,
   finalidade, API (props e eventos), estados, acessibilidade, consumidores
   e como reutilizar ou estender.
7. Valide integração, comportamento, aparência e acessibilidade com os
   comandos do consumidor e percorra os estados reais.

### Modo components

1. Anuncie o uso conjunto com interface antes da escolha. Se houver
   shadcn/ui, use o modo shadcn para identificar a base por arquivo.
2. Selecione a família em [catalog.md](references/catalog.md) e liste só os
   candidatos em `assets/components/<familia>/`. Leia o mínimo de TSX para
   comparar semântica, dependências e distância para o design system.
3. Abra [composition-map.md](references/composition-map.md) para páginas
   completas e [conversation-flow.md](references/conversation-flow.md) para
   conduzir escolhas incrementais. Para CRUD, priorize cabeçalho, lista,
   detalhe, formulário e feedback. Para dashboard, priorize cabeçalho,
   filtros, indicadores, visualização principal e investigação.
4. Use [components-standards.md](references/components-standards.md) ao
   adaptar referência, dependências e estados e
   [interface-quality-checklist.md](references/interface-quality-checklist.md)
   ao revisar a integração da tela.

### Modo reui

1. Confirme React 19, Tailwind CSS v4 e shadcn/ui. Use o modo shadcn para
   inicializar ou auditar `components.json`, aliases, tema e primitives.
   Leia [reui-setup.md](references/reui-setup.md) para escolher a variante
   Base UI ou Radix já adotada e configurar `@reui`.
2. Abra [reui-catalog-free.md](references/reui-catalog-free.md) para mapear
   o CRUD e [reui-components-free.md](references/reui-components-free.md)
   para percorrer as famílias antes de criar uma alternativa. Em Laravel
   com React, leia também a
   [matriz shadcn/ui e ReUI](references/reui-shadcn-components.md).
3. Leia a API, as dependências e os exemplos reais do item. Instale o menor
   conjunto gratuito pelo comando `npx shadcn@latest add` indicado pelo
   registry, usando itens `@reui/c-*` e as dependências públicas resolvidas.
4. Leia [reui-standards.md](references/reui-standards.md) para aplicar os
   tokens ReUI consumidos pela tela nos dois temas. Em Laravel, combine
   com `$specsfy-specialist-laravel` e mantenha Form Requests, policies,
   autorização e validação no servidor. Para Blade, Livewire ou Vue, registre
   e confirme a migração na spec antes de introduzir React.

### Modo shadcn

1. Confirme versão, estilo, aliases, CSS variables e registry do workspace
   correto. Leia [shadcn-primitives.md](references/shadcn-primitives.md).
   Identifique a base pelos imports dos componentes e confirme no manifest.
   Se a base for mista ou incerta, registre o sinal por arquivo e esclareça
   a divergência antes de adicionar, migrar ou reescrever primitives.
2. Compare código incorporado e customizações locais. Escolha a semântica
   e o comportamento exigidos, como Dialog modal, Popover ou Sheet, usando
   a API, as props e os atributos de estado da base presente.
3. Use [shadcn-standards.md](references/shadcn-standards.md) para registry,
   composição, Data Table, formulários, overlays, Sidebar, Chart e tema.
   Adicione somente o necessário e revise linha a linha o código copiado.
   Compare o diff do registry antes de atualizar um arquivo customizado.
4. Adapte tokens e variantes `cva` preservando semântica, foco e teclado.
   Combine com reui para composições de CRUD e dashboard compatíveis.

## Padrões

- Use `assets/components/` como referências versionadas e copiáveis. Código
  gerado pelo registry entra no projeto e passa a ser mantido pelo time.
  Preserve contratos locais, `Link`, imagens, ícones, tokens e primitives.
- Use o contrato CRUD do modo system de interface. Para CRUD React e
  Tailwind, consulte ReUI gratuito primeiro: Data Grid ou List, Filters,
  Form e campos, Dialog ou Sheet, Alert e Badge. Adapte à tarefa, inclusive
  clique e teclado na linha com controles independentes, `Breadcrumb` do
  shell e erro de campo associado abaixo do controle.
- Centralize CSS variables e variantes. Preserve semântica, labels,
  `aria-*`, `sr-only`, `alt`, tema claro/escuro, breakpoints, foco inicial,
  trap, retorno ao gatilho e Escape oferecidos pela primitive.
- Componha Data Table por caso de uso, com colunas, ordenação, filtro,
  seleção e paginação pertinentes. Faça a Sidebar colapsar no mobile,
  respeitar a densidade de navegação e indicar a rota ativa.
- Preserve os valores após erro. Valide formulários também no servidor e
  associe mensagens ao respectivo campo por `aria-describedby` ou relação
  equivalente. Em Server Actions, combine com `$specsfy-specialist-nextjs`
  e `$specsfy-specialist-application-security` para validação e autorização.
  Use `$specsfy-specialist-typescript` para `cva` e schemas de formulário
  (`zod` e `react-hook-form`).

## Antipadrões

- Escolher pela aparência, adicionar seções só porque há um exemplo ou
  copiar páginas com mocks, copy de demonstração, URLs externas, imports
  inexistentes ou `href="#"`.
- Criar alternativa manual antes de consultar primitives locais e catálogo
  gratuito, instalar dependências por inferência ou substituir a stack do
  consumidor pela arquitetura do asset.
- Usar itens premium, configurar `REUI_LICENSE_KEY`, copiar itens por URLs
  manuais ou migrar Base UI e Radix só para instalar um componente.
- Supor que shadcn/ui implica Radix, sobrescrever customização sem diff,
  ajustar uma cor de marca em dezenas de arquivos ou remover título e
  descrição semântica de um Dialog por parecerem redundantes.
- Tornar markup estático um Client Component por conveniência, concentrar
  a interface inteira na rota ou acumular props em uma tabela universal.
  Tratar validação visual ou client-side como autorização ou persistência.

## Validação

- Rode testes, lint, typecheck e build conforme o projeto. Confira imports,
  rotas, assets externos, `components.json`, tokens e proveniência.
  Confirme que novos pacotes foram aprovados e que itens ReUI são
  `@reui/c-*` ou dependências públicas do registry.
- Exercite estados nominal, loading, empty, error, disabled e permission
  denied quando relevantes. Confira tabela com e sem dados, gráfico com
  e sem dados, formulário pendente, erro, sucesso e reabertura após falha
  com valores preservados. Teste Sidebar recolhida, expandida e rota ativa.
- Percorra teclado e foco, inclusive abertura, Escape, trap e retorno em
  overlays. Confira mobile, desktop, zoom, textos curtos/longos, contraste,
  reduced motion, temas e ausência de overflow ou truncamento destrutivo.
- Revise com o [checklist de qualidade](references/interface-quality-checklist.md)
  e com o modo ui de interface. Confirme leitura de `DESIGNSYSTEM.MD` e
  alcance de exceções. Demonstre comportamento e acessibilidade da
  integração em vez de inferir a qualidade pela origem do componente.

## Skills relacionadas

- `$specsfy-specialist-interface` conduz discovery, design system, UX, UI e
  auditoria WCAG que orientam a seleção e a revisão dos componentes.
- `$specsfy-specialist-react` governa ownership de estado, effects,
  concorrência e testes React.
- `$specsfy-specialist-tailwind-css` governa tokens, temas e utilitários
  usados na adaptação.
- `$specsfy-specialist-nextjs` governa roteamento, hidratação e a fronteira
  server/client dos componentes usados no framework.
