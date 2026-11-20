---
name: specsfy-06-implement
description: "Entrega uma spec planejada em dois modos. Modo tests, usa o Gherkin da spec para escrever testes TDD executáveis, provar RED antes da implementação, conduzir RED-GREEN-REFACTOR e auditar a rastreabilidade entre spec.md e testes nas seções 11 a 13, sem executar Gherkin nem .feature e sem inventar comportamento. Modo implement, executa as tarefas da seção 14 de spec.md em ordem de dependência, escreve o código de produção a partir de testes em RED, registra a comprovação na spec e fecha o Delivery Gate. Use quando o usuário pedir TDD, BDD, testes derivados da especificação, rastreabilidade ou ciclo RED-GREEN-REFACTOR, quando pedir para implementar, executar, continuar a próxima tarefa pronta ou concluir uma feature planejada, e quando uma transição automática pedir materialização, RED ou verificação de testes, ou iniciar ou retomar a entrega. Não use para apenas decompor tarefas (use specsfy-05-tasks) ou mudar o comportamento acordado (use specsfy-update-spec)."
---

# Testar e implementar a especificação

Esta skill é a etapa 06 do ciclo e reúne os dois trabalhos da entrega: escrever
os testes TDD a partir do Gherkin da spec, com RED observado, e executar as
tarefas da seção 14 até GREEN, com as provas de entrega. Identifique o modo
pelo pedido, leia a referência do modo por inteiro e siga somente ela.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`. Pergunte somente o
que a spec e o projeto não respondem. A pergunta típica desta skill é qual
runner adotar em projeto Node sem PHP.

## Escolher o modo

| Modo | Quando o pedido indica | Leia e siga |
| --- | --- | --- |
| `tests` | TDD, BDD, testes derivados da spec, RED, ciclo RED-GREEN-REFACTOR, rastreabilidade ou auditoria de aceite; `$specsfy-05-tasks` pediu o predecessor TDD de uma fatia | [references/tests.md](references/tests.md) |
| `implement` | implementar, executar, continuar a próxima tarefa pronta ou concluir uma feature com `Plan Gate: Passed` | [references/implement.md](references/implement.md) |

1. Leia o cabeçalho da spec quando o pedido não deixar o modo claro. Com
   `Status: Defined` e `Plan Gate: Pending`, o modo é `tests`, no passo
   `prepare`. Com `Status: Planned` ou `Implementing` e `Plan Gate: Passed`,
   o modo é `implement`.
2. Se ainda houver mais de uma leitura razoável, pergunte qual modo a pessoa
   quer, pelo `Contrato de perguntas numeradas`.
3. Um modo encaminha ao outro. O `implement` passa pelo `tests` em toda tarefa
   `[TEST]` e na verificação final de rastreabilidade e aceite. O `tests`
   devolve ao `implement` quando o RED da fatia está registrado e a tarefa de
   produção pode começar.

## Trocar de modo

A troca entre `tests` e `implement` acontece dentro desta skill, sem carregar
outra. Anuncie `Troca de modo: <origem> → <destino> — motivo: <motivo> —
resultado esperado: <resultado>`, leia a referência do novo modo antes de
continuar e siga na mesma conversa, sem pedir confirmação. Ao voltar, anuncie
`Retomada do modo: <destino> → <origem> — pendência resolvida: <resultado>`.
A raiz confirmada no `$specsfy-setup` continua valendo na troca.

## Orquestrar a conversa

Siga a seção `Orquestração conversacional` de `.specsfy/Spec.md`. Resumo:

- Pendência dentro do escopo: anuncie
  `Pendência detectada: <descrição> — ação: resolvendo nesta etapa` e resolva.
- Troca de responsabilidade: anuncie `Transição automática:
  $specsfy-06-implement → $<destino> — motivo: <motivo> — resultado esperado:
  <resultado>` e carregue imediatamente a skill de destino, sem pedir
  confirmação nem repetir o comando. Continue na mesma conversa.
- Correção concluída: anuncie `Retomada automática: $<destino> →
  $specsfy-06-implement — pendência resolvida: <resultado>` e retome.

Reavalie o estado depois de cada handoff para não entrar em ciclo. O handoff
dispensa confirmação; ações sensíveis continuam exigindo autorização
específica.

Destinos mais comuns: `$specsfy-05-tasks` quando falta tarefa, predecessor TDD
ou RED em um plano antes aprovado, e depois do RED do passo `prepare`;
`$specsfy-documentator` depois de cada tarefa `[CODE]`; `$specsfy-04-validate`
para o aceite final. Quando a entrega exigir comportamento não descrito na
spec, carregue automaticamente `$specsfy-update-spec`.

## Proteção obrigatória do banco

Testes nunca rodam contra o banco de desenvolvimento. Nos dois modos, confira
o comando e o ambiente antes de executar qualquer teste, suíte, regressão ou
migration:

```bash
specsfy gate database --project <raiz> --command "<comando-pretendido>"
```

Pelo MCP, use a tool `gate_database`. Sem o binário instalado, rode o script
equivalente:

```bash
node .agents/skills/specsfy-setup/scripts/check_database_safety.mjs \
  --project <raiz> --command "<comando-pretendido>"
```

Execute somente depois de `SAFE`. Com `PENDING`, corrija o ambiente de testes
e confira de novo. Com `IGNORED`, descarte o comando. A lista de comandos
sempre ignorados e as regras de cada modo estão na referência do modo.

## Commands e scripts

| Ação | Command | Tool MCP | Script alternativo |
| --- | --- | --- | --- |
| auditar rastreabilidade | `specsfy gate trace <spec>` | `gate_trace` | `node .agents/skills/specsfy-06-implement/scripts/check_traceability.mjs <spec.md> .` |
| auditar aceite | `specsfy gate acceptance <spec>` | `gate_acceptance` | `node .agents/skills/specsfy-06-implement/scripts/verify_acceptance.mjs <spec.md> .` |
| próxima tarefa pronta | `specsfy tasks next <spec>` | `task_next` | `node .agents/skills/specsfy-06-implement/scripts/next_task.mjs <spec.md>` |
| conferir a comprovação de uma tarefa | `specsfy gate evidence <spec> --task TNNN` | `gate_evidence` | `node .agents/skills/specsfy-06-implement/scripts/verify_evidence.mjs <spec.md> . --task TNNN` |
| resumo de entrega | `specsfy tasks delivery <spec> --format markdown` | `delivery_render` | `node .agents/skills/specsfy-06-implement/scripts/render_delivery.mjs <spec.md> --format markdown` |
| progresso geral | `specsfy progress --project <raiz>` | `project_status` | `node .agents/skills/specsfy-05-tasks/scripts/progress.mjs <raiz> --json` |

Use o script somente quando o binário `specsfy` não estiver instalado.

## Limites

- Não execute Gherkin nem arquivos `.feature` e não invente comportamento.
- Não altere código de produção sem o predecessor TDD da mesma fatia concluído
  e com RED registrado na spec.
- Não crie `tasks.md`, `plan.md`, `research.md` ou `data-model.md`; a spec é a
  fonte única.
- Não declare `Delivery Gate: Passed` com tarefa aberta, lacuna de
  rastreabilidade ou comprovação ausente.
- Os limites completos de cada modo estão na referência correspondente.
