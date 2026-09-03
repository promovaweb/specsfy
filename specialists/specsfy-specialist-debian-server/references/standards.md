# Padrões e referências para Debian Server

## Baseline antes da mudança

Colete fatos sem escrever no host:

```bash
cat /etc/os-release
uname -a
systemctl --failed
findmnt
df -h
df -i
ss -lntup
timedatectl status
apt list --upgradable
```

Compare a saída com o papel do servidor. Um node de Swarm precisa ainda de
estado do daemon, função no cluster, labels, disponibilidade, uso de
`/var/lib/docker` e conectividade privada entre os nodes.

## APT e atualizações

- Manter entradas de repositório compatíveis com a release indicada em
  `/etc/os-release` e chaves em keyrings próprios.
- Simular upgrades, ler pacotes retidos e identificar serviços ou reboot
  necessários antes da janela de manutenção.
- Confirmar os timers `apt-daily.timer` e `apt-daily-upgrade.timer` quando o
  servidor usa `unattended-upgrades`. A automação precisa registrar falhas e
  não pode reiniciar serviços críticos em horário indefinido.

## systemd, logs e filesystem

Valide unidades próprias com `systemd-analyze verify`. Use drop-ins em
`/etc/systemd/system/<unidade>.d/` para ajustes locais, seguidos por
`systemctl daemon-reload`. Defina limites e restart conforme o processo real;
um loop de restart não corrige configuração inválida.

Dimensione retenção de journald e rotação do Docker para o disco disponível.
Monitore bytes e inodes. Dados de containers que precisam sobreviver a
reagendamento exigem storage compartilhado ou placement estável com backup e
restore ensaiados.

## Kernel e rede para Docker Swarm

Persistir parâmetros em arquivos nomeados sob `/etc/sysctl.d/`. Ler o valor
atual, escrever o arquivo e aplicar apenas quando houver diferença. Parâmetros
de Redis, forwarding ou bridge precisam vir da necessidade do workload, não de
uma lista genérica de tuning.

O firewall deve limitar SSH à rede administrativa e tráfego do Swarm aos nodes
do cluster. Controle, descoberta e VXLAN não devem ficar abertos para a
internet. Serviços internos podem usar overlay criptografada sem publicar
portas no host.

## Fontes oficiais

- [Manual de administração Debian](https://www.debian.org/doc/manuals/debian-handbook/)
- [Manual de proteção Debian](https://www.debian.org/doc/manuals/securing-debian-manual/)
- [Referência `sysctl.d`](https://manpages.debian.org/bookworm/systemd/sysctl.d.5.en.html)
- [Atualizações periódicas](https://wiki.debian.org/PeriodicUpdates)
- [nftables no Debian](https://wiki.debian.org/nftables)
- [Docker Engine no Debian](https://docs.docker.com/engine/install/debian/)
- [Portas do Docker Swarm](https://docs.docker.com/engine/swarm/swarm-tutorial/#open-protocols-and-ports-between-the-hosts)
- [Hardening de unidades systemd](https://www.freedesktop.org/software/systemd/man/latest/systemd-analyze.html)
