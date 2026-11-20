# TUI

A interface de terminal abre com `{{bin}}` sem argumentos, na pasta do
projeto; não é preciso escrever `tui`. `{{bin}} tui` serve para passar
`--tab` ou `--project`. Ela exige stdin e stdout em um TTY; fora disso o processo
encerra com exit code 8.

```bash
{{bin}}
{{bin}} tui --tab specs
{{bin}} tui --project ../app
```

`--tab <tab>` escolhe a aba inicial e tem prioridade sobre `tui.initialTab`
em settings.json. Os valores são `overview`, `specs`, `backlog`, `milestones`,
`context`, `gates`, `tests`, `skills` e `about`. `--project <dir>` fixa a raiz
do projeto; sem ele, a TUI sobe a partir da pasta atual até encontrar
`specs/`, `.specsfy/` ou `skills-lock.json`. Em terminais estreitos, a barra
de abas rola até a aba selecionada.

## Screens

| Screen | Função | Teclas da screen |
| --- | --- | --- |
| `overview` | Painel das specs: barra de progresso geral, medidores de specs, gates, tarefas e checklist, gráfico de specs por estado, gates aprovados por tipo e por spec, lista das specs com gates e barra própria, backlog, inbox e próximos passos. | `↑/↓` spec, `Enter` open, `r` recarrega |
| `specs` | Specs agrupadas por estado, com detalhe de gates e tarefas e o Markdown da selecionada. | `↑/↓` muda a spec, `t` muda o estado, `Espaço` marca o próximo item de checklist, `u` desfaz a última marcação, `e` registra o esforço, `n` cria uma spec, `g` abre os gates, `r` recarrega |
| `backlog` | Itens de `specs/backlog/` e capturas de `specs/inbox/`, com preview do Markdown. | `↑/↓` muda o item, `PgUp/PgDn` rola, `c` captura uma ideia, `p` processa a captura, `b` cria um item de backlog, `r` recarrega |
| `milestones` | Milestones de `specs/milestones/`, com o título, a porcentagem do progresso derivado e a prévia do Markdown. | `↑/↓` muda o milestone, `PgUp/PgDn` rola, `s` sincroniza, `/` filtra |
| `context` | Documentos de contexto do projeto, com `✓` quando existem e `○` quando faltam, e a prévia do selecionado. | `↑/↓` muda o documento, `PgUp/PgDn` rola, `/` filtra |
| `gates` | Executa os gates do framework na spec selecionada e mostra a saída. | `↑/↓` muda a spec, `Enter` roda os gates, `v` roda o verify do projeto, `PgUp/PgDn` rola |
| `tests` | Executa a suíte do projeto pelo mesmo caminho do command `test`. | `Enter` roda os testes, `PgUp/PgDn` rola |
| `skills` | Skills instaladas e disponíveis no catálogo, com detalhe, estado e a linha `Inventory`, que avisa quando as skills do projeto diferem do inventário do binário. | `↑/↓` muda a skill, `i` instala, `x` remove, `u` atualiza todas, `c` baixa o catálogo de novo; toda ação pede `y` para confirmar, `n` ou `Esc` cancela e o resultado aparece no rodapé |
| `about` | Identidade e runtime do binário, projeto, licença, créditos e o painel Doctor, com as checagens locais de `specsfy doctor`. | nenhuma própria |

Cada screen declara o campo `keys`, que monta a barra inferior. As teclas
globais aparecem depois das teclas da screen.

## Ações

As telas que alteram o projeto chamam a mesma função do CLI, pedem confirmação
e mostram o resultado numa linha no rodapé: `✓` em verde quando funciona, `✗`
em vermelho quando falha. A cada resultado a TUI recarrega o projeto.

