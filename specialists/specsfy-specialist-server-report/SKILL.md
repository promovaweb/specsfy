---
name: specsfy-specialist-server-report
description: "Gera relatórios de servidor com Ansible, logs Docker, serviços Swarm e uso de disco. Use para diagnóstico somente leitura por host."
---

# Server Report

## Quando usar

- Acionar quando a pessoa pedir relatório, diagnóstico ou auditoria do servidor
  com `server-reports/`, `ansible/inventory.yml` ou hosts com Docker Engine.
- Acionar também para investigar containers parados com erro, serviço Swarm
  degradado ou disco cheio antes de decidir rollback, limpeza ou escala.
- Não acionar para provisionar host, publicar stack, alterar firewall ou
  atualizar imagem; usar `$specsfy-specialist-deploy` para deploy,
  `$specsfy-specialist-ansible` para automação com escrita e
  `$specsfy-specialist-docker-swarm` para topologia e rollout do Swarm.
- Combinar com `$specsfy-specialist-observability` quando o relatório vai
  definir SLO, alerta ou dashboard e com `$specsfy-specialist-debugging`
  quando um erro encontrado no relatório precisa de causa raiz.

## Fluxo

Apresente o plano, informe o progresso por etapa e encerre com arquivos
alterados, validações e pendências. Para texto público, siga o Contrato
Editorial Compartilhado aplicável ao projeto consumidor.

1. Em release ou deploy completo, trabalhar sob
   `$specsfy-specialist-deploy` e usar o `SEMVER` e os hosts já
   preparados pela orquestradora. Nunca inventar host, stack ou versão.
1. Confirmar raiz do projeto consumidor, ambiente-alvo, hosts, grupos,
   `--limit` e método de conexão antes de qualquer execução remota. Usar
   `./deploy check-hosts` e o módulo `ping` antes da primeira coleta.
   Recusar `all` implícito como default silencioso.
1. Inspecionar `ansible/inventory.yml`, `ansible.cfg`, `stack.yaml` e o
   runtime real (Docker standalone, Swarm ou ambos) antes de montar a
   coleta. Registrar managers, workers, stacks e serviços esperados.
1. Executar coleta somente leitura via Ansible contra os hosts confirmados,
   sem task com escrita, reboot ou restart. Cobrir o mínimo do relatório
   em `references/standards.md`: containers em execução, containers
   parados com erro, `docker service ls/ps`, `docker stats --no-stream`,
   `docker images`, `df -h`, `df -i`, `systemctl --failed` e
   `docker system df`. Limitar logs com `--tail` e `--since` declarados.
1. Gerar um relatório Markdown por host e data em
   `server-reports/<AAAA-MM-DD>/<host>.md` na raiz do projeto consumidor,
   mais um `server-reports/<AAAA-MM-DD>/README.md` como índice. Seguir o
   modelo em [references/report-template.md](references/report-template.md).
   Nunca escrever fora da raiz confirmada nem sobrescrever um relatório
   publicado sem preservar o anterior.
1. Redigir cada achado com comando executado, saída resumida, severidade
   (`ok`, `atenção`, `crítico`) e próximo passo sugerido. Não declarar causa
   raiz sem registro no log; apontar o trecho de log que sustenta o estado.
1. Mascarar segredos, tokens e variáveis sensíveis antes de salvar. Aplicar
   `no_log: true` nas tasks de coleta que tocam secret e revisar o diff do
   relatório antes de versionar.

## Padrões

- Coleta é somente leitura. Nenhum play de relatório usa `state: present`,
  `docker_stack`, `apt`, `reboot`, `systemd: restarted` ou `shell` com
  efeito colateral; divergência encontrada vira achado, não correção
  automática.
- Todo relatório informa inventory, `--limit`, data, fuso, `SEMVER` quando
  aplicável, versão do Docker Engine e papel Swarm do host. Relatório sem
  essa procedência não é comparável entre execuções.
- Limitar volume na origem: `--tail 200` default para logs de serviço,
  `--tail 100` para container individual, `--since 24h` default salvo quando
  a pessoa pedir janela maior. Nunca despejar log completo sem paginação no
  relatório.
- Separar seções fixas: resumo executivo, containers em execução, containers
  parados com erro, serviços Swarm, imagens, volumes e redes, disco e inodes,
  systemd com falha e pendências. Seção ausente precisa de motivo registrado
  (`não aplicável em host sem Swarm`).
