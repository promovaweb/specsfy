@specsfy @cli @ux
Feature: Catálogo de skills na TUI
  Para decidir instalações, remoções e atualizações sem interpretar uma lista densa
  Como pessoa usando o CLI
  Quero ver o estado de cada skill e confirmar cada ação antes de aplicá-la

  Scenario: Gerenciar skills com estado nomeado e confirmação
    Given a implementação da aba Skills do CLI
    When o contrato de apresentação é inspecionado
    Then as skills aparecem por categoria com o estado instalado ou disponível em texto
    And instalar, remover e atualizar pedem confirmação antes de alterar arquivos

  Scenario: Atualizar todas as skills Specsfy instaladas
    Given a implementação da aba Skills do CLI
    When o contrato de apresentação é inspecionado
    Then a aba oferece uma ação para atualizar todas as skills instaladas
    And o CLI oferece a atualização não interativa equivalente
