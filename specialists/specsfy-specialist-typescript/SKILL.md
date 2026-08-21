---
name: specsfy-specialist-typescript
description: Modelar e revisar TypeScript seguro com strictness, narrowing, generics, modules, declarations, validação runtime e APIs públicas. Use para tsconfig, tipos, erros de compilação, bibliotecas ou contratos TS/JS; use também para eliminar any/assertions injustificados numa área alterada; não use para lógica de framework (React, Next.js) nem confunda tipo estático com validação de dado externo — tipo não substitui parse em runtime.
---

# TypeScript

## Quando usar

- Acionar quando a tarefa envolve `tsconfig`, erro de compilação, modelagem
  de tipo, generics, módulos ou declarations de biblioteca.
- Acionar também para revisar uma API pública TS/JS antes de publicá-la, ou
  para decidir como validar um dado que entra de fora (rede, arquivo, env).
- Não acionar para a lógica de negócio ou de framework em si (React, hooks,
  rotas) — combine com a skill do framework e use esta para o contrato de
  tipos que ele expõe.
- Combinar com `$specsfy-specialist-web-api-design` quando o tipo modela um
  contrato de API consumido por outro serviço.

## Fluxo

1. Ler `tsconfig` (strict flags ativas), `package.json#type`, bundler e
   runtime alvo, e a versão do TypeScript instalada antes de recomendar uma
   sintaxe ou opção específica.
2. Identificar as fronteiras não confiáveis do código alterado (entrada de
   rede, arquivo, variável de ambiente, resposta de terceiro) e os tipos que
   formam a API pública do módulo.
3. Modelar os estados válidos com unions discriminadas e narrowing,
   eliminando por construção combinações de campos que nunca deveriam
   coexistir.
4. Deixar a inferência trabalhar internamente; anotar explicitamente apenas
   onde o contrato precisa ficar estável (assinatura pública, retorno de
   função exportada).
5. Eliminar `any`, `as` e `!` injustificados na área alterada — cada um deve
   ter uma razão documentada ou dar lugar a narrowing real.
6. Validar todo dado externo em runtime com um schema antes de tratá-lo como
   o tipo esperado; tipo estático não impede um payload malformado em
   produção.
7. Rodar typecheck sem emissão, testes, lint e build em todos os targets
   reais (Node, browser, edge) antes de considerar a mudança pronta.

## Padrões

- Ativar as opções strict compatíveis com o projeto (`strict`,
  `strictNullChecks`, `noUncheckedIndexedAccess` quando viável) e corrigir os
  erros revelados por elas, nunca silenciá-los com cast cosmético.
- Preferir uma union discriminada (`{ status: "ok"; data: T } | { status: "error"; error: E }`)
  a combinações de booleanos/campos opcionais que permitem estado inválido
  (`{ loading: true; data: T; error: E }` simultâneos).
- Usar `unknown` — não `any` — para dado ainda não validado numa fronteira, e
  só tratá-lo como o tipo esperado depois de narrowing ou parse explícito.
- Manter generics mínimos: um parâmetro de tipo só se justifica quando expressa
  uma relação real entre dois ou mais valores (entrada e saída, chave e
  valor); generic sem essa relação é complexidade sem benefício.
- Preferir union de literais ou objeto `as const` a `enum` quando
  interoperabilidade com JS puro ou serialização simples importa — `enum`
  gera código em runtime e tem regras de comparação próprias.
- Separar imports `import type` de imports de valor, e respeitar a
  configuração ESM/CJS do projeto (`moduleResolution`, `type` no
  `package.json`) em vez de assumir a interoperabilidade de outro projeto.
- Testar o tipo público quando uma regressão de inferência seria
  observável para quem consome a biblioteca (ex.: com `tsd` ou um teste de
  compilação dedicado), não apenas o comportamento em runtime.

## Antipadrões

- `as SomeType` para silenciar um erro do compilador sem checar se o valor
  realmente tem essa forma — é uma promessa não verificada que quebra em
  runtime na primeira divergência.
- `!` (non-null assertion) em uma cadeia de acesso a propriedade só para
  "passar no build" — esconde exatamente o caso `null`/`undefined` que o
  `strictNullChecks` foi ativado para pegar.
- Tipar a resposta de uma API externa direto do retorno de `fetch` sem
  validação — o tipo é uma afirmação do desenvolvedor, não uma garantia; um
  contrato mudou no backend e o app só descobre com um crash em produção.
- Generic decorativo (`function identity<T>(x: T): T`) usado como se desse
  segurança adicional sem expressar nenhuma relação real entre parâmetros.
- Duplicar um tipo já exportado por outro módulo com um nome ligeiramente
  diferente ("tipo gêmeo") em vez de importar e reexportar — os dois
  divergem silenciosamente na próxima mudança.

## Validação

- Rodar typecheck sem emissão (`tsc --noEmit` ou equivalente) e o build de
  todos os targets configurados (Node, browser, edge) antes de considerar a
  mudança pronta.
- Escrever teste runtime para cada validação de dado externo e para
  serialização/deserialização de tipos que atravessam uma fronteira (rede,
  storage).
- Quando o projeto publica uma biblioteca, checar as declarations geradas
  (`.d.ts`) e testar compatibilidade com pelo menos um consumidor real ou
  simulado.
- Buscar na área alterada por `@ts-ignore`, `@ts-expect-error` sem comentário
  explicativo, `as any`, cast duplo (`as unknown as T`) e tipos duplicados —
  cada ocorrência é uma dívida a justificar ou remover.
- Não declarar o código "type-safe" apenas porque compila; sem validação
  runtime nas fronteiras e sem os testes acima, a garantia é só estática.

## Skills relacionadas

- `$specsfy-specialist-react` para a lógica de componente que consome os
  tipos modelados aqui (props, estado, union de eventos).
- `$specsfy-specialist-nextjs` e `$specsfy-specialist-astro` consomem estes
  tipos para params de rota, Server Actions/endpoints e content collections;
  esta skill não decide roteamento ou fronteira server/client.
- `$specsfy-specialist-tailwind-css` e `$specsfy-specialist-shadcn-ui` usam
  tipos desta skill para variantes (`cva`) e schemas de formulário fortemente
  tipados.
- `$specsfy-specialist-web-api-design` quando o tipo espelha um contrato de
  API consumido por outro serviço — a fonte de verdade do contrato vive lá.
- `$specsfy-specialist-code-quality-review` quando o tipo dinâmico ou a
  asserção aparecerem numa revisão de conformidade do código recém-escrito;
  a decisão de modelagem continua aqui.
- `$specsfy-specialist-code-review` para revisão ampla além de tipos, quando
  a mudança também afeta lógica de negócio ou arquitetura.

Leia [references/standards.md](references/standards.md) para modelagem de
estado com tipos, configuração strict, módulos, bibliotecas e validação
runtime, com fontes oficiais.
