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
  rotas): combine com a skill do framework e use esta para o contrato de
  tipos que ele expõe.
- Combinar com `$specsfy-specialist-architecture` quando o tipo modela um
  contrato de API consumido por outro serviço.

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a linha `| Especialistas |` da tabela de
   metadados, a subseção `#### Especialistas` em `### 8. Plano técnico` e a
   seção que a fase está escrevendo. Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md` e, quando a mudança publicar ou alterar pacote,
   `.specsfy/PACKAGES.md`.
   - Fonte de entrada por fase: em `specsfy-02-backlog`, sem spec, leia e
     registre no item de `specs/backlog/`; em specify e validate, leia a spec
     aberta (linha `| Especialistas |`, subseção `#### Especialistas`, seção
     em escrita) e escreva nela; em `specsfy-06-implement`, siga a tarefa
     indicada. Só `specsfy-05-tasks` escreve a seção 14: aqui apenas se indica
     o que a tarefa deve prever, sem criar tarefa.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-typescript`. Sem indicação, confirme
   pelo "Quando usar" acima qual contrato de tipos está em jogo.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Registre o contrato público de tipos na seção 8 ou em
   `### 10. Interfaces e contratos` e cite o typecheck como verificação; ao
   publicar pacote, alinhe `.specsfy/PACKAGES.md`.

## Fluxo

1. Ler `tsconfig` (strict flags efetivas), `package.json#type`, bundler e
   runtime alvo, além da versão do TypeScript instalada antes de recomendar uma
   sintaxe ou opção específica. Registre a geração: TypeScript 6.0 e 7.0
   mudaram defaults e removeram flags (detalhe em
   [references/standards.md](references/standards.md)); o 7.0 é o compilador
   nativo, sem API pública, e ferramentas que embutem o compilador podem exigir
   o 6.0 em paralelo.
2. Identificar as fronteiras não confiáveis do código alterado (entrada de
   rede, arquivo, variável de ambiente, resposta de terceiro) e os tipos que
   formam a API pública do módulo.
3. Modelar os estados válidos com unions discriminadas e narrowing,
   eliminando por construção combinações de campos que nunca deveriam
   coexistir.
4. Deixar a inferência trabalhar internamente; anotar explicitamente apenas
   onde o contrato precisa ficar estável (assinatura pública, retorno de
   função exportada).
5. Eliminar `any`, `as` e `!` injustificados na área alterada: cada um deve
   ter uma razão documentada ou dar lugar a narrowing real.
6. Validar todo dado externo em runtime com um schema antes de tratá-lo como
   o tipo esperado; tipo estático não impede um payload malformado em
   produção.
7. Rodar typecheck sem emissão, testes, lint e build em todos os targets
   reais (Node, browser, edge) antes de considerar a mudança pronta.

## Padrões

- Confirmar as opções strict efetivas: em TypeScript 5.x elas precisam ser
  ativadas (`strict`, `strictNullChecks`, `noUncheckedIndexedAccess` quando
  viável); a partir do 6.0, `strict` já é `true` por default. Corrigir os
  erros revelados pelas flags, nunca silenciá-los com cast cosmético.
- Respeitar o `moduleResolution` da geração instalada: `node`/`node10` e
  `classic` foram removidos no 7.0; use `bundler` ou `nodenext`. `baseUrl`
  também saiu, e `paths` passa a ser relativo à raiz do projeto.
- Lembrar que, a partir do 6.0, `module` default é `esnext`, `types` default é
  `[]`, `rootDir` default é `./` e `noUncheckedSideEffectImports` é `true`:
  projeto que depende de `@types` global precisa listar os pacotes.
- Preferir uma union discriminada (`{ status: "ok"; data: T } | { status: "error"; error: E }`)
  a combinações de booleanos/campos opcionais que permitem estado inválido
  (`{ loading: true; data: T; error: E }` simultâneos).
- Usar `unknown`, não `any`, para dado ainda não validado numa fronteira.
  Só tratá-lo como o tipo esperado depois de narrowing ou parse explícito.
- Manter generics mínimos: um parâmetro de tipo só se justifica quando expressa
  uma relação real entre dois ou mais valores (entrada e saída, chave e
  valor); generic sem essa relação é complexidade sem benefício.
- Preferir union de literais ou objeto `as const` a `enum` quando
  interoperabilidade com JS puro ou serialização simples importa: `enum`
  gera código em runtime e tem regras de comparação próprias.
- Separar imports `import type` de imports de valor. Respeitar a
  configuração ESM/CJS do projeto (`moduleResolution`, `type` no
  `package.json`) em vez de assumir a interoperabilidade de outro projeto.
- Testar o tipo público quando uma regressão de inferência seria
  observável para quem consome a biblioteca (ex.: com `tsd` ou um teste de
  compilação dedicado), não apenas o comportamento em runtime.

## Antipadrões

- `as SomeType` para silenciar um erro do compilador sem checar se o valor
  realmente tem essa forma: é uma promessa não verificada que quebra em
  runtime na primeira divergência.
- `!` (non-null assertion) em uma cadeia de acesso a propriedade só para
  "passar no build": esconde exatamente o caso `null`/`undefined` que o
  `strictNullChecks` foi ativado para pegar.
- Tipar a resposta de uma API externa direto do retorno de `fetch` sem
  validação: o tipo é uma afirmação do desenvolvedor, não uma garantia; um
  contrato mudou no backend e o app só descobre com um crash em produção.
- Generic decorativo (`function identity<T>(x: T): T`) usado como se desse
  segurança adicional sem expressar nenhuma relação real entre parâmetros.
- Duplicar um tipo já exportado por outro módulo com um nome ligeiramente
  diferente ("tipo gêmeo") em vez de importar e reexportar: os dois
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
  explicativo, `as any`, cast duplo (`as unknown as T`) e tipos duplicados:
  cada ocorrência é uma dívida a justificar ou remover.
- Não declarar o código "type-safe" apenas porque compila; sem validação
  runtime nas fronteiras e sem os testes acima, a garantia é só estática.

## Skills relacionadas

- `$specsfy-specialist-react` para a lógica de componente que consome os
  tipos modelados aqui (props, estado, union de eventos).
- `$specsfy-specialist-nextjs` consome estes tipos para params de rota, Server
  Actions/endpoints e content collections; esta skill não decide roteamento ou
  fronteira server/client.
- `$specsfy-specialist-tailwind-css` e `$specsfy-specialist-ui-components` usam
  tipos desta skill para variantes (`cva`) e schemas de formulário fortemente
  tipados.
- `$specsfy-specialist-architecture` quando o tipo espelha um contrato de
  API consumido por outro serviço: a fonte de verdade do contrato vive lá.
- `$specsfy-specialist-code-review` para revisão ampla além de tipos, quando
  a mudança também afeta lógica de negócio ou arquitetura.
- `$specsfy-specialist-mcp` usa estes tipos em `inputSchema` e
  `structuredContent`; o contrato do protocolo fica lá, o tipo do domínio
  continua aqui.
- `$specsfy-specialist-cloudflare` quando o código tipado rodar em Worker ou
  Pages: tipo e configuração ficam aqui, runtime e binding lá.
- `$specsfy-specialist-testing` usa o mesmo contrato de tipo ao escrever o
  teste que comprova o comportamento.

Leia [references/standards.md](references/standards.md) para modelagem de
estado com tipos, configuração strict, módulos, bibliotecas e validação
runtime, com fontes oficiais.
