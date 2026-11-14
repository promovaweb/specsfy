# Supabase

O especialista Supabase orienta o agente em projetos com Supabase, das
políticas RLS e do Auth ao Storage, ao Realtime e às Edge Functions. O schema
do Postgres vem primeiro. Cada política de acesso é provada com testes
positivos e negativos para cada papel.

## Quando usar

- O projeto tem `supabase/config.toml`, migrations em `supabase/migrations/`
  ou o cliente `@supabase/supabase-js`.
- A tarefa altera RLS, Auth, Storage, Realtime, Edge Functions ou o ambiente
  local (`supabase start`).
- Você quer revisar políticas de acesso, uma policy ausente ou a exposição da
  chave `service_role`.

O ajuste de índice, plano ou isolation do Postgres fica com o especialista
PostgreSQL. O resultado dessa análise volta para as policies do Supabase.

## Como ele trabalha

1. Identifica o SDK, o projeto, os schemas expostos pela API, as migrations e
   os ambientes (local, preview e produção).
2. Descreve identidades, tenants e papéis (`anon`, `authenticated` e papéis
   próprios), além da origem de cada claim usada no acesso.
3. Modela tabelas, funções e views no Postgres. A API REST, o GraphQL e os
   tipos gerados derivam do schema.
4. Define os `GRANT` e as políticas RLS para cada operação (`SELECT`,
   `INSERT`, `UPDATE`, `DELETE`) e cada papel, negando o acesso por padrão.
5. Implementa a migration versionada e testa com usuários de cada papel,
   incluindo o acesso sem sessão (`anon`).
6. Configura Auth, Storage, Realtime ou Edge Functions apenas quando o projeto
   usa esses recursos.
7. Confere os tipos TypeScript gerados, a estratégia de pooling, os logs e o
   plano de backup e rollback.

## Padrões aplicados

- Toda tabela de schema exposto tem RLS habilitada e acesso negado por padrão.
- A chave `service_role` fica fora do navegador, de apps e de bundles
  públicos, porque ignora a RLS.
- Cada policy é testada para `anon`, `authenticated` e os papéis da aplicação.
- Funções `SECURITY DEFINER` têm `search_path` fixo e validação interna.
- Claims do JWT só autorizam acesso quando a origem é confiável.
- Buckets públicos do Storage são revisados como superfície sensível.
- Toda mudança de schema entra por `supabase migration new`, sem edição manual
  no dashboard de produção.
- A RLS resolve a autorização sobre cada registro, enquanto o Auth resolve a
  identidade do usuário.
- A conexão direta, o session pool e o transaction pool são escolhidos
  conforme a carga e o driver.

## Erros que ele evita

- Policy `USING (true)` deixada temporariamente e esquecida até a produção.
- Filtrar o tenant só no frontend, sem policy no banco.
- Função `SECURITY DEFINER` sem `SET search_path = ''`.
- Migration aplicada à mão no dashboard de produção.
- Claim do JWT gravável pelo próprio usuário usada como papel de
  autorização.

## Como conferir o resultado

- Acessos permitidos e negados foram provados com identidades de teste para
  cada papel, incluindo `anon` e um usuário de outro tenant.
- `supabase db reset`, o lint e as migrations rodaram no ambiente local.
- Os tipos gerados com `supabase gen types` estão atualizados.
- Realtime segue o mesmo modelo de tenancy, o Storage tem policies por bucket
  e os segredos das Edge Functions ficam fora do código.
- Um restore ou export completo foi testado, além do backup gerenciado.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-supabase --agent universal --copy --full-depth
```

## Especialistas relacionados

- [PostgreSQL](postgres.md) cuida de schema, índices e planos de query.
- [Segurança de Aplicações](application-security.md) modela ameaças de JWT e
  claims.
- [Docker](docker.md) cobre os serviços locais e as imagens auxiliares.
- [Laravel](laravel.md) entra quando um backend Laravel usa o mesmo Postgres.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-supabase/SKILL.md),
com detalhes de RLS e de conexão no arquivo de referência da mesma pasta.
