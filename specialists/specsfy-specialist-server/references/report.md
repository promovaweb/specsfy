# Padrões e referências do modo report

## Mínimo do relatório

Todo relatório cobre estas seções ou registra `não aplicável` com motivo.
Ordem fixa para permitir diff entre datas.

| Seção | Comando base | O que registrar |
| --- | --- | --- |
| Procedência | `ansible --version`, `docker version`, `docker info --format` | inventory, `--limit`, data, fuso, `SEMVER`, papel Swarm |
| Containers em execução | `docker ps --format` com nome, imagem, status, portas | uptime, restarts, health |
| Containers parados com erro | `docker ps -a --filter status=exited --filter status=dead` + `docker inspect --format {{.State.ExitCode}}` | exit code, horário de saída, trecho de log |
| Logs com erro | `docker logs --tail 200 --timestamps --since 24h <container>` | últimas linhas com erro, sem despejo integral |
| Serviços Swarm | `docker service ls`, `docker service ps <serviço> --no-trunc` | réplicas `Running/Desired`, `converged` ou divergência |
| Stats | `docker stats --no-stream --format` | CPU, memória, rede por container no instante da coleta |
| Imagens | `docker images --format` + `docker system df -v` | repositório, tag, digest, tamanho, `dangling` |
| Disco e inodes | `df -h`, `df -i`, `docker system df` | uso por filesystem, alerta 80%, crítico 90% |
| Systemd | `systemctl --failed`, `systemd-analyze verify` quando há unidade própria | unidades com falha e desde quando |
| Pendências | curadoria do agente | próximo passo por achado crítico |

## Coleta por runtime

- Host Docker standalone: `docker ps`, `docker ps -a`, `docker logs`,
  `docker stats --no-stream`, `docker images`, `docker network ls`,
  `docker volume ls`.
- Node Swarm manager: além do standalone, `docker node ls`,
  `docker service ls`, `docker service ps`, `docker stack services <stack>`.
- Node Swarm worker: coleta standalone mais `docker node inspect self`.
  Não consultar estado global do Swarm a partir do worker como fonte única.
- Nunca usar `docker system prune`, `docker rmi`, `docker volume prune` ou
  `docker stack deploy` dentro do play de relatório.

## Limites de log

- Default: `--tail 200` para serviço Swarm, `--tail 100` para container,
  `--since 24h`. Ampliar somente com pedido explícito e registro da janela.
- Usar `--timestamps` para correlacionar com deploy e restart.
- Usar `check_mode: false` em tasks de inspeção quando o play declarar
  `check_mode: true` no nível do play; tasks de coleta não alteram estado
  e precisam continuar úteis em simulação.
- Usar FQCN (`ansible.builtin.shell`, `community.docker.docker_host_info`)
  e `changed_when: false` + `failed_when: false` somente quando a semântica
  for leitura real; nunca para mascarar falha de conexão ou permissão.

## Thresholds operacionais

- Disco: atenção em 80%, crítico em 90%. Inodes: atenção em 80%, crítico
  em 85%. Acima do crítico, priorizar limpeza autorizada de `dangling` e
  rotação de log antes de qualquer outra ação.
- Exit codes: `0` normal; `1` erro genérico da aplicação; `125`-`127`
  erro do runtime Docker; `137` OOM/kill (`SIGKILL`); `143` `SIGTERM`
  sem shutdown gracioso. Correlacionar `137` com `dmesg | grep -i oom` e
  limites de memória do serviço.
- Serviço Swarm: `Running < Desired` por mais de 5 minutos após deploy
  indica falha de convergência; `Shutdown Failed` repetido indica loop de
  restart que pede `docker service ps --no-trunc` completo.

## Segurança operacional

- Confirmar inventory e `--limit` antes de coletar; usar `./deploy
  check-hosts` e `ping` como preflight.
- Aplicar `no_log: true` em qualquer task que possa imprimir variável de
  ambiente, secret ou token. Revisar o Markdown com busca por `token`,
  `password`, `secret`, `vault_` antes de salvar em `server-reports/`.
- Preferir `community.docker` (`docker_host_info`, `docker_container_info`)
  a `shell` quando o módulo entrega o mesmo dado com parsing estável.
- Fixar `ansible-core` e collections em `requirements.yml`; divergência de
  versão entre controladora e documentação invalida a comparação histórica.

## Comandos de verificação

```bash
ansible-playbook --syntax-check playbooks/server-report.yml
ansible-lint playbooks/server-report.yml
ansible-playbook --check --diff -i ansible/inventory.yml playbooks/server-report.yml --limit web01
ansible-playbook -i ansible/inventory.yml playbooks/server-report.yml --limit web01
ansible-playbook -i ansible/inventory.yml playbooks/server-report.yml --limit web01 # 2a execução: changed=0 esperado
grep -R -i -E 'token|password|vault_|secret' server-reports/<AAAA-MM-DD>/ || true
```

## Fontes oficiais

- [Documentação geral do Ansible](https://docs.ansible.com/ansible/latest/)
- [Check mode e diff](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_checkmode.html)
- [Ansible Vault](https://docs.ansible.com/ansible/latest/vault_guide/)
- [ansible-lint](https://ansible.readthedocs.io/projects/lint/)
- [community.docker](https://galaxy.ansible.com/ui/repo/published/community/docker/)
- [docker ps](https://docs.docker.com/reference/cli/docker/container/ls/)
- [docker logs](https://docs.docker.com/reference/cli/docker/container/logs/)
- [docker stats](https://docs.docker.com/reference/cli/docker/container/stats/)
- [docker images](https://docs.docker.com/reference/cli/docker/image/ls/)
- [docker service ps](https://docs.docker.com/reference/cli/docker/service/ps/)
- [docker system df](https://docs.docker.com/reference/cli/docker/system/df/)
