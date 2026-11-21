---
name: specsfy-specialist-server
description: Administrar servidores Debian e a automação deles com os modos debian (APT, systemd, journald, SSH, nftables, sysctl, storage, usuários e Docker Engine), ansible (inventário, roles idempotentes, Vault e preflight) e report (relatório somente leitura por host com Ansible, Docker, Swarm e disco). Use para instalar, proteger, atualizar ou diagnosticar o host, para playbooks e roles ou para um relatório de servidor; não use para release e SEMVER (`$specsfy-specialist-delivery`), para imagem, Compose e Swarm (`$specsfy-specialist-docker`), para SLO e alerta (`$specsfy-specialist-observability`) nem para causa raiz de um erro (`$specsfy-specialist-debugging`).
---

# Servidores

Cobre o estado Debian do host, a automação que repete esse estado e o relatório
somente leitura que mostra o que está acontecendo em cada máquina. O modo
debian define o alvo, o ansible aplica e prova idempotência e o report lê sem
alterar.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Instalar, proteger, atualizar ou diagnosticar host Debian de aplicações, containers ou Swarm; APT, systemd, journald, SSH, nftables, sysctl, discos, mounts, usuários, relógio e Docker Engine | debian | [Baseline Debian e inspeção](references/debian.md) |
| Criar ou revisar playbooks, roles, `inventory`, `ansible.cfg`, `requirements.yml` ou `galaxy.yml` de collections; provar idempotência antes de ambiente compartilhado; preflight de stack e Vault | ansible | [Roles, precedência e idempotência](references/ansible.md) |
| Gerar relatório, diagnóstico ou auditoria somente leitura por host a partir de `server-reports/`, inventário e Docker Engine; investigar container parado, serviço degradado ou disco cheio | report | [Coleta por runtime e thresholds](references/report.md) e [modelo Markdown](references/report-template.md) |

Não use para:

- Coordenar release, deploy, `SEMVER` ou a senha do Vault. Use
  `$specsfy-specialist-delivery`, que aciona este especialista na ordem da
  entrega.
- Governar imagem, Compose ou a topologia do Swarm. Use
  `$specsfy-specialist-docker`.
- Transformar achados recorrentes em SLO, alerta ou dashboard. Use
  `$specsfy-specialist-observability`.
- Investigar a causa raiz de um erro apontado no relatório. Use
  `$specsfy-specialist-debugging`.

## No Specsfy

Este especialista trabalha dentro do fluxo do método: a spec decide, a fase
escreve e a conclusão volta para a spec.

1. Antes de agir, ler a spec aberta, cujo caminho vem da skill que chamou ou de
   `specsfy status`, em especial a linha `| Especialistas |`, a subseção
   `#### Especialistas` dentro de `### 8. Plano técnico` e a seção que a fase
   está escrevendo, mais `.specsfy/STACK.md` e `.specsfy/RULES.md`. Abrir
   `.specsfy/DATABASE.md` quando o host hospedar banco ou storage do serviço.
   - Fonte de entrada por fase: em `specsfy-02-backlog`, sem spec, ler e
     registrar no item de `specs/backlog/`; em specify e validate, ler a spec
     aberta (linha `| Especialistas |`, subseção 8, seção em escrita); só
     `specsfy-05-tasks` escreve a seção 14, então apenas indicar o que a tarefa
     deve prever; em `specsfy-06-implement`, seguir a tarefa indicada.
2. Seguir o modo indicado na spec ou na tarefa
   (`Especialista: $specsfy-specialist-server (debian)`, `(ansible)` ou
   `(report)`); sem indicação, escolher pelo "Quando usar".
3. Devolver as conclusões para a seção da spec ou para a tarefa que a fase está
   escrevendo, nunca em arquivo paralelo. Se faltar informação, registrar como
   dúvida aberta da spec.
4. Nunca mudar o estado da spec nem marcar gates: isso é de
   `specsfy-03-specify`, `specsfy-04-validate`, `specsfy-05-tasks` e
   `specsfy-06-implement`.
5. Registrar na spec o estado esperado do host (usuário `deploy`, APT, systemd,
   nftables, Docker Engine) e o comando que comprova cada item; no modo report,
   o achado entra na seção da spec, não em relatório paralelo.

## Fluxo

1. Apresentar o plano, informar o progresso por etapa e encerrar com arquivos
   alterados, validações e pendências. Confirmar raiz do projeto consumidor,
   ambiente, hosts, grupos, `--limit` e método de conexão antes de qualquer
   execução remota; nunca inventar host, stack ou versão.
