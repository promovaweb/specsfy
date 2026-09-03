---
name: specsfy-specialist-docker-swarm
description: "Projetar, implantar e operar stacks Docker Swarm com serviços, overlay networks, secrets, configs, placement, rollout, rollback e recuperação do quorum. Use para swarm init, docker stack, services, managers, workers ou arquivos de stack; use também para decidir topologia de managers/workers e estratégia de rollout; não use Compose local como evidência de comportamento do Swarm, e para build/imagem de uma única máquina use `$specsfy-specialist-docker`."
---

# Docker Swarm

## Quando usar

- Acionar quando o projeto orquestra múltiplos nós com `docker swarm
  init/join`, `docker stack deploy` ou arquivos de stack com `deploy:`.
- Acionar também para decidir topologia de managers/workers, rollout,
  rollback ou recuperação de quorum.
- Não acionar para desenvolvimento local com `docker compose up` em uma única
  máquina, nem para build de imagem — usar `$specsfy-specialist-docker` nesse
  caso; muitas chaves do Compose (`profiles`, `depends_on.condition`, `build`
  em runtime) não têm efeito em `docker stack deploy`.
- Combinar com `$specsfy-specialist-delivery-engineering` quando o rollout faz
  parte de um pipeline de release, e com `$specsfy-specialist-observability`
  para decidir os sinais que autorizam ou revertem o rollout.

## Fluxo

1. Em release ou deploy completo, trabalhar sob
   `$specsfy-specialist-deploy`. Conferir o `SEMVER` preparado por
   `$specsfy-specialist-versioning`, executar `verify-docker-tag` antes de
   `docker stack deploy` e interromper quando a tag for diferente.
1. Mapear managers, workers, zonas, labels, quorum e dependências externas
   (registry, storage, DNS) antes de qualquer mudança de topologia.
1. Validar que a imagem publicada é a mesma testada e que o arquivo de stack
   usa apenas chaves suportadas por `docker stack deploy` (não todo o schema
   do Compose).
1. Definir services, redes, ports, volumes, configs e secrets, com um owner
   claro para cada recurso compartilhado.
1. Configurar replicas, placement constraints/preferences,
   `resources.limits`/`reservations`, healthcheck e `restart_policy`.
1. Projetar `update_config` e `rollback_config` (paralelismo, delay, ordem
   `start-first`/`stop-first`, `failure_action`) garantindo que a versão nova
   e a antiga coexistam sem quebrar contrato de API/dados durante o rollout.
1. Aplicar em um swarm representativo (staging com topologia equivalente, não
   um único nó) e observar convergência com `docker service ps` e `docker
   service logs`.
1. Documentar procedimento de deploy, rollback, rotação de secret, backup do
   estado do Raft e plano de recuperação de perda de manager.

## Padrões

- Separar dependências, aplicação e ingress em stacks diferentes. Publicar em
  ordem de dependência, aguardar a convergência declarada de cada serviço e só
  então abrir o caminho público.
- Concentrar migrations em uma réplica escolhida. Os demais serviços iniciam
  com migrations desativadas para impedir concorrência durante rollout.
- Usar a mesma imagem imutável para HTTP, filas, scheduler e WebSocket, com
  comandos e healthchecks próprios. Manter o worker de contingência em zero
  réplica quando outro supervisor de filas estiver ativo.
- Criar redes overlay externas e criptografadas antes das stacks. Serviços de
  dados ficam apenas na rede interna; um tunnel outbound-only pode eliminar
  portas públicas no host quando esse desenho atende ao projeto.
- Manter número ímpar de managers (1, 3 ou 5) e nunca deixar o quorum
  dependente de um único manager em produção.
- Publicar imagens imutáveis por digest (`image@sha256:...`) acessíveis por
  todos os nodes; um node não pode divergir por ter build local.
- Usar secrets/configs versionados por nome (`app_secret_v2`) e nunca embutir
  segredo em variável de ambiente do arquivo de stack.
- Separar rede de ingress, rede interna de serviço e rede de dados; não expor
  uma porta de serviço interno via `ports:` publicado.
- Definir `resources.limits` e `reservations` explicitamente; não depender de
  capacidade implícita do node mais folgado.
- Aplicar `placement.constraints` apenas com labels administradas
  (`node.labels.*`), nunca com hostname hardcoded.
- Não assumir que uma opção do Compose (`profiles`, `build`, `develop`,
  `depends_on` com `condition`) é respeitada por `stack deploy` — validar
  contra a lista de campos suportados antes de depender dela.

## Antipadrões

- Rolling update sem `update_config.order: start-first` em serviço com
  poucas réplicas: a réplica antiga cai antes da nova ficar saudável, e o
  serviço fica momentaneamente sem capacidade.
- Volume local (`bind` ou volume nomeado sem driver distribuído) em serviço
  com múltiplas réplicas ou reagendamento: o dado "desaparece" quando o
  scheduler realoca o container para outro node.
- Secret alterado in-place trocando o conteúdo do arquivo referenciado: Swarm
  trata secrets como imutáveis por nome; a mudança correta é criar uma nova
  versão (`app_secret_v2`), anexá-la ao serviço e só então remover a antiga.
- Confundir `docker-compose.yml` de desenvolvimento com o arquivo de stack de
  produção: healthcheck, `deploy:`, secrets e redes overlay costumam faltar
  ou divergir entre os dois.

## Validação

- Rodar `docker stack config --compose-file <arquivo>` (ou validação
  equivalente do provedor) antes do deploy para detectar erro de interpolação
  e de schema.
- Observar `docker service ps <serviço>`, `docker service logs`, réplicas
  desejadas vs atuais e eventos do node durante todo o rollout, não apenas no
  fim.
- Simular falha de worker e, em ambiente autorizado e com backup validado,
  perda de um manager, confirmando que o quorum sobrevive com os managers
  restantes.
- Provar rollback de aplicação (`docker service update --rollback` ou
  `rollback_config`) e a compatibilidade de migrations de dados durante a
  janela em que as duas versões coexistem.
- Não declarar a stack "pronta para produção" sem esses quatro pontos
  verificados; "funcionou no meu node" não é evidência de convergência do
  cluster.

## Skills relacionadas

- `$specsfy-specialist-deploy` coordena servidor, imagem, Ansible e publicação
  da stack; esta skill governa somente o Swarm.
- `$specsfy-specialist-versioning` prepara `SEMVER` e confere a versão usada
  pela imagem e pelo manifesto da stack.
- `$specsfy-specialist-ansible` prepara e mantém os nodes; esta skill governa
  quorum, scheduler, services e redes do Swarm.
- `$specsfy-specialist-laravel` define os contratos da aplicação e
  `$specsfy-specialist-redis` a persistência/cache usados pelos services.
- `$specsfy-specialist-docker` para build de imagem, Dockerfile e
  desenvolvimento local com Compose — fronteira: Swarm começa onde a
  aplicação passa a rodar em múltiplos nós com estado de cluster.
- `$specsfy-specialist-delivery-engineering` quando o rollout do serviço faz
  parte de um pipeline de release com promoção entre ambientes.
- `$specsfy-specialist-observability` para instrumentar os sinais (health,
  taxa de erro, latência) que decidem continuar, pausar ou reverter um
  rollout.
- `$specsfy-specialist-debian-server` para portas do cluster, kernel,
  filesystem e serviço Docker dos nodes.

Leia [references/standards.md](references/standards.md) para topologia do
Raft, ciclo de vida de secrets/configs, redes overlay, estratégias de rollout
e disaster recovery, com fontes oficiais da documentação do Docker.
