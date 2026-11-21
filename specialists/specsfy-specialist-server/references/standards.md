# Padrões comuns e referências de servidor

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
  execução.
- Acesso ao socket Docker e ao grupo `docker` equivale a acesso administrativo
  amplo ao host.
- Restringir `become` à task que precisa e declarar `serial`/`throttle` quando a
  mudança tiver efeito colateral entre hosts.

## Fontes oficiais

- [Manual de administração Debian](https://www.debian.org/doc/manuals/debian-handbook/)
- [Manual de proteção Debian](https://www.debian.org/doc/manuals/securing-debian-manual/)
- [Documentação geral do Ansible](https://docs.ansible.com/ansible/latest/)
- [Precedência de variáveis](https://docs.ansible.com/ansible/latest/reference_appendices/general_precedence.html)
- [Ansible Vault](https://docs.ansible.com/ansible/latest/vault_guide/)
- [ansible-lint](https://ansible.readthedocs.io/projects/lint/)
- [community.docker](https://galaxy.ansible.com/ui/repo/published/community/docker/)
- [Docker Engine no Debian](https://docs.docker.com/engine/install/debian/)
