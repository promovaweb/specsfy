# MongoDB

O especialista MongoDB orienta o agente em três frentes. O modo **Modeling**
decide o formato do documento, quando embutir e quando referenciar, como conter
array que cresce e como validar o contrato com `$jsonSchema`. O modo **Queries**
lê o `explain`, monta índice pela regra equality, sort, range e ajusta pipeline
de agregação. O modo **Operação** cuida de replica set, eleição, write concern,
backup, transação e atualização de versão.

A regra que atravessa os três modos: o documento é desenhado pela consulta que o
lê, o índice é provado pelo `explain`, e a operação só vale depois de uma
restauração testada.

## Quando usar

- Você vai decidir entre embutir e referenciar, definir lista ou histórico
  dentro do documento ou criar validador com `$jsonSchema`.
- Um array dentro do documento cresceu e a escrita ficou lenta ou o documento
  se aproxima do limite de 16 MB.
- Você precisa interpretar `explain("executionStats")`, `totalDocsExamined`,
  `nReturned` e o estágio vencedor do plano.
- Uma agregação com `$lookup`, `$group` ou `$facet` está lenta ou estourando
  memória.
- Você vai configurar replica set, entender eleição, revisar write concern,
  montar backup ou executar transação multi-documento.
- Você precisa atualizar versão com `setFeatureCompatibilityVersion` controlado.

O agente confirma versão, topologia e volume por coleção antes de recomendar.
Na resposta de `hello`, `msg: "isdbgrid"` identifica um roteador `mongos`
e `setName` identifica o replica set de um membro. Instâncias standalone não
aceitam transações multi-documento. MongoDB 9.0 está disponível no Atlas Core.
A edição Atlas Infinite, que também roda a linha 9.x, está em prévia pública.

## No Specsfy

O especialista lê a spec e a tarefa indicadas pela fase. A fase registra a
conclusão, as dúvidas e as evidências na spec. A criação e a decomposição
das tarefas da seção 14 cabem a `specsfy-05-tasks`.

## Fluxo

1. Descobre versão, topologia, volume, tamanho médio do documento e as consultas
   reais com a frequência de cada uma.
2. Classifica o pedido em Modeling, Queries ou Operação e confirma o modo quando
   o trabalho atravessa mais de um.
3. Desenha o documento pelo acesso e declara o limite de crescimento de cada
   array.
4. Monta índice a partir da consulta e confirma no `explain` com massa
   representativa.
5. Define write concern e read concern por operação crítica, com a consequência
   de durabilidade e latência declarada.
6. Entrega à fase chamadora o índice, o validador e o procedimento de
   restauração para registro na spec.

## Modelagem

O modo Modeling define o formato que o banco carrega.

- Embutir o que é lido junto e tem cardinalidade limitada.
- Referenciar o que cresce sem limite, é compartilhado ou tem escrita
  concorrente própria.
- Histórico, evento e log vão para coleção própria ou padrão bucket com limite
  explícito.
- Escrita em um documento é atômica, e essa é a unidade de consistência antes de
  pensar em transação.
- `$jsonSchema` com `validationAction: "error"` e `validationLevel: "strict"`
  fecha o contrato da coleção de escrita.
- `additionalProperties: false` impede campo novo sem revisão.
- `schemaVersion` no documento permite conviver com duas versões durante a
  migração.
- Faça backfill em lotes limitados e preserve valores já preenchidos.
  Endureça o validador depois de medir a conformidade dos documentos legados.
- Unique simples permite uma única chave nula, compartilhada entre campo
  ausente e `null`. Use validador para campo obrigatório ou índice unique
  parcial para restringir a unicidade a valores do tipo escolhido.

As tabelas de decisão, o exemplo de bucket e o passo a passo de evolução estão
em
[modeling.md](../../../specialists/specsfy-specialist-mongodb/references/modeling.md).

## Queries

O modo Queries parte do plano real.

- Rode `explain("executionStats")` na consulta real. Leia a árvore do plano,
  inclusive `winningPlan.queryPlan` quando o motor SBE o retornar. Compare
  chaves e documentos examinados com a quantidade devolvida.
- `COLLSCAN` em coleção grande com filtro seletivo é índice ausente ou
  inaplicável.
- `SORT` indica ordenação explícita. Um índice composto pode fornecer a
  ordem do `sort` no mesmo sentido ou com todos os sentidos invertidos.
- Composto segue equality, sort, range. O prefixo mais à esquerda atende a
  consulta.
- O índice parcial pode atender consultas cujo predicado implica seu filtro,
  inclusive consultas mais restritivas. O TTL remove documentos em segundo
  plano, sem prazo máximo garantido.
- Multikey em array grande custa memória e escrita, e um composto com dois arrays
  é recusado.
