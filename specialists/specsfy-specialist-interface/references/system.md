# Padrões para design systems de aplicações SaaS

<!-- markdownlint-disable MD013 -->

## Fonte macro

Leia `DESIGNSYSTEM.MD` antes de propor tokens, shell, componentes globais ou
composições de CRUD. Se o arquivo não existir, use
`.specsfy/templates/DESIGNSYSTEM.MD` e registre somente o contexto confirmado.
O documento inclui classificação, política, defaults, estados, cenários e
histórico. Use o template `skills/templates/DESIGNSYSTEM.MD` no monorepo e
`skills/templates/Interface.md` como origem do registro local.

## Superfícies comuns

| Superfície | Composição mínima |
| --- | --- |
| lista de CRUD | `PageHeader` compartilhado + resumo útil + `DataGrid` em largura total, com `ID` e as ações das operações incluídas no Contrato CRUD |
| detalhe | `PageHeader` + `DetailLists` + status e próxima ação |
| criar e editar | `PageHeader` + seções com contexto e campos em duas colunas |
| dashboard | período ou escopo + filtros + `KPI` + tendência ou distribuição + detalhe |
| toda tela | `Breadcrumb` com equipe, módulo e tela atual |

A lista ganha busca, filtros, ordenação, paginação e seleção conforme volume
e domínio. No detalhe, acrescente relações ou atividade quando forem úteis
para a tarefa. A linha inteira abre o detalhe por clique ou teclado. Use
`TableRowAction` ou equivalente para proteger botões, checkboxes e menus
internos. Mantenha a lista em largura total com `ID` em coluna própria.

No shell, use labels reais e links válidos para os itens anteriores e marque
o item atual como página. A equipe e o título atual permanecem visíveis no
mobile. Em Laravel, preserve a tipagem dos itens e reaproveite o componente
existente, adaptando a composição só para exibir a equipe ativa.

Todas as telas CRUD reutilizam o mesmo `PageHeader`, variando props ou
configuração. Deixe as ações das operações incluídas no campo `Operações:` do
Contrato CRUD da spec como controles independentes na linha da lista; uma tela
só de listagem e cadastro não ganha editar e apagar. Registre cabeçalho,
tabela, linha, ações, formulários, estados e feedback recorrentes em
`INTERFACE.md` e consulte o registro antes de recriá-los.

## Dashboards

Use `PageHeader`, período ou escopo, filtros, uma faixa curta de indicadores,
tendência ou distribuição principal e uma lista detalhada ou `DataGrid` para
investigar. Inclua valor, unidade, período, comparação e fonte no indicador.
Cubra loading, vazio, erro e atualização nos indicadores e visualizações.
Forneça alternativa textual ou tabular aos gráficos.

Em React e Tailwind, consulte `$specsfy-specialist-ui-components` para usar
primitives de shadcn/ui em controles básicos e blocos gratuitos ReUI em
composições de CRUD e dashboard compatíveis. Adapte dados, permissões, tokens,
linguagem e acessibilidade. Registre origem, estados e consumidores em
`INTERFACE.md`.

## Contratos de estado

Toda superfície deve declarar, quando aplicável, `loading`, vazio, erro,
sucesso, sem permissão, conteúdo parcial e alteração não salva. O erro de campo
fica associado ao controle, preserva a entrada e tem mensagem visível abaixo
do campo. Use borda, fundo ou ícone semântico vermelho como indicação
complementar e posicione o foco no primeiro erro. Erros múltiplos ganham um
resumo inicial com links para os campos.

## Formulários responsivos

Separe os grupos de informação em seções. A coluna de contexto explica o grupo
e o painel à direita contém os campos. Use duas colunas nos breakpoints largos,
uma coluna no mobile e largura total para texto longo, ajuda, upload e erros.
Use labels acima dos campos, ajuda contextual, preservação dos valores e
estado de envio. Mantenha cancelar e salvar no rodapé, junto do resultado.

## Cenários canônicos

Registre o recorte aplicável no design system ou na spec com pré-condição,
ação, resposta, estado visual, foco, mensagem e próximo passo.

- Lista com registros e lista vazia.
- Detalhe com status e ações.
- Criação válida e edição válida.
- Criação ou edição com erro de campo.
- Ausência de permissão e falha de carregamento.
- Alteração não salva quando houver edição.
- Resultado de ação destrutiva quando houver exclusão ou cancelamento.

Confira que a spec e as tarefas cobrem estados, permissão, foco, mensagens e
retorno. Durante o desenvolvimento, confira bordas, espaçamentos, margens,
padding e tipografia nos estados e viewports relevantes. Registre `VISUAL`
antes de `EVIDENCE`, ou justifique concretamente a ausência de interface.

## Fontes oficiais

- [Material Design 3](https://m3.material.io/)
- [Carbon Design System](https://carbondesignsystem.com/)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)

<!-- markdownlint-enable MD013 -->
