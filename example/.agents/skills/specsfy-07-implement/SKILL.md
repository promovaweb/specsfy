---
name: specsfy-07-implement
description: "Use quando o usuário pede para implementar, executar ou concluir tarefas da seção `14. Tarefas` de `specs/{id}-{slug}/spec.md`, criar o código definido pela fonte única, continuar a próxima tarefa pronta ou finalizar a feature. Use também quando uma transição automática iniciar ou retomar a entrega. Use para produção; para apenas criar testes use specsfy-06-tdd-bdd, e para apenas decompor use specsfy-05-tasks."
---

# Implementar as tarefas e criar o código

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

Execute a seção `14. Tarefas` de `spec.md` em ordem de dependência, mantendo a fonte única, testes, código, evidências e checkboxes coerentes.

Para Laravel, consulte `.specsfy/PACKAGES.md`, `docs/packages/README.md` e as
fichas existentes antes de adicionar ou substituir uma dependência. Se a
tarefa trouxer uma URL GitHub ou mudar Composer, carregue
`$specsfy-specialist-laravel-package-manager` e reutilize pacotes já instalados
quando eles atenderem ao requisito.

## Proteção obrigatória do banco

Antes de executar qualquer teste, suíte, regressão ou migration, rode:

```bash
node .agents/skills/specsfy-setup/scripts/check_database_safety.mjs \
  --project <raiz> --command "<comando-pretendido>"
```

Em Laravel, exija `.env.testing`, `APP_ENV=testing` e um banco explicitamente
diferente do banco de desenvolvimento definido no `.env`. Enquanto o estado
for `PENDING`, não execute teste algum. Corrija o ambiente, repita a
conferência e continue somente após `SAFE`.

Ignore todo comando classificado como `IGNORED`. Não execute, não transforme em
tarefa e não peça autorização para rodar `migrate:fresh`, `migrate:refresh`,
`migrate:reset`, `migrate:rollback`, `db:wipe`, `schema:drop`,
`prisma migrate reset`, `DROP DATABASE`, `DROP SCHEMA`, `DROP TABLE`,
`TRUNCATE` ou equivalentes. A mesma recusa vale para scripts indiretos e para
testes com `RefreshDatabase` ou `DatabaseMigrations`. Use isolamento
transacional e fixtures mínimas sem apagar o banco.

## Revisão visual obrigatória

Toda tarefa de desenvolvimento executa uma revisão visual, mesmo sem pedido da
pessoa. O item `VISUAL` vem depois de `VERIFY` e precisa estar concluído antes
de `EVIDENCE`.

Para qualquer alteração com interface, leia `DESIGNSYSTEM.MD`, `INTERFACE.md` e
os componentes afetados. Inspecione a renderização ou o DOM nos viewports e
estados relevantes. Confira bordas, espaçamentos, margens, padding e tipografia
do sistema, além de alinhamento, largura, overflow, foco, zoom e quebra de
texto. Registre método, viewport, estados, ajustes e resultado na tarefa.

Quando a tarefa não alterar interface, conclua `VISUAL` com `Não aplicável` e
um motivo concreto. Nunca pule esse item porque a pessoa não pediu revisão
visual.

## Orquestrar a conversa

Ao concluir esta etapa ou detectar trabalho de outra etapa, anuncie
`Pendência detectada: <descrição> — ação: resolvendo nesta etapa` e resolva-a
quando pertencer ao próprio escopo. Quando houver troca de responsabilidade,
anuncie `Transição automática: $specsfy-07-implement → $<destino> — motivo:
<motivo> — resultado esperado: <resultado>` e carregue imediatamente a skill de
destino, sem pedir confirmação nem repetir o comando. Continue na mesma
conversa. Depois de uma correção necessária a esta etapa, anuncie `Retomada
automática: $<destino> → $specsfy-07-implement — pendência resolvida:
<resultado>` e retome-a imediatamente. Reavalie o estado após cada handoff para
evitar ciclos. Não peça confirmação para o handoff; ações sensíveis continuam
exigindo autorização específica.

## Gate inicial

1. Resolva a raiz pelo caminho confirmado no `$specsfy-setup`. Se a pessoa
   informar um subdiretório, trate-o como projeto e não o promova para a raiz
   Git. Leia `<raiz>/specs/planned/<NNNN>-<slug>/spec.md`, evidências indexadas
   em `research/`, instruções do repositório e código relevante. Não procure
   `tasks.md`, `plan.md`, `research.md` ou `data-model.md`.
2. Exija `Formato: Specsfy/2.0`, `Status: Planned` ou `Implementing`,
   `Definition Gate: Passed` e `Plan Gate: Passed`.
