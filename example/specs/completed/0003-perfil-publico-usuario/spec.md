# Especificação integrada: Perfil público de usuário

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0003 |
| Slug | 0003-perfil-publico-usuario |
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

O diretório identifica contas, mas não explica de quais equipes uma pessoa
participa nem qual papel possui em cada contexto.

#### Resultado desejado

Uma pessoa autenticada abre um perfil público somente leitura e compreende a
participação do usuário em equipes sem acessar seu e-mail ou dados de segurança.

#### Métricas de sucesso

- Todas as equipes relacionadas aparecem uma vez, com papel e tipo corretos.
- Um ID inexistente retorna 404 e uma visita anônima não recebe dados.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: onde está o papel de equipe? → pivot `team_members.role`, exposto
  pela relação `User::teams`.
- **R-002**: qual identificador é estável para o perfil? → `users.id`; nomes não
  são únicos e e-mail não deve entrar na URL.

#### Fontes e contexto consultados

- `specs/backlog/0001-listagem-gestao-usuarios.md`.
- `app/Concerns/HasTeams.php`, `app/Models/User.php`, `app/Enums/TeamRole.php`.
- SPEC-0001 e SPEC-0002.

#### Documentação consultada

- `.specsfy/Spec.md`, `AGENTS.md` e testes existentes de equipes.
- PHPStan `property.notFound` e `return.type`, acesso em 2026-07-25, para
  corrigir tipos sem supressão.

#### Artefatos de pesquisa armazenados

- `specs/completed/0003-perfil-publico-usuario/research/phpstan-type-errors.md`: URLs, data de acesso e impacto da
  documentação PHPStan; nenhuma reprodução de conteúdo externo.

#### Dúvidas respondidas

- **Q**: qual identificador usar? → **A**: ID numérico por route binding.
- **Q**: quais dados pessoais aparecem? → **A**: nome, verificação e data de
  entrada; e-mail e segurança ficam ocultos.
- **Q**: quais relações aparecem? → **A**: equipes, tipo e papel do usuário.
- **Q**: o perfil permite gestão? → **A**: não, somente consulta.

#### Dúvidas abertas

- Nenhuma decisão bloqueante.

### 3. Escopo e atores

#### Incluído

- Página pública interna para qualquer usuário autenticado.
- Resumo da conta e lista alfabética de equipes com papel.
- Links para o detalhe de cada equipe.

#### Fora de escopo

- Edição da conta, troca de papel, contato e exposição de e-mail.
- Histórico de atividades ou convites pendentes.

#### Atores

- **Pessoa autenticada**: consulta um perfil.
- **Usuário consultado**: tem apenas informações de diretório expostas.

### 4. Princípios e restrições do projeto

- **PR-001**: route model binding retorna 404 sem tratamento paralelo.
- **PR-002**: eager loading seleciona somente dados do contrato.
- **PR-003**: papéis usam o vocabulário existente `owner`, `admin`, `member`.

### 5. Histórias de usuário

#### US-001 — Compreender participações (P1)

Como pessoa autenticada, quero abrir um usuário, para saber em quais equipes ele
participa e com qual papel.

**Por que P1**: completa a jornada iniciada no diretório de usuários.
**Teste independente**: `php artisan test --compact tests/Feature/Directory/UserProfileTest.php`.
**Requisitos**: FR-001, FR-002, FR-003, NFR-001, NFR-002

### 6. Cenários BDD de aceite

#### AC-001 — Consultar perfil e participações

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-001
Feature: Perfil público de usuário

  Scenario: Pessoa autenticada consulta as equipes de um usuário
    Given um usuário participa de equipes com papéis diferentes
    When outra pessoa autenticada abre seu perfil público
    Then vê nome, estado e equipes com os respectivos papéis sem ver e-mail

  Scenario: Perfil inexistente
    Given não existe usuário com o identificador solicitado
    When uma pessoa autenticada abre esse perfil
    Then recebe uma resposta de recurso não encontrado
```

#### AC-002 — Consultar um perfil sem participações

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-002
Feature: Consultar um perfil sem participações

  Scenario: Consultar um perfil sem participações
    Given uma conta existe sem equipes ativas
    When uma pessoa autenticada abre seu perfil
    Then recebe o resumo público sem e-mail e a lista de equipes apresenta o estado vazio
```

