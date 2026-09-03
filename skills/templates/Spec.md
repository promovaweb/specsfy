# Especificação integrada: {{SPEC_NAME}}

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | {{SPEC_ID}} |
| Slug | {{SPEC_NUMBER}}-{{SPEC_SLUG}} |
| Status | Draft |
| Effort | 1 |
| Effort updated at | {{CURRENT_DATE}} |
| Effort rationale | Estimativa inicial; revisar durante a descoberta. |
| ClickUp Task | |
| Milestones | |
| Definition Gate | Pending |
| Plan Gate | Pending |
| Delivery Gate | Pending |
| Evidence Contract | 1 |
| Interface para pessoas | A definir |
| Atualizada em | {{CURRENT_DATE}} |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

[Dor observável e contexto.]

#### Resultado desejado

[Mudança percebida pelo usuário ou negócio.]

#### Métricas de sucesso

- [Métrica mensurável com alvo.]

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: [pergunta investigada] → [conclusão e impacto].
- Para claim material, use: `**R-001** [critical] claim — Verdict: verified|refuted|unverifiable — Confidence: high|medium|low — Evidence: research/caminho#locator — Budget: usado/limite`. IDs são únicos, `usado ≤ limite` e a âncora deve existir.

#### Fontes e contexto consultados

- [Código, documento, stakeholder ou “Nenhuma fonte externa”.]

#### Documentação consultada

- [Título/serviço, versão/data, URL ou caminho local, tópicos relevantes.]

#### Artefatos de pesquisa armazenados

- `specs/draft/{{SPEC_NUMBER}}-{{SPEC_SLUG}}/research/[fonte]/`: [origem, versão/data, licença quando aplicável e propósito], ou “Nenhum artefato externo”.
- Toda fonte externa efetivamente consultada deve ter uma evidência local em `research/`; registre aqui o caminho e mantenha conclusões normativas no `spec.md`.

#### Dúvidas respondidas

- **Q**: [pergunta material] → **A**: [resposta incorporada].

#### Dúvidas abertas

- [Pergunta bloqueante ou “Nenhuma”.]

### 3. Escopo e atores

#### Incluído

- [Capacidade incluída.]

#### Fora de escopo

- [Limite explícito.]

#### Atores

- **[Ator]**: [objetivo, permissões ou responsabilidade].

### 4. Princípios e restrições do projeto

- **PR-001**: [regra de governança, qualidade ou arquitetura].

### 5. Histórias de usuário

#### US-001 — [título] (P1)

Como [ator], quero [capacidade], para [valor].

**Por que P1**: [valor e urgência].
**Teste independente**: [como demonstrar valor isoladamente].
**Requisitos**: FR-001

### 6. Cenários BDD de aceite

#### AC-001 — [comportamento]

**Cobre**: US-001, FR-001, NFR-001

```gherkin
@US-001 @FR-001 @NFR-001 @AC-001
Feature: [capacidade observável]

  Scenario: [caminho feliz aceito]
    Given [estado inicial]
    When [ação]
    Then [resultado observável]
```

#### AC-002 — [regra ou variação crítica]

**Cobre**: US-001, FR-001, NFR-001

```gherkin
@US-001 @FR-001 @NFR-001 @AC-002
Feature: [capacidade observável]

  Scenario: [regra ou variação crítica]
    Given [contexto alternativo]
    When [ação]
    Then [regra observável]
```

#### AC-003 — [falha ou limite material]

**Cobre**: US-001, FR-001, NFR-001

```gherkin
@US-001 @FR-001 @NFR-001 @AC-003
Feature: [capacidade observável]

  Scenario: [falha ou limite material]
    Given [condição de falha ou limite]
    When [ação]
    Then [tratamento observável]
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O sistema deve [comportamento verificável].

#### Não funcionais

- **NFR-001**: [atributo mensurável]. **Verificação**: [teste, inspeção ou medição].

#### Erros e casos-limite

- [Condição] → [comportamento observável].

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- [Stack, arquitetura e convenções encontradas no repositório.]

#### Arquitetura e módulos

- [Componentes, responsabilidades, persistência e pontos de extensão.]

#### Migrations

- [Mudança de schema, ordem, rollback e compatibilidade ou “Não aplicável”.]

#### Models

- [Model, responsabilidade, invariantes e arquivo.]

#### Controllers e casos de uso

- [Controller/handler/use case, entrada, saída, autorização e arquivo.]

#### Views e experiência

- [Tela/componente, estados loading/empty/error/success, acessibilidade e arquivo.]

#### Queries e repositórios

- [Query/repository, filtros, paginação, índices, consistência e arquivo.]

#### Jobs e processamento assíncrono

- [Job/event consumer, retry, idempotência e dead-letter ou “Não aplicável”.]

#### Estrutura de arquivos

```text
specs/draft/{{SPEC_NUMBER}}-{{SPEC_SLUG}}/
  spec.md
  research/
