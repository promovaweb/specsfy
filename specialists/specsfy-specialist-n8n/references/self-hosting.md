# Instalação, banco, fila e proxy

## Compose mínimo

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:2.34.0
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      N8N_HOST: n8n.example.com
      N8N_PROTOCOL: https
      N8N_WEBHOOK_URL: https://n8n.example.com/
      N8N_PROXY_HOPS: "1"
      GENERIC_TIMEZONE: America/Sao_Paulo
      TZ: America/Sao_Paulo
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: db
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: ${N8N_DB_PASSWORD}
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      EXECUTIONS_DATA_PRUNE: "true"
      EXECUTIONS_DATA_MAX_AGE: "336"
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

- `.env` fica fora do Git e guarda `N8N_DB_PASSWORD` e `N8N_ENCRYPTION_KEY`. O
  Compose interpola as variáveis e o valor não entra no arquivo versionado.
- Publique a porta em `127.0.0.1` e deixe o proxy reverso expor o serviço. Porta
  aberta direto na internet dispensa TLS e controle de acesso.
- Volume em `/home/node/.n8n` guarda configuração, chave e arquivo. Sem volume, o
  container novo nasce vazio.
- O processo roda como usuário `node` (uid 1000). Volume criado por root exige
  `chown` correto, senão a instância não escreve.
- Versão fixa na imagem. `latest` quebra workflow em atualização silenciosa.
- Segredo entra por `.env` fora do Git ou por variável injetada pelo orquestrador,
  nunca em `environment` literal no arquivo versionado.

## Variáveis por ambiente

```bash
N8N_HOST=n8n.example.com
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_WEBHOOK_URL=https://n8n.example.com/
N8N_EDITOR_BASE_URL=https://n8n.example.com/
N8N_PROXY_HOPS=1
N8N_SECURE_COOKIE=true
N8N_ENCRYPTION_KEY=<valor-estável>
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=db
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=<valor>
EXECUTIONS_MODE=queue
QUEUE_BULL_REDIS_HOST=redis
QUEUE_BULL_REDIS_PORT=6379
N8N_DEFAULT_BINARY_DATA_MODE=filesystem
```

- `N8N_WEBHOOK_URL` define a URL que o n8n mostra e registra. A partir de 2.30.0
  esse é o nome; em versão anterior é `WEBHOOK_URL`. Valor ausente ou errado gera
  URL de webhook apontando para `localhost`.
- `N8N_PROXY_HOPS` conta quantos proxies confiáveis existem na frente. Valor
  errado faz o IP do cliente chegar errado e o cookie seguro falhar.
- `N8N_SECURE_COOKIE` exige HTTPS. Em ambiente local com HTTP, desligue apenas
  ali.
- `GENERIC_TIMEZONE` e `TZ` definem o fuso do agendamento e do log. Divergência
  entre os dois desloca execução agendada.
- `N8N_ENCRYPTION_KEY` precisa existir antes da primeira execução e nunca mudar.

## Postgres

- Crie banco e usuário dedicados, sem privilégio em outro schema.
- Habilite TLS entre n8n e banco quando a rede não for confiável.
- Ajuste pool do banco ao número de processos e à concurrency por worker.
- Migração de banco é feita pelo próprio n8n na subida. Faça backup antes de
  atualizar versão e não rode versão nova contra banco sem backup.
- Migração de SQLite para Postgres usa export e import da CLI do n8n:

```bash
n8n export:workflow --backup --output=/backup/workflows
n8n export:credentials --backup --output=/backup/credentials
n8n import:workflow --separate --input=/backup/workflows
n8n import:credentials --separate --input=/backup/credentials
```

- Execução antiga não é exportada por esse fluxo. Se o histórico importa, ele fica
  no banco de origem.

