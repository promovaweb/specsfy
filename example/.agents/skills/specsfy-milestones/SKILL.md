---
name: specsfy-milestones
description: Cuida dos milestones em três modos. Modo mvp, importa MVP.md como a milestone 1.0 (M01), cria backlog e spec Draft somente para requisitos de desenvolvimento, mantém o contexto de negócio apenas na fonte e orquestra a entrevista de cada backlog importado. Modo roadmap, entrevista a evolução depois do MVP aceito e propõe milestones pós-MVP com objetivo, condição de saída e dependências, sem reabrir em silêncio o núcleo acordado. Modo sync, projeta o estado dos milestones a partir de specs e backlog com specsfy milestones sync, aponta vínculos ausentes ou incoerentes, sugere ajustes confirmáveis e atualiza somente os blocos derivados. Use quando houver um MVP.md a transformar em M01, para planejar as próximas etapas depois do MVP, ou para conferir progresso e vínculos dos marcos quando specs mudarem de estado. Não use para executar tarefas, implementar, aprovar gates, mudar spec concluída (specsfy-update-spec) ou concluir marcos sem validação humana.
---

# Milestones do projeto

Esta skill reúne o trabalho com milestones: a entrada do MVP como a milestone
1.0, o planejamento dos marcos seguintes e a projeção do estado dos marcos a
partir de specs e backlog. Identifique o modo pelo pedido, leia a referência
do modo por inteiro e siga somente ela.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

## Escolher o modo

| Modo | Quando o pedido indica | Leia e siga |
| --- | --- | --- |
| `mvp` | existe um `MVP.md` a transformar em `M01`, backlogs e specs Draft, ou a pessoa quer definir o MVP inicial | [references/mvp.md](references/mvp.md) |
| `roadmap` | o MVP já foi aceito e a pessoa quer planejar as próximas etapas do produto | [references/roadmap.md](references/roadmap.md) |
| `sync` | conferir progresso e vínculos dos marcos, depois de importar o MVP ou quando specs mudarem de estado | [references/sync.md](references/sync.md) |

1. Leia `specs/milestones/` e `MVP.md` quando o pedido não deixar o modo
   claro. Sem `M01.md` e com `MVP.md` presente, o modo é `mvp`. Com o MVP
   aceito e pedido de evolução, o modo é `roadmap`. Pedido de conferência,
   progresso ou vínculo é `sync`.
2. Se ainda houver mais de uma leitura razoável, pergunte qual modo a pessoa
   quer, pelo `Contrato de perguntas numeradas`.
3. Um modo pode encaminhar a outro: o `mvp` termina com o `sync`, e o `sync`
   devolve falta de descoberta ao `mvp` e evolução posterior ao `roadmap`. Ao
   trocar de modo, leia a referência do novo modo antes de continuar.

## Commands e script

| Ação | Command | Tool MCP | Script alternativo |
| --- | --- | --- | --- |
| importar `MVP.md` como `M01` | `specsfy milestones import-mvp --project <raiz>` | `milestones_import_mvp` | `node .agents/skills/specsfy-milestones/scripts/importar_mvp.mjs --root <raiz>` |
| projetar o estado dos marcos | `specsfy milestones sync --project <raiz>` | `milestones_sync` | não há |

Use o script somente quando o binário `specsfy` não estiver instalado.

## Limites

- Não invente objetivo, condição de saída, fora de escopo ou vínculos de um
  milestone.
- Não sobrescreva a milestone 1.0 nem mude o MVP aceito sem confirmação
  explícita.
- Não implemente código, não execute tarefas e não marque gate como Passed.
- Não conclua um marco sem a confirmação humana descrita no modo `sync`.
- Os limites completos de cada modo estão na referência correspondente.
