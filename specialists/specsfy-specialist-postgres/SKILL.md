---
name: specsfy-specialist-postgres
description: Modelar, consultar, migrar e operar PostgreSQL com integridade, índices, concorrência, segurança, performance e recuperação. Use para schemas, SQL, EXPLAIN, locks, isolation levels, migrations, roles, backup ou tuning em Postgres; não use para outro banco relacional sem confirmar a semântica específica, e não use para RLS/Auth/Realtime de Supabase — combine com `specsfy-specialist-supabase` nesse caso.
---

# PostgreSQL

## Quando usar

- Acionar para desenhar schema, escrever ou revisar SQL, escolher índice,
  analisar plano (`EXPLAIN`), diagnosticar lock/deadlock, planejar migration
  ou dimensionar backup/restore em Postgres.
- Acionar também quando um ORM (Eloquent, Prisma, Drizzle) gerar SQL
  ineficiente e a causa raiz for modelagem ou índice, não a API do ORM.
- Não acionar para escolhas específicas de Supabase (RLS, Auth, Realtime,
  Edge Functions): usar `$specsfy-specialist-supabase`, que aplica Postgres
  por baixo com essas camadas adicionais.
- Combinar com `$specsfy-specialist-laravel` quando o ponto de entrada for
  Eloquent e com `$specsfy-specialist-observability` quando o
  gargalo abranger além do banco (aplicação, rede, cache).

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a linha `| Especialistas |` da tabela de
   metadados, a subseção `#### Especialistas` em `### 8. Plano técnico` e a
   seção que a fase está escrevendo. Leia também `.specsfy/STACK.md`,
   `.specsfy/RULES.md` e, por tratar schema e dado persistido,
   `.specsfy/DATABASE.md`.
   - Fonte de entrada por fase: em `specsfy-02-backlog`, sem spec, leia e
     registre no item de `specs/backlog/`; em specify e validate, leia a spec
     aberta (linha `| Especialistas |`, subseção `#### Especialistas`, seção
     em escrita) e escreva nela; em `specsfy-06-implement`, siga a tarefa
     indicada. Só `specsfy-05-tasks` escreve a seção 14: aqui apenas se indica
     o que a tarefa deve prever, sem criar tarefa.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-postgres`. Sem indicação, confirme pelo
   "Quando usar" acima se o banco é Postgres e qual versão está instalada.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Leve schema, índice e plano real para a subseção `Migrations` da seção 8
   e para `### 9. Modelo de dados`, e mantenha `.specsfy/DATABASE.md`
   sincronizado pela skill `$specsfy-setup` no modo `database`.

## Fluxo

1. Descobrir versão do Postgres, extensões instaladas, volume atual,
   crescimento esperado, workload (OLTP, analítico, misto) e quem é o owner
   dos dados antes de recomendar.
2. Modelar invariantes com tipos precisos, `NOT NULL`, `CHECK`, `UNIQUE`,
   chaves estrangeiras e normalização adequada ao caso de uso.
3. Escrever a consulta mais simples que expressa a regra e medir o plano
   real com `EXPLAIN (ANALYZE, BUFFERS)` sobre dados representativos, nunca
   sobre uma tabela vazia ou de desenvolvimento.
4. Selecionar índice pelo workload observado (predicados do `WHERE`,
   `ORDER BY`, `JOIN`), nunca por "essa coluna é consultada" isoladamente.
5. Analisar isolation level, duração de transação, ordem de aquisição de
   locks e concorrência esperada sob a carga real.
6. Planejar a migration com compatibilidade entre a versão antiga e nova da
   aplicação durante o deploy, com um caminho de rollback testável.
7. Marcar a execução como `[MIGRATION]`, apontar o arquivo versionado, aplicar
   em uma base de teste e consultar o histórico do migrador antes de concluir.
8. Validar backup, restore, monitoramento e capacidade no ambiente alvo antes
   de declarar a mudança pronta para produção.

## Padrões

- Preferir constraint do banco (`NOT NULL`, `CHECK`, `UNIQUE`, FK, `EXCLUDE`)
  para toda invariante que sempre deve valer: validação só na aplicação
  permite dado inconsistente por qualquer segundo caminho de escrita.
- Evitar `SELECT *` em código de produção, tipos imprecisos (`text` para
  enum fechado, `float` para dinheiro) e índice redundante que duplica outro
  já existente com prefixo igual.
- Nunca adicionar índice sem ler padrão de escrita, tamanho da tabela,
  seletividade do predicado e o plano antes/depois: índice mal escolhido
  piora escrita sem acelerar leitura.
