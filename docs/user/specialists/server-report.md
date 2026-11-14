# Relatório de servidor

O especialista Relatório de servidor gera diagnósticos somente leitura de
hosts com Docker Engine. A coleta usa Ansible e produz um relatório Markdown
por host em `server-reports/`, com o estado dos containers e dos serviços
Swarm, além do uso de disco.

## Quando usar

- Você quer um relatório, diagnóstico ou auditoria de servidores listados em
  `ansible/inventory.yml`.
- Você precisa investigar containers parados com erro, um serviço Swarm
  degradado ou um disco cheio antes de escolher entre rollback, limpeza ou
  escala.

Provisionamento, publicação de stack, firewall e atualização de imagem ficam
com os especialistas Deploy, Ansible e Docker Swarm. Este especialista só lê o
estado dos servidores.

## Como ele trabalha

1. Em um release ou deploy completo, atua sob o especialista Deploy e usa o
   `SEMVER` e os hosts que ele preparou.
2. Confirma a raiz do projeto, o ambiente, os hosts, o `--limit` e o método de
   conexão. Testa os hosts com `./deploy check-hosts` e recusa `all` como
   padrão implícito.
3. Inspeciona `ansible/inventory.yml`, `ansible.cfg`, `stack.yaml` e o runtime
   (Docker standalone, Swarm ou ambos).
4. Executa a coleta somente leitura, sem tasks de escrita, reboot ou restart.
   Os logs têm `--tail` e `--since` declarados.
5. Gera `server-reports/<AAAA-MM-DD>/<host>.md` para cada host e um
   `README.md` como índice da data.
6. Escreve cada achado com o comando executado, a saída resumida, a severidade
   (`ok`, `atenção` ou `crítico`) e o próximo passo sugerido.
7. Mascara segredos, tokens e variáveis sensíveis e usa `no_log: true` nas
   tasks que leem secrets.

## O que entra no relatório

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

O relatório tem seções fixas:

- resumo executivo
- containers em execução e containers parados com erro
- serviços Swarm
- imagens, volumes e redes
- disco e inodes
- unidades systemd com falha
- pendências

Uma seção ausente traz o motivo, como "não aplicável em host sem Swarm".

## Padrões aplicados

- A coleta não altera estado. Qualquer divergência vira achado em vez de
  correção automática.
- Cada relatório informa inventory, `--limit`, data, fuso, `SEMVER`, versão do
  Docker Engine e papel do host no Swarm.
- Os logs usam `--tail 200` para serviços, `--tail 100` para containers e
  `--since 24h`, salvo quando você solicita outra janela.
- Containers parados com erro recebem o código de saída e o final do log. O
  código `137` indica falta de memória ou kill externo e é cruzado com `dmesg`.
- As imagens aparecem com repositório, tag, digest, tamanho e data. As
  candidatas a `prune` são marcadas sem limpeza.
- O disco gera alerta acima de 80% e fica crítico acima de 90% ou com inodes
  acima de 85%.
- Relatórios com segredos, tokens de join ou conteúdo do Vault ficam fora do
  Git, mesmo mascarados.

## Erros que ele evita

- Coletar com `become: true` irrestrito ou com acesso desnecessário ao socket
  Docker, que equivale a root no host.
- Juntar os logs de todos os containers sem filtro nem limite.
- Declarar o servidor saudável só porque `docker ps` mostra containers `Up`.
- Rodar `docker system prune -af` durante a coleta e apagar os registros do
  erro.
- Sobrescrever o relatório do dia ou usar horário local ambíguo.

## Como conferir o resultado

- `ansible-playbook --syntax-check` e `ansible-lint` passam no play de coleta.
- Em check mode, nenhuma task relata `changed`.
- Duas execuções seguidas produzem as mesmas seções e arquivos.
- Cada relatório segue o modelo, cita os comandos e não contém token, senha ou
  Vault em texto plano.
- Um trecho importante, como `df -h`, foi reproduzido no host e comparado com
  o relatório.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-server-report --agent universal --copy --full-depth
```

O catálogo instala junto os especialistas Ansible e Docker.

## Especialistas relacionados

- [Deploy](deploy.md) coordena release e deploy.
- [Ansible](ansible.md) automatiza a coleta idempotente.
- [Debian Server](debian-server.md) define o estado base do host.
- [Docker](docker.md) cuida da imagem e do runtime.
- [Docker Swarm](docker-swarm.md) cuida da topologia e do rollout.
- [Observabilidade](observability.md) transforma achados recorrentes em SLOs
  e alertas.
- [Debugging](debugging.md) investiga a causa de um erro apontado no
  relatório.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-server-report/SKILL.md),
com os comandos por runtime, os limites de log e o modelo do relatório na
pasta de referências.
