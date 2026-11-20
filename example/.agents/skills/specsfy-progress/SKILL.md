---
name: specsfy-progress
description: "Projeta, sem escrever nada, o progresso de todas as specs do projeto: denominadores de specs, gates, tarefas e checklists, ato atual, blockers reais e próximo par TNNN/ITEM pronto. Use quando o usuário pedir progresso geral, status das especificações, percentual concluído, quanto falta, bloqueios ou próximo trabalho, ou quando uma transição automática pedir a projeção final ou o roteamento pelo estado observado. Não use para alterar spec, gates ou checkboxes (use a skill responsável, como specsfy-07-implement ou specsfy-update-spec)."
---

# Informar progresso geral

Esta skill responde onde o projeto está e qual é o próximo passo. O relatório
é uma projeção de `specs/<estado>/*/spec.md`, nunca uma segunda fonte de
estado: nada é editado durante a consulta.

## Pronto quando

- O relatório traz os denominadores de specs, gates, tarefas e itens de
  checklist, calculados pelos scripts.
- Cada spec que exige atenção aparece com seu blocker e a skill responsável.
- Pendências de contexto e de documentação foram projetadas pelos checks.
- O próximo trabalho foi indicado e, quando acionável, a transição automática
  foi executada.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `sem perguntas`.
Não formule perguntas nesta skill. Apresente a projeção observada e o próximo
handoff aplicável.

## Orquestrar a conversa

Siga a seção `Orquestração conversacional` de `.specsfy/Spec.md`. Resumo:

- Pendência dentro do escopo: anuncie
  `Pendência detectada: <descrição> — ação: resolvendo nesta etapa` e resolva.
- Troca de responsabilidade: anuncie `Transição automática:
  $specsfy-progress → $<destino> — motivo: <motivo> — resultado esperado:
  <resultado>` e carregue imediatamente a skill de destino, sem pedir
  confirmação nem repetir o comando. Continue na mesma conversa.
- Correção concluída: anuncie `Retomada automática: $<destino> →
  $specsfy-progress — pendência resolvida: <resultado>` e retome.

Reavalie o estado depois de cada handoff para não entrar em ciclo. O handoff
dispensa confirmação; ações sensíveis continuam exigindo autorização
específica.

## Executar

Na raiz do projeto, os comandos abaixo são independentes e podem rodar em
paralelo.

| Objetivo | Comando | Tool MCP |
| --- | --- | --- |
| progresso geral | `specsfy progress` | `project_status` |
| dados para automação | `specsfy progress --json` | `project_status` |
| uma única spec | `specsfy progress --spec <spec>` | `project_status` |
| custo de contexto de uma spec | `specsfy context usage <spec> --json` | `context_usage` |
| contexto persistente | `specsfy context monitor --project . --check` | `context_monitor` |
| documentação técnica | `specsfy docs build --project . --check` | `docs_build` |

Sem o binário instalado, use os scripts equivalentes:

```bash
node .agents/skills/specsfy-progress/scripts/progress.mjs . --json
node .agents/skills/specsfy-progress/scripts/analyze_context.mjs specs/<estado>/<NNNN>-<slug>/spec.md --json
node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project . --check
node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project . --check
```

- `PENDING` no monitor de contexto é blocker da entrega: anuncie o handoff
  indicado pelo monitor e retome depois que a auxiliar atualizar o documento
  ou que a avaliação sem impacto estiver registrada e reconhecida.
- Documentação ausente ou desatualizada no segundo check leva a
  `$specsfy-documentator`; retome a projeção depois da reconstrução de `docs/`.
- Sem `--usage-json`, o custo de contexto sai rotulado `estimated` e descreve
  a heurística. Só métricas fornecidas explicitamente são `measured`; não
  apresente estimativa como uso real.

## Interpretar

1. Informe os denominadores de specs, gates, tarefas e itens de checklist.
2. Mostre o ato atual e a próxima skill responsável, ambos derivados do
   `Status`.
3. Separe spec concluída, trabalho em progresso e blocker real.
4. Mostre o próximo par `TNNN/ITEM` pronto quando existir.
5. Classifique como blocker: gate `Failed`, inconsistência de checklist,
   dependência sem caminho pronto, documentação obrigatória apontada por
   `specsfy context monitor` (mesmo com todos os checkboxes marcados) e `docs/`
   ausente ou desatualizado segundo `$specsfy-documentator`. Um gate
   `In Progress` isolado não é falha.
6. Se uma spec existente exigir mudança de comportamento ou de plano, anuncie a
   pendência e carregue automaticamente `$specsfy-update-spec`. Retome a
   projeção depois que a atualização percorrer os atos invalidados.
7. Sem nenhuma spec, preserve o código de saída 2. Capturas em `specs/inbox/` e
   itens em `specs/backlog/` não contam como progresso normativo. Se o pedido
   também exigir avançar uma captura, carregue `$specsfy-02-backlog`; se já
   houver intenção e definição suficientes, carregue `$specsfy-03-specify`.

## Preservar a fonte

- Não edite specs, checkboxes, testes ou código durante a consulta.
- A descoberta é exatamente `specs/<estado>/*/spec.md`; não conte `spec.md`
  dentro de `research/`.
- Não deduza progresso de commits, arquivos soltos ou memória do chat.
- Para mudar estado, anuncie e carregue a skill responsável na mesma conversa
  e retome o progresso depois.

## Relatar

Entregue primeiro o resumo global, depois as specs que exigem atenção, os
blockers e o próximo trabalho. Quando houver etapa acionável, anuncie e
execute a transição automaticamente. Se o usuário pedir automação ou dados
estruturados, use a saída JSON sem renomear campos.

## Especialistas sob demanda

Leia [references/specialists.md](references/specialists.md) somente para
propor contexto para a próxima tarefa. Carregue automaticamente a skill base
ou o especialista já instalado que seja responsável; instalação exige
autorização específica.
