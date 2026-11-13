# Behavior e Design

As duas seções existem para que a skill que implementa não precise voltar
à pessoa. Behavior responde "como se usa"; Design responde "onde e como se
constrói". Uma spec só passa a `in_progress` com as duas preenchidas;
comentário HTML ou texto de exemplo conta como vazio.

## Behavior

Escreva a partir do uso, em fluxos curtos. Para cada command, screen ou
tool da spec, cubra:

- a chamada típica e o que aparece em texto;
- o `--json`: campos de `data` e tipos;
- cada falha prevista, com a mensagem em linhas gerais e o exit code;
- confirmação, TTY e a alternativa não interativa;
- na TUI, painéis e teclas; no MCP, entrada, saída e `isError`.

```markdown
## Behavior

`orders export --since 2026-11-01` grava `orders-2026-11-10.csv` na pasta
atual e imprime o caminho e a contagem. Com `--json`, devolve
`{ file, count }`. Sem `shop.token` no cofre, sai com 4 e sugere
`mycli credentials set shop.token`. Com a API fora do ar depois de três
tentativas, sai com 5. A tool `orders_export` recebe `{ since? }`, devolve
o mesmo `{ file, count }` e tem efeito `write`.
```

## Design

Escreva em itens, um por arquivo ou camada, com o padrão do starter kit
que se aplica. Os caminhos do exemplo são relativos a `src/`. Cubra:

- arquivos novos e alterados, com o papel de cada um;
- a função compartilhada que CLI, MCP e TUI chamam;
- client HTTP, repositório SQLite e migration, quando houver;
- dependências novas e o motivo;
- `AppError` e exit code de cada falha.

```markdown
## Design

- `shop/orders.ts`: `exportOrders(since)` monta o CSV a partir de
  `listOrders`, usada pelo command e pela tool.
- `shop/client.ts`: paginação por cursor, já existente; sem mudança.
- `cli/commands/orders.ts`: subcommand `export` no grupo `orders`.
- `mcp/tools/orders.ts`: tool `orders_export`.
- Sem dependência nova: o CSV é montado com `Bun.write`.
- Falha de rede vira `AppError` 5; token ausente, 4.
```

Quando a spec cria armazenamento, o Design também traz:

```markdown
- `db/migrations/0002-create-exports.ts`: tabela `exports`
  (`id INTEGER PRIMARY KEY`, `file TEXT NOT NULL`, `count INTEGER NOT NULL`,
  `created_at TEXT NOT NULL`), `STRICT`.
- `db/exports.ts`: `addExport` e `listExports`, chamadas pelo command e
  pela tool.
```
