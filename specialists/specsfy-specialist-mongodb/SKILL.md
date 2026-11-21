---
name: specsfy-specialist-mongodb
description: Modelar, consultar e operar MongoDB com modelo de documento explícito, índices medidos e operação com réplica e restauração comprovadas. Use no modo modeling para decidir embed ou referência, array sem limite, schema validation com $jsonSchema, padrão bucket e evolução de documento; no modo queries para índice composto pela regra equality-sort-range, multikey, partial, TTL, explain executionStats e aggregation pipeline; no modo operation para replica set, eleição, write concern, backup com mongodump ou snapshot, point-in-time com oplog, transação e atualização de versão. Não use para schema relacional com integridade referencial (`$specsfy-specialist-postgres`), para decidir entidade e relação antes do documento (`$specsfy-specialist-modeling`) nem para coordenar release e deploy (`$specsfy-specialist-delivery`).
---

# MongoDB

Cobre o documento que expressa o dado lido junto, o índice que o plano confirma e
a operação que devolve o conjunto depois de uma eleição. O modo modeling decide
o formato do documento; o modo queries lê `explain` e ajusta índice ou pipeline;
o modo operation trata réplica, backup, transação e upgrade.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Decidir embutir ou referenciar, crescer array, validar documento com `$jsonSchema`, versionar schema ou aplicar padrão bucket, subset e computed | modeling | [Documento, embed e validação](references/modeling.md) |
| Consulta lenta, `explain("executionStats")`, índice composto, multikey, partial, TTL, `$lookup`, `$group` ou pipeline que estoura memória | queries | [Índice, explain e pipeline](references/queries.md) |
| Replica set, eleição, write concern, backup, point-in-time com oplog, transação, autenticação, `setFeatureCompatibilityVersion` ou upgrade | operation | [Réplica, backup, transação e upgrade](references/operation.md) |

Não use para:

- Schema relacional, `JOIN`, constraint, transação com isolamento por nível ou
  integridade referencial. Use `$specsfy-specialist-postgres` quando o dado for
  relacional por natureza.
- Decidir entidade, agregado e ciclo de vida antes de escolher documento ou
  tabela. Use `$specsfy-specialist-modeling` e materialize a decisão aqui.
- Release, versionamento de imagem e rollout. Use
  `$specsfy-specialist-delivery`; este especialista entrega a topologia, o
  índice e o procedimento de recuperação que a entrega consome.

Combine com `$specsfy-specialist-architecture` quando o documento for a
representação de um contrato de API, com `$specsfy-specialist-redis` quando
houver cache na frente da leitura e com `$specsfy-specialist-observability`
quando a latência atravessar aplicação, rede e banco.

## No Specsfy

1. **Fonte de entrada por fase**
   - Em `specsfy-02-backlog`, leia o item em `specs/backlog/` e registre ali
     as decisões e sinais do especialista, além das dúvidas abertas.
   - Em `specsfy-03-specify` e `specsfy-04-validate`, use a
     spec aberta e devolva a conclusão à seção trabalhada pela fase.
   - Em `specsfy-05-tasks`, ajude a sugerir e sincronizar especialistas e modos
     entre o cabeçalho, a seção 8 e as tarefas. Só essa fase escreve a seção 14.
   - Em `specsfy-06-implement`, limite-se à tarefa indicada e ao passo carregado.

   Nas fases com spec, leia a spec aberta indicada pela skill chamadora ou
   localizada por `specsfy status`. Consulte a linha `| Especialistas |`,
   a subseção `#### Especialistas` em `### 8. Plano técnico` e a seção
   pertinente à fase. Se receber apenas um ID inequívoco, use
   `specsfy specs show <id> --content`.
   Leia também `.specsfy/STACK.md`, `.specsfy/RULES.md` e `.specsfy/DATABASE.md`.
2. Siga o modo indicado, no formato `Especialista: $specsfy-specialist-mongodb (modeling)`, `(queries)` ou `(operation)`.
   Sem indicação, confirme a versão do servidor e a topologia.
