# Entrega

O especialista Delivery coordena versão, imagem, servidor, cluster e promoção
entre ambientes. O modo **Deploy** prepara o servidor e executa o release. O
modo **Versionamento** prepara e confere o `SEMVER`. O modo **CI/CD** define a
estratégia de entrega. O modo **Pipeline de deploy** automatiza os testes,
o build Docker e a publicação em staging e produção.

## Quando usar

- Você quer fazer o release ou o deploy de uma aplicação em servidor.
- Você vai preparar um servidor que receberá stacks Docker Swarm por meio do
  Ansible.
- Você quer cadastrar, substituir ou conferir um servidor do ambiente.
- Você quer preparar ou conferir a próxima versão do sistema, a tag Git ou o
  alinhamento entre imagem, manifesto e deploy.
- O projeto tem arquivos de CI/CD, estratégia de release ou promoção entre
  ambientes.
- Você quer que o GitHub Actions teste, publique a imagem e faça deploy via
  Ansible com verificação e rollback.
- Você precisa escolher entre rolling, blue-green, canary ou feature flag para
  uma mudança específica.

Push, provisionamento e mudanças remotas acontecem somente com o alvo definido
e a sua autorização. A preparação local pode criar ou atualizar o `SEMVER`.
Estado do host, playbook e relatório ficam com o especialista
[Server](server.md). Build de imagem, Compose e mecânica do Swarm ficam com o
especialista [Docker](docker.md).

## Como ele trabalha

1. Confirma a raiz do sistema, o alvo e a autorização da entrega.
2. Inspeciona o `Dockerfile`, o Compose, a stack e a pasta `ansible/`. Compara
   a imagem com a aplicação atual e mostra as diferenças antes de substituir um
   arquivo sem marcações gerenciadas.
3. Prepara ou confere a versão e só então segue para imagem, servidor e cluster.
4. Em um release completo, o modo Deploy coordena e aciona os modos
   Versionamento e CI/CD, além dos especialistas Server e Docker.
5. Encerra com arquivos alterados, validações, pendências e o comando de
   rollback.

## Deploy

1. Confirma a raiz do sistema e aciona o modo Versionamento para ler ou
   preparar o `SEMVER`.
2. Na primeira preparação, quando nenhum arquivo de destino existe, executa o
   gerador:

   ```bash
   node scripts/scaffold.mjs --project <raiz> --image <registry>/<aplicacao>
   ```

   A stack inclui o Cloudflare Tunnel por padrão. Para outro proxy, o gerador
   usa `--proxy external` e a alternativa é configurada em uma etapa própria.

3. Levanta as máquinas uma de cada vez e registra hostname, endereço, porta SSH
   e papel `manager` ou `worker` em `ansible/inventory.yml`. Uma máquina nova
   entra sem apagar os hosts atuais.
4. Testa todos os hosts declarados antes de qualquer alteração remota:

   ```bash
   ./deploy check-hosts
   ```

5. Adiciona as chaves públicas `~/.ssh/*.pub` da máquina controladora ao
   `authorized_keys` do usuário `deploy`, sem ler ou copiar chaves privadas.
6. Pergunta quais senhas, tokens e chaves a aplicação consome e registra os
   nomes em `ansible/vault-fields.txt`. Você digita os valores com entrada
   oculta e o utilitário grava um YAML criptografado:

   ```bash
   ./deploy secrets
   ```

   Uma nova execução mantém os campos existentes e pergunta somente os
   ausentes. No padrão com Cloudflare Tunnel, o campo
   `vault_cloudflare_tunnel_token` entra na lista.

7. Gera a referência da imagem com `docker-tag` e recusa qualquer tag diferente
   do `SEMVER`.
8. Com os especialistas Server e Docker, define o estado do host, instala o
   Docker Engine e cria o usuário `deploy`.
9. Define managers, workers, redes e stacks. O `docker swarm init` roda apenas
   quando o manager ainda não participa de um swarm.
10. Valida o Ansible com syntax check, lint, check mode e duas execuções em um
    alvo descartável, além da stack com `docker stack config`.
11. Com autorização para o alvo, executa `./deploy run --non-interactive` usando
    uma fonte de senha do Vault já configurada.
