# Nomes e contratos de uma família

## Recurso e verbo

Use o recurso no plural e o verbo em inglês, como `orders list`,
`orders show`, `orders create`, `orders update` e `orders delete`.
Conserve o vocabulário já publicado pelo projeto. Não adicione aliases
sem previsão na spec. Para MCP, use `orders_list`, `orders_show`,
`orders_create`, `orders_update` e `orders_delete`.

Exporte o agrupador como `ordersCommand` e a função de registro de tools
como `registerOrdersTools`. A screen pode ser `ordersScreen` com id
`orders`. Esses nomes são exemplos de novos identificadores do projeto.
A forma dos objetos vem de `Command`, `Registrar` e `Screen`, declarados
em `src/cli/registry.ts`, `src/mcp/server.ts` e `src/tui/screen.ts`.

## Options e arguments

| Entrada | Regra |
| --- | --- |
| `--limit <n>` | inteiro positivo com teto e padrão definidos na spec; converta e valide em `run` |
| `--status <status>` | valores de enum da spec em `argument.values`; ausência não cria filtro |
| `--json` | global; não declare novamente nas folhas |
| `<id>` | argument obrigatório para show, update e delete, se esse for o contrato do recurso |
| cursor | acrescente `--cursor` somente se a paginação pública estiver na spec |
| payload | use campos tipados ou arquivo/stdin conforme a spec; nunca use arguments para tokens |
| confirmação | implemente `--yes` somente quando previsto; a tool precisa de contrato próprio sem prompt |

Use `ctx.options.limit`, `ctx.options.status` e `ctx.args`. O parser entrega
strings para options com valor. Em MCP, Zod pode converter o contrato em
números e enums validados; ambos os adaptadores devem chegar à mesma função
com a mesma forma normalizada. `interactive: true` não verifica TTY sozinho.

## Dados por verbo

Use a spec como fonte. Na ausência de um contrato publicado, proponha estas
formas antes de implementar. Os nomes do exemplo são do domínio de pedidos:

| Verbo | Função compartilhada sugerida | `data` da CLI e objeto da tool |
| --- | --- | --- |
| list | `listOrders(input)` | `{ count, orders, nextCursor }` |
| show | `getOrder(id)` | `{ order }` |
| create | `createOrder(input)` | `{ order, created }` |
| update | `updateOrder(id, input)` | `{ order, updated }` |
| delete | `deleteOrder(id)` | `{ id, deleted }` |

`count` conta os itens retornados, não o total remoto, salvo definição
explícita. Use `nextCursor: null` no fim da lista. `created`, `updated` e
`deleted` descrevem o efeito confirmado, não apenas a tentativa. Para uma
API que aceite trabalho assíncrono com 202, modele o estado pendente na
spec em vez de afirmar que a operação terminou.

Não devolva `Response`, `Error` ou Renderable como `data`. A CLI monta
`text` com `table`, `section` e `blocks` de `src/cli/format.ts`; a tool
serializa o resultado e a screen usa os mesmos dados. Falha não vira lista
vazia nem sucesso com campos obrigatórios ausentes.

## Exit codes e falhas

Declare códigos por folha, sem presumir herança do agrupador. Use
`ExitCode.CREDENTIALS` para token ausente, `ExitCode.CONFIG` para
configuração inválida e `ExitCode.NETWORK_OR_API` para falha HTTP ou de
transporte do client. `error.network` conserva o status remoto nos
`details`. Não remapeie silenciosamente um 404 remoto para código 6 se o
client e a spec definem código 5. Use `ExitCode.NOT_FOUND` para uma ausência
de domínio apenas quando esse contrato estiver definido e testado.

A camada MCP não usa exit code de processo para uma falha de operação.
Converta `AppError` em resposta com `isError: true`, texto útil e, quando
houver dados estruturados de erro, o mesmo objeto em `structuredContent`.
Não exponha campos sensíveis dos `details`. Na screen, apresente o erro e
uma ação de tentar novamente, sem deixar Promise rejeitada sem tratamento.

## Lista na TUI

Separe labels de ids. O índice selecionado aponta para a coleção que gerou
os labels; não extraia ids a partir do texto renderizado. `listPanel`
retorna `box`, `move`, `select` e `selected`. Monte `box` e use índices
válidos. `move` não chama `onSelect`; `select` chama. Para coleção vazia,
`selected()` é -1. Atualize os hints de `keys` e trate teclado em `onKey`.

`mount(ctx)` retorna um Renderable síncrono. Carregue a lista em
`onEnter(ctx)` e guarde uma geração de request ou mecanismo de cancelamento.
Invalide a geração em `onLeave(ctx)` para impedir que uma resposta antiga
altere uma screen que já saiu. Ao substituir o painel, remova e descarte o
anterior conforme a API do OpenTUI; não acumule componentes a cada refresh.
