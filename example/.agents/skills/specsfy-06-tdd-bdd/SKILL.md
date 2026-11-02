---
name: specsfy-06-tdd-bdd
description: "Use quando o usuário pede TDD, BDD, testes derivados do Gherkin de referência da especificação, rastreabilidade entre `spec.md` e testes, ou um ciclo RED-GREEN-REFACTOR. Use também quando uma transição automática pedir materialização, RED ou verificação de testes. Use para editar as seções 11–13 e executar testes; `specsfy-07-implement` continua responsável pelas tarefas de produção na seção 14 do mesmo arquivo."
---

# Executar TDD orientado pelo BDD da especificação

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

Leia o BDD como referência e converta o comportamento especificado em testes TDD
executáveis e evidência rastreável. O Gherkin ajuda o usuário e o agente a
entender contexto, ação e resultado; ele próprio não é uma suíte de testes.

## Proteção obrigatória do banco

Antes de executar qualquer teste focal, suíte ou regressão, confira o comando e
o ambiente:

```bash
node .agents/skills/specsfy-setup/scripts/check_database_safety.mjs \
  --project <raiz> --command "<comando-de-teste>"
```

Em Laravel, a conferência exige `.env.testing`, `APP_ENV=testing` e um banco
explicitamente diferente do banco de desenvolvimento registrado no `.env`.
Não execute nenhum teste enquanto o resultado for `PENDING`. Corrija o ambiente
de testes, repita a conferência e prossiga somente depois de `SAFE`.

Trate `IGNORED` como descarte obrigatório do comando. Não execute, não adapte
com `--force` e não peça autorização para rodar `migrate:fresh`,
`migrate:refresh`, `migrate:reset`, `migrate:rollback`, `db:wipe`,
`schema:drop`, `prisma migrate reset`, `DROP DATABASE`, `DROP SCHEMA`,
`DROP TABLE`, `TRUNCATE` ou equivalentes. Não use `RefreshDatabase` nem
`DatabaseMigrations`; em Laravel, prefira `DatabaseTransactions` e factories
que criem somente os registros usados pelo caso.

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

- `prepare`: antes da implementação, criar o próximo teste/scenario e provar RED sem escrever código de produção.
- `cycle`: executar RED → GREEN → REFACTOR para uma fatia explicitamente escolhida.
- `verify`: executar suites e auditar rastreabilidade sem criar comportamento novo.

Se o usuário não indicar o modo, use `prepare` quando a seção 14 ainda não estiver em execução e `cycle` quando houver uma tarefa ativa.

## Preparar

1. Leia `specs/<estado>/<NNNN>-<slug>/spec.md`, testes e configuração do projeto.
2. Exija `Formato: Specsfy/2.0` e `Definition Gate: Passed`. No modo `prepare`,
   use `Status: Defined` e `Plan Gate: Pending`; nos modos `cycle` e `verify`,
   use `Status: Planned` ou `Implementing`.
3. Selecione uma fatia vertical pequena: um `AC` Gherkin e seus `FR/NFR`.
4. Resolva o runner de testes pela stack antes de escrever testes:
   - projeto PHP (`composer.json` ou `artisan`), inclusive PHP + Node: use Pest;
   - projeto Node sem PHP: pergunte ao usuário qual runner adotar antes de
     instalar ou configurar; recomende Vitest por padrão;
   - outra stack: preserve o runner de testes existente ou pergunte quando não houver
     decisão reproduzível.
5. Confira o ambiente e o comando com `check_database_safety.mjs`. Se o estado
   não for `SAFE`, não execute teste algum e mantenha a etapa pendente.
6. Em Node, considere a decisão materializada quando `package.json` expuser o
   script `test:tdd`; não escolha nem instale dependência silenciosamente.
7. Leia `references/test-levels.md` para escolher o nível mais baixo que ainda prova o comportamento.

## Usar o BDD para escrever TDD

- Use o bloco Gherkin do `AC` em `spec.md` como contrato de referência sem mudar
  seu significado.
- Não crie, copie nem execute arquivos `.feature` ou step definitions. Os termos
  Given/When/Then permanecem apenas na `spec.md`.
- Em PHP, escreva o teste TDD com Pest em `tests/Feature/` ou `tests/Unit/`, no
  menor nível que prova o comportamento. Marque cada caso executável,
  imediatamente junto à sua definição, com:

```php
// SPECSFY: US-001 FR-001 AC-001
```

- Em Node, depois da resposta do usuário, escreva o teste TDD no runner
  escolhido e use `SPECSFY: US-001 FR-001 AC-001`.
