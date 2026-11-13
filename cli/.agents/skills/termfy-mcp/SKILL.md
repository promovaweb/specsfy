---
name: termfy-mcp
description: Implementa tools, resources e prompts MCP no Termfy com schemas, paginação, cancelamento, tratamento de erros e testes reais por stdio.
---

# Construir e evoluir o servidor MCP

Use esta skill para expor funcionalidades do binário a agentes de IA pelo
Model Context Protocol, ou para revisar o que já está exposto.

## Leia antes

- A spec aberta em `specs/` (status `in_progress`): as entradas de tool,
  resource e prompt em `## Surface` (com efeito, entrada e saída), o
  Behavior, o Design e os itens `#termfy-mcp` de Tasks e Tests. A
  subseção `### MCP` do `CLISPEC.md` mostra o que já foi entregue. Se
  nenhuma spec aberta cobrir o pedido, rode a skill `termfy-spec` antes de
  continuar.
- `docs/mcp.md`.
- `src/mcp/server.ts`, `src/mcp/tools/base.ts`, `src/mcp/resources/base.ts`
  e `src/mcp/prompts.ts`.
- `references/tool-contract.md`: regras de nome, schema, descrição e
  resposta.
- `references/mcp-sdk/server.md`: API do `McpServer` (v1.x do SDK).
- `references/mcp-spec/server-concepts.md` e `references/mcp-spec/transports.md`
  para o modelo de tools, resources, prompts e stdio.
- `references/mcp-spec/local-server-security.md` antes de expor qualquer
  tool que grave, chame rede ou leia segredos.
- `references/openmcp.md` para o princípio de economia de tokens.

## Referências por tarefa

| Tarefa | Referência |
| --- | --- |
| Conferir versões e fontes | [Compatibilidade](references/sources-and-compatibility.md) |
| Desenhar entrada, saída e erros | [Contrato de tool](references/tool-contract.md) |
| Expor documentação e mensagens | [Resources e prompts](references/resources-and-prompts.md) |
| Limitar listas e respostas | [Paginação](references/pagination-and-results.md) |
| Integrar transporte e cancelamento | [Stdio e ciclo de vida](references/stdio-and-lifecycle.md) |
| Proteger credenciais e aplicar permissões | [Segredos e efeitos](references/security-and-effects.md) |
| Adaptar código executável | [Receitas](references/examples/README.md) |
| Conferir comportamento | [Testes](references/mcp-tests.md) e [diagnóstico](references/troubleshooting.md) |

## Plano

Antes de editar, apresente as interfaces afetadas, serviços reutilizados,
campos de entrada e saída, efeitos e verificações. Confira a versão real do
SDK e leia as referências correspondentes. O agente conduz implementação,
setup e testes; o usuário descreve o comportamento desejado.

## Regras

1. Stdout pertence ao JSON-RPC enquanto `mcp` roda. Qualquer log vai para
   stderr. Não use `console.log` em código alcançado pelo servidor.
2. Toda tool tem `title`, `description` que diz quando usar e o que devolve,
   `inputSchema` em Zod com `.describe()` em cada campo e nome em
   `snake_case`.
3. Resposta traz `content` em texto e, quando a saída for estruturada,
   `structuredContent` com o mesmo objeto e `outputSchema` correspondente.
   Projete campos públicos antes de retornar. Falha prevista devolve
   `isError: true` com mensagem clara, sem lançar exceção.
4. Nenhuma tool devolve o valor de uma credencial. `credentials_status`
   mostra `file`, `exists`, `masterKeySource`, `count` e `names`, sem
   valores. Tools que consomem APIs leem o valor com
   `getCredential(name)` internamente e devolvem o resultado da chamada.
5. Tools que gravam ou têm efeito externo dizem isso na descrição e, quando
   couber, aceitam `dryRun`.
6. Toda tool entra em `catalog.tools` para que `mcp --list` a enxergue.
7. Anotações descrevem comportamento, mas não concedem permissão. Capture
   falhas do serviço com mensagens públicas: o SDK pode retornar a mensagem
   original de uma exceção em `isError`.
8. Resources usam o esquema `<bin>://`. Templates declaram `list` para que
   clientes descubram os valores possíveis.
9. Respostas curtas: devolva o que o agente precisa, não o dump completo.
   Paginação por `limit` e `cursor` quando a lista puder crescer.

Encaminhe cancelamento e timeout ao serviço. Não anuncie suporte a HTTP,
subscriptions, sampling, elicitation ou Tasks apenas porque o SDK oferece
essas APIs. Cada capacidade requer integração e teste próprios.

## Passos

1. Rode `git status --short`.
2. Copie `template/tool/example.ts` para `src/mcp/tools/<grupo>.ts` e ajuste
   os imports.
3. Selecione uma receita em `references/examples/README.md`.
   Implemente a tool reutilizando funções de `src/config/` e coletores do
   CLI. Não duplique lógica de comando dentro da tool.
4. Registre a função em `registerAll` (`src/mcp/server.ts`) e compare
   catálogo local com descoberta real. O SDK não mantém o catálogo Termfy.
5. Teste com o `Client` do SDK em `tests/mcp.test.ts` (ver
   `references/mcp-tests.md`) e, manualmente, com
   `npx @modelcontextprotocol/inspector bun run src/main.ts mcp`.
6. Rode `bun run validate`.
7. Atualize a tabela de tools em `docs/mcp.md` e a `longDescription` do
   comando `mcp` em `src/cli/commands/mcp.ts`.

## Itens da spec

Ao começar, troque `Status:` para `in_progress` na spec e na linha dela no
índice do `CLISPEC.md`. Ao concluir e testar cada entrega, marque `[x]` no
item da spec, editando o arquivo em `specs/`. Item novo entra no fim de
Tasks ou Tests, com a tag `#termfy-mcp`. Se o escopo mudar, revise Surface,
Behavior, Design e o texto do item com `termfy-spec` e registre a alteração
em `## Notes` da spec. Não mexa na superfície do `CLISPEC.md` enquanto a
spec está aberta: a tool nova fica só na Surface da spec. Relate
separadamente as pendências de outras entregas. Ao concluir o escopo
inteiro, rode `bun run validate` e exija saída 0. Com todos os itens
marcados, feche a spec pelo ciclo de `termfy-spec`: faça a conferência
manual descrita em `references/spec-contract.md` daquela skill, aplique a
Surface às tabelas do `CLISPEC.md` e troque o status para `done`.

## Marcos

Informe quando o contrato estiver definido, quando descoberta e chamadas
funcionarem e quando testes e documentação terminarem. Inclua entrada
inválida, falha de domínio, projeção pública e cancelamento quando aplicável.

## Saída

Liste tools, resources e prompts adicionados ou alterados, com entrada e
saída, efeitos, versões verificadas e testes executados. Separe receitas
isoladas, integração no produto, binário compilado e cliente real. Não
apresente uma camada não executada como validada.

## Compatibilidade

Starter kit a partir da v0.9.0 (specs em Markdown puro, sem command
`spec`), SDK instalado 1.32.2 e Zod 4.6.7, conferidos em
10/11/2026. O Hub executa receitas com Node.js; o produto usa Bun.
Caminhos citados: `src/mcp/server.ts`, `src/mcp/tools/`,
`src/mcp/resources/`, `src/mcp/prompts.ts`, `template/tool/example.ts`,
`tests/mcp.test.ts`, `docs/mcp.md` e `src/cli/commands/mcp.ts`.
