---
name: specsfy-specialist-delivery-engineering
description: "Projetar e revisar CI/CD, artefatos, releases, promoções, migrations, rollout, rollback e supply chain. Use para pipelines, workflows, ambientes, deploys ou estratégia de entrega; use também para escolher entre rolling, blue-green, canary ou feature flag; não publique, promova ou altere produção sem autorização explícita, e para a métrica que decide o rollout use `$specsfy-specialist-observability`."
---

# Engenharia de entrega

## Quando usar

- Acionar quando o projeto tem pipeline (`*.yml` de CI/CD), estratégia de
  release, promoção entre ambientes ou plano de rollout/rollback.
- Acionar também para escolher entre rolling, blue-green, canary ou feature
  flag diante de uma mudança específica.
- Não acionar para a implantação de baixo nível dentro de um cluster Swarm
  (use `$specsfy-specialist-docker-swarm`) nem para decidir qual sinal prova
  que o rollout está saudável (use `$specsfy-specialist-observability`) —
  aqui o foco é o desenho do pipeline e da estratégia de promoção.
- Combinar com `$specsfy-specialist-application-security` quando o pipeline
  manipula credenciais de produção ou publica artefato assinado.

## Fluxo

1. Em release ou deploy completo, trabalhar sob
   `$specsfy-specialist-deploy` e usar o `SEMVER` preparado pela
   `$specsfy-specialist-versioning` para artefato, changelog e tag.
1. Mapear commit, artefato, ambientes, aprovações necessárias e owner de cada
   promoção antes de desenhar o pipeline.
1. Tornar build e testes reproduzíveis a partir de lockfiles versionados —
   nunca resolver dependência "mais recente" no momento do build.
1. Produzir o artefato imutável uma única vez e promovê-lo, sem
   recompilação, entre ambientes (o binário testado em staging é
   bit-a-bit o mesmo publicado em produção).
1. Separar credenciais, permissões e trust boundaries por job — o job que
   builda não tem a credencial que publica em produção.
1. Coordenar migrations de schema com compatibilidade entre a versão antiga e
   a nova da aplicação durante toda a janela de rollout (expand/contract).
1. Definir a estratégia de rollout, os sinais objetivos de sucesso, o
   critério de pausa e o mecanismo de rollback antes do primeiro deploy real.
1. Registrar proveniência (de onde veio o artefato), versão, evidência de
   teste e resultado do rollout de forma auditável.

## Padrões

- Usar menor privilégio, credenciais temporárias (OIDC/STS em vez de secret
  estático de longa duração) e actions/dependências de pipeline fixadas por
  hash ou versão exata, não por tag móvel (`@latest`, `@main`).
- Não reconstruir o artefato para cada ambiente; construir uma vez, assinar
  ou gerar digest, e promover a mesma referência imutável.
- Impedir concorrência incompatível (dois deploys do mesmo serviço ao mesmo
  tempo) e impedir deploy de um commit que não passou pelo pipeline de teste
  completo.
- Manter ambientes reproduzíveis por infraestrutura como código; configuração
  de ambiente fica fora do artefato (env vars, secret manager), nunca
  embutida no build.
- Exigir smoke checks funcionais e observabilidade ativa antes de considerar
  um rollout concluído — "o deploy terminou sem erro" não é o mesmo que "o
  serviço está saudável".
- Tratar rollback de código (reverter para o binário anterior) e rollback de
  dados (reverter uma migration já aplicada) como problemas distintos com
  planos distintos — nem toda migration é reversível sem perda de dado.
- Preservar trilha auditável de quem promoveu o quê, quando e com qual
  aprovação, sem jamais registrar segredo em log ou artefato de auditoria.

## Antipadrões

- Pipeline que builda a imagem de novo em cada ambiente (`build` no job de
  staging e outro `build` no job de produção): o artefato testado em
  staging não é garantidamente o mesmo que vai para produção, mesmo com o
  mesmo Dockerfile — dependências resolvidas "latest" ou cache diferente
  produzem binários diferentes.
- Feature flag sem owner nem expiração: acumula flags mortas que ninguém
  lembra o propósito, aumentando a superfície de combinações não testadas.
- Migration de schema aplicada no mesmo deploy que remove a coluna antiga:
  quebra a versão anterior da aplicação se o rollback de código precisar
  rodar contra o schema já alterado — use expand (adicionar) num deploy e
  contract (remover) só depois que nenhuma versão antiga depende da coluna.
- Secret de produção acessível a um job que roda em pull request de fork
  externo: o contexto de PR externo não deve ter acesso a nenhum secret de
  ambiente protegido.

## Validação

- Lint/validação estática do pipeline, execução completa em branch segura e
  um teste deliberado de falha (o pipeline realmente para e não promove
  artefato quando um step crítico falha).
- Verificação de digest do artefato, SBOM e assinatura/proveniência
  (attestation) quando essas práticas forem adotadas pelo projeto.
- Ensaio completo de rollout e de rollback em ambiente representativo antes
  da primeira execução em produção — não confiar apenas na leitura da
  configuração do provedor.
- Confirmação de gates de aprovação, branch protection e permissões
  configuradas no provedor (não apenas no arquivo de workflow, que pode ser
  sobrescrito por quem tem permissão de push).
- Não declarar um pipeline "seguro" ou um rollout "concluído" sem essas
  evidências; ausência de erro no log não é prova de saúde do serviço.

## Skills relacionadas

- `$specsfy-specialist-deploy` coordena o release e o deploy completos; esta
  skill cuida do pipeline e das promoções.
- `$specsfy-specialist-versioning` prepara `SEMVER` e mantém o número alinhado
  entre artefato, changelog, tag e promoção.
- `$specsfy-specialist-ansible` aplica configuração idempotente em hosts;
  esta skill governa promoção, aprovação e proveniência da entrega.
- `$specsfy-specialist-software-architecture` define boundaries e restrições
  estruturais que o pipeline materializa entre ambientes.
- `$specsfy-specialist-observability` para os sinais objetivos (erro,
  latência, saturação) que decidem continuar, pausar ou reverter um rollout.
- `$specsfy-specialist-docker-swarm` quando o alvo do deploy é um cluster
  Swarm — esta skill desenha o pipeline até o ponto de promoção, a outra
  executa o rollout dentro do cluster.
- `$specsfy-specialist-application-security` para hardening de credenciais de
  pipeline, supply chain e assinatura de artefato.
- `$specsfy-specialist-performance-engineering` quando o rollout precisa de
  um baseline de performance antes de liberar tráfego total.
- `$specsfy-specialist-gitflow` quando o projeto declarar Gitflow como
  estratégia de branch — aquela skill entrega a branch e a tag corretas
  (merge de `release/*`/`hotfix/*` em `main`), esta decide como o pipeline
  reage a elas.

Leia [references/standards.md](references/standards.md) para etapas mínimas
de pipeline, comparação de estratégias de release e supply chain, com fontes
oficiais.
