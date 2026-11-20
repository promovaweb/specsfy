# Padrões e referências Docker Swarm

## Sequência de stacks e convergência

Divida stacks por ciclo de vida: dados, aplicação e ingress. Garanta redes,
configs e Docker Secrets externos antes do primeiro `docker stack deploy`.
Depois de cada stack, compare réplicas atuais e desejadas serviço a serviço;
um comando concluído não comprova que o scheduler estabilizou as tasks.

Em aplicações com migrations, escolha um único serviço para executá-las e
mantenha os outros modos com essa função desligada. Combine a janela de
migrations com `update_config`, `rollback_config` e compatibilidade entre a
versão anterior e a nova. Para storage local, fixe a task por label administrada
e documente backup, restore e a consequência de perder aquele node.

Um ingress outbound-only pode conectar-se a uma rede edge sem publicar portas.
Confirme healthcheck do tunnel, ao menos duas réplicas quando houver capacidade
no cluster e ordem explícita das rotas antes do catch-all.

## Topologia e quorum

- O Raft consensus exige maioria simples viva para eleger líder e aceitar
  escrita no log. Com 3 managers tolera-se 1 falha; com 5, tolera-se 2. Um
  número par não aumenta tolerância (5 e 6 ambos toleram só 2), então nunca
  use quantidade par de managers.
- Managers também podem executar workload por padrão; em produção, prefira
  `--availability drain` nos managers para que só façam gestão do cluster,
  isolando o plano de controle de picos de carga da aplicação.
- Use `node.labels.*` (labels administradas, atribuídas por
  `docker node update --label-add`) para placement por capacidade real
  (`ssd=true`, `zone=us-east-1a`), nunca `engine.labels` (definidas no daemon,
  não confiáveis para decisão de placement administrativa).
- Faça backup do diretório `/var/lib/docker/swarm` de um manager com o Swarm
  parado (`docker swarm leave --force` só depois do backup, nunca antes) e
  preserve a unlock key se `autolock` estiver ativo — sem ela o backup não
  restaura.

## Redes

- Toda rede `overlay` usada por múltiplos serviços deve ser criada com
  `--attachable` apenas quando containers avulsos (fora de stack) precisarem
  entrar nela; caso contrário, mantenha a rede restrita ao stack.
- O `ingress` overlay padrão faz load balancing de camada 4 (`routing mesh`)
  entre todas as réplicas de um serviço publicado; para desabilitar o mesh e
  publicar porta só no node que roda a réplica, use `mode: host` no
  `ports:` do serviço — necessário para preservar IP de origem ou para
  protocolos que o mesh não suporta bem.
- Separe ao menos três redes lógicas: ingress (tráfego externo), interna de
  serviço (comunicação entre serviços da aplicação) e de dados (acesso a
  banco/cache), cada uma com escopo mínimo de quem pode entrar.
- Criptografia de rede overlay: o control plane (gossip entre daemons) já é
  criptografado por padrão; o tráfego de dados entre containers só é
  criptografado (IPsec) quando a rede é criada com
  `docker network create --opt encrypted -d overlay <rede>`. Ative
  `--opt encrypted` em redes que cruzam datacenters/zonas não confiáveis;
  o custo é overhead de CPU por criptografia/descriptografia em cada node,
  então não é gratuito em redes internas de baixa latência já isoladas por
  outros controles (VPC privada, firewall).

## Placement: constraints vs preferences

| Mecanismo | Efeito | Quando usar |
|---|---|---|
| `placement.constraints` (`node.labels.zone==a`) | Regra dura; a tarefa só agenda em node que satisfaça | Requisito obrigatório: compliance, hardware específico (GPU), isolamento de tenant |
| `placement.preferences` (`spread=node.labels.zone`) | Distribui tarefas proporcionalmente entre os valores do label, sem travar o agendamento se um valor ficar sem capacidade | Espalhar réplicas entre zonas de disponibilidade mantendo tolerância a falta de capacidade em uma zona |
| `node.role==manager` / `node.role==worker` | Restringe a managers ou workers | Evitar que workload de aplicação compita por CPU/memória com o processo Raft nos managers |

Combine as duas quando o requisito tiver parte obrigatória e parte de
distribuição: constraint para "só nodes com SSD", preference para "espalhe
entre zonas dentro dos nodes com SSD".

## Deploy seguro e rollout

- `update_config` relevante: `parallelism` (quantas réplicas por vez),
  `delay` (intervalo entre lotes), `order` (`stop-first` economiza recursos,
  `start-first` preserva capacidade — prefira `start-first` quando o serviço
  não tolera queda de capacidade), `failure_action` (`pause` para investigar,
  `rollback` para reverter automaticamente) e `monitor` (janela para
  considerar a réplica estável antes de avançar).
