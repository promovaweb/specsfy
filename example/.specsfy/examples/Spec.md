# Especificação integrada: Painel de progresso das especificações

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0001 |
| Slug | 0001-painel-progresso |
| Status | Draft |
| Definition Gate | Pending |
| Plan Gate | Pending |
| Delivery Gate | Pending |
| Evidence Contract | 1 |
| Atualizada em | 2026-07-25 |

> Exemplo não normativo. Ele demonstra a arquitetura do documento e serve como
> fixture legível para o CLI; um projeto real deve criar sua própria `spec.md`.

## Ato I — Definir

### 1. Problema e resultado

#### Problema

É difícil enxergar o progresso de várias especificações sem abrir cada arquivo.

#### Resultado desejado

Exibir no terminal uma visão consolidada e atualizada das checklists.

#### Métricas de sucesso

- Recalcular o progresso em até 1 segundo após salvar uma spec.

### 2. Research e esclarecimentos

#### Researchs executados

- Nenhuma pesquisa externa foi necessária para este exemplo.

#### Fontes e contexto consultados

- Contrato central do framework e estrutura do template canônico.

#### Documentação consultada

- Nenhuma documentação externa.

#### Artefatos de pesquisa armazenados

- Nenhum artefato externo.

#### Dúvidas respondidas

- **Q**: Qual é a fonte do progresso? → **A**: As checklists da `spec.md`.

#### Dúvidas abertas

- Nenhuma.

### 3. Escopo e atores

#### Incluído

- Listagem de specs e totais de itens concluídos e pendentes.

#### Fora de escopo

- Alteração automática das checklists pelo painel.

#### Atores

- **Pessoa desenvolvedora**: acompanha a execução de uma especificação.

### 4. Princípios e restrições do projeto

- **PR-001**: O painel somente projeta o estado dos arquivos existentes.

### 5. Histórias de usuário

#### US-001 — Visualizar progresso (P1)

Como pessoa desenvolvedora, quero ver o progresso das specs, para identificar o
próximo trabalho sem abrir cada documento.

**Por que P1**: A visão consolidada é o valor central.
**Teste independente**: Executar o CLI sobre uma fixture com checklists.
**Requisitos**: FR-001

### 6. Cenários BDD de aceite

#### AC-001 — Consolidar checklists

**Cobre**: US-001, FR-001, NFR-001

```gherkin
@US-001 @FR-001 @NFR-001 @AC-001
Feature: Progresso consolidado

  Scenario: Spec com itens concluídos e pendentes
    Given uma spec com duas checklists concluídas e duas pendentes
    When o painel calcula seu progresso
    Then ele informa cinquenta por cento
```

#### AC-002 — Consolidar spec sem checklists

**Cobre**: US-001, FR-001, NFR-001

```gherkin
@US-001 @FR-001 @NFR-001 @AC-002
Feature: Progresso consolidado

  Scenario: Spec ainda sem itens rastreáveis
    Given uma spec sem checklists
    When o painel calcula seu progresso
    Then ele informa zero itens sem modificar a spec
```

#### AC-003 — Rejeitar spec ilegível

**Cobre**: US-001, FR-001, NFR-001

```gherkin
@US-001 @FR-001 @NFR-001 @AC-003
Feature: Progresso consolidado

  Scenario: Arquivo da spec não pode ser lido
    Given uma spec cujo conteúdo não pode ser lido
    When o painel tenta calcular seu progresso
    Then ele informa o erro sem modificar o arquivo
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O CLI deve calcular checklists concluídas e pendentes por spec.

#### Não funcionais

- **NFR-001**: A projeção não deve modificar a spec. **Verificação**: comparar o
  conteúdo antes e depois da leitura.

#### Erros e casos-limite

- Arquivo ilegível → informar erro sem alterar o arquivo.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- CLI TypeScript com parser de Markdown e interface terminal.

#### Arquitetura e módulos

- O scanner descobre specs; o parser calcula métricas; a TUI projeta resultados.

#### Migrations

- Não aplicável.

#### Models

- `SpecProgress` preserva identidade e totais derivados.

#### Controllers e casos de uso

- `scan_project` recebe a raiz e retorna as projeções.

#### Views e experiência

- Dashboard com totais, percentual, barra de progresso e estados vazios.

#### Queries e repositórios

- Não aplicável.

#### Jobs e processamento assíncrono

- Um observador invalida a projeção quando arquivos Markdown mudam.

#### Estrutura de arquivos

```text
specs/draft/0001-painel-progresso/
  spec.md
cli/src/progress.ts
cli/tests/progress.test.ts
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| SpecProgress | caminho da spec | total, concluídas, pendentes | deriva de uma spec |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| Projeção | atual | arquivo salvo | recalculada | não modifica a origem |

#### Migração e retenção

- Não aplicável.

### 10. Interfaces e contratos

#### APIs expostas

- `scan_project(root)` retorna uma coleção de progresso.

#### APIs externas utilizadas

- Nenhuma.

#### Documentação das APIs consultadas

- Nenhuma.

#### Eventos e outros contratos

- Mudança do `mtime` invalida a projeção em memória.

### 11. Estratégia TDD

