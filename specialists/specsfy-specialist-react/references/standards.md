# Padrões e referências React

Revisado em 2026-11-20 contra: React 19.3 (react.dev, blog de 19.2 e 19.3) e React Compiler 1.0.

## Onde o estado deve morar

| Situação | Onde colocar |
| --- | --- |
| Só um componente lê e escreve | `useState` local nesse componente |
| Dois componentes irmãos precisam do mesmo valor | Elevar ao ancestral comum mais próximo, não ao topo da árvore |
| Muitos componentes distantes leem, poucos escrevem | `useReducer` + `Context` isolado por responsabilidade |
| Dado pertence ao servidor (lista, registro, sessão) | Biblioteca de data fetching (cache, revalidação) — não duplicar em `useState` |
| Transição com múltiplos eventos relacionados | `useReducer`, uma máquina de estados explícita em vez de vários booleanos |

Regra geral: comece pelo estado mais local possível e suba apenas quando dois
consumidores realmente divergem sem ele. Descer estado depois é sempre mais
barato que desacoplar um god-context depois.

## Effects: quando usar e quando não

`useEffect` sincroniza um componente com um sistema **fora** do React (DOM,
subscription de terceiros, WebSocket, `localStorage`, timers, medição de
layout). Não é para:

- Computar um valor a partir de props/state já disponíveis — calcule direto
  no corpo do componente, ou use `useMemo` se o cálculo for caro.
- Resetar estado quando uma prop muda — troque a `key` do componente para
  remontá-lo, em vez de um effect que chama `setState`.
- Encadear um `setState` que dispara outro effect — geralmente é um evento de
  usuário, não uma sincronização; mova a lógica para o handler.
- Buscar dados sem cancelamento: todo fetch em effect precisa checar se o
  componente ainda está montado ou usar `AbortController`, senão uma resposta
  atrasada de uma requisição obsoleta sobrescreve o estado mais recente
  ("race condition" clássica de fetch-in-effect). A documentação do React
  recomenda buscar dados fora de effects quando houver framework, cache ou
  biblioteca de data fetching; o effect é o recurso de última instância.

## Effect Events

`useEffectEvent` (React 19.2+) cria uma função que sempre lê os valores mais
recentes de props e state sem entrar no array de dependências.

- Use para lógica que pertence ao effect mas não deve reexecutá-lo, como uma
  notificação disparada por conexão ou um callback de `setInterval` que precisa
  do contador atual.
- Não use para esconder dependência: se o valor deve reexecutar o effect, ele
  continua no array.
- A função só pode ser chamada de dentro de effects ou de outro Effect Event,
  não durante o render, em handler de evento ou passada como prop. A identidade
  dela muda a cada render de propósito, e o lint recusa incluí-la em
  dependências.

## Listas e identidade

- `key` vem do dado (id estável), nunca do índice do array quando itens podem
  ser inseridos, removidos ou reordenados — índice como key faz o React
  reconciliar o elemento errado e vaza estado local entre itens diferentes.
- Evite gerar a key no render (`key={Math.random()}` ou `key={crypto.randomUUID()}`
  a cada render) — isso força remount total a cada atualização.

## Context

- Um `Context.Provider` deve cobrir a menor árvore que realmente precisa do
  valor. Um único context "global" com todo o estado da aplicação
  rerenderiza qualquer consumidor a cada mudança de qualquer campo.
- Separe contexts por frequência de mudança: um valor que muda a cada tecla
  (ex.: texto de busca) não deve estar no mesmo provider que preferências
  raramente alteradas (ex.: tema).
- Para estado compartilhado com atualizações de alta frequência e muitos
  consumidores, considere uma biblioteca de estado externa com seletor
  granular em vez de `Context` puro.

## Concorrência e Suspense

- `useTransition`/`startTransition` marca uma atualização como não urgente
  (ex.: filtrar uma lista grande) sem bloquear a interação em andamento
  (digitação, clique).
