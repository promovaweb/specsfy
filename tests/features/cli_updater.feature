@cli @updater
Feature: Atualizar o binário instalado
  Para receber correções sem reinstalar à mão
  Como pessoa que usa o Specsfy
  Quero saber quando existe versão nova e trocar o binário com segurança

  Scenario: Verificar e instalar uma atualização segura
    Given a implementação do auto updater do CLI
    When o contrato de atualização é inspecionado
    Then a checagem diária guarda o estado em ~/.specsfy/update.json
    And a versão mais recente vem da última GitHub Release do repositório
    And o binário avulso confere o SHA256SUMS antes de trocar o executável
    And a instalação pelo npm é atualizada pelo pacote oficial
