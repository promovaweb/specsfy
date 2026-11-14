# Next.js

O especialista Next.js orienta o agente em aplicações Next.js, com o App
Router, Server Components por padrão e cache declarado por rota. Ele define o
limite entre servidor e cliente e trata cada Server Action como um endpoint
público.

## Quando usar

- O projeto depende de `next` ou tem `next.config`.
- A tarefa altera uma rota, um layout ou um Server ou Client Component.
- A tarefa cria ou altera uma Server Action, um route handler, o cache, o
  middleware ou o deploy.
- Você precisa investigar requisições em cascata, hydration mismatch ou um
  cache que mostra conteúdo antigo ou de outro usuário.

Hooks, estado e composição que não dependem do framework ficam com o
especialista React. Este especialista volta à cena quando a dúvida envolve o
limite entre servidor e cliente.

## Como ele trabalha

1. Confirma a versão do Next.js, o router, o runtime (Node ou Edge), o destino
   do deploy e as flags experimentais.
2. Descreve a rota alterada com `loading`, `error` e `not-found`. Em seguida,
   define onde termina o servidor e começa a interação no cliente.
3. Mantém os componentes no servidor e marca `"use client"` só no componente
   folha que usa hooks, eventos ou APIs do navegador.
4. Declara cache, revalidação e tags de cada fonte de conteúdo, conforme a
   versão instalada.
5. Valida a entrada e confere a autorização dentro de cada Server Action e
   route handler.
6. Planeja metadata, streaming com `loading.js` e `Suspense`, imagens, fontes
   e recuperação de erros.
7. Executa lint, typecheck, testes e build de produção e confere o resultado
   no host de destino, além do `next dev`.

## Padrões aplicados

- A interatividade fica isolada no componente folha, sem levar a árvore
  inteira para o cliente.
- Segredos, clientes de banco e módulos server-only não entram em Client
  Components, porque o bundler pode enviá-los ao navegador.
- A busca de conteúdo fica perto do componente que o usa, sem requisições
  sequenciais desnecessárias.
- Cada fonte de conteúdo é declarada como estática, revalidada por tempo,
  revalidada por tag ou dinâmica.
- Toda mutation chama `revalidatePath` ou `revalidateTag` para o conteúdo
  afetado.
- Cada Server Action autentica, autoriza por objeto e valida o payload, porque
  o cliente pode chamá-la diretamente.
- O middleware guarda apenas lógica curta e compatível com o runtime da rota.
- Dependências de comportamento do host, como headers e limites de tempo,
  ficam documentadas.

## Erros que ele evita

- `"use client"` no topo de `layout.tsx` ou `page.tsx` por causa de um único
  filho interativo.
- O mesmo conteúdo buscado em vários componentes aninhados, em cascata.
- Mutation sem revalidação, com a tela exibindo o cache antigo.
- Variável de ambiente sem o prefixo `NEXT_PUBLIC_` usada em Client
  Component.
- Server Action sem autorização por ser considerada acessível só pela tela.

## Como conferir o resultado

- `next build`, lint e typecheck passam. O relatório de rotas do build
  (estática, dinâmica ou ISR) corresponde ao cache declarado.
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
- [Componentes React](react-ui-components.md) e [UI Design](ui-design.md)
  cuidam da biblioteca visual e da composição das páginas.
- [Acessibilidade Web](web-accessibility.md) revisa WCAG e foco.
- [Segurança de Aplicações](application-security.md) revisa Server Actions e
  route handlers.
- [Performance](performance-engineering.md) investiga Web Vitals e TTFB.
- [TypeScript](typescript.md) tipa parâmetros de rota e payloads.
- [Tailwind CSS](tailwind-css.md) e [shadcn/ui](shadcn-ui.md) cuidam do
  estilo e dos componentes.

Astro e Next.js têm modelos de cache diferentes. O capítulo
[Next.js](../nextjs.md) mostra como o Specsfy se aplica a um projeto Next.js.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-nextjs/SKILL.md),
com cache, Server Actions, streaming e checklist de produção no arquivo de
referência da mesma pasta.