src/
tests/
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| [Entidade] | [chave] | [campos, validações] | [cardinalidade] |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| [Entidade] | [estado] | [evento] | [estado] | [regra] |

#### Migração e retenção

- [Estratégia ou “Não aplicável”.]

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: [Sim ou Não, com justificativa quando Não.]

#### Stack e convenções de interface

- [Framework, roteamento, componentes, estilos, formulários, testes, telas atuais afetadas e fontes locais observadas. Explique “A confirmar” quando a stack não definir a camada.]

#### Telas e responsabilidades

- [Tela, pessoa que a usa, tarefa principal, entrada e saída, ou “Não aplicável”.]

#### Fluxo de informação e navegação

- [Como a pessoa chega, consulta, altera, confirma, retorna ou recupera o contexto. Registre o `Breadcrumb` de cada tela com equipe, módulo e tela atual.]

#### Menus e navegação principal

- [Menu principal e menus secundários, seus itens, destinos ou rotas, permissões e comportamento responsivo. Se não houver menu, declare como a pessoa chega às telas e por que a navegação direta é suficiente.]

#### Formulários e ações

- [Campos, agrupamentos, obrigatoriedade, ajuda, validações, erros, ação principal e padrão: página, painel lateral, modal, área expandida ou outro.]

#### Composição e disposição

- [Hierarquia, navegação, `Breadcrumb` no shell, regiões da tela, densidade,
  responsividade e componentes existentes.]
- [Em aplicação Laravel, Laravel Octane com Open Swoole e `laravel/octane` são
  obrigatórios. Registre `--server=swoole`, o healthcheck e o reload dos
  workers persistentes.]

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- |
| [Tela] | [Bloco] | [O que concentra] | [Caminho] | [Nome] | [shadcn/ui, ReUI ou próprio] | [Bloco existente ou novo, com motivo] |

- [Para Laravel com React, shadcn/ui e ReUI são obrigatórios: escolha as
  primitives shadcn/ui e as composições ReUI gratuitas `@reui/c-*` desta
  entrega. Registre também cada bloco próprio que compõe a tela.]
- [A lista deve corresponder a `INTERFACE.md`; não usar somente nomes de
  bibliotecas sem informar os componentes selecionados.]

#### Estados e acessibilidade

- [Loading, vazio, erro, sucesso, permissão insuficiente, teclado, foco e tecnologia assistiva.]
- [O `Breadcrumb` mantém a equipe visível, usa links válidos nos itens
  anteriores e marca a tela atual com semântica de página.]

#### Contrato CRUD

- [Quando houver CRUD, todas as telas usam o mesmo `PageHeader` componentizado
  e reutilizável para lista, detalhe, criação e edição.]
- [A listagem usa `DataGrid` em largura total, mantém a coluna `ID` visível,
  transforma a linha inteira em link para o detalhe e oferece botões
  independentes de editar e apagar.]
- [Registre em `INTERFACE.md` os componentes reaproveitados e os novos, com
  seus consumidores, estados e regra de extensão.]

#### Revisão visual durante o desenvolvimento

- [A revisão visual ocorre durante a implementação, mesmo sem pedido da
  pessoa, e confere bordas, espaçamentos, margens, padding e tipografia do
  sistema nos estados e viewports relevantes.]
- [Registre método, viewport, estados, achados e ajustes na tarefa. Para uma
  tarefa sem interface, registre `Não aplicável` e o motivo concreto.]

#### APIs expostas

- [Método/rota ou evento, autenticação, request, response, erros e versionamento.]

#### APIs externas utilizadas

- [Serviço, operação, versão, autenticação, timeout, retry e fallback ou “Nenhuma”.]

