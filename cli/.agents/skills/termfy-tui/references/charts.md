# Gráficos de linha e barras

## Biblioteca indicada

Use [Chartscii](https://github.com/tool3/chartscii) como primeira opção para
linhas e barras na API imperativa do Termfy. A versão pesquisada foi
`4.0.3`, em 10/11/2026: licença MIT, tipos TypeScript publicados e dependência
`styl3` 3.1.1. O pacote gera uma string por `create()`; a tela entrega essa
string ao OpenTUI. Não é um componente nativo do OpenTUI.

A geração de linhas e barras foi executada com Node.js 26.8.1 em uma pasta
temporária, sem alterar dependências do starter kit. A integração visual
com o renderer nativo continua pendente. Consulte os
[tipos publicados](https://unpkg.com/chartscii@4.0.3/dist/index.d.ts) antes
de usar opções de versões diferentes.

| Opção | Gráficos | Encaixe no Termfy |
| --- | --- | --- |
| [Chartscii](https://github.com/tool3/chartscii) | Linhas, barras horizontais e verticais, séries e outros tipos | Gera texto; permite manter Core imperativo. Primeira opção para este caso. |
| [asciichart](https://github.com/kroitor/asciichart) | Linhas e múltiplas séries | Sem dependências; opção menor quando só houver linhas. A versão npm consultada foi 1.5.25, publicada em 2020. |
| [termcn](https://www.termcn.dev/docs/charts) | Linhas, barras e família Dither | Tem coleção OpenTUI, mas seus componentes usam React e hooks. Exige adaptação ou mudança de arquitetura. |

O [registry de linhas do termcn](https://github.com/shadcn-labs/termcn/blob/main/apps/web/public/r/opentui/line-chart.json)
declara `@opentui/react`. O [componente de barras](https://github.com/shadcn-labs/termcn/blob/main/apps/web/registry/bases/opentui/ui/bar-chart.tsx)
também usa JSX e `useTheme`. Use esses componentes como referência externa;
não os apresente como compatíveis diretamente com `Screen.mount`.

## Receita para linhas e barras

A skill conduz a inclusão da dependência no projeto consumidor e atualiza o
lock. O usuário pede o gráfico; não precisa executar setup manual. Fixe a
versão ensaiada durante a integração. O framework não instala Chartscii
como dependência obrigatória de todos os produtos.

O exemplo abaixo mostra o adaptador proposto para uma série não negativa.
A geração de texto foi conferida; a montagem e o redimensionamento precisam
ser testados no projeto consumidor.

```ts
import Chartscii from "chartscii";
import { stripVTControlCharacters } from "node:util";
import { TextRenderable } from "@opentui/core";
import type { ScreenContext } from "../../src/tui/screen.ts";

type Sample = { label: string; value: number };

function chartText(samples: Sample[], type: "line" | "bar"): string {
  if (samples.length === 0) return "No samples";
  if (samples.some(({ value }) => !Number.isFinite(value) || value < 0)) {
    return "Expected finite, non-negative values";
  }
  const data = samples.map(({ label, value }) => ({
    label: label.replace(/[^a-zA-Z0-9 .:_-]/g, "").slice(0, 8),
    value,
  }));
  return stripVTControlCharacters(new Chartscii(data, {
    type,
    width: 32,
    height: 6,
    richLabels: false,
    valueLabels: true,
  }).create());
}

export function chartView(ctx: ScreenContext, samples: Sample[]) {
  return new TextRenderable(ctx.renderer, {
    id: "requests-chart",
    content: chartText(samples, "line"),
    fg: ctx.theme.accent,
  });
}
```

Troque `"line"` por `"bar"` para comparar categorias. Para barras verticais,
acrescente `orientation: "vertical"` nas opções do Chartscii. A lista de
amostras deve chegar ordenada pelo tempo para linhas. O exemplo limita
rótulos a ASCII; para nomes internacionais, implemente medição em células
sem cortar graphemes.

Não use `console.log` nem animações que escrevam no terminal enquanto a TUI
estiver aberta. Remova sequências ANSI do resultado e aplique `ctx.theme`
pelo OpenTUI. Isso produz um gráfico monocromático. Múltiplas séries com
cores distintas exigem um adaptador de spans, legenda e testes adicionais.

## Dimensões e atualização

No ensaio, `width: 32` em barras controlou a área das barras: rótulos e
valores acrescentaram colunas. Não assuma que essa opção limita a largura
total. A altura também pode incluir eixos, legendas e linhas vazias.

1. Meça o conteúdo disponível depois de bordas e padding.
2. Reserve colunas para rótulos, unidade e valores antes de definir `width`.
3. Reserve linhas para eixo, legenda e título antes de definir `height`.
4. Reduza a janela temporal ou agregue amostras quando não couberem.
   Informe o intervalo e o método usado; não descarte picos silenciosamente.
5. Recalcule a string quando o tamanho ou as amostras mudarem. Atualize
   `TextRenderable.content`, preservando o nó e a seleção da tela.
6. Em terminal pequeno, mostre resumo textual e tabela compacta.

Use barras com origem zero para contagens. Em linhas, declare unidade,
intervalo de tempo e faixa do eixo. Ausência de amostra não significa zero;
descreva lacunas sem ligar períodos sem medição como se fossem contínuos.
Para valores negativos, confira o comportamento da versão escolhida e crie
um exemplo próprio: a receita acima os rejeita intencionalmente.

## Verificações da integração

Cubra lista vazia, amostra única, valores constantes, todos os valores zero,
NaN, Infinity, rótulos longos, símbolos Unicode e muitas amostras. Confira
80×24, 110×30, 160×40 e a apresentação compacta em 40×12. Teste os temas
`night` e `day`, atualizações, troca de aba e encerramento durante coleta.

O gráfico deve trazer também último valor, mínimo, máximo e unidade em
texto. Compare números do gráfico com a saída CLI/MCP do mesmo serviço.
Não conclua a integração somente porque a string foi gerada: capture o
frame e confira recorte, alinhamento e navegação no host Termfy.
