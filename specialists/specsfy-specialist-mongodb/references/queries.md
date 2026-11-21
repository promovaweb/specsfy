# Índice, explain e aggregation

## Ler o explain

```javascript
db.invoice.find({ tenantId: 42, status: "open" })
  .sort({ createdAt: -1 })
  .limit(20)
  .explain("executionStats");
```

Campos que decidem:

| Campo | O que revela | Sinal de problema |
| --- | --- | --- |
| `winningPlan.stage` | `IXSCAN`, `COLLSCAN`, `FETCH`, `SORT` | `COLLSCAN` em coleção grande |
| `totalKeysExamined` | Chaves lidas do índice | Muito acima de `nReturned` |
| `totalDocsExamined` | Documentos lidos | Muito acima de `nReturned` |
| `nReturned` | Documentos devolvidos | Referência para as duas contagens |
| `executionTimeMillis` | Tempo total | Alto com `nReturned` baixo |
| `rejectedPlans` | Planos descartados | Mostra se havia alternativa |

Regra de leitura: `totalDocsExamined` próximo de `nReturned` indica índice
seletivo. Razão acima de 10 sugere índice que filtra pouco ou falta de
`projection`.

- `IXSCAN` seguido de `FETCH` lê documento depois do índice. `PROJECTION_COVERED`
  evita o `FETCH` quando todas as colunas lidas estão no índice.
- `SORT` na árvore do plano significa ordenação em memória. Com `LIMIT` pequeno,
  índice na ordem correta elimina o `SORT`.
- `EXPRESS_COMPILE` ou `MULTI_PLANNER` aparecem em execução concorrente; não são
  erro, mas indicam plano ainda em disputa.
- `db.collection.explain("executionStats")` na consulta real vale mais que
  explicar consulta "parecida" montada à mão.

## Regra equality, sort, range

Ordem do índice composto:

```javascript
// consulta
db.invoice.find({ tenantId: 42, status: "open" })
  .sort({ createdAt: -1 })
  .limit(20);

// índice
db.invoice.createIndex({ tenantId: 1, status: 1, createdAt: -1 });
```

- Equality primeiro: `tenantId`, `status`. Filtro de igualdade usa qualquer
  posição no índice e pode até ser coberto pelo índice de forma independente da
  ordem, mas a ordem importa para os demais.
- Sort depois: `createdAt` na direção do `sort`. Sem isso, o servidor ordena em
  memória.
- Range por último: `field: { $gt: ... }`. Um range antes consome a posição e
  limita o uso do restante para ordenação.
- Prefixo do índice: `{tenantId: 1}` atende consulta só por `tenantId`;
  `{createdAt: -1}` isolado não atende consulta por `status`.
- `sort` com duas direções diferentes exige índice com as mesmas direções.

## Tipos de índice

| Tipo | Uso | Cuidado |
| --- | --- | --- |
| Simples | Igualdade e ordenação em um campo | Cardinalidade baixa rende pouco |
| Composto | Consulta com filtro e ordenação | Ordem ESR decide |
| Multikey | Campo array | Um documento gera várias entradas |
| Partial | Consulta sempre filtra por estado | Predicado tem de aparecer na consulta |
| Sparse | Documento pode não ter o campo | Não substitui partial em consulta geral |
| Unique | Unicidade de negócio | Nulo/ausente não entra na checagem |
| TTL | Expiração de documento | Processo em background, não é agendador |
| Text | Busca textual simples | Um por coleção, sem ranking elaborado |
| Wildcard | Campo dinâmico desconhecido | Custo alto, use com parcimônia |

```javascript
db.invoice.createIndex(
  { tenantId: 1, status: 1, createdAt: -1 },
  { name: "invoice_tenant_status_created" }
);

db.job.createIndex(
  { status: 1, runAt: 1 },
  { name: "job_pending_run", partialFilterExpression: { status: "pending" } }
);

db.session.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

- `partialFilterExpression` só ajuda quando a consulta inclui o mesmo predicado.
  Consulta sem `status` não usa o índice parcial.
- `expireAfterSeconds: 0` remove quando o valor de `expiresAt` passa; o `atraso`
  é do ciclo de background, geralmente até 60 segundos.
- `multikey` em dois arrays no mesmo composto é recusado.
- `unique` em campo opcional: garanta presença com validador, senão dois
  documentos sem o campo passam.

## Consulta que não usa o índice

| Causa | Exemplo | Correção |
| --- | --- | --- |
| Tipo divergente | string `"42"` comparada a número `42` | Gravar tipo consistente |
| Collation diferente | índice com collation padrão e consulta com `collation` | Mesma collation ou índice com collation |
| Regex sem âncora | `{ name: /ana/ }` | Índice de texto ou campo normalizado |
| `$or` com campo sem índice | `{ $or: [ { a: 1 }, { b: 1 } ] }` | Índice nos dois campos |
| `$ne`, `$not`, `$nin` amplos | `{ status: { $ne: "x" } }` | Repensar predicado |
| Função em `$expr` sobre campo | `{ $expr: { $eq: [ { $toLower: "$email" }, ... ] } }` | Campo normalizado + índice |

Resolva na modelagem sempre que possível. `hint()` força plano e serve para
diagnóstico, não como correção permanente.

## Pipeline de agregação

```javascript
db.order.aggregate([
  { $match: { tenantId: 42, createdAt: { $gte: ISODate("2026-11-01") } } },
  { $project: { customerId: 1, totalCents: 1, createdAt: 1 } },
  { $group: { _id: "$customerId", total: { $sum: "$totalCents" }, orders: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $limit: 20 }
]);
```

- `$match` cedo usa índice. Depois de `$group`, o filtro é em memória.
- `$project` cedo reduz documento carregado e pode habilitar índice coberto.
- `$sort` antes de `$group` quando o `$group` precisa de ordem, e depois quando
  o resultado precisa ser ordenado.
- `$lookup` com `localField`/`foreignField` exige índice na coleção estrangeira.
  Versão com `pipeline` permite filtrar antes de trazer:

```javascript
db.order.aggregate([
  { $match: { tenantId: 42 } },
  { $lookup: {
      from: "customer",
      let: { customerId: "$customerId" },
      pipeline: [
        { $match: { $expr: { $eq: [ "$_id", "$$customerId" ] } } },
        { $project: { name: 1, email: 1 } }
      ],
      as: "customer"
  } },
  { $unwind: "$customer" }
]);
```

- `$facet` executa ramos no mesmo conjunto de entrada; cada ramo tem seu custo.
- `allowDiskUse: true` evita erro de limite de memória, mas esconde pipeline que
  deveria ser reescrito. Meça primeiro sem.
- `$setWindowFields` para ranking e acumulado; mais caro que `$group` simples.
- Explique o pipeline com `db.collection.explain("executionStats").aggregate([...])`
  e confira o primeiro estágio.

## Estatística e manutenção

```javascript
db.invoice.aggregate([{ $indexStats: {} }]);
db.invoice.getIndexes();
db.invoice.stats({ indexDetails: true });
```

- `$indexStats.ops` próximo de zero em índice antigo é candidato a remoção, desde
  que nenhuma consulta esporádica dependa dele.
- Estatística do otimizador é atualizada automaticamente; `hint` ou plano
  instável podem pedir revisão de índice.
- `db.currentOp()` mostra operação longa em execução, com plano e tempo.
- `db.setProfilingLevel(1, { slowms: 100 })` grava operação lenta em
  `system.profile`; desligue depois do diagnóstico.
- Em réplica, leitura em secundário com `readPreference: "secondary"` pode
  devolver dado atrasado. Documento recém-escrito pode não aparecer.
