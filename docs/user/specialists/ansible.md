# Ansible

O especialista Ansible orienta o agente na criação e na revisão de playbooks,
roles e arquivos do Ansible Vault. Use-o para automatizar a preparação de
servidores com execuções repetíveis, segredos protegidos e uma prova
operacional de idempotência antes de qualquer mudança em produção.

## Quando usar

- O projeto tem playbooks, roles, `inventory`, `ansible.cfg`,
  `requirements.yml` ou `galaxy.yml`.
- Você quer confirmar que uma automação existente é idempotente antes de
  executá-la em um ambiente compartilhado.
- A execução do playbook faz parte de um pipeline de deploy. Nesse caso,
  combine com o especialista de Engenharia de Entrega.

Para orquestrar serviços que já rodam em cluster, use o especialista Docker
Swarm. O Ansible prepara o host, enquanto o Swarm cuida dos serviços.

## Como ele trabalha

1. Em um release ou deploy completo, atua sob o especialista Deploy e usa o
   `SEMVER`, a imagem e os manifestos que ele preparou.
2. Confirma hosts, grupos, ambiente-alvo e método de conexão antes de
   qualquer execução com efeito.
3. Usa `./deploy check-hosts` para listar os hosts em tabela e testar o
   módulo `ping`. Com `./deploy sync-keys`, adiciona chaves públicas ao
   usuário `deploy` e preserva as entradas atuais do `authorized_keys`.
4. Confere a precedência de variáveis e as versões fixadas das collections
   e do `ansible-core`.
5. Descreve o estado desejado com módulos idempotentes e roles coesas, cada
   uma com uma responsabilidade.
6. Guarda segredos no Ansible Vault ou em um cofre externo. O texto plano no
   repositório fica fora do fluxo.
7. Valida sintaxe, `ansible-lint` e check mode, testa a role em um ambiente
   descartável e repete a execução para provar que a segunda passagem não
   relata mudanças.
8. Aplica em produção com `serial`, `--limit` e uma condição de parada
   compatível com o alcance da mudança.

A senha do Vault não passa pela conversa. Sem um arquivo ou script de senha já
configurado, o agente orienta você a rodar `./deploy configure-vault` no seu
terminal. O comando `./deploy run` continua manual, com entrada oculta.

## Padrões aplicados

- Um preflight separado confere controlador, sistema do alvo, Docker, papel de
  manager, login no registry, imagem imutável e Docker Secrets.
- Com Cloudflare Tunnel, o token vem de `vault_cloudflare_tunnel_token` com
  `no_log: true`, enquanto a stack recebe somente o nome do Docker Secret.
- Os manifests são validados com `docker stack config`, publicados em ordem
  de dependência e acompanhados até a convergência das réplicas.
- Os módulos usam o nome completo (`ansible.builtin.copy`). O agente prefere
  um módulo declarativo a `shell` ou `command`.
- Os handlers disparam somente quando a task altera o estado.
- `defaults/main.yml`, `vars/main.yml` e os segredos ficam em arquivos
  separados.
- O `become` fica restrito à task que exige privilégio. Toda task com segredo
  usa `no_log: true`.

## Erros que ele evita

- `shell` ou `command` sem `creates`, `removes` ou `changed_when`, que relatam
  mudança em toda execução e escondem a falta de idempotência.
- Handler que reinicia um serviço mesmo quando nada mudou.
- Variável de ambiente sobrescrita por um `-e` ou por um `host_vars` mais
  específico sem revisão da precedência.
- Vault decriptado no Git ou segredo exibido em `debug:` sem `no_log`.

## Como conferir o resultado

- `ansible-playbook --syntax-check`, `ansible-lint` e check mode antes da
  aplicação, sem segredo na saída.
- Duas execuções seguidas no mesmo alvo, com a segunda sem tasks `changed`.
- Testes de handlers, de templates por ambiente e de falha parcial com
  `any_errors_fatal` ou `max_fail_percentage`.
- Confirmação explícita do inventory e do `--limit` antes de alterar hosts
  remotos.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-ansible --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Deploy](deploy.md) coordena a automação completa do servidor.
- [Versionamento](versioning.md) mantém o `SEMVER` alinhado à imagem.
- [Docker Swarm](docker-swarm.md) orquestra os serviços no host preparado.
- [Debian Server](debian-server.md) prepara APT, SSH, firewall e Docker
  Engine.
- [Relatório de servidor](server-report.md) coleta logs e uso de disco em
  modo somente leitura.
- [Segurança de Aplicações](application-security.md) revisa segredos e
  hardening.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-ansible/SKILL.md),
com estrutura de roles, precedência de variáveis e comandos de teste no
arquivo de referência da mesma pasta.
