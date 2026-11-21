# Catálogo gratuito do ReUI

O catálogo público reúne componentes `c-*` e suas dependências públicas. Use o
registry para obter o nome e a API atual antes da instalação.

Consulte a [matriz de famílias e primitives](reui-components-free.md) para
expandir a busca. Escolha por tarefa e estado da tela.

Os componentes internos têm variantes Base UI e Radix UI. Use a variante
correspondente ao projeto. Itens `c-*` e as primitives compartilhadas que eles
declaram (por exemplo `@reui/data-grid`) são gratuitos; blocos pagos, templates
e ícones usam o mesmo namespace e exigem licença.

## Mapa obrigatório para CRUDs

| Parte do CRUD | Primeiro recurso ReUI a consultar |
| --- | --- |
| Lista, ordenação, seleção, edição em linha e detalhe por clique na linha | Data Grid |
| Filtro simples ou composto | Filters |
| Criar e editar | Form, campos e Stepper quando houver etapas |
| Abrir ação sem sair da tela | Dialog ou Sheet |
| Remover, salvar e erro | Alert, Badge e estados do formulário |
| Anexos | File Upload |
| Escolhas remotas ou hierárquicas | Autocomplete, Cascader ou Tree |

Se a necessidade não aparecer nesse mapa, pesquise o catálogo antes de criar
um componente manual. O resultado final preserva o fluxo e as convenções do
sistema atual.

Quando `consultar` constar no Contrato CRUD, escolha uma variante de Data Grid
que use a linha inteira como link para o detalhe, com equivalente de teclado.
Registre como ações internas, seleção e menus operam sem propagar a navegação.
Sem `consultar`, escolha uma grade com linhas informativas e foco nos
controles disponíveis.

O `Breadcrumb` pertence ao shell de toda tela. Em Laravel, procure o componente
shadcn/ui ou a composição existente no layout antes de instalar ou criar outro;
insira a equipe ativa, o módulo e a tela atual reaproveitando a API local.

Fonte: <https://reui.io/components>.
