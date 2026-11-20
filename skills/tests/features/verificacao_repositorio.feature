@specsfy @validation
Feature: Verificação do catálogo instalado
  Para validar projetos consumidores com contexto técnico opcional
  Como mantenedor da metodologia
  Quero aceitar as dez skills base junto de especialistas válidos

  Scenario: Validar catálogo base com especialistas instalados
    Given um projeto com dez skills base e dois especialistas válidos
    When o contrato do catálogo instalado é executado
    Then o catálogo completo é aceito sem enfraquecer as skills base
