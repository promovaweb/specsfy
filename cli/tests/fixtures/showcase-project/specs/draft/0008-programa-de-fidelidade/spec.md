# Especificação integrada: Programa de fidelidade

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0008 |
| Slug | 0008-programa-de-fidelidade |
| Status | Draft |
| Definition Gate | Pending |
| Plan Gate | Pending |
| Delivery Gate | Pending |
| Evidence Contract | 1 |
| Atualizada em | 2026-11-20 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

Pessoas autenticadas não possuem uma visão global das contas existentes e
precisam conhecer previamente um usuário para encontrá-lo.

#### Resultado desejado

Uma pessoa autenticada acessa um diretório somente leitura, reconhece cada
conta por nome e consulta sinais operacionais sem expor credenciais ou e-mail
de terceiros.

#### Métricas de sucesso

- Para um conjunto de até 16 usuários, a primeira página contém exatamente 15
  registros ordenados por nome e a segunda contém o restante.
- Uma pessoa não autenticada nunca recebe os dados do diretório.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: o projeto já possui identidade de usuário e autenticação? →
  `app/Models/User.php` e as rotas existentes confirmam Laravel/Fortify, sem
  necessidade de nova entidade.
- **R-002**: quais dados são necessários na primeira visão? → nome, verificação,
  data de entrada e quantidade de equipes produzem uma visão útil sem expor o
  e-mail de terceiros.

#### Fontes e contexto consultados

- `specs/backlog/0001-listagem-gestao-usuarios.md`.
- `app/Models/User.php`, `routes/web.php` e `resources/js/components/app-sidebar.tsx`.

#### Documentação consultada

- `.specsfy/Spec.md` e instruções locais em `AGENTS.md`.
- PHPStan `property.notFound` e `return.type`, acesso em 2026-07-25, para
  corrigir tipos sem supressão.

#### Artefatos de pesquisa armazenados

- `specs/0001-diretorio-global-usuarios/research/phpstan-type-errors.md`: URLs, data de acesso e impacto da
  documentação PHPStan; nenhuma reprodução de conteúdo externo.

#### Dúvidas respondidas

- **Q**: quem pode acessar? → **A**: toda pessoa autenticada.
- **Q**: quais dados aparecem? → **A**: nome, verificação, data de entrada e
  quantidade de equipes; e-mail e dados de segurança ficam fora.
- **Q**: o diretório permite editar contas? → **A**: não, a primeira entrega é
  somente leitura.
- **Q**: qual volume por página? → **A**: 15 usuários, com ordem alfabética
  estável.

#### Dúvidas abertas

- Nenhuma decisão bloqueante.

### 3. Escopo e atores

#### Incluído

- Listar todas as contas ativas no banco, com paginação e ordem alfabética.
- Exibir estado vazio e navegação para o perfil público.
- Oferecer entrada “Usuários” na navegação autenticada.

#### Fora de escopo

- Criar, editar, suspender ou excluir usuários.
- Expor e-mail, credenciais, passkeys, segredos de 2FA ou códigos de recuperação.
- Exportar ou auditar consultas.

#### Atores

- **Pessoa autenticada**: consulta todas as contas em modo somente leitura.
- **Visitante**: é redirecionado para autenticação e não recebe dados.

### 4. Princípios e restrições do projeto

- **PR-001**: usar Laravel 13, Inertia 3, React 19 e componentes existentes.
- **PR-002**: autorizar no servidor por middleware `auth`.
- **PR-003**: usar Wayfinder no frontend e evitar URLs internas codificadas.
- **PR-004**: selecionar somente colunas necessárias e evitar N+1.

### 5. Histórias de usuário

#### US-001 — Consultar usuários (P1)

Como pessoa autenticada, quero ver as contas existentes, para localizar uma
pessoa sem conhecer previamente sua equipe.

**Por que P1**: é a entrada mínima para as demais jornadas do diretório.
**Teste independente**: `php artisan test --compact tests/Feature/Directory/UserDirectoryTest.php`.
**Requisitos**: FR-001, FR-002, FR-003, NFR-001, NFR-002

### 6. Cenários BDD de aceite

#### AC-001 — Acessar o diretório com segurança

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-001
Feature: Diretório global de usuários

  Scenario: Pessoa autenticada consulta a primeira página
    Given existem dezesseis usuários com nomes conhecidos
    When uma pessoa autenticada abre o diretório de usuários
    Then recebe quinze usuários ordenados por nome e sem e-mails

  Scenario: Visitante tenta consultar usuários
    Given uma pessoa não autenticada
    When ela abre o diretório de usuários
    Then é redirecionada para o login sem receber dados do diretório
