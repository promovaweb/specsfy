---
name: specsfy-specialist-ui-design
description: Projetar e revisar interfaces visuais de sistemas, dashboards e aplicações com hierarquia, layout, tokens, componentes, densidade, estados e responsividade. Use para telas, dashboards, design systems, layouts, tabelas, formulários e navegação; combine com UX e acessibilidade quando houver fluxo ou interação.
---

# Design de interface

## Quando usar

- Acionar para definir ou revisar hierarquia, grid, shell, densidade, tokens,
  estados visuais, tabelas, formulários e navegação de uma interface.
- Acionar quando uma tela funciona, mas a composição dificulta escaneamento,
  comparação, priorização ou recuperação de erros.
- Não acionar para descobrir se o fluxo resolve a necessidade da pessoa; usar
  `$specsfy-specialist-ux-design` para pesquisa, jornada e teste de tarefa.
- Combinar com `$specsfy-specialist-react-ui-components` quando a implementação
  React puder partir de uma referência TSX copiável.

## Fluxo

1. Carregar `$specsfy-specialist-design-system` e ler `DESIGNSYSTEM.MD` antes
   da composição. Confirmar que a jornada e o fluxo de informação foram
   definidos com a pessoa. Para tela ou formulário novo, registrar a tarefa
   principal, as telas, os campos, as validações e o padrão de abertura
   escolhido. Se não houver direção visual, aplicar os defaults do documento e
   só retornar à UX quando faltar uma resposta sobre comportamento ou tarefa.
2. Ler a stack observada, tokens, componentes, breakpoints e
   screenshots atuais antes de propor uma linguagem nova.
   Quando o sistema já existir, inspecionar também as telas e fluxos afetados,
   sua navegação, conteúdo, permissões e estados antes de mudar a composição.
   Preserve framework, primitives, estilos e convenções locais. Só proponha
   nova biblioteca quando a pessoa confirmar a mudança ou quando a stack não
   oferecer uma base identificável.
3. Identificar pessoa, tarefa principal, frequência, dispositivo, densidade e
   consequência do erro; ordenar conteúdo e ações por essa prioridade.
4. Para CRUD, aplicar a matriz macro: lista com `PageHeader` e `DataGrid`,
   detalhe com `PageHeader` e `DetailLists`, criar e editar com `PageHeader` e
   seções de formulário em duas colunas responsivas. Cada seção tem coluna de
   contexto e painel de campos; registrar a justificativa apenas para uma
   exceção explícita.
5. Mapear dados, unidades, permissões e estados nominal, loading, empty,
   partial, error, offline e permission denied antes do layout.
6. Escolher shell, navegação e grid coerentes com a arquitetura da informação;
   usar a matriz em [references/standards.md](references/standards.md).
7. Definir hierarquia por agrupamento, contraste, escala e espaço e mapear cada
   escolha para tokens semânticos.
8. Implementar ou especificar componentes e casos extremos em todos os
   breakpoints sem criar variantes equivalentes às já existentes.
9. Durante o desenvolvimento, conferir bordas, espaçamentos, margens, padding
   e tipografia do sistema, mesmo sem pedido da pessoa. Compare renderização,
   inspeção DOM ou outra forma equivalente nos estados e viewports relevantes.
10. Validar conteúdo real, legibilidade, responsividade, acessibilidade e
   consistência com comprovação visual e comportamental. Registrar o resultado
   no item `VISUAL` da tarefa.

Quando a implementação usar React, carregar
`$specsfy-specialist-react-ui-components` depois de definir a composição para
escolher referências TSX sem transferir a escolha visual para o catálogo de
exemplos.

## Padrões

- Dashboard responde perguntas; não é coleção de cards decorativos.
- Colocar visão geral antes do detalhe e ação junto do objeto afetado.
- Usar tabela para comparação densa, lista para leitura e cards para entidades distintas.
- Preservar posição, filtros e contexto ao navegar entre lista e detalhe.
- Exibir unidade, período, origem, atualização e vazio nos dados.
- Manter ação destrutiva distinta, explicada e reversível quando possível.
- Definir tokens semânticos e uma escala limitada de spacing/tipografia.
- Construir personalidade por dados, linguagem, tokens, ritmo e estados, não por
  uma pilha genérica de cards.
