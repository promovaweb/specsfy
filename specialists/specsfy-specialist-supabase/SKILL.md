---
name: specsfy-specialist-supabase
description: Projetar, implementar e revisar soluções Supabase — Postgres, Auth, Row Level Security, Storage, Realtime, Edge Functions e ambiente local. Use quando houver `supabase/config.toml`, migrations Supabase ou clientes `@supabase/*`; não use como substituto de análise Postgres profunda de schema/índice/plano — combine com `specsfy-specialist-postgres` para isso.
---

# Supabase

## Quando usar

- Acionar quando o projeto tem `supabase/config.toml`, migrations em
  `supabase/migrations/`, ou clientes `@supabase/supabase-js` e a tarefa
  envolve RLS, Auth, Storage, Realtime, Edge Functions ou ambiente local
  Supabase (`supabase start`).
- Acionar também para revisão de política de acesso, policy RLS ausente ou
  incorreta, ou exposição indevida de `service_role`.
- Não acionar para tuning puro de índice/plano/isolation do Postgres
  subjacente sem o contexto Supabase — usar `$specsfy-specialist-postgres`
  e trazer o resultado de volta para as policies.
- Combinar com `$specsfy-specialist-application-security` quando a revisão
  envolver JWT, claims customizadas ou superfícies de autorização fora do
  banco.

## Fluxo

1. Identificar SDK usado (`@supabase/supabase-js`, `ssr`, framework
   específico), projeto, schemas expostos via API, migrations existentes e
   estratégia de ambientes (local, preview, produção).
2. Mapear identidades, tenants, papéis (`anon`, `authenticated`, papéis
   customizados) e a origem de cada claim usada em decisão de acesso
   (`auth.uid()`, `auth.jwt()`, metadata).
3. Modelar tabelas, funções e views no Postgres primeiro — a API REST/
   GraphQL e os tipos gerados são derivados do schema, não o contrário.
4. Definir privilégios (`GRANT`) para o objeto e políticas RLS para cada
   operação (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) e papel, negando por
   padrão.
5. Implementar a migration versionada e testar com usuários representativos
   de cada papel, incluindo o caso sem sessão (`anon`).
6. Validar Auth, Storage, Realtime ou Edge Functions apenas quando o projeto
   de fato os usa — não configurar superfície que a aplicação não expõe.
7. Verificar tipos TypeScript gerados, estratégia de pooling (session vs
   transaction), logs e política de backup/rollback antes de considerar
   pronto.

## Padrões

- Habilitar RLS em toda tabela de schema exposto à API e negar por padrão —
  tabela com RLS desabilitada em schema público é acessível por qualquer
  `anon` que descubra o nome.
- Nunca expor `service_role` no cliente (browser, app mobile, bundle
  público); ela ignora RLS e só pertence a ambiente de servidor confiável.
- Testar cada policy separadamente para `anon`, `authenticated` e qualquer
  papel de aplicação — uma policy que "parece" restringir mas usa `USING
  (true)` equivale a não ter policy.
- Tratar como superfície crítica: funções `SECURITY DEFINER` (rodam com
  privilégio do dono, não do chamador — precisam de `search_path` fixo e
  validação interna própria), claims customizadas no JWT (podem ser
  manipuladas se a fonte não for confiável) e buckets de Storage marcados
  como públicos.
- Versionar toda mudança de schema em migration (`supabase migration new`);
  edição manual no dashboard de produção diverge do histórico e quebra
  `supabase db diff`/CI.
- Separar autorização de produto (o que este usuário pode fazer com este
  registro) da mera autenticação (quem é o usuário) — RLS resolve a
  primeira, Auth resolve a segunda.
- Planejar conexão direta (poucas conexões persistentes, migrations),
  session pool (compatibilidade ampla, `PREPARE` funciona) ou transaction
  pool (alta concorrência, serverless) conforme o workload e o driver.

## Antipadrões

- Policy `USING (true)`/`WITH CHECK (true)` deixada "temporariamente" para
  destravar desenvolvimento e nunca revisada antes de produção — equivale a
  RLS desabilitada.
- Checar tenant/ownership só no cliente (filtrar a query pelo `tenant_id` no
  frontend) sem policy correspondente no banco — qualquer chamada direta à
  API contorna o filtro.
- Função `SECURITY DEFINER` sem `SET search_path = ''`/schema fixo —
  permite sequestro de função por objeto de mesmo nome em outro schema no
  `search_path` do chamador.
- Migration aplicada manualmente em produção via dashboard, divergindo do
  histórico versionado — o próximo `db push`/`db diff` não sabe reconciliar
  o estado real.
- Confiar em claim customizada do JWT sem validar sua origem (ex.: campo
  gravável pelo próprio usuário sendo usado como papel de autorização).

## Validação

- Provar acesso permitido e negado com identidades reais de teste para cada
  papel, incluindo sessão ausente (`anon`) e o "vizinho" de outro tenant.
- Executar `supabase db reset`/lint/migrations no ambiente local antes de
  promover — o projeto local reproduz o schema e as policies de produção.
- Conferir tipos gerados (`supabase gen types`) atualizados, replicação/
  Realtime restrita ao mesmo modelo de tenancy, policies de Storage por
  bucket, e segredos de Edge Functions fora do código-fonte.
- Avaliar recuperação e exportação dos dados além do backup gerenciado —
  testar um restore ou export completo, não assumir que o backup automático
  garante RTO aceitável.
- Não declarar uma tabela "protegida por RLS" sem o teste negativo (acesso
  que deveria falhar, falhando de fato).

## Skills relacionadas

- `$specsfy-specialist-docker` cobre serviços locais e imagens auxiliares; esta
  skill governa os contratos gerenciados da plataforma Supabase.
- `$specsfy-specialist-postgres` para modelagem de schema, índice, plano de
  query e isolation por trás do Supabase.
- `$specsfy-specialist-rls-review` depois que as policies existirem: ele as
  ataca como um tenant hostil e prova o isolamento com pgTAP executável.
- `$specsfy-specialist-application-security` para modelagem de ameaça de
  JWT, claims e superfícies de autorização além de RLS.
- `$specsfy-specialist-laravel` quando o mesmo projeto tiver um backend
  Laravel consumindo o mesmo Postgres além do Supabase.

Leia [references/standards.md](references/standards.md) antes de alterar
RLS, Auth, schemas expostos, Storage, Realtime ou estratégia de conexão.
