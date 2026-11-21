---
name: specsfy-specialist-mysql
description: Modelar, consultar e operar MySQL com schema consistente, índices justificados pelo plano e operação recuperável. Use no modo schema para tipos, chave primária, índices compostos, charset utf8mb4, collation, constraints e DDL online; no modo queries para EXPLAIN, plano real, índice composto, locks InnoDB, isolation level, deadlock e consulta lenta; no modo operation para backup com mysqldump e XtraBackup, point-in-time recovery, replicação com GTID, upgrade 8.x e configuração do servidor. Não use para PostgreSQL (`$specsfy-specialist-postgres`), para decidir entidade e relação (`$specsfy-specialist-modeling`) nem para coordenar release e deploy (`$specsfy-specialist-delivery`).
---

# MySQL

Cobre o schema que sustenta a integridade, a consulta que o otimizador consegue
resolver e a operação que devolve o banco depois de uma falha. O modo schema
decide tipos, charset e índices; o modo queries lê o plano e o lock real; o modo
operation trata backup, replicação, upgrade e configuração.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Criar ou revisar tabela, escolher tipo, chave primária, índice composto, charset `utf8mb4`, collation, constraint ou DDL em tabela grande | schema | [Tipos, charset, índices e DDL](references/schema.md) |
| Consulta lenta, `EXPLAIN`, plano com `ALL`/`filesort`/`temporary`, lock esperando, deadlock, `innodb_lock_wait_timeout` ou escolha de isolation level | queries | [Plano, índices e concorrência InnoDB](references/queries.md) |
| Backup, restore, point-in-time recovery, réplica com GTID, upgrade de 8.0 para 8.4, parâmetro de servidor ou papel de privilégio | operation | [Backup, replicação, upgrade e configuração](references/operation.md) |

Não use para:

- PostgreSQL, `EXPLAIN (ANALYZE, BUFFERS)`, `jsonb`, `CREATE INDEX
  CONCURRENTLY` ou RLS. Use `$specsfy-specialist-postgres`.
- Decidir entidade, cardinalidade, invariante de domínio ou ciclo de vida do
  dado antes do schema. Use `$specsfy-specialist-modeling` e materialize a
  decisão aqui.
- Release, versionamento, deploy e rollback coordenados. Use
  `$specsfy-specialist-delivery`; este especialista entrega o schema, o plano e
  o procedimento de banco que a entrega consome.