## Queue mode

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:2.34.0
    command: start
    environment:
      EXECUTIONS_MODE: queue
      QUEUE_BULL_REDIS_HOST: redis
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}

  n8n-worker:
    image: docker.n8n.io/n8nio/n8n:2.34.0
    command: worker --concurrency=10
    environment:
      EXECUTIONS_MODE: queue
      QUEUE_BULL_REDIS_HOST: redis
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}

  n8n-webhook:
    image: docker.n8n.io/n8nio/n8n:2.34.0
    command: webhook
    environment:
      EXECUTIONS_MODE: queue
      QUEUE_BULL_REDIS_HOST: redis
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
```

- Main recebe gatilho e gera execução; worker executa; Redis guarda a fila.
- Todos os processos usam a mesma chave de criptografia e o mesmo banco.
- Worker sem chave correta falha ao ler credencial e a execução trava.
- Concurrency baixa com muitos workers esgota conexão do banco. A documentação
  recomenda 5 ou mais por worker.
- Health check de worker usa `QUEUE_HEALTH_CHECK_ACTIVE` e expõe `/healthz` e
  `/healthz/readiness`.
- Chamada de webhook em queue mode passa pelo main ou pelo webhook processor e
  depois pelo worker, o que adiciona latência ao tempo de resposta.
- Resposta de webhook grande viaja pelo Redis. Defina
  `N8N_WEBHOOK_RESPONSE_RELAY_SIZE_MAX` e, em versão que suporta, o offload para
  storage externo.
- Multi-main exige plano que ofereça o recurso, sessão persistente no balanceador
  e `N8N_REDIS_KEY_PREFIX` distinto quando duas instalações compartilham Redis.

## Proxy reverso

```nginx
location / {
  proxy_pass http://127.0.0.1:5678;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_read_timeout 3600;
}
```

- Cabeçalho de encaminhamento correto é pré-requisito para `N8N_PROXY_HOPS`.
- Com webhook processor, encaminhe `/webhook/*` e `/webhook-waiting/*` para o pool
  de webhook e o resto para o main. O caminho `/webhook-test/*` fica no main.
- Timeout longo evita cortar execução que responde pelo nó `Respond to Webhook`.
- TLS termina no proxy, com certificado válido. Cloudflare Tunnel pode ser a
  entrada, mantendo o n8n sem porta pública.

## Backup

Inclua na cópia:

1. Dump do banco (`pg_dump`).
2. Chave de criptografia.
3. Volume `/home/node/.n8n` quando houver arquivo e configuração local.
4. Variáveis de ambiente efetivas, sem valor de segredo no repositório.
5. Binário de storage externo quando `N8N_DEFAULT_BINARY_DATA_MODE` for `s3` ou
   equivalente.

```bash
pg_dump -h db -U n8n -Fc n8n > /backup/n8n-$(date +%F).dump
```

- Backup sem chave de criptografia não devolve credencial utilizável.
- Teste restaurando em instância descartável, abrindo workflow e executando um
  caso com credencial de teste.
- Defina retenção e cópia fora do host. Backup no mesmo disco do banco não protege
  contra falha de disco.

## Atualização

1. Leia a nota de release da versão de destino e identifique mudança de variável,
   de banco e de comportamento de nó.
2. Faça backup completo e teste a restauração.
3. Atualize primeiro em staging com cópia do banco de produção.
4. Pare o tráfego, suba a versão, acompanhe migração no log e valide editor,
   webhook e execução.
5. Mantenha a versão anterior disponível para rollback por um período declarado.
6. Rollback de binário depois de migração de banco nem sempre é possível; a
   compatibilidade é decidida pela nota de release.

## Diagnóstico

```bash
docker compose logs -f n8n
docker compose exec n8n n8n --version
curl -i https://n8n.example.com/healthz
curl -i -X POST https://n8n.example.com/webhook/pedido -d '{}'
```

- `N8N_LOG_LEVEL=debug` para diagnóstico pontual, com retorno ao nível normal
  depois.
- Erro de credencial ilegível é chave de criptografia errada, não corrupção do
  banco.
- Editor abre mas webhook não recebe: URL pública e regra de proxy são os
  suspeitos.
- Execução fica em `waiting`: worker não conecta, está sem chave ou sem acesso ao
  banco.
- Banco crescendo rápido: poda desligada ou execução com payload grande retido.
