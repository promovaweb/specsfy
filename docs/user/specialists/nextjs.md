# Next.js

O especialista Next.js orienta o agente em aplicações Next.js, com o App
Router, Server Components por padrão e cache declarado por rota. Desde a
versão 16.4, o modelo recomendado é Cache Components, com `"use cache"`,
`cacheLife` e `cacheTag`, e `proxy.ts` no lugar do middleware. Ele define o
limite entre servidor e cliente e trata cada Server Action como um endpoint
público.

## Quando usar

- O projeto depende de `next` ou tem `next.config`.
- A tarefa altera uma rota, um layout ou um Server ou Client Component.
- A tarefa cria ou altera uma Server Action, um route handler, o cache, o
  proxy ou o deploy.
- Você precisa investigar requisições em cascata, hydration mismatch ou um
  cache que mostra conteúdo antigo ou de outro usuário.

Hooks, estado e composição que não dependem do framework ficam com o
especialista React. Este especialista volta à cena quando a dúvida envolve o
limite entre servidor e cliente.

## Como ele trabalha

1. Confirma a versão do Next.js, o router, o runtime (Node ou Edge), o destino
   do deploy e as flags experimentais. No Next.js 16, Turbopack é o bundler
   padrão; a partir do 16.4, `cacheComponents` com `partialPrefetching` é o
   modelo recomendado.
2. Descreve a rota alterada com `loading`, `error` e `not-found`. Em seguida,
   define onde termina o servidor e começa a interação no cliente.
3. Mantém os componentes no servidor e marca `"use client"` só no componente
   folha que usa hooks, eventos ou APIs do navegador. `params`, `searchParams`,
   `cookies()` e `headers()` são assíncronos e precisam de `await`.
4. Declara cache, revalidação e tags de cada fonte de conteúdo. Com Cache
   Components, código e interface estáticos podem entrar no HTML pré-renderizado
   sem `"use cache"`. Dados dinâmicos sem cache e APIs que dependem da requisição
   são processados quando ela chega. Para configurar o cache, usa `"use cache"`
   na função ou no componente, `cacheLife` para a duração e `cacheTag` para a
   invalidação. [Documentação de cache do Next.js](https://nextjs.org/docs/app/getting-started/caching)
5. Valida a entrada e confere a autorização dentro de cada Server Action e
   route handler. Uma ação que muda dado cacheado chama `updateTag` ou
   `revalidateTag(tag, "max")` antes de retornar.
6. Planeja metadata, streaming com `loading.js` e `Suspense`, imagens, fontes
   e recuperação de erros.
7. Executa typecheck, lint separado (ESLint ou Biome), testes e build de
   produção e confere o resultado no host de destino, além do `next dev`.

## Padrões aplicados

- A interatividade fica isolada no componente folha, sem levar a árvore
  inteira para o cliente.
- Segredos, clientes de banco e módulos server-only não entram em Client
  Components, porque o bundler pode enviá-los ao navegador.
- A busca de conteúdo fica perto do componente que o usa, sem requisições
  sequenciais desnecessárias.
- Cada fonte de conteúdo é declarada como estática, cacheada com `"use cache"`
  e `cacheLife`, revalidada por tag ou dinâmica em tempo de requisição.
- Toda mutation invalida o conteúdo afetado com `updateTag` ou
  `revalidateTag(tag, "max")`, e `refresh()` atualiza só o dado não cacheado.
- Cada Server Action autentica, autoriza por objeto e valida o payload, porque
  o cliente pode chamá-la diretamente.
- O `proxy.ts` guarda apenas lógica curta e compatível com o runtime Node,
  como redirect, header e cookie.
- Dependências de comportamento do host, como headers e limites de tempo,
  ficam documentadas.

## Erros que ele evita

- `"use client"` no topo de `layout.tsx` ou `page.tsx` por causa de um único
  filho interativo.
- O mesmo conteúdo buscado em vários componentes aninhados, em cascata.
- Mutation sem revalidação, com a tela exibindo o cache antigo.
- `middleware.ts` em projeto Next.js 16, quando o arquivo correto é
  `proxy.ts`.
- `revalidateTag("tag")` com um argumento, formato depreciado no Next.js 16.
- Variável de ambiente sem o prefixo `NEXT_PUBLIC_` usada em Client
  Component.
- Server Action sem autorização por ser considerada acessível só pela tela.

## Como conferir o resultado

- `next build`, lint separado e typecheck passam. O relatório de rotas do
  build usa `○` para estático, `●` para SSG, `ƒ` para dinâmico e `◐` para
  Partial Prerender, e corresponde ao cache declarado.
- `loading`, `error`, `not-found`, redirects e autorização foram exercitados
  com acesso direto pela URL.
- Cache hit, cache miss e invalidação foram provados, sem vazamento entre
  usuários ou sessões.
- O bundle do cliente e os Web Vitals (LCP, INP, CLS) foram medidos nas rotas
  sensíveis a performance.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-nextjs --agent universal --copy --full-depth
```

## Especialistas relacionados

- [React](react.md) cuida de hooks, estado e composição.
- [Componentes de UI](ui-components.md) e [Interface](interface.md) cuidam da
  biblioteca visual e da composição das páginas, inclusive da acessibilidade.
- [Segurança de Aplicações](application-security.md) revisa Server Actions e
  route handlers.
- [Observabilidade](observability.md) investiga Web Vitals e TTFB.
- [TypeScript](typescript.md) tipa parâmetros de rota e payloads.
- [Tailwind CSS](tailwind-css.md) cuida do estilo dos componentes.

Astro e Next.js têm modelos de cache diferentes. O capítulo
[Next.js](../nextjs.md) mostra como o Specsfy se aplica a um projeto Next.js.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-nextjs/SKILL.md),
com cache, Server Actions, streaming e checklist de produção no arquivo de
referência da mesma pasta.
