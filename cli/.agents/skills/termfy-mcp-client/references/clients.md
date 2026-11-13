# Configuração por cliente

Use `mycli` como exemplo de `<bin>`. Troque `/absolute/path/mycli` pelo
executável publicado ou pelo build local gerado por `bun run build`.
Os caminhos absolutos abaixo são placeholders, não arquivos distribuídos
pelo starter kit. No Windows, use o executável `.exe` e escape barras
invertidas em JSON. Não conte com expansão de `~` no campo `command`.

Os arquivos citados nesta referência pertencem aos clientes. Crie somente
a entrada solicitada e preserve o restante do documento. Nenhum exemplo
precisa de credenciais no arquivo.

## Claude Code

O comando básico usa o escopo local, guardado em `~/.claude.json` para o
projeto atual. Para compartilhar a entrada, use `--scope project`, que grava
`.mcp.json` na raiz do projeto. Prefira o comando do cliente para editar o
escopo local. [Referência oficial](https://code.claude.com/docs/en/mcp).

```bash
claude mcp add mycli -- mycli mcp
```

Alternativa com caminho absoluto e escopo de projeto, sem executar ambos
os exemplos para criar entradas duplicadas:

```bash
claude mcp add --scope project mycli -- /absolute/path/mycli mcp
```

Conteúdo da entrada em `.mcp.json` para o escopo de projeto:

```json
{
  "mcpServers": {
    "mycli": {
      "type": "stdio",
      "command": "/absolute/path/mycli",
      "args": ["mcp"]
    }
  }
}
```

## Codex

Arquivo do usuário: `~/.codex/config.toml`. Para escopo de projeto, use
`.codex/config.toml` em um projeto confiável. Troque `mycli` pelo nome real
na tabela `[mcp_servers.mycli]`. [Referência oficial](https://developers.openai.com/codex/mcp).

```toml
[mcp_servers.mycli]
command = "/absolute/path/mycli"
args = ["mcp"]
```

## Cursor

Arquivo de projeto: `.cursor/mcp.json`. A alternativa do usuário fica em
`~/.cursor/mcp.json`. O cliente inicia o processo indicado por `command`
com a lista `args`. [Referência oficial](https://prod.cursor.com/docs/mcp).

```json
{
  "mcpServers": {
    "mycli": {
      "command": "/absolute/path/mycli",
      "args": ["mcp"]
    }
  }
}
```

## OpenCode

Arquivo de projeto: `opencode.json`, também aceito como `opencode.jsonc`.
Confira a versão instalada antes de escolher o bloco. A estrutura V1 coloca
os servidores diretamente em `mcp`:

```json
{
  "mcp": {
    "mycli": {
      "type": "local",
      "command": ["/absolute/path/mycli", "mcp"],
      "enabled": true
    }
  }
}
```

Na V2, use `mcp.servers`. Servidores conectam automaticamente; para desativar,
a V2 usa `disabled`, não `enabled`. Não misture as duas estruturas.
[Referência oficial atual](https://opencode.ai/docs/mcp-servers/) e
[formato de configuração](https://opencode.ai/docs/config/).

```json
{
  "mcp": {
    "servers": {
      "mycli": {
        "type": "local",
        "command": ["/absolute/path/mycli", "mcp"]
      }
    }
  }
}
```

## Gemini CLI

Arquivo do usuário: `~/.gemini/settings.json`. Para o projeto, use
`.gemini/settings.json`. Acrescente a entrada ao objeto `mcpServers`,
preservando as demais configurações. [Referência oficial](https://geminicli.com/docs/tools/mcp-server/).

```json
{
  "mcpServers": {
    "mycli": {
      "command": "/absolute/path/mycli",
      "args": ["mcp"]
    }
  }
}
```

## Desenvolvimento com Bun

Na raiz do projeto, o processo equivalente é `bun run src/main.ts mcp`.
Clientes podem iniciar em outro diretório. Use o caminho absoluto tanto do
Bun quanto do entry point; assim a execução não depende do diretório do
cliente. Descubra os caminhos na máquina, sem copiar os placeholders.

Nos blocos Claude Code, Cursor e Gemini CLI, substitua apenas `command` e
`args` pelos campos abaixo, mantendo o restante da entrada:

```json
{
  "command": "/absolute/path/bun",
  "args": ["run", "/absolute/path/project/src/main.ts", "mcp"]
}
```

No Codex, dentro da mesma tabela:

```toml
command = "/absolute/path/bun"
args = ["run", "/absolute/path/project/src/main.ts", "mcp"]
```

No OpenCode, substitua o array `command` na entrada da versão escolhida:

```json
{
  "command": ["/absolute/path/bun", "run", "/absolute/path/project/src/main.ts", "mcp"]
}
```

O Claude Code também aceita o registro direto em desenvolvimento:

```bash
claude mcp add mycli -- /absolute/path/bun run /absolute/path/project/src/main.ts mcp
```

Use apenas uma entrada por nome e escopo; alterne entre publicado e local
substituindo a entrada existente. O binário compilado não precisa de Bun
na máquina do cliente.

## Primeira chamada

Após conectar o servidor, envie ao agente:

> No servidor MCP mycli, chame a tool skill com topic cli. Leia o resultado
> e resuma como usar os commands e a saída JSON. Não altere arquivos nem
> execute operações de escrita.

Confira no histórico de tools que houve uma chamada a `skill` com
`{"topic":"cli"}` e retorno em Markdown. O cliente pode prefixar o nome da
tool com o nome do servidor. Uma resposta textual do agente sem chamada de
tool não confirma a conexão.