2. Registrar cada máquina em `ansible/inventory.yml` com alias, endereço, porta
   SSH, usuário inicial e papel no Swarm. Uma inclusão preserva os hosts atuais
   e testa a conexão nova antes de configurá-la.
3. Ler o estado real antes de propor mudança: `/etc/os-release`, arquitetura,
   kernel, init, filesystem, capacidade, função do host, uptime, carga, memória,
   discos, mounts, rede, unidades com falha e pacotes pendentes.
4. Separar leitura de escrita. No modo report nenhuma task altera estado; nos
   modos debian e ansible, confirmar janela de manutenção, acesso de recuperação
   e escopo de hosts antes de tocar em produção.
5. Em release ou deploy completo, atuar sob `$specsfy-specialist-delivery` e
   usar o `SEMVER`, a imagem e os manifests que ele preparou.
6. Executar o modo escolhido e comprovar o resultado com a seção Validação.

### Modo debian

1. Identificar função do host, serviços expostos, janela de manutenção, acesso
   de recuperação e estado já gerenciado por Ansible. Não executar reboot,
   upgrade de distribuição, alteração de SSH ou firewall remoto sem acesso
   alternativo e autorização específica.
2. Criar o usuário operacional `deploy`, adicionar suas chaves públicas SSH e
   definir sudo e permissões sem retirar o acesso atual antes de testar uma
   segunda sessão.
3. Configurar APT e atualizações de segurança, planejando reinício de serviço e
   reboot quando kernel ou bibliotecas exigirem.
4. Aplicar firewall compatível com a topologia. Em Swarm, incluir tráfego de
   controle, descoberta e overlay somente entre nodes autorizados.
5. Persistir ajustes de kernel em `/etc/sysctl.d/`, aplicar de forma condicional
   e medir o comportamento do workload depois da mudança.
6. Validar systemd, journald, espaço, inodes, relógio, DNS, conectividade e
   reinicialização controlada em ambiente apropriado.

### Modo ansible

1. Confirmar hosts, grupos, ambiente-alvo, método de conexão e escopo exato
   antes de qualquer execução com efeito. Usar `./deploy check-hosts` para a
   tabela e o módulo `ping`, e `./deploy sync-keys` para adicionar somente
   chaves públicas ao usuário `deploy`, preservando o `authorized_keys`.
2. Inspecionar a precedência de variáveis aplicável e as versões fixadas de
   collections e `ansible-core`.
3. Modelar o estado desejado com módulos idempotentes e roles coesas, uma
   responsabilidade por role.
4. Proteger secrets com Ansible Vault ou cofre externo; nunca em texto plano no
   repositório.
5. Para execução pelo agente, usar `./deploy run --non-interactive` sob a
   orquestradora de entrega e respeitar arquivo, script, Vault IDs e
   configuração nativa já fornecidos. Sem fonte externa, orientar
   `./deploy configure-vault` no terminal humano. Não pedir, ler ou imprimir a
   senha na conversa; `./deploy run` permanece o caminho manual com entrada
   oculta.
6. Validar sintaxe, `ansible-lint`, check mode e diff sem revelar segredo,
   testar a role em ambiente descartável e repetir a execução.
7. Aplicar em produção com `serial`, `--limit` e regra de parada
   (`max_fail_percentage`/`any_errors_fatal`) compatíveis com o alcance.

### Modo report

1. Confirmar raiz, ambiente, hosts, `--limit` e conexão; recusar `all` implícito
   como default silencioso e usar `./deploy check-hosts` com `ping` antes da
   primeira coleta.
2. Inspecionar `ansible/inventory.yml`, `ansible.cfg`, `stack.yaml` e o runtime
   real (Docker standalone, Swarm ou ambos). Registrar managers, workers, stacks
   e serviços esperados.
3. Executar coleta somente leitura via Ansible, sem task com escrita, reboot ou
   restart. Cobrir containers em execução, containers parados com erro,
   `docker service ls/ps`, `docker stats --no-stream`, `docker images`, `df -h`,
   `df -i`, `systemctl --failed` e `docker system df`, com logs limitados por
   `--tail` e `--since` declarados.
4. Gerar um relatório Markdown por host e data em
   `server-reports/<AAAA-MM-DD>/<host>.md` e um `README.md` como índice da data,
   seguindo [references/report-template.md](references/report-template.md).
   Nunca escrever fora da raiz confirmada nem sobrescrever relatório publicado
   sem preservar o anterior.
5. Redigir cada achado com comando executado, saída resumida, severidade (`ok`,
   `atenção`, `crítico`) e próximo passo. Não declarar causa raiz sem registro no
   log; apontar o trecho que sustenta o estado.
