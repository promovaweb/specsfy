# Senha externa e deploy pelo agente

## Preparação humana

`./deploy configure-vault` pede a senha atual duas vezes, com entrada oculta.
O comando grava a senha em texto simples fora do repositório, em
`$XDG_CONFIG_HOME/specsfy/vault/<projeto>-<hash>/password`. Sem
`XDG_CONFIG_HOME`, usa `~/.config`. O hash deriva do caminho real do checkout;
projetos com o mesmo nome recebem arquivos diferentes. A pasta recebe `700` e
o arquivo recebe `600`. Não configure valores reais durante testes da skill.

`--show-path` consulta o destino sem ler o conteúdo. A opção
`--vault-password-file <arquivo>` escolhe outro destino externo, que deve ser
usado explicitamente depois. O configurador recusa links simbólicos e caminhos
dentro do worktree, não aceita senha como argumento e confirma antes de
substituir um arquivo. Trocar esse arquivo não executa `ansible-vault rekey`.

## Execução

`./deploy run` pede a senha no terminal, mesmo com fonte externa configurada.
Mantém uma cópia temporária com permissão `600` até o fim do comando e a remove
ao concluir ou cancelar normalmente. Não depende do agente para preencher a
entrada. Um processo encerrado com `SIGKILL` pode deixar o temporário na máquina.

`./deploy run --non-interactive` recebe a senha nesta ordem:

1. `--vault-password-file <arquivo-ou-script>` e `--vault-id <id>@<fonte>`;
2. configuração resolvida por `ansible-config`, incluindo ambiente e
   `ansible.cfg`;
3. arquivo local criado pelo configurador para esse checkout.

O agente não abre a fonte da senha. O Ansible consulta o arquivo ou executa o
script. IDs com fonte `prompt` são recusados. Um cofre deve estar autenticado
previamente e seu script precisa terminar sem perguntas, imprimindo somente
a senha em stdout. O script pode ser chamado mais de uma vez por execução.

Antes dos hosts, um play local força a descriptografia de
`ansible/group_vars/all/vault.yml` com `no_log`. A seguir, o wrapper testa as
conexões e executa `deploy.yml`. Falha na fonte, ausência do Vault ou senha
incorreta interrompe a sequência, sem recorrer ao prompt ou a outra fonte.
SSH por chave e permissões de elevação já precisam estar configurados.

`./deploy secrets` reaproveita fontes explícitas, nativas ou locais para a
senha do Vault, mas pede os valores ausentes da aplicação no terminal. Sem
fonte configurada, pede também a senha. O YAML existente só é substituído
depois de criptografar todos os campos novos. Em arquivos com vários IDs,
selecione a identidade de criptografia pela configuração nativa do Ansible.

## Atualização de um projeto existente

Gere uma referência em pasta temporária com o mesmo `SEMVER` e compare
`deploy`, `ansible/create-vault.sh`, `ansible/check-hosts.mjs` e
`ansible/vault.mjs`. Incorpore as mudanças preservando argumentos, alvos e
tasks personalizados; não execute o scaffold diretamente sobre os arquivos
existentes. Teste o fluxo em um alvo descartável antes de usar produção.

## Validação e documentação

Os contratos executáveis ficam em `tests/deploy-node.test.mjs` no catálogo.
Execute a suíte focal, o BDD e ShellCheck nos wrappers. O manual completo com
opções, exemplos, troca e remoção da configuração pertence a
`docs/user/deploy-vault.md` no repositório do Specsfy.

## Fontes oficiais

- [Senhas do Vault](https://docs.ansible.com/projects/ansible/latest/vault_guide/vault_managing_passwords.html)
- [Fontes de senha e Vault IDs](https://docs.ansible.com/projects/ansible/latest/vault_guide/vault_using_encrypted_content.html)
