# Acessibilidade Web

O especialista Acessibilidade Web orienta o agente na implementação e na
auditoria de páginas, componentes, formulários e fluxos de acordo com a WCAG.
Ele corrige primeiro o HTML nativo, testa com teclado e tecnologias assistivas
e documenta o escopo e as limitações de cada conformidade declarada.

## Quando usar

- Você vai implementar ou auditar páginas, componentes, formulários,
  dashboards, mídia ou fluxos principais segundo a WCAG.
- Há problemas de teclado, foco, nome acessível, contraste, zoom, reflow ou
  leitor de tela.

Preferências visuais sem uma barreira observável ficam com o especialista UI
Design. A correção do código usa o especialista do framework, enquanto a
conformidade continua sob responsabilidade deste especialista.

## Como ele trabalha

1. Identifica a política, o nível WCAG, os navegadores, as tecnologias
   assistivas, o público e os fluxos principais.
2. Lista as barreiras de estrutura, percepção, teclado, foco, formulários,
   atualizações dinâmicas, mídia e autenticação.
3. Corrige o HTML e o comportamento nativos antes de adicionar ARIA ou um
   widget próprio.
4. Implementa teclado, ordem lógica, foco visível e gestão de foco em
   aberturas, fechamentos e atualizações assíncronas.
5. Valida contraste, zoom, reflow, espaçamento de texto, tamanho dos alvos,
   forced colors, orientação, movimento e alternativas de mídia.
6. Executa análise automática e inspeção manual e classifica cada achado pelo
   requisito da WCAG, pelo impacto, pela reprodução e pela correção.
7. Exercita as tarefas principais com tecnologia assistiva e documenta
   cobertura, limitações e barreiras restantes.

## Padrões aplicados

- Nenhuma ação depende apenas de hover, cor, gesto ou ponteiro preciso.
- Cada controle tem nome, papel, valor e estado corretos.
- O modal mantém o foco dentro dele, fecha de forma previsível e devolve o
  foco ao gatilho.
- Os erros ficam associados aos campos e aparecem resumidos quando
  necessário.
- Atualizações assíncronas anunciam apenas a informação relevante.
- Gráficos oferecem texto ou tabela equivalente e não usam a cor como único
  sinal.
- ARIA não corrige uma semântica nativa incorreta.

## Erros que ele evita

- Declarar conformidade porque o axe ou um linter não apontou erros.
- Aplicar `role`, `tabindex` e handlers a uma `div` quando existe um elemento
  nativo equivalente.
- Usar `aria-label` para substituir o texto visível sem necessidade.
- Mover o foco a cada atualização assíncrona e interromper a leitura.
- Esconder o overflow para contornar o reflow, deixando conteúdo inacessível.

## Como conferir o resultado

- O fluxo completo funciona por teclado, sem armadilha de foco nem foco
  encoberto, com ordem e retorno corretos em overlays.
- O texto foi ampliado a 200% e o reflow foi conferido a 320 CSS px, junto com
  o espaçamento de texto e a orientação.
- O contraste de textos, componentes e indicadores de foco foi medido, com
  forced colors e movimento reduzido testados.
- A análise automática foi combinada com a inspeção da árvore de
  acessibilidade e com leitor de tela nos fluxos de maior impacto.
- Uma conformidade WCAG só é declarada com requisitos, escopo, comprovação,
  limitações e exceções registrados.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-web-accessibility \
  --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Componentes React](react-ui-components.md) e [shadcn/ui](shadcn-ui.md)
  fornecem os componentes auditados.
- [Tailwind CSS](tailwind-css.md) implementa contraste, forced colors e
  movimento reduzido.
- [UI Design](ui-design.md) define hierarquia, tokens e estados visuais.
- [UX Design](ux-design.md) pesquisa o sucesso das tarefas com tecnologias
  assistivas.
- [React](react.md) e [Next.js](nextjs.md) implementam a correção no
  framework.
- [Code Review](code-review.md) amplia a revisão para outras falhas.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-web-accessibility/SKILL.md),
com os requisitos da WCAG 2.2 e a matriz de testes no arquivo de referência
da mesma pasta.
