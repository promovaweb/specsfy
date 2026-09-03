---
name: specsfy-specialist-docker
description: Criar, revisar e depurar imagens Docker e ambientes Compose com builds reproduzíveis, segurança, saúde, configuração e eficiência. Use para Dockerfile, BuildKit, Compose, registries, containers ou imagens de uma aplicação; use `specsfy-specialist-docker-swarm` para orquestração multi-nó, deploy declarativo e rollout de serviços em produção.
---

# Docker

## Quando usar

- Acionar para escrever ou revisar `Dockerfile`, `docker-compose.yml`,
  `.dockerignore`, política de tag/registry ou depurar um container que não
  builda, não sobe ou não responde a healthcheck.
- Acionar também para reduzir tamanho de imagem, eliminar segredo vazado em
  camada ou corrigir processo que não recebe `SIGTERM` corretamente.
- Não acionar para orquestração de múltiplos nós, rollout com réplicas,
  secrets de cluster ou rede overlay — usar
  `$specsfy-specialist-docker-swarm` para isso; Docker Compose aqui é
  ambiente local/CI, não topologia de produção multi-host.
- Combinar com `$specsfy-specialist-application-security` para revisão de
  supply chain (SBOM, proveniência, dependências vulneráveis) e com a skill
  de linguagem/framework do projeto para o conteúdo do build em si.

## Fluxo

1. Descobrir arquitetura alvo (amd64/arm64), runtime base (linguagem,
   versão), build context real e o contrato de execução esperado
   (variáveis, portas, volumes) antes de propor mudança.
2. Inspecionar `Dockerfile`, `.dockerignore`, `docker-compose.yml` e a
   política de imagem/tag já em uso pelo projeto.
3. Quando a imagem fizer parte de uma release ou deploy, executar esta etapa
   sob `$specsfy-specialist-deploy`. Usar a versão entregue por
   `$specsfy-specialist-versioning`, gerar a referência com `docker-tag` e
   recusá-la quando `verify-docker-tag` apontar diferença.
4. Separar dependências de build e runtime com estágios (`multi-stage
   build`) claros — a imagem final não deve conter compilador, cache de
   pacote ou fonte que não roda em produção.
5. Fixar artefatos de forma reproduzível (lockfile, versão de base image
   pinada ou por digest) e reduzir contexto de build e camadas mutáveis.
6. Executar o processo como usuário não root, limitar privilégios
   (`cap_drop`, sem `--privileged`) e nunca embutir segredo na imagem.
7. Definir healthcheck, tratamento de sinal (`SIGTERM`, `SIGINT`), volumes,
   redes e configuração externa (env, arquivo montado) explicitamente.
8. Construir a imagem, escanear vulnerabilidades e testá-la exatamente como
   será executada em produção (mesmo usuário, mesmas variáveis).

## Padrões

- Em aplicações com extensões nativas, dividir compilação em estágios
  independentes por família. Uma alteração em Redis, mídia ou servidor de
  aplicação não precisa invalidar toda a toolchain.
- Quando vários serviços usam o mesmo código, produzir uma imagem única e
  selecionar modos de processo no entrypoint, como HTTP, scheduler, filas e
  WebSocket. Cada modo recebe healthcheck, sinal e escrita compatíveis com sua
  função.
- Publicar referências imutáveis para SemVer e commit, conferir se ambas ainda
  não existem e registrar o digest usado pelo deploy. A tag Git só deve ser
  publicada depois que a imagem estiver disponível no registry.
- Gerar caches de framework no entrypoint quando eles dependem de configuração
  fornecida no runtime. Não transportar cache de configuração criado durante o
  build para ambientes com valores diferentes.
- Preferir base mínima compatível (slim/alpine quando a stack suporta) e
  fixar por digest (`@sha256:...`) quando reprodutibilidade byte-a-byte
  importar mais que atualização automática de patch.
- Ordenar instruções para maximizar cache (dependências antes do código
  fonte) sem esconder atualização de dependência — um `COPY package*.json`
  seguido de `RUN install` antes do `COPY . .` cacheia a instalação
  enquanto o código muda, sem congelar a versão instalada.
- Usar mounts de secret e cache do BuildKit (`RUN --mount=type=secret`,
  `--mount=type=cache`) para credenciais de build e cache de package
  manager — nunca `ARG`/`ENV` para segredo, pois ambos persistem no
  histórico de camadas da imagem final.
