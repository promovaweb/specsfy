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

## No Specsfy

**Fonte de entrada por fase**

- Em backlog, leia o item em `specs/backlog/`. A fase registra ali o resultado.
- Em specify e validate, use a spec aberta indicada pela fase.
- Em tasks, o especialista sugere modos e a fase sincroniza essa escolha com
  o plano. A seção 14 é escrita por `specsfy-05-tasks`.
- Em implement, siga a tarefa e o passo carregado. No modo tests, a fase
  conclui o checklist em `prepare`.

Quando houver spec, leia a spec aberta, confira o modo indicado e entregue as
evidências à fase responsável pelo registro.

## Fluxo

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
- Configure o Error Workflow com Error Trigger, normalização e alerta.
  Selecione-o nas configurações do workflow de origem. Use o ID e a URL da
  execução quando existirem. Teste uma falha automática.
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
- O Compose de referência fixa n8n 2.48.7. Use Postgres em produção e
  `EXECUTIONS_MODE=regular` para execução no main.
- `N8N_WEBHOOK_URL` funciona desde 2.30.0 e `WEBHOOK_URL` é o nome legado.
  Use `N8N_EDITOR_BASE_URL` para o editor. Se faltar a URL pública do webhook,
  a instância pode gerar um endereço com a porta interna.
- Configure `N8N_PROXY_HOPS` pelo caminho real. O último proxy envia
  `X-Forwarded-Host`, `X-Forwarded-For` e `X-Forwarded-Proto`.
- Queue mode compartilha Postgres, Redis e chave de criptografia entre main,
  worker e processador opcional de webhook. A URL de teste continua no main.
- Binários da fila precisam de Postgres ou storage externo acessível aos
  processos. Em instalações com dados sensíveis, use runners externos
  (regra da casa), com a mesma versão da instância e um runner por worker.
  Se o main rodar execuções manuais, ele também precisa de runner.
- Poda de execução configurada evita banco crescendo sem limite.
- Backup cobre banco, chave, volumes, configuração e storage externo.
  Migração SQLite para Postgres usa export e import de entidades com
  destino vazio. Promoção de workflow usa export seletivo.
- Atualização tem nota de release lida, backup testado e staging antes de
  produção.

O Compose de exemplo, a configuração de fila, o proxy, o backup e o procedimento
de atualização estão em
[self-hosting.md](../../../specialists/specsfy-specialist-n8n/references/self-hosting.md).

## Integração

O modo Integration define como outro sistema conversa com o n8n.

- API pública usa `/api/v1` e cabeçalho `X-N8N-API-KEY`.
- Listagem é paginada por cursor. O limite por chave da API existe desde
  2.47.0, começa desligado e, quando habilitado, devolve `429` com
  `Retry-After`.
- A API pública aceita `Idempotency-Key` em `POST` desde 2.45.0 e guarda
  respostas bem-sucedidas por 12 horas. Webhooks de usuário têm contrato
  próprio.
- Chave de API tem escopo mínimo, dono e rotação.
- Webhook é contrato: método, caminho, autenticação, corpo, resposta, status e
  prazo.
- URL de teste responde só com o workflow em escuta; produção usa outra URL.
- Para HMAC no fluxo, habilite Raw Body e valide o cabeçalho e os bytes
  exigidos pelo provedor antes do efeito.
- Para deduplicar webhooks, reserve atomicamente o ID do evento ou uma chave
  estável e persista o resultado. Use `$execution.id` para correlação.
- Exporte a revisão validada com `--published` ou `--version`. Revise o JSON,
  incluindo nomes de credenciais, dados fixados e headers literais. Confira
  IDs, projeto e credenciais antes de importar. Publique a revisão pretendida
  no destino e teste o webhook.

Os comandos de API, a tabela de contrato de webhook, o fluxo de promoção e a
validação de integração estão em
[integration.md](../../../specialists/specsfy-specialist-n8n/references/integration.md).

## Padrões

- Fixe versão da imagem e guarde a chave de criptografia no cofre.
- Versione o JSON revisado com o contrato e o dono do workflow.
- Defina o prazo pelo menor limite entre provedor, borda e proxy. Responda de
  forma assíncrona se o contrato permitir e a execução exigir mais tempo.

## Antipadrões

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

## Validação

- Execução com dado fixado e execução com entrada inválida pelo caminho de erro.
- `curl` no webhook com e sem credencial, conferindo status e corpo.
- Entregas concorrentes e repetidas com a mesma chave e falha simulada no
  retry. Confira o efeito persistido no sistema de destino.
- `docker compose config` validando variável obrigatória.
- Liveness e prontidão no main e no worker, logs de banco e Redis e um
  webhook publicado respondendo conforme o contrato.
- Restauração de backup com workflow abrindo e credencial funcionando.
- Promoção entre ambientes com diff esperado e versão validada.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-n8n --agent universal --copy --full-depth
```

## Skills relacionadas

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
