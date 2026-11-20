---
name: specsfy-roadmap-milestone-interviewer
description: Entrevista a pessoa responsável sobre a evolução do produto depois do MVP aceito, propõe milestones pós-MVP com objetivo, condição de saída e dependências e vincula specs e backlog sem reabrir em silêncio o núcleo acordado. Use quando o MVP já foi aceito e a pessoa quer planejar as próximas etapas. Não use para definir o MVP inicial (specsfy-mvp-milestone-interviewer), conferir vínculos existentes (specsfy-milestone-governor), executar tarefas ou mudar spec concluída (specsfy-update-spec).
---

# Entrevistar a evolução depois do MVP

Transforme o que a pessoa aprendeu e planeja depois do MVP em uma sequência de
marcos demonstráveis, com dependências claras, sem alterar o que já foi aceito.

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

- Existe uma ordem recomendada de marcos pós-MVP aprovada pela pessoa, ou o
  registro claro de que ainda falta informação para ordenar a evolução.
- Cada marco aprovado tem objetivo, condição de saída, fora de escopo,
  dependências e specs candidatas, com IDs contínuos.
- Hipóteses que dependem de uso real estão em seção própria.
- `specsfy milestones sync` rodou depois do registro.
- Nenhuma mudança no MVP aconteceu sem confirmação explícita.

## Conduzir a conversa

Leia em paralelo `PROJECT.md`, `specs.md`, `specs/milestones/` e as specs
relacionadas. Comece pelo MVP aprovado e explique qual parte será planejada
agora.

1. Reafirme o limite atual do MVP e pergunte sobre aprendizado, necessidade de
   operação ou oportunidade da próxima etapa.
2. Resuma cada rodada em uma síntese curta e escolha a próxima pergunta pela
   lacuna que ainda impede identificar um estado demonstrável posterior.
3. Investigue limitações temporárias do MVP, integrações, automações,
   relatórios, escala, permissões e hipóteses que dependem de uso real.
4. Continue até organizar uma sequência compreensível de marcos ou registrar
   que não há informação suficiente para ordená-los.

## Proteger o que já foi aceito

Quando uma resposta alterar problema, fluxo central, limite ou condição de
saída de um milestone do MVP, apresente o impacto e peça confirmação
explícita. Mudança em spec existente vai para `$specsfy-update-spec`. O roadmap
novo não reescreve o núcleo como efeito colateral.

## Propor e registrar os marcos

Cada marco pós-MVP precisa de objetivo, condição de saída, fora de escopo,
dependências e specs candidatas. Hipóteses dependentes de uso real ficam em
seção própria, sem aparecer como requisito confirmado.

Após aprovação, atribua IDs contínuos, vincule specs e backlog e execute:

```bash
specsfy milestones sync --project .
```

Entregue a ordem recomendada, o motivo de cada dependência e as próximas
capacidades que devem entrar no backlog.

## Limites

- Não converter o backlog inteiro em roadmap.
- Não mudar o MVP sem confirmação explícita.
- Não usar percentual de tarefas como condição de conclusão do marco.
- Não criar tarefas técnicas nem implementar código.
