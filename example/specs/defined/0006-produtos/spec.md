# Especificação integrada: Cadastro e gestão de produtos por equipe

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0006 |
| Slug | 0006-produtos |
| Status | Defined |
| Definition Gate | Passed |
| Plan Gate | Pending |
| Delivery Gate | Pending |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Especialistas | specsfy-specialist-application-security, specsfy-specialist-architecture, specsfy-specialist-interface, specsfy-specialist-laravel, specsfy-specialist-modeling, specsfy-specialist-react, specsfy-specialist-tailwind-css, specsfy-specialist-testing, specsfy-specialist-typescript, specsfy-specialist-ui-components |
| Atualizada em | 2026-11-20 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

Os membros de uma equipe não possuem uma superfície para manter seu próprio
catálogo de produtos. Sem esse isolamento, o cadastro pode misturar produtos de
equipes diferentes ou expor dados fora do contexto selecionado.

#### Resultado desejado

Qualquer membro autenticado consulta, pesquisa, cadastra, edita e exclui
produtos da equipe ativa, sem visualizar nem alterar produtos de outra equipe.

#### Métricas de sucesso

- 100% das consultas e mutações de produto permanecem restritas à equipe da
  rota.
- 100% dos cenários de cadastro, edição, busca, exclusão e isolamento definidos
  nesta spec passam.
- Nenhum produto de outra equipe aparece nas props Inertia ou pode ser alterado
  por identificação direta.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: como o contexto de equipe é resolvido? → `routes/web.php` usa o
  prefixo `{current_team}` e `EnsureTeamMembership` verifica associação e
  sincroniza a equipe ativa.
- **R-002**: qual identificador de equipe integra a URL? → `Team` usa `slug`
  como route key.
- **R-003**: quais padrões de interface e testes já existem? → páginas Inertia
  React usam Wayfinder, componentes locais, paginação com 15 itens e testes Pest
  de props Inertia.
- **R-004**: como provar a confirmação destrutiva sem adicionar dependência de
  frontend? → o endpoint de exclusão também exige `confirmed=true`, permitindo
  testar por Pest que requisições sem confirmação não removem o produto.

#### Fontes e contexto consultados

- Brief do refinamento do backlog realizado nesta conversa em 2026-07-25.
- `AGENTS.md`, `.specsfy/Spec.md` e `.specsfy/templates/Spec.md`.
- `routes/web.php`, `app/Http/Middleware/EnsureTeamMembership.php`,
  `app/Models/Team.php` e `app/Models/User.php`.
- `app/Http/Controllers/Directory/TeamDirectoryController.php`,
  `app/Http/Controllers/Teams/TeamController.php` e testes relacionados.
- `resources/js/pages/directory/teams/index.tsx` e
  `resources/js/pages/teams/edit.tsx`.
- `package.json`, que não configura runner de componentes ou navegador.

#### Documentação consultada

- Contratos locais Specsfy/2.0 e instruções Laravel Boost fornecidas pelo
  projeto.
- Nenhuma documentação externa foi consultada.

#### Artefatos de pesquisa armazenados

- Nenhum artefato externo; somente código e contratos locais foram consultados.

#### Dúvidas respondidas

- **Q**: quem pode executar o CRUD? → **A**: qualquer membro da equipe.
- **Q**: em qual escopo o SKU é único? → **A**: dentro de cada equipe.
- **Q**: quais campos são obrigatórios? → **A**: nome e SKU; descrição é
  opcional.
- **Q**: como funciona a exclusão? → **A**: é permanente e precedida de
  confirmação.
- **Q**: a unicidade do SKU diferencia caixa ou espaços externos? → **A**: não.
- **Q**: a primeira entrega precisa de busca? → **A**: sim, por nome ou SKU.

#### Dúvidas abertas

- Nenhuma decisão bloqueante.

### 3. Escopo e atores

#### Incluído

- Listagem paginada dos produtos da equipe ativa.
- Busca por parte do nome ou do SKU.
- Cadastro e edição de nome, SKU e descrição.
- Exclusão permanente mediante confirmação na interface.
- Validação de campos e unicidade do SKU por equipe.
- Estados vazio, sem resultados, carregamento, erro e sucesso.
- Isolamento e autorização de todas as operações no servidor.

#### Fora de escopo

- Preço, estoque, imagens, categorias, variações e estado comercial.
- Importação, exportação e operações em lote.
- Arquivamento, lixeira, restauração e histórico de alterações.
- Página exclusiva de detalhes; a listagem representa a leitura do CRUD.
- API pública, integrações externas e notificações.

#### Atores

- **Membro da equipe ativa**: lista, pesquisa, cria, edita e exclui produtos
  pertencentes à equipe da rota.
- **Pessoa autenticada sem associação à equipe da rota**: não acessa a
  superfície nem seus dados.

### 4. Princípios e restrições do projeto

- **PR-001**: preservar o prefixo `{current_team}` e
  `EnsureTeamMembership` para o contexto autenticado.
- **PR-002**: aplicar escopo por equipe e autorização no servidor em todas as
  leituras e mutações.
- **PR-003**: usar Laravel 13, Inertia v3, React 19, Wayfinder, Tailwind CSS 4 e
  componentes locais, sem adicionar dependências.