#### AC-003 — Consultar a participação pessoal

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-003
Feature: Consultar a participação pessoal

  Scenario: Consultar a participação pessoal
    Given uma conta verificada tem apenas sua equipe pessoal
    When outra pessoa autenticada abre o perfil
    Then vê os dados públicos e a equipe pessoal com o papel de proprietário
```

### 7. Requisitos

#### Funcionais

- **FR-001**: o sistema deve retornar 404 para usuário inexistente e exigir
  autenticação para qualquer perfil.
- **FR-002**: o sistema deve exibir nome, estado de verificação e data de
  entrada, sem e-mail.
- **FR-003**: o sistema deve listar equipes do usuário em ordem alfabética,
  incluindo slug, tipo pessoal/compartilhado e papel no vínculo.

#### Não funcionais

- **NFR-001**: a consulta deve eager-load das equipes e selecionar somente colunas usadas. **Verificação**: inspeção e teste de integração.
- **NFR-002**: a lista deve ter heading, estado vazio e labels textuais para tipo/papel. **Verificação**: lint, typecheck e inspeção JSX.

#### Erros e casos-limite

- Usuário inexistente → 404.
- Visitante → redirect para login.
- Usuário sem equipes → estado “Nenhuma equipe vinculada”.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Especialistas

| Especialista | Modo | Sinal que o puxou | Fases |
| --- | --- | --- | --- |
| specsfy-specialist-application-security | padrão | Sessão e dados expostos nas props Inertia | validate |
| specsfy-specialist-interface | accessibility | Semântica, mensagens textuais e navegação | validate |
| specsfy-specialist-interface | ui | Composição, estados e ações das telas | validate |
| specsfy-specialist-interface | ux | Perfil público interno de usuário | validate |
| specsfy-specialist-laravel | app | Rotas, controllers, Eloquent e props Inertia | validate |
| specsfy-specialist-react | padrão | Páginas e navegação Inertia em React | validate |
| specsfy-specialist-testing | pest | Testes HTTP focais e marcadores por critério | validate |
| specsfy-specialist-typescript | padrão | Tipos das props da página | validate |

#### Contexto existente

- `User` usa `HasTeams`; `Team` usa slug no route binding.

#### Arquitetura e módulos

- `UserDirectoryController@show` carrega o usuário e suas equipes.
- `directory/users/show.tsx` compõe resumo e cards de participação.

#### Migrations

- Não aplicável.

#### Models

- `User::teams()` existente fornece pivot `role`.

#### Controllers e casos de uso

- `app/Http/Controllers/Directory/UserDirectoryController.php`: action `show`
  com binding `User $user`, eager loading e transformação segura.

#### Views e experiência

- `resources/js/pages/directory/users/show.tsx`: breadcrumbs, resumo, badges,
  lista de equipes, links Wayfinder e estado vazio.

#### Queries e repositórios

- `load(['teams' => fn (...) => select(...)->orderBy(...)])`, sem repositório
  adicional.

#### Jobs e processamento assíncrono

- Não aplicável.

#### Estrutura de arquivos

```text
specs/completed/0003-perfil-publico-usuario/spec.md
app/Http/Controllers/Directory/UserDirectoryController.php
resources/js/pages/directory/users/show.tsx
tests/Feature/Directory/UserProfileTest.php
tests/features/directory_user_profile.feature
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| User | `users.id` | resumo público sem e-mail | muitas equipes |
| Membership | user/team | papel único no vínculo | pertence a User e Team |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| User | persistido | consulta | persistido | nenhuma escrita |

#### Migração e retenção

- Não aplicável.

### 10. Interfaces e contratos

#### Interface para pessoas

O perfil mostra identidade pública e participações por equipe.

#### Stack e convenções de interface

Laravel e Inertia entregam props tipadas em TypeScript. A página React usa o layout autenticado, Wayfinder e os estilos Tailwind existentes.

#### Telas e responsabilidades

- Perfil público interno de usuário em `resources/js/pages/directory/users/show.tsx`.

#### Fluxo de informação e navegação

Um nome no diretório de usuários abre o perfil. A lista de participações leva ao detalhe de cada equipe.

#### Menus e navegação principal

O rótulo Users no menu lateral tem como destino a rota `directory.users.index`. O nome na tabela leva a `directory.users.show`.

#### Formulários e ações

A tela é somente leitura. Links nas equipes levam ao detalhe correspondente.

#### Composição e disposição

