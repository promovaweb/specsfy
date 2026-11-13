---
name: specsfy-07-implement
description: "Executa as tarefas da seção `14. Tarefas` de `spec.md` da feature em ordem de dependência, escreve o código de produção a partir de testes TDD em RED, registra a comprovação na própria spec e fecha o Delivery Gate. Use quando o usuário pedir para implementar, executar, continuar a próxima tarefa pronta ou concluir uma feature já planejada, ou quando uma transição automática iniciar ou retomar a entrega. Não use para apenas criar testes (use specsfy-06-tdd-bdd), apenas decompor tarefas (use specsfy-05-tasks) ou mudar o comportamento acordado (use specsfy-update-spec)."
---

# Implementar as tarefas e criar o código

Esta skill transforma um plano aprovado em código funcionando. Cada tarefa da
seção 14 passa por `RED → GREEN → REFACTOR`, e spec, testes, código,
comprovação e checkboxes continuam coerentes entre si durante todo o trabalho.
A spec é a fonte única: tudo o que for decidido ou comprovado volta para ela.

## Pronto quando

- Toda tarefa da seção 14 está com o pai marcado `- [x]` e os seis itens
  `PREP`, `EXECUTE`, `VERIFY`, `VISUAL`, `EVIDENCE` e `IMPROVE` concluídos.
- Suíte completa, lint, tipos e build disponíveis passaram depois de `SAFE`.
- A rastreabilidade não tem lacunas e cada `AC`, `FR`, `NFR` e item da
  Definition of Done aponta para comprovação atual.
- `specsfy context monitor --check` e `specsfy docs build --check` passam.
- `Delivery Gate: Passed`, `Status: Reviewing` e a spec está em `review/`.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`. Pergunte somente o
que a spec e o projeto não respondem, como o runner de testes em projeto Node.

## Orquestrar a conversa

Siga a seção `Orquestração conversacional` de `.specsfy/Spec.md`. Resumo:

- Pendência dentro do escopo: anuncie
  `Pendência detectada: <descrição> — ação: resolvendo nesta etapa` e resolva.
- Troca de responsabilidade: anuncie `Transição automática:
  $specsfy-07-implement → $<destino> — motivo: <motivo> — resultado esperado:
  <resultado>` e carregue imediatamente a skill de destino, sem pedir
  confirmação nem repetir o comando. Continue na mesma conversa.
- Correção concluída: anuncie `Retomada automática: $<destino> →
  $specsfy-07-implement — pendência resolvida: <resultado>` e retome.

Reavalie o estado depois de cada handoff para não entrar em ciclo. O handoff
dispensa confirmação; ações sensíveis continuam exigindo autorização
específica.

## Proteção obrigatória do banco

Testes nunca rodam contra o banco de desenvolvimento. Rode esta conferência
antes de executar qualquer teste, suíte, regressão ou migration:

```bash
specsfy gate database --project <raiz> --command "<comando-pretendido>"
```

Pelo MCP, use a tool `gate_database`. Sem o binário instalado, rode o script
equivalente:

```bash
node .agents/skills/specsfy-setup/scripts/check_database_safety.mjs \
  --project <raiz> --command "<comando-pretendido>"
