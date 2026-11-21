# Réplica, backup, transação e upgrade

## Replica set

Inicie os três `mongod` com `replication.replSetName: rs0`, interfaces de rede
compatíveis com os hostnames abaixo e a configuração de segurança deste
guia. Execute `rs.initiate()` uma vez, em um dos membros. Aguarde a eleição
antes de consultar o estado.

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

A eleição depende da topologia, da comunicação entre membros e de
`electionTimeoutMillis` (10 s por padrão). Teste o tempo que a aplicação
leva para voltar a operar.

```text
mongodb://db0.example.com,db1.example.com,db2.example.com/app?replicaSet=rs0&authSource=app&tls=true&retryWrites=true&w=majority
```

- Use ao menos um seed alcançável. Mais seeds melhoram o bootstrap se um
  estiver fora. O cliente precisa resolver e alcançar os hosts anunciados
  por `rs.conf()`. Forneça as credenciais e a CA pelo cliente.
- `directConnection=true` força conexão a um membro e desliga a descoberta.
  Use-o para diagnóstico de um membro específico.
- `retryWrites=true` cobre escritas elegíveis. A duração da eleição e os
  limites do driver ainda podem levar a erro visível na aplicação.
- `w: "majority"` exige a maioria calculada da topologia. A proteção depende
  dos membros votantes com dados e da persistência do journal. `w: 1` pode
  sofrer rollback após failover. Escolha write concern, read concern e read
  preference para cada operação crítica.
- Timeout de write concern deixa resultado ambíguo: a escrita pode ter sido
  aplicada e ainda vir a ser replicada. Reconcilie pelo identificador da
  operação antes de reenviar um pedido de negócio.

## Backup lógico

Com Database Tools compatíveis, defina `MONGO_BACKUP_URI` sem banco no caminho
e com `authSource` explícito. Exemplo de endereço para a conta de backup
criada em `admin`:
`mongodb://db0.example.com,db1.example.com,db2.example.com/?replicaSet=rs0&authSource=admin&tls=true`.
Defina também `MONGO_BACKUP_USER` e `MONGO_RESTORE_USER` com as contas
provisionadas para cada operação. Os comandos pedem senha no prompt. Configure
a confiança na CA do servidor se ela não estiver no sistema (Database Tools
aceita `--sslCAFile` em ambos os comandos). Use diretórios de backup novos.

Para uma cópia lógica consistente do replica set, faça o dump completo de um
membro e reaplique as operações ocorridas durante o dump. Aponte
`MONGO_RECOVERY_URI` para um destino isolado e vazio, também sem banco no
caminho, com `authSource` correto e versão ou FCV compatível:

```bash
mongodump --uri "${MONGO_BACKUP_URI:?Informe a origem}" \
  --username "${MONGO_BACKUP_USER:?Informe a conta de backup}" \
  --oplog --gzip --out=/backup/replica &&
  mongorestore --uri "${MONGO_RECOVERY_URI:?Informe o destino isolado}" \
    --username "${MONGO_RESTORE_USER:?Informe a conta de restauração}" \
    --oplogReplay --gzip --stopOnError /backup/replica
```

Use a role `backup` na origem. Para `--oplogReplay`, o manual exige uma
role personalizada com `anyAction` em `anyResource`. Conceda-a somente à
conta de restauração no destino isolado e revogue-a ao terminar.

Suspenda operações incompatíveis durante o dump, como renomear coleções, e
verifique se a janela do oplog cobre toda a sua duração. Confira contagens,
índices e documentos críticos após restaurar. Para migrar apenas uma coleção,
use outro dump, sem captura ou reaplicação de oplog, e restaure em destino sem
a coleção:

```bash
mongodump --uri "${MONGO_BACKUP_URI:?Informe a origem}" \
  --username "${MONGO_BACKUP_USER:?Informe a conta de backup}" \
  --db app --collection customer --gzip --out=/backup/customer &&
  mongorestore --uri "${MONGO_RECOVERY_URI:?Informe o destino isolado}" \
    --username "${MONGO_RESTORE_USER:?Informe a conta de restauração}" \
    --nsInclude='app.customer' --gzip --stopOnError /backup/customer
```

