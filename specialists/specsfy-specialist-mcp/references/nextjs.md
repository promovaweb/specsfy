# Servidor MCP em Next.js

## Escolha do SDK

| Situação | Caminho |
| --- | --- |
| Novo servidor no App Router | Use Route Handler com `Request`/`Response` e `createMcpHandler` de `@modelcontextprotocol/server` v2. É a integração direta com o SDK oficial para Streamable HTTP `2026-07-28`. |
| Aplicação já usa o adaptador da Vercel ou precisa de seus helpers de autenticação e observabilidade | Use `mcp-handler` 2.x com `@modelcontextprotocol/server` 2.x. Ele monta um handler Web Standard sobre o SDK oficial. Confira as dependências e o runtime no lockfile. |
| Projeto mantém o SDK oficial v1 por compatibilidade | Use `@modelcontextprotocol/sdk` 1.x com `WebStandardStreamableHTTPServerTransport` para o protocolo legado. Confirme a revisão suportada pelo cliente e planeje quando migrar. |

O recurso nativo do Next.js é o Route Handler. O SDK fornece o transporte
MCP. O pacote monolítico `@modelcontextprotocol/sdk` é da linha v1.
Na linha v2, o pacote oficial de servidor é `@modelcontextprotocol/server`.
[Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
e [migração do SDK](https://ts.sdk.modelcontextprotocol.io/v2/migration/upgrade-to-v2).

## Route Handler com o SDK oficial

Se a instalação fizer parte da tarefa, use o gerenciador do projeto.
Exemplo com npm:

```bash
npm install @modelcontextprotocol/server@^2 zod@^4
```

Em `app/mcp/route.ts`, publique um endpoint local de exemplo. Rode
`npx next dev --hostname 127.0.0.1` na aplicação Next.js e acesse
`http://127.0.0.1:3000/mcp`. Use este exemplo sem autenticação somente
em loopback, sem túnel público.

```ts
import {
  createMcpHandler,
  hostHeaderValidationResponse,
  localhostAllowedHostnames,
  McpServer,
} from '@modelcontextprotocol/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const origins = new Set(['http://127.0.0.1:3000', 'http://localhost:3000']);

const handler = createMcpHandler(() => {
  const server = new McpServer({ name: 'catalog', version: '1.0.0' });

  server.registerTool(
    'product-code',
    {
      description: 'Normaliza um código de produto para letras maiúsculas.',
      inputSchema: z.object({ code: z.string().max(32).regex(/^[A-Za-z0-9_-]+$/) }),
      outputSchema: z.object({ code: z.string() }),
    },
    async ({ code }) => {
      const result = { code: code.toUpperCase() };
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        structuredContent: result,
      };
    },
  );

  return server;
});

async function handleMcpRequest(request: Request): Promise<Response> {
  const rejected = hostHeaderValidationResponse(request, localhostAllowedHostnames());
  if (rejected) return rejected;

  const origin = request.headers.get('origin');
  if (origin !== null && !origins.has(origin)) {
    return new Response('Origem não permitida', { status: 403 });
  }

  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }

  return handler.fetch(request);
}

export { handleMcpRequest as POST, handleMcpRequest as GET, handleMcpRequest as DELETE };
```

Cada chamada recebe um servidor novo da factory. Deixe o SDK ler o corpo
e retorne o `Response` diretamente, inclusive se vier como SSE. GET e DELETE
passam pela validação de origem e recebem 405, como prevê a revisão atual.
Use `registerResource` e `registerPrompt` na mesma factory quando
o contrato anunciar essas capacidades. O SDK v2 oferece fallback
Streamable HTTP legado sem sessões por padrão. Use `{ legacy: 'reject' }`
no segundo argumento de `createMcpHandler` para suportar apenas a revisão
moderna. [SDK Web Standard](https://ts.sdk.modelcontextprotocol.io/v2/serving/web-standard)
e [compatibilidade do SDK](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28).

## Autorização e deploy

- Substitua a lista e os hosts locais pelos autorizados na implantação.
  Valide `Origin` nos métodos que expuser. Publique HTTPS e valide bearer
  token a cada requisição, inclusive na descoberta MCP se o endpoint for
  protegido. Passe os dados verificados em
  `handler.fetch(request, { authInfo })`. As tools podem acessar
  `ctx.http?.authInfo` e aplicar políticas por objeto e tenant.
- No perfil OAuth, publique o documento RFC 9728 num Route Handler público,
  por exemplo em `app/.well-known/oauth-protected-resource/mcp/route.ts`.
  O 401 deve anunciar o desafio configurado. Use um emissor com
  RFC 8414 ou OIDC Discovery e confira audiência e escopo. Veja
  [Protocolo](protocol.md#autorização-e-segurança).
- Mantenha estado de domínio necessário entre chamadas em armazenamento
  externo e vinculado à identidade. Confira limites do runtime, headers
  encaminhados e streaming no ingress. Valide as dependências antes de
  trocar Node.js por Edge.

## Alternativa com mcp-handler

Instale `mcp-handler@^2 @modelcontextprotocol/server@^2 zod@^4.2` se a
integração da Vercel fizer parte do projeto. Em 2.x, a montagem no Next.js
segue a rota escolhida (por exemplo, `app/api/mcp/route.ts` para
`/api/mcp`). `app/api/[transport]/route.ts` só faz sentido quando o projeto
precisa rotear múltiplos caminhos com o mesmo handler. Confira os caminhos
aceitos nesse caso. A linha 2.x abandonou HTTP+SSE legado em rotas separadas
e dispensa Redis para transporte.

No adaptador, `createMcpHandler((server) => { … })` de `mcp-handler`
recebe o registro das primitivas e devolve a função Web Standard.
Para expor o POST, chame essa função com o `Request` no mesmo ponto em que
o exemplo chama `handler.fetch(request)`. Mantenha a validação de origem.
Use `withMcpAuth` com um verificador de token real e
`protectedResourceHandler` para servir os metadados. O adaptador fornece
o desafio e a integração, enquanto o emissor implementa o fluxo OAuth.
[Repositório mcp-handler](https://github.com/vercel-labs/mcp-handler)
e [autorização no adaptador](https://github.com/vercel-labs/mcp-handler/blob/main/docs/AUTHORIZATION.md).

## Compatibilidade com o SDK v1

Em projeto que já usa `@modelcontextprotocol/sdk` 1.x, o import Web Standard
é `@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js`.
Crie `McpServer` de `@modelcontextprotocol/sdk/server/mcp.js` e um
`WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })`
por POST quando o servidor legado puder operar sem sessão. Após
`await server.connect(transport)`, use `transport.handleRequest(request)`
para obter o `Response`. Se estiver servindo SSE, preserve o transporte
até concluir ou cancelar o stream. Se o cliente exigir sessão, preserve
vínculo à identidade, expiração, operação entre réplicas e ciclo GET/DELETE
conforme a revisão legada. Confirme a API instalada para schema e registro.
[SDK v1](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x).

## Validação

- Rode a checagem de tipos e os testes do projeto. Cubra schema, saída
  estruturada, permissões e rejeições HTTP (origem, token, versão e headers).
- Rode o Next.js e conecte o MCP Inspector via Streamable HTTP. Liste e
  chame `product-code` com `{"code":"ab-123"}` e confirme `AB-123`.
- Faça o [teste curl moderno](protocol.md#teste-de-ponta-a-ponta) na rota
  local e no ingress de teste. Exercite também o handshake legado se ele
  fizer parte do contrato.
