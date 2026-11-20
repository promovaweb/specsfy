# Especificação integrada: Detalhe público de equipe

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0005 |
| Slug | 0005-detalhe-publico-equipe |
| Status | Complete |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Atualizada em | 2026-07-25 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

Saber que uma equipe existe e quantos membros possui não revela quem participa
nem como as responsabilidades se distribuem.

#### Resultado desejado

Uma pessoa autenticada abre qualquer equipe pelo slug e consulta um roster
somente leitura com nomes e papéis, sem exposição de e-mails.

#### Métricas de sucesso

- 100% dos membros da equipe aparecem uma vez com seu papel correto.
- Equipe vazia, slug inexistente e visitante produzem respostas explícitas.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: quais papéis são válidos? → `TeamRole` define `owner`, `admin` e
  `member`.
- **R-002**: qual identificador público já existe? → `Team::getRouteKeyName()`
  usa `slug`.
- **R-003**: o pivot permite mais de um papel? → chave composta do vínculo e
  coluna única `role` representam um papel por usuário/equipe.

#### Fontes e contexto consultados

- `specs/backlog/0002-consulta-equipes-usuarios.md`.
- `app/Models/Team.php`, `app/Models/Membership.php`,
  `app/Enums/TeamRole.php` e testes existentes.
- SPEC-0003 e SPEC-0004.

#### Documentação consultada

- `.specsfy/Spec.md`, `AGENTS.md` e contratos locais.
- PHPStan `property.notFound` e `return.type`, acesso em 2026-07-25, para
  corrigir tipos sem supressão.

#### Artefatos de pesquisa armazenados

- `specs/0005-detalhe-publico-equipe/research/phpstan-type-errors.md`: URLs, data de acesso e impacto da
  documentação PHPStan; nenhuma reprodução de conteúdo externo.

#### Dúvidas respondidas

- **Q**: qual rota identifica equipe? → **A**: slug existente.
- **Q**: quais dados do membro aparecem? → **A**: ID, nome e papel; não e-mail.
- **Q**: quem consulta? → **A**: qualquer pessoa autenticada.
- **Q**: é possível editar papéis? → **A**: não nesta superfície.

#### Dúvidas abertas

- Nenhuma decisão bloqueante.

### 3. Escopo e atores

#### Incluído

- Resumo de nome, tipo, criação e quantidade de membros.
- Roster alfabético com papel e link para perfil do usuário.
- Estados vazio, 404 e autenticação.

#### Fora de escopo

- Convitar, remover, promover ou rebaixar membros.
- Mostrar e-mail, convites pendentes ou histórico.
- Visualizar equipe excluída.

#### Atores

- **Pessoa autenticada**: consulta equipe e roster.
- **Membro exibido**: possui apenas identidade de diretório e papel expostos.

### 4. Princípios e restrições do projeto

- **PR-001**: usar binding por slug e soft delete do model.
- **PR-002**: eager-load de membros com pivot `role`.
- **PR-003**: papéis são labels informativas, não controles de autorização.

### 5. Histórias de usuário

#### US-001 — Compreender a composição da equipe (P1)

Como pessoa autenticada, quero ver membros e papéis de uma equipe, para entender
sua composição.

**Por que P1**: entrega o resultado central do backlog de equipes.
**Teste independente**: `php artisan test --compact tests/Feature/Directory/TeamDetailTest.php`.
**Requisitos**: FR-001, FR-002, FR-003, NFR-001, NFR-002

### 6. Cenários BDD de aceite

#### AC-001 — Consultar roster e papéis

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-001
Feature: Detalhe público de equipe

  Scenario: Pessoa autenticada consulta membros e papéis
    Given uma equipe possui owner, admin e member
    When uma pessoa autenticada abre o detalhe da equipe
    Then vê o resumo e os membros ordenados com seus respectivos papéis

  Scenario: Equipe sem membros
    Given existe uma equipe sem membros
    When uma pessoa autenticada abre o detalhe da equipe
    Then vê um estado vazio sem dados pessoais