- `rollback_config` usa os mesmos campos e é o que executa quando
  `docker service update --rollback` ou um `failure_action: rollback` é
  disparado; sem configurá-lo, o rollback usa os defaults do Swarm, que nem
  sempre coincidem com o que o serviço tolera.

### Rolling update vs recreate

| Estratégia | Configuração | Efeito | Custo |
|---|---|---|---|
| Rolling, `start-first` | `order: start-first`, `parallelism: 1` | Sobe a réplica nova, espera o healthcheck ficar saudável, só então derruba a antiga | Exige capacidade extra temporária (N+1 réplicas); mais seguro com poucas réplicas |
| Rolling, `stop-first` (padrão do Swarm) | `order: stop-first` | Derruba a réplica antiga antes de subir a nova | Não exige capacidade extra, mas reduz capacidade útil durante a janela |
| Recreate total | `parallelism` igual ao total de réplicas, sem lotes | Derruba todas as réplicas e sobe a versão nova de uma vez | Janela de indisponibilidade total; só aceitável com manutenção agendada |

`max_failure_ratio` define a fração de tarefas que pode falhar no rollout
antes de disparar `failure_action` — mantenha próximo de zero em serviços
críticos e use uma fração pequena apenas em serviços que toleram degradação
parcial.

- Garanta compatibilidade de contrato (API e schema de dados) entre a versão
  antiga e a nova durante toda a janela de rollout — com `start-first` ou
  `parallelism` parcial, as duas versões atendem tráfego ao mesmo tempo.
- Rotação de secret: crie a nova versão com nome diferente
  (`docker secret create app_secret_v2 ./secret.txt`), atualize o serviço
  para referenciá-la (`docker service update --secret-rm app_secret_v1
  --secret-add source=app_secret_v2,target=app_secret`), confirme
  convergência e só então remova a versão antiga (`docker secret rm
  app_secret_v1`). Nunca sobrescreva o conteúdo de um secret existente — o
  Swarm trata secrets como imutáveis por nome.
- Para volumes com estado, use um driver distribuído (ex.: plugin de volume
  com backend replicado) ou fixe o serviço a um node específico via
  `placement.constraints` combinado com um volume local documentado como
  single-point-of-failure — nunca deixe volume local em serviço com múltiplas
  réplicas ou reagendamento livre.

## Recursos e saúde

- Defina `resources.limits.cpus`/`memory` para conter vizinhos ruidosos e
  `resources.reservations` para garantir capacidade mínima ao scheduler
  decidir onde agendar; sem reservations, o Swarm pode empilhar réplicas em
  um node já saturado.
- `healthcheck` no nível do serviço (ou herdado da imagem) é o sinal que o
  `update_config.monitor` usa para decidir se uma réplica nova está pronta;
  sem healthcheck, o Swarm considera "saudável" assim que o processo inicia,
  mesmo que a aplicação ainda não aceite tráfego.

## Comandos de diagnóstico

```bash
# Validar o arquivo de stack antes do deploy (interpolação e schema)
docker stack config --compose-file docker-stack.yml

# Aplicar/atualizar a stack
docker stack deploy --compose-file docker-stack.yml --with-registry-auth minha-stack

# Estado das tarefas de um serviço (desejado vs atual, node, erro), sem truncar
docker service ps minha-stack_api --no-trunc

# Logs agregados de todas as réplicas do serviço
docker service logs -f minha-stack_api

# Detalhe legível do serviço, incluindo update status do rollout em andamento
docker service inspect --pretty minha-stack_api

# Forçar rollback manual para a versão anterior
docker service update --rollback minha-stack_api

# Estado dos nodes e do quorum
docker node ls
docker system info --format '{{json .Swarm}}'
```

## Fontes oficiais

- Swarm mode: https://docs.docker.com/engine/swarm/
- Conceitos-chave: https://docs.docker.com/engine/swarm/key-concepts/
- Serviços: https://docs.docker.com/engine/swarm/services/
- Stack deploy (referência de compose file suportada): https://docs.docker.com/engine/swarm/stack-deploy/
- Redes overlay: https://docs.docker.com/engine/network/drivers/overlay/
- Routing mesh: https://docs.docker.com/engine/swarm/ingress/
- Secrets: https://docs.docker.com/engine/swarm/secrets/
- Configs: https://docs.docker.com/engine/swarm/configs/
- PKI e Raft: https://docs.docker.com/engine/swarm/how-swarm-mode-works/pki/
- Administração e recuperação de backup: https://docs.docker.com/engine/swarm/admin_guide/
