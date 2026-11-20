# Milestones no framework

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | contrato técnico |
| Escopo | projeção de milestones em projetos consumidores |
| Autoridade | implementação no CLI e skills de entrevista |

## Modelo

Milestone é uma entidade de produto separada da spec e do backlog. O arquivo
`specs/milestones/MNN.md` contém objetivo, condição de saída, fora de escopo e
dependências confirmadas. Specs e backlog referenciam marcos no campo de tabela
`Milestones`. Uma relação pode ser muitos para muitos.

`specs.md`, na raiz do projeto consumidor, é um índice derivado. A fonte de
verdade para comportamento permanece em `spec.md`; as tarefas continuam dentro
da spec. Backlog relacionado não integra o cálculo de entrega.

## Sincronização

`syncMilestones()` em `cli/src/domain/milestones.ts` lê specs aceitas pelos layouts do
ciclo de vida e arquivos Markdown em `specs/backlog/`. O comando público
`specsfy milestones sync --project .` escreve somente blocos delimitados:

```text
<!-- specsfy:specs-index:start -->
<!-- specsfy:specs-index:end -->
<!-- specsfy:milestone-progress:start -->
<!-- specsfy:milestone-progress:end -->
```

Fora dos blocos, a escrita humana é preservada. Marco referenciado sem arquivo
recebe um esqueleto, sem inventar objetivo ou condição de saída. `Status:
Complete` define a projeção de specs concluídas; a conclusão do marco continua
uma confirmação humana da condição de saída.

## Entrevistas e responsabilidades

- `specsfy-mvp-milestone-interviewer`: descobre o MVP até haver jornada,
  limites e marcos aprováveis.
- `specsfy-roadmap-milestone-interviewer`: organiza a evolução posterior sem
  reabrir o núcleo aceito sem confirmação.
- `specsfy-milestone-governor`: mantém a projeção e sugere relações ausentes.

Os entrevistadores não implementam código nem aprovam gates. Mudança em uma
spec existente segue para `specsfy-update-spec`.

## Verificação

Os contratos de filesystem estão em `cli/tests/domain/milestones.test.ts`. A cobertura
confere geração de `specs.md`, percentual por specs completas, preservação de
texto humano e presença de backlog sem efeito indevido sobre a conclusão.
