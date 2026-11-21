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

  Scenario: Preservar predecessores TDD de planos legados
    Given um plano aprovado sem tags TDD com testes executáveis antes e depois do código
    Then três predecessores cobrem os três aceites e o teste pós-código conta como regressão

  Scenario: Contar os mínimos por aceite principal
    Given três tarefas TDD que indicam o mesmo aceite principal
    Then o gate conta somente um aceite para os mínimos

  Scenario: Validar as operações da interface
    Given specs com criação e listagem, somente leitura e CRUD completo
    Then o gate vincula o controle afirmativo de cada operação à tarefa de interface da seção 14

  Scenario: Usar apenas fontes locais
    Given uma spec que declara ausência de pesquisa externa
    Then o índice vazio passa sem claims materiais e falha quando um claim é inválido

  Scenario: Fechar setup com pré-condições de deploy
    Given a política de stack do setup para Laravel
    Then as ausências viram pendências registradas para o deploy
