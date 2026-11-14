# UI Design

O especialista UI Design orienta o agente na composição visual das telas, da
hierarquia e do grid aos tokens e estados. Ele parte do `DESIGNSYSTEM.MD` e da
jornada já definida para compor telas fáceis de escanear e de comparar, com
recuperação de erros visível.

## Quando usar

- Você vai definir ou revisar a hierarquia, o grid, o shell, os tokens, as
  tabelas, os formulários ou a navegação de uma interface.
- Uma tela funciona, mas a composição dificulta escanear, comparar, priorizar
  ou corrigir erros.

A descoberta sobre o fluxo resolver ou não a necessidade fica com o
especialista UX Design. Quando a implementação React pode partir de um exemplo
TSX, combine com o especialista Componentes React.

## Como ele trabalha

1. Carrega o especialista Design System, lê o `DESIGNSYSTEM.MD` e confirma que
   a jornada e o fluxo de informação já foram definidos com você. Sem direção
   visual sua, aplica os defaults do documento.
2. Lê a stack, os tokens, os componentes, os breakpoints e as telas atuais. A
   biblioteca visual só muda com a sua confirmação.
3. Identifica a tarefa principal, a frequência, o dispositivo, a densidade e a
   consequência de um erro, para ordenar conteúdo e ações por essa prioridade.
4. Em um CRUD, aplica a composição padrão do design system para lista,
   detalhe, criação e edição.
5. Levanta os campos, as unidades, as permissões e todos os estados da tela
   antes do layout.
6. Escolhe shell, navegação e grid coerentes com a arquitetura da informação.
7. Define a hierarquia por agrupamento, contraste, escala e espaço, com cada
   escolha ligada a tokens semânticos.
8. Especifica componentes e casos extremos em todos os breakpoints, sem
   variantes equivalentes às existentes.
9. Confere bordas, espaçamentos e tipografia durante o desenvolvimento, nos
   estados e viewports relevantes.
10. Valida conteúdo real, legibilidade, responsividade e acessibilidade e
    registra o resultado no item `VISUAL` da tarefa.

Em projetos React, o especialista Componentes React entra depois da
composição. Ele escolhe exemplos TSX para a implementação, enquanto a
definição visual continua com este especialista.

## Padrões aplicados

- Um dashboard responde a perguntas e não é uma coleção de cards decorativos.
- A visão geral vem antes do detalhe. Cada ação fica junto do objeto que ela
  afeta.
- Tabelas servem à comparação densa, listas à leitura e cards a entidades
  distintas.
- Posição e filtros são preservados na navegação entre lista e detalhe.
- Os números exibem unidade, período, origem, atualização e estado vazio.
- Ações destrutivas são distintas, explicadas e reversíveis quando possível.
- A escala de espaçamento e de tipografia é limitada e usa tokens semânticos.
- Labels ficam acima dos campos e o erro de campo aparece em vermelho abaixo
  do campo.
- Campos relacionados usam duas colunas nas telas largas e uma no celular.
- A linha inteira do `DataGrid` leva ao detalhe, com botões e menus internos
  independentes.
- Todas as telas têm `Breadcrumb` com o team ativo, o módulo e a tela atual.
- O mesmo `PageHeader` aparece em lista, detalhe, criação e edição. A lista
  mostra a coluna `ID`.

## Erros que ele evita

- Métricas em cards idênticos, sem pergunta, período ou comparação.
- Uma cor, um espaçamento ou uma variante nova para cada tela.
- Placeholder como label, ícone sem texto acessível ou cor como único sinal de
  estado.
- Ações frequentes escondidas em menus para deixar a tela mais limpa.
- Cards em uma lista feita para comparação ou um título solto no lugar do
  `PageHeader`.
- Markup do `PageHeader` duplicado por tela, `ID` oculto ou `DataGrid`
  estreito.

## Como conferir o resultado

- Os estados nominal, carregando, vazio, parcial, erro, offline e sem
  permissão foram comparados na mesma composição.
- `DataGrid`, `DetailLists`, `PageHeader` e os formulários em seções seguem a
  superfície de cada tela do CRUD.
- O `Breadcrumb` aparece em cada tela, com o item atual marcado como página.
- Uma exceção ao `DESIGNSYSTEM.MD` tem alcance registrado.
- Conteúdo curto e longo, números extremos, tradução expandida e formatos de
  data, moeda e fuso foram exercitados.
- O viewport mínimo, o zoom de 200%, o reflow, o contraste, o teclado, o foco e
  o movimento reduzido foram verificados.
- Tokens e componentes novos foram comparados com os existentes.
- Capturas de tela ou inspeção equivalente comprovam os estados e viewports
  principais.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-ui-design --agent universal --copy --full-depth
```

O catálogo instala junto o especialista Design System.

## Especialistas relacionados

- [ReUI](reui.md) fornece composições React e Tailwind gratuitas.
- [Experiência de Interface](interface-experience.md) levanta telas, ações e
  estados.
- [Next.js](nextjs.md) cuida do limite entre servidor e cliente.
- [Prototipação](prototyping.md) testa alternativas de composição.
- [shadcn/ui](shadcn-ui.md) fornece primitives e variantes.
- [UX Design](ux-design.md) cuida da pesquisa, da jornada e da arquitetura da
  informação.
- [Componentes React](react-ui-components.md) fornece exemplos TSX.
- [Design System](design-system.md) define as orientações gerais e os
  cenários de CRUD.
- [Acessibilidade Web](web-accessibility.md) conduz a auditoria WCAG.
- [Tailwind CSS](tailwind-css.md) traduz tokens e variantes em utilitários.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-ui-design/SKILL.md),
com orientações de layout, densidade, tokens e revisão visual no arquivo de
referência da mesma pasta.
