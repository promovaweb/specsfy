# Entregar código com `specsfy-07-implement`

Esta skill executa as tarefas aprovadas da spec em ordem. Ela altera produção
somente quando existe um plano válido e um teste focal em RED.

## Quando usar

Use para implementar a próxima tarefa pronta, continuar uma entrega ou concluir
uma feature planejada. Não use para pular definição, planejamento ou testes.

Quando uma autorização ou escolha for necessária, a skill apresenta exatamente
uma pergunta numerada. Ela contém três ou mais respostas sugeridas, `Escrever
outra resposta`, `Gere outras opções` e `Avançar` desde a primeira rodada.

## Como descrever a tarefa

```text
Use $specsfy-07-implement para executar a próxima tarefa pronta de
specs/<estado>/0004-recuperar-senha/spec.md.
```

Quando houver mais de uma tarefa pronta, indique o ID da tarefa que deve ser
executada:

```text
Implemente T003 da spec 0004 e valide a regressão.
```

## Exemplo passo a passo

1. A skill confirma Definition Gate e Plan Gate aprovados.
2. Para uma interface, confere as telas, menus, formulário, ações e estados definidos.
3. Em React, carrega `$specsfy-specialist-react-ui-components`, localiza os
   componentes atuais e define quais serão reaproveitados ou adaptados antes
   de escrever JSX ou TSX.
4. Verifica a tarefa predecessora e o RED atual.
5. Em Laravel, confirma `.env.testing` separado do `.env` e passa o comando
   pelo `check_database_safety.mjs`. Sem `SAFE`, interrompe antes do teste.
6. Faz a menor mudança de produção, incluindo a tela e a interação previstas.
7. Executa o teste focal até obter GREEN.
8. Em uma tarefa `[MIGRATION]`, aplica o arquivo no banco de teste e consulta o
   estado das migrations.
9. Faz a revisão visual obrigatória quando a tarefa puder alterar a interface,
   mesmo sem pedido específico. Confere bordas, espaçamentos, margens, padding,
   tipografia, alinhamento, largura, overflow, foco, zoom e conteúdo curto ou
   longo nos viewports e estados aplicáveis.
10. Refatora sem alterar o comportamento.
11. Executa a regressão e atualiza os registros da tarefa:

```text
T003 [x] Implementar solicitação sem revelar existência do cadastro
Teste focal: passou
Revisão visual: Não aplicável; a tarefa altera somente a regra de serviço.
Regressão: passou
```

O checklist normativo da tarefa segue `PREP`, `EXECUTE`, `VERIFY`, `VISUAL`,
`EVIDENCE` e `IMPROVE`. O item `VISUAL` registra a inspeção da interface ou o
motivo concreto para sua não aplicação.

Para `[MIGRATION]`, o comentário `specsfy:evidence` precisa listar o arquivo
criado, o comando de aplicação e a consulta de estado, todos com saída zero.
`verify_evidence.mjs` confere os três elementos. A existência do model ou do
teste não substitui essa comprovação.

Depois de cada tarefa de código, a skill chama o documentador do projeto
consumidor. A execução só continua quando `docs/` estiver atualizado.

## O que esperar

- uma tarefa por vez.
- mudanças limitadas ao escopo aprovado.
- testes focais e regressão.
- documentação aplicável atualizada.
- status e checkboxes comprovados por evidência.

## Erros comuns

- implementar com gate pendente.
- aceitar um RED causado por dependência ausente.
- ampliar o escopo sem atualizar a spec.
- implementar um CRUD como API sem os menus, as telas e o formulário aprovados.
- marcar conclusão sem regressão.
- marcar uma tarefa de banco sem criar, aplicar e conferir a migration.
- rodar teste no banco do `.env` ou aceitar um comando que recrie o banco.
- deixar `docs/`, `PROJECT.md` ou os arquivos `.specsfy/` incompatíveis com o
  código alterado.

## Próximo passo

Continue com a próxima tarefa ou consulte
[`specsfy-progress`](specsfy-progress.md). Se surgir uma necessidade
nova, use [`specsfy-update-spec`](specsfy-update-spec.md).
