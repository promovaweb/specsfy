# Padrões e referências shadcn/ui

## Modelo mental: código, não pacote

- `shadcn add <componente>` copia o arquivo-fonte para dentro do projeto
  (tipicamente `components/ui/`); não há versão instalada em `node_modules`
  para atualizar automaticamente.
- Toda customização feita depois do `add` é permanente até uma pessoa
  reconciliar manualmente com uma versão futura do registry — por isso,
  revisar o diff antes de rodar `add` de novo sobre um componente já
  customizado.
- `components.json` define aliases de import, estilo base e onde os
  arquivos são gerados; confirme-o antes de adicionar um componente para não
  duplicar estrutura de pasta.

## Padrões de composição por caso

| Padrão | Elementos obrigatórios |
| --- | --- |
| Shell de aplicação | `Sidebar` + header + landmark `main`; item de navegação atual marcado (`aria-current`) e perceptível visualmente |
| Dashboard | Ordem resumo → tendência → detalhe; período e filtros ativos sempre visíveis, não escondidos atrás de um menu |
| Data Table | Título, filtros, cabeçalho ordenável, seleção de linha, paginação, estado vazio e estado de erro distintos do "carregando" |
| Form | Label associado, texto de ajuda, erro por campo, estado pendente no submit, confirmação de sucesso, valores preservados após falha de validação |
| Overlay (Dialog/Sheet/Popover) | Trigger semântico (`button`), título e descrição associados via aria, foco movido para dentro ao abrir, foco devolvido ao trigger ao fechar |
| Chart | Título, unidade dos eixos, período coberto, legenda, e uma tabela ou descrição textual equivalente para quem não enxerga o gráfico |

## Data Table

- Componha a partir dos blocos do registry (`useReactTable`, colunas,
  toolbar) para o conjunto de capacidades que o caso de uso realmente pede;
  não crie uma única tabela "universal" usada por todas as telas com props
  condicionais acumuladas.
- Estado vazio ("nenhum resultado para os filtros atuais") é diferente de
  estado de carregamento e de erro — os três precisam de UI distinta.
- Seleção de linha, ações em massa e paginação server-side (quando o volume
  exige) são escolhas independentes; não acople todas por padrão.

## Formulários

- Associe cada mensagem de erro ao campo via `aria-describedby`/`aria-invalid`,
  não apenas por proximidade visual.
- Trate a validação client-side como UX (feedback rápido); a validação real
  de segurança/integridade acontece no servidor, sempre.
- Preserve os valores digitados ao reexibir o formulário após erro de
  submissão — nunca limpe o formulário e obrigue a pessoa a redigitar tudo.

## Overlays (Dialog, Sheet, Popover, Dropdown)

- A base instalada pode resolver foco inicial, focus trap e fechamento por
  `Escape`/clique fora. Preserve o comportamento existente ao customizar e
  não sobrescreva handlers de teclado do primitive sem necessidade real.
- Escolha o overlay pelo papel: Dialog para uma tarefa que bloqueia o resto
  da tela, Sheet para um painel lateral não bloqueante, Popover para
  informação contextual leve, Dropdown para lista de ações.

## Sidebar

- Responda a viewport: colapsar para ícone-somente ou drawer em telas
  estreitas, não apenas encolher visualmente mantendo texto cortado.
- Destaque a rota ativa com contraste suficiente e `aria-current="page"`,
  não apenas com uma cor sutil.

## Chart

- Sempre ofereça uma alternativa textual (tabela de dados ou resumo) ao
  gráfico — cor e forma não podem ser o único canal de informação.
- Rotule eixos com unidade explícita e inclua legenda quando houver mais de
  uma série.

## Theming

- CSS variables centralizam cor, radius e espaçamento do tema; trocar marca
  ou tema deve significar editar um arquivo central, não dezenas de
  componentes.
- Teste sempre os dois temas (claro/escuro) ao adicionar ou customizar um
  componente — contraste que funciona num tema pode falhar no outro.

## Fontes oficiais

- Documentação: https://ui.shadcn.com/docs
- Components: https://ui.shadcn.com/docs/components
- Theming: https://ui.shadcn.com/docs/theming
- Registry: https://ui.shadcn.com/docs/registry
- Bases de primitives: https://ui.shadcn.com/docs/cli
- Forms: https://ui.shadcn.com/docs/forms
- Data Table: https://ui.shadcn.com/docs/components/data-table
- Chart: https://ui.shadcn.com/docs/components/chart
- Sidebar: https://ui.shadcn.com/docs/components/sidebar
- Radix Primitives — Accessibility: https://www.radix-ui.com/primitives/docs/overview/accessibility