- Nunca copiar o repositório inteiro sem `.dockerignore` — `.git`,
  `node_modules`, artefatos de build local e `.env` vazam para o contexto
  e infla o tamanho/tempo de build.
- Tratar o processo principal como PID 1 conscientemente: usar `ENTRYPOINT`
  em forma exec (`["cmd"]`, não `CMD cmd args` em shell form) para receber
  sinais corretamente, ou um init mínimo (`--init`/`tini`) quando o processo
  não reaper zumbis.
- Manter dado persistente fora da camada gravável do container (volume
  nomeado ou bind mount) — dado na camada do container morre com o
  container.
- Definir limites de recurso e filesystem raiz somente leitura
  (`--read-only` + volumes explícitos para o que precisa escrever) quando o
  workload permitir, reduzindo superfície de ataque em runtime.

## Antipadrões

- `latest` como única tag em produção — não é reprodutível e não permite
  saber qual código está rodando sem inspecionar o container.
- `ADD` para copiar arquivo local (em vez de `COPY`) — `ADD` também
  descompacta e busca URL, comportamento implícito que surpreende quem lê o
  Dockerfile depois.
- `USER root` implícito (ausência de `USER`) em imagem que serve tráfego —
  processo comprometido dentro do container tem privilégio de root do
  container, ampliando o impacto de qualquer vulnerabilidade na aplicação.
- Instalar dependência de build (compilador, headers) na mesma camada final
  sem multi-stage — infla a imagem e aumenta a superfície de vulnerabilidade
  escaneável sem benefício em runtime.
- Healthcheck que só verifica "processo escutando na porta" sem checar
  dependência crítica (banco, fila) — o orquestrador considera o container
  saudável mesmo quando ele não consegue de fato servir a requisição.

## Validação

- Build limpo sem cache (`--no-cache`) e build incremental (com cache) —
  ambos devem produzir uma imagem funcionalmente equivalente.
- Executar a imagem com o usuário, arquitetura e variáveis de ambiente
  reais do ambiente alvo, não apenas com defaults de desenvolvimento.
- Exercitar healthcheck, `docker stop` (shutdown gracioso dentro do prazo
  configurado), portas publicadas, volumes, resolução DNS interna e o
  comportamento quando uma dependência declarada está indisponível.
- Gerar SBOM/rodar scanner de vulnerabilidade disponível no projeto e
  inspecionar tamanho e número de camadas da imagem final.
- Não declarar uma imagem "segura" sem o scanner rodado, nem "reproduzível"
  sem builds repetidos produzindo o mesmo resultado funcional a partir do
  mesmo commit.

## Skills relacionadas

- `$specsfy-specialist-deploy` coordena a entrega completa; esta skill cuida
  somente da imagem e do Compose de desenvolvimento.
- `$specsfy-specialist-versioning` prepara `SEMVER` e confere a identidade da
  imagem antes da publicação.
- `$specsfy-specialist-docker-swarm` para orquestração multi-nó, secrets de
  cluster, rede overlay e rollout de serviços — este especialista cobre a
  imagem e o Compose local, não o cluster de produção.
- `$specsfy-specialist-application-security` para supply chain (SBOM,
  proveniência, CVE de dependência) e hardening além do container.
- `$specsfy-specialist-observability` para logging, métricas e tracing do
  processo dentro do container.
- `$specsfy-specialist-postgres`, `$specsfy-specialist-redis` para o que
  roda dentro da imagem/serviço (modelagem de schema, estrutura de dado,
  persistência) — esta skill cobre o empacotamento (imagem oficial, volume,
  healthcheck), não a decisão interna do banco/cache.
- `$specsfy-specialist-supabase` quando o ambiente local do projeto for
  orquestrado pela CLI do Supabase sobre Docker.
- `$specsfy-specialist-laravel` para os contratos de execução da aplicação
  empacotada (workers de fila, scheduler, variáveis de ambiente esperadas).
- `$specsfy-specialist-debian-server` para kernel, filesystem, systemd, APT e
  Docker Engine do host que executa a imagem.

Leia [references/standards.md](references/standards.md) para build,
Compose, segurança, supply chain e operação.
