# Componentes React

O especialista Componentes React oferece ao agente 231 exemplos TSX de
interface, versionados em `assets/components/`. Eles servem como referência
copiável para compor telas React e Tailwind, sem adicionar uma biblioteca de
runtime ao projeto.

## Quando usar

- Você vai criar uma interface React a partir dos exemplos do catálogo.
- Você quer comparar variantes de navegação, formulário, listagem, feedback,
  marketing ou tipografia.

O especialista trabalha junto com o UI Design, que define hierarquia,
composição e densidade antes da escolha do exemplo. Correções de estado e de
efeitos sem trabalho visual ficam com o especialista React.

## Como ele trabalha

1. Carrega os especialistas Design System e UI Design e aplica o
   `DESIGNSYSTEM.MD` como fonte geral e o `INTERFACE.md` como registro local.
2. Inspeciona React, framework, Tailwind, componentes locais, ícones e
   testes. Com shadcn/ui, confirma a base de primitives de cada componente.
3. Confirma com UX e UI a tarefa principal, as telas, os formulários, os
   estados e os breakpoints, pontos que o catálogo não define.
4. Em um CRUD autenticado, seleciona primeiro as famílias de `PageHeader`,
   `DataGrid`, `DetailLists`, formulário e feedback.
5. Em um dashboard, seleciona `PageHeader`, filtros, indicadores, a
   visualização principal e a investigação detalhada.
6. Escolhe a família no catálogo, lista os exemplos candidatos e lê o menor
   número de arquivos capaz de comparar as variantes.
7. Adapta a referência aos tokens, componentes, rotas e convenções do
   projeto, sem trocar a arquitetura local pela do exemplo.
8. Implementa os estados relevantes e valida comportamento, aparência,
   responsividade e acessibilidade.

## Padrões aplicados

- Os arquivos de `assets/` são referências copiáveis e não entram como
  dependências.
- Semântica, teclado, foco, `aria-*`, `sr-only`, `alt`, dark mode e
  breakpoints são preservados na adaptação.
- Tokens, primitives, `Link` e componentes já publicados no projeto têm
  preferência.
- Conteúdo fictício, URLs externas, `href="#"` e textos de demonstração são
  substituídos.
- Dependências citadas por um exemplo, como Headless UI ou Heroicons, só
  entram com a sua autorização.
- A composição segue o especialista UI Design, sem seções extras por causa de
  um exemplo disponível.
- Os defaults de CRUD do Design System valem aqui, com `Breadcrumb`, linha do
  `DataGrid` clicável e formulários em seções.
- O erro de campo aparece em vermelho, com mensagem abaixo do campo, foco no
  primeiro erro e valores preservados.

## Erros que ele evita

- Copiar uma página inteira com conteúdo fictício, imports inexistentes e
  links `#`.
- Escolher um exemplo pela aparência antes de definir a tarefa e a
  hierarquia.
- Instalar todas as dependências de um exemplo e criar uma segunda fonte de
  componentes.
- Transformar componentes estáticos em Client Components por conveniência.

## Como conferir o resultado

- Testes, lint e typecheck do projeto passam.
- Os estados nominal, carregando, vazio, erro, desabilitado e sem permissão
  foram exercitados quando relevantes.
- Celular, desktop, zoom, overflow, conteúdo curto e longo, teclado, foco,
  contraste e movimento reduzido foram verificados.
- Nenhum pacote entrou sem autorização e todos os imports existem.
- A interface final passou pelo checklist de qualidade e pelo especialista UI
  Design.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-react-ui-components \
  --agent universal --copy --full-depth
```

O catálogo instala junto os especialistas Design System e UI Design.

## Especialistas relacionados

- [Experiência de Interface](interface-experience.md) conduz a descoberta e a
  entrega da tela.
- [shadcn/ui](shadcn-ui.md) identifica a base de primitives e fornece
  componentes adaptáveis.
- [UI Design](ui-design.md) define composição, hierarquia e densidade.
- [Design System](design-system.md) define as orientações gerais e os padrões
  de CRUD.
- [React](react.md) cuida do estado, dos efeitos e dos testes.
- [Tailwind CSS](tailwind-css.md) cuida dos tokens e utilitários.
- [Acessibilidade Web](web-accessibility.md) conduz a auditoria WCAG.
- [Next.js](nextjs.md) e [Astro](astro.md) definem o limite entre servidor e
  cliente.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-react-ui-components/SKILL.md),
com o catálogo de famílias, o guia de composição de páginas e o checklist de
qualidade na pasta de referências.
