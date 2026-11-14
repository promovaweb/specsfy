# shadcn/ui

O especialista shadcn/ui prepara os primitives, o `components.json`, os
aliases e o tema das interfaces React e Tailwind. Ele identifica a base de
primitives do projeto antes de qualquer componente novo. Para CRUDs e
composições de produto, trabalha junto com o especialista ReUI.

## Quando usar

- O projeto tem `components.json` ou componentes shadcn já incorporados.
- Você solicitou um componente shadcn/ui, como Data Table, Sidebar, Dialog,
  Form ou Chart.
- Você precisa saber se o projeto usa Base UI, Radix ou React Aria antes de
  compor um dashboard, um formulário ou um overlay.

Tokens e utilitários Tailwind ficam com o especialista Tailwind CSS. Quando o
projeto usa outra biblioteca visual, avalie os especialistas Componentes React
e UI Design.

## Como ele trabalha

1. Confirma o framework, a versão do shadcn/ui, o `components.json` e o
   registry configurado.
2. Identifica a base de primitives pelos imports e pelo manifest:
   - `@base-ui/react` indica Base UI
   - `radix-ui` ou `@radix-ui/react-*` indica Radix
   - `react-aria-components` ou `@react-aria/*` indica React Aria
3. Quando os componentes usam mais de uma base, registra a base por arquivo e
   não adiciona nem migra primitives até a divergência ser resolvida.
4. Revisa os componentes já incorporados e as customizações locais para não
   duplicar um componente equivalente.
5. Escolhe o primitive pelo comportamento exigido, como diálogo modal, popover
   ou painel lateral.
6. Adiciona o menor conjunto necessário e revisa o código gerado linha a
   linha, porque esse código fica no próprio projeto.
7. Adapta tokens, variantes (`cva`) e composição sem remover roles, `aria-*`,
   gestão de foco ou atalhos de teclado.
8. Constrói os estados de carregamento, vazio, erro, desabilitado e sem
   permissão.
9. Testa teclado, foco, responsividade, envio de formulário e os temas claro
   e escuro.
10. Atualiza o `INTERFACE.md` com cada primitive ou bloco criado, alterado ou
    reaproveitado.

## Padrões aplicados

- O código copiado pertence ao projeto. Qualquer desvio de acessibilidade nele
  é corrigido no próprio projeto.
- Base UI, Radix e React Aria têm imports, props e atributos diferentes. O
  agente usa somente a API da base identificada.
- Roles ARIA, labels, foco inicial, trap de foco, retorno ao gatilho e Escape
  são preservados nas customizações.
- Os tokens de tema ficam centralizados em CSS variables.
- Em projetos React da Promovaweb, o shadcn/ui atende os primitives e o ReUI
  atende as composições gratuitas de produto.
- Cada Data Table é composta para o caso de uso, com as colunas, a ordenação e
  os filtros necessários.
- A Sidebar colapsa no celular e destaca a rota atual.
- Os formulários também são validados no servidor. Cada erro fica associado ao
  campo por `aria-describedby` ou label.
- Antes de atualizar um componente customizado, o agente compara a versão nova
  do registry com as mudanças locais.

## Erros que ele evita

- Assumir que todo shadcn/ui usa Radix por causa da API pública parecida.
- Remover o título ou o `aria-describedby` de um Dialog por parecerem
  redundantes visualmente.
- Corrigir um estilo no arquivo gerado em vez do token ou da variante central.
- Usar uma única Data Table genérica para todas as tabelas do sistema.
- Validar formulário só no cliente.
- Rodar `shadcn add` sobre um componente customizado sem comparar as versões.

## Como conferir o resultado

- Typecheck, lint, testes e build passam depois da mudança.
- A navegação por teclado abre e fecha overlays, mantém o foco dentro do
  Dialog ou do Sheet e devolve o foco ao gatilho.
- Celular, desktop, temas claro e escuro, zoom alto e conteúdo longo foram
  testados.
- Os estados de tabela, gráfico, formulário e sidebar usados pela tela foram
  exercitados.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-shadcn-ui --agent universal --copy --full-depth
```

## Especialistas relacionados

- [ReUI](reui.md) instala as composições gratuitas sobre esta base.
- [Astro](astro.md) define a hidratação quando os primitives viram ilhas.
- [Tailwind CSS](tailwind-css.md) cuida dos tokens e utilitários do tema.
- [React](react.md) cuida do estado, dos efeitos e dos testes.
- [TypeScript](typescript.md) tipa variantes `cva` e schemas de formulário.
- [Next.js](nextjs.md) valida e autoriza formulários enviados a Server
  Actions.
- [Componentes React](react-ui-components.md) e [UI Design](ui-design.md)
  oferecem referências visuais mais amplas.
- [Acessibilidade Web](web-accessibility.md) aprofunda a auditoria.
- [Segurança de Aplicações](application-security.md) revisa validação no
  servidor e autorização.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-shadcn-ui/SKILL.md),
com a identificação de primitives e os padrões de componentes na pasta de
referências.
