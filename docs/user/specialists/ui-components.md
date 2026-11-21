# Componentes de UI

O especialista Componentes de UI ajuda você a montar telas React e Tailwind com
exemplos TSX, componentes gratuitos do ReUI e primitives do shadcn/ui.
Primitives são os controles básicos usados para compor a tela, como botões,
campos e diálogos.

## Quando usar

- Use **Components** para comparar ou adaptar exemplos TSX de navegação,
  formulários, listagem, feedback, marketing e tipografia.
- Use **ReUI** para montar CRUDs, dashboards e outras telas de produto com
  itens gratuitos do registry em uma stack compatível.
- Use **shadcn/ui** para preparar `components.json`, aliases e tema, identificar
  a base de primitives ou compor tabelas, formulários e overlays.

Para escolher jornada, composição ou densidade, comece por
[Interface](interface.md). Correções de estado, effects e concorrência ficam
com [React](react.md). A estrutura de tokens e utilitários fica com
[Tailwind CSS](tailwind-css.md).

## Como ele trabalha

1. Lê `DESIGNSYSTEM.MD` e `INTERFACE.md` e verifica stack, dependências,
   testes, componentes locais e `components.json` quando houver.
2. Confirma a tarefa, a hierarquia e os estados da tela com o especialista
   Interface. Define essas necessidades antes de procurar referências.
3. Escolhe o menor conjunto de componentes que atende à tarefa. Dá
   preferência aos controles locais e pede sua autorização para instalar
   novas dependências.
4. Adapta dados, textos, rotas, permissões, tema e comportamento. Separa a
   composição da página dos componentes de domínio, como grade,
   formulário e filtros.
5. Registra em `INTERFACE.md` o arquivo, a origem, a finalidade, a API
   (props e eventos), os estados, a acessibilidade e onde o componente é
   usado. Também registra como reutilizá-lo ou estendê-lo.

## Components

Os arquivos em `assets/components/` formam um catálogo de exemplos
copiáveis, com 231 exemplos TSX. O agente procura só a família necessária e
compara poucos candidatos por comportamento, layout e dependências. Em um
dashboard,
procura primeiro cabeçalho, filtros, indicadores, visualização principal e
uma forma de investigar os dados.

Ao adaptar um exemplo, o agente troca conteúdo fictício, URLs de demonstração
e `href="#"` por dados e rotas reais. Preserva tokens, `Link`, imagens,
ícones e primitives do projeto, além de semântica, foco, teclado, tema e
breakpoints aplicáveis. Pacotes como Headless UI ou Heroicons só entram
com sua autorização.

## ReUI

O agente confirma React 19, Tailwind CSS v4, shadcn/ui e a variante Base UI
ou Radix já em uso. Quando `INTERFACE.md` está ausente, usa
`$specsfy-setup`. Em Laravel, usa o frontend React existente e mantém
Form Requests, policies e validação no servidor. Blade, Livewire ou Vue
precisam de migração aprovada e registrada na spec antes de receber ReUI.
Em Next.js, Astro e React com Vite, o framework continua definindo
roteamento e hidratação.

Para um CRUD React e Tailwind, o agente consulta Data Grid ou List para
consulta, Filters para filtros, Form e campos para criar e editar, Dialog
ou Sheet para ações e Alert ou Badge para feedback. A linha abre o detalhe
por clique e teclado, com botões, seleção e menus independentes. O
`Breadcrumb` mostra equipe ativa, módulo e tela atual, reaproveitando o
layout existente em Laravel.

O agente registra `@reui` em `components.json` e segue o comando do
registry para itens gratuitos `@reui/c-*`. Por exemplo, para um alerta:

```bash
npx shadcn@latest add @reui/c-alert
```

A seleção inclui somente itens gratuitos e suas dependências públicas.
Os tokens adicionais entram conforme o uso da tela.

## shadcn/ui

O agente procura os imports nos arquivos da tela e os confere no manifest.
`@base-ui/react` indica Base UI. `radix-ui` e `@radix-ui/react-*` indicam
Radix. `react-aria-components` e `@react-aria/*` indicam React Aria. Se
houver mais de uma base ou os sinais forem insuficientes, registra a
situação por arquivo e esclarece a base antes de alterar primitives.

O código adicionado pelo registry passa a fazer parte do projeto. O agente
revisa o código gerado e compara a nova versão com as customizações locais
antes de atualizar um arquivo. Os tokens de tema ficam centralizados em
CSS variables.

O comportamento orienta a escolha entre Dialog, Popover e Sheet. Título,
descrição, teclado e retorno de foco são preservados. Cada tabela recebe
as colunas, filtros e ações que a tarefa exige. A Sidebar mostra a rota
ativa e se recolhe em telas pequenas. O formulário preserva os valores
após falha, associa o erro ao campo e valida a entrada no servidor.

## Como conferir o resultado

- O agente rodou testes, lint, typecheck e build conforme os comandos do
  projeto. Os imports e as dependências existem, e os itens ReUI são do
  registry gratuito.
- A tela foi verificada com teclado, foco, zoom, contraste e movimento
  reduzido, em celular e desktop, nos temas usados pelo projeto.
- O fluxo funciona com dados reais e nos estados aplicáveis de
  carregamento, vazio, erro, sucesso, desabilitado e sem permissão.
- O agente conferiu conteúdo curto e longo, overflow e retorno de foco
  em overlays. As exceções ao design system têm alcance registrado.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-ui-components \
  --agent universal --copy --full-depth
```

Use junto de Interface, React e Tailwind CSS para cobrir os requisitos da
tela, o comportamento e a adaptação visual.

## Especialistas relacionados

- [Interface](interface.md) cobre discovery, design system, UX, UI e
  auditoria de acessibilidade.
- [React](react.md) cobre estado, effects e testes de comportamento.
- [Tailwind CSS](tailwind-css.md) cobre tokens e utilitários.
- [Laravel](laravel.md) e [Next.js](nextjs.md) orientam a integração com
  os respectivos frameworks.
- [TypeScript](typescript.md) cobre tipos de variantes e schemas.
- [Segurança de Aplicações](application-security.md) cobre validação no
  servidor e autorização.

## Referência técnica

O agente segue as instruções do
[SKILL.md de Componentes de UI](../../../specialists/specsfy-specialist-ui-components/SKILL.md),
com catálogos, exemplos, instruções de setup e um checklist de qualidade.