- `$match` no início pode usar índice. Use `$project` para definir a saída,
  pois o otimizador normalmente já elimina campos dispensáveis.
- Índice no campo estrangeiro favorece a junção de igualdade com `$lookup`.
  Teste o pipeline com dados representativos e confira o uso de memória.

A matriz de tipos de índice, os exemplos de pipeline e o diagnóstico de índice
ignorado estão em
[queries.md](../../../specialists/specsfy-specialist-mongodb/references/queries.md).

## Operação

O modo Operação define como o conjunto volta depois de uma falha.

- Replica set de produção tem três membros com dado, em host ou zona distinta.
- Arbiter sustenta quorum e não protege dado.
- Dê ao cliente seeds alcançáveis e confira se ele resolve os nomes anunciados
  pelo replica set. `retryWrites=true` cobre escritas elegíveis e ainda pode
  devolver erro durante a eleição.
- Escolha a consistência por operação. A proteção de `w: "majority"`
  depende da maioria calculada e da persistência do conjunto. Um timeout
  pode ocorrer mesmo se a escrita tiver sido aplicada.
- `mongodump --oplog --gzip` exige dump completo de replica set, sem banco
  no caminho do URI. Restaure em destino isolado com `--oplogReplay --gzip`.
  Para migrar uma coleção, faça dump filtrado sem `--oplog`. Clusters
  sharded exigem backup coordenado.
- Capture dados e journal juntos no snapshot. Se usar `fsyncLock`,
  garanta a liberação do lock mesmo se o snapshot falhar.
- Para recuperar um ponto no tempo, combine uma base consistente anterior ao
  alvo com oplog contínuo até o corte. No Atlas, use Continuous Cloud Backup
  com retenção suficiente e valide a recuperação em destino isolado.
- Transação recebe `session` em cada operação e cabe no limite de tempo e de
  oplog.
- Autenticação, TLS e role por aplicação em qualquer ambiente compartilhado.
- No upgrade rolling, atualize os secundários primeiro, provoque nova
  eleição e atualize o antigo primário. Mantenha a FCV anterior durante
  a observação e confira as condições de downgrade antes de mudar a FCV.

Os comandos de réplica, backup, transação, segurança, upgrade e monitoramento
estão em
[operation.md](../../../specialists/specsfy-specialist-mongodb/references/operation.md).

## Padrões

- Modele documentos pelo acesso e declare o limite de crescimento dos arrays.
- Confirme cada índice com o plano da consulta que o motivou.
- Teste restauração e eleição antes de assumir a janela de recuperação.

## Antipadrões

- Array sem limite dentro do documento principal.
- `$lookup` no caminho quente para reconstruir relação que deveria ser embutida.
- `COLLSCAN` aprovado porque a coleção ainda é pequena.
- `$group` sem `$match` antes.
- Transação usada para compensar documento mal desenhado.
- `w: 1` em pagamento.
- Coleção sem validador e `strict: false` no ODM.
- Backup lógico de base grande tratado como recuperação rápida.
- Snapshot sem oplog tratado como recuperação pontual.
- `mongorestore --drop` em ambiente compartilhado sem confirmação.

## Validação

- `explain("executionStats")` antes e depois, com contagens e tempo anexados.
- `getIndexes()` para conferir os índices existentes e `accesses.ops`
  de `$indexStats` para medir o uso.
- Documento fora do contrato rejeitado pelo validador, com o erro esperado.
- `$bsonSize` medindo tamanho médio e máximo do documento.
- Teste de eleição com tempo de reconexão, conferência dos dados confirmados
  e tratamento de timeouts com resultado ambíguo.
- Restauração cronometrada com contagem por coleção.
- Transação abortada desfazendo todas as operações do mesmo `session`.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-mongodb --agent universal --copy --full-depth
```

## Skills relacionadas

- [Modelagem](modeling.md) decide agregado e invariante antes do formato.
- [Arquitetura](architecture.md) define o contrato HTTP que o documento
  representa.
- [PostgreSQL](postgres.md) cobre o caso relacional com integridade referencial.
- [Redis](redis.md) cuida de cache e fila na frente da leitura.
- [Docker](docker.md) empacota e opera MongoDB em container.
- [Observabilidade](observability.md) define métrica, alerta e SLO de banco.
- [Segurança de Aplicações](application-security.md) define ameaça e autorização
  que o usuário do banco materializa.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-mongodb/SKILL.md),
com o índice e as regras comuns em
[standards.md](../../../specialists/specsfy-specialist-mongodb/references/standards.md),
o documento em
[modeling.md](../../../specialists/specsfy-specialist-mongodb/references/modeling.md),
o índice e o pipeline em
[queries.md](../../../specialists/specsfy-specialist-mongodb/references/queries.md)
e a operação em
[operation.md](../../../specialists/specsfy-specialist-mongodb/references/operation.md).
