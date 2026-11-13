# Repositórios

Um repositório reúne o SQL de uma tabela. Commands, tools MCP e screens
chamam as mesmas funções, então os três modos leem e gravam do mesmo jeito.

## Forma

```ts
import type { Database } from "bun:sqlite";

export interface Order { id: number; externalId: string; totalCents: number; createdAt: string }
interface OrderRow { id: number; external_id: string; total_cents: number; created_at: string }

const toOrder = (row: OrderRow): Order => ({
  id: row.id, externalId: row.external_id, totalCents: row.total_cents, createdAt: row.created_at,
});

export function listOrders(db: Database, limit = 50): Order[] {
  return db.query<OrderRow, { limit: number }>(
    "SELECT id, external_id, total_cents, created_at FROM orders ORDER BY created_at DESC LIMIT $limit",
  ).all({ limit }).map(toOrder);
}
```

## Regras

- A função recebe o `Database` aberto. Isso permite testar com
  `openDatabase(":memory:")` e reaproveitar a conexão num command que faz
  várias operações.
- Statements preparados com parâmetros nomeados (`$limit`). Nunca
  concatene valores no SQL.
- Linhas em snake_case viram objetos em camelCase, com tipos declarados.
- Linha ausente: `AppError` NOT_FOUND (6) com o id na mensagem.
- Várias escritas que precisam acontecer juntas vão em `db.transaction()`.
- `INSERT ... RETURNING` devolve a linha criada sem uma segunda consulta.

## Uso nos modos

Command:

```ts
run: () => {
  const db = openDatabase();
  try {
    const orders = listOrders(db);
    return { data: { count: orders.length, orders }, text: () => formatOrders(orders) };
  } finally { db.close(); }
},
```

Tool MCP: mesma chamada, com o resultado em `structuredContent` e
`isError: true` para `AppError` esperado. Screen da TUI: abra o banco ao
carregar os dados da aba e feche ao terminar a leitura; não mantenha a
conexão aberta entre renders.

## Testes

```ts
let db: Database;
beforeEach(() => { db = openDatabase(":memory:"); });
afterEach(() => db.close());
```

Cubra inserção, listagem, leitura, remoção, linha ausente e a ordem da
listagem. Para commands, rode o binário em subprocesso com `<BIN>_HOME`
apontando para uma pasta temporária e confira que `data.db` aparece lá.
