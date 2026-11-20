# 0019 Ações e telas novas na TUI

Status: done

## Goal

Deixar a TUI resolver o ciclo da spec sem sair dela: mover a spec, marcar o
próximo item de checklist, criar uma spec e registrar uma captura no inbox com
a mesma função do CLI, sempre com confirmação e resultado visível. Ao mesmo
tempo, mostrar os milestones e os documentos de contexto do projeto em abas
próprias, e trocar o painel Standards por um painel Doctor coerente com o
`specsfy doctor`.

## Behavior

A TUI passa de 7 para 9 abas, nesta ordem: Overview, Specs, Backlog,
Milestones, Context, Gates, Tests, Skills e About. Os ids são `overview`,
`specs`, `backlog`, `milestones`, `context`, `gates`, `tests`, `skills` e
`about`. Em terminais estreitos, como 80 colunas, a barra de abas rola até a
aba selecionada.

A aba Milestones lista os arquivos de `specs/milestones/*.md` com o título e a
porcentagem do bloco de progresso derivado, e mostra a prévia do Markdown sem
os comentários de marcação. `↑`/`↓` escolhe, `PgUp`/`PgDn` rola, `s`
sincroniza depois do `y` e faz o mesmo que `specsfy milestones sync`, e `/`
filtra.

A aba Context lista os documentos PROJECT.md, DESIGNSYSTEM.MD, INTERFACE.md,
`.specsfy/STACK.md`, `.specsfy/RULES.md`, `.specsfy/DATABASE.md`,
`.specsfy/PACKAGES.md` e `.specsfy/USER-PROFILE.md`, com `✓` quando existe e
`○` quando falta, e a prévia do selecionado. É só leitura: os documentos mudam
pela skill `specsfy-setup` ou por `specsfy context`.

Na aba Specs, `t` muda o estado da spec selecionada e mostra os estados
vizinhos numerados; o número escolhe, `y` confirma e `Esc` cancela. Specs no
layout legado `specs/specs/` pedem `specsfy specs migrate`. `Espaço` marca o
próximo item de checklist da primeira tarefa pronta, igual a
`specsfy tasks next` mais `tasks check`, com `y` para confirmar e `n` ou `Esc`
para cancelar. `n` cria uma spec em `specs/draft/` pedindo o título na barra de
teclas, igual a `specsfy specs new`, com `Enter` para criar e `Esc` para
cancelar. `PgUp`/`PgDn` continuam rolando o Markdown; `Espaço` deixou de rolar.

Na aba Backlog, `c` registra uma captura em `specs/inbox/` a partir de uma
linha digitada na barra de teclas, igual a `specsfy inbox capture`, com `Enter`
para registrar e `Esc` para cancelar.

Toda ação mostra o resultado numa linha no rodapé, com `✓` em verde e `✗` em
vermelho, e recarrega o projeto. A aba About troca o painel Standards pelo
painel Doctor, com as mesmas checagens locais de `specsfy doctor`, sem rede e
sem as checagens do projeto.

O showcase passa de 16 para 20 prints, com as duas abas novas nos dois temas, e
o projeto de demonstração ganha os milestones M01 e M02 e os arquivos
PROJECT.md, `.specsfy/STACK.md` e `.specsfy/RULES.md`.

## Design

`src/tui/screens/index.ts` registra `milestones` e `context` na posição da
ordem das abas e em `SCREEN_IDS`, que alimenta `tui.initialTab` e `--tab`.
`src/tui/screens/milestones.ts` lê `specs/milestones/*.md`, extrai o título e a
porcentagem do bloco de progresso e chama `syncMilestones` do domínio no `s`.
`src/tui/screens/context.ts` declara `CONTEXT_FILES` na ordem de leitura e
consulta a existência de cada arquivo com `access`.

`src/tui/components.ts` ganha `actionBar`, que pergunta `y`/`n`, oferece
escolhas numeradas, mostra a mensagem de resultado e consome as teclas
enquanto uma pergunta está aberta. `src/tui/screen.ts` ganha
`ctx.prompt(label, onSubmit)`, que pede uma linha na barra de teclas e entrega
o texto aparado no `Enter`, sem chamar nada no `Esc` ou numa linha vazia.
`src/tui/screens/specs.ts` e `src/tui/screens/backlog.ts` usam os dois para as
ações, sempre pelas funções que o CLI já chama, e recarregam o store depois de
cada escrita.

`src/tui/screens/about.ts` usa `collectDoctorChecks` do command `doctor` no
lugar do painel Standards. `scripts/build-demo-project.ts` escreve os
milestones e os arquivos de contexto do projeto de demonstração, e o showcase
passa a abrir as nove abas nos dois temas.

## Surface

- Novas abas `milestones` e `context` na TUI.
- Novas ações na TUI: `t`, `Espaço` e `n` na aba Specs e `c` na aba Backlog.
- `tui.initialTab` e `--tab` aceitam `milestones` e `context`.
- Aba About com o painel Doctor.
- Projeto de demonstração e showcase com milestones, contexto e 20 prints.

Nenhum command, option ou tool novo.

## Tasks

- [x] `src/tui/screens/milestones.ts` com lista, progresso, prévia e `s` `#termfy-tui`
- [x] `src/tui/screens/context.ts` com os documentos, `✓`/`○` e prévia `#termfy-tui`
- [x] `actionBar` em `src/tui/components.ts` e `ctx.prompt` em `src/tui/screen.ts` `#termfy-tui`
- [x] Ações `t`, `Espaço` e `n` na aba Specs `#termfy-tui`
- [x] Ação `c` na aba Backlog `#termfy-tui`
- [x] `SCREEN_IDS`, `tui.initialTab` e `--tab` com as nove abas `#termfy-tui`
- [x] Painel Doctor na aba About `#termfy-tui`
- [x] Projeto de demonstração com milestones e contexto `#termfy-test`
- [x] Showcase com 20 prints `#termfy-docs`
- [x] `docs/tui.md`, `docs/user/cli.md`, `CLISPEC.md` e `docs/develop/showcase.md` `#termfy-docs`

## Tests

- [x] `tests/tui-actions.test.ts`: `t` move a spec, `Espaço` marca o item,
  `n` cria a spec em `specs/draft/` e `c` captura no inbox
- [x] `tests/tui/screens.test.ts`: as nove abas renderizam, os ids batem com
  `tui.initialTab` e os dígitos percorrem todas as abas
- [x] `bun run showcase:check` verde com os 20 prints

## Notes

- 2026-11-20: pedido do Luiz para fazer todas as melhorias levantadas.