#### Documentação das APIs consultadas

- [Título, versão/data, URL ou caminho local e decisões extraídas.]

#### Eventos e outros contratos

- [Schema, produtor, consumidor, compatibilidade ou “Não aplicável”.]

### 11. Estratégia TDD

- **Unidade**: [regras e componentes].
- **Integração/contrato**: [fronteiras].
- **BDD/aceite**: [Gherkin de referência que orienta o entendimento e o desenho dos testes TDD].
- **Runner TDD**: [PHP = Pest; Node = decisão confirmada com o usuário e
  materializada em `test:tdd`; outra stack = runner existente ou decisão explícita].
- **E2E**: [jornadas essenciais ou “Não aplicável”.]
- **Verificação manual**: [somente o inevitável, com motivo].

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, NFR-001, AC-001 | [AC-001 na seção 6] | [caso 1 em tests/Feature/RecursoTest.php com marcador próprio `SPECSFY:`] | Pending | Pending | Pending |
| US-001, FR-001, NFR-001, AC-002 | [AC-002 na seção 6] | [caso 2 em tests/Feature/RecursoTest.php com marcador próprio `SPECSFY:`] | Pending | Pending | Pending |
| US-001, FR-001, NFR-001, AC-003 | [AC-003 na seção 6] | [caso 3 em tests/Feature/RecursoTest.php com marcador próprio `SPECSFY:`] | Pending | Pending | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Unidade | [tests/arquivo] | Pending |
| FR-001 | AC-002 | [nível] | [tests/arquivo] | Pending |
| FR-001 | AC-003 | [nível] | [tests/arquivo] | Pending |
| NFR-001 | AC-001 | [nível] | [comando] | Pending |
| NFR-001 | AC-002 | [nível] | [comando] | Pending |
| NFR-001 | AC-003 | [nível] | [comando] | Pending |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Pending
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/draft/{{SPEC_NUMBER}}-{{SPEC_SLUG}}/spec.md`
- **Achados**: [Pending.]
- Findings especializados, quando aplicáveis, seguem `FIND-PROD|ARCH|SEC-NNN`,
  severidade `P1|P2|P3`, estado `Open|Resolved|Accepted`, refs e evidência.

#### Gate do Ato II — Plano

- **Resultado**: Pending
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/draft/{{SPEC_NUMBER}}-{{SPEC_SLUG}}/spec.md`
- **Achados**: [Pending.]

#### Gate do Ato III — Entrega

- **Resultado**: Pending
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/draft/{{SPEC_NUMBER}}-{{SPEC_SLUG}}/spec.md .`
- **Achados**: [Pending.]

### 14. Tarefas

Formato:
`- [ ] TNNN [P?] [TIPO] [US-NNN?] Ação com caminho — Refs: IDs — Depends: IDs|none`

Cada tarefa possui exatamente este checklist, atualizado durante a execução:

```markdown
  - [ ] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [ ] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [ ] **VERIFY**: Executar a verificação focal adequada.
  - [ ] **VISUAL**: Conferir bordas, espaçamentos, margens, padding e tipografia do sistema; se não houver interface, registrar `Não aplicável` e o motivo.
  - [ ] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [ ] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.
