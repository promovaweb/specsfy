# Pipeline de deploy

Use este modo para automatizar a entrega de um projeto no GitHub, com Docker
Swarm preparado por Ansible. O [workflow](../assets/pipeline.yml) parte do
scaffold Laravel Octane e usa GitHub Actions, GHCR, rollout rolling e dois
ambientes independentes. O mesmo digest roda em staging e produção.

## Fluxo e responsáveis

| Evento | Etapas e dependências |
| --- | --- |
| Pull request para `main` | `test` instala dependências pelo lockfile e roda a suíte, inclusive em PR de fork. |
| Push na `main` por merge | `test → image → deploy`. Publica a imagem, aplica a stack em staging e verifica o serviço. |
| Push de tag `vX.Y.Z` | `test → promote → deploy`. Confere a versão e o staging do commit, resolve o digest no registry e aguarda aprovação em produção. |
| Falha no rollout ou na verificação | O playbook restaura a última stack validada e verifica a recuperação. Na primeira entrega, remove a stack criada. A execução termina com falha. |

1. **Testes.** Acione `$specsfy-specialist-testing` no modo `pest` para PHP.
   O template usa Composer, PHP 8.4 e SQLite em memória. Ajuste as extensões,
   serviços e comandos ao projeto. Acrescente Vitest para frontend e
   Playwright para fluxos de navegador quando a aplicação os usar. Ponha os
   jobs necessários antes da publicação e da promoção. O cache do Composer
   usa o hash de `composer.lock`. O BuildKit usa um cache separado do GitHub
   Actions para suas camadas.
2. **Build e registry.** Acione `$specsfy-specialist-docker` nos modos
   `compose` para imagem e healthcheck e `swarm` para a stack. Use
   `proxy` se a rota pública passar pelo Traefik. O build publica primeiro
   `<imagem>:sha-<commit-completo>` e, pelo digest, publica também
   `<imagem>:X.Y.Z`. Registra os rótulos OCI de versão e commit, SBOM e
   proveniência. Uma repetição reaproveita o digest existente e pode
   completar a tag SemVer ausente. Uma tag de versão já vinculada a outro
   digest encerra a execução. O rollout sempre recebe `<imagem>@sha256:…`.
3. **Versão e promoção.** Use o [modo versioning](versioning.md) para preparar
   `SEMVER` e changelog. Neste fluxo, cada commit novo entregue pela
   `main` precisa de um SemVer ainda livre. Proteja a branch para exigir os
   testes e impedir push direto. Aguarde o sucesso de staging antes de criar
   a tag Git no mesmo commit. O job `promote` confere a execução bem-sucedida
   desse workflow para o SHA exato na `main` e exige que as duas tags da
   imagem resolvam para o digest registrado após o smoke de staging.
   Promova dentro do prazo de retenção dos artefatos do GitHub Actions.
   Crie a GitHub Release depois da tag, seguindo a ordem do modo versioning.
4. **Infraestrutura e deploy.** Acione `$specsfy-specialist-server` nos modos
   `debian` e `ansible` para preparar os hosts e o acesso. Use `report`
   para inspecionar o alvo. O [modo deploy](deploy.md) fornece grupos do
   inventário, o usuário `deploy`, o [Vault](vault.md), o template da stack
   e as tarefas de Docker Secrets. O workflow chama `./deploy check-hosts`
   antes do `ansible-playbook`. O playbook acessa o primeiro manager, faz
   login no registry quando configurado, renderiza o template e chama
   `docker stack deploy --prune --with-registry-auth`.
5. **Verificação e rollback.** O playbook espera o número de réplicas
   desejadas dos serviços, confere o estado do rollout, exige o healthcheck
   do serviço principal e verifica seu digest. O runner faz um smoke HTTP
   com resposta 200 pela rota do ambiente. Só depois disso o manager guarda
   o manifesto como referência. Se a publicação ou verificação falhar,
   reaplica o manifesto anterior pelo digest e verifica a recuperação.
   Deploy, verificação e rollback rodam no mesmo job e seguram o mesmo lock.

## Preparação

