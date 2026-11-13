# Estado assíncrono e liberação de recursos

Leia com `termfy-tui` e [Lifecycle](opentui/core-concepts/lifecycle.mdx).
Use `async-screen.ts` e `latest-task.ts` dos [exemplos](examples/README.md).
Teste concorrência sem rede real e depois confira a apresentação por frame.

## Quem cria, quem encerra

| Recurso | Início | Encerramento |
| --- | --- | --- |
| Árvore da aba | `mount` | Host ao destruir a aplicação |
| Consulta ativa | `onEnter` ou ação de recarregar | Nova consulta, `onLeave` ou `destroy` |
| Intervalo de atualização | `onEnter` | `onLeave` e `destroy` |
| Assinatura externa | `onEnter` | Remoção da assinatura nas duas saídas |
| Listener do renderer | Montagem ou entrada, conforme finalidade | `off` quando deixar de ser usado |

No starter kit conferido, `onLeave` roda na troca de aba. O fechamento pelo
renderer não o chama. Registre também cleanup no evento `destroy`, sem
presumir que uma Promise retornada por listener será aguardada.

## Respostas fora de ordem

Considere duas consultas: A começa, B começa e termina, A termina por último.
O resultado de A não pode substituir B. Use um contador de geração e
`AbortController`. Cancelar ajuda a interromper trabalho, mas não garante
que todo serviço respeite o sinal. Compare a geração antes de escrever na UI.

Ao sair da aba, invalide a geração e cancele a consulta. Ao voltar, reative
a tela e carregue conforme sua política de cache. Confira também o caso de
resposta chegando depois que o renderer foi destruído.

## Modelo de estado

Diferencie `idle`, `loading`, `ready`, `empty` e `error`. Uma lista vazia é um
resultado válido, não uma exceção. Mantenha a seleção por id ao substituir
resultados. Para atualização em segundo plano, declare se a tela mantém o
resultado anterior visível ou mostra carregamento sem conteúdo.

Não use polling por padrão. Quando necessário, documente intervalo, timeout,
limite de tentativas e pausa durante inatividade. Evite iniciar outra consulta
enquanto a anterior estiver em curso, salvo se houver cancelamento explícito.

## Cleanup repetível

A mesma função pode ser chamada por troca de aba e fechamento. Ela precisa
aceitar repetição, cancelar handles existentes e limpar suas referências.
Não destrua a raiz visual na troca de aba porque o host guarda essa árvore.

## Erros e limites

Capture rejeições e apresente uma mensagem própria do produto. Registre
informações técnicas no canal de diagnóstico apropriado, sem segredos.
Não mostre `String(error)` de uma API externa diretamente no frame.

Se o serviço precisar aguardar fechamento de conexão, gravação ou flush,
implemente um percurso assíncrono no host. `ctx.quit()` e `onLeave` atuais
não oferecem essa espera. Documentar uma Promise não muda esse contrato.
