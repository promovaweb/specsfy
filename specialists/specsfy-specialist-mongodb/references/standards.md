# Padrões e referências MongoDB

Reúne as regras que valem para documento, consulta e operação, o índice das
referências por modo e as fontes oficiais.

Em 20/11/2026, MongoDB Server 9.0 está em disponibilidade geral desde
29/09/2026 e disponível no Atlas Core. As notas registram 9.0.8 em 10/11/2026.
A prévia pública é da edição Atlas Infinite, que roda a linha 9.x.
Confira a versão do servidor, do driver e do Database Tools separadamente.

## Versão e topologia antes de regra

```javascript
db.version();
db.hello();
db.adminCommand({ getCmdLineOpts: 1 });
```

- `db.hello().msg === "isdbgrid"` identifica o roteador `mongos` de um
  cluster sharded, mesmo sem `setName`.
- `setName` identifica o replica set de um membro `mongod`. Um `mongod`
  standalone não anuncia `setName`.
- Transação multi-documento exige replica set ou shard; standalone não aceita.
- Atualização de versão envolve binário, `setFeatureCompatibilityVersion` e
  driver compatível. Confirme a matriz na nota de release da versão instalada.

## Índice dos modos

| Modo | Abre | Conteúdo |
| --- | --- | --- |
| modeling | [modeling.md](modeling.md) | documento, embed versus referência, array, `$jsonSchema` e evolução |
| queries | [queries.md](queries.md) | índice composto ESR, multikey, partial, TTL, explain e aggregation |
| operation | [operation.md](operation.md) | replica set, eleição, write concern, backup, transação e upgrade |

## Regras comuns

- Um documento tem limite de 16 MB. Modelo que cresce sem limite é erro de
  modelagem, não problema de servidor.
- Escrita em um documento é atômica. Essa é a unidade de consistência que o
  modelo deve usar antes de recorrer a transação.
- Coleção não impõe schema por padrão. `$jsonSchema` com
  `validationAction: "error"` é o contrato mínimo para coleção de escrita da
  aplicação.
- Índice é derivado da consulta. Ordem do composto segue equality, sort, range.
- `explain("executionStats")` é a prova de índice, não a existência dele em
  `getIndexes()`.
- Write concern e read concern são decisão por operação crítica, com a
  consequência de latência e durabilidade declarada.
- Autenticação, TLS e role por aplicação em qualquer ambiente compartilhado.
- Backup só conta depois de restauração testada; snapshot sem verificação de
  oplog não garante ponto no tempo.
- Driver precisa ser compatível com a versão do servidor. Driver antigo contra
  servidor novo falha em comando novo de forma silenciosa ou com erro obscuro.

## Embed ou referência

| Situação | Decisão | Motivo |
| --- | --- | --- |
| 1:1 lido sempre junto | Embutir | Uma leitura resolve, sem junção |
| 1:poucos com limite claro | Embutir com limite | Array pequeno cabe no documento |
| 1:muitos sem limite | Referenciar | Array cresce até estourar 16 MB |
| muitos:muitos | Referenciar com índice nos dois lados | Cardinalidade alta e escrita independente |
| Dado compartilhado por vários agregados | Referenciar | Evita duplicação inconsistente |
| Histórico, evento, log | Coleção própria ou bucket | Crescimento e retenção são próprios |
| Subconjunto lido com frequência | Padrão subset | Duplica o campo quente, não o documento inteiro |
| Valor calculado com frequência | Padrão computed | Evita recalcular em toda leitura |

Regra de bolso: embutir o que a tela lê junto e cabe em poucos kilobytes;
referenciar o que cresce, é compartilhado ou tem ciclo de vida próprio.

## Consistência

| Write concern | Confirma em | Perda possível | Uso |
| --- | --- | --- | --- |
| `w: 0` | nenhum membro | alta | telemetria descartável |
| `w: 1` | primário | failover antes da replicação | dado recriável |
| `w: "majority"` | maioria calculada de membros votantes com dados | depende da topologia e da persistência | operações que precisam resistir a failover |

- `w: "majority"` usa a maioria calculada do replica set (veja
  `writeMajorityCount` em `rs.status()`). Confira
  `writeConcernMajorityJournalDefault` e a engine de armazenamento.
- Timeout de write concern não cancela a escrita. Consulte a chave da
  operação para reconciliar o resultado antes de repetir.
- `readConcern: "local"` lê o que o membro selecionado tem. `"majority"`
  lê dados no ponto confirmado pela maioria e `"snapshot"` pode fornecer
  uma visão consistente para a transação.