- `useDeferredValue` adia a parte não urgente da UI que depende de um valor,
  mantendo a entrada responsiva enquanto a lista antiga continua visível.
- `Suspense` e error boundaries devem envolver apenas o boundary que sabe se
  recuperar (mostrar fallback, tentar de novo) — não a aplicação inteira, ou
  qualquer suspensão profunda derruba toda a UI.
- `<Activity mode="hidden">` (React 19.2+) oculta com `display: none`, preserva
  estado e DOM e destrói os effects. Use para abas, painéis e formulários que
  serão reabertos; adicione cleanup a efeitos de `<video>`, `<audio>` e
  `<iframe>`, que continuam ativos com o DOM preservado.
- Formulários com Server Action ou action assíncrona usam `useActionState`
  para estado pendente e erro, `useFormStatus` para o botão de envio e
  `useOptimistic` para refletir a mudança antes da confirmação do servidor.
- `<ViewTransition>` (React 19.3+) anima entrada, saída, atualização e
  compartilhamento dentro de uma Transition; fora de `startTransition`,
  `useDeferredValue` ou revelação de Suspense a atualização é urgente e não
  anima.

## Memoização

- `memo`, `useMemo` e `useCallback` têm custo de comparação e de memória; cada
  um só compensa quando: (a) o cálculo/render evitado é comprovadamente caro,
  ou (b) a referência estável evita um re-render em cascata medido, ou (c) é
  exigido por uma dependência de outro hook. Meça (profiler, contagem de
  renders) antes de aplicar — memoização especulativa piora legibilidade sem
  ganho.
- Com React Compiler 1.0 habilitado no build, a documentação oficial diz que o
  compilador cuida da memoização e elimina a necessidade de `useMemo`,
  `useCallback` e `React.memo`. Não duplique a otimização; mantenha memo manual
  apenas em código fora do escopo do compilador ou com medição que a
  justifique.

## Testes

- Teste pela experiência de quem usa: texto visível, papel ARIA, valor de
  input, foco — nunca por nome de hook interno ou estrutura de componente.
- Cubra todos os estados modelados (nominal, loading, empty, error, stale,
  optimistic) e o caminho de recuperação de erro, não só o caminho feliz.
- Trate warnings do React no console como falha de teste, não ruído — eles
  geralmente indicam key ausente, hook fora de ordem ou `setState` após
  unmount.

## Fontes oficiais

- React: https://react.dev/
- React 19.2 (Activity e useEffectEvent): https://react.dev/blog/2025/10/01/react-19-2
- React 19.3 (View Transitions, Fragment refs e browser): https://react.dev/blog/2026/09/09/react-19-3
- Pensando em React: https://react.dev/learn/thinking-in-react
- Managing State: https://react.dev/learn/managing-state
- You Might Not Need an Effect: https://react.dev/learn/you-might-not-need-an-effect
- Synchronizing with Effects: https://react.dev/learn/synchronizing-with-effects
- Separating Events from Effects: https://react.dev/learn/separating-events-from-effects
- useEffectEvent: https://react.dev/reference/react/useEffectEvent
- Activity: https://react.dev/reference/react/Activity
- ViewTransition: https://react.dev/reference/react/ViewTransition
- useActionState: https://react.dev/reference/react/useActionState
- useOptimistic: https://react.dev/reference/react/useOptimistic
- useDeferredValue: https://react.dev/reference/react/useDeferredValue
- Escape Hatches: https://react.dev/learn/escape-hatches
- startTransition: https://react.dev/reference/react/startTransition
- React Compiler 1.0: https://react.dev/blog/2025/10/07/react-compiler-1
- React Compiler: https://react.dev/learn/react-compiler
- Profiler: https://react.dev/reference/react/Profiler
- Testing Library guiding principles: https://testing-library.com/docs/guiding-principles/
- WAI-ARIA APG: https://www.w3.org/WAI/ARIA/apg/
