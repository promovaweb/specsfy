---
name: specsfy-specialist-delivery
description: Coordenar a entrega com os modos deploy (release completo em servidor Docker e Swarm via Ansible, scaffold, inventário, Vault e publicação), versioning (SEMVER, incremento, tag Git e alinhamento entre artefato, imagem, manifesto e deploy) e ci-cd (pipeline, artefato imutável, promoção entre ambientes, migrations, rollout e rollback). Use para release, deploy, versão, tag, pipeline, promoção ou escolha entre rolling, blue-green, canary e feature flag; não use para o estado Debian do host (`$specsfy-specialist-server`), para build de imagem e topologia Swarm (`$specsfy-specialist-docker`), para os sinais que decidem o rollout (`$specsfy-specialist-observability`), para branches e conflitos (`$specsfy-specialist-git`) nem para hardening de credencial de pipeline (`$specsfy-specialist-application-security`).
---

# Entrega

Coordena versão, artefato, servidor, cluster e promoção com a mesma referência
imutável. O modo deploy executa o release, o versioning prepara e confere o
número e o ci-cd desenha pipeline, promoção e rollback.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Fazer release ou deploy de aplicação em servidor, preparar servidor que receberá stacks Docker Swarm via Ansible, cadastrar, adicionar ou conferir máquina do ambiente | deploy | [Contrato do servidor de deploy](references/deploy.md) e [senha do Vault](references/vault.md) |
| Preparar ou conferir versão, `SEMVER`, incremento `patch`/`minor`/`major`, tag Git e alinhamento entre imagem, manifesto e deploy | versioning | [SemVer, artefatos e ordem de publicação](references/versioning.md) |
| Desenhar pipeline CI/CD, artefato e promoção entre ambientes, migrations, rollout e rollback, ou escolher entre rolling, blue-green, canary e feature flag | ci-cd | [Etapas de pipeline, estratégias e supply chain](references/ci-cd.md) |

Não use para:

- Estado Debian do host, playbook, role, Vault operacional ou relatório de
  servidor. Use `$specsfy-specialist-server`.
- `Dockerfile`, Compose, Swarm, secrets de cluster e mecânica de
  `update_config`. Use `$specsfy-specialist-docker`.
- Branch, merge, conflito e ciclo de release. Use `$specsfy-specialist-git`.
- Sinais objetivos de erro, latência e saturação que continuam, pausam ou
  revertem um rollout. Use `$specsfy-specialist-observability`.
- Hardening de credencial de pipeline, assinatura e supply chain. Use
  `$specsfy-specialist-application-security`.

## No Specsfy

Este especialista trabalha dentro do fluxo do método: a spec decide, a fase
escreve e a conclusão volta para a spec.

1. Antes de agir, ler a spec aberta, cujo caminho vem da skill que chamou ou de
   `specsfy status`, em especial a linha `| Especialistas |`, a subseção
   `#### Especialistas` dentro de `### 8. Plano técnico` e a seção que a fase
   está escrevendo, mais `.specsfy/STACK.md` e `.specsfy/RULES.md`. Abrir
   `.specsfy/DATABASE.md` quando a entrega envolver migration ou banco.
2. Seguir o modo indicado na spec ou na tarefa
   (`Especialista: $specsfy-specialist-delivery (deploy)`, `(versioning)` ou
   `(ci-cd)`); sem indicação, escolher pelo "Quando usar".
3. Devolver as conclusões para a seção da spec ou para a tarefa que a fase está
   escrevendo, nunca em arquivo paralelo. Se faltar informação, registrar como
   dúvida aberta da spec.
4. Nunca mudar o estado da spec nem marcar gates: isso é de
   `specsfy-03-specify`, `specsfy-04-validate`, `specsfy-05-tasks` e
   `specsfy-06-implement`.
5. Registrar na spec o `SEMVER` (patch, minor ou major e o efeito), o commit e o
   digest, a ordem artefato → imagem → tag → release e o comando de rollback; a
   spec cita o número e o digest, não a conversa.

## Fluxo

1. Confirmar a raiz do sistema e o alvo alcançado, apresentar o plano, informar
   o progresso por etapa e encerrar com arquivos alterados, validações e
   pendências. Push, provisionamento e mudança remota só com alvo e autorização
   explícitos; a preparação local pode criar ou atualizar `SEMVER`.
