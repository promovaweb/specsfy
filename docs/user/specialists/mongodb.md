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
Standalone não aceita transação multi-documento, e `mongos` muda o plano, então a
topologia faz parte da resposta.

## Como ele trabalha

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
6. Entrega o texto para a spec com o índice, o validador e o procedimento de
   restauração.

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
- Validador rejeita documento novo; não corrige o antigo. Faça backfill antes de
  endurecer a regra.

As tabelas de decisão, o exemplo de bucket e o passo a passo de evolução estão
em
[modeling.md](../../../specialists/specsfy-specialist-mongodb/references/modeling.md).

## Queries

O modo Queries parte do plano real.

- `explain("executionStats")` na consulta real. `totalDocsExamined` próximo de
  `nReturned` indica índice seletivo.
- `COLLSCAN` em coleção grande com filtro seletivo é índice ausente ou
  inaplicável.
- `SORT` no plano é ordenação em memória. Índice na ordem do `sort` elimina o
  estágio.
- Composto segue equality, sort, range. O prefixo mais à esquerda atende a
  consulta.
- Índice parcial só serve quando a consulta inclui o mesmo predicado.
- Multikey em array grande custa memória e escrita, e um composto com dois arrays
  é recusado.
- `$match` e `$project` cedo no pipeline usam índice e reduzem documento
  carregado.
- `$lookup` exige índice na coleção estrangeira. `allowDiskUse` evita erro, mas
  esconde pipeline que deveria ser reescrito.

A matriz de tipos de índice, os exemplos de pipeline e o diagnóstico de índice
ignorado estão em
[queries.md](../../../specialists/specsfy-specialist-mongodb/references/queries.md).

## Operação

O modo Operação define como o conjunto volta depois de uma falha.

- Replica set de produção tem três membros com dado, em host ou zona distinta.
- Arbiter sustenta quorum e não protege dado.
- Driver com `retryWrites=true` e URI com todos os membros trata eleição sem
  erro para o usuário.
- `w: "majority"` em operação financeira ou de auditoria. `w: 1` pode desaparecer
  em failover.
- `mongodump --oplog` serve base pequena e restauração pontual. Snapshot de
  volume serve base grande.
- `fsyncLock` bloqueia escrita apenas durante o snapshot, não durante a cópia.
- Ponto no tempo depende de oplog retido por mais tempo que a janela declarada
  de recuperação.
- Transação recebe `session` em cada operação e cabe no limite de tempo e de
  oplog.
- Autenticação, TLS e role por aplicação em qualquer ambiente compartilhado.
- Upgrade atualiza secundário, depois primário, e só então sobe a
  `featureCompatibilityVersion`.

Os comandos de réplica, backup, transação, segurança, upgrade e monitoramento
estão em
[operation.md](../../../specialists/specsfy-specialist-mongodb/references/operation.md).

## Erros que ele evita

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

## Como conferir o resultado

- `explain("executionStats")` antes e depois, com contagens e tempo anexados.
- `getIndexes()` e `$indexStats` confirmando índice usado.
- Documento fora do contrato rejeitado pelo validador, com o erro esperado.
- `$bsonSize` medindo tamanho médio e máximo do documento.
- Teste de eleição com reconexão da aplicação e nenhuma perda em `majority`.
- Restauração cronometrada com contagem por coleção.
- Transação abortada desfazendo todas as operações do mesmo `session`.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-mongodb --agent universal --copy --full-depth
```

## Especialistas relacionados

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
