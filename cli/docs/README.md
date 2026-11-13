# Documentação do {{title}}

`{{bin}}` é a ferramenta do método Specsfy: instala e atualiza o framework, lê e altera o estado das specs dentro das regras, roda os gates e serve tudo isso a agentes de IA. É um executável único com três modos de uso:

| Modo | Como entrar | Para quem |
| --- | --- | --- |
| TUI | `{{bin}}` sem argumentos em um terminal interativo | pessoas acompanhando o projeto |
| CLI | `{{bin}} <command> [options]`, com saída em texto ou `--json` | pessoas, scripts e CI |
| MCP | `{{bin}} mcp`, servidor Model Context Protocol via stdio | agentes de IA |

Os três modos compartilham a mesma identidade (`src/app/manifest.ts`), a
mesma configuração (`~/.{{bin}}/settings.json`), o mesmo cofre de credenciais
(`~/.{{bin}}/credentials.json`, cifrado) e a mesma tabela de exit codes.

## Para agentes

Comece por `project_status` (MCP) ou `{{bin}} status --json` para ver o
projeto. Onde uma tool ou command pede `spec`, vale o número (`1`,
`0001`), o nome da pasta, o slug sem número ou o caminho do `spec.md`. Todo
command de projeto aceita `--project <dir>`; sem ele, a raiz é a pasta mais
próxima, subindo a partir da atual, que tem `specs/`, `.specsfy/` ou
`skills-lock.json`. Gates reprovados saem com o exit code 10
(`GATE_FAILED`).

O binário carrega os scripts, templates e regras das skills do framework e
os executa com o próprio runtime, sem Node.js. Prefira o command ou a tool a
rodar `node scripts/<arquivo>.mjs` de uma skill.

## Mapa

- [cli.md](cli.md): commands, opções globais, convenções de saída e a referência gerada do registry.
- [tui.md](tui.md): abas, teclas, tema e como criar uma screen.
- [mcp.md](mcp.md): tools, resources, prompts e configuração nos clientes.
- [configuration.md](configuration.md): settings.json, credentials.json, master key e variáveis de ambiente.
- [exit-codes.md](exit-codes.md): tabela de exit codes e como tratá-los.
- [architecture.md](architecture.md): pastas, camadas e fluxo de execução.
- [release.md](release.md): versão, changelog, tag, GitHub Release e binários.
- [opencli.json](opencli.json): descrição OpenCLI gerada por `bun run opencli`.

## Documentação embutida

Toda esta pasta entra no binário. Um agente pode ler tudo sem acesso ao
repositório:

```bash
{{bin}} --skill          # tudo
{{bin}} --skill cli      # só a seção do CLI, com a referência gerada
{{bin}} --skill mcp --json
```

Os tópicos aceitos são `cli`, `tui`, `mcp`, `config`, `exit-codes` e
`reference`. O topic `reference` contém somente a referência gerada do
registry, com commands, options e exit codes.

## Idioma

O código, os nomes de commands, options, keys de configuração, campos do
`--json` e as mensagens do binário são em inglês. Esta documentação e as
skills do framework são em português do Brasil, com os termos técnicos
preservados em inglês.
