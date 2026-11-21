# Padrões para servidores MCP por HTTP

Revisado em 2026-11-20 contra: MCP 2026-07-28, Laravel MCP 1.2.1, Next.js App Router, MCP TypeScript SDK v2, Vercel mcp-handler e MCP Inspector v2.

| Modo | Referência | Decisão |
| --- | --- | --- |
| `protocol` | [Protocolo](protocol.md) | Revisão, transporte, primitivas, OAuth e testes HTTP |
| `laravel` | [Laravel](laravel.md) | Registro da rota, classes, guards e testes Artisan |
| `nextjs` | [Next.js](nextjs.md) | Route Handler, SDK Web Standard e adaptador da Vercel |

Use a revisão publicada como referência para novos servidores. Confirme no
lockfile se o pacote instalado a implementa e teste os clientes-alvo. Registre
se cada caminho é moderno ou legado, pois o mesmo nome Streamable HTTP cobre
comportamentos diferentes.

## Fontes oficiais

- [Versão publicada e mudanças](https://blog.modelcontextprotocol.io/posts/2026-07-28/),
  [versionamento](https://modelcontextprotocol.io/specification/versioning) e
  [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http).
- [Autorização MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization),
  [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728.html) e
  [segurança MCP](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices).
- [Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools),
  [resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources),
  [prompts](https://modelcontextprotocol.io/specification/2026-07-28/server/prompts),
  [elicitation](https://modelcontextprotocol.io/specification/2026-07-28/client/elicitation) e
  [Multi Round-Trip Requests](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/mrtr).
- [Laravel MCP](https://laravel.com/docs/mcp),
  [guia de atualização do pacote](https://github.com/laravel/mcp/blob/v1.2.1/UPGRADE.md),
  [Passport](https://laravel.com/docs/passport) e [Sanctum](https://laravel.com/docs/sanctum).
- [Route Handlers do Next.js](https://nextjs.org/docs/app/getting-started/route-handlers),
  [SDK oficial no runtime Web Standard](https://ts.sdk.modelcontextprotocol.io/v2/serving/web-standard),
  [SDK v1 para compatibilidade](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x) e
  [Vercel mcp-handler](https://github.com/vercel-labs/mcp-handler).
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector).
