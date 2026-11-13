# Testes do servidor MCP

Teste as operações pelo `Client` do SDK, além de testar serviços isolados.
Isso exercita registro, validação, serialização, descoberta e comportamento
de erro que uma chamada direta ao handler não cobre.

## Camadas

| Camada | O que comprova |
| --- | --- |
| Serviço isolado | Regra do domínio, permissões, projeção e persistência |
| `InMemoryTransport` | Contratos MCP e conversa entre Client e McpServer |
| Subprocesso stdio | Inicialização, negociação e troca de mensagens pelo transporte |
| Binário compilado | Empacotamento, documentos embutidos, runtime e encerramento |
| Cliente usado pelo produto | Descoberta e apresentação na integração escolhida |

As receitas estão em [recipes.test.ts](examples/recipes.test.ts). O teste
stdio inicia `stdio-server.ts` com Node, portanto não afirma validar
`src/main.ts`, Bun nem executáveis publicados.

## Matriz por interface

Para tools, cubra sucesso, argumentos ausentes, limite inválido, falha de
domínio, exceção com segredo fictício, saída estruturada e cancelamento.
Para listas, percorra todas as páginas, confira ordem e ausência de repetição.
Adicione lista vazia, primeira e última página e cursor desconhecido.

Para resources, confira descoberta, templates, MIME, URI e parâmetros
inválidos. Para prompts, confira argumentos obrigatórios, conteúdo retornado
e ausência de efeitos externos ao recuperar as mensagens.

Compare catálogo local e descoberta do servidor. Nas receitas, nomes das
tools e prompts são comparados e as instâncias do template são consultadas.
No produto, inclua também a saída real de `mcp --list` e a documentação.

## Isolamento e cleanup

Crie Client, servidor e fixtures por teste. Feche conexões em `finally`,
inclusive quando uma asserção falhar. Para testes do binário, use uma pasta
temporária na variável `HOME_VARIABLE` do produto; não substitua `HOME`.
Restaure o ambiente e remova a pasta ao terminar.

No subprocesso, use `stderr: "pipe"`, consuma o stream e guarde apenas uma
cauda limitada de diagnóstico. Não use `stderr: "ignore"` como padrão de
investigação. Não registre credenciais nem todo o ambiente herdado.

## Comando do Hub

Na raiz, execute `npm run validar:termfy-mcp`. O script copia receitas para
uma pasta temporária em `termfy-starter-kit/template/`, compila com o
TypeScript instalado no kit e executa os testes com Node.js. A pasta é
removida mesmo após falha. Não instala pacotes nem acessa serviços externos.

As versões verificadas ficam em [compatibilidade](sources-and-compatibility.md).
Após integrar a receita, execute também os testes e a validação do projeto
consumidor. Não marque testes do binário como concluídos usando apenas a
suíte isolada das receitas.

## Inspector

O agente executa o Inspector no diretório do projeto:

```bash
npx @modelcontextprotocol/inspector bun run src/main.ts mcp
```

Confira Tools, Resources e Prompts. Teste uma chamada válida e uma inválida
de cada interface adicionada. Preserve a proteção de acesso do Inspector.
Para configurações de Claude Code, Codex e outros hosts, use
`termfy-mcp-client` e consulte a versão do cliente efetivamente instalado.
