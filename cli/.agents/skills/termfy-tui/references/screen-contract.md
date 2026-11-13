# Contrato de tela e integração

Leia com `termfy-tui`, o arquivo `src/tui/screen.ts` do projeto e
[estado e cleanup](async-and-lifecycle.md). Valide uma tela pelo host completo,
além de testar seus componentes isoladamente.

## O que cada campo faz

| Campo | Contrato no starter kit a partir da v0.9.0 |
| --- | --- |
| `id` | Identificador estável, usado na lista de abas e na abertura direta |
| `title` | Rótulo curto mostrado no seletor de abas |
| `description` | Descrição fornecida ao seletor; o host pode ocultá-la visualmente |
| `keys` | Legendas da barra inferior; declarar aqui não cria o handler |
| `mount(ctx)` | Cria e devolve a raiz visual; o host guarda essa árvore por aba |
| `onEnter(ctx)` | Executa quando a aba fica ativa, inclusive ao retornar |
| `onLeave(ctx)` | Executa na troca para outra aba, não no fechamento atual do host |
| `onKey(name, ctx)` | Recebe o nome da tecla; `true` interrompe o handler global do Termfy |

O contexto fornece `renderer`, `theme`, `goTo(id)` e `quit()`. Não há serviço
HTTP, storage, modal manager ou dispatcher de ações implícito nesse objeto.
Injete serviços na factory da tela e use as funções existentes do domínio.

## Estado por instância

Uma variável no escopo do módulo pode vazar seleção e renderables entre duas
montagens da aplicação ou dois testes. Prefira `createFilesScreen(items)`
retornando um `Screen` novo. Registre uma instância por aplicação.

O host mantém a árvore das abas que já visitou. Não destrua a raiz em
`onLeave`: ela será reutilizada. Interrompa consultas e assinaturas, preserve
as informações necessárias e retome em `onEnter`.

## Cinco integrações frequentes

1. **Painel informativo:** receba os valores prontos, monte texto e tabelas e
   retorne `false` para teclas não tratadas. Não crie timer para texto estático.
2. **Lista navegável:** use `listPanel`, encaminhe setas e Enter e apresente
   explicitamente o estado vazio. Mover a seleção não executa a ação do item.
3. **Consulta remota:** injete uma função que aceite `AbortSignal`, consulte
   em `onEnter`, mostre erro local e descarte respostas antigas.
4. **Formulário:** integre foco e o evento completo no host antes de usar
   modificadores. Teste letras que também são atalhos globais.
5. **Confirmação:** mostre o objeto afetado e as ações de confirmar e cancelar.
   Cancele sem executar a ação; restaure o foco após fechar o diálogo.

## Registro e abertura direta

Ao registrar uma aba, confira unicidade do `id`, posição no array e título.
Só exponha o `id` como configuração inicial depois de atualizar o schema de
`src/config/settings.ts` e as opções de `src/cli/commands/tui.ts`.
Teste tanto a troca por teclado quanto a abertura inicial pelo identificador.
Uma aba adicionada apenas ao arquivo de implementação não entra na navegação.

## Retorno e encerramento

`ctx.goTo(id)` muda a aba pelo host; um id desconhecido não cria tela.
`ctx.quit()` destrói o renderer. O evento `destroy` serve para cleanup local
síncrono. Se serviços exigirem liberação assíncrona, implemente essa espera no
host e teste-a: o contrato atual de `onLeave` retorna `void`.