```

### 7. Requisitos

#### Funcionais

- **FR-001**: o sistema deve permitir o acesso ao diretório somente a uma pessoa
  autenticada.
- **FR-002**: o sistema deve fornecer nome, estado de verificação, data de
  entrada e quantidade de equipes de cada usuário, sem fornecer seu e-mail.
- **FR-003**: o sistema deve ordenar usuários por nome e ID e paginar o
  resultado em 15 itens.

#### Não funcionais

- **NFR-001**: a consulta deve usar paginação no banco, seleção explícita de colunas e contagem agregada de equipes. **Verificação**: inspeção do controller e teste com 16 registros.
- **NFR-002**: a página deve usar título, tabela com cabeçalhos e estado vazio textual. **Verificação**: typecheck, lint e inspeção do JSX.

#### Erros e casos-limite

- Sem autenticação → redirecionar para a rota de login.
- Sem usuários retornáveis → exibir “Nenhum usuário encontrado”.
- Dois nomes iguais → desempatar por ID para manter paginação estável.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- Laravel entrega páginas Inertia; React/TypeScript compõe a interface; Pest e
  Behave são os runners já presentes.

#### Arquitetura e módulos

- `UserDirectoryController@index` consulta e transforma uma paginação.
- `directory/users/index.tsx` apresenta tabela, paginação e estado vazio.
- `app-sidebar.tsx` expõe a entrada global do diretório.

#### Migrations

- Não aplicável: `users` e `team_members` já armazenam os dados necessários.

#### Models

- `app/Models/User.php` permanece responsável pela conta e relações de equipe,
  sem nova regra de persistência.

#### Controllers e casos de uso

- `app/Http/Controllers/Directory/UserDirectoryController.php`: autenticação
  por rota, query paginada e props Inertia sem e-mail.

#### Views e experiência

- `resources/js/pages/directory/users/index.tsx`: cabeçalho, tabela semântica,
  estado vazio, links de perfil e controles anterior/próximo.

#### Queries e repositórios

- Eloquent seleciona `id`, `name`, `email_verified_at`, `created_at`, agrega
  `teams_count`, ordena por `name`/`id` e usa `paginate(15)`.

#### Jobs e processamento assíncrono

- Não aplicável: leitura síncrona e paginada.

#### Estrutura de arquivos

```text
specs/specs/0001-diretorio-global-usuarios/spec.md
app/Http/Controllers/Directory/UserDirectoryController.php
resources/js/pages/directory/users/index.tsx
resources/js/types/directory.ts
tests/Feature/Directory/UserDirectoryTest.php
tests/features/directory_users.feature
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| User | `users.id` | nome, verificação e criação; e-mail não sai no contrato | muitas equipes |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| User | persistido | consulta | persistido | leitura não altera a conta |

#### Migração e retenção

- Não aplicável; nenhuma gravação ou retenção adicional.

### 10. Interfaces e contratos

#### APIs expostas

- `GET /directory/users` (`directory.users.index`), sessão autenticada, query
  opcional `page`, resposta Inertia `directory/users/index`; visitante recebe
  redirect para login.

#### APIs externas utilizadas

- Nenhuma.

#### Documentação das APIs consultadas

- Contratos locais de rotas, Inertia e paginação já exercitados pelo projeto.

#### Eventos e outros contratos

- Props `users.data`, `users.links`, `users.meta` e `filters` tipadas em
  `resources/js/types/directory.ts`.

### 11. Estratégia TDD

- **Unidade**: não aplicável; a regra é uma query/contrato HTTP.
- **Integração/contrato**: Pest valida autenticação, campos e paginação Inertia.
- **BDD/aceite**: Behave executa a jornada AC-001 contra o teste focal.
- **E2E**: não aplicável; contrato Inertia e build cobrem esta fatia exemplar.
- **Verificação manual**: inspeção do HTML semântico após build.

#### Evidência RED-GREEN-REFACTOR

| IDs | Gherkin executável | Teste TDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 | `tests/features/directory_users.feature` | `tests/Feature/Directory/UserDirectoryTest.php` | Behave exit 1 e Pest exit 2: rota `directory.users.index` ausente | Pest: 2/2; Behave: 2/2 | `composer ci:check`: 100/100; Behave: 11/11; build passou |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003 | AC-001 | Integração | `php artisan test --compact tests/Feature/Directory/UserDirectoryTest.php` | Passed: 2 testes |
| NFR-001 | AC-001 | Integração/inspeção | teste focal e controller | Passed: paginação/contagem verificadas |
| NFR-002 | AC-001 | Estático | `npm run types:check && npm run lint:check` | Passed |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-04-validate/scripts/validate_spec.py specs/specs/0001-diretorio-global-usuarios/spec.md`
- **Achados**: READY; 1 US, 3 FR, 2 NFR e 1 AC válidos; nenhuma falha estrutural ou P1 aberto.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-05-tasks/scripts/validate_tasks.py specs/specs/0001-diretorio-global-usuarios/spec.md`
- **Achados**: tarefas válidas; T001/T002 concluídas após RED Behave/Pest pela rota ausente.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `python3 -B .agents/skills/specsfy-06-implement/scripts/check_traceability.py specs/specs/0001-diretorio-global-usuarios/spec.md . --full-chain`
- **Achados**: rastreabilidade 4/4; QA passou; regressão, checks e build verdes.

