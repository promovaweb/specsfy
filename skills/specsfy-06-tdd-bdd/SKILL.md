---
name: specsfy-06-tdd-bdd
description: "Usa o Gherkin de referência da spec para escrever testes TDD executáveis, provar RED antes da implementação, conduzir RED-GREEN-REFACTOR e auditar a rastreabilidade entre spec.md e testes nas seções 11 a 13. Use quando o usuário pedir TDD, BDD, testes derivados da especificação, rastreabilidade ou um ciclo RED-GREEN-REFACTOR, e quando uma transição automática pedir materialização, RED ou verificação de testes. Não executa Gherkin nem arquivos .feature e não inventa comportamento. O plano de tarefas fica com specsfy-05-tasks e as tarefas de produção da seção 14 com specsfy-07-implement."
---

# Executar TDD orientado pelo BDD da especificação

O Gherkin da spec ajuda a pessoa e o agente a entender contexto, ação e
resultado, mas ele próprio não é uma suíte de testes. Esta skill converte esse
comportamento em testes TDD executáveis, observa a falha antes do código e
registra evidência rastreável na mesma `spec.md`. Sem RED observado, não há
prova de que o teste protege o requisito.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`. A pergunta típica
desta skill é qual runner adotar em projeto Node sem PHP.

## Pronto quando

- `prepare`: o teste TDD da fatia existe com marcador `SPECSFY:`, falhou pelo
  comportamento ausente, o RED está na tabela `Evidência RED-GREEN-REFACTOR` e
  a tarefa `[TEST]` tem os seis itens concluídos; o controle voltou para
  `$specsfy-05-tasks`;
- `cycle`: RED, GREEN e REFACTOR estão registrados na mesma linha de evidência
  e as suítes relacionadas passam;
- `verify`: `check_traceability.mjs` e `verify_acceptance.mjs` rodaram, e os
  gaps foram relatados ou resolvidos.

## Proteção obrigatória do banco

Antes de executar qualquer teste focal, suíte ou regressão, confira o comando e
o ambiente:

```bash
node .agents/skills/specsfy-setup/scripts/check_database_safety.mjs \
  --project <raiz> --command "<comando-de-teste>"
