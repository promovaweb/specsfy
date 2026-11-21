---
name: specsfy-specialist-docker
description: Criar, revisar e operar imagens Docker, ambientes Compose e stacks Docker Swarm com builds reproduzíveis, segurança, saúde, rollout e recuperação. Use no modo compose para Dockerfile, BuildKit, Compose de desenvolvimento e CI, registry, política de tag e container que não builda, não sobe ou não responde ao healthcheck; use no modo swarm para docker swarm init/join, docker stack deploy, topologia de managers e workers, redes overlay, secrets, configs, update_config, rollback e recuperação de quorum; use no modo proxy para Traefik v3 no Compose e no Swarm, roteamento HTTP, middlewares, TLS com ACME e dashboard protegido. Não use para coordenar release ou deploy com SEMVER e Vault (`$specsfy-specialist-delivery`), para o host Debian e o Docker Engine (`$specsfy-specialist-server`), para supply chain e CVE de dependência (`$specsfy-specialist-application-security`) nem para escolher os sinais que autorizam o rollout (`$specsfy-specialist-observability`).
---

# Docker

Cobre o empacotamento em imagem e o Compose de desenvolvimento e CI (modo
compose) e a operação de serviços em Docker Swarm (modo swarm). O modo compose
entrega imagem pequena, reproduzível e sem root; o modo swarm decide topologia,
redes, secrets e rollout entre nós. O modo proxy configura a entrada HTTP e HTTPS com Traefik.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Escrever ou revisar `Dockerfile`, `.dockerignore`, `docker-compose.yml`, política de tag e registry, ou depurar container que não builda, não sobe ou não responde ao healthcheck | compose | [Padrões comuns, build e Compose](references/standards.md) |
| Reduzir imagem, remover segredo vazado em camada ou corrigir processo que não recebe `SIGTERM` | compose | [Padrões comuns, build e Compose](references/standards.md) |
| Orquestrar múltiplos nós com `docker swarm init/join`, `docker stack deploy` ou arquivo de stack com `deploy:` | swarm | [Topologia, rollout e recuperação](references/swarm.md) |
| Decidir managers e workers, rollout, rollback, secrets, redes overlay ou recuperação de quorum | swarm | [Topologia, rollout e recuperação](references/swarm.md) |
| Configurar ou revisar Traefik v3, rotas, TLS com ACME ou dashboard protegido no Compose ou Swarm | proxy | [Traefik](references/traefik.md) |

Não use para:

- Coordenar release e deploy completos, cadastrar servidor, preparar `SEMVER` ou
  tratar a senha do Vault. Use `$specsfy-specialist-delivery`, que aciona este
  especialista na ordem da entrega.
- Kernel, filesystem, systemd, APT, nftables e Docker Engine do host. Use
  `$specsfy-specialist-server`.
- SBOM, proveniência e CVE de dependência além do container. Use
  `$specsfy-specialist-application-security`.
- Elegar os sinais de saúde, SLO ou alerta que continuam, pausam ou revertem um
  rollout. Use `$specsfy-specialist-observability`.

## No Specsfy

1. **Fonte de entrada por fase**
   - Em `specsfy-02-backlog`, leia o item em `specs/backlog/` e registre ali
     as decisões e sinais do especialista, além das dúvidas abertas.
   - Em `specsfy-03-specify` e `specsfy-04-validate`, use a
     spec aberta e devolva a conclusão à seção trabalhada pela fase.
   - Em `specsfy-05-tasks`, ajude a sugerir e sincronizar especialistas e modos
     entre o cabeçalho, a seção 8 e as tarefas. Só essa fase escreve a seção 14.
   - Em `specsfy-06-implement`, limite-se à tarefa indicada e ao passo carregado.

   Nas fases com spec, leia a spec aberta indicada pela skill chamadora ou
   localizada por `specsfy status`. Consulte a linha `| Especialistas |`,
   a subseção `#### Especialistas` em `### 8. Plano técnico` e a seção
   pertinente à fase.
   Leia também `.specsfy/STACK.md` e `.specsfy/RULES.md`. Abrir
   `.specsfy/DATABASE.md` quando o trabalho tocar volume, persistência ou
   serviço de dados.
