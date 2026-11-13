# Descrições e economia de contexto

A referência externa [OpenMCP](https://www.open-mcp.org) pode orientar o
estudo de ferramentas para APIs. Ela não define o protocolo MCP nem a API
do SDK instalado no Termfy. Para implementar, use as
[fontes oficiais e versões conferidas](sources-and-compatibility.md).

## Descrever sem omitir o contrato

Escreva uma descrição que permita identificar a tool aplicável e conhecer o
retorno. Informe efeitos, pré-requisitos e limites quando existirem. Evite
copiar a documentação completa em cada descrição; mantenha uma tool de
descoberta e resources para consultas extensas.

O custo de descrições depende de como o host apresenta ferramentas ao
modelo, da descoberta e do cache. Não afirme que todo cliente envia todas
as descrições a cada conversa. Meça o comportamento do cliente utilizado.

Na resposta, limite itens e tamanho de campos. A compatibilidade textual
pode duplicar parte do objeto estruturado; preserve o contrato dos clientes
atendidos e meça antes de retirar conteúdo. Use [paginação](pagination-and-results.md)
e uma consulta de detalhe para informações extensas.

## Converter uma API

Não exponha automaticamente todos os endpoints como tools. Selecione as
ações previstas na spec, compartilhe o client HTTP com CLI e TUI e mantenha
a autenticação interna. Use `termfy-api-import` para interpretar a API e
`termfy-api` para construir o serviço.

Configuração de cliente e transporte remoto variam por host e produto.
Use `termfy-mcp-client`; não copie um campo de configuração HTTP para um
servidor stdio. Confira descoberta e chamadas com a matriz de
[testes](mcp-tests.md).
