# Escrever os testes TDD a partir do BDD da especificação

O Gherkin da spec ajuda a pessoa e o agente a entender contexto, ação e
resultado, mas ele próprio não é uma suíte de testes. Este modo converte esse
comportamento em testes TDD executáveis, observa a falha antes do código e
registra evidência rastreável na mesma `spec.md`. Sem RED observado, não há
prova de que o teste protege o requisito.

Referência do modo `tests` de `$specsfy-06-implement`. A preparação
obrigatória com `$specsfy-setup`, o modo de interação `perguntas` e os
anúncios de handoff e de troca de modo estão no `SKILL.md` e valem para este
modo. A pergunta típica deste modo é qual runner adotar em projeto Node sem
PHP.

Este modo não executa Gherkin nem arquivos `.feature` e não inventa
comportamento. O plano de tarefas fica com `$specsfy-05-tasks` e as tarefas
de produção da seção 14 ficam com o modo `implement`.

## Pronto quando

- `prepare`: o teste TDD da fatia existe com marcador `SPECSFY:`, falhou pelo
  comportamento ausente, o RED está na tabela `Evidência RED-GREEN-REFACTOR` e
  a tarefa `[TEST]` tem os seis itens concluídos; o controle voltou para
  `$specsfy-05-tasks`;
- `cycle`: RED, GREEN e REFACTOR estão registrados na mesma linha de evidência
  e as suítes relacionadas passam;
- `verify`: `specsfy gate trace <spec>` e `specsfy gate acceptance <spec>`
  rodaram, e os gaps foram relatados ou resolvidos.

## Proteção obrigatória do banco

Antes de executar qualquer teste focal, suíte ou regressão, confira o comando e
o ambiente:

```bash
specsfy gate database --project <raiz> --command "<comando-de-teste>"
```

Pelo MCP, use a tool `gate_database`. Sem o binário instalado, rode o script
equivalente:

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

## Escolher o passo

O modo `tests` tem três passos. Cada um responde a um momento da entrega.

| Passo | Uso | Escreve produção? |
| --- | --- | --- |
| `prepare` | antes da implementação, cria o próximo teste e prova RED | não |
| `cycle` | executa RED → GREEN → REFACTOR para uma fatia escolhida | sim, o mínimo |
| `verify` | executa suítes e audita rastreabilidade | não |

Se o usuário não indicar o passo, use `prepare` quando a seção 14 ainda não
estiver em execução e `cycle` quando houver uma tarefa ativa.

## Preparar

Leia em paralelo `specs/<estado>/<NNNN>-<slug>/spec.md`, os testes existentes,
a configuração do projeto e [test-levels.md](test-levels.md). Depois:

1. Exija `Formato: Specsfy/2.0` e `Definition Gate: Passed`. No passo
   `prepare`, use `Status: Defined` e `Plan Gate: Pending`; nos passos `cycle`
   e `verify`, use `Status: Planned` ou `Implementing`.
2. Em `prepare`, use o ID enviado por `$specsfy-05-tasks`. Se ele faltar,
   execute `specsfy tasks next <spec> --phase red` ou use `task_next` com
   `phase: red`. Sem ambos, selecione na ordem da seção 14 a primeira tarefa
   `[TEST] [TDD]` aberta exigida pelo Plan Gate com `Depends` concluídos.
   Após o Plan Gate, use `specsfy tasks next <spec>` para a execução.
   Derive o teste do `AC`
   Gherkin e dos `FR/NFR` referenciados. Em `cycle`, selecione a fatia ativa
   pelo `AC` e seus `FR/NFR`.
3. Resolva o runner de testes pela stack antes de escrever testes:
   - projeto PHP (`composer.json` ou `artisan`), inclusive PHP + Node: use
     Pest. Em Laravel, aplique `testing/pest + laravel/app`;
   - projeto Node sem PHP: pergunte ao usuário qual runner adotar antes de
     instalar ou configurar e recomende Vitest por padrão. Considere a decisão
     materializada quando `package.json` expuser o script `test:tdd`; não
     escolha nem instale dependência silenciosamente;
   - outra stack: preserve o runner existente ou pergunte quando não houver
     decisão reproduzível;
   - Playwright exige um plano automatizado de navegador com stack
     compatível confirmada ou decisão explícita de instalar o runner para o
     plano. Para inspeção manual de teclado, use `interface/accessibility`
     e registre a evidência visual na tarefa.
