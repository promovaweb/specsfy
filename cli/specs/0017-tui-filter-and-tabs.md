# 0017 Filtro e abas da TUI

Status: done

## Goal

Deixar a TUI rápida de usar em projeto com muitas specs: a pessoa filtra a
lista pelo que digita, sem passar item por item, e as abas ficam legíveis e
uniformes em qualquer largura de terminal. A Overview passa a mostrar as specs
abertas antes das concluídas, com o guia enxuto.

## Behavior

Nas telas com lista (`specs`, `backlog`, `gates` e `skills`), `/` abre o
filtro. O que a pessoa digita filtra a lista pelo rótulo, sem diferenciar
maiúsculas nem acentos, e os títulos de grupo que ainda têm itens continuam
visíveis. O título da lista mostra a consulta como ` · /cupom`. `Enter`
mantém o filtro e fecha a digitação, `Esc` limpa o filtro e `Backspace` apaga
o último caractere. Durante a digitação, as teclas globais (`q`, `1` a `9` e
`?`) não disparam, então a consulta pode conter esses caracteres. Trocar de
aba limpa o filtro. A barra de teclas mostra `/ filter` nas telas que têm
lista e, durante a digitação, troca as teclas pela consulta e por `Enter` e
`Esc`. Sem resultado, a lista mostra
`Nothing matches "<consulta>". Esc clears the filter.`

Cada aba tem a mesma largura, com o título centralizado. A aba ativa é marcada
só pelo fundo, sem a linha de sublinhado de antes. A largura se ajusta ao
terminal e, em 80 colunas, as sete abas cabem.

A Overview lista as specs abertas antes das concluídas. Concluída é a spec no
estado `completed`; no layout legado, sem pastas de estado, é a spec com todas
as tarefas marcadas. O guia mostra os dois primeiros próximos passos e uma
linha com o bloco MCP.

## Design

`src/tui/components.ts` ganha `filterItems`, que compara rótulos sem
maiúsculas nem acentos e mantém o título de grupo que ainda tem itens, e
`selectList` ganha `setFilter`, que aplica a consulta, ajusta o título e troca
o texto vazio pela mensagem de nada encontrado. `src/tui/index.ts` guarda o
estado da digitação do filtro, encaminha a consulta à screen ativa por
`filter` e monta a barra de teclas conforme o modo. As screens declaram
`filter: (query) => list?.setFilter(query)`. `TabSelectRenderable` recebe
`tabWidth` calculado pela maior aba e pela largura do terminal.
`src/tui/screens/overview.ts` separa abertas e concluídas, ordena as abertas
pelo estado e pelo progresso, e corta o guia em dois passos com a linha do
bloco MCP.

## Surface

- Altera as screens `specs`, `backlog`, `gates` e `skills`: tecla `/` para
  filtrar, com a consulta no título da lista.
- Altera as abas da TUI: mesma largura, título centralizado e aba ativa só
  pelo fundo.
- Altera a screen `overview`: ordem das specs e conteúdo do guia.

Nenhum command, option ou tool novo.

## Tasks

- [x] `filterItems` e `setFilter` em `src/tui/components.ts` `#termfy-tui`
- [x] Modo de filtro e barra de teclas em `src/tui/index.ts` `#termfy-tui`
- [x] Filtro nas screens `specs`, `backlog`, `gates` e `skills` `#termfy-tui`
- [x] Abas com largura igual, título centralizado e aba ativa pelo fundo `#termfy-tui`
- [x] Overview com abertas antes das concluídas, dois passos e bloco MCP `#termfy-tui`
- [x] `docs/tui.md`, `docs/user/cli.md` e showcase `#termfy-docs`

## Tests

- [x] `tests/tui-filter.test.ts`: `filterItems`, Enter mantém, Esc limpa e
  teclas globais sem efeito durante a digitação
- [x] `tests/tui/screens.test.ts` e `tests/tui.test.ts` com as telas novas,
  inclusive em 80×24 no tema day
- [x] Showcase regenerado e `showcase:check` verde

## Notes

- 2026-11-20: pedido do Luiz para fazer todas as melhorias levantadas.
