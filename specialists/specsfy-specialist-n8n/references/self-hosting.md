# Instalação, banco, fila e proxy

## Compose mínimo

A receita usa n8n 2.48.7 e Postgres 17. Salve o bloco como `compose.yml`.
Defina `N8N_DB_PASSWORD`, `N8N_ENCRYPTION_KEY` e `N8N_RUNNERS_AUTH_TOKEN`
com valores fortes e independentes no `.env` fora do Git ou pelo
orquestrador. A interpolação `:?` impede subir com valor ausente ou vazio.
Use o DNS e as URLs da implantação. O exemplo supõe um NGINX no host com TLS.

```yaml
x-n8n-image: &n8n-image docker.n8n.io/n8nio/n8n:2.48.7
x-n8n-env: &n8n-env
  N8N_HOST: n8n.example.com
  N8N_PROTOCOL: https
  N8N_WEBHOOK_URL: https://n8n.example.com/
  N8N_EDITOR_BASE_URL: https://n8n.example.com/
  N8N_PROXY_HOPS: "1"
  GENERIC_TIMEZONE: America/Sao_Paulo
  TZ: America/Sao_Paulo
  DB_TYPE: postgresdb
  DB_POSTGRESDB_HOST: db
  DB_POSTGRESDB_DATABASE: n8n
  DB_POSTGRESDB_USER: n8n
  DB_POSTGRESDB_PASSWORD: ${N8N_DB_PASSWORD:?defina N8N_DB_PASSWORD}
  N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY:?defina N8N_ENCRYPTION_KEY}
  EXECUTIONS_DATA_PRUNE: "true"
  EXECUTIONS_DATA_MAX_AGE: "336"

x-broker-env: &broker-env
  N8N_RUNNERS_MODE: external
  N8N_RUNNERS_BROKER_LISTEN_ADDRESS: 0.0.0.0
  N8N_RUNNERS_AUTH_TOKEN: ${N8N_RUNNERS_AUTH_TOKEN:?defina N8N_RUNNERS_AUTH_TOKEN}

x-runner: &runner
  image: n8nio/runners:2.48.7
  restart: unless-stopped

services:
  db:
    image: postgres:17
    restart: unless-stopped
    environment:
      POSTGRES_DB: n8n
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${N8N_DB_PASSWORD:?defina N8N_DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: [CMD-SHELL, 'pg_isready -h 127.0.0.1 -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"']
      interval: 5s
      timeout: 3s
      retries: 12

  n8n:
    image: *n8n-image
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      <<: [*n8n-env, *broker-env]
      EXECUTIONS_MODE: regular
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - n8n_data:/home/node/.n8n
    healthcheck:
      test:
        - CMD
        - node
        - -e
        - >-
          fetch('http://127.0.0.1:5678/healthz/readiness')
            .then(response => process.exit(response.ok ? 0 : 1))
            .catch(() => process.exit(1))
      interval: 10s
      timeout: 5s
      retries: 12

  runner-main:
    <<: *runner
    environment:
      N8N_RUNNERS_AUTH_TOKEN: ${N8N_RUNNERS_AUTH_TOKEN:?defina N8N_RUNNERS_AUTH_TOKEN}
      N8N_RUNNERS_TASK_BROKER_URI: http://n8n:5679
    depends_on:
      - n8n

volumes:
  n8n_data:
  postgres_data:
```

- Rode `docker compose config -q` e depois `docker compose up -d`. A porta
  5678 só atende no loopback. Banco e broker dos runners ficam na rede do
  Compose. Para banco externo, use banco e conta dedicados e configure TLS.
- Preserve `/home/node/.n8n` e a chave de criptografia. O processo n8n roda
  como `node` (UID 1000). Em bind mounts, garanta escrita por esse usuário.
