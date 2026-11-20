Feature: Orquestração conversacional das etapas
  Como pessoa usando o Specsfy
  Quero que a etapa responsável seja acionada na própria conversa
  Para avançar ou corrigir pendências sem repetir comandos

  Scenario: Avançar automaticamente para a próxima etapa
    Given uma skill base concluiu sua responsabilidade
    When ela identifica a próxima etapa responsável
    Then anuncia a transição, o motivo e a pendência ou resultado esperado
    And carrega automaticamente a skill de destino sem pedir confirmação
    And continua na mesma conversa sem pedir o comando novamente

  Scenario: Retornar e retomar automaticamente para resolver uma pendência
    Given uma etapa posterior encontra uma pendência de uma etapa anterior
    When ela identifica a skill responsável pela correção
    Then anuncia a pendência e executa o retorno
    And após a correção retoma automaticamente a etapa que detectou a pendência

  Scenario: Rotear a cadeia principal e os retornos críticos
    Given as nove skills base instaladas
    When o estado canônico exige outra responsabilidade
    Then a cadeia principal chama inbox, backlog, specify, validate, tasks e implement
    And mudança tardia chama update-spec automaticamente
    And a troca entre testes e implementação acontece dentro da mesma skill

  Scenario: Separar handoff de autorização sensível
    Given uma transição automática exige uma ação sensível
    When a skill responsável é carregada
    Then o handoff não pede confirmação
    But a ação sensível continua exigindo autorização específica
