# Manter o mapa de milestones

Use `$specsfy-milestone-governor` (`specsfy-milestone-governor`) para revisar relações entre milestones,
specs e backlog. Ele executa a projeção derivada, sugere vínculos ausentes e
mantém `specs.md` atualizado sem substituir a escrita humana dos marcos.

## Quando usar

Use depois de criar, alterar ou concluir specs vinculadas a milestones.

Se uma relação precisar de confirmação, a skill apresenta exatamente uma
pergunta numerada. Ela contém três ou mais sugestões, `Escrever outra resposta`
`Gere outras opções` e `Avançar` desde a primeira rodada.

## Como descrever a tarefa

Solicite: “revise os milestones do projeto e sincronize o painel”.

## Exemplo passo a passo

```text
Specs e backlog vinculados → sync → specs.md e progresso dos marcos atualizados
```

## O que esperar

A skill mostra relações ausentes e atualiza somente blocos gerados.

## Erros comuns

- tratar percentual de tarefas como aceite do marco;
- esperar que a skill escreva uma condição de saída sem confirmação.

## Próximo passo

A condição de saída continua dependendo de validação confirmada. O guia
[Milestones](../milestones.md) mostra o comando e o modelo de arquivos usados
na sincronização.
