### 14. Tarefas

Formato:
`- [ ] TNNN [P?] [TIPO] [US-NNN?] Ação com caminho — Refs: IDs — Depends: IDs|none`

Use `[CODE] [MIGRATION]` para toda alteração ligada ao banco. A tarefa aponta
para um arquivo versionado de migration, aplica-o no banco de teste e consulta
seu estado antes da conclusão.

Quando aplicável, inclua logo abaixo da linha da tarefa um item sem checkbox
`Especialista: $specsfy-specialist-<nome> (<modo>)` para cada especialista.

Checklist obrigatório por tarefa, na ordem:

```markdown
  - [ ] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [ ] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [ ] **VERIFY**: Executar a verificação focal adequada.
  - [ ] **VISUAL**: Conferir bordas, espaçamentos, margens, padding e tipografia do sistema; se não houver interface, registrar `Não aplicável` e o motivo.
  - [ ] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [ ] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.
```

#### Fase 1 — RED TDD informado pelo BDD

Quando um AC precisar de tabela nova, registre no `VERIFY` do TDD as
asserções que podem dar RED antes do schema e indique cada asserção
`pendente de schema`, a tarefa `[MIGRATION]` que a libera e o ID e passo da
tarefa que verifica o resultado. Em `EVIDENCE`, leve essa informação à linha
do AC com o comando e a causa do RED observado. Atualize essa linha no ponto
de verificação posterior com os resultados reais.

Exemplo com a migration T004 aplicada no banco de teste:

- Paginação e validade da lista → T005 / `VERIFY`, com fixtures de mais de uma
  página, registros nos limites de validade e relógio fixo.
- Ausência de gravação após o `403` → T007 / `VERIFY`, com comparação da tabela
  antes e depois do POST. A asserção HTTP pode rodar antes de T004.

- [ ] T001 [TEST] [TDD] [US-001] Derivar do AC-001 um caso Pest falhando em tests/Feature/RecursoTest.php — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none
  - [ ] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível.
  - [ ] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [ ] **VERIFY**: Observar RED válido.
  - [ ] **VISUAL**: Conferir a interface afetada ou registrar `Não aplicável` porque a tarefa só materializa teste.
  - [ ] **EVIDENCE**: Registrar comando e causa do RED.
  - [ ] **IMPROVE**: Revisar cobertura e registrar aprendizado.

- [ ] T002 [TEST] [TDD] [US-001] Derivar do AC-002 um caso Pest falhando em tests/Feature/RecursoTest.php — Refs: US-001, FR-001, NFR-001, AC-002 — Depends: none
  - [ ] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível.
  - [ ] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [ ] **VERIFY**: Observar RED válido.
  - [ ] **VISUAL**: Conferir a interface afetada ou registrar `Não aplicável` porque a tarefa só materializa teste.
  - [ ] **EVIDENCE**: Registrar comando e causa do RED.
  - [ ] **IMPROVE**: Revisar cobertura e registrar aprendizado.

- [ ] T003 [TEST] [TDD] [US-001] Derivar do AC-003 um caso Pest falhando em tests/Feature/RecursoTest.php — Refs: US-001, FR-001, NFR-001, AC-003 — Depends: none
  - [ ] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível.
  - [ ] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [ ] **VERIFY**: Observar RED válido.
  - [ ] **VISUAL**: Conferir a interface afetada ou registrar `Não aplicável` porque a tarefa só materializa teste.
  - [ ] **EVIDENCE**: Registrar comando e causa do RED.
  - [ ] **IMPROVE**: Revisar cobertura e registrar aprendizado.

#### Fase 2 — US-001 [título] (P1)

**Objetivo**: [valor entregue].
**Teste independente**: [comando e resultado].

- [ ] T004 [CODE] [MIGRATION] [US-001] Criar estrutura persistente em database/migrations/AAAA_MM_DD_HHMMSS_create_recursos_table.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T001, T002, T003
  - [ ] **PREP**: Confirmar RED TDD, banco de teste separado e caminho versionado.
  - [ ] **EXECUTE**: Criar e aplicar a migration no banco de teste.
  - [ ] **VERIFY**: Executar `php artisan migrate:status --env=testing` e confirmar a migration aplicada.
  - [ ] **VISUAL**: Registrar `Não aplicável` porque a tarefa altera somente a estrutura persistente.
  - [ ] **EVIDENCE**: Registrar arquivo, comando de aplicação, consulta de estado e resultados.
  - [ ] **IMPROVE**: Revisar compatibilidade e registrar melhoria ou ausência justificada.
  <!-- specsfy:evidence {"task":"T004","refs":["US-001","FR-001","NFR-001","AC-001","AC-002","AC-003"],"files":["database/migrations/AAAA_MM_DD_HHMMSS_create_recursos_table.php"],"commands":[{"run":"php artisan migrate --env=testing","exit":0},{"run":"php artisan migrate:status --env=testing","exit":0}]} -->

