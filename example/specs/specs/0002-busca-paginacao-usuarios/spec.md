# Especificação integrada: Busca e paginação de usuários

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0002 |
| Slug | 0002-busca-paginacao-usuarios |
| Status | Complete |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Atualizada em | 2026-07-25 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

Uma listagem global perde utilidade quando a quantidade de usuários cresce,
pois percorrer páginas sem busca não localiza uma pessoa com eficiência.

#### Resultado desejado

Uma pessoa autenticada filtra o diretório por parte do nome, navega entre
páginas preservando o termo e entende claramente quando não há resultados.

#### Métricas de sucesso

- Uma busca por nome retorna somente correspondências case-insensitive.
- Cada página contém no máximo 15 registros e todos os links preservam o filtro.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: qual atributo pode ser pesquisado sem ampliar PII? → somente
  `users.name`; e-mail permanece fora do contrato.
- **R-002**: qual estratégia cabe ao volume exemplar? → busca `LIKE` limitada a
  100 caracteres, ordem estável e paginação do Eloquent.

#### Fontes e contexto consultados

- `specs/backlog/0001-listagem-gestao-usuarios.md`.
- `specs/specs/0001-diretorio-global-usuarios/spec.md`.
- `app/Models/User.php` e convenções de páginas Inertia.

#### Documentação consultada

- `.specsfy/Spec.md`, `AGENTS.md` e contratos locais de Laravel/Inertia.
- PHPStan `property.notFound` e `return.type`, acesso em 2026-07-25, para
  corrigir tipos sem supressão.

#### Artefatos de pesquisa armazenados

- `specs/0002-busca-paginacao-usuarios/research/phpstan-type-errors.md`: URLs, data de acesso e impacto da
  documentação PHPStan; nenhuma reprodução de conteúdo externo.

#### Dúvidas respondidas

- **Q**: quais campos entram na busca? → **A**: apenas nome.
- **Q**: a busca diferencia maiúsculas? → **A**: não.
- **Q**: o que ocorre com espaços ou termo longo? → **A**: espaços externos são
  removidos e somente os primeiros 100 caracteres são considerados.
- **Q**: o filtro permanece ao paginar? → **A**: sim.

#### Dúvidas abertas

- Nenhuma decisão bloqueante.

### 3. Escopo e atores

#### Incluído

- Campo de busca GET por nome.
- Paginação de 15 itens com filtro persistente.
- Estado vazio específico para busca sem correspondência.

#### Fora de escopo

- Busca por e-mail, equipe, papel ou texto aproximado.
- Ordenação configurável, filtros avançados ou indexador externo.

#### Atores

- **Pessoa autenticada**: pesquisa nomes no diretório global.

### 4. Princípios e restrições do projeto

- **PR-001**: filtros são aplicados no servidor e refletidos na URL.
- **PR-002**: o frontend usa router/Wayfinder e preserva acessibilidade do form.
- **PR-003**: o limite de entrada protege a consulta sem criar erro desnecessário.

### 5. Histórias de usuário

#### US-001 — Localizar uma pessoa (P1)

Como pessoa autenticada, quero buscar pelo nome, para encontrar uma conta sem
percorrer todo o diretório.

**Por que P1**: torna o diretório utilizável com volume crescente.
**Teste independente**: `php artisan test --compact tests/Feature/Directory/UserSearchTest.php`.
**Requisitos**: FR-001, FR-002, FR-003, NFR-001, NFR-002

### 6. Cenários BDD de aceite

#### AC-001 — Buscar e preservar o filtro

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-001
Feature: Busca e paginação de usuários

  Scenario: Busca encontra nomes ignorando caixa
    Given existem usuários com nomes semelhantes e diferentes
    When uma pessoa autenticada busca parte de um nome em caixa diferente
    Then recebe somente os nomes correspondentes e o filtro normalizado

  Scenario: Busca sem correspondência
    Given nenhum usuário corresponde ao termo informado
    When uma pessoa autenticada realiza a busca
    Then recebe uma página vazia com o termo preservado
