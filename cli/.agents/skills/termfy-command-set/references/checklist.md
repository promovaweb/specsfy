# Checklist da família de commands

## Contrato

- [ ] A Surface da spec aberta lista apenas os verbos pedidos e suas
  opções, dados e códigos; Behavior e Design descrevem a família.
- [ ] Tools e screen estão declaradas nos modos combinados com a pessoa.
- [ ] Credenciais têm nome e consumidores; settings têm key, tipo e padrão.
- [ ] Cada entrega é um item de Tasks com a tag da skill responsável.
- [ ] A superfície do `CLISPEC.md` continua sem a família enquanto a spec
  está aberta; ela entra só ao fechar a spec.

## CLI

- [ ] O agrupador usa `Command`, `subcommands` e descrição em inglês.
- [ ] Cada folha usa `run`, `data`, `text`, `examples` e `exitCodes` próprios.
- [ ] Defaults e limites são aplicados em `run` e conferidos em testes.
- [ ] `--json` é herdado das options globais, sem cópia na família.
- [ ] A família foi registrada em `src/cli/commands.ts`.
- [ ] Testes em `tests/cli.test.ts` ou arquivos próprios sob `tests/`
  conferem stdout, stderr e exit code de cada verbo.

## MCP

- [ ] Tools usam as mesmas funções de domínio da CLI.
- [ ] `inputSchema` tem Zod e `.describe()` para cada campo.
- [ ] `catalog.tools` contém `name` e `description` de cada tool.
- [ ] A função de registro é chamada por `registerAll` em `src/mcp/server.ts`.
- [ ] `mcp --list` e `Client.listTools()` mostram os mesmos nomes novos.
- [ ] `Client.callTool()` cobre sucesso, entrada inválida e falha prevista.
- [ ] O JSON de `content` corresponde a `structuredContent` nas respostas
  estruturadas. Uma tool de gravação nunca abre confirmação de terminal.
- [ ] Testes seguem `tests/mcp.test.ts` e encerram client e transporte.

## TUI

- [ ] A screen está em `src/tui/screens/index.ts`.
- [ ] O `box` de `listPanel` está montado e recebe o tema da screen.
- [ ] Lista vazia, carregamento, falha e sucesso têm estados próprios.
- [ ] A screen descarta respostas antigas após `onLeave` e após refresh.
- [ ] `up`, `down`, `j`, `k` e `return` atuam sobre a seleção correta.
- [ ] Teclas globais e encerramento continuam funcionando.
- [ ] `createTestRenderer` e `mountTui` cobrem frame e navegação, conforme
  `tests/tui.test.ts` e `tests/tui-list.test.ts`.
- [ ] O teste espera a carga controlada terminar antes de capturar o frame;
  não usa pausas arbitrárias para esconder uma condição de concorrência.

## Integração e encerramento

- [ ] CLI, MCP e TUI usam a mesma fonte controlada e devolvem os mesmos
  resultados de domínio. Se houver HTTP, use o dublê de `termfy-api`.
- [ ] Dados pessoais e tokens não aparecem em outputs, frames ou logs.
- [ ] Cada modo usa pasta temporária de configuração; não lê o cofre pessoal.
- [ ] `docs/cli.md`, `docs/mcp.md`, `docs/tui.md` e, se necessário,
  `docs/configuration.md` descrevem o comportamento implementado.
- [ ] `bun run opencli` regenerou `docs/opencli.json` e o diff foi revisado.
- [ ] `bun test`, `bun run typecheck` e `bun run docs:check` passaram.
- [ ] Os itens entregues foram marcados com `[x]` no arquivo da spec. Itens
  não implementados continuam com `[ ]`.
- [ ] `bun run validate` passou após todas as alterações.
- [ ] Antes de fechar a spec, a conferência manual descrita em
  `references/spec-contract.md` da skill `termfy-spec` foi feita.

Ao aplicar esta checklist, marque os itens de Tasks e Tests da spec aberta
em `specs/`. Não edite a cópia instalada desta referência para registrar
progresso.
