@specsfy @rehearsal
Feature: Validar specs e tarefas em cópias do projeto
  Os validadores usam o escopo declarado na spec e as evidências da raiz do consumidor.

  Scenario: Validar evidências de uma cópia sem Git
    Given uma spec com Evidence Contract em uma cópia sem Git
    Then o gate de tarefas encontra a raiz do projeto
    And a revisão de findings também resolve os caminhos da evidência

  Scenario: Separar TDD de regressão pós-código
    Given um plano com testes TDD e uma tarefa de regressão
    Then a regressão é contabilizada sem satisfazer a cobertura TDD do aceite

  Scenario: Validar as operações da interface
    Given specs com criação e listagem, somente leitura e CRUD completo
    Then o gate exige controles e tarefas das operações declaradas

  Scenario: Usar apenas fontes locais
    Given uma spec que declara ausência de pesquisa externa
    Then o índice vazio passa e um índice quebrado continua falhando

  Scenario: Fechar setup com pré-condições de deploy
    Given a política de stack do setup para Laravel
    Then as ausências viram pendências registradas para o deploy
