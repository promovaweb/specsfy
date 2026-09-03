---
name: specsfy-specialist-ansible
description: "Criar e revisar automação Ansible idempotente, segura e testável com inventários, variables, roles, handlers, Vault e execução controlada. Use para playbooks, roles, collections, inventories, ansible.cfg ou automação de hosts; use também para revisar idempotência de uma role existente; não execute contra produção sem alvo e autorização explícitos, e para orquestração de containers em cluster use `$specsfy-specialist-docker-swarm`."
---

# Ansible

## Quando usar

- Acionar quando o projeto tem playbooks, roles, `inventory`, `ansible.cfg`
  ou `requirements.yml`/`galaxy.yml` de collections.
- Acionar também para revisar se uma automação existente é realmente
  idempotente antes de rodá-la contra um ambiente compartilhado.
- Não acionar para orquestrar serviços já containerizados em cluster — usar
  `$specsfy-specialist-docker-swarm` nesse caso; Ansible aqui entra no
  provisionamento do host, não na orquestração de serviços do Swarm.
- Combinar com `$specsfy-specialist-delivery-engineering` quando a execução
  do playbook é uma etapa de um pipeline de deploy.

## Fluxo

1. Em release ou deploy completo, trabalhar sob
   `$specsfy-specialist-deploy` e usar o `SEMVER`, a imagem e os manifestos já
   preparados pela orquestradora.
1. Confirmar inventário, grupos, ambiente-alvo, método de conexão e escopo
   exato de hosts antes de qualquer execução com efeito.
1. Usar `./deploy check-hosts` para apresentar todos os hosts em tabela e
   confirmar o módulo `ping` antes da primeira task remota. Usar
   `./deploy sync-keys` para adicionar somente chaves públicas ao usuário
   `deploy`, sem excluir entradas existentes do `authorized_keys`.
1. Inspecionar a precedência de variáveis aplicável (ver tabela em
   `references/standards.md`) e as versões fixadas de collections e
   `ansible-core`.
1. Modelar o estado desejado com módulos idempotentes e roles coesas, uma
   responsabilidade por role.
1. Proteger secrets com Ansible Vault ou um provedor externo (lookup em
   cofre gerenciado); nunca em texto plano no repositório.
1. Validar sintaxe, `ansible-lint`, check mode e diff sem revelar segredos no
   output.
1. Testar a role em ambiente descartável e repetir a mesma execução para
   provar que a segunda rodada não relata `changed`.
1. Aplicar em produção com serialização (`serial`), limites (`--limit`) e
   critério de parada (`max_fail_percentage`/`any_errors_fatal`) compatíveis
   com o risco da mudança.

## Padrões

- Criar um preflight separado para conferir versão do controlador, sistema do
  alvo, acesso ao Docker, papel de manager, login no registry, collections,
  imagem imutável e Docker Secrets antes do play com escrita.
- Copiar manifests versionados para um diretório estável no host, validar cada
  um com `docker stack config` e publicar as stacks em ordem de dependência.
- Após cada publicação, consultar as réplicas até atingir a convergência ou
  encerrar com erro após tentativas limitadas. Não concluir pelo retorno do
  módulo de deploy isoladamente.
- Tratar check mode com honestidade: tasks de inspeção podem usar
  `check_mode: false`; tasks que alteram estado devem ser puladas ou suportar a
  simulação. O preflight precisa permanecer útil sem implantar stacks.
- Usar FQCN (`ansible.builtin.copy`, não `copy`) e módulos declarativos,
  evitando `shell`/`command` sempre que existir módulo idempotente
  equivalente.
- Dar nomes acionáveis a tasks e handlers (`name:` descreve o efeito, não o
  módulo); notificar handler somente quando a task realmente mudar estado.
- Separar `defaults/main.yml` (configurável pelo consumidor da role),
  `vars/main.yml` (interno, não deve ser sobrescrito) e secrets (Vault ou
  lookup externo) em arquivos distintos.
