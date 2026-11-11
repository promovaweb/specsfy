---
name: specsfy-05-tasks
description: "Decompõe uma spec aprovada em tarefas pequenas, ordenadas e rastreáveis nas seções 14 e 15 da própria spec.md e conduz o Plan Gate. Use quando o usuário quiser quebrar a especificação em tarefas, preencher ou atualizar a seção 14. Tarefas, ordenar dependências, planejar fatias verticais ou preparar a execução, e quando uma transição automática pedir planejamento, replanejamento ou retomada após RED. Edita somente o plano dentro da fonte única: não cria tasks.md, não escreve código e não marca trabalho como concluído. Testes e RED ficam com specsfy-06-tdd-bdd e a execução com specsfy-07-implement."
---

# Quebrar a especificação em tarefas

Preencha as seções `14. Tarefas` e `15. Ordem de execução` de
`specs/<estado>/<NNNN>-<slug>/spec.md`. Cada tarefa precisa ser pequena,
verificável, ordenada e ligada a IDs definidos na spec, porque é esse vínculo
que permite provar a entrega depois. O arquivo continua sendo a única fonte da
verdade.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`. A pergunta típica
desta skill é qual runner de testes adotar em projeto Node sem PHP.

## Pronto quando

- `validate_tasks.mjs` passa com e sem `--allow-draft` e, havendo interface
  para pessoas, `validate_interface_tasks.mjs` também passa;
- todo `FR`, `NFR` e `AC` aplicável tem tarefa, e toda tarefa `[CODE]` depende
  de um predecessor TDD com RED registrado;
- `Plan Gate: Passed`, `Status: Planned` e `Gate do Ato II — Plano` estão
  registrados, e `specsfy transition <id> planned` foi executado;
- `$specsfy-07-implement` foi carregada.

## Proteção do banco no plano

Em projeto Laravel, execute
`.agents/skills/specsfy-setup/scripts/check_database_safety.mjs --project
<raiz>` antes de planejar ou liberar qualquer tarefa `[TEST]`. O plano mantém
`.env.testing`, `APP_ENV=testing` e um banco de teste explicitamente diferente
do banco do `.env`, para que nenhum teste toque dados de desenvolvimento.

- Com `PENDING`, nenhuma tarefa de teste fica pronta e a skill não chama o
  runner.
- Com `IGNORED`, descarte o comando que apagaria estruturas ou registros.
- Não inclua em tarefa, teste, preparação, regressão ou Definition of Done os
  comandos destrutivos listados em `Proteção do banco de desenvolvimento` de
  `.specsfy/Spec.md`: `migrate:fresh`, `migrate:refresh`, `migrate:reset`,
  `migrate:rollback`, `db:wipe`, `schema:drop`, `prisma migrate reset`,
  `DROP DATABASE`, `DROP SCHEMA`, `DROP TABLE`, `TRUNCATE`, `RefreshDatabase`,
  `DatabaseMigrations` ou equivalentes.

## Orquestrar a conversa

Ao concluir esta etapa ou detectar trabalho de outra etapa, anuncie
`Pendência detectada: <descrição> — ação: resolvendo nesta etapa` e resolva-a
quando pertencer ao próprio escopo. Quando houver troca de responsabilidade,
anuncie `Transição automática: $specsfy-05-tasks → $<destino> — motivo:
<motivo> — resultado esperado: <resultado>` e carregue imediatamente a skill de
destino, sem pedir confirmação nem repetir o comando. Continue na mesma
conversa. Depois de uma correção necessária a esta etapa, anuncie `Retomada
automática: $<destino> → $specsfy-05-tasks — pendência resolvida:
<resultado>` e retome-a imediatamente. Reavalie o estado após cada handoff para
evitar ciclos. Não peça confirmação para o handoff; ações sensíveis continuam
exigindo autorização específica.

## Pré-condições

Leia em paralelo a spec, o template de tarefas resolvido e os manifests e
configurações do repositório. Depois siga a ordem:

1. Leia a spec indicada em `specs/defined/<NNNN>-<slug>/spec.md` e exija
   `Formato: Specsfy/2.0`, `Definition Gate: Passed` e `Status` `Defined`,
   `Planned` ou `Implementing`. Aceite os dois últimos somente para
   replanejamento automático de uma pendência detectada em etapa posterior.
2. Execute a validação da especificação quando o gate ainda não estiver
   comprovado.
3. Use a stack, os comandos e os caminhos reais do repositório. Em PHP, use
   Pest para TDD; em Node sem PHP, pergunte qual runner adotar e recomende
   Vitest antes de gerar caminhos ou comandos.
4. Execute o monitor antes de planejar:

   ```bash
   node .agents/skills/specsfy-setup/scripts/monitor_context.mjs \
     --project .
   ```

   Use os sinais de stack, aplicação, regras e persistência para planejar a
   documentação junto da mudança, sem inferir requisito novo.
5. Se faltar uma decisão que mude arquitetura, dados ou aceite, anuncie e
   retorne automaticamente para `$specsfy-02-backlog`. Depois da decisão, use
   `$specsfy-update-spec` quando a spec já tiver sido aprovada ou
   `$specsfy-03-specify` durante a definição inicial.

## Gerar

Use `.specsfy/templates/custom/Tasks.md` como contrato quando existir e
`.specsfy/templates/Tasks.md` caso contrário. Substitua somente o conteúdo das
seções `14. Tarefas` e `15. Ordem de execução` em
`<raiz>/specs/<estado>/<NNNN>-<slug>/spec.md` e preserve todas as outras.

### Reabrir o plano antes de editar

- Se a spec estiver `Planned` ou `Implementing`, anuncie a pendência, reabra o
  Ato II e defina `Status: Defined`, `Plan Gate: Pending` e
  `Delivery Gate: Pending` antes de editar. Gate e evidência posteriores perdem
  a validade sobre um plano alterado.
- Em uma spec já `Defined`, defina `Plan Gate: Pending` e
  `Delivery Gate: Pending` antes de editar.
- Preserve IDs existentes ao atualizar e não renumere tarefas concluídas.

### Estrutura do plano

- Organize em setup mínimo, fundação indispensável, histórias em prioridade e
  fechamento.
- Mantenha histórias como fatias verticais demonstráveis de forma
  independente.
- Dê a cada tarefa um resultado único, caminho exato e critério verificável.
- Declare dependências por ID, sem depender apenas da ordem visual.
- Marque `[P]` somente quando as tarefas não compartilham arquivos, estado
  mutável ou dependência.
- Cubra todo `FR`, `NFR` e `AC` aplicável. Toda tarefa tem referência, exceto
  setup ou acabamento claramente justificado.
- Não inclua exemplos genéricos nem placeholders.

### Testes e código

- Para cada `AC`, crie uma tarefa `[TEST] [TDD]` distinta cujo desenho usa como
  referência o Gherkin mantido na spec. O conjunto dessas tarefas materializa
  pelo menos três casos TDD distintos para a feature inteira e para cada `US`,
  `FR` e `NFR`.
- O Gherkin da spec é contrato de referência: não crie tarefa para arquivo
  `.feature` ou step definition e não o execute.
- Em PHP, a tarefa TDD aponta para teste Pest e exige marcador `SPECSFY`; em
  Node, usa o runner confirmado pelo usuário e o script `test:tdd`.
- Faça cada tarefa `[CODE]` depender do predecessor TDD da mesma fatia com RED.
- Faça toda tarefa `[CODE]` exigir a reconstrução independente de `docs/` por
  `$specsfy-documentator` antes de `EXECUTE`, inclusive quando a documentação
  já existia.

### Interface para pessoas

Quando `Interface para pessoas` for `Sim`:

- crie tarefas explícitas para as telas, menus e navegação principal,
  formulário e ações descritos na seção 10, além da camada de dados ou API;
- inclua testes de comportamento da interface para navegação, envio,
  validação, recuperação de erro e o padrão de abertura escolhido, como painel
  lateral ou modal;
- use somente os componentes, convenções e runners da stack de interface
  registrada; cada tarefa aponta os blocos React, componentes shadcn/ui e ReUI
  ou rotas reais;
- inclua uma tarefa para atualizar `INTERFACE.md` com finalidade, arquivo, API,
  estados, consumidores e regra de reaproveitamento de todos os blocos criados
  ou alterados;
- em projetos React, cada tarefa de tela registra no `PREP` o uso de
  `$specsfy-specialist-react-ui-components` antes da implementação, porque essa
  skill orienta a busca, o reaproveitamento e a adaptação dos componentes reais
  do projeto. Se ela não estiver instalada, retorne ao `$specsfy-setup` para
  instalar o especialista detectado antes de liberar a tarefa `[CODE]`;
- agrupe essas tarefas na subseção obrigatória `#### Fase de interface` da
  seção 14. Cada tela registrada recebe ao menos uma tarefa própria, em vez de
  ficar escondida dentro de uma tarefa genérica de backend.

