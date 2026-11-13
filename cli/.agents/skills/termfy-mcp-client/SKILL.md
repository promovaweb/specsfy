---
name: termfy-mcp-client
description: Configura binários Termfy publicados ou em desenvolvimento nos clientes Claude Code, Codex, Cursor, OpenCode e Gemini CLI e valida a conexão MCP stdio.
---

# Conectar o binário ao cliente de agente

Use esta skill para instalar ou corrigir a configuração de um cliente MCP.
O servidor já existe no binário; esta tarefa não cria tools nem altera o
contrato do servidor.

## Leia antes

- `package.json`, `docs/mcp.md`, `docs/configuration.md` e `docs/cli.md` do
  binário derivado para conferir identidade, tools e acesso ao cofre.
- `src/main.ts` e `src/mcp/server.ts` se a conexão usar o modo de desenvolvimento.
- [references/clients.md](references/clients.md) para o cliente escolhido,
  seu arquivo de configuração e a diferença entre execução publicada e local.
- [references/troubleshooting.md](references/troubleshooting.md) se houver
  falha de inicialização, descoberta ou chamada de tool.

## Regras

1. Configure somente os clientes e o escopo pedidos. Preserve entradas
   existentes, comentários e outras preferências no arquivo do cliente.
2. Use o caminho absoluto do executável compilado quando o cliente não
   herdar o `PATH` do shell. Não ponha command e arguments na mesma string.
3. Passe `mcp` como argument. Não passe `--json` nem `--list` ao processo
   persistente; stdout pertence ao JSON-RPC e diagnósticos vão para stderr.
4. Nunca coloque credenciais, tokens ou master key na configuração do cliente,
   nem em `args` ou `env`. O binário lê seu cofre com `getCredential()`.
   Cadastre segredos pelo CLI fora da configuração MCP.
5. Use o mesmo usuário e diretório de dados da instalação que contém o cofre.
   Um cliente com outro ambiente pode precisar de configuração externa do
   diretório de dados, sem copiar o cofre ou seus segredos para o cliente.
6. A consulta `mcp --list` verifica o catálogo, mas não comprova a negociação
   do protocolo. Faça também uma chamada real pelo Inspector ou pelo cliente.
7. O Inspector via `npx` é uma ferramenta externa de diagnóstico solicitada
   neste fluxo. Ele não adiciona Node ou npm ao executável Termfy.

## Passos

1. Identifique cliente, versão instalada e escopo desejado. Confira o arquivo
   existente antes de escrever e leia o bloco correspondente na referência.
2. Localize o binário publicado e rode `<bin> --version`. Em desenvolvimento,
   use `bun run src/main.ts --version` na raiz do projeto; confira Bun e o
   caminho absoluto do entry point.
3. Rode `<bin> mcp --list` e confira a presença de `skill`. Use também
   `<bin> doctor` para conferir configuração e acesso ao cofre. Avisos de
   stdin/stdout sem TTY são esperados em clientes MCP.
4. Adicione a configuração do cliente. Para Claude Code, o formato básico é
   `claude mcp add <bin> -- <bin> mcp`. Nos demais, aplique o bloco JSON ou
   TOML da referência. Troque os placeholders pelos caminhos reais.
5. Valide JSON ou TOML, revise o diff e recarregue a conexão ou reinicie o
   cliente para carregar a entrada. Preserve as confirmações nativas do cliente.
6. Rode `npx @modelcontextprotocol/inspector <bin> mcp`. Em desenvolvimento,
   use `npx @modelcontextprotocol/inspector bun run src/main.ts mcp` na raiz
   do projeto. Selecione stdio, conecte, liste tools e chame `skill` com
   `{"topic":"cli"}`. Não basta abrir a interface do Inspector.
7. No cliente configurado, envie o primeiro prompt descrito na referência e
   confira a resposta da tool. Use a seção de diagnóstico para qualquer falha.

## Marcos

Configuração válida no escopo correto; executável e versão identificados;
catálogo acessível; negociação MCP concluída; tool `skill` retorna a seção
CLI no cliente; nenhum segredo foi gravado na configuração.

## Saída

Informe cliente e versão, arquivo e escopo alterados, command e arguments
sem segredos, resultado de `--version`, `mcp --list`, Inspector e primeira
chamada. Distinga teste executado de instrução pendente por falta do cliente.

## Compatibilidade

Starter kit a partir da v0.9.0. Caminhos do binário citados:
`package.json`, `docs/mcp.md`, `docs/configuration.md`, `docs/cli.md`,
`src/main.ts` e `src/mcp/server.ts`. Os arquivos de clientes na referência
pertencem às instalações dos clientes e são criados durante a configuração;
não são arquivos do starter kit. Confirme o schema da versão de cada cliente.