- Fixar collections em `requirements.yml` com versão e validar a matriz de
  compatibilidade com o `ansible-core` instalado antes de atualizar.
- Usar `changed_when`/`failed_when` apenas para representar a semântica real
  do comando — nunca para silenciar uma falha genuína ou fingir idempotência
  em um `shell`/`command` que sempre relata mudança.
- Restringir privilégio (`become` só na task que precisa) e usar `no_log:
  true` em qualquer task que manipule segredo, mesmo que o valor pareça
  inofensivo no log.
- Não depender da ordem acidental do inventário ou da execução paralela
  padrão quando a task tiver efeito colateral entre hosts (ex.: um serviço
  que só um host por vez pode reiniciar) — usar `serial` e `throttle`
  explicitamente nesses casos.

## Antipadrões

- `shell`/`command` sem `creates`, `removes` ou `changed_when` explícito: a
  task relata `changed` toda vez, mesmo quando o estado final é idêntico —
  isso quebra a leitura de "o que realmente mudou" em uma execução e mascara
  uma automação não idempotente.
- Handler notificado incondicionalmente (fora de uma task que só dispara
  `notify` quando `changed`): reinicia serviço a cada execução, inclusive
  quando nada mudou, criando indisponibilidade desnecessária.
- Variável de ambiente (produção/staging) só resolvida por `group_vars`
  genérico sem revisar a precedência real: um `-e` na linha de comando ou uma
  `host_vars` mais específica pode silenciosamente sobrescrever o valor
  esperado.
- Vault decriptado e commitado por engano, ou segredo interpolado em um
  `debug:`/log sem `no_log`: o segredo vaza pelo histórico do Git ou pelo
  output da execução, mesmo que o arquivo fonte esteja corretamente
  criptografado.

## Validação

- `ansible-playbook --syntax-check`, `ansible-lint` e execução em `--check
  --diff` (check mode) antes de qualquer aplicação real, confirmando que o
  diff não expõe segredo.
- Duas execuções consecutivas no mesmo alvo: a segunda não deve relatar
  nenhuma task como `changed` — essa é a prova operacional de idempotência,
  não uma inspeção visual do código.
- Testes de handlers (o serviço realmente reinicia quando deveria), de
  templates (renderização correta por ambiente) e de falha parcial
  (`any_errors_fatal`, `max_fail_percentage` se comportam como esperado
  quando um host falha no meio do batch).
- Confirmação explícita do inventory e do `--limit` usados antes de qualquer
  mutação remota — nunca aceitar "rodar em todos os hosts" como default
  silencioso.
- Não declarar uma role "idempotente" ou "segura" sem as duas execuções
  consecutivas e o check mode acima; a leitura do playbook não substitui a
  execução real contra um ambiente descartável.

## Skills relacionadas

- `$specsfy-specialist-deploy` coordena a automação completa do servidor; esta
  skill cuida das roles e do playbook Ansible.
- `$specsfy-specialist-versioning` mantém `SEMVER` alinhado à imagem e aos
  manifestos transportados pela automação.
- `$specsfy-specialist-docker-swarm` quando o host provisionado por Ansible
  entra em um cluster Swarm — Ansible prepara o node, Swarm orquestra os
  serviços dentro dele.
- `$specsfy-specialist-delivery-engineering` quando a execução do playbook é
  uma etapa de pipeline com promoção entre ambientes.
- `$specsfy-specialist-application-security` para revisão de gestão de
  segredo, rotação de credencial e hardening do host provisionado.
- `$specsfy-specialist-debian-server` para preparar APT, SSH, sysctl, systemd,
  firewall e Docker Engine antes da automação da aplicação.

Leia [references/standards.md](references/standards.md) para estrutura de
roles, precedência de variáveis, idempotência, segurança operacional e
comandos de teste, com fontes oficiais da documentação do Ansible.
