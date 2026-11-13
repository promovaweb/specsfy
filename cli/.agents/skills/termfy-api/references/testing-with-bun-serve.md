# Testar o client com Bun.serve

Crie sob `tests/` o arquivo `api-<service>.test.ts`. Execute com `bun test`.
O client deve falar com um servidor local real; não substitua `fetch` por
um mock que esconda headers, serialização, abort e leitura da resposta.

## Servidor controlado

Use loopback e porta 0 para evitar conflito entre testes. Este helper pode
ficar no próprio arquivo de teste. Ele não depende de serviço externo:

```ts
export function startFakeApi() {
  const calls: Array<{ method: string; path: string; body: string }> = [];
  let remainingFailures = 0;
  let responseDelayMs = 0;
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const url = new URL(request.url);
      calls.push({
        method: request.method,
        path: url.pathname + url.search,
        body: await request.text(),
      });
      if (request.headers.get("authorization") !== "Bearer test-token") {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }
      if (responseDelayMs > 0) await Bun.sleep(responseDelayMs);
      if (remainingFailures > 0) {
        remainingFailures--;
        return Response.json({ message: "Unavailable" }, { status: 503 });
      }
      return Response.json({ items: [{ id: "o1", status: "open" }], nextCursor: null });
    },
  });
  return {
    baseUrl: server.url.origin,
    calls,
    failNext(count: number) { remainingFailures = count; },
    delay(ms: number) { responseDelayMs = ms; },
    stop() { server.stop(true); },
  };
}
```

O helper retorna a forma JSON do exemplo de client. Adapte-a ao contrato
real. Adicione respostas controladas para 429, paginação, 204, JSON inválido,
corpos longos e conteúdo sensível fictício. Para falha de conexão, encerre
o servidor antes de chamar o client e confira o limite de tentativas.

## Isolar configuração e credenciais

Use os helpers de `src/config/paths.ts`, `src/config/settings.ts` e
`src/config/credentials.ts`. Antes de qualquer acesso ao cofre:

1. Salve os valores anteriores de `HOME_VARIABLE` e `MASTER_KEY_VARIABLE`.
2. Crie uma pasta com `mkdtempSync` e atribua-a a
   `process.env[HOME_VARIABLE]`. Remova a variável da master key herdada.
3. Grave `shop.token` com `setCredential("shop.token", "test-token")`.
4. Use `readSettings`, `setPath` e `writeSettings` para apontar
   `shop.baseUrl` ao `baseUrl` do dublê. Autorize HTTP apenas para loopback
   no contexto de teste do client.
5. No `finally` ou `afterEach`, pare o servidor, remova a pasta temporária
   e restaure ambas as variáveis, inclusive quando antes eram ausentes.

Não use `test.concurrent` com essas variáveis globais. Passe o ambiente
isolado a subprocessos; não deixe a CLI herdar a pasta pessoal. Confira
`tests/config.test.ts` para o padrão de isolamento já usado no starter kit.

## Casos que precisam passar

| Caso | Comprovação |
| --- | --- |
| sucesso | função do client devolve dados tipados e envia query, método e payload corretos |
| token ausente | código 4 e nenhuma request recebida |
| URL inválida | código 3 e nenhuma request recebida |
| 503 seguido de sucesso | número exato de chamadas e dados finais corretos |
| falha de rede persistente | tentativas limitadas e código 5 |
| timeout | chamada encerra dentro de margem curta e respeita o orçamento total |
| 401, 403 ou 404 | uma chamada, código 5 e `details.status` correto |
| 429 | espera respeita header válido e termina ao exceder o orçamento |
| POST sem idempotência | nenhuma repetição, mesmo após 503 ou timeout |
| paginação | cursor correto e parada ao terminar, repetir cursor ou atingir o teto |
| resposta inválida | código 5, sem esconder erro como lista vazia |
| corpo com segredo fictício | token e campos sensíveis ausentes de mensagem e `details` |
| corpo longo | leitura limitada e resumo dentro do teto |

Nas asserções, use `AppError` e `ExitCode.NETWORK_OR_API` de
`src/app/errors.ts` e `src/app/exit-codes.ts`. Confira `error.code` e
`error.details`, não apenas o texto. Capture o erro da chamada real ao
client; um teste que chama só o dublê não confere a integração.
