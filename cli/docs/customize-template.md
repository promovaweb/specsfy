# Personalizar o template

Este repositório é um template do GitHub. Crie o repositório com
**Use this template** e abra o clone no agente. Para fazer o setup, peça:

> Use termfy-init para preparar este projeto com o nome mycli e o título
> My CLI. A ferramenta vai consultar pedidos da loja.

A skill confirma os campos que faltarem, instala as dependências, aplica a
identidade, confere as skills e chama `termfy-clispec` para descrever o
binário e `termfy-spec` para a primeira spec.
O agente executa os comandos internos, regenera o OpenCLI e verifica os
três modos do binário. A publicação fica com `termfy-release`, quando
você solicitar.

O setup troca a identidade do binário em `package.json`, `README.md`,
`AGENTS.md`, `.env.example` e nos workflows. As referências ao framework
continuam com o nome Termfy: as skills `termfy-*`, os repositórios
`promovaweb/termfy*` e as frases que citam o starter kit. O projeto novo
começa na versão `0.1.0`, com um `CHANGELOG.md` próprio, e não herda a URL
do repositório do template quando ela não é informada.

Para mudar a identidade depois do setup, use `termfy-brand`.

## O que mudar depois

| Quer | Onde |
| --- | --- |
| novo command | `template/command/example.ts` → `src/cli/commands/`, registrar em `src/cli/commands.ts` |
| nova aba | `template/screen/example.ts` → `src/tui/screens/`, registrar em `src/tui/screens/index.ts` |
| nova tool MCP | `template/tool/example.ts` → `src/mcp/tools/`, registrar em `src/mcp/server.ts` |
| nova key de configuração | `SETTINGS_SCHEMA` em `src/config/settings.ts` |
| novo exit code | `src/app/exit-codes.ts` e `src/app/errors.ts` |
| credits e links | `src/app/manifest.ts` e bloco `termfy` do `package.json` |
| cores da TUI | `src/tui/theme.ts` |

## Skills

As skills do framework [`promovaweb/termfy`](https://github.com/promovaweb/termfy)
estão instaladas em `.agents/skills/` e registradas em `skills-lock.json`.
Elas ensinam um agente a evoluir o projeto:

| Skill | Uso |
| --- | --- |
| `termfy` | porta de entrada: descrever a ferramenta em uma frase e deixar a skill conduzir o ciclo |
| `termfy-init` | criar o binário a partir do template; o primeiro commit fica com você |
| `termfy-brand` | ajustar nome, título, descrição, autor, links, créditos e paleta |
| `termfy-clispec` | descrever o binário no `CLISPEC.md` e manter a visão macro |
| `termfy-spec` | escrever cada spec de evolução em `specs/` |
| `termfy-api-import` | converter a documentação de uma API em entradas da spec |
| `termfy-api` | client HTTP de serviço externo |
| `termfy-command-set` | família `recurso verbo` com tools e screen |
| `termfy-cli` | commands, options, saída texto/JSON, exit codes e OpenCLI |
| `termfy-tui` | screens, componentes, tema e o visual modern unix |
| `termfy-mcp` | tools, resources, prompts e testes com o Inspector |
| `termfy-config` | settings, credenciais, master key e variáveis |
| `termfy-database` | banco SQLite com migrations, só quando a pessoa pede |
| `termfy-test` | testes de CLI, MCP, TUI e config |
| `termfy-review` | auditoria da entrega por gravidade |
| `termfy-docs` | melhorar a documentação embutida e passar no `docs:check` |
| `termfy-release` | versão, changelog, tag e release |
| `termfy-mcp-client` | configuração nos clientes de agente |

Para atualizar ou reparar as skills, use `termfy-init` no modo de
manutenção. O agente executa os comandos internos e confere a instalação,
os links dos agentes e a compatibilidade. As instruções são alteradas no
framework e distribuídas para os projetos derivados.
