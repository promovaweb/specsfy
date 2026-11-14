# Tailwind CSS

O especialista Tailwind CSS orienta o agente no uso de tokens, classes
utilitárias, variantes, responsividade e dark mode. Ele parte dos tokens que o
projeto já declara e trata acessibilidade e preferências do usuário como parte
do componente desde a primeira versão.

## Quando usar

- O projeto depende de `tailwindcss` e a tarefa altera classes, tema,
  variantes, responsividade ou dark mode.
- Você precisa saber se um padrão visual repetido deve virar token, `@apply`
  local ou componente extraído.

A escolha da biblioteca de componentes fica com os especialistas shadcn/ui ou
Componentes React. Este especialista cuida dos tokens e das classes usados por
esses componentes.

## Como ele trabalha

1. Confirma a versão do Tailwind, a integração (Vite, PostCSS ou framework) e
   onde os tokens são declarados, em `tailwind.config.js` ou em `@theme` na
   versão 4.
2. Traduz o layout e os estados da interface em breakpoints ou `@container`
   antes de escrever classes.
3. Reaproveita os tokens semânticos existentes antes de usar um valor
   arbitrário como `w-[137px]`.
4. Escreve mobile-first, com o estilo base para a tela menor e ajustes nos
   breakpoints maiores.
5. Cobre `hover`, `focus-visible`, `disabled`, `aria-*`, dark mode,
   `motion-reduce` e `forced-colors` desde a primeira versão.
6. Extrai um componente quando o padrão repetido é uma unidade reconhecível,
   como um card ou um badge.
7. Confere o CSS do build de produção para garantir que nenhuma classe usada
   ficou de fora.

## Padrões aplicados

- Cor, espaçamento, radius e tipografia usam tokens com nome de intenção,
  como `bg-surface` e `text-muted`.
- Estados usam as variantes do Tailwind, como `hover:`, `aria-selected:` e
  `data-[state=open]:`.
- O `@apply` não substitui componentes, porque separa a classe do elemento
  que ela estiliza.
- Classes dinâmicas vêm de objetos com classes literais completas, porque o
  scanner do Tailwind não executa templates como `text-${color}-500`.
- Dark mode, `prefers-reduced-motion`, `prefers-contrast` e `forced-colors`
  fazem parte do design.
- Layout fluido e `@container` atendem componentes que respondem ao espaço do
  próprio container, como um card dentro de uma sidebar estreita.
- Valores arbitrários repetidos indicam um token ausente na escala.

## Erros que ele evita

- Classe montada por concatenação de variável, que não aparece no CSS final.
- `@apply` usado para recriar dezenas de componentes CSS tradicionais.
- Cores e espaçamentos fixos (`#3b82f6`, `17px`) ao lado de um sistema de
  tokens.
- Dark mode, foco visível ou movimento reduzido adicionados só depois de uma
  reclamação.

## Como conferir o resultado

- O build de produção contém todas as classes esperadas.
- A interface foi testada em telas pequenas e grandes e com zoom de 200% e
  400%, sem perda de conteúdo nem rolagem horizontal indesejada.
- Os estados `hover`, `focus-visible`, `disabled`, carregando, erro e
  selecionado foram percorridos visualmente e por teclado.
- O contraste foi conferido nos temas claro e escuro, com
  `prefers-reduced-motion` e `forced-colors` ativados no sistema.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-tailwind-css --agent universal --copy --full-depth
```

## Especialistas relacionados

- [ReUI](reui.md) fornece composições React e Tailwind gratuitas.
- [shadcn/ui](shadcn-ui.md) constrói componentes sobre estes tokens.
- [React](react.md), [Next.js](nextjs.md) e [Astro](astro.md) fornecem os
  componentes onde as classes são aplicadas.
- [TypeScript](typescript.md) tipa variantes `cva`.
- [Componentes React](react-ui-components.md) e [UI Design](ui-design.md)
  cuidam da composição visual da página.
- [Acessibilidade Web](web-accessibility.md) aprofunda contraste, zoom e
  reflow.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-tailwind-css/SKILL.md),
com camadas de tokens, variantes e migração entre versões no arquivo de
referência da mesma pasta.
