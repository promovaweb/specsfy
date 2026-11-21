# Setup do ReUI

## Pré-requisitos

- React 19+, Tailwind CSS v4 e shadcn/ui com a CLI atual.
- `components.json` válido e a biblioteca de primitives já identificada.
- Laravel usa o mesmo frontend React via Inertia ou Vite; mantenha rotas,
  Form Requests, policies e validação do backend existentes.

## Registry gratuito

O ReUI usa o mesmo namespace `@reui` para componentes gratuitos `c-*`,
primitives compartilhadas, blocos pagos, ícones e templates. Só os `c-*` e as
dependências públicas (como `@reui/alert` e `@reui/data-grid`) instalam sem
licença. Adicione ou mantenha esta entrada em `components.json`:

```json
{
  "style": "base-nova",
  "registries": {
    "@reui": "https://reui.io/r/{style}/{name}.json"
  }
}
```

Se o projeto usa Radix, mantenha `"style"` e a base coerentes com o
`components.json` existente. Projeto novo criado pelo shadcn/ui nasce em Base
UI; use `npx shadcn@latest init -b radix` quando precisar de Radix.

Depois instale somente itens `c-*`, por exemplo:

```bash
npx shadcn@latest add @reui/c-alert
```

Use `npx shadcn@latest view @reui/c-alert` para ler o item antes de instalar.
Não configure `REUI_LICENSE_KEY`: ele pertence a itens pagos.

## Laravel

1. Confirme React e Tailwind no `package.json`, Vite e o diretório de páginas
   Inertia, geralmente `resources/js/Pages`.
2. Para projeto Laravel novo, escolha o starter kit React oficial, que reúne
   Inertia, TypeScript, Tailwind v4 e shadcn/ui. Rode `npm install`,
   `npm run build` e `composer run dev` conforme os scripts do projeto.
3. Para Laravel existente com Inertia React, mantenha `vite.config.*`, aliases,
   `resources/js`, layouts e páginas; complete apenas React 19, Tailwind v4 e
   shadcn/ui que estiverem ausentes antes de adicionar o registry.
4. Um projeto Blade, Livewire ou Vue não recebe ReUI diretamente. Registrar a
   migração para Inertia React na spec, criar tarefas próprias e só alterar a
   camada de apresentação após a confirmação da pessoa responsável.
5. Inicialize shadcn/ui para a estrutura atual antes de adicionar o registry.
   Use `npx shadcn@latest init` e acrescente `-b radix` se as primitives do
   projeto já forem Radix.
6. Instale componentes pelo CLI no diretório do frontend e use aliases de
   `components.json` já configurados.
7. Conecte páginas e formulários às rotas Inertia existentes; validação e
   autorização continuam no Laravel.

### Checklist Laravel

- `@inertiajs/react`, `react`, `react-dom`, `tailwindcss` e `typescript` usam
  versões compatíveis com o projeto.
- Vite carrega o entrypoint React existente.
- `components.json` resolve aliases para `resources/js/components` ou o padrão
  já adotado pelo projeto.
- Formulários ReUI exibem erros do Inertia, mas Form Requests continuam a
  validar entradas no servidor.
- Policies, middleware e rotas não são substituídos por lógica de interface.

## Outros frameworks

- Next.js: preserve Server e Client Components; componentes interativos ficam
  no limite cliente já definido.
- Astro: use ReUI somente em ilhas React necessárias.
- React com Vite: mantenha o entrypoint, aliases e roteador existentes.

Fontes: <https://reui.io/docs/get-started>,
<https://reui.io/docs/registry>, <https://reui.io/docs/styling> e
<https://reui.io/components>.
Laravel: <https://laravel.com/starter-kits> e
<https://laravel.com/docs/master/frontend>.
shadcn/ui: <https://ui.shadcn.com/docs/installation> e
<https://ui.shadcn.com/docs/cli>.