- [ ] T005 [CODE] [US-001] Implementar comportamento em app/Services/RecursoService.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T004
  - [ ] **PREP**: Confirmar RED TDD e dependências.
  - [ ] **EXECUTE**: Implementar a menor mudança.
  - [ ] **VERIFY**: Executar testes focais e regressão. Quando indicado nos
    ACs, usar as fixtures da tabela criada por T004 para conferir paginação e validade.
  - [ ] **VISUAL**: Conferir bordas, espaçamentos, margens, padding e tipografia do sistema na interface afetada; registrar `Não aplicável` com motivo quando não houver superfície visual.
  - [ ] **EVIDENCE**: Registrar GREEN e arquivos alterados. Atualizar os ACs
    com os resultados das asserções pendentes verificadas nesta tarefa.
  - [ ] **IMPROVE**: Aplicar melhoria ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T005","refs":["US-001","FR-001","NFR-001","AC-001","AC-002","AC-003"],"files":["app/Services/RecursoService.php"],"commands":[{"run":"comando focal","exit":0}]} -->

O comentário é obrigatório para tarefa `[CODE]` concluída quando a spec declara
`Evidence Contract: 1`; ele permanece dentro da fonte única.

**Checkpoint**: [como demonstrar a história isoladamente].

#### Fase de interface

- [ ] T006 [CODE] [US-001] Implementar a tela de [responsabilidade] em src/features/recurso/ListaRecurso.tsx — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T005
  - Especialista: $specsfy-specialist-ui-components (components)
  - [ ] **PREP**: Confirmar stack, tela atual, fluxo, formulário e estados definidos na seção 10.
  - [ ] **EXECUTE**: Implementar os blocos React, tela, ações e formulário conforme a composição acordada; registrar cada bloco e componente em `INTERFACE.md`.
  - [ ] **VERIFY**: Exercitar menus, navegação, validações, feedback e teclado.
  - [ ] **VISUAL**: Conferir PageHeader reutilizado, DataGrid em largura total, coluna `ID`, bordas, espaçamentos, margens, padding e tipografia nos estados e viewports relevantes. Confira o link da linha se `Operações:` no Contrato CRUD incluir `consultar`, a ação de edição se incluir `editar` e a ação de exclusão se incluir `apagar`. Para `listar, criar`, confira a grade informativa e a entrada para criação.
  - [ ] **EVIDENCE**: Registrar arquivos, comando e resultado da interação.
  - [ ] **IMPROVE**: Aplicar melhoria de interface ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T006","refs":["US-001","FR-001","NFR-001","AC-001","AC-002","AC-003"],"files":["src/features/recurso/ListaRecurso.tsx"],"commands":[{"run":"comando focal","exit":0}]} -->

#### Fase final — Qualidade

- [ ] T007 [TEST] Executar regressão e rastreabilidade em tests/Feature/RecursoTest.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T005, T006
  - [ ] **PREP**: Identificar suites, checks e gates.
  - [ ] **EXECUTE**: Executar regressão e rastreabilidade.
  - [ ] **VERIFY**: Confirmar ausência de gaps e, para o AC aplicável, conferir
    que o POST proibido preserva os registros da tabela criada por T004.
  - [ ] **VISUAL**: Repassar a conferência visual final ou registrar `Não aplicável` com motivo concreto.
  - [ ] **EVIDENCE**: Registrar contagens e comandos finais e atualizar o AC
    com o resultado da asserção de ausência de gravação.
  - [ ] **IMPROVE**: Registrar retrospectiva do processo.

### 15. Ordem de execução

- Caminho crítico: T001/T002/T003 → T004 → T005 → T006 → T007.
- Tarefas paralelas: [IDs e motivo, ou “Nenhuma”.]
- Estratégia de MVP: [menor conjunto de histórias entregável].