- **PR-004**: usar Form Requests, Policy, Eloquent, factory e testes Pest
  conforme as convenções existentes.
- **PR-005**: apresentar erros junto aos campos e manter controles utilizáveis
  por teclado e tecnologias assistivas.

### 5. Histórias de usuário

#### US-001 — Consultar e pesquisar o catálogo (P1)

Como membro da equipe ativa, quero listar e pesquisar seus produtos, para
localizar itens do catálogo sem misturar dados de outras equipes.

**Por que P1**: torna o catálogo consultável e comprova seu isolamento.
**Teste independente**: acessar a listagem com produtos em duas equipes e
pesquisar por nome e SKU.
**Requisitos**: FR-001, FR-002, FR-003, FR-008, NFR-001, NFR-002

#### US-002 — Cadastrar e editar produtos (P1)

Como membro da equipe ativa, quero cadastrar e editar nome, SKU e descrição,
para manter os dados do catálogo corretos.

**Por que P1**: entrega as mutações centrais do cadastro.
**Teste independente**: criar e editar um produto, incluindo validações e
conflitos de SKU.
**Requisitos**: FR-001, FR-004, FR-005, FR-006, FR-008, FR-009, NFR-001,
NFR-002

#### US-003 — Excluir um produto (P1)

Como membro da equipe ativa, quero confirmar a exclusão de um produto, para
removê-lo definitivamente sem acionamento acidental.

**Por que P1**: completa o ciclo de vida declarado para o CRUD.
**Teste independente**: rejeitar uma exclusão sem confirmação, cancelar o
diálogo e depois excluir o mesmo produto com confirmação explícita.
**Requisitos**: FR-001, FR-007, FR-008, NFR-001, NFR-002

### 6. Cenários BDD de aceite

#### AC-001 — Listar o catálogo da equipe

**Cobre**: US-001, FR-001, FR-002, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @NFR-001 @NFR-002 @AC-001
Feature: Catálogo de produtos da equipe

  Scenario: Membro consulta somente os produtos da equipe ativa
    Given existem produtos na equipe ativa e em outra equipe
    When o membro abre a listagem de produtos da equipe ativa
    Then vê somente os produtos da equipe ativa em ordem estável e paginada

  Scenario: Equipe ainda não possui produtos
    Given a equipe ativa não possui produtos
    When o membro abre a listagem de produtos
    Then vê um estado vazio com ação para cadastrar o primeiro produto
```

#### AC-002 — Pesquisar por nome ou SKU

**Cobre**: US-001, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-003 @NFR-001 @NFR-002 @AC-002
Feature: Busca no catálogo da equipe

  Scenario Outline: Busca parcial sem diferenciar caixa
    Given a equipe ativa possui produtos com nomes e SKUs diferentes
    When o membro pesquisa por uma parte do <campo> sem respeitar a caixa
    Then vê somente os produtos correspondentes da equipe ativa

    Examples:
      | campo |
      | nome  |
      | SKU   |

  Scenario: Busca não encontra produto
    Given nenhum produto da equipe ativa corresponde ao termo informado
    When o membro executa a busca
    Then vê um estado explícito de nenhum resultado e pode limpar a busca
```

#### AC-003 — Cadastrar produto válido

**Cobre**: US-002, FR-004, FR-005, FR-009, NFR-001, NFR-002

```gherkin
@US-002 @FR-004 @FR-005 @FR-009 @NFR-001 @NFR-002 @AC-003
Feature: Cadastro de produto

  Scenario: Membro cadastra produto com descrição opcional
    Given o SKU ainda não existe na equipe ativa
    When o membro informa nome e SKU válidos sem descrição
    Then o produto é criado na equipe ativa e o sucesso é apresentado

  Scenario: Campos obrigatórios não são informados
    Given o membro abriu o cadastro de produto
    When tenta salvar sem nome ou sem SKU
    Then o produto não é criado e os erros aparecem nos respectivos campos

  Scenario: SKU equivalente já existe na equipe
    Given a equipe possui um produto com SKU "ABC-123"
    When o membro tenta cadastrar o SKU " abc-123 "
    Then o produto não é criado e o campo SKU informa o conflito

  Scenario: Outra equipe utiliza o mesmo SKU
    Given outra equipe possui um produto com SKU "ABC-123"
    When o membro cadastra "ABC-123" na equipe ativa
    Then o novo produto é aceito e permanece associado à equipe ativa
```

#### AC-004 — Editar produto

**Cobre**: US-002, FR-005, FR-006, FR-009, NFR-001, NFR-002

```gherkin
@US-002 @FR-005 @FR-006 @FR-009 @NFR-001 @NFR-002 @AC-004
Feature: Edição de produto

  Scenario: Membro altera dados com valores válidos
    Given existe um produto na equipe ativa
    When o membro altera nome SKU e descrição com valores válidos
    Then os dados normalizados são persistidos e o sucesso é apresentado

  Scenario: Edição conflita com outro SKU da equipe
    Given a equipe ativa possui dois produtos com SKUs distintos
    When o membro atribui ao primeiro um SKU equivalente ao do segundo
    Then a alteração é rejeitada e o erro aparece no campo SKU
```

#### AC-005 — Exigir confirmação no servidor

