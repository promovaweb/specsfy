# TUI

A interface de terminal abre com `{{bin}}` sem argumentos ou com
`{{bin}} tui`. Ela exige stdin e stdout em um TTY; fora disso o processo
encerra com exit code 8.

```bash
{{bin}}
{{bin}} tui --tab specs
{{bin}} tui --project ../app
```

`--tab <tab>` escolhe a aba inicial e tem prioridade sobre `tui.initialTab`
em settings.json. Os valores são `overview`, `specs`, `backlog`, `gates`,
`tests`, `skills` e `about`. `--project <dir>` fixa a raiz do projeto; sem
ele, a TUI sobe a partir da pasta atual até encontrar `specs/`, `.specsfy/`
ou `skills-lock.json`.

## Screens

| Screen | Função | Teclas da screen |
| --- | --- | --- |
| `overview` | Painel das specs: barra de progresso geral, medidores de specs, gates, tarefas e checklist, gráfico de specs por estado, gates aprovados por tipo e por spec, lista das specs com gates e barra própria, backlog, inbox e próximos passos. | `r` recarrega |
| `specs` | Specs agrupadas por estado, com detalhe de gates e tarefas e o Markdown da selecionada. | `↑/↓` muda a spec, `PgUp/PgDn` rola, `g` abre os gates, `r` recarrega |
| `backlog` | Itens de `specs/backlog/` e capturas de `specs/inbox/`, com preview do Markdown. | `↑/↓` muda o item, `PgUp/PgDn` rola, `r` recarrega |
| `gates` | Executa os gates do framework na spec selecionada e mostra a saída. | `↑/↓` muda a spec, `Enter` roda os gates, `PgUp/PgDn` rola |
| `tests` | Executa a suíte do projeto pelo mesmo caminho do command `test`. | `Enter` roda os testes, `PgUp/PgDn` rola |
| `skills` | Skills instaladas e disponíveis no catálogo, com detalhe e estado. | `↑/↓` muda a skill, `i` instala, `x` remove, `u` atualiza todas, `c` abre o catálogo |
| `about` | Identidade e runtime do binário, projeto, licença, créditos e padrões seguidos. | nenhuma própria |

Cada screen declara o campo `keys`, que monta a barra inferior. As teclas
globais aparecem depois das teclas da screen.

## Teclas globais

| Tecla | Ação |
| --- | --- |
| `←` `→` `[` `]` | aba anterior ou seguinte |
| `Tab` | próxima aba |
| `1` … `9` | ir para a aba de mesmo número |
| `?` | mostrar ou esconder o help de teclas |
| `q` `Esc` `Ctrl+C` | sair |

## Overview

A Overview é o painel de estatísticas do projeto:

| Painel | Conteúdo |
| --- | --- |
| Progress | Barra `Overall` com a média do progresso das specs, medidores de specs completas, gates aprovados, tarefas e itens de checklist (`valor/total` e porcentagem) e uma linha com specs, tarefas pendentes, itens órfãos, backlog e inbox. |
| Specs by state | Gráfico de barras com quantas specs há em cada estado, na ordem do ciclo. |
| Specs | Uma linha por spec, as abertas primeiro: os três gates (definição, planejamento e entrega) como `✓`, `!`, `✗` ou `○`, barra de progresso, porcentagem, tarefas e estado. |
| Gates | Gates aprovados por tipo, total de aprovados, pendentes e reprovados e o gráfico de quantas specs têm 3, 2, 1 ou 0 gates aprovados. |
| Backlog and inbox, Guide | Itens do backlog, capturas pendentes, próximos passos e o bloco MCP. |

As barras acompanham a largura do terminal. Em terminais com menos de 38
linhas, a linha de backlog e guia sai da Overview (a aba Backlog mostra o
mesmo) e o primeiro próximo passo aparece em `Progress`, como `→ Next:`.

## Atualização automática

A TUI relê o projeto a cada `tui.watchInterval` segundos, quando o
fingerprint dos arquivos de spec muda. O padrão é `0.75`. O mesmo intervalo
vale para `progress --watch`.

```bash
{{bin}} config set tui.watchInterval 0.5
```

O store do projeto é compartilhado pelas screens, então uma mudança detectada
em `overview` também aparece em `specs`, `backlog`, `gates`, `tests` e
`skills` na próxima leitura.

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
   `heading`, `dim`) e as cores de `ctx.theme`.
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
com `ScrollBoxRenderable`. O item atual recebe `theme.surfaceHigh` no fundo
e `theme.accent` no texto. A rolagem acompanha o item selecionado.

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