3. Se `Interface para pessoas` for `Sim`, leia a seção 10 e confirme que o
   plano contém tarefas para stack local, telas, menus e navegação principal,
   formulários, ações, blocos React, componentes shadcn/ui/ReUI, estados e
   testes de interação. Compare a stack, as telas e os fluxos atuais com o
   projeto antes de alterar código. Preserve componentes, rotas, conteúdo,
   permissões e comportamentos existentes fora do alcance registrado. Se faltar
   algum deles ou a tecnologia proposta divergir sem confirmação, retorne automaticamente para
   `$specsfy-05-tasks`; não implemente um CRUD somente como API ou persistência.
   Antes de programar, confirme os itens escolhidos na tabela da seção 10 e em
   `INTERFACE.md`; depois de programar, atualize `INTERFACE.md` com todos os
   blocos criados, alterados ou reaproveitados.
   Em projeto React, carregue obrigatoriamente
   `$specsfy-specialist-react-ui-components` antes de escrever JSX ou TSX.
   Se a skill não estiver instalada, retorne ao `$specsfy-setup` para instalar
   o especialista detectado e não implemente a tela até concluir esse preparo.
   Para um CRUD, confirme também um único `PageHeader` reutilizável em todas as
   telas, `DataGrid` em largura total, coluna `ID` sempre visível, link da linha
   para o detalhe e botões de editar e apagar independentes na linha.
4. Execute os validadores contra `specs/<estado>/<NNNN>-<slug>/spec.md`. Se um gate
   falhar por tarefa, predecessor TDD ou RED ausente em um plano antes aprovado,
   anuncie a pendência e retorne automaticamente para
   `$specsfy-05-tasks`; não altere produção. Essa skill reabre o Ato II, chama
   TDD/BDD e retoma esta implementação depois de validar novamente o plano. Para
   outra falha, carregue automaticamente a skill responsável pelo gate.
5. Confira o comando da suíte base com `check_database_safety.mjs`. Execute-a
   somente após `SAFE`; sem ambiente de teste separado, não rode nenhum teste.
   Registre falhas preexistentes e não as atribua à nova mudança.
6. Antes da primeira alteração de produção, defina `Status: Implementing`,
   `Delivery Gate: In Progress` e execute `specsfy transition <id> in-progress`.
7. Selecione trabalho pronto com:

```bash
node .agents/skills/specsfy-07-implement/scripts/next_task.mjs \
  <raiz>/specs/<estado>/<NNNN>-<slug>/spec.md
```

Se não houver tarefa pronta, diferencie `concluído` de `bloqueado por dependência`.

## Executar uma tarefa

1. Confirme ID, tipo, referências, dependências, arquivos e resultado verificável; marque `PREP` imediatamente após essa confirmação.
2. Para `[TEST]`, siga `$specsfy-06-tdd-bdd`: leia o Gherkin de referência na
   spec e use-o para desenhar o teste TDD; adicione marcadores e observe RED
   válido. Nunca crie ou execute `.feature`. Em PHP, use Pest; em Node, use
   somente o runner confirmado pelo usuário.
3. Para `[CODE]`, confirme o predecessor TDD concluído cobrindo os mesmos IDs,
   com RED registrado na seção 11. Sem isso, pare e não altere produção.
   Anuncie a pendência e retorne automaticamente para
   `$specsfy-05-tasks`, que reabre o plano, chama `$specsfy-06-tdd-bdd` e
   retoma esta skill depois do novo `Plan Gate: Passed`.
4. Escreva a menor mudança de produção que torna o teste TDD verde.
   Para uma tarefa de interface, implemente a tela, os menus, o formulário e a interação
   definidos na spec com os estados descritos; não substitua o fluxo por uma
   rota de API, um componente vazio ou um atalho sem a tela acordada.
   Em React, siga `$specsfy-specialist-react-ui-components` para localizar,
   reaproveitar, adaptar e registrar os componentes antes de criar uma nova
   composição.
   Quando a tarefa usa `[MIGRATION]`, crie primeiro o arquivo versionado no
   caminho planejado. Passe o comando pelo `check_database_safety.mjs`, aplique
   a migration no banco de teste e consulte o estado logo depois. Registre os
   dois comandos com saída zero no comentário `specsfy:evidence` da tarefa.
5. Depois de alterar produção e antes de marcar `EXECUTE`, monitore o contexto:

```bash
node .agents/skills/specsfy-setup/scripts/monitor_context.mjs \
  --project <raiz> --check
```

   Para stack pendente, faça handoff a `$specsfy-aux-stack`; para persistência,
   a `$specsfy-aux-database`; para regra confirmada, a
   `$specsfy-aux-rules`. Revise `PROJECT.md` em toda mudança de aplicação. Se
   não houver impacto material na história, finalidade, capacidades ou limites,
   registre a avaliação na evidência da tarefa e repita com
   `--acknowledge-project-no-change`. Não marque a tarefa enquanto o monitor
   retornar `PENDING`.
6. Depois de cada tarefa `[CODE]`, anuncie
   `Transição automática: $specsfy-07-implement → $specsfy-documentator —
   motivo: implementação alterou o sistema — resultado esperado: docs/
   reconstruído e atual` e carregue `$specsfy-documentator`. Reconstrua a
   documentação a partir de todo o código existente, execute seu `--check` e
   retome esta skill somente quando a documentação estiver atual.
7. Para `[DOC]` ou `[OPS]`, produza a evidência específica pedida.
8. Marque `EXECUTE` somente quando a entrega e a documentação exigida existirem
   nos caminhos declarados.
