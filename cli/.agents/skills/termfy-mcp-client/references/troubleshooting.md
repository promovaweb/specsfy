# Diagnóstico da conexão MCP

Separe inicialização do processo, negociação do protocolo, descoberta de
tools e execução da tool. Anote a etapa que falhou e compare o command e os
arguments usados pelo cliente com a execução manual.

## Binário não encontrado no PATH

Aplicativos gráficos podem herdar outro `PATH`. Localize o executável com
`command -v mycli` no shell ou `Get-Command mycli` no PowerShell. Use o
caminho absoluto no cliente e rode esse mesmo arquivo com `--version`.
Confira permissão de execução, sistema operacional e arquitetura do asset.

Em desenvolvimento, confira Bun e o caminho absoluto do entry point.
Não use uma única string `bun run src/main.ts mcp` como `command`: o cliente
precisa do executável e dos arguments separados, conforme sua configuração.
Não instale outro binário só porque o cliente não encontra o já existente.

## Stdout com conteúdo fora do protocolo

Em `mcp`, stdout recebe somente JSON-RPC. Banners, `console.log`, mensagens
de wrappers e scripts de shell podem invalidar a conexão. Separe stdout de
stderr ao reproduzir a chamada e remova o texto extra do wrapper ou mova
os diagnósticos para stderr. Não redirecione stderr para stdout.

Confira `src/mcp/server.ts` se a falha vier do servidor local. Uma linha de
inicialização em stderr é normal. Não adicione `--json`, `--help` ou `--list`
aos arguments persistentes. `mycli mcp --list` imprime o catálogo e termina;
o cliente precisa de `mycli mcp`, que permanece conectado ao transporte.

## Timeouts

Primeiro rode `mycli mcp --list` e `mycli doctor` no mesmo usuário do cliente.
Avisos sobre stdin/stdout sem TTY não são falhas. Confira caminho, versão,
acesso aos arquivos de configuração e se o processo termina antes de responder.

Use o Inspector para separar falha do cliente de falha do servidor:

```bash
npx @modelcontextprotocol/inspector mycli mcp
```

Conecte por stdio e chame `skill` com `{"topic":"cli"}`. Se funcionar,
compare o ambiente do cliente, as permissões e os filtros de tools. Se
falhar também no Inspector, examine stderr e a negociação inicial.
Não aumente timeouts antes de localizar a etapa lenta. Ajuste apenas o
campo documentado pela versão instalada do cliente, quando a operação
precisar de mais tempo e estiver progredindo.

O terminal sozinho não faz a negociação MCP. Um processo aguardando stdin
sem imprimir resposta espontânea pode estar funcionando normalmente.

## Versão do protocolo

Confira a versão do cliente, a versão do binário e a dependência
`@modelcontextprotocol/sdk` em `package.json` no desenvolvimento. O SDK
negocia o protocolo durante `initialize`. Observe a resposta e o erro no
Inspector; não fixe manualmente uma data de protocolo nos cinco arquivos
de configuração para tentar contornar a negociação.

Atualize cliente ou servidor para versões compatíveis após identificar a
incompatibilidade. Não troque stdio por HTTP para esse binário. Refaça a
conexão e a chamada de `skill` após o ajuste. Se houver apenas falha em uma
tool, registre seu nome e arguments sem segredos; isso pode ser erro da tool,
não da versão do protocolo.

## Cofre indisponível no cliente

Não copie tokens ou a master key para JSON, TOML, argumentos ou prompts.
Cadastre a credencial pelo CLI, como `mycli credentials set service.token`,
com o usuário que executará o servidor. Confira `mycli credentials status`;
a saída mostra metadados, sem revelar valores. Consulte
`docs/configuration.md` para a pasta de dados e a origem da master key.

Uma variável antiga de master key ou outro diretório de dados pode fazer
o cliente ler um cofre diferente. Ajuste o ambiente de lançamento fora da
configuração do cliente. Não apague o cofre para resolver uma falha de acesso.
