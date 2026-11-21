# Padrões comuns e referências de servidor

Revisado em 2026-11-20 contra: Debian 13.7 (trixie), Docker Engine 29.10.0, Ansible 14 (ansible-core 2.21) e community.docker 5.4.0.

Reúne as regras que valem para os três modos (debian, ansible e report) e
serve de índice para a referência de cada um.

## Índice dos modos

| Modo | Abre | Conteúdo |
| --- | --- | --- |
| debian | [debian.md](debian.md) | baseline, APT, systemd, journald, sysctl, firewall e Docker Engine |
| ansible | [ansible.md](ansible.md) | estrutura de roles, precedência de variáveis, idempotência, Vault e comandos |
| report | [report.md](report.md) e [report-template.md](report-template.md) | mínimo do relatório, coleta por runtime, thresholds e modelo Markdown |

## Procedência e escopo

- Confirmar raiz do projeto consumidor, ambiente, hosts, grupos, `--limit` e
  método de conexão antes da primeira execução remota. `all` implícito não é
  default aceitável.
- `ansible/inventory.yml`, `ansible.cfg`, `stack.yaml` e `SEMVER` são as fontes
  do que existe. Nunca inventar host, stack, serviço ou versão.
- Registrar em cada artefato o inventory, o `--limit`, a data, o fuso, a versão
  do Docker Engine e o papel do host no Swarm.

## Leitura antes de escrita

- O modo report nunca altera estado: divergência vira achado, com comando e
  saída que sustentam o diagnóstico.
- Nos modos debian e ansible, medir o estado atual antes de propor mudança e
  medir de novo depois, no mesmo host e com o mesmo escopo.
- Reboot, upgrade de distribuição, alteração de SSH e firewall remoto exigem
  acesso alternativo validado e autorização específica.

## Segredos

- Senha do Vault pertence ao terminal humano. O agente usa
  `./deploy run --non-interactive` com fonte já configurada e nunca pede, lê ou
  imprime a senha na conversa.
- `no_log: true` em qualquer task que toque segredo, token, variável de
  ambiente sensível ou conteúdo de Vault.
- Mascarar o que for salvo e revisar o diff antes de versionar; na dúvida, manter
  o arquivo fora do commit e registrar o motivo.

## Idempotência e privilégio

- A prova de idempotência é operacional: duas execuções consecutivas no mesmo
  alvo, com a segunda sem `changed`. Leitura do playbook não substitui a
  execução. (regra da casa)
- Acesso ao socket Docker e ao grupo `docker` equivale a acesso administrativo
  amplo ao host.
- Restringir `become` à task que precisa e declarar `serial`/`throttle` quando a
  mudança tiver efeito colateral entre hosts.

## Fontes oficiais

- [Manual de administração Debian](https://www.debian.org/doc/manuals/debian-handbook/)
- [Manual de proteção Debian (repositório oficial)](https://salsa.debian.org/ddp-team/securing-debian-manual)
- [Documentação geral do Ansible](https://docs.ansible.com/ansible/latest/)
- [Precedência de variáveis](https://docs.ansible.com/ansible/latest/reference_appendices/general_precedence.html)
- [Ansible Vault](https://docs.ansible.com/ansible/latest/vault_guide/)
- [ansible-lint](https://ansible.readthedocs.io/projects/lint/)
- [community.docker](https://galaxy.ansible.com/ui/repo/published/community/docker/)
- [Docker Engine no Debian](https://docs.docker.com/engine/install/debian/)
- [Debian 13 estável](https://www.debian.org/releases/stable/)
- [Debian 12 e LTS](https://www.debian.org/releases/bookworm/)
- [APT sources.list e Signed-By](https://manpages.debian.org/trixie/apt/sources.list.5.en.html)
- [Docker Engine 29](https://docs.docker.com/engine/release-notes/29/)
- [Backend nftables do Docker e limitação em Swarm](https://docs.docker.com/engine/network/firewall-nftables/)
- [Escopo de docker node inspect](https://docs.docker.com/reference/cli/docker/node/inspect/)
- [Inspeção local com docker info](https://docs.docker.com/reference/cli/docker/system/info/)
- [Status de saída do docker run](https://docs.docker.com/reference/cli/docker/container/run/#exit-status)
- [Inspeção de containers](https://docs.docker.com/reference/cli/docker/container/inspect/)
- [Manutenção e compatibilidade Python do Ansible](https://docs.ansible.com/projects/ansible/latest/reference_appendices/release_and_maintenance.html)
- [Listagem de precedência de variáveis](https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_variables.html#understanding-variable-precedence)
- [Instalação do ansible-core](https://docs.ansible.com/projects/ansible/latest/installation_guide/intro_installation.html)
- [Instalação de collections pelo Galaxy](https://docs.ansible.com/projects/ansible/latest/collections_guide/collections_installing.html)
- [Tratamento de falhas](https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_error_handling.html)
- [Capabilities e requisitos de docker_stack](https://docs.ansible.com/projects/ansible/latest/collections/community/docker/docker_stack_module.html)