```

### 7. Requisitos

#### Funcionais

- **FR-001**: o sistema deve exigir autenticação e retornar 404 para slug
  inexistente ou equipe excluída.
- **FR-002**: o sistema deve fornecer nome, slug, tipo, criação e quantidade de
  membros da equipe.
- **FR-003**: o sistema deve listar membros por nome/ID com ID, nome e papel,
  sem fornecer e-mail.

#### Não funcionais

- **NFR-001**: a consulta deve eager-load membros/pivot em uma única relação, selecionando apenas colunas necessárias. **Verificação**: inspeção e teste.
- **NFR-002**: roster deve ter heading, labels de papel e estado vazio textual. **Verificação**: typecheck, lint e inspeção JSX.

#### Erros e casos-limite

- Visitante → redirect para login.
- Slug inexistente ou soft-deleted → 404.
- Sem membros → “Nenhum membro nesta equipe”.
- Papel persistido válido → label owner/admin/member correspondente.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- `Team` usa slug e `members()` com pivot; `TeamRole` define papéis.

#### Arquitetura e módulos

- `TeamDirectoryController@show` transforma equipe e roster.
- `directory/teams/show.tsx` apresenta resumo e tabela.

#### Migrations

- Não aplicável.

#### Models

- `Team::members()` existente fornece membros e pivot.

#### Controllers e casos de uso

- `app/Http/Controllers/Directory/TeamDirectoryController.php`: action `show`
  com binding por slug, eager loading e whitelist de props.

#### Views e experiência

- `resources/js/pages/directory/teams/show.tsx`: breadcrumbs, métricas, tabela
  de membros, badges de papéis, links de perfil e estado vazio.

#### Queries e repositórios

- `load(['members' => fn (...) => select(...)->orderBy(...)])`; a contagem
  deriva da collection carregada.

#### Jobs e processamento assíncrono

- Não aplicável.

#### Estrutura de arquivos

```text
specs/specs/0005-detalhe-publico-equipe/spec.md
app/Http/Controllers/Directory/TeamDirectoryController.php
resources/js/pages/directory/teams/show.tsx
tests/Feature/Directory/TeamDetailTest.php
tests/features/directory_team_detail.feature
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| Team | ID/slug | resumo público, soft delete | muitos membros |
| Membership | user/team | um papel owner/admin/member | pertence a Team e User |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| Team | ativa | consulta | ativa | nenhuma escrita |
| Team | excluída | consulta | excluída | binding não a retorna |

#### Migração e retenção

- Não aplicável.

### 10. Interfaces e contratos

#### APIs expostas

- `GET /directory/teams/{team}` (`directory.teams.show`), autenticação por
  sessão, binding por slug, resposta Inertia `directory/teams/show`.

#### APIs externas utilizadas

- Nenhuma.

#### Documentação das APIs consultadas

- Contratos locais de binding, soft delete, relações e enum.

#### Eventos e outros contratos

- Prop `team` contém resumo e `members[]` com `id`, `name`, `role`; nunca contém
  `email`.

### 11. Estratégia TDD

- **Unidade**: não aplicável.
- **Integração/contrato**: Pest valida auth, 404, pivot, ordem e privacidade.
- **BDD/aceite**: Behave executa AC-001.
- **E2E**: não aplicável.
- **Verificação manual**: semântica do roster após build.

#### Evidência RED-GREEN-REFACTOR

