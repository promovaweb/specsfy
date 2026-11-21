---
name: specsfy-specialist-git
description: Aplicar o modelo Gitflow de branches e resolver conflitos de merge, rebase e cherry-pick pela intenção de cada lado. Use no modo gitflow para `main`/`develop`/`feature`/`release`/`hotfix`/`support`, convenção de nomes, política de merge e ciclo de release ou hotfix, e no modo conflicts quando já existe operação em andamento com arquivos unmerged, distinguindo conflito textual, estrutural, semântico e gerado. Não proponha Gitflow por inferência da estrutura do repositório; para o pipeline e a promoção de artefato use `$specsfy-specialist-delivery`, para revisar o resultado combinado use `$specsfy-specialist-code-review` e para modelagem incompatível entre os dois lados use `$specsfy-specialist-modeling`.
---

# Git

Cobre a topologia e a política de branches do Gitflow e a resolução de
conflitos já abertos. O modo gitflow decide nomes, origens, destinos e o
fechamento de cada ciclo; o modo conflicts resolve texto e comportamento sem
reabrir a escolha de produto.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| A pessoa pediu Gitflow explicitamente, existe configuração `git flow` ou instrução do projeto que declara o modelo; nomear, sequenciar ou fechar `feature/`, `release/` ou `hotfix/` | gitflow | [Mapa de branches e equivalência em Git puro](references/gitflow.md) |
| Um `git merge`, `git rebase` ou `git cherry-pick` está em andamento com arquivos unmerged; classificar conflito textual, estrutural, semântico ou gerado | conflicts | [Diagnóstico, conflitos sem marcador e estratégias](references/conflicts.md) |

Não use para:

- Propor Gitflow a um projeto que não pediu o modelo. A escolha pertence a quem
  conduz o projeto; a simples existência de uma branch `develop` não comprova
  Gitflow.
- Desenhar pipeline, promoção de artefato ou reação a tag. Use
  `$specsfy-specialist-delivery`.
- Revisar o diff combinado como qualquer mudança nova. Use
  `$specsfy-specialist-code-review`.
- Decidir qual mudança deveria prevalecer em termos de produto; isso é escolha
  de quem pediu a integração. Quando o conflito revelar dois modelos de domínio
  incompatíveis, use `$specsfy-specialist-modeling`.

## No Specsfy

Este especialista trabalha dentro do fluxo do método: a spec decide, a fase
escreve e a conclusão volta para a spec.

1. Antes de agir, ler a spec aberta, cujo caminho vem da skill que chamou ou de
   `specsfy status`, em especial a linha `| Especialistas |`, a subseção
   `#### Especialistas` dentro de `### 8. Plano técnico` e a seção que a fase
   está escrevendo, mais `.specsfy/STACK.md` e `.specsfy/RULES.md`. Abrir
   `.specsfy/DATABASE.md` ou `.specsfy/PACKAGES.md` quando o conflito tocar
   schema ou dependência.
2. Seguir o modo indicado na spec ou na tarefa
   (`Especialista: $specsfy-specialist-git (gitflow)` ou `(conflicts)`); sem
   indicação, escolher pelo "Quando usar".
3. Devolver as conclusões para a seção da spec ou para a tarefa que a fase está
   escrevendo, nunca em arquivo paralelo. Se faltar informação, registrar como
   dúvida aberta da spec.
4. Nunca mudar o estado da spec nem marcar gates: isso é de
   `specsfy-03-specify`, `specsfy-04-validate`, `specsfy-05-tasks` e
   `specsfy-06-implement`.
5. Registrar a convenção adotada em `.specsfy/RULES.md` pelo modo `rules` de
   `$specsfy-setup` (prefixos, branch-alvo e política de merge) e, no conflito,
   a intenção preservada de cada lado na seção da spec.

## Fluxo

1. Ler o estado real antes de agir: `git status`, `git branch -a`,
   `git config --get-regexp '^gitflow\.'` e o histórico de merges.
