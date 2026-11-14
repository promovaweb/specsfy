# Primeiro projeto com o Specsfy

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | primeira fatia de trabalho em um projeto consumidor |
| Autoridade | metodologia executável de `skills/` |

## O que você vai construir

Este tutorial acompanha uma página de boas-vindas em um projeto Laravel que já
usa Pest. A rota recebe um nome e mostra uma saudação, com `visitante` no lugar
do nome quando ele não é informado.

Você verá como uma ideia chega à implementação sem dividir a fonte normativa
entre `plan.md`, `tasks.md` e outros arquivos. O exemplo mostra cada skill
separadamente para facilitar a consulta, embora o agente consiga fazer as
transições na mesma conversa.

O tutorial depende de três condições verificáveis. Confirme a instalação, abra
o agente na raiz do projeto consumidor e rode a suíte Pest existente:

- o CLI e o framework foram instalados conforme o
  [guia de instalação](installation.md).
- o agente está aberto na raiz do projeto consumidor.
- o repositório possui um runner Pest funcional.

## Escolha o diretório do projeto

Você pode começar a conversa na raiz de um Hub e indicar o subdiretório do
projeto. Instale e execute o setup com o mesmo caminho:

```bash
specsfy install --project apps/portal
specsfy doctor --project apps/portal
```

Depois, informe `apps/portal` ao `$specsfy-setup`. O agente cria contexto,
specs, testes e código apenas nesse diretório. Ele não usa a raiz Git do Hub
como destino por dedução. Antes de cada skill seguinte, o framework executa o
setup novamente para verificar essa consistência, reutilizando o caminho já
confirmado na conversa.

## Capture uma entrada

Use `$specsfy-01-inbox` para guardar a formulação original em
`specs/inbox/`. A captura não inicia perguntas nem altera o código:

```text
Use $specsfy-01-inbox para capturar:
criar uma página /boas-vindas que cumprimente o visitante pelo nome.
```

A skill grava um arquivo com data, horário e slug em `specs/inbox/`. O relato
deve apontar um caminho semelhante a este:

```text
specs/inbox/2026-07-28-143205-pagina-boas-vindas.md
```

Essa captura preserva o texto recebido e registra inferências separadamente,
sem criar backlog, spec, tarefas ou código.

## Refine a proposta no backlog

Quando a ideia merecer refinamento, envie o arquivo para
`$specsfy-02-backlog`. A skill lê a captura preservada, procura relações e
cria um item numerado:

```text
Use $specsfy-02-backlog para refinar
specs/inbox/2026-07-28-143205-pagina-boas-vindas.md
```

Você também pode fornecer o texto diretamente. A skill procura material
relacionado, esclarece somente o necessário para o backlog e grava um item
numerado:

```text
specs/backlog/0001-pagina-boas-vindas.md
```

O backlog registra uma possibilidade de entrega, mas não autoriza alteração no
código. Essa separação permite comparar e priorizar ideias antes de criar uma
especificação normativa.

Use `$specsfy-02-backlog` para aprofundar o item. A conversa pergunta uma
lacuna aplicável por vez e retorna um brief:

```text
Use $specsfy-02-backlog em
specs/backlog/0001-pagina-boas-vindas.md
```

O agente reaproveita o conteúdo existente e pergunta uma lacuna relevante por
vez. Neste exemplo, a resposta padrão muda o comportamento visível da página:

```text
Agente: O que deve aparecer quando nenhum nome for informado?
Você: Olá, visitante!
```

O refinamento do backlog produz um brief na conversa. Por padrão, ele não cria
uma segunda fonte normativa nem modifica o backlog.

## Crie a especificação única

Depois de resolver as dúvidas materiais, promova o backlog com
`$specsfy-03-specify`:

```text
Use $specsfy-03-specify para promover
specs/backlog/0001-pagina-boas-vindas.md
```

A skill cria o diretório numerado e mantém a fonte normativa neste caminho:

```text
specs/<estado>/0001-pagina-boas-vindas/spec.md
```

Abra esse arquivo e confira se o problema, os usuários afetados, os requisitos,
os limites e os cenários BDD representam a conversa. O Gherkin permanece na
spec como referência legível, sem uma suíte `.feature` separada.

## Comprove a definição

Use `$specsfy-04-validate` para auditar a spec. A skill informa a localização
de cada falha e só aprova o Definition Gate quando a definição estiver
completa:

```text
Use $specsfy-04-validate em
specs/<estado>/0001-pagina-boas-vindas/spec.md
```

Uma definição pronta termina a validação com estes dois sinais:

```text
READY
Definition Gate: Passed
```

`READY` confirma que a spec possui as informações necessárias para planejar. O
estado ainda não afirma que a página existe. Se houver contradição ou uma
escolha importante em aberto, a validação retorna à skill responsável antes de
aprovar o gate.

## Organize as tarefas

Use `$specsfy-05-tasks` para manter o plano e as tarefas dentro da mesma
`spec.md`. O arquivo deve mostrar os requisitos cobertos e a dependência entre
o teste em RED e cada tarefa de produção:

```text
Use $specsfy-05-tasks em
specs/<estado>/0001-pagina-boas-vindas/spec.md
```

