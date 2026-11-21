# Padrões e referências n8n

Reúne as regras que valem para workflow, hospedagem e integração, o índice das
referências por modo e as fontes oficiais.

Revisado em 2026-11-20 contra: documentação oficial do n8n na linha 2.x, com
notas de versão citadas na própria documentação (por exemplo `N8N_WEBHOOK_URL` a
partir de 2.30.0 e offload de resposta grande a partir de 2.34.0), página de
queue mode, requisitos de produção, backup e restore, API pública e guia de
webhook.

## Versão e modo de execução

```bash
n8n --version
docker compose exec n8n n8n --version
```

- Descubra a versão no manifest e valide na instância. Os exemplos fixam
  2.48.7, canal estável em 20/11/2026. Na mesma data, o beta é 2.49.3 e
  3.0 está em early access. Atualize somente após revisar release e testar
  restauração.
  [Changelog](https://docs.n8n.io/changelog)
  · [3.0](https://docs.n8n.io/changelog/v30-breaking-changes)
- `EXECUTIONS_MODE=regular` executa no processo principal.
  `EXECUTIONS_MODE=queue` separa fila e execução.
- `DB_TYPE=postgresdb` em produção. SQLite serve desenvolvimento e instância
  pessoal.
- Volume de execução e retenção definem o tamanho do banco. Instância sem poda
  cresce até parar.

## Índice dos modos

| Modo | Abre | Conteúdo |
| --- | --- | --- |
| workflows | [workflows.md](workflows.md) | nó, item, expressão, credencial, erro, retry e sub-workflow |
| self-hosting | [self-hosting.md](self-hosting.md) | Docker, Compose, variável, Postgres, queue mode, proxy, backup e upgrade |
| integration | [integration.md](integration.md) | API pública, webhook como contrato, chave, idempotência e versionamento |

## Regras comuns

- Workflow é código de produção. Tem contrato de entrada, tratamento de erro,
  versão e caminho de reversão.
- O nó referencia credenciais pelo nome e ID. Revise nomes, dados fixados e
  parâmetros de nós, inclusive headers de autenticação literais, antes de
  versionar o JSON. Exporte a revisão validada com `--published` ou
  `--version` e confira IDs, projeto e credenciais antes de importar.
- `N8N_ENCRYPTION_KEY` é segredo de longa duração. Guarde em cofre, replique nos
  workers e inclua no backup.
- Efeito externo roda uma vez. Retry só entra em operação idempotente ou com
  chave de idempotência.
- Execução com erro tem destino observável: Error Workflow, alerta e retenção.
- Toda variável de ambiente que muda URL pública é conferida pela URL gerada, não
  pelo que foi digitado.
- Segredo em log é vazamento. Revise `console.log`, `Set` node e mensagem de erro
  antes de liberar.
- Mudança de versão, de banco e de topologia tem backup e restauração testados.

## Processos

| Processo | Papel | Escala |
| --- | --- | --- |
| `main` | API, editor, gatilho, agendamento | Um em modo regular; mais de um em multi-main com plano que suporta |
| `worker` | Executa workflow da fila | Horizontal, com concurrency declarada |
| `webhook` | Recebe webhook e encaminha execução ao worker | Horizontal, atrás de balanceador |

- Queue mode usa Redis e Postgres com credenciais e chave de criptografia
  consistentes entre os processos. Webhook processor é opcional.
- Webhook processor precisa de balanceador que encaminhe `/webhook/*` e
  `/webhook-waiting/*` para o pool de webhook, e o resto para o main.
- Concurrency muito baixa com muitos workers esgota o pool do banco. A
  documentação recomenda 5 ou mais por worker.
- Multi-main exige licença e afinidade de sessão no balanceador. Em Redis
  compartilhado, dê a cada instalação `QUEUE_BULL_PREFIX` para as filas e
  `N8N_REDIS_KEY_PREFIX` para outras chaves e canais, com o mesmo par de
  valores em todos os seus processos. Antes de 2.3.0, pub/sub não segue o
  segundo prefixo. Use Redis dedicado nessas versões.

## Variáveis que decidem comportamento

| Variável | Efeito quando errada |
| --- | --- |
| `N8N_HOST`, `N8N_PORT`, `N8N_PROTOCOL` | Link e cookie gerados com host ou protocolo errado |
| `N8N_WEBHOOK_URL` (`WEBHOOK_URL` antes de 2.30.0) | URL de webhook aponta para `localhost` ou para host interno |
| `N8N_EDITOR_BASE_URL` | Editor atrás de proxy abre em endereço inacessível |
| `N8N_PROXY_HOPS` | IP e protocolo do cliente chegam errados |
| `N8N_ENCRYPTION_KEY` | Credencial existente fica ilegível |
| `DB_TYPE`, `DB_POSTGRESDB_*` | Instância cai para SQLite ou não conecta |
| `EXECUTIONS_MODE` | Worker não recebe trabalho |
| `QUEUE_BULL_REDIS_*` | Fila não conecta ou conecta no Redis errado |
| `GENERIC_TIMEZONE` | Agendamento dispara na hora errada |
| `EXECUTIONS_DATA_PRUNE`, `..._MAX_AGE`, `..._MAX_COUNT` | Banco cresce sem limite |
| `N8N_DEFAULT_BINARY_DATA_MODE` | Arquivo binário some ou ocupa banco demais |
| `N8N_BLOCK_ENV_ACCESS_IN_NODE` | Expressão lê variável de ambiente indevidamente |

## Segurança mínima

- Editor e API atrás de TLS, com autenticação de usuário e, quando aplicável,
  SSO.
- Editor não exposto publicamente sem necessidade. Painel administrativo entra
  atrás de VPN, Access ou rede restrita.
- Chave de API pública com escopo mínimo e rotação.
- Autentique webhooks por cabeçalho ou assinatura de acordo com o contrato.
  Em HMAC, valide os bytes brutos e as marcas do provedor antes de produzir
  qualquer efeito. Evite credenciais na URL, que pode aparecer em logs.
- Em produção com dados sensíveis, execute Code em runners externos compatíveis
  com a imagem do n8n (regra da casa), com segredo de broker e runner por
  processo executor. Docker define a topologia. Segurança de Aplicações define
  quem pode editar e usar credenciais.
- Redaction de dado de execução quando o payload contém dado pessoal ou segredo.
- Pacote comunitário instalado é código de terceiro no processo. Instale só o
  necessário e revise origem.

## Fontes oficiais

- Documentação: https://docs.n8n.io/
- Primeiro workflow: https://docs.n8n.io/build-your-first-workflow
- Componentes do workflow: https://docs.n8n.io/build/understand-workflows/workflow-components/work-with-nodes/
- Expressões para transformar dado: https://docs.n8n.io/build/work-with-data/transform-data/expressions-for-data-transformation/
- Referência de expressão: https://docs.n8n.io/build/work-with-data/transform-data/expression-reference/
- Tratar erro: https://docs.n8n.io/build/flow-logic/handle-errors-gracefully/
- Sub-workflow: https://docs.n8n.io/build/flow-logic/convert-to-sub-workflows/
- Loop: https://docs.n8n.io/build/flow-logic/loop/
- Credenciais: https://docs.n8n.io/build/understand-workflows/create-and-edit-credentials/
- Salvar e publicar workflow: https://docs.n8n.io/build/understand-workflows/save-and-publish-workflows/
- Histórico de mudança: https://docs.n8n.io/build/manage-workflows/view-change-history/
- Nó Webhook: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- Respond to Webhook: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/
- Error Trigger: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/
- Executar sub-workflow: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/
- Instalar com Docker: https://docs.n8n.io/deploy/host-n8n/install-options/install-with-docker/
- Instalar com Docker Compose: https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/
- Requisitos de produção: https://docs.n8n.io/deploy/host-n8n/install-options/production-requirements/
- Variáveis de ambiente: https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/
- Escolher banco: https://docs.n8n.io/deploy/host-n8n/configure-n8n/choose-n8ns-database/
- Queue mode: https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/enable-queue-mode/
- Webhook com proxy reverso: https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/configuration-examples/configure-webhook-urls-with-reverse-proxy/
- Backup e restore: https://docs.n8n.io/deploy/host-n8n/keep-n8n-running/backup-and-restore/
- Segurança da instância: https://docs.n8n.io/deploy/host-n8n/configure-n8n/security/
- API pública: https://docs.n8n.io/connect/n8n-api/
- Autenticação da API: https://docs.n8n.io/connect/n8n-api/authentication/
- Limite de requisição da API: https://docs.n8n.io/connect/n8n-api/rate-limits/
- Referência de endpoint: https://docs.n8n.io/connect/n8n-api/api-reference/
- Source control e ambientes: https://docs.n8n.io/administer/use-source-control-and-environments/
