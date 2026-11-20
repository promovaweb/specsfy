# Especificação integrada: Diretório global de equipes

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0004 |
| Slug | 0004-diretorio-global-equipes |
| Status | Complete |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Atualizada em | 2026-07-25 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

As telas atuais mostram apenas equipes ligadas à pessoa autenticada, impedindo
uma visão global da estrutura existente.

#### Resultado desejado

Uma pessoa autenticada consulta todas as equipes em um diretório somente
leitura, distingue equipes pessoais de compartilhadas e conhece seu tamanho.

#### Métricas de sucesso

- Para 16 equipes, a primeira página contém 15 itens e a segunda contém um.
- Cada equipe apresenta nome, tipo e contagem correta de membros.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: equipes pessoais fazem parte do domínio? → `teams.is_personal`
  confirma que são equipes reais e devem aparecer identificadas.
- **R-002**: como obter tamanho sem N+1? → `withCount('members')`.

#### Fontes e contexto consultados

- `specs/backlog/0002-consulta-equipes-usuarios.md`.
- `app/Models/Team.php`, migrations e testes existentes de equipes.
- `resources/js/pages/teams/index.tsx`.

#### Documentação consultada

- `.specsfy/Spec.md`, `AGENTS.md` e contratos locais do projeto.
- PHPStan `property.notFound` e `return.type`, acesso em 2026-07-25, para
  corrigir tipos sem supressão.

#### Artefatos de pesquisa armazenados

- `specs/0004-diretorio-global-equipes/research/phpstan-type-errors.md`: URLs, data de acesso e impacto da
  documentação PHPStan; nenhuma reprodução de conteúdo externo.

#### Dúvidas respondidas

- **Q**: quais equipes aparecem? → **A**: todas, inclusive pessoais.
- **Q**: quais dados resumem uma equipe? → **A**: nome, tipo, criação e contagem
  de membros.
- **Q**: quem pode consultar? → **A**: toda pessoa autenticada.
- **Q**: haverá busca agora? → **A**: não; ordem alfabética e paginação formam o
  exemplo mínimo.

#### Dúvidas abertas

- Nenhuma decisão bloqueante.

### 3. Escopo e atores

#### Incluído

- Diretório paginado de todas as equipes não excluídas.
- Tipo pessoal/compartilhado, data e contagem de membros.
- Entrada “Equipes” na navegação global e links de detalhe.

#### Fora de escopo

- Criar, editar, excluir, trocar ou convidar membros a partir do diretório.
- Incluir equipes soft-deleted.
- Busca e filtros avançados.

#### Atores

- **Pessoa autenticada**: consulta a estrutura global em modo somente leitura.

### 4. Princípios e restrições do projeto

- **PR-001**: soft-deletes do model continuam respeitados.
- **PR-002**: contagem é agregada no banco.
- **PR-003**: ações de gestão existentes continuam restritas às telas próprias.

### 5. Histórias de usuário

#### US-001 — Consultar equipes (P1)

Como pessoa autenticada, quero ver todas as equipes, para compreender a
estrutura do sistema e abrir seus detalhes.

**Por que P1**: é a entrada mínima para a consulta global de membros e papéis.
**Teste independente**: `php artisan test --compact tests/Feature/Directory/TeamDirectoryTest.php`.
**Requisitos**: FR-001, FR-002, FR-003, NFR-001, NFR-002

### 6. Cenários BDD de aceite

#### AC-001 — Listar equipes globais

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-001
Feature: Diretório global de equipes

  Scenario: Pessoa autenticada consulta equipes pessoais e compartilhadas
    Given existem equipes pessoais e compartilhadas com membros
    When uma pessoa autenticada abre o diretório de equipes
    Then vê todas as equipes ordenadas com tipo e contagem de membros

  Scenario: Diretório sem equipes
    Given não existe equipe persistida
    When uma pessoa autenticada abre o diretório de equipes
    Then vê um estado vazio sem erro
