# Migrations

## Onde ficam

```text
src/
  db/
    database.ts              openDatabase(), migrate(), migrationStatus()
    migrations/
      index.ts               registro em ordem; checkMigrations()
      0001-create-orders.ts
      0002-add-orders-status.ts
    orders.ts                repositório da tabela orders
```

O banco fica em `~/.<bin>/data.db`. `PRAGMA user_version` guarda a versão
aplicada. Ao abrir, `openDatabase()` aplica as migrations com versão maior
que a atual, cada uma na sua transação.

## Forma de uma migration

```ts
import type { Migration } from "./index.ts";

export const createOrders: Migration = {
  version: 1,
  name: "create_orders",
  up: `
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      external_id TEXT NOT NULL UNIQUE,
      total_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL
    ) STRICT;
    CREATE INDEX orders_created_at ON orders (created_at);
  `,
};
```

E no registro:

```ts
import { createOrders } from "./0001-create-orders.ts";
import { addOrdersStatus } from "./0002-add-orders-status.ts";

export const migrations: readonly Migration[] = checkMigrations([createOrders, addOrdersStatus]);
```

## Regras

- Versão igual ao número do arquivo, começando em 1, sem lacunas.
  `checkMigrations()` recusa versão fora de sequência e SQL vazio.
- Arquivo em kebab-case depois do número e `name` com as mesmas palavras
  em snake_case, em inglês, descrevendo a mudança:
  `0002-add-orders-status.ts` com `name: "add_orders_status"`.
- Tabelas `STRICT`, ids `INTEGER PRIMARY KEY`, datas em `TEXT` ISO 8601,
  dinheiro em inteiro de centavos, booleanos em `INTEGER` 0 ou 1.
- Migration publicada em release não muda. Para alterar uma tabela,
  escreva uma migration nova:
  - coluna nova: `ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'open';`
  - mudança de tipo, restrição ou remoção de coluna: crie a tabela nova,
    copie os dados, apague a antiga e renomeie, tudo na mesma migration.
- Antes de publicar, uma migration ainda não lançada pode ser corrigida.
  Depois da release, nunca.
- Import estático no `index.ts`. O build embute os arquivos no
  executável; ler `.sql` do disco quebra o binário instalado.
- Sem dados de exemplo nas migrations. Dados iniciais que o binário precisa
  para funcionar entram como migration própria e explícita.

## Tabelas no CLISPEC

Cada tabela criada pelas migrations aparece na subseção `### Storage` do
`CLISPEC.md`. A spec que cria ou altera a tabela a lista em `## Surface`, e
o agente copia a linha para o `CLISPEC.md` ao fechar a spec:

```markdown
### Storage

| Tabela | Coluna | Tipo | Chave primária | Not null |
| --- | --- | --- | --- | --- |
| `orders` | `id` | `INTEGER` | sim | sim |
| `orders` | `external_id` | `TEXT` | não | sim |
| `orders` | `total_cents` | `INTEGER` | não | sim |
| `orders` | `created_at` | `TEXT` | não | sim |
```

Nenhum script compara essa tabela com o schema. Na conferência manual, leia
os `CREATE TABLE` e `ALTER TABLE` das migrations em ordem e confira nome,
colunas, tipo, chave primária e `NOT NULL` de cada linha. Tabela listada que
nenhuma migration cria, ou tabela das migrations ausente do `CLISPEC.md`
sem spec aberta que a mude, é divergência a corrigir antes de fechar.

## Backup antes de migrar

Não há rollback. Quando o banco já tem schema e há migrations pendentes,
`migrate()` copia o arquivo com `VACUUM INTO` para
`data.db.v<versão anterior>.bak` antes de aplicar. Para voltar, a pessoa
fecha o binário e substitui `data.db` pelo backup.

## Banco mais novo que o binário

Se `user_version` for maior que a última versão conhecida, `migrate()`
recusa com exit code 3 e pede para atualizar o binário. Isso impede que uma
versão antiga grave sobre um schema que ela não conhece.

## `db status` e `db migrate`

Opcionais, quando a spec pede. `db status` abre o banco sem aplicar nada e
mostra arquivo, versão atual, última versão e pendentes. `db migrate`
aplica as pendentes. Os dois aceitam `--json`.

## Teste das migrations

- Banco `:memory:` do zero chega à última versão.
- Rodar `migrate()` de novo não muda nada.
- `user_version` maior que a última versão é recusado.
- Com dados na versão anterior, a migration nova preserva as linhas
  (insira na versão N-1, aplique a N e confira).
