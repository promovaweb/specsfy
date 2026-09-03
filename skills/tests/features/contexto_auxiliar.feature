@specsfy @context
Feature: Contexto auxiliar persistente do projeto
  Para oferecer contexto técnico confiável sem apagar conhecimento humano
  Como pessoa que aplica o Specsfy
  Quero manter projeto, stack, regras e banco em arquivos canônicos

  @FR-001 @FR-002 @FR-003 @AC-001
  Scenario: Preparar o contexto de um projeto conhecido
    Given um projeto Laravel, Next ou Astro ainda sem contexto auxiliar
    When a skill specsfy-setup é executada
    Then PROJECT.md existe na raiz do projeto
    And STACK.md, RULES.md, DATABASE.md e USER-PROFILE.md existem sob .specsfy
    And os modelos refletem o stack observado
    And AGENTS.md e CLAUDE.md reservam um bloco para as diretrizes do framework
    But o setup não inicia versionamento nem deploy sem pedido explícito

  @FR-004 @FR-005 @AC-002
  Scenario: Reconciliar arquivos que já possuem conteúdo do usuário
    Given arquivos auxiliares com dados adicionados pela pessoa
    When setup ou uma skill specsfy-aux é executada novamente
    Then o conteúdo existente permanece no arquivo
    And o perfil de interação existente permanece com nível confirmado
    And somente observações novas e ausentes são acrescentadas
    And instruções do usuário fora do bloco Specsfy permanecem intactas

  @FR-006 @FR-007 @AC-003
  Scenario: Manter o mapa de dados junto com mudanças persistentes
    Given uma migration ou estrutura de banco criada no projeto
    When a skill mantenedora do banco é executada
    Then DATABASE.md registra a estrutura em tabelas Markdown
    And as notas e decisões humanas continuam intactas

  @FR-008 @FR-009 @AC-004
  Scenario: Detectar documentação pendente durante a implementação
    Given mudanças em código da aplicação, manifests ou estruturas persistentes
    When o monitor de contexto compara os caminhos alterados
    Then ele exige STACK.md para mudanças estruturais de stack
    And exige DATABASE.md para mudanças de banco ou migration
    And exige revisão explícita de PROJECT.md para mudanças da aplicação
    And a entrega não conclui enquanto uma obrigação documental estiver aberta

  @FR-010 @FR-011 @FR-012 @AC-005
  Scenario: Adaptar um projeto existente do GitHub Spec Kit
    Given uma constituição e artefatos do GitHub Spec Kit em specs
    When a skill specsfy-setup é executada
    Then a projeção SPECKIT.md referencia a constituição e todos os artefatos
    And as diretrizes do Specsfy exigem a leitura das fontes originais
    And nenhum arquivo do GitHub Spec Kit é alterado ou removido
