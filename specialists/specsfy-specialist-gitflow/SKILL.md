---
name: specsfy-specialist-gitflow
description: "Aplicar e revisar o modelo Gitflow de branches (main, develop, feature/*, release/*, hotfix/*, support/*), convenção de nomes, política de merge e sequência de release/hotfix. Use quando o projeto adotar Gitflow explicitamente ou a pessoa pedir esse fluxo de branches; use também para nomear, sequenciar e fechar feature/release/hotfix num projeto que já declarou Gitflow; não proponha Gitflow por inferência a partir da estrutura do repositório, não use para resolver conflito já aberto (`$specsfy-specialist-merge-conflict-resolution`) nem para desenhar o pipeline de CI/CD (`$specsfy-specialist-delivery-engineering`)."
---

# Gitflow

## Quando usar

- Acionar quando a pessoa pedir explicitamente o modelo Gitflow (branches
  `main`/`master`, `develop`, `feature/*`, `release/*`, `hotfix/*`) ou quando
  já existir configuração `git flow` (`git config --get-regexp '^gitflow\.'`)
  ou instrução do projeto declarando essa escolha.
- Acionar também para nomear, sequenciar ou fechar uma branch
  `feature/`, `release/` ou `hotfix/` dentro de um projeto que já declarou
  Gitflow como estratégia de branch.
- Não acionar para propor Gitflow a um projeto que não pediu isso: a escolha
  do modelo de branch é escolha explícita de quem conduz o projeto, nunca
  inferida pela presença de uma branch chamada `develop` ou pelo volume de
  branches abertas.
- Não acionar para resolver um conflito já em andamento
  (`$specsfy-specialist-merge-conflict-resolution`) nem para desenhar o
  pipeline ou a promoção de artefato entre ambientes
  (`$specsfy-specialist-delivery-engineering`): aqui o foco é a topologia e a
  política das branches, não a resolução textual nem a entrega.

## Fluxo

1. Confirmar que a pessoa pediu Gitflow explicitamente, ou apontar a
   configuração/instrução existente que já declara essa escolha, antes de
   aplicar qualquer convenção, nunca presumir Gitflow a partir da estrutura
   do repositório.
2. Verificar o estado real das branches (`git branch -a`,
   `git config --get-regexp '^gitflow\.'`) para saber se `main`/`master` e
   `develop` já existem e se a nomenclatura das branches auxiliares já
   diverge do padrão adotado.
3. Definir com a pessoa os nomes das branches permanentes (`main` de
   produção, `develop` de integração) e os prefixos das branches de vida
   curta (`feature/`, `release/`, `hotfix/`, `support/` quando aplicável).
4. Registrar a escolha como regra confirmada do projeto (o modo `rules` de
   `$specsfy-setup` grava em `.specsfy/RULES.md`), incluindo prefixos,
   branch-alvo de cada tipo e política de merge, não deixar a convenção
   apenas verbal.
5. Orientar a abertura, a integração e o fechamento de cada tipo de branch:
   `feature/*` parte de e volta para `develop`; `release/*` parte de
   `develop` e vai para `main` e `develop`; `hotfix/*` parte de `main` e vai
   para `main` e `develop`; sempre com `merge --no-ff`.
6. Coordenar a tag de versão no merge de `release/*` ou `hotfix/*` em
   `main`, alinhando com a estratégia de versionamento já adotada pelo
   projeto (semver ou outra).
7. Verificar que `develop` recebeu de volta toda correção aplicada em
   `release/*` ou `hotfix/*` antes de considerar o ciclo fechado:
   divergência aqui reaparece como regressão no próximo release.

## Padrões

- Usar `git merge --no-ff` para toda integração de `feature/*`, `release/*`
  e `hotfix/*`: merge fast-forward apaga o registro de que aquela branch
  existiu, do qual a auditoria de release do Gitflow depende.