3. Retorne conclusões e dúvidas à fase chamadora para registro no destino
   indicado no item 1. Em `prepare`, a implementação no modo `tests`
   conclui o checklist da tarefa. Estado e gates cabem à fase do método.
   Entregue o formato do documento, o validador, o predicado que justifica o
   índice, os planos comparados, o write concern e o procedimento de
   restauração.
   A atualização de `.specsfy/DATABASE.md` cabe a `$specsfy-setup` no modo
   `database`.

## Fluxo

1. Leia [references/standards.md](references/standards.md) e descubra versão,
   topologia (standalone, réplica, shard), volume por coleção, tamanho médio do
   documento e padrão de leitura antes de recomendar.
2. Classifique o pedido: modeling para formato e validação, queries para índice
   e pipeline, operation para disponibilidade e recuperação.
3. Pergunte quais campos são lidos juntos e com que cardinalidade o array cresce.
   Essa resposta decide embed ou referência mais que preferência de estilo.
4. Escreva o índice a partir das consultas reais, na ordem igualdade, ordenação,
   faixa, e confirme no `explain` com `totalKeysExamined` e `totalDocsExamined`.
5. Confirme o efeito de write concern, read concern e transação na durabilidade
   e na latência antes de fechar a decisão.
6. Valide com as comprovações da seção Validação e entregue o texto para a spec
   com o limite conhecido registrado.

### Modo modeling

1. Liste as consultas e a frequência de cada uma. Documento é desenhado pelo
   acesso, não pela forma do formulário.
2. Embuta o que é lido junto e tem cardinalidade limitada; referencia o que
   cresce sem limite, é compartilhado entre agregados ou precisa de escrita
   concorrente própria.
3. Declare o limite do array e o que acontece quando ele estoura. Documento tem
   teto de 16 MB, e array sem limite é dívida que vence em produção.
4. Aplique `$jsonSchema` com `validationLevel` e `validationAction` escolhidos.
   Validação em `strict` rejeita documento fora do contrato na escrita.
5. Registre a versão do documento em campo próprio quando o formato evoluir, e
   descreva como as duas versões convivem. Padrões e exemplos em
   [references/modeling.md](references/modeling.md).

### Modo queries

1. Rode `explain("executionStats")` na consulta real e leia a árvore inteira
   de `winningPlan`, incluindo `queryPlan` no SBE, e compare
   `totalKeysExamined`, `totalDocsExamined`, `nReturned` e `executionTimeMillis`.
2. Compare `COLLSCAN` com `IXSCAN` e confirme se o índice cobre os campos
   filtrados e os ordenados.
3. Monte o composto pela regra equality, sort, range e confirme o prefixo usado
   em cada consulta.
4. Para agregação, antecipe `$match` quando o filtro permitir. Defina a
   projeção de saída, meça o `$lookup` e confira o índice estrangeiro em
   junções de igualdade.
5. Use `explain("executionStats").aggregate()` para o plano da agregação e
   `$indexStats` para medir o uso de índices. Sintaxe, regra ESR e armadilhas em
   [references/queries.md](references/queries.md).

### Modo operation

1. Confirme a topologia e o papel de cada membro antes de qualquer mudança.
2. Defina write concern e read concern por operação crítica, não por hábito
   global.
3. Escolha backup lógico ou snapshot consistente e teste a restauração em
   ambiente descartável.
4. Configure autenticação, TLS e privilégio mínimo de usuário por aplicação.
5. Atualize versão com `setFeatureCompatibilityVersion` controlado e rollback
   definido. Procedimento e comandos em
   [references/operation.md](references/operation.md).

## Padrões

- Coleção é desenhada pela consulta que a lê. Embutir tudo "porque é mais
  rápido" cria documento que estoura o limite e reescreve o registro inteiro em
  cada atualização.
- Array que cresce com o tempo (evento, log, histórico) não fica no documento
  principal. Vai para coleção própria ou para padrão bucket com limite explícito.
- Toda coleção de escrita da aplicação tem validador `$jsonSchema` com
  `validationAction: "error"` e `validationLevel: "strict"`, salvo coleção
  legada declarada.