Em projeto novo com `SEMVER` na raiz, gere o workflow e os playbooks:

```bash
node scripts/scaffold.mjs --project /caminho/app \
  --image ghcr.io/organizacao/app --pipeline
```

Os arquivos do pipeline saem em `.github/workflows/deploy.yml`,
`ansible/stack-deploy.yml` e `ansible/stack-verify.yml`. Em projeto existente,
gere uma referência à parte e incorpore as mudanças ao inventário, a
`secrets.yml`, ao wrapper `./deploy` e ao template `stack.yaml.j2`. O
template deve aplicar `app_image_ref` ao serviço, declarar um healthcheck e
usar réplicas positivas. Ajuste o endpoint interno padrão `/up` ao projeto.
O serviço padrão é `app`. Para outro nome, use `pipeline_app_service` no
inventário. Revise o `.dockerignore` para excluir `ansible/` e credenciais.
O gerador só sobrescreve destinos regulares com `--force`.

Prepare um inventário e Vault criptografado por ambiente. Mantenha a senha
fora do repositório. Cadastre a chave pública do runner durante o bootstrap.
Para provisionar uma Swarm nova sem publicar uma stack, use o `deploy.yml`
com a tag de publicação excluída, a partir de um controlador administrativo:

```bash
ansible-galaxy collection install -r ansible/requirements.yml
ansible-playbook -i ansible/inventory.staging.yml \
  --skip-tags stack ansible/deploy.yml
```

Use o usuário operacional `deploy` no inventário da CI. O primeiro manager
precisa ter o diretório `app_root` criado pelo bootstrap e acesso ao daemon
por meio do grupo `docker`. Para uma stack existente, registre no manager
o manifesto que reproduz a versão já saudável em
`<app_root>/pipeline-<stack>.yaml`, legível pelo usuário `deploy`;
use o digest em execução para o serviço principal. Valide o manifesto,
incluindo o healthcheck, antes da adoção. Preserve no registry todas as
imagens necessárias à recuperação. Fixe por digest também imagens auxiliares
ao exigir que o rollback restaure todos os binários.

Use Swarms independentes por ambiente. Se compartilharem cluster, separe
stacks, secrets e redes externas para que uma entrega de staging não alcance
produção. Use um único caminho de deploy por stack. No GitHub, o grupo de
concorrência por ambiente preserva a execução em andamento. Uma nova
execução pode substituir uma pendente. Defina nomes de ambientes distintos.

## Configuração do GitHub

Crie os environments antes de ativar o workflow. Restrinja staging a
`main` e produção às tags `v*`. Em produção, configure revisores
obrigatórios e impeça a própria aprovação quando disponível. Use um
ruleset para restringir a criação de tags de release, proteja a branch e
revise alterações no próprio workflow. A aprovação é uma configuração do
GitHub e depende do plano e visibilidade do repositório.

Variáveis de repositório opcionais:

| Variável | Padrão ou finalidade |
| --- | --- |
| `PIPELINE_IMAGE` | `ghcr.io/<owner>/<repo>`. Use a mesma imagem fornecida ao scaffold quando o nome for personalizado. |
| `STAGING_ENVIRONMENT` | `staging`. |
| `PRODUCTION_ENVIRONMENT` | `production`. |
| `PIPELINE_BUILD_RUNNER` e `PIPELINE_PLATFORM` | `ubuntu-24.04` e `linux/amd64`. Ao mudar de arquitetura, use um runner compatível. |

Configure em cada environment:

| Variável ou secret | Finalidade |
| --- | --- |
| `PIPELINE_INVENTORY` | Caminho relativo ao repositório. Padrão `ansible/inventory.yml`. |
| `PIPELINE_VAULT_FILE` | Caminho relativo do Vault criptografado. Padrão `ansible/group_vars/all/vault.yml`. |
| `PIPELINE_STACK` | Nome da stack. Padrão `app`. |
| `PIPELINE_SMOKE_URL` | URL do endpoint funcional do ambiente, alcançável pelo runner. |
| `DEPLOY_SSH_KEY` | Secret com chave privada dedicada ao usuário de deploy. |
| `DEPLOY_KNOWN_HOSTS` | Secret com chaves dos hosts conferidas previamente. Para portas diferentes de 22, use entradas no formato `[host]:porta`. |
| `ANSIBLE_VAULT_PASSWORD` | Secret com a senha que abre o Vault do ambiente. |
| `PIPELINE_REGISTRY_PULL_USER` e `PIPELINE_REGISTRY_PULL_TOKEN` | Usuário e secret de leitura para imagem privada no Swarm. Omita ambos para imagem pública. |

