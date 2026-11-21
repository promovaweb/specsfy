# Base de primitives do shadcn/ui

## Finalidade

O shadcn/ui mantém uma API pública parecida entre bases, mas gera arquivos com
imports, props e atributos de estado próprios de cada implementação. Antes de
alterar um componente em `aliases.ui`, identifique a base usada pelo arquivo
que será mudado.

## Ordem de confirmação

1. Leia `components.json` para localizar `aliases.ui` e a configuração do
   workspace correto. Ele confirma a presença e a localização do shadcn/ui,
   mas não basta para nomear a base.
2. Abra os componentes shadcn relacionados à tela e observe seus imports. Esse
   é o sinal principal, pois o código copiado pode ter sido instalado em mais
   de uma época.
3. Confira `dependencies`, `devDependencies` e `peerDependencies` do
   `package.json` daquele workspace. Use o manifest para confirmar, não para
   substituir o import local.
4. Se a CLI estiver disponível, rode `npx shadcn@latest info` somente para
   leitura adicional. Não instale, migre ou atualize componentes durante a
   identificação.

## Matriz de identificação

| Sinal no componente ou manifest | Base a registrar | Como seguir |
| --- | --- | --- |
| `@base-ui/react` | Base UI | Use as APIs e atributos documentados para Base UI. |
| `radix-ui` ou `@radix-ui/react-*` | Radix | Preserve a variante presente no arquivo; imports individuais antigos também continuam sendo Radix. |
| `react-aria-components` ou `@react-aria/*` | React Aria | Use a variante React Aria do componente e seus seletores de estado. |
| Sinais de duas ou mais bases no mesmo conjunto de componentes | Mista | Registre a base por arquivo e mantenha cada arquivo na sua base atual. |
| Nenhum sinal confiável | Não identificada | Pare antes de introduzir imports ou props de uma base; peça ou localize um componente existente equivalente. |

O valor `style` em `components.json`, inclusive nomes como `base-nova`, define
o estilo do registry. Ele não comprova que o componente usa Base UI.

## Mudanças e migrações

- Não converta uma base só para uniformizar imports durante uma alteração de
  interface. A migração precisa de escopo próprio, comparação por componente e
  testes de teclado, foco e formulários.
- A migração `shadcn migrate radix` unifica imports Radix individuais em
  `radix-ui`; ela não transforma um projeto Radix em Base UI.
- Componentes de bases distintas podem existir no mesmo projeto depois de uma
  evolução parcial. Trate esse estado como informação do código, não como
  permissão para trocar os demais arquivos.

## Fontes oficiais

- shadcn/ui CLI: https://ui.shadcn.com/docs/cli
- shadcn/ui components.json: https://ui.shadcn.com/docs/components-json
- shadcn/ui, Base UI como padrão: https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- shadcn/ui, React Aria: https://ui.shadcn.com/docs/changelog/2026-07-react-aria
- Base UI: https://base-ui.com/react/overview/getting-started
- Radix Primitives: https://www.radix-ui.com/primitives/docs/overview/introduction
- React Aria Components: https://react-spectrum.adobe.com/react-aria/components.html
