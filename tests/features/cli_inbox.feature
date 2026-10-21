@cli @inbox
Feature: Retirar da Inbox uma captura já coberta por specs aprovadas
  Para que a Inbox mostre só o que ainda precisa de tratamento
  Como pessoa usuária do Specsfy
  Quero arquivar em specs/inbox/processed/ a captura integralmente coberta por specs com Definition Gate aprovado

  Scenario: Processar uma captura coberta por uma spec aprovada
    Given uma captura na Inbox referenciada por uma spec com Definition Gate aprovado
    When o CLI processa a captura indicando essa spec
    Then a captura passa para specs/inbox/processed/ com Status Processada
    And o texto original é preservado e a spec derivada fica registrada
    And as referências à captura na spec apontam para o novo caminho

  Scenario: Manter na Inbox uma captura cuja spec ainda não passou o Definition Gate
    Given uma captura na Inbox referenciada por uma spec em Draft
    When o CLI tenta processar a captura indicando essa spec
    Then o comando recusa citando o Definition Gate
    And a captura continua em specs/inbox/ sem alteração
