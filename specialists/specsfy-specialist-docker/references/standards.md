# Padrões comuns e referências Docker

Revisado em 2026-11-20 contra: Docker Engine 29.10.0, Compose v2/v5 (release v5.8.0), Node.js 24 LTS no exemplo, Traefik Proxy v3.7.19 e documentação do Let’s Encrypt.

Reúne os padrões que valem para imagem, Compose e serviços em cluster e serve
de índice para a referência de cada modo.

## Índice dos modos

| Modo | Abre | Conteúdo |
| --- | --- | --- |
| compose | este arquivo | imagem, multi-stage, segredos de build, checklist de produção, Compose, base images, scan e sinais |
| swarm | [swarm.md](swarm.md) | Raft, redes overlay, placement, rollout, secrets e recuperação |
| proxy | [traefik.md](traefik.md) | entrypoints, roteamento, Compose, Swarm, ACME e dashboard |

## Padrões comuns

- Toda referência entregue ao runtime é imutável e rastreável: tag SemVer, tag
  de commit e digest registrado, com a tag Git publicada só depois da imagem
  disponível no registry.
- Segredo nunca entra na imagem nem em `ARG`/`ENV`: em build usa
  `--mount=type=secret`; em runtime usa Docker Secret, secret manager ou arquivo
  montado.
- A imagem testada é a imagem publicada. Não recompilar por ambiente nem buildar
  no node que executa o container.
- Healthcheck verifica dependência real, o processo trata `SIGTERM` e o
  container não roda como root quando o workload permite.