```

### 7. Requisitos

#### Funcionais

- **FR-001**: o sistema deve filtrar usuários cujo nome contenha o termo
  informado, sem diferenciar caixa.
- **FR-002**: o sistema deve remover espaços externos, limitar o termo a 100
  caracteres e devolver o valor normalizado nas props.
- **FR-003**: o sistema deve preservar o termo nos links da paginação e
  apresentar estado vazio quando não houver correspondência.

#### Não funcionais

- **NFR-001**: a consulta deve permanecer paginada em 15 itens e ordenada por nome/ID. **Verificação**: teste de integração com mais de 15 correspondências.
- **NFR-002**: o campo deve possuir label acessível e submissão GET previsível. **Verificação**: lint, typecheck e inspeção do JSX.

#### Erros e casos-limite

- Termo vazio ou somente espaços → comportamento equivalente à listagem geral.
- Termo sem correspondência → página válida com estado vazio, nunca 404.
- Termo acima de 100 caracteres → truncar de forma determinística.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- A spec 0001 introduz controller e página do diretório.

#### Arquitetura e módulos

- O mesmo `UserDirectoryController@index` normaliza `q` e compõe a query.
- A mesma página controla um formulário GET e paginação com query persistida.

#### Migrations

- Não aplicável: busca usa o campo `users.name` existente.

#### Models

- `app/Models/User.php` não muda; o filtro pertence à query HTTP.

#### Controllers e casos de uso

- `app/Http/Controllers/Directory/UserDirectoryController.php`: normalizar
  `q`, aplicar `where like`, `withQueryString` e retornar `filters.q`.

#### Views e experiência

- `resources/js/pages/directory/users/index.tsx`: label, input, botões buscar e
  limpar, feedback de ausência e links de paginação.

#### Queries e repositórios

- `where('name', 'like', "%{$query}%")`, ordenação `name`/`id`,
  `paginate(15)->withQueryString()`.

#### Jobs e processamento assíncrono

- Não aplicável.

#### Estrutura de arquivos

```text
specs/specs/0002-busca-paginacao-usuarios/spec.md
app/Http/Controllers/Directory/UserDirectoryController.php
resources/js/pages/directory/users/index.tsx
tests/Feature/Directory/UserSearchTest.php
tests/features/directory_user_search.feature
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| User | `users.id` | `name` é o único campo pesquisável | não alterada |
| UserFilter | query HTTP | `q` opcional, trim, máximo 100 | não persistido |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| UserFilter | vazio ou preenchido | submeter GET | normalizado | não grava dados |

#### Migração e retenção

- Não aplicável; filtro existe somente na requisição/URL.

### 10. Interfaces e contratos

#### APIs expostas

- `GET /directory/users?q={texto}&page={n}` na rota
  `directory.users.index`; resposta Inertia inclui `filters.q`.

#### APIs externas utilizadas

- Nenhuma.

#### Documentação das APIs consultadas

- Contratos locais de Request string, query Eloquent e paginação Inertia.

#### Eventos e outros contratos

- `filters.q` é sempre string; paginação mantém o query string normalizado.

### 11. Estratégia TDD

- **Unidade**: não aplicável; normalização e query são provadas no boundary HTTP.
- **Integração/contrato**: Pest cobre caixa, trim, limite, página e estado vazio.
- **BDD/aceite**: Behave executa AC-001 usando o teste focal.
- **E2E**: não aplicável para esta fatia.
- **Verificação manual**: inspeção do label e controles após build.

#### Evidência RED-GREEN-REFACTOR

