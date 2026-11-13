# Dependências arquiteturais

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | direção das dependências transversais |
| Autoridade | relações permitidas e proibidas |

## Papel

Impedir ciclos de autoridade e dependências contrárias ao ownership.

## Como usar

Leia antes de adicionar importação, chamada, link ou integração entre módulos.

## Direção

```text
specsfy/ ──orienta usuário──► docs/
docs/ ──documenta uso───────► skills/
brand/ ──governa identidade─► publicações
raiz ──integra e testa──────► módulos
example/ ──exercita─────────► metodologia + contratos
cli/ ──instala──────────────► skills/ + specialists/
cli/ ──consulta catálogo/tags autenticados──► GitHub + cache local

AGENTS.md ──orienta──► skills ──executam──► spec.md
input ─► inbox ─► backlog ─► spec.md
spec.md ─► tarefas + testes ─► entrega
pedido tardio ─► update-spec ─► spec.md
implement ─► documentator ─► <projeto>/docs/ + <projeto>/.specsfy/PACKAGES.md
package-manager ─► Composer autorizado ─► <projeto>/docs/packages/
fontes dos módulos ─► monorepo-documentator ─► docs/
release-cli ─► cli/CHANGELOG.md + versão + binário ─► tag + GitHub Release ─► npm local
```

- Links entre módulos usam caminhos relativos.
- Commits e pull requests pertencem à raiz única.
- O CLI clona o monorepo e seleciona `skills/` ou `specialists/`.
- A raiz oficial não é destino válido para instalação consumidora.
- Catálogo e updater autenticam na API pelo ambiente ou pela sessão do `gh`.
  Somente o updater grava metadados no cache e delega upgrade ao npm.
- Especialistas exigem autorização específica.
- Documentação derivada não redefine código, manifests, schemas ou specs.

## Dependências proibidas

- Research como fonte normativa.
- Contexto redefinindo comportamento de spec.
- Código de produção dependendo de fixture.
- Gate posterior compensando gate anterior inválido.
- Skill transferindo autoridade da fonte.
- Raiz Git interna, gitlink ou submódulo nos módulos.
- Duplicação de conteúdo normativo entre módulos.

## Atualize quando

- uma direção, exceção ou limite mudar.

## Não use para

- registrar versões de pacote.
- substituir testes de dependência.

## Fonte da verdade e precedência

Este documento governa direções conceituais. Código e testes demonstram as
dependências implementadas no
[`monorepo`](https://github.com/promovaweb/specsfy).
