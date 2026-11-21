# PostgreSQL

O especialista PostgreSQL orienta o agente no desenho de schemas, na escrita e
na revisão de SQL, na escolha de índices e no planejamento de migrations. As
recomendações partem do plano de execução medido com volume representativo.

## Quando usar

- Você vai desenhar um schema, escrever ou revisar SQL ou escolher um índice.
- Você precisa analisar um `EXPLAIN`, investigar locks e deadlocks, planejar
  uma migration ou dimensionar backup e restore.
- Um ORM como Eloquent, Prisma ou Drizzle gera SQL ineficiente por causa da
  modelagem ou dos índices.

Recursos próprios do Supabase, como RLS, Auth, Realtime e Edge Functions,
ficam com o especialista Supabase. Ele aplica o Postgres com essas camadas
adicionais.

## Como ele trabalha

1. Identifica a versão do Postgres, as extensões, o volume atual, o
   crescimento esperado, o tipo de carga e o responsável pelo banco.
2. Modela as invariantes com tipos precisos, `NOT NULL`, `CHECK`, `UNIQUE`,
   chaves estrangeiras e normalização adequada.
3. Escreve a consulta mais simples e mede o plano com
   `EXPLAIN (ANALYZE, BUFFERS)` sobre um volume representativo.
4. Escolhe índices pelos predicados de `WHERE`, `ORDER BY` e `JOIN` observados
   na carga.
5. Analisa o isolation level, a duração das transações e a ordem de
   aquisição de locks.
6. Planeja a migration com compatibilidade entre a versão antiga e a nova da
   aplicação e com um rollback testável.
7. Marca a execução como `[MIGRATION]`, aponta o arquivo versionado, aplica em
   uma base de teste e consulta o histórico do migrador.
8. Valida backup, restore, monitoramento e capacidade no ambiente alvo.

## Padrões aplicados

- Invariantes ficam em constraints do banco (`NOT NULL`, `CHECK`, `UNIQUE`,
  FK, `EXCLUDE`), porque a validação só na aplicação deixa passar outros
  caminhos de escrita.
- O código de produção evita `SELECT *`, `text` para enums fechados e `float`
  para valores monetários.
- Um índice novo depende do padrão de escrita, do tamanho da tabela, da
  seletividade e do plano medido antes e depois.
- Transações são curtas, sem chamadas de rede ou espera pelo cliente. Os locks
  seguem a mesma ordem em todos os caminhos de código.
- `EXPLAIN (ANALYZE, BUFFERS)` roda apenas em ambiente seguro, como uma réplica
  ou uma transação com `ROLLBACK`.
- Mudanças incompatíveis seguem expand e contract.
- Migrations, aplicação e leitura usam roles separados. A aplicação não
  conecta com um role capaz de executar `DROP TABLE`.

## Erros que ele evita

- Índice em coluna de baixa cardinalidade, como booleano ou status com poucos
  valores, que só encarece a escrita.
- `ADD COLUMN ... NOT NULL DEFAULT` com função volátil, que reescreve a tabela
  inteira sob lock.
- Transação longa esperando a rede ou o cliente, o que impede o autovacuum e
  aumenta o bloat.
- Paginação por `OFFSET` grande. A alternativa é a paginação por keyset
  (`WHERE id > :cursor ORDER BY id LIMIT :n`).
- Backup automático sem nenhum restore completo testado.

## Como conferir o resultado

- Testes de integridade mostram que constraints violadas geram o erro
  esperado.
- Testes de concorrência mostram que duas escritas simultâneas preservam as
  invariantes.
- `EXPLAIN (ANALYZE, BUFFERS)` foi comparado antes e depois com cardinalidade
  realista.
- O tempo de lock e de reescrita de cada DDL foi estimado com o tamanho real
  da tabela.
- Cada tarefa `[MIGRATION]` registra o arquivo, o comando de aplicação e a
  consulta do histórico, com saída zero.
- O restore foi provado a partir do backup real, com o tempo de recuperação
  medido.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-postgres --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Modelagem](modeling.md) define entidades, relações e ciclos de vida.
- [Segurança de Aplicações](application-security.md) define o isolamento que
  constraints, roles e RLS aplicam.
- [Supabase](supabase.md) entra quando o Postgres é gerenciado pelo Supabase.
- [Laravel](laravel.md) leva as correções para migrations e models.
- [Observabilidade](observability.md) entra quando o problema vai além de
  índice e plano e cuida de métricas de conexões, locks e replicação.
- [Redis](redis.md) guarda cache fora do banco, com o Postgres como fonte
  oficial.
- [Docker](docker.md) empacota e opera o servidor Postgres em container.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-postgres/SKILL.md),
com tipos, índices, concorrência e migrations no arquivo de referência da
mesma pasta.
