# Padrões e referências do Hermes Agent

Hermes Agent é o framework de agentes de IA open source da Nous Research que
roda no terminal, desktop, plataformas de mensagem e IDEs. Esta referência
consolida caminhos, comandos e regras de configuração/autoria verificáveis no
runtime instalado.

## Caminhos canônicos

```text
~/.hermes/config.yaml       Config principal (settings — nunca segredos)
~/.hermes/.env              API keys e segredos SOMENTE (sob $HERMES_HOME)
$HERMES_HOME/skills/        Skills instaladas
$HERMES_HOME/plugins/       Plugins (estendem tools, providers, subcomandos)
~/.hermes/skins/            Temas customizados
~/.hermes/desktop-plugins/  Plugins de UI do app desktop
~/.hermes/tui-widgets/      Widgets da TUI
~/.hermes/state.db          Store canônico de sessões (SQLite + FTS5)
~/.hermes/sessions/         Índice de roteamento do gateway + transcripts
~/.hermes/logs/             Logs do gateway e de erros
~/.hermes/auth.json         Tokens OAuth e pools de credenciais
```

Profiles usam `~/.hermes/profiles/<name>/` com o mesmo layout. Com profile
ativo, resolver o home real por `$HERMES_HOME` — nunca hardcodar `~/.hermes`.

## Instalação e diagnóstico

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes --version
hermes setup          # wizard (model|tts|terminal|gateway|tools|agent)
hermes model          # seletor de model/provider
hermes doctor         # health check (--fix aplica correções)
hermes login / logout # OAuth
```

## Referência de comandos do CLI

- Chat: `hermes` (interativo), `hermes chat -q "..."` (one-shot),
  `hermes --continue` (resume última sessão), `hermes --resume <id>`.
- Config: `hermes config show|edit|get|set|unset|path|env-path|check|migrate`.
  Ajuste SEMPRE por `hermes config set <seção>.<chave> <valor>`.
- Tools/toolsets: `hermes tools` (curses), `hermes tools list`,
  `hermes tools enable|disable <nome>`.
- Skills: `hermes skills list|browse|search|inspect|install|check|update|
  uninstall|publish|config`, `hermes skills tap add <repo>`.
- MCP: `hermes mcp add <nome> (--url|--command)`, `hermes mcp list`,
  `hermes mcp test <nome>`, `hermes mcp catalog|install|configure`, `serve`.
- Gateway: `hermes gateway run|install|start|stop|restart|status|setup`
  (20+ plataformas: Telegram, Discord, Slack, WhatsApp, iMessage, Signal,
  Email, SMS, Matrix, ...).
- Cron/webhooks: `hermes cron list|create <schedule>|edit|pause|resume|run|
  remove|status`, `hermes webhook subscribe|list|remove|test`.
- Sessões: `hermes sessions list|browse|rename|delete|export|prune|stats`.
- Credenciais: `hermes auth`, `hermes auth add|list|remove|reset|status`
  (pool com rotação automática).
- Outros: `hermes desktop`/`gui`, `hermes dashboard`, `hermes proxy`,
  `hermes profile list|create|use|show`, `hermes memory setup|status|off|reset`,
  `hermes skin list|use|set`, `hermes pets`, `hermes logs [-f] [errors]`,
  `hermes update`, `hermes --help`.

## Seções de `config.yaml` (chaves mais usadas)

| Seção | Chaves |
| --- | --- |
| model | default, provider, base_url, api_key, context_length, aliases |
| agent | max_turns (90), tool_use_enforcement, service_tier, verify_on_stop |
| terminal | backend (local/docker/ssh/...), cwd, timeout (180) |
| compression | enabled, threshold (0.50), target_ratio (0.20) |
| display | skin, interface (cli/tui), language, show_reasoning, show_cost |
| approvals | mode (smart/manual/off), timeout, cron_mode |
| stt | enabled, provider (local/groq/openai/mistral/...) |
| tts | provider (edge/elevenlabs/openai/minimax/...) |
| memory | memory_enabled, user_profile_enabled, provider, write_approval |
| security | redact_secrets, tirith_enabled, website_blocklist |
| delegation | model, provider, max_concurrent_children, max_spawn_depth |
| checkpoints | enabled, max_snapshots (50) |
| curator | enabled, consolidate, interval_hours, stale_after_days |

`hermes config check` reporta seções ausentes de um config antigo.

## Toolsets

web, browser, terminal, file, code_execution, coding, computer_use, vision,
image_gen, video, tts, skills, memory, session_search, delegation, cronjob,
clarify, todo, kanban, safe, e integrações de serviço (spotify, discord, ...).
Mudança de toolset faz efeito em `/reset` (sessão nova), nunca no meio da
conversa, para preservar o prompt cache.

## Arquivos de contexto do projeto

Ordem de descoberta (primeiro que casa vence; só uma fonte por sessão):

| Arquivo | Descoberta |
| --- | --- |
| `.hermes.md` / `HERMES.md` | sobe até a raiz git (herança raiz → pacote) |
| `AGENTS.md` / `agents.md` | só cwd (portátil entre agentes) |
| `CLAUDE.md` / `claude.md` | só cwd |
| `.cursorrules` | só cwd |

`SOUL.md` (em `$HERMES_HOME`) define identidade, não regras de projeto. Cada
arquivo é limitado a 20.000 caracteres (head+tail quando excede). Todos passam
pelo scanner de prompt injection antes do system prompt. `hermes --ignore-rules`
desativa a injeção de contexto/regras para isolar problema.

## Regras de autoria de SKILL.md (frontmatter)

- Começa com `---` no byte 0; fecha com `\n---\n`; parseia como YAML mapping.
- Campos: `name` (lowercase-hyphenated, ≤64 chars), `description` (≤60 chars,
  uma frase, termina em ponto, sem marketing, sem repetir o name, sem `:` sem
  aspas), `version` (0.1.0), `author`, `license`, `platforms`, e
  `metadata.hermes.{tags, related_skills}`.
- `author` credita o humano primeiro: `Nome (handle), Hermes Agent`.
- `platforms` auditado pelo que a skill/scripts realmente invocam
  (osascript→macos; apt/systemctl→linux; stdlib→todos), nunca copiado de outra.
- Corpo: intro (o que faz/não faz/dependência), `## When to Use`,
  `## Prerequisites`, `## How to Run`, `## Quick Reference`, `## Procedure`,
  `## Pitfalls`, `## Verification`. Ferramentas do Hermes citadas por nome
  (`terminal`, `read_file`, `patch`, `search_files`), não shell cru.
