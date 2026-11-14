# Créditos do Specsfy

Esta página registra a autoria pública do Specsfy e aponta as fontes usadas para
confirmar contribuições, identidade visual e componentes relacionados. O
histórico Git preserva a autoria detalhada de cada mudança.

## Projeto e manutenção

Specsfy é um projeto da [Promovaweb](https://promovaweb.com), criado e mantido
por **Luiz Eduardo Oliveira Fonseca** com a comunidade. O contato público do
projeto é [contato@promovaweb.com](mailto:contato@promovaweb.com).

## Comunidade

Contribuições em documentação, código, testes e pesquisa fazem parte da
evolução do projeto. O histórico do monorepo preserva a autoria de cada arquivo
e commit, por isso este guia não mantém uma lista manual que ficaria
desatualizada.

## Identidade

Logos, cores, tipografia, voz, acessibilidade e orientações de aplicação
pertencem
ao diretório [`brand/`](../../brand/). Use os
ativos e orientações desse diretório ao apresentar o projeto.

## Componentes relacionados

O instalador do Specsfy delega a instalação de skills ao projeto
[`vercel-labs/skills`](https://github.com/vercel-labs/skills). O CLI pode usar
o executável `skills` ou o fallback por `npx`, conforme documentado no
[guia de instalação](installation.md).

## Inspirações e fontes

O Specsfy desenvolve um contrato executável próprio e reconhece estas
referências como inspiração:

- [GitHub Spec Kit](https://github.github.com/spec-kit/): aplicação de
  specification-driven development em etapas próximas ao código.
- [OpenSpec](https://openspec.dev/): especificações e mudanças mantidas no
  repositório como um acordo leve entre o desenvolvedor responsável e o agente.
- [*Categorias*, de Aristóteles](https://classics.mit.edu/Aristotle/categories.html):
  referência filosófica para classificar objetos, atributos, relações e
  estados antes de formular afirmações sobre eles.

As referências não são dependências do Specsfy e não tornam os métodos
equivalentes. As skills, os templates, os validadores e os testes deste
repositório continuam sendo as fontes do comportamento executável.

## Como contribuir

Localize primeiro o diretório responsável no
[quadro dos módulos](../develop/modules.md), leia as instruções locais e preserve
os limites de cada repositório Git. A documentação oficial fica neste
repositório. O comportamento executável e os testes permanecem no módulo que
implementa cada recurso.

O histórico e os arquivos de licença de cada repositório comprovam autoria e
licenciamento. Quando uma licença não estiver declarada, não presuma seus
termos. A identidade oficial do Specsfy permanece no diretório `brand/` do
repositório.
