# Padrões e referências Docker

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
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD node ./dist/healthcheck.js
ENTRYPOINT ["node", "dist/server.js"]
```

- Estágio `build` carrega compilador/devDependencies; estágio `runtime`
  copia só o artefato — a imagem final não tem toolchain de build.
- `COPY package*.json` antes de `COPY . .` cacheia `npm ci` enquanto só o
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
- Gerar SBOM (`docker sbom <imagem>`, `syft <imagem>` ou o gerador do
  próprio pipeline) para rastrear proveniência de dependência — necessário
  quando o processo de release exige auditoria de supply chain, não apenas
  "sabemos que buildamos".
- Vulnerabilidade encontrada não significa bloquear automaticamente: avalie
  se o pacote vulnerável é de fato exercitado pelo runtime da imagem
  (superfície alcançável) antes de tratar toda CVE `CRITICAL` como bloqueio
  cego — mas nunca publique sem ter rodado o scan e revisado o resultado.

## Sinais e shutdown gracioso

- PID 1 dentro do container não reaper processos zumbis nem repassa sinal
  por padrão em muitos runtimes simples — usar `--init` (Docker) ou um init
  mínimo (`tini`) quando o processo principal não foi desenhado para ser
  PID 1.
- `docker stop` envia `SIGTERM`, aguarda o timeout configurado (`-t`,
  padrão 10s) e então envia `SIGKILL` — o processo precisa tratar
  `SIGTERM` fechando conexões em andamento dentro desse prazo, ou o
  shutdown vira kill forçado com requisição em voo perdida.

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
