@interface-design-system
Feature: Governança de interface do Specsfy
  Para manter personalidade e consistência nas telas SaaS
  Como pessoa que especifica ou implementa uma interface
  Quero uma fonte macro com padrões e cenários canônicos

  Scenario: Registrar os padrões SaaS obrigatórios
    Given o template global de design system do Specsfy
    When os padrões de CRUD são lidos
    Then listas usam DataGrid com PageHeader
    And detalhes usam DetailLists com PageHeader
    And criação e edição usam seções com duas colunas responsivas
    And erros de campo aparecem em vermelho abaixo do campo

  Scenario: Aplicar defaults sem apagar uma direção explícita
    Given o especialista de interface do Specsfy no modo system
    When sua política de direção é lida
    Then ela aplica os defaults quando a pessoa não informa direção visual
    And ela registra exceções com alcance definido
    And ela preserva a personalidade do produto na hierarquia de informação

  Scenario: Entregar o design system ao projeto consumidor
    Given o instalador e o catálogo de especialistas do Specsfy
    When a integração do design system é lida
    Then o CLI publica o template DESIGNSYSTEM.MD
    And o especialista de interface reúne experiência e design system
    And o template Interface.md aponta para DESIGNSYSTEM.MD

  Scenario: Orientar dashboards e blocos comuns de interface
    Given o template global de design system do Specsfy
    When os padrões comuns de interface são lidos
    Then dashboards usam PageHeader, filtros e indicadores com contexto
    And primitives de shadcn/ui e blocos ReUI podem compor CRUDs e dashboards
    And a interface cobre teclado, foco, estados e responsividade

  Scenario: Tornar a linha do DataGrid uma ação de detalhe
    Given o contrato de interação do DataGrid do Specsfy
    When a navegação da lista é lida
    Then toda a linha abre o detalhe por clique e teclado
    And ações internas não disparam a navegação da linha

  Scenario: Aplicar o contrato CRUD compartilhado
    Given o template global de design system do Specsfy
    When os padrões de CRUD são lidos
    Then todas as telas CRUD reutilizam o mesmo PageHeader componentizado
    And a listagem usa DataGrid em largura total com a coluna ID visível
    And cada linha leva ao detalhe e oferece editar e apagar

  Scenario: Conferir a qualidade visual durante o desenvolvimento
    Given o contrato de implementação visual do Specsfy
    When a revisão de desenvolvimento é lida
    Then a conferência visual é obrigatória mesmo sem pedido da pessoa
    And ela verifica bordas espaçamentos margens padding e tipografia do sistema

  Scenario: Exibir o contexto da equipe em todas as telas
    Given o contrato de navegação contextual do Specsfy
    When o breadcrumb global é lido
    Then toda tela exibe equipe, módulo e tela atual
    And Laravel reaproveita o breadcrumb existente do layout

  Scenario: Descobrir CRUD, menus e documentação durante o setup
    Given o contrato de setup do Specsfy
    When a cobertura funcional do setup é lida
    Then cada entidade de negócio tem a necessidade de CRUD verificada
    And cada tela aplicável tem um caminho pelos menus do sistema
    And dúvidas sobre CRUD ou menus são confirmadas com a pessoa
    And a documentação técnica completa é reconstruída durante o setup
