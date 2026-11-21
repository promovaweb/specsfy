# n8n

O especialista n8n orienta o agente em três frentes da automação. O modo
**Workflows** organiza nó, item, expressão, credencial, erro e sub-workflow. O
modo **Self-hosting** decide instalação, banco, fila, proxy reverso, backup e
atualização. O modo **Integration** trata a API pública, o webhook como contrato e
o versionamento do workflow.

A ideia central: workflow é código de produção. Tem contrato de entrada,
tratamento de erro, versão e caminho de reversão.

## Quando usar

- Você vai criar ou revisar workflow, escolher nó, escrever expressão, organizar
  item, configurar credencial ou extrair sub-workflow.
- Um workflow falha em produção e você precisa decidir entre retry, saída de erro
  e Error Workflow.
- Você vai instalar o n8n com Docker ou Compose, configurar variável de ambiente,
  apontar para Postgres ou ativar queue mode com Redis.
- O webhook não recebe, responde com URL errada ou fica atrás de proxy reverso.
- Você precisa consumir a API pública, versionar workflow no Git ou promover
  entre ambientes.
- Você vai atualizar a versão do n8n e precisa saber o que muda no banco e na
  configuração.

O agente confirma versão, modo de execução, banco e broker antes de recomendar.
Instância em SQLite, instância em queue mode e instância gerenciada têm limites
diferentes.

## Como ele trabalha

1. Descobre versão, modo de execução, banco, broker, volume de execução e o
   contrato de entrada do workflow.
2. Classifica o pedido em Workflows, Self-hosting ou Integration.
3. Descreve gatilho, entrada esperada e efeito externo antes de montar o nó.
4. Trata erro e retry no desenho, com destino da falha e alerta.
5. Valida com execução real, restauração de backup e promoção entre ambientes.

## Workflows

O modo Workflows mantém o fluxo legível e o efeito previsível.

- Cada nó recebe lista de itens com `json` e `binary`, e a expressão é avaliada
  por item.
- Nome do nó descreve a ação. "IF1" não explica nada.
- Expressão referencia o nó anterior pelo nome. Índice de item quebra quando a
  ordem muda.
- `onError` escolhe entre parar, continuar no fluxo normal e seguir pela saída de
  erro.
- Retry só em operação idempotente.
- Erro não tratado chega ao Error Workflow, com `execution.id` no alerta.
- Sub-workflow tem contrato de entrada, saída e erro.
- Loop processa em lote com tamanho medido, e falha parcial tem tratamento.

Os exemplos de expressão, a tabela de erro e retry, o sub-workflow e o teste de
workflow estão em
[workflows.md](../../../specialists/specsfy-specialist-n8n/references/workflows.md).

## Self-hosting

O modo Self-hosting define a instância que roda em produção.

- Imagem com versão fixa e volume em `/home/node/.n8n`.
- Processo roda como usuário `node`, e o volume precisa de permissão correta.
- `N8N_ENCRYPTION_KEY` é estável, está em cofre e entra no backup.
- Postgres em produção. SQLite só em desenvolvimento declarado.
- `N8N_WEBHOOK_URL` aponta para a URL pública, com o nome da variável conforme a
  versão instalada.
- `N8N_PROXY_HOPS` e cabeçalho de proxy precisam combinar.
- Queue mode separa main, worker e webhook, com a mesma chave e a mesma base.
- Poda de execução configurada evita banco crescendo sem limite.
- Backup cobre banco, chave, volume e configuração efetiva.
- Atualização tem nota de release lida, backup testado e staging antes de
  produção.

O Compose de exemplo, a configuração de fila, o proxy, o backup e o procedimento
de atualização estão em
[self-hosting.md](../../../specialists/specsfy-specialist-n8n/references/self-hosting.md).

## Integração

O modo Integration define como outro sistema conversa com o n8n.

- API pública usa `/api/v1` e cabeçalho `X-N8N-API-KEY`.
- Listagem é paginada por cursor, e `429` pede espera progressiva.
- `POST` repetido usa chave de idempotência.
- Chave de API tem escopo mínimo, dono e rotação.
- Webhook é contrato: método, caminho, autenticação, corpo, resposta, status e
  prazo.
- URL de teste responde só com o workflow em escuta; produção usa outra URL.
- Assinatura é calculada sobre o corpo bruto.
- Promoção exporta JSON, revisa diff, reassocia credencial e executa caso de
  fumaça.
- Workflow exportado vive no Git, com README de contrato e dono.

Os comandos de API, a tabela de contrato de webhook, o fluxo de promoção e a
validação de integração estão em
[integration.md](../../../specialists/specsfy-specialist-n8n/references/integration.md).

## Erros que ele evita

- `latest` como versão da imagem.
- Container recriado sem chave de criptografia.
- SQLite com queue mode.
- Webhook apontando para `localhost`.
- Editor exposto sem TLS e sem autenticação.
- Retry infinito em API de terceiro.
- Lógica de negócio só no canvas, sem export.
- Credencial copiada em nó `Set` ou `Code`.
- Execução sem poda e sem mascaramento.
- API pública ligada sem consumidor e com chave total.

## Como conferir o resultado

- Execução com dado fixado e execução com entrada inválida pelo caminho de erro.
- `curl` no webhook com e sem credencial, conferindo status e corpo.
- Retry com falha simulada, sem efeito duplicado.
- `docker compose config` validando variável obrigatória.
- Endpoint de saúde do worker e log de conexão com banco e Redis.
- Restauração de backup com workflow abrindo e credencial funcionando.
- Promoção entre ambientes com diff esperado e versão validada.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-n8n --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Docker](docker.md) cuida da imagem, do Compose e da stack.
- [PostgreSQL](postgres.md) opera o banco que guarda workflow e execução.
- [Redis](redis.md) opera o broker do queue mode.
- [Server](server.md) define o host e o proxy reverso.
- [Cloudflare](cloudflare.md) publica DNS, TLS e Tunnel do webhook.
- [Delivery](delivery.md) coordena release da aplicação que integra com o n8n.
- [Segurança de Aplicações](application-security.md) define ameaça e autorização.
- [Observabilidade](observability.md) define métrica, log e alerta.
- [Git](git.md) define branch e revisão do workflow exportado.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-n8n/SKILL.md),
com o índice e as regras comuns em
[standards.md](../../../specialists/specsfy-specialist-n8n/references/standards.md),
o workflow em
[workflows.md](../../../specialists/specsfy-specialist-n8n/references/workflows.md),
a instância em
[self-hosting.md](../../../specialists/specsfy-specialist-n8n/references/self-hosting.md)
e a integração em
[integration.md](../../../specialists/specsfy-specialist-n8n/references/integration.md).
