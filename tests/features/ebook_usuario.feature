@ebook @documentacao
Feature: Publicar a documentação do usuário como ebook
  Para oferecer uma edição portátil e verificável do guia oficial
  Como pessoa que usa o Specsfy
  Quero receber o percurso docs/user em PDF e EPUB com a identidade da marca

  Scenario: Gerar os dois formatos a partir da fonte oficial
    Given o percurso completo de documentação do usuário
    When o contrato editorial do ebook é inspecionado
    Then PDF e EPUB versionados existem na pasta ebook
    And todas as páginas do usuário aparecem na ordem editorial

  Scenario: Controlar a edição com versionamento semântico
    Given o arquivo de versão do ebook
    When o contrato editorial do ebook é inspecionado
    Then a edição usa uma versão SemVer válida
    And os metadados dos artefatos usam a mesma versão

  Scenario: Manter a edição atual e a anterior
    Given seis edições portáteis em um diretório temporário
    When a retenção do ebook é executada
    Then somente a versão atual e a maior SemVer abaixo dela permanecem
    And arquivos que não representam edições são preservados

  Scenario: Exigir rebuild após qualquer mudança nos docs do usuário
    Given o manifesto verificável do ebook
    When a integridade das fontes e dos artefatos é calculada
    Then o digest cobre recursivamente os docs do usuário
    And os hashes do PDF e EPUB correspondem ao manifesto

  Scenario: Aplicar o sistema visual oficial
    Given as fontes visuais do ebook
    When o contrato editorial do ebook é inspecionado
    Then logo tipografia cores e templates derivam do manual da marca

  Scenario: Ensinar em uma sequência pedagógica única
    Given a ordem canônica de leitura do usuário
    When o percurso pedagógico é inspecionado
    Then metodologia instalação primeiro uso fluxo base operação e avançado aparecem nessa ordem
    And o portal e o ebook usam a mesma sequência

  Scenario: Ocultar o frontmatter documental nos formatos de leitura
    Given páginas do usuário com classificação documental
    When os formatos de leitura são inspecionados
    Then o Markdown preserva a classificação
    And PDF e EPUB omitem o frontmatter de classificação

  Scenario: Manter a navegação dentro do próprio ebook
    Given os artefatos portáteis do guia
    When os links do PDF e EPUB são inspecionados
    Then todos os links clicáveis permanecem dentro do próprio formato
    And os destinos internos do EPUB existem

  Scenario: Explicar a metodologia sem exigir conhecimento prévio
    Given o capítulo público da metodologia
    When a explicação do método é inspecionada
    Then cada etapa explica objetivo participação do usuário e prova técnica
    And ideia backlog spec gates BDD TDD e mudança tardia são explicados em linguagem simples