O resumo precede a lista de equipes e seus papéis, com adaptação a telas estreitas.

#### Blocos React e componentes selecionados

`AppLayout`, `Head` e `Link` compõem o perfil e os destinos de equipe.

#### Estados e acessibilidade

A lista tem título, rótulos textuais de tipo e papel e mensagem para ausência de equipes. A rota exige autenticação e retorna 404 para conta inexistente.

#### Revisão visual durante o desenvolvimento

Conferir bordas, espaçamentos, margens, padding e tipografia na página e nos estados aplicáveis em telas estreitas e largas.

#### APIs expostas

- `GET /directory/users/{user}` (`directory.users.show`), autenticação por
  sessão, binding por ID, resposta Inertia `directory/users/show`, 404 quando
  ausente.

#### APIs externas utilizadas

- Nenhuma.

#### Documentação das APIs consultadas

- Relações e bindings já usados no código local.

#### Eventos e outros contratos

- Prop `user` contém `id`, `name`, `isVerified`, `joinedAt` e `teams[]`; nunca
  contém `email`.

### 11. Estratégia TDD

- **Unidade**: não aplicável.
- **Integração/contrato**: Pest valida binding, privacidade e pivot.
- **BDD/aceite**: os três critérios da seção 6 são rastreados na suíte Pest focal. O arquivo `.feature` preserva a jornada histórica e é exercitado pelo adaptador Node do exemplo.
- **E2E**: não aplicável.
- **Verificação manual**: semântica e navegação após build.

#### Evidência RED-GREEN-REFACTOR

| IDs | Gherkin executável | Teste TDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 | `tests/features/directory_user_profile.feature` | `tests/Feature/Directory/UserProfileTest.php` | Behave exit 1 e Pest exit 2: rota `directory.users.show` ausente | Pest: 4/4; Behave: 2/2 | `composer ci:check`: 100/100; Behave: 11/11; build passou |

A tabela acima preserva o RED histórico de AC-001. A decomposição posterior
registrou AC-002 e AC-003 sobre o comportamento entregue. A seção 12 registra
a execução focal atual e a inspeção complementar do JSX para NFR-002.

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001 | AC-001 | Integração | `php artisan test --compact tests/Feature/Directory/UserProfileTest.php` | Passed: suíte focal |
| NFR-002 | AC-001 | Estático | `npm run types:check && npm run lint:check` | Passed |
| US-001, FR-001, FR-002, FR-003, NFR-001 | AC-002 | Integração | `php artisan test --compact tests/Feature/Directory/UserProfileTest.php` | Passed: suíte focal |
| US-001, FR-001, FR-002, FR-003, NFR-001 | AC-003 | Integração | `php artisan test --compact tests/Feature/Directory/UserProfileTest.php` | Passed: suíte focal |
| NFR-002 | AC-002, AC-003 | Estático | JSX da página; `npm run types:check && npm run lint:check` | Passed |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `specsfy gate spec 0003 --project .`
- **Achados**: READY; binding, privacidade, relações e 404 definidos; nenhum P1 aberto.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `specsfy gate tasks 0003 --project .`
- **Achados**: tarefas válidas; T001/T002 concluídas após RED Behave/Pest pela rota ausente.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `specsfy gate trace 0003 --project . --full-chain`
- **Achados**: rastreabilidade 9/9 na suíte Pest focal e matriz de aceite completa.

### 14. Tarefas

- [x] T001 [TEST] [US-001] Materializar AC-001 em tests/features/directory_user_profile.feature — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: none
  - [x] **PREP**: Cenários, binding e runner confirmados.
  - [x] **EXECUTE**: Feature e steps do perfil criados.
  - [x] **VERIFY**: Behave exit 1 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Comando e causa registrados.
  - [x] **IMPROVE**: Privacidade e caso 404 foram cobertos.
- [x] T002 [TEST] [TDD] [US-001] Criar integração RED em tests/Feature/Directory/UserProfileTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001
  - [x] **PREP**: Props e relações confirmadas.
  - [x] **EXECUTE**: Testes de perfil, papéis, auth e 404 criados.
  - [x] **VERIFY**: Pest exit 2 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Saída focal e IDs registrados.
  - [x] **IMPROVE**: Asserção negativa de e-mail foi incluída.
