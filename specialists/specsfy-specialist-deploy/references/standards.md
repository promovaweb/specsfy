# Contrato do servidor de deploy

## Estado produzido pelo Ansible

O playbook separa roles para host Debian, Docker Engine, Docker Swarm e
aplicação. A automação configura repositório de pacotes, daemon, rotação de
logs, firewall, diretórios, registry e redes antes de publicar a stack.

Aplicações Laravel usam Laravel Octane com Open Swoole. A imagem instala a
extensão `openswoole`, enquanto o Compose e a stack executam
`octane:start --server=swoole`.

O ingresso público padrão usa Cloudflare Tunnel. A stack executa `cloudflared`
como serviço na mesma rede overlay do Laravel, e o hostname configurado no
Cloudflare aponta para `http://app:8000`. O serviço abre conexões de saída e a
stack não publica a porta do Laravel no host. Quando a pessoa escolher outro
proxy, gere a base com `--proxy external` e configure essa alternativa fora do
template do Cloudflare.

Antes de cada release, releia o `Dockerfile` contra os manifests e o código da
aplicação. Confira PHP, extensões, bibliotecas do sistema, dependências
Composer, assets, entrypoint, usuário interno, porta e healthcheck. Preserve
customizações do projeto e mostre o diff antes de substituir um arquivo sem
marcadores gerenciados. Use `app` somente como usuário interno do container.

Crie o usuário operacional `deploy`, associe-o ao grupo `docker` e atribua a
ele os diretórios da aplicação. Desabilite login por senha. Quando a pessoa confirmar
o acesso operacional, procure somente arquivos públicos `~/.ssh/*.pub` no
controlador e adicione seu conteúdo ao `authorized_keys` de `deploy`. Use
`exclusive: false` para preservar acessos anteriores. Nunca abra nem envie
arquivos privados sem o sufixo `.pub`. Valide o daemon Docker com
`become_user: deploy`.

## Hosts e conexões

O levantamento começa pela lista de máquinas que a pessoa mantém. Faça uma
pergunta por rodada e registre, para cada servidor, um alias estável, endereço,
porta SSH, usuário inicial e papel `manager` ou `worker`. Grave o resultado em
`ansible/inventory.yml` e mantenha `inventory.example.yml` apenas como modelo.

Antes de provisionar, execute `./deploy check-hosts`. O utilitário chama o módulo
`ping` do Ansible para todos os hosts do arquivo selecionado. Uma conexão
com falha interrompe a automação antes de qualquer escrita remota.

Quando a pessoa pedir para adicionar uma máquina, leia o arquivo de hosts atual,
confirme apenas os dados ainda ausentes e acrescente o host ao grupo correto.
Teste a conexão desse host, sincronize as chaves públicas, configure `deploy`
e o Docker Engine e só depois integre o node ao Swarm. Não remova nem renomeie
outros hosts durante essa inclusão.

Leia `docker info --format '{{.Swarm.LocalNodeState}}'` antes de iniciar ou
integrar um node. Um manager novo usa `docker swarm init` com endereço de
advertise explícito. Workers e managers adicionais usam tokens obtidos do
manager e protegidos com `no_log: true`.

## Versão e imagem

Leia `SEMVER` somente na raiz confirmada do sistema do usuário. Gere a imagem
`<registry>/<aplicacao>:<SEMVER>` com o comando `docker-tag` da skill de
versionamento e valide a referência novamente antes do push e antes do
`docker stack deploy`.

## Secrets

Não grave senha, token ou chave na stack. Pergunte quais nomes a aplicação
consome, registre-os em `ansible/vault-fields.txt` e execute
`ansible/create-vault.sh`. O utilitário solicita a senha do Vault e cada valor
com entrada oculta, depois adiciona as variáveis criptografadas ao `vault.yml`.
Não aceite esses valores na conversa ou como argumento de linha de comando.
Uma nova execução ignora campos já presentes e solicita somente os ausentes.

No padrão Cloudflare Tunnel, trate o token como `vault_cloudflare_tunnel_token`.
O Ansible cria o Docker Secret externo `cloudflare_tunnel_token`, e o serviço
usa `--token-file /run/secrets/cloudflare_tunnel_token`. Não use `--token`,
variável aberta ou valor literal no YAML.

O playbook lê as variáveis `vault_<nome>`, usa
`community.docker.docker_secret` com `no_log: true` e publica somente Docker
Secrets externos. O container recebe arquivos em `/run/secrets`; o entrypoint
converte cada arquivo na variável esperada sem imprimir o conteúdo.

## Ordem operacional

1. Validar a automação localmente.
2. Testar as conexões declaradas no arquivo de hosts.
3. Criar `deploy`, sincronizar chaves públicas e configurar o Docker Engine.
4. Iniciar ou integrar os nodes ao Swarm.
5. Criar redes, configs e secrets externos.
6. Publicar a imagem SemVer e registrar o digest.
7. Publicar a stack pelo manager.
8. Observar serviços e executar o teste de funcionamento.

## Fontes

- [Docker Engine no Debian](https://docs.docker.com/engine/install/debian/)
- [Docker Swarm](https://docs.docker.com/engine/swarm/)
- [Módulos community.docker](https://docs.ansible.com/ansible/latest/collections/community/docker/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/)
- [Parâmetros do cloudflared](https://developers.cloudflare.com/tunnel/advanced/run-parameters/)
- [Tokens do túnel](https://developers.cloudflare.com/tunnel/advanced/tunnel-tokens/)
