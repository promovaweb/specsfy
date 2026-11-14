# Astro

O especialista Astro orienta o agente em sites e aplicações Astro com HTML
estático por padrão e JavaScript apenas nas ilhas interativas. Ele cuida das
rotas, das content collections, dos modos de renderização e da medição do
JavaScript enviado ao navegador.

## Quando usar

- O projeto tem `astro.config` ou a dependência `astro` e a tarefa altera uma
  página, um layout, um componente `.astro` ou uma content collection.
- A tarefa cria um endpoint ou uma ilha de interatividade.
- Você precisa escolher entre `static` e `server`, definir a diretiva
  `client:*` correta ou investigar um JavaScript maior que o esperado.

A lógica interna de um componente React hidratado fica com o especialista
React. O especialista Astro define quando e como esse componente hidrata.

## Como ele trabalha

1. Identifica a versão do Astro, o output mode, o adapter, as integrações e as
   fontes de conteúdo do projeto.
2. Classifica cada rota alterada como estática, sob demanda ou endpoint com
   métodos HTTP explícitos.
3. Mantém o HTML sem JavaScript por padrão e hidrata somente o componente
   interativo, com a diretiva mais restritiva para o caso.
4. Modela o conteúdo com content collections e schema Zod. Um frontmatter
   inválido interrompe o build.
5. Define cache, headers, assets e imagens (`astro:assets`) por rota, de acordo
   com o output mode.
6. Executa `astro check`, o build de produção e os testes de cada ilha.
7. Mede o JavaScript enviado e os Core Web Vitals no runtime do adapter, além
   do servidor de desenvolvimento.

## Padrões aplicados

- `client:visible` serve para conteúdo abaixo da dobra e `client:idle` para
  interações de baixa prioridade.
- `client:load` fica reservado para a interação que precisa estar pronta no
  carregamento.
- Cada ilha recebe só as props que exibe, porque toda prop vira JSON no HTML.
- Layouts e componentes `.astro` não hidratam, então dispensam diretiva
  `client:*`.
- Frontmatter, parâmetros de rota e corpo de endpoint passam por schema
  explícito. Um slug duplicado ou uma rota em colisão também gera erro de build.
- O output `server` entra somente nas rotas com personalização por requisição
  ou sessão.
- `canonical`, sitemap e JSON-LD acompanham a URL final de cada página.
- Em adapters edge, o agente confirma o runtime antes de usar `fs`, `process`
  ou outra API do Node.

## Erros que ele evita

- `client:load` aplicado por garantia em todas as ilhas da página.
- Passar um registro inteiro do banco para uma ilha que exibe dois campos.
- Content collection sem schema, com o campo ausente descoberto só em
  produção.
- Output `server` no site inteiro por causa de um único dashboard autenticado.
- Tratar um bug de estado dentro de uma ilha React como configuração de ilha.

## Como conferir o resultado

- `astro check`, a suíte de testes e o build de produção completo.
- O HTML servido com JavaScript desabilitado continua navegável e legível.
- Links internos, páginas 404 e 500, imagens otimizadas, RSS, sitemap e
  metadados quando o site os publica.
- Preview no runtime do adapter, com o tamanho do JavaScript por rota e os
  Core Web Vitals antes e depois da mudança.
- Uma página só é descrita como estática depois da inspeção do HTML gerado.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-astro --agent universal --copy --full-depth
```

## Especialistas relacionados

- [React](react.md) cuida da lógica dos componentes hidratados.
- [Componentes React](react-ui-components.md) fornece referências TSX para as
  ilhas.
- [Acessibilidade Web](web-accessibility.md) revisa landmarks, headings e foco.
- [Performance](performance-engineering.md) investiga os Core Web Vitals.
- [APIs Web](web-api-design.md) revisa endpoints consumidos por outros
  clientes.
- [TypeScript](typescript.md) tipa schemas, props e endpoints.
- [Tailwind CSS](tailwind-css.md) e [shadcn/ui](shadcn-ui.md) cuidam do
  estilo e dos componentes visuais.

Next.js e Astro têm modelos de renderização e de cache diferentes. Use o
especialista do framework presente no projeto.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-astro/SKILL.md),
com detalhes sobre renderização e ilhas no arquivo de referência da mesma
pasta.
