---
name: specsfy-progress
description: Use quando o usuário pede progresso geral, status de todas as especificações, percentual concluído, quanto falta, bloqueios ou próximo trabalho do repositório Specsfy, ou quando uma transição automática pedir a projeção final ou o roteamento pelo estado observado. Produz uma visão somente leitura de specs, gates, tarefas e checklists; não use para alterar a especificação ou implementar tarefas.
---

# Informar progresso geral

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `sem perguntas`.
Não formule perguntas nesta skill. Apresente a projeção observada e o próximo
handoff aplicável.

Leia o estado exclusivamente de `specs/<estado>/*/spec.md`. O relatório é uma projeção da
fonte da verdade, nunca uma segunda fonte de estado.

## Orquestrar a conversa

Ao concluir esta etapa ou detectar trabalho de outra etapa, anuncie
`Pendência detectada: <descrição> — ação: resolvendo nesta etapa` e resolva-a
quando pertencer ao próprio escopo. Quando houver troca de responsabilidade,
anuncie `Transição automática: $specsfy-progress → $<destino> — motivo:
<motivo> — resultado esperado: <resultado>` e carregue imediatamente a skill de
destino, sem pedir confirmação nem repetir o comando. Continue na mesma
conversa. Depois de uma correção necessária a esta etapa, anuncie `Retomada
automática: $<destino> → $specsfy-progress — pendência resolvida:
<resultado>` e retome-a imediatamente. Reavalie o estado após cada handoff para
evitar ciclos. Não peça confirmação para o handoff; ações sensíveis continuam
exigindo autorização específica.

## Executar

Na raiz do repositório:

```bash
node .agents/skills/specsfy-progress/scripts/progress.mjs .
```

Para integração com outras ferramentas:

```bash
node .agents/skills/specsfy-progress/scripts/progress.mjs . --json
```

Para uma única especificação:

```bash
node .agents/skills/specsfy-progress/scripts/progress.mjs . --slug <slug>
```

Para observar o custo de contexto de uma spec:

```bash
node .agents/skills/specsfy-progress/scripts/analyze_context.mjs \
  specs/<estado>/<NNNN>-<slug>/spec.md --json
```

Para projetar pendências documentais junto com o progresso:

```bash
node .agents/skills/specsfy-setup/scripts/monitor_context.mjs \
  --project . --check

node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs \
  --project . --check
```

Trate `PENDING` como blocker da entrega e anuncie o handoff indicado pelo
monitor. Retome esta skill depois que a auxiliar atualizar o documento ou que a
avaliação sem impacto estiver registrada e reconhecida.
Se o segundo comando indicar documentação ausente ou desatualizada, anuncie o
handoff para `$specsfy-documentator`, reconstrua `docs/` e retome a projeção.

Sem `--usage-json`, o resultado é sempre rotulado `estimated` e documenta a
heurística. Métricas fornecidas explicitamente são `measured`; nunca apresente
estimativa como uso real.

## Interpretar

1. Informe os denominadores de specs, gates, tarefas e itens de checklist.
2. Mostre o ato atual e a próxima skill responsável, ambos derivados do
   `Status`.
3. Diferencie especificação concluída, trabalho em progresso e blocker real.
4. Mostre o próximo par `TNNN/ITEM` pronto quando existir.
5. Trate um gate `Failed`, inconsistência de checklist ou dependência sem caminho
   pronto como blocker. Um gate `In Progress` isolado não é falha.
6. Trate documentação obrigatória apontada por `monitor_context.mjs` como
   blocker, mesmo que todos os checkboxes estejam marcados.
7. Trate `docs/` ausente ou desatualizado segundo `$specsfy-documentator` como
   blocker da entrega.
8. Se uma spec existente exigir mudança de comportamento ou plano, anuncie a
   pendência e carregue automaticamente `$specsfy-update-spec`. Retome a
   projeção depois que a atualização percorrer os atos invalidados.
9. Se nenhuma spec existir, preserve o código 2. Capturas em `specs/inbox/` e
   itens em `specs/backlog/` não contam como progresso normativo. Quando o
   pedido também exigir avançar uma captura existente, anuncie a pendência e
   carregue `$specsfy-02-backlog`; quando já
   houver intenção e definição suficientes, carregue `$specsfy-03-specify`.

## Preservar a fonte

- Não edite specs, checkboxes, testes ou código durante a consulta.
- Não conte `spec.md` dentro de `research/`; a descoberta é exatamente
  `specs/<estado>/*/spec.md`.
- Não invente progresso a partir de commits, arquivos ou memória do chat.
- Para atualizar estado, anuncie e carregue automaticamente a skill responsável
  na mesma conversa. Retome automaticamente o progresso depois da atualização.

## Relatar

Entregue primeiro o resumo global, depois specs que exigem atenção, blockers e
próximo trabalho. Quando houver etapa acionável, anuncie e execute a transição
automaticamente. Use a saída JSON sem reinterpretar nomes de campos quando o
usuário pedir automação ou dados estruturados.

## Especialistas sob demanda

Leia [references/specialists.md](references/specialists.md) somente para propor
contexto para a próxima tarefa. Carregue automaticamente a skill base ou o
especialista já instalado que seja responsável; instalação exige autorização
específica.