```

### 7. Requisitos

#### Funcionais

- **FR-001**: o sistema deve exigir autenticação para listar equipes.
- **FR-002**: o sistema deve listar todas as equipes não excluídas com nome,
  slug, tipo, data de criação e contagem de membros.
- **FR-003**: o sistema deve ordenar por nome/ID, paginar em 15 itens e oferecer
  link para o detalhe.

#### Não funcionais

- **NFR-001**: a contagem deve ser agregada com `withCount` e a consulta deve selecionar colunas explícitas. **Verificação**: inspeção e teste focal.
- **NFR-002**: a página deve conter tabela com cabeçalhos e estado vazio textual. **Verificação**: typecheck, lint e inspeção JSX.

#### Erros e casos-limite

- Visitante → redirect para login.
- Nenhuma equipe → estado “Nenhuma equipe encontrada”.
- Nomes iguais → desempate por ID.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- `Team` usa soft delete, slug de rota e relações de membros.

#### Arquitetura e módulos

- `TeamDirectoryController@index` fornece a paginação segura.
- `directory/teams/index.tsx` exibe tabela e links.
- Sidebar recebe uma entrada global independente da equipe atual.

#### Migrations

- Não aplicável.

#### Models

- `app/Models/Team.php` permanece sem mudanças.

#### Controllers e casos de uso

- `app/Http/Controllers/Directory/TeamDirectoryController.php`: query
  paginada, `withCount('members')` e props Inertia.

#### Views e experiência

- `resources/js/pages/directory/teams/index.tsx`: título, explicação, tabela,
  badges de tipo, contagem, paginação e estado vazio.

#### Queries e repositórios

- Eloquent seleciona `id`, `name`, `slug`, `is_personal`, `created_at`, agrega
  membros e pagina 15.

#### Jobs e processamento assíncrono

- Não aplicável.

#### Estrutura de arquivos

```text
specs/specs/0004-diretorio-global-equipes/spec.md
app/Http/Controllers/Directory/TeamDirectoryController.php
resources/js/pages/directory/teams/index.tsx
tests/Feature/Directory/TeamDirectoryTest.php
tests/features/directory_teams.feature
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| Team | `teams.id`, slug público | nome, tipo, criação, soft delete | muitos membros |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| Team | ativa | consulta | ativa | soft-deleted não aparece |

#### Migração e retenção

- Não aplicável.

### 10. Interfaces e contratos

#### APIs expostas

- `GET /directory/teams` (`directory.teams.index`), sessão autenticada, query
  opcional `page`, resposta Inertia `directory/teams/index`.

#### APIs externas utilizadas

- Nenhuma.

#### Documentação das APIs consultadas

- Contratos locais de Team, soft delete e paginação.

#### Eventos e outros contratos

- Props `teams.data`, `teams.links`, `teams.meta` tipadas em
  `resources/js/types/directory.ts`.

### 11. Estratégia TDD

- **Unidade**: não aplicável.
- **Integração/contrato**: Pest cobre autenticação, tipos, contagem e paginação.
- **BDD/aceite**: Behave executa AC-001.
- **E2E**: não aplicável.
- **Verificação manual**: tabela e badges após build.

#### Evidência RED-GREEN-REFACTOR