- [x] T005 [TEST] [TDD] [US-001] Consultar um perfil sem participações em tests/Feature/Directory/UserProfileTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-002 — Depends: none
  - [x] **PREP**: Critério da seção 6 e contrato Inertia conferidos.
  - [x] **EXECUTE**: Caso Pest rastreado com marcador próprio.
  - [x] **VERIFY**: Comando focal da seção 12 executado.
  - [x] **VISUAL**: Não aplicável ao caso HTTP. A seção 12 registra a verificação do JSX.
  - [x] **EVIDENCE**: Resultado da suíte focal na seção 12.
  - [x] **IMPROVE**: A suíte focal mantém um marcador próprio para este critério.
- [x] T006 [TEST] [TDD] [US-001] Consultar a participação pessoal em tests/Feature/Directory/UserProfileTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-003 — Depends: none
  - [x] **PREP**: Critério da seção 6 e contrato Inertia conferidos.
  - [x] **EXECUTE**: Caso Pest rastreado com marcador próprio.
  - [x] **VERIFY**: Comando focal da seção 12 executado.
  - [x] **VISUAL**: Não aplicável ao caso HTTP. A seção 12 registra a verificação do JSX.
  - [x] **EVIDENCE**: Resultado da suíte focal na seção 12.
  - [x] **IMPROVE**: A suíte focal mantém um marcador próprio para este critério.

#### Fase de interface

- [x] T003 [CODE] [US-001] Implementar perfil em app/Http/Controllers/Directory/UserDirectoryController.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001, AC-002, AC-003 — Depends: T001, T002, T005, T006 — Inventário: INTERFACE.md
  - [x] **PREP**: REDs e contrato foram confirmados.
  - [x] **EXECUTE**: Action, rota, tipos e página foram criados.
  - [x] **VERIFY**: Pest focal, Behave, Pint e checks frontend passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia conferidos nos estados e viewports da tela.
  - [x] **EVIDENCE**: GREEN e arquivos foram registrados.
  - [x] **IMPROVE**: Pivot de papel foi normalizado com enum sem expor e-mail.
  <!-- specsfy:evidence {"task":"T003","refs":["US-001","FR-001","FR-002","FR-003","NFR-001","NFR-002","AC-001","AC-002","AC-003"],"files":["routes/web.php","app/Http/Controllers/Directory/UserDirectoryController.php","resources/js/types/directory.ts","resources/js/pages/directory/users/show.tsx"],"commands":[{"run":"php artisan test --compact tests/Feature/Directory/UserProfileTest.php","exit":0}]} -->
- [x] T004 [TEST] [US-001] Executar regressão em tests/Feature/Directory/UserProfileTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T003
  - [x] **PREP**: Suites e checks foram identificados.
  - [x] **EXECUTE**: Pest, Behave, lint, tipos, formatter, build e rastreabilidade executaram.
  - [x] **VERIFY**: 100 testes, 11 cenários e cobertura completa passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia da entrega conferidos nos estados e viewports aplicáveis.
  - [x] **EVIDENCE**: Comandos e contagens foram registrados.
  - [x] **IMPROVE**: O pivot passou a usar o model Membership nas duas direções.

### 15. Ordem de execução

- Caminho crítico: T001 precede T002. T002, T005 e T006 precedem T003 no grafo de cobertura. T004 depende de T003.
- Tarefas paralelas: nenhuma; compartilha controller/tipos com SPEC-0001.
- Estratégia de MVP: resumo seguro e lista de participações.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- SPEC-0001 fornece a navegação de origem.
- SPEC-0004 e SPEC-0005 fornecem os destinos de equipe.

#### Riscos

- Perfil virar vazamento de PII → whitelist explícita sem e-mail.
- N+1 em equipes → eager loading único.

#### Suposições

- Um usuário possui no máximo um papel por equipe conforme chave do pivot.

### 17. Decisões

- **DEC-001**: usar ID do usuário na URL — evita depender de nome/e-mail.
- **DEC-002**: listar todos os vínculos, inclusive equipes pessoais — reflete
  fielmente o estado persistido.
- **DEC-003**: não exibir e-mail — o objetivo é contexto organizacional, não
  contato.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] AC-001 a AC-003 passam na suíte Pest focal. O histórico de aceite de AC-001 está na seção 11.
- [x] Todos os FR/NFR possuem evidência.
- [x] T001 a T006 estão concluídas.
- [x] Testes e checks estáticos passam.
