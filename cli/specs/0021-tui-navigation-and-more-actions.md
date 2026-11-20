# 0021 Navegação e mais ações na TUI

Status: done

## Goal

Completar a navegação e as ações da TUI: abrir a spec da Overview na aba
Specs, desfazer a última marcação de checklist, registrar o esforço, processar
capturas do inbox e criar itens de backlog, rodar o verify do projeto inteiro e
responder ao mouse, com uma barra de teclas que se ajusta à largura do terminal
e listas proporcionais ao lado da prévia.

## Behavior

Na Overview, a lista de specs tem seleção marcada com `>`. `↑`/`↓` ou `j`/`k`
escolhem e `Enter` abre a spec selecionada na aba Specs. As teclas da tela são
`↑`/`↓` spec, `Enter` open e `r` reload.

Na aba Specs, `u` desfaz o último item marcado com `Espaço` nesta sessão e pede
`y`; sem item marcado, avisa `Nothing to undo`, igual a
`specsfy tasks check --undo`. `e` registra o esforço da spec: pede o número de 1
a 10 e depois o motivo, na barra de teclas, igual a `specsfy specs effort`;
número fora de 1 a 10 é recusado.

Na aba Backlog, `p` processa a captura selecionada de `specs/inbox/` pedindo as
specs que a cobrem (por exemplo, `0004,0005`), igual a
`specsfy inbox process --spec`. `b` cria um item de backlog pedindo o título e
a ideia; os outros campos ficam `A esclarecer` para refinar com
`$specsfy-02-backlog`, igual a `specsfy backlog start`.

Na aba Gates, `v` roda o `specsfy verify` do projeto inteiro e mostra o
relatório no painel Output. `Enter` continua rodando todos os gates da spec
selecionada.

Na aba Skills, as confirmações passam a usar a mesma barra de ações das outras
telas: `y` confirma, `n` ou `Esc` cancela e o resultado aparece no rodapé.

Quando a barra de teclas não cabe no terminal, as teclas globais encolhem para
`?` help e `q` quit e, se ainda faltar espaço, as dicas da própria tela são
cortadas a partir do fim; `?` continua mostrando todas.

Em terminais estreitos, a coluna da lista ocupa até 40% da largura (no mínimo 28
colunas) e a prévia ao lado ganha espaço.

Um clique num item de lista o seleciona, um clique numa aba a abre quando todas
as abas cabem na barra, e a roda rola listas e prévias.

## Design

`src/tui/screens/overview.ts` guarda a seleção da lista de specs e o `Enter`
grava o caminho no `SpecFocus` antes de `ctx.goTo("specs")`.

`src/tui/screens/specs.ts` guarda o último item marcado em memória e chama
`uncheckItem` no `u`; o `e` usa `ctx.prompt` duas vezes, valida o número e chama
`setEffort`.

`src/tui/screens/backlog.ts` usa `store.services.processCapture` e
`store.services.startBacklog`.

`src/tui/screens/gates.ts` chama `store.services.verify`, troca o título do
painel para `Verify` durante a execução e volta para `Output` no fim, sem tocar
nos resultados dos gates.

`src/tui/screens/skills.ts` troca o aviso próprio pela `actionBar`, como as
demais telas.

`src/tui/index.ts` tem `fitKeys`, que mede a barra, mantém só `?` e `q` das
globais e corta as dicas da tela a partir do fim; `tabs.onMouseDown` abre a aba
clicada quando a barra não rola. `src/tui/components.ts` tem `listWidth` e
`row.onMouseDown` em `selectList`; listas e prévias rolam pela
`ScrollBoxRenderable`.

## Surface

- Teclas novas: `Enter` na Overview, `u` e `e` na Specs, `p` e `b` na Backlog e
  `v` na Gates.
- Clique em item de lista e em aba, e roda em listas e prévias.
- Barra de teclas que encolhe e coluna de lista proporcional.

Nenhum command, option ou tool novo.

## Tasks

- [x] Seleção e `Enter` na lista de specs da Overview `#termfy-tui`
- [x] `u` desfaz a última marcação e `e` registra o esforço na aba Specs `#termfy-tui`
- [x] `p` processa a captura e `b` cria o item de backlog `#termfy-tui`
- [x] `v` roda o verify do projeto na aba Gates `#termfy-tui`
- [x] Confirmações da aba Skills na barra de ações `#termfy-tui`
- [x] Barra de teclas que encolhe e `listWidth` nas listas `#termfy-tui`
- [x] Mouse em itens de lista, abas e roda `#termfy-tui`
- [x] `docs/tui.md`, `docs/user/cli.md` e `CLISPEC.md` com as teclas novas `#termfy-docs`

## Tests

- [x] `tests/tui-actions-more.test.ts`: `u` desfaz, `e` registra o esforço,
  `b` cria o item de backlog, `p` processa a captura, `Enter` na Overview abre
  a spec, `v` roda o verify e o clique seleciona a linha e a aba
- [x] `tests/tui/screens.test.ts`: as abas continuam renderizando com as
  listas e as teclas novas

## Notes

- 2026-11-20: pedido do Luiz para fazer todas as melhorias levantadas.