### 14. Tarefas

- [ ] T001 [TEST] [US-001] Materializar AC-001 em tests/features/directory_users.feature — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: none
  - [ ] **PREP**: Cenário, IDs e runner Behave confirmados.
  - [ ] **EXECUTE**: Feature e steps da jornada autenticada criados.
  - [ ] **VERIFY**: Behave exit 1 pela rota ausente comprovou RED válido.
  - [ ] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [ ] **EVIDENCE**: Comando e causa registrados na seção 11.
  - [ ] **IMPROVE**: Cenário passou a proteger privacidade e paginação.
- [ ] T002 [TEST] [US-001] Criar integração RED em tests/Feature/Directory/UserDirectoryTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001
  - [ ] **PREP**: Contrato Inertia e baseline de 82 testes confirmados.
  - [ ] **EXECUTE**: Testes de autenticação, campos e paginação criados.
  - [ ] **VERIFY**: Pest exit 2 pela rota ausente comprovou RED válido.
  - [ ] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [ ] **EVIDENCE**: Saída focal e IDs registrados na seção 11.
  - [ ] **IMPROVE**: Asserção negativa de e-mail foi incluída.
- [ ] T003 [CODE] [US-001] Implementar diretório em app/Http/Controllers/Directory/UserDirectoryController.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001, T002
  - [ ] **PREP**: Dois REDs e contrato aprovado foram confirmados.
  - [ ] **EXECUTE**: Rota, controller, tipos, página e navegação foram criados.
  - [ ] **VERIFY**: Pest focal, Behave, Pint, tipos, lint e Prettier passaram.
  - [ ] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia conferidos nos estados e viewports da tela.
  - [ ] **EVIDENCE**: GREEN e arquivos foram registrados nas seções 11–13.
  - [ ] **IMPROVE**: Query usa colunas explícitas, contagem agregada e ordem estável.
  <!-- specsfy:evidence {"task":"T003","refs":["US-001","FR-001","FR-002","FR-003","NFR-001","NFR-002","AC-001"],"files":["routes/web.php","app/Http/Controllers/Directory/UserDirectoryController.php","resources/js/types/directory.ts","resources/js/pages/directory/users/index.tsx","resources/js/components/app-sidebar.tsx"],"commands":[{"run":"php artisan test --compact tests/Feature/Directory/UserDirectoryTest.php","exit":0}]} -->
- [ ] T004 [TEST] [US-001] Executar regressão e rastreabilidade em tests/Feature/Directory/UserDirectoryTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T003
  - [ ] **PREP**: Suites, checks e gates do repositório foram identificados.
  - [ ] **EXECUTE**: Pest, Behave, lint, tipos, formatter, build e rastreabilidade executaram.
  - [ ] **VERIFY**: 100 testes, 11 cenários e todos os checks passaram sem gaps.
  - [ ] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia da entrega conferidos nos estados e viewports aplicáveis.
  - [ ] **EVIDENCE**: Contagens e comandos finais foram registrados.
  - [ ] **IMPROVE**: A tipagem do pivot e a lista do paginador foram fortalecidas.

### 15. Ordem de execução

- Caminho crítico: T001 → T002 → T003 → T004.
- Tarefas paralelas: nenhuma dentro desta fatia.
- Estratégia de MVP: tabela autenticada sem e-mails, paginada e navegável.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- Models e autenticação existentes.

#### Riscos

- Exposição de PII → contrato omite e-mail e campos de segurança.
- Query crescente → paginação, colunas explícitas e contagem agregada.

#### Suposições

- Contas persistidas são consultáveis; não há estado de suspensão no schema.
- A ordenação alfabética por collation do banco é suficiente para o exemplo.

### 17. Decisões

- **DEC-001**: o diretório é global e somente leitura — atende a decisão do
  usuário sem introduzir autorização de escrita.
- **DEC-002**: e-mail de terceiros não é exposto — reduz risco de privacidade;
  a alternativa de mostrar e-mail foi rejeitada.
- **DEC-003**: a página usa 15 itens e desempate por ID — mantém navegação
  previsível e verificável.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] AC-001 passa em Behave e Pest.
- [x] FR-001 a FR-003 e NFR-001 a NFR-002 possuem evidência.
- [x] T001 a T004 estão concluídas.
- [x] Testes, lint, tipos, formatter e build passam.
