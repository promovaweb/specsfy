# Componentes gratuitos ReUI

O catálogo público ReUI declara mais de mil exemplos gratuitos em 87
categorias, além de 27 primitives próprias. Esta referência cobre todas as
famílias públicas usadas pela skill. Antes de instalar um item, consulte o
registry e a documentação do componente para obter seu nome `c-*`, API,
dependências e exemplos atuais.

O registry é a relação completa e mutável dos blocos gratuitos. Portanto, não
congele os mais de mil nomes nesta skill: antes de cada tela, pesquise o
catálogo oficial, selecione o bloco `c-*` adequado e registre no
`INTERFACE.md` o nome exato, arquivo instalado, finalidade, API e consumidores.
As primitives próprias abaixo, junto das primitives shadcn/ui, cobrem as
famílias técnicas de todos esses blocos.

| Família | Componentes e usos |
| --- | --- |
| Feedback | Alert, Badge, Rating, Timeline, Sonner, indicadores de sucesso, aviso, erro e atividade |
| Entrada e seleção | Autocomplete, Cascader, Date Selector, Number Field, Phone Input, Rating e Select |
| Dados | Data Grid, Filters, Tree, Sortable, listas, colunas, edição, agrupamento e virtualização |
| Código e terminal | Code Block para código, log, diff e saída de comando |
| Arquivos | File Upload, dropzone, prévia de imagem, múltiplos arquivos e validação |
| Planejamento | Event Calendar, Gantt, Kanban, Stepper, Timeline e Schedule |
| Estrutura | Frame, App Shell, Navbar, Button, Sheet, Dialog, Scrollspy, Icon Stack e Icon Tile |
| Produto | Auth, Card, Chart, Dashboard, Empty State, Form, List, Onboarding, Profile, Settings, Stats e Wizard |
| Soluções | Agents, AI Ops, Analytics, Billing, Bookings, CRM, Files, Inventory e Users |
| Comércio | Category Card, Checkout, Comparison, Coupon, Filter Sidebar, Product Card, Product Detail, Product Grid, Receipt, Review, Shopping Cart e Wishlist |
| Marketing | Blog, Contact, CTA, FAQ e Hero |

Para listas, formulários, ações e breadcrumb do shell, aplique o
[mapa de CRUD](reui-catalog-free.md).

## Primitives próprias do ReUI

| Primitive | Usar para |
| --- | --- |
| Alert | retorno contextual, validação e mensagem descartável |
| Autocomplete | busca assíncrona com escolha por teclado |
| Badge | estado, contagem, etiqueta e prioridade |
| Cascader | seleção hierárquica de vários níveis |
| Data Grid | dados densos, ordenação, seleção, edição, virtualização e detalhe por linha clicável |
| Date Selector | data ou intervalo com atalhos |
| Event Calendar | agenda, recorrência e edição de eventos |
| File Upload | anexos, arrastar e soltar e prévia |
| Filters | filtros simples, compostos e persistidos na URL |
| Frame | painel, área de conteúdo e agrupamento de tela |
| Gantt | cronograma, dependências, replanejamento e progresso |
| Icon Stack | ilustração composta para vazio ou destaque |
| Icon Tile | ícone com ação ou resumo contextual |
| Kanban | fluxo visual com colunas e arrastar e soltar |
| Number Field | valor numérico com formatação e controles |
| Phone Input | telefone internacional com país e formatação |
| Rating | avaliação com estrelas ou ícones |
| Scrollspy | navegação sincronizada ao conteúdo longo |
| Sortable | ordenação manual de lista, grade ou árvore |
| Stepper | formulário em etapas, onboarding e progresso |
| Timeline | histórico, atividade, marco e sequência de eventos |
| Tree | dado hierárquico, navegação e seleção expansível |

## Processo para cada componente

1. Pesquise a intenção da tela na documentação ReUI.
2. Confirme que o item pertence ao catálogo gratuito e usa prefixo `c-*`.
3. Leia a página da API, as dependências e exemplos reais.
4. Instale com `npx shadcn@latest add @reui/<nome-c->`.
5. Troque dados demonstrativos por dados do produto, torne a linha de detalhe
   clicável por mouse e teclado e cubra todos os estados.

Itens premium, blocks pagos, templates e ícones pagos não entram nesta skill.
O registry público resolve primitives públicas necessárias aos componentes
gratuitos.

Fonte: <https://reui.io/components> e <https://reui.io/docs/get-started>.