- **Unidade**: cálculo e percentual.
- **Integração/contrato**: descoberta da estrutura canônica.
- **BDD/aceite**: Gherkin AC-001, AC-002 e AC-003 como referência para os testes derivados.
- **E2E**: inicialização do dashboard com a fixture.
- **Verificação manual**: legibilidade do terminal.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, NFR-001, AC-001 | AC-001 na seção 6 | caso de percentual em tests/progress.test.ts com `SPECSFY:` próprio | Pending | Pending | Pending |
| US-001, FR-001, NFR-001, AC-002 | AC-002 na seção 6 | caso vazio em tests/progress.test.ts com `SPECSFY:` próprio | Pending | Pending | Pending |
| US-001, FR-001, NFR-001, AC-003 | AC-003 na seção 6 | caso ilegível em tests/progress.test.ts com `SPECSFY:` próprio | Pending | Pending | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Unidade | `npm test -- --run tests/progress.test.ts` | Pending |
| FR-001 | AC-002 | Unidade | `npm test -- --run tests/progress.test.ts` | Pending |
| FR-001 | AC-003 | Integração | `npm test -- --run tests/progress.test.ts` | Pending |
| NFR-001 | AC-001 | Integração | comparar checksum antes e depois | Pending |
| NFR-001 | AC-002 | Integração | comparar checksum antes e depois | Pending |
| NFR-001 | AC-003 | Integração | comparar checksum antes e depois | Pending |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Pending
- **Comando**: `validate_spec.mjs specs/draft/0001-painel-progresso/spec.md`
- **Achados**: Exemplo mantido em Draft.

#### Gate do Ato II — Plano

- **Resultado**: Pending
- **Comando**: `validate_tasks.mjs specs/draft/0001-painel-progresso/spec.md`
- **Achados**: Execução ainda não iniciada.

#### Gate do Ato III — Entrega

- **Resultado**: Pending
- **Comando**: `check_traceability.mjs specs/draft/0001-painel-progresso/spec.md .`
- **Achados**: Execução ainda não iniciada.

### 14. Tarefas

- [ ] T001 [TEST] [TDD] [US-001] Materializar o caso de percentual em tests/progress.test.ts — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none
  - [ ] **PREP**: Confirmar fixture, IDs e baseline.
  - [ ] **EXECUTE**: Escrever o caso com marcador `SPECSFY:` próprio.
  - [ ] **VERIFY**: Observar RED válido.
  - [ ] **VISUAL**: Conferir bordas, espaçamentos, margens, padding e tipografia; registrar `Não aplicável` porque a tarefa só materializa teste.
  - [ ] **EVIDENCE**: Registrar comando e causa do RED.
  - [ ] **IMPROVE**: Revisar a clareza da fixture.

- [ ] T002 [TEST] [TDD] [US-001] Materializar o caso vazio em tests/progress.test.ts — Refs: US-001, FR-001, NFR-001, AC-002 — Depends: none
  - [ ] **PREP**: Confirmar fixture, IDs e baseline.
  - [ ] **EXECUTE**: Escrever o caso com marcador `SPECSFY:` próprio.
  - [ ] **VERIFY**: Observar RED válido.
  - [ ] **VISUAL**: Conferir bordas, espaçamentos, margens, padding e tipografia; registrar `Não aplicável` porque a tarefa só materializa teste.
  - [ ] **EVIDENCE**: Registrar comando e causa do RED.
  - [ ] **IMPROVE**: Revisar a clareza da fixture.

- [ ] T003 [TEST] [TDD] [US-001] Materializar o caso ilegível em tests/progress.test.ts — Refs: US-001, FR-001, NFR-001, AC-003 — Depends: none
  - [ ] **PREP**: Confirmar fixture, IDs e baseline.
  - [ ] **EXECUTE**: Escrever o caso com marcador `SPECSFY:` próprio.
  - [ ] **VERIFY**: Observar RED válido.
  - [ ] **VISUAL**: Conferir bordas, espaçamentos, margens, padding e tipografia; registrar `Não aplicável` porque a tarefa só materializa teste.
  - [ ] **EVIDENCE**: Registrar comando e causa do RED.
  - [ ] **IMPROVE**: Revisar a clareza da fixture.

- [ ] T004 [CODE] [US-001] Implementar o cálculo em cli/src/progress.ts — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T001, T002, T003
  - [ ] **PREP**: Confirmar RED e contrato somente leitura.
  - [ ] **EXECUTE**: Implementar a menor mudança.
  - [ ] **VERIFY**: Executar teste focal e regressão.
  - [ ] **VISUAL**: Conferir bordas, espaçamentos, margens, padding e tipografia; registrar `Não aplicável` com o motivo se não houver interface.
  - [ ] **EVIDENCE**: Registrar GREEN e arquivos alterados.
  - [ ] **IMPROVE**: Registrar melhoria ou ausência justificada.

### 15. Ordem de execução

- Caminho crítico: T001/T002/T003 → T004.
- Tarefas paralelas: Nenhuma.
- Estratégia de MVP: calcular e exibir o percentual de uma spec.

## Ato III — Entregar e validar

### 16. Dependências, falhas possíveis e suposições

#### Dependências

- Parser Markdown do próprio CLI.

#### Falhas possíveis

- Somar checklists em blocos de código → ignorar blocos cercados.

#### Suposições

- A estrutura canônica permanece em `specs/<estado>/<NNNN>-<slug>/spec.md`.

### 17. Decisões

- **DEC-001**: Manter o painel somente leitura — preserva a spec como fonte.

### 18. Definition of Done

- [ ] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC` aplicáveis passam.
- [ ] Todos os requisitos possuem evidência de verificação.
- [ ] Todas as tarefas na seção 14 estão concluídas.
- [ ] Testes e checks estáticos disponíveis passam.
