# Specsfy

`specsfy`: Install the Specsfy framework, run the spec lifecycle and its gates, and serve them to agents over MCP.

## Purpose

Quem conduz um projeto com o Specsfy, aluno ou dev da Promovaweb, trabalha
com um agente de IA que cria e move specs em Markdown por `specs/<estado>/`.
As regras do método vivem em scripts `.mjs` copiados dentro de cada skill
(`verify_evidence`, `check_database_safety`, `inspect_project` e outros), que
quebram em casos de borda, como Windows, layouts de raiz e migrations
antigas, e que cada agente chama de um jeito. O CLI anterior instalava as
skills e mostrava o progresso, mas não participava do ciclo da spec.

O `specsfy` é a ferramenta única do método: instala e atualiza o framework,
lê e altera o estado das specs dentro das regras, roda os gates de
evidência, banco e testes, e expõe essas operações ao agente pelo MCP e ao
CI pelo `--json`.

## Audiences

| Público | Modo | Necessidade |
| --- | --- | --- |
| dev ou aluno no terminal | TUI e CLI texto | acompanhar specs e progresso ao vivo, instalar e atualizar skills, rodar testes |
| agente de IA (Claude Code, Codex, OpenCode) | MCP | ler spec, tarefas e gates, transicionar estados, registrar inbox e effort, rodar gates sem chamar scripts `.mjs` |
| CI | CLI `--json` | barrar o PR quando uma spec não tem evidência ou deixa gate pendente, publicar o progresso |

## Out of scope

- Escrever o conteúdo das specs: redação, entrevista e decisões de produto
  continuam com o agente e as skills; o binário cria esqueletos, move estados
  e valida.
- Publicar, fazer deploy ou mexer em servidores: o especialista
  `specsfy-specialist-deploy` mantém o próprio fluxo.
- Integração direta com ClickUp, GitHub Issues ou outros gestores; o
  binário só aponta o handoff para o ClickUpfy quando a skill existe.
- Rodar migrations ou comandos que alteram o banco de dados do projeto.
- Banco local próprio: o estado fica nos arquivos do projeto.

## Surface

### Commands

| Command | Função | Options | `data` no `--json` | Exit codes | Credenciais |
| --- | --- | --- | --- | --- | --- |
| `tui` | Open the terminal interface. | `--tab <overview\|about>` | n/a | 8 | n/a |
| `about` | Show version, executable, runtime, platform and credits. | n/a | `{ bin, title, version, description, executable, runtime, platform, dataDir, credits[] }` | n/a | n/a |
| `config list\|get\|set\|unset\|path\|schema` | Read and write preferences in `~/.specsfy/settings.json`. | `<key>`, `<value>` | key e valor efetivo | 2, 3 | n/a |
| `credentials set\|get\|list\|remove\|status\|clear` | Store encrypted secrets in `~/.specsfy/credentials.json`. | `<name>`, `--stdin` | nomes e origem da master key, sem valores | 2, 4 | n/a |
| `mcp` | Start the MCP server over stdio. | `--list` | n/a | 9 | n/a |
| `skill` | Print the embedded documentation. | `[topic]` | Markdown | 6 | n/a |
| `doctor` | Check runtime, terminal, settings, key source and vault readability. | n/a | `{ checks[], ok }` | 1 | n/a |
| `completion` | Print a completion script. | `<bash\|zsh\|fish>` | script | 2 | n/a |

### Screens

| Screen | Função | Teclas |
| --- | --- | --- |
| `overview` | ambiente, estado de settings e cofre, próximos passos | `←` `→`, `1`-`9`, `?`, `q` |
| `about` | identidade, runtime e créditos | `←` `→`, `1`-`9`, `?`, `q` |

### MCP

| Tipo | Nome | Função | Efeito |
| --- | --- | --- | --- |
| tool | `about` | identidade e runtime do binário | `read` |
| tool | `exit_codes` | tabela de exit codes | `read` |
| tool | `skill` | documentação embutida | `read` |
| tool | `config_list` | keys de `settings.json` com o valor efetivo | `read` |
| tool | `config_get` | valor de uma key | `read` |
| tool | `credentials_status` | nomes salvos e origem da master key, sem valores | `read` |
| tool | `doctor` | diagnóstico de runtime, terminal e configuração | `read` |
| resource | `specsfy://about` | identidade em JSON | `read` |
| resource | `specsfy://exit-codes` | exit codes em JSON | `read` |
| resource | `specsfy://skill` e `specsfy://skill/{topic}` | documentação em Markdown | `read` |
| prompt | `operate` | orienta o agente a ler a documentação e operar pelo CLI | n/a |

### Settings

| Key | Tipo | Padrão | Função |
| --- | --- | --- | --- |
| `output.format` | `enum` (`text`, `json`) | `text` | formato padrão da saída |
| `output.colors` | `boolean` | `true` | cores ANSI no texto |
| `tui.initialTab` | `enum` (`overview`, `about`) | `overview` | aba inicial da TUI |
| `tui.theme` | `enum` (`night`, `day`) | `night` | paleta da TUI |
| `telemetry.enabled` | `boolean` | `false` | reservado, nada é enviado |

## Specs

| ID | Título | Status |
| --- | --- | --- |
| 0001 | Leitura do projeto | in_progress |
| 0002 | Instalar e atualizar o framework | draft |
| 0003 | Ciclo da spec | draft |
| 0004 | Gates e verificação | draft |
| 0005 | Contexto do projeto | draft |
| 0006 | Testes do projeto | draft |
| 0007 | Milestones | draft |
| 0008 | Documentação do projeto | draft |
| 0009 | TUI do projeto | draft |
| 0010 | Skills chamam o binário | draft |
| 0011 | Distribuição | draft |

## Notes

- 2026-11-13: CLI reescrito sobre o Termfy Starter Kit 0.9.2, na branch
  `cli-termfy`, no mesmo caminho `cli/` do CLI anterior (Node 22). A
  versão continua a do framework (0.26.2).
- 2026-11-13: os quatro ganhos fazem parte do escopo: MCP para agentes, CI
  e automação, TUI mais rica e substituição dos scripts `.mjs` das skills.
- 2026-11-13: distribuição por binário compilado (`bun build --compile`)
  por plataforma, em `get.specsfy.dev` e GitHub Releases. O npm
  `@promovaweb/specsfy` vira um wrapper que baixa o binário.
- 2026-11-13: pelo MCP, o agente altera estado (transition, effort,
  inbox, tarefas) desde a primeira fase, sempre dentro das regras do
  método.
- 2026-11-13: blocos 3 a 5 fechados pelo agente com as opções
  recomendadas, por pedido do Luiz para seguir sem novas perguntas: ordem das
  specs como no índice; scripts dos especialistas (`scaffold.mjs`,
  `semver.mjs`) ficam nas skills; as skills passam a indicar o binário e
  mantêm os `.mjs` como alternativa.
- 2026-11-13: o binário embute a árvore `skills/` e executa os scripts com
  o próprio runtime (`BUN_BE_BUN=1`), sem Node.js na máquina.
- 2026-11-13: dados e integrações: API do GitHub (credencial
  `github.token`, com `GH_TOKEN`, `GITHUB_TOKEN` e `gh auth token` como
  alternativas), `npx skills` para materializar skills e os arquivos do
  projeto. Nenhum banco local.
