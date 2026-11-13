# Da frase da pessoa às entrevistas

A pessoa costuma dizer algo como: "quero um CLI que liste meus pedidos da
loja, mostre o detalhe de um pedido e avise quando chegar um novo". Extraia
o que as entrevistas da `termfy-clispec` e da `termfy-spec` perguntam antes
de perguntar de novo.

## Para a `termfy-clispec` (visão macro)

| Bloco da entrevista | O que procurar na frase | Exemplo |
| --- | --- | --- |
| Identidade | nome do produto ou do serviço | `loja` → sugerir `bin: lojacli`, `title: Loja CLI` |
| Problema | o verbo principal e o objeto | listar e ver pedidos; avisar sobre novos |
| Públicos e modos | quem fala ("meus", "a equipe", "o agente"); "avisar", "acompanhar", "painel" sugerem TUI; "no script", "no CI" sugerem `--json` | pessoa no terminal com TUI; agente via MCP se mencionar automação |
| Capacidades | cada verbo vira uma spec inicial | `0001` listar pedidos, `0002` detalhe, `0003` aviso de pedido novo |
| Dados e integrações | o serviço citado; pedido explícito de guardar histórico | API da loja com token; sem banco, a menos que a pessoa peça |
| Limites | o que a frase não pede | criar ou cancelar pedidos |

## Para a `termfy-spec` (primeira spec)

| Bloco da entrevista | O que procurar na frase | Exemplo |
| --- | --- | --- |
| Objetivo | a capacidade que resolve o problema principal | listar pedidos |
| Comportamento | o que a pessoa quer ver e onde | lista com status no texto; `{ count, orders[] }` no `--json` |
| Superfície | cada verbo vira `recurso verbo`; o que a pessoa quer "ver" vira screen; o que um agente faria vira tool | `orders list`, screen `orders` com `listPanel`, tool `orders_list` |
| Dados e integrações | o que varia por ambiente e o segredo do serviço | setting `shop.baseUrl`, credencial `shop.token` |
| Aceite | o resultado que a pessoa espera conferir | `orders list --json` devolve os pedidos abertos |

O Design não sai da frase: a `termfy-spec` o propõe a partir do starter kit
e a pessoa aprova.

## Perguntas que ainda valem a pena

Só as que mudam a construção e a frase não responde:

1. Qual serviço ou API fornece os dados, e como se autentica?
2. O que o usuário precisa ver primeiro na TUI?
3. Algum command deve rodar sem confirmação em script?

Três perguntas no máximo, em uma mensagem, com um caminho recomendado em
cada. Depois disso, a `termfy-clispec` grava a visão macro, a `termfy-spec`
grava a primeira spec e `termfy` segue.

## Sugerir, não escolher sozinho

Nome do executável, nomes de commands, nomes de credenciais e a divisão em
specs são sugeridos com a forma final ("`orders list`, pode ser?"). A
pessoa aprova no checkpoint depois do `CLISPEC.md` e da primeira spec; até
lá, nada é código.
