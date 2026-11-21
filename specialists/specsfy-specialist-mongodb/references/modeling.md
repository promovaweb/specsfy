# Documento, embed e validação

## Ponto de partida

Responda antes de escrever o primeiro documento:

1. Quais consultas existem hoje e com que frequência cada uma roda?
2. Quais campos são lidos juntos na mesma tela ou no mesmo contrato?
3. Qual array pode crescer sem limite conhecido?
4. Qual escrita precisa ser atômica e quantos documentos ela toca?
5. Qual dado é compartilhado entre agregados diferentes?

Sem essas respostas, qualquer escolha entre embutir e referenciar é preferência
pessoal sem consequência medida.

## Unidade de consistência

- Uma escrita em um documento é atômica, incluindo vários campos e operadores
  como `$set`, `$inc` e `$push`.
- Várias coleções ou vários documentos exigem transação, com custo de latência e
  limite de tempo.
- O modelo certo coloca junto o que precisa mudar junto. Transação não conserta
  documento que deveria ser um só.
- Limite de documento é 16 MB. O limite não é meta de tamanho: documento grande
  reescreve mais dado a cada atualização e ocupa mais cache.

## Embutir

```javascript
({
  _id: ObjectId(),
  email: "ana@example.com",
  name: "Ana",
  address: { street: "Rua A", number: "10", city: "São Paulo" },
  preferences: { language: "pt-BR", timezone: "America/Sao_Paulo" }
});
```

Bom para relação 1:1 lida sempre junto, 1:poucos com limite claro e valor que
não é consultado fora do documento pai.

Custo: duplicação quando o mesmo dado aparece em vários documentos, escrita que
reescreve o documento inteiro e array que cresce.

## Referenciar

```javascript
const customerId = ObjectId();
const order = { _id: ObjectId(), customerId, totalCents: 15990 };
const customer = { _id: customerId, email: "ana@example.com", name: "Ana" };
```

Bom para cardinalidade alta, dado compartilhado, ciclo de vida próprio e escrita
concorrente independente.

Custo: leitura em duas consultas ou `$lookup`, e integridade referencial que o
banco não garante sozinho.

## Array que cresce

Sintoma: `$push` em array dentro do documento do cliente ou do pedido, sem
limite.

```javascript
// errado para histórico longo
({ _id: 1, customerId: 42, events: [{ at: ISODate(), type: "login" }] });
```

Consequências: documento se aproxima de 16 MB, cada `$push` reescreve o
documento, índice multikey cresce e a leitura do documento fica caro.

Alternativas:

- Coleção própria com `customerId` indexado e TTL quando houver retenção.
- Padrão bucket: um documento por período com contagem controlada.

```javascript
({
  _id: ObjectId(),
  customerId: 42,
  bucketStart: ISODate("2026-11-01T00:00:00Z"),
  count: 1,
  events: [{ at: ISODate("2026-11-01T10:00:00Z"), type: "login" }]
});
```

O bucket é criado quando `count` chega ao limite definido, e a consulta lê o
intervalo de `bucketStart` que interessa.

## Validação de schema

```javascript
db.createCollection("customer", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "createdAt", "schemaVersion"],
      additionalProperties: false,
      properties: {
        _id: { bsonType: "objectId" },
        email: { bsonType: "string", maxLength: 254 },
        name: { bsonType: "string", maxLength: 160 },
        status: { enum: ["active", "blocked", "deleted"] },
        schemaVersion: { bsonType: "int", minimum: 1 },
        createdAt: { bsonType: "date" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});
```

- `validationLevel: "strict"` valida inserções e atualizações. `"moderate"`
  valida toda inserção nova e atualizações de documentos já válidos.
  Atualizações de documentos legados inválidos ficam fora enquanto durar
  a transição.
- `validationAction: "error"` rejeita a escrita. `"warn"` registra no log e
  aceita, e só se justifica em transição com prazo.
- `additionalProperties: false` fecha o contrato. Sem isso, campo novo entra sem
  revisão.