2. Confirmar o pedido explícito de Gitflow ou a operação já em andamento. Nunca
   presumir o modelo de branch pela estrutura do repositório.
3. Escolher o modo: gitflow para topologia e ciclo de release, conflicts para
   conflito textual ou semântico aberto.
4. Registrar a escolha como regra do projeto (o modo `rules` de
   `$specsfy-setup` grava em `.specsfy/RULES.md`) ou registrar o trade-off
   descartado na resolução.
5. Validar com as comprovações da seção Validação antes de encerrar o ciclo ou
   publicar a integração.

### Modo gitflow

1. Apontar a configuração ou instrução que declara Gitflow antes de aplicar
   qualquer convenção.
2. Verificar se `main`/`master` e `develop` existem e se a nomenclatura das
   branches auxiliares já diverge do padrão adotado.
3. Definir com a pessoa os nomes das branches permanentes (`main` de produção e
   `develop` de integração) e os prefixos das branches de vida curta
   (`feature/`, `release/`, `hotfix/` e `support/` quando aplicável).
4. Registrar prefixos, branch-alvo de cada tipo e política de merge no
   `.specsfy/RULES.md`, não apenas na conversa.
5. Orientar abertura, integração e fechamento: `feature/*` parte de e volta para
   `develop`; `release/*` parte de `develop` e vai para `main` e `develop`;
   `hotfix/*` parte de `main` e vai para `main` e `develop`, sempre com
   `merge --no-ff`.
6. Coordenar a tag de versão no merge de `release/*` ou `hotfix/*` em `main`,
   alinhada ao versionamento já adotado pelo projeto.
7. Conferir que `develop` recebeu de volta toda correção aplicada em `release/*`
   ou `hotfix/*` antes de considerar o ciclo fechado.

### Modo conflicts

1. Inspecionar a operação exata (merge, rebase, cherry-pick), os commits
   envolvidos e os arquivos unmerged.
2. Recuperar a intenção de cada lado em cada hunk: o que a mudança tentava
   alcançar, não apenas o texto literal.
3. Classificar o conflito como textual (mesma linha, texto diferente),
   estrutural (mesmo bloco reorganizado), semântico (sem marcador, mas
   comportamento incompatível) ou gerado (lockfile, build, código gerado).
4. Construir o resultado que preserva as duas intenções quando elas são
   compatíveis; escolher um lado inteiro raramente é a resolução correta.
5. Quando as intenções forem genuinamente incompatíveis, escolher pelo objetivo
   da integração descrito na spec ou issue e registrar o trade-off descartado.
6. Remover todos os marcadores, validar sintaxe e rodar lint e typecheck nos
   arquivos tocados.
7. Continuar a operação com `git merge --continue` ou `git rebase --continue` e
   executar a suíte de regressão relevante antes de publicar.

## Padrões

No modo gitflow:

- Usar `git merge --no-ff` em toda integração de `feature/*`, `release/*` e
  `hotfix/*`: merge fast-forward apaga o registro de que a branch existiu.
- Nomear com prefixo consistente e o mesmo separador em todo o projeto
  (`feature/<slug>`, `release/<versao>`, `hotfix/<versao-ou-slug>`).
- Fazer `release/*` e `hotfix/*` partirem exatamente do commit de `develop` ou
  `main` correspondente, sem cherry-pick seletivo de commits não integrados.
- Aplicar em `release/*` somente correção de bug, texto, documentação e
  preparação de release; funcionalidade nova volta para a próxima `feature/*`.
- Fechar todo `hotfix/*` em `main` com tag e em `develop` (ou na `release/*`
  aberta) na mesma operação.
- Apagar a branch de vida curta depois do merge confirmado nos dois destinos.

No modo conflicts:

- Nunca usar `git checkout --ours`/`--theirs` ou `-X ours`/`-X theirs` em lote
  por conveniência; cada hunk pode ter resolução correta diferente.
