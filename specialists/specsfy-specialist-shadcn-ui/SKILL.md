---
name: specsfy-specialist-shadcn-ui
description: Instalar, compor e adaptar shadcn/ui com registry, Base UI, Radix, React Aria, theming, formulários, tabelas, gráficos, sidebars e componentes acessíveis. Use quando houver components.json, componentes shadcn já incorporados ou pedido explícito por shadcn; trate sempre o código copiado como código do projeto, nunca como dependência opaca; não use para o sistema de tokens/utilitários em si — combine com a skill Tailwind CSS — nem para uma galeria de componentes alternativa, coberta por react-ui-components.
---

# shadcn/ui

Para interfaces React e Tailwind da Promovaweb, esta skill prepara as
primitives, `components.json`, aliases e tema. Quando a tela precisar de CRUD
ou composição de produto, carregue `$specsfy-specialist-reui` em conjunto: ela
instala primeiro componentes gratuitos ReUI sobre esta base.

## Quando usar

- Acionar quando o projeto tem `components.json` ou componentes shadcn já
  incorporados, ou quando a pessoa pede explicitamente um componente
  shadcn/ui (Data Table, Sidebar, Dialog, Form, Chart).
- Acionar também para identificar se o shadcn/ui do projeto usa Base UI, Radix
  ou React Aria antes de compor um padrão (dashboard, formulário, overlay).
- Não acionar para o sistema de tokens/utilitários Tailwind em si; combinar
  com `$specsfy-specialist-tailwind-css` para isso.
- Não acionar quando o projeto usa uma biblioteca de componentes visual
  diferente (galeria copiável não-Radix); nesse caso avaliar
  `$specsfy-specialist-react-ui-components` com
  `$specsfy-specialist-ui-design`.
- Combinar com `$specsfy-specialist-web-accessibility` para auditoria
  aprofundada além da acessibilidade já garantida pelo primitive Radix.

## Fluxo

1. Confirmar framework, versão do shadcn/ui, `components.json` (aliases de
   import, estilo, CSS variables) e o registry configurado antes de adicionar
   qualquer componente.
2. Identificar a base de primitives em uso: começar pelos imports dos
   componentes shadcn já incorporados e confirmar no manifest. Classificar
   `@base-ui/react` como Base UI, `radix-ui` ou `@radix-ui/react-*` como Radix
   e `react-aria-components` ou `@react-aria/*` como React Aria. Se os
   componentes usarem mais de uma base ou os sinais não bastarem, registrar a
   base por arquivo e não adicionar, migrar ou reescrever primitives até
   esclarecer a divergência.
3. Auditar os componentes já incorporados no projeto e suas customizações
   locais antes de adicionar um novo, para não duplicar ou divergir de um
   componente equivalente já existente.
4. Escolher o primitive da base identificada pelo comportamento e semântica
   exigidos (diálogo modal vs popover vs sheet lateral), não pela aparência
   mais próxima do design.
5. Adicionar o menor conjunto de componentes necessário e revisar o código
   gerado linha a linha: ele é copiado para o projeto e passa a ser mantido
   por quem o adicionou.
6. Adaptar tokens, variantes (`cva`) e composição ao design do projeto sem
   remover roles, `aria-*`, gestão de foco ou atalhos de teclado oferecidos
   pela base identificada.
7. Construir todos os estados reais do componente (loading, empty, error,
   disabled, permission denied), não apenas o estado nominal mostrado na
   documentação.
8. Testar teclado, foco, responsividade, submissão de formulário e os dois
   temas (claro/escuro) antes de considerar o componente pronto.
9. Atualizar `INTERFACE.md` para cada primitive ou bloco criado, alterado ou
   reaproveitado, incluindo arquivo, origem, finalidade, API, estados,
   acessibilidade, consumidores e orientação de extensão.

## Padrões

- Não tratar shadcn/ui como dependência opaca versionada num pacote; o
  código copiado pertence ao projeto e qualquer bug ou desvio de
  acessibilidade nele é responsabilidade do time, não "responsabilidade da
  lib".
- Usar somente APIs, atributos de estado e composição próprios da base
  identificada. Base UI, Radix e React Aria expõem contratos semelhantes, mas
  seus imports, props e atributos não são intercambiáveis.
- Preservar roles ARIA, labels, gestão de foco (foco inicial, trap e retorno
  ao trigger) e Escape quando a base os oferece; customização visual não pode
  remover esse comportamento.