- Configuração de ambiente fica fora do artefato e o comportamento é validado
  antes de publicar. A documentação oficial fica nas
  [fontes](#fontes-oficiais) ao final deste arquivo.

## Imagem única para processos Laravel

Uma aplicação Laravel pode compartilhar o mesmo filesystem entre Octane,
Horizon, scheduler, queue e WebSocket. Compile dependências e assets uma vez,
copie somente o resultado para o runtime e use um entrypoint em forma exec para
selecionar o processo. Essa composição impede que cada serviço receba uma
imagem recompilada e facilita comparar o digest implantado.

Separe builders de extensões que mudam em ritmos diferentes. Um estágio comum
instala headers e compiladores; ramos independentes compilam extensões de banco,
mídia, servidor de aplicação e cache; o runtime recebe apenas `.so` e arquivos
de configuração. Preserve ownership do código por root e conceda escrita ao
usuário da aplicação somente em diretórios de cache e arquivos temporários.

O fluxo de publicação deve recusar tags SemVer e SHA já existentes, publicar a
imagem com metadados OCI e só depois criar ou enviar a tag Git correspondente.
Valide o entrypoint em cada modo de processo e confirme que caches dependentes
de env são reconstruídos no startup.

## Multi-stage build

```dockerfile
# syntax=docker/dockerfile:1
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM node:24-slim AS production-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=production-deps /app/node_modules ./node_modules
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD node ./dist/healthcheck.js
ENTRYPOINT ["node", "dist/server.js"]
```

- Estágio `build` carrega compilador/devDependencies; estágio `runtime`
  copia o artefato e as dependências de produção — a imagem final não leva
  as devDependencies do estágio de build.
- `COPY package.json package-lock.json ./` antes de `COPY . .` cacheia `npm ci` enquanto só o
  código-fonte muda; qualquer mudança no lockfile invalida o cache
  corretamente porque ele é copiado e hasheado antes.
- `--mount=type=cache` (BuildKit) persiste o cache do package manager entre
  builds sem incluí-lo na imagem final.

## Segredos em build

- `RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci` monta o
  segredo apenas durante aquele `RUN`, sem gravá-lo em nenhuma camada.
- `ARG`/`ENV` para segredo persiste em `docker history`/camadas mesmo que a
  variável não apareça no `CMD` final — nunca usar para credencial.
- Runtime: injetar segredo por variável de ambiente do orquestrador,
  secret manager montado como arquivo, ou secret nativo do Swarm/Kubernetes
  — nunca copiado para dentro da imagem.

## Imagem de produção — checklist

- Multi-stage: somente runtime e artefatos necessários na imagem final.
- Dependências fixadas pelo lockfile da linguagem; pacotes de sistema
  operacional pinados a uma versão revisável (não `apt-get install pkg`
  sem versão em imagem que precisa ser reproduzível).
- `USER` não root definido explicitamente; diretório de trabalho e
  permissões de arquivo mínimas necessárias.
- `ENTRYPOINT`/`CMD` em forma exec (`["executável", "arg"]`) — forma shell
  (`CMD executável arg`) roda sob `/bin/sh -c`, que não repassa sinais ao
  processo filho corretamente.
- Labels (`org.opencontainers.image.*`) e proveniência (source commit,
  data de build) suficientes para rastrear qual código está em cada tag.
- `HEALTHCHECK` que verifica uma dependência real da aplicação (endpoint
  que toca banco/fila), não apenas "processo escutando".

## Compose (ambiente local/CI)

Use `docker compose` nos CLIs Compose v2 e v5, que leem a Compose
Specification. O campo de topo `version` é obsoleto para esses CLIs.
`docker stack deploy` usa o formato Compose v3 legado. Confira o arquivo
de stack separadamente.

- Use para composição de serviços e contrato de desenvolvimento local, não
  como arquivo de segredos (não commitar senha em `environment:`; usar
  `.env` fora do controle de versão ou `secrets:` do Compose).
- `depends_on` com `condition: service_healthy` quando a aplicação
  realmente falha ao subir sem a dependência pronta — `depends_on` simples
  só ordena o start, não espera "pronto".
- Nomear volumes persistentes explicitamente (evita volume anônimo órfão
  acumulando disco) e tornar toda porta publicada intencional — porta
  exposta sem necessidade amplia superfície de acesso local.

## Imagem base: distroless vs slim vs alpine

| Base | Superfície de ataque | Shell/debug no container | Compatibilidade | Quando preferir |
| --- | --- | --- | --- | --- |
| Full (`debian`, `ubuntu`) | Maior (gerenciador de pacote, shell, utilitários completos) | Sim | Mais ampla | Diagnóstico frequente em runtime ou dependência de sistema pouco comum |
| Slim (`-slim`, `-slim-bookworm`) | Reduzida (sem docs/utilitários não essenciais) | Sim | Ampla | Padrão razoável quando a stack oficial publica variante slim |
| Alpine | Pequena (musl libc, busybox) | Sim (shell mínimo) | Menor — musl pode divergir de comportamento glibc em dependência nativa | Imagem mínima quando a stack não depende de extensão nativa sensível à libc |
| Distroless (`gcr.io/distroless/*`) | Mínima (sem shell, sem gerenciador de pacote) | Não — não há shell para `exec` interativo | Precisa do runtime já compilado/portátil | Produção com superfície de ataque mínima, quando debug interativo não for o fluxo principal |

- Distroless remove o shell e o gerenciador de pacote da imagem final —
  reduz o que um invasor pode executar após comprometer o processo, mas
  também remove `docker exec sh` como ferramenta de diagnóstico; combine com
  logging/observability externos e uma imagem de debug companion quando
  precisar investigar em runtime.
- Alpine troca `glibc` por `musl` — bibliotecas nativas compiladas para
  `glibc` podem falhar silenciosamente ou exigir rebuild; validar
  dependências nativas (extensões PHP, pacotes Python/Node com binding
  nativo) antes de padronizar em Alpine.
- A escolha não é "sempre a menor imagem": menor superfície de ataque e
  build mais simples podem ser trade-offs concorrentes — decidir pelo
  runtime real da aplicação, não por regra genérica.

## Scan de vulnerabilidade e SBOM

- `trivy image <imagem>` (ou `trivy image --severity HIGH,CRITICAL
  <imagem>` para focar o que bloqueia release) escaneia camadas do sistema
  operacional e dependências de linguagem conhecidas, reportando CVE por
  pacote.
- `docker scout cves <imagem>` cumpre o mesmo papel integrado ao Docker
  Desktop/CLI; `grype <imagem>` é uma alternativa equivalente — o importante
  é rodar ao menos uma ferramenta de scan antes de publicar, não qual delas
  especificamente.
- Gerar SBOM (`docker scout sbom <imagem>`, `syft <imagem>` ou o gerador do
  próprio pipeline) para inventariar componentes e dependências — necessário
  quando o processo de release exige auditoria de supply chain, não apenas
  "sabemos que buildamos".
- Vulnerabilidade encontrada não significa bloquear automaticamente: avalie
  se o pacote vulnerável é de fato exercitado pelo runtime da imagem
  (superfície alcançável) antes de tratar toda CVE `CRITICAL` como bloqueio
  cego — mas nunca publique sem ter rodado o scan e revisado o resultado.
  (regra da casa)

## Sinais e shutdown gracioso

- O processo que roda como PID 1 deve tratar o sinal de parada e recolher
  processos filhos órfãos. Use `--init` ou um init mínimo como `tini` quando
  a aplicação não assumir essas responsabilidades.
- `docker stop` envia o sinal configurado no container (por padrão, `SIGTERM`),
  espera o timeout (`--timeout` ou `-t`) e então envia `SIGKILL` se ele ainda
  estiver em execução. Sem uma configuração de timeout, o daemon usa 10 s em
  Linux e 30 s em Windows. Valide que o serviço encerra dentro desse prazo.

## Fontes oficiais

- Dockerfile — referência: https://docs.docker.com/reference/dockerfile/
- Boas práticas de build: https://docs.docker.com/build/building/best-practices/
- Build secrets: https://docs.docker.com/build/building/secrets/
- Build cache mounts: https://docs.docker.com/build/cache/
- Multi-stage builds: https://docs.docker.com/build/building/multi-stage/
- Compose — especificação: https://docs.docker.com/compose/
- Compose healthcheck/depends_on: https://docs.docker.com/compose/how-tos/startup-order/
- Segurança: https://docs.docker.com/engine/security/
- SBOM: https://docs.docker.com/scout/how-tos/view-create-sboms/
- OCI Image Spec: https://github.com/opencontainers/image-spec
- Docker Engine 29: https://docs.docker.com/engine/release-notes/29/
- Docker Compose — gerações suportadas: https://docs.docker.com/compose/intro/history/
- Docker Compose v5.8.0: https://github.com/docker/compose/releases/tag/v5.8.0
- Stack deploy e formato legado: https://docs.docker.com/engine/swarm/stack-deploy/
- Deploy specification: https://docs.docker.com/reference/compose-file/deploy/
- Rollout Swarm: https://docs.docker.com/engine/swarm/swarm-tutorial/rolling-update/
- Placement e volumes no Swarm: https://docs.docker.com/engine/swarm/services/
- Backup e recuperação do Swarm: https://docs.docker.com/engine/swarm/admin_guide/
- Sinais e timeout de parada: https://docs.docker.com/reference/cli/docker/container/stop/
- Docker Scout CLI — SBOM: https://docs.docker.com/reference/cli/docker/scout/sbom/
- Node.js — séries suportadas: https://nodejs.org/en/about/previous-releases
- npm ci e omit: https://docs.npmjs.com/cli/v11/commands/npm-ci/
- Traefik Proxy v3.7.19: https://github.com/traefik/traefik/releases/tag/v3.7.19
- Traefik — entrypoints: https://doc.traefik.io/traefik/v3.7/reference/install-configuration/entrypoints/
- Traefik — provider Docker: https://doc.traefik.io/traefik/v3.7/reference/install-configuration/providers/docker/
- Traefik — provider Swarm: https://doc.traefik.io/traefik/v3.7/reference/install-configuration/providers/swarm/
- Traefik — labels e roteamento Docker: https://doc.traefik.io/traefik/v3.7/reference/routing-configuration/other-providers/docker/
- Traefik — labels e roteamento Swarm: https://doc.traefik.io/traefik/v3.7/reference/routing-configuration/other-providers/swarm/
- Traefik — configuração Swarm: https://doc.traefik.io/traefik/v3.7/setup/swarm/
- Traefik — API e dashboard: https://doc.traefik.io/traefik/v3.7/reference/install-configuration/api-dashboard/
- Traefik — ACME: https://doc.traefik.io/traefik/v3.7/reference/install-configuration/tls/certificate-resolvers/acme/
- Traefik — permissões do arquivo ACME: https://github.com/traefik/traefik/blob/v3.7.19/pkg/provider/acme/local_store_unix.go
- Let’s Encrypt — staging: https://letsencrypt.org/docs/staging-environment/
- Cloudflare Tunnel — parâmetros de execução: https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/configure-tunnels/run-parameters/#token-file
- Traefik — migração do provider Swarm: https://doc.traefik.io/traefik/master/migrate/v2-to-v3-details/
