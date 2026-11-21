---
name: specsfy-05-tasks
description: "Decompõe uma spec aprovada em tarefas pequenas, ordenadas e rastreáveis nas seções 14 e 15 da própria spec.md e conduz o Plan Gate. Use quando o usuário quiser quebrar a especificação em tarefas, preencher ou atualizar a seção 14. Tarefas, ordenar dependências, planejar fatias verticais ou preparar a execução, e quando uma transição automática pedir planejamento, replanejamento ou retomada após RED. Edita somente o plano dentro da fonte única: não cria tasks.md, não escreve código e não marca trabalho como concluído. Testes, RED e a execução ficam com specsfy-06-implement, nos modos tests e implement."
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

- `specsfy gate tasks <spec>` passa com e sem `--allow-draft` e, havendo
  interface para pessoas, `specsfy gate interface <spec>` também passa;
- todo `FR`, `NFR` e `AC` aplicável tem tarefa, e toda tarefa `[CODE]` depende
  de um predecessor TDD com RED registrado;
- `Plan Gate: Passed`, `Status: Planned` e `Gate do Ato II — Plano` estão
  registrados, e `specsfy specs transition <id> planned`, equivalente a
  `specsfy specs transition <id> planned`, foi executado;
- `$specsfy-06-implement` foi carregada no modo `implement`.

## Proteção do banco no plano

Em projeto Laravel, execute `specsfy gate database --project <raiz>` antes de
planejar ou liberar qualquer tarefa `[TEST]`. Pelo MCP, use a tool
`gate_database`. Sem o binário instalado, rode
`node .agents/skills/specsfy-setup/scripts/check_database_safety.mjs --project
<raiz>`. O plano mantém `.env.testing`, `APP_ENV=testing` e um banco de
teste explicitamente diferente do banco do `.env`, para que nenhum teste toque
dados de desenvolvimento.

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
   specsfy context monitor --project .
   ```

   Pelo MCP, use a tool `context_monitor`. Sem o binário instalado, rode o
   script equivalente:

   ```bash
   node .agents/skills/specsfy-setup/scripts/monitor_context.mjs \
     --project .
   ```

   Se a cópia estiver sem Git, `BASELINE` indica a falta de comparação.
   Reexecute com `--paths` e a lista de caminhos alterados (vírgulas no CLI,
   espaços no script). Quando souber que a lista está vazia, use
   `--paths '[]'`. Trate o baseline como diagnóstico até obter uma lista
   conhecida ou rodar em uma cópia com Git.

   Use os sinais de stack, aplicação, regras e persistência para planejar a
   documentação junto da mudança, sem inferir requisito novo.
5. Se faltar uma decisão que mude arquitetura, dados ou aceite, anuncie e
   retorne automaticamente para `$specsfy-02-backlog`. Depois da decisão, use
   `$specsfy-update-spec` quando a spec já tiver sido aprovada ou
   `$specsfy-03-specify` durante a definição inicial.

## Gerar

Use `.specsfy/templates/custom/Tasks.md` como contrato quando existir e
`.specsfy/templates/Tasks.md` caso contrário. Edite o plano nas seções
`14. Tarefas` e `15. Ordem de execução` em
`<raiz>/specs/<estado>/<NNNN>-<slug>/spec.md`. Se uma tarefa revelar um
especialista ou modo novo, atualize pontualmente a linha `Especialistas` do
cabeçalho e a subseção `#### Especialistas` da seção 8. Preserve o restante do
plano técnico e aplique as atualizações de status e gates descritas abaixo.

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
  referência o Gherkin mantido na spec. Em `Refs`, liste o `AC` principal
  antes dos demais ACs. Os mínimos da feature, de cada `US`, `FR` e `NFR`
  e dos predecessores de cada tarefa `[CODE]` contam ACs principais distintos.
- Use `[TEST] [TDD]` para predecessores e `[TEST]` para aceite e regressão
  pós-código. Em planos legados sem nenhuma tag `[TDD]`, o validador
  reconhece testes executáveis que antecedem o código correspondente e
  contabiliza os testes que dependem do código como regressão.
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
- quando houver `Contrato CRUD`, nomeie nas tarefas `[CODE]` as operações
  incluídas em `Operações` e seus controles de interface, resolvendo cada ID
  reservado no Definition Gate em uma tarefa da seção 14;
- inclua testes de comportamento para navegação, estados, envio, validação,
  recuperação de erro e padrão de abertura que a interface declarar;
- use somente os componentes, convenções e runners da stack de interface
  registrada; cada tarefa aponta os blocos React, componentes shadcn/ui e ReUI
  ou rotas reais;
- inclua uma tarefa para atualizar `INTERFACE.md` com finalidade, arquivo, API,
  estados, consumidores e regra de reaproveitamento de todos os blocos criados
  ou alterados;
