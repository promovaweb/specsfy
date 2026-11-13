# Entrevista do CLISPEC

A entrevista serve para entender o que a pessoa precisa fazer com o
binário. Pergunte em blocos e confirme cada bloco em uma frase antes do
próximo. Quando houver escolha, ofereça até três caminhos com o
recomendado primeiro e aceite uma resposta livre. Detalhes de commands,
flags e telas ficam para a `termfy-spec`; aqui o assunto é o binário
inteiro.

## 1. Problema

- Que tarefa a pessoa faz hoje sem o binário, e como?
- O que dá trabalho nessa tarefa: tempo, repetição, troca de ferramenta,
  falta de visibilidade?
- Como fica o dia dela quando o binário existir?

Preenche: `## Purpose`, em prosa curta: o problema, quem sofre com ele e o
que muda.

## 2. Públicos e modos

- Quem digita no terminal? Precisa de uma TUI para acompanhar algo, ou só
  de commands?
- Algum script, CI ou cron vai chamar o binário? Então a saída `--json`
  precisa ser estável.
- Algum agente de IA vai operar o binário pelo MCP? Para fazer o quê?

Preenche: `## Audiences`, uma linha por público com modo e necessidade. Um
público sem modo correspondente indica que aquele modo fica mínimo (uma TUI
só com Overview e About, por exemplo).

## 3. Capacidades

- Quais são as coisas que o binário precisa saber fazer? Liste em verbos:
  consultar pedidos, exportar relatório, acompanhar fila.
- Qual delas resolve o problema principal e entra primeiro?
- Alguma delas é só leitura e alguma altera dados em outro sistema?

Preenche: a lista de specs iniciais (uma por capacidade entregável) e o
começo de `## Purpose`.

## 4. Dados e integrações

- O binário conversa com algum serviço externo? Qual, e com que tipo de
  credencial?
- Precisa guardar dados entre execuções (histórico, cache, filas, registros
  próprios)? Pergunte só se as capacidades sugerirem isso; o padrão é não
  guardar nada além de settings e credenciais.
- Que preferências a pessoa vai querer ajustar sem editar código?

Preenche: frases em `## Purpose` sobre integrações e armazenamento, e
anotações em `## Notes` para as specs que vão criar settings, credenciais e,
quando pedido, banco SQLite (`termfy-database`).

## 5. Limites

- O que o binário não faz, mesmo que pareça próximo do que faz?
- Alguma operação fica de fora por segurança (apagar, publicar, pagar)?
- Algum ambiente fica de fora (Windows, uso offline, várias contas)?

Preenche: `## Out of scope`, uma lista curta que impede o agente de ampliar
o trabalho.

## Fechamento

Releia o `CLISPEC.md` com a pessoa. Mostre a lista de specs iniciais com a
recomendada primeiro e pergunte se a ordem e o recorte fazem sentido. Grave
cada spec aprovada em `specs/NNNN-slug.md` como `draft`, com a linha no
índice `## Specs`, registre dúvidas em `## Notes` e passe para a
`termfy-spec` com a primeira spec.
