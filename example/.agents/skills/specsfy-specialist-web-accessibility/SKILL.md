---
name: specsfy-specialist-web-accessibility
description: Implementar e auditar acessibilidade web com WCAG, HTML semântico, teclado, foco, nomes acessíveis, contraste, zoom e tecnologias assistivas. Use para componentes, páginas, formulários, dashboards e revisões de conformidade; automação não substitui teste manual.
---

# Acessibilidade web

## Quando usar

- Acionar ao implementar ou auditar páginas, componentes, formulários,
  dashboards, mídia e fluxos críticos contra WCAG e semântica da plataforma.
- Acionar para bugs de teclado, foco, nome acessível, contraste, zoom, reflow,
  leitor de tela ou outras tecnologias assistivas.
- Não acionar apenas para preferência visual sem barreira observável; usar
  `$specsfy-specialist-ui-design`.
- Combinar com a skill do framework para corrigir o código sem transferir a
  responsabilidade de conformidade ao framework.

## Fluxo

1. Descobrir política, nível WCAG, navegadores, tecnologias assistivas, público
   e fluxos críticos; separar auditoria de conformidade de teste de usabilidade.
2. Listar barreiras por estrutura, percepção, teclado, foco, formulário,
   atualização dinâmica, mídia e autenticação usando
   [references/standards.md](references/standards.md).
3. Corrigir HTML e comportamento nativos antes de adicionar ARIA ou widget
   customizado; verificar nome, papel, valor, estado e relações calculados.
4. Implementar teclado, ordem lógica, foco visível, foco não encoberto e gestão
   após abertura, fechamento, navegação e atualização assíncrona.
5. Validar contraste, zoom, reflow, espaçamento de texto, target size, forced
   colors, orientação, movimento e alternativas de mídia.
6. Executar análise automática e inspeção manual; classificar cada achado por
   critério, impacto, caminho de reprodução e correção verificável.
7. Exercitar tarefas críticas com tecnologia assistiva representativa e
   documentar cobertura, limitações, exceções e barreiras que permanecem.

## Padrões

- Nenhuma ação depende apenas de hover, cor, gesto ou pointer preciso.
- Todo controle tem nome, papel, valor e estado corretos.
- Modal prende foco, fecha por mecanismo previsível e devolve foco.
- Erros são associados aos campos e resumidos quando necessário.
- Updates assíncronos anunciam somente informação relevante.
- Charts oferecem texto/tabela equivalente e não dependem de cor.
- ARIA nunca corrige semântica nativa incorreta.

## Antipadrões

- Declarar conformidade porque axe ou um linter zerou; automação não confirma
  ordem de foco, linguagem, alternativas equivalentes ou fluxo completo.
- Aplicar `role`, `tabindex` e handlers a `div` quando um elemento nativo cobre
  o contrato; recria parcialmente teclado e semântica do browser.
- Usar `aria-label` para substituir texto visível sem necessidade; nomes
  divergentes quebram reconhecimento por voz e manutenção.
- Mover foco em toda atualização assíncrona; interrompe leitura e contexto.
  Anuncie status proporcional e mova foco somente quando a tarefa exigir.
- Ocultar overflow para “resolver” reflow; o conteúdo continua inacessível,
  apenas deixa de ser alcançável visualmente.

## Validação

- Executar fluxo completo por teclado, sem armadilha, perda ou foco encoberto;
  conferir ordem e retorno de foco em overlays.
- Verificar resize de texto a 200% e reflow equivalente a 320 CSS px para
  conteúdo vertical, além de spacing de texto e orientação suportada.
- Medir contraste de texto, componentes e indicadores de foco e testar forced
  colors e reduced motion quando aplicáveis.
- Combinar axe/linter com inspeção do accessibility tree e leitor de tela nos
  fluxos de maior impacto.
- Não declarar conformidade WCAG sem mapear critérios, escopo, comprovação,
  limitações e exceções; “acessível” não é sinônimo de teste automatizado verde.

## Skills relacionadas

- `$specsfy-specialist-react-ui-components` e
  `$specsfy-specialist-shadcn-ui` fornecem componentes que esta skill audita
  por semântica, foco, teclado e nome acessível.
- `$specsfy-specialist-tailwind-css` implementa contraste, forced colors,
  reflow e reduced motion nos utilitários e tokens observados.
- `$specsfy-specialist-ui-design` governa hierarquia, tokens e estados visuais
  que precisam satisfazer contraste, reflow e foco.
- `$specsfy-specialist-ux-design` pesquisa compreensão e sucesso de tarefa,
  inclusive com pessoas que usam tecnologias assistivas.
- `$specsfy-specialist-react` e `$specsfy-specialist-astro` ou
  `$specsfy-specialist-nextjs` implementam a correção no framework observado.
- `$specsfy-specialist-code-review` amplia a revisão para falhas além do recorte
  de acessibilidade.

Leia [references/standards.md](references/standards.md) para critérios WCAG 2.2,
contratos de componentes, formulários, conteúdo dinâmico e matriz de testes.
