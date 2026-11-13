# Documentação do OpenTUI nesta skill

Cópia das páginas oficiais da documentação do OpenTUI 0.8.3
(https://opentui.com/docs), publicadas sob licença MIT (ver `LICENSE`).
Os arquivos `.mdx` vêm do pacote de skill oficial instalado com
`npx skills add https://opentui.com --skill opentui`. Para a versão
completa e atualizada, instale a skill oficial ou leia o site.

## Ordem de leitura para o Termfy

1. `getting-started/quickstart.mdx`: renderer, Box, Text, teclado, destroy.
2. `core-concepts/renderer.mdx`: `createCliRenderer`, ciclo de frames, eventos.
3. `core-concepts/layout.mdx`: Yoga, flex, tamanhos em colunas e linhas.
4. `core-concepts/keyboard.mdx`: `KeyEvent`, propagação, bindings.
5. `core-concepts/colors.mdx`: `parseColor`, `RGBA`, cores do terminal.
6. `core-concepts/lifecycle.mdx`: ownership do renderer e cleanup.
7. `components/box.mdx`, `components/text.mdx`, `components/tab-select.mdx`:
   os três renderables usados pela TUI base.
8. `components/scrollbox.mdx`, `components/select.mdx`,
   `components/input.mdx`, `components/textarea.mdx`: para telas com
   listas, formulários e rolagem.
9. `core-concepts/testing.mdx`: renderer de teste e captura de frames.
10. `reference/standalone-executables.mdx` e `ship/deploy.mdx`: `bun build
    --compile` e distribuição.
11. `test-and-debug/troubleshooting.mdx`: terminal preso, FFI, protocolos.

`reference/api-index.mdx` lista todos os símbolos exportados; use para
confirmar nomes antes de escrever código.

## Pontos de atenção

- O Termfy usa só `@opentui/core` (API imperativa). Não introduza React ou
  Solid sem pedido explícito.
- Tamanhos são colunas e linhas de terminal, não caracteres.
- `renderer.destroy()` em toda saída. `montarTui` já cuida das teclas
  globais; telas usam `ctx.sair()`.
- Cores nomeadas aceitas por `parseColor` são poucas; prefira hex via tema.
