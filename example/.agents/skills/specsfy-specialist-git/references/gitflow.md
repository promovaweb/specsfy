# Padrões e referências do modo gitflow

## Mapa de branches

| Branch       | Origem              | Destino no merge      | Vida útil                          |
| ------------ | ------------------- | ---------------------- | ----------------------------------- |
| `main`       | —                    | —                       | Permanente; sempre reflete produção |
| `develop`    | `main` (uma vez)     | —                       | Permanente; integração contínua     |
| `feature/*`  | `develop`            | `develop`               | Curta; uma feature por branch       |
| `release/*`  | `develop`            | `main` e `develop`      | Curta; só correção e preparação     |
| `hotfix/*`   | `main`               | `main` e `develop` ou release em curso | Curta; correção urgente em produção |
| `support/*`  | `main` (tag antiga)  | conforme decisão local  | Longa; manutenção de versão anterior|

## Equivalência `git flow` (AVH) → Git puro

Os exemplos em Git puro aplicam a política de merge do Specsfy. São
sequências de referência para o caso simples, com configuração compatível e
sem release em curso. A extensão pode usar prefixos
de tag diferentes ou fazer fast-forward no fechamento de uma feature de um
só commit. O repositório oficial do AVH está arquivado desde 2023.

- `git flow feature start <nome>` →
  `git checkout -b feature/<nome> develop`
- `git flow feature finish <nome>` ≡
  `git checkout develop && git merge --no-ff feature/<nome> && git branch -d feature/<nome>`
- `git flow release start <versao>` ≡
  `git checkout -b release/<versao> develop`
- `git flow release finish <versao>` ≡
  `git checkout main && git merge --no-ff release/<versao> && git tag -a <versao> && git checkout develop && git merge --no-ff release/<versao> && git branch -d release/<versao>`
- `git flow hotfix start <versao>` ≡
  `git checkout -b hotfix/<versao> main`
- `git flow hotfix finish <versao>` ≡
  `git checkout main && git merge --no-ff hotfix/<versao> && git tag -a <versao> && git checkout develop && git merge --no-ff hotfix/<versao> && git branch -d hotfix/<versao>`

## Sinais de que o projeto já declarou Gitflow

- `git config --get-regexp '^gitflow\.'` retorna as chaves de prefixo
  (`gitflow.prefix.feature`, `.release`, `.hotfix`, `.branch.master`,
  `.branch.develop`) gravadas pela extensão `git flow init`.
- `.specsfy/RULES.md`, `AGENTS.md`, `CLAUDE.md` ou `CONTRIBUTING.md`
  descrevem explicitamente o fluxo `main`/`develop`/`feature`/`release`/
  `hotfix`.
- Nenhum desses sinais substitui o pedido direto da pessoa; na ausência de
  configuração ou instrução explícita, não presuma Gitflow.

## Por que Gitflow nem sempre é a escolha certa

Vincent Driessen, autor do modelo original, publicou em 2020 uma nota no
artigo original reconhecendo que Gitflow foi desenhado para um cenário de
releases versionadas e espaçadas, e que projetos com entrega contínua
tendem a se beneficiar mais de um modelo mais simples (trunk-based ou GitHub
Flow). Proponha a alternativa quando o projeto fizer múltiplos deploys por
dia; não insista em Gitflow como padrão universal.

## Fontes oficiais

- Modelo original (Vincent Driessen, "A successful Git branching model"):
  https://nvie.com/posts/a-successful-git-branching-model/
- Repositório arquivado da extensão `git-flow` (AVH Edition):
  https://github.com/petervanderdoes/gitflow-avh
- git-merge (`--no-ff`): https://git-scm.com/docs/git-merge
- git-tag: https://git-scm.com/docs/git-tag
- Pro Git — Branching Workflows (Gitflow):
  https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows
- Semantic Versioning (para a tag de `release`/`hotfix`):
  https://semver.org/