4. Confira o ambiente e o comando com `specsfy gate database`. Se o estado
   não for `SAFE`, não execute teste algum e mantenha a etapa pendente.
5. Escolha com [test-levels.md](test-levels.md) o nível mais baixo que ainda prova o
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

Em uma rota nova, um `404` pode ser RED quando o teste chega à aplicação
com URL, sessão, escopo e dados válidos e a rota ainda não existe. Mantenha a
asserção do contrato, por exemplo, `403` para quem não tem permissão de criar,
mesmo que a resposta observada antes da implementação seja `404`. Confirme a
causa no roteamento. Um erro de bootstrap, fixture, dependência ou schema de
base exige correção antes de repetir o teste.

No checklist (`VERIFY` e `EVIDENCE`) e na linha do AC na tabela
`Evidência RED-GREEN-REFACTOR`, registre quais asserções produziram RED, com
comando e causa. Para cada asserção marcada como `pendente de schema`, indique
a tarefa `[MIGRATION]` que a libera e o ID e passo da tarefa que a verifica.
Nesse ponto, rode o teste focal com a migration aplicada e atualize a mesma
evidência com o comando e o resultado de cada asserção pendente.

| Asserção pendente após o RED inicial | Ponto de verificação após a migration |
| --- | --- |
| Paginação com ordenação estável e limite por página | No `VERIFY` da tarefa de listagem, use fixtures suficientes para cruzar o limite da página e compare os IDs de duas páginas. |
| Estado de validade exibido na lista | No `VERIFY` da listagem, use fixtures válidas e expiradas em torno do limite e congele o relógio. Uma prova da regra temporal sem banco pode rodar antes, quando prevista para o AC. |
| Ausência de gravação após um POST proibido | Prove o contrato HTTP separadamente. No `VERIFY` da tarefa de regressão, repita o POST e confira que a tabela permanece igual. |

Um `404` pela ausência da rota prova somente a ausência daquele contrato HTTP.
Repetir esse resultado em outros testes não prova paginação, validade ou
persistência. Falha por falta da tabela fica pendente de schema. Se faltar
um RED válido exigido pelo Plan Gate, revise o desenho do teste ou as
dependências com `$specsfy-05-tasks` e mantenha o gate pendente.

No passo `prepare`, registre um RED válido e conclua o checklist da tarefa
`[TEST] [TDD]` correspondente. Informe o ID e a evidência no retorno automático
a `$specsfy-05-tasks`. O Plan Gate permanece `Pending` enquanto faltar
qualquer RED exigido. A skill de tarefas valida cada retorno e faz um novo
handoff de `tests` → `prepare` para o próximo RED até completar o plano.

### GREEN

No passo `cycle`, escreva o mínimo de código de produção que satisfaça o
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
specsfy gate trace <spec>
```

Pelo MCP, use a tool `gate_trace`. Sem o binário instalado, rode o script
equivalente:

```bash
node .agents/skills/specsfy-06-implement/scripts/check_traceability.mjs specs/<estado>/<NNNN>-<slug>/spec.md .
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
- `Delivery Gate: In Progress` é estado local. Com `ClickUp Task` e
  ClickUpfy presentes, a tarefa remota fica em `em andamento` só enquanto um
  agente executa o trabalho; sem agente atuando, ela volta para próxima etapa
  com comentário do ponto onde parou.

## Auditar QA

Depois de executar os runners do repositório, registre `Passed` ou a falha na
coluna Evidência da seção 12 e audite:

```bash
specsfy gate acceptance <spec>
```

Pelo MCP, use a tool `gate_acceptance`. Sem o binário instalado, rode o script
equivalente:

```bash
node .agents/skills/specsfy-06-implement/scripts/verify_acceptance.mjs \
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

Antes de preparar ou executar testes de cada tarefa, siga
[specialists-tests.md](specialists-tests.md) para carregar as skills
aplicáveis da spec e da tarefa nos modos registrados.