6. Mascarar segredos, tokens e variáveis sensíveis, aplicar `no_log: true` nas
   tasks que tocam secret e revisar o diff do relatório antes de versionar.

## Padrões

No modo debian:

- Usar repositórios correspondentes à release instalada e verificar a origem de
  pacotes externos; não misturar suites Debian para obter versão nova.
- Manter serviços em unidades systemd ou pacotes oficiais, com restart,
  dependências, limites e logs definidos; não sustentar processo por sessão SSH.
- Preferir nftables para a política do host. Em Swarm no Engine 29, manter
  iptables como backend do Docker. Salvar a configuração do host para o boot e
  testar outra sessão administrativa antes de fechar as conexões existentes.
- Criar arquivos pequenos e nomeados em `/etc/sysctl.d/`, registrar a finalidade
  de cada parâmetro e evitar bloco genérico sem owner.
- Configurar rotação e retenção de logs conforme o disco disponível, alertar
  para uso de filesystem e inodes antes que o Docker pare de criar camadas e
  tratar o socket Docker e o grupo `docker` como acesso administrativo amplo ao
  host. (regra da casa)

No modo ansible:

- Criar um preflight separado para conferir versão do controlador, sistema do
  alvo, acesso ao Docker, papel de manager, login no registry, collections,
  imagem imutável e Docker Secrets antes do play com escrita.
- Com Cloudflare Tunnel, criar `cloudflare_tunnel_token` a partir de
  `vault_cloudflare_tunnel_token` com `no_log: true`; a stack recebe somente o
  nome do Docker Secret.
- Copiar manifests versionados para um diretório estável no host, validar cada
  um com `docker stack config` e publicar as stacks em ordem de dependência,
  consultando réplicas até a convergência ou encerrando após tentativas
  limitadas.
- Tratar check mode com honestidade: inspeção pode usar `check_mode: false`;
  task que altera estado é pulada ou suporta simulação, e o preflight continua
  útil sem implantar stack.
- Usar FQCN e módulos declarativos, nomes acionáveis em tasks e handlers e
  `notify` somente quando a task realmente mudar estado.
- Separar `defaults/main.yml`, `vars/main.yml` e secrets em arquivos distintos;
  fixar collections no manifesto Galaxy e validar a compatibilidade com o
  `ansible-core` instalado.
- Usar `changed_when`/`failed_when` apenas para a semântica real do comando,
  nunca para silenciar falha genuína ou fingir idempotência.
- Restringir `become` à task que precisa, usar `no_log: true` em qualquer task
  com segredo e declarar `serial`/`throttle` quando houver efeito colateral
  entre hosts.

No modo report:

- Coleta é somente leitura: nenhuma task usa `state: present`, `docker_stack`,
  `apt`, `reboot`, `systemd: restarted` ou `shell` com efeito colateral.
  Divergência encontrada vira achado, não correção automática.
- Todo relatório informa inventory, `--limit`, data, fuso, `SEMVER` quando
  aplicável, versão do Docker Engine e papel do host no Swarm. Sem essa
  procedência, o relatório não é comparável entre execuções.
- Limitar volume na origem: `--tail 200` para serviço, `--tail 100` para
  container e `--since 24h`, ampliando só com pedido explícito e janela
  registrada. Nunca despejar log completo sem paginação.
- Manter seções fixas (resumo executivo, containers em execução, containers
  parados com erro, serviços Swarm, imagens, volumes e redes, disco e inodes,
  systemd com falha e pendências); seção ausente recebe motivo registrado, como
  "não aplicável em host sem Swarm".
- Tratar container parado com `docker ps -a --filter status=exited`, código de
  saída e trecho final do log. Código `137` é compatível com `SIGKILL`.
  Para investigar OOM, conferir `.State.OOMKilled`, eventos do kernel e limites.
- Listar imagens com repositório, tag, digest, tamanho e data, marcando
  `dangling` e candidatas a `prune` sem executar limpeza no mesmo play.
- Medir disco com `df -h`, `df -i` e `docker system df`: alerta acima de 80%,
  crítico acima de 90% ou inodes acima de 85%. (regra da casa)
- Versionar relatórios quando o projeto versiona `server-reports/`, nunca
  commitando segredo, token de join ou conteúdo de Vault; na dúvida, manter fora
  do commit e registrar o motivo no índice.

## Antipadrões

- Executar `apt full-upgrade` e reboot sem conferir serviços, console de
  recuperação e retorno automático da aplicação.
- Alterar `sshd_config` e reiniciar SSH antes de validar a configuração e abrir
  uma segunda sessão autenticada.
- Liberar portas de banco, Redis ou painel no host quando os consumidores estão
  na mesma rede privada ou overlay.
