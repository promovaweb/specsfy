@cli @tests
Feature: Executar os testes do projeto consumidor
  Para acompanhar a qualidade sem abandonar o dashboard
  Como pessoa usando o Specsfy em um projeto Laravel
  Quero executar o Pest e acompanhar sua saída no CLI

  Scenario: Executar Pest pelo comando e pela TUI
    Given a implementação do runner de testes do CLI
    When o contrato de execução de testes é inspecionado
    Then o CLI detecta Laravel com Pest sem executar comandos arbitrários
    And o comando specsfy test transmite a saída e preserva o exit code
    And a TUI só executa a suíte quando a pessoa pede e mantém a saída rolável
