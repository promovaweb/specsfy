# Como a metodologia funciona

O Specsfy ajuda você a transformar uma necessidade em uma entrega comprovada.
Você explica o que precisa, e o agente organiza a definição, o plano, os testes
e a implementação na mesma especificação.

A metodologia existe para responder, durante todo o trabalho, a três perguntas:

1. **O que será entregue?**
2. **O que comprova que o plano está pronto?**
3. **Qual evidência comprova que a entrega funciona?**

Você não precisa decorar comandos nem escolher cada skill. O agente identifica a
etapa atual, anuncia as transições e mantém o trabalho na mesma conversa.

Antes de iniciar uma descoberta, o setup lê o sistema que já existe. Ele reúne
instruções do projeto, manifests, configuração, código, rotas, dados,
integrações, interfaces, testes e documentação. Essa leitura evita sugestões
desconectadas da aplicação e registra o que precisa continuar igual antes de
propor uma mudança.

## Uma única especificação

Cada mudança escolhida possui uma única fonte normativa. O caminho permite que
você reconheça a sequência e o assunto ao listar o diretório de specs:

```text
specs/<estado>/<NNNN>-<slug>/spec.md
```

`NNNN` é o número da spec, como `0001`. O `slug` identifica o assunto, como
`recuperar-senha`. Assim, o caminho `0001-recuperar-senha` pode ser localizado
sem abrir o arquivo.

A pasta também mostra o estado operacional da entrega:

```text
draft → defined → planned → in-progress → review → completed
```

O campo `Status` dentro da spec espelha essa pasta. Use `specsfy specs transition`
para mover o pacote inteiro, e não mova arquivos manualmente. `completed/`
mantém o histórico das entregas finalizadas.

Ao abrir a `spec.md`, você encontra o comportamento esperado, o plano e as
provas que permitem conferir o estado atual:

- o problema e o resultado esperado.
- as pessoas afetadas e as regras que precisam ser respeitadas.
- histórias, requisitos e limites.
- exemplos de comportamento escritos em BDD.
- as escolhas registradas, as possíveis falhas e o plano técnico.
- tarefas, testes e evidências da execução.
- gates e estado atual da entrega.

O plano e as tarefas ficam dentro da própria spec. O Specsfy não cria
`plan.md` ou `tasks.md`, então a explicação da entrega não se divide entre
arquivos com estados diferentes.

## Effort e conversa contínua

Cada spec inclui `Effort`, uma estimativa de 1 a 10 da capacidade de raciocínio
e execução necessária. A pontuação não é prazo: 1–2 indica trabalho atômico,
3–6 mudança local, 7–8 integração ou migração e 9–10 uma entrega com alta
incerteza ou revisão humana frequente.

O entrevistador do Specsfy conversa com você quando uma lacuna puder mudar a
próxima etapa. Ele atualiza a justificativa de Effort conforme a definição, o
plano e a execução ganham forma. A Inbox continua sem perguntas.

A [Referência do método](method-reference.md) detalha a escala de Effort, os
perfis exibidos pelo progresso, os estados e os gates apresentados neste guia.

## Interfaces fazem parte da definição

Quando a entrega cria ou muda uma tela usada por pessoas, o Specsfy pergunta
antes do código como a experiência deve funcionar. A conversa cobre as telas,
o fluxo de informação, os menus e a navegação principal, os campos e validações do formulário, a composição e o
formato de cada ação, como página, painel lateral, modal ou outra alternativa.
As opções usam texto completo, e você sempre pode escolher `Escrever outra
resposta`, `Gere outras opções` ou `Avançar`.

Antes das perguntas, o Specsfy analisa a stack e o sistema atual quando ele
existe. Ele observa rotas, telas, componentes, conteúdo, permissões, estados e
testes para preservar o que já funciona e sugerir uma continuação coerente. O
agente não troca React, Tailwind, shadcn/ui ou outra tecnologia por suposição.

Um CRUD com interface não é considerado pronto apenas por ter banco, serviço
ou API. A spec registra telas, menus, formulário, navegação, estados de carregamento,
vazio, erro e sucesso, além do uso por teclado. O plano gera tarefas e testes
para essa interface antes da implementação.

Essas tarefas aparecem em uma `Fase de interface` própria na seção 14 da spec.
Cada tela tem uma tarefa com caminho, comportamento e teste de interação.

## Da ideia até o código

Nem todo texto precisa virar uma entrega imediatamente. Você escolhe o destino
de acordo com o quanto já definiu:

- Uma **ideia** preserva seu texto em
  `specs/inbox/` sem perguntas e sem autorizar implementação.