- Ordem do índice composto segue equality, sort, range. Índice criado na ordem
  do formulário raramente serve à consulta.
- `explain("executionStats")` com `totalDocsExamined` muito acima de
  `nReturned` indica índice que filtra pouco. Corrija o índice antes de culpar o
  servidor.
- Índice multikey em array grande custa memória e escrita. Um índice por array
  consultado, não um por campo.
- Write concern `majority` em operação financeira ou de auditoria. `w: 1`
  confirma no primário e pode desaparecer em eleição.
- Transação é curta e limitada a poucos documentos. Modelo bom evita transação;
  usar transação para compensar documento mal desenhado paga latência e limite
  de tempo.
- Autenticação e TLS ligados em qualquer ambiente além do local. `mongod` sem
  `authorization` aceita qualquer cliente da rede.
- Topologia de produção tem três membros com dado. Arbiter não entra em
  produção como substituto de réplica com dado.

## Antipadrões

- `$lookup` usado para reconstruir uma relação que deveria estar embutida na
  leitura quente: cada documento faz uma consulta extra e o pipeline fica refém
  de índice em outra coleção.
- Array de eventos dentro do documento do cliente: cresce até passar de 16 MB e
  a escrita passa a reescrever o documento inteiro, com contenção no primário.
- `COLLSCAN` em consulta de caminho quente aprovado por "a coleção é pequena
  hoje": o volume cresce e o plano não muda.
- `$group` sem `$match` antes: agrega a coleção inteira e estoura o limite de
  memória do estágio.
- Transação de vários documentos usada como transação relacional para manter
  consistência entre coleções que deveriam ser uma só.
- `w: 1` em pagamento com failover no meio: o dado confirmado ao cliente não
  existe no novo primário.
- `mongoose` com `strict: false` e validação só no código: a escrita por outro
  caminho entra sem contrato.

## Validação

- `explain("executionStats")` antes e depois com dados representativos, com
  `totalKeysExamined`, `totalDocsExamined`, `nReturned` e
  `executionTimeMillis` anexados à spec.
- `db.collection.getIndexes()` e `$indexStats` confirmando índice usado e
  ausência de índice morto.
- Teste de validador: documento fora do contrato é rejeitado com o erro
  esperado, e documento legado aceito continua aceito pela `validationLevel`
  declarada.
- Teste de crescimento: o array respeita o limite e o fluxo que estoura tem
  caminho definido.
- Teste de eleição em réplica: meça a reconexão, confira as escritas
  confirmadas com o nível de persistência escolhido e reconcilie timeouts.
- Restauração cronometrada a partir do backup real, com contagem por coleção e
  validação de documento crítico.
- Não declare consulta rápida, dado íntegro ou operação recuperável sem essas
  evidências; adjetivo sem medição não vale como prova.

## Skills relacionadas

- `$specsfy-specialist-modeling` decide agregado e invariante antes do formato;
  este especialista materializa em documento, validador e índice.
- `$specsfy-specialist-architecture` define o contrato HTTP que o documento
  representa; a forma de armazenar não substitui o contrato público.
- `$specsfy-specialist-postgres` cobre o caso relacional com integridade
  referencial; escolher documento não elimina a necessidade de relação.
- `$specsfy-specialist-redis` cuida de cache e fila na frente da leitura; a
  coleção continua sendo a fonte de verdade.
- `$specsfy-specialist-docker` empacota e opera MongoDB em container, com volume
  e healthcheck; modelagem e índice continuam aqui.
- `$specsfy-specialist-observability` define métrica, alerta e SLO de banco;
  este especialista entrega o que medir no `serverStatus` e no `currentOp`.
- `$specsfy-specialist-application-security` define ameaça e autorização;
  usuário, role e TLS do MongoDB materializam a decisão.

Leia [references/standards.md](references/standards.md) para o índice dos modos,
as regras comuns e as fontes oficiais, [references/modeling.md](references/modeling.md)
para documento, embed, validação e evolução, [references/queries.md](references/queries.md)
para índice, explain e pipeline e [references/operation.md](references/operation.md)
para réplica, backup, transação e upgrade.
