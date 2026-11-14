---
name: specsfy-specialist-astro
description: Construir e revisar sites Astro com renderização, content collections, ilhas de interatividade, actions, integrações, imagens, SEO e performance. Use quando houver astro.config ou dependência astro e a tarefa tocar páginas, layouts, componentes, endpoints ou conteúdo; use também para decidir a diretiva de hidratação correta de uma ilha; não use para lógica interna do framework de UI hidratado numa ilha React — aí combine com a skill React.
---

# Astro

## Quando usar

- Acionar quando o projeto tem `astro.config` ou dependência `astro` e a
  tarefa envolve página, layout, componente `.astro`, content collection,
  endpoint ou ilha de interatividade.
- Acionar também para decidir output mode (static/server), escolher a
  diretiva `client:*` certa, ou diagnosticar JS enviado ao cliente maior que
  o esperado.
- Não acionar para a lógica interna de um componente React/Vue/Svelte
  hidratado dentro de uma ilha; usar `$specsfy-specialist-react` (ou
  equivalente) para o comportamento do componente em si, mantendo este
  especialista para a escolha de quando e como hidratá-lo.
- Combinar com `$specsfy-specialist-web-accessibility` para landmarks,
  headings e navegação por teclado do site e com
  `$specsfy-specialist-performance-engineering` quando o sintoma for Core Web
  Vitals fora do SLO.

## Fluxo

1. Descobrir versão do Astro, output mode (`static`/`server`), adapter,
   integrações ativas e fontes de conteúdo (Markdown, MDX, CMS remoto) antes
   de recomendar.
2. Classificar cada rota alterada como estática (conhecida no build),
   sob demanda (server-rendered por requisição) ou endpoint (contrato HTTP
   com `GET`/`POST` explícitos).
3. Manter HTML estático e zero-JS por padrão; hidratar apenas o componente
   que precisa de interação, com a diretiva `client:*` mais restritiva
   possível para o caso.
4. Modelar conteúdo com content collections e schema (Zod) explícito; tratar
   frontmatter inválido como erro de build, não como dado tolerado.
5. Definir caching, headers, assets e imagens (`astro:assets`) por rota,
   coerente com o output mode escolhido.
6. Testar `astro check`, build de produção, conteúdo inválido no schema e o
   comportamento hidratado de cada ilha isoladamente.
7. Medir payload de JS enviado ao cliente e Core Web Vitals no adapter alvo
   real, não apenas no dev server.

## Padrões

- Usar a menor diretiva de hidratação compatível com a interação:
  `client:visible` para algo abaixo da dobra, `client:idle` para algo de
  baixa prioridade, `client:load` só quando a interação precisa estar pronta
  imediatamente; nunca `client:load` por padrão em tudo.
- Não transportar para uma ilha mais dado do que ela usa para renderizar:
  cada prop de uma ilha vira JSON serializado no HTML e conta no payload.
- Manter layouts e componentes `.astro` server-first; um componente `.astro`
  nunca precisa de diretiva `client:*` porque ele não hidrata: apenas os
  componentes de framework (React/Vue/Svelte) embutidos hidratam.
- Validar todo conteúdo (frontmatter, parâmetros de rota, body de endpoint)
  na fronteira com schema explícito; tratar slug duplicado ou rota colidente
  como erro de build, não como comportamento silencioso.
- Escolher `server` output (SSR) apenas quando personalização por
  requisição, sessão ou frescor de dado realmente justificar: do contrário,
  `static` é mais rápido, mais barato e mais simples de cachear.
- Preservar `canonical`, sitemap e dados estruturados (JSON-LD) coerentes com
  a URL final de cada página, inclusive em conteúdo gerado dinamicamente.
- Não assumir APIs completas do Node (`fs`, `process`) dentro de adapters
  edge; confirmar o runtime do adapter alvo antes de usar uma dependência
  server-only.

## Antipadrões

- `client:load` aplicado "por garantia" em toda ilha da página: infla o JS
  enviado mesmo quando `client:visible` ou `client:idle` bastariam.
- Passar o objeto de dado completo (ex.: registro inteiro do banco) como prop
  para uma ilha que só exibe dois campos, cada byte extra é serializado e
  enviado ao navegador.
- Content collection sem schema Zod, "confiando" que o frontmatter está
  correto: um campo ausente só aparece como bug em produção, não em build.
- Usar `server` output para o site inteiro quando só uma rota (ex.: um
  dashboard autenticado) precisa de SSR, perde cache estático nas páginas
  que não precisavam disso.
- Confundir a responsabilidade desta skill com a do framework hidratado: um
  bug de estado dentro de uma ilha React é problema de
  `$specsfy-specialist-react`, não de configuração de ilha.

## Validação

- Rodar `astro check`, a suíte de testes do projeto e o build de produção
  completo antes de considerar a mudança pronta.
- Inspecionar o HTML servido com JavaScript desabilitado (deve continuar
  navegável e legível) e então validar a hidratação de cada ilha
  isoladamente.
- Percorrer links internos, páginas de erro (404/500), imagens otimizadas e
  a presença de RSS/sitemap/metadados quando o site os expõe.
- Fazer preview no runtime real do adapter (não só `astro dev`), medindo
  payload de JS por rota e Core Web Vitals antes/depois da mudança.
- Não declarar uma página "estática" ou "zero-JS" sem inspecionar o HTML
  gerado; linguagem absoluta sem essa comprovação é proibida.

## Skills relacionadas

- `$specsfy-specialist-react-ui-components` fornece referências TSX para ilhas
  React; esta skill decide onde a ilha existe e como ela hidrata no Astro.
- `$specsfy-specialist-react` (ou o framework de UI equivalente) para a
  lógica interna do componente hidratado dentro de uma ilha.
- `$specsfy-specialist-web-accessibility` para landmarks, headings e ordem de
  foco do site publicado.
- `$specsfy-specialist-performance-engineering` para investigar Core Web
  Vitals com metodologia de medição própria.
- `$specsfy-specialist-web-api-design` quando um endpoint Astro expõe um
  contrato HTTP consumido por outro cliente além do próprio site.
- `$specsfy-specialist-typescript` para o schema de content collections,
  props de componente e tipos de endpoint.
- `$specsfy-specialist-tailwind-css` e `$specsfy-specialist-shadcn-ui` para a
  camada de estilo e os componentes visuais usados em layouts e ilhas.
- Não use `$specsfy-specialist-nextjs` para escolhas deste projeto: são
  frameworks distintos com fronteiras server/client e cache diferentes; migrar
  um padrão de um para o outro sem checar a skill correspondente costuma
  quebrar a semântica de cache.

Leia [references/standards.md](references/standards.md) para modos de
renderização, ilhas, content collections, actions, imagens e deploy, com
fontes oficiais.
