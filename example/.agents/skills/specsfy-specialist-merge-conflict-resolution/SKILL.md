---
name: specsfy-specialist-merge-conflict-resolution
description: Resolver conflitos Git de merge ou rebase pela intenção de cada lado, distinguindo conflito textual de conflito semântico, preservando comportamento e revalidando a integração. Use quando já existe uma operação em andamento com arquivos unmerged; não abortar a operação, reescrever histórico remoto ou escolher um lado inteiro (`ours`/`theirs` global) sem autorização explícita.
---

# Resolução de conflitos

## Quando usar

- Acionar quando um `git merge`, `git rebase` ou `git cherry-pick` já está
  em andamento e há arquivos marcados como unmerged.
- Não acionar para decidir qual branch deveria ter ganho a mudança em
  termos de produto: isso é escolha de quem pediu a integração; esta skill
  resolve o texto e o comportamento resultante, não reabre a escolha de
  negócio.
- Combinar com `$specsfy-specialist-code-review` depois da resolução: o
  resultado combinado precisa da mesma revisão que qualquer diff novo teria.

## Fluxo

1. Inspecionar o estado exato da operação (merge, rebase, cherry-pick),
   quais branches/commits estão envolvidos e quais arquivos estão unmerged.
2. Para cada hunk em conflito, recuperar a intenção de cada lado: o que a
   mudança tentava alcançar, não apenas o texto literal.
3. Classificar o conflito: textual (mesma linha, texto diferente),
   estrutural (mesma função/bloco reorganizado), semântico (sem marcador de
   texto, mas comportamento incompatível, ex.: assinatura mudou de um lado,
   caller não ajustado do outro) ou gerado (lockfile, arquivo build).
4. Construir o resultado que preserva as duas intenções quando elas são
   compatíveis: a resolução correta raramente é escolher um lado inteiro.
5. Quando as intenções são genuinamente incompatíveis, escolher pelo
   objetivo da integração (o que a spec/issue que motivou a integração
   pede) e registrar o trade-off descartado.
6. Remover todos os marcadores de conflito, validar sintaxe/parse do
   arquivo e rodar os checks focais (lint, typecheck) nos arquivos tocados.
7. Continuar a operação (`git merge --continue`/`git rebase --continue`) e
   executar a suíte de regressão relevante antes de publicar.

## Padrões

- Nunca usar `git checkout --ours`/`--theirs` (ou resolução estratégica
  `-X ours`/`-X theirs`) em lote por conveniência: cada hunk pode ter uma
  resolução correta diferente; aplicar uma estratégia global descarta
  mudanças reais de um dos lados sem revisão.
- Não editar um arquivo gerado (lockfile, build output, código gerado) sem
  atualizar a fonte que o gera e regenerar: editar o gerado diretamente
  diverge na próxima geração.
- Preservar mudanças de schema, migrations, testes e contratos de API de
  ambos os lados quando elas não colidem de fato: um conflito num arquivo
  vizinho não autoriza descartar uma mudança de schema em outro.
- Reavaliar imports, renomes e chamadas mesmo em arquivos sem marcador
  textual: um rename de um lado e um novo uso do nome antigo do outro lado
  não gera conflito Git, mas quebra em runtime ou build.
- Não introduzir comportamento novo além do estritamente necessário para
  resolver o conflito: a resolução não é uma oportunidade de refactor.
- Não usar `--abort`, force push ou reset destrutivo sem pedido explícito de
  quem está conduzindo a integração: a operação em andamento pode
  representar trabalho de resolução já feito por outra pessoa.
- Conferir ao final que nenhum arquivo permanece unmerged e que o índice
  está limpo antes de continuar a operação.

## Antipadrões

- Resolver "compilando" apenas: o arquivo perde os marcadores e builda, mas
  o comportamento resultante nunca foi comparado contra a intenção de
  nenhum dos dois lados, conflito semântico sobrevive disfarçado de
  resolvido.
- Rebase que reescreve commits já publicados e compartilhados sem alinhar
  com quem mais trabalha sobre eles: quebra o histórico de outra pessoa
  silenciosamente.
- Resolver todos os hunks de um arquivo grande de uma vez sem revisar cada
  um isoladamente: aumenta a chance de aceitar um hunk errado por fadiga.
- Confiar em `git rerere` para repetir uma resolução anterior sem
  reconfirmar que o contexto ao redor não mudou o suficiente para invalidar
  a resolução gravada.

## Validação

- `git status` sem nenhum arquivo unmerged e sem marcador de conflito
  residual em nenhum arquivo (`grep` por `<<<<<<<` no diretório de trabalho).
- Diff combinado revisado hunk a hunk contra a intenção reconstruída de
  ambos os lados.
- Typecheck, build e testes focais dos arquivos tocados executados, mais a
  suíte de regressão relevante ao comportamento integrado.
- Histórico resultante e o destino do push (branch, force ou não)
  confirmados antes de publicar, nunca publicar uma resolução sem essa
  checagem quando o histórico foi reescrito.
- Não declarar a integração "resolvida" sem essa comprovação: resolução sem
  build/teste revalidado é apenas ausência de marcador, não correção
  comprovada.

## Skills relacionadas

- `$specsfy-specialist-code-review` para revisar o resultado combinado como
  qualquer diff novo, já que a resolução pode introduzir comportamento não
  coberto pelos PRs originais isoladamente.
- `$specsfy-specialist-domain-modeling` quando o conflito semântico revelar
  que dois lados modelaram o mesmo conceito de domínio de forma
  incompatível: o conflito é sintoma de um boundary não alinhado.
- `$specsfy-specialist-gitflow` quando o merge/rebase em conflito envolver
  `feature/`, `release/` ou `hotfix/` de um projeto que declarou Gitflow:
  aquela skill decide a topologia e o destino do merge, esta resolve o
  conflito textual ou semântico já aberto.

Leia [references/standards.md](references/standards.md) para comandos de
diagnóstico, tipos de conflito sem marcador textual e fontes oficiais do Git.
