# Servidores, conexões e comandos de deploy

A `specsfy-specialist-deploy` prepara os arquivos do projeto e mantém a lista
de máquinas que receberão a aplicação. Este capítulo detalha essa camada
operacional: onde cada arquivo fica, como uma máquina entra no ambiente, o que
o teste de conexão comprova e quais comandos curtos você pode copiar no Herdr.

## Onde a automação fica no seu projeto

A skill trabalha a partir da raiz que você confirmou. Os arquivos permanecem
junto do sistema para que o Git mostre quando a infraestrutura muda com o
código:

```text
meu-projeto/
├── deploy
├── SEMVER
├── Dockerfile
├── compose.yaml
├── stack.yaml
├── docker/
│   └── entrypoint.sh
└── ansible/
    ├── inventory.yml
    ├── inventory.example.yml
    ├── check-hosts.py
    ├── create-vault.sh
    ├── deploy.yml
    ├── keys.yml
    ├── sync-keys.yml
    ├── secrets.yml
    ├── vault-fields.txt
    ├── group_vars/
    │   ├── all.yml
    │   └── all/
    │       └── vault.yml
    └── templates/
        └── stack.yaml.j2
```

No modo padrão, `vault-fields.txt` inclui
`vault_cloudflare_tunnel_token`. Você informa esse valor pelo prompt oculto de
`./deploy secrets`, junto dos demais secrets ainda ausentes. O template da
stack monta o Docker Secret no serviço `cloudflared`, que compartilha a rede
overlay com `app`.

O arquivo `deploy` oferece nomes curtos para ações que você pode copiar em
outro painel do Herdr. Você não precisa iniciar o fluxo por esses comandos. Um
pedido como “faça o deploy desta aplicação” continua sendo a entrada normal, e
a IA executa as ferramentas conforme o estado encontrado.

## O que muda quando você pede outro deploy

Na primeira preparação, o gerador cria a base quando nenhum dos destinos
existe. Nas chamadas seguintes, a IA não executa o gerador sobre os mesmos
arquivos. Ela lê a aplicação outra vez, compara a infraestrutura atual com as
necessidades do código e modifica somente o que precisa acompanhar a entrega.

O `Dockerfile` recebe uma revisão própria. Em Laravel, a skill confere a versão
do PHP, as extensões exigidas pelo Composer, o pacote `laravel/octane`, a
extensão `openswoole`, o build dos assets, o entrypoint, as permissões, a porta,
o healthcheck e o comando `octane:start --server=swoole`. Uma dependência nova
que exija outra extensão PHP deve aparecer nessa análise antes do build.

O mesmo exame alcança `compose.yaml`, `stack.yaml`, `docker/` e `ansible/`.
Quando um arquivo possui personalizações do projeto, a skill preserva esses
trechos e apresenta a comparação dos arquivos alterados antes de substituir
uma estrutura sem marcações gerenciadas. Repetir o pedido não significa gerar
tudo novamente. Significa reconciliar o estado existente com a aplicação que
será publicada.

Essa reconciliação também confere o ingresso. Sem uma escolha diferente, a IA
mantém Cloudflare Tunnel como serviço da stack. Quando você pedir outro proxy,
ela remove ou deixa de gerar os componentes do túnel e prepara a alternativa
solicitada sem misturar tokens entre os dois caminhos.

## Como os servidores entram no inventário

Antes da primeira conexão, a orquestradora aciona o especialista de Debian e
pergunta quais máquinas fazem parte do ambiente. A conversa trata um servidor
por rodada. Para cada máquina, você confirma:

| Campo | O que representa | Exemplo |
| --- | --- | --- |
| alias | nome estável dentro do Ansible | `app01` |
| endereço | IP ou hostname alcançável | `203.0.113.10` |
| porta | porta usada pelo SSH | `22` |
| usuário inicial | conta que já consegue entrar no host | `root` |
| papel | função do node no Docker Swarm | `manager` |

Essas respostas formam `ansible/inventory.yml`. O arquivo de exemplo ensina o
formato, mas nunca substitui o inventário real durante uma conexão.

