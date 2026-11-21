# Padrões e referências do modo conflicts

## Comandos de diagnóstico

- `git status`: identifica a operação em andamento (merge/rebase/cherry-pick)
  e a lista exata de caminhos unmerged.
- `git ls-files -u`: lista os estágios disponíveis em cada conflito — stage 1 (ancestral
  comum/base), stage 2 (ours), stage 3 (theirs) — com os respectivos blobs. Um estágio pode faltar, como o ancestral
  comum em um conflito de adição dos dois lados.
- `git show :1:path`, `git show :2:path`, `git show :3:path`: mostra o
  conteúdo completo de cada versão do arquivo em conflito (base, ours,
  theirs respectivamente), útil quando os marcadores inline não bastam para
  entender a intenção de cada lado.
- `git log --merge`: lista os commits que tocaram os caminhos em conflito
  em ambos os lados, para reconstruir a intenção de cada mudança.
- `git diff --cc` (ou `git diff` durante o conflito): mostra o resultado
  combinado atual comparado às duas origens, no formato "diff combinado".
- `git log --oneline <base>..HEAD` e `git log --oneline <base>..<other>`:
  reconstrói o que cada lado adicionou desde o ancestral comum em um merge.
  Para rebase, confira o patch atual com `git rebase --show-current-patch`.
  Com `ort`, `git diff AUTO_MERGE` mostra as edições feitas desde o resultado
  automático enquanto essa referência estiver presente.

## Conflitos sem marcador textual (os mais perigosos)

Estes não aparecem como `<<<<<<<` no arquivo, mas quebram build ou
comportamento depois da resolução "limpa":

- Rename de um lado + um caller que ainda importa/chama o nome antigo do
  outro lado — Git resolve o rename automaticamente sem marcar conflito,
  mas o caller não ajustado quebra em build ou runtime.
- Mudanças concorrentes em migration/schema que, individualmente, aplicam
  sem erro, mas juntas produzem um schema inconsistente (duas migrations
  que alteram a mesma coluna de formas incompatíveis).
- Assinatura de função alterada em um lado e um novo caller adicionado no
  outro lado usando a assinatura antiga.
- Lockfile resolvido automaticamente (ou por `-X ours`) sem os manifests
  (`package.json`, `composer.json`) ficarem coerentes com ele.
- Testes adicionados independentemente por ambos os lados que, juntos,
  agora interagem (mesmo fixture, mesmo dado global, mesma porta).

Depois de resolver os marcadores textuais, procure ativamente por esses
padrões nos arquivos vizinhos ao conflito antes de considerar a integração
completa.

## Estratégias de resolução e quando cada uma é segura

- **Merge manual hunk a hunk**: padrão seguro para a maioria dos casos;
  exige entender a intenção de cada lado antes de combinar.
- **`-X ours`/`-X theirs`**: são opções da estratégia `ort` para a operação
  inteira. Favorecem um lado nos trechos conflitantes (ou no arquivo inteiro,
  quando binário) e integram mudanças sem conflito. Se a escolha só vale para
  um caminho, resolva esse caminho individualmente. O Specsfy veta esse
  atalho para código de lógica de negócio. A estratégia `-s ours`
  tem outro efeito: descarta a árvore do outro lado.
- **`git checkout --ours`/`--theirs <path>`**: descarta inteiramente um
  lado para aquele arquivo — só use quando um lado inteiro do arquivo é
  definitivamente obsoleto, com confirmação explícita. Durante rebase,
  `ours` é a série já reaplicada sobre a nova base e `theirs` é o commit
  da branch original sendo reaplicado.
- **`git rerere`**: grava resoluções para reaplicar automaticamente em
  conflitos idênticos futuros (útil em rebase longo com múltiplos commits
  gerando o mesmo conflito) — reconfirme que o contexto ao redor não mudou
  antes de confiar na resolução gravada. Use `--no-rerere-autoupdate`
  quando quiser revisar antes de adicionar ao índice.
- **Rebase vs merge**: merge preserva o histórico de ambos os lados exatamente
  como ocorreu, criando um commit de merge quando a integração não é
  fast-forward; rebase reaplica os commits de
  um lado sobre o outro, produzindo histórico linear mas alterando hashes de
  commit — nunca reescrever (rebase/force push) commits já publicados e
  usados por outras pessoas sem coordenação.

## Fontes oficiais

- git-merge: https://git-scm.com/docs/git-merge
- git-rebase: https://git-scm.com/docs/git-rebase
- git-rerere: https://git-scm.com/docs/git-rerere
- git-diff (formato combinado `--cc`): https://git-scm.com/docs/git-diff
- git-ls-files: https://git-scm.com/docs/git-ls-files
- Pro Git — Branching e merge básico: https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging
- Pro Git — Rebase: https://git-scm.com/book/en/v2/Git-Branching-Rebasing
