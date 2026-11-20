# Cuidar dos milestones do projeto

Use `$specsfy-milestones` (`specsfy-milestones`) para trabalhar com os marcos
do produto. A skill tem três modos e escolhe um deles pelo seu pedido:

| Modo | Para que serve |
| --- | --- |
| `mvp` | importar `MVP.md` como a milestone 1.0 e entrevistar cada backlog gerado |
| `roadmap` | planejar os marcos de evolução depois que o MVP foi aceito |
| `sync` | atualizar o painel dos marcos e apontar relações ausentes |

Em qualquer modo, cada rodada traz exatamente uma pergunta numerada. Abaixo
dela, você recebe três ou mais sugestões, `Escrever outra resposta`,
`Gere outras opções` e `Avançar` desde a primeira rodada. Quando você escolher
uma opção pelo número, a captura registra o texto da opção escolhida, não
somente `1`, `2` ou `3`.

## Quando usar

### Modo `mvp`

Use antes de criar um conjunto de specs para um produto novo ou quando o MVP
ainda não tem uma jornada confirmada. A skill lê `MVP.md` e `BRAND.md` da raiz
do projeto. Quando o projeto é um submódulo Git e esses arquivos não estão
nele, ela os procura na raiz do Hub que contém o submódulo. Um arquivo no
projeto tem prioridade: um `MVP.md` ou `BRAND.md` específico do projeto não é
trocado pelo contexto compartilhado.

Se `MVP.md` existir, a skill o importa como `specs/milestones/M01.md` e cria
backlog e spec somente para os temas que descrevem algo a ser desenvolvido.
A importação preserva o contexto comercial e de produto no próprio `MVP.md`.
Ela não cria Inboxes nessa importação e não copia visão, público, negócio,
métricas ou posicionamento para `specs/`. Nenhum arquivo existente é
substituído.

Quando a jornada indicar que o sistema precisa guardar informações, a skill
pergunta, uma por vez, sobre cada informação ausente ou ambígua durante a
entrevista do backlog correspondente. São no máximo oito perguntas por área;
para continuar, você precisa solicitar mais e indicar quantas deseja
responder. As respostas confirmadas ficam em `.specsfy/DATABASE.md`.

### Modo `roadmap`

Use quando o MVP já possui objetivo e condição de saída confirmados. A skill
entrevista você sobre o que vem depois e propõe marcos de evolução sem alterar
silenciosamente a jornada central já aprovada.

### Modo `sync`

Use depois de criar, alterar ou concluir specs vinculadas a milestones. A
skill revisa relações entre milestones, specs e backlog, executa a projeção
derivada, sugere vínculos ausentes e mantém `specs.md` atualizado sem
substituir a escrita humana dos marcos. Se uma relação precisar de
confirmação, ela apresenta a pergunta numerada antes de mudar algo.

## Como descrever a tarefa

- Modo `mvp`: “use a skill de milestones para importar o MVP e organizar os
  marcos do meu sistema de leads”.
- Modo `roadmap`: “planeje o roadmap depois do MVP com milestones”.
- Modo `sync`: “revise os milestones do projeto e sincronize o painel”.

## Exemplo passo a passo

```text
mvp:     MVP.md → filtro de desenvolvimento → M01 + backlogs e specs Draft
         → milestones sincronizadas
roadmap: MVP aceito → entrevista de evolução → milestones pós-MVP
         → specs candidatas
sync:    Specs e backlog vinculados → sync → specs.md e progresso dos marcos
         atualizados
```

## O que esperar

### No modo `mvp`

O importador cria `M01` e só cria backlog e spec Draft para temas que
representam capacidades ou comportamentos a serem desenvolvidos. Visão,
público, princípios, modelo de negócio e contexto ficam somente no `MVP.md` e
não viram trabalho de desenvolvimento nem Inbox. Antes de perguntar, ele
aplica defaults seguros quando encontra um rótulo explícito ou uma formulação
inequívoca, registra o campo preenchido, a base usada e a lacuna que ficou
aberta. Cada backlog também recebe o trecho que o originou como registro
confirmado.

A própria skill carrega `$specsfy-02-backlog`, que reaproveita os defaults e
só pergunta por lacunas, ambiguidades, contradições ou escolhas reais. Ela
chama `$specsfy-data-discovery` quando houver informações ambíguas e retorna à
fila até entrevistar todos. Depois sincroniza os milestones e só chama
`$specsfy-03-specify` para gerar uma spec Draft para cada backlog. Os campos
sem resposta confiável ficam marcados como `Pendente`. A seção 10 de cada spec
Draft também registra menus e navegação principal, usando o que o MVP informar
ou `Pendente` quando essa parte não existir. A skill não implementa código,
não executa tarefas e não passa os gates durante a conversa.

### No modo `roadmap`

Você recebe uma sequência recomendada, dependências e suposições que ainda
dependem de uso real.

### No modo `sync`

A skill mostra relações ausentes e atualiza somente blocos gerados. A condição
de saída de um marco continua dependendo de validação confirmada por você.

## Erros comuns

- solicitar tarefas técnicas antes de entrevistar todos os backlogs gerados;
- misturar uma suposição da conversa com o texto que foi registrado;
- esperar que a importação implemente código ou aprove uma spec com lacunas;
- usar o roadmap para mudar o núcleo do MVP sem confirmação;
- chamar uma feature isolada de milestone;
- tratar percentual de tarefas como aceite do marco;
- esperar que a skill escreva uma condição de saída sem confirmação.

## Próximo passo

Leia [Milestones](../milestones.md) para conhecer arquivos, comando e
sincronização. Mudanças no núcleo do MVP seguem por `$specsfy-update-spec`.

## Nomes anteriores

Esta skill substitui `specsfy-mvp-milestone-interviewer`,
`specsfy-roadmap-milestone-interviewer` e `specsfy-milestone-governor`. O
`specsfy update` troca as três pela `specsfy-milestones` no seu projeto.
