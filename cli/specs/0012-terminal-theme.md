# 0012 Tema do terminal na TUI

Status: done

## Goal

Deixar a TUI compatível com os temas de terminal, como o Termfy Starter Kit:
as cores seguem o tema do terminal da pessoa, em vez de uma paleta fixa que
pinta o próprio fundo.

## Behavior

`tui.theme` aceita `terminal`, `night` e `day`, com `terminal` como padrão.
No tema `terminal`, cada cor é uma referência à paleta ANSI (0-15) ou ao
texto e fundo padrão do terminal. A TUI acompanha a troca de tema do terminal
com ela aberta e mantém a transparência, porque o fundo é o fundo padrão
(SGR 49). Ao abrir, a TUI consulta a paleta (OSC 4, 10 e 11) com espera de
300 ms e escolhe, por contraste, qual slot ocupa cada papel. Sem resposta,
usa o mapeamento padrão. O turquesa da marca vira o ciano e o violeta da
seleção vira o magenta. `night` e `day` continuam como paletas fixas da
marca, sem consulta ao terminal.

## Design

`src/tui/theme.ts` porta do Termfy Starter Kit `terminalTheme`,
`chooseTerminalSlots`, `contrast` e `resolveTheme`, com os papéis próprios do
Specsfy (`selection`, `tabActive`, `primary`) mapeados para slots ANSI. O
texto sobre a seleção, a aba ativa e a barra de teclas é o candidato de maior
contraste entre o texto padrão, ANSI 0 e ANSI 15. `startTui` resolve o tema
antes do primeiro quadro. As cores das screens e componentes passam a ser
`ColorInput`.

## Surface

- Altera a setting `tui.theme`: valores `terminal`, `night`, `day`; padrão
  `terminal`.

## Tasks

- [x] Tema `terminal` em `src/tui/theme.ts` `#termfy-tui`
- [x] `tui.theme` com `terminal` como padrão `#termfy-config`
- [x] Tipos de cor `ColorInput` nas screens e no estilo de Markdown `#termfy-tui`
- [x] Documentação em `docs/tui.md`, `docs/configuration.md` e `CLISPEC.md` `#termfy-docs`

## Tests

- [x] `tests/tui-theme.test.ts`: só referências a slots, contraste com
  Tokyo Night, Solarized escuro e claro e Gruvbox, respostas inválidas,
  timeout da consulta, `night` e `day` sem consulta, padrão `terminal` e
  montagem da TUI
- [x] TUI real num pty sem fundo nem texto visível em truecolor

## Notes

- 2026-11-20: pedido do Luiz para seguir o método do Termfy Starter Kit.
