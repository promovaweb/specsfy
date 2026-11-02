# Contexto dos fluxos

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="../../../../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../../../../brand/logo/icon.png" alt="Logo do Specsfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | índice |
| Escopo | fluxos que atravessam módulos |
| Autoridade | regras e navegação de fluxos transversais |

## Papel

Indexar fluxos que atravessam módulos e explicar como documentá-los sem criar uma
segunda fonte de requisitos.

## Como usar

Consulte quando uma jornada depender de três ou mais componentes ou quando a
ordem de eventos for difícil de compreender apenas por texto linear.

## Atualize quando

- um fluxo transversal for criado, movido ou removido.
- seus componentes ou links para specs mudarem.
- o contrato de documentação de fluxos mudar.

## Não use para

- copiar Gherkin, regras e exceções de uma feature.
- documentar chamadas internas triviais.
- manter fluxo sem spec ou fonte executável relacionada.

## Fonte da verdade e precedência

`specs/<estado>/<NNNN>-<slug>/spec.md` governa comportamento, erros e aceite.
Código e testes demonstram a execução. Um documento de fluxo apenas mostra
sequência, responsabilidades e links para essas fontes.

## Fluxos transversais

- [Release do CLI](cli-release.md): prepara pacote, changelog e executável em
  `cli/`, cria a tag no commit validado do monorepo, publica o pacote npm e usa
  as mesmas notas no GitHub Release.

O fluxo canônico do método permanece na
[visão arquitetural](../architecture/README.md) porque é uma invariante do
projeto, não uma feature independente.

Antes dos três atos, o fluxo de entrada é:

```text
input → inbox → backlog → spec
```

Inbox preserva sem perguntar. Backlog registra o item e refina as decisões.
Somente a spec governa comportamento, gates, tarefas e evidência. A captura
fica em `specs/inbox/` até que specs com Definition Gate aprovado cubram o
pedido inteiro; então `validate` a move para `specs/inbox/processed/` com
`specsfy inbox process`, sem apagar texto nem vínculos.

Durante os três atos, as etapas são bidirecionais:

<!-- markdownlint-disable MD013 -->
```text
inbox → backlog → specify ↔ validate → tasks ↔ tdd-bdd → implement → documentator ↔ progress
                         ↑       ↑            ↑
                         └──── update-spec ───┘
```
<!-- markdownlint-enable MD013 -->

Cada skill resolve pendências pertencentes ao próprio escopo. Quando o estado
exigir outra responsabilidade, ela anuncia origem, destino, motivo e resultado
esperado e carrega automaticamente a skill responsável na mesma conversa, sem
pedir confirmação. O mesmo protocolo governa avanço, retorno e retomada.
`inbox` conclui a gravação antes de qualquer transição e não faz perguntas. Ela
apenas oferece backlog como próximo passo opcional.
Depois de cada tarefa de código, `implement` entrega o estado observado a
`documentator`, que reconstrói `<projeto>/docs/` e
`<projeto>/.specsfy/PACKAGES.md` antes de a tarefa ou o gate final ser
concluído. A pessoa também pode acionar `documentator` diretamente, sem spec ou
implementação recente.

Pedido surgido depois da definição retorna a `update-spec`. A skill chama
`backlog` quando faltar decisão, `validate` quando mudar comportamento e
`tasks` quando mudar somente o plano. Teste ou RED ausente chama `tdd-bdd` com
o plano pendente. Se o plano já estava aprovado, `tasks` reabre o Ato II antes
de chamar `tdd-bdd`. Depois da correção, a etapa que detectou a pendência é
retomada automaticamente. Handoffs não autorizam instalação, deploy, publicação
ou ação destrutiva, que continuam exigindo autorização específica.

Dentro de `backlog`, cada resposta provoca nova análise do contexto completo.
O ciclo faz no máximo oito perguntas por área. Cada rodada
contém exatamente uma pergunta numerada, com três ou mais opções numeradas,
`Escrever outra resposta`, `Gere outras opções` e `Avançar` desde a primeira
rodada. Depois do
avanço, a próxima rodada confirma se a pessoa encerra a área,
responde depois ou retoma agora. O fluxo registra áreas encerradas e não volta
a elas sem reabertura explícita. Áreas adiadas preservam os pontos abertos, que
continuam impedindo a aprovação do Definition Gate quando forem aplicáveis.

Crie um arquivo somente quando o fluxo tiver gatilho de leitura e atualização
próprio. Ao criá-lo, adicione a rota neste índice e no
[roteador de contexto](../README.md).

## Contrato de um fluxo

Cada fluxo deve declarar:

- gatilho e estado inicial.
- componentes e responsabilidade de cada etapa.
- ordem, resultado e falha transversal.
- spec ou specs que governam o comportamento.
- testes ou fontes executáveis que demonstram a sequência.
- condição que exige atualização do fluxo.
