# Segredos, acesso e efeitos

Leia esta referência junto ao [contrato de tool](tool-contract.md) quando
a funcionalidade acessar cofre, arquivos, rede ou escrita. Use
`termfy-config` para credenciais e `termfy-api` para o serviço HTTP.

## Credenciais e respostas

Busque credenciais internamente com `getCredential(name)`. Não aceite token
como argumento MCP e não o coloque em URI, prompt ou exemplo de cliente.
`credentials_status` apresenta metadados; nomes de credenciais também podem
revelar informações do projeto, portanto preserve apenas o necessário.

Use mensagens públicas fixas para erros. O SDK pode devolver a mensagem de
uma exceção capturada. Crie um teste com um segredo fictício no erro do
serviço e confira resposta e stderr. Prefira códigos de diagnóstico e
identificadores de correlação a corpos completos de requisição e resposta.

## Arquivos e URLs

Uma URI de resource identifica conteúdo do produto; não autoriza ler
qualquer caminho. Resolva identificadores por uma lista permitida ou por
repositório com controle de acesso. Quando houver filesystem, confira
caminho real e symlinks para impedir acesso fora do diretório permitido.

Uma tool que chama HTTP deve restringir destino e redirecionamentos conforme
a spec. Não use URL livre enviada pelo modelo para encaminhar credenciais.
O client compartilhado define base URL, timeout e tratamento de falhas.

## Escrita e repetição

Documente quais arquivos ou objetos remotos mudam, quais permissões são
necessárias e como confirmar o resultado. A anotação `readOnlyHint` não é
uma verificação de autorização. Da mesma forma, `dryRun` deve realmente
impedir persistência e chamadas de mutação. Teste esse comportamento.

Para operações repetíveis, defina chave de idempotência ou mecanismo
compatível com o serviço. Não faça retry cego após timeout de escrita: o
servidor remoto pode ter concluído a ação antes de a conexão terminar.

## Conteúdo externo

Uma resposta de API, arquivo ou descrição de tarefa pode conter instruções.
Apresente esse conteúdo como informação externa; não o promova a regra do
servidor. Separe texto externo de mensagens operacionais e não aceite que
ele altere permissões, caminhos ou destino de credenciais.

## Verificações mínimas

Teste acesso permitido e recusado, objeto ausente, timeout, cancelamento,
erro remoto com token fictício e ausência de efeitos após recusa. Para
`dryRun`, compare o estado antes e depois e conte chamadas de mutação.
As receitas entregues são somente leitura; elas não comprovam segurança de
uma futura tool de escrita.