- Tratar container parado com erro com `docker ps -a --filter status=exited`,
  inspeção do código de saída e trecho final do log. Código `0` não é erro;
  `137` indica OOM ou kill externo e pede correlação com `dmesg` e limites.
- Listar imagens com repositório, tag, digest quando disponível, tamanho
  e tempo de criação. Marcar `dangling` e candidatas a `prune` sem executar
  a limpeza no mesmo play.
- Medir disco com `df -h` e `df -i` por filesystem mais `docker system df`.
  Alertar em uso acima de 80% e tratar como crítico acima de 90% ou com
  inodes acima de 85%, antes que o Docker pare de criar camadas.
- Versionar relatórios em Git quando o projeto versiona `server-reports/`;
  nunca commitar segredo, token de join ou conteúdo de Vault mesmo mascarado
  parcialmente. Na dúvida, manter o arquivo fora do commit e registrar o
  motivo no índice.

## Antipadrões

- Rodar coleta com `become: true` irrestrito ou conta com Docker sem
  necessidade: acesso ao socket Docker equivale a root no host; ampliar
  privilégio para uma leitura cria superfície de ataque sem benefício.
- Coletar com `shell: docker logs $(docker ps -aq)` sem filtro nem limite:
  mistura serviços saudáveis com ruído, estoura saída do Ansible e enterra o
  container com erro que motivou o relatório.
- Declarar "servidor saudável" porque `docker ps` lista containers `Up`:
  sem `docker service ps --no-trunc`, exit codes, `systemctl --failed` e
  espaço, um serviço degradado ou um disco no limite passa como normal.
- Executar `docker system prune -af` junto da coleta "para já limpar":
  apaga registros (container parado com log do erro, imagem do digest em
  produção) e transforma diagnóstico em mudança destrutiva sem autorização.
- Salvar relatório com timestamp local ambíguo ou sobrescrever o arquivo do
  dia: impede comparar evoluções e invalida a auditoria periódica.

## Validação

- `ansible-playbook --syntax-check` e `ansible-lint` no play de coleta antes
  de executar contra qualquer host.
- `ansible-playbook --check --diff` quando o play suportar simulação;
  nenhuma task pode relatar `changed` em modo leitura.
- Duas execuções consecutivas contra o mesmo alvo produzem o mesmo conjunto
  de seções e arquivos; a segunda não relata `changed`.
- Conferir que cada `server-reports/<AAAA-MM-DD>/<host>.md` existe, segue o
  modelo, cita comandos executados e não contém token, senha ou Vault em
  texto plano (`grep -R` por padrões sensíveis antes de versionar).
- Reproduzir manualmente um trecho crítico (ex.: `docker logs --tail 50
  <container>` ou `df -h`) no host e comparar com o valor registrado.
- Não declarar o servidor "diagnosticado" ou "saudável" sem as seções do
  mínimo, a procedência e a revisão de segredos acima; leitura do playbook
  não substitui a execução real.

## Skills relacionadas

- `$specsfy-specialist-deploy` coordena release e deploy; esta skill gera o
  diagnóstico somente leitura antes ou depois da entrega.
- `$specsfy-specialist-ansible` automatiza coleta idempotente e segura; esta
  skill nunca escreve estado, só reporta.
- `$specsfy-specialist-debian-server` define o estado base do host; esta
  skill lê APT, systemd, disco e Docker Engine sem alterar.
- `$specsfy-specialist-docker` governa imagem e runtime do container; esta
  skill lista imagens e logs sem rebuildar.
- `$specsfy-specialist-docker-swarm` governa topologia, rollout e rollback;
  esta skill lê serviços e convergência sem publicar stack.
- `$specsfy-specialist-observability` transforma achados recorrentes em
  SLO, alerta e dashboard; esta skill entrega o sinal bruto com contexto.
- `$specsfy-specialist-debugging` investiga a causa raiz de um erro apontado
  no relatório; esta skill para no achado comprovado.

Leia [references/standards.md](references/standards.md) para o mínimo do
relatório, comandos de coleta por runtime, limites de log, thresholds de
disco e fontes oficiais. Leia
[references/report-template.md](references/report-template.md) para o modelo
Markdown de `server-reports/` durante a geração do relatório.
