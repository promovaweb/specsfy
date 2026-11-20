# Módulos e responsabilidades

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | ownership dos módulos |
| Autoridade | responsabilidades e limites internos |

## Papel

Definir onde cada responsabilidade deve ser implementada e documentada.

## Como usar

Consulte antes de criar ou mover arquivos entre módulos.

## Estrutura

| Caminho | Responsabilidade |
| --- | --- |
| `./` | integração, automação e testes transversais |
| `brand/` | identidade visual, verbal e ativos normativos |
| `skills/` | metodologia executável, scripts e referências |
| `docs/README.md` | roteador dos públicos, sem conteúdo temático próprio |
| `docs/user/` | documentação oficial para usuários finais |
| `docs/develop/` | metodologia e contexto técnico para contribuidores |
| `example/` | aplicação interna e documentação operacional |
| `specsfy/` | tutorial público detalhado |
| `specialists/` | catálogo técnico opcional |
| `cli/` | executável Bun com CLI, TUI e servidor MCP, instalação e progresso |

Todos compartilham a raiz Git, remoto, branch, histórico, issues, tags e
releases do monorepo
[`promovaweb/specsfy`](https://github.com/promovaweb/specsfy).

## Componentes

| Módulo | Responsabilidade |
| --- | --- |
| `skills/specsfy-<NN>-*/` e skills transversais | fluxo base da metodologia |
| `skills/specsfy-setup/` | contexto persistente e blocos de agentes |
| `skills/specsfy-documentator/` | documentação técnica do consumidor |
| `skills/specsfy-aux-*/` | stack, regras e persistência do consumidor |
| `specialists/specsfy-specialist-*/` | padrões opcionais sob demanda |
| `cli/src/` | comandos TypeScript, TUI, instalação e runners |
| `.agents/skills/specsfy-monorepo-documentator/` | documentação oficial |
| `cli/.agents/skills/specsfy-release-cli/` | publicação de versões do CLI |
| `tests/` | contratos integrados |
| `example/` | validação em aplicação Laravel |

## Limites entre módulos

- Uma skill não absorve o gatilho principal de outra.
- Scripts reutilizáveis permanecem na skill responsável.
- Uma mudança transversal pode alterar vários módulos no mesmo PR.
- A raiz não cria `specs/` nem instala skills consumidoras.
- Skills locais da raiz não entram no catálogo de `skills/`.
- O documentador local publica nos percursos `docs/user/` e `docs/develop/`.
- A classificação e sincronização dos dois percursos seguem o
  [contexto documental](../documentation.md).
- A release local altera artefatos em `cli/` e publica tag e release no
  monorepo.
- `example/README.md` documenta o aplicativo. `docs/user/` orienta usuários do
  método.

## Atualize quando

- um módulo surgir, desaparecer ou mudar de responsabilidade.

## Não use para

- inventariar cada arquivo.
- descrever tarefas temporárias.

## Fonte da verdade e precedência

Este documento governa ownership transversal. A árvore e os testes comprovam o
estado implementado.
