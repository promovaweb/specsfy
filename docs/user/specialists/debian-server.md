# Debian Server

O especialista Debian Server orienta o agente na instalação, no hardening, na
atualização e no diagnóstico de hosts Debian que rodam aplicações, Docker ou
Docker Swarm. Ele parte da leitura do servidor e só propõe mudanças com acesso
de recuperação garantido.

## Quando usar

- Você vai instalar, proteger, atualizar ou diagnosticar um host Debian.
- A tarefa envolve APT, systemd, journald, SSH, nftables ou sysctl.
- A tarefa altera discos, mounts, usuários, grupos, relógio ou o Docker Engine
  do host.

O agente não assume uma versão do Debian. Antes de propor mudanças, ele lê o
`/etc/os-release` e confere a arquitetura e o kernel, além do filesystem e da
função do servidor. Reboot, upgrade de distribuição e alterações de SSH ou firewall
remoto exigem um acesso alternativo e a sua autorização específica.

## Como ele trabalha

1. Sob o especialista Deploy, pergunta quais máquinas formam o ambiente e
   registra o endereço, o usuário e o papel no Swarm em `ansible/inventory.yml`.
   Um servidor novo entra sem apagar as entradas atuais e é testado antes da
   configuração.
2. Registra versão, kernel, carga, memória, discos, rede, unidades com falha e
   pacotes pendentes.
3. Identifica o papel do host, os serviços expostos, a janela de manutenção e
   o acesso de recuperação.
4. Cria o usuário `deploy` com chaves públicas SSH, sudo e permissões. O
   acesso atual continua ativo até uma segunda sessão funcionar.
5. Configura o APT e as atualizações de segurança, com reinícios e reboot
   planejados quando o kernel ou as bibliotecas exigirem.
6. Aplica um firewall compatível com a topologia. Em Swarm, o tráfego de
   controle e de overlay fica restrito aos nodes autorizados.
7. Grava os ajustes de kernel em `/etc/sysctl.d/` e mede o comportamento da
   carga depois da mudança.
8. Valida systemd, journald, espaço em disco, inodes, relógio, DNS e
   reinicialização controlada.

## Padrões aplicados

- Os repositórios correspondem à release instalada, sem misturar suites do
  Debian.
- Serviços rodam em unidades systemd ou pacotes oficiais, com restart, limites
  e logs definidos.
- O firewall usa nftables com a configuração carregada no boot, testada em uma
  nova sessão administrativa.
- Cada parâmetro de kernel fica em um arquivo pequeno e nomeado, com a
  finalidade registrada.
- A rotação de logs considera o disco disponível, com alerta de espaço e de
  inodes.
- O acesso ao socket Docker e ao grupo `docker` é tratado como acesso
  administrativo ao host.

## Erros que ele evita

- `apt full-upgrade` seguido de reboot sem conferir serviços, console de
  recuperação e retorno da aplicação.
- Reiniciar o SSH sem validar o `sshd_config` e sem abrir uma segunda sessão.
- Expor portas de banco, Redis ou painel quando os consumidores estão na mesma
  rede privada.
- `sysctl -w` sem arquivo em `/etc/sysctl.d/`, com o ajuste perdido no reboot.
- Volumes de containers em disco local sem placement, backup e restore
  testados.

## Como conferir o resultado

- `systemd-analyze verify` nas unidades próprias e `systemctl --failed` depois
  da alteração.
- `sshd -t` para recarregar o SSH e uma nova sessão autenticada para encerrar
  a conexão antiga.
- `nft --check --file /etc/nftables.conf` e teste de portas a partir das redes
  que devem e das que não devem alcançar o host.
- `sysctl --system`, leitura dos parâmetros e novo teste depois do reboot.
- `apt-get --simulate upgrade` e `needrestart`, quando disponível.
- Em host Docker, conferência do daemon, da rotação de logs, do espaço e das
  redes na manutenção.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-debian-server --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Deploy](deploy.md) coordena a preparação completa do servidor.
- [Ansible](ansible.md) automatiza e repete a configuração do host.
- [Docker](docker.md) cuida da imagem e do runtime dos containers.
- [Docker Swarm](docker-swarm.md) cuida de managers, workers e stacks.
- [Relatório de servidor](server-report.md) coleta logs e uso de disco em
  modo somente leitura.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-debian-server/SKILL.md),
com a configuração base do Debian e os comandos de inspeção no arquivo de
referência da mesma pasta.
