@specsfy @database
Feature: Conferir migrations planejadas
  Para que mudanças persistentes não terminem apenas no model ou na query
  Como pessoa que executa uma spec
  Quero exigir a criação, a aplicação e a conferência de cada migration

  Scenario: Recusar plano de banco sem migration
    Given os validadores de tarefas e comprovação do Specsfy
    When o contrato de migrations planejadas é inspecionado
    Then toda tarefa ligada ao banco exige uma tarefa MIGRATION

  Scenario: Recusar migration sem aplicação comprovada
    Given os validadores de tarefas e comprovação do Specsfy
    When o contrato de migrations planejadas é inspecionado
    Then a conclusão exige arquivo aplicação e consulta de estado