A skill separa testes, código, documentação e trabalho operacional, registra
dependências e liga cada tarefa aos requisitos correspondentes. Ela não cria
`tasks.md` nem altera o código de produção.

## Prove que o teste detecta a ausência da página

Use `$specsfy-06-tdd-bdd` no modo de preparação:

```text
Use $specsfy-06-tdd-bdd em
specs/<estado>/0001-pagina-boas-vindas/spec.md para preparar o TDD.
```

Como o projeto do exemplo usa PHP, a skill cria testes Pest derivados dos
cenários BDD. Cada caso executável recebe seu marcador `SPECSFY:` junto à
definição. A feature inteira e cada história ou requisito aplicável precisam
ter, no mínimo, três casos distintos: caminho feliz, variação importante e
falha ou limite material.

Execute o teste focal e confirme o RED pelo motivo esperado. Uma rota ausente
prova que o teste detecta o comportamento ainda não implementado. Erro de
sintaxe, fixture quebrada ou dependência ausente precisa ser corrigido antes
de o RED ser aceito. Depois que as tarefas e seus predecessores TDD estiverem
coerentes, o `Plan Gate` pode chegar a `Passed`.

## Implemente e valide

Com os gates de definição e plano aprovados, use
`$specsfy-07-implement`:

```text
Use $specsfy-07-implement em
specs/<estado>/0001-pagina-boas-vindas/spec.md
```

A implementação percorre cada tarefa em `RED → GREEN → REFACTOR`. Para uma
tarefa de código, a skill exige um predecessor TDD com RED registrado, cria a
menor mudança capaz de deixar o teste verde e executa a regressão aplicável.
Os comandos, os resultados e os IDs cobertos entram como evidência na spec.

Depois de cada tarefa de código, o agente chama `$specsfy-documentator`. Essa
skill reconstrói a documentação técnica em `docs/` a partir do sistema
existente e executa o modo `--check`. O fluxo só retoma a implementação quando
a documentação representar o código atual.

No fechamento, a implementação verifica aceite, regressão, rastreabilidade,
documentação e Definition of Done. Uma entrega comprovada termina com:

```text
Delivery Gate: Passed
Status: Reviewing
```

## Incorpore uma mudança posterior

Imagine que, depois da primeira entrega, o nome precise aceitar no máximo 80
caracteres. Use `$specsfy-update-spec` na spec existente:

```text
Use $specsfy-update-spec em
specs/<estado>/0001-pagina-boas-vindas/spec.md:
o nome deve ter no máximo 80 caracteres.
```

Essa skill preserva a nova instrução, atualiza a `spec.md` e invalida somente
as provas afetadas. Como o limite muda comportamento, o fluxo reabre desde o
Ato I e percorre validação, tarefas e TDD/BDD antes de retomar o
`$specsfy-07-implement`. A skill de atualização não altera código de
produção automaticamente.

Uma alteração restrita ao plano técnico reabre os Atos II e III. Uma correção
editorial comprovadamente sem mudança de significado preserva os gates. Em
todos os casos, o histórico continua na mesma spec.

## Consulte o estado final

Use `$specsfy-progress` para projetar o estado sem editar arquivos:

```text
Use $specsfy-progress para mostrar o resultado final.
```

O relatório mostra specs, gates, tarefas, checklists, pendências e o próximo
trabalho disponível. Você também pode consultar o mesmo estado pelo CLI:

```bash
specsfy progress --project .
specsfy progress --project . --json
specsfy tui --project .
```

Depois do aceite final, a entrega pronta aparece como `Complete` em
`completed/`, com os três gates aprovados e sem pendência documental. Capturas em `specs/inbox/` e itens em
`specs/backlog/` não entram nesse cálculo.

## Converse sobre a próxima escolha — `$specsfy-interviewer`

Quando uma lacuna puder alterar escopo, plano, execução ou aceite, use
`$specsfy-interviewer` na mesma spec. Ele registra respostas confirmadas e
recalibra Effort, sem aprovar gates nem substituir a skill da etapa.

## Continue na mesma conversa

Você não precisa enviar cada exemplo deste tutorial manualmente. Ao autorizar a
jornada completa, uma skill anuncia o handoff, carrega a próxima
responsabilidade e retoma a etapa anterior quando necessário. A transição
automática não amplia permissões para deploy, publicação, instalação de
especialista ou ação destrutiva.

Agora aprofunde os [comandos do CLI e da TUI](cli.md), consulte as
[informações permanentes do projeto](project-context.md) ou conheça o
[uso avançado](advanced-usage.md).

## Justificativa de tamanho

O tutorial acompanha uma única entrega desde a captura até o estado `Complete`.
Manter o exemplo em uma página permite conferir como cada arquivo e gate é
produzido pelo resultado da etapa anterior.

## Manutenção deste guia

Atualize esta página quando a sequência dos atos, a responsabilidade de uma
skill base, os gates, os estados ou os caminhos canônicos mudarem. Use a
metodologia executável em [`skills/`](../../skills/) como fonte e preserve
`specs/<estado>/<NNNN>-<slug>/spec.md` como a única fonte normativa de cada
fatia no projeto consumidor.