- O **backlog** guarda uma proposta que merece organização e refinamento, mas
  ainda não foi escolhida para entrega. Ela vive em `specs/backlog/`.
- A **spec** representa uma entrega escolhida. A partir dela, definição, plano,
  testes, código e evidências passam a seguir o mesmo contrato.

O percurso mais completo preserva a ideia, aprofunda as definições e só chega
ao código depois do plano e do RED:

```text
inbox → backlog → spec → plano e RED → código → validação
```

Você também pode começar com “implemente recuperação de senha”. O agente só
altera o código depois de verificar as definições ausentes e conduzir as etapas
correspondentes.

## Os três atos

Os atos são grupos de trabalho. Cada um termina com um **gate**, que é um ponto
de controle baseado em evidência. Um **gate** aprovado não significa apenas
“parece bom”: significa que as condições daquela etapa foram verificadas.

### Escolha o destino da ideia

**Objetivo:** preservar a ideia sem transformá-la imediatamente em spec.

**Sua participação:** você informa a ideia e escolhe quando vale refiná-la ou
promovê-la. Se solicitar apenas a captura, o agente não inicia o refinamento.

**Prova técnica:** a captura recebe um arquivo próprio em `specs/inbox/`. Se
você escolher o refinamento, ela segue para o backlog. A `spec.md` normativa
só aparece depois de uma promoção explícita.

Essa separação mantém a caixa de entrada leve e impede que toda observação se
transforme em código ou em uma especificação extensa.

### Ato I — Definir o que precisa mudar

**Objetivo:** entender o problema e transformar a intenção em comportamento
que possa ser conferido.

**Sua participação:** você responde apenas às dúvidas que realmente mudam a
entrega. O agente reaproveita o que já foi informado e apresenta uma pergunta
numerada por rodada. Ela inclui três ou mais opções, `Escrever outra resposta`,
`Gere outras opções` e `Avançar` desde a primeira rodada. O ciclo faz no
máximo oito perguntas por área: cada conjunto de respostas atualiza a análise.
O avanço mantém
uma confirmação para você encerrar a área, responder depois ou retomar agora.
O encerramento é respeitado até uma reabertura explícita. O adiamento mantém os
pontos registrados e o Definition Gate pendente até serem resolvidos.

**Prova técnica:** a spec registra a finalidade, as pessoas afetadas, os
requisitos, os limites e os cenários BDD. A validação procura contradições,
definições em aberto e dúvidas que impedem o planejamento.

O Ato I termina quando a validação registra este gate na `spec.md`:

```text
Definition Gate: Passed
```

Esse estado permite que o agente organize o plano a partir dos requisitos e
cenários já conferidos. O código ainda não foi alterado, e o Plan Gate continua
pendente.

### Ato II — Planejar e preparar o RED

**Objetivo:** definir como a mudança será construída e demonstrar que os testes
conseguem detectar a ausência do novo comportamento.

**Sua participação:** você confirma escolhas de produto ou estratégia que
alteram o resultado. Os detalhes técnicos que o repositório consegue comprovar
podem ser derivados do código, da stack e das regras do projeto.

**Prova técnica:** o agente registra as tarefas, os contratos, as informações
afetadas, as possíveis falhas e a reversibilidade na spec. Depois, transforma
os cenários BDD em testes TDD executáveis e observa o **RED**, uma falha causada
pela funcionalidade que ainda não existe.

O Ato II termina quando as tarefas e os testes permitem registrar:

```text
Plan Gate: Passed
```

O RED precisa falhar pelo motivo esperado. Erro de sintaxe, dependência ausente
ou ambiente quebrado não prova que o teste protege o comportamento.

### Ato III — Entregar e conferir o resultado

**Objetivo:** implementar cada tarefa e reunir evidências atuais de que o
resultado atende à definição.

**Sua participação:** você acompanha novas escolhas ou mudanças de escopo. O
agente registra cada comando executado e apresenta o resultado verificável,
sem exigir que você conduza os ciclos de teste.

**Prova técnica:** cada tarefa de código parte de um teste que falha pelo motivo
esperado, recebe a menor implementação capaz de deixá-lo verde e termina com
refatoração protegida pela suíte:

```text
RED → GREEN → REFACTOR
```

- **RED:** o teste falha pela razão esperada.
- **GREEN:** a menor implementação faz o teste passar.
- **REFACTOR:** o código é melhorado sem mudar o comportamento.

Depois, o agente executa o aceite e a regressão completa, verifica a ligação
entre cada requisito e seu teste, atualiza os registros permanentes do projeto
e reconstrói a documentação aplicável.

