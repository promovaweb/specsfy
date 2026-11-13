# Organize o produto por milestones

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | guia de uso |
| Escopo | MVP, roadmap, specs e backlog de projetos consumidores |
| Autoridade | uso público da capacidade de milestones |

Uma milestone é um estado demonstrável do produto. Ela responde o que precisa
estar funcionando antes de seguir para o próximo marco. Não é sprint, versão,
épico, componente ou uma pasta de tarefas.

## Comece pelo MVP

Use `$specsfy-mvp-milestone-interviewer` depois de apresentar a ideia do
produto. A conversa começa com a finalidade, quem será atendido e qual jornada
precisa funcionar. Depois de cada resposta, o agente resume o entendimento e
faz a próxima pergunta que falta para definir o menor produto utilizável.

A entrevista termina quando você puder confirmar uma frase como: “o MVP estará
pronto quando uma equipe comercial conseguir capturar um lead, consultá-lo e
atribuir uma pessoa responsável em ambiente publicado”.

O agente propõe normalmente de quatro a oito milestones. Para cada uma, você
aprova objetivo, condição de saída, fora de escopo, dependências e specs
iniciais. Só depois disso ele cria ou reorganiza os arquivos.

## Arquivos do projeto

```text
PROJECT.md
specs.md
specs/
├── milestones/
│   ├── M01.md
│   └── M02.md
├── backlog/
└── <estado>/<NNNN>-<slug>/spec.md
```

`specs.md` é o mapa do projeto: mostra a sequência das specs, o estado de cada
uma e os marcos vinculados. A fonte de comportamento continua em cada
`spec.md`; o objetivo e a condição de saída ficam no arquivo de milestone.

## Vincule specs e backlog

Inclua o campo `Milestones` nas tabelas de uma spec ou de um item do backlog:

```md
| Milestones | M02, M04 |
```

Uma spec possui uma milestone principal na maioria dos casos. Ela pode ter
outro vínculo quando a mesma capacidade contribui para dois estados reais do
produto. O backlog aparece no marco como trabalho relacionado, mas não aumenta
o percentual de conclusão.

## Atualize o mapa automaticamente

Depois de alterar relações ou status, execute:

```bash
specsfy milestones sync --project .
```

O comando atualiza blocos identificados em `specs.md` e em
`specs/milestones/MNN.md`. Texto fora desses blocos continua seu. Um marco
referenciado por spec ou backlog e ainda sem arquivo recebe um esqueleto, para
você completar na entrevista.

`specsfy specs transition` também sincroniza o mapa depois de mover uma spec. Use o
comando direto quando tiver alterado vínculos no Markdown ou refinado backlog.

## Cinco usos do comando

```bash
# Criar ou atualizar o índice no projeto atual.
specsfy milestones sync

# Declarar explicitamente a raiz do projeto atual.
specsfy milestones sync --project .

# Consumir o resultado em outra automação local.
specsfy milestones sync --project . --json

# Atualizar um projeto em outro diretório.
specsfy milestones sync --project ../crm

# Atualizar relações depois de editar uma spec ou backlog.
specsfy milestones sync --project .
```

O progresso considera specs com `Status: Complete`. A milestone só é concluída
quando suas specs necessárias estiverem completas e você confirmar que a
condição de saída foi demonstrada ou validada.

## Planeje o que vem depois

Quando o MVP estiver aceito, use
`$specsfy-roadmap-milestone-interviewer`. Ele parte dos limites já aprovados e
organiza evolução, integrações, automações e hipóteses que dependem de uso
real. Se uma resposta mudar o núcleo do MVP, o agente pede confirmação e
encaminha a alteração da spec para `$specsfy-update-spec`.

Para revisar o mapa existente e encontrar relações ausentes, use
`$specsfy-milestone-governor`. Ele sincroniza a projeção, aponta lacunas e
propõe ajustes; não altera objetivo ou condição de saída sem sua confirmação.
