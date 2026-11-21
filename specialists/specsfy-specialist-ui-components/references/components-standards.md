# Padrões para adaptar componentes React

<!-- markdownlint-disable MD013 -->

## Seleção antes da cópia

1. Leia `DESIGNSYSTEM.MD`, defina a tarefa principal e os estados necessários com
   `$specsfy-specialist-interface` (modo ui).
2. Para CRUD, fixe um `PageHeader` reutilizável, `DataGrid`, `DetailLists` e
   seções de formulário em duas colunas responsivas conforme a superfície antes
   de consultar `catalog.md`. A lista ocupa a largura disponível, exibe `ID` e
   oferece as ações das operações incluídas no campo `Operações:` do Contrato
   CRUD; listagem e cadastro sem edição e exclusão não ganham essas ações.
3. Para dashboard, fixe `PageHeader`, filtros, `KPI`, visualização principal e
   lista ou `DataGrid` de investigação antes de consultar `catalog.md`.
4. Liste apenas a família correspondente.
5. Compare de dois a três assets por semântica, dependências, responsividade e
   distância para o design system local.
6. Escolha o menor candidato que cubra a intenção; composição maior pertence a
   `composition-map.md`.

Não escolha pelo número de seções ou pelo impacto visual isolado. Um asset é
adequado quando reduz adaptação estrutural e preserva a arquitetura observada.

## Mapa de adaptação

| Elemento do exemplo | Destino no projeto consumidor |
| --- | --- |
| cores, radius, shadow e spacing | tokens semânticos já publicados |
| `<a>` interno | componente de link/roteamento do framework |
| `<img>` | componente ou pipeline de imagem observado |
| breadcrumb | `Breadcrumb`/`Breadcrumbs` já usado pelo shell e pelo roteamento local |
| botão, input, dialog e menu | primitive local equivalente, se existir |
| arrays e textos de demonstração | dados reais, fixture do projeto ou props |
| `href="#"` e URLs externas | rota válida ou remoção explícita |
| ícone importado | pacote já instalado ou asset local |
| estado local | owner mais próximo que precisa coordenar a interação |

Preserve o contrato público dos componentes locais. Não replique um primitive
apenas para manter o markup do exemplo.

## Fronteiras React e framework

- Renderize markup estático sem estado no servidor quando o framework oferecer
  essa fronteira; adicione execução no cliente somente para interação real.
- Mantenha keys estáveis derivadas da identidade dos dados, nunca do índice
  quando itens podem reordenar, inserir ou remover.
- Modele componentes controlados e não controlados de acordo com o padrão já
  adotado; não alterne entre os dois durante o ciclo de vida.
- Coloque estado no menor owner comum necessário e derive valores calculáveis
  durante renderização, sem effect sincronizador.
- Preserve atributos HTML e `aria-*` com a grafia suportada pelo React; valide
  o resultado no accessibility tree, não apenas no JSX.

## Estados mínimos por categoria

| Categoria | Estados que exigem escolha explícita |
| --- | --- |
| formulário | pristine, inválido, submitting, erro e sucesso |
| coleção/tabela | loading, empty, partial, erro, paginação e sem permissão |
| dialog/menu | aberto, fechado, foco inicial, Escape e retorno de foco |
| navegação | item atual, menu móvel, foco e rota inexistente |
| marketing | mídia indisponível, texto longo, CTA ausente e reduced motion |

Não crie estados sem relevância para o caso real; documente quando um estado
foi deliberadamente excluído.

Para formulários, mantenha a coluna de contexto separada do painel de campos,
refluindo para uma coluna no mobile. Quando `consultar` constar no Contrato
CRUD, dê à linha um link de detalhe e mantenha os controles de `editar` e
`apagar`, quando declarados, acima dessa camada. Toda tela mantém um
`Breadcrumb` com equipe, módulo e título atual; em Laravel, reaproveite o
componente existente e seus tipos.

## Dependências e proveniência

- Inspecione manifest e lockfile antes de usar um import do asset.
- Não instale Headless UI, Heroicons ou outro pacote por inferência.
- Trate `assets/components/` como fonte copiável versionada, não como pacote a
  ser importado pelo consumidor.
- Registre quais componentes locais substituíram primitives do exemplo para
  facilitar a revisão.

## Comprovação de conclusão

- lint, typecheck e testes do projeto passam;
- interações críticas são exercitadas pelo papel e nome acessível;
- screenshots em viewport estreito e largo não exibem overflow ou conteúdo
  cortado;
- `PageHeader` é a mesma implementação nas telas CRUD, com variações por props
  ou configuração;
- a listagem mostra `DataGrid` em largura total, `ID` e, quando declaradas no
  campo `Operações:`, ações independentes de editar e apagar na linha;
- a revisão visual durante o desenvolvimento confere bordas, espaçamentos,
  margens, padding e tipografia, mesmo sem pedido específico;
- teclado, foco, zoom e reduced motion foram inspecionados;
- imports, rotas, imagens e textos de demonstração foram resolvidos;
- nenhum pacote novo apareceu sem escolha explícita.

<!-- markdownlint-enable MD013 -->

## Fontes oficiais

<!-- markdownlint-disable MD034 -->

- React DOM components: https://react.dev/reference/react-dom/components
- React `act`: https://react.dev/reference/react/act
- React accessibility attributes: https://react.dev/reference/react-dom/components/common
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Tailwind responsive design: https://tailwindcss.com/docs/responsive-design

<!-- markdownlint-enable MD034 -->