2. Identificar o modo: deploy para executar a entrega, versioning para preparar
   ou conferir a versão e ci-cd para desenhar pipeline e promoção. Em release ou
   deploy completo, o modo deploy coordena e aciona os demais.
3. Inspecionar `Dockerfile`, Compose, stack e `ansible/` existentes, comparando
   PHP, extensões, dependências, assets, entrypoint, usuário interno, portas,
   healthcheck e comando da aplicação. Preservar trechos personalizados e
   apresentar o diff antes de substituir arquivo sem marcações gerenciadas.
4. Acionar `$specsfy-specialist-server` para o estado do host e
   `$specsfy-specialist-docker` para imagem, Compose e Swarm.
5. Executar a validação do modo antes de declarar a entrega concluída.

### Modo deploy

1. Ler ou preparar o `SEMVER` no modo versioning e confirmar a raiz do sistema.
2. Executar o gerador somente na primeira preparação, quando todos os destinos
   estiverem ausentes:

   ```bash
   node scripts/scaffold.mjs --project <raiz> --image <registry>/<aplicacao>
   ```

   O padrão inclui Cloudflare Tunnel na stack. Para outro proxy, gerar sem
   `cloudflared` com `--proxy external` e configurar a alternativa em etapa
   própria.

3. Levantar as máquinas uma por pergunta e registrar hostname, endereço, porta
   SSH, usuário de conexão e papel `manager` ou `worker` em
   `ansible/inventory.yml`, preservando os hosts já cadastrados.
4. Testar todos os hosts declarados antes de qualquer alteração remota:

   ```bash
   ./deploy check-hosts
   ```

5. Localizar somente chaves públicas `~/.ssh/*.pub` no controlador e
   adicioná-las ao `authorized_keys` do usuário `deploy`; nunca ler, copiar ou
   transmitir chave privada e nunca remover acessos existentes.
6. Perguntar quais senhas, tokens, chaves e keys a aplicação consome, registrar
   os nomes em `ansible/vault-fields.txt` e solicitar os valores com entrada
   oculta:

   ```bash
   ./deploy secrets
   ```

   A repetição mantém campos existentes e pergunta só os ausentes. No padrão
   Cloudflare Tunnel, incluir `vault_cloudflare_tunnel_token`, lido pelo serviço
   em `/run/secrets/cloudflare_tunnel_token`.

7. Gerar a referência da imagem com `docker-tag` e recusar tag diferente do
   `SEMVER`.
8. Revisar roles idempotentes que criam o usuário `deploy`, instalam Docker
   Engine, configuram daemon, firewall, permissões e diretórios. O playbook roda
   `docker swarm init` somente quando o manager ainda não participa de um swarm
   e usa tokens protegidos para joins.
9. Validar Ansible em syntax check, lint, check mode e duas execuções em alvo
   descartável, e a stack com `docker stack config`.
10. Com autorização para o alvo, usar `./deploy run --non-interactive` quando o
    agente executar o deploy, com senha vinda de fonte externa já configurada.
    Na ausência dela, orientar `./deploy configure-vault` no terminal da pessoa;
    preservar `./deploy run` como caminho manual. Aplicar o playbook, publicar a
    imagem versionada e executar `docker stack deploy` pelo manager.
11. Conferir réplicas, healthchecks, logs, versão e digest, e guardar o comando
    de rollback para a versão anterior.

### Modo versioning

1. Localizar a raiz do projeto e ler `SEMVER`, tags Git, changelog e artefatos
   da entrega.
2. Criar `SEMVER` somente quando ausente e a versão inicial estiver confirmada.
3. Classificar a alteração como `patch`, `minor` ou `major`, explicar o efeito e
   propor a próxima versão antes de escrever.
4. Atualizar `SEMVER` na preparação autorizada e propagar o mesmo valor para
   metadados, imagem e manifestos da entrega.
5. Executar testes e conferir que a versão é superior à publicação anterior.
6. Com autorização para publicar, enviar primeiro o artefato imutável; criar tag
   Git e GitHub Release somente depois que o artefato estiver disponível.