| Tecla | Tela | Efeito |
| --- | --- | --- |
| `t` | Specs | Mostra os estados vizinhos numerados da spec selecionada; o número escolhe, `y` confirma e `Esc` cancela. Specs no layout legado `specs/specs/` pedem `specsfy specs migrate`. |
| `Espaço` | Specs | Marca o próximo item de checklist da primeira tarefa pronta, igual a `specsfy tasks next` mais `tasks check`; `y` confirma e `n` ou `Esc` cancela. |
| `u` | Specs | Desfaz o último item marcado com `Espaço` nesta sessão, igual a `specsfy tasks check --undo`; pede `y` e avisa `Nothing to undo` quando nada foi marcado. |
| `e` | Specs | Registra o esforço da spec: pede o número de 1 a 10 e depois o motivo na barra de teclas, igual a `specsfy specs effort`; número fora de 1 a 10 é recusado. |
| `n` | Specs | Pede o título na barra de teclas e cria uma spec em `specs/draft/`, igual a `specsfy specs new`; `Enter` cria e `Esc` cancela. |
| `c` | Backlog | Pede uma linha na barra de teclas e registra uma captura em `specs/inbox/`, igual a `specsfy inbox capture`; `Enter` registra e `Esc` cancela. |
| `p` | Backlog | Processa a captura selecionada de `specs/inbox/`, pedindo as specs que a cobrem (por exemplo, `0004,0005`), igual a `specsfy inbox process --spec`. |
| `b` | Backlog | Cria um item de backlog pedindo o título e a ideia; os outros campos ficam `A esclarecer` para refinar com `$specsfy-02-backlog`, igual a `specsfy backlog start`. |
| `v` | Gates | Roda o `specsfy verify` do projeto inteiro e mostra o relatório no painel Output; `Enter` continua rodando todos os gates da spec selecionada. |

`PgUp/PgDn` continuam rolando o Markdown; na aba Specs, `Espaço` deixou de
rolar.

## Teclas globais

| Tecla | Ação |
| --- | --- |
| `←` `→` `[` `]` | aba anterior ou seguinte |
| `Tab` | próxima aba |
| `1` … `9` | ir para a aba de mesmo número |
| `/` | filtrar a lista da tela |
| `?` | mostrar ou esconder o help de teclas |
| `q` `Esc` `Ctrl+C` | sair |

Quando a barra de teclas não cabe na largura do terminal, as teclas globais
encolhem para `?` help e `q` quit e, se ainda faltar espaço, as dicas da
própria tela são cortadas a partir do fim. `?` continua mostrando todas.

## Mouse

Um clique num item de lista o seleciona, e um clique numa aba a abre, quando
todas as abas cabem na barra. Com a barra rolando, as teclas e os números
continuam alcançando cada aba. A roda rola as listas e as prévias.

## Filtro

`/` abre o filtro nas telas com lista: `specs`, `backlog`, `milestones`,
`context`, `gates` e `skills`. O que a pessoa digita filtra a lista pelo
rótulo, sem diferenciar maiúsculas nem acentos, e os títulos de grupo que
ainda têm itens continuam visíveis. O título da lista mostra a consulta, como
` · /cupom`.

`Enter` mantém o filtro e fecha a digitação, `Esc` limpa o filtro e
`Backspace` apaga o último caractere. Durante a digitação, as teclas globais
(`q`, `1` a `9` e `?`) não disparam, então a consulta pode conter esses
caracteres. Trocar de aba limpa o filtro.

A barra de teclas mostra `/ filter` nas telas que têm lista e, durante a
digitação, troca as teclas pela consulta e por `Enter` e `Esc`. Sem resultado,
a lista mostra `Nothing matches "<consulta>". Esc clears the filter.`

## Overview

A Overview é o painel de estatísticas do projeto:

| Painel | Conteúdo |
| --- | --- |
| Progress | Barra `Overall` com a média do progresso das specs, medidores de specs completas, gates aprovados, tarefas e itens de checklist (`valor/total` e porcentagem) e uma linha com specs, tarefas pendentes, itens órfãos, backlog e inbox. |
| Specs by state | Gráfico de barras com quantas specs há em cada estado, na ordem do ciclo. |
| Specs | Uma linha por spec, as abertas antes das concluídas: os três gates (definição, planejamento e entrega) como `✓`, `!`, `✗` ou `○`, barra de progresso, porcentagem, tarefas e estado. Concluída é a spec no estado `completed`; no layout legado, sem pastas de estado, é a spec com todas as tarefas marcadas. |
| Gates | Gates aprovados por tipo, total de aprovados, pendentes e reprovados e o gráfico de quantas specs têm 3, 2, 1 ou 0 gates aprovados. |
| Backlog and inbox, Guide | Itens do backlog, capturas pendentes, os dois primeiros próximos passos e uma linha com o bloco MCP (`{"command": "{{bin}}", "args": ["mcp"]}`). |

