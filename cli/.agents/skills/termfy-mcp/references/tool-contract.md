# Contrato de uma tool

Implemente tools como adaptadores dos serviços usados por CLI e TUI. O
handler valida a entrada, chama o serviço e apresenta somente os campos
públicos. A receita [tasks-tools.ts](examples/tasks-tools.ts) inclui
paginação, schema de saída, anotações e consulta cancelável.

## Nome e descoberta

Use `<grupo>_<acao>` em `snake_case`, como `tasks_list`. Esse é o padrão
Termfy; o protocolo também aceita outros formatos. Declare `title` e uma
descrição que informe finalidade, retorno, limites e efeitos externos.
Use a mesma constante de descrição no registro e em `catalog.tools`.

O catálogo local e `tools/list` são mecanismos separados. O SDK não confere
o catálogo do Termfy. Compare nomes em teste e registre cada função em
`registerAll`, dentro de `src/mcp/server.ts`.

## Entrada

Use Zod 4 da instalação do projeto e `.describe()` em cada campo. Declare
limites de strings, arrays e números antes de acessar serviços. Diferencie
campo ausente, string vazia e `null`; evite coerção quando ela esconder uma
entrada errada. Documente valores padrão e teste a chamada sem opcionais.

Não aceite senha, token ou chave mestra como argumento. Recupere credenciais
no serviço compartilhado. Quando o domínio exige escolha entre valores
conhecidos, prefira `z.enum` a uma string sem restrição.

## Saída

Declare `outputSchema` quando houver `structuredContent`. Gere o texto JSON
e o objeto estruturado a partir do mesmo valor. Projete explicitamente os
campos públicos: passar o objeto inteiro do serviço pode expor propriedades
extras, mesmo se elas não aparecerem no schema.

O SDK instalado valida a saída de sucesso contra o schema. Essa validação
não substitui a projeção nem garante remoção de campos privados. Uma tool
que retorna Markdown, como `skill`, pode continuar com conteúdo textual.

## Anotações

| Campo | Uso na implementação |
| --- | --- |
| `readOnlyHint` | Verdadeiro somente se a operação não altera o ambiente |
| `destructiveHint` | Descreve possibilidade de alteração destrutiva |
| `idempotentHint` | Repetir argumentos produz o mesmo efeito persistente |
| `openWorldHint` | Indica interação com sistemas externos |

As anotações são sugestões para o cliente. Elas não autorizam acesso nem
aplicam permissões. Confira o serviço real; consultar uma API externa pode
ser somente leitura e ainda exigir `openWorldHint: true`.

## Falhas

No SDK 1.32.2, `McpServer` captura várias falhas de `tools/call`, como
entrada inválida, nome desconhecido e exceção do handler. Cria um resultado
com `isError: true`. A mensagem original pode aparecer no texto retornado.
Não escreva testes que esperam rejeição para toda chamada inválida.

Converta falhas de serviço em códigos e mensagens públicas fixas. Não envie
stack, headers, URL autenticada, corpo remoto ou `error.message` sem revisão.
Para falha prevista, devolva `isError: true` com orientação de recuperação.
Erros de protocolo também existem; o cliente deve tratar rejeição da chamada
e resultado com `isError` como caminhos diferentes.

## Escrita

Só acrescente operações de escrita previstas na spec. Declare objeto
alterado, permissão exigida, repetição e comportamento de `dryRun`, quando
aplicável. Um booleano `confirm: true` recebido do modelo não comprova
consentimento humano. A autorização precisa ser aplicada pelo produto e
pelo host. Teste que uma operação recusada não grava nem chama a API.

Leia [limites e segredos](security-and-effects.md) e execute a matriz de
[testes](mcp-tests.md) antes de marcar a entrega na spec.
