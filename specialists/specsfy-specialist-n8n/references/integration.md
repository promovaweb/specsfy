# API, webhook e versionamento

## API pública

```bash
curl --fail-with-body 'https://n8n.example.com/api/v1/workflows?limit=20' \
  -H "X-N8N-API-KEY: ${N8N_API_KEY:?}"
```

- Use `X-N8N-API-KEY` em `/api/v1`, com chave e escopo conforme o plano.
  Passe `nextCursor` como `cursor` na chamada seguinte, até o fim da lista.
- Desde 2.45.0, a API pública aceita `Idempotency-Key` em `POST`. Reutilize
  chave e corpo no retry da mesma operação. O resultado bem-sucedido fica
  disponível por 12 horas. Para versões anteriores ou retentativas fora
  dessa janela, confirme o estado do recurso antes de repetir uma mutação.
- Desde 2.47.0, o limite da API pública por chave pode ser habilitado e começa
  desligado. Em `429`, respeite `Retry-After` quando presente e limite
  tentativas com atraso e jitter. A API e os webhooks de usuário têm
  contratos independentes.
  [Idempotência e rate limiting da API](https://blog.n8n.io/new-in-n8n-public-api-rate-limits-that-keep-every-team-on-your-instance-running/)
- Requisição que cria ou altera recurso devolve o recurso criado. Guarde o
  identificador para a próxima chamada em vez de buscar por nome.
- API pública não substitui o editor para depuração; ela serve automação e
  promoção controlada.
- Desligue a API pública quando nenhum consumidor a usa:

```bash
export N8N_PUBLIC_API_DISABLED=true
```

Confirme o nome da variável e a disponibilidade do recurso na documentação da
versão instalada antes de aplicar.

## Chave de API

- Crie chave por consumidor, com nome que identifica sistema e dono.
- Escopo mínimo: leitura quando o consumidor só lista; escrita quando precisa
  alterar.
- Guarde em cofre ou secret do repositório. Chave em log, em URL ou em workflow
  exportado é credencial vazada.
- Rotacione com sobreposição: crie a nova, atualize o consumidor, revogue a
  antiga.
- Chave não é autorização de usuário final. A aplicação que chama o n8n autentica
  o próprio usuário.

## Webhook como contrato

Documente antes de montar o nó:

| Item | Exemplo |
| --- | --- |
| Método | `POST` |
| Caminho | `/webhook/pedido-criado` |
| Autenticação | `X-Signature: sha256=<hex>`, com HMAC-SHA256 do corpo bruto (contrato ilustrativo) |
| Corpo | `{ "orderId": 42, "totalCents": 15990 }` |
| Resposta | `201` com `{ "accepted": true }`, reaproveitado após concluir |
| Conflito | `409` se a mesma chave estiver em processamento ou vier com corpo diferente |
| Erro de validação | `422` com lista de campo |
| Erro interno | `500` sem detalhe de infraestrutura |
| Prazo | resposta em até 5 segundos |
| Idempotência | `Idempotency-Key` do cliente |

- URL de produção é `/webhook/<caminho>`. URL de teste é `/webhook-test/<caminho>`
  e só responde com o workflow em escuta no editor. Consumidor apontado para URL
  de teste falha em produção.
- Método diferente do configurado devolve erro. Webhook de provedor que envia
  `PUT` precisa de nó configurado para `PUT`.
- Habilite **Raw Body** no nó Webhook quando a verificação ocorrer no fluxo.
  Verifique a assinatura antes de interpretar JSON ou produzir efeito. Use um
  nó verificador com acesso à credencial ou um gateway confiável que recebe
  os bytes brutos. No contrato ilustrativo, valide o formato do cabeçalho,
  calcule HMAC-SHA256 com a chave do cofre e compare os digests em tempo
  constante. Rejeite assinatura inválida com `401`. Se usar gateway, bloqueie
  acesso direto ao webhook. Para um provedor real, siga exatamente os headers,
  codificação e bytes assinados, incluindo timestamp e janela se exigidos.
- Configure **Respond** como **Using 'Respond to Webhook' Node** quando o fluxo
  precisar devolver o status e corpo específicos de cada resultado. Evite
  tokens em URLs, que podem aparecer em logs.
- Resposta imediata com `202` é adequada para processamento longo. Responder
  `200` antes do efeito cria a expectativa de que o efeito já aconteceu.
- Provedor que espera resposta específica, como desafio de verificação, precisa de
  nó `Respond to Webhook` com status e corpo exatos.
- Cada entrega pode iniciar uma execução nova. Use `$execution.id` para
  correlação. Para deduplicar, reserve atomicamente um identificador estável
  por provedor, consumidor e operação: o ID do evento, uma chave de negócio
  ou o `Idempotency-Key` previsto neste webhook. Valide a autenticação antes
  de reservar e associe a chave ao hash do corpo. Nesse exemplo, a assinatura
  cobre apenas o corpo. Use também a unicidade de negócio de `orderId` para
  impedir que repetir o mesmo corpo com outra chave crie novo pedido.
- Use restrição única no armazenamento persistente e permita só ao vencedor
  produzir o efeito. Grave o resultado para responder às repetições e trate
  requisição concorrente e chave com corpo divergente. Quando efeito e
  reserva estiverem no mesmo banco, finalize os dois na mesma transação.
  Para efeito remoto, repasse uma chave estável ao serviço com idempotência
  ou reconcilie o resultado antes de repetir uma tentativa de estado incerto.
- Tempo de resposta conta o caminho até `Respond to Webhook`. Chamada externa
  lenta antes da resposta estoura o prazo do provedor.
- Valide tamanho e tipo do corpo antes de processar. Webhook público recebe
  payload malformado e tentativa de abuso.

## Promoção entre ambientes

1. Selecione no ambiente de origem a revisão validada. Use `--published` se
   for a revisão publicada que você validou. Para outra revisão, substitua
   essa opção por `--version="$VERSION_ID"` e confirme o suporte com
   `n8n export:workflow --help`. Defina `WORKFLOW_ID` com o ID na origem.

```bash
mkdir -p workflows/pedido-criado
n8n export:workflow --id="${WORKFLOW_ID:?}" --published \
  --output=workflows/pedido-criado/workflow.json
```

2. Revise o diff. Remova segredos e dados sensíveis de parâmetros, headers
   literais em HTTP Request, nós importados de cURL, dados fixados e nomes de
   credenciais antes de versionar. Preserve a versão e o ID no registro da
   promoção.
3. Confira o ID no destino porque a importação pode sobrescrever o workflow
   existente. Confirme o projeto de destino e as credenciais que ele pode
   usar. Se houver colisão indevida, dê ao workflow um ID de destino diferente
   e confira referências de outros workflows. No destino, defina
   `DEST_PROJECT_ID` com o ID do projeto correto.

```bash
n8n import:workflow --input=workflows/pedido-criado/workflow.json \
  --projectId="${DEST_PROJECT_ID:?}"
```

4. Reassocie credenciais no destino e confira dependências e a revisão
   importada. Em n8n 2.x, publique a revisão pretendida pelo editor e faça
   um teste de fumaça na URL de produção do workflow no ambiente de destino.
5. Entregue versão de origem, versão publicada no destino, commit, ID e
   evidência ao responsável pela promoção.

- Source control e ambientes do n8n dependem do plano. Sem o recurso, use
  export e import controlados pelo Git.
- Confira credenciais, variáveis e destino dos efeitos antes de usar um
  export de produção em staging.
  [CLI do servidor](https://docs.n8n.io/deploy/host-n8n/configure-n8n/use-the-command-line.md)
  · [Exportar e importar](https://docs.n8n.io/build/manage-workflows/export-and-import.md)

## Versionamento no Git

```
workflows/
  pedido-criado/
    workflow.json
    README.md
```

- `workflow.json` é o export revisado e sanitizado do n8n.
- `README.md` descreve gatilho, contrato, dependência, dono e procedimento de
  promoção.
- Nome do workflow inclui domínio e função, sem "teste final v2".
- Toda alteração de comportamento entra por commit com mensagem que explica o
  efeito, não a mecânica do nó.
- Tag de versão do repositório de automação marca o conjunto promovido, não cada
  workflow isolado.
- Workflow criado só no canvas é dívida: não tem revisão, diff nem rollback.

## Validação de integração

Em staging, publique o workflow do contrato ilustrativo com uma credencial
de teste. Exporte `WEBHOOK_HMAC_SECRET` a partir do cofre e defina
`WEBHOOK_URL` com a URL completa do webhook de staging. Use um pedido
descartável que ainda não produziu efeito.

```bash
set -euo pipefail
: "${WEBHOOK_HMAC_SECRET:?}" "${WEBHOOK_URL:?}"
body='{"orderId":42,"totalCents":15990}'
key="pedido-criado-42-$(date +%s)"
signature=$(printf '%s' "$body" | node -e '
  const { createHmac } = require("node:crypto");
  const { readFileSync } = require("node:fs");
  process.stdout.write(createHmac("sha256", process.env.WEBHOOK_HMAC_SECRET)
    .update(readFileSync(0)).digest("hex"));
')

send_event() {
  curl --silent --show-error --max-time 5 \
    --write-out '\n%{http_code}\n' "${WEBHOOK_URL}" \
    -H 'Content-Type: application/json' \
    -H "X-Signature: sha256=$signature" \
    -H "Idempotency-Key: $key" \
    --data-binary "$body"
}

first=$(send_event)
repeated=$(send_event)
test "$first" = "$repeated"
test "${first##*$'\n'}" = 201
printf '%s\n' "$first"
```

- Confira o JSON e consulte o banco ou a API que recebeu o efeito. Pela
  chave do pedido de teste, verifique que o total persistido passou de zero
  para um na primeira chamada e continua em um depois da repetição.
- Com outro pedido descartável e a mesma chave entre duas chamadas
  simultâneas, confirme um único efeito. Aceite a resposta armazenada se o
  primeiro já concluiu ou `409` se ainda estiver em processamento. Assine
  novamente ao mudar o corpo e confirme `409` ao reutilizar uma chave com
  conteúdo diferente.
- Assine um corpo inválido e confira `422`. Envie assinatura ausente ou
  inválida e confira `401`, com zero efeitos persistidos.
- Se o limite da API pública estiver habilitado, confirme `429`,
  `Retry-After` e recuperação em um teste separado, com chave de staging.
