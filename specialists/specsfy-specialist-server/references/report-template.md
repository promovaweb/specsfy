# Modelo de relatório em server-reports/

Arquivo por host: `server-reports/<AAAA-MM-DD>/<host>.md`.
Índice do dia: `server-reports/<AAAA-MM-DD>/README.md`.

````markdown
# Relatório do servidor: <host>, <AAAA-MM-DD HH:MM TZ>

- Inventory: `ansible/inventory.yml` (grupo `<grupo>`, limit `<limit>`)
- SEMVER: `<x.y.z>` ou `não aplicável`
- Docker Engine: `<versão>`; papel Swarm: `manager|worker|standalone`
- Coleta: `ansible-playbook playbooks/server-report.yml --limit <limit>`

## Resumo executivo

| Achado | Severidade | Próximo passo |
| --- | --- | --- |
| Ex.: disco `/var/lib/docker` em 82% | atenção | avaliar prune autorizado de dangling |
| Ex.: serviço `app_web` 2/3 Running | crítico | inspecionar logs abaixo antes de rollback |

## Containers em execução

| Nome | Imagem | Status | Restarts | Health |
| --- | --- | --- | --- | --- |
| `app_web.1.xxx` | `registry/app:1.4.0` | `Up 3 hours` | `0` | `healthy` |

## Containers parados com erro

| Nome | Imagem | Exit | Saída em | Trecho de log |
| --- | --- | --- | --- | --- |
| `app_worker.1.yyy` | `registry/app:1.4.0` | `137` | `2026-10-14 03:12` | `Killed (...)` |

```text
<trecho de docker logs --tail 100 --timestamps --since 24h>
```

## Serviços Swarm

Não aplicável em host standalone. Em Swarm:

| Serviço | Running/Desired | Convergência | Observação |
| --- | --- | --- | --- |
| `app_web` | `2/3` | divergente | `docker service ps app_web --no-trunc` abaixo |

```text
<saída resumida de docker service ps>
```

## Stats instantâneos

| Container | CPU | Memória | Rede RX/TX |
| --- | --- | --- | --- |
| `app_web.1.xxx` | `4.2%` | `312MiB / 1GiB` | `1.2MB / 800kB` |

## Imagens

| Repositório:tag | Digest | Tamanho | Criada em | Estado |
| --- | --- | --- | --- | --- |
| `registry/app:1.4.0` | `sha256:abc...` | `412MB` | `há 2 dias` | em uso |
| `<none>:<none>` | não informado | `180MB` | `há 9 dias` | dangling |

## Volumes e redes

- Volumes: `<quantidade>`, com `docker volume ls` resumido quando relevante.
- Redes: `overlay`/`bridge` esperadas vs. encontradas.

## Disco e inodes

```text
<df -h>
<df -i>
<docker system df>
```

## Systemd com falha

```text
<systemctl --failed>
```

Nenhuma unidade com falha no instante da coleta, quando for o caso.

## Pendências

- [ ] `<ação sugerida>`; dono `<time/pessoa>`; achado `<id>`
````

Regras do índice `README.md`: tabela com host, papel, severidade máxima,
links relativos para cada `<host>.md` e nota quando um host esperado não
respondeu à coleta.
