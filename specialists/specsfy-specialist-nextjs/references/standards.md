# Padrões e referências Next.js

Revisado em 2026-11-20 contra: Next.js 16.4 (blog de 16, 16.3 e 16.4 e docs de caching, use cache, revalidateTag e proxy).

## Fronteiras Server/Client

- Toda página e layout no App Router é Server Component por padrão: pode ler
  banco, arquivo, segredo e não envia JS ao navegador por si só.
- `"use client"` marca a raiz de uma subárvore Client — coloque-o no
  componente folha mais específico possível (um botão interativo, um
  formulário), nunca em `layout.tsx` ou `page.tsx` inteiros.
- Um Server Component pode importar e renderizar um Client Component
  passando props serializáveis; o inverso (Client importando Server
  diretamente) não é permitido — passe o Server Component como `children`.
- Nenhum módulo que toque segredo, driver de banco ou SDK server-only pode
  ser importado, direta ou transitivamente, por um arquivo `"use client"`.
- No Next.js 16, `params`, `searchParams`, `cookies()`, `headers()` e
  `draftMode()` são assíncronos: use `await` e mantenha o acesso dentro de
  `<Suspense>` quando ele bloquear a pré-renderização.

## Data fetching e cache

- No modelo Cache Components (`cacheComponents: true`, recomendado desde o
  Next.js 16.4 e padrão em projeto novo), o cache é opt-in: sem diretiva, todo
  código roda em request time. Declare por função ou componente se ele é
  cacheado (`"use cache"`), com que vida (`cacheLife("hours"|"days"|"max")`) e
  com que tag (`cacheTag("posts")`).
- `"use cache"` só vale em função assíncrona. Argumentos e variáveis capturadas
  do escopo entram no cache key; para dado por usuário, inclua o identificador
  como argumento. Quando a função precisa ler `cookies`, `headers` ou
  `searchParams` diretamente, use `"use cache: private"`; para cache durável
  entre instâncias, `"use cache: remote"`.
- Após qualquer mutation que afete dado exibido em outra rota, invalide antes
  de considerar a mutation concluída: `revalidateTag(tag, "max")` para
  stale-while-revalidate, `updateTag(tag)` em Server Action para
  read-your-writes, `refresh()` para dado não cacheado e `revalidatePath` para
  um path específico. O formato `revalidateTag(tag)` com um argumento está
  depreciado e se comporta como `{ expire: 0 }`.
- Prefira colocar o fetch próximo do componente que consome o dado (paralelo,
  não em cascata); um componente pai não deve esperar seu próprio fetch
  terminar antes de disparar o fetch do filho quando os dois são
  independentes.
- Cada `use cache` deve ter `cacheLife` explícito. Sem ele, vale o perfil
  `default` (stale de 5 minutos no cliente, revalidate de 15 minutos no
  servidor), e cache curto aninhado em cache sem vida explícita falha no
  build.

## Server Actions e Route Handlers

- Trate toda Server Action como uma rota HTTP pública: ela pode ser invocada
  diretamente por qualquer cliente que conheça seu endpoint gerado, não só
  pela UI que a declarou.
- Autentique, autorize por objeto (não só "usuário logado") e valide o
  payload no início de cada Server Action/Route Handler, antes de qualquer
  efeito colateral.
- Retorne erros estruturados e não vaze detalhe interno (stack trace, query
  SQL) no corpo da resposta ao cliente.
- Argumentos e retorno de Server Action precisam ser serializáveis. Uma ação
  que muda dado cacheado deve chamar `updateTag` (read-your-writes) ou
  `revalidateTag(tag, "max")` antes de retornar.

## Streaming e recuperação de erro

- Use `loading.js`/`<Suspense>` para segmentos que dependem de dado lento,
  permitindo que o resto da página renderize primeiro (streaming SSR) e que o
  shell estático chegue antes do dado dinâmico (Partial Prerendering).
- `error.js` captura erro do segmento e deve oferecer caminho de
  recuperação (retry, voltar); não deve derrubar a aplicação inteira.
  `catchError` cria boundary no nível do componente.
- `not-found.js` cobre tanto rota inexistente quanto `notFound()` chamado
  explicitamente por um Server Component que não achou o recurso.

## Proxy e runtime

- No Next.js 16, `middleware.ts` foi renomeado para `proxy.ts`, executado no
  runtime Node.js, com função exportada `proxy` (default ou nomeada) e o mesmo
  `config.matcher`. O nome antigo continua disponível só para Edge e está
  depreciado.
- `proxy.ts` serve para redirect, rewrite, header, cookie e feature flag. Ele
  não é solução de sessão ou autorização, e `use cache`, `use server` e as
  opções de cache de `fetch` não têm efeito ali; regra pesada pertence ao route
  handler ou à camada de aplicação.
- Runtime Edge e Node têm limites diferentes de tempo de execução e de APIs;
  confirme qual runtime a rota usa antes de assumir compatibilidade com uma
  biblioteca.

## Metadata e SEO

- Prefira a Metadata API (`generateMetadata`, `metadata` estático) a tags
  manuais no `<head>`; ela lida com merge entre layout e página e com
  Open Graph/Twitter automaticamente.
- Dado dinâmico usado em `generateMetadata` deve vir da mesma fonte
  cacheada/revalidada que o conteúdo da página, para não divergir dela.

## Checklist de produção

- Rodar build de produção e revisar o relatório de rotas contra a intenção
  declarada no passo 4 do Fluxo: `○` estático, `●` SSG, `ƒ` dinâmico, `◐`
  Partial Prerender, com `Revalidate`/`Expire` quando houver cache.
- Rodar lint fora do build (ESLint ou Biome), já que `next lint` foi removido
  no Next.js 16 e `next build` não lint mais. Usar `next typegen` quando a
  rota depender de tipos gerados.
- Confirmar Node.js 20.9+ e TypeScript 5.1+, exigidos pelo Next.js 16, e
  revisar os novos defaults de `next/image` (qualities `[75]`,
  `minimumCacheTTL` de 4 horas e no máximo 3 redirects).
- Validar variáveis de ambiente exigidas em runtime, imagens/fontes
  otimizadas e headers de segurança (CSP, HSTS) configurados no host.
- Confirmar que o adapter/host alvo suporta os recursos usados (streaming,
  Partial Prerendering, cache handler) antes do deploy.

## Fontes oficiais

- App Router: https://nextjs.org/docs/app
- Server e Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Data fetching: https://nextjs.org/docs/app/getting-started/fetching-data
- Caching e Cache Components: https://nextjs.org/docs/app/getting-started/caching
- `cacheComponents`: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents
- `use cache`: https://nextjs.org/docs/app/api-reference/directives/use-cache
- Revalidating: https://nextjs.org/docs/app/getting-started/revalidating
- `revalidateTag`: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- `updateTag`: https://nextjs.org/docs/app/api-reference/functions/updateTag
- Server Functions (`"use server"`): https://nextjs.org/docs/app/api-reference/directives/use-server
- Error handling: https://nextjs.org/docs/app/getting-started/error-handling
- Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Proxy: https://nextjs.org/docs/app/getting-started/proxy
- Build output: https://nextjs.org/docs/app/guides/building
- Authentication: https://nextjs.org/docs/app/guides/authentication
- Production checklist: https://nextjs.org/docs/app/guides/production-checklist
- Next.js 16: https://nextjs.org/blog/next-16
- Next.js 16.4: https://nextjs.org/blog/next-16-4

Leia a documentação correspondente à versão travada no lockfile do projeto;
cache e defaults mudam entre versões majors do Next.js.