```

#### Fase 1 — RED TDD informado pelo BDD

- [ ] T001 [TEST] [TDD] [US-001] Derivar do AC-001 um caso Pest falhando em tests/Feature/RecursoTest.php — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none
  - [ ] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [ ] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [ ] **VERIFY**: Observar RED válido.
  - [ ] **VISUAL**: Conferir a interface afetada ou registrar `Não aplicável` porque a tarefa só materializa teste.
  - [ ] **EVIDENCE**: Registrar comando e causa do RED.
  - [ ] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [ ] T002 [TEST] [TDD] [US-001] Derivar do AC-002 um caso Pest falhando em tests/Feature/RecursoTest.php — Refs: US-001, FR-001, NFR-001, AC-002 — Depends: none
  - [ ] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [ ] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [ ] **VERIFY**: Observar RED válido.
  - [ ] **VISUAL**: Conferir a interface afetada ou registrar `Não aplicável` porque a tarefa só materializa teste.
  - [ ] **EVIDENCE**: Registrar comando e causa do RED.
  - [ ] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [ ] T003 [TEST] [TDD] [US-001] Derivar do AC-003 um caso Pest falhando em tests/Feature/RecursoTest.php — Refs: US-001, FR-001, NFR-001, AC-003 — Depends: none
  - [ ] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [ ] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [ ] **VERIFY**: Observar RED válido.
  - [ ] **VISUAL**: Conferir a interface afetada ou registrar `Não aplicável` porque a tarefa só materializa teste.
  - [ ] **EVIDENCE**: Registrar comando e causa do RED.
  - [ ] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

#### Fase 2 — US-001 [título] (P1)

**Objetivo**: [valor entregue].
**Teste independente**: [comando e resultado].

- [ ] T004 [CODE] [US-001] Implementar comportamento em app/Services/RecursoService.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T001, T002, T003
  - [ ] **PREP**: Confirmar RED TDD e dependências.
  - [ ] **EXECUTE**: Implementar a menor mudança.
  - [ ] **VERIFY**: Executar testes focais e regressão.
  - [ ] **VISUAL**: Conferir bordas, espaçamentos, margens, padding e tipografia do sistema na interface afetada; registrar `Não aplicável` com motivo quando não houver superfície visual.
  - [ ] **EVIDENCE**: Registrar GREEN e arquivos alterados.
  - [ ] **IMPROVE**: Aplicar melhoria de processo ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T004","refs":["US-001","FR-001","NFR-001","AC-001","AC-002","AC-003"],"files":["app/Services/RecursoService.php"],"commands":[{"run":"comando focal","exit":0}]} -->

**Checkpoint**: [como demonstrar a história isoladamente].

#### Fase de interface

- [ ] T005 [CODE] [US-001] Implementar a tela de [responsabilidade] em src/features/recurso/ListaRecurso.tsx — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T001, T002, T003
  - [ ] **PREP**: Confirmar stack, tela atual, fluxo, formulário e estados definidos na seção 10; em React, carregar `$specsfy-specialist-react-ui-components` antes de escrever JSX ou TSX.
  - [ ] **EXECUTE**: Implementar os blocos React, tela, ações e formulário conforme a composição acordada; registrar cada bloco e componente em `INTERFACE.md`.
  - [ ] **VERIFY**: Exercitar Breadcrumb, navegação, validações, feedback e teclado.
  - [ ] **VISUAL**: Conferir PageHeader reutilizado, DataGrid em largura total, coluna `ID`, link da linha, ações de editar e apagar, bordas, espaçamentos, margens, padding e tipografia nos estados e viewports relevantes.
  - [ ] **EVIDENCE**: Registrar arquivos, comando e resultado da interação.
  - [ ] **IMPROVE**: Aplicar melhoria de interface ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T005","refs":["US-001","FR-001","NFR-001","AC-001","AC-002","AC-003"],"files":["src/features/recurso/ListaRecurso.tsx"],"commands":[{"run":"comando focal","exit":0}]} -->

#### Fase final — Qualidade

- [ ] T006 [TEST] Executar regressão e rastreabilidade em tests/Feature/RecursoTest.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T004, T005
  - [ ] **PREP**: Identificar suites, checks e gates.
  - [ ] **EXECUTE**: Executar regressão e rastreabilidade.
  - [ ] **VERIFY**: Confirmar ausência de gaps.
  - [ ] **VISUAL**: Repassar a conferência visual final ou registrar `Não aplicável` com motivo concreto.
  - [ ] **EVIDENCE**: Registrar contagens e comandos finais.
  - [ ] **IMPROVE**: Registrar retrospectiva do processo.

### 15. Ordem de execução

- Caminho crítico: T001/T002/T003 → T004 → T005 → T006.
- Tarefas paralelas: [IDs e motivo, ou “Nenhuma”.]
- Estratégia de MVP: [menor conjunto de histórias entregável].

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- [Dependência ou “Nenhuma”.]

#### Riscos

- [Risco] → [mitigação].

#### Suposições

- [Default assumido.]

### 17. Decisões

- **DEC-001**: [decisão] — [razão, alternativas e trade-off].

### 18. Definition of Done

- [ ] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC` aplicáveis passam.
- [ ] Todos os requisitos possuem evidência de verificação.
- [ ] Todas as tarefas na seção 14 estão concluídas.
- [ ] Testes e checks estáticos disponíveis passam.
