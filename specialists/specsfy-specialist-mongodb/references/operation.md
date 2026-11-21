# Réplica, backup, transação e upgrade

## Replica set

```javascript
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "db0.example.com:27017", priority: 2 },
    { _id: 1, host: "db1.example.com:27017", priority: 1 },
    { _id: 2, host: "db2.example.com:27017", priority: 1 }
  ]
});

rs.status();
rs.conf();
db.hello();
```

- Três membros com dado, em host ou zona distinta, sustentam quorum e mantêm
  disponibilidade com um membro fora.
- Arbiter vota e não guarda dado. Não aumenta capacidade de leitura nem protege
  contra perda.
- `priority` maior no membro preferido para primário. `0` impede promoção, usado
  em membro de relatório ou de recuperação.
- `hidden: true` e `priority: 0` para cópia de backup que não serve leitura de
  aplicação.
- `tags` e read preference por tag distribuídos por região ou função.

## Eleição e reconexão

- Sem primário, os membros elegíveis votam e um assume em poucos segundos. O
  tempo depende de `electionTimeoutMillis` (10 s por padrão).
- Driver com `retryWrites=true` repete a escrita em erro transitório de eleição.
  Sem isso, a aplicação recebe erro e precisa tratar.
- Conexão precisa listar todos os membros no URI e o nome do replica set:

```text
mongodb://db0,db1,db2/app?replicaSet=rs0&retryWrites=true&w=majority
```

- `directConnection=true` só para diagnóstico de membro específico; em produção
  ele desliga a descoberta de topologia.
- `w: "majority"` confirma em maioria. Escrita confirmada com `w: 1` pode
  desaparecer se o primário cair antes de replicar.
- `wtimeout` evita espera infinita: erro de timeout não significa que a escrita
  não aconteceu, então a operação precisa ser idempotente.

## Backup lógico

```bash
mongodump --uri="mongodb://db0,db1,db2/app?replicaSet=rs0" \
  --oplog --gzip --out=/backup/2026-11-20

mongorestore --uri="mongodb://localhost:27017" \
  --oplogReplay --gzip /backup/2026-11-20
```

- `--oplog` grava as operações do período do dump e permite restaurar um ponto
  consistente em replica set.
- `--gzip` reduz disco e tempo de transferência com custo de CPU.
- `--nsInclude` e `--nsExclude` para recorte por coleção em base grande.
- `mongorestore --drop` remove a coleção antes de restaurar. Em ambiente
  compartilhado, isso apaga dado que não estava no dump.
- Backup lógico é lento em base grande e reconstrói índice na restauração.

## Snapshot consistente

```javascript
db.fsyncLock();
// snapshot do volume neste instante
db.fsyncUnlock();
```

- `fsyncLock` força flush e bloqueia escrita. O bloqueio dura o tempo do
  snapshot, não o da cópia do volume.
- Alternativa em réplica: parar um membro secundário, tirar snapshot e religar.
- Snapshot de volume guarda arquivo consistente, mas não guarda oplog por si. A
  janela de recuperação é a do oplog retido.
- Backup gerenciado (Atlas, Ops Manager) combina snapshot com oplog contínuo e
  entrega restauração pontual. Confirme a retenção contratada.

## Ponto no tempo

1. Restaure o snapshot ou o dump na instância de recuperação.
2. Aplique oplog até o instante anterior ao incidente:

```bash
mongorestore --uri="mongodb://localhost:27017" \
  --oplogReplay --oplogLimit "1795000000:1" /backup/2026-11-20
```

3. Valide documento e contagem antes de redirecionar a aplicação.
4. Retenção do oplog precisa cobrir a janela declarada de recuperação. Oplog
   curto limita o RPO real, independentemente do tamanho do snapshot.

## Transações

```javascript
const session = client.startSession();
try {
  await session.withTransaction(async () => {
    await accounts.updateOne(
      { _id: "a" }, { $inc: { balance: -100 } }, { session }
    );
    await accounts.updateOne(
      { _id: "b" }, { $inc: { balance: 100 } }, { session }
    );
  }, {
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" }
  });
} finally {
  await session.endSession();
}
```

- Toda operação dentro da transação recebe `session`. Operação sem `session` roda
  fora e não é desfeita no abort.
- `withTransaction` do driver repete em erro transitório. A transação precisa ser
  idempotente para suportar repetição.
- Limite de tempo padrão é 60 segundos (`transactionLifetimeLimitSeconds`), e
  cada entrada de oplog tem limite de 16 MB. Transação longa falha.
- Leitura dentro da transação usa `snapshot`; leitura de dado que muda por fora
  pode gerar conflito e abort.
- Crie coleção e índice fora da transação quando possível. Criação implícita
  dentro de transação tem restrição de versão.
- Prefira modelo que não precise de transação. Transação é recurso para
  invariante que atravessa documentos, não para compensar desenho.

## Segurança

```javascript
db.createUser({
  user: "app",
  pwd: passwordPrompt(),
  roles: [
    { role: "readWrite", db: "app" },
    { role: "read", db: "reporting" }
  ]
});
```

- `authorization: enabled` e `security.keyFile` ou x.509 entre membros do replica
  set.
- TLS com `tlsMode: requireTLS` e certificado válido. Tráfego entre membros
  também criptografado.
- Role por aplicação. `root` em aplicação transforma qualquer injeção em perda
  total.
- `SCRAM-SHA-256` como mecanismo padrão; usuário antigo de mecanismo fraco é
  dívida de segurança.
- Autenticação não substitui autorização: confira `db.getUser()` e o privilégio
  efetivo antes de liberar.

## Upgrade

1. Faça backup e teste a restauração.
2. Confirme driver compatível com a versão de destino.
3. Atualize secundários um por vez, com `rs.stepDown()` no primário antes de
   atualizar o membro que vai assumir.
4. Atualize o primário depois da eleição e confirme `rs.status()` saudável.
5. Só então suba `featureCompatibilityVersion`:

```javascript
db.adminCommand({ setFeatureCompatibilityVersion: "8.0", confirm: true });
db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 });
```

6. Deixe a FCV na versão anterior durante a janela de convivência entre versões
   de binário, e suba quando o rollback não for mais necessário.
7. Rollback de FCV é permitido na direção suportada e tem consequência em índice
   e tipo novo. Confirme antes, não depois.

## Monitoramento mínimo

```javascript
db.serverStatus().connections;
db.serverStatus().opcounters;
db.serverStatus().wiredTiger.cache;
db.currentOp({ active: true, secs_running: { $gt: 5 } });
rs.printReplicationInfo();
rs.printSecondaryReplicationInfo();
```

- Conexões próximas do limite e fila de espera indicam pool ou vazamento.
- `opcounters` crescendo sem latência cair pode ser retry em laço.
- Cache do WiredTiger com página suja alta e eviction frequente indica memória
  insuficiente para o working set.
- Atraso de replicação medido por `optimeDate` e por heartbeat próprio; a
  diferença entre os dois é o que decide alerta.
- `currentOp` com operação acima de 5 segundos em caminho transacional é
  candidato a índice ausente.
