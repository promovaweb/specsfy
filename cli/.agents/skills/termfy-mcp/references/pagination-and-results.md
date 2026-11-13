# Paginação e tamanho das respostas

A paginação da descoberta MCP e a paginação de uma tool de domínio são
contratos diferentes. `tools/list` pode ter cursor do protocolo;
`tasks_list` define `limit` e `cursor` dentro dos próprios argumentos.
Não reutilize um cursor de um contrato no outro.

## Receita com snapshot

A receita [tasks-tools.ts](examples/tasks-tools.ts) recebe uma lista local
estável, limita páginas a 50 itens e usa um offset decimal como cursor.
A última página omite `nextCursor`. Lista vazia retorna `items: []`.
Um cursor além do tamanho conhecido retorna uma falha recuperável.

Esse cursor só serve ao snapshot da receita. Em coleção mutável, offset
pode repetir ou saltar itens após inserções e remoções. Prefira cursor do
provedor ou paginação por chave com ordenação estável. Se o cursor carregar
filtros e versão de snapshot, valide-os no servidor. Codificação base64 não
confere autenticidade nem autorização.

## Campos e volume

Retorne id, título e campos necessários à próxima ação. Ofereça uma tool
de detalhe para conteúdo extenso. Limite tamanho individual e quantidade:
50 descrições de megabytes continuam produzindo uma resposta excessiva.

Informe unidade, fuso e representação dos campos quando forem relevantes.
Mantenha sucesso vazio distinto de consulta que falhou. Não devolva parte
da lista como resultado completo quando um serviço parar no meio; declare
resultado parcial somente se o contrato prevê essa condição.

## Cinco chamadas para adaptação

| Argumentos de `tasks_list` | Resultado a conferir |
| --- | --- |
| `{}` | Aplica limite padrão 10 |
| `{"limit": 2}` | Retorna a primeira página e continuação quando existir |
| `{"limit": 2, "cursor": "2"}` | Continua o mesmo snapshot |
| `{"limit": 51}` | Recusa entrada acima do limite |
| `{"cursor": "999"}` | Informa cursor inválido no snapshot pequeno |

O cliente deve usar o cursor retornado, mesmo que o formato da receita seja
legível. Para APIs externas, preserve o cursor emitido pelo provedor.
Execute os [testes](mcp-tests.md) para verificar término, duplicação e
correspondência entre texto e `structuredContent`.