2. Seguir o modo indicado na spec ou na tarefa
   (`Especialista: $specsfy-specialist-docker (compose)`, `(swarm)` ou `(proxy)`);
   sem indicação, escolher pelo "Quando usar".
3. Devolver as conclusões e dúvidas abertas no destino indicado no item 1,
   no próprio backlog, na spec ou na tarefa da fase.
4. Nunca mudar o estado da spec nem marcar gates: isso é de
   `specsfy-03-specify`, `specsfy-04-validate`, `specsfy-05-tasks` e
   `specsfy-06-implement`.
5. Quando a fase registrar a solução na spec, incluir os artefatos previstos (Dockerfile, Compose,
   stack), a referência imutável da imagem e o contrato de healthcheck, sinal e
   rollout que o deploy vai consumir.

## Fluxo

1. Descobrir arquitetura alvo (amd64/arm64), runtime base, versão, build
   context real e contrato de execução esperado (variáveis, portas, volumes)
   antes de propor mudança.
2. Inspecionar `Dockerfile`, `.dockerignore`, Compose, arquivo de stack e a
   política de imagem e tag já em uso pelo projeto.
3. Classificar o trabalho em compose (imagem e ambiente local/CI), swarm
   (topologia e serviços em cluster) ou proxy (entrada HTTP/HTTPS). `docker stack
   deploy` usa o formato Compose v3 legado, ignora `build` e não implementa
   recursos da especificação atual, como `profiles` e `depends_on.condition`.
4. Em release ou deploy, executar sob `$specsfy-specialist-delivery`, usar a
   versão que ele preparou, gerar a referência com `docker-tag` e recusá-la
   quando `verify-docker-tag` apontar diferença.
5. Executar o modo escolhido e validar com as comprovações da seção Validação
   antes de entregar.

### Modo compose

1. Separar dependências de build e runtime em estágios (`multi-stage build`):
   a imagem final não contém compilador, cache de pacote nem fonte que não roda
   em produção. Com extensões nativas, dividir a compilação em estágios
   independentes por família, para que mudar Redis, mídia ou servidor de
   aplicação não invalide toda a toolchain.
2. Fixar artefatos de forma reproduzível: lockfile, base image pinada e, quando
   reprodutibilidade byte-a-byte importar mais que atualização de patch, digest
   (`@sha256:...`). Ordenar instruções para cache (dependências antes do código
   fonte) sem congelar a versão instalada.
3. Executar o processo como usuário não root, limitar privilégio (`cap_drop`,
   sem `--privileged`), usar mounts de secret e cache do BuildKit e nunca
   embutir segredo na imagem.
4. Definir healthcheck que cheque dependência real, tratamento de sinal
   (`ENTRYPOINT` em forma exec ou init mínimo), volumes, redes e configuração
   externa.
5. Construir, escanear vulnerabilidade e testar a imagem exatamente como será
   executada em produção (mesmo usuário, mesmas variáveis, mesma arquitetura).

### Modo swarm

1. Mapear managers, workers, zonas, labels, quorum e dependências externas
   (registry, storage, DNS) antes de qualquer mudança de topologia.
2. Validar que a imagem publicada é a mesma testada e que o arquivo de stack
   usa apenas chaves suportadas por `docker stack deploy`.
3. Definir services, redes, ports, volumes, configs e secrets, com um owner
   claro para cada recurso compartilhado.
4. Configurar replicas, `placement.constraints` e `preferences`,
   `resources.limits`/`reservations`, healthcheck e `restart_policy`.
5. Projetar `update_config` e `rollback_config` (paralelismo, delay, ordem
   `start-first`/`stop-first`, `failure_action`) garantindo que a versão nova e
   a antiga coexistam sem quebrar contrato de API ou de dados.
6. Aplicar em swarm representativo (staging com topologia equivalente, não um
   único nó) e acompanhar a convergência com `docker service ps` e `docker
   service logs`.
7. Documentar deploy, rollback, rotação de secret, backup do estado do Raft e
   recuperação de perda de manager.

### Modo proxy

1. Confirmar se o Traefik é a entrada escolhida e onde o TLS termina, incluindo
   DNS, portas, redes e eventual proxy externo.
