# TypeScript

O especialista TypeScript orienta o agente na configuração do `tsconfig`, na
modelagem de tipos e na validação de entradas externas. Ele usa unions
discriminadas para impedir estados inválidos e valida em runtime tudo o que
vem de fora do código.

## Quando usar

- A tarefa envolve `tsconfig`, erros de compilação, modelagem de tipos,
  generics, módulos ou declarations.
- Você vai revisar uma API pública em TypeScript ou JavaScript antes da
  publicação.
- Você precisa validar uma entrada vinda da rede, de um arquivo ou de uma
  variável de ambiente.

A lógica de negócio e a do framework ficam com o especialista correspondente.
Este especialista cuida do contrato de tipos que eles expõem.

## Como ele trabalha

1. Lê o `tsconfig`, o `type` do `package.json`, o bundler, o runtime e a
   versão do TypeScript.
2. Identifica as entradas não confiáveis e os tipos que formam a API pública
   do módulo.
3. Modela os estados válidos com unions discriminadas e narrowing.
4. Deixa a inferência trabalhar internamente e anota apenas os contratos
   estáveis, como assinaturas públicas e retornos exportados.
5. Remove `any`, `as` e `!` sem justificativa da área alterada.
6. Valida cada entrada externa com um schema em runtime antes de usá-la.
7. Roda typecheck sem emissão, testes, lint e build em todos os ambientes de
   destino, como Node, navegador e edge.

## Padrões aplicados

- As opções strict compatíveis com o projeto ficam ativas. Os erros que elas
  revelam são corrigidos sem casts cosméticos.
- Uma union como `{ status: "ok"; data: T } | { status: "error"; error: E }`
  substitui combinações de booleanos que permitem estados inválidos.
- Entradas ainda não validadas usam `unknown` no lugar de `any`.
- Um parâmetro genérico só existe quando expressa uma relação entre valores,
  como entrada e saída.
- Uniões de literais ou objetos `as const` substituem `enum` quando a
  interoperabilidade com JavaScript importa.
- `import type` fica separado dos imports de valor. A configuração ESM ou CJS
  do projeto é respeitada.
- Tipos públicos de bibliotecas ganham testes de compilação, por exemplo com
  `tsd`.

## Erros que ele evita

- `as SomeType` para silenciar o compilador sem conferir o formato do valor.
- `!` em uma cadeia de propriedades só para passar no build.
- Tipar a resposta de uma API externa direto do `fetch`, sem validação.
- Generics decorativos sem relação entre parâmetros.
- Tipos duplicados com nomes parecidos em módulos diferentes.

## Como conferir o resultado

- `tsc --noEmit` e o build de todos os ambientes de destino passam.
- Cada validação de entrada externa tem teste em runtime, assim como a
  serialização de tipos que atravessam rede ou storage.
- As declarations `.d.ts` de uma biblioteca foram conferidas com um
  consumidor real ou simulado.
- A área alterada não tem `@ts-ignore`, `as any`, cast duplo ou tipos
  duplicados sem justificativa.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-typescript --agent universal --copy --full-depth
```

## Especialistas relacionados

- [React](react.md) consome os tipos em props, estado e eventos.
- [Next.js](nextjs.md) e [Astro](astro.md) usam os tipos em rotas, Server
  Actions e content collections.
- [Tailwind CSS](tailwind-css.md) e [shadcn/ui](shadcn-ui.md) usam os tipos em
  variantes `cva` e schemas de formulário.
- [APIs Web](web-api-design.md) guarda a fonte oficial dos contratos de API.
- [Code Review](code-review.md) faz a revisão ampla da mudança.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-typescript/SKILL.md),
com configuração strict, módulos, bibliotecas e validação em runtime no
arquivo de referência da mesma pasta.
