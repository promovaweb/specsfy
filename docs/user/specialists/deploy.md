# Deploy

O especialista Deploy coordena o release e o deploy de uma aplicação em
servidores com Docker Swarm, preparados por Ansible e identificados pela versão
do arquivo `SEMVER`. Ele aciona os especialistas de versionamento, de servidor,
de imagem e de cluster na ordem certa e só altera servidores com alvo e
autorização explícitos.

## Quando usar

- Você quer fazer o release ou o deploy de uma aplicação em servidor.
- Você vai preparar um servidor que receberá stacks Docker Swarm por meio do
  Ansible.
- Você quer cadastrar, substituir ou conferir um servidor do ambiente.

Push, provisionamento e mudanças remotas acontecem somente com o alvo definido
e a sua autorização.

## Como ele trabalha

1. Confirma a raiz do sistema e aciona o especialista Versionamento para ler
   ou preparar o `SEMVER`.
2. Inspeciona o `Dockerfile`, o Compose, a stack e a pasta `ansible/`. Compara
   a imagem com a aplicação atual e mostra as diferenças antes de substituir um
   arquivo sem marcações gerenciadas.
3. Na primeira preparação, quando nenhum arquivo de destino existe, executa o
   gerador:

   ```bash
   node scripts/scaffold.mjs --project <raiz> --image <registry>/<aplicacao>
   ```

   A stack inclui o Cloudflare Tunnel por padrão. Para outro proxy, o gerador
   usa `--proxy external` e a alternativa é configurada em uma etapa própria.

4. Com o especialista Debian Server, levanta as máquinas uma de cada vez e
   registra hostname, endereço, porta SSH e papel `manager` ou `worker` em
   `ansible/inventory.yml`. Uma máquina nova entra sem apagar os hosts atuais.
5. Testa todos os hosts declarados antes de qualquer alteração remota:

   ```bash
   ./deploy check-hosts
   ```

6. Adiciona as chaves públicas `~/.ssh/*.pub` da máquina controladora ao
   `authorized_keys` do usuário `deploy`, sem ler ou copiar chaves privadas.
7. Pergunta quais senhas, tokens e chaves a aplicação consome e registra os
   nomes em `ansible/vault-fields.txt`. Você digita os valores com entrada
   oculta e o utilitário grava um YAML criptografado:

   ```bash
   ./deploy secrets
   ```

   Uma nova execução mantém os campos existentes e pergunta somente os
   ausentes. No padrão com Cloudflare Tunnel, o campo
   `vault_cloudflare_tunnel_token` entra na lista.

8. Gera a referência da imagem com `docker-tag` e recusa qualquer tag diferente
   do `SEMVER`.
9. Com os especialistas Debian Server, Docker e Ansible, define o estado do
   host, instala o Docker Engine e cria o usuário `deploy`.
10. Com o especialista Docker Swarm, define managers, workers, redes e stacks.
    O `docker swarm init` roda apenas quando o manager ainda não participa de
    um swarm.
11. Valida o Ansible com syntax check, lint, check mode e duas execuções em um
    alvo descartável, além da stack com `docker stack config`.
12. Com autorização para o alvo, executa `./deploy run --non-interactive`
    usando uma fonte de senha do Vault já configurada.
13. Confere réplicas, healthchecks, logs, versão e digest. Depois, guarda o
    comando de rollback para a versão anterior.

A senha do Vault não passa pela conversa. Sem uma fonte configurada, o agente
orienta você a rodar `./deploy configure-vault` no seu terminal. O comando
`./deploy run` continua disponível como caminho manual.

## Padrões aplicados

- O `SEMVER` na raiz governa imagem, manifesto, tag Git e release.
- O `compose.yaml` serve ao desenvolvimento e o `stack.yaml` à produção, que
  roda pelo Docker Swarm.
- Em Laravel, a imagem usa `laravel/octane` com Open Swoole
  (`--server=swoole`).
- O `cloudflared` roda como serviço da stack na mesma rede overlay da
  aplicação, com o serviço Laravel sem porta pública.
- O Ansible configura o servidor e o Swarm. Sequências manuais de SSH ficam
  fora do procedimento principal.
- Somente o usuário `deploy` entra no grupo `docker`, porque esse grupo dá
  acesso administrativo ao host.
- Em projetos existentes, a atualização acontece por comparação e preserva as
  personalizações, porque o gerador não sobrescreve arquivos.
- Managers ficam em número ímpar e as portas do Swarm ficam restritas aos
  nodes autorizados.
- A imagem é publicada uma vez e o mesmo digest é promovido entre ambientes.
- Os segredos viram Docker Secrets com `no_log: true` e a stack guarda apenas
  os nomes.

Os comandos curtos `./deploy check-hosts`, `./deploy secrets`,
`./deploy sync-keys` e `./deploy run` aparecem na resposta do agente para você
copiar em outro painel do Herdr.

## Erros que ele evita

- Tag `latest` ou qualquer tag diferente do `SEMVER`.
- `docker swarm init` em todas as execuções do playbook.
- Token de join, senha ou chave em log, variável aberta, `stack.yaml` ou
  imagem.
- `sudo` irrestrito para o usuário `deploy` sem necessidade confirmada.
- Build no servidor ou uma imagem recompilada para cada ambiente.
- Deploy considerado concluído só porque o comando retornou código zero.

## Como conferir o resultado

- O prompt manual, o arquivo externo e o script de cofre foram testados em um
  alvo descartável, com a execução interrompida antes da conexão quando a
  senha é inválida.
- `current`, `docker-tag` e `verify-docker-tag` foram executados pelo
  especialista Versionamento.
- O usuário `deploy` existe, pertence ao grupo `docker` e é dono dos
  diretórios da aplicação.
- O Docker Engine está ativo e o swarm aparece como `active`.
- A segunda execução do playbook termina sem mudanças.
- A imagem de cada serviço corresponde ao `SEMVER` e ao digest publicado.
- A convergência foi observada e o rollback foi ensaiado em um ambiente
  compatível.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-deploy --agent universal --copy --full-depth
```

Ao instalar o Deploy, o catálogo resolve as dependências e traz os
especialistas de versionamento, servidor Debian, Docker, Docker Swarm e
Ansible.

## Especialistas relacionados

- [Versionamento](versioning.md) governa a versão do sistema.
- [Debian Server](debian-server.md) define o estado base do host.
- [Docker](docker.md) prepara e publica a imagem.
- [Ansible](ansible.md) automatiza o servidor e o cluster.
- [Docker Swarm](docker-swarm.md) governa serviços, rollout e rollback.
- [Engenharia de Entrega](delivery-engineering.md) cuida do pipeline e das
  promoções.
- [Relatório de servidor](server-report.md) coleta logs e uso de disco por
  host.

O capítulo [Como funciona o Deploy da aplicação](../deploy.md) mostra o
percurso completo do build ao rollback. Já o capítulo
[Senha do Vault e deploy pela IA](../deploy-vault.md) explica as fontes de
senha aceitas pelo utilitário.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-deploy/SKILL.md),
com o playbook de provisionamento e as fontes de senha do Vault nos arquivos de
referência da mesma pasta.
