# ReUI

O especialista ReUI orienta o agente a montar interfaces React e Tailwind com
os componentes gratuitos do registry ReUI. No Specsfy, o shadcn/ui fornece os
primitives e o ReUI fornece as composições, que formam a base padrão para
CRUDs e telas de produto.

## Quando usar

- Uma tela React precisa de componentes ReUI gratuitos.
- O projeto Laravel usa React com Inertia, Vite ou outra integração já
  configurada.
- O projeto usa Next.js, Astro ou React puro. Nesse caso, o roteamento e a
  hidratação continuam definidos pelo framework.

## Como ele trabalha

1. Lê o `INTERFACE.md`, a stack, o `components.json`, o Tailwind, os
   primitives locais e as telas afetadas, executando o `$specsfy-setup`
   primeiro quando o `INTERFACE.md` não existe.
2. Confirma React 19, Tailwind CSS v4 e shadcn/ui e carrega o especialista
   shadcn/ui para preparar o `components.json`, os aliases e o tema.
3. Prepara o projeto e mantém a variante de primitives já usada, Base UI ou
   Radix.
4. Percorre as famílias públicas do catálogo gratuito e escolhe os itens
   compatíveis com a jornada.
5. Instala o menor conjunto necessário com o comando `npx shadcn@latest add`
   indicado pelo registry.
6. Lê a API e os exemplos do item para adaptar ações, estados, rotas e
   permissões.
7. Divide a interface em componentes React. A página compõe o fluxo e os
   componentes de domínio concentram grade, formulário, filtros e ações.
8. Atualiza o `INTERFACE.md` com cada bloco criado ou alterado.
9. Valida a tela com os testes, o typecheck, o lint e o build do projeto.

## Padrões aplicados

- Todo CRUD em React e Tailwind usa o ReUI como base visual:
  - Data Grid ou List para consulta
  - Filters para filtrar a listagem
  - Form e campos ReUI para criar e editar
  - Dialog ou Sheet para ações contextuais
  - Alert e Badge para retorno e status
- O Data Grid torna a linha inteira clicável e acessível por teclado, com
  botões e menus internos em uma camada própria, como `TableRowAction`.
- Criar e editar usam Form em seções, com duas colunas nas telas largas e uma
  no celular.
- Todas as telas têm `Breadcrumb` com o team ativo, o módulo e o título atual.
- O `@reui` é registrado no `components.json` com
  `https://reui.io/r/{style}/{name}.json`. Os itens `c-*` são gratuitos.
- A biblioteca de primitives existente é preservada, porque Base UI e Radix
  têm APIs diferentes.
- Em Laravel, Form Requests, policies e validação continuam no servidor.
- Em Laravel, Vite, Inertia React, React 19, Tailwind v4 e shadcn/ui ficam
  prontos antes do registry.
- Telas em Blade, Livewire ou Vue exigem uma migração registrada na spec
  para receber componentes React.
- Uma rota não concentra grade, formulário, filtros, diálogos e painéis. Cada
  parte vira um componente com responsabilidade e API próprias.

## Erros que ele evita

- Usar blocos, ícones ou templates premium. O especialista trabalha apenas com
  o catálogo gratuito e não cria `REUI_LICENSE_KEY`.
- Migrar primitives de Radix para Base UI, ou o contrário, para instalar um
  componente.
- Copiar conteúdo de demonstração, imports ausentes ou APIs inexistentes.
- Tratar a validação visual como validação de autorização ou persistência.
- Criar tabelas, filtros, modais ou formulários próprios sem consultar o
  catálogo gratuito.

## Como conferir o resultado

- Os comandos do projeto passam, com navegação por teclado, foco,
  responsividade, tema e estados da tela testados.
- Cada item instalado começa com `@reui/c-` ou é uma dependência pública
  trazida pelo registry.
- `components.json`, imports e tokens adicionados foram revisados.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-reui --agent universal --copy --full-depth
```

O catálogo instala junto os especialistas React, Tailwind CSS e shadcn/ui.

## Especialistas relacionados

- [React](react.md) cuida do estado e dos testes.
- [Tailwind CSS](tailwind-css.md) cuida dos tokens e utilitários.
- [shadcn/ui](shadcn-ui.md) cuida dos primitives e do `components.json`.
- [Laravel](laravel.md) cuida do backend, do Inertia e da autorização.
- [UI Design](ui-design.md) e [UX Design](ux-design.md) definem a experiência
  antes da escolha dos componentes.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-reui/SKILL.md),
com preparação do projeto, catálogo gratuito e tokens na pasta de referências.
