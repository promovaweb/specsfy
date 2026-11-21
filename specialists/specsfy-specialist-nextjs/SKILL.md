---
name: specsfy-specialist-nextjs
description: Implementar e revisar aplicações Next.js com App Router, Server e Client Components, data fetching, Cache Components, mutations, routing, metadata, segurança e deploy. Use quando houver dependência next ou next.config e a tarefa tocar rota, layout, Server Action, cache, proxy ou runtime; use também para decidir a fronteira server/client; não use para lógica de estado/efeito React independente de framework — aí use a skill React; confirme sempre o router (App ou Pages) e a versão antes de recomendar, pois cache, símbolos de build e nomes de arquivo mudam entre gerações.
---

# Next.js

## Quando usar

- Acionar quando o projeto depende de `next`/`next.config` e a tarefa envolve
  rota, layout, Server/Client Component, Server Action, route handler, Cache
  Components, proxy, metadata ou deploy.
- Acionar também para diagnosticar waterfalls de dados, hydration mismatch,
  ou cache servindo dado obsoleto/entre usuários.
- Não acionar para hooks, estado ou composição de componentes que não dependem
  do framework; usar `$specsfy-specialist-react` nesse caso e voltar aqui só
  para a fronteira server/client.
- Combinar com `$specsfy-specialist-application-security` quando a rota expõe
  mutation, upload ou dado sensível e com
  `$specsfy-specialist-observability` quando o sintoma for Web
  Vitals ou TTFB fora do SLO.

## No Specsfy

1. **Fonte de entrada por fase**
   - Em `specsfy-02-backlog`, leia o item em `specs/backlog/` e registre ali
     as decisões e sinais do especialista, além das dúvidas abertas.
   - Em `specsfy-03-specify` e `specsfy-04-validate`, use a
     spec aberta e devolva a conclusão à seção trabalhada pela fase.
   - Em `specsfy-05-tasks`, ajude a sugerir e sincronizar especialistas e modos
     entre o cabeçalho, a seção 8 e as tarefas. Só essa fase escreve a seção 14.
   - Em `specsfy-06-implement`, limite-se à tarefa indicada e ao passo carregado.

   Nas fases com spec, leia a spec aberta indicada pela skill chamadora ou
   localizada por `specsfy status`. Consulte a linha `| Especialistas |`,
   a subseção `#### Especialistas` em `### 8. Plano técnico` e a seção
   pertinente à fase.
   Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md` e, quando a rota renderizar tela, `INTERFACE.md`.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-nextjs`. Sem indicação, confirme pelo
   "Quando usar" acima se o projeto depende de `next` antes de propor rota.
3. Devolva a conclusão e as dúvidas abertas no destino indicado no item 1,
   no próprio backlog, na spec ou na tarefa da fase.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Quando a fase trabalhar o plano técnico da spec, registre router,
   fronteira server/client, cache e revalidação da rota em
   `Arquitetura e módulos` na seção 8. Quando a fase tratar uma mudança de
   contrato de dados, use `### 10. Interfaces e contratos`.

## Fluxo

1. Confirmar versão do Next.js, router (App ou Pages), runtime (Node vs
   Edge), deployment target e flags experimentais ativas: a semântica de
   cache e de Server Components muda entre versões. No Next.js 16, Turbopack é
   o bundler padrão, `cacheComponents` e `partialPrefetching` são o modelo
   recomendado (padrão em projetos novos desde 16.4 e default na versão 17) e
   `middleware.ts` deu lugar a `proxy.ts`.
2. Mapear a rota alterada: layout, `loading`, `error`, `not-found` e onde
   está o boundary entre dado (server) e interação (client). `params`,
   `searchParams`, `cookies()`, `headers()` e `draftMode()` são assíncronos no
   App Router do Next.js 16 e precisam de `await`.
3. Manter componentes Server por padrão; marcar `"use client"` apenas no
   componente folha que realmente precisa de hook, evento ou API do
   navegador, nunca no layout ou página inteira por conveniência.
4. Definir explicitamente cache, revalidação e tags de cada fonte de dado.
   Com Cache Components, o Next.js pode pré-renderizar código e UI estáticos
   sem `"use cache"`. Dados dinâmicos sem cache e APIs da requisição são
   processados em tempo de requisição. Para cache explícito, usar `"use cache"`
   na função ou no componente, com `cacheLife` e `cacheTag`. Confirmar o
   comportamento na versão instalada.
5. Validar entrada e checar autorização dentro de cada Server Action e route
   handler, como se fosse um endpoint HTTP público, porque é.
6. Projetar metadata, streaming (`loading.js`/`Suspense`), imagens/fontes e o
   caminho de recuperação de erro (`error.js`, `not-found.js`).
7. Executar typecheck, lint (ESLint ou Biome), testes e build de produção, e
   checar o resultado no runtime real do adapter/host alvo, não só no
   `next dev`. Desde o Next.js 16 o `next build` não executa mais lint.

## Padrões

- Não mover a árvore inteira para `"use client"` para "resolver" um erro de
  hook; isolar a interatividade no componente folha certo.
- Nunca importar segredo, cliente de banco ou módulo server-only dentro de um
  Client Component: o bundler pode incluí-lo no JS enviado ao navegador.
- Colocar o fetching o mais próximo possível de quem consome o dado; medir e
  eliminar waterfalls sequenciais evitáveis (requisições que dependem umas das
  outras sem necessidade real).
