# Fontes e compatibilidade

Conferência realizada em 10/11/2026 no checkout do starter kit 0.8.0:
`@modelcontextprotocol/sdk` 1.32.2 e Zod 4.6.7. Os exemplos usam imports do
SDK 1.x com sufixo `.js` e foram executados com Node.js 26.8.1 pelo Hub.
O produto continua usando Bun; executar receitas em Node não valida o
binário compilado nem substitui a suíte do starter kit.

## Ordem de consulta

1. Leia `package.json`, lock e versões realmente instaladas.
2. Confira `src/mcp/`, `template/tool/example.ts` e `tests/mcp.test.ts`.
3. Consulte tipos e implementação do SDK instalado para assinaturas e erros.
4. Use a especificação para o contrato do protocolo e os guias oficiais para
   capacidades adicionais. Não misture exemplos de outra versão principal.

A faixa `^1.32.2` permite atualizações; não garante a versão resolvida. Uma
versão do SDK também não equivale à data da versão negociada do protocolo.
Não force a data da especificação no handshake por copiar um exemplo.

## Fontes oficiais

| Fonte | Consulta |
| --- | --- |
| [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | Releases, organização do SDK e migrações |
| [Tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) | Entrada, saída estruturada e anotações |
| [Resources](https://modelcontextprotocol.io/specification/2025-11-25/server/resources) | URIs, templates e descoberta |
| [Prompts](https://modelcontextprotocol.io/specification/2025-11-25/server/prompts) | Argumentos e mensagens |
| [Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) | Stdio e Streamable HTTP |
| [Cancellation](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/cancellation) | Cancelamento de requisições |
| [Progress](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/progress) | Tokens e notificações de progresso |

As cópias em `mcp-sdk/` e `mcp-spec/` são material de terceiros preservado.
Não edite esses arquivos para corrigir instruções próprias do Termfy. Registre
adaptações nas referências locais e preserve licença e marcador `.terceiros`.

## Recursos que exigem integração específica

Sampling, elicitation, subscriptions, completion, Tasks e transporte HTTP
não estão implementados pelas receitas desta biblioteca. Confira suporte
negociado, API instalada e comportamento do cliente antes de adotá-los.
Não anuncie capacidades que o servidor não atende.

Use `termfy-mcp-client` para configuração dos hosts, `termfy-api` para HTTP
de domínio, `termfy-config` para cofre e `termfy-test` para cobertura conjunta
de CLI, TUI e MCP. As verificações desta ampliação estão em
[exemplos](examples/README.md).
