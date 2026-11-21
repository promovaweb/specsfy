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
| Interface para pessoas | Sim |
| Especialistas | specsfy-specialist-application-security, specsfy-specialist-interface, specsfy-specialist-laravel, specsfy-specialist-react, specsfy-specialist-testing, specsfy-specialist-typescript |
| Atualizada em | 2026-11-20 |

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

- `specs/completed/0005-detalhe-publico-equipe/research/phpstan-type-errors.md`: URLs, data de acesso e impacto da
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
```

#### AC-002 — Consultar uma equipe sem membros

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-002
Feature: Consultar uma equipe sem membros

  Scenario: Consultar uma equipe sem membros
    Given uma equipe ativa não possui membros
    When uma pessoa autenticada abre seu detalhe
    Then vê o resumo com contagem zero e mensagem de lista vazia
```

#### AC-003 — Consultar uma equipe pessoal

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-003
Feature: Consultar uma equipe pessoal

  Scenario: Consultar uma equipe pessoal
    Given uma equipe pessoal tem somente seu proprietário
    When outra pessoa autenticada abre seu detalhe
    Then vê o tipo pessoal e seu único membro com o papel de proprietário, sem e-mail
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

#### Especialistas

| Especialista | Modo | Sinal que o puxou | Fases |
| --- | --- | --- | --- |
| specsfy-specialist-application-security | padrão | Sessão e dados expostos nas props Inertia | validate |
| specsfy-specialist-interface | accessibility | Semântica, mensagens textuais e navegação | validate |
| specsfy-specialist-interface | ui | Composição, estados e ações das telas | validate |
| specsfy-specialist-interface | ux | Detalhe público interno de equipe | validate |
| specsfy-specialist-laravel | app | Rotas, controllers, Eloquent e props Inertia | validate |
| specsfy-specialist-react | padrão | Páginas e navegação Inertia em React | validate |
| specsfy-specialist-testing | pest | Testes HTTP focais e marcadores por critério | validate |
| specsfy-specialist-typescript | padrão | Tipos das props da página | validate |

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
specs/completed/0005-detalhe-publico-equipe/spec.md
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

#### Interface para pessoas

A página mostra o resumo da equipe e os papéis de seus membros.

#### Stack e convenções de interface

Laravel e Inertia entregam props tipadas em TypeScript. A página React usa o layout autenticado, Wayfinder e os estilos Tailwind existentes.

#### Telas e responsabilidades

- Detalhe público interno de equipe em `resources/js/pages/directory/teams/show.tsx`.

#### Fluxo de informação e navegação

O nome da equipe na listagem abre seu detalhe. O nome de um membro leva ao perfil de usuário.

#### Menus e navegação principal

O rótulo Teams no menu lateral tem como destino a rota `directory.teams.index`. O nome da equipe leva a `directory.teams.show`.

#### Formulários e ações

A tela é somente leitura. Os nomes dos membros linkam seus perfis internos.

#### Composição e disposição

O resumo antecede a lista de membros, com informações e papéis dispostos abaixo do título.

#### Blocos React e componentes selecionados

`AppLayout`, `Head` e `Link` compõem a tela e os destinos de perfil.

#### Estados e acessibilidade

O roster tem título, rótulos de papel e mensagem de lista vazia. A rota exige autenticação e retorna 404 para slug inexistente.

#### Revisão visual durante o desenvolvimento

Conferir bordas, espaçamentos, margens, padding e tipografia na página e nos estados aplicáveis em telas estreitas e largas.

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
- **BDD/aceite**: os três critérios da seção 6 são rastreados na suíte Pest focal. O arquivo `.feature` preserva a jornada histórica e é exercitado pelo adaptador Node do exemplo.
- **E2E**: não aplicável.
- **Verificação manual**: semântica do roster após build.

#### Evidência RED-GREEN-REFACTOR

| IDs | Gherkin executável | Teste TDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 | `tests/features/directory_team_detail.feature` | `tests/Feature/Directory/TeamDetailTest.php` | Behave exit 1 e Pest exit 2: rota `directory.teams.show` ausente | Pest: 4/4; Behave: 2/2 | `composer ci:check`: 100/100; Behave: 11/11; build passou |

A tabela acima preserva o RED histórico de AC-001. A decomposição posterior
registrou AC-002 e AC-003 sobre o comportamento entregue. A seção 12 registra
a execução focal atual e a inspeção complementar do JSX para NFR-002.

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001 | AC-001 | Integração | `php artisan test --compact tests/Feature/Directory/TeamDetailTest.php` | Passed: suíte focal |
| NFR-002 | AC-001 | Estático | `npm run types:check && npm run lint:check` | Passed |
| US-001, FR-001, FR-002, FR-003, NFR-001 | AC-002 | Integração | `php artisan test --compact tests/Feature/Directory/TeamDetailTest.php` | Passed: suíte focal |
| US-001, FR-001, FR-002, FR-003, NFR-001 | AC-003 | Integração | `php artisan test --compact tests/Feature/Directory/TeamDetailTest.php` | Passed: suíte focal |
| NFR-002 | AC-002, AC-003 | Estático | JSX da página; `npm run types:check && npm run lint:check` | Passed |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `specsfy gate spec 0005 --project .`
- **Achados**: READY; binding, papéis, roster, vazio e privacidade definidos; nenhum P1 aberto.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `specsfy gate tasks 0005 --project .`
- **Achados**: tarefas válidas; T001/T002 concluídas após RED Behave/Pest pela rota ausente.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `specsfy gate trace 0005 --project . --full-chain`
- **Achados**: rastreabilidade 9/9 na suíte Pest focal e matriz de aceite completa.

