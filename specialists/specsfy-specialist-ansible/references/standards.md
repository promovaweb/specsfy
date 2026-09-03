# Padrões e referências Ansible

## Deploy de stacks com preflight

Separe a inspeção da publicação. O preflight confere sintaxe, inventory,
`--limit`, conectividade, sistema operacional, manager Swarm, autenticação do
registry, collections, imagem e Docker Secrets. Ofereça um caminho de check
mode que não chame `docker_stack`, pois o módulo não simula mudanças.

Use `community.docker.docker_stack` com collection fixada. Instale no host as
dependências Python declaradas pelo módulo, valide os manifests antes e envie
`with_registry_auth` apenas quando o registry privado exigir. Modele a ordem de
dependência como dados e inclua as tasks de deploy em loop; após cada item,
consulte as réplicas até a convergência esperada.

Configuração de kernel deve ter leitura sem mudança, arquivo persistente em
`/etc/sysctl.d/` e aplicação condicional. Esse trio mantém a segunda execução
sem alterações e conserva o valor depois do reboot.

## Estrutura recomendada

- Layout de role padrão: `defaults/`, `vars/`, `tasks/`, `handlers/`,
  `templates/`, `files/`, `meta/main.yml` (dependências e plataformas
  suportadas). Uma role cobre uma responsabilidade coesa (ex.: "instalar e
  configurar PostgreSQL"), não "provisionar o servidor inteiro".
- Inventory por ambiente (`inventories/staging`, `inventories/production`)
  reaproveita as mesmas roles; a diferença entre ambientes vive em
  `group_vars`/`host_vars`, nunca em lógica duplicada dentro da role.
- Fixe collections e `ansible-core` em `requirements.yml` e
  `ansible.cfg`/`collections/requirements.yml` com versão mínima e máxima
  conhecida — uma collection nova pode mudar o comportamento default de um
  módulo entre versões.
- Use `tags` com semântica operacional real (`tags: [migration, restart]`)
  para permitir execução seletiva (`--tags`/`--skip-tags`); não use tags como
  substituto de dividir um playbook monolítico em roles menores.

## Precedência de variáveis (da mais fraca para a mais forte)

Ordem simplificada e mais relevante no dia a dia (a lista oficial completa
tem ~22 níveis):

1. `role defaults` (`defaults/main.yml`).
2. `inventory group_vars` (do grupo mais genérico ao mais específico).
3. `inventory host_vars`.
4. `play vars` e `vars_files` declarados no playbook.
5. `role vars` (`vars/main.yml` da role, não os defaults).
6. `set_fact` / `register` em tempo de execução.
7. Variáveis de linha de comando (`-e`/`--extra-vars`), sempre a mais forte.

Antes de depurar "por que essa variável não tem o valor esperado", confirme
em qual desses níveis ela está definida — um `-e` na CI, por exemplo,
sobrescreve silenciosamente qualquer `group_vars`.

## Idempotência na prática

- Prefira módulos declarativos (`ansible.builtin.template`,
  `ansible.builtin.user`, módulos de collection específicos de
  pacote/serviço) a `shell`/`command`; módulos declarativos já calculam
  `changed` corretamente comparando o estado atual ao desejado.
- Quando `shell`/`command` for inevitável, declare `changed_when` (ex.:
  baseado no `stdout` ou `rc`) e, quando possível, `creates`/`removes` para
  tornar a task um no-op na segunda execução.
- `failed_when` deve refletir a falha real do comando, não apenas o `rc`
  padrão — um script que retorna `0` mas imprime erro no `stderr` precisa de
  `failed_when` customizado para não mascarar a falha.
- A prova de idempotência é operacional: rodar o mesmo playbook duas vezes
  seguidas contra o mesmo alvo e confirmar `changed=0` na segunda execução,
  não uma inspeção estática do código.

## Segurança operacional

- Verifique `inventory_hostname`, grupos resolvidos e `ansible_host` antes de
  qualquer execução com `--limit` amplo — um padrão de host mal escrito pode
  atingir mais máquinas do que o pretendido.
- Use `serial` (quantos hosts por lote), `max_fail_percentage` (tolerância de
  falha antes de abortar o lote) e `any_errors_fatal` (aborta tudo no
  primeiro erro) conscientemente conforme o risco da mudança — nunca deixe
  no default silencioso para uma mudança que afeta produção.
- Nunca imprima conteúdo de Vault, tokens, senhas ou templates sensíveis em
  `debug:`; use `no_log: true` na task inteira quando o argumento ou o
  resultado contiver segredo, não apenas em partes do output.
- Ansible Vault criptografa arquivos/strings com AES256; mantenha a
  vault-password fora do repositório (arquivo de senha referenciado por
  `ansible.cfg` mas ignorado pelo Git, ou script de senha que busca em um
  cofre externo).

## Comandos de verificação

```bash
ansible-playbook --syntax-check playbook.yml
ansible-lint playbook.yml
ansible-playbook --check --diff -i inventories/staging playbook.yml
ansible-playbook -i inventories/staging --limit web01 playbook.yml
ansible-playbook -i inventories/staging playbook.yml   # 2ª execução: changed=0 esperado
```

## Fontes oficiais

- Documentação geral: https://docs.ansible.com/ansible/latest/
- Boas práticas: https://docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_tricks.html
- Precedência de variáveis: https://docs.ansible.com/ansible/latest/reference_appendices/general_precedence.html
- Roles: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html
- Handlers: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_handlers.html
- Vault: https://docs.ansible.com/ansible/latest/vault_guide/
- Check mode e diff: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_checkmode.html
- Estratégias de execução (`serial`, `throttle`): https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_strategies.html
- ansible-lint: https://ansible.readthedocs.io/projects/lint/
