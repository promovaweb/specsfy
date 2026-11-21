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

  Scenario: Distinguir baseline de lista vazia conhecida
    Given uma cópia sem Git com manifests preexistentes
    When o monitor roda sem lista de alterações
    Then ele retorna baseline com diagnóstico e recuperação
    And uma lista explicitamente vazia retorna current

  Scenario: Compartilhar declarações entre spec e findings
    Given requisitos em negrito com dois pontos ou travessão e tarefas na seção 14
    Then os gates de spec e findings reconhecem as mesmas declarações
    And uma referência de finding a uma tarefa ausente é rejeitada

  Scenario: Mapear o menu na seção de navegação
    Given uma spec com menu e rótulo na seção de navegação
    Then o destino declarado na mesma seção satisfaz o contrato
    And um destino em outra seção não satisfaz o contrato

  Scenario: Planejar provas de aceite que dependem da migration
    Given uma spec em Defined com Plan Gate pendente
    When a próxima tarefa TDD é selecionada para preparar o RED
    Then o checklist e a evidência por aceite indicam quais asserções aguardam o schema e onde serão verificadas
