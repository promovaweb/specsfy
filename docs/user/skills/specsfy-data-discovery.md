# Descobrir o que o sistema precisa guardar com `specsfy-data-discovery`

Use `$specsfy-data-discovery` (`specsfy-data-discovery`) quando uma jornada
depender de informações que o sistema precisa guardar, exibir, alterar ou
apagar. A conversa usa palavras do seu produto e grava em
`.specsfy/DATABASE.md` apenas o que você confirmar.

## Quando usar

Use durante o backlog, depois de uma Inbox, durante a descoberta de `MVP.md` ou antes de
consolidar uma spec. A skill é útil quando ainda não está claro o que cada
reserva, cliente, atendimento ou outro item do produto precisa guardar.

## Como descrever a tarefa

```text
Use $specsfy-data-discovery para entender o que nosso sistema precisa guardar
sobre cada reserva, quais papéis consultam essas informações e quando elas
perdem a utilidade.
```

## Exemplo passo a passo

```text
Inbox sobre reservas → conversa sobre informações a guardar → DATABASE.md
→ backlog refinado
```

O agente pode perguntar o que você precisa guardar sobre uma reserva, quais
papéis podem consultar ou corrigir as informações e quando uma reserva deixa de
valer.
Você responde com a situação real do seu trabalho, sem precisar nomear partes
internas do sistema.

Depois, ele sugere a forma mais adequada para registrar cada informação, como
texto curto, data, valor em dinheiro ou escolha entre opções. A sugestão só é
gravada depois que você confirmar que ela atende ao uso real.

## O que esperar

Cada resposta confirmada aparece na seção `Informações a guardar confirmadas`
de `.specsfy/DATABASE.md`. Ela informa para que a informação serve, o que deve
ser guardado, o formato sugerido, o que fica ligado, os papéis que a usam e
quando ela muda ou sai do sistema.

## Erros comuns

- tentar escolher a tecnologia antes de explicar a necessidade do produto;
- tratar uma suposição como informação confirmada;
- copiar dados pessoais de clientes, senhas ou chaves para a conversa;
- pular a conversa quando a jornada depende de informações guardadas.

## Próximo passo

Volte ao `$specsfy-02-backlog` para concluir o refinamento ou ao
`$specsfy-03-specify` para consolidar a fonte normativa da entrega.
