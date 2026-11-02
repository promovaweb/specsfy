# Consultar o estado com `specsfy-progress`

Esta skill lê todas as specs e apresenta uma visão geral de gates, tarefas,
checklists, falhas que impedem avanço e próximo trabalho. Ela não altera
nenhum estado.

## Quando usar

Use para saber quanto falta, qual falha impede uma entrega, qual tarefa está
pronta ou quais specs foram concluídas.

## Como descrever a tarefa

Para receber uma síntese na conversa, descreva o projeto que deseja consultar:

```text
Use $specsfy-progress para mostrar o progresso do projeto.
```

No terminal, use o CLI para obter a mesma leitura das fontes canônicas:

```text
specsfy progress --project .
```

## Exemplo passo a passo

1. A skill lê `specs/<estado>/*/spec.md`.
2. Calcula o estado a partir de gates e checkboxes.
3. Não consulta um relatório paralelo.
4. Apresenta:

```text
Specs: 2
Complete: 1
Implementing: 1
Tarefas: 7 de 10 concluídas
Próximo trabalho: T004 da spec 0004-recuperar-senha
Pendências impeditivas: nenhuma
```

Se os metadados estiverem incoerentes, o relatório mostra a pendência em vez de
inventar um percentual confiável.

## O que esperar

### Checklists fora das tarefas

O relatório separa os itens vinculados às tarefas dos outros checkboxes. No
CLI, o percentual usa a tarefa e seus itens canônicos; anotações soltas ficam
na contagem de outros checkboxes. Exemplos dentro de blocos de código são
ignorados. Sem itens de tarefa, o CLI calcula o percentual pelos três gates.

Itens como `PREP` ou `VERIFY` fora de uma tarefa aparecem com o número da
linha. O aviso permite localizar um rascunho residual sem alterar a spec
durante a consulta. No JSON do CLI, consulte `orphan_checklist_lines` por spec
e `orphan_checklist_items` no resumo. A skill expõe as mesmas linhas e mantém
os totais de checklists separados dos totais de tarefas.

Para corrigir um resíduo, peça a `$specsfy-update-spec` que confira as linhas
indicadas. Quando o texto apenas duplica uma tarefa já concluída, a skill
pode convertê-lo em anotação sem checkbox, preservando o conteúdo histórico
e os gates. Se o trecho representar trabalho ainda necessário, ele precisa
voltar ao planejamento da spec.

## O que esperar

- leitura somente das fontes canônicas.
- totais de specs e tarefas.
- gates pendentes.
- falhas impeditivas e próximo trabalho.
- saída humana ou JSON pelo CLI.

## Erros comuns

- alterar checkboxes durante a consulta.
- manter um segundo arquivo de progresso.
- calcular conclusão só pelo número de arquivos.
- esconder spec inválida do relatório.
- confundir progresso com autorização para implementar.

## Próximo passo

Abra a página da skill indicada pelo próximo trabalho. Para acompanhar
continuamente no terminal, use:

```text
specsfy progress --project . --watch
```