O Ato III termina quando o aceite, a regressão e a documentação permitem
registrar:

```text
Delivery Gate: Passed
Status: Reviewing
```

Depois do aceite final, a spec passa por `review/` para `completed/`, com
`Status: Complete`. A entrega concluída possui código e evidência atual. Você pode
abrir a spec e localizar os comandos, os resultados e os testes que comprovam
esse estado.

## Como BDD e TDD trabalham juntos

O BDD (desenvolvimento orientado por comportamento) descreve o resultado que
produto e desenvolvimento precisam discutir. O TDD (desenvolvimento orientado
por testes) transforma esse comportamento em uma prova executável no projeto.

O **BDD** descreve o comportamento em uma linguagem que produto,
desenvolvimento e testes conseguem discutir. Por exemplo:

```gherkin
Cenário: cliente solicita recuperação de senha
  Dado que existe um cadastro para o e-mail informado
  Quando o cliente solicita a recuperação
  Então o sistema confirma a solicitação sem revelar informações privadas
```

Esse cenário mostra a regra e o resultado esperado, mas o texto Gherkin
não é executado como uma suíte separada pelo Specsfy.

O **TDD** transforma o comportamento em testes executáveis na ferramenta já
usada pelo projeto. Primeiro o teste falha pelo motivo correto. Depois, a
implementação faz o teste passar. Em resumo:

- BDD ajuda a definir **o comportamento que importa**.
- TDD comprova **que o código apresenta esse comportamento**.

Essa ligação evita uma descrição clara sem prova automática e também impede
que um teste técnico seja aceito sem representar a necessidade registrada.

## O agente conduz as transições

As skills dividem responsabilidades, mas você não precisa operar o fluxo como
uma lista de comandos. Quando uma etapa depende de outra, o agente:

1. informa de qual skill está saindo e para qual está indo.
2. explica a pendência que motivou a transição.
3. resolve a pendência na skill responsável.
4. retorna à etapa anterior quando necessário.

Por exemplo, se a implementação encontrar um teste ausente, o agente volta ao
planejamento e à preparação TDD, obtém um RED válido e só então retoma o código.
Ele não aprova um gate apenas para contornar a pendência.

## Mudanças durante o trabalho

Se a necessidade mudar depois que a spec já existe, explique a alteração em
linguagem normal. O novo requisito entra na mesma `spec.md`, sem criar uma
segunda especificação.

O Specsfy reabre somente as provas que perderam validade:

- Uma mudança de comportamento reabre definição, plano e entrega.
- Uma mudança apenas na estratégia técnica reabre plano e entrega.
- Uma evidência desatualizada exige somente a repetição da validação
  correspondente.

Use [`specsfy-update-spec`](skills/specsfy-update-spec.md) para
incorporar a nova instrução. A skill informa quais gates perderam validade e
retoma a primeira etapa afetada.

## Informações que permanecem entre entregas

Além da spec de cada entrega, o projeto mantém informações que valem para o
sistema inteiro:

- `PROJECT.md`: finalidade, capacidades e limites do projeto.
- `.specsfy/STACK.md`: tecnologias estruturais e suas evidências.
- `.specsfy/RULES.md`: regras confirmadas para o trabalho.
- `.specsfy/DATABASE.md`: visão da persistência e das relações.

O agente consulta esses arquivos antes de planejar e os revisa durante a
implementação. Assim, uma nova entrega começa com a arquitetura, as convenções
e o banco já documentados.

## O que você encontra ao final

Uma mudança completa deixa na `spec.md` um caminho auditável entre requisito,
teste, tarefa e evidência:

- a intenção e as escolhas estão na spec.
- cada requisito aponta para condições de aceite.
- os cenários BDD explicam o comportamento.
- os testes TDD demonstram o resultado no código.
- as tarefas registram execução e evidências.
- os gates mostram quais etapas foram realmente comprovadas.
- a documentação reflete o sistema implementado.

Para consultar esse estado sem alterar arquivos, use
[`specsfy-progress`](skills/specsfy-progress.md).

## Limites do método

O método não define requisitos importantes sem você, não transforma toda ideia
em spec e não trata pesquisa como requisito aprovado. Também não aceita erro de
ambiente como RED nem substitui os testes e as ferramentas do seu projeto.

## Justificativa de tamanho

Este guia mantém os três atos, os gates e a relação entre BDD e TDD na mesma
página para que você possa comparar o percurso completo sem alternar entre
explicações parciais.

O [guia de instalação](installation.md) prepara o CLI e o framework. Depois,
o [primeiro projeto](getting-started.md) aplica os três atos a uma página de
boas-vindas e mostra os gates na `spec.md`.
