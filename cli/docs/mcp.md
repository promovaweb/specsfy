# MCP

`{{bin}} mcp` transforma o processo em um servidor Model Context Protocol
sobre stdio. Nada mais é escrito em stdout; diagnósticos vão para stderr.
Qualquer client MCP pode chamar as tools, ler as resources e usar o prompt
registrado.

## Configuração no cliente

A entrada genérica de um servidor MCP é:

```json
{ "command": "{{bin}}", "args": ["mcp"] }
```

No Claude Code, o bloco fica em `mcpServers`:

```json
{
  "mcpServers": {
    "{{bin}}": { "command": "{{bin}}", "args": ["mcp"] }
  }
}
```

O caminho curto é `claude mcp add {{bin}} -- {{bin}} mcp`.

No Codex, o arquivo `~/.codex/config.toml` recebe:

```toml
[mcp_servers.{{bin}}]
command = "{{bin}}"
args = ["mcp"]
```

No OpenCode, o `opencode.json` do projeto ou o arquivo global recebe o
servidor local com o command em lista:

```json
{
  "mcp": {
    "{{bin}}": { "type": "local", "command": ["{{bin}}", "mcp"], "enabled": true }
  }
}
```

Para desenvolvimento, sem compilar, use
`"command": "bun", "args": ["run", "src/main.ts", "mcp"]`.

## Orientação para o agente

1. Comece por `project_status`. Ele devolve specs por estado, progresso,
   gates, backlog e inbox em uma chamada.
2. Aprofunde com `specs_list` e `spec_get`. Use `spec_get` com `content: true`
   quando precisar do Markdown inteiro da spec.
3. Antes de alterar, leia a tool e confirme o efeito. As tools de escrita
   mudam arquivos do projeto e não pedem confirmação.
4. Rode os gates pela tool correspondente. Um gate reprovado devolve
   `isError: true` com os achados no payload; leia o conteúdo antes de tentar
   corrigir.
5. `verify` roda a política inteira e também usa `isError` quando falha. É a
   mesma chamada do CI.

Nenhuma tool devolve o valor de uma credencial. Segredos ficam no cofre, no
CLI, onde há confirmação humana.

## Tools

A coluna Arquivos diz se a tool só lê, altera arquivos do projeto, ou lê e
grava apenas quando uma option pede.

| Tool | Função | Arquivos |
| --- | --- | --- |
| `about` | Versão, executável, runtime, plataforma e créditos do binário. | só lê |
| `exit_codes` | Tabela de exit codes do processo. | só lê |
| `skill` | Documentação embutida, inteira ou por topic. | só lê |
| `config_list` | Cada key de settings.json com o valor efetivo. | só lê |
| `config_get` | Valor de uma key de settings.json. | só lê |
| `credentials_status` | Nomes salvos e origem da master key, sem valores. | só lê |
| `doctor` | Diagnóstico de runtime, terminal e configuração. Devolve `checks` e `ok`, sem valores de credenciais. | só lê |
| `project_status` | Visão geral: specs por estado, progresso, gates, backlog e inbox. | só lê |
| `specs_list` | Lista specs com estado, gates e progresso das tarefas. | só lê |
| `spec_get` | Uma spec com metadados, gates, tarefas e, opcionalmente, o Markdown. | só lê |
| `backlog_list` | Itens de `specs/backlog/`. | só lê |
| `inbox_list` | Capturas de `specs/inbox/`. | só lê |
| `scripts_list` | Scripts do framework embutidos no binário. | só lê |
| `inbox_capture` | Registra uma captura em `specs/inbox/` a partir do texto original, sem interação. | altera |
| `backlog_start` | Cria um item numerado em `specs/backlog/` sem promover uma spec. | altera |
| `spec_create` | Cria uma spec em `specs/draft/` com o próximo número, a partir do template instalado. | altera |
| `spec_research` | Lista e carrega a pesquisa local indexada pela spec e confere as afirmações. | só lê |
| `spec_change_analyze` | Compara a spec no Git com a versão do worktree: IDs e seções alterados e gates a reabrir. | só lê |
| `task_next` | Próxima tarefa pronta da spec com o próximo item da checklist; `all` lista todas. | só lê |
| `delivery_render` | Resumo de entrega: gates, IDs entregues, tarefas, provas e rollback. | só lê |
| `inbox_process` | Move a captura para `specs/inbox/processed/` quando specs com o Definition Gate aprovado a cobrem. | altera |
| `spec_transition` | Move a spec para uma pasta de estado vizinha e espelha o Status. | altera |
| `spec_effort` | Registra o esforço de 1 a 10 com uma justificativa. | altera |
| `specs_migrate` | Move specs dos layouts antigos para as pastas de estado, pelo Status. | altera |
| `task_check` | Marca ou desmarca uma tarefa, ou um item da checklist, no `spec.md`. | altera |
| `gate_spec` | Valida a estrutura da spec no contrato Specsfy/2.0. | só lê |
| `gate_tasks` | Valida as tarefas da seção 14. | só lê |
| `gate_interface` | Valida a fase de interface das tarefas de uma spec com interface para pessoas. | só lê |
| `gate_trace` | Confere a rastreabilidade entre os IDs da spec e os marcadores dos testes. | só lê |
| `gate_acceptance` | Confere se cada item de aceite (AC) tem um resultado aprovado. | só lê |
| `gate_evidence` | Confere as provas materiais das tarefas no Evidence Contract 1. | só lê |
| `gate_findings` | Valida os achados de produto, arquitetura e segurança registrados na spec. | só lê |
| `gate_database` | Confere que os testes usam um banco separado e que um comando não apaga dados. | só lê |
| `verify` | Roda a política inteira do Specsfy e devolve o payload de atestação. | só lê; grava o atestado com `attestation` |
| `context_setup` | Cria o contexto mínimo do projeto e os blocos em `AGENTS.md` e `CLAUDE.md`, sem sobrescrever arquivos existentes. | altera |
| `context_inspect` | Resume as fontes relevantes por grupo: instruções, manifests, rotas, persistência e testes. | só lê |
| `context_interface` | Resume a stack de interface e as rotas e componentes atuais. | só lê |
| `context_monitor` | Aponta os documentos de contexto que precisam de revisão para os arquivos alterados. | só lê; grava acknowledgment com as options |
| `context_stack` | Atualiza o bloco de stack detectada em `.specsfy/STACK.md`. | altera |
| `context_rule` | Acrescenta uma regra confirmada a uma seção de `.specsfy/RULES.md`. | altera |
| `context_database` | Atualiza o bloco de estruturas detectadas em `.specsfy/DATABASE.md`. | altera |
| `context_data` | Registra uma informação confirmada no mapa de dados de `.specsfy/DATABASE.md`. | altera |
| `context_usage` | Estima o tamanho do contexto de uma spec por seção ou ingere o uso de tokens em JSON. | só lê |
| `project_test` | Executa a suíte do projeto com a proteção de banco de testes separado. | só lê; executa processos |
| `milestones_sync` | Reconstrói o progresso dos milestones e o índice de `specs.md`. | altera |
| `milestones_import_mvp` | Importa os requisitos de `MVP.md` como itens de backlog, specs em Draft e o milestone M01. | altera |
| `docs_build` | Reconstrói a documentação do projeto em `docs/` e `.specsfy/PACKAGES.md`; `check` só confere. | altera; `check` só lê |
| `skills_list` | Lista as skills instaladas e as disponíveis no catálogo. | só lê |
| `skills_detect` | Detecta os agentes e skills presentes no projeto. | só lê |
| `framework_install` | Instala as skills base, `.specsfy/` e os blocos gerenciados do projeto. | altera |
| `framework_update` | Atualiza as skills instaladas que continuam intactas. | altera |
| `skills_install` | Instala um ou mais especialistas do catálogo. | altera |
| `skills_remove` | Remove especialistas instalados. | altera |
| `update_check` | Consulta a última versão publicada do binário, sem trocar o executável. | só lê |

