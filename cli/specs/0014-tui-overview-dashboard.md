# 0014 Overview com estatísticas das specs

Status: done

## Goal

Transformar a Overview da TUI no painel de estatísticas do projeto: quem abre
o binário vê de relance quanto falta, onde estão as specs e quais gates
seguram a entrega, com gráficos e barras de progresso.

## Behavior

A Overview tem seis painéis. `Progress` mostra a barra `Overall`, com a média
do progresso das specs, os medidores de specs completas, gates aprovados,
tarefas e itens de checklist (valor, total e porcentagem, sem arredondar 99%
para 100%) e uma linha de totais. `Specs by state` é um gráfico de barras das
specs por estado. `Specs` lista uma linha por spec, as abertas primeiro, com
os três gates, barra, porcentagem, tarefas e estado. `Gates` traz os gates
aprovados por tipo, a contagem de aprovados, pendentes e reprovados e o
gráfico de specs por número de gates aprovados. `Backlog and inbox` e `Guide`
continuam como antes. As larguras das barras e colunas vêm do tamanho do
terminal e são recalculadas no resize. Abaixo de 38 linhas, a linha de
backlog e guia some e o primeiro próximo passo vai para `Progress`. Os
painéis cortam o conteúdo que não cabe, sem invadir a borda.

## Design

`src/tui/components.ts` ganha `segments` (linha com pedaços coloridos),
`barCells`, `percentOf`, `meter` e `barChart`. `src/tui/screens/overview.ts`
calcula as medidas em `overviewLayout(width, height)` e as estatísticas
direto do `ProjectOverview` do store, sem leitura nova de arquivos. As cores
vêm só do tema.

## Surface

- Altera a screen `overview`.

## Tasks

- [x] Componentes de gráfico e medidor em `src/tui/components.ts` `#termfy-tui`
- [x] Overview com painéis de progresso, estados, specs e gates `#termfy-tui`
- [x] Layout responsivo e redesenho no resize `#termfy-tui`
- [x] `docs/tui.md`, `docs/user/cli.md`, CHANGELOG e showcase `#termfy-docs`

## Tests

- [x] `tests/tui-overview.test.ts`: `barCells`, `percentOf`, média das specs,
  painéis e ordem das specs abertas
- [x] `tests/tui/screens.test.ts` e `tests/tui.test.ts` com os textos novos,
  inclusive em 80×24 no tema day
- [x] Showcase regenerado e `showcase:check` verde

## Notes

- 2026-11-20: pedido do Luiz para a Overview ter estatísticas gerais das
  specs, gráficos e barras de progresso.
