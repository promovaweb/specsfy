# Servidores

O especialista Server orienta o agente no estado dos servidores Debian, na
automação que repete esse estado e no diagnóstico somente leitura de cada
máquina. Ele trabalha em três modos: **Debian**, para instalar, proteger,
atualizar e diagnosticar o host; **Ansible**, para playbooks, roles e Vault com
idempotência comprovada; e **Relatório**, para gerar um retrato do servidor em
`server-reports/` sem alterar nada.

## Quando usar

- Você vai instalar, proteger, atualizar ou diagnosticar um host Debian.
- A tarefa envolve APT, systemd, journald, SSH, nftables ou sysctl.
- A tarefa altera discos, mounts, usuários, grupos, relógio ou o Docker Engine
  do host.
- O projeto tem playbooks, roles, `inventory`, `ansible.cfg`,
  `requirements.yml` ou `galaxy.yml`.
- Você quer confirmar que uma automação existente é idempotente antes de
  executá-la em um ambiente compartilhado.
- Você quer um relatório, diagnóstico ou auditoria de servidores listados em
  `ansible/inventory.yml`.
- Você precisa investigar containers parados com erro, um serviço Swarm
  degradado ou um disco cheio antes de escolher entre rollback, limpeza ou
  escala.

O agente não assume uma versão do Debian. Antes de propor mudanças, ele lê o
`/etc/os-release` e confere a arquitetura e o kernel, além do filesystem e da
função do servidor. Reboot, upgrade de distribuição e alterações de SSH ou
firewall remoto exigem um acesso alternativo e a sua autorização específica.

## Como ele trabalha

1. Confirma raiz do projeto, ambiente, hosts, grupos, `--limit` e conexão antes
   de qualquer execução remota.
2. Registra cada máquina em `ansible/inventory.yml` com alias, endereço, porta
   SSH, usuário e papel no Swarm. Um servidor novo entra sem apagar as entradas
   atuais e é testado antes da configuração.
3. Lê o estado real: versão, kernel, carga, memória, discos, mounts, rede,
   unidades com falha e pacotes pendentes.
4. Identifica o papel do host, os serviços expostos, a janela de manutenção, o
   acesso de recuperação e o que já é gerenciado por Ansible.
5. Em um release ou deploy completo, atua sob o especialista
   [Delivery](delivery.md), que prepara a versão e coordena a entrega.
6. Executa o modo escolhido e comprova o resultado antes de encerrar.

## Debian

O modo Debian define o alvo que a automação deve produzir.

1. Cria o usuário operacional `deploy` com chaves públicas SSH, sudo e
   permissões. O acesso atual continua ativo até uma segunda sessão funcionar.
2. Configura o APT e as atualizações de segurança, com reinícios e reboot
   planejados quando o kernel ou as bibliotecas exigirem.
3. Aplica um firewall compatível com a topologia. Em Swarm, o tráfego de
   controle, descoberta e overlay fica restrito aos nodes autorizados.
4. Grava os ajustes de kernel em `/etc/sysctl.d/`, de forma condicional, e mede
   o comportamento da carga depois da mudança.
5. Valida systemd, journald, espaço em disco, inodes, relógio, DNS e
   reinicialização controlada.

Padrões do modo Debian:

- Os repositórios correspondem à release instalada, sem misturar suites do
  Debian.
- Serviços rodam em unidades systemd ou pacotes oficiais, com restart, limites
  e logs definidos.
- O firewall usa nftables no host e mantém o backend iptables do Docker em
  Swarm no Engine 29. A configuração do host carrega no boot e é testada em uma
  nova sessão administrativa.
- Cada parâmetro de kernel fica em um arquivo pequeno e nomeado, com a
  finalidade registrada.
- A rotação de logs considera o disco disponível, com alerta de espaço e de
  inodes.
- O acesso ao socket Docker e ao grupo `docker` é tratado como acesso
  administrativo ao host.

## Ansible

O modo Ansible automatiza a preparação e prova que a segunda execução não muda
nada.

1. Confirma hosts, grupos, ambiente-alvo e método de conexão antes de qualquer
   execução com efeito.
2. Usa `./deploy check-hosts` para listar os hosts em tabela e testar o módulo
   `ping`. Com `./deploy sync-keys`, adiciona chaves públicas ao usuário
   `deploy` e preserva as entradas atuais do `authorized_keys`.
