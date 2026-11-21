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
- Instalar ou migrar primitives sem confirmar a base: desde julho de 2026 o
  shadcn/ui cria projeto novo em Base UI por default, então `init` sem `-b
  radix` muda a base de um projeto que esperava Radix.

## No Specsfy

1. **Fonte de entrada por fase**
   - Em `specsfy-02-backlog`, leia o item em `specs/backlog/` e registre ali
     as decisões e sinais do especialista, além das dúvidas abertas.
   - Em `specsfy-03-specify` e `specsfy-04-validate`, use a
     spec aberta e devolva a conclusão à seção trabalhada pela fase.
   - Em `specsfy-05-tasks`, ajude a sugerir e sincronizar especialistas e modos
     entre o cabeçalho, a seção 8 e as tarefas. Só essa fase escreve a seção 14.
   - Em `specsfy-06-implement`, limite-se à tarefa indicada e ao passo carregado.

   Nas fases com spec, leia a spec aberta indicada pela skill chamadora ou
   localizada por `specsfy status`. Consulte a linha `| Especialistas |`,
   a subseção `#### Especialistas` em `### 8. Plano técnico` e a seção
   pertinente à fase.
   Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md` e, como a tarefa compõe telas, `INTERFACE.md`.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-ui-components (components|reui|shadcn)`.
   Sem indicação, escolha o modo pelo "Quando usar" acima.
3. Devolva a conclusão e as dúvidas abertas no destino indicado no item 1,
   no próprio backlog, na spec ou na tarefa da fase.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Confirme componentes, primitives e telas em `INTERFACE.md` e, quando a fase
   trabalhar o plano técnico da spec, descreva a composição em
   `Views e experiência` na seção 8. Preserve a primitive já registrada e
   instale um registry novo somente após decisão explícita.

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
   os estados e os breakpoints. Fixe as superfícies CRUD e dashboard e as
   operações incluídas no Contrato CRUD antes de buscar componentes.
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

Todo CRUD com interface React e Tailwind usa ReUI como base visual: Data Grid
ou List para consulta, Filters para recorte, Form e campos ReUI para criação e
edição, Dialog ou Sheet para ações contextuais e Alert/Badge para retorno e
status. Não crie uma alternativa manual quando o catálogo gratuito já atender
a interação. (regra da casa)

1. Confirme React 19+, Tailwind CSS v4 e shadcn/ui com a CLI atual. Use o
   modo shadcn para inicializar ou auditar `components.json`, aliases, tema e
   primitives. Leia [reui-setup.md](references/reui-setup.md) para escolher a
   variante Base UI ou Radix já adotada e configurar `@reui`.
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
   Projeto novo desde julho de 2026 nasce em Base UI; Radix continua
   suportado e é escolhido com `npx shadcn@latest init -b radix`. Se a base
   for mista ou incerta, registre o sinal por arquivo e esclareça a
   divergência antes de adicionar, migrar ou reescrever primitives.
2. Compare código incorporado e customizações locais. Escolha a semântica
   e o comportamento exigidos, como Dialog modal, Popover ou Sheet, usando
   a API, as props e os atributos de estado da base presente. Na Base UI, a
   composição usa a prop `render` onde o Radix usava `asChild`.
3. Use [shadcn-standards.md](references/shadcn-standards.md) para registry,
   composição, Data Table, formulários, overlays, Sidebar, Chart e tema.
   Adicione somente o necessário e revise linha a linha o código copiado.
   Use `npx shadcn@latest info` para leitura do projeto, `--dry-run`, `--diff`
   e `--view` do `add` para conferir antes de escrever, e compare o diff do
   registry antes de atualizar um arquivo customizado.
4. Adapte tokens e variantes `cva` preservando semântica, foco e teclado.
   Combine com reui para composições de CRUD e dashboard compatíveis.

## Padrões

- Use `assets/components/` como referências versionadas e copiáveis. Código
  gerado pelo registry entra no projeto e passa a ser mantido pelo time.
  Preserve contratos locais, `Link`, imagens, ícones, tokens e primitives.
- Use o contrato CRUD do modo system de interface. Monte as ações pela lista de
  operações incluídas declaradas no campo `Operações:` do Contrato CRUD da
  spec; uma tela só de listagem e cadastro não ganha editar/apagar. Para CRUD
  React e Tailwind, consulte ReUI gratuito primeiro: Data Grid ou List,
  Filters, Form e campos, Dialog ou Sheet, Alert e Badge. Se `consultar`
  constar no Contrato CRUD, habilite o link da linha por clique e teclado com
  controles independentes. Adapte o `Breadcrumb` do shell e associe o erro
  de campo abaixo do controle.
  (regra da casa)
- Centralize CSS variables e variantes. Preserve semântica, labels,
  `aria-*`, `sr-only`, `alt`, tema claro/escuro, breakpoints, foco inicial,
  trap, retorno ao gatilho e Escape oferecidos pela primitive.
- Importe `cn` do pacote `cn` (padrão desde setembro de 2026), não de uma
  cópia local de `clsx` + `tailwind-merge`; `lib/utils.ts` apenas reexporta.
  Projeto antigo migra com `npx shadcn@latest migrate cn`. O CSS global
  importa `@import "shadcn/tailwind.css"` para as variantes e animações
  compartilhadas; `eject` existe para quem precisa inlinear esse CSS.
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
  rotas, assets externos, `components.json`, tokens e proveniência. Confirme
  que novos pacotes foram aprovados e que itens ReUI são `@reui/c-*` ou
  dependências públicas do registry, e que `cn` vem do pacote `cn` quando o
  projeto já usa a CLI v4.
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