**Cobre**: US-003, FR-007, NFR-001, NFR-002

```gherkin
@US-003 @FR-007 @NFR-001 @NFR-002 @AC-005
Feature: Exclusão permanente de produto

  Scenario: Membro confirma a exclusão
    Given existe um produto na equipe ativa e a confirmação está aberta
    When o membro confirma a exclusão
    Then a interface envia confirmed igual a true
    And o produto é removido permanentemente e o sucesso é apresentado
```

#### AC-006 — Bloquear acesso entre equipes

**Cobre**: US-001, US-002, US-003, FR-001, FR-008, NFR-001

```gherkin
@US-001 @US-002 @US-003 @FR-001 @FR-008 @NFR-001 @AC-006
Feature: Isolamento de produtos por equipe

  Scenario: Rejeitar atualização de produto de outra equipe
    Given o identificador pertence a um produto de outra equipe
    When o membro tenta salvar esse produto pela rota da equipe ativa
    Then a aplicação responde como recurso não encontrado e não altera dados

  Scenario: Pessoa não pertence à equipe da rota
    Given uma pessoa autenticada não pertence à equipe solicitada
    When tenta abrir a listagem de produtos dessa equipe
    Then o acesso é recusado sem expor produtos
```

#### AC-007 — Paginar resultados da própria equipe

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @AC-007
Feature: Paginar resultados da própria equipe

  Scenario: Paginar uma busca com mais de quinze resultados
    Given há mais de quinze produtos correspondentes na equipe ativa e em outra equipe
    When um membro autenticado navega para a página seguinte
    Then o termo é preservado e os resultados da própria equipe continuam ordenados por nome e ID
```

#### AC-008 — Limpar o filtro do catálogo

**Cobre**: US-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-008
Feature: Limpar o filtro do catálogo

  Scenario: Limpar uma busca sem correspondência
    Given a busca da equipe ativa não retornou produtos
    When o membro aciona a opção de limpar
    Then a listagem paginada volta a mostrar os produtos da equipe ativa na ordem padrão
```

#### AC-009 — Manter dados do formulário ao corrigir campos

**Cobre**: US-002, FR-004, FR-006, FR-009, NFR-002

```gherkin
@US-002 @FR-004 @FR-006 @FR-009 @NFR-002 @AC-009
Feature: Manter dados do formulário ao corrigir campos

  Scenario: Corrigir o SKU no cadastro
    Given o membro preencheu nome e descrição e informou apenas espaços no SKU
    When envia o cadastro
    Then o erro identifica o SKU e os demais valores permanecem no formulário

  Scenario: Corrigir a descrição na edição
    Given o membro alterou o nome e informou uma descrição acima de dois mil caracteres
    When envia a edição
    Then o erro identifica a descrição, os valores informados permanecem disponíveis e a gravação não ocorre
```

#### AC-010 — Validar SKU por equipe e preservar o SKU do próprio produto

**Cobre**: US-002, FR-004, FR-005, FR-006, FR-009, NFR-001

```gherkin
@US-002 @FR-004 @FR-005 @FR-006 @FR-009 @NFR-001 @AC-010
Feature: Validar SKU por equipe e preservar o SKU do próprio produto

  Scenario: Cadastrar SKU usado somente em outra equipe
    Given uma equipe diferente já usa o SKU informado
    When o membro cria o produto na equipe ativa
    Then o cadastro é aceito sem alterar o produto da outra equipe

  Scenario: Manter o SKU do produto editado
    Given o membro alterou apenas o nome e a descrição
    When salva com o próprio SKU
    Then a edição é aceita e nenhum erro de unicidade é associado ao SKU

  Scenario: Rejeitar colisão de SKU na edição
    Given outro produto da equipe ativa usa o SKU normalizado informado
    When o membro tenta salvar a edição
    Then o formulário identifica o erro no SKU e mantém os dados informados
```

#### AC-011 — Bloquear o formulário de edição cruzado

**Cobre**: US-002, FR-001, FR-008, NFR-001

```gherkin
@US-002 @FR-001 @FR-008 @NFR-001 @AC-011
Feature: Bloquear o formulário de edição cruzado

  Scenario: Abrir o formulário de um produto de outra equipe
    Given a pessoa é membro de ambas as equipes e o produto pertence à equipe diferente da rota
    When tenta abrir o formulário de edição pela rota da equipe ativa
    Then recebe 404 sem dados do produto
```

#### AC-012 — Bloquear exclusão cruzada mesmo com confirmação

**Cobre**: US-003, FR-001, FR-007, FR-008, NFR-001

```gherkin
@US-003 @FR-001 @FR-007 @FR-008 @NFR-001 @AC-012
Feature: Bloquear exclusão cruzada mesmo com confirmação

  Scenario: Confirmar exclusão com identificador de outra equipe
    Given a pessoa é membro de ambas as equipes e o produto pertence à equipe diferente da rota
    When envia a exclusão pela rota da equipe ativa com confirmed igual a true
    Then recebe 404 e o produto da outra equipe permanece intacto
```

#### AC-013 — Preservar produto sem confirmação

**Cobre**: US-003, FR-007, NFR-002

