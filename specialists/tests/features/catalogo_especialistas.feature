@specsfy @specialists
Feature: Catálogo de especialistas sob demanda
  Para carregar somente o contexto técnico necessário
  Como pessoa mantenedora de um projeto consumidor
  Quero instalar skills especialistas com namespace inequívoco

  Scenario: Publicar o catálogo completo da stack Promovaweb
    Given o catálogo versionado de especialistas
    Then todas as skills usam o prefixo specsfy-specialist-
    And Laravel, Supabase, Postgres, Redis, Docker, servidores, React e Nextjs estão no catálogo, com suporte a Swarm, Ansible e Debian
    And shadcn/ui, design system, UI, UX e acessibilidade têm modos próprios em componentes e interface

  Scenario: Publicar especialistas autocontidos
    Given uma skill especialista do catálogo
    Then seu nome, diretório e prompt padrão coincidem
    And ela segue o template técnico completo
    And ela publica referências técnicas com fontes primárias

  Scenario: Padronizar a evolução do catálogo
    Given o template de autoria de especialistas
    Then o template define todas as seções obrigatórias
    And o guia define a qualidade do corpo e das referências

  Scenario: Delimitar especialistas relacionados sem ambiguidade
    Given uma skill especialista do catálogo
    Then toda skill relacionada declara a fronteira recíproca

  Scenario: Preservar autoria e linguagem próprias
    Given todos os arquivos publicados no catálogo
    Then nenhuma referência ao repositório auditado permanece

  Scenario: Combinar design de UI com referências React reutilizáveis
    Given o catálogo versionado de especialistas
    Then os especialistas de componentes e interface orientam uso conjunto
    And as famílias de componentes React estão disponíveis como assets copiáveis

  Scenario: Gerenciar pacotes Laravel a partir do GitHub
    Given o catálogo versionado de especialistas
    Then o especialista Laravel oferece um modo para gerenciar pacotes
    And esse modo define instalação e documentação em docs/packages
    And specify e implement consultam os pacotes já instalados

  Scenario: Orquestrar deploy completo em Docker Swarm
    Given o catálogo versionado de especialistas
    Then o especialista de entrega coordena deploy e SEMVER com Docker, Swarm, servidor e Ansible
    And o gerador publica Compose local, stack de produção e playbook completo
    And o modo pipeline integra testes, publicação, promoção e rollback
