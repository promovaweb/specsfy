# Senha do Vault e deploy pela IA

## Configurar a senha fora do projeto

Você pode continuar digitando a senha a cada deploy ou preparar a máquina para
que a IA execute a publicação sem perguntas. Nos dois casos, os valores da
aplicação permanecem criptografados no Ansible Vault. A configuração externa
muda somente a maneira de fornecer a senha que abre esse arquivo.

### Comando configure-vault

Execute `./deploy configure-vault` no seu terminal. O comando pede a senha
atual do Vault duas vezes e grava um arquivo fora do repositório. A senha não
aparece na tela, nos argumentos do processo ou nas mensagens do configurador.
Ela fica em texto simples no arquivo local, com permissão `600`, dentro de uma
pasta com permissão `700`. Seu usuário e administradores da máquina podem ler
esse arquivo; por isso, use somente uma máquina sob seu controle.

O destino padrão é
`~/.config/specsfy/vault/<projeto>-<hash>/password`. O hash identifica o caminho
real do checkout e separa projetos com nomes iguais. A variável
`XDG_CONFIG_HOME`, quando definida com caminho absoluto, substitui
`~/.config`. Mover o checkout exige configurar o novo caminho ou fornecer a
fonte explicitamente.

<!-- markdownlint-disable MD013 -->
| Opção | Tipo e padrão | Efeito |
| --- | --- | --- |
| `--vault-password-file <arquivo>` | caminho opcional | escolhe outro arquivo externo |
| `--show-path` | booleano, desativado | mostra somente o destino, sem criar nem ler a senha |
<!-- markdownlint-enable MD013 -->

O configurador recusa caminhos dentro do worktree e links simbólicos. Antes
de substituir um arquivo, pede confirmação; responder `n` ou usar Enter
preserva o conteúdo. Senhas diferentes na confirmação também preservam o
arquivo. O comando exige terminal para cadastrar e não aceita a senha como
argumento. Sucesso retorna código `0`; falha retorna `1`, opção inválida `2` e
cancelamento por Ctrl+C `130`.

Estes cinco usos cobrem o cadastro, a consulta e a separação de configurações:

```bash
# Cadastrar a senha na localização padrão deste projeto
./deploy configure-vault
```

```bash
# Conferir o destino sem abrir o arquivo
./deploy configure-vault --show-path
```

```bash
# Cadastrar um arquivo externo específico para produção
./deploy configure-vault \
  --vault-password-file "$HOME/.config/minha-app/producao/password"
```

```bash
# Conferir um destino personalizado antes do cadastro
./deploy configure-vault --show-path \
  --vault-password-file "$HOME/.config/minha-app/producao/password"
```

```bash
# Usar uma raiz de configuração diferente nesta máquina
XDG_CONFIG_HOME="$HOME/.config-automacao" ./deploy configure-vault
```

Um destino personalizado precisa ser informado nas execuções seguintes por
`--vault-password-file`, `ANSIBLE_VAULT_PASSWORD_FILE` ou `ansible.cfg`. O
cadastro padrão é descoberto automaticamente pelo modo sem interação do mesmo
checkout e usuário. A consulta `--show-path` ajuda a conferir permissões com
`stat`, sem revelar o conteúdo.

### Trocar, remover ou configurar outra máquina

Para substituir a cópia local da senha, execute o mesmo comando de cadastro,
confirme com `s` e informe a senha atual. Isso não altera a criptografia do
Vault. Quando a intenção for mudar a senha que criptografa os dados, faça a
rotação pelo Ansible e atualize depois todas as fontes que fornecem essa senha.

Para remover o cadastro padrão, confira primeiro o caminho e remova somente
aquele arquivo:

```bash
./deploy configure-vault --show-path
rm -- "$(./deploy configure-vault --show-path)"
```

Após a remoção, o deploy manual continua disponível. O modo da IA só funciona
quando outra fonte estiver configurada. Para um arquivo personalizado, remova
o caminho que você cadastrou e retire a referência correspondente do ambiente
ou de `ansible.cfg`. Essa remoção não apaga o Vault criptografado do projeto.

Em outra máquina, execute o cadastro novamente no checkout correspondente.
Não envie o arquivo da senha pelo Git. A configuração é local ao usuário que
executa o Ansible; um agente executado em container ou por outro usuário precisa
receber sua própria fonte de senha e acesso SSH ao ambiente autorizado.

## Deploy manual e deploy pela IA

### Comando run

`./deploy run` mantém a entrada manual: pede a senha no terminal, mesmo quando
existe uma fonte externa. A senha digitada fica em um arquivo temporário com
permissão `600` durante a execução, removido ao concluir ou cancelar normalmente.
Um encerramento forçado por `SIGKILL` pode deixar esse temporário na máquina.

`./deploy run --non-interactive` usa uma fonte configurada e não pede dados.
Antes de conectar aos servidores, valida localmente a descriptografia de
`ansible/group_vars/all/vault.yml`. Depois, testa os hosts e aplica o playbook.
Senha incorreta, fonte ausente ou falha do cofre encerram a execução, sem
recorrer a uma pergunta ou tentar outra fonte.

<!-- markdownlint-disable MD013 -->
| Opção | Tipo e padrão | Uso |
| --- | --- | --- |
| `--non-interactive` | booleano, desativado | habilita execução pela IA ou CI/CD |
| `--vault-password-file <fonte>` | caminho opcional | arquivo ou script executável que fornece a senha |
| `--vault-id <id>@<fonte>` | texto opcional, repetível | associa uma fonte a um ambiente |
<!-- markdownlint-enable MD013 -->

