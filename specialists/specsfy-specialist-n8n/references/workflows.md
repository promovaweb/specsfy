# Nó, item, expressão e erro

## Modelo de dado

Cada nó recebe e devolve uma lista de itens. Cada item tem:

```javascript
const item = {
  json: { orderId: 42, totalCents: 15990 },
  binary: { invoice: { data: "...", mimeType: "application/pdf" } },
};
```

- A lista é a unidade de passagem. "Executar uma vez" e "executar por item" são
  decisões explícitas no nó.
- Expressão é avaliada por item, com acesso ao item atual e ao nó anterior.
- Nó que devolve um item por vez alimenta o próximo nó com lista. Nó que devolve
  objeto único alimenta com um item.
- Item vazio interrompe o fluxo, salvo quando o nó tem `alwaysOutputData`. Fluxo
  que depende de dado opcional precisa de caminho para o vazio.

## Estrutura legível

```
[Webhook: receber pedido] -> [Validar payload] -> [IF: cliente existe]
   -> verdadeiro: [HTTP: criar fatura] -> [Responder 201]
   -> falso:      [Set: erro de cliente] -> [Responder 422]
```

- Nome do nó descreve a ação: "Validar payload", não "IF1".
- Grupo de nó relacionado usa Canvas Group com rótulo e nota.
- Nota fixa registra o contrato de entrada e o dono do workflow.
- Fluxo com mais de dez nós organiza em sub-workflow por responsabilidade.

## Expressão

```javascript
{{ $json.orderId }}
{{ $json.customer.email }}
{{ $node["Validar payload"].json.orderId }}
{{ $now.toISO() }}
{{ $execution.id }}
{{ $json.items.length }}
{{ $json.items.map(i => i.totalCents).reduce((a, b) => a + b, 0) }}
```

- Prefira `$json` do item atual e `$node["Nome"].json` para outro nó. Índice de
  item (`$items()[0]`) quebra quando a ordem ou a quantidade muda.
- Use `$execution.id` para correlação da execução. Para deduplicar entregas,
  use a chave estável do [contrato de webhook](integration.md#webhook-como-contrato).
- Quando a transformação justificar um nó Code, dê um nome claro ao nó.
  Em produção com dados sensíveis, use runners externos (regra da casa).
  Revise quem pode editar e publicar o workflow com Segurança de Aplicações
  e configure os runners conforme [self-hosting.md](self-hosting.md).
- `$env` é bloqueado por padrão quando `N8N_BLOCK_ENV_ACCESS_IN_NODE` está
  ligado. Configuração sensível entra por credencial ou variável do processo, não
  por expressão no canvas.
- Teste expressão com dado fixado antes de conectar ao efeito externo.

## Credencial

- Credencial é criada no n8n, com nome que identifica ambiente e dono:
  `stripe-prod`, `stripe-staging`.
- O export inclui nomes e IDs de credenciais. Antes de publicar no Git,
  revise dados fixados e parâmetros, inclusive headers literais de HTTP Request
  e configurações importadas de cURL. Veja a
  [promoção entre ambientes](integration.md#promoção-entre-ambientes).
- Credencial de produção não é usada em workflow de teste.
- Rotação de credencial é feita no n8n e no provedor, com o workflow atualizado no
  mesmo passo.
- Nó `HTTP Request` com autenticação genérica usa credencial do tipo
  `Header Auth`, não cabeçalho literal.

## Erro e retry

Configuração por nó:

| Campo | Valor | Efeito |
| --- | --- | --- |
| `onError` | `stopWorkflow` | Interrompe o fluxo no primeiro erro |
| `onError` | `continueRegularOutput` | Segue com item de erro no fluxo normal |
| `onError` | `continueErrorOutput` | Segue pela saída de erro do nó |
| `retryOnFail` | `true` | Repete a operação |
| `maxTries` | número pequeno | Limite de tentativa |
| `waitBetweenTries` | milissegundos | Espera entre tentativas |

- Retry só em operação idempotente. Criar pedido, cobrar cartão e enviar
  mensagem repetem efeito se não houver chave de idempotência.
- `continueErrorOutput` é o padrão para fluxo que precisa registrar falha e
  responder ao cliente sem derrubar o workflow inteiro.
- Erro esperado de validação é resposta de negócio, não exceção. Separe os dois
  caminhos.
- Falha de dependência externa usa retry com espera progressiva e limite. Laço
  infinito amplia o incidente.
### Error Workflow

1. Crie um workflow com **Error Trigger**, conectado a um nó **Edit Fields**
   que normalize os dados e depois ao nó que envia o alerta.
2. No Edit Fields, adicione `workflowId` com `{{ $json.workflow.id }}`,
   `executionId` com `{{ $json.execution?.id ?? '' }}` e `message` com
   `{{ $json.execution?.error?.message ?? $json.trigger?.error?.message ?? 'Falha sem mensagem' }}`.
   Para o link, use `execution.url` quando houver ID e URL. Se o gatilho falhar
   antes de criar execução, envie o ID do workflow e a mensagem sem link.
   Remova dados sensíveis do alerta.
3. Salve. Em **Settings → Error Workflow** do workflow de origem, selecione
   esse workflow de alerta. Salve e publique o workflow de origem.
4. Dispare uma execução automática em staging e provoque uma falha não
   tratada, por exemplo com **Stop And Error** temporário. Confira que o alerta
   chega com a mensagem e o link, quando disponível. Teste também a
   normalização com payload de falha no gatilho sem ID de execução.

Veja os formatos oficiais de
[payload de erro](https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md).

## Sub-workflow

- `Execute Sub-workflow` chama outro workflow com entrada declarada.
- `Execute Sub-workflow Trigger` define a entrada esperada no filho.
- Sub-workflow tem contrato: nome, entrada, saída e erro. Sem isso, o pai não
  consegue testar.
- Chamada aninhada profunda dificulta leitura. Duas camadas atendem a maioria dos
  casos.
- Sub-workflow que executa por item precisa declarar o modo de execução: uma vez
  para o lote ou uma vez por item.

## Loop e lote

```javascript
// entrada: lista de 1000 pedidos
// Loop Over Items com batchSize 50
```

- `Loop Over Items` processa em lote e devolve o restante para o próximo ciclo.
- Lote grande em um item único estoura memória e tempo de execução. Escolha
  tamanho por medição.
- Acompanhe progresso e falha parcial: lote 7 de 20 falhou, o que acontece com os
  anteriores?
- Fluxo que precisa de ordem estrita não paraleliza. Fluxo independente
  paraleliza com limite.

## Fila de trabalho

- Webhook recebe e responde rápido; processamento longo segue para execução
  assíncrona.
- `Respond to Webhook` define status e corpo. Responder antes de terminar o efeito
  exige aceitar que a falha posterior não chega ao cliente.
- Execução longa em queue mode ocupa worker. Dimensione concurrency pelo consumo
  de memória e de conexão com banco.
- Em queue mode, Redis entrega o ID da execução e transmite respostas de
  webhook. Os dados binários do workflow usam Postgres ou storage externo
  acessível a todos. Para resposta grande, siga a
  [configuração de offload](self-hosting.md#queue-mode).

## Teste

1. Fixe dado de entrada com o contrato real, incluindo campo opcional ausente.
2. Execute manualmente e confira cada nó, não só a saída final.
3. Simule falha da dependência externa e confirme o caminho de erro.
4. Confirme que retry não duplica efeito.
5. Exporte o JSON e revise o diff antes de publicar.
6. Execute em ambiente de staging com credencial de staging.
