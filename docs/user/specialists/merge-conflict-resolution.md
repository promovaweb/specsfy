# Resolução de Conflitos Git

O especialista Resolução de Conflitos Git orienta o agente a resolver
conflitos de merge, rebase e cherry-pick preservando a intenção de cada lado.
Depois da resolução, ele confere build e testes para provar que o
comportamento integrado está correto.

## Quando usar

- Um `git merge`, `git rebase` ou `git cherry-pick` está em andamento e há
  arquivos marcados como unmerged.
- Você terminou uma resolução e quer revisar o resultado combinado. Nesse
  caso, combine com o especialista Code Review.

A escolha de produto sobre qual mudança deve prevalecer pertence a você. O
especialista resolve o texto e o comportamento resultante.

## Como ele trabalha

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

## Padrões aplicados

- O agente não aplica `--ours`, `--theirs`, `-X ours` ou `-X theirs` em lote.
  Cada trecho recebe a própria resolução.
- Arquivos gerados são regenerados a partir da fonte.
- Mudanças de schema, migrations, testes e contratos de API dos dois lados
  são preservadas quando não colidem.
- Imports, renomeações e chamadas são reavaliados mesmo sem marcador, porque
  um nome antigo usado do outro lado quebra o build sem conflito no Git.
- A resolução não traz refatorações nem comportamento novo.
- `--abort`, force push e reset destrutivo dependem da sua solicitação
  explícita.
- Nenhum arquivo fica unmerged quando o merge ou o rebase é retomado.

## Erros que ele evita

- Considerar o conflito resolvido só porque o arquivo compila.
- Reescrever commits já publicados sem alinhar com os outros desenvolvedores
  da branch.
- Resolver todos os trechos de um arquivo grande de uma vez.
- Reaproveitar uma resolução do `git rerere` sem conferir se o código vizinho
  mudou.

## Como conferir o resultado

- `git status` sem arquivos unmerged e nenhum `<<<<<<<` no diretório de
  trabalho.
- O resultado combinado foi revisado trecho a trecho contra a intenção dos dois
  lados.
- Typecheck, build, testes focais e a suíte de regressão rodaram.
- O histórico resultante e o destino do push foram confirmados antes da
  publicação.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-merge-conflict-resolution \
  --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Code Review](code-review.md) revisa o resultado combinado como qualquer
  mudança nova.
- [Modelagem de Domínio](domain-modeling.md) entra quando os dois lados
  modelaram o mesmo conceito de formas incompatíveis.
- [Gitflow](gitflow.md) define o destino do merge em projetos que seguem esse
  modelo.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-merge-conflict-resolution/SKILL.md),
com comandos de diagnóstico e tipos de conflito sem marcador no arquivo de
referência da mesma pasta.