As barras acompanham a largura do terminal. Em terminais com menos de 38
linhas, a linha de backlog e guia sai da Overview (a aba Backlog mostra o
mesmo) e o primeiro próximo passo aparece em `Progress`, como `→ Next:`.

## Gráficos e medidores

| Componente | Uso |
| --- | --- |
| `segments(renderer, parts)` | Linha com pedaços de texto de cores diferentes, sem quebra. |
| `meter(renderer, theme, { label, labelWidth, value, total, width, color })` | Rótulo, barra, `valor/total` e porcentagem. |
| `barChart(renderer, theme, items, { labelWidth, width })` | Barras horizontais proporcionais ao maior valor. |
| `barCells(value, total, width)` e `percentOf(value, total)` | Células cheias e vazias de uma barra e porcentagem sem arredondar 99% para 100%. |

## Atualização automática

A TUI relê o projeto a cada `tui.watchInterval` segundos, quando o
fingerprint dos arquivos de spec muda. O padrão é `0.75`. O mesmo intervalo
vale para `progress --watch`.

```bash
{{bin}} config set tui.watchInterval 0.5
```

O store do projeto é compartilhado pelas screens, então uma mudança detectada
em `overview` também aparece em `specs`, `backlog`, `milestones`, `context`,
`gates`, `tests` e `skills` na próxima leitura.

## Tema

Três paletas em `src/tui/theme.ts`: `terminal` (padrão), `night` e `day`.
A escolha vem de `tui.theme`.

```bash
{{bin}} config set tui.theme day
{{bin}} config set tui.theme terminal
```

As cores têm nomes de papel (`accent`, `textDim`, `selection`), não de
matiz, para que uma troca de paleta não exija tocar nas screens.

### terminal

O tema `terminal` herda as cores do tema do terminal (Ghostty, Alacritty,
Kitty, Omarchy, Termius, Herdr e outros). Cada cor da TUI é uma referência à
paleta do terminal (as 16 cores ANSI) ou ao texto e fundo padrão, sem RGB
fixo. O terminal pinta com o tema dele, então trocar o tema do terminal muda
a TUI na hora. O fundo é o fundo padrão do terminal, então a transparência e
o blur do terminal continuam.

Ao abrir, a TUI pergunta a paleta ao terminal (OSC 4, 10 e 11) com espera
curta de 300 ms. Com resposta, ela escolhe qual cor da paleta ocupa cada
papel: texto apagado legível sobre o fundo (alguns temas, como o Solarized
Dark, pintam o preto brilhante igual ao fundo), sombra do painel de detalhe,
acentos com contraste (troca entre a cor normal e a brilhante) e o texto
sobre os blocos coloridos da aba ativa, da linha selecionada e da barra de
teclas. Sem resposta, usa o mapeamento padrão. A escolha do slot vale até a
próxima abertura. As cores em si acompanham o terminal com a TUI aberta.

A marca do Specsfy continua no tema `terminal` como escolha de slot: o
turquesa do foco vira o ciano do terminal e o violeta da seleção vira o
magenta.

Mapeamento padrão:

| Papel | Slot |
| --- | --- |
| `background`, `surface`, `surfaceHigh`, `barBackground` | fundo padrão do terminal |
| `text`, `textStrong` | texto padrão do terminal |
| `textDim`, `border`, `barText` | ANSI 8 (preto brilhante) |
| `accent`, `borderActive`, `tabActive`, `primary`, `keyBackground` | ANSI 6 (ciano) |
| `accentSecondary`, `selection` | ANSI 5 (magenta) |
| `ok` | ANSI 2 (verde) |
| `warn` | ANSI 3 (amarelo) |
| `error` | ANSI 1 (vermelho) |
| `keyText`, `tabActiveText`, `primaryText`, `selectionText` | texto padrão do terminal |

### night e day