### Migrations

- Sempre que uma tarefa criar ou alterar schema, tabela, coluna, índice,
  relação ou model persistente, crie uma tarefa `[CODE] [MIGRATION]` separada.
  Ela aponta para o arquivo versionado no diretório de migrations do projeto,
  depende dos testes TDD e precede o código que usa a nova estrutura.
- Use a tag `[MIGRATION]` somente junto de `[CODE]` ou `[OPS]`, com caminho em
  `database/migrations/`, `migrations/`, `prisma/migrations/` ou
  `supabase/migrations/`, conforme a stack encontrada.
- Leitura, consulta ou uso de tabela existente não exige `[MIGRATION]` por si
  só. A tag é obrigatória quando o plano cria ou altera a estrutura.
- O item `VERIFY` da tarefa `[MIGRATION]` registra dois comandos aprovados pelo
  `check_database_safety.mjs`: um aplica a migration no banco de teste e outro
  consulta o estado das migrations. Não aprove o Plan Gate sem essa tarefa.

### Contexto persistente

| A fatia altera | Tarefa exigida |
| --- | --- |
| manifests ou configuração estrutural | `[DOC]` para `.specsfy/STACK.md` |
| banco, schema, model persistente, tabela, campo, relação ou migration | `[DOC]` obrigatória para `.specsfy/DATABASE.md` |
| convenção que virou regra confirmada | `[DOC]` para `.specsfy/RULES.md` |
| aplicação | revisão de `PROJECT.md` no fechamento da tarefa; sem impacto material, justificativa na evidência em vez de conteúdo artificial |

