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
| `overview` | Progresso do projeto, estados das specs, backlog, inbox e próximos passos. | `r` recarrega |
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

Duas paletas em `src/tui/theme.ts`: `night` (padrão) e `day`. A escolha vem
de `tui.theme`.

```bash
{{bin}} config set tui.theme day
```

As cores têm nomes de papel (`accent`, `textDim`, `border`), não de matiz,
para que uma troca de paleta não exija tocar nas screens.

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