```gherkin
@US-003 @FR-007 @NFR-002 @AC-013
Feature: Preservar produto sem confirmação

  Scenario: Requisição não contém confirmação explícita
    Given existe um produto na equipe ativa
    When o membro solicita sua exclusão sem confirmed igual a true
    Then a aplicação rejeita a requisição e preserva o produto

  Scenario: Cancelar sem gravar
    Given existe um produto na equipe ativa e o diálogo de confirmação está aberto
    When o membro cancela a exclusão
    Then o diálogo fecha sem requisição e o produto permanece no catálogo
```

### 7. Requisitos

#### Funcionais

- **FR-001**: o sistema deve exigir autenticação e associação à equipe da rota
  para todas as operações de produto.
- **FR-002**: o sistema deve listar somente produtos da equipe ativa, com nome,
  SKU e descrição, em páginas de 15 itens ordenadas por nome e ID.
- **FR-003**: o sistema deve filtrar produtos da equipe ativa por ocorrência
  parcial no nome ou SKU, sem diferenciar maiúsculas e minúsculas, preservando o
  termo durante a paginação.
- **FR-004**: o sistema deve permitir que qualquer membro crie na equipe ativa
  um produto com nome e SKU obrigatórios e descrição opcional.
- **FR-005**: o sistema deve rejeitar SKU equivalente a outro SKU da mesma
  equipe após remover espaços externos e ignorar caixa, mas aceitar o mesmo SKU
  em equipes diferentes.
- **FR-006**: o sistema deve permitir que qualquer membro edite nome, SKU e
  descrição de um produto da equipe ativa, aplicando as mesmas validações do
  cadastro e desconsiderando o próprio registro na regra de unicidade.
- **FR-007**: a interface deve exigir confirmação antes de enviar a exclusão,
  permitir cancelamento sem efeito e enviar `confirmed=true` somente quando um
  membro confirma; o servidor deve rejeitar a exclusão sem esse valor e remover
  permanentemente o produto quando ele estiver presente.
- **FR-008**: o sistema deve resolver produto dentro da equipe da rota e
  responder como recurso não encontrado quando o identificador pertencer a
  outra equipe, sem revelar nem alterar seus dados.
- **FR-009**: o sistema deve rejeitar entrada inválida, preservar os valores
  informados e associar cada mensagem de validação ao respectivo campo.

#### Não funcionais

- **NFR-001**: nenhuma resposta Inertia ou mutação pode conter ou afetar produto de equipe diferente da rota autorizada. **Verificação**: testes Pest de listagem, busca, edição e exclusão cruzadas, incluindo asserções negativas de props e banco.
- **NFR-002**: listagem, busca, formulários e diálogo de exclusão devem possuir heading, labels, mensagens textuais, foco visível, operação por teclado e associação entre erros e campos. **Verificação**: inspeção JSX, `npm run types:check`, `npm run lint:check` e cenários de interface.

#### Erros e casos-limite

- Visitante → redirecionamento para autenticação.
- Pessoa sem associação à equipe da rota → acesso recusado.
- Produto ausente ou pertencente a outra equipe → resposta 404 sem mutação.
- Nome ou SKU vazio após trim → erro no campo correspondente.
- Nome acima de 255 caracteres, SKU acima de 100 ou descrição acima de 2.000 →
  erro no campo correspondente.
- SKU equivalente dentro da equipe → erro de unicidade no campo SKU.
- Busca vazia ou composta apenas por espaços → listagem completa da equipe.
- Busca sem correspondência → estado de nenhum resultado com ação para limpar.
- Página além do resultado disponível → coleção vazia sem erro de servidor.
- Cancelamento da confirmação → nenhuma requisição de exclusão.
- Requisição de exclusão sem `confirmed=true` → erro de validação e produto
  preservado.
- Falha de validação → valores informados permanecem disponíveis no formulário.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Especialistas

| Especialista | Modo | Sinal que o puxou | Fases |
| --- | --- | --- | --- |
| specsfy-specialist-application-security | padrão | Sessão e dados expostos nas props Inertia | specify, validate |
| specsfy-specialist-architecture | web-api | Rotas HTTP e contrato Inertia | specify, validate |
| specsfy-specialist-interface | accessibility | Semântica, mensagens textuais e navegação | specify, validate |
| specsfy-specialist-interface | ui | Composição, estados e ações das telas | specify, validate |
| specsfy-specialist-interface | ux | Catálogo, formulários e confirmação de exclusão | specify, validate |
| specsfy-specialist-laravel | app | Rotas, controllers, Eloquent e props Inertia | specify, validate |
| specsfy-specialist-modeling | data | Tabela de produtos, vínculo com equipe e índice composto | specify, validate |
| specsfy-specialist-modeling | domain | Normalização e unicidade do SKU por equipe | specify, validate |
| specsfy-specialist-react | padrão | Páginas e navegação Inertia em React | specify, validate |
| specsfy-specialist-tailwind-css | padrão | Composição responsiva com os tokens do projeto | specify, validate |
| specsfy-specialist-testing | pest | Testes HTTP focais e marcadores por critério | specify, validate |
| specsfy-specialist-typescript | padrão | Tipos das props da página | specify, validate |
| specsfy-specialist-ui-components | components | Seleção de componentes da listagem, formulários e diálogo | specify, validate |
| specsfy-specialist-ui-components | reui | Seleção prevista de cabeçalho e grade para o catálogo | specify, validate |
| specsfy-specialist-ui-components | shadcn | Reutilização dos componentes locais baseados em Radix | specify, validate |

