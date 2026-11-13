@cli @progress
Feature: Projetar o progresso das especificações

  Scenario: Reconhecer os metadados tabulares de uma spec concluída
    Given uma spec concluída com o cabeçalho tabular canônico
    When o CLI projeta o progresso da especificação
    Then o status e os três gates são reconhecidos
    And o resumo contabiliza a spec como concluída

  Scenario: Ler a spec destacada ao lado da lista de progresso
    Given a implementação da aba Specs da TUI
    When o contrato de visualização da spec é inspecionado
    Then a lista agrupa as specs por estado com gates e progresso
    And o Markdown da spec destacada fica rolável ao lado da lista