- Centralizar tokens de tema (CSS variables) num único lugar; nunca editar
  dezenas de componentes individualmente para trocar uma cor de marca ou
  ajustar o tema.
- Em projetos React da Promovaweb, usar shadcn/ui junto do ReUI: o primeiro
  atende primitives e o segundo atende composições gratuitas de produto.
  Toda tela é uma composição de componentes React, não um arquivo monolítico.
- Compor um Data Table para o caso de uso real (colunas, ordenação, filtro,
  seleção, paginação necessários) em vez de importar um componente universal
  com todas as capacidades possíveis "por garantia".
- Fazer a Sidebar responder a viewport (colapsar em mobile), densidade de
  navegação e destacar a rota atual de forma perceptível.
- Validar todo formulário também no servidor (a validação client-side é UX,
  não segurança) e associar cada mensagem de erro ao campo correspondente
  via `aria-describedby`/label.
- Atualizar um componente já customizado apenas depois de comparar o diff
  entre a versão nova do registry e as customizações locais: um `add`
  ingênuo pode sobrescrever uma correção de acessibilidade feita
  anteriormente.

## Antipadrões

- Assumir que todo shadcn/ui usa Radix porque o componente tem a mesma API
  pública. Isso introduz imports e props incompatíveis com Base UI ou React
  Aria.
- Importar um Dialog do shadcn/ui e remover o `aria-describedby`/título por
  achar "redundante visualmente": quebra o anúncio do leitor de tela sobre o
  que o diálogo faz.
- Editar o arquivo gerado do componente para "consertar" um estilo em vez de
  ajustar o token/variant central: a próxima pessoa que atualizar o
  componente perde a correção sem saber que ela existia.
- Tratar o Data Table como componente único e genérico para toda tabela do
  sistema, acumulando props condicionais até virar impossível de entender:
  compor uma tabela por caso de uso a partir dos blocos do registry.
- Validar formulário só no cliente (schema no front) e nunca repetir a
  validação no servidor: qualquer requisição direta ao endpoint ignora a
  validação do formulário.
- Rodar `shadcn add` sobre um componente já customizado sem diff prévio,
  perdendo silenciosamente ajustes de acessibilidade ou de negócio feitos
  localmente.

## Validação

- Rodar typecheck, lint, testes e build do projeto após adicionar ou
  modificar um componente.
- Percorrer a navegação completa por teclado: abrir/fechar overlay, focus
  trap dentro do Dialog/Sheet e retorno do foco ao elemento que o abriu.
- Testar em mobile e desktop, tema claro e escuro, zoom alto e conteúdo
  longo/truncado nas células de tabela e nos rótulos.
- Exercitar os estados de tabela (vazio, carregando, erro, com dados),
  gráfico (sem dado, com dado), formulário (pendente, erro, sucesso, reabrir
  após falha preservando valores) e sidebar (colapsada, expandida, rota
  ativa) realmente usados pela tela.
- Não declarar um componente "acessível" só porque veio do shadcn/ui;
  qualquer customização precisa da comprovação acima antes da afirmação.

## Skills relacionadas

- `$specsfy-specialist-tailwind-css` para o sistema de tokens e utilitários
  que sustenta o tema dos componentes.
- `$specsfy-specialist-react` para a lógica de estado, effects e testes do
  componente React por trás de cada primitive shadcn/ui.
- `$specsfy-specialist-typescript` para tipar variantes `cva` e schemas de
  formulário (`zod` + `react-hook-form`).
- `$specsfy-specialist-nextjs` quando o formulário submete para uma Server
  Action: validação e autorização server-side pertencem a essa skill.
- `$specsfy-specialist-react-ui-components` e `$specsfy-specialist-ui-design`
  quando o projeto precisa de uma galeria de referências visuais mais ampla
  ou de definições de composição de página.
- `$specsfy-specialist-web-accessibility` para auditoria além do que a base
  instalada oferece por padrão.
- `$specsfy-specialist-application-security` para validação de formulário no
  servidor e autorização de mutations expostas por Server Actions/endpoints.

Leia [references/primitives.md](references/primitives.md) antes de alterar um
componente shadcn/ui para identificar a base instalada. Leia
[references/standards.md](references/standards.md) para registry, padrões de
dashboard, Data Table, formulário, overlay e chart, com fontes oficiais.