Quando você disser “adicione um novo servidor”, a skill lê os hosts atuais e
pergunta somente pelos dados da nova máquina. Depois, ela acrescenta o host ao
grupo escolhido, testa o SSH, sincroniza as chaves públicas, prepara o usuário
`deploy`, instala o Docker e integra o node ao Swarm. Os servidores anteriores
permanecem no arquivo e não são renomeados ou removidos nessa operação.

## A conta do servidor e a conta do container

O host e o container usam nomes diferentes porque cumprem funções diferentes.
No Debian, `deploy` é a conta operacional que recebe as chaves SSH, pertence ao
grupo `docker` e administra os diretórios sob `/opt/apps`. Dentro da imagem,
`app` continua sendo a conta sem privilégios que executa o Laravel Octane.

```text
máquina local ──SSH──> deploy@servidor ──Docker──> container: usuário app
```

O acesso por senha da conta `deploy` permanece desabilitado. O grupo `docker`
concede controle amplo sobre o host, por isso a automação não adiciona outras
contas a esse grupo sem uma necessidade confirmada.

## Teste das conexões

Antes de alterar qualquer servidor, a skill executa o teste abaixo. Assim, um
host inacessível aparece na tabela antes que o playbook modifique outra máquina:

```bash
./deploy check-hosts
```

O comando lê `ansible/inventory.yml`, chama o módulo `ping` do Ansible e mostra
uma linha por máquina:

```text
SERVIDOR  ENDEREÇO       PORTA  USUÁRIO  PAPEL    ESTADO
--------  -------------  -----  -------  -------  ----------
app01     203.0.113.10   22     root     manager  conectado
app02     203.0.113.11   22     deploy   worker   conectado
```

O estado `conectado` confirma que o Ansible conseguiu autenticar e executar o
módulo remoto. Ele não afirma que o Docker ou a aplicação estejam saudáveis.
Se qualquer host estiver inacessível, o comando termina com erro e o deploy
para antes da primeira escrita remota.

## Sincronização das chaves públicas

A automação procura arquivos com o padrão `~/.ssh/*.pub` na máquina que está
executando o agente. Somente o conteúdo das chaves públicas entra no
`authorized_keys` de `deploy` em cada servidor cadastrado. Arquivos privados,
como `id_ed25519` ou `id_rsa` sem o sufixo `.pub`, não são abertos nem enviados.

Quando você quiser executar apenas essa etapa em um painel do Herdr, use:

```bash
./deploy sync-keys
```

A operação primeiro executa `check-hosts`. Depois, mantém as chaves já presentes
e inclui somente as ausentes. Ela não usa sincronização exclusiva e, portanto,
não remove o acesso de outra máquina administrativa.

## Comandos curtos para o Herdr

| Comando | Finalidade | Efeito persistente |
| --- | --- | --- |
| `./deploy check-hosts` | listar o inventário e testar conexões | nenhum |
| `./deploy secrets` | incluir campos ausentes | atualiza o Vault |
| `./deploy sync-keys` | autorizar chaves `.pub` | atualiza os hosts |
| `./deploy run` | aplicar o playbook | atualiza Swarm e stack |

O inventário padrão é `ansible/inventory.yml`. Para conferir outro arquivo sem
alterar o projeto, defina `ANSIBLE_INVENTORY` somente para aquela execução.
Estes exemplos cobrem as ações disponíveis:

```bash
./deploy check-hosts

ANSIBLE_INVENTORY=ansible/inventory.staging.yml ./deploy check-hosts

./deploy secrets

./deploy sync-keys

./deploy run
```

`check-hosts` não recebe senhas como argumentos. `secrets` abre prompts ocultos
e não aceita valores pela linha de comando. `sync-keys` recusa continuar quando
não encontra uma chave pública local. `run` testa as conexões antes do playbook
e solicita a senha do Vault no próprio terminal quando ela for necessária.

Volte ao capítulo [Como funciona o Deploy da aplicação](deploy.md) para
acompanhar build, publicação, rollout, migrations, rollback e conferência da
versão ativa.