7. Entregar versão, digest, commit, ambientes alcançados e comandos de reversão.

O utilitário executa as operações determinísticas da versão:

```bash
node scripts/semver.mjs current --project .
node scripts/semver.mjs bump patch --project .
node scripts/semver.mjs verify 1.4.1 --project .
node scripts/semver.mjs docker-tag registry.example/app --project .
node scripts/semver.mjs verify-docker-tag registry.example/app:1.4.1 --project .
```

Depois da instalação, o caminho fica em
`specsfy-specialist-delivery/scripts/semver.mjs` dentro da biblioteca de skills
do agente.

### Modo ci-cd

1. Mapear commit, artefato, ambientes, aprovações necessárias e owner de cada
   promoção antes de desenhar o pipeline.
2. Tornar build e testes reproduzíveis a partir de lockfiles versionados, nunca
   resolvendo dependência "mais recente" no momento do build.
3. Produzir o artefato imutável uma única vez e promovê-lo, sem recompilação,
   entre ambientes.
4. Separar credenciais, permissões e trust boundaries por job: o job que builda
   não tem a credencial que publica em produção.
5. Coordenar migrations compatíveis entre a versão antiga e a nova durante toda
   a janela de rollout (expand/contract).
6. Definir estratégia de rollout, sinais objetivos de sucesso, condição de pausa
   e mecanismo de rollback antes do primeiro deploy real.
7. Registrar proveniência, versão, comprovação de teste e resultado do rollout
   de forma auditável.

## Padrões

No modo deploy:

- Ler [references/vault.md](references/vault.md) antes de configurar senha,
  migrar scripts ou executar pelo agente: a fonte explícita vence ambiente e
  `ansible.cfg`, o cadastro local é alternativa e falha de fonte encerra a
  execução. Não executar `configure-vault` pela IA.
- Atualizar projeto existente por diff, preservando personalizações: o scaffold
  recusa sobrescrita e não migra `./deploy` ou `ansible/`.
- Manter `SEMVER` na raiz governando imagem, manifesto, tag Git e release, com
  `compose.yaml` para desenvolvimento e `stack.yaml` para produção em Docker
  Swarm.
- Em Laravel, exigir `laravel/octane` com Open Swoole: a imagem instala
  `openswoole` e Compose e stack executam `--server=swoole`.
- Usar Cloudflare Tunnel como entrada pública padrão, com `cloudflared` na mesma
  rede overlay e sem porta pública no Laravel; o hostname aponta para
  `http://app:8000`. Trocar só a pedido, sem gerar serviço e secret do token.
- Deixar o Ansible configurar servidor e Swarm; sequência manual de SSH não é
  procedimento principal.
- Criar o usuário `deploy`, adicionar somente ele ao grupo `docker` e atribuir a
  ele os diretórios da aplicação; manter `ansible/inventory.yml` como mapa dos
  servidores, com inclusão que preserva hosts, testa a conexão nova e só então
  configura o node e o papel.
- Em nova chamada, reler a aplicação e reconciliar só o que mudou; o gerador
  serve ao primeiro bootstrap e não sobrescreve arquivo.
- Usar módulos idempotentes e `community.docker`, com `swarm init` condicionado
  ao estado atual, managers ímpares e portas restritas aos nodes autorizados.
- Publicar uma imagem uma vez e promover o mesmo digest; guardar senhas, tokens
  e chaves em Ansible Vault criado por prompt seguro, transformado em Docker
  Secrets com `no_log: true`, com a stack guardando só nomes e mounts externos.

No modo versioning:

- Manter `SEMVER` na raiz com uma única versão `MAJOR.MINOR.PATCH` e quebra de
  linha final.
- Usar `patch` para correção compatível, `minor` para capacidade compatível e
  `major` para mudança incompatível.
- Tratar `SEMVER` como fonte: tags Git, anotações OCI, changelog e referência da
  stack reproduzem o mesmo valor.
- Publicar imagens com tag SemVer e commit, registrar o digest e fazer o deploy
  por digest quando a plataforma permitir.
- Conferir se a tag imutável já existe antes do push; nunca substituir imagem ou
  tag publicada.

No modo ci-cd:

