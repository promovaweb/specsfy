# Testes de tela

Separe testes de transformação e estado, compilação das receitas e testes
do renderer. Uma camada aprovada não substitui as outras.

## Renderer de teste

O OpenTUI oferece `createTestRenderer` em `@opentui/core/testing`. Ele
renderiza em memória, mas ainda depende do suporte nativo do runtime.
Confira a versão instalada antes de usar os métodos abaixo.

```ts
import assert from "node:assert/strict";
import { createTestRenderer } from "@opentui/core/testing";
import { mountTui } from "../src/tui/index.ts";

const setup = await createTestRenderer({ width: 110, height: 30 });
try {
  const closed = mountTui(setup.renderer, { initialTab: "about" });
  await setup.renderOnce();
  assert.match(setup.captureCharFrame(), /Credits/);
  setup.mockInput.pressKey("q");
  await closed;
  assert.equal(setup.renderer.isDestroyed, true);
} finally {
  await setup.dispose();
}
```

Isole a pasta de dados com a variável do produto (`HOME_VARIABLE` de
`src/config/paths.ts`) antes de montar. Crie uma pasta temporária, restaure
a variável anterior e remova a pasta em `finally`. Nunca repurpose `HOME`.
Aguarde `dispose()` para liberar recursos mesmo quando uma asserção falhar.
O término de `mountTui` acompanha o evento `destroy`; não substitui o
encerramento completo oferecido pelo test harness.

## Matriz de comportamento

| Cenário | O que conferir |
| --- | --- |
| Montagem | Títulos, conteúdo inicial e teclas visíveis |
| Navegação | Dígitos, próxima aba, ajuda e saída no host real |
| Lista | Primeira e última opção, rolagem, seleção e lista vazia |
| Formulário | Foco, validação, confirmação e letras reservadas pelo host |
| Consulta | Carregando, resposta vazia, erro, nova tentativa e resposta antiga |
| Ciclo de vida | Sair da aba, voltar e encerrar durante uma consulta |
| Dimensões | 80×24, 110×30, 160×40 e apresentação compacta em 40×12 |
| Tema | `night` e `day`, incluindo seleção e mensagens de estado |
| Gráfico | Escala, rótulos, unidade, zeros, largura total e atualização |

Use `mockInput` para eventos reais e `resize(width, height)` para mudança
de tamanho. Quando houver processamento assíncrono, prefira `waitFor` ou
`waitForFrame` com uma condição observável a uma espera de duração fixa.
Não compare só o título: confira também o efeito da tecla e o estado final.

## Receitas desta biblioteca

Pela raiz do Hub, `npm run validar:termfy-tui` compila os exemplos contra os
tipos instalados no starter kit e executa testes de concorrência usando
Node.js. O comando remove sua pasta temporária e não executa frames nativos.
Veja [exemplos](examples/README.md) e [diagnóstico](troubleshooting.md).

A pesquisa de Chartscii testou separadamente a geração de strings de linhas
e barras na versão 4.0.3. O pacote é opcional e não entra nesse comando.
Relate separadamente geração de texto, checagem de tipos e frame integrado.
