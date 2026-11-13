---
name: termfy-command-set
description: Implementa uma família de commands prevista na spec aberta com funções compartilhadas, tools MCP correspondentes, screen de lista, testes nos três modos e itens da spec marcados.
---

# Implementar uma família de commands

Use esta skill para entregar juntos `resource list`, `show`, `create`,
`update` e `delete`, ou somente os verbos previstos na spec. O nome real do
recurso deve estar em inglês. Crie `<resource>.ts` nas pastas existentes
`src/cli/commands/`, `src/mcp/tools/` e `src/tui/screens/` conforme os modos
solicitados. Esses arquivos são novos; as pastas e os registros já existem.

## Leia antes

- A spec aberta em `specs/` (status `in_progress`), com Surface, Behavior,
  Design, Tasks e Tests; o `CLISPEC.md`; e `references/spec-contract.md`
  da skill `termfy-spec`.
- `src/cli/registry.ts`, `src/cli/commands.ts`, `src/cli/format.ts` e
  `template/command/example.ts`.
- `src/mcp/server.ts`, `src/mcp/tools/config.ts` e
  `template/tool/example.ts`.
- `src/tui/screen.ts`, `src/tui/components.ts`, `src/tui/screens/index.ts`
  e `template/screen/example.ts`.
- `tests/cli.test.ts`, `tests/mcp.test.ts`, `tests/tui.test.ts` e
  `tests/tui-list.test.ts`.
- [Nomes e contratos por verbo](references/naming.md).
- [Checklist de entrega](references/checklist.md).
- As skills `termfy-cli`, `termfy-mcp`, `termfy-tui` e `termfy-config`.
  Para serviço HTTP, use também `termfy-api`.

## Regras

1. Gere somente o subconjunto combinado na Surface da spec aberta. Leia
   commands, arguments, options, exit codes, dados de saída, tools,
   screens, settings e credenciais, e siga o Behavior e o Design da spec.
   Se tools ou screen faltarem na spec, revise com `termfy-spec` antes de
   adicioná-las. Não acrescente verbos por simetria.
2. Extraia funções de domínio tipadas que CLI, MCP e TUI possam chamar.
   Não faça a tool chamar `Command.run`, nem a screen executar a CLI em
   subprocesso. Formatação, confirmação e protocolo ficam nos adaptadores.
3. Use `Command` para o agrupador e para cada subcommand. No agrupador,
   declare `subcommands`; nas folhas, implemente `run` devolvendo
   `{ data, text }` e `code` somente quando necessário. Use `error.usage`
   para entrada inválida e os demais atalhos de `src/app/errors.ts` para
   falhas previstas. Não chame `process.exit` nas funções compartilhadas.
4. Defina `description`, `examples` e `exitCodes` por verbo. Aplique defaults
   em `run`, pois `OptionDefinition.default` não preenche `ctx.options`.
   Não redeclare `--json`, que já é global. Leia os limites da spec.
5. Registre cada tool com `server.registerTool`, schema Zod e
   `.describe()` nos campos. Preencha `catalog.tools` com `name` e
   `description`. Devolva `content` e `structuredContent` com os mesmos
   dados normalizados. Converta `AppError` em `isError: true`, sem segredos.
6. Tools de gravação não abrem prompt de terminal. Declare o efeito na
   spec e na descrição. Se o contrato exigir confirmação ou `dryRun`,
   implemente-os explicitamente também na tool; não suponha que uma
   annotation do MCP executa a verificação.
7. A screen usa `listPanel(renderer, theme, { title, items, onSelect })`.
   Monte o `box` retornado. `move(delta)` muda o destaque;
   `select(index)` também ativa `onSelect`; `selected()` devolve o índice
   ou -1 para lista vazia. Não transforme `mount` em função async.
8. Teste CLI em subprocesso, MCP com `Client` e TUI com
   `createTestRenderer` e `mountTui`. Use dados locais controlados e a
   mesma expectativa de domínio nos três modos.

## Passos

1. Rode `git status --short`. Relacione cada verbo e cada modo aos itens
   de Tasks e Tests da spec. Confira o contrato antes de gerar arquivos.
