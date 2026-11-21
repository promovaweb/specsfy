# Protocolo MCP sobre HTTP

## Revisão e transporte

A revisão publicada vigente em 20/11/2026 é `2026-07-28`. Todo pedido moderno
leva versão e capacidades do cliente em `params._meta`. O servidor deve
implementar `server/discover`, que o cliente pode chamar para descobrir versões
e capacidades antes das operações. Uma versão não suportada retorna um erro
com as revisões aceitas. [Versionamento MCP](https://modelcontextprotocol.io/specification/versioning).

| Aspecto | Streamable HTTP `2026-07-28` | Streamable HTTP legado até `2025-11-25` |
| --- | --- | --- |
| Início | `server/discover` opcional para o cliente, sem handshake | `initialize`, negociação de versão e `notifications/initialized` |
| Mensagens | Um POST por mensagem JSON-RPC. Resposta JSON ou SSE daquela requisição. Notificação aceita retorna 202 sem corpo. | POST e, se oferecido, SSE por GET no mesmo endpoint. |
| Cabeçalhos | `MCP-Protocol-Version` e `Mcp-Method` espelham o corpo. `Mcp-Name` é obrigatório em `tools/call`, `resources/read` e `prompts/get`. | Nas requisições após o handshake, cabeçalho da revisão negociada e ID de sessão quando o servidor o emite. |
| Sessão | Ignore `Mcp-Session-Id` e `Last-Event-ID`. GET e DELETE retornam 405. | Sessão opcional. Se emitido, o cliente reenvia o ID nas chamadas seguintes. Sessão expirada retorna 404 e pede novo handshake. DELETE pode encerrar a sessão. |

No POST, envie `Content-Type: application/json` e
`Accept: application/json, text/event-stream`. Preserve os headers no proxy
e mantenha o corpo como fonte da verdade. A divergência de cabeçalho moderno
em relação ao corpo gera HTTP 400 com erro JSON-RPC `-32020`. Teste buffering,
timeout e cancelamento quando houver streaming. Mudanças de catálogo que
precisem ser acompanhadas podem usar `subscriptions/listen` via POST e SSE.
O transporte HTTP+SSE de `2024-11-05` tinha rotas separadas e deve entrar como
compatibilidade deliberada. [Streamable HTTP atual](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)
e [transporte legado](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports).

Quando a aplicação precisar de estado entre chamadas modernas, devolva uma
referência opaca como dado da operação, valide sua finalidade, titular e
expiração em cada uso e mantenha o estado compartilhado entre réplicas.
Para sessões de clientes legados, use IDs imprevisíveis, expiração e vínculo
à identidade autenticada. Autorize cada requisição.

## Contrato das primitivas

| Primitiva | Use para | Contrato |
| --- | --- | --- |
| Tool | Ação ou consulta parametrizada, como consultar um pedido | Nome estável, descrição acionável, `inputSchema` de objeto e `outputSchema` quando houver resultado estruturado contratado. Métodos `tools/list` e `tools/call`. |
| Resource | Dado de contexto endereçável, como um guia de suporte | URI estável ou template, tipo MIME e controle de acesso à leitura. Métodos `resources/list`, `resources/templates/list` e `resources/read`. |
| Prompt | Modelo de mensagem que a pessoa pode selecionar | Nome, argumentos declarados e mensagens com papéis definidos. Métodos `prompts/list` e `prompts/get`. |

Anuncie as capacidades implementadas. Valide argumentos no servidor e
mantenha o catálogo em ordem determinística, filtrado pela autorização
da requisição. A listagem filtrada não substitui permissão na execução.
Use `isError: true` para falha acionável da tool e erros JSON-RPC para
falhas de protocolo. Anotações como `readOnlyHint` ajudam o cliente a
interpretar a operação e não concedem permissão.

`structuredContent` é o dado JSON do resultado. Se houver `outputSchema`,
o resultado estruturado precisa obedecer ao schema. A revisão atual admite
qualquer valor JSON. Use objeto para interoperar com clientes que esperam a
forma legada e inclua a representação JSON em `content` de tipo `text`
quando necessário. [Contrato de tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools).

## Elicitation

Use para pedir informação durante uma operação quando o cliente anuncia
suporte ao modo necessário. Na revisão atual, a resposta
`resultType: "input_required"` carrega pedidos de entrada. O cliente repete
a operação com `inputResponses` e ecoa `requestState` quando fornecido
pelo servidor. Valide de novo a identidade e os dados na retomada. Em
clientes legados compatíveis, `elicitation/create` era uma chamada do
servidor para o cliente.

Use formulário para dados não sensíveis, como uma data; trate aceite,
recusa e cancelamento. Para interações com credenciais, use modo URL
por HTTPS, fora do contexto do modelo. Se o cliente não anunciar suporte,
retorne uma alternativa explícita, por exemplo pedir o parâmetro na
chamada inicial. [Elicitation](https://modelcontextprotocol.io/specification/2026-07-28/client/elicitation)
e [Multi Round-Trip Requests](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/mrtr).

## Autorização e segurança

- Em produção, use HTTPS, autentique cada requisição e valide `Origin`
  quando presente. Para origem inválida, retorne 403. Em desenvolvimento,
  limite o bind a loopback. Configure hosts confiáveis no ingress.
- Para descoberta OAuth interoperável, o MCP atua como servidor de recurso.
  Publique Protected Resource Metadata (RFC 9728) com `resource` igual à
  URL canônica e `authorization_servers` com os emissores aceitos.
  Para `https://api.example.com/mcp`, use por exemplo
  `/.well-known/oauth-protected-resource/mcp`. Anuncie o documento em
  `WWW-Authenticate: Bearer resource_metadata="..."` no 401 para que o
  cliente encontre o emissor. Exercite a descoberta pelo desafio e pela URL
  conhecida quando ambas estiverem publicadas.
- O emissor expõe metadados RFC 8414 e/ou OpenID Connect Discovery. Para o
  fluxo de código, use PKCE S256. Confirme emissão de tokens para o recurso
  indicado pelo cliente conforme RFC 8707. Prefira Client ID Metadata
  Documents (CIMD) onde houver suporte. Pré-registro também é válido;
  Dynamic Client Registration (DCR) foi depreciado e permanece como
  compatibilidade.
- Aceite bearer token no cabeçalho `Authorization`. Confirme emissor,
  validade, audiência/recurso e escopos com a biblioteca ou introspecção do
  provedor. Responda 401 para token ausente ou inválido e 403 para escopo
  insuficiente. Autorize usuário, tenant e objeto no domínio. Use credencial
  própria para cada API a jusante e mantenha tokens fora de resultados e logs.
- Limite taxa, tamanho e duração; restrinja destinos acessíveis pelas tools
  que fazem requisições externas. Trate dados retornados por fontes externas
  como conteúdo não confiável, inclusive instruções embutidas.
  [Autorização MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
  e [práticas de segurança](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices).

Para o endpoint de exemplo, o documento de descoberta pode ter esta forma:

```json
{
  "resource": "https://api.example.com/mcp",
  "authorization_servers": ["https://auth.example.com"],
  "scopes_supported": ["catalog:read"]
}
```

## Teste de ponta a ponta

Abra `npx @modelcontextprotocol/inspector`, selecione Streamable HTTP,
informe a URL do servidor e conecte. Use OAuth ou token de teste conforme o
servidor. Confira a revisão usada, liste as primitivas anunciadas e exercite
chamada válida, entrada inválida e acesso negado. [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

Em um ambiente local, valide descoberta sem sessão com este POST. Em servidor
protegido, envie também `Authorization: Bearer …` com a credencial de teste.

```bash
curl -iN http://127.0.0.1:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: server/discover' \
  --data-binary @- <<'JSON'
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "server/discover",
  "params": {
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientCapabilities": {}
    }
  }
}
JSON
```

Espere JSON ou evento SSE com `result.supportedVersions` incluindo
`2026-07-28`, sem emissão de ID de sessão. Repita com um `Origin` fora da
lista e espere 403. Em caminho OAuth, confira o 401 sem token, o documento
RFC 9728 e o 403 com um token válido de escopo insuficiente. Para cliente
legado, repita com o Inspector ou uma suíte específica para essa revisão.