O runner grava chave, known_hosts e senha do Vault num diretório temporário
privado e valida o host pelo SSH. O login do manager usa token via stdin,
com `no_log` e configuração Docker temporária. Para GHCR privado, conceda ao
repositório acesso ao pacote e use um token de leitura dedicado ao Swarm.
O `GITHUB_TOKEN` de duração do job serve para publicar e consultar o pacote
no runner, enquanto o Swarm pode precisar puxar a imagem depois da execução.

Para outro registry OCI, aponte `PIPELINE_IMAGE` ao endpoint do provedor.
Configure `PIPELINE_REGISTRY_USER` e o secret `PIPELINE_REGISTRY_TOKEN` no
repositório para publicação. Para a consulta na promoção, configure
`PIPELINE_REGISTRY_READ_USER` e o secret `PIPELINE_REGISTRY_READ_TOKEN`.
Quando o provedor suportar OIDC, substitua a autenticação estática pelo login
oficial do provedor e conceda `id-token: write` apenas ao job correspondente.
Restrinja a política ao repositório, ref ou ambiente e considere o prazo de
validade da credencial usada pelos nodes em futuros pulls. O workflow fixa
actions por SHA completo e separa `packages: write` do build,
`packages: read` da promoção e acesso SSH/Vault do job de deploy.

## Migrations

Siga [expand, migrate e contract](ci-cd.md#migrations-e-compatibilidade).
Defina `pipeline_migration_tasks` no inventário com o caminho de um arquivo
de tasks do projeto quando houver migrations. O playbook chama essas tasks
no manager antes do rollout, depois de preparar registry e Docker Secrets.
Execute o comando de migration em uma única instância com o novo digest,
credenciais do ambiente e confirmação do estado aplicado. Faça o comando
idempotente para suportar reexecução. O rollback de imagem mantém o banco no
estado compatível. Faça o contract em uma entrega posterior, quando a
versão anterior já puder ser retirada da janela de rollback.

## Validação

Na raiz de um consumidor recém-gerado, use ferramentas reais:

```bash
actionlint .github/workflows/deploy.yml
ansible-galaxy collection install -r ansible/requirements.yml
ansible-playbook -i ansible/inventory.example.yml --syntax-check ansible/deploy.yml
ansible-playbook -i ansible/inventory.example.yml --syntax-check ansible/sync-keys.yml
ansible-playbook -i ansible/inventory.example.yml --syntax-check ansible/stack-deploy.yml
```

No monorepo, rode também `actionlint` no asset `assets/pipeline.yml`.
Em ambiente descartável, teste um PR de fork, a publicação e a promoção do
mesmo digest, duas execuções concorrentes e o bloqueio por revisão.
Provoque uma falha de saúde depois de uma entrega válida e confirme o retorno
da imagem anterior. Teste também a primeira entrega com falha. Registre
execução, commit, SemVer, digest, aprovação, smoke e resultado do rollback.
Se a conexão se perder durante o deploy e o playbook ficar sem acesso ao
manager, recupere o acesso e verifique ou reaplique a stack validada.

## Fontes oficiais

- [GitHub Actions e environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [GitHub REST API de execuções de workflow](https://docs.github.com/en/rest/actions/workflow-runs)
- [Docker Buildx e cache do GitHub Actions](https://docs.docker.com/build/cache/backends/gha/)
- [Docker Swarm e serviços](https://docs.docker.com/engine/swarm/services/)
- [Ansible, bloco e recuperação de falhas](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_blocks.html)
