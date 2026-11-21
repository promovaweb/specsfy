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
| `queryPlanner.winningPlan` | Árvore de etapas, incluindo `queryPlan` no SBE quando presente | `COLLSCAN` em coleção grande com filtro seletivo |
| `totalKeysExamined` | Chaves lidas do índice | Muito acima de `nReturned` |
| `totalDocsExamined` | Documentos lidos | Muito acima de `nReturned` |
| `nReturned` | Documentos devolvidos | Referência para as duas contagens |
| `executionTimeMillis` | Tempo total | Alto com `nReturned` baixo |
| `rejectedPlans` | Planos descartados | Mostra se havia alternativa |

Leia a árvore inteira, incluindo os ramos por shard quando existirem.
Compare `totalKeysExamined` e `totalDocsExamined` com `nReturned`. Uma
razão alta pede investigação de seletividade, filtro residual e limites
de índice. Uma projeção coberta pode evitar a leitura de documentos.

- `IXSCAN` seguido de `FETCH` lê documento depois do índice. `PROJECTION_COVERED`
  evita o `FETCH` quando todas as colunas lidas estão no índice.
- `SORT` indica ordenação explícita, com possível uso de disco. Índice
  que fornece a ordem pedida pode eliminar o estágio.
- Estágios `EXPRESS_*` indicam caminhos otimizados para certas operações.
  Quando o multiplanner é usado, ele compara planos candidatos para a
  consulta, independentemente da concorrência na aplicação.
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
- Um composto pode fornecer a ordem do índice ou a inversão de todos os
  sentidos. Por exemplo, `{ createdAt: -1, _id: 1 }` atende essa ordem e
  `{ createdAt: 1, _id: -1 }`.

## Tipos de índice

| Tipo | Uso | Cuidado |
| --- | --- | --- |
| Simples | Igualdade e ordenação em um campo | Cardinalidade baixa rende pouco |
| Composto | Consulta com filtro e ordenação | Ordem ESR decide |
| Multikey | Campo array | Um documento gera várias entradas |
| Partial | Consulta sempre filtra por estado | Predicado da consulta precisa implicar o filtro parcial |
| Sparse | Documento pode não ter o campo | Não substitui partial em consulta geral |
| Unique | Unicidade de negócio | Em índice simples comum, nulo e ausente usam a mesma chave |
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

- O otimizador pode usar um índice parcial se a consulta implicar seu filtro,
  inclusive com predicado mais restritivo. Para o índice de tarefas acima,
  uma consulta sem condição que implique `status: "pending"` pode perder
  resultados se usar esse índice.
- `expireAfterSeconds: 0` torna elegível o documento cujo `expiresAt` venceu.
  O ciclo nominal de 60 segundos do monitor TTL não é prazo máximo.
- `multikey` em dois arrays no mesmo composto é recusado.
- Para campo opcional, use unique parcial com filtro de tipo se apenas
  valores daquele tipo devem ser únicos. Unique sparse ainda indexa
  `null` explícito. Em composto vale a combinação dos campos.

## Consulta que não usa o índice

| Causa | Exemplo | Correção |
| --- | --- | --- |
| Tipo divergente | string `"42"` comparada a número `42` | Gravar tipo consistente |
| Collation diferente | índice com collation padrão e consulta com `collation` | Mesma collation ou índice com collation |
| Regex sem âncora | `{ name: /ana/ }` | Índice de texto ou campo normalizado |
| `$or` com campo sem índice | `{ $or: [ { a: 1 }, { b: 1 } ] }` | Índice nos dois campos |
| `$ne`, `$not`, `$nin` amplos | `{ status: { $ne: "x" } }` | Repensar predicado |
| Função em `$expr` sobre campo | `{ $expr: { $eq: [{ $toLower: "$email" }, "ana@example.com"] } }` | Campo normalizado + índice |

Resolva na modelagem sempre que possível. `hint()` força plano e serve para
diagnóstico, não como correção permanente.

## Pipeline de agregação

```javascript
db.order.aggregate([
  { $match: { tenantId: 42, createdAt: { $gte: ISODate("2026-11-01") } } },
  { $group: { _id: "$customerId", total: { $sum: "$totalCents" }, orders: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $limit: 20 }
]);
```

- Um `$match` elegível no início pode usar índice. Filtre depois de
  `$group` quando o predicado depender do resultado da agregação.
- O otimizador costuma podar campos dispensáveis. Use `$project` para
  definir a saída ou calcular campos, e meça antes de antecipá-lo.
- `$sort` antes de `$group` quando o `$group` precisa de ordem, e depois quando
  o resultado precisa ser ordenado.
- Índice no campo estrangeiro favorece o desempenho de `$lookup` de
  igualdade. A junção também funciona sem ele. A versão com `pipeline`
  permite filtrar antes de trazer:

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

- Leia `accesses.ops` e `accesses.since` no resultado de `$indexStats`.
  Verifique cada nó que serve leituras e cubra consultas esporádicas antes
  de considerar a remoção de índice pouco usado.
- Estatística do otimizador é atualizada automaticamente; `hint` ou plano
  instável podem pedir revisão de índice.
- `db.currentOp()` mostra a operação em execução e seu tempo, com resumo
  do plano quando disponível. Use `explain` para inspecionar o plano
  completo de uma consulta representativa.
- `db.setProfilingLevel(1, { slowms: 100 })` grava operação lenta em
  `system.profile`; desligue depois do diagnóstico.
- Em réplica, leitura em secundário com `readPreference: "secondary"` pode
  devolver dado atrasado. Documento recém-escrito pode não aparecer.