2. Usar `providers.docker` no Compose e `providers.swarm` no Swarm. Conferir
   se os labels estão no container ou no serviço e se a rede e a porta interna
   levam ao backend esperado.
3. Configurar entrypoints, routers, services e middlewares. Para TLS público,
   selecionar o challenge ACME e preparar armazenamento persistente.
4. Manter o dashboard desabilitado até haver rota TLS protegida e conferir
   acesso à API Docker e ao dashboard antes de abrir a entrada.
   Consulte [Traefik](references/traefik.md).

## Padrões

No modo compose:

- Usar uma imagem única quando vários serviços compartilham o código e
  selecionar modos de processo no entrypoint (HTTP, scheduler, filas,
  WebSocket), cada um com healthcheck, sinal e escrita compatíveis, mantendo o
  worker de contingência em zero réplica quando outro supervisor de filas
  estiver ativo.
- Publicar referências imutáveis para SemVer e commit, conferir que ainda não
  existem, registrar o digest usado pelo deploy e só publicar a tag Git depois
  que a imagem estiver disponível no registry.
- Gerar caches de framework no entrypoint quando dependem de configuração
  fornecida no runtime; não transportar cache criado no build para ambientes com
  valores diferentes.
- Preferir base mínima compatível (slim/alpine quando a stack suporta) e usar
  `RUN --mount=type=secret`/`--mount=type=cache` para credencial de build e
  cache de package manager; `ARG`/`ENV` de segredo persiste no histórico.
- Nunca copiar o repositório sem `.dockerignore`: `.git`, `node_modules`,
  artefatos locais e `.env` vazam e inflam contexto e tempo de build.
- Tratar PID 1 conscientemente, manter dado persistente fora da camada
  gravável e aplicar limites de recurso e filesystem raiz somente leitura
  quando o workload permitir.

No modo swarm:

- Em deploy coordenado por `$specsfy-specialist-delivery`, usar Cloudflare
  Tunnel como entrada pública padrão, com `cloudflared` e a aplicação na mesma
  rede overlay e sem publicar a porta do Laravel no host. Aceitar outro proxy
  só quando a pessoa pedir a troca de forma explícita. (regra da casa)
- Entregar o token do túnel por Docker Secret montado como arquivo e iniciar
  `cloudflared` 2025.4.0 ou posterior com `--token-file`; nunca guardar o
  valor na stack.
- Separar dependências, aplicação e ingress em stacks diferentes, publicar em
  ordem de dependência, aguardar a convergência de cada serviço e só então
  abrir o caminho público. (regra da casa)
- Concentrar migrations em uma réplica; os demais serviços sobem com migrations
  desativadas.
- Manter número ímpar de managers. Usar 3 ou 5 em produção para tolerar falhas
  e preferir `--availability drain` nos managers dedicados ao plano de controle.
  (regra da casa)
- Publicar imagens por digest (`image@sha256:...`) acessíveis a todos os nodes;
  nenhum node pode divergir por ter build local.
- Versionar secrets e configs por nome (`app_secret_v2`), nunca embutir segredo
  em variável de ambiente da stack.
- Separar rede de ingress, rede interna de serviço e rede de dados; não expor
  porta de serviço interno via `ports:`. Criar redes overlay externas e
  criptografadas antes das stacks. (regra da casa)
- Definir `resources.limits` e `reservations` explicitamente e aplicar
  `placement.constraints` só com labels administradas (`node.labels.*`), nunca
  com hostname hardcoded.
- Não assumir que uma opção do Compose (`profiles`, `build`, `develop`,
  `depends_on` com `condition`) é respeitada por `stack deploy`.

No modo proxy:

- Usar `exposedByDefault: false` e habilitar explicitamente o que pode receber
  tráfego. Publicar portas no proxy e colocar proxy e backend na mesma rede.
- Restringir o acesso do Traefik à API Docker. Para o dashboard, encaminhar
  `/api` e `/dashboard/` a `api@internal` com TLS e autenticação.

## Antipadrões

- `latest` como única tag em produção: não é reprodutível e não permite saber
  qual código roda sem inspecionar o container.
- `ADD` para copiar arquivo local, com descompactação e download implícitos, e
  `USER root` implícito em imagem que serve tráfego.