- Usar menor privilégio e credenciais temporárias (OIDC/STS), com actions
  fixadas por hash ou versão exata, construir uma vez, assinar ou gerar digest e
  promover a mesma referência sem reconstruir por ambiente.
- Impedir dois deploys do mesmo serviço ao mesmo tempo e deploy de commit sem o
  pipeline de teste completo, mantendo a configuração de ambiente fora do
  artefato.
- Exigir smoke check e observabilidade ativa, tratar rollback de código e de
  dados como problemas distintos e preservar trilha auditável sem segredo.
  Detalhes em [references/ci-cd.md](references/ci-cd.md).

## Antipadrões

- Usar `latest` ou tag que não reproduza `SEMVER`.
- Executar `docker swarm init` em toda execução do playbook.
- Expor token de join, senha, chave ou token do Cloudflare Tunnel em log,
  variável aberta, `stack.yaml`, argumento, arquivo versionado ou imagem.
- Conceder `sudo` irrestrito ao usuário `deploy` sem necessidade confirmada.
- Fazer build no servidor, recompilar imagem por ambiente ou considerar o deploy
  concluído só porque o comando retornou zero.
- Alterar `SEMVER` depois da imagem compilada, criar tag Git antes de confirmar
  a imagem no registry ou recompilar o mesmo número para corrigir uma publicação.
- Tratar a preparação local como autorização implícita para publicar.
- Manter feature flag sem owner nem expiração.
- Remover coluna antiga no mesmo deploy da migration nova, quebrando o rollback;
  usar expand e contract separados.
- Liberar secret de produção para job de pull request de fork externo.

## Validação

- Comprovar prompt manual, arquivo externo, script de cofre e configuração
  nativa em alvo descartável: sem senha válida a execução para antes dos hosts,
  com permissões `700`/`600`, confirmação de substituição e nenhum valor secreto
  na saída.
- Executar `current`, `docker-tag` e `verify-docker-tag`; comparar com a tag Git
  anterior e recusar valor igual ou inferior.
- Confirmar o usuário `deploy` no grupo `docker`, dono dos diretórios e com
  acesso ao daemon, e o Docker Engine ativo com manager alcançável e swarm
  `active`.
- Executar o playbook duas vezes; a segunda termina sem mudanças, a imagem de
  cada serviço bate com o `SEMVER` e o digest publicado, a convergência foi
  observada e o rollback ensaiado.
- Conferir que `SEMVER`, tag da imagem, anotações OCI, changelog e manifesto têm
  o mesmo valor, que o digest foi confirmado antes da tag Git e que o rollback
  aponta para versão e digest disponíveis.
- Validar o pipeline com lint, execução completa em branch segura e teste
  deliberado de falha que impede a promoção.
- Conferir digest, SBOM e assinatura quando o projeto adota, e ensaiar rollout e
  rollback em ambiente representativo.
- Confirmar gates de aprovação, branch protection e permissões no provedor, não
  só no arquivo de workflow.
- Não declarar pipeline seguro, rollout concluído ou deploy entregue sem essas
  comprovações; ausência de erro no log não é prova de saúde.

## Skills relacionadas

- `$specsfy-specialist-server` define o estado Debian do host, executa a
  automação com escrita e produz o relatório somente leitura.
- `$specsfy-specialist-docker` prepara imagem, Compose e Swarm, incluindo
  `update_config`, secrets e o rollout dentro do cluster.
- `$specsfy-specialist-git` entrega a branch e a tag corretas no Gitflow e
  resolve conflito já aberto.
- `$specsfy-specialist-observability` fornece os sinais objetivos que continuam,
  pausam ou revertem um rollout.
- `$specsfy-specialist-application-security` revisa credencial de pipeline,
  assinatura de artefato e supply chain.

Leia [references/standards.md](references/standards.md) para os padrões comuns,
o índice dos modos e as fontes oficiais, [references/deploy.md](references/deploy.md)
para o contrato do servidor, [references/vault.md](references/vault.md) para as
fontes de senha, [references/versioning.md](references/versioning.md) para a
correspondência entre artefatos e [references/ci-cd.md](references/ci-cd.md) para
pipeline, estratégias e supply chain.
