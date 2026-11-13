# Instruções para agentes

Este repositório é o binário `specsfy`, a ferramenta do método Specsfy. Um
único executável em Bun tem três modos: sem argumentos abre a TUI; com
argumentos roda como CLI com saída em texto ou `--json`; `<bin> mcp` vira
servidor Model Context Protocol via stdio. O mesmo binário instala e atualiza
o framework, lê e altera o estado das specs dentro das regras, roda os gates e
serve tudo isso a agentes de IA.

## Idioma

- Todo o código é em inglês: nomes de arquivos, identificadores, comentários,
  mensagens do binário, commands, options, arguments, keys de configuração e
  campos do `--json`.
- Documentação para pessoas (`README.md`, `docs/`, `CHANGELOG.md`, este
  arquivo) é em português do Brasil, com os termos técnicos em inglês
  preservados (`build`, `stdin`, `flag`, `tool`, `resource`, `command`).
- Respostas ao usuário em português do Brasil.

## Especificação

O binário tem dois tipos de documento de referência:

- `CLISPEC.md`, único, na raiz: a visão macro do binário (identidade,
  propósito, públicos, fora de escopo, superfície entregue e índice das
  specs).
- `specs/NNNN-slug.md`, um por evolução: status, mudanças de superfície,
  como o binário funciona (`Behavior`), como o código deve ser feito
  (`Design`), tarefas e testes em checklist.

Antes de implementar qualquer command, screen ou tool, leia o `CLISPEC.md` e
a spec aberta em `specs/` que cobre o pedido. Se nenhuma cobrir, escreva a
spec primeiro. Siga o `Behavior` e o `Design` da spec, marque os itens da
checklist ao concluir cada entrega e, com tudo marcado, atualize a superfície
e o índice do `CLISPEC.md` e mude o status da spec.

## Ordem de leitura

1. Este arquivo.
2. `CLISPEC.md` e a spec aberta em `specs/`, quando existirem.
3. `docs/architecture.md` para entender as camadas `app`, `config`, `core`,
   `domain`, `engine`, `cli`, `mcp` e `tui`.
4. A skill compatível com a tarefa em `.agents/skills/`. As skills que
   ensinam a evoluir o binário vêm do framework
   [`promovaweb/termfy`](https://github.com/promovaweb/termfy) e estão em
   `.agents/skills/termfy-*`, com links em `.claude/skills/` e registro em
   `skills-lock.json`. Para setup ou manutenção das skills, use `termfy-init`
   no modo correspondente.
5. As `references/` indicadas pela skill. Citar uma referência não substitui
   abri-la.

## Regras que valem para toda mudança

- Toda option, argument, subcommand, tool e key de configuração nasce
  documentada: `description` no registry, linha na tabela de `docs/` e,
  quando for conceito novo, parágrafo em prosa. O `--skill` imprime `docs/`
  inteiro mais a referência gerada do registry, então `docs/` precisa
  continuar correto para quem lê o binário sem o repositório.
- Um command apoiado em script usa `ScriptCommandDef` em
  `src/cli/commands/<grupo>.ts`. A mesma definição gera o command CLI e a
  tool MCP; não escreva as duas à mão.
- Exit codes vêm de `src/app/exit-codes.ts`. Zero é sucesso. Não invente
  números em commands; acrescente a família na tabela.
- Segredos nunca passam por argument, log, erro, `--json` sem `--reveal`,
  tool MCP ou frame da TUI. Leia com `getCredential()`.
- Stdout recebe dados; stderr recebe progresso e avisos. Em `mcp`, stdout é
  do JSON-RPC.
- Um arquivo por grupo de commands, por screen e por grupo de tools. Registro
  central em `src/cli/commands.ts`, `src/tui/screens/index.ts` e
  `src/mcp/server.ts`.
- Cores da TUI só em `src/tui/theme.ts`.
- Node e npm não entram no binário: o projeto usa Bun para rodar, testar e
  compilar. O `npx skills` é a única exceção, por ser a ferramenta oficial de
  distribuição de skills.
- A árvore de `../skills/` é embutida em `src/engine/skills.gen.ts`. Depois de
  mudar qualquer arquivo de `../skills/`, rode `bun run embed` e inclua o
  módulo gerado.
- Documente código novo ou alterado com cabeçalho explicando o propósito do
  arquivo e JSDoc em funções exportadas, em inglês.
- Não edite `.agents/skills/termfy-*`. Mudança de skill acontece no
  framework; aqui ela chega pela manutenção conduzida por `termfy-init`.

## Validação antes de concluir

```bash
cd cli
bun install
bun run validate
```

`validate` encadeia `embed:check`, `typecheck`, `bun test`, `skills:check`,
`opencli:check`, `docs:check` e `build`. `docs:check` exige que todo command,
screen, tool, resource, prompt, key e exit code do código apareça em `docs/`.
Quando o registry de commands mudar, rode `bun run opencli` antes e revise o
diff de `docs/opencli.json`. Confira `git status --short` ao final e preserve
mudanças que já existiam.

Para o check de documentação isolado:

```bash
bun run docs:check
```

## Publicação

A versão do CLI acompanha o `VERSION` do framework. Toda alteração publicada
sai com o mesmo SemVer em `cli/package.json`, entrada em `cli/CHANGELOG.md`,
tag `vX.Y.Z` no monorepo e GitHub Release com os cinco executáveis
(linux-x64, linux-arm64, darwin-x64, darwin-arm64 e windows-x64) e
`SHA256SUMS`. O npm `@promovaweb/specsfy` é o wrapper que baixa o binário da
plataforma.

O fluxo está em `docs/release.md` e, quando existir, na skill
[`specsfy-release-cli`](.agents/skills/specsfy-release-cli/SKILL.md). Tags não
são movidas. Cada publicação atualiza o `CHANGELOG.md` e cria a GitHub
Release.
