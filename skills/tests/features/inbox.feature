@specsfy @inbox
Feature: Captura imediata na Inbox
  Para não perder uma intenção ainda incompleta
  Como pessoa usuária do Specsfy
  Quero armazenar meu texto sem responder perguntas

  Scenario: Capturar e pré-processar uma entrada sem diálogo
    Given um projeto consumidor inicializado para a Inbox
    When o agente recebe somente o texto da entrada
    Then ele não faz perguntas nem solicita confirmação
    And cria specs/inbox/data-hora-slug.md a partir do template instalado
    And preserva o texto original e separa análise, inferências e pontos a revisar
    And não cria backlog, spec, tarefas ou código

  Scenario: Retirar da fila ativa uma captura integralmente coberta por specs aprovadas
    Given o contrato central e as skills de inbox, backlog, especificação e validação
    When a saída da Inbox é inspecionada
    Then a estrutura canônica declara specs/inbox/processed/
    And a captura permanece na Inbox até o Definition Gate das specs que a cobrem
    And só a validação move a captura, pelo CLI, depois de specsfy transition para defined
    And a busca por duplicatas do backlog inclui as capturas processadas

  Scenario: Instalar todos os templates documentais do framework
    Given uma instalação base do Specsfy
    When o CLI publica os arquivos estruturais no projeto consumidor
    Then .specsfy/templates contém Inbox.md, Backlog.md, Spec.md, Tasks.md, Project.md, Stack.md, Rules.md, Database.md e UserProfile.md
    And cria .specsfy/templates/custom sem gerenciar seu conteúdo

  Scenario: Preservar uma descoberta de MVP antes do backlog
    Given um projeto consumidor com MVP.md e BRAND.md na raiz
    When o entrevistador de MVP inicia a descoberta
    Then ele importa MVP.md como a Milestone 1.0 sem sobrescrever uma existente
    And cria backlog e spec Draft apenas para cada requisito de desenvolvimento
    And entrevista cada backlog antes de qualquer promoção

  Scenario: Usar o contexto do Hub para um projeto em submódulo
    Given um projeto consumidor instalado como submódulo Git de um Hub
    And MVP.md e BRAND.md estão somente na raiz do Hub
    When o entrevistador de MVP inicia a descoberta
    Then ele consulta os arquivos da raiz do Hub
    And importa o MVP como a Milestone 1.0 sem criar Inboxes no projeto consumidor
