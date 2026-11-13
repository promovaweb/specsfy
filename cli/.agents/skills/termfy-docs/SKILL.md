---
name: termfy-docs
description: Melhora a documentação embutida do binário (docs/ impressa por --skill), conferindo cobertura contra o registry com docs:check, legibilidade para agentes e pessoas, exemplos executáveis e opencli.json atualizado.
---

# Melhorar a documentação embutida

Use esta skill quando a pessoa pedir para revisar, completar ou reescrever a
documentação do binário, quando `bun run docs:check` falhar, ou ao final de
uma entrega que criou command, option, screen, tool ou key sem texto
correspondente. O alvo é a pasta `docs/` do projeto derivado: ela entra no
binário e sai por `--skill`, pela tool MCP `skill` e pela resource
`<bin>://skill`.

## Leia antes

- `AGENTS.md` do repositório.
- `docs/README.md` e todos os arquivos de `docs/` do projeto.
- A saída de `bun run dev -- --skill` inteira, lida como um agente que só
  tem o binário leria.
- `bun run dev -- --skill reference`: a referência gerada do registry, que
  é a verdade sobre commands, options e exit codes.
- A spec aberta em `specs/NNNN-slug.md`, quando houver:
  o Behavior diz o que a documentação precisa explicar, e os itens
  `#termfy-docs` de Tasks dizem o que esta skill entrega.
- `references/checklist.md`: o que uma documentação embutida precisa ter.
- `references/writing.md`: como escrever para pessoas e agentes ao mesmo
  tempo.

## Regras

1. A referência de commands é gerada do registry; não a copie à mão em
   `docs/cli.md`. A prosa explica conceito, fluxo e exemplo; a lista exata de
   options vem do `--skill reference`.
2. Todo command, screen, tool, resource, prompt e key de configuração tem ao
   menos uma menção em `docs/`, na tabela da seção certa. `bun run
   docs:check` falha quando falta.
3. Cada seção de `docs/` responde a uma pergunta de quem usa: o que é, como
   entrar, o que sai, o que pode falhar e com qual exit code.
4. Exemplos são linhas executáveis, começando pelo nome do binário, com a
   saída esperada quando ela couber em poucas linhas.
5. Placeholders `{{bin}}`, `{{title}}`, `{{version}}` e `{{BIN}}` no lugar de
   nomes literais, para que `bun run init` não exija edição de `docs/`.
6. Termos de código em inglês, como no código; prosa no idioma da
   documentação do projeto. Sem travessão como pontuação e sem clichês de
   abertura ou fechamento.
7. `docs/opencli.json` é regenerado com `bun run opencli` sempre que o
   registry muda. Não o edite à mão.
8. `docs/` não descreve o framework nem as skills; isso é do guia do
   framework. Descreve o binário.

## Passos

1. Rode `git status --short`, `bun run docs:check` e `bun run opencli:check`.
2. Leia `bun run dev -- --skill` do começo ao fim e anote onde um agente
   travaria: conceito citado sem explicação, command sem exemplo, exit code
   sem causa, key sem padrão.
3. Corrija as faltas apontadas por `docs:check` primeiro: toda entrada do
   registry precisa de linha na tabela e, quando for conceito novo, de um
   parágrafo.
4. Reescreva as seções fracas seguindo `references/writing.md`. Prefira
   cortar a inflar.
5. Rode `bun run opencli` se o registry mudou e `bun run docs:check`.
6. Releia `bun run dev -- --skill <topic>` de cada topic alterado.
7. Rode `bun run validate`.
8. Troque `[ ]` por `[x]` nos itens `#termfy-docs` concluídos da spec
   aberta. O fechamento da spec fica com `termfy-spec`, quando todos os
   itens estiverem marcados.

## Marcos

`docs:check` verde; leitura completa do `--skill` sem trava; exemplos
conferidos; `validate` verde.

## Saída

Liste os arquivos de `docs/` alterados, as faltas corrigidas, as seções
reescritas e os comandos de validação executados.

## Compatibilidade

Starter kit a partir da v0.9.0, com specs em Markdown puro e sem command
`spec`. Caminhos citados: `docs/README.md`, `docs/cli.md`,
`docs/tui.md`, `docs/mcp.md`, `docs/configuration.md`, `docs/exit-codes.md`,
`docs/opencli.json`, `scripts/check-docs.ts` e os scripts `docs:check`,
`opencli` e `opencli:check`.