- Nomear com prefixo consistente e o mesmo separador em todo o projeto
  (`feature/<slug>`, `release/<versao>`, `hotfix/<versao-ou-slug>`); não
  misturar convenções (`feature-x` e `feature/y` no mesmo repositório).
- Fazer `release/*` e `hotfix/*` partirem exatamente do commit de `develop`
  ou `main` correspondente, sem cherry-pick seletivo de commits ainda não
  integrados.
- Aplicar em `release/*` somente correção de bug, texto, documentação e
  preparação de release (changelog, versão): funcionalidade nova não entra
  numa branch de release já aberta; volta para a próxima `feature/*`.
- Fechar todo `hotfix/*` mesclando em `main` (com tag) e em `develop` (ou na
  `release/*` aberta, se houver uma) na mesma operação: hotfix que só chega
  em `main` desaparece do próximo release.
- Apagar a branch de vida curta (`feature/*`, `release/*`, `hotfix/*`) depois
  do merge confirmado nos dois destinos: branch finalizada e não apagada
  convida retrabalho sobre código já integrado.

## Antipadrões

- Push direto ou merge fast-forward em `main`/`develop` sem passar por
  `feature/`, `release/` ou `hotfix/`: quebra a rastreabilidade que justifica
  adotar Gitflow em vez de um modelo mais simples.
- Funcionalidade nova adicionada dentro de uma `release/*` já aberta "para
  aproveitar a janela": aumenta o escopo testado depois do corte e atrasa a
  liberação sem necessidade.
- Hotfix mesclado apenas em `main`, deixando `develop` divergente: a próxima
  `release/*` cortada de `develop` reintroduz o bug já corrigido em produção.
- Adotar Gitflow num projeto com deploy contínuo várias vezes ao dia: a
  sobrecarga de branches longas de `release`/`hotfix` conflita com entrega
  contínua; nesse contexto, avalie com a pessoa se GitHub Flow ou
  trunk-based atende melhor antes de aplicar Gitflow por hábito.
- Confundir "temos uma branch chamada develop" com "o projeto usa Gitflow":
  sem a política de merge, os prefixos e o ciclo de release completos, é
  apenas uma branch com esse nome, não o modelo.

## Validação

- `git log --graph --oneline --all` (ou `git log --first-parent main`)
  mostrando os merges `--no-ff` de cada `feature/`, `release/` ou `hotfix/`
  como commits de merge identificáveis, não commits lineares indistinguíveis.
- `git branch -a --merged develop` e `git branch -a --merged main`
  conferidos antes de apagar uma branch de vida curta, garantindo que o
  merge realmente aconteceu nos dois destinos esperados.
- Tag de versão presente em `main` para cada `release/*` ou `hotfix/*`
  fechado (`git tag --contains <commit-do-merge>`), com a mesma correção
  presente em `develop` (`git log develop --oneline | grep <commit>` ou
  equivalente).
- `.specsfy/RULES.md` (ou instrução equivalente do projeto) registrando a
  convenção de nomes e a política de merge, revisitada pelo modo `rules` de
  `$specsfy-setup` quando alguém a violar.
- Não declarar "o projeto segue Gitflow" apenas porque existe uma branch
  `develop`; a comprovação exige prefixos consistentes, merges `--no-ff`
  rastreáveis e o ciclo de `release`/`hotfix` fechado nos dois destinos.

## Skills relacionadas

- `$specsfy-specialist-merge-conflict-resolution` quando uma integração de
  `feature/`, `release/` ou `hotfix/` já em andamento gerar conflito: esta
  skill decide a topologia e a política de branch, a outra resolve o
  conflito textual ou semântico já aberto.
- `$specsfy-specialist-delivery-engineering` quando o merge em `main` ou a
  tag de release precisar disparar pipeline, build de artefato ou promoção
  entre ambientes: esta skill entrega a branch e a tag corretas, a outra
  decide como o pipeline reage a elas.

Leia [references/standards.md](references/standards.md) para o mapa completo
de branches, os comandos `git flow` equivalentes em Git puro e as fontes
oficiais do modelo.