- Materialize no mínimo três casos TDD distintos para a feature inteira e para
  cada `US`, `FR` e `NFR`: caminho feliz, regra/variação crítica e falha ou
  limite material. Um único marcador `SPECSFY:` compartilhado pelo arquivo
  conta como um caso, mesmo que o arquivo contenha vários testes.
- Cubra cada `AC` com ao menos um caso TDD, sem multiplicar casos equivalentes.
- Escolha unidade, integração, contrato ou browser conforme a fronteira descrita
  pelo BDD; não crie uma segunda suíte apenas para rotulá-la como BDD.
- Não use mocks para remover justamente a fronteira que o cenário pretende provar.

## Ciclo obrigatório

### RED

1. Leia o BDD de referência e escreva o menor teste TDD que prova o `AC` e seus
   requisitos.
2. Execute o teste TDD; nunca execute Gherkin.
3. Confirme falha pelo comportamento ausente ou incorreto.
4. Se falhar por sintaxe, fixture, importação ou ambiente, corrija o teste e repita.
5. Se passar antes da mudança, o teste não demonstra o gap: refine-o ou prove que a funcionalidade já existe.

No modo `prepare`, pare após o RED válido, registre evidência e conclua o
checklist da tarefa `[TEST]` correspondente. Não
altere `Plan Gate`; anuncie e retorne automaticamente para
`$specsfy-05-tasks`, que valida todos os predecessores antes de promover a
spec para `Planned`.
Registre a linha correspondente na tabela `Evidência RED-GREEN-REFACTOR` com o RED observado.

### GREEN

No modo `cycle`, escreva o mínimo de código de produção que satisfaça o cenário. Execute primeiro o teste focal e depois a suite relacionada. Não generalize antes de haver um exemplo que exija generalização.
Atualize a mesma linha de evidência com o GREEN observado.

### REFACTOR

Com tudo verde, elimine duplicação e melhore nomes/estrutura sem alterar comportamento. Execute novamente as suites relacionadas.
Registre o comando de regressão na seção 11 e a evidência na matriz da seção 12.

## Auditar rastreabilidade

Execute:

```bash
node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/<estado>/<NNNN>-<slug>/spec.md .
```

Trate como gap cada feature, `US`, `FR` ou `NFR` com menos de três casos TDD e
cada `AC` sem ao menos um caso. Para `NFR` verificado manualmente ou por
observabilidade, cite a evidência sem dispensar os três casos automatizáveis;
quando necessário, ajuste `--kinds` sem remover IDs aplicáveis.
Em specs com `Evidence Contract: 1`, acrescente `--full-chain` para exigir
`US/FR/NFR/AC → teste → tarefa → evidência`.
Durante execução, mantenha `Delivery Gate: In Progress` e atualize o
`Gate do Ato III — Entrega` da seção 13. Use `Passed` somente quando não houver
gap obrigatório, todas as tarefas estiverem concluídas e a Definition of Done
estiver comprovada.

## Disciplina sob pressão

| Tentação | Regra |
| --- | --- |
| “É uma mudança pequena.” | Mudanças pequenas recebem testes pequenos; tamanho não substitui RED. |
| “O código já está pronto.” | Escreva um teste de caracterização; não altere produção para fabricar RED. Para comportamento novo, escolha um caso ainda não atendido. |
| “O prazo permite pular RED.” | Sem falha observada não há prova de que o teste protege o requisito. |
| “O líder autorizou.” | Autoridade pode mudar escopo, não transformar ausência de evidência em TDD. |
| “Testar depois é equivalente.” | Test-first guia o contrato e prova sensibilidade antes da implementação. |

Em uma tarefa de teste, atualize `PREP`, `EXECUTE`, `VERIFY`, `VISUAL`,
`EVIDENCE` e `IMPROVE` conforme cada etapa acontecer. O item `VISUAL` também é
obrigatório para confirmar se o teste toca uma interface; quando não tocar,
registre `Não aplicável` e o motivo. Não marque o pai como concluído sem
arquivo, marcador, RED válido, comando/evidência e revisão do processo.
Não escreva código de produção antes que o predecessor TDD informado pelo BDD
da mesma fatia esteja concluído e com RED registrado na spec.

## Auditar QA

Depois de executar os runners pertencentes ao repositório, registre `Passed` ou
a falha na coluna Evidência da seção 12 e audite:

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

Informe a fatia, IDs cobertos, arquivo do teste, comando RED, causa da falha, comando GREEN quando aplicável, suite de regressão e gaps de rastreabilidade.

## Especialistas sob demanda

Leia [references/specialists.md](references/specialists.md) quando o runner,
boundary ou oráculo de teste for específico de uma tecnologia. O especialista
complementa; esta skill preserva RED/GREEN e rastreabilidade.
