---
name: specsfy-specialist-debian-server
description: Administrar servidores Debian para aplicações e clusters com APT, systemd, SSH, nftables, sysctl, storage, usuários, atualizações e Docker Engine. Use para preparar, revisar ou diagnosticar o host; use Ansible para automatizar o estado e Docker Swarm para serviços do cluster.
---

# Debian Server

## Quando usar

- Acionar para instalação, hardening, atualização ou diagnóstico de um host
  Debian usado por aplicações, containers ou Docker Swarm.
- Acionar para APT, systemd, journald, SSH, nftables, sysctl, discos, mounts,
  usuários, grupos, timezone, NTP e Docker Engine no host.
- Não assumir uma versão Debian. Ler `/etc/os-release`, arquitetura, kernel,
  init, filesystem, capacidade e função do servidor antes de propor mudanças.
- Não executar reboot, upgrade de distribuição, alteração de SSH ou firewall
  remoto sem acesso alternativo e autorização específica.

## Fluxo

1. Registrar versão, arquitetura, kernel, uptime, carga, memória, discos,
   mounts, rede, unidades com falha e pacotes pendentes.
2. Identificar o papel do host, serviços expostos, janela de manutenção,
   acesso de recuperação e estado gerenciado por Ansible.
3. Definir usuários administrativos, chaves SSH, sudo e permissões sem
   retirar o acesso atual antes de testar uma segunda sessão.
4. Configurar APT e atualizações de segurança, planejando reinícios de serviço
   e reboot quando kernel ou bibliotecas exigirem.
5. Aplicar firewall compatível com a topologia. Em Swarm, incluir tráfego de
   controle, descoberta e overlay somente entre nodes autorizados.
6. Persistir ajustes de kernel em `/etc/sysctl.d/`, aplicar de forma
   condicional e medir o comportamento do workload depois da mudança.
7. Validar systemd, journald, espaço, inodes, relógio, DNS, conectividade e
   reinicialização controlada em ambiente apropriado.

## Padrões

- Usar repositórios correspondentes à release instalada e verificar a origem
  de pacotes externos. Não misturar suites Debian para obter uma versão nova.
- Manter serviços em unidades systemd ou pacotes oficiais, com restart,
  dependências, limites e logs definidos. Não sustentar processo por sessão SSH.
- Preferir nftables no Debian atual e salvar a configuração carregada no boot.
  Testar uma nova sessão administrativa antes de fechar conexões existentes.
- Criar arquivos pequenos e nomeados em `/etc/sysctl.d/`; registrar a finalidade
  de cada parâmetro e evitar um bloco genérico sem owner.
- Configurar rotação e retenção de logs conforme disco disponível. Alertar para
  uso de filesystem e inodes antes que o Docker pare de criar camadas.
- Tratar acesso ao socket Docker e ao grupo `docker` como acesso administrativo
  amplo ao host.

## Antipadrões

- Executar `apt full-upgrade` e reboot sem conferir serviços, console de
  recuperação e retorno automático da aplicação.
- Alterar `sshd_config` e reiniciar SSH antes de validar a configuração e abrir
  uma segunda sessão autenticada.
- Liberar portas de banco, Redis ou painel no host quando os consumidores estão
  na mesma rede privada ou overlay.
- Aplicar `sysctl -w` sem arquivo em `/etc/sysctl.d/`: o ajuste desaparece no
  reboot e o estado observado deixa de corresponder à automação.
- Manter dados persistentes de containers em disco local sem placement, backup
  e restore testados.

## Validação

- `systemd-analyze verify` para unidades próprias e `systemctl --failed` após a
  alteração.
- `sshd -t` antes de recarregar SSH; nova sessão autenticada antes de encerrar a
  conexão que aplicou a mudança.
- `nft --check --file /etc/nftables.conf` antes do reload e teste de portas a
  partir das redes que devem ou não alcançar o host.
- `sysctl --system` seguido da leitura dos parâmetros e novo teste após reboot.
- `apt-get --simulate upgrade`, inspeção de `needrestart` quando disponível e
  confirmação de timers usados por atualizações automáticas.
- Para host Docker, conferir daemon, rotação de logs, espaço, inodes, redes e
  persistência antes e depois da manutenção.

## Skills relacionadas

- `$specsfy-specialist-ansible` automatiza e repete a configuração do host;
  este especialista define o estado Debian que a automação deve produzir.
- `$specsfy-specialist-docker` governa imagem e runtime do container; este
  especialista cuida do daemon, kernel, disco e serviço Docker do host.
- `$specsfy-specialist-docker-swarm` governa managers, workers, stacks e redes
  overlay depois que os nodes estão preparados.

Leia [references/standards.md](references/standards.md) para baseline Debian,
operação do Docker e comandos de inspeção com fontes oficiais.
