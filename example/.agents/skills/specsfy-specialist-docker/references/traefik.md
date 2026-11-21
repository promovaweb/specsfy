# Traefik v3 no Compose e no Swarm

## Configuração de entrada e roteamento

Declare entrypoints, providers, API e resolvers ACME na configuração de
inicialização. Entrypoints são os pontos de escuta, como `web` em `:80` e
`websecure` em `:443`. O provider lê a configuração dinâmica dos labels.
Um router associa uma regra, como `Host(…)`, a um ou mais entrypoints, aplica
middlewares na ordem declarada e encaminha para um service do Traefik.
Esse service nomeia o balanceador que envia tráfego a uma ou mais instâncias
do backend.

| Ambiente | Provider | Local dos labels | Rede e porta do backend |
| --- | --- | --- | --- |
| Compose | `providers.docker` | `services.<app>.labels` | Rede comum, com `traefik.docker.network` se necessário. Fixe a porta interna por label quando houver ambiguidade. |
| Swarm | `providers.swarm` | `services.<app>.deploy.labels` | Rede overlay comum, com `traefik.swarm.network` se necessário. Declare a porta interna por label, pois o provider não a detecta. |

Use o nome efetivo da rede. Redes de stack normalmente recebem o prefixo
da stack, enquanto uma rede externa já tem nome próprio. Configure
`exposedByDefault: false` no provider e adicione `traefik.enable=true`
somente aos serviços que precisam de rota. No Swarm, o endpoint da API é de
um manager. Com o socket local, restrinja a task do proxy a um manager
disponível para receber workloads. Trate o acesso ao socket Docker como
privilegiado. Um mount `:ro` não restringe as operações da API. Considere
um endpoint protegido e com acesso limitado às operações necessárias.

### Exemplo de rota HTTPS

Exemplo de configuração de inicialização no Compose. Substitua
`docker` por `swarm` na chave do provider se o alvo for Swarm.
Monte armazenamento persistente gravável em `/data` e publique as portas
dos entrypoints no proxy.

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"
providers:
  docker:
    exposedByDefault: false
certificatesResolvers:
  le:
    acme:
      email: platform@example.com
      storage: /data/acme.json
      httpChallenge:
        entryPoint: web
```

Adicione estes labels ao backend. No Swarm, mova a lista para
`deploy.labels`. Ajuste o e-mail, o hostname e a porta para o serviço real.

```yaml
labels:
  - 'traefik.enable=true'
  - 'traefik.http.routers.app.rule=Host(`app.example.com`)'
  - 'traefik.http.routers.app.entrypoints=websecure'
  - 'traefik.http.routers.app.tls.certresolver=le'
  - 'traefik.http.routers.app.service=app'
  - 'traefik.http.routers.app.middlewares=app-compress'
  - 'traefik.http.middlewares.app-compress.compress=true'
  - 'traefik.http.services.app.loadbalancer.server.port=8080'
```

A porta `8080` acima é interna. Publique no host apenas os entrypoints
necessários. O exemplo também redireciona HTTP para HTTPS. Confira a
prioridade de regras que sobrepõem host e caminho.

## TLS com Let's Encrypt

- Declare `certificatesResolvers.le.acme` na configuração de inicialização,
  com e-mail de contato, `storage: /data/acme.json` e um challenge.
  O router adota esse resolver com `tls.certresolver=le`. O exemplo usa
  o domínio da regra `Host` para pedir o certificado.
- Para `httpChallenge.entryPoint: web`, o domínio público deve alcançar a
  porta 80. Para `tlsChallenge`, a CA deve alcançar a porta 443 com TLS
  terminado no Traefik. Para wildcard, use `dnsChallenge.provider` e dê
  ao proxy acesso restrito à API DNS. Entregue a credencial como secret,
  fora dos labels e dos logs.
- Comece com o `caServer` de staging do Let's Encrypt
  (`https://acme-staging-v02.api.letsencrypt.org/directory`), em estado
  separado do usado em produção. Persista e proteja `acme.json` com
  permissões `0600`. O arquivo contém chaves privadas. Mantenha backup
  protegido e confirme que a conta e os certificados sobrevivem ao restart.
- Use um único escritor para o arquivo ACME. Em Swarm, considere onde o
  volume estará após reagendamento. Para múltiplas réplicas do proxy,
  planeje emissão externa com distribuição de certificados, sem compartilhar
  o mesmo arquivo ACME gravável.

## Dashboard protegido

Se precisar do dashboard, habilite `api.dashboard` e mantenha
`api.insecure: false`. Crie um router TLS dedicado que combine o hostname
administrativo com ``PathPrefix(`/api`) || PathPrefix(`/dashboard`)``, com
parênteses em torno da expressão de caminhos. Encaminhe a `api@internal`.
Proteja ambos os caminhos com um middleware de autenticação, por exemplo
BasicAuth com `usersFile` montado como secret e, quando aplicável, restrição
de rede por `IPAllowList`. A URL da interface termina em `/dashboard/`.
No Swarm, declare também um label de porta para o serviço do próprio
Traefik, como no setup oficial, para o provider resolver as portas. A rota
do dashboard continua apontando explicitamente para `api@internal`.

## Verificação

- Renderize o manifesto com `docker compose config` ou `docker stack config`,
  conforme o alvo. No Swarm, confira serviços e tasks a partir do manager.
- Confira logs do provider, rede e porta interna. Exercite o hostname
  conhecido, um hostname sem rota e o redirecionamento a partir do cliente.
- Confirme a cadeia TLS e o hostname, o acesso sem credenciais bloqueado tanto
  em `/api` quanto em `/dashboard/`, e o acesso autorizado funcionando.
- Em uma atualização, confira o comportamento depois de reiniciar ou
  reagendar dentro da topologia prevista. Verifique uma requisição real
  pelo proxy, incluindo o comportamento se o backend estiver indisponível.

As fontes oficiais deste modo estão em [standards.md](standards.md#fontes-oficiais).
