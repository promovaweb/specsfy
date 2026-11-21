# React

O especialista React orienta o agente em componentes, hooks, Context API,
formulários e estado em React. Ele modela os estados visíveis da tela, mantém
cada estado no dono mais próximo e testa o comportamento que o usuário observa.

## Quando usar

- A tarefa envolve componentes, hooks, Context API, formulários, listas,
  efeitos ou estado em React.
- Um componente renderiza vezes demais, um efeito roda em loop ou você não
  sabe onde um estado deve ficar.
- O componente expõe props públicas ou usa unions discriminadas. Nesse caso,
  combine com o especialista TypeScript.

Server e Client Components, cache e roteamento ficam com o especialista
Next.js. A escolha de uma biblioteca visual fica com os especialistas
Componentes React e UI Design.

## Como ele trabalha

1. Para uma tela ou um formulário, lê o `INTERFACE.md` e a seção de interface
   da spec, voltando ao especialista Interface quando esse material falta.
2. Confirma a versão do React, o framework, as convenções e a estratégia de
   testes. Com shadcn/ui, identifica a base de primitives instalada pelo
   especialista Componentes de UI.
3. Interrompe o trabalho quando o `.specsfy/STACK.md` não declara React e
   encaminha a tarefa ao especialista da stack observada.
4. Modela os estados visíveis (nominal, carregando, vazio, erro, desatualizado
   e otimista) e os eventos que os produzem.
5. Desenha a árvore de componentes com responsabilidades e props pequenas,
   preferindo composição a componentes cheios de flags.
6. Deriva valores durante o render e usa efeitos apenas para sincronizar com
   sistemas externos, como DOM, rede ou storage. Para ler o valor mais recente
   dentro de um efeito sem reiniciar a conexão, usa `useEffectEvent` no React
   19.2 ou superior.
7. Implementa semântica HTML e teclado antes do acabamento visual e cobre o
   comportamento com testes.
8. Mede performance apenas diante de um sintoma, com profiler ou métrica de
   produção.
9. Registra no `INTERFACE.md` cada bloco criado, alterado ou reaproveitado.

## Padrões aplicados

- Composição com `children` e slots no lugar de um componente genérico com
  muitas props de configuração.
- Em Laravel com React, shadcn/ui fornece os primitives e o ReUI fornece as
  composições gratuitas, enquanto grade, formulário, filtros e overlays viram
  componentes próprios.
- Uma prop não é copiada para o estado. O componente lê a prop ou deriva o
  valor no render.
- Carregamento, vazio, erro e sucesso são estados explícitos, além de um único
  booleano `loading`.
- Listas usam `key` estável vinda do registro, como o id.
- Cada `Context.Provider` é separado pela frequência de mudança.
- `memo`, `useMemo` e `useCallback` entram depois de uma medição. Com o React
  Compiler ligado no build, o compilador cuida dessa otimização e a
  memoização manual deixa de ser necessária na maioria dos casos.
- Abas, painéis e formulários que serão reabertos usam `<Activity>` para
  preservar estado e DOM em vez de serem desmontados, com cleanup nos efeitos
  de mídia.
- Os testes verificam texto, papel e estado visíveis, em vez de detalhes
  internos dos hooks.

## Erros que ele evita

- `useEffect(() => setX(prop), [prop])`, que duplica o estado.
- Cadeias de efeitos que disparam outros efeitos.
- Dependências incompletas silenciadas com `eslint-disable`.
- `useEffectEvent` usado para esconder uma dependência que deveria reexecutar
  o efeito.
- Um único `Context.Provider` com todo o estado global da aplicação.
- `"use client"` em cascata para contornar um erro de hook no Next.js.

## Como conferir o resultado

- A superfície alterada foi percorrida por teclado e testada com leitor de
  tela quando há papel, foco ou anúncio novo.
- Cada estado modelado tem teste, incluindo a recuperação de erro.
- O console não mostra warnings de chaves, ordem de hooks ou hydration.
- Profiling e análise de bundle aparecem com medição de antes e depois quando
  existe uma suposição de performance.
- O build confirma a versão do React usada: `useEffectEvent` e `<Activity>`
  exigem 19.2, e `<ViewTransition>` exige 19.3.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-react --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Componentes de UI](ui-components.md) fornece as composições gratuitas do
  ReUI, as primitives shadcn/ui e a biblioteca visual.
- [Interface](interface.md) define a composição da página e aprofunda a
  acessibilidade.
- [Tailwind CSS](tailwind-css.md) estiliza os componentes.
- [Next.js](nextjs.md) cuida do limite entre servidor e cliente.
- [TypeScript](typescript.md) tipa props e estado.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-react/SKILL.md),
com modelagem de estado, efeitos, composição e testes no arquivo de referência
da mesma pasta.