Em cluster sharded, use o [procedimento de backup para clusters sharded](https://www.mongodb.com/docs/manual/administration/backup-sharded-clusters/),
que coordena shards e config servers, ou use backup gerenciado compatível.
A dupla `--oplog` e `--oplogReplay` acima é para replica set.

## Snapshot consistente

Capture dados e journal do mesmo ponto consistente. Siga as condições de
snapshot da engine e do storage. Quando precisar de `fsyncLock`, coordene uma
sessão administrativa no membro escolhido: faça flush e bloqueie escrita,
tire o snapshot e garanta `db.fsyncUnlock()` em um bloco de limpeza mesmo se
o snapshot falhar. Confirme que o lock foi liberado. Faça a cópia a partir do
snapshot depois de desbloquear. Outra opção é parar um secundário, capturar
todos os volumes relevantes e religá-lo.

## Ponto no tempo

1. Para recuperação gerenciada, habilite backup contínuo e confirme a janela
   disponível. No Atlas, escolha o ponto anterior ao incidente em
   [Continuous Cloud Backup](https://www.mongodb.com/docs/atlas/backup/cloud-backup/restore-overview/)
   e restaure em um cluster isolado. O serviço combina snapshot e oplog
   contínuo.
2. No autogerenciado, use uma base consistente anterior ao ponto desejado e
   uma cadeia de oplog contínua e compatível, da base até o alvo. Use uma
   ferramenta de backup e replay que suporte sua versão e topologia. Confira
   lacunas, a janela de recuperação e o limite de transação no ponto de corte.
3. Valide documentos, contagens e transações imediatamente antes e depois do
   ponto escolhido antes de redirecionar a aplicação.

`--oplogLimit` só limita a reaplicação. Escritas já presentes nos BSON do
dump permanecem. `mongorestore` restaura arquivos do dump, portanto a receita
de dump acima não serve para aplicar oplog sobre um snapshot de volume.

## Transações

Exemplo para driver Node.js. Use um `MongoClient` já conectado a um replica
set ou cluster sharded e uma coleção `app.accounts` com contas de IDs
`"a"` e `"b"`, com `balance` numérico em centavos:

```javascript
async function transfer100Cents(client) {
  const accounts = client.db("app").collection("accounts");
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const debit = await accounts.updateOne(
        { _id: "a", balance: { $gte: 100 } },
        { $inc: { balance: -100 } },
        { session }
      );
      if (debit.matchedCount !== 1 || debit.modifiedCount !== 1) {
        throw new Error("Conta de origem ausente ou saldo insuficiente");
      }

      const credit = await accounts.updateOne(
        { _id: "b", balance: { $type: "number" } },
        { $inc: { balance: 100 } },
        { session }
      );
      if (credit.matchedCount !== 1 || credit.modifiedCount !== 1) {
        throw new Error("Conta de destino ausente ou inválida");
      }
    }, {
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" }
    });
  } finally {
    await session.endSession();
  }
}
```

- Passe a mesma `session` em cada operação. Se o crédito falhar, a exceção
  aborta a transação com o débito.
- O driver pode repetir o callback em erro transitório e retentar um commit
  com resultado desconhecido. Mantenha chamadas externas fora do callback.
  Para deduplicar reenvios do pedido pela aplicação, registre uma chave
  única do pedido na mesma transação e reconcilie-a antes de repetir.
- O limite de tempo padrão é 60 segundos (`transactionLifetimeLimitSeconds`).
  Cada entrada de oplog tem limite de 16 MiB.
- Crie coleção e índices antes da transação. Use transação para invariantes
  que atravessam documentos.

## Segurança

Exemplo de configuração do `mongod` em replica set com autenticação interna
por keyfile. Distribua a mesma chave aos membros com permissões restritas.
Cada membro usa seu certificado e chave PEM, com nomes compatíveis com os
anunciados pelo replica set. Ajuste os caminhos aos arquivos provisionados:

```yaml
security:
  authorization: enabled
  keyFile: /etc/mongodb/replica.key
net:
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/mongodb/member.pem
    CAFile: /etc/mongodb/ca.pem
    allowConnectionsWithoutCertificates: true
replication:
  replSetName: rs0
```

O último parâmetro permite clientes SCRAM sem certificado próprio; TLS
continua obrigatório. Em linha de comando, o modo é `--tlsMode requireTLS`.
Distribua a CA aos clientes e confira hostname e cadeia TLS.

Em uma sessão administrativa no primário, crie a conta no banco `app`:

```javascript
db.getSiblingDB("app").createUser({
  user: "app",
  pwd: passwordPrompt(),
  mechanisms: ["SCRAM-SHA-256"],
  roles: [
    { role: "readWrite", db: "app" },
    { role: "read", db: "reporting" }
  ]
});
```

Conecte como `app` com `authSource=app`, como no URI da seção de eleição.
Confira `db.getSiblingDB("app").getUser("app")` como administrador e teste
os privilégios efetivos da aplicação com a conta criada.

## Upgrade

Exemplo para replica set autogerenciado de 8.3 para 9.0.

1. Teste a restauração, confirme compatibilidade do driver e confira os
   [pré-requisitos oficiais](https://www.mongodb.com/docs/manual/release-notes/9.0-upgrade-replica-set/),
   incluindo FCV 8.3 e estado saudável dos membros.
2. Atualize os secundários um por vez. Espere cada membro voltar a
   `SECONDARY` e alcançar a replicação antes de passar ao próximo.
3. Faça `rs.stepDown()` no primário, espere a eleição e atualize o antigo
   primário. Valide `rs.status()`, replicação e a aplicação.
4. Mantenha FCV 8.3 durante a observação. Confira as limitações de downgrade
   da edição e da versão, inclusive recursos incompatíveis gravados em
   disco. Planeje restauração se downgrade não estiver disponível.
5. Quando todos os binários estiverem em 9.0, houver maioria disponível e
   nenhuma sincronização inicial estiver em andamento, execute no primário:

```javascript
db.adminCommand({ setFeatureCompatibilityVersion: "9.0", confirm: true });
db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 });
```

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