### Checklist de cada tarefa

- Anexe a cada tarefa, exatamente nesta ordem, os itens `PREP`, `EXECUTE`,
  `VERIFY`, `VISUAL`, `EVIDENCE` e `IMPROVE` definidos no template `Tasks.md`
  resolvido.
- Escreva os itens como resultados específicos da tarefa, não como frases
  genéricas copiadas.
- O item `VISUAL` vale mesmo sem pedido da pessoa: ele confere bordas,
  espaçamentos, margens, padding e tipografia do sistema durante o
  desenvolvimento. Sem interface, registre `Não aplicável` e o motivo concreto.
- O item `IMPROVE` registra uma melhoria concreta aplicada ou declara que
  nenhuma foi necessária, com justificativa.
- Mantenha pai e itens abertos ao gerar tarefas; a skill de implementação marca
  cada item logo após sua evidência.
- Quando a spec declarar `Evidence Contract: 1`, cada tarefa `[CODE]` concluída
  contém um comentário `specsfy:evidence` JSON com `task`, `refs`, `files` e
  `commands` (`run` e `exit`), gravado dentro do bloco da tarefa e não em
  arquivo paralelo.

### Formato canônico

```markdown
- [ ] T001 [TEST] [TDD] [US-001] Derivar teste Pest do BDD da spec em tests/Feature/AuthTest.php — Refs: FR-002, AC-003 — Depends: none
- [ ] T002 [CODE] [US-001] Implementar validação em app/Services/AuthService.php — Refs: FR-002, AC-003 — Depends: T001
```

Tags permitidas após o ID: `[P]`, `[TEST]`, `[TDD]`, `[CODE]`, `[DOC]`,
`[OPS]`, `[MIGRATION]` (somente com `[CODE]` ou `[OPS]`) e `[US-NNN]`.

## Validar

Execute:

```bash
node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/<estado>/<NNNN>-<slug>/spec.md --allow-draft
```

Quando houver interface para pessoas, execute também:

```bash
node .agents/skills/specsfy-05-tasks/scripts/validate_interface_tasks.mjs specs/<estado>/<NNNN>-<slug>/spec.md
```

Corrija o que o validador apontar, em no máximo três ciclos: IDs duplicados,
dependências inválidas ou cíclicas, referências inexistentes, itens sem três
cenários BDD, AC sem tarefa TDD distinta, plano sem três predecessores ou
casos TDD por feature, `US`, `FR` e `NFR`, código sem predecessor TDD,
checklist ausente ou fora de ordem, pai e itens incoerentes, progresso em
tarefa bloqueada ou tarefas vagas. No contrato de evidência, o mesmo validador
também rejeita arquivo ausente, referência inválida, comando sem `exit: 0` ou
tarefa concluída sem evidence.

### Fechar o Plan Gate

Quando a estrutura passar ainda com `Plan Gate: Pending`, chame
automaticamente `$specsfy-06-tdd-bdd` no modo `prepare`. Ele usa o BDD da spec
para materializar o predecessor TDD, observa RED e conclui somente essa tarefa
de teste. Ao retomar esta skill, siga em ordem:

1. execute novamente o validador com `--allow-draft`;
2. altere `Plan Gate` para `Passed` e defina `Status: Planned`;
3. registre o resultado em `Gate do Ato II — Plano`;
4. execute o validador sem `--allow-draft`;
5. execute `specsfy transition <id> planned`.

O modo estrito rejeita `Plan Gate: Passed` enquanto algum predecessor TDD de
uma tarefa `[CODE]` continuar aberto. Se a validação falhar, mantenha
`Status: Defined`, `Plan Gate: Failed`, `Delivery Gate: Pending` e relate as
pendências.

Quando a conversa alterar abrangência, dependência ou capacidade necessária,
chame `$specsfy-interviewer` antes de replanejar e atualize o Effort com
justificativa.

## Relatar

Informe a contagem total e por tipo, o caminho crítico, as oportunidades
`[P]` e a cobertura de IDs. Quando o gate passar, anuncie e carregue
automaticamente `$specsfy-07-implement`. O plano vive somente na spec, sem
`tasks.md`.

## Especialistas sob demanda

Leia [references/specialists.md](references/specialists.md) ao decompor
trabalho de tecnologia, dados, interface ou operação que demande checklist
próprio.
