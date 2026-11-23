# Ícones conceituais — Specsfy

O logo oficial vive exclusivamente em [`../logo/`](../logo/LOGO.md). Sua
composição de dois requisitos em checklist não pertence a este conjunto e
não deve ser copiada como ícone conceitual.

## Relação com o logo

O logo usa uma prancheta 512 × 512, combina traços e preenchimento e identifica
a marca inteira. Os ícones abaixo usam grid 32 × 32 e identificam conceitos
específicos do método. Logo e ícones compartilham:

- construção direta e técnica;
- formas geométricas;
- cantos e terminações controlados;
- ausência de gradiente, sombra e decoração.

Eles não são intercambiáveis. O logo sempre preserva os dois itens da checklist; um ícone conceitual nunca substitui essa assinatura.

## Especificação técnica

- Grid: `viewBox 0 0 32 32`.
- Estilo: flat, sem sombra, volume ou gradiente.
- Cor neutra: `currentColor` nos ícones que não representam estado.
- Estado: vermelho, verde e amarelo seguem
  [`colors/palette.md`](../colors/palette.md).
- Cantos e pontas permanecem arredondados quando o arquivo canônico os define.
- Não misture esta família com outra biblioteca na mesma peça sem justificar a
  diferença de linguagem.

## Inventário

| Arquivo | Representa | Onde usar |
| --- | --- | --- |
| [`spec.svg`](spec.svg) | `spec.md`, fonte normativa | especificações e requisitos |
| [`gherkin.svg`](gherkin.svg) | BDD e Given-When-Then | cenários e critérios de aceite |
| [`tdd-cycle.svg`](tdd-cycle.svg) | ciclo `RED → GREEN` | testes e Ato II |
| [`gate.svg`](gate.svg) | Definition, Plan ou Delivery Gate | checkpoints |
| [`evidence.svg`](evidence.svg) | evidência verificada | conclusão e rastreabilidade |
| [`task.svg`](task.svg) | tarefa do método | planejamento e execução |
| [`acts.svg`](acts.svg) | três Atos | visão geral do processo |
| [`traceability.svg`](traceability.svg) | cadeia de IDs | matrizes e relações |

## Cores funcionais

`tdd-cycle.svg` usa vermelho e verde porque esses estados fazem parte do
conceito. Em interface, acompanhe-o de texto `RED`/`GREEN`.

Os checkmarks de `evidence.svg` e `task.svg` devem acompanhar o token
`verified`: `#047857` em fundo claro e `#6EE7B7` em fundo escuro. Os arquivos
existentes podem exigir adaptação controlada antes do uso em tema escuro; nunca
trate a cor como decoração.

## Não fazer

- Não usar dois ícones para o mesmo conceito na mesma peça.
- Não recolorir ícone neutro com uma cor funcional sem significado.
- Não remover detalhes para simular um favicon.
- Não anexar um ícone conceitual ao nome Specsfy como se fosse wordmark.
- Não redesenhar o logo dentro desta pasta.
- Não copiar `logo/icon.svg` ou `logo/icon.png` para `icons/`.