Insira com o tipo BSON declarado, usando `Int32` no mongosh:

```javascript
db.customer.insertOne({
  email: "ana@example.com",
  name: "Ana",
  status: "active",
  schemaVersion: Int32(1),
  createdAt: ISODate()
});
```

Para mudar um validador existente, passe o contrato completo em
`validator` no comando `collMod`.

- O validador rejeita o documento novo, não corrige o antigo. Faça backfill
  antes de endurecer a regra, ou use `moderate` enquanto a janela existe.
- Defina se o campo único é obrigatório. Para `email` obrigatório, combine
  validador e índice unique simples. Em um índice unique simples comum,
  ausência e `null` compartilham uma única chave nula. Unique sparse pula
  ausentes e inclui `null` explícito. Se apenas strings presentes devem ser
  únicas, valide que o campo é escalar e use unique parcial com
  `partialFilterExpression: { email: { $type: "string" } }`.
  Em composto, a restrição recai sobre a combinação completa.

## Evolução do formato

- `schemaVersion` no documento permite consultar e migrar por versão, sem
  adivinhar pela forma.
Para migrar do formato legado sem `schemaVersion` para a versão 1:

1. Publique leitores que aceitam os dois formatos e usam o default
   `"active"` somente quando `status` está ausente, se for a regra de
   negócio. Passe todos os escritores para o novo formato antes do
   backfill. Mantenha a leitura legada durante a transição.
2. Em mongosh, processe lotes sobre o `_id` estável. O exemplo assume
   `_id` do tipo ObjectId para toda a coleção. O update revalida a ausência
   de versão na escrita e mantém `status` existente, inclusive `null`,
   que deve ser tratado em separado caso seja inválido:

```javascript
const unversioned = { $exists: false };
let after = null;

while (true) {
  const ids = db.customer.find({
    schemaVersion: unversioned,
    ...(after === null ? {} : { _id: { $gt: after } })
  }, { _id: 1 }).sort({ _id: 1 }).limit(500).toArray().map(({ _id }) => _id);

  if (ids.length === 0) break;

  db.customer.updateMany(
    { _id: { $in: ids }, schemaVersion: unversioned },
    [{ $set: {
      schemaVersion: Int32(1),
      status: {
        $cond: [{ $eq: [{ $type: "$status" }, "missing"] }, "active", "$status"]
      }
    } }]
  );
  after = ids.at(-1);
}
```

3. Conte os documentos sem versão e os fora do validador. Corrija as
   exceções e guarde as consultas como evidência. Endureça o validador e
   retire a leitura legada quando as duas contagens forem zero. É possível
   reiniciar o backfill desde o começo porque ele só atualiza documentos
   sem versão.

## Padrões auxiliares

| Padrão | Quando usar | Efeito |
| --- | --- | --- |
| Subset | Documento grande com poucos campos lidos com frequência | Duplica só o campo quente em coleção de leitura |
| Computed | Valor derivado calculado em toda leitura | Grava resultado e mantém atualização explícita |
| Bucket | Série temporal ou evento com limite por período | Controla tamanho e melhora leitura por intervalo |
| Attribute | Produto com muitos atributos variáveis | Evita documento gigante e índice em campo opcional |
| Extended reference | Referência com poucos campos copiados | Evita `$lookup` no caminho quente |

Padrão auxiliar duplica dado. A duplicação precisa de rotina de atualização e de
checagem de divergência, senão vira inconsistência silenciosa.

## Revisão de modelo

- Cada consulta quente tem índice que a atende e `explain` que confirma.
- Nenhum array cresce sem limite declarado.
- Validador cobre os campos obrigatórios e rejeita tipo errado.
- Documento tem tamanho médio e máximo medidos:

```javascript
db.customer.aggregate([
  { $project: { size: { $bsonSize: "$$ROOT" } } },
  { $group: { _id: null, avg: { $avg: "$size" }, max: { $max: "$size" } } }
]);
```

- `$bsonSize` acima de 1 MB por documento pede revisão do modelo, mesmo abaixo
  do limite de 16 MB.
