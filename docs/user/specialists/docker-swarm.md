# Docker Swarm

O especialista Docker Swarm orienta o agente na orquestração de serviços em
vários nós. Ele define a topologia do cluster e as stacks, cuida de redes e
secrets e planeja o rollout e a recuperação, com a mesma imagem imutável em
todos os nodes.

## Quando usar

- O projeto usa `docker swarm init`, `docker swarm join`, `docker stack deploy`
  ou arquivos de stack com a chave `deploy:`.
- Você precisa definir managers e workers, planejar rollout e rollback ou
  recuperar o quorum.
- O rollout faz parte de um pipeline de release. Nesse caso, combine com o
  especialista Engenharia de Entrega.

O desenvolvimento local com `docker compose up` e o build de imagem ficam com o
especialista Docker. Várias chaves do Compose, como `profiles` e `build`, não
têm efeito em `docker stack deploy`.

## Como ele trabalha

1. Em um release ou deploy completo, atua sob o especialista Deploy. Confere o
   `SEMVER` e interrompe o processo quando `verify-docker-tag` aponta uma tag
   diferente.
2. Levanta managers, workers, zonas, labels, quorum e dependências externas,
   como registry, storage e DNS.
3. Confirma que a imagem publicada é a mesma testada e que a stack usa apenas
   chaves suportadas pelo `docker stack deploy`.
4. Define serviços, redes, portas, volumes, configs e secrets, com um
   responsável para cada recurso compartilhado.
5. Configura réplicas, placement, limites de recursos, healthcheck e
   `restart_policy`.
6. Desenha `update_config` e `rollback_config` para que as versões antiga e
   nova convivam durante o rollout.
7. Aplica em um swarm de staging com topologia equivalente e acompanha a
   convergência com `docker service ps` e `docker service logs`.
8. Documenta deploy, rollback, rotação de secrets, backup do Raft e
   recuperação de um manager perdido.

## Padrões aplicados

- No deploy coordenado pelo especialista Deploy, o Cloudflare Tunnel é a
  entrada pública padrão, na mesma rede overlay da aplicação.
- O token do túnel chega por Docker Secret montado como arquivo, com
  `cloudflared --token-file`.
- Dependências, aplicação e ingress ficam em stacks separadas, publicadas em
  ordem de dependência.
- As migrations rodam em uma única réplica, enquanto os outros serviços sobem
  com migrations desativadas.
- HTTP, filas, scheduler e WebSocket usam a mesma imagem, com comandos e
  healthchecks próprios.
- As redes overlay são externas e criptografadas, com os serviços de banco
  restritos à rede interna.
- O cluster tem 1, 3 ou 5 managers, para que o quorum não dependa de um único
  manager em produção.
- As imagens são referenciadas por digest e ficam acessíveis a todos os nodes.
- Secrets e configs são versionados por nome, como `app_secret_v2`.
- Limites e reservas de recursos são declarados de forma explícita.
- O placement usa labels administradas (`node.labels.*`) em vez de hostnames.

## Erros que ele evita

- Rolling update sem `start-first` em serviço com poucas réplicas, o que deixa
  o serviço sem capacidade por alguns instantes.
- Volume local em serviço que pode ser reagendado para outro node.
- Secret alterado no lugar, já que o Swarm trata secrets como imutáveis.
- Usar o `docker-compose.yml` de desenvolvimento como stack de produção.

## Como conferir o resultado

- `docker stack config --compose-file <arquivo>` detecta erros de interpolação
  e de schema.
- `docker service ps`, `docker service logs` e as réplicas são acompanhados
  durante todo o rollout.
- A falha de um worker foi simulada. Com autorização e backup validado, a
  perda de um manager também foi testada.
- O rollback da aplicação foi provado, com migrations compatíveis enquanto as
  duas versões convivem.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-docker-swarm --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Deploy](deploy.md) coordena servidor, imagem, Ansible e publicação.
- [Versionamento](versioning.md) confere a versão da imagem e da stack.
- [Ansible](ansible.md) prepara e mantém os nodes.
- [Laravel](laravel.md) e [Redis](redis.md) definem os contratos da aplicação
  e o cache.
- [Docker](docker.md) cuida do build e do Compose local.
- [Engenharia de Entrega](delivery-engineering.md) cuida do pipeline e das
  promoções.
- [Observabilidade](observability.md) define os sinais que mantêm ou revertem
  o rollout.
- [Debian Server](debian-server.md) cuida das portas, do kernel e do Docker
  nos nodes.
- [Relatório de servidor](server-report.md) coleta logs e uso de disco por
  host.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-docker-swarm/SKILL.md),
com topologia do Raft, redes overlay e recuperação de desastres no arquivo de
referência da mesma pasta.
