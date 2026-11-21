# Docker

O especialista Docker orienta o agente na criação e na revisão de imagens,
arquivos Compose e políticas de tag, além da orquestração de serviços em vários
nós com Docker Swarm. Ele trabalha em três modos. **Compose** cobre imagens,
ambiente local e CI. **Swarm** cobre stacks, redes, secrets, rollout e
recuperação do cluster. **Proxy** cobre a entrada HTTP e HTTPS com Traefik.

## Quando usar

- Você vai escrever ou revisar `Dockerfile`, `docker-compose.yml`,
  `.dockerignore` ou a política de tag e de registry.
- Um container não faz build, não sobe ou não responde ao healthcheck.
- Você quer reduzir o tamanho da imagem, remover um segredo vazado em uma
  camada ou corrigir um processo que ignora o `SIGTERM`.
- O projeto usa `docker swarm init`, `docker swarm join`, `docker stack deploy`
  ou arquivos de stack com a chave `deploy:`.
- Você precisa definir managers e workers, planejar rollout e rollback ou
  recuperar o quorum do cluster.
- Você precisa configurar Traefik, certificados TLS ou um dashboard protegido.

Desenvolvimento local e build de imagem ficam no modo Compose. Orquestração com
vários nós, réplicas, secrets de cluster e redes overlay ficam no modo Swarm.
Várias chaves do Compose, como `profiles`, `build` e `depends_on` com condição,
não têm efeito em `docker stack deploy`.

## Como ele trabalha

1. Identifica a arquitetura alvo, o runtime base, o build context e o contrato
   de execução com variáveis, portas e volumes.
2. Inspeciona o `Dockerfile`, o `.dockerignore`, o Compose, o arquivo de stack e
   a política de imagens do projeto.
3. Em um release ou deploy, atua sob o especialista [Delivery](delivery.md),
   que prepara a versão e coordena a entrega, e recusa a referência quando o
   `verify-docker-tag` aponta diferença.
4. Define a topologia quando o alvo é cluster: managers, workers, zonas,
   labels, quorum e dependências externas como registry, storage e DNS.
5. Entrega o resultado do modo com as validações correspondentes.

## Compose

O modo Compose cobre a imagem e o ambiente local. A imagem final fica pequena,
reproduzível e executada sem root.

- Build e runtime ficam em estágios separados, com `multi-stage build`. A
  imagem final não leva compilador, cache de pacotes nem código que não roda em
  produção.
- Extensões nativas compilam em estágios independentes, para que uma mudança em
  Redis não invalide toda a toolchain.
- Serviços que compartilham o código usam uma imagem única, com modos de
  processo no entrypoint, como HTTP, scheduler, filas e WebSocket.
- As tags de SemVer e de commit são imutáveis e o digest usado no deploy fica
  registrado, com a tag Git publicada depois da imagem.
- Caches de framework que dependem da configuração de runtime são gerados no
  entrypoint.
- A ordem das instruções aproveita o cache, com a instalação de dependências
  antes da cópia do código.
- Credenciais de build usam `RUN --mount=type=secret`, porque `ARG` e `ENV`
  ficam gravados no histórico das camadas.
- O `.dockerignore` exclui `.git`, `node_modules`, artefatos locais e `.env`.
- O `ENTRYPOINT` usa a forma exec, ou um init mínimo como `tini`, para receber
  sinais.
- Volumes nomeados ou bind mounts guardam o conteúdo persistente fora da
  camada gravável.
- Quando a carga permite, o container roda com limites de recurso e filesystem
  somente leitura.

## Swarm

O modo Swarm cobre o cluster de produção. A mesma imagem imutável roda em todos
os nodes e o rollout preserva a capacidade durante a troca.

- O Cloudflare Tunnel é a entrada pública padrão no deploy coordenado pelo
  especialista Delivery, na mesma rede overlay da aplicação, com o serviço
  Laravel sem porta pública.
- O token do túnel chega por Docker Secret montado como arquivo, com
  `cloudflared tunnel run --token-file` (2025.4.0 ou posterior).
