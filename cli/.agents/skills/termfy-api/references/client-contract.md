# Contrato do client HTTP

## Forma e dependências

Use funções como `listOrders`, `getOrder`, `createOrder`, `updateOrder` e
`deleteOrder` somente quando essas operações estiverem na spec. O client
recebe dados de domínio e devolve dados de domínio, sem `{ ok, command }`,
texto de terminal ou objetos do SDK MCP. Cada camada monta sua apresentação.

Leia configuração em tempo de chamada. Em `src/config/settings.ts`, declare
uma entrada com esta forma, substituindo o domínio de exemplo pelo real:

```ts
const serviceSetting = {
  key: "shop.baseUrl",
  type: "string" as const,
  default: "https://api.example.com",
  description: "Base URL for the shop API.",
};
```

Acrescente a entrada a `SETTINGS_SCHEMA`. Leia-a com
`getPath(readSettings(), "shop.baseUrl")` e o token com
`getCredential("shop.token")`. O nome literal também permite a conferência
manual de consumo: cada `getCredential("<nome>")` de `src/` precisa
aparecer em Credentials do `CLISPEC.md` quando a spec fecha. Declare a
credencial na Surface da spec com os commands ou tools consumidores em
"usada por", não com o nome do módulo.

Defina um contrato por operação. Exemplo de tipos locais a criar:

```ts
export interface Order {
  id: string;
  status: string;
}

export interface ListOrdersInput {
  limit: number;
  status?: string;
  cursor?: string;
}

export interface OrdersPage {
  items: Order[];
  nextCursor: string | null;
}
```

Valide respostas como `unknown` antes de convertê-las nesses tipos. Não
use uma coerção TypeScript como substituto da validação. Trate 204 sem
chamar `response.json()`. Para endpoints JSON, JSON malformado e schema
inesperado geram `error.network` e não são repetidos automaticamente.

## Requests e tempo

Monte query com `URL` e `URLSearchParams`. Codifique identificadores no
path com `encodeURIComponent`. Não aceite uma URL externa como path nem
encaminhe Authorization para a origem de um link de paginação sem validar
sua igualdade com a origem configurada. Recuse redirects por padrão ou
valide cada destino antes de repetir a request autenticada.

Defina timeout e quantidade de tentativas como parâmetros internos
validados, sem acrescentar options públicas fora da spec. Um ponto de
partida é 5 segundos por tentativa, três tentativas totais e orçamento
máximo de 20 segundos incluindo espera e leitura do corpo. Ajuste ao
contrato do serviço e documente os valores escolhidos.

Em cada tentativa, use `AbortSignal.timeout` com o menor valor entre o
limite por tentativa e o tempo restante. Consuma ou cancele o corpo antes
de repetir. Limite a leitura em bytes; não carregue um corpo sem limite
para depois apenas cortar a string.

## Erros e retries

| Situação | Tratamento |
| --- | --- |
| token ausente | preserve `error.credentials`, código 4, sem request |
| URL ou timeout inválido | `error.config`, código 3, sem request |
| falha de rede, timeout ou 5xx | repita dentro do limite para operações idempotentes |
| 4xx, incluindo 401, 403 e 404 | `error.network`, código 5, sem retry automático |
| 429 | siga a política de rate limit abaixo |
| resposta final não bem-sucedida | `error.network` com status e resumo sanitizado |
| cancelamento solicitado pelo consumidor | encerre sem retry; preserve a semântica de cancelamento |

Use espera exponencial com jitter e teto. Injete a função de espera nos
testes para conferir os intervalos sem demoras. Não capture `AppError` de
configuração, cofre ou validação de entrada no mesmo ramo de retry de rede.

Para POST, PATCH ou outra operação com efeito, desative retry por padrão.
Só o habilite quando a API garantir idempotência. Nesse caso, mantenha a
mesma chave de idempotência e o mesmo payload em todas as tentativas. Uma
falha de transporte pode ocorrer após o servidor já ter aplicado a operação.

O contrato do starter kit aceita dados adicionais no segundo argumento:

```ts
throw error.network("Shop API request failed.", {
  service: "shop",
  method: "GET",
  status: 503,
  body: "Service temporarily unavailable",
  attempts: 3,
});
```

Importe `error` de `src/app/errors.ts` com caminho relativo ao módulo.
`error.network` cria `AppError` com `ExitCode.NETWORK_OR_API`. Os `details`
entram no JSON público. Use `status: null` e `body: null` se nenhuma
resposta chegou. Para respostas, leia no máximo 8 KiB e produza um resumo
de até 512 caracteres depois da sanitização. Prefira campos permitidos
como código público e mensagem pública. Se o corpo não puder ser exposto,
use um marcador como `"[omitted]"`. Nunca repasse `cause`, request completa,
URL com query sensível ou corpo bruto do servidor.

## Paginação

A operação de lista devolve uma página com `nextCursor`, ou o equivalente
previsto pela API e pela spec. Respeite `limit`, valide cursores e pare
quando não houver próxima página. Se houver coleta de múltiplas páginas,
limite quantidade de páginas, itens e duração. Detecte cursor repetido.
Não mantenha o token em cursores nem em logs. Não execute requests paralelas
sem um limite definido pelo serviço.

## Rate limit

Trate 429 separadamente de outros 4xx. Se a operação puder ser repetida,
interprete `Retry-After` em segundos ou HTTP-date, sem ultrapassar o
orçamento restante e o teto de espera. Sem header válido, use o backoff
limitado. Se a espera pedida exceder o orçamento, devolva `error.network`
com status 429 e, quando disponível, `retryAfterMs` nos `details`.
Uma operação de gravação sem idempotência não ganha retry por receber 429.
