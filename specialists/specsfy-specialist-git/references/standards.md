# Padrões comuns e referências Git

Reúne as regras que valem para os dois modos (gitflow e conflicts) e serve de
índice para a referência de cada um.

## Índice dos modos

| Modo | Abre | Conteúdo |
| --- | --- | --- |
| gitflow | [gitflow.md](gitflow.md) | mapa de branches, equivalência `git flow` em Git puro, sinais de adoção e limites do modelo |
| conflicts | [conflicts.md](conflicts.md) | comandos de diagnóstico, conflitos sem marcador e estratégias de resolução |

## Escolha e confirmação

- Gitflow é escolha explícita de quem conduz o projeto. Configuração
  `gitflow.*`, instrução em `.specsfy/RULES.md`, `AGENTS.md` ou
  `CONTRIBUTING.md` confirmam a escolha; uma branch `develop` isolada não
  confirma.
- Operação de merge, rebase ou cherry-pick em andamento é o sinal do modo
  conflicts. A escolha de produto sobre qual mudança prevalece não pertence a
  este especialista.
- Antes de agir, ler o estado real: `git status`, `git branch -a`,
  `git config --get-regexp '^gitflow\.'` e o histórico de merges.

## Preservação

- A resolução preserva a intenção dos dois lados. Estratégia global `ours` ou
  `theirs` descarta mudança real sem revisão.
- Histórico publicado e compartilhado não é reescrito sem alinhamento com quem
  mais trabalha sobre ele.
- `--abort`, force push e reset destrutivo dependem de pedido explícito.

## Comprovação

- O ciclo de Gitflow só está fechado com merge `--no-ff` rastreável, tag em
  `main` e a mesma correção em `develop`.
- A resolução só está concluída com build, typecheck e testes revalidados e sem
  arquivo unmerged ou marcador residual.

## Fontes oficiais

- [Modelo original de Gitflow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Extensão git-flow (AVH Edition)](https://github.com/petervanderdoes/gitflow-avh)
- [git-merge](https://git-scm.com/docs/git-merge)
- [git-rebase](https://git-scm.com/docs/git-rebase)
- [git-tag](https://git-scm.com/docs/git-tag)
- [git-rerere](https://git-scm.com/docs/git-rerere)
- [Pro Git: branching workflows](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows)
