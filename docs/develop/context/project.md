# Projeto e produto

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | finalidade e limites transversais do Specsfy |
| Autoridade | limites do produto no monorepo oficial |

## Papel

Definir por que o Specsfy existe e quais limites condicionam sua evolução.

## Como usar

Leia antes de mudar finalidade, público, topologia ou limites do produto.

## Fonte da verdade e precedência

Este documento governa o contexto transversal. Cada entrega consumidora mantém
sua formulação normativa em `specs/<estado>/<NNNN>-<slug>/spec.md`. A
[raiz do monorepo](../../../README.md) apresenta o método, `specsfy/` mantém o
tutorial detalhado, `docs/user/` orienta usuários e `docs/develop/` orienta
agentes e contribuidores.

## Problema e finalidade

O Specsfy reduz a distância entre intenção, comportamento aceito, testes,
tarefas, implementação e evidência. Ele evita que planos e checklists paralelos
divirjam da especificação da fatia.

Inputs podem permanecer em `specs/inbox/` como capturas sem refinamento do backlog. Ideias
escolhidas para refinamento podem permanecer no backlog antes da decisão de
criar uma spec. Uma captura só sai da fila ativa, para `specs/inbox/processed/`,
quando specs com Definition Gate aprovado cobrem o pedido inteiro.
Pedidos posteriores à definição atualizam explicitamente a mesma spec, reabrem
somente os atos invalidados e retomam o trabalho.

O projeto é publicado como um único monorepo em
[`promovaweb/specsfy`](https://github.com/promovaweb/specsfy). Seus módulos
preservam responsabilidades: `specsfy/` apresenta, `docs/` documenta em dois
percursos governados pelo
[contexto documental](documentation.md), `skills/`
implementa a metodologia, `specialists/` oferece contexto opcional, `cli/`
instala e projeta progresso, `brand/` governa a identidade, a raiz integra e
`example/` valida.

`example/` exercita o framework em um produto real, mas não redefine a
metodologia nem sua documentação oficial para usuários.

## Limites normativos

- não decide requisitos materiais pela pessoa responsável.
- não transforma research em fonte normativa.
- não autoriza implementação sem RED BDD e TDD.
- não substitui runtime, banco ou infraestrutura do produto consumidor.
- não mistura responsabilidades dos módulos, embora compartilhem raiz Git.
- não promove documentação operacional de `example/` a guia oficial.
- não instala skills consumidoras na raiz do monorepo.

## Atualize quando

- a finalidade, o público ou os limites mudarem.
- a topologia ou responsabilidade de um módulo mudar.

## Não use para

- detalhar uma feature.
- substituir spec, teste ou fonte executável.