### 14. Tarefas

- [x] T001 [TEST] [US-001] Materializar AC-001 em tests/features/directory_team_detail.feature — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: none
  - [x] **PREP**: Cenários, papéis e runner confirmados.
  - [x] **EXECUTE**: Feature e steps do detalhe criados.
  - [x] **VERIFY**: Behave exit 1 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Comando e causa registrados.
  - [x] **IMPROVE**: Privacidade, vazio e papéis foram cobertos.
- [x] T002 [TEST] [TDD] [US-001] Criar integração RED em tests/Feature/Directory/TeamDetailTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001
  - [x] **PREP**: Contrato de props e binding confirmado.
  - [x] **EXECUTE**: Testes de auth, roster, vazio e 404 criados.
  - [x] **VERIFY**: Pest exit 2 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Saída focal e IDs registrados.
  - [x] **IMPROVE**: Asserção negativa de e-mail foi incluída.
- [x] T005 [TEST] [TDD] [US-001] Consultar uma equipe sem membros em tests/Feature/Directory/TeamDetailTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-002 — Depends: none
  - [x] **PREP**: Critério da seção 6 e contrato Inertia conferidos.
  - [x] **EXECUTE**: Caso Pest rastreado com marcador próprio.
  - [x] **VERIFY**: Comando focal da seção 12 executado.
  - [x] **VISUAL**: Não aplicável ao caso HTTP. A seção 12 registra a verificação do JSX.
  - [x] **EVIDENCE**: Resultado da suíte focal na seção 12.
  - [x] **IMPROVE**: A suíte focal mantém um marcador próprio para este critério.
- [x] T006 [TEST] [TDD] [US-001] Consultar uma equipe pessoal em tests/Feature/Directory/TeamDetailTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-003 — Depends: none
  - [x] **PREP**: Critério da seção 6 e contrato Inertia conferidos.
  - [x] **EXECUTE**: Caso Pest rastreado com marcador próprio.
  - [x] **VERIFY**: Comando focal da seção 12 executado.
  - [x] **VISUAL**: Não aplicável ao caso HTTP. A seção 12 registra a verificação do JSX.
  - [x] **EVIDENCE**: Resultado da suíte focal na seção 12.
  - [x] **IMPROVE**: A suíte focal mantém um marcador próprio para este critério.

#### Fase de interface

- [x] T003 [CODE] [US-001] Implementar detalhe em app/Http/Controllers/Directory/TeamDirectoryController.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001, AC-002, AC-003 — Depends: T001, T002, T005, T006 — Inventário: INTERFACE.md
  - [x] **PREP**: REDs e contrato foram confirmados.
  - [x] **EXECUTE**: Action, rota, tipos e página foram criados.
  - [x] **VERIFY**: Pest focal, Behave, Pint e checks frontend passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia conferidos nos estados e viewports da tela.
  - [x] **EVIDENCE**: GREEN e arquivos foram registrados.
  - [x] **IMPROVE**: Roster usa eager loading, ordem estável e whitelist.
  <!-- specsfy:evidence {"task":"T003","refs":["US-001","FR-001","FR-002","FR-003","NFR-001","NFR-002","AC-001","AC-002","AC-003"],"files":["routes/web.php","app/Http/Controllers/Directory/TeamDirectoryController.php","resources/js/types/directory.ts","resources/js/pages/directory/teams/show.tsx"],"commands":[{"run":"php artisan test --compact tests/Feature/Directory/TeamDetailTest.php","exit":0}]} -->
- [x] T004 [TEST] [US-001] Executar regressão em tests/Feature/Directory/TeamDetailTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T003
  - [x] **PREP**: Suites e checks foram identificados.
  - [x] **EXECUTE**: Pest, Behave, lint, tipos, formatter, build e rastreabilidade executaram.
  - [x] **VERIFY**: 100 testes, 11 cenários e cobertura completa passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia da entrega conferidos nos estados e viewports aplicáveis.
  - [x] **EVIDENCE**: Comandos e contagens foram registrados.
  - [x] **IMPROVE**: O roster usa pivot tipado, eager loading e whitelist.

### 15. Ordem de execução

- Caminho crítico: T001 precede T002. T002, T005 e T006 precedem T003 no grafo de cobertura. T004 depende de T003.
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
- [x] AC-001 a AC-003 passam na suíte Pest focal. O histórico de aceite de AC-001 está na seção 11.
- [x] Todos os FR/NFR possuem evidência.
- [x] T001 a T006 estão concluídas.
- [x] Testes e checks estáticos passam.