- Exibir labels acima dos campos e erro de campo em vermelho abaixo do campo.
- Usar duas colunas para campos relacionados nos breakpoints largos, uma coluna
  no mobile e largura total para campos longos, ajuda, upload e erros.
- Tornar a linha inteira do `DataGrid` a navegação do detalhe; manter botões,
  checkboxes e menus internos acima do link da linha.
- Manter `Breadcrumb` em todas as telas, com a equipe ativa, o módulo e a tela
  atual. Em Laravel, adaptar o `Breadcrumb` ou `Breadcrumbs` já renderizado
  pelo shell existente.
- Usar um único `PageHeader` componentizado e reutilizável em lista, detalhe,
  criação e edição do CRUD.
- Usar `DataGrid` em largura total na lista, mostrar sempre a coluna `ID`,
  transformar a linha em link para o detalhe e manter botões de editar e apagar
  independentes dentro da linha.

## Antipadrões

- Distribuir métricas em cards idênticos sem pergunta, período ou comparação;
  a tela exibe números, mas não permite interpretar variação ou prioridade.
- Criar uma nova cor, spacing ou variante para cada tela; o design system perde
  vocabulário comum e torna mudanças globais imprevisíveis.
- Usar placeholder como label, ícone sem texto acessível ou cor como único
  estado; o significado desaparece conforme interação e acessibilidade.
- Esconder ações frequentes em menus para obter uma tela “limpa”; aumenta custo
  operacional e reduz descoberta sem diminuir complexidade real.
- Usar cards para uma lista que pede comparação ou substituir `PageHeader` por
  um título solto.
- Duplicar o markup do `PageHeader` por tela, esconder o `ID`, estreitar o
  `DataGrid` ou deixar editar e apagar fora da linha do registro.

## Validação

- Comparar cenários nominal, loading, empty, partial, error, offline e
  permission denied na mesma composição.
- Conferir `DataGrid`, `DetailLists`, `PageHeader` e formulários em seções com
  duas colunas responsivas conforme a superfície CRUD.
- Conferir `Breadcrumb` em cada tela, com o nome da equipe visível e o item atual
  marcado como página. Em Laravel, confirmar o reaproveitamento do componente
  já existente.
- Conferir que uma exceção ao `DESIGNSYSTEM.MD` tem alcance registrado.
- Exercitar conteúdo curto/longo, números extremos, tradução expandida e
  preferências de data, moeda e timezone.
- Verificar viewport mínimo suportado, zoom 200%, reflow, contraste, teclado,
  foco e reduced motion.
- Auditar tokens e componentes novos contra os já publicados e justificar
  qualquer duplicação.
- Conferir bordas, espaçamentos, margens, padding e tipografia nos estados e
  viewports relevantes durante a implementação, registrando o resultado no
  item `VISUAL`.
- Revisão final conjunta com `$specsfy-specialist-react-ui-components` quando
  algum asset React tiver sido adaptado.
- Não declarar a interface consistente ou responsiva sem screenshots ou
  inspeção equivalente nos estados e viewports críticos.

## Skills relacionadas

- `$specsfy-specialist-reui` para composições React e Tailwind já definidas no
  catálogo gratuito.
- `$specsfy-specialist-interface-experience` para mapear telas, ações e estados
  antes da composição visual.
- `$specsfy-specialist-nextjs` governa a fronteira server/client e o roteamento
  da interface; esta skill governa composição e estados visuais.
- `$specsfy-specialist-prototyping` testa alternativas de composição no menor
  nível de fidelidade necessário antes da implementação definitiva.
- `$specsfy-specialist-shadcn-ui` fornece primitives e variantes; esta skill
  decide hierarquia e coerência do sistema que os utiliza.
- `$specsfy-specialist-ux-design` governa pesquisa, jornada, arquitetura da
  informação e validação de tarefas.
- `$specsfy-specialist-react-ui-components` fornece exemplos TSX depois que a
  composição e a hierarquia estão definidas.
- `$specsfy-specialist-design-system` fornece regras macro, defaults e cenários
  canônicos antes da composição visual.
- `$specsfy-specialist-web-accessibility` conduz auditoria WCAG, teclado e
  tecnologia assistiva.
- `$specsfy-specialist-tailwind-css` traduz tokens e variantes para utilitários
  quando essa é a stack observada.

Leia [references/standards.md](references/standards.md) para matrizes de layout,
densidade, dados, tokens, estados e regras de revisão visual.
