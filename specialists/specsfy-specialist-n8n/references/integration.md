# API, webhook e versionamento

## API pública

```bash
curl -s https://n8n.example.com/api/v1/workflows \
  -H "X-N8N-API-KEY: $N8N_API_KEY"

curl -s -X POST https://n8n.example.com/api/v1/workflows/$ID/activate \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

- Base é `/api/v1`. Autenticação por cabeçalho `X-N8N-API-KEY`, com chave criada
  no n8n e escopo conforme o plano.
- Listagem é paginada por cursor (`cursor` e `limit`). Não presuma que a primeira
  página contém tudo.
- `POST` aceita chave de idempotência. Use quando o cliente puder repetir a
  chamada por timeout.
- Requisição acima do limite recebe `429`. Trate com espera progressiva e limite
  de tentativa, não com laço imediato.
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
| Autenticação | `X-Signature` com HMAC do corpo |
| Corpo | `{ "orderId": 42, "totalCents": 15990 }` |
| Resposta | `201` com `{ "accepted": true }` |
| Erro de validação | `422` com lista de campo |
| Erro interno | `500` sem detalhe de infraestrutura |
| Prazo | resposta em até 5 segundos |
| Idempotência | `Idempotency-Key` do cliente |

- URL de produção é `/webhook/<caminho>`. URL de teste é `/webhook-test/<caminho>`
  e só responde com o workflow em escuta no editor. Consumidor apontado para URL
  de teste falha em produção.
- Método diferente do configurado devolve erro. Webhook de provedor que envia
  `PUT` precisa de nó configurado para `PUT`.
- Autenticação por assinatura exige corpo bruto para calcular HMAC. Nó que
  transforma o corpo antes da validação quebra a assinatura.
- Resposta imediata com `202` é adequada para processamento longo. Responder
  `200` antes do efeito cria a expectativa de que o efeito já aconteceu.
- Provedor que espera resposta específica, como desafio de verificação, precisa de
  nó `Respond to Webhook` com status e corpo exatos.
- Provedor que repete webhook em erro exige idempotência no efeito: `orderId` ou
  `$execution.id` como chave de deduplicação.
- Tempo de resposta conta o caminho até `Respond to Webhook`. Chamada externa
  lenta antes da resposta estoura o prazo do provedor.
- Valide tamanho e tipo do corpo antes de processar. Webhook público recebe
  payload malformado e tentativa de abuso.

## Promoção entre ambientes

1. Exporte o workflow do ambiente de origem:

```bash
n8n export:workflow --id=$ID --output=workflows/pedido-criado.json
```

2. Revise o JSON no diff. Credencial aparece por identificador; confirmar que o
   identificador existe no destino faz parte da promoção.
3. Importe no destino:

```bash
n8n import:workflow --input=workflows/pedido-criado.json
```

4. Reassocie credencial do ambiente quando o identificador não coincide.
5. Ative o workflow e execute um caso de fumaça com dado de teste.
6. Registre versão, commit e identificador do workflow na spec.

- Source control e ambientes do n8n automatizam preview, push e pull entre
  instâncias. O recurso depende do plano; sem ele, export e import com Git é o
  caminho.
- Nunca importe workflow de produção em staging sem revisar variável e credencial
  que serão apontadas para serviço real.
- Workflow desativado no destino não recebe webhook. Ativação é passo explícito.

## Versionamento no Git

```
workflows/
  pedido-criado/
    workflow.json
    README.md
```

- `workflow.json` é o export do n8n, sem credencial.
- `README.md` descreve gatilho, contrato, dependência, dono e procedimento de
  promoção.
- Nome do workflow inclui domínio e função, sem "teste final v2".
- Toda alteração de comportamento entra por commit com mensagem que explica o
  efeito, não a mecânica do nó.
- Tag de versão do repositório de automação marca o conjunto promovido, não cada
  workflow isolado.
- Workflow criado só no canvas é dívida: não tem revisão, diff nem rollback.

## Validação de integração

```bash
curl -i -X POST https://n8n.example.com/webhook/pedido-criado \
  -H "Content-Type: application/json" \
  -H "X-Signature: <hmac>" \
  -d '{"orderId":42,"totalCents":15990}'
```

- Confirme status, corpo e cabeçalho da resposta do contrato.
- Repita a mesma requisição e confirme que o efeito não duplica.
- Envie corpo inválido e confirme `422` sem detalhe interno.
- Envie assinatura errada e confirme rejeição.
- Envie volume acima do limite e confirme `429` com recuperação posterior.
- Execute a promoção em staging e compare o diff do JSON com o esperado.
- Confirme que a chave de API usada no teste é a do ambiente de teste.
- Não declare integração pronta sem resposta real, teste de repetição e teste de
  erro; requisição manual bem-sucedida cobre apenas o caminho felizmente válido.
