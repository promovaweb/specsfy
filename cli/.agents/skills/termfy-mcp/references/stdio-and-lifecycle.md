# Stdio e ciclo de vida

O Termfy expõe o servidor por `<bin> mcp`. O cliente inicia o subprocesso e
conecta stdin e stdout ao SDK. O servidor não abre uma TUI, não imprime
banner e não solicita entrada interativa durante essa sessão.

## Saída e inicialização

Reserve stdout para mensagens do transporte. Use stderr para diagnóstico
limitado e sem segredos. Isso inclui imports e serviços alcançados pelo
handler: um `console.log` no client HTTP também pode corromper a conversa.
Evite construir JSON-RPC manualmente; deixe serialização e negociação ao SDK.

Registre tools, resources e prompts antes de conectar. A execução de
`mcp --list` monta o catálogo sem abrir transporte. Por isso, o registro não
deve consultar rede, exigir credencial nem iniciar timers. Faça trabalho
externo somente quando a operação correspondente for chamada.

## Limites da implementação atual

`startStdioServer` conecta `StdioServerTransport` e aguarda fechamento ou
fim de stdin. No checkout consultado, atribui `transport.onclose` depois de
`server.connect` e não possui um gerenciador geral de cleanup por handler.
Não use essa atribuição como receita para novos transports: sobrescrever
callbacks pode interferir no gerenciamento feito pelo SDK.

Para estender o ciclo de vida, revise os callbacks do servidor e do
transporte juntos. Teste EOF, desconexão durante operação e encerramento
repetido. Cada conexão deve ter seu próprio servidor quando houver estado
por sessão. O servidor de exemplo é isolado e não substitui o bootstrap
completo do produto.

## Cancelamento e prazo

Encaminhe `extra.signal` ao serviço. Na receita `tasks_get`,
`AbortSignal.any` combina cancelamento do cliente e prazo local de cinco
segundos. O serviço precisa respeitar esse signal; criar um AbortSignal não
interrompe código que o ignora. Confira o cancelamento antes e depois da
operação e libere listeners, streams e timers em `finally`.

Cancelamento pode chegar depois de uma gravação. Não prometa desfazer o
efeito nem repita automaticamente uma escrita. Declare idempotência e
recuperação na spec. Para tarefas duráveis, estude o mecanismo próprio de
Tasks; uma requisição longa comum não equivale a uma Task do protocolo.

## Progresso

Envie progresso apenas quando a chamada tiver `progressToken`. Preserve o
token, aumente o valor reportado e limite a frequência das notificações.
Confira `extra._meta` e `extra.sendNotification` nos tipos instalados antes
de implementar. O número zero é um token válido; teste presença com
`!== undefined`, sem depender de truthiness.

Notificações de progresso não substituem resultado final nem alteram automaticamente o
prazo da operação. As receitas atuais testam cancelamento;
progresso requer um caso adicional no projeto consumidor.

## Transporte remoto

Streamable HTTP não é uma opção já implementada pelo starter kit. Uma
migração exige spec para endpoint, autenticação, sessão, validação de origem
e implantação. Não acrescente configuração HTTP de outro cliente ao fluxo
stdio. Use [fontes oficiais](sources-and-compatibility.md) e
`termfy-mcp-client` para a configuração específica do host.
