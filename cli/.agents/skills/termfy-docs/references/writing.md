# Escrever para pessoas e agentes

A documentação embutida é lida de duas formas: uma pessoa abre `docs/` no
editor ou o PDF; um agente recebe tudo de uma vez por `--skill` ou pela tool
`skill` e decide o que fazer a partir dali. O mesmo texto precisa servir aos
dois.

## O que o agente precisa

- Nomes exatos. Um command citado como `orders list` precisa existir com
  esse nome; uma option citada como `--status` precisa aceitar os valores
  listados.
- A forma da saída. Para `--json`, descreva `data` por campos e tipos, ou
  mostre um exemplo curto.
- O que pode falhar e o exit code. "Sai com 4 quando a credencial não
  existe" vale mais do que "trata erros de autenticação".
- Pré-condições. "Exige `shop.token` gravado com `credentials set`" antes do
  primeiro exemplo.

## O que a pessoa precisa

- A pergunta que a seção responde, no primeiro parágrafo.
- Um exemplo completo antes da tabela de options.
- Passos numerados para tarefas com mais de duas ações.
- Uma frase sobre o porquê quando uma regra parece arbitrária (por exemplo,
  por que o segredo não entra por argument).

## Forma de cada seção

1. Uma frase que diz o que é e quando usar.
2. O exemplo mais comum, executável.
3. Tabela de options, keys ou tools, com uma coluna de efeito.
4. Falhas e exit codes.
5. Como estender (copiar o stub, registrar, testar).

## Tamanho

Um topic do `--skill` que passa de 200 linhas pede divisão ou corte. Agentes
pagam por token; pessoas abandonam páginas longas. Se uma seção só repete a
referência gerada, apague a seção.

## Revisão final

Leia `bun run dev -- --skill` inteiro, sem pular, como se fosse a primeira
vez. Anote cada ponto onde precisou de informação que não estava ali. Corrija
esses pontos antes de qualquer polimento.
