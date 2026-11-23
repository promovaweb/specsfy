@logo-specsfy
Feature: Sistema oficial de logo do Specsfy
  Para manter uma identidade única em todo o monorepo
  Como equipe responsável pela marca
  Quero derivar o guia do símbolo de checklist

  Scenario: Publicar o novo logo canônico
    Given os novos arquivos SVG e PNG do logo
    When a construção vetorial é inspecionada
    Then o logo preserva o requisito marcado e a caixa em aberto
    And o PNG preserva a prancheta quadrada de 512 pixels

  Scenario: Documentar todas as regras do logo
    Given o manual normativo LOGO.md
    When o contrato de identidade visual é inspecionado
    Then variantes proteção tamanho restrições cores e acessibilidade estão definidos
    And os guias de marca descrevem somente as variantes oficiais

  Scenario: Exibir o logo em todos os READMEs do monorepo
    Given os READMEs versionados encontrados recursivamente
    When a adoção do novo logo nesses arquivos é inspecionada
    Then todos os READMEs usam o SVG canônico com fallback PNG

  Scenario: Publicar o manual de marca em PDF a partir das novas fontes
    Given a fonte Markdown do guia completo de marca
    When o contrato de build do manual é inspecionado
    Then o PDF canônico fica na raiz do repositório de marca
    And o build rastreia LOGO.md SVG PNG HTML Markdown e CSS
