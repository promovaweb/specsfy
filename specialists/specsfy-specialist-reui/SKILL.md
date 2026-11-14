---
name: specsfy-specialist-reui
description: Criar interfaces React e Tailwind CSS com os componentes gratuitos do ReUI. Use em projetos com React, Tailwind CSS e shadcn/ui, incluindo Laravel com Inertia; não use itens premium nem introduza ReUI sem confirmar a stack.
---

# ReUI para interfaces de produto

O Specsfy é opinativo: para interfaces React e Tailwind, shadcn/ui fornece as
primitives e o ReUI fornece as composições gratuitas. Esta é a base padrão da
Promovaweb para CRUDs e telas de produto.

## Quando usar

Use para telas React que precisam de componentes ReUI gratuitos. Em Laravel,
use quando o frontend React estiver em Inertia, Vite ou outra integração já
configurada. Em Next.js, Astro ou React puro, mantenha o roteamento e a
hidratação definidos pelo framework hospedeiro.

## Fluxo

1. Leia `INTERFACE.md`, stack, `components.json`, Tailwind, primitives locais
   e telas afetadas. Quando `INTERFACE.md` não existir, execute
   `$specsfy-setup` antes de criar interface.
2. Confirme React 19, Tailwind CSS v4 e shadcn/ui antes de iniciar o registry.
   Carregue `$specsfy-specialist-shadcn-ui` junto desta skill para inicializar
   ou auditar `components.json`, aliases, tema e primitives.
3. Leia [references/setup.md](references/setup.md) para preparar o projeto e
   escolher a variante Base UI ou Radix já usada.
4. Use [references/catalog-free.md](references/catalog-free.md) para escolher
   apenas itens gratuitos e compatíveis com a jornada definida.
   Leia também [references/components-free.md](references/components-free.md)
   para percorrer todas as famílias públicas antes de criar uma alternativa.
   Para Laravel com React, leia obrigatoriamente
   [references/shadcn-components.md](references/shadcn-components.md).
5. Instale o menor conjunto necessário pelo comando `npx shadcn@latest add`
   retornado pelo registry, nunca por cópia manual de URLs ou itens premium.
6. Leia a API e exemplos reais do item antes de adaptar dados, ações, estados,
   rotas e permissões do sistema.
7. Divida a interface em componentes React: a página compõe o fluxo; o
   domínio concentra grade, formulário, filtros e ações; primitives e
   composições reutilizáveis ficam nos diretórios já definidos pelo projeto.
8. Atualize `INTERFACE.md` com cada bloco criado ou alterado: arquivo, origem
   shadcn/ui ou ReUI, finalidade, props e eventos, estados, acessibilidade,
   consumidores e regra de reaproveitamento ou extensão.
9. Valide a tela com os testes, typecheck, lint e build do projeto.

## Padrões

- Todo CRUD com interface React e Tailwind usa ReUI como base visual: Data
  Grid ou List para consulta, Filters para recorte, Form e campos ReUI para
  criação e edição, Dialog ou Sheet para ações contextuais e Alert/Badge para
  retorno e status. Não crie uma alternativa manual quando o catálogo gratuito
  já atender a interação.
- Em listas com detalhe, o Data Grid torna a linha inteira clicável e acessível
  por teclado. Botões, checkboxes e menus internos ficam em uma camada de ação
  própria, como `TableRowAction`, para não abrir o detalhe por engano.
- Em criar e editar, use Form em seções: contexto à esquerda e painel de campos
  à direita, com duas colunas nos breakpoints largos e uma no mobile.
- Toda tela tem `Breadcrumb` com o nome da equipe ativa, o módulo e o título
  atual. Em Laravel, reutilize o `Breadcrumb` ou `Breadcrumbs` já existente no
  layout e a tipagem usada pelas rotas.
- Registre `@reui` em `components.json` com
  `https://reui.io/r/{style}/{name}.json`; itens `c-*` são gratuitos.
- Preserve a biblioteca de primitives já presente: Base UI e Radix têm APIs
  diferentes, embora o estilo Tailwind seja equivalente.
- Adicione os tokens semânticos ReUI de sucesso, informação, aviso, inversão e
  ações destrutivas somente quando a tela os usar.
- Em Laravel, mantenha Form Requests, policies e validação no servidor; ReUI
  melhora a experiência, não substitui os contratos PHP.
- Em Laravel, complete Vite, Inertia React, React 19, Tailwind v4 e shadcn/ui
  antes do registry ReUI. Blade, Livewire e Vue exigem uma migração registrada
  na spec antes de receber componentes React.
- Use componentes compostos para a tarefa real, com dados reais, estados
  vazio, carregando, erro, sucesso, teclado e foco.
- Uma rota não concentra a implementação de grade, formulário, filtros,
  diálogo, painel lateral ou cartão reutilizável. Extraia cada parte para um
  componente React com responsabilidade e API claras.
- Registre em `INTERFACE.md` todos os componentes gratuitos usados de ReUI e
  shadcn/ui, além de cada bloco React próprio, com explicação, caminho, API,
  estados, consumidores e forma correta de reutilização ou extensão.

## Antipadrões

- Usar blocos, ícones ou templates premium; esta skill trabalha apenas com o
  catálogo gratuito e não cria `REUI_LICENSE_KEY`.
- Migrar primitives existentes de Radix para Base UI, ou o contrário, para
  instalar um componente.
- Copiar dados demonstrativos, imports ausentes ou APIs inventadas do catálogo.
- Tratar validação visual como validação de autorização ou persistência.
- Criar tabelas, filtros, modais, upload ou formulários CRUD próprios sem
  consultar primeiro o catálogo gratuito ReUI.

## Validação

- Execute os comandos detectados do projeto e teste a navegação por teclado,
  foco, responsividade, tema e estados da tela.
- Confirme que cada item instalado começa com `@reui/c-` ou é dependência
  pública instalada pelo próprio registry.
- Verifique `components.json`, imports e tokens adicionados antes de encerrar.

## Skills relacionadas

- `$specsfy-specialist-react` governa estado e testes React.
- `$specsfy-specialist-tailwind-css` governa tokens e utilitários Tailwind.
- `$specsfy-specialist-shadcn-ui` governa primitives e `components.json`.
- `$specsfy-specialist-laravel` governa backend, Inertia, autorização e testes
  Laravel.
- `$specsfy-specialist-ui-design` e `$specsfy-specialist-ux-design` definem a
  experiência antes da escolha de componentes.

Leia [references/standards.md](references/standards.md) para fontes oficiais,
tokens e comandos. Use as referências de setup e catálogo quando aplicar ReUI.