As tools `framework_install`, `framework_update`, `skills_list`,
`skills_detect`, `skills_install`, `skills_remove` e `update_check` pertencem
às specs 0002 e 0011. Quando uma versão ainda não as registrar, `mcp --list`
continua sendo a lista efetiva daquela versão.

## Resources

| URI | Conteúdo |
| --- | --- |
| `{{bin}}://about` | identidade e runtime do binário em JSON |
| `{{bin}}://exit-codes` | tabela de exit codes em JSON |
| `{{bin}}://skill` | documentação completa em Markdown |
| `{{bin}}://skill/{topic}` | uma seção; os topics são `cli`, `tui`, `mcp`, `config`, `exit-codes` e `reference` |

## Prompts

| Prompt | Arguments | Função |
| --- | --- | --- |
| `operate` | `task` | orienta o agente a ler a documentação e conduzir a tarefa pelo CLI com `--json` |

## Listar sem iniciar

```bash
{{bin}} mcp --list
{{bin}} mcp --list --json
```

## Testar

```bash
npx @modelcontextprotocol/inspector {{bin}} mcp
```

O Inspector abre uma página local para chamar tools, ler resources e
inspecionar as mensagens JSON-RPC.

## Como adicionar uma tool

1. Para uma tool apoiada em script do framework, declare um
   `ScriptCommandDef` no arquivo do grupo. `registerScriptTools` cria a tool a
   partir do mesmo `name`, `tool`, `params` e `effect` que geram o command
   CLI.
2. Para uma tool nativa, copie `template/tool/example.ts` para
   `src/mcp/tools/<name>.ts`.
3. Declare `inputSchema` com Zod e descreva cada campo com `.describe()`. A
   description da tool diz quando usar e o que ela devolve.
4. Devolva `content` em texto e, quando a saída for estruturada,
   `structuredContent` com o mesmo objeto. Use `isError: true` quando a
   operação falhar.
5. Acrescente a tool ao `catalog.tools` para que `mcp --list` a enxergue.
6. Registre a função em `registerAll` em `src/mcp/server.ts`.
7. Teste com o Inspector e com `bun test`.

Nomes de tools usam `snake_case`. Tools que gravam ou chamam APIs externas
precisam dizer isso na description e nunca devem ecoar segredos na resposta.

A tool `doctor` usa a mesma coleta do command CLI: confere runtime, terminal,
permissões da pasta, settings, origem da chave e leitura do cofre. Não grava
arquivos e não retorna valores de credenciais. Cada check traz `name`,
`status` (`ok`, `warn` ou `fail`) e `detail`.