| IDs | Gherkin executável | Teste TDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 | `tests/features/directory_teams.feature` | `tests/Feature/Directory/TeamDirectoryTest.php` | Behave exit 1 e Pest exit 2: rota `directory.teams.index` ausente | Pest: 4/4; Behave: 2/2 | `composer ci:check`: 100/100; Behave: 11/11; build passou |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001 | AC-001 | Integração | `php artisan test --compact tests/Feature/Directory/TeamDirectoryTest.php` | Passed: 3 testes |
| NFR-002 | AC-001 | Estático | `npm run types:check && npm run lint:check` | Passed |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-04-validate/scripts/validate_spec.py specs/specs/0004-diretorio-global-equipes/spec.md`
- **Achados**: READY; tipos, soft delete, contagem e paginação definidos; nenhum P1 aberto.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-05-tasks/scripts/validate_tasks.py specs/specs/0004-diretorio-global-equipes/spec.md`
- **Achados**: tarefas válidas; T001/T002 concluídas após RED Behave/Pest pela rota ausente.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-06-implement/scripts/check_traceability.py specs/specs/0004-diretorio-global-equipes/spec.md . --full-chain`
- **Achados**: rastreabilidade 4/4; QA passou; regressão, checks e build verdes.

### 14. Tarefas

- [x] T001 [TEST] [US-001] Materializar AC-001 em tests/features/directory_teams.feature — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: none
  - [x] **PREP**: Cenários e runner confirmados.
  - [x] **EXECUTE**: Feature e steps do diretório criados.
  - [x] **VERIFY**: Behave exit 1 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Comando e causa registrados.
  - [x] **IMPROVE**: Tipo, contagem e vazio foram cobertos.
- [x] T002 [TEST] [US-001] Criar integração RED em tests/Feature/Directory/TeamDirectoryTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001
  - [x] **PREP**: Query e props confirmadas.
  - [x] **EXECUTE**: Testes de auth, listagem, contagem e paginação criados.
  - [x] **VERIFY**: Pest exit 2 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Saída focal e IDs registrados.
  - [x] **IMPROVE**: Cobertura de equipe pessoal e soft delete foi incluída.
- [x] T003 [CODE] [US-001] Implementar diretório em app/Http/Controllers/Directory/TeamDirectoryController.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001, T002
  - [x] **PREP**: REDs e contrato foram confirmados.
  - [x] **EXECUTE**: Rota, controller, tipos, página e navegação foram criados.
  - [x] **VERIFY**: Pest focal, Behave, Pint e checks frontend passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia conferidos nos estados e viewports da tela.
  - [x] **EVIDENCE**: GREEN e arquivos foram registrados.
  - [x] **IMPROVE**: Query passou a usar `withCount`, whitelist e ordem estável.
  <!-- specsfy:evidence {"task":"T003","refs":["US-001","FR-001","FR-002","FR-003","NFR-001","NFR-002","AC-001"],"files":["routes/web.php","app/Http/Controllers/Directory/TeamDirectoryController.php","resources/js/types/directory.ts","resources/js/pages/directory/teams/index.tsx","resources/js/components/app-sidebar.tsx"],"commands":[{"run":"php artisan test --compact tests/Feature/Directory/TeamDirectoryTest.php","exit":0}]} -->
- [x] T004 [TEST] [US-001] Executar regressão em tests/Feature/Directory/TeamDirectoryTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T003
  - [x] **PREP**: Suites e checks foram identificados.
  - [x] **EXECUTE**: Pest, Behave, lint, tipos, formatter, build e rastreabilidade executaram.
  - [x] **VERIFY**: 100 testes, 11 cenários e cobertura completa passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia da entrega conferidos nos estados e viewports aplicáveis.
  - [x] **EVIDENCE**: Comandos e contagens foram registrados.
  - [x] **IMPROVE**: A paginação expõe uma lista tipada e estável.

### 15. Ordem de execução

- Caminho crítico: T001 → T002 → T003 → T004.
- Tarefas paralelas: pode avançar após a fundação de tipos compartilhados.
- Estratégia de MVP: tabela global com tipo, tamanho e link.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- Models de equipes e membros existentes.

#### Riscos

- Confundir diretório com gestão → nenhuma ação mutável é apresentada.
- N+1 na contagem → `withCount`.

#### Suposições

- Equipes soft-deleted não fazem parte do diretório ativo.

### 17. Decisões

- **DEC-001**: incluir equipes pessoais com badge — preserva uma visão completa
  sem confundir o tipo.
- **DEC-002**: não adicionar busca nesta fatia — mantém entrega independente e
  deixa evolução observável.
- **DEC-003**: contar membros no banco — evita consultas por linha.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] AC-001 passa em Behave e Pest.
- [x] Todos os FR/NFR possuem evidência.
- [x] T001 a T004 estão concluídas.
- [x] Testes e checks estáticos passam.
