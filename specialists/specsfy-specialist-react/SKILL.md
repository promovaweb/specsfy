---
name: specsfy-specialist-react
description: Projetar, implementar e revisar interfaces React com composição, estado, efeitos, concorrência, acessibilidade, performance e testes. Use quando a tarefa envolve componentes React, hooks, context, forms ou renderização cliente; use também para decidir ownership de estado entre componente, context e biblioteca externa; não use para fronteiras server/client, cache ou routing de framework — aí use a skill Next.js; para a galeria de componentes visuais prontos, use react-ui-components.
---

# React

## Quando usar

- Acionar quando o pedido envolve componente, hook, context, formulário,
  lista, efeito ou estado em React puro (CRA, Vite, RSC-agnóstico).
- Acionar também para revisar por que um componente rerenderiza demais, por
  que um efeito roda em loop, ou como decidir onde um estado deve viver.
- Não acionar para escolha de Server vs Client Component, cache de dados ou
  roteamento de framework; usar `$specsfy-specialist-nextjs` nesse caso.
- Não acionar para escolher ou adaptar uma biblioteca de componentes visuais
  prontos; usar `$specsfy-specialist-react-ui-components` com
  `$specsfy-specialist-ui-design` para isso.
- Combinar com `$specsfy-specialist-typescript` quando o componente expõe
  props públicas ou modela estado com union discriminada e com
  `$specsfy-specialist-web-accessibility` para auditoria aprofundada de
  teclado e leitor de tela.

## Fluxo

1. Para uma tela ou formulário, ler `INTERFACE.md` e a seção de interface da spec antes do
   código. Confirmar telas, fluxo de informação, campos, validações, padrão de
   abertura e estados. Se o material não existir, retornar ao
   `$specsfy-specialist-ux-design` e `$specsfy-specialist-ui-design`; não
   trocar uma interface pedida por endpoint ou componente vazio.
2. Confirmar versão do React, renderer, framework (se houver), convenções do
   projeto e estratégia de testes já em uso. Quando a tela usar shadcn/ui,
   identificar antes a base de primitives instalada, seguindo
   `$specsfy-specialist-shadcn-ui`; nunca deduzir Radix ou Base UI pela
   aparência do componente.
   Se `.specsfy/STACK.md` não declarar React ou o projeto não tiver essa
   dependência, não inicie esta implementação: encaminhe ao especialista da
   stack observada.
3. Modelar os estados visíveis (nominal, loading, empty, error, stale,
   optimistic), os eventos que os produzem e quem é o dono de cada dado.
4. Projetar a árvore de componentes com responsabilidades e props pequenas;
   preferir composição (`children`, slots) a um componente com dezenas de
   flags booleanas.
5. Manter cada estado no dono mais próximo capaz de resolvê-lo; derivar
   valores durante o render em vez de sincronizar com `useEffect`.
6. Usar effects apenas para sincronizar com um sistema externo (DOM,
   subscription, rede, storage), nunca para computar algo a partir de props
   e state já disponíveis.
7. Implementar semântica HTML e navegação por teclado antes do acabamento
   visual; então cobrir com teste de comportamento observável.
8. Medir performance somente quando houver sintoma real (profiler, métrica de
   produção); então memoizar ou dividir o componente com medição registrada, não por
   precaução.
9. Registrar em `INTERFACE.md` cada bloco criado, alterado ou reaproveitado:
   responsabilidade, arquivo, props, eventos, estados, acessibilidade e telas
   consumidoras.

## Padrões

- Preferir composição a um componente genérico com muitas props de
  configuração; dividir quando a árvore de escolha interna cresce.
- Em Laravel com React, usar shadcn/ui para primitives e ReUI para composições
  gratuitas. Página e rota compõem blocos React; grade, formulário, filtros,
  overlays e cartões reutilizáveis são componentes próprios e documentados em
  `INTERFACE.md`.
- Nunca copiar uma prop para `state` só para "guardar o valor inicial"; isso
  cria dessincronia: leia a prop diretamente ou derive durante o render.
- Não usar `useEffect` para computar um valor derivável de props/state
  existentes; use uma variável comum ou `useMemo` quando o cálculo for caro.
- Tornar loading, empty, error, stale e success estados explícitos da UI, não
  branches implícitos de um único booleano `loading`.
- Usar `key` estável e vinda dos dados (id) em listas; nunca o índice do
  array quando a ordem pode mudar, item pode ser removido ou reordenado.
- Isolar cada `Context.Provider` pela frequência de mudança e responsabilidade:
  um context que muda a cada tecla não deve envolver a árvore inteira.
- Não memoizar (`memo`/`useMemo`/`useCallback`) sem medição prévia; memoização
  tem custo de comparação e só compensa com renders caros ou comprovadamente
  frequentes.
- Testar pelo comportamento observável pelo usuário (texto, papel, estado),
  nunca por detalhes de implementação de hooks internos.

## Antipadrões

- Efeito que sincroniza estado local com uma prop
  (`useEffect(() => setX(prop), [prop])`): sintoma de estado duplicado; a
  fonte da verdade já é a prop.
- Cadeia de effects que dispara outro effect via mudança de state
  ("effect chain"): geralmente colapsa em um único handler de evento ou em
  cálculo direto durante o render.
- `useEffect` sem array de dependências completo, "silenciado" com
  `// eslint-disable`: esconde bug de closure obsoleta em vez de resolvê-lo.
- Context único guardando todo o estado global da aplicação ("god context"):
  qualquer mudança rerenderiza toda a árvore; prefira contexts menores ou
  uma biblioteca de estado dedicada quando o grafo de dependências crescer.
- Confundir este escopo com o de `$specsfy-specialist-nextjs`: adicionar
  `"use client"` em cascata para "resolver" um erro de hook, em vez de mover a
  interatividade para o componente folha correto.

## Validação

- Percorrer a superfície alterada inteira por teclado e testar com leitor de
  tela quando houver papel, foco ou anúncio novo.
- Escrever testes para cada estado modelado no passo 2 do Fluxo (nominal,
  loading, empty, error, stale, optimistic) e para a recuperação de erro.
- Checar o console por warnings do React (chaves, hooks fora de ordem,
  atualização de estado após unmount) e por avisos de hydration quando houver
  SSR.
- Rodar profiling ou bundle analysis somente quando uma suposição concreta de
  performance existir; anexar a medição antes/depois.
- Não declarar um componente "acessível" ou "performático" sem a comprovação
  acima; linguagem absoluta sem prova é proibida.

## Skills relacionadas

- `$specsfy-specialist-reui` para composições React e Tailwind do catálogo
  gratuito.
- `$specsfy-specialist-astro` governa a fronteira da ilha e
  `$specsfy-specialist-shadcn-ui` identifica a base de primitives e governa os
  componentes visuais; esta skill governa o comportamento React dentro deles.
- `$specsfy-specialist-tailwind-css` estiliza o componente sem assumir
  ownership de estado, effect ou concorrência.
- `$specsfy-specialist-nextjs` para fronteira server/client, cache de dados e
  roteamento: este especialista trata React independente de framework.
- `$specsfy-specialist-react-ui-components` e `$specsfy-specialist-ui-design`
  para escolher e compor uma biblioteca visual pronta; este especialista
  entra depois, para ownership de estado, efeitos e testes.
- `$specsfy-specialist-typescript` para tipar props, estado e union
  discriminada de forma exaustiva.
- `$specsfy-specialist-web-accessibility` para auditoria aprofundada além do
  teclado básico validado aqui.

Leia [references/standards.md](references/standards.md) para modelagem de
estado, effects, composição, listas, context, testes e performance, com
fontes oficiais.
