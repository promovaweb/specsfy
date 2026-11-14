# Engenharia de Entrega

O especialista Engenharia de Entrega orienta o agente no desenho de pipelines
de CI/CD, na promoção de artefatos entre ambientes e nos planos de rollout e
rollback. O objetivo é publicar em produção o mesmo artefato testado em
staging, com rastreabilidade de cada promoção.

## Quando usar

- O projeto tem arquivos de CI/CD, estratégia de release ou promoção entre
  ambientes.
- Você precisa escolher entre rolling, blue-green, canary ou feature flag para
  uma mudança específica.
- O pipeline manipula credenciais de produção ou publica um artefato assinado.
  Nesse caso, combine com o especialista Segurança de Aplicações.

A implantação dentro de um cluster fica com o especialista Docker Swarm. Os
sinais de saúde do rollout ficam com o especialista Observabilidade.

## Como ele trabalha

1. Em um release ou deploy completo, atua sob o especialista Deploy e usa o
   `SEMVER` preparado pelo especialista Versionamento.
2. Identifica commit, artefato, ambientes, aprovações e responsável por cada
   promoção.
3. Torna build e testes reproduzíveis a partir de lockfiles versionados.
4. Produz o artefato imutável uma única vez e promove a mesma referência entre
   os ambientes.
5. Separa credenciais e permissões por job, de modo que o job de build não
   tenha a credencial de publicação em produção.
6. Coordena migrations compatíveis com a versão antiga e a nova da aplicação
   durante o rollout, no modelo expand e contract.
7. Define a estratégia de rollout, os sinais de sucesso, a condição de pausa e
   o mecanismo de rollback para a primeira execução em produção.
8. Registra a origem do artefato, a versão, os testes e o resultado do rollout
   de forma auditável.

## Padrões aplicados

- Credenciais temporárias, como OIDC, substituem segredos estáticos de longa
  duração.
- Actions e dependências do pipeline ficam fixadas por hash ou versão exata,
  sem tags móveis como `@latest`.
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

## Erros que ele evita

- Fazer um build novo em cada ambiente, o que publica em produção um binário
  diferente do testado.
- Feature flag sem responsável e sem data de expiração.
- Remover a coluna antiga no mesmo deploy da migration nova, o que quebra o
  rollback de código.
- Liberar segredos de produção para jobs de pull requests vindos de forks.

## Como conferir o resultado

- Validação estática do pipeline, execução completa em uma branch segura e um
  teste de falha que interrompe a promoção.
- Conferência do digest, do SBOM e da assinatura quando o projeto adota essas
  práticas.
- Ensaio de rollout e de rollback em um ambiente representativo.
- Gates de aprovação, branch protection e permissões conferidos no provedor,
  além do arquivo de workflow.
- Um rollout só é declarado concluído com os sinais de saúde do serviço.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-delivery-engineering \
  --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Deploy](deploy.md) coordena o release e o deploy completos.
- [Versionamento](versioning.md) mantém o `SEMVER` alinhado ao artefato e à
  tag.
- [Ansible](ansible.md) aplica a configuração idempotente nos hosts.
- [Observabilidade](observability.md) define os sinais que mantêm, pausam ou
  revertem um rollout.
- [Docker Swarm](docker-swarm.md) executa o rollout dentro do cluster.
- [Segurança de Aplicações](application-security.md) protege credenciais e a
  cadeia de suprimentos.
- [Performance](performance-engineering.md) define a linha de base antes de
  liberar todo o tráfego.
- [Gitflow](gitflow.md) entrega as branches e tags que o pipeline consome.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-delivery-engineering/SKILL.md),
com etapas mínimas de pipeline e comparação de estratégias de release no
arquivo de referência da mesma pasta.
