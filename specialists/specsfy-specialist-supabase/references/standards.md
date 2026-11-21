# Padrões e referências Supabase

Revisado em 2026-11-20 contra: docs oficiais do Supabase (API keys, Row Level Security, RLS performance, Realtime Authorization, conexão/pooling, migrations) e a referência do CLI v3 (`supabase db`, `supabase test`, `supabase gen types`).

## Row Level Security

- RLS é avaliada por linha, no Postgres, independente do cliente — a policy
  é a única barreira real quando a API é exposta diretamente ao browser.
- Padrão de policy por operação:

```sql
alter table public.orders enable row level security;
revoke all on table public.orders from anon, authenticated;
grant select, insert on table public.orders to authenticated;

create policy "select_own_orders"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "insert_own_orders"
  on public.orders for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
```

- `USING` filtra linhas visíveis/afetadas (`SELECT`, `UPDATE`, `DELETE`);
  `WITH CHECK` valida a linha resultante (`INSERT`, `UPDATE`). Uma policy de
  `UPDATE` precisa de `SELECT` correspondente para funcionar, e a combinação de
  `USING` (linha atual) com `WITH CHECK` (linha nova) impede mover o registro
  para outro dono.
- Escreva uma policy por operação (`select`, `insert`, `update`, `delete`) e
  nomeie o papel com `to authenticated`/`to anon`: `for all` esconde qual regra
  cobre cada operação e a policy sem `to` roda também para quem não deveria.
- Envolva `auth.uid()` e `auth.jwt()` em `(select …)` para o planner calcular o
  valor uma vez por statement (`initPlan`) em vez de por linha; vale para
  funções `security definer` que não dependem da linha.
- Indexe toda coluna usada por `USING`/`WITH CHECK` (ex.: `user_id`,
  `tenant_id`) — sem índice, cada linha avaliada pela policy é um scan. Em
  índice composto, a coluna do filtro precisa ser a primeira.
- `auth.uid()` devolve `null` sem sessão, e `null = user_id` nunca é verdade;
  quando a intenção é exigir sessão, escreva
  `auth.uid() is not null and auth.uid() = user_id`.
- Funções auxiliares de policy marcadas `SECURITY DEFINER` precisam de
  `SET search_path = ''` (ou schema totalmente qualificado) e ficam em schema
  não exposto (ex.: `private`), nunca em `public` acessível pela Data API.
- View sobre tabela protegida ignora RLS por padrão; crie com
  `with (security_invoker = true)` para herdar as policies de quem consulta.
- Duas policies que leem a tabela uma da outra geram
  `42P17 infinite recursion detected in policy`; quebre o ciclo com função
  `security definer` que lê a tabela de associação.
- Grants e policies se complementam: revogar o grant padrão de `anon` e
  `authenticated` na tabela nova evita caminho de escrita que nenhuma policy
  cobre. Falta de grant retorna `42501` antes da policy rodar.
- Multi-tenancy: derive `tenant_id` de uma fonte que o usuário não controla
  (claim de JWT emitida pelo servidor, tabela de membership), nunca de um
  campo que o próprio `INSERT`/`UPDATE` do cliente também escreve.

## Matriz de segurança (por recurso)

Para cada tabela/recurso exposto, registre explicitamente:

| Ator | Operação | Predicado de acesso | Origem do claim | Sem sessão (anon) | Teste negativo |
| --- | --- | --- | --- | --- | --- |
| `authenticated` | select | `auth.uid() = user_id` | JWT `sub` | negado | outro usuário não vê a linha |
| `service_role` | all | bypass RLS | chave de servidor | N/A | chave nunca chega ao cliente |

Grants (`GRANT SELECT/INSERT/...`) controlam acesso ao objeto (tabela/coluna);
policies controlam acesso à linha. Os dois precisam estar corretos — grant
sem policy restritiva expõe todas as linhas ao papel.

No vocabulário de chaves atual, `service_role` é o papel por trás da chave
secreta (`sb_secret_…`); as policies continuam sendo escritas para `anon` e
`authenticated`, porque a chave secreta não é usada em caminho que dependa de
RLS.

## Auth e claims

- `auth.uid()` vem do JWT validado pelo GoTrue; confiável para policy.
- Claims customizadas em `raw_app_meta_data` (definidas por processo de
  servidor/admin) são diferentes de `raw_user_meta_data` (editável pelo
  próprio usuário via client SDK) — nunca use a segunda como base de
  autorização.
- Chaves de API: a publicável (`sb_publishable_…`) vai para qualquer código que
  o usuário recebe e resolve para `anon` sem sessão ou `authenticated` com
  sessão; a secreta (`sb_secret_…`) resolve para `service_role`, ignora RLS e
  roda só em servidor, Edge Function ou job controlado. As chaves JWT `anon` e
  `service_role` são legadas e têm descontinuação anunciada para o fim de 2026.
- Chave secreta melhora o controle em relação ao JWT antigo: o navegador é
  recusado com `401`, o segredo pode ser rotacionado por componente e uma
  requisição que carregue token de usuário continua sujeita à RLS daquele
  usuário, mesmo com cliente inicializado pela chave secreta.