- Não editar arquivo gerado sem atualizar a fonte que o gera e regenerar.
- Preservar mudanças de schema, migrations, testes e contratos de API dos dois
  lados quando não colidem de fato.
- Reavaliar imports, renomes e chamadas mesmo em arquivo sem marcador textual:
  rename de um lado e uso do nome antigo do outro quebra build ou runtime sem
  conflito Git.
- Não introduzir comportamento novo além do necessário para resolver o
  conflito; a resolução não é oportunidade de refactor.
- Não usar `--abort`, force push ou reset destrutivo sem pedido explícito de
  quem conduz a integração.
- Conferir que nenhum arquivo permanece unmerged e que o índice está limpo antes
  de continuar.

## Antipadrões

- Push direto ou merge fast-forward em `main`/`develop` sem passar por
  `feature/`, `release/` ou `hotfix/`.
- Funcionalidade nova dentro de uma `release/*` já aberta para aproveitar a
  janela, aumentando o escopo testado depois do corte.
- Hotfix mesclado apenas em `main`, deixando `develop` divergente e
  reintroduzindo o bug no próximo release.
- Adotar Gitflow em projeto com deploy contínuo várias vezes ao dia sem avaliar
  GitHub Flow ou trunk-based com a pessoa.
- Confundir "existe uma branch `develop`" com "o projeto usa Gitflow".
- Resolver compilando apenas: o arquivo perde os marcadores e builda, mas o
  comportamento nunca foi comparado à intenção de nenhum dos lados.
- Rebase que reescreve commits já publicados e compartilhados sem alinhar com
  quem trabalha sobre eles.
- Resolver todos os hunks de um arquivo grande de uma vez, aceitando hunk errado
  por fadiga.
- Confiar em `git rerere` sem reconfirmar que o contexto ao redor não mudou.

## Validação

- `git log --graph --oneline --all` (ou `git log --first-parent main`) mostrando
  os merges `--no-ff` de cada branch como commits de merge identificáveis.
- `git branch -a --merged develop` e `git branch -a --merged main` conferidos
  antes de apagar uma branch de vida curta.
- Tag de versão presente em `main` para cada `release/*` ou `hotfix/*` fechado
  (`git tag --contains <commit-do-merge>`), com a mesma correção presente em
  `develop`.
- `.specsfy/RULES.md` registrando convenção de nomes e política de merge,
  revisitada pelo modo `rules` de `$specsfy-setup` quando alguém a violar.
- `git status` sem arquivo unmerged e `grep` sem `<<<<<<<` residual no diretório
  de trabalho.
- Diff combinado revisado hunk a hunk contra a intenção reconstruída de ambos os
  lados, com typecheck, build, testes focais e suíte de regressão executados.
- Histórico resultante e destino do push (branch, force ou não) confirmados
  antes de publicar uma resolução que reescreveu histórico.
- Não declarar "o projeto segue Gitflow" por causa de uma branch `develop`, nem
  a integração "resolvida" sem build e teste revalidados; resolução sem
  comprovação é apenas ausência de marcador.

## Skills relacionadas

- `$specsfy-specialist-delivery` entrega o `SEMVER`, a tag e a promoção que
  consomem a branch e o merge deste especialista.
- `$specsfy-specialist-code-review` revisa o resultado combinado como qualquer
  diff novo, inclusive o que a resolução introduziu.
- `$specsfy-specialist-modeling` entra quando o conflito semântico revela dois
  modelos do mesmo conceito de domínio incompatíveis.

Leia [references/standards.md](references/standards.md) para os padrões comuns,
o índice dos modos e as fontes oficiais, [references/gitflow.md](references/gitflow.md)
para o mapa de branches e a equivalência em Git puro e
[references/conflicts.md](references/conflicts.md) para diagnóstico, conflitos
sem marcador e estratégias de resolução.
