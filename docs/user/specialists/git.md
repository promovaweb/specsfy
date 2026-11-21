# Git

O especialista Git orienta o agente na topologia e na política de branches do
Gitflow e na resolução de conflitos de merge, rebase e cherry-pick. Ele
trabalha em dois modos: **Gitflow**, para aplicar o modelo quando o projeto o
adotou de forma explícita, e **Conflitos**, para resolver uma integração já em
andamento preservando a intenção de cada lado.

## Quando usar

- Você solicitou o Gitflow ou o projeto já tem configuração `git flow` ou uma
  instrução que declara esse modelo.
- Você precisa nomear, sequenciar ou fechar uma branch `feature/`, `release/`
  ou `hotfix/` em um projeto que segue o Gitflow.
- Um `git merge`, um `git rebase` ou um `git cherry-pick` está em andamento e
  há arquivos marcados como unmerged.
- Você terminou uma resolução e quer revisar o resultado combinado. Nesse caso,
  combine com o especialista [Code Review](code-review.md).

O especialista não propõe o Gitflow sem essa indicação. A simples existência de
uma branch `develop` não basta para concluir que o projeto segue o modelo. A
escolha de produto sobre qual mudança deve prevalecer pertence a você.

## Como ele trabalha

1. Lê o estado real do repositório com `git status`, `git branch -a`,
   `git config --get-regexp '^gitflow\.'` e o histórico de merges.
2. Confirma se você pediu o Gitflow ou identifica a operação de integração já
   em andamento.
3. Escolhe o modo e conduz o ciclo ou a resolução a partir da intenção real de
   cada lado.
4. Registra a convenção em `.specsfy/RULES.md` por meio do modo `rules` de
   `$specsfy-setup` ou registra o trade-off descartado na resolução.
5. Confere o resultado antes de encerrar o ciclo ou publicar a integração.

## Gitflow

1. Confirma a sua solicitação ou aponta a configuração que declara o Gitflow.
2. Verifica as branches existentes e a nomenclatura das branches auxiliares.
3. Define com você os nomes das branches permanentes (`main` e `develop`) e os
   prefixos das branches de vida curta.
4. Registra a convenção em `.specsfy/RULES.md`, com prefixos, destinos e
   política de merge.
5. Orienta o ciclo de cada tipo de branch, com `merge --no-ff` em todas as
   integrações:
   - `feature/*` parte de `develop` e volta para `develop`
   - `release/*` parte de `develop` e vai para `main` e `develop`
   - `hotfix/*` parte de `main` e vai para `main` e `develop`
6. Coordena a tag de versão no merge de `release/*` ou `hotfix/*` em `main`,
   de acordo com o versionamento do projeto.
7. Confere que `develop` recebeu todas as correções feitas em `release/*` ou
   `hotfix/*` para encerrar o ciclo.

Padrões do modo Gitflow:

- Toda integração usa `git merge --no-ff`, que preserva o registro da branch no
  histórico.
- Os prefixos seguem o mesmo separador em todo o projeto, como
  `feature/<slug>` e `release/<versao>`.
- `release/*` e `hotfix/*` partem do commit correspondente, sem cherry-pick
  seletivo.
- Uma `release/*` aberta recebe somente correções, textos, documentação,
  changelog e versão.
- Cada `hotfix/*` chega a `main` com tag e a `develop` na mesma operação.
- As branches de vida curta são apagadas depois do merge confirmado nos dois
  destinos.
- Uma branch `support/*` mantém versão anterior quando o projeto precisa
  sustentar mais de uma linha de release.

## Conflitos

1. Inspeciona o merge, o rebase ou o cherry-pick em andamento, os commits
   envolvidos e os arquivos unmerged.
2. Recupera a intenção de cada lado em cada trecho em conflito.
3. Classifica o conflito como textual, estrutural, semântico ou gerado:
   - textual, quando a mesma linha tem textos diferentes
   - estrutural, quando o mesmo bloco foi reorganizado
   - semântico, quando não há marcador, mas os comportamentos não combinam
   - gerado, quando o arquivo vem de um lockfile ou de um build
4. Constrói um resultado que preserva as duas intenções quando elas são
   compatíveis.
5. Quando as intenções não combinam, escolhe pelo objetivo da integração
   descrito na spec ou na issue e registra a alternativa descartada.
6. Remove os marcadores, valida a sintaxe e roda lint e typecheck nos arquivos
   alterados.
7. Retoma o comando com `git merge --continue` ou `git rebase --continue` e
   executa a suíte de regressão relevante.

Padrões do modo Conflitos:

- O agente não aplica `--ours`, `--theirs`, `-X ours` ou `-X theirs` em lote.
  Cada trecho recebe a própria resolução.
- Arquivos gerados são regenerados a partir da fonte.
- Mudanças de schema, migrations, testes e contratos de API dos dois lados são
  preservadas quando não colidem.
- Imports, renomeações e chamadas são reavaliados mesmo sem marcador, porque um
  nome antigo usado do outro lado quebra o build sem conflito no Git.
- A resolução não traz refatorações nem comportamento novo.
- `--abort`, force push e reset destrutivo dependem da sua solicitação
  explícita.
- Nenhum arquivo fica unmerged quando o merge ou o rebase é retomado.

## Erros que ele evita

- Push direto ou merge fast-forward em `main` ou `develop`.
- Funcionalidade nova dentro de uma `release/*` já aberta.
- Hotfix aplicado só em `main`, que volta como regressão na próxima release.
- Gitflow em um projeto com deploy contínuo várias vezes ao dia. Nesse
  cenário, o agente sugere avaliar GitHub Flow ou trunk-based com você.
- Confundir uma branch chamada `develop` com a adoção completa do Gitflow.
- Considerar o conflito resolvido só porque o arquivo compila.
- Reescrever commits já publicados sem alinhar com os outros desenvolvedores
  da branch.
- Resolver todos os trechos de um arquivo grande de uma vez.
- Reaproveitar uma resolução do `git rerere` sem conferir se o código vizinho
  mudou.

## Como conferir o resultado

- `git log --graph --oneline --all` mostra os merges `--no-ff` como commits de
  merge identificáveis.
- `git branch -a --merged develop` e `git branch -a --merged main` são
  conferidos antes de apagar uma branch.
- Cada release ou hotfix fechado tem tag em `main` e a mesma correção em
  `develop`.
- O `.specsfy/RULES.md` registra a convenção de nomes e a política de merge.
- `git status` não mostra arquivos unmerged e nenhum `<<<<<<<` permanece no
  diretório de trabalho.
- O resultado combinado foi revisado trecho a trecho contra a intenção dos dois
  lados.
- Typecheck, build, testes focais e a suíte de regressão rodaram.
- O histórico resultante e o destino do push foram confirmados antes da
  publicação.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-git --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Delivery](delivery.md) consome a branch e a tag na versão e na promoção.
- [Code Review](code-review.md) revisa o resultado combinado como qualquer
  mudança nova.
- [Modelagem](modeling.md) entra quando os dois lados modelaram o mesmo
  conceito de formas incompatíveis.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-git/SKILL.md),
com os padrões comuns em
[standards.md](../../../specialists/specsfy-specialist-git/references/standards.md),
o modelo completo de branches em
[gitflow.md](../../../specialists/specsfy-specialist-git/references/gitflow.md)
e os comandos de diagnóstico em
[conflicts.md](../../../specialists/specsfy-specialist-git/references/conflicts.md).
