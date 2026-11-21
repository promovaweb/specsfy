# Especificação integrada: Diretório global de usuários

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0001 |
| Slug | 0001-diretorio-global-usuarios |
| Status | Complete |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Especialistas | specsfy-specialist-application-security, specsfy-specialist-architecture, specsfy-specialist-interface, specsfy-specialist-laravel, specsfy-specialist-react, specsfy-specialist-testing, specsfy-specialist-typescript |
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

- `specs/completed/0001-diretorio-global-usuarios/research/phpstan-type-errors.md`: URLs, data de acesso e impacto da
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

#### AC-002 — Verificar os campos públicos da conta

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-002
Feature: Verificar os campos públicos da conta

  Scenario: Verificar os campos públicos da conta
    Given uma conta sem verificação aparece na primeira página do diretório
    When a pessoa autenticada abre a listagem
    Then recebe o nome, o estado não verificado, a data e a contagem de equipes da conta sem receber seu e-mail
```

#### AC-003 — Consultar a página seguinte

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-003
Feature: Consultar a página seguinte

  Scenario: Consultar a página seguinte
    Given o diretório contém dezesseis usuários
    When a pessoa autenticada abre a segunda página
    Then recebe o usuário restante, sem e-mail, na mesma tabela
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

#### Especialistas

| Especialista | Modo | Sinal que o puxou | Fases |
| --- | --- | --- | --- |
| specsfy-specialist-application-security | padrão | Sessão e dados expostos nas props Inertia | validate |
| specsfy-specialist-architecture | web-api | Rotas HTTP e contrato Inertia | validate |
| specsfy-specialist-interface | accessibility | Semântica, mensagens textuais e navegação | validate |
| specsfy-specialist-interface | ui | Composição, estados e ações das telas | validate |
| specsfy-specialist-interface | ux | Diretório de usuários | validate |
| specsfy-specialist-laravel | app | Rotas, controllers, Eloquent e props Inertia | validate |
| specsfy-specialist-react | padrão | Páginas e navegação Inertia em React | validate |
| specsfy-specialist-testing | pest | Testes HTTP focais e marcadores por critério | validate |
| specsfy-specialist-typescript | padrão | Tipos das props da página | validate |

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
specs/completed/0001-diretorio-global-usuarios/spec.md
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

#### Interface para pessoas

Listagem paginada com dados públicos de cada conta.

#### Stack e convenções de interface

Laravel e Inertia entregam props tipadas em TypeScript. A página React usa o layout autenticado, Wayfinder e os estilos Tailwind existentes.

#### Telas e responsabilidades

- Diretório de usuários em `resources/js/pages/directory/users/index.tsx`.

#### Fluxo de informação e navegação

A listagem carrega a primeira página. Os controles anterior e próximo mantêm a navegação no diretório e o nome de cada usuário abre o perfil correspondente.

#### Menus e navegação principal

O rótulo Users no menu lateral autenticado tem como destino a rota `directory.users.index`. Cada nome abre `directory.users.show`.

#### Formulários e ações

Ações anterior e próxima operam a paginação. A listagem é somente leitura.

#### Composição e disposição

O título precede a tabela com rolagem horizontal quando necessário. A paginação fica abaixo da tabela.

#### Blocos React e componentes selecionados

`AppLayout`, `Head`, tabela HTML, `Button` e `Link`.

#### Estados e acessibilidade

O estado vazio tem mensagem textual. Os cabeçalhos identificam as colunas e a paginação tem nome acessível.

#### Revisão visual durante o desenvolvimento

Conferir bordas, espaçamentos, margens, padding e tipografia na página e nos estados aplicáveis em telas estreitas e largas.

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
- **BDD/aceite**: os três critérios da seção 6 são rastreados na suíte Pest focal. O arquivo `.feature` preserva a jornada histórica e é exercitado pelo adaptador Node do exemplo.
- **E2E**: não aplicável; contrato Inertia e build cobrem esta fatia exemplar.
- **Verificação manual**: inspeção do HTML semântico após build.

#### Evidência RED-GREEN-REFACTOR

| IDs | Gherkin executável | Teste TDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 | `tests/features/directory_users.feature` | `tests/Feature/Directory/UserDirectoryTest.php` | Behave exit 1 e Pest exit 2: rota `directory.users.index` ausente | Pest: 2/2; Behave: 2/2 | `composer ci:check`: 100/100; Behave: 11/11; build passou |

A tabela acima preserva o RED histórico de AC-001. A decomposição posterior
registrou AC-002 e AC-003 sobre o comportamento entregue. A seção 12 registra
a execução focal atual e a inspeção complementar do JSX para NFR-002.

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003 | AC-001 | Integração | `php artisan test --compact tests/Feature/Directory/UserDirectoryTest.php` | Passed: suíte focal |
| NFR-001 | AC-001 | Integração/inspeção | teste focal e controller | Passed: paginação/contagem verificadas |
| NFR-002 | AC-001 | Estático | `npm run types:check && npm run lint:check` | Passed |
| US-001, FR-001, FR-002, FR-003, NFR-001 | AC-002 | Integração | `php artisan test --compact tests/Feature/Directory/UserDirectoryTest.php` | Passed: suíte focal |
| US-001, FR-001, FR-002, FR-003, NFR-001 | AC-003 | Integração | `php artisan test --compact tests/Feature/Directory/UserDirectoryTest.php` | Passed: suíte focal |
| NFR-002 | AC-002, AC-003 | Estático | JSX da página; `npm run types:check && npm run lint:check` | Passed |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `specsfy gate spec 0001 --project .`
- **Achados**: READY; a revisão do contrato cobre três critérios de aceite.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `specsfy gate tasks 0001 --project .`
- **Achados**: tarefas válidas; T001/T002 concluídas após RED Behave/Pest pela rota ausente.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `specsfy gate trace 0001 --project . --full-chain`
- **Achados**: rastreabilidade 9/9 na suíte Pest focal e matriz de aceite completa.

### 14. Tarefas

- [x] T001 [TEST] [US-001] Materializar AC-001 em tests/features/directory_users.feature — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: none
  - [x] **PREP**: Cenário, IDs e runner Behave confirmados.
  - [x] **EXECUTE**: Feature e steps da jornada autenticada criados.
  - [x] **VERIFY**: Behave exit 1 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Comando e causa registrados na seção 11.
  - [x] **IMPROVE**: Cenário passou a proteger privacidade e paginação.
- [x] T002 [TEST] [TDD] [US-001] Criar integração RED em tests/Feature/Directory/UserDirectoryTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T001
  - [x] **PREP**: Contrato Inertia e baseline de 82 testes confirmados.
  - [x] **EXECUTE**: Testes de autenticação, campos e paginação criados.
  - [x] **VERIFY**: Pest exit 2 pela rota ausente comprovou RED válido.
  - [x] **VISUAL**: Não aplicável; a tarefa materializa somente o caso de teste.
  - [x] **EVIDENCE**: Saída focal e IDs registrados na seção 11.
  - [x] **IMPROVE**: Asserção negativa de e-mail foi incluída.
- [x] T005 [TEST] [TDD] [US-001] Verificar os campos públicos da conta em tests/Feature/Directory/UserDirectoryTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-002 — Depends: none
  - [x] **PREP**: Critério da seção 6 e contrato Inertia conferidos.
  - [x] **EXECUTE**: Caso Pest rastreado com marcador próprio.
  - [x] **VERIFY**: Comando focal da seção 12 executado.
  - [x] **VISUAL**: Não aplicável ao caso HTTP. A seção 12 registra a verificação do JSX.
  - [x] **EVIDENCE**: Resultado da suíte focal na seção 12.
  - [x] **IMPROVE**: A suíte focal mantém um marcador próprio para este critério.
- [x] T006 [TEST] [TDD] [US-001] Consultar a página seguinte em tests/Feature/Directory/UserDirectoryTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-003 — Depends: none
  - [x] **PREP**: Critério da seção 6 e contrato Inertia conferidos.
  - [x] **EXECUTE**: Caso Pest rastreado com marcador próprio.
  - [x] **VERIFY**: Comando focal da seção 12 executado.
  - [x] **VISUAL**: Não aplicável ao caso HTTP. A seção 12 registra a verificação do JSX.
  - [x] **EVIDENCE**: Resultado da suíte focal na seção 12.
  - [x] **IMPROVE**: A suíte focal mantém um marcador próprio para este critério.

#### Fase de interface

- [x] T003 [CODE] [US-001] Implementar diretório em app/Http/Controllers/Directory/UserDirectoryController.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001, AC-002, AC-003 — Depends: T001, T002, T005, T006 — Inventário: INTERFACE.md
  - [x] **PREP**: Dois REDs e contrato aprovado foram confirmados.
  - [x] **EXECUTE**: Rota, controller, tipos, página e navegação foram criados.
  - [x] **VERIFY**: Pest focal, Behave, Pint, tipos, lint e Prettier passaram.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia conferidos nos estados e viewports da tela.
  - [x] **EVIDENCE**: GREEN e arquivos foram registrados nas seções 11–13.
  - [x] **IMPROVE**: Query usa colunas explícitas, contagem agregada e ordem estável.
  <!-- specsfy:evidence {"task":"T003","refs":["US-001","FR-001","FR-002","FR-003","NFR-001","NFR-002","AC-001","AC-002","AC-003"],"files":["routes/web.php","app/Http/Controllers/Directory/UserDirectoryController.php","resources/js/types/directory.ts","resources/js/pages/directory/users/index.tsx","resources/js/components/app-sidebar.tsx"],"commands":[{"run":"php artisan test --compact tests/Feature/Directory/UserDirectoryTest.php","exit":0}]} -->
- [x] T004 [TEST] [US-001] Executar regressão e rastreabilidade em tests/Feature/Directory/UserDirectoryTest.php — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-001 — Depends: T003
  - [x] **PREP**: Suites, checks e gates do repositório foram identificados.
  - [x] **EXECUTE**: Pest, Behave, lint, tipos, formatter, build e rastreabilidade executaram.
  - [x] **VERIFY**: 100 testes, 11 cenários e todos os checks passaram sem gaps.
  - [x] **VISUAL**: Bordas, espaçamentos, margens, padding e tipografia da entrega conferidos nos estados e viewports aplicáveis.
  - [x] **EVIDENCE**: Contagens e comandos finais foram registrados.
  - [x] **IMPROVE**: A tipagem do pivot e a lista do paginador foram fortalecidas.

### 15. Ordem de execução

- Caminho crítico: T001 precede T002. T002, T005 e T006 precedem T003 no grafo de cobertura. T004 depende de T003.
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
- [x] AC-001 a AC-003 passam na suíte Pest focal. O histórico de aceite de AC-001 está na seção 11.
- [x] FR-001 a FR-003 e NFR-001 a NFR-002 possuem evidência.
- [x] T001 a T006 estão concluídas.
- [x] Testes, lint, tipos, formatter e build passam.
