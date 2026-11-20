# Gitflow

O especialista Gitflow orienta o agente a aplicar o modelo de branches
Gitflow quando o projeto o adotou de forma explícita. Ele define nomes,
origens e destinos das branches, a política de merge e o fechamento de cada
release e hotfix.

## Quando usar

- Você solicitou o Gitflow ou o projeto já tem configuração `git flow` ou uma
  instrução que declara esse modelo.
- Você precisa nomear, sequenciar ou fechar uma branch `feature/`, `release/`
  ou `hotfix/` em um projeto que segue o Gitflow.

O especialista não propõe o Gitflow sem essa indicação. A simples existência
de uma branch `develop` não basta para concluir que o projeto segue o modelo.
Conflitos em andamento ficam com o especialista Resolução de Conflitos Git. O
pipeline fica com o especialista Engenharia de Entrega.

## Como ele trabalha

1. Confirma a sua solicitação ou aponta a configuração que declara o Gitflow.
2. Verifica as branches existentes com `git branch -a` e
   `git config --get-regexp '^gitflow\.'`.
3. Define com você os nomes das branches permanentes (`main` e `develop`) e os
   prefixos das branches de vida curta.
4. Registra a convenção em `.specsfy/RULES.md` por meio do modo `rules` de
   `$specsfy-setup`, com prefixos, destinos e política de merge.
5. Orienta o ciclo de cada tipo de branch, com `merge --no-ff` em todas as
   integrações:
   - `feature/*` parte de `develop` e volta para `develop`
   - `release/*` parte de `develop` e vai para `main` e `develop`
   - `hotfix/*` parte de `main` e vai para `main` e `develop`
6. Coordena a tag de versão no merge de `release/*` ou `hotfix/*` em `main`,
   de acordo com o versionamento do projeto.
7. Confere que `develop` recebeu todas as correções feitas em `release/*` ou
   `hotfix/*` para encerrar o ciclo.

## Padrões aplicados

- Toda integração usa `git merge --no-ff`, que preserva o registro da branch
  no histórico.
- Os prefixos seguem o mesmo separador em todo o projeto, como
  `feature/<slug>` e `release/<versao>`.
- `release/*` e `hotfix/*` partem do commit correspondente, sem cherry-pick
  seletivo.
- Uma `release/*` aberta recebe somente correções, textos, documentação,
  changelog e versão.
- Cada `hotfix/*` chega a `main` (com tag) e a `develop` na mesma operação.
- As branches de vida curta são apagadas depois do merge confirmado nos dois
  destinos.

## Erros que ele evita

- Push direto ou merge fast-forward em `main` ou `develop`.
- Funcionalidade nova dentro de uma `release/*` já aberta.
- Hotfix aplicado só em `main`, que volta como regressão na próxima release.
- Gitflow em um projeto com deploy contínuo várias vezes ao dia. Nesse
  cenário, o agente sugere avaliar GitHub Flow ou trunk-based com você.

## Como conferir o resultado

- `git log --graph --oneline --all` mostra os merges `--no-ff` como commits de
  merge identificáveis.
- `git branch -a --merged develop` e `git branch -a --merged main` são
  conferidos antes de apagar uma branch.
- Cada release ou hotfix fechado tem tag em `main` e a mesma correção em
  `develop`.
- O `.specsfy/RULES.md` registra a convenção de nomes e a política de merge.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-gitflow --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Resolução de Conflitos Git](merge-conflict-resolution.md) resolve conflitos
  em integrações já abertas.
- [Engenharia de Entrega](delivery-engineering.md) define como o pipeline
  reage a branches e tags.
- [Versionamento](versioning.md) mantém a versão alinhada às tags.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-gitflow/SKILL.md),
com o modelo completo de branches e os comandos equivalentes em Git puro no
arquivo de referência da mesma pasta.