| IDs | Gherkin executável | Teste TDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 | `tests/features/directory_user_search.feature` | `tests/Feature/Directory/UserSearchTest.php` | Behave exit 1 e Pest exit 2: rota `directory.users.index` ausente | Pest: 4/4; Behave: 2/2 | `composer ci:check`: 100/100; Behave: 11/11; build passou |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001 | AC-001 | Integração | `php artisan test --compact tests/Feature/Directory/UserSearchTest.php` | Passed: 3 testes |
| NFR-002 | AC-001 | Estático | `npm run types:check && npm run lint:check` | Passed |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-04-validate/scripts/validate_spec.py specs/specs/0002-busca-paginacao-usuarios/spec.md`
- **Achados**: READY; filtro, limite, vazio e persistência de query definidos; nenhum P1 aberto.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-05-tasks/scripts/validate_tasks.py specs/specs/0002-busca-paginacao-usuarios/spec.md`
- **Achados**: tarefas válidas; T001/T002 concluídas após RED Behave/Pest pela rota ausente.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-06-implement/scripts/check_traceability.py specs/specs/0002-busca-paginacao-usuarios/spec.md . --full-chain`
- **Achados**: rastreabilidade 4/4; QA passou; regressão, checks e build verdes.

### 14. Tarefas

- [x] T001 [TEST] [US-001] Materializar AC-001 em tests/features/directory_user_search.feature — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: none
  - [x] **PREP**: Cenários e runner Behave confirmados.
  - [x] **EXECUTE**: Feature e steps de busca criados.
  - [x] **VERIFY**: Behave exit 1 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Comando e falha registrados na seção 11.
  - [x] **IMPROVE**: Limites e estado vazio foram cobertos.
- [x] T002 [TEST] [US-001] Criar integração RED em tests/Feature/Directory/UserSearchTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001
  - [x] **PREP**: Contrato de filtro e paginação confirmado.
  - [x] **EXECUTE**: Testes de match, normalização e ausência criados.
  - [x] **VERIFY**: Pest exit 2 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Saída focal e IDs registrados.
  - [x] **IMPROVE**: Cobertura de caixa, persistência e vazio foi incluída.
- [x] T003 [CODE] [US-001] Implementar busca em app/Http/Controllers/Directory/UserDirectoryController.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001, T002
  - [x] **PREP**: RED BDD/TDD e dependências foram confirmados.
  - [x] **EXECUTE**: Filtro, props e controles React foram implementados.
  - [x] **VERIFY**: Pest focal, Behave, tipos, lint e Prettier passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia conferidos nos estados e viewports da tela.
  - [x] **EVIDENCE**: GREEN e arquivos foram registrados.
  - [x] **IMPROVE**: Normalização ficou limitada, estável e refletida na URL.
  <!-- specsfy:evidence {"task":"T003","refs":["US-001","FR-001","FR-002","FR-003","NFR-001","NFR-002","AC-001"],"files":["app/Http/Controllers/Directory/UserDirectoryController.php","resources/js/pages/directory/users/index.tsx"],"commands":[{"run":"php artisan test --compact tests/Feature/Directory/UserSearchTest.php","exit":0}]} -->
- [x] T004 [TEST] [US-001] Executar regressão em tests/Feature/Directory/UserSearchTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T003
  - [x] **PREP**: Suites e rastreabilidade foram identificadas.
  - [x] **EXECUTE**: Pest, Behave, checks frontend e build executaram.
  - [x] **VERIFY**: 100 testes, 11 cenários e todos os requisitos passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia da entrega conferidos nos estados e viewports aplicáveis.
  - [x] **EVIDENCE**: Comandos e contagens foram registrados.
  - [x] **IMPROVE**: A busca passou a preservar query e limitar entrada.

### 15. Ordem de execução

- Caminho crítico: T001 → T002 → T003 → T004.
- Tarefas paralelas: nenhuma; a fatia estende arquivos da spec 0001.
- Estratégia de MVP: busca por nome com URL compartilhável e estado vazio.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- SPEC-0001 fornece rota, controller e página base.

#### Riscos

- Busca expor PII → apenas nome é pesquisável e retornado.
- Query sem limite → paginação e termo limitado a 100 caracteres.

#### Suposições

- A collation dos bancos suportados pelo exemplo trata `LIKE` sem diferenciar
  caixa para caracteres ASCII.

### 17. Decisões

- **DEC-001**: pesquisar apenas por nome — equilibra utilidade e privacidade.
- **DEC-002**: usar GET e query string — torna a busca reproduzível e navegável.
- **DEC-003**: truncar em 100 caracteres — mantém comportamento previsível sem
  acrescentar uma página de erro para entrada reversível.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] AC-001 passa em Behave e Pest.
- [x] Todos os FR/NFR possuem evidência.
- [x] T001 a T004 estão concluídas.
- [x] Testes e checks estáticos passam.