#### Contexto existente

- A aplicação usa Laravel 13, Inertia Laravel v3, React 19, Wayfinder,
  Tailwind CSS 4, Pest 4 e TypeScript estrito.
- Rotas de contexto usam `{current_team}`, `Team` resolve pelo slug e
  `EnsureTeamMembership` protege e sincroniza a equipe ativa.
- Páginas existentes usam `Form`, `Link`, componentes em
  `resources/js/components/ui`, flash de sucesso e props explicitamente
  transformadas.

#### Arquitetura e módulos

- `Product` pertence a `Team`; `Team` expõe `products()`.
- O grupo de rotas usa `scopeBindings()` obrigatoriamente para resolver
  `{product}` por `Team::products()` antes do controller.
- `ProductPolicy` verifica a associação do usuário à equipe do produto como
  defesa adicional nas mutações.
- `StoreProductRequest`, `UpdateProductRequest` e `DeleteProductRequest`
  autorizam e validam entrada.
- `ProductController` entrega as páginas Inertia e as mutações.
- As rotas sob `{current_team}/products` usam binding escopado por equipe.
- Wayfinder gera os contratos usados pelas páginas React.

#### Migrations

- Criar `products` com ID, `team_id`, `name`, `sku`, `normalized_sku`,
  `description`, timestamps e foreign key para `teams`.
- Criar unique composto em `team_id` e `normalized_sku`.
- Criar índice em `team_id` e `name` para sustentar escopo e ordenação.
- O rollback remove a tabela; a foreign key usa cascade somente quando uma
  equipe for fisicamente removida.

#### Models

- `app/Models/Product.php`: fillable explícito, relação `team()`, factory e
  normalização persistida do SKU.
- `app/Models/Team.php`: relação `products()`.
- `database/factories/ProductFactory.php`: dados válidos e estado opcional para
  equipe informada.
- `app/Policies/ProductPolicy.php`: autorização adicional por associação do
  usuário à equipe do produto nas ações `update` e `delete`.

#### Controllers e casos de uso

- `app/Http/Controllers/ProductController.php`: `index`, `create`, `store`,
  `edit`, `update` e `destroy`; não haverá `show`.
- `app/Http/Requests/Products/StoreProductRequest.php`: autorização de membro,
  trim, normalização e validação da criação.
- `app/Http/Requests/Products/UpdateProductRequest.php`: mesmas regras,
  ignorando o produto atual somente dentro da equipe.
- `app/Http/Requests/Products/DeleteProductRequest.php`: exige booleano
  `confirmed` aceito e autoriza a exclusão do produto já escopado.
- `store` e `update` convertem uma violação concorrente do unique
  `products_team_id_normalized_sku_unique` em erro de validação do campo `sku`,
  preservando o contrato de FR-005 e FR-009.
- Mutações redirecionam para `products.index` e publicam flash de sucesso.

#### Views e experiência

- `resources/js/pages/products/index.tsx`: heading, busca GET, contador,
  tabela responsiva, paginação, estados vazio/sem resultado e ações.
- `resources/js/pages/products/create.tsx`: formulário de nome, SKU e descrição.
- `resources/js/pages/products/edit.tsx`: formulário preenchido e ação de
  exclusão.
- `resources/js/components/products/product-form.tsx`: campos compartilhados e
  erros acessíveis.
- `resources/js/components/products/delete-product-modal.tsx`: descrição da
  consequência permanente, foco gerenciado, cancelar sem request e confirmar
  enviando `confirmed=true`.
- `resources/js/types/product.ts`: contratos de produto e paginação.
- `resources/js/components/app-sidebar.tsx`: entrada para produtos na equipe
  ativa.

#### Queries e repositórios

- `Product::query()` sempre começa pelo relacionamento da equipe resolvida.
- Busca agrupa nome e SKU dentro do escopo da equipe para impedir escape por
  precedência de `OR`.
- A consulta seleciona somente props necessárias, ordena por nome normalizado e
  ID, pagina em 15 itens e preserva o parâmetro `search`.
- `scopeBindings()` resolve obrigatoriamente `{product}` por
  `Team::products()` e produz 404 antes de controller ou Policy quando o produto
  não pertence à equipe da rota.

#### Jobs e processamento assíncrono

- Não aplicável; todas as operações são síncronas e locais.

#### Estrutura de arquivos