12. Confere réplicas, healthchecks, logs, versão e digest. Depois, guarda o
    comando de rollback para a versão anterior.

A senha do Vault não passa pela conversa. Sem uma fonte configurada, o agente
orienta você a rodar `./deploy configure-vault` no seu terminal. O comando
`./deploy run` continua disponível como caminho manual.

Padrões do modo Deploy:

- O `SEMVER` na raiz governa imagem, manifesto, tag Git e release.
- O `compose.yaml` serve ao desenvolvimento e o `stack.yaml` à produção, que
  roda pelo Docker Swarm.
- No template do Specsfy para Laravel, a imagem usa `laravel/octane` com
  Open Swoole (`--server=swoole`).
- O `cloudflared` roda como serviço da stack na mesma rede overlay da
  aplicação, com o serviço Laravel sem porta pública. A opção `--token-file`
  exige `cloudflared` 2025.4.0 ou posterior e um túnel gerenciado remotamente.
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

## Versionamento

1. Localiza a raiz do projeto e lê o `SEMVER`, as tags Git, o changelog e os
   artefatos da entrega.
2. Cria o `SEMVER` apenas quando ele não existe e a versão inicial foi
   confirmada.
3. Classifica a alteração como `patch`, `minor` ou `major`, explica o efeito e
   propõe a próxima versão antes de gravar.
4. Atualiza o `SEMVER` na preparação autorizada e leva o mesmo valor para
   metadados, imagem e manifestos.
5. Executa os testes e confere que a versão é maior que a publicação anterior.
6. Com autorização para publicar, envia primeiro o artefato imutável e só
   depois cria a tag Git e a GitHub Release.
7. Informa a versão, o digest, o commit, os ambientes alcançados e os comandos
   de reversão.

Padrões do modo Versionamento:

- O `SEMVER` guarda uma única versão `MAJOR.MINOR.PATCH`, com quebra de linha
  final.
- `patch` indica correção compatível, `minor` indica recurso compatível e
  `major` indica mudança incompatível.
- Tags Git, anotações OCI, changelog e a referência da stack reproduzem o valor
  do `SEMVER`.
- As imagens recebem tag de SemVer e de commit, o digest fica registrado e o
  deploy usa o digest quando a plataforma permite.
- O agente confere se uma tag imutável já existe antes do push e não substitui
  imagens ou tags publicadas.

O utilitário local executa estas operações de forma determinística, com o mesmo
resultado para os mesmos argumentos em qualquer máquina do projeto ou da
integração contínua:

```bash
node scripts/semver.mjs current --project .
node scripts/semver.mjs bump patch --project .
node scripts/semver.mjs verify 1.4.1 --project .
node scripts/semver.mjs docker-tag registry.example/app --project .
node scripts/semver.mjs verify-docker-tag registry.example/app:1.4.1 --project .
```

Depois da instalação, o caminho do script fica em
`specsfy-specialist-delivery/scripts/semver.mjs`, dentro da biblioteca de
skills do agente.

## CI/CD

1. Identifica commit, artefato, ambientes, aprovações e responsável por cada
   promoção.
2. Torna build e testes reproduzíveis a partir de lockfiles versionados.
3. Produz o artefato imutável uma única vez e promove a mesma referência entre
   os ambientes.
4. Separa credenciais e permissões por job, de modo que o job de build não
   tenha a credencial de publicação em produção.
5. Coordena migrations compatíveis com a versão antiga e a nova da aplicação
   durante o rollout, no modelo expand e contract.
6. Define a estratégia de rollout, os sinais de sucesso, a condição de pausa e
   o mecanismo de rollback para a primeira execução em produção.
7. Registra a origem do artefato, a versão, os testes e o resultado do rollout
   de forma auditável.

Padrões do modo CI/CD:

- Credenciais temporárias, como OIDC, substituem segredos estáticos de longa
  duração.
- Actions externas do GitHub ficam fixadas pelo SHA completo. Use lockfile ou
  digest para as demais dependências quando o ecossistema oferecer suporte.
- O artefato é construído uma vez, identificado por digest ou assinatura e
  promovido sem recompilação.