```

Em Laravel, a conferência exige `.env.testing`, `APP_ENV=testing` e um banco
explicitamente diferente do banco de desenvolvimento registrado no `.env`.

- `PENDING`: não execute teste algum. Corrija o ambiente de testes, repita a
  conferência e prossiga somente depois de `SAFE`.
- `IGNORED`: descarte o comando. Não o execute, não o adapte com `--force` e
  não peça autorização para rodá-lo.

A lista de comandos destrutivos está em `Proteção do banco de desenvolvimento`
de `.specsfy/Spec.md` e inclui `migrate:fresh`, `migrate:refresh`,
`migrate:reset`, `migrate:rollback`, `db:wipe`, `schema:drop`,
`prisma migrate reset`, `DROP DATABASE`, `DROP SCHEMA`, `DROP TABLE` e
`TRUNCATE`. Não use `RefreshDatabase` nem `DatabaseMigrations`; em Laravel,
prefira `DatabaseTransactions` e factories que criem somente os registros
usados pelo caso.

## Orquestrar a conversa

Ao concluir esta etapa ou detectar trabalho de outra etapa, anuncie
`Pendência detectada: <descrição> — ação: resolvendo nesta etapa` e resolva-a
quando pertencer ao próprio escopo. Quando houver troca de responsabilidade,
anuncie `Transição automática: $specsfy-06-tdd-bdd → $<destino> — motivo:
<motivo> — resultado esperado: <resultado>` e carregue imediatamente a skill de
destino, sem pedir confirmação nem repetir o comando. Continue na mesma
conversa. Depois de uma correção necessária a esta etapa, anuncie `Retomada
automática: $<destino> → $specsfy-06-tdd-bdd — pendência resolvida:
<resultado>` e retome-a imediatamente. Reavalie o estado após cada handoff para
evitar ciclos. Não peça confirmação para o handoff; ações sensíveis continuam
exigindo autorização específica.

## Escolher o modo

| Modo | Uso | Escreve produção? |
| --- | --- | --- |
| `prepare` | antes da implementação, cria o próximo teste e prova RED | não |
| `cycle` | executa RED → GREEN → REFACTOR para uma fatia escolhida | sim, o mínimo |
| `verify` | executa suítes e audita rastreabilidade | não |

Se o usuário não indicar o modo, use `prepare` quando a seção 14 ainda não
estiver em execução e `cycle` quando houver uma tarefa ativa.

## Preparar

Leia em paralelo `specs/<estado>/<NNNN>-<slug>/spec.md`, os testes existentes,
a configuração do projeto e `references/test-levels.md`. Depois:

1. Exija `Formato: Specsfy/2.0` e `Definition Gate: Passed`. No modo
   `prepare`, use `Status: Defined` e `Plan Gate: Pending`; nos modos `cycle`
   e `verify`, use `Status: Planned` ou `Implementing`.
2. Selecione uma fatia vertical pequena: um `AC` Gherkin e seus `FR/NFR`.
3. Resolva o runner de testes pela stack antes de escrever testes:
   - projeto PHP (`composer.json` ou `artisan`), inclusive PHP + Node: use
     Pest;
   - projeto Node sem PHP: pergunte ao usuário qual runner adotar antes de
     instalar ou configurar e recomende Vitest por padrão. Considere a decisão
     materializada quando `package.json` expuser o script `test:tdd`; não
     escolha nem instale dependência silenciosamente;
   - outra stack: preserve o runner existente ou pergunte quando não houver
     decisão reproduzível.
4. Confira o ambiente e o comando com `check_database_safety.mjs`. Se o estado
   não for `SAFE`, não execute teste algum e mantenha a etapa pendente.
5. Escolha com `references/test-levels.md` o nível mais baixo que ainda prova o
   comportamento.

## Usar o BDD para escrever TDD

- Use o bloco Gherkin do `AC` em `spec.md` como contrato de referência, sem
  mudar seu significado. Os termos Given/When/Then permanecem apenas na
  `spec.md`; não crie, copie nem execute arquivos `.feature` ou step
  definitions.
- Em PHP, escreva o teste TDD com Pest em `tests/Feature/` ou `tests/Unit/`,
  no menor nível que prova o comportamento. Marque cada caso executável,
  imediatamente junto à sua definição, com:

  ```php
  // SPECSFY: US-001 FR-001 AC-001
  ```

- Em Node, depois da resposta do usuário, escreva o teste TDD no runner
  escolhido e use `SPECSFY: US-001 FR-001 AC-001`.
- Materialize no mínimo três casos TDD distintos para a feature inteira e para
  cada `US`, `FR` e `NFR`: caminho feliz, regra ou variação crítica, e falha ou
  limite material. Um único marcador `SPECSFY:` compartilhado pelo arquivo
  conta como um caso, mesmo que o arquivo contenha vários testes.
- Cubra cada `AC` com ao menos um caso TDD, sem multiplicar casos
  equivalentes.
- Escolha unidade, integração, contrato ou browser conforme a fronteira
  descrita pelo BDD, sem criar uma segunda suíte só para rotulá-la como BDD.
- Não use mocks para remover justamente a fronteira que o cenário pretende
  provar.

## Ciclo obrigatório

### RED

1. Escreva, a partir do BDD de referência, o menor teste TDD que prova o `AC`
   e seus requisitos.
2. Execute o teste TDD. O Gherkin não é executado.
3. Confirme que a falha vem do comportamento ausente ou incorreto.
4. Se falhar por sintaxe, fixture, importação ou ambiente, corrija o teste e
   repita.
5. Se passar antes da mudança, o teste não demonstra o gap: refine-o ou prove
   que a funcionalidade já existe.

Registre o RED observado na tabela `Evidência RED-GREEN-REFACTOR`.

No modo `prepare`, pare após o RED válido, registre a evidência e conclua o
checklist da tarefa `[TEST]` correspondente. Deixe `Plan Gate` como está:
anuncie e retorne automaticamente para `$specsfy-05-tasks`, que valida todos
os predecessores antes de promover a spec para `Planned`.

### GREEN

No modo `cycle`, escreva o mínimo de código de produção que satisfaça o
cenário. Execute primeiro o teste focal e depois a suíte relacionada. Só
generalize quando um exemplo exigir. Atualize a mesma linha de evidência com o
GREEN observado.

### REFACTOR

Com tudo verde, elimine duplicação e melhore nomes e estrutura sem alterar
comportamento. Execute novamente as suítes relacionadas. Registre o comando de
regressão na seção 11 e a evidência na matriz da seção 12.

### Checklist da tarefa de teste

Atualize `PREP`, `EXECUTE`, `VERIFY`, `VISUAL`, `EVIDENCE` e `IMPROVE` à medida
que cada etapa acontecer. O item `VISUAL` também é obrigatório: confirme se o
teste toca uma interface e, quando não tocar, registre `Não aplicável` e o
motivo. Conclua o pai somente com arquivo, marcador, RED válido, comando,
evidência e revisão do processo. Código de produção espera até o predecessor
TDD informado pelo BDD da mesma fatia estar concluído e com RED registrado na
spec.

## Disciplina sob pressão

| Tentação | Regra |
| --- | --- |
| “É uma mudança pequena.” | Mudanças pequenas recebem testes pequenos; tamanho não substitui RED. |
| “O código já está pronto.” | Escreva um teste de caracterização sem alterar produção para fabricar RED. Para comportamento novo, escolha um caso ainda não atendido. |
| “O prazo permite pular RED.” | Sem falha observada não há prova de que o teste protege o requisito. |
| “O líder autorizou.” | Autoridade pode mudar escopo, não transformar ausência de evidência em TDD. |
| “Testar depois é equivalente.” | Escrever o teste antes guia o contrato e prova sensibilidade antes da implementação. |

## Auditar rastreabilidade

Execute:

```bash
node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/<estado>/<NNNN>-<slug>/spec.md .
```

- Trate como gap cada feature, `US`, `FR` ou `NFR` com menos de três casos TDD
  e cada `AC` sem ao menos um caso.
- Para `NFR` verificado manualmente ou por observabilidade, cite a evidência
  sem dispensar os três casos automatizáveis; quando necessário, ajuste
  `--kinds` sem remover IDs aplicáveis.
- Em specs com `Evidence Contract: 1`, acrescente `--full-chain` para exigir
  `US/FR/NFR/AC → teste → tarefa → evidência`.
- Durante a execução, mantenha `Delivery Gate: In Progress` e atualize o
  `Gate do Ato III — Entrega` da seção 13. Use `Passed` somente sem gap
  obrigatório, com todas as tarefas concluídas e a Definition of Done
  comprovada.

## Auditar QA

Depois de executar os runners do repositório, registre `Passed` ou a falha na
coluna Evidência da seção 12 e audite:

```bash
node .agents/skills/specsfy-06-tdd-bdd/scripts/verify_acceptance.mjs \
  specs/<estado>/<NNNN>-<slug>/spec.md .
```

O auditor não executa comandos extraídos de Markdown. AC manual exige método,
responsável e evidência; AC sem resultado impede `Delivery Gate: Passed`.
Quando houver atestação do runner, repita com `--attestation PATH`: o auditor
exige exatamente o check `acceptance:<slug>` aprovado, detail JSON válido e
cobertura de todos os ACs. Texto `Passed` isolado não substitui essa prova.

## Relatar evidência

Informe a fatia, os IDs cobertos, o arquivo do teste, o comando RED e a causa
da falha, o comando GREEN quando aplicável, a suíte de regressão e os gaps de
rastreabilidade.

## Especialistas sob demanda

Leia [references/specialists.md](references/specialists.md) quando o runner, a
fronteira ou o oráculo de teste for específico de uma tecnologia. O
especialista complementa; esta skill preserva RED/GREEN e rastreabilidade.