```text
specs/defined/0006-produtos/spec.md
routes/web.php
app/Http/Controllers/ProductController.php
app/Http/Requests/Products/StoreProductRequest.php
app/Http/Requests/Products/UpdateProductRequest.php
app/Http/Requests/Products/DeleteProductRequest.php
app/Models/Product.php
app/Models/Team.php
app/Policies/ProductPolicy.php
database/factories/ProductFactory.php
database/migrations/*_create_products_table.php
resources/js/components/app-sidebar.tsx
resources/js/components/products/delete-product-modal.tsx
resources/js/components/products/product-form.tsx
resources/js/pages/products/create.tsx
resources/js/pages/products/edit.tsx
resources/js/pages/products/index.tsx
resources/js/types/product.ts
tests/Feature/Products/ProductManagementTest.php
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| Product | `id` | `name` obrigatório até 255; `sku` obrigatório até 100; `normalized_sku` derivado; `description` opcional até 2.000; timestamps | pertence a uma Team |
| Team | `id` e `slug` na rota | equipe ativa já existente | possui muitos Product |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| Product | inexistente | cadastro válido | persistido | equipe da rota; SKU único por equipe |
| Product | persistido | edição válida | persistido atualizado | equipe não muda; SKU continua único |
| Product | persistido | cancelar exclusão | persistido | nenhum request destrutivo |
| Product | persistido | exclusão sem confirmação | persistido | servidor rejeita sem `confirmed=true` |
| Product | persistido | confirmar exclusão | inexistente | exclusão permanente e autorizada |

#### Migração e retenção

- Não há dados anteriores a migrar.
- Produto excluído não é retido nem restaurável.
- `normalized_sku` armazena o SKU aparado e em caixa normalizada para garantir a
  unicidade no banco; `sku` preserva a caixa informada após trim para exibição.

### 10. Interfaces e contratos

#### Interface para pessoas

Membros autenticados da equipe ativa operam o catálogo no layout da aplicação.

#### Stack e convenções de interface

Laravel e Inertia entregam props tipadas em TypeScript. React, Tailwind CSS 4 e Wayfinder seguem os componentes e tokens locais.

#### Telas e responsabilidades

- Catálogo em `products/index`, com busca, lista e paginação.
- Cadastro em `products/create`, com nome, SKU e descrição.
- Edição em `products/edit`, com dados existentes e ação de exclusão.

#### Fluxo de informação e navegação

A listagem abre os formulários de cadastro e edição. Uma mutação bem-sucedida volta à listagem da mesma equipe com mensagem de sucesso.

#### Menus e navegação principal

O menu lateral autenticado usa o rótulo Produtos para a rota `products.index` no contexto da equipe ativa.

#### Formulários e ações

Nome e SKU são obrigatórios e descrição é opcional. Formulários preservam valores em falhas de validação. A ação de excluir abre um diálogo que permite cancelar ou confirmar.

#### Composição e disposição

O cabeçalho fica acima da busca e da listagem. Os formulários ocupam páginas próprias, com as mensagens junto aos campos. O diálogo de exclusão fica na página de edição.

#### Blocos React e componentes selecionados

Reutilizar `AppLayout`, `Form`, `Link`, `Input`, `Label`, `Button` e componentes locais de diálogo. A seleção do `PageHeader` e do `DataGrid` para o catálogo fica no plano, com registro em `INTERFACE.md`.

#### Estados e acessibilidade

Exibir carregamento, vazio, ausência de resultados, erro e sucesso. Usar labels, foco visível e operação por teclado. O diálogo controla foco e anuncia a consequência da exclusão.

#### Revisão visual durante o desenvolvimento

Conferir bordas, espaçamentos, margens, padding e tipografia no catálogo, nos formulários e no diálogo em telas estreitas e largas.

#### Contrato CRUD

Operações: listar, criar, editar, apagar

- Reutilizar um `PageHeader` no catálogo e nos formulários.
- Listar: `DataGrid` de largura total com coluna ID, nome, SKU, descrição e paginação — Tarefa: T020.
- Criar: formulário com ação de cadastro e erros por campo — Tarefa: T021.
- Editar: ação de edição que abre o formulário com os dados do produto da equipe — Tarefa: T022.
- Apagar: ação de exclusão com diálogo e confirmação explícita — Tarefa: T023.

#### APIs expostas

- `GET /{current_team}/products` (`products.index`): recebe `search` opcional e
  retorna página Inertia `products/index` com paginação.
- `GET /{current_team}/products/create` (`products.create`): retorna
  `products/create`.
- `POST /{current_team}/products` (`products.store`): recebe `name`, `sku` e
  `description`; redireciona com flash ou retorna erros Inertia.
- `GET /{current_team}/products/{product}/edit` (`products.edit`): retorna
  `products/edit` somente para produto da equipe.
- `PUT|PATCH /{current_team}/products/{product}` (`products.update`): atualiza
  campos permitidos e redireciona com flash ou erros.
- `DELETE /{current_team}/products/{product}` (`products.destroy`): recebe
  `confirmed`; sem o booleano aceito retorna erro de validação e preserva o
  registro, com `confirmed=true` remove permanentemente e redireciona com flash.
- Todas as rotas exigem sessão autenticada, e-mail verificado,
  `EnsureTeamMembership`, `scopeBindings()` e autorização por recurso nas
  mutações.

#### APIs externas utilizadas

- Nenhuma.

#### Documentação das APIs consultadas

- Contratos locais de rotas, Inertia, Wayfinder, middleware, modelos e testes.
- Nenhuma documentação externa foi necessária nesta etapa.

#### Eventos e outros contratos

- Prop `products` contém `data[]`, `links` e `meta`; cada item expõe somente
  `id`, `name`, `sku` e `description`.
- Prop `filters.search` contém o termo efetivamente aplicado.
- Props de formulário nunca expõem `team_id` ou `normalized_sku`.
- Flash de sucesso diferencia produto criado, atualizado e excluído.
- Nenhum evento de domínio ou integração externa será publicado.

### 11. Estratégia TDD

- **Unidade**: normalização de SKU e invariantes do model quando não estiverem
  suficientemente cobertas pela integração.
- **Integração/contrato**: Pest cobre rotas, autorização, escopo, validação,
  unicidade, busca, paginação, props Inertia, rejeição de exclusão sem
  `confirmed=true`, exclusão confirmada e persistência.
- **BDD/aceite**: os blocos Gherkin de AC-001 a AC-013 permanecem nesta spec
  como referência para o usuário e para o desenho dos testes TDD; não serão
  copiados para `.feature` nem executados.
- **Runner TDD**: Pest, executado por `php artisan test --compact`, pois este é
  um projeto PHP/Laravel; a presença do frontend Node não altera essa escolha.
- **E2E**: não aplicável na primeira entrega; a garantia destrutiva é imposta no
  servidor e coberta por Pest, sem adicionar dependência.
- **Verificação manual**: inspeção do fechamento sem request, foco no diálogo e
  responsividade após build; a preservação sem `confirmed=true` e a exclusão
  confirmada permanecem comprovadas programaticamente.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| FR-001 a FR-009, NFR-001, NFR-002, AC-001 a AC-013 | AC-001 a AC-013 na seção 6 | `tests/Feature/Products/ProductManagementTest.php` com marcadores `SPECSFY` | Pending | Pending | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001, FR-002, NFR-001, NFR-002 | AC-001 | Integração | `php artisan test --compact tests/Feature/Products/ProductManagementTest.php --filter=list` | Pending |
| FR-003, NFR-001, NFR-002 | AC-002 | Integração | `php artisan test --compact tests/Feature/Products/ProductManagementTest.php --filter=search` | Pending |
| FR-004, FR-005, FR-009, NFR-001, NFR-002 | AC-003 | Integração | `php artisan test --compact tests/Feature/Products/ProductManagementTest.php --filter=create` | Pending |
| FR-005, FR-006, FR-009, NFR-001, NFR-002 | AC-004 | Integração | `php artisan test --compact tests/Feature/Products/ProductManagementTest.php --filter=update` | Pending |
| FR-007, NFR-001, NFR-002 | AC-005 | Integração e inspeção complementar | `php artisan test --compact tests/Feature/Products/ProductManagementTest.php --filter=delete` | Pending |
| FR-001, FR-008, NFR-001 | AC-006 | Segurança/integração | `php artisan test --compact tests/Feature/Products/ProductManagementTest.php --filter=isolation` | Pending |
| NFR-002 | AC-001 a AC-005 | Estático | `npm run types:check && npm run lint:check && npm run format:check` | Pending |
| US-001, FR-001, FR-002, FR-003, NFR-001 | AC-007 | Integração | Pest da listagem e busca paginada | Pending |
| US-001, FR-002, FR-003, NFR-001, NFR-002 | AC-008 | Integração e inspeção | Pest da listagem sem filtro e ação de limpar no JSX | Pending |
| US-002, FR-004, FR-006, FR-009, NFR-002 | AC-009 | Integração e inspeção | Pest de validação de cadastro e edição e revisão dos erros associados aos campos | Pending |
| US-002, FR-004, FR-005, FR-006, FR-009, NFR-001 | AC-010 | Integração | Pest de normalização, escopo e unicidade de SKU | Pending |
| US-002, FR-001, FR-008, NFR-001 | AC-011 | Segurança/integração | Pest do acesso ao formulário de outra equipe | Pending |
| US-003, FR-001, FR-007, FR-008, NFR-001 | AC-012 | Segurança/integração | Pest da exclusão confirmada de produto de outra equipe | Pending |
| US-003, FR-007, NFR-002 | AC-013 | Integração e inspeção | Pest da exclusão sem confirmação e inspeção do cancelamento do diálogo | Pending |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Data**: 2026-07-25
- **Comando**: `specsfy gate spec 0006 --project .`
- **Achados**: `READY`; estrutura, requisitos e findings estão válidos, e o
  enforcement local selecionou e executou Pest com sucesso.
- **FIND-PROD-001** [P1] [Resolved] o contrato de exclusão exige `confirmed=true` no servidor e AC-005 e AC-013 preveem testes Pest para provar remoção confirmada e preservação sem confirmação — Refs: US-003, FR-007, NFR-002, AC-005, AC-013 — Evidence: specs/defined/0006-produtos/spec.md#11-estratégia-tdd — Effect: a proteção destrutiva possui um teste Pest focal previsto — Suggestion: manter a inspeção do cancelamento do diálogo como complemento à garantia do servidor
- **FIND-ARCH-001** [P2] [Resolved] o plano converte violação concorrente do unique composto em erro de validação do SKU — Refs: FR-005, FR-009, AC-003, AC-004 — Evidence: specs/defined/0006-produtos/spec.md#controllers-e-casos-de-uso — Effect: colisões tardias preservam o resultado observável em vez de erro de servidor — Suggestion: materializar teste focal da fronteira de persistência no Ato II
- **FIND-SEC-001** [P2] [Resolved] `scopeBindings()` tornou-se obrigatório para resolução por equipe e a Policy permanece como defesa adicional nas mutações — Refs: FR-001, FR-008, NFR-001, AC-006 — Evidence: specs/defined/0006-produtos/spec.md#queries-e-repositórios — Effect: leitura e mutação possuem fronteiras explícitas e complementares — Suggestion: manter casos negativos para usuário membro de ambas as equipes
- **FIND-ARCH-002** [P1] [Resolved] o BDD permanece como referência na spec e os testes TDD usam Pest, runner já reproduzível no projeto PHP; o enforcement executou `php artisan test --compact` com sucesso — Refs: AC-001, AC-002, AC-003, AC-004, AC-005, AC-006 — Evidence: specs/defined/0006-produtos/spec.md#11-estratégia-tdd — Effect: os cenários dão contexto aos testes sem exigir Behave ou execução de `.feature` — Suggestion: manter a rastreabilidade dos testes TDD com marcadores `SPECSFY`

#### Gate do Ato II — Plano

- **Resultado**: Pending
- **Comando**: `specsfy gate tasks 0006 --project .`
- **Achados**: tarefas ainda não foram geradas; o planejamento depende do
  Definition Gate.

#### Gate do Ato III — Entrega

- **Resultado**: Pending
- **Comando**: `specsfy gate trace 0006 --project . --full-chain`
- **Achados**: implementação e evidências ainda não iniciadas.

### 14. Tarefas

- As tarefas executáveis ainda não foram decompostas. `$specsfy-05-tasks`
  preencherá esta seção com dependências, checklists e referências de aceite.
  Os IDs T020 a T023 da seção 10 ficam reservados às operações de interface.

### 15. Ordem de execução

- Caminho crítico previsto: cenários da seção 6 → RED Pest → persistência e
  autorização → endpoints → interface → GREEN → regressão.
- Tarefas paralelas: serão decididas somente após a decomposição da seção 14.
- Estratégia de MVP: entregar US-001, US-002 e US-003 como um CRUD isolado por
  equipe; nenhuma história isolada autoriza omitir a segurança transversal.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- Contexto de equipe, autenticação, verificação de e-mail e
  `EnsureTeamMembership` existentes.
- Geração de rotas TypeScript pelo Wayfinder já configurado.
- Componentes locais de formulário, tabela, botão, diálogo e toast.

#### Riscos

- Escape de tenancy por `OR` na busca → agrupar filtros dentro da query já
  limitada à equipe e testar registros cruzados.
- Alteração direta de produto de outra equipe → binding escopado, Policy e
  testes negativos para update/delete.
- Colisão concorrente de SKU → unique composto e conversão da violação tardia
  em erro no campo SKU.
- Divergência entre SKU exibido e comparado → manter `sku` aparado para exibição
  e `normalized_sku` derivado para unicidade.
- Exclusão acidental → diálogo explícito, nenhuma requisição ao cancelar e
  rejeição do servidor sem `confirmed=true`.
- Descrição extensa prejudicar a tabela → apresentação resumida sem truncar o
  valor persistido.

#### Suposições

- A listagem atende à operação de leitura; não existe página `show`.
- Paginação usa 15 itens, seguindo a convenção do diretório existente.
- Ordenação padrão é por nome sem diferenciar caixa e depois por ID.
- Nome aceita até 255 caracteres, SKU até 100 e descrição até 2.000.
- Nome, SKU e descrição são aparados; descrição vazia é persistida como `null`.
- Busca ignora caixa e espaços externos e atua somente sobre nome e SKU.
- Criação e edição usam páginas separadas; exclusão usa diálogo modal.
- Produtos não possuem soft delete, pois a decisão foi por exclusão permanente.

### 17. Decisões

- **DEC-001**: qualquer membro pode executar todo o CRUD — decisão da
  refinamento do backlog; papéis não restringem produtos nesta fatia.
- **DEC-002**: produto pertence exatamente a uma equipe — garante o catálogo
  isolado pelo contexto já existente.
- **DEC-003**: SKU é único por equipe e ignora caixa e espaços externos —
  permite reutilização entre equipes sem duplicidade semântica local.
- **DEC-004**: nome e SKU são obrigatórios; descrição é opcional — mantém o
  cadastro mínimo definido.
- **DEC-005**: exclusão é permanente e exige confirmação na interface — não
  haverá arquivo, lixeira ou restauração.
- **DEC-006**: a primeira entrega pesquisa parcialmente por nome ou SKU —
  preserva utilidade conforme o catálogo cresce.
- **DEC-007**: a listagem representa a leitura do CRUD — uma página exclusiva
  de detalhes fica fora de escopo.
- **DEC-008**: a exclusão exige `confirmed=true` também no servidor — torna a
  proteção destrutiva programaticamente verificável sem adicionar dependência
  de testes frontend.

### 18. Definition of Done

- [ ] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Os testes Pest informados por AC-001 a AC-013 passam no runner TDD.
- [ ] FR-001 a FR-009 e NFR-001 a NFR-002 possuem evidência de verificação.
- [ ] Todas as tarefas futuras da seção 14 estão concluídas.
- [ ] Testes focais, regressão, Pint, Larastan, lint, tipos, formatação e build
  passam.
- [ ] Isolamento por equipe e ausência de exposição cruzada foram verificados
  com casos negativos.