- Material volumoso em `references/*.md`, `templates/`, `scripts/` — linkado por
  caminho relativo, nunca inline. Nunca caminhos locais de máquina.

## Invariantes rígidos

- Segredos em `.env`, settings em `config.yaml`.
- Nunca editar `config.yaml` à mão (usar `hermes config set`).
- Caminhos de profile por `$HERMES_HOME`/`get_hermes_home()`.
- Nunca quebrar o prompt cache: não mudar contexto passado, toolsets ou system
  prompt no meio da conversa (só via `/reset`/nova sessão).
- Alternância de roles de mensagem (nunca dois assistant/user seguidos).

## Fontes oficiais

- Documentação: https://hermes-agent.nousresearch.com/docs/
- Repositório: https://github.com/NousResearch/hermes-agent
- Instalador: https://hermes-agent.nousresearch.com/install.sh
- CLI: https://hermes-agent.nousresearch.com/docs/reference/cli-commands
- Configuração: https://hermes-agent.nousresearch.com/docs/user-guide/configuration
- Providers: https://hermes-agent.nousresearch.com/docs/integrations/providers

Confirme a versão instalada (`hermes --version`) e o `$HERMES_HOME` efetivo
antes de usar qualquer comando ou chave — subcomandos de plugin só existem
quando o plugin está instalado/ativo.
