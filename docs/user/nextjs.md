# Usar Specsfy com Next.js

`$specsfy-specialist-nextjs` acrescenta ao fluxo do Specsfy as escolhas de
Server e Client Components, cache, mutations, rotas e deploy próprias do
Next.js. A skill confirma o router e a versão porque os padrões de cache mudam
entre gerações do framework.

## Confirmar a detecção

O catálogo detecta Next.js pela dependência `next` em `package.json` ou por
`next.config.js`, `next.config.mjs` e `next.config.ts`. Confirme a versão e o
router. O runtime, o destino de deploy e as flags ativas também precisam ser
registrados no plano.

## Instalação

```bash
specsfy skills detect --project .
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-nextjs --agent universal --copy --full-depth
```

Quando todas as recomendações forem aplicáveis, `--detected` instala as bases e
os especialistas em uma única execução. Confira depois se
`specsfy-specialist-nextjs` aparece no catálogo instalado:

```bash
specsfy install --project . --detected
```

## Aplicar na spec

1. Conduza a ideia até a spec pelo [primeiro projeto](getting-started.md).
2. Peça ao agente para usar `$specsfy-specialist-nextjs` na fatia ativa.
3. Mapeie a rota, o layout e os estados `loading`, `error` e `not-found`.
   Registre também o limite entre o código do servidor e a interação no
   navegador.
4. No App Router, mantenha componentes no servidor por padrão e mova ao cliente
   apenas o componente que requer estado, eventos ou APIs do navegador.
5. Defina cache, revalidation, tags e comportamento dinâmico explicitamente.
6. Trate Server Actions e Route Handlers como superfícies públicas: valide
   autenticação, autorização e entrada em cada mutation.
7. Derive testes para estados, redirects, autorização, invalidação e isolamento
   das informações de cada usuário.
8. Execute lint, typecheck, testes, build e runtime de produção conforme os
   scripts do `package.json`.

## O que o especialista acrescenta

- controle do limite entre Server e Client Components.
- prevenção de segredos e módulos server-only no bundle cliente.
- análise de waterfalls, streaming e recuperação de erro.
- cache como contrato compatível com a versão instalada.
- metadata, assets, bundle, imagens, fontes e Web Vitals.

## Resultado esperado

As escolhas de renderização, cache e segurança ficam rastreadas pela spec e
provadas por testes e build na versão e no router realmente usados.

## Limites

- não presuma App Router ou semântica de cache sem confirmar a versão.
- não mova uma árvore inteira ao cliente por conveniência.
- não use middleware para lógica longa ou incompatível com o runtime.
- não assuma comportamento específico do host sem documentá-lo.

Não use esse especialista para escolher App Router, Pages Router ou runtime sem
evidência. O código, `package.json`, o lockfile e a configuração comprovam o
router, a versão, o runtime e os scripts disponíveis no projeto consumidor.
