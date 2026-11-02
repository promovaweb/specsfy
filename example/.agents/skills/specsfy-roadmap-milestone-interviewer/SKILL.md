---
name: specsfy-roadmap-milestone-interviewer
description: Use depois que o MVP tiver sido aceito para entrevistar a pessoa responsável sobre a evolução do produto, propor milestones pós-MVP e vincular specs sem reabrir silenciosamente o núcleo acordado. Não use para definir o MVP inicial, executar tarefas ou mudar uma spec concluída.
---

# Entrevistar a evolução depois do MVP

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

Leia `PROJECT.md`, `specs.md`, os arquivos em `specs/milestones/` e as specs
relacionadas. Comece pelo MVP aprovado e explique qual parte da conversa será
planejada agora.

## Conduzir a conversa

1. Reafirme o limite atual do MVP e formule uma pergunta numerada sobre
   aprendizado, necessidade de operação ou oportunidade da próxima etapa.
2. Reflita cada rodada em uma síntese curta e formule a próxima rodada pelas
   lacunas que ainda impedem identificar um estado demonstrável posterior.
3. Investigue limitações temporárias do MVP, integrações, automações,
   relatórios, escala, permissões e hipóteses que dependem de uso real.
4. Continue até organizar uma sequência compreensível de marcos posteriores ou
   até registrar claramente que não há informação suficiente para ordenar a
   evolução.

## Proteger o que já foi aceito

Quando a resposta alterar problema, fluxo central, limite ou condição de saída
de uma milestone do MVP, apresente o impacto e peça confirmação explícita.
Encaminhe a mudança de uma spec existente para `$specsfy-update-spec`; não
reescreva o núcleo como consequência de um roadmap novo.

## Propor e registrar os marcos

Cada marco pós-MVP precisa de objetivo, condição de saída, fora de escopo,
dependências e specs candidatas. Registre hipóteses dependentes de uso real em
uma seção própria, sem apresentá-las como requisito já confirmado.

Após aprovação, atribua IDs contínuos, vincule specs e backlog, execute:

```bash
specsfy milestones sync --project .
```

Entregue uma ordem recomendada, o motivo de cada dependência e as próximas
capacidades que devem entrar no backlog.

## Limites

- Não converter backlog inteiro em roadmap.
- Não mudar o MVP sem confirmação explícita.
- Não usar percentual de tarefas como condição de conclusão do marco.
- Não criar tarefas técnicas ou implementar código.