- Dois deploys do mesmo serviço não rodam ao mesmo tempo.
- Um commit sem o pipeline de testes completo não chega a produção.
- A configuração de cada ambiente fica fora do artefato, em variáveis de
  ambiente ou em um gerenciador de segredos.
- Um rollout termina com smoke checks funcionais e observabilidade ativa.
- O rollback de código e o rollback de banco têm planos separados, porque nem
  toda migration é reversível.
- A trilha de auditoria registra as promoções e aprovações sem expor segredos.

## GitHub Actions

No modo `ci-cd`, use a [referência de GitHub Actions](../../../specialists/specsfy-specialist-delivery/references/github-actions.md)
para configurar os workflows em `.github/workflows/`. Cada workflow declara
os eventos que o disparam e os jobs que executa. Uma matriz permite rodar
o mesmo job em várias versões ou plataformas.

- Use cache para acelerar dependências e artefatos para guardar resultados
  ou entregá-los a outro job. Promova a imagem identificada pelo digest
  gerado no build.
- Restrinja `permissions:` ao necessário, fixe actions externas pelo SHA
  completo e prefira OIDC para obter credenciais temporárias.
- Proteja o ambiente de produção com regras de branch e aprovação quando o
  plano oferecer esse recurso. Controle a concorrência por serviço e ambiente
  para evitar que dois deploys alterem o mesmo destino ao mesmo tempo.
- Use workflows reutilizáveis quando vários pipelines tiverem a mesma
  sequência. Confira o comportamento em PR de fork, com aprovação pendente
  e com duas promoções simultâneas.

## Pipeline de deploy

Use o modo `$specsfy-specialist-delivery (pipeline)` para ligar os testes à
produção. O projeto precisa de um `SEMVER` na raiz, um `Dockerfile`, um Swarm
preparado com Ansible e uma rota HTTP de saúde em cada ambiente.

1. Em um projeto novo, gere a base informando `--pipeline`:

   ```bash
   node scripts/scaffold.mjs --project /caminho/app \
     --image ghcr.io/organizacao/app --pipeline
   ```

   O gerador inclui `.github/workflows/deploy.yml` e os arquivos Ansible de
   rollout e verificação. Se você já tem automação, gere uma cópia em outra
   pasta e incorpore as mudanças por comparação. Use `--force` somente quando
   quiser substituir os arquivos gerados existentes.
2. Configure os ambientes `staging` e `production` no GitHub. Em cada um,
   indique o inventário, o Vault criptografado, a stack e a URL de saúde.
   Cadastre a chave SSH, as chaves públicas verificadas dos hosts e a senha
   do Vault como secrets. Restrinja produção às tags de release e exija
   aprovação de um revisor.
3. Abra um pull request para rodar os testes. O template usa PHP e Composer.
   O especialista [Testing](testing.md) ajuda a ajustar a suíte, incluindo
   testes de frontend e navegador quando o projeto precisar.
4. Prepare um `SEMVER` disponível antes de integrar o commit à `main`. O
   pipeline publica a imagem no GHCR com tags de versão e commit. Em staging,
   o Ansible aplica a stack pelo digest, o identificador exato do conteúdo.
5. Depois de staging passar, crie a tag Git `vX.Y.Z` no mesmo commit. O
   workflow confirma o resultado de staging e o digest das duas tags da
   imagem. Após a aprovação, o Ansible publica essa mesma imagem em produção.
6. A entrega só passa quando as réplicas convergem, o rollout termina e a URL
   de saúde responde com HTTP 200. Se falhar, o pipeline restaura a última
   stack validada do ambiente. Em uma primeira instalação, remove a stack
   criada. Para adotar uma stack em funcionamento, registre previamente o
   manifesto da versão saudável.

Se a entrega mudar o banco, faça primeiro as mudanças compatíveis com as
duas versões da aplicação. Deixe a remoção de estruturas antigas para uma
entrega posterior, quando a versão anterior puder sair do plano de rollback.

A [referência do modo pipeline](../../../specialists/specsfy-specialist-delivery/references/pipeline.md)
lista as variáveis e secrets do GitHub, o preparo dos hosts e os comandos de
validação.

## Erros que ele evita