2. Implemente as operações compartilhadas em módulo próprio sob `src/`,
   separado dos adaptadores. Se houver HTTP, crie o client com `termfy-api`
   e use o cofre e `SETTINGS_SCHEMA` conforme `termfy-config`.
3. Crie `<resource>.ts` em `src/cli/commands/` usando
   `template/command/example.ts` como modelo. Implemente o agrupador e
   as folhas. Importe o agrupador e acrescente-o aos `subcommands` da raiz
   em `src/cli/commands.ts`.
4. Crie `<resource>.ts` em `src/mcp/tools/` usando
   `template/tool/example.ts`. Registre as tools espelhadas e chame a
   função de registro em `registerAll`, em `src/mcp/server.ts`.
5. Crie `<resource>.ts` em `src/tui/screens/` usando
   `template/screen/example.ts`. Registre a screen em
   `src/tui/screens/index.ts`. Caso ela possa ser aba inicial, acrescente
   seu id aos valores de `tui.initialTab` em `src/config/settings.ts`
   e de `--tab` em `src/cli/commands/tui.ts`.
6. Em `mount`, devolva um contêiner síncrono. Carregue dados em `onEnter`,
   com estados de carregamento, vazio e erro. Capture rejeições e descarte
   respostas atrasadas após `onLeave`. Quando os dados mudarem, recrie o
   `listPanel` no contêiner; ele não oferece método para substituir items.
   Trate `up`, `down`, `j`, `k` e `return` em `onKey`, preservando as teclas
   globais. Confira a seleção antes de abrir detalhes.
7. Acrescente os testes às suítes dos três modos ou crie arquivos próprios
   sob `tests/`. Cubra sucesso, validação, credencial ausente, falha de
   serviço, lista vazia, navegação e o efeito de cada verbo de gravação.
8. Atualize `docs/cli.md`, `docs/mcp.md` e `docs/tui.md`. Se houver novas
   keys ou credenciais, atualize `docs/configuration.md`. Use `termfy-docs`
   para conferir a documentação embutida.
9. Rode `bun run opencli`, `bun test`, `bun run typecheck` e
   `bun run docs:check`. Confira `--help`, `--skill reference`,
   `mcp --list` e os frames da screen.
10. Marque `[x]` nos itens implementados e testados, editando o arquivo da
    spec em `specs/`. Não mexa na superfície do `CLISPEC.md` enquanto a
    spec está aberta: a família nova fica só na Surface da spec. Registre
    desvios em `## Notes` dela. Mantenha `in_progress` enquanto houver
    entregas pendentes. Rode `bun run validate` após a atualização final.
    Com todos os itens marcados, feche a spec pelo ciclo de `termfy-spec`:
    faça a conferência manual descrita em `references/spec-contract.md`
    daquela skill, aplique a Surface às tabelas do `CLISPEC.md` e troque o
    status para `done`.

## Marcos

Contrato dos verbos conferido; operações compartilhadas prontas; commands,
tools e screen registrados; testes dos três modos passando; OpenCLI e
documentação atualizados; itens da spec marcados e validação completa
aprovada.

## Saída

Liste verbos e modos entregues, arquivos criados ou alterados, contratos de
`data`, itens da spec marcados com `[x]` e resultados dos comandos de validação.
Inclua exemplos em texto e JSON, nomes das tools e frame da screen. Informe
pendências sem marcar funcionalidades que ainda não foram testadas.

## Compatibilidade

Starter kit a partir da v0.9.0 (specs em Markdown puro, sem command
`spec`). Referências existentes em `src/cli/registry.ts`,
`src/cli/commands.ts`, `src/mcp/server.ts`, `src/tui/screen.ts`,
`src/tui/components.ts`, `src/tui/screens/index.ts`,
`src/config/settings.ts`, `src/cli/commands/tui.ts`,
`template/command/example.ts`, `template/tool/example.ts`,
`template/screen/example.ts`, `tests/cli.test.ts`, `tests/mcp.test.ts`,
`tests/tui.test.ts` e `tests/tui-list.test.ts`. Os módulos por recurso
são criados nas pastas existentes durante a implementação.