| IDs | Gherkin executável | Teste TDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 | `tests/features/directory_team_detail.feature` | `tests/Feature/Directory/TeamDetailTest.php` | Behave exit 1 e Pest exit 2: rota `directory.teams.show` ausente | Pest: 4/4; Behave: 2/2 | `composer ci:check`: 100/100; Behave: 11/11; build passou |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001 | AC-001 | Integração | `php artisan test --compact tests/Feature/Directory/TeamDetailTest.php` | Passed: 4 testes |
| NFR-002 | AC-001 | Estático | `npm run types:check && npm run lint:check` | Passed |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-04-validate/scripts/validate_spec.py specs/specs/0005-detalhe-publico-equipe/spec.md`
- **Achados**: READY; binding, papéis, roster, vazio e privacidade definidos; nenhum P1 aberto.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-05-tasks/scripts/validate_tasks.py specs/specs/0005-detalhe-publico-equipe/spec.md`
- **Achados**: tarefas válidas; T001/T002 concluídas após RED Behave/Pest pela rota ausente.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-06-implement/scripts/check_traceability.py specs/specs/0005-detalhe-publico-equipe/spec.md . --full-chain`
- **Achados**: rastreabilidade 4/4; QA passou; regressão, checks e build verdes.

### 14. Tarefas

- [x] T001 [TEST] [US-001] Materializar AC-001 em tests/features/directory_team_detail.feature — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: none
  - [x] **PREP**: Cenários, papéis e runner confirmados.
  - [x] **EXECUTE**: Feature e steps do detalhe criados.
  - [x] **VERIFY**: Behave exit 1 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Comando e causa registrados.
  - [x] **IMPROVE**: Privacidade, vazio e papéis foram cobertos.
- [x] T002 [TEST] [US-001] Criar integração RED em tests/Feature/Directory/TeamDetailTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001
  - [x] **PREP**: Contrato de props e binding confirmado.
  - [x] **EXECUTE**: Testes de auth, roster, vazio e 404 criados.
  - [x] **VERIFY**: Pest exit 2 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Saída focal e IDs registrados.
  - [x] **IMPROVE**: Asserção negativa de e-mail foi incluída.
- [x] T003 [CODE] [US-001] Implementar detalhe em app/Http/Controllers/Directory/TeamDirectoryController.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001, T002
  - [x] **PREP**: REDs e contrato foram confirmados.
  - [x] **EXECUTE**: Action, rota, tipos e página foram criados.
  - [x] **VERIFY**: Pest focal, Behave, Pint e checks frontend passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia conferidos nos estados e viewports da tela.
  - [x] **EVIDENCE**: GREEN e arquivos foram registrados.
  - [x] **IMPROVE**: Roster usa eager loading, ordem estável e whitelist.
  <!-- specsfy:evidence {"task":"T003","refs":["US-001","FR-001","FR-002","FR-003","NFR-001","NFR-002","AC-001"],"files":["routes/web.php","app/Http/Controllers/Directory/TeamDirectoryController.php","resources/js/types/directory.ts","resources/js/pages/directory/teams/show.tsx"],"commands":[{"run":"php artisan test --compact tests/Feature/Directory/TeamDetailTest.php","exit":0}]} -->
- [x] T004 [TEST] [US-001] Executar regressão em tests/Feature/Directory/TeamDetailTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T003
  - [x] **PREP**: Suites e checks foram identificados.
  - [x] **EXECUTE**: Pest, Behave, lint, tipos, formatter, build e rastreabilidade executaram.
  - [x] **VERIFY**: 100 testes, 11 cenários e cobertura completa passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia da entrega conferidos nos estados e viewports aplicáveis.
  - [x] **EVIDENCE**: Comandos e contagens foram registrados.
  - [x] **IMPROVE**: O roster usa pivot tipado, eager loading e whitelist.

### 15. Ordem de execução

- Caminho crítico: T001 → T002 → T003 → T004.
- Tarefas paralelas: nenhuma; usa tipos e rotas das specs anteriores.
- Estratégia de MVP: resumo de equipe e roster seguro.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- SPEC-0004 fornece o diretório de origem.
- SPEC-0003 fornece o destino dos links de usuário.

#### Riscos

- Exposição de e-mail → whitelist de ID/nome/papel.
- N+1 → eager loading da relação.
- Confundir papel exibido com autorização global → copy o apresenta como papel
  naquela equipe.

#### Suposições

- O enum e a integridade do pivot garantem papéis válidos.

### 17. Decisões

- **DEC-001**: usar slug no contrato público — segue o model existente.
- **DEC-002**: ordenar membros por nome e ID — oferece roster previsível.
- **DEC-003**: manter a superfície somente leitura — ações sensíveis continuam
  nas telas autorizadas de gestão.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] AC-001 passa em Behave e Pest.
- [x] Todos os FR/NFR possuem evidência.
- [x] T001 a T004 estão concluídas.
- [x] Testes e checks estáticos passam.
