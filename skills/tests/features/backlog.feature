@specsfy @backlog
Feature: Captura de ideias no backlog
  Para preservar ideias antes do rigor de uma especificação
  Como pessoa responsável pelo produto
  Quero registrar itens leves e ordenados no backlog

  Scenario: Registrar uma ideia sem criar uma especificação
    Given um projeto consumidor vazio para backlog
    When o agente registra a ideia "Painel de acompanhamento"
    Then o arquivo specs/backlog/0001-painel-de-acompanhamento.md é criado
    And suas metainformações aparecem em uma tabela no topo
    And nenhuma especificação convertida é criada

  Scenario: Esclarecer lacunas antes de registrar uma ideia
    Given uma ideia de backlog com informações essenciais ausentes ou ambíguas
    When o agente avalia se a ideia está minimamente completa
    Then ele apresenta exatamente uma pergunta numerada por rodada
    And reavalia o que falta depois de cada resposta
    And só persiste o backlog quando problema, pessoa, resultado e contexto estão claros

  Scenario: Consultar duplicatas e referências do projeto
    Given um pedido para registrar uma ideia de backlog
    When o agente procura material relacionado
    Then ele pesquisa termos do pedido em backlogs, specs e documentação
    And confirma com o usuário antes de criar uma possível duplicata
    And preserva referências relevantes no item

  Scenario: Descobrir o que o produto precisa guardar antes do brief
    Given uma ideia de backlog que depende de informações lembradas pelo sistema
    When o agente identifica a necessidade de entender essas informações
    Then ele transita para specsfy-setup no modo data-discovery antes de concluir o brief
    And registra somente respostas confirmadas em .specsfy/DATABASE.md