3. Confere a precedência de variáveis e as versões fixadas das collections e do
   `ansible-core`.
4. Descreve o estado desejado com módulos idempotentes e roles coesas, cada uma
   com uma responsabilidade.
5. Guarda segredos no Ansible Vault ou em um cofre externo. O texto plano no
   repositório fica fora do fluxo.
6. Valida sintaxe, `ansible-lint` e check mode, testa a role em um ambiente
   descartável e repete a execução.
7. Aplica em produção com `serial`, `--limit` e uma condição de parada
   compatível com o alcance da mudança.

A senha do Vault não passa pela conversa. Sem um arquivo ou script de senha já
configurado, o agente orienta você a rodar `./deploy configure-vault` no seu
terminal. O comando `./deploy run` continua manual, com entrada oculta.

Padrões do modo Ansible:

- Um preflight separado confere controlador, sistema do alvo, Docker, papel de
  manager, login no registry, imagem imutável e Docker Secrets.
- Com Cloudflare Tunnel, o token vem de `vault_cloudflare_tunnel_token` com
  `no_log: true`, enquanto a stack recebe somente o nome do Docker Secret.
- Os manifests são validados com `docker stack config`, publicados em ordem de
  dependência e acompanhados até a convergência das réplicas.
- Os módulos usam o nome completo (`ansible.builtin.copy`). O agente prefere um
  módulo declarativo a `shell` ou `command`.
- Os handlers disparam somente quando a task altera o estado.
- `defaults/main.yml`, `vars/main.yml` e os segredos ficam em arquivos
  separados.
- O `become` fica restrito à task que exige privilégio. Toda task com segredo
  usa `no_log: true`.

## Relatório

O modo Relatório gera diagnósticos somente leitura de hosts com Docker Engine.
A coleta usa Ansible e produz um relatório Markdown por host em
`server-reports/`, com o estado dos containers e dos serviços Swarm, além do uso
de disco.

1. Confirma a raiz do projeto, o ambiente, os hosts, o `--limit` e o método de
   conexão. Testa os hosts com `./deploy check-hosts` e recusa `all` como padrão
   implícito.
2. Inspeciona `ansible/inventory.yml`, `ansible.cfg`, `stack.yaml` e o runtime
   (Docker standalone, Swarm ou ambos).
3. Executa a coleta somente leitura, sem tasks de escrita, reboot ou restart. Os
   logs têm `--tail` e `--since` declarados.
4. Gera `server-reports/<AAAA-MM-DD>/<host>.md` para cada host e um `README.md`
   como índice da data.
5. Escreve cada achado com o comando executado, a saída resumida, a severidade
   (`ok`, `atenção` ou `crítico`) e o próximo passo sugerido.
6. Mascara segredos, tokens e variáveis sensíveis e usa `no_log: true` nas tasks
   que leem secrets.

A coleta mínima reúne estes comandos:

```bash
docker ps
docker ps -a --filter status=exited
docker service ls
docker service ps <serviço>
docker stats --no-stream
docker images
docker system df
df -h
df -i
systemctl --failed
```

O relatório tem seções fixas: resumo executivo, containers em execução e
containers parados com erro, serviços Swarm, imagens, volumes e redes, disco e
inodes, unidades systemd com falha e pendências. Uma seção ausente traz o
motivo, como "não aplicável em host sem Swarm".

Padrões do modo Relatório:

- A coleta não altera estado. Qualquer divergência vira achado em vez de
  correção automática.
- Cada relatório informa inventory, `--limit`, data, fuso, `SEMVER`, versão do
  Docker Engine e papel do host no Swarm.
- Os logs usam `--tail 200` para serviços, `--tail 100` para containers e
  `--since 24h`, salvo quando você solicita outra janela.
- Containers parados com erro recebem o código de saída e o final do log. O
  código `137` é compatível com `SIGKILL`. Para investigar falta de memória,
  a coleta confere `OOMKilled` e os eventos do kernel.
- As imagens aparecem com repositório, tag, digest, tamanho e data. As
  candidatas a `prune` são marcadas sem limpeza.
- O disco gera alerta acima de 80% e fica crítico acima de 90% ou com inodes
  acima de 85%.