- em projetos React, cada tarefa de tela inclui
  `Especialista: $specsfy-specialist-ui-components (components)` para orientar
  a busca, o reaproveitamento e a adaptação de componentes. Se a skill
  estiver ausente, siga o protocolo da seção Especialistas antes de liberar
  a tarefa `[CODE]`;
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
  `specsfy gate database`: um aplica a migration no banco de teste e outro
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
specsfy gate tasks <spec> --allow-draft
```

Pelo MCP, use a tool `gate_tasks`. Sem o binário instalado, rode o script
equivalente:

```bash
node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/<estado>/<NNNN>-<slug>/spec.md --allow-draft
```

Quando houver interface para pessoas, execute também:

```bash
specsfy gate interface <spec>
```

Pelo MCP, use a tool `gate_interface`. Sem o binário, rode o script equivalente:

```bash
node .agents/skills/specsfy-05-tasks/scripts/validate_interface_tasks.mjs specs/<estado>/<NNNN>-<slug>/spec.md
```

Quando a spec declarar `Operações` em `Contrato CRUD`, valide também a
cobertura das operações pelas tarefas escritas:

```bash
specsfy gate spec <spec>
```

Pelo MCP, use `gate_spec`. Sem o binário, rode
`validate_spec.mjs` da skill `specsfy-04-validate` com o caminho da spec.

Corrija o que o validador apontar, em no máximo três ciclos: IDs duplicados,
dependências inválidas ou cíclicas, referências inexistentes, itens sem três
cenários BDD, AC sem tarefa TDD distinta, plano sem três predecessores ou
casos TDD por feature, `US`, `FR` e `NFR`, código sem predecessor TDD,
checklist ausente ou fora de ordem, pai e itens incoerentes, progresso em
tarefa bloqueada ou tarefas vagas. No contrato de evidência, o mesmo validador
também rejeita arquivo ausente, referência inválida, comando sem `exit: 0` ou
tarefa concluída sem evidence.

### Fechar o Plan Gate

Quando a estrutura passar com `Status: Defined` e `Plan Gate: Pending`,
siga a ordem de dependências da seção 14. Selecione a primeira tarefa
`[TEST] [TDD]` aberta exigida pelo Plan Gate cujas dependências já estejam
concluídas. Use a ordem da seção 14 para desempatar entre tarefas prontas.

Com o ID da tarefa, chame automaticamente `$specsfy-06-implement` no modo
`tests`, passo `prepare`. A skill registra um RED e devolve o controle após
concluir essa tarefa.
A cada retorno, execute o validador com `--allow-draft`, confira a evidência e
envie a próxima tarefa pronta. Mantenha `Plan Gate: Pending` até registrar o
último RED exigido. Se ainda houver REDs pendentes e nenhum predecessor
pronto, revise as dependências antes de retomar.

Com todos os REDs exigidos registrados, siga em ordem:

1. altere `Plan Gate` para `Passed`;
2. execute `specsfy gate tasks <spec>` sem `--allow-draft`;
3. registre o resultado em `Gate do Ato II — Plano`;
4. execute `specsfy specs transition <id> planned` para definir
   `Status: Planned` e mover a pasta da spec.

Se a validação final falhar, mantenha `Status: Defined`, registre
`Plan Gate: Failed` e `Delivery Gate: Pending` e relate as pendências.

Quando a conversa alterar abrangência, dependência ou capacidade necessária,
chame `$specsfy-interviewer` antes de replanejar e atualize o Effort com
justificativa.

## Relatar

Informe a contagem total e por tipo, o caminho crítico, as oportunidades
`[P]` e a cobertura de IDs. Quando o gate passar, anuncie e carregue
automaticamente `$specsfy-06-implement` no modo `implement`. O plano vive
somente na spec, sem `tasks.md`.

## Ver o progresso

O progresso de todas as specs é uma projeção de `specs/<estado>/*/spec.md`,
calculada sem escrever nada. Rode:

```bash
specsfy progress --project <raiz>
specsfy progress --project <raiz> --spec <spec> --json
```

Pelo MCP, use a tool `project_status`. Sem o binário instalado, rode o script
equivalente:

```bash
node .agents/skills/specsfy-05-tasks/scripts/progress.mjs <raiz> --json
```

- O relatório traz os denominadores de specs, gates, tarefas e itens de
  checklist, o ato atual, a próxima skill responsável e o próximo par
  `TNNN/ITEM` pronto.
- Conte somente `spec.md` dentro de `specs/<estado>/`. Capturas em
  `specs/inbox/`, itens em `specs/backlog/` e arquivos de `research/` não
  entram no progresso normativo. Sem nenhuma spec, o código de saída é 2.
- Um gate `In Progress` isolado não é falha. Gate `Failed`, checklist
  incoerente e dependência sem caminho pronto impedem o avanço.
- Pendência `PENDING` apontada pelo `specsfy context monitor` também impede o
  avanço, mesmo com todos os checkboxes marcados: siga a skill indicada pelo
  monitor e volte ao progresso depois que o documento for atualizado ou que a
  avaliação sem impacto estiver registrada.
- `docs/` ausente ou desatualizado também impede a entrega: carregue
  `$specsfy-documentator` e volte ao progresso depois que `docs/` for
  reconstruída.
- Encaminhe pelo estado observado, anunciando e carregando a skill na mesma
  conversa, sem pedir confirmação: se uma spec existente precisar mudar de
  comportamento ou de plano, carregue `$specsfy-update-spec`; sem nenhuma spec
  e com captura a avançar, carregue `$specsfy-02-backlog`; com intenção e
  definição suficientes, carregue `$specsfy-03-specify`; nos demais casos,
  siga a próxima skill responsável que o relatório do progresso indica.
- Não edite specs, checkboxes, testes ou código durante a consulta e não
  deduza progresso de commits, arquivos soltos ou memória da conversa. Para
  mudar estado, carregue a skill responsável.

## Especialistas

Ao decompor a entrega, consulte a seção 8 da spec e
[a tabela de sinais](references/specialists.md). Carregue os especialistas
aplicáveis ao planejamento. Em tarefas de UI, dados, API, deploy ou qualquer
outro sinal aplicável, registre um item sem checkbox
`Especialista: $specsfy-specialist-<nome> (<modo>)` por especialista e modo.