- Dependências, aplicação e ingress ficam em stacks separadas, publicadas em
  ordem de dependência.
- As migrations rodam em uma única réplica, enquanto os outros serviços sobem
  com migrations desativadas.
- HTTP, filas, scheduler e WebSocket usam a mesma imagem, com comandos e
  healthchecks próprios.
- As redes overlay são externas e criptografadas, com os serviços de banco
  restritos à rede interna.
- Em produção, o Specsfy prevê 3 ou 5 managers para tolerar perda de nós.
  Um Swarm com apenas um manager serve para cenários sem alta disponibilidade.
- As imagens são referenciadas por digest e ficam acessíveis a todos os nodes.
- Secrets e configs são versionados por nome, como `app_secret_v2`.
- Limites e reservas de recursos são declarados de forma explícita.
- O placement usa labels administradas (`node.labels.*`) em vez de hostnames.

## Traefik

Use o modo `proxy` para publicar serviços HTTP e HTTPS com Traefik v3 no
Compose ou no Swarm. Um entrypoint é a porta de entrada. Um router escolhe
a rota pelo domínio ou caminho e o service do Traefik aponta para o backend.
Middlewares aplicam regras como autenticação ou compressão.

1. No Compose, configure o provider Docker e coloque os labels no serviço
   Compose. No Swarm, configure o provider Swarm, use `deploy.labels` e
   declare a porta interna do backend com um label.
2. Conecte proxy e backend à mesma rede e deixe a porta da aplicação sem
   publicação direta no host.
3. Para certificados do Let's Encrypt, selecione a validação ACME adequada
   ao DNS e às portas disponíveis. Confira a emissão no ambiente de staging
   da autoridade certificadora e persista o armazenamento de certificados.
4. Se habilitar o dashboard, proteja a rota e sua API com HTTPS e autenticação.
   Confira a resposta da aplicação, o certificado e o bloqueio do painel
   para quem não tem credenciais.

Veja a [referência técnica do Traefik](../../../specialists/specsfy-specialist-docker/references/traefik.md).

## Erros que ele evita

- `latest` como única tag em produção.
- `ADD` para copiar arquivos locais, com descompactação e download implícitos.
- Imagem que atende tráfego rodando como root.
- Compilador e headers na camada final.
- Healthcheck que só confere a porta e ignora o banco ou a fila.
- Rolling update sem `start-first` em serviço com poucas réplicas, o que deixa
  o serviço sem capacidade por alguns instantes.
- Volume local em serviço que pode ser reagendado para outro node.
- Secret alterado no lugar, já que o Swarm trata secrets como imutáveis.
- Usar o `docker-compose.yml` de desenvolvimento como stack de produção.

## Como conferir o resultado

- Builds com e sem cache produzem imagens equivalentes.
- A imagem roda com o usuário, a arquitetura e as variáveis do ambiente alvo.
- Healthcheck, `docker stop` dentro do prazo, portas, volumes e DNS interno
  foram exercitados, inclusive com uma dependência indisponível.
- O SBOM ou o scanner do projeto rodou sobre a imagem final, com tamanho e
  camadas inspecionados.
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
  --skill specsfy-specialist-docker --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Delivery](delivery.md) coordena release, versão, Vault e deploy completo.
- [Server](server.md) cuida do host Debian e do serviço do Docker Engine.
- [Segurança de Aplicações](application-security.md) revisa a cadeia de
  suprimentos.
- [Observabilidade](observability.md) cuida dos sinais que mantêm, pausam ou
  revertem o rollout.
- [PostgreSQL](postgres.md), [Redis](redis.md) e [Supabase](supabase.md) cuidam
  do que roda dentro dos serviços de banco, cache e ambiente local.
- [Laravel](laravel.md) define workers, scheduler e variáveis da aplicação.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-docker/SKILL.md),
com os padrões comuns, o build e o Compose em
[standards.md](../../../specialists/specsfy-specialist-docker/references/standards.md)
e a topologia, o rollout e a recuperação em
[swarm.md](../../../specialists/specsfy-specialist-docker/references/swarm.md).
