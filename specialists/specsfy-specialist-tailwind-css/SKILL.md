---
name: specsfy-specialist-tailwind-css
description: Implementar e revisar Tailwind CSS com tokens, variantes, responsividade, dark mode, container queries e CSS sustentável. Use quando houver tailwindcss ou utilitários Tailwind em templates e a tarefa tocar estilo, tema ou responsividade; use também para decidir entre utilitário, `@apply` e extração de componente; confirme sempre a versão instalada, pois configuração (`tailwind.config` vs `@theme` em CSS) e diretivas mudam entre gerações — não aplique sintaxe de uma versão a outra sem checar o `package.json`.
---

# Tailwind CSS

## Quando usar

- Acionar quando o projeto depende de `tailwindcss` e a tarefa envolve
  classe utilitária, tema, variante, responsividade ou dark mode.
- Acionar também para decidir se um padrão visual repetido deve virar token,
  `@apply` local ou componente extraído.
- Não acionar para a escolha da biblioteca de componentes em si (Radix,
  shadcn/ui); usar `$specsfy-specialist-ui-components` para isso e voltar aqui
  para o sistema de tokens e classes que a sustenta.
- Combinar com `$specsfy-specialist-interface` para contraste, zoom e
  `prefers-reduced-motion`.

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a linha `| Especialistas |` da tabela de
   metadados, a subseção `#### Especialistas` em `### 8. Plano técnico` e a
   seção que a fase está escrevendo. Leia também `.specsfy/STACK.md`,
   `.specsfy/RULES.md` e, para tokens e telas em uso, `INTERFACE.md`.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-tailwind-css`. Sem indicação, confirme
   pelo "Quando usar" acima a versão instalada antes de propor sintaxe.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Mapeie cada token ou classe nova para a tela e o estado descritos em
   `INTERFACE.md` e registre na seção 8 a escolha entre utilitário,
   `@apply` e componente extraído.

## Fluxo

1. Confirmar a versão do Tailwind, a integração (Vite, PostCSS, framework) e
   onde os tokens são declarados (`tailwind.config.js` ou `@theme` em CSS na
   v4): a sintaxe de configuração muda entre gerações.
2. Traduzir o layout e os estados da interface em constraints responsivas
   (breakpoints ou `@container`) antes de escrever a primeira classe.
3. Reutilizar tokens semânticos já existentes (cor, espaçamento, radius,
   tipografia) antes de recorrer a valor arbitrário (`w-[137px]`).
4. Implementar mobile-first: escrever o estilo base para a tela menor e
   sobrepor apenas o que muda nos breakpoints maiores.
5. Cobrir estados interativos (`hover`, `focus-visible`, `disabled`,
   `aria-*`) e preferências do usuário (`dark`, `motion-reduce`,
   `forced-colors`) desde a primeira versão do componente, não como retrofit.
6. Extrair um componente (não `@apply`) quando o padrão repetido representa
   uma unidade semântica reconhecível (um "Card", um "Badge"), não apenas
   uma coincidência visual entre dois lugares.
7. Validar o CSS gerado no build de produção: nenhuma classe usada
   dinamicamente deve estar ausente por não ser detectável estaticamente
   pelo scanner de conteúdo.

## Padrões

- Manter cor, espaçamento, radius e tipografia como tokens com nome de
  intenção (`bg-surface`, `text-muted`) sempre que o projeto já tiver um
  sistema de design, não introduzir valor solto que dribla o token
  existente.
- Expressar estado (hover, foco, seleção, erro) com variantes do próprio
  Tailwind (`hover:`, `aria-selected:`, `data-[state=open]:`), nunca
  escondendo a lógica de estado em concatenação de string opaca fora da
  vista do build.
- Não usar `@apply` como substituto geral de componente: ele recria uma
  folha de estilo tradicional dentro do utility-first e perde a
  colocação (a classe deixa de estar ao lado do elemento que ela estiliza).
- Garantir que toda classe construída dinamicamente (template string,
  concatenação condicional) seja detectável estaticamente pelo scanner de
  conteúdo: usar mapas completos de classes literais em vez de montar a
  classe por concatenação de partes (`text-${color}-500` não funciona: o
  scanner não executa o template).
- Tratar dark mode, `prefers-reduced-motion`, `prefers-contrast` e
  `forced-colors` como requisito de design, não como camada opcional
  adicionada depois.
- Preferir layout fluido (`flex`, `grid`, unidades relativas) e
  `@container` quando o componente precisa responder ao próprio contêiner
  (ex.: um card que muda de layout dentro de uma sidebar estreita), não ao
  viewport inteiro.
- Não multiplicar valores arbitrários (`p-[13px]`, `text-[15px]`) sem antes
  perguntar se um novo token de escala deveria existir: um valor arbitrário
  isolado é aceitável; vários próximos e repetidos indicam token ausente.

## Antipadrões

- Classe montada por concatenação de variável (`` `bg-${color}-500` ``): o
  scanner de conteúdo do Tailwind não executa JS, então essa classe nunca é
  gerada no CSS final; use um mapa literal de classes completas.
- `@apply` usado para recriar dezenas de componentes CSS tradicionais:
  perde a vantagem de colocation do utility-first e cria uma folha de
  estilo paralela difícil de rastrear.
- Cor, espaçamento ou radius hardcoded (`#3b82f6`, `17px`) ao lado de um
  sistema de tokens já existente: quebra o tema (claro/escuro, marca) na
  primeira mudança centralizada.
- Adicionar dark mode, foco visível ou movimento reduzido só depois de uma
  reclamação de acessibilidade, em vez de tratá-los como parte do componente
  desde a primeira versão.
- Confundir a responsabilidade desta skill com a escolha de biblioteca de
  componentes prontos: Tailwind é a camada de utilitários/tema; a escolha
  de "qual Data Table usar" pertence a
  `$specsfy-specialist-ui-components`.

## Validação

- Rodar o build de produção e inspecionar se alguma classe esperada está
  ausente do CSS final (sinal de classe não detectável estaticamente).
- Testar em viewports pequenos e grandes, com container real quando o
  componente usar `@container`, em zoom 200% e 400% (reflow a 320px de
  largura equivalente), sem perda de conteúdo ou scroll horizontal
  indesejado.
- Percorrer `hover`, `focus-visible`, `disabled`, `loading`, `error` e
  `selected` visualmente e por teclado.
- Checar contraste nos temas claro e escuro. Checar também o comportamento com
  `prefers-reduced-motion`/`forced-colors` ativados no sistema operacional.
- Não declarar um componente "responsivo" ou "acessível" apenas por ter
  classes `sm:`/`dark:` presentes; a comprovação acima é obrigatória antes da
  afirmação.

## Skills relacionadas

- `$specsfy-specialist-ui-components` mantém as composições React e Tailwind do
  catálogo gratuito e o sistema de componentes construído sobre Tailwind +
  Radix; este especialista cobre o token e o utilitário que o sustenta.
- `$specsfy-specialist-interface` escolhe e compõe a página e aprofunda
  contraste, zoom, reflow e `prefers-reduced-motion`.
- `$specsfy-specialist-react` e `$specsfy-specialist-nextjs` fornecem o
  componente/framework onde as classes Tailwind são aplicadas; esta skill não
  decide estrutura de componente nem fronteira server/client.
- `$specsfy-specialist-typescript` tipa variantes `cva` quando o projeto
  expõe props de estilo fortemente tipadas.

Leia [references/standards.md](references/standards.md) para camadas de
tokens, variantes, `@container`, detecção de classes e migração entre
versões, com fontes oficiais.