9. Confira novamente cada comando de teste com `check_database_safety.mjs`.
   Execute o teste TDD focal, a suite relacionada e checks estáticos somente
   após `SAFE`;
   marque `VERIFY` somente com o resultado esperado.
10. Refatore somente com tudo verde.
11. Registre comando, resultado e IDs nas seções 11–13 e então marque `EVIDENCE`.
   Quando houver `Evidence Contract: 1`, grave também o comentário JSON
   `specsfy:evidence` no bloco da tarefa e execute:

```bash
node .agents/skills/specsfy-07-implement/scripts/verify_evidence.mjs \
  specs/<estado>/<NNNN>-<slug>/spec.md . --task TNNN
```

Quando uma execução completa produzir atestação schema 2, verifique novamente
com `--attestation PATH`. Exija commit compatível, binding da mesma spec/tarefa,
refs e comandos idênticos, checks realmente aprovados e SHA-256 atual de cada
arquivo. Atestação de `--self-test` não prova entrega.
12. Faça uma micro-retrospectiva: aplique uma melhoria segura encontrada ou registre “nenhuma melhoria necessária” com justificativa; então marque `IMPROVE`.
13. Na seção 14 de `specs/<estado>/<NNNN>-<slug>/spec.md`, altere o pai de `- [ ]` para `- [x]` somente quando os seis itens estiverem concluídos, incluindo `VISUAL`.
14. Execute `validate_tasks.mjs`, recalcule a próxima tarefa e confira o próximo item retornado por `next_task.mjs`.

Uma tarefa `[MIGRATION]` não pode ser concluída apenas porque o model, a query
ou o teste existe. `verify_evidence.mjs` exige o arquivo da migration, o comando
que a aplicou e a consulta que confirma seu estado. Se faltar qualquer um,
mantenha `EXECUTE`, `VERIFY` e a tarefa abertos.

Atualize os itens conforme o trabalho acontece; não os marque em lote no encerramento. Tarefas `[P]` podem ser agrupadas apenas quando não tocam os mesmos arquivos ou estado. Se a execução revelar dependência oculta, torne-a explícita na seção 14.

## Controlar mudança de escopo

Pare quando a implementação exigir comportamento não descrito, contradizer um
`AC` ou mudar interface pública, dados, segurança ou fora de escopo. Anuncie a
pendência e carregue automaticamente `$specsfy-update-spec`. Essa skill
preserva o pedido, decide se precisa refinar a pessoa, atualiza a fonte
normativa, reabre somente os gates afetados e percorre validação, tarefas e
TDD/BDD. Retome esta skill somente com os gates novamente aprovados. Atualize na
ordem:

```text
specs/<estado>/<NNNN>-<slug>/spec.md (seções 1–13) → tarefas (seção 14) → testes → código → evidências na mesma spec
```

Correções internas reversíveis podem ser decididas no código e registradas no relato sem reabrir a especificação.

## Gate de conclusão

Quando todas as tarefas da seção 14 estiverem marcadas:

1. execute a suite completa disponível, lint, tipos e build;
2. execute a rastreabilidade de testes;
3. compare cada `AC`, `FR`, `NFR` e item da Definition of Done com evidência atual;
4. procure tarefas abertas, placeholders, testes pulados e falhas conhecidas;
5. execute novamente `monitor_context.mjs --project <raiz> --check` e resolva toda
   documentação pendente;
6. carregue `$specsfy-documentator`, reconstrua `docs/` e exija que o
   `build_documentation.mjs --project <raiz> --check` passe;
7. não declare conclusão se alguma evidência estiver ausente;
8. para toda tarefa `[MIGRATION]`, execute `verify_evidence.mjs` e confirme o
   arquivo, a aplicação e a consulta de estado;
9. altere `Delivery Gate` para `Passed` somente com rastreabilidade completa,
   defina `Status: Reviewing` e execute `specsfy transition <id> review`.
   `$specsfy-04-validate` conclui o aceite e move a spec para `completed`.

Depois do gate final, projete o resumo de entrega sem criar arquivo:

```bash
node .agents/skills/specsfy-07-implement/scripts/render_delivery.mjs \
  specs/<estado>/<NNNN>-<slug>/spec.md --format markdown
```

Use `--preview` enquanto a entrega estiver aberta. Publicar o texto em PR,
commit ou ferramenta externa exige pedido explícito; o script escreve somente
em stdout.

Leia `references/completion-gates.md` para o fechamento.

## Relatar

Informe tarefas concluídas, arquivos alterados, comandos e resultados, cobertura
de IDs, falhas preexistentes, próxima tarefa pronta ou o gate final. Ao final,
anuncie e carregue automaticamente `$specsfy-progress` para conferir a
visão global derivada da fonte. Em falha, anuncie a pendência, carregue
automaticamente a skill responsável quando necessário e deixe a tarefa aberta
até a correção e retomada.

## Especialistas sob demanda

Leia [references/specialists.md](references/specialists.md) antes de executar
uma tarefa cuja tecnologia ou risco não esteja coberto pelo contexto local.
Instale somente com autorização no projeto consumidor.
