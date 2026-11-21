# Padrões comuns de componentes de UI

- Leia `DESIGNSYSTEM.MD` e `INTERFACE.md`. Resolva tarefa, hierarquia e
  estados com `$specsfy-specialist-interface` antes de escolher componentes.
- Confirme versões, imports, aliases e dependências em manifests, lockfile,
  código local e `components.json`. Preserve as APIs da base de primitives
  instalada e prefira uma extensão local quando ela atender à tarefa.
- Use o menor conjunto de referências ou itens do registry. TSX em
  `assets/components/` serve de referência copiável. Código incorporado do
  registry integra o projeto e toda atualização requer revisão do diff.
- Preserve semântica, teclado, foco, temas e breakpoints. Substitua dados de
  demonstração por dados e estados reais. Confirme validação e autorização no
  servidor para as ações que atravessam essa fronteira.
- Registre caminho, origem, finalidade, API, estados, acessibilidade,
  consumidores e extensão em `INTERFACE.md`. Use o
  [checklist de integração](interface-quality-checklist.md) antes do handoff.

## Referências por modo

| Modo | Abra quando precisar de |
| --- | --- |
| components | [Catálogo TSX](catalog.md), [seleção e adaptação](components-standards.md), [composição de páginas](composition-map.md) ou [conversa incremental](conversation-flow.md) |
| reui | [Setup e registry](reui-setup.md), [mapa do CRUD](reui-catalog-free.md), [famílias e primitives gratuitas](reui-components-free.md), [tokens](reui-standards.md) ou [matriz para Laravel com React](reui-shadcn-components.md) |
| shadcn | [Identificação e migração de primitives](shadcn-primitives.md), [registry, composição, formulários, dados e theming](shadcn-standards.md) |

## Fontes oficiais

- [React DOM](https://react.dev/reference/react-dom/components)
- [Tailwind CSS](https://tailwindcss.com/docs/responsive-design)
- [ReUI](https://reui.io/docs/get-started)
- [shadcn/ui](https://ui.shadcn.com/docs)