- Tratar cache como contrato explícito por rota: declarar se cada fonte de
  dado é estática, cacheada com `"use cache"` e `cacheLife`, revalidada por
  tag ou dinâmica em request time, nunca herdar o default sem checar a versão
  instalada.
- Revalidar imediatamente após qualquer mutation que afete dado já cacheado:
  `revalidateTag(tag, "max")` invalida com stale-while-revalidate,
  `updateTag(tag)` em Server Action entrega read-your-writes e `refresh()`
  atualiza só dado não cacheado. Sem isso a UI mostra estado obsoleto.
- Proteger toda Server Action com a mesma disciplina de um endpoint público:
  autenticar, autorizar por objeto e validar payload, o cliente pode chamá-la
  diretamente, fora do fluxo de UI esperado.
- Usar `proxy.ts` (Node.js runtime) apenas para lógica curta de rede:
  redirect, header, cookie e feature flag. Ele não é solução de sessão ou
  autorização completa e não aplica `use cache`/`use server` nem cache de
  `fetch`. Lógica pesada pertence ao route handler ou à camada de aplicação.
  `middleware.ts` segue disponível para Edge, mas está depreciado.
- Documentar qualquer acoplamento a comportamento específico do host/adapter
  (headers, streaming, limites de tempo) em vez de deixá-lo implícito.

## Antipadrões

- `"use client"` no topo de `layout.tsx` ou `page.tsx` só porque um filho
  precisa de interatividade: arrasta toda a subárvore para o cliente e perde
  os benefícios de Server Components.
- Buscar o mesmo dado em múltiplos componentes aninhados sem cache ou
  deduplicação, criando uma cascata de requisições sequenciais visível no
  waterfall de rede.
- Mutar dado via Server Action e não revalidar o path/tag correspondente: a
  UI parece "quebrada" porque mostra o cache antigo até o próximo refresh
  completo. `revalidateTag("posts")` com um argumento está depreciado no
  Next.js 16: use `revalidateTag("posts", "max")` ou `updateTag("posts")`.
- Criar `middleware.ts` em projeto Next.js 16: o arquivo correto é
  `proxy.ts`, com função `proxy`; o nome antigo sobrevive só para Edge e será
  removido.
- Assumir cache implícito para dados dinâmicos de `fetch`. No modelo Cache
  Components, declare `"use cache"` no trecho que deve reutilizar esses dados.
- Confiar em variável de ambiente sem prefixo público (`NEXT_PUBLIC_`) dentro
  de um Client Component: ela não existirá no bundle do navegador.
- Tratar uma Server Action como "só acessível pela UI" e pular autorização:
  ela é uma rota HTTP como outra qualquer e pode ser chamada diretamente.

## Validação

- `next build` completo e leitura do relatório de rotas que ele imprime:
  `○` estático, `●` SSG, `ƒ` dinâmico e `◐` Partial Prerender, com colunas
  `Revalidate`/`Expire` quando houver cache. O símbolo `λ` não existe mais.
  Conferir se isso bate com a intenção declarada no passo 4 do Fluxo.
- Rodar o lint separadamente (ESLint ou Biome), porque `next lint` foi
  removido e `next build` não lint mais; usar `next typegen` quando a rota
  depender de tipos gerados.
- Exercitar `loading`, `error`, `not-found`, redirects e autorização em cada
  rota alterada, incluindo acesso direto por URL sem navegação client-side.
- Provar cache hit/miss e invalidation: mutar o dado, checar que a rota
  revalida e confirmar que nenhum dado vaza entre usuários/sessões
  diferentes por chave de cache mal escopada.
- Medir bundle do cliente, imagens, fontes e Web Vitals (LCP, INP, CLS) antes
  e depois da mudança quando a rota for sensível a performance.
- Não declarar uma rota "seções server-first" ou "cache correto" sem essa
  comprovação; linguagem absoluta sem prova é proibida.

## Skills relacionadas

- `$specsfy-specialist-interface` aprofunda WCAG, foco e tecnologia
  assistiva nas rotas e Client Components.
- `$specsfy-specialist-react` para hooks, estado, efeitos e composição
  independentes do framework: use em conjunto para qualquer Client Component
  não trivial.
- `$specsfy-specialist-ui-components` e `$specsfy-specialist-interface`
  para a biblioteca visual e a composição de página, antes de decidir a
  fronteira server/client aqui.
- `$specsfy-specialist-application-security` para autorização, upload e dado
  sensível em Server Actions e route handlers.
- `$specsfy-specialist-observability` para investigar Web Vitals,
  TTFB ou regressão de performance com metodologia própria.
- `$specsfy-specialist-typescript` para tipar params de rota, payload de
  Server Action e retorno de data fetching de forma segura.
- `$specsfy-specialist-mcp` quando a rota servir um servidor MCP: contrato
  Streamable HTTP, OAuth e primitivas ficam lá; rota e runtime do framework
  continuam aqui.
- `$specsfy-specialist-tailwind-css` e `$specsfy-specialist-ui-components` para a
  camada de estilo e os componentes visuais renderizados dentro de cada
  Server/Client Component.
- `$specsfy-specialist-cloudflare` para Pages, Worker, domínio e binding de
  publicação; a rota e o runtime do framework continuam aqui.
- `$specsfy-specialist-testing` executa a jornada no navegador e a unidade do
  módulo que comprovam o comportamento da rota.

Leia [references/standards.md](references/standards.md) para fronteiras
server/client, cache, Server Actions, streaming, segurança e checklist de
produção, com fontes oficiais.