- Configure runners externos em produção com dados sensíveis (regra da casa).
  Cada processo que executa Code precisa de runner compatível e segredo de
  broker. A topologia de rede e containers fica com Docker. Defina a confiança
  de editores e o acesso a credenciais com Segurança de Aplicações.
  [Task runners](https://docs.n8n.io/deploy/host-n8n/configure-n8n/set-up-task-runners.md)

## Queue mode

Salve como `compose.queue.yml` e aplique junto com o arquivo anterior. Os
aliases deste arquivo são locais ao próprio YAML. Todos os processos usam
Postgres e Redis compartilhados, a mesma chave de criptografia e a mesma versão.
O exemplo inclui um worker. Para aumentar a escala, adicione pares de worker
e runner com o endereço do broker do respectivo worker. O runner do main
continua atendendo execuções manuais. Se remover esse runner, configure
`OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS=true` no main.

```yaml
x-queue-env: &queue-env
  EXECUTIONS_MODE: queue
  DB_TYPE: postgresdb
  DB_POSTGRESDB_HOST: db
  DB_POSTGRESDB_DATABASE: n8n
  DB_POSTGRESDB_USER: n8n
  DB_POSTGRESDB_PASSWORD: ${N8N_DB_PASSWORD:?defina N8N_DB_PASSWORD}
  N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY:?defina N8N_ENCRYPTION_KEY}
  N8N_DEFAULT_BINARY_DATA_MODE: database
  QUEUE_BULL_REDIS_HOST: redis
  QUEUE_BULL_PREFIX: n8n-prod-jobs
  N8N_REDIS_KEY_PREFIX: n8n-prod

x-queue-dependencies: &queue-dependencies
  db:
    condition: service_healthy
  redis:
    condition: service_healthy

x-worker-dependencies: &worker-dependencies
  <<: *queue-dependencies
  n8n:
    condition: service_healthy

services:
  redis:
    image: redis:7.4
    restart: unless-stopped
    command: [redis-server, --appendonly, "yes"]
    volumes:
      - redis_data:/data
    healthcheck:
      test: [CMD, redis-cli, ping]
      interval: 5s
      timeout: 3s
      retries: 12

  n8n:
    environment:
      <<: *queue-env
      N8N_DISABLE_PRODUCTION_MAIN_PROCESS: ${N8N_DISABLE_PRODUCTION_MAIN_PROCESS:-false}
    depends_on: *queue-dependencies

  n8n-worker:
    image: docker.n8n.io/n8nio/n8n:2.48.7
    restart: unless-stopped
    command: [worker, --concurrency=10]
    environment:
      <<: *queue-env
      GENERIC_TIMEZONE: America/Sao_Paulo
      TZ: America/Sao_Paulo
      QUEUE_HEALTH_CHECK_ACTIVE: "true"
      N8N_RUNNERS_MODE: external
      N8N_RUNNERS_BROKER_LISTEN_ADDRESS: 0.0.0.0
      N8N_RUNNERS_AUTH_TOKEN: ${N8N_RUNNERS_AUTH_TOKEN:?defina N8N_RUNNERS_AUTH_TOKEN}
    depends_on: *worker-dependencies
    volumes:
      - worker_data:/home/node/.n8n
    healthcheck:
      test:
        - CMD
        - node
        - -e
        - >-
          fetch('http://127.0.0.1:5678/healthz/readiness')
            .then(response => process.exit(response.ok ? 0 : 1))
            .catch(() => process.exit(1))
      interval: 10s
      timeout: 5s
      retries: 12

  runner-worker:
    image: n8nio/runners:2.48.7
    restart: unless-stopped
    environment:
      N8N_RUNNERS_TASK_BROKER_URI: http://n8n-worker:5679
      N8N_RUNNERS_AUTH_TOKEN: ${N8N_RUNNERS_AUTH_TOKEN:?defina N8N_RUNNERS_AUTH_TOKEN}
    depends_on:
      - n8n-worker

  n8n-webhook:
    profiles: [webhooks]
    image: docker.n8n.io/n8nio/n8n:2.48.7
    restart: unless-stopped
    command: [webhook]
    environment:
      <<: *queue-env
      N8N_HOST: n8n.example.com
      N8N_PROTOCOL: https
      N8N_WEBHOOK_URL: https://n8n.example.com/
      N8N_EDITOR_BASE_URL: https://n8n.example.com/
      N8N_PROXY_HOPS: "1"
    ports:
      - "127.0.0.1:5681:5678"
    depends_on: *worker-dependencies
    volumes:
      - webhook_data:/home/node/.n8n

volumes:
  redis_data:
  worker_data:
  webhook_data:
```

```bash
docker compose -f compose.yml -f compose.queue.yml config -q
docker compose -f compose.yml -f compose.queue.yml up -d
```

- O main recebe webhooks por padrão. Para usar o processador opcional,
  configure o roteamento abaixo e acrescente `--profile webhooks` antes de
  `config -q` e de `up -d`. Com o roteamento validado, defina
  `N8N_DISABLE_PRODUCTION_MAIN_PROCESS=true` no `.env` e reaplique.
- Redis leva o ID da execução ao worker e transmite a resposta do webhook.
  O armazenamento regular de binários é separado. O exemplo usa Postgres
  (`database`), padrão de queue na versão de referência. Para volumes maiores
  considere storage externo licenciado (S3 ou Azure conforme versão e plano).
  Confirme os modos da versão instalada. Quando ela suportar `filesystem`
  em queue, todos os main, workers e webhook processors que manipulam
  binários devem montar o mesmo volume compartilhado no mesmo caminho.
- Desde 2.34.0, após atualizar todos os main e webhook processors, use
  `N8N_WEBHOOK_RESPONSE_RELAY_OFFLOAD_ENABLED=true` nos workers para que
  respostas acima de `N8N_WEBHOOK_RESPONSE_RELAY_SIZE_MAX` (64 MiB por padrão)
  usem storage persistente acessível a todos, como o Postgres do exemplo.
  Em `database`, confira o limite de tamanho do storage e a memória do
  processo que carrega a resposta. S3 e Azure podem transmiti-la em partes.
  Sem offload, a resposta acima do limite faz o nó falhar. Teste nos dois
  lados do limite e dimensione a memória do Redis para respostas em trânsito.
- Para instalações que compartilham Redis, atribua um `QUEUE_BULL_PREFIX` por
  implantação para as filas Bull e um `N8N_REDIS_KEY_PREFIX` por implantação
  para as demais chaves e canais. Use o mesmo par em todos os processos de
  uma implantação. Antes de 2.3.0 o segundo prefixo não isola pub/sub. Use
  Redis dedicado nessas versões. Multi-main também exige licença e afinidade
  de sessão no balanceador.
- Dimensione concorrência com o pool do banco e memória de cada worker.
  A documentação recomenda começar com pelo menos cinco execuções por worker.
  [Queue mode](https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/enable-queue-mode.md)
  · [Variáveis de fila](https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/queue-mode.md)

## Proxy reverso

Insira o bloco no `server` HTTPS do NGINX que roda no host. O exemplo usa
um único proxy. Ajuste `N8N_PROXY_HOPS` ao número real de proxies confiáveis,
incluindo outra borda se houver. Ao encadear proxies, preserve os valores
externos fornecidos por um upstream confiável e impeça que o cliente os forje.

```nginx
location / {
  proxy_pass http://127.0.0.1:5678;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

- Com processador dedicado, repita as diretivas de encaminhamento em
  `location /webhook/` e `location /webhook-waiting/` e use
  `proxy_pass http://127.0.0.1:5681;` nesses blocos. Preserve
  `/webhook-test/` e o restante no main. Se o projeto altera os prefixos,
  replique os nomes efetivos no roteamento.
- `N8N_WEBHOOK_URL` funciona desde 2.30.0. `WEBHOOK_URL` é o nome legado,
  formalmente depreciado em 2.35.0. Sem override a URL deriva de protocolo,
  host, porta e path e pode publicar a porta interna 5678. Quando os nomes
  diferirem, configure `N8N_EDITOR_BASE_URL` no host do editor e
  `N8N_WEBHOOK_URL` no host público de webhooks.
- Valide com `nginx -t` e confira as URLs geradas. O prazo de resposta
  respeita o menor limite entre cliente, provedor, borda e proxy. Aumentar
  `proxy_read_timeout` só altera a espera do NGINX.
  [Configuração de webhook atrás de proxy](https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/configuration-examples/configure-webhook-urls-with-reverse-proxy.md)

## Backup e migração de SQLite para Postgres

Inclua banco, chave de criptografia, volumes persistentes, configuração efetiva,
segredos no cofre e objetos do storage externo (S3 ou Azure, quando usado).
Em queue, interrompa a entrada e drene as execuções antes de um backup de
migração. Preserve o Redis se a estratégia de recuperação exigir retomar
trabalho enfileirado. Para obter um dump do Postgres deste Compose, rode
a partir do mesmo projeto:

```bash
umask 077
docker compose exec -T db pg_dump -U n8n -Fc n8n > "n8n-$(date +%F).dump"
```

Confira o código de saída e teste restauração em instância descartável,
abrindo workflow e executando um caso com credencial de teste. Mantenha
cópia fora do host e retenção definida.

Para trocar SQLite por Postgres, mantenha a versão do n8n, ensaie primeiro em
staging e pare o tráfego e os processos da instância durante a troca. Rode
cada comando com a configuração e o perfil efetivos da instância respectiva.
O primeiro usa a fonte SQLite e o segundo o destino Postgres vazio. Em
container, monte `/backup/migracao` nos dois comandos e dê ao UID 1000
acesso ao diretório protegido.

```bash
n8n export:entities --outputDir=/backup/migracao
n8n import:entities --inputDir=/backup/migracao
```

- Para levar também as tabelas de histórico, acrescente
  `--includeExecutionHistoryDataTables=true` ao export. Confira os arquivos
  persistentes e o acesso ao storage, incluindo binários referenciados.
- Use a mesma chave e confira perfis, usuários, projetos, credenciais e
  workflows. Teste o editor, uma execução e o webhook publicado antes de
  trocar a rota. Preserve banco, volumes e configuração da origem para
  recuperação e mantenha uma única origem aceitando escritas. Se o destino
  já aceitou dados, reconcilie-os antes de voltar.
- Para promover apenas workflows, siga [integration.md](integration.md).
  Exportar workflow e credencial cobre somente essas entidades.
  [CLI de entidades](https://docs.n8n.io/deploy/host-n8n/configure-n8n/use-the-command-line.md#export-entities)

## Atualização

1. Leia a nota de release da versão de destino. Verifique variáveis, migrations
   e comportamento de nós.
2. Teste a restauração em staging isolado, com credenciais de teste.
3. Atualize primeiro em staging. Mantenha a versão da imagem dos runners igual
   à do n8n.
4. Pare a entrada durante a troca, acompanhe a migração e valide editor,
   webhook, fila e execução antes de reabrir o tráfego.
5. Preserve o backup anterior. Se a versão anterior não puder ler o schema
   migrado, a reversão precisa restaurar banco e volumes compatíveis.

## Diagnóstico

Valide localmente primeiro. Em queue, passe também `-f compose.yml -f
compose.queue.yml` a cada comando Compose. Use o perfil se houver webhook
processor.

```bash
docker compose exec n8n n8n --version
curl --fail-with-body http://127.0.0.1:5678/healthz
curl --fail-with-body http://127.0.0.1:5678/healthz/readiness
```

O primeiro endpoint verifica liveness. O segundo verifica prontidão, incluindo
a conexão e a migração do banco no main. No worker, confira o healthcheck
de readiness e os logs de conexão com Postgres, Redis e broker. Com processador
dedicado, teste também a porta local 5681. Publique o workflow de staging e
rode o [teste de webhook](integration.md#validação-de-integração) pela URL pública
para verificar roteamento, autenticação, execução e resposta.
