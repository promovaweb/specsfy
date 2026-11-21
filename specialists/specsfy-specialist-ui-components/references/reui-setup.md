# Setup do ReUI

## Pré-requisitos

- React 19, Tailwind CSS v4 e shadcn/ui.
- `components.json` válido e a biblioteca de primitives já identificada.
- Laravel usa o mesmo frontend React via Inertia ou Vite; mantenha rotas,
  Form Requests, policies e validação do backend existentes.

## Registry gratuito

Adicione ou mantenha esta entrada em `components.json`:

```json
{
  "style": "base-nova",
  "registries": {
    "@reui": "https://reui.io/r/{style}/{name}.json"
  }
}
```

Depois instale somente itens `c-*`, por exemplo:

```bash
npx shadcn@latest add @reui/c-alert
```

Não configure `REUI_LICENSE_KEY`: ele pertence a itens pagos.

## Laravel

1. Confirme React e Tailwind no `package.json`, Vite e o diretório de páginas
   Inertia, geralmente `resources/js/Pages`.
2. Para projeto Laravel novo, escolha o starter kit React oficial, que reúne
   React 19, TypeScript, Inertia, Tailwind v4 e shadcn/ui. Rode `npm install`,
   `npm run build` e `composer run dev` conforme os scripts do projeto.
3. Para Laravel existente com Inertia React, mantenha `vite.config.*`, aliases,
   `resources/js`, layouts e páginas; complete apenas React 19, Tailwind v4 e
   shadcn/ui que estiverem ausentes antes de adicionar o registry.
4. Um projeto Blade, Livewire ou Vue não recebe ReUI diretamente. Registrar a
   migração para Inertia React na spec, criar tarefas próprias e só alterar a
   camada de apresentação após a confirmação da pessoa responsável.
5. Inicialize shadcn/ui para a estrutura atual antes de adicionar o registry:

```bash
npx shadcn@latest init
```
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
<https://reui.io/docs/styling> e <https://reui.io/components>.
Laravel: <https://laravel.com/starter-kits> e
<https://laravel.com/docs/master/frontend>.
shadcn/ui: <https://ui.shadcn.com/docs/installation>.