- Manter transação curta (evitar I/O externo, espera de usuário ou chamada de
  rede dentro dela) e ordem de aquisição de locks consistente entre todos os
  caminhos de código para evitar deadlock.
- Rodar `EXPLAIN (ANALYZE, BUFFERS)` somente em ambiente onde executar a
  consulta de verdade é seguro (não em produção sem `ROLLBACK`/replica).
- Aplicar expand/contract em mudança de schema incompatível ou em tabela de
  alto volume: nunca renomear/remover coluna lida em produção no mesmo passo
  que a adiciona.
- Conceder o menor privilégio necessário e separar papéis de migration
  (DDL), aplicação (DML) e leitura (`SELECT` apenas): a aplicação nunca
  conecta com um role que pode `DROP TABLE`.

## Antipadrões

- Índice criado por "essa coluna aparece no WHERE", ignorando seletividade:
  em coluna de baixa cardinalidade (booleano, status com poucos valores) o
  planner frequentemente prefere seq scan e o índice só custa em escrita.
- `ALTER TABLE ... ADD COLUMN ... NOT NULL DEFAULT` em versão antiga do
  Postgres (< 11) reescrevendo a tabela inteira sob lock. Em versões atuais
  isso é otimizado para `DEFAULT` constante, mas `DEFAULT` com função
  volátil ainda reescreve.
- Transação longa mantendo lock enquanto espera resposta de rede ou
  confirmação do usuário: impede o autovacuum de limpar tuplas mortas e
  aumenta bloat.
- Paginação por `OFFSET` grande em tabela que cresce: o custo cresce
  linearmente com o offset; preferir paginação por keyset (`WHERE id >
  :cursor ORDER BY id LIMIT :n`).
- Backup automatizado nunca restaurado: "temos backup" sem um restore
  completo testado é uma suposição não verificada, não uma garantia.

## Validação

- Testar integridade (constraints violadas geram erro esperado),
  concorrência (dois writers simultâneos não corrompem invariante) e as
  queries críticas do caminho quente.
- Comparar `EXPLAIN (ANALYZE, BUFFERS)` antes/depois com cardinalidade
  realista, não com a tabela vazia do ambiente de desenvolvimento.
- Estimar o lock e o tempo de rewrite de qualquer DDL contra o tamanho real
  da tabela em produção antes de agendar a janela de deploy.
- Conferir cada tarefa `[MIGRATION]` pelo arquivo, pelo comando de aplicação e
  pela consulta do histórico do migrador, todos registrados com saída zero.
- Provar restore periodicamente a partir do backup real, incluindo o tempo
  que o processo leva (RTO): backup sem restore testado não é uma garantia
  de recuperação.
- Não declarar uma mudança "sem impacto de performance" sem o plano
  comparado; não declarar um schema "íntegro" sem os testes de constraint e
  concorrência acima.

## Skills relacionadas

- `$specsfy-specialist-modeling` para entidades, relações e ciclo de vida
  antes dos detalhes específicos do Postgres.
- `$specsfy-specialist-application-security` define ameaça, autorização e
  isolamento que constraints, roles e RLS materializam no banco.
- `$specsfy-specialist-supabase` quando o Postgres for gerenciado por
  Supabase (RLS, Auth, Realtime, pooling específico).
- `$specsfy-specialist-laravel` quando o ponto de entrada for Eloquent e a
  correção precisar refletir em migration/model.
- `$specsfy-specialist-observability` quando o gargalo não se resolver só com
  índice/plano (rede, cache, aplicação) e para métricas e alertas de banco em
  produção (conexões, locks, replicação, lag).
- `$specsfy-specialist-redis` quando parte do estado consultado estiver em
  cache fora do banco: o Postgres continua sendo a fonte de verdade que o
  Redis nunca substitui.
- `$specsfy-specialist-docker` para empacotar e operar o servidor Postgres
  em container (imagem oficial, volume de dados, healthcheck): escolha de
  schema, índice e plano continuam aqui.
- `$specsfy-specialist-mysql` cobre o outro banco relacional quando o projeto
  usa MySQL ou Percona: semântica de índice, lock e DDL não é transportável
  entre os dois.
- `$specsfy-specialist-mongodb` cobre o caso de documento quando o dado
  relacional não serve; aqui permanece a integridade referencial do schema.
- `$specsfy-specialist-n8n` quando o Postgres guarda workflow, execução e
  credencial da instância n8n: o schema, o índice e a poda continuam aqui.

Leia [references/standards.md](references/standards.md) para tipos, índices,
concorrência, segurança, migrations, operação e fontes oficiais.