As opções de fonte em `run` exigem `--non-interactive`. A ordem de escolha é:
fontes explícitas do comando; configuração nativa resolvida pelo Ansible;
cadastro externo padrão deste checkout. A configuração nativa inclui
`ANSIBLE_VAULT_PASSWORD_FILE`, `ANSIBLE_VAULT_IDENTITY_LIST` e `ansible.cfg`, com
a precedência do próprio Ansible. Os IDs permitem usar mais de uma senha no
mesmo Vault. Fontes com `@prompt` são recusadas nesse modo.

O comando exige Node.js 22 ou superior e os executáveis `ansible-config`,
`ansible-inventory`, `ansible` e `ansible-playbook`. O ambiente também precisa
de acesso SSH por chave e das permissões de elevação usadas pelo playbook.
O modo sem interação desativa as perguntas de SSH, sudo e Vault; não concede
permissões adicionais. Uma configuração de cofre deve estar autenticada antes
da execução. Scripts que fornecem senha não podem depender de perguntas.

Nos cinco exemplos abaixo, confirme os hosts declarados no arquivo selecionado
antes de publicar. O alvo padrão continua sendo `ansible/inventory.yml`:

```bash
# Publicar manualmente, digitando a senha
./deploy run
```

```bash
# Permitir que a IA use o cadastro padrão já preparado
./deploy run --non-interactive
```

```bash
# Usar um arquivo externo informado nesta execução
./deploy run --non-interactive \
  --vault-password-file "$HOME/.config/minha-app/producao/password"
```

```bash
# Usar uma fonte fornecida pela automação, como um script de cofre
ANSIBLE_VAULT_PASSWORD_FILE="$HOME/.local/bin/minha-app-vault-client" \
  ./deploy run --non-interactive
```

```bash
# Selecionar hosts e identidade de staging explicitamente
ANSIBLE_INVENTORY=ansible/inventory.staging.yml \
  ./deploy run --non-interactive \
  --vault-id "staging@$HOME/.config/minha-app/staging/password"
```

O script de cofre imprime somente a senha em stdout e retorna código `0`.
Mensagens de diagnóstico pertencem a stderr e não devem conter segredos. O
Ansible pode chamar o script várias vezes durante um deploy, por isso a fonte
precisa aceitar consultas repetidas. No CI/CD, configure o secret pelo mecanismo
do provedor e disponibilize um arquivo temporário protegido ou um script para
consulta; limpe o temporário ao final do job.

A execução mostra a tabela de conexões e o resultado do playbook. Código `0`
confirma o sucesso dos comandos; a IA ainda deve conferir os serviços e a
versão publicada. Falhas de configuração ou execução retornam `1`, argumentos
inválidos retornam `2` e Ctrl+C retorna `130`. Sem fonte pronta, a IA informa a
pendência e orienta o cadastro humano, sem pedir a senha na conversa.

## Cadastro de segredos com a mesma configuração

### Comando secrets

`./deploy secrets` continua solicitando os valores ausentes da aplicação no
terminal. Para a senha do Vault, reaproveita as mesmas fontes explícitas,
nativas ou locais do modo automatizado. Sem nenhuma fonte configurada, pede
também a senha. O comando não recebe valores secretos como argumentos.

As opções `--vault-password-file <fonte>` e `--vault-id <id>@<fonte>` são
opcionais, com os mesmos tipos e ordem de escolha de `run`. Não há
`--non-interactive` para cadastrar valores: quando faltam campos, o terminal
humano é obrigatório. Com todos os campos presentes, o comando encerra sem
perguntas ou alterações.

O arquivo `ansible/vault-fields.txt` contém os nomes desejados, um por linha,
no formato `vault_` seguido de letras minúsculas, números ou sublinhados. O
utilitário preserva campos existentes e publica o YAML atualizado somente
depois de criptografar todos os novos valores. Uma falha intermediária mantém
o arquivo original. É necessário ter `ansible-vault` instalado.

```bash
# Cadastrar os campos faltantes usando a fonte já configurada
./deploy secrets
```

```bash
# Cadastrar com um arquivo externo específico
./deploy secrets \
  --vault-password-file "$HOME/.config/minha-app/producao/password"
```

```bash
# Consultar o cofre por um script já autenticado
./deploy secrets \
  --vault-password-file "$HOME/.local/bin/minha-app-vault-client"
```

```bash
# Identificar a senha usada para os novos valores
./deploy secrets \
  --vault-id "producao@$HOME/.config/minha-app/producao/password"
```

```bash
# Reutilizar uma fonte definida no ambiente
ANSIBLE_VAULT_PASSWORD_FILE="$HOME/.config/minha-app/producao/password" \
  ./deploy secrets
```

Com várias identidades, configure também `vault_encrypt_identity` em
`ansible.cfg`, ou `ANSIBLE_VAULT_ENCRYPT_IDENTITY`, para indicar qual delas
criptografa os campos novos. O comando informa somente o caminho atualizado ou
que todos os campos já existem. Os códigos de saída seguem o cadastro externo:
`0` para sucesso, `1` para falha, `2` para argumentos inválidos e `130` para
cancelamento.

## Atualizar scripts que já existem

Atualizar a skill instalada não substitui os scripts do seu projeto. Peça à IA
para comparar a versão atual de `deploy`, `ansible/create-vault.sh`,
`ansible/check-hosts.mjs` e o novo `ansible/vault.mjs` com uma geração temporária,
preservando suas personalizações. O scaffold recusa sobrescrever arquivos
existentes. Depois da migração, valide os dois modos em um ambiente de teste e
faça o cadastro externo na máquina que executará o deploy.