## Storage e Realtime

- Bucket público serve qualquer objeto por URL sem checar sessão — use
  apenas para ativos verdadeiramente públicos; para o resto, bucket privado
  com policy de Storage (mesma sintaxe RLS, na tabela `storage.objects`).
- Postgres Changes respeita a RLS da tabela: o registro só é enviado a quem
  pode lê-lo. Broadcast e Presence usam Realtime Authorization, com policies
  na tabela `realtime.messages` (select para receber, insert para publicar) e
  canais criados no cliente com `config: { private: true }`.
- As policies de canal são avaliadas na conexão e em cada envio de novo JWT;
  revogar acesso de um usuário conectado só vale quando o token é renovado ou
  expira, então mantenha janela de expiração curta.
- O schema `realtime` é bloqueado para DDL: não rode
  `alter table realtime.messages enable row level security` (a RLS já está
  ligada e o comando falha com `42501 must be owner of table messages`).
- Realtime não substitui autorização de aplicação: uma subscription filtra por
  `tenant_id` no cliente apenas reduz tráfego; a policy é o que impede a
  entrega.

## Conexão e pooling

- Conexão direta (`db.<ref>.supabase.co:5432`): poucas conexões persistentes,
  suporta `LISTEN/NOTIFY`, `PREPARE` e estado de sessão; adequada para
  migrations, `pg_dump`, workers de longa duração. Fica em IPv6, ou IPv4 com o
  add-on de IPv4.
- Session pool do pooler compartilhado (Supavisor, porta 5432, usuário
  `postgres.<ref>`): compatível com a maioria dos recursos do driver, conexão
  dedicada durante a sessão do cliente; é o caminho em rede IPv4-only.
- Transaction pool (porta 6543): alta concorrência (serverless, edge), mas sem
  `PREPARE`, cursores que sobrevivem à transação, estado de sessão
  (`set`, advisory locks de sessão, `listen`/`notify`) nem pipeline de queries.
  Escolha o modo pelo driver e pela carga, não por padrão.
- Plano Pro e acima têm pooler dedicado PgBouncer na mesma máquina do banco,
  em modo transaction, com suporte a prepared statements em PgBouncer 1.21+.
- No cliente serverless, pool de 1 conexão por instância, prepared statements
  desligados no modo transaction e SSL `require` (ou `verify-full` com o
  certificado do projeto) são o ponto de partida.

## Padrões operacionais

- Desenvolvimento local (`supabase start`) e migrations como código
  (`supabase migration new`, `supabase migration up`). `supabase db diff -f
  <nome>` compara o banco local com as migrations e grava a diferença; o motor
  `pg-delta` é o padrão e arquivos declarativos em `supabase/schemas/` só geram
  migration por `supabase db schema declarative sync`.
- `supabase db reset` reaplica migrations e `supabase/seed.sql`; `supabase db
  push --remote` publica no projeto vinculado. Nunca altere o banco remoto pelo
  dashboard: isso diverge do histórico e quebra o `db push`; para corrigir o
  histórico use `supabase migration repair`.
- `supabase test new <tabela>_rls` cria o arquivo pgTAP em `supabase/tests/` e
  `supabase test db` executa. Provar acesso permitido com `results_eq` e
  `returning`, acesso negado por grant com `throws_ok` (`42501`) e negado por
  policy com `is_empty`.
- `supabase db lint` roda `plpgsql_check`, `supabase db advisors` aponta RLS
  ausente, FK sem índice e `auth.users` exposto. CLI v3 usa `--remote` para o
  projeto vinculado; `--linked`, `--project-ref` e `--local` estão
  descontinuados e saem na v4.
- Gerar tipos (`supabase gen types --remote`) após toda mudança de schema e
  falhar o CI quando o arquivo gerado divergir do schema atual.
- Isolar toda operação privilegiada (uso da chave secreta, bypass de RLS)
  em backend controlado e auditável — nunca em função executada pelo
  cliente.

## Fontes oficiais

- Visão geral: https://supabase.com/docs
- Chaves de API (publishable/secret e legadas): https://supabase.com/docs/guides/api/api-keys
- Banco: https://supabase.com/docs/guides/database/overview
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Desempenho de RLS: https://supabase.com/docs/guides/database/postgres/row-level-security-performance
- Auth: https://supabase.com/docs/guides/auth
- Server-side/claims: https://supabase.com/docs/guides/auth/server-side/advanced-guide
- Desenvolvimento local: https://supabase.com/docs/guides/local-development
- Migrations e diff engines: https://supabase.com/docs/guides/deployment/database-migrations
- Schemas declarativos: https://supabase.com/docs/guides/local-development/declarative-database-schemas
- Testes pgTAP: https://supabase.com/docs/guides/database/testing
- Storage: https://supabase.com/docs/guides/storage
- Realtime: https://supabase.com/docs/guides/realtime
- Realtime Authorization: https://supabase.com/docs/guides/realtime/authorization
- Edge Functions: https://supabase.com/docs/guides/functions
- Connection pooling (Supavisor): https://supabase.com/docs/guides/database/connecting-to-postgres
- Referência do CLI: https://supabase.com/docs/reference/cli/introduction