`night` e `day` são as paletas fixas da marca, feitas com os tokens de
`brand/tokens.json`: turquesa no foco e na aba ativa, violeta na linha
selecionada e petróleo nas superfícies e ações primárias. Ficam iguais em
qualquer terminal.

Um token novo precisa existir nas três paletas. No `terminal`, ele aponta
para um slot ANSI ou para o texto ou fundo padrão do terminal; um hex ali
deixaria a TUI fora do tema do terminal. Para testar a escolha dos slots,
passe uma paleta conhecida a `terminalTheme(colors)`, como faz
`tests/tui-theme.test.ts`.

Princípios do visual, no estilo modern unix:

- bordas arredondadas com título na própria borda;
- rótulos apagados à esquerda e valores em cor plena à direita;
- uma cor de accent para o que está ativo, uma secundária para links e
  origens externas; verde, âmbar e vermelho só para estado;
- barra de status com teclas em blocos invertidos;
- sem espaços vazios entre painéis vizinhos; padding interno de uma célula;
- nada pisca, nada rola sozinho.

## Como criar uma screen

1. Copie `template/screen/example.ts` para `src/tui/screens/<id>.ts`.
2. Preencha `id`, `title`, `description`, `keys` e `mount(ctx)`. Use os
   componentes de `src/tui/components.ts` (`panel`, `keyValueTable`, `list`,
   `heading`, `dim`, `progressBar`, `meter`, `barChart` e `segments`) e as
   cores de `ctx.theme`. Para telas que executam ações, use `actionBar` para
   pedir `y`/`n`, oferecer escolhas numeradas e mostrar a mensagem de
   resultado, e `ctx.prompt(label, onSubmit)` para pedir uma linha de texto na
   barra de teclas. Para listas ao lado de uma prévia, use
   `listWidth(renderer, <largura preferida>)`: em terminais estreitos a coluna
   da lista ocupa até 40% da largura (no mínimo 28 colunas) e a prévia ao lado
   ganha espaço.
3. Se a screen precisar de atualização periódica, leia o store do projeto no
   `mount` e limpe o timer em `onLeave`.
4. Registre em `src/tui/screens/index.ts`. A ordem da lista é a ordem das
   abas. O stub exporta a factory `createExampleScreen()`: registre o `Screen`
   que ela devolve, para que seleção e renderables fiquem por instância.
5. Se o `id` for uma opção válida de aba inicial, acrescente-o em
   `tui.initialTab` (`src/config/settings.ts`) e em `--tab`
   (`src/cli/commands/tui.ts`).

A TUI roda sobre o OpenTUI (`@opentui/core`). Use `BoxRenderable`,
`TextRenderable`, `TabSelectRenderable`, `ScrollBoxRenderable` e os demais
renderables do pacote. Sempre devolva o terminal com `renderer.destroy()`;
`mountTui()` já cuida disso para `q`, `Esc` e `Ctrl+C`.

## Testar sem terminal

`tests/tui.test.ts` monta a interface com `createTestRenderer` de
`@opentui/core/testing`, pressiona teclas com `mockInput.pressKey` e confere
o frame com `captureCharFrame`. `mountTui` aceita qualquer renderer;
`startTui` cria o renderer real.

## Lista com seleção

`listPanel(renderer, theme, { title, items, onSelect })` monta uma lista
com `ScrollBoxRenderable`. O item atual recebe `theme.selection` no fundo
e `theme.selectionText` no texto. A rolagem acompanha o item selecionado.

| Retorno | Uso |
| --- | --- |
| `box` | Adicione ao layout; `handleKeyPress` trata up/down, j/k e Enter. |
| `move(delta)` | Move o destaque sem chamar `onSelect`; respeita os limites. |
| `selected()` | Retorna o índice atual, ou -1 para lista vazia. |
| `select(index)` | Destaca o índice e chama `onSelect(index)`. |

Na screen, trate up/k com `move(-1)`, down/j com `move(1)` e Enter com
`select(selected())` dentro de `onKey`. A tecla `r` pode voltar ao primeiro
item com `move(-selected())`. Declare essas teclas em `keys` para aparecerem
na barra inferior. O exemplo completo está em `template/screen/example.ts`.
Não encaminhe a mesma tecla pelo foco de `box` e por `onKey` simultaneamente.