```

| Resultado | Ação |
| --- | --- |
| `SAFE` | execute o comando |
| `PENDING` | não execute teste algum; corrija o ambiente e confira de novo |
| `IGNORED` | ignore o comando: não execute, não vire tarefa, não peça autorização |

Em Laravel, exija `.env.testing`, `APP_ENV=testing` e um banco explicitamente
diferente do banco de desenvolvimento definido no `.env`.

Comandos que apagam, recriam ou zeram banco e schema são sempre ignorados,
mesmo com autorização: `migrate:fresh`, `migrate:refresh`, `migrate:reset`,
`migrate:rollback`, `db:wipe`, `schema:drop`, `prisma migrate reset`,
`DROP DATABASE`, `DROP SCHEMA`, `DROP TABLE`, `TRUNCATE` e equivalentes,
inclusive por scripts indiretos e testes com `RefreshDatabase` ou
`DatabaseMigrations`. Use isolamento transacional e fixtures mínimas.

## Revisão visual obrigatória

Toda tarefa de desenvolvimento passa pela revisão visual, mesmo sem pedido da
pessoa, porque falhas de layout raramente aparecem em testes. O item `VISUAL`
vem depois de `VERIFY` e precisa estar concluído antes de `EVIDENCE`.

- Com interface: leia `DESIGNSYSTEM.MD`, `INTERFACE.md` e os componentes
  afetados. Inspecione a renderização ou o DOM nos viewports e estados
  relevantes. Confira bordas, espaçamentos, margens, padding e tipografia do
  sistema, além de alinhamento, largura, overflow, foco, zoom e quebra de
  texto. Registre método, viewport, estados, ajustes e resultado na tarefa.
- Sem interface: conclua `VISUAL` com `Não aplicável` e um motivo concreto.

## Gate inicial

Faça em paralelo as leituras independentes do passo 1; os passos seguintes
são sequenciais.

1. Use a raiz confirmada no `$specsfy-setup`. Um subdiretório informado pela
   pessoa é o projeto; não o promova para a raiz Git. Leia
   `<raiz>/specs/planned/<NNNN>-<slug>/spec.md` (ou a pasta de estado atual),
   as fontes indexadas em `research/`, as instruções do repositório e o código
   relevante. Não procure `tasks.md`, `plan.md`, `research.md` ou
   `data-model.md`.
2. Exija `Formato: Specsfy/2.0`, `Status: Planned` ou `Implementing`,
   `Definition Gate: Passed` e `Plan Gate: Passed`.
3. Valide a spec e as tarefas:

   ```bash
   specsfy gate spec <spec>
   specsfy gate tasks <spec>
   ```

   Pelo MCP, use as tools `gate_spec` e `gate_tasks`. Sem o binário instalado,
   rode os scripts equivalentes:

   ```bash
   node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs \
     specs/<estado>/<NNNN>-<slug>/spec.md
   node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs \
     specs/<estado>/<NNNN>-<slug>/spec.md
   ```

   Se o gate falhar por tarefa, predecessor TDD ou RED ausente em um plano
   antes aprovado, anuncie a pendência e retorne automaticamente para
   `$specsfy-05-tasks` sem alterar produção. Essa skill reabre o Ato II, chama
   TDD/BDD e devolve a entrega depois de validar o plano. Para outra falha,
   carregue a skill responsável pelo gate.
4. Se `Interface para pessoas` for `Sim`, confira a interface antes de
   programar (seção abaixo).
5. Para Laravel, consulte `.specsfy/PACKAGES.md`, `docs/packages/README.md` e
   as fichas existentes antes de adicionar ou trocar uma dependência. Se a
   tarefa trouxer uma URL do GitHub ou mudar o Composer, carregue
   `$specsfy-specialist-laravel-package-manager` e reutilize pacotes já
   instalados que atendam ao requisito.
6. Confira o comando da suíte base com `specsfy gate database` e execute-a
   somente após `SAFE`. Registre falhas preexistentes para não atribuí-las à
   nova mudança.
7. Antes da primeira alteração de produção, defina `Status: Implementing`,
   `Delivery Gate: In Progress` e execute `specsfy specs transition <id> in-progress`,
   equivalente a `specsfy specs transition <id> in-progress`.
8. Selecione o próximo trabalho pronto:

   ```bash
   specsfy tasks next <spec>
   ```

   Pelo MCP, use a tool `task_next`. Sem o binário instalado, rode o script
   equivalente:

   ```bash
   node .agents/skills/specsfy-07-implement/scripts/next_task.mjs \
     <raiz>/specs/<estado>/<NNNN>-<slug>/spec.md
   ```

   Sem tarefa pronta, diferencie `concluído` de `bloqueado por dependência`.

### Conferência de interface

- Leia a seção 10 e confirme que o plano tem tarefas para stack local, telas,
  menus e navegação principal, formulários, ações, blocos React, componentes
  shadcn/ui/ReUI, estados e testes de interação.
- Compare stack, telas e fluxos atuais com o projeto e preserve componentes,
  rotas, conteúdo, permissões e comportamentos fora do alcance registrado.
- Se faltar algum item ou a tecnologia proposta divergir sem confirmação,
  retorne automaticamente para `$specsfy-05-tasks`. Não entregue um
  CRUD somente como API ou persistência.
- Antes de programar, confirme os itens escolhidos na tabela da seção 10 e em
  `INTERFACE.md`. Depois, registre em `INTERFACE.md` todos os blocos criados,
  alterados ou reaproveitados.
- Em projeto React, carregue `$specsfy-specialist-react-ui-components`
  antes de escrever JSX ou TSX. Se ele não estiver instalado, volte ao
  `$specsfy-setup` para instalar o especialista detectado e
  não implemente a tela até concluir esse preparo.
- Em um CRUD, confirme um único `PageHeader` reutilizável em todas as telas,
  `DataGrid` em largura total, coluna `ID` sempre visível, link da linha para o
  detalhe e botões de editar e apagar independentes na linha.

## Executar uma tarefa

Atualize cada item no momento em que ele acontece, não em lote no final.

1. **PREP.** Confirme ID, tipo, referências, dependências, arquivos e
   resultado verificável. Marque `PREP`.
2. **Teste (`[TEST]`).** Siga `$specsfy-06-tdd-bdd`: use o Gherkin da spec
   como referência para desenhar o teste TDD, adicione os marcadores
   `SPECSFY:` e observe RED válido. Não crie nem execute `.feature`. Em PHP,
   use Pest; em Node, somente o runner confirmado pelo usuário.
3. **Pré-condição de código (`[CODE]`).** Confirme que o predecessor TDD está
   concluído para os mesmos IDs, com RED registrado na seção 11. Sem isso, não
   altere produção: anuncie a pendência e retorne automaticamente para
   `$specsfy-05-tasks`, que reabre o plano, chama `$specsfy-06-tdd-bdd` e
   devolve a entrega após o novo `Plan Gate: Passed`.
4. **GREEN.** Escreva a menor mudança de produção que deixa o teste verde.
   - Interface: implemente a tela, os menus, o formulário e a interação
     definidos na spec, com os estados descritos. Rota de API, componente
     vazio ou atalho não substituem a tela acordada.
   - React: siga `$specsfy-specialist-react-ui-components` para localizar,
     reaproveitar, adaptar e registrar componentes antes de criar uma nova
     composição.
   - `[MIGRATION]`: crie primeiro o arquivo versionado no caminho planejado,
     passe o comando pelo `specsfy gate database`, aplique a migration no
     banco de teste e consulte o estado logo depois. Registre os dois comandos
     com saída zero no comentário `specsfy:evidence` da tarefa.
   - `[DOC]` ou `[OPS]`: produza a comprovação específica pedida.
5. **Contexto.** Depois de alterar produção, rode:

   ```bash
   specsfy context monitor --project <raiz> --check
   ```

   Pelo MCP, use a tool `context_monitor`. Sem o binário instalado, rode o
   script equivalente:

   ```bash
   node .agents/skills/specsfy-setup/scripts/monitor_context.mjs \
     --project <raiz> --check
   ```

   Faça handoff de stack pendente para `$specsfy-aux-stack`, de persistência
   para `$specsfy-aux-database` e de regra confirmada para
   `$specsfy-aux-rules`. Revise `PROJECT.md` em toda mudança de aplicação; sem
   impacto material em história, finalidade, capacidades ou limites, registre
   a avaliação na tarefa e repita com `--acknowledge-project-no-change`. A
   tarefa só avança quando o monitor deixar de retornar `PENDING`.
6. **Documentação.** Depois de cada tarefa `[CODE]`, anuncie
   `Transição automática: $specsfy-07-implement → $specsfy-documentator —
   motivo: implementação alterou o sistema — resultado esperado: docs/
   reconstruído e atual` e carregue `$specsfy-documentator`. Retome quando o
   `--check` da documentação passar.
7. **EXECUTE.** Marque quando a entrega e a documentação exigida existirem nos
   caminhos declarados.
8. **VERIFY.** Confira cada comando com `specsfy gate database` e, após
   `SAFE`, execute o teste TDD focal, a suíte relacionada e os checks
   estáticos. Marque somente com o resultado esperado. Refatore apenas com
   tudo verde.
9. **VISUAL.** Aplique a revisão visual descrita acima.
10. **EVIDENCE.** Registre comando, resultado e IDs nas seções 11 a 13. Com
    `Evidence Contract: 1`, grave também o comentário JSON `specsfy:evidence`
    no bloco da tarefa e verifique:

    ```bash
    specsfy gate evidence <spec> --task TNNN
    ```

    Pelo MCP, use a tool `gate_evidence`. Sem o binário instalado, rode o
    script equivalente:

    ```bash
    node .agents/skills/specsfy-07-implement/scripts/verify_evidence.mjs \
      specs/<estado>/<NNNN>-<slug>/spec.md . --task TNNN
    ```

    Quando uma execução completa produzir atestação schema 2, verifique de
    novo com `--attestation PATH`. Exija commit compatível, vínculo com a
    mesma spec e tarefa, refs e comandos idênticos, checks aprovados e SHA-256
    atual de cada arquivo. Atestação de `--self-test` não prova entrega.
11. **IMPROVE.** Faça uma micro-retrospectiva: aplique uma melhoria segura ou
    registre “nenhuma melhoria necessária” com justificativa.
12. **Fechar.** Marque o pai `- [x]` somente com os seis itens concluídos,
    rode `specsfy gate tasks <spec>` e recalcule a próxima tarefa com
    `specsfy tasks next <spec>`.

Uma tarefa `[MIGRATION]` não fecha só porque o model, a query ou o teste
existe. `specsfy gate evidence <spec>` exige o arquivo da migration, o comando
que a aplicou e a consulta que confirma seu estado; se faltar algum, `EXECUTE`,
`VERIFY` e a tarefa continuam abertos.

Tarefas `[P]` podem ser agrupadas quando não tocam os mesmos arquivos ou
estado. Dependência oculta descoberta na execução vira dependência explícita
na seção 14.

## Controlar mudança de escopo

Pare quando a implementação exigir comportamento não descrito, contradizer um
`AC` ou mudar interface pública, dados, segurança ou fora de escopo. Anuncie a
pendência e carregue automaticamente `$specsfy-update-spec`. Ela preserva o
pedido, decide se precisa refinar com a pessoa, atualiza a fonte normativa,
reabre somente os gates afetados e percorre validação, tarefas e TDD/BDD.
Retome com os gates novamente aprovados, nesta ordem de atualização:

```text
specs/<estado>/<NNNN>-<slug>/spec.md (seções 1–13) → tarefas (seção 14) → testes → código → comprovação na mesma spec
```

Correções internas reversíveis podem ser resolvidas no código e citadas no
relato sem reabrir a especificação.

## Gate de conclusão

Quando todas as tarefas da seção 14 estiverem marcadas, execute em sequência:

1. suíte completa, lint, tipos e build disponíveis, cada comando após `SAFE`;
2. rastreabilidade:

   ```bash
   specsfy gate trace <spec>
   ```

   Pelo MCP, use a tool `gate_trace`. Sem o binário instalado, rode o script
   equivalente:

   ```bash
   node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs \
     specs/<estado>/<NNNN>-<slug>/spec.md .
   ```

3. comparação de cada `AC`, `FR`, `NFR` e item da Definition of Done com
   comprovação atual;
4. busca por tarefas abertas, placeholders, testes pulados e falhas conhecidas;
5. `specsfy gate evidence <spec>` para toda tarefa `[MIGRATION]`, confirmando
   arquivo, aplicação e consulta de estado;
6. `specsfy context monitor --project <raiz> --check` sem pendências;
7. `$specsfy-documentator` com `specsfy docs build --project <raiz> --check`
   aprovado.

Com tudo comprovado, altere `Delivery Gate` para `Passed`, defina
`Status: Reviewing` e execute `specsfy specs transition <id> review`, equivalente a
`specsfy specs transition <id> review`. O aceite final e a mudança para
`completed` pertencem ao `$specsfy-04-validate`. Se alguma comprovação faltar,
não declare conclusão.

Projete o resumo de entrega sem criar arquivo:

```bash
specsfy tasks delivery <spec> --format markdown
```

Pelo MCP, use a tool `delivery_render`. Sem o binário instalado, rode o script
equivalente:

```bash
node .agents/skills/specsfy-07-implement/scripts/render_delivery.mjs \
  specs/<estado>/<NNNN>-<slug>/spec.md --format markdown
```

Use `--preview` enquanto a entrega estiver aberta. O script escreve somente em
stdout; publicar o texto em PR, commit ou ferramenta externa exige pedido
explícito. Leia `references/completion-gates.md` para a lista completa do
fechamento.

## Relatar

Informe em texto curto: tarefas concluídas, arquivos alterados, comandos e
resultados, cobertura de IDs, falhas preexistentes e a próxima tarefa pronta
ou o gate final. Ao final, anuncie e carregue automaticamente
`$specsfy-progress` para conferir a visão global. Em falha, anuncie a
pendência, carregue a skill responsável quando necessário e deixe a tarefa
aberta até a correção.

## Especialistas sob demanda

Leia [references/specialists.md](references/specialists.md) antes de executar
uma tarefa cuja tecnologia ou consequência de falha não esteja coberta pelo
contexto local. Instale somente com autorização no projeto consumidor.
