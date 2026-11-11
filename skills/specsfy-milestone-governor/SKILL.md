---
name: specsfy-milestone-governor
description: Projeta o estado dos milestones a partir de specs e backlog com specsfy milestones sync, aponta vínculos ausentes ou incoerentes, sugere ajustes confirmáveis e atualiza somente os blocos derivados. Use para conferir progresso e vínculos dos marcos, depois de importar o MVP ou quando specs mudarem de estado. Não use para descobrir o MVP (specsfy-mvp-milestone-interviewer), planejar evolução pós-MVP (specsfy-roadmap-milestone-interviewer), inventar objetivos ou concluir marcos sem validação humana.
---

# Governar milestones a partir das fontes do projeto

Mantenha o mapa de milestones coerente com o que specs e backlog realmente
dizem. Cada artefato tem um papel: o marco descreve um estado demonstrável, a
spec define uma capacidade e o backlog registra trabalho ainda refinável.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

## Pronto quando

- `specsfy milestones sync` rodou e os blocos derivados estão atuais.
- Cada inconsistência encontrada foi apresentada com fonte e efeito no mapa.
- Mudanças estruturais só foram aplicadas após confirmação da pessoa.
- Nenhum marco foi declarado concluído sem a verificação da seção
  `Concluir um marco`.

## Projetar o estado atual

1. Leia em paralelo `specs.md`, `specs/milestones/`, `specs/backlog/` e as
   specs existentes.
2. Execute:

   ```bash
   specsfy milestones sync --project .
   ```

O comando atualiza somente os blocos marcados em `specs.md` e nos arquivos de
milestone. Conta como completa a spec com `Status: Complete` e mostra itens de
backlog sem usá-los para fechar o marco.

## Analisar e sugerir

Depois da projeção, procure:

- spec ou backlog ligado a marco inexistente;
- milestone sem condição de saída confirmada;
- spec sem milestone quando a finalidade já for conhecida;
- dependência que deixa a ordem atual incoerente;
- conjunto de specs que parece formar um novo estado demonstrável.

Para cada achado, explique a sugestão, o material que a sustenta e o efeito no
mapa. Peça confirmação antes de mudar relações estruturais. Falta de descoberta
do MVP vai para `$specsfy-mvp-milestone-interviewer`; evolução posterior, para
`$specsfy-roadmap-milestone-interviewer`.

## Concluir um marco

Um milestone só é concluído quando as specs necessárias estão completas e a
pessoa responsável confirma a condição de saída por demonstração, teste de
aceite ou outra verificação registrada. O sincronismo mostra progresso; não
substitui essa confirmação.

## Limites

- Não alterar texto humano fora dos blocos gerados.
- Não mover specs nem editar gates, tarefas ou código.
- Não usar lista de tarefas fechadas como aceite do milestone.