- Escolha `readPreference` por operação. `"primary"` direciona a leitura
  ao primário; `"secondaryPreferred"` pode ler dado atrasado. Combine a
  preferência com o read concern exigido pela operação.
- Transação usa `readConcern`, `writeConcern` e `readPreference` no nível da
  transação, com `session` passada em cada operação.

## Índices

- Um índice por consulta quente. Índice que nenhuma consulta usa ocupa memória e
  atrasa escrita.
- Multikey (campo array) tem custo por elemento e não suporta índice composto
  com dois arrays.
- `partial` reduz tamanho quando a consulta sempre filtra por um estado.
- `TTL` remove documento expirado; o processo roda em segundo plano e não
  substitui política de retenção declarada.
- Unique simples comum indexa ausência e `null` como a mesma chave nula,
  permitida uma vez. Unique sparse ainda indexa `null` explícito. Use
  validador para campo obrigatório ou unique parcial para o tipo escolhido.
  Em composto, a chave única é a combinação dos campos.
- Índice de texto é um por coleção e atende busca textual simples, não substitui
  motor de busca dedicado.

## Operação

- Replica set de produção tem três membros com dado, em zonas ou hosts
  distintos. Arbiter serve para quorum, não para disponibilidade de dado.
- Liste seeds alcançáveis e confira os endereços anunciados pelo conjunto.
  `retryWrites` cobre operações elegíveis dentro dos limites do driver.
  Teste reconexão, falhas visíveis e resultados ambíguos durante eleição.
- Backup lógico (`mongodump`) serve base pequena e migração; snapshot de volume
  ou backup gerenciado serve base grande e restore rápido.
- Ponto no tempo usa oplog com janela de retenção maior que a janela declarada
  de recuperação.
- `setFeatureCompatibilityVersion` é passo separado da troca de binário e tem
  direção de ida e volta definida pela versão.

## Fontes oficiais

- Disponibilidade do 9.0: https://www.mongodb.com/products/updates/mongodb-9-0-is-now-available/
- Notas do 9.0: https://www.mongodb.com/docs/manual/release-notes/9.0/
- Versões no Atlas: https://www.mongodb.com/docs/atlas/atlas-versions/
- Topologia no retorno de `hello`: https://www.mongodb.com/docs/manual/reference/command/hello/

- Manual: https://www.mongodb.com/docs/manual/
- Modelagem de dados: https://www.mongodb.com/docs/manual/data-modeling/
- Introdução à modelagem: https://www.mongodb.com/docs/manual/core/data-modeling-introduction/
- Validação de schema: https://www.mongodb.com/docs/manual/core/schema-validation/
- Índices: https://www.mongodb.com/docs/manual/indexes/
- Tipos de índice: https://www.mongodb.com/docs/manual/core/indexes/index-types/
- Criação de índice: https://www.mongodb.com/docs/manual/core/index-creation/
- Índice composto: https://www.mongodb.com/docs/manual/core/index-compound/
- Otimização de consulta: https://www.mongodb.com/docs/manual/core/query-optimization/
- Resultado do explain: https://www.mongodb.com/docs/manual/reference/explain-results/
- `db.collection.explain()`: https://www.mongodb.com/docs/manual/reference/method/db.collection.explain/
- Pipeline de agregação: https://www.mongodb.com/docs/manual/core/aggregation-pipeline/
- Otimização de pipeline: https://www.mongodb.com/docs/manual/core/aggregation-pipeline-optimization/
- Replicação: https://www.mongodb.com/docs/manual/replication/
- Arquitetura de três membros: https://www.mongodb.com/docs/manual/core/replica-set-architecture-three-members/
- Transações: https://www.mongodb.com/docs/manual/core/transactions/
- Transações na aplicação: https://www.mongodb.com/docs/manual/core/transactions-in-applications/
- Read concern, isolation e consistência: https://www.mongodb.com/docs/manual/core/read-isolation-consistency-recency/
- Write concern: https://www.mongodb.com/docs/manual/core/write-concern/
- Backup: https://www.mongodb.com/docs/manual/core/backups/
- Ferramentas de backup e restore: https://www.mongodb.com/docs/manual/tutorial/backup-and-restore-tools/
- Snapshot de filesystem: https://www.mongodb.com/docs/manual/tutorial/backup-with-filesystem-snapshots/
- `mongodump`: https://www.mongodb.com/docs/database-tools/mongodump/
- Limites do sistema: https://www.mongodb.com/docs/manual/reference/ulimit/
