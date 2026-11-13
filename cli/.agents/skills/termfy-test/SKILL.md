---
name: termfy-test
description: Escreve e mantém testes Bun para CLI, MCP, TUI e configuração do Termfy a partir dos itens de Tests da spec aberta, antes de concluir suas entregas.
---

# Testar os modos do binário

Use esta skill para acrescentar testes, reproduzir uma falha ou atualizar
assertions após uma mudança de contrato. Trabalhe no starter kit ou no
projeto derivado, não no repositório do framework.

## Leia antes

- `AGENTS.md`, `CLISPEC.md` e `docs/architecture.md`.
- A spec aberta em `specs/NNNN-slug.md`: o Behavior diz o
  que cada teste confere, e cada item de `## Tests` é um teste de aceite a
  escrever. Leia o código alterado antes de escolher os casos. Uma
  funcionalidade fora da spec precisa passar por `termfy-spec` antes de ser
  implementada.
- `tests/cli.test.ts`, `tests/mcp.test.ts`, `tests/tui.test.ts` ou
  `tests/config.test.ts`, conforme a área.
- [patterns.md](references/patterns.md) para copiar o exemplo do modo usado.
- [coverage.md](references/coverage.md) para conferir a cobertura da entrega.

## Regras

1. Mantenha um arquivo por área em `tests/`. Use nomes de arquivos, testes,
   variáveis, comentários e mensagens em inglês. Não misture testes de CLI,
   MCP e TUI num arquivo de domínio sem necessidade.
2. Rode CLI em subprocesso com `Bun.spawn`, `src/main.ts`, `HOME_VARIABLE`
   apontando para uma pasta temporária e `NO_COLOR=1`. Confira o exit code
   de cada chamada, inclusive comandos de preparo, antes de interpretar a saída.
3. Use `ExitCode` de `src/app/exit-codes.ts`. Teste o contrato público de
   `Command.run`, incluindo `data` e `text`, sem copiar a implementação nas assertions.
4. Use `Client` e `StdioClientTransport` do SDK para MCP via stdio. Testes
   MCP não dependem de rede, conta externa ou credencial real. Para tools
   de rede, forneça respostas locais controladas no transporte da aplicação.
5. Monte TUI com `createTestRenderer` e `mountTui`. Pressione teclas por
   `mockInput.pressKey`, renderize novamente e confira `captureCharFrame`.
   Evite snapshots de todo o frame quando um trecho e uma transição bastam.
6. Use fixtures sintéticas sem segredos reais. Remova `MASTER_KEY_VARIABLE`
   do ambiente do subprocesso, salvo quando testar essa variável. Testes
   de config e TUI restauram as variáveis do processo no `finally`.
7. Feche subprocessos, clientes e renderers mesmo quando uma assertion falhar.
   Remova apenas a pasta temporária criada pelo teste. Casos que mudam
   `process.env` não rodam com `test.concurrent`.
8. Não enfraqueça uma assertion para obter verde. Se o contrato falhar,
   descreva a falha; altere produção apenas quando isso fizer parte do pedido.

## Passos

1. Rode `git status --short` e delimite a entrega pela tarefa da spec
   com a tag `#termfy-test` ou pela tarefa de implementação que pede o teste.
2. Relacione cada item de `## Tests` da spec a pelo menos um teste e cada
   comportamento alterado aos casos de sucesso, falha e limite aplicáveis
   em `references/coverage.md`.
3. Escreva os testes na área correspondente usando `references/patterns.md`.
   Para uma correção, reproduza primeiro a falha com uma assertion observável.
4. Rode os arquivos alterados, por exemplo `bun test tests/cli.test.ts`.
   Depois rode `bun run typecheck` e `bun test` para conferir a integração.
5. Rode `bun run validate`. Distingua falha da entrega de problemas já
   presentes; informe comandos que não puderam concluir.
6. Se a entrega estiver concluída e seus testes passarem, troque `[ ]` por
   `[x]` na tarefa e nos itens de `## Tests` cobertos, no arquivo da spec.
   Não marque nada no `CLISPEC.md` nem mude o status para `done`; isso é
   do fechamento da spec em `termfy-spec`. Um teste
   isolado verde não conclui outros itens. Se o pedido for apenas testes, relate ao responsável
   pela implementação o item apto a ser marcado.

## Marcos

Itens de Tests da spec cobertos; dados temporários isolados; recursos
fechados; testes e typecheck verdes; itens marcados na spec compatíveis com
a entrega.

## Saída

Liste arquivos alterados, comportamentos cobertos, comandos executados e
quantidades de testes que passaram ou falharam. Cite o texto das tarefas e dos itens de Tests
relacionados e as limitações restantes. Não imprima valores reais de credenciais.

## Compatibilidade

Starter kit a partir da v0.9.0, com specs em Markdown puro e sem command
`spec`. Caminhos usados incluem `specs/`,
`src/main.ts`, `src/cli/registry.ts`, `src/app/exit-codes.ts`,
`src/config/paths.ts`, `src/config/settings.ts`, `src/config/credentials.ts`,
`src/mcp/server.ts`, `src/tui/index.ts`, `src/tui/components.ts` e `tests/`.
