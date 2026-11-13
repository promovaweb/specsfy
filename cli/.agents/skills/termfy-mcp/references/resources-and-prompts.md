# Resources e prompts

Escolha a superfície pela forma de consumo. Use tool para consulta com
parâmetros ou ação, resource para conteúdo endereçável por URI e prompt
para um conjunto reutilizável de mensagens. Não transforme cada parágrafo
de documentação em uma tool.

## Resource fixo

Use o scheme derivado de `manifest.bin`, como já faz
`src/mcp/resources/base.ts`. Informe URI, nome, descrição e MIME. No retorno,
repita a URI efetivamente lida e inclua `text` ou `blob` conforme o conteúdo.
A receita [resources-prompts.ts](examples/resources-prompts.ts) retorna um
guia Markdown sem acessar o disco.

Para JSON, serialize um objeto público. Para conteúdo binário, confira o
contrato de base64 e o MIME na versão do SDK; não envie um Buffer como texto.
Limite o tamanho antes de retornar arquivos ou relatórios.

## Template

`ResourceTemplate` representa URIs parametrizadas. `resources/templates/list`
descobre o formato, enquanto `resources/list` pode descobrir instâncias
concretas. A callback `list` da receita enumera tópicos finitos. Em domínio
muito grande, planeje descoberta limitada e paginação em vez de listar tudo.

Valide o valor recebido pela callback de leitura. Ele pode ser uma string
ou um array, conforme o template. Não transforme um parâmetro de URI em
caminho livre no filesystem. Use uma lista de identificadores permitidos ou
um repositório que confira acesso ao objeto solicitado.

Um tópico desconhecido deve produzir falha explícita. Não devolva a
documentação inteira como substituição silenciosa, pois isso disfarça a
URI incorreta. A receita usa `McpError` com uma mensagem pública fixa.

## Prompt

`registerPrompt` recebe argumentos descritos e retorna `messages`. Os
argumentos de protocolo são strings; não transfira automaticamente o schema
numérico de uma tool para `argsSchema`. Valide tamanho, presença e opções
permitidas conforme a versão instalada.

Recuperar um prompt não executa comandos nem chama tools. Na receita,
`review_tasks` orienta uma consulta e incorpora o foco solicitado. O host
continua responsável por apresentar e usar essas mensagens.

Texto recebido do usuário ou de um serviço continua sendo conteúdo externo.
Delimitar esse texto ajuda a leitura, mas não concede permissões nem elimina
instruções maliciosas. Não coloque segredos em mensagens de prompt.

## Integração e verificação

Registre resources e prompts no mesmo `Registrar` usado pelo produto e
preencha os respectivos arrays do catálogo. Compare descoberta, URI, MIME,
conteúdo, tópico ausente e argumento inválido usando o Client do SDK.
As receitas e os comandos estão em [exemplos](examples/README.md).

Subscriptions, notificações de atualização e completion exigem handlers e
capabilities compatíveis. Não anuncie suporte apenas por existir uma API no
SDK. Consulte [fontes](sources-and-compatibility.md) antes de adicioná-los.