- Aplicar `sysctl -w` sem arquivo em `/etc/sysctl.d/`, mantendo dado persistente
  de container em disco local sem placement, backup e restore testados.
- `shell`/`command` sem `creates`, `removes` ou `changed_when`: a task relata
  `changed` sempre e mascara a falta de idempotência.
- Handler notificado incondicionalmente, reiniciando serviço a cada execução
  mesmo quando nada mudou.
- Variável de ambiente resolvida por `group_vars` genérico sem revisar a
  precedência real, sobrescrita silenciosamente por um `-e` ou `host_vars`.
- Vault decriptado e commitado por engano, ou segredo interpolado em `debug`/log
  sem `no_log`.
- Coletar com `become: true` irrestrito ou acesso ao socket Docker sem
  necessidade: isso equivale a root no host.
- Rodar `shell: docker logs $(docker ps -aq)` sem filtro, juntando serviços
  saudáveis ao ruído e enterrando o container com erro.
- Declarar servidor saudável só porque `docker ps` lista containers `Up`, sem
  `docker service ps --no-trunc`, exit codes, `systemctl --failed` e espaço.
- Executar `docker system prune -af` junto da coleta e transformar diagnóstico
  em mudança destrutiva sem autorização.
- Sobrescrever o relatório do dia ou usar horário local ambíguo, impedindo
  comparar evoluções.

## Validação

- `systemd-analyze verify` em unidades próprias e `systemctl --failed` após a
  alteração; `sshd -t` antes de recarregar SSH e nova sessão autenticada antes de
  encerrar a conexão que aplicou a mudança.
- `nft --check --file /etc/nftables.conf` antes do reload e teste de portas a
  partir das redes que devem e das que não devem alcançar o host.
- `sysctl --system` seguido da leitura dos parâmetros e novo teste após reboot;
  `apt-get --simulate upgrade`, inspeção de `needrestart` e confirmação dos
  timers de atualização.
- Em host Docker, conferir daemon, rotação de logs, espaço, inodes, redes e
  persistência antes e depois da manutenção.
- `ansible-playbook --syntax-check`, `ansible-lint` e execução em `--check
  --diff` antes de qualquer aplicação real, confirmando que o diff não expõe
  segredo.
- Duas execuções consecutivas no mesmo alvo: a segunda não relata nenhuma task
  como `changed`. Essa é a prova operacional de idempotência, não a leitura do
  código. (regra da casa)
- Testar handlers (o serviço reinicia quando deveria), templates por ambiente e
  falha parcial com `any_errors_fatal` ou `max_fail_percentage`.
- Confirmar inventory e `--limit` usados antes de qualquer mutação remota; nunca
  aceitar "rodar em todos os hosts" como default silencioso.
- No modo report, nenhuma task relata `changed` em modo leitura, duas execuções
  produzem o mesmo conjunto de seções e arquivos e cada arquivo segue o modelo,
  cita comandos e não contém token, senha ou Vault em texto plano (`grep -R` por
  padrões sensíveis antes de versionar).
- Reproduzir manualmente um trecho crítico (`docker logs --tail 50 <container>`
  ou `df -h`) no host e comparar com o valor registrado.
- Não declarar servidor diagnosticado, idempotente ou saudável sem as
  comprovações acima; leitura do playbook não substitui a execução real contra
  ambiente descartável.

## Skills relacionadas

- `$specsfy-specialist-delivery` coordena release, deploy, `SEMVER` e Vault;
  este especialista prepara o host e a automação que a entrega consome.
- `$specsfy-specialist-docker` governa imagem, Compose e Swarm; este
  especialista cuida do daemon, kernel, disco e serviço Docker do host.
- `$specsfy-specialist-observability` transforma achados recorrentes do
  relatório em SLO, alerta e dashboard.
- `$specsfy-specialist-debugging` investiga a causa raiz de um erro apontado no
  relatório; este especialista para no achado comprovado.
- `$specsfy-specialist-application-security` revisa a gestão de segredos do
  vault, o acesso SSH e a exposição de portas que este especialista configura.
- `$specsfy-specialist-cloudflare` e `$specsfy-specialist-n8n` publicam o que
  este especialista expõe; a borda e o webhook continuam com eles.

Leia [references/standards.md](references/standards.md) para os padrões comuns,
o índice dos modos e as fontes oficiais, [references/debian.md](references/debian.md)
para baseline e operação do Docker, [references/ansible.md](references/ansible.md)
para roles, precedência e comandos e
[references/report.md](references/report.md) com
[references/report-template.md](references/report-template.md) para o mínimo, os
thresholds e o modelo do relatório.