- Relatórios com segredos, tokens de join ou conteúdo do Vault ficam fora do
  Git, mesmo mascarados.

## Erros que ele evita

- `apt full-upgrade` seguido de reboot sem conferir serviços, console de
  recuperação e retorno da aplicação.
- Reiniciar o SSH sem validar o `sshd_config` e sem abrir uma segunda sessão.
- Expor portas de banco, Redis ou painel quando os consumidores estão na mesma
  rede privada.
- `sysctl -w` sem arquivo em `/etc/sysctl.d/`, com o ajuste perdido no reboot.
- Volumes de containers em disco local sem placement, backup e restore testados.
- `shell` ou `command` sem `creates`, `removes` ou `changed_when`, que relatam
  mudança em toda execução e escondem a falta de idempotência.
- Handler que reinicia um serviço mesmo quando nada mudou.
- Variável de ambiente sobrescrita por um `-e` ou por um `host_vars` mais
  específico sem revisão da precedência.
- Vault decriptado no Git ou segredo exibido em `debug:` sem `no_log`.
- Coletar com `become: true` irrestrito ou com acesso desnecessário ao socket
  Docker, que equivale a root no host.
- Juntar os logs de todos os containers sem filtro nem limite.
- Declarar o servidor saudável só porque `docker ps` mostra containers `Up`.
- Rodar `docker system prune -af` durante a coleta e apagar os registros do
  erro.
- Sobrescrever o relatório do dia ou usar horário local ambíguo.

## Como conferir o resultado

- `systemd-analyze verify` nas unidades próprias e `systemctl --failed` depois
  da alteração.
- `sshd -t` para recarregar o SSH e uma nova sessão autenticada para encerrar a
  conexão antiga.
- `nft --check --file /etc/nftables.conf` e teste de portas a partir das redes
  que devem e das que não devem alcançar o host.
- `sysctl --system`, leitura dos parâmetros e novo teste depois do reboot.
- `apt-get --simulate upgrade` e `needrestart`, quando disponível.
- Em host Docker, conferência do daemon, da rotação de logs, do espaço, dos
  inodes e das redes na manutenção.
- `ansible-playbook --syntax-check`, `ansible-lint` e check mode antes da
  aplicação, sem segredo na saída.
- Duas execuções seguidas no mesmo alvo, com a segunda sem tasks `changed`.
- Testes de handlers, de templates por ambiente e de falha parcial com
  `any_errors_fatal` ou `max_fail_percentage`.
- Confirmação explícita do inventory e do `--limit` antes de alterar hosts
  remotos.
- Em check mode do relatório, nenhuma task relata `changed`, e duas execuções
  produzem as mesmas seções e arquivos.
- Cada relatório segue o modelo, cita os comandos e não contém token, senha ou
  Vault em texto plano.
- Um trecho importante, como `df -h`, foi reproduzido no host e comparado com o
  relatório.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-server --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Delivery](delivery.md) coordena release, deploy e versão.
- [Docker](docker.md) cuida da imagem, do Compose e do cluster.
- [Observabilidade](observability.md) transforma achados recorrentes em SLOs e
  alertas.
- [Debugging](debugging.md) investiga a causa de um erro apontado no relatório.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-server/SKILL.md),
com os padrões comuns em
[standards.md](../../../specialists/specsfy-specialist-server/references/standards.md),
o baseline Debian em
[debian.md](../../../specialists/specsfy-specialist-server/references/debian.md),
as roles e a idempotência em
[ansible.md](../../../specialists/specsfy-specialist-server/references/ansible.md)
e o modelo do relatório em
[report.md](../../../specialists/specsfy-specialist-server/references/report.md)
e
[report-template.md](../../../specialists/specsfy-specialist-server/references/report-template.md).

## Justificativa de tamanho

Este guia reúne os três especialistas antigos de servidor: Debian, Ansible e
relatório de servidor. O baseline do sistema, as roles idempotentes e o modelo
do relatório formam uma leitura só, porque o relatório descreve o que o
baseline e as roles fizeram na máquina. Separar cada modo em um guia diferente
obrigaria você a pular entre páginas para conferir se as roles do Ansible
respeitam o baseline Debian e se o relatório corresponde ao que foi aplicado.