- Dependência de build na camada final sem multi-stage e healthcheck que só
  confere a porta, ignorando banco ou fila.
- Rolling update sem `update_config.order: start-first` em serviço com poucas
  réplicas, quando o serviço precisa de sobreposição para manter capacidade.
- Volume local em serviço com múltiplas réplicas ou reagendamento: o dado
  fica no node anterior quando o scheduler move a task.
- Secret alterado in-place: o Swarm trata secrets como imutáveis por nome; crie
  `app_secret_v2`, anexe ao serviço e só então remova a versão antiga.
- Usar o `docker-compose.yml` de desenvolvimento como stack de produção:
  healthcheck, `deploy:`, secrets e redes overlay costumam faltar ou divergir.

- Reaproveitar `providers.docker.swarmMode` do Traefik v2 ou declarar labels
  do Swarm fora de `deploy.labels`.
- Publicar o dashboard com `api.insecure`, colocar credenciais em labels ou
  compartilhar o mesmo arquivo ACME gravável entre réplicas.

## Validação

- Build limpo (`--no-cache`) e build incremental produzem imagem
  funcionalmente equivalente; a imagem roda com usuário, arquitetura e
  variáveis reais do ambiente alvo.
- Exercitar healthcheck, `docker stop` com shutdown gracioso dentro do prazo,
  portas publicadas, volumes, DNS interno e o comportamento com uma dependência
  declarada indisponível.
- Rodar SBOM ou scanner disponível e inspecionar tamanho e número de camadas da
  imagem final. Não declarar imagem segura sem scanner, nem reproduzível sem
  builds repetidos a partir do mesmo commit. (regra da casa)
- No modo swarm, rodar `docker stack config --compose-file <arquivo>` antes do
  deploy e observar `docker service ps`, `docker service logs`, réplicas
  desejadas versus atuais e eventos do node durante todo o rollout, não apenas
  no fim.
- Simular falha de worker e, em ambiente autorizado com backup validado, perda
  de um manager, confirmando que o quorum sobrevive.
- Provar rollback de aplicação (`docker service update --rollback` ou
  `rollback_config`) e a compatibilidade de migrations durante a janela em que
  as duas versões coexistem. Sem esses quatro pontos, a stack não está pronta
  para produção; "funcionou no meu node" não é comprovação de convergência.

- No modo proxy, provar resolução de DNS, redirecionamento HTTPS, certificado
  esperado e roteamento ao backend sem publicar sua porta. Conferir a emissão
  primeiro no ambiente de staging da CA e conferir persistência após restart.
- Verificar que host desconhecido não encaminha à aplicação e que o dashboard
  e a API estão bloqueados sem credenciais e acessíveis com elas.

## Skills relacionadas

- `$specsfy-specialist-delivery` coordena release, SEMVER, Vault e a ordem da
  entrega; este especialista cuida da imagem, do Compose, do Swarm e do Traefik.
- `$specsfy-specialist-server` define o estado Debian do host, incluindo o
  serviço do Docker Engine que executa a imagem e os nodes do cluster.
- `$specsfy-specialist-application-security` revisa supply chain, SBOM,
  proveniência e CVE de dependência além do container.
- `$specsfy-specialist-observability` escolhe os sinais de saúde, erro e
  latência que decidem continuar, pausar ou reverter o rollout.
- `$specsfy-specialist-postgres`, `$specsfy-specialist-redis` e
  `$specsfy-specialist-supabase` definem configuração, persistência e backup
  dos serviços de dados que rodam em container; este especialista cuida da
  imagem, dos volumes e da rede.
- `$specsfy-specialist-mysql`, `$specsfy-specialist-mongodb`,
  `$specsfy-specialist-n8n` e `$specsfy-specialist-cloudflare` recebem a
  imagem, o volume e a rede definidos aqui; a configuração de cada serviço
  continua com eles.

Leia [references/standards.md](references/standards.md) para os padrões comuns,
o índice dos modos, build, Compose, base images, scan e sinais,
[references/swarm.md](references/swarm.md) para Raft, redes overlay, placement,
rollout e recuperação e [references/traefik.md](references/traefik.md) para proxy.
