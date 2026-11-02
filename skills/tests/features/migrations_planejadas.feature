@specsfy @database
Feature: Conferir migrations planejadas
  Para que mudanças persistentes não terminem apenas no model ou na query
  Como pessoa que executa uma spec
  Quero exigir a criação, a aplicação e a conferência de cada migration

  Scenario: Recusar plano de banco sem migration
    Given os validadores de tarefas e comprovação do Specsfy
    When o contrato de migrations planejadas é inspecionado
    Then toda alteração estrutural do banco exige uma tarefa MIGRATION

  Scenario: Recusar migration sem aplicação comprovada
    Given os validadores de tarefas e comprovação do Specsfy
    When o contrato de migrations planejadas é inspecionado
    Then a conclusão exige arquivo aplicação e consulta de estado

  Scenario: Aceitar runner declarado pelo consumidor
    Given um projeto com apply e status válidos em .specsfy/migrations.json
    When uma tarefa MIGRATION registra arquivo existente e ambos os comandos com saída zero
    Then o contrato estrito aceita a conclusão sem executar o runner

  Scenario: Recusar configuração inválida do runner
    Given um projeto com .specsfy/migrations.json inválido
    When o contrato estrito de comprovação é verificado
    Then o resultado informa o arquivo de configuração e termina com falha

  Scenario: Registrar o runner na stack
    Given um projeto com .specsfy/migrations.json
    When a stack é atualizada duas vezes
    Then STACK.md registra o runner e a segunda execução não altera os arquivos
