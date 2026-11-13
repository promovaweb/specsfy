# Referências do MCP TypeScript SDK

Arquivos copiados do repositório `modelcontextprotocol/typescript-sdk`,
branch `v1.x`, licença MIT (`LICENSE`):

- `README.md`: visão geral do SDK 1.x e instalação.
- `server.md`: `McpServer`, `registerTool`, `registerResource`,
  `ResourceTemplate`, `registerPrompt`, transportes.
- `capabilities.md`: sampling, elicitation e tasks.
- `protocol.md`: camada de protocolo e mensagens.

O Termfy usa `@modelcontextprotocol/sdk` 1.32.x, linha de manutenção que
implementa a especificação 2025-11-25. A v2 (`@modelcontextprotocol/server`)
muda nomes de pacote e API; migre só com pedido explícito e leia o guia de
migração em https://ts.sdk.modelcontextprotocol.io/v2/migration/upgrade-to-v2.

A pasta `../mcp-spec/` traz páginas de https://modelcontextprotocol.io sobre
conceitos de servidor, transporte stdio, tools, resources, prompts,
segurança local, Inspector e depuração.
