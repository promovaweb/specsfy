# Fontes do OpenTUI e compatibilidade

Esta referência orienta a pesquisa da skill `termfy-tui`. Leia o contrato
local do starter kit e execute a verificação de tipos dos exemplos depois de
mudar qualquer chamada de API.

## Fontes e precedência técnica

| Fonte | Uso |
| --- | --- |
| Pacote instalado, seus `.d.ts` e o lock | Conferir exports, assinaturas e versão realmente disponível |
| Código do starter kit | Conferir como o host usa foco, eventos, telas e tema |
| [Snapshot local](opentui/README.md) | Consultar documentação offline preservada com licença MIT |
| [Documentação oficial](https://opentui.com/docs/) | Consultar orientações e acompanhar mudanças da biblioteca |
| [Repositório oficial](https://github.com/anomalyco/opentui) | Investigar implementação, exemplos e histórico da versão |

Na consulta de 12/11/2026, o pacote instalado no starter kit é 0.8.4, a mesma
versão do site oficial. O snapshot em `opentui/` foi copiado na 0.8.3. Confira cada símbolo no pacote instalado e teste o comportamento.
A descrição do snapshot como 0.8.3 também não substitui essa conferência.

## Percurso por assunto

- [Quickstart](https://opentui.com/docs/getting-started/quickstart/): criar o
  renderer e montar os primeiros renderables.
- [Layout](https://opentui.com/docs/core-concepts/layout/): medidas em células
  e distribuição por flexbox.
- [Teclado](https://opentui.com/docs/core-concepts/keyboard/): eventos e
  tratamento de teclas.
- [Interação](https://opentui.com/docs/core-concepts/interaction/): foco,
  seleção e mouse.
- [Input](https://opentui.com/docs/components/input/): edição de uma linha.
- [Textarea](https://opentui.com/docs/components/textarea/): edição multilinha.
- [ScrollBox](https://opentui.com/docs/components/scrollbox/): viewport e rolagem.
- [Lifecycle](https://opentui.com/docs/core-concepts/lifecycle/): liberação de
  recursos e encerramento.
- [Testing](https://opentui.com/docs/core-concepts/testing/): frames e entrada
  simulada.
- [Runtime](https://opentui.com/docs/getting-started/runtime-support/): runtime,
  bibliotecas nativas e plataformas.

## Limites do Termfy

O Termfy usa `mountTui`, `ScreenContext` e `ctx.quit()`. Alguns textos antigos
do snapshot citam `montarTui` e `ctx.sair()`; esses nomes não existem no
starter kit conferido. Preserve o material de terceiros e use os nomes reais
nos exemplos Termfy.

Exports de React, Solid, áudio, vídeo, plugins ou keymap na documentação não
significam integração no starter kit. Antes de propor um deles, confirme a
necessidade, a dependência, o suporte do runtime e as alterações do host.

## Conferência de uma atualização

Registre versão anterior e nova, fonte consultada e APIs usadas. Confira
imports, tipos, renderização, entrada, fechamento e build do binário. Preserve
licenças ao substituir documentação copiada. Não misture um snapshot novo com
um rótulo de versão antigo.