- Deploy pela tag móvel `latest` ou por uma tag sem vínculo com o `SEMVER`.
- `docker swarm init` em todas as execuções do playbook.
- Token de join, senha, chave ou token do Cloudflare Tunnel em log, variável
  aberta, `stack.yaml`, argumento ou imagem.
- `sudo` irrestrito para o usuário `deploy` sem necessidade confirmada.
- Build no servidor ou uma imagem recompilada para cada ambiente.
- Deploy considerado concluído só porque o comando retornou código zero.
- Alterar o `SEMVER` depois que a imagem foi compilada com outro valor.
- Criar a tag Git sem confirmar a imagem no registry.
- Recompilar o mesmo número para corrigir uma publicação, em vez de preparar um
  novo incremento.
- Tratar a preparação local como autorização para publicar ou alterar um
  ambiente remoto.
- Fazer um build novo em cada ambiente, o que publica em produção um binário
  diferente do testado.
- Feature flag sem responsável e sem data de expiração.
- Remover a coluna antiga no mesmo deploy da migration nova, o que quebra o
  rollback de código.
- Liberar segredos de produção para jobs de pull requests vindos de forks.

## Como conferir o resultado

- O prompt manual, o arquivo externo e o script de cofre foram testados em um
  alvo descartável, com a execução interrompida antes da conexão quando a
  senha é inválida.
- `current`, `docker-tag` e `verify-docker-tag` foram executados pelo modo
  Versionamento.
- O usuário `deploy` existe, pertence ao grupo `docker` e é dono dos
  diretórios da aplicação.
- O Docker Engine está ativo e o swarm aparece como `active`.
- A segunda execução do playbook termina sem mudanças.
- A imagem de cada serviço corresponde ao `SEMVER` e ao digest publicado.
- A convergência foi observada e o rollback foi ensaiado em um ambiente
  compatível.
- A versão é maior que a tag Git anterior.
- `SEMVER`, tag da imagem, anotações OCI, changelog e manifesto de deploy têm o
  mesmo valor.
- O digest publicado foi confirmado antes da tag Git.
- O rollback aponta para uma versão e um digest já disponíveis.
- O pipeline passou por validação estática, execução completa em uma branch
  segura e um teste de falha que interrompe a promoção.
- Digest, SBOM e assinatura foram conferidos quando o projeto adota essas
  práticas.
- Gates de aprovação, branch protection e permissões foram conferidos no
  provedor, além do arquivo de workflow.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-delivery --agent universal --copy --full-depth
```

Ao instalar o Delivery, o catálogo resolve as dependências e traz os
especialistas Server e Docker.

## Especialistas relacionados

- [Server](server.md) define o estado base do host e a automação com escrita.
- [Docker](docker.md) prepara e publica a imagem e governa o Swarm.
- [Git](git.md) entrega as branches e tags que o pipeline consome.
- [Observabilidade](observability.md) define os sinais que mantêm, pausam ou
  revertem um rollout.
- [Segurança de Aplicações](application-security.md) protege credenciais e a
  cadeia de suprimentos.

O capítulo [Como funciona o Deploy da aplicação](../deploy.md) mostra o
percurso completo do build ao rollback. Já o capítulo
[Senha do Vault e deploy pela IA](../deploy-vault.md) explica as fontes de
senha aceitas pelo utilitário.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-delivery/SKILL.md),
com os padrões comuns em
[standards.md](../../../specialists/specsfy-specialist-delivery/references/standards.md),
o contrato do servidor em
[deploy.md](../../../specialists/specsfy-specialist-delivery/references/deploy.md),
as fontes de senha em
[vault.md](../../../specialists/specsfy-specialist-delivery/references/vault.md),
a correspondência entre artefatos em
[versioning.md](../../../specialists/specsfy-specialist-delivery/references/versioning.md)
e o pipeline em
[ci-cd.md](../../../specialists/specsfy-specialist-delivery/references/ci-cd.md).

## Justificativa de tamanho

Este guia reúne deploy, versionamento, CI/CD e o pipeline que integra esses
modos. Você acompanha o mesmo artefato desde o build até o
rollback, sem trocar de página quando o assunto passa de versão para pipeline.
Separar cada modo em um guia diferente esconderia justamente as passagens em
que um depende do outro, como a tag que o pipeline consome e a versão que o
deploy publica.