Combine com `$specsfy-specialist-laravel` quando a origem for Eloquent ou
migration Laravel, com `$specsfy-specialist-redis` quando houver cache na frente
da consulta e com `$specsfy-specialist-observability` quando a latência
atravessar aplicação, rede e banco.

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a linha `| Especialistas |` da tabela de
   metadados, a subseção `#### Especialistas` em `### 8. Plano técnico` e a
   seção que a fase está escrevendo. Leia também `.specsfy/STACK.md`,
   `.specsfy/RULES.md` e `.specsfy/DATABASE.md`, porque toda decisão daqui
   altera dado persistido.
   - Fonte de entrada por fase: em `specsfy-02-backlog`, sem spec, leia e
     registre no item de `specs/backlog/`; em specify e validate, leia a spec
     aberta (linha `| Especialistas |`, subseção `#### Especialistas`, seção
     em escrita) e escreva nela; em `specsfy-06-implement`, siga a tarefa
     indicada. Só `specsfy-05-tasks` escreve a seção 14: aqui apenas se indica
     o que a tarefa deve prever, sem criar tarefa.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-mysql (schema)`, `(queries)` ou
   `(operation)`. Sem indicação, confirme primeiro que o banco é MySQL e qual
   versão responde em `SELECT VERSION()`.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Registre na spec o DDL com `ALGORITHM` e `LOCK`, o índice com o predicado que
   o justifica, o plano antes e depois, a política de backup e o RPO/RTO que a
   operação assume. A tarefa `[MIGRATION]` aponta o arquivo versionado, e
   `.specsfy/DATABASE.md` é atualizado pela skill `$specsfy-setup` no modo
   `database`.

## Fluxo

1. Leia [references/standards.md](references/standards.md) e descubra versão
   (`SELECT VERSION()`), engine das tabelas, `sql_mode`, charset e collation do
   servidor, volume por tabela e workload (OLTP, relatório, misto) antes de
   recomendar.
2. Classifique o pedido: schema para estrutura e integridade, queries para
   plano e concorrência, operation para disponibilidade e recuperação.
3. Modele a invariante com constraint (`NOT NULL`, `UNIQUE`, `CHECK`, FK) e
   tipo preciso. Validação só na aplicação aceita inconsistência por qualquer
   segundo caminho de escrita.
4. Meça a consulta com `EXPLAIN` e `EXPLAIN ANALYZE` sobre dados
   representativos. Tabela de desenvolvimento vazia não prova plano.
5. Confirme o custo de escrita e o lock do DDL antes de agendar: `ALGORITHM` e
   `LOCK` observados, tempo estimado pelo tamanho real, janela acordada.
6. Valide com as comprovações da seção Validação e só então entregue o texto
   para a spec, com o trade-off residual declarado.

### Modo schema

1. Escolha o tipo pelo valor real: inteiro sem sinal para contagem e
   identificador, `DECIMAL` para dinheiro, `DATETIME(6)` em UTC para instante,
   `VARBINARY(16)` para UUID quando a chave precisa nascer fora do banco.
2. Defina a chave primária pensando no índice clusterizado do InnoDB: chave
   estreita e crescente evita divisão de página e aumenta a densidade das
   secundárias, que carregam a chave primária.
3. Declare o charset na criação (`utf8mb4`) e a collation explicitamente, para
   que a tabela não herde um default diferente do servidor de produção.
4. Ordene o índice composto pelo uso real: igualdade primeiro, depois o que
   ordena, depois a faixa. Confirme o prefixo mais à esquerda que cada consulta
   usa antes de criar o índice.
5. Escolha o algoritmo de DDL e confirme o suporte na versão instalada. Detalhe
   de `INSTANT`, `INPLACE`, `COPY`, tamanho de chave e conversão de charset em
   [references/schema.md](references/schema.md).

### Modo queries

1. Leia `EXPLAIN` e depois `EXPLAIN ANALYZE` da consulta original, sem remover
   o `WHERE` que a aplicação usa.
2. Compare `type`, `key`, `rows`, `filtered` e as notas `Using index`,
   `Using where`, `Using temporary` e `Using filesort` com a cardinalidade real.
3. Ajuste o índice pelo predicado observado e repita a medição; não crie índice
   por coluna citada no `WHERE`.
4. Investigue lock e deadlock em `performance_schema.data_locks`,
   `data_lock_waits` e `SHOW ENGINE INNODB STATUS`, com a ordem de aquisição de
   lock dos dois caminhos de código.
5. Escolha o isolation level com a consequência declarada: `REPEATABLE READ`
   usa next-key lock e bloqueia inserção em faixa; `READ COMMITTED` remove gap
   lock e exige tratamento de leitura não repetível. Comandos e matriz em
   [references/queries.md](references/queries.md).

### Modo operation

1. Defina RPO e RTO antes de escolher ferramenta: `mysqldump` lógico,
   XtraBackup físico, binlog para point-in-time recovery.
2. Teste o restore em instância descartável com o mesmo volume e confira
   contagem e checksum das tabelas críticas.
3. Configure replicação com GTID, binlog em formato `ROW`, `server_id` único e
   monitoramento de atraso que não dependa só de `Seconds_Behind_Source`.
4. Planeje o upgrade pela trilha suportada, rode o verificador oficial e trate
   o que ele aponta antes de tocar produção. Passo a passo em
   [references/operation.md](references/operation.md).
5. Ajuste parâmetros por cálculo e por medição, não por receita copiada, e
   registre o valor anterior, o novo e o motivo.

## Padrões

- Toda tabela nasce com `utf8mb4` e collation explícita; `utf8`/`utf8mb3` não
  armazena emoji nem caractere de quatro bytes e não entra em schema novo.
- `DECIMAL(p,2)` ou inteiro em centavos para dinheiro. `FLOAT` e `DOUBLE` são
  aproximados e produzem diferença em soma e comparação.
- Instante real usa `DATETIME(6)` gravado em UTC; `TIMESTAMP` converte pelo fuso
  da sessão e tem faixa limitada, então só entra quando essa conversão é o
  comportamento desejado.
- Chave primária é `BIGINT UNSIGNED AUTO_INCREMENT` ou `VARBINARY(16)` para
  UUID. `CHAR(36)` como chave primária infla toda secundária do InnoDB.
- Índice composto segue a ordem de uso: igualdade, ordenação, faixa. Prefixo
  mais à esquerda que nenhuma consulta usa é índice morto que só custa escrita.
- Índice parcial não existe no MySQL: para subconjunto pequeno, use índice em
  coluna gerada com valor nulo no resto e filtre por `IS NOT NULL` quando o
  plano justificar.
- DDL em tabela grande declara `ALGORITHM` e `LOCK` e é validado antes em cópia
  com volume equivalente. `ALGORITHM=INSTANT` só vale para as operações que a
  versão suporta.
- Papéis separados: aplicação com `SELECT`/`INSERT`/`UPDATE`/`DELETE`, migration
  com DDL, relatório com leitura. A aplicação nunca conecta com usuário que pode
  `DROP TABLE`.
- Replicação usa GTID, `binlog_format=ROW` e `sync_binlog=1` quando a durabilidade
  importa. `STATEMENT` reproduz contexto de sessão de forma imprevisível.
- Backup é considerado existente só depois de um restore completo cronometrado.
  Contagem de arquivo no diretório não é prova de recuperação.

## Antipadrões

- Tabela em `utf8mb3` recebendo texto com emoji: o `INSERT` falha ou trunca,
  conforme `sql_mode`, e a correção exige conversão de charset na tabela
  inteira.
- `EXPLAIN` em tabela vazia aprovando índice que o otimizador ignora com
  cardinalidade real: o plano de produção é `ALL` e o índice só pesa na
  escrita.
- Índice em cada coluna do `WHERE` sem índice composto: o MySQL usa um índice
  por acesso na maioria dos casos e ainda paga manutenção em todos.
- Transação aberta enquanto espera chamada HTTP ou confirmação do usuário:
  segura lock, impede purge de versão antiga e multiplica deadlock.
- Paginação por `OFFSET` alto em tabela que cresce: o custo cresce com o
  deslocamento; prefira keyset por chave ordenada.
- `mysqldump` sem `--single-transaction` em tabela InnoDB: o dump sai
  inconsistente entre tabelas e não serve para recuperação pontual.
- Réplica promovida sem validar `read_only`, GTID executado e atraso real: a
  promoção perde transação que ainda não tinha chegado.

## Validação

- `EXPLAIN` e `EXPLAIN ANALYZE` antes e depois, com a mesma massa de dados e o
  mesmo predicado da aplicação; anexe `rows` e `filtered` comparados.
- Teste de charset com caractere de quatro bytes em `INSERT`, `SELECT`,
  `ORDER BY` e `LIKE`; confira `SHOW CREATE TABLE` e
  `information_schema.COLUMNS` com `utf8mb4`.
- Teste de constraint: cada `NOT NULL`, `UNIQUE`, `CHECK` e FK rejeita o valor
  inválido com o erro esperado.
- Teste de concorrência: dois writers simultâneos não violam a invariante e o
  deadlock reproduzido tem ordem de lock corrigida, não apenas exceção
  capturada.
- DDL medido em cópia com volume equivalente: `ALGORITHM`, `LOCK`, tempo e
  espaço em disco observados antes da janela de produção.
- Restore cronometrado a partir do backup real, com RTO medido e checksum das
  tabelas críticas conferido. Backup sem restore testado não é garantia.
- Não declare schema íntegro, consulta rápida ou operação recuperável sem a
  evidência acima; adjetivo sem medição não vale como prova.

## Skills relacionadas

- `$specsfy-specialist-modeling` decide entidade, relação e ciclo de vida antes
  do schema; este especialista materializa em tabela, tipo e constraint.
- `$specsfy-specialist-postgres` cobre o outro banco relacional; semântica de
  índice, lock e DDL não é transportável entre os dois.
- `$specsfy-specialist-laravel` define migration, Eloquent e transação na
  aplicação; a decisão de tipo, índice e plano continua aqui.
- `$specsfy-specialist-redis` cuida do cache na frente da consulta; o MySQL
  permanece a fonte de verdade que o cache não substitui.
- `$specsfy-specialist-docker` empacota e opera o servidor MySQL em container,
  incluindo volume e healthcheck; schema e plano continuam aqui.
- `$specsfy-specialist-observability` define métricas, alertas e SLO de banco;
  este especialista entrega o que medir e o limite que importa.
- `$specsfy-specialist-application-security` define ameaça e autorização;
  privilégio, TLS e usuário do banco materializam essa decisão.

Leia [references/standards.md](references/standards.md) para o índice dos modos,
as regras comuns e as fontes oficiais, [references/schema.md](references/schema.md)
para tipos, charset, índices e DDL, [references/queries.md](references/queries.md)
para plano, lock e isolation e [references/operation.md](references/operation.md)
para backup, replicação, upgrade e configuração.
