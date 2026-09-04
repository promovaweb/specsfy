# Validar a definição com `specsfy-04-validate`

Esta skill revisa a spec como código em linguagem natural. Primeiro verifica o
formato. Depois avalia clareza, completude, consistência e possibilidade de
teste.

## Quando usar

Use para comprovar o Ato I ou quando uma mudança exigir nova validação da
definição. Também é
útil para auditar uma spec sem alterar sua intenção.

Quando a validação depender de uma escolha sua, a rodada traz exatamente uma
pergunta numerada. Ela oferece três ou mais respostas sugeridas, `Escrever
outra resposta`, `Gere outras opções` e `Avançar` desde a primeira rodada.

## Como descrever a tarefa

```text
Use $specsfy-04-validate em
specs/<estado>/0004-recuperar-senha/spec.md.
```

## Exemplo passo a passo

1. A skill confirma o caminho e o formato `Specsfy/2.0`.
2. Verifica se os requisitos possuem exemplos suficientes.
3. Encontra uma lacuna: “a validade do link não foi decidida”.
4. Retorna para o refinamento do backlog e registra a validade de 30 minutos.
5. Executa novamente os validadores.
6. Atualiza a seção de gates:

```text
Definition Gate: Passed
Status: Defined
```

Quando o plano inclui uma tarefa `[MIGRATION]`, a validação final também
confere a entrega registrada pela implementação. A tarefa só pode terminar
quando a comprovação relaciona o arquivo versionado da migration, o comando
que a aplicou no banco de teste e o comando que consultou o estado depois da
aplicação.

Uma falha de parser, fixture ou ambiente não serve como prova de requisito
ausente.

## O que esperar

- problemas apontados com localização e motivo.
- nenhuma aprovação baseada em suposição.
- verificação das evidências externas citadas.
- conferência da aplicação das migrations previstas no plano.
- retorno automático à etapa que pode resolver a lacuna.
- gate aprovado somente após nova validação.

## Erros comuns

- marcar READY sem resolver uma ambiguidade material.
- confundir estrutura válida com conteúdo suficiente.
- criar um relatório paralelo em vez de atualizar a seção correta.
- compensar um Ato I incompleto em uma etapa posterior.

## Próximo passo

Com o Definition Gate aprovado, use
[`specsfy-05-tasks`](specsfy-05-tasks.md). Se a validação encontrar uma
escolha aberta, use [`specsfy-02-backlog`](specsfy-02-backlog.md).
