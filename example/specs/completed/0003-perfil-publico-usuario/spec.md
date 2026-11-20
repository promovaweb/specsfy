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
| Atualizada em | 2026-07-25 |

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

- `specs/0003-perfil-publico-usuario/research/phpstan-type-errors.md`: URLs, data de acesso e impacto da
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
specs/specs/0003-perfil-publico-usuario/spec.md
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
- **BDD/aceite**: Behave executa AC-001.
- **E2E**: não aplicável.
- **Verificação manual**: semântica e navegação após build.

#### Evidência RED-GREEN-REFACTOR

| IDs | Gherkin executável | Teste TDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 | `tests/features/directory_user_profile.feature` | `tests/Feature/Directory/UserProfileTest.php` | Behave exit 1 e Pest exit 2: rota `directory.users.show` ausente | Pest: 4/4; Behave: 2/2 | `composer ci:check`: 100/100; Behave: 11/11; build passou |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001 | AC-001 | Integração | `php artisan test --compact tests/Feature/Directory/UserProfileTest.php` | Passed: 3 testes |
| NFR-002 | AC-001 | Estático | `npm run types:check && npm run lint:check` | Passed |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-04-validate/scripts/validate_spec.py specs/specs/0003-perfil-publico-usuario/spec.md`
- **Achados**: READY; binding, privacidade, relações e 404 definidos; nenhum P1 aberto.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-05-tasks/scripts/validate_tasks.py specs/specs/0003-perfil-publico-usuario/spec.md`
- **Achados**: tarefas válidas; T001/T002 concluídas após RED Behave/Pest pela rota ausente.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-06-implement/scripts/check_traceability.py specs/specs/0003-perfil-publico-usuario/spec.md . --full-chain`
- **Achados**: rastreabilidade 4/4; QA passou; regressão, checks e build verdes.

### 14. Tarefas

- [x] T001 [TEST] [US-001] Materializar AC-001 em tests/features/directory_user_profile.feature — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: none
  - [x] **PREP**: Cenários, binding e runner confirmados.
  - [x] **EXECUTE**: Feature e steps do perfil criados.
  - [x] **VERIFY**: Behave exit 1 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Comando e causa registrados.
  - [x] **IMPROVE**: Privacidade e caso 404 foram cobertos.
- [x] T002 [TEST] [US-001] Criar integração RED em tests/Feature/Directory/UserProfileTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001
  - [x] **PREP**: Props e relações confirmadas.
  - [x] **EXECUTE**: Testes de perfil, papéis, auth e 404 criados.
  - [x] **VERIFY**: Pest exit 2 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Saída focal e IDs registrados.
  - [x] **IMPROVE**: Asserção negativa de e-mail foi incluída.
- [x] T003 [CODE] [US-001] Implementar perfil em app/Http/Controllers/Directory/UserDirectoryController.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001, T002
  - [x] **PREP**: REDs e contrato foram confirmados.
  - [x] **EXECUTE**: Action, rota, tipos e página foram criados.
  - [x] **VERIFY**: Pest focal, Behave, Pint e checks frontend passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia conferidos nos estados e viewports da tela.
  - [x] **EVIDENCE**: GREEN e arquivos foram registrados.
  - [x] **IMPROVE**: Pivot de papel foi normalizado com enum sem expor e-mail.
  <!-- specsfy:evidence {"task":"T003","refs":["US-001","FR-001","FR-002","FR-003","NFR-001","NFR-002","AC-001"],"files":["routes/web.php","app/Http/Controllers/Directory/UserDirectoryController.php","resources/js/types/directory.ts","resources/js/pages/directory/users/show.tsx"],"commands":[{"run":"php artisan test --compact tests/Feature/Directory/UserProfileTest.php","exit":0}]} -->
- [x] T004 [TEST] [US-001] Executar regressão em tests/Feature/Directory/UserProfileTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T003
  - [x] **PREP**: Suites e checks foram identificados.
  - [x] **EXECUTE**: Pest, Behave, lint, tipos, formatter, build e rastreabilidade executaram.
  - [x] **VERIFY**: 100 testes, 11 cenários e cobertura completa passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia da entrega conferidos nos estados e viewports aplicáveis.
  - [x] **EVIDENCE**: Comandos e contagens foram registrados.
  - [x] **IMPROVE**: O pivot passou a usar o model Membership nas duas direções.

### 15. Ordem de execução

- Caminho crítico: T001 → T002 → T003 → T004.
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
- [x] AC-001 passa em Behave e Pest.
- [x] Todos os FR/NFR possuem evidência.
- [x] T001 a T004 estão concluídas.
- [x] Testes e checks estáticos passam.
