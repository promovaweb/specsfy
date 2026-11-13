# Layout em células e conteúdo

Use esta referência com `termfy-tui`, [design modern unix](modern-unix-design.md)
e os capítulos locais de [layout](opentui/core-concepts/layout.mdx) e
[texto e células](opentui/core-concepts/text-and-cells.mdx). Confira os frames
nas dimensões documentadas em [testes](screen-tests.md).

## Medidas e composição

Largura é medida em colunas; altura, em linhas. O comprimento de uma string
JavaScript não mede sua largura no terminal. Acentos combinados, caracteres
CJK e símbolos podem ocupar quantidades diferentes de células. Não use
`slice()` para alinhar texto visível sem considerar largura e estilos.

Use `flexGrow: 1` no conteúdo que pode crescer e `minHeight: 0` no viewport
que precisa encolher. Cabeçalhos e linhas de status recebem `flexShrink: 0`
para não sumirem quando a lista cresce. Preserve as bordas, o padding e as
cores definidos pelo tema do projeto.

Uma largura lateral fixa de 50 colunas não cabe em todo terminal. Em telas
estreitas, empilhe os painéis ou apresente lista e detalhe em etapas. Recalcule
a composição quando as dimensões mudarem; não capture o tamanho só na entrada.

## Escolha do renderable

| Conteúdo | Ponto de partida | Conferência |
| --- | --- | --- |
| Texto e status | `TextRenderable` | Quebra, contraste, texto vazio e atualização de `content` |
| Agrupamento | `BoxRenderable` ou `panel` | Bordas, tamanho mínimo e filhos que podem encolher |
| Lista com ação | `listPanel` ou `SelectRenderable` | Seleção, ativação, vazio e último item |
| Conteúdo longo | `ScrollBoxRenderable` | Altura delimitada e item selecionado visível |
| Edição de linha | `InputRenderable` | Foco, mudança, submissão e cancelamento |
| Edição multilinha | `TextareaRenderable` | Movimento do cursor e separação entre Enter e salvar |
| Markdown ou código | `MarkdownRenderable`, `CodeRenderable` | Disponibilidade na versão, custo de parsing e tamanho |
| Comparação textual | `DiffRenderable` | Linhas longas, modo escolhido e rolagem |
| Tabela | `TextTableRenderable` | Colunas, cabeçalho e alternativa em terminal estreito |

Consulte o `.mdx` correspondente em `opentui/components/` e os tipos instalados
antes de usar propriedades. Esses componentes não têm a mesma API entre si.

## Lista e detalhe

O helper `listPanel` constrói linhas a partir de `items` na montagem. Ele não
expõe `setItems`. `move(delta)` muda o destaque; `select(index)` também chama
`onSelect`. Não suponha que `box.handleKeyPress` será chamado automaticamente:
o exemplo Termfy encaminha as teclas pelo `Screen.onKey`.

Para resultados substituídos por um filtro, mantenha o item selecionado por
identificador estável. Reconstrua apenas o componente da lista ou acrescente
um método de atualização ao helper com testes. Reordenação não pode ativar
um objeto diferente só porque manteve o mesmo índice.

## Logs e conteúdo crescente

Defina um limite de registros em memória e uma política de descarte. Rolagem
não limita a quantidade de nós criados. Agrupe atualizações frequentes e
preserve a posição quando o usuário estiver lendo linhas anteriores.

Sticky scroll é apropriado ao acompanhamento do final de um log, mas precisa
ser configurado e testado. Não force a posição inferior a cada atualização
se o usuário rolou para ler o histórico.

## Estados de apresentação

Mostre texto além da cor: `Loading`, `No results`, `Unable to load` e
`Ready`. Explique a ação disponível, como recarregar ou mudar o filtro. Não
exponha tokens, headers de autenticação ou respostas brutas de erro na tela.
Teste também descrições longas, ausência de valores e seleção vazia.
