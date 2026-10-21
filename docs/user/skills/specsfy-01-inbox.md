# Capturar uma entrada com `specsfy-01-inbox`

Esta skill funciona como uma caixa de entrada: recebe seu texto, guarda o
original e organiza uma primeira leitura sem interromper você com perguntas.

## Quando usar

Use quando quiser anotar uma entrada, oportunidade, necessidade ou pensamento
para retomar depois. O arquivo fica em `specs/inbox/`.

Não use para refinar prioridade, decidir requisitos ou iniciar implementação.
Esses trabalhos pertencem às etapas seguintes.

## Como descrever a tarefa

```text
Use $specsfy-01-inbox para capturar:
seria útil avisar clientes quando uma entrega atrasar, talvez por e-mail.
```

Se preferir uma instrução curta, escreva “guarde na Inbox” e inclua o texto
original na mesma mensagem. A skill organiza a captura sem exigir um formato
prévio.

## Exemplo passo a passo

1. Você envia o texto livre.
2. O agente preserva o texto original.
3. Sem fazer perguntas, ele separa o resumo, o problema ou a oportunidade, as
   pessoas afetadas, o resultado esperado, as dependências e os pontos que
   ainda precisam de revisão.
4. Ele cria um nome com data, hora e slug.
5. Ele informa o caminho criado e encerra a captura.

## O que esperar

```text
specs/inbox/2026-07-28-143205-avisar-clientes-sobre-atrasos.md
```

O arquivo diferencia o que você declarou, o que foi inferido e o que ainda
precisa ser revisto. Nenhum backlog, spec, tarefa ou código é criado.

Os metadados incluem horário da captura, origem, slug, status, hash do texto
original e links futuros para backlog ou spec.

A captura nasce com `Status: Capturada` e fica em `specs/inbox/` enquanto o
pedido tiver alguma parte sem definição aprovada. Quando specs com Definition
Gate aprovado cobrirem o pedido inteiro, a validação a move para
`specs/inbox/processed/` com `Status: Processada`. O texto original não muda.
Leia [Quando a captura sai da Inbox](../inbox.md#quando-a-captura-sai-da-inbox).

## Erros comuns

- esperar que a captura faça perguntas ou complete definições ausentes.
- tratar a análise inicial como requisito aprovado.
- implementar diretamente a partir de `specs/inbox/`.
- editar o texto original em vez de registrar uma evolução no backlog.
- mover ou apagar a captura à mão: só `specsfy inbox process`, executado pela
  validação, a retira da fila ativa.
- procurar o template dentro da skill: o padrão vive em
  `.specsfy/templates/Inbox.md`, e uma personalização homônima em
  `.specsfy/templates/custom/` tem precedência.

## Próximo passo

Deixe a entrada guardada ou use
[`specsfy-02-backlog`](specsfy-02-backlog.md) quando quiser refiná-la.
