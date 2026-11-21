@specsfy @specialists
Feature: Especialistas sob demanda na spec

  Scenario: A mesma demanda recebe a mesma indicação em cada fase
    Given uma skill base instalada de forma independente
    When a fase consulta os sinais da demanda, da spec ou do código
    Then encontra a mesma tabela de especialistas e modos das demais fases

  Scenario: Uma tarefa especializada preserva o contrato da seção 14
    Given uma spec com especialistas no cabeçalho, no plano e em uma tarefa
    When a execução seleciona a próxima tarefa pronta
    Then a referência ao especialista é preservada com os seis itens do checklist
