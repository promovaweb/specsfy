# Testar e entregar código com `specsfy-06-implement`

Esta skill é a etapa 06 do ciclo e tem dois modos. No modo `tests`, ela usa os
cenários da spec para criar testes executáveis e mantém a rastreabilidade
entre o comportamento descrito e a prova no código. No modo `implement`, ela
executa as tarefas aprovadas da spec em ordem e altera produção somente quando
existe um plano válido e um teste focal em RED.

## Quando usar

Use o modo `tests` para preparar o RED que autoriza a implementação, executar
um ciclo RED–GREEN–REFACTOR ou verificar testes e rastreabilidade.

Use o modo `implement` para implementar a próxima tarefa pronta, continuar uma
entrega ou concluir uma feature planejada. Não use para pular definição,
planejamento ou testes.

A skill identifica o modo pelo pedido e pelo estado da spec. A passagem de um
modo para o outro acontece na mesma conversa, com o aviso `Troca de modo`,
sem carregar outra skill.

Se precisar escolher runner, comando, caso focal ou receber uma autorização,
a skill apresenta exatamente uma pergunta numerada. Ela contém três ou mais
respostas sugeridas, `Escrever outra resposta`, `Gere outras opções` e
`Avançar` desde a primeira rodada.

## Como descrever a tarefa

Para preparar o próximo teste focal e produzir a prova de RED, peça o modo
`tests` no passo `prepare`:

```text
Use $specsfy-06-implement no modo tests, passo prepare, para
specs/<estado>/0004-recuperar-senha/spec.md.
```

Para conferir os testes e a rastreabilidade de uma entrega existente, peça o
passo `verify`:

```text
Use $specsfy-06-implement no modo tests, passo verify, na spec 0004.
```

Para executar o plano, peça o modo `implement`:

```text
Use $specsfy-06-implement para executar a próxima tarefa pronta de
specs/<estado>/0004-recuperar-senha/spec.md.
```

Quando houver mais de uma tarefa pronta, indique o ID da tarefa que deve ser
executada:

```text
Implemente T003 da spec 0004 e valide a regressão.
```

## Exemplo passo a passo

### Modo `tests`

1. A skill seleciona a próxima condição de aceite.
2. Encontra o runner real do projeto.
3. Em Laravel, exige `.env.testing` com destino explícito e separado do `.env`.
4. Confere o comando com `check_database_safety.mjs`. Se o resultado não for
   `SAFE`, não executa nenhum teste.
5. Cria um teste com marcador de rastreabilidade.
6. Executa somente o teste focal.
7. Confirma:

```text
RED válido: o teste falhou porque a recuperação ainda não foi implementada.
Caso: TDD-AC-001
```

Em Laravel, o teste de aplicação combina `testing/pest + laravel/app`.
Uma rota nova pode produzir um RED com `404` se o teste alcançou a aplicação
e a rota ainda não existe. Mantenha a asserção do resultado esperado, como
`403` para uma pessoa sem permissão. A asserção sobre os registros de uma
tabela nova roda depois que a migration for aplicada no banco de teste.

Use Playwright para um plano automatizado de navegador com stack compatível,
ou após decidir explicitamente instalar o runner para o plano. Registre
a verificação manual de teclado com `interface/accessibility`.

Depois da implementação, a skill repete o teste focal e executa a regressão
para confirmar que o comportamento ficou GREEN sem quebrar o restante.

O bloco Gherkin da spec é uma referência legível. A prova automatizada fica na
suíte normal do projeto, não em um arquivo `.feature` nem em uma segunda suíte.

### Modo `implement`

1. A skill confirma Definition Gate e Plan Gate aprovados.
2. Para uma interface, confere as telas, menus, formulário, ações e estados definidos.
3. Em React, carrega `$specsfy-specialist-ui-components`, localiza os
   componentes atuais e define quais serão reaproveitados ou adaptados antes
   de escrever JSX ou TSX.
4. Verifica a tarefa predecessora e o RED atual.
5. Em Laravel, confirma `.env.testing` separado do `.env` e passa o comando
   pelo `check_database_safety.mjs`, interrompendo o teste sem a saída `SAFE`.
6. Faz a menor mudança de produção, incluindo a tela e a interação previstas.
7. Executa o teste focal até obter GREEN.
8. Em uma tarefa `[MIGRATION]`, aplica o arquivo no banco de teste e consulta o
   estado das migrations.
9. Faz a revisão visual obrigatória quando a tarefa puder alterar a interface,
   mesmo sem uma solicitação específica. Confere bordas, espaçamentos, margens, padding,
   tipografia, alinhamento, largura, overflow, foco, zoom e conteúdo curto ou
   longo nos viewports e estados aplicáveis.
10. Refatora sem alterar o comportamento.
11. Executa a regressão e atualiza os registros da tarefa:

```text
T003 [x] Implementar solicitação sem revelar existência do cadastro
Teste focal: passou
Revisão visual: Não aplicável; a tarefa altera somente a camada de serviço.
Regressão: passou
```

O checklist normativo da tarefa segue `PREP`, `EXECUTE`, `VERIFY`, `VISUAL`,
`EVIDENCE` e `IMPROVE`. O item `VISUAL` registra a inspeção da interface ou o
motivo concreto para sua não aplicação.

Para `[MIGRATION]`, o comentário `specsfy:evidence` precisa listar o arquivo
criado, o comando de aplicação e a consulta de estado, todos com saída zero.
`verify_evidence.mjs` confere os três elementos. A existência do model ou do
teste não substitui essa comprovação.
Durante o aceite final, `--delivery` também recusa qualquer tarefa
`[MIGRATION]` que permaneça aberta.

Depois de cada tarefa de código, a skill chama o documentador do projeto
consumidor. A execução só continua quando `docs/` estiver atualizado.

## Runner próprio de migrations

Se o projeto aplica migrations com um script próprio, declare os comandos em
`.specsfy/migrations.json`, na raiz do projeto consumidor. Assim, você pode
registrar os comandos realmente executados sem editar o validador instalado.
Por exemplo, para um script Node com ações `apply` e `status`:

```json
{
  "apply": ["^node scripts/migrate\\.mjs apply$"],
  "status": ["^node scripts/migrate\\.mjs status$"]
}
```

Cada lista contém expressões regulares JavaScript sem flags. No exemplo,
`apply` reconhece a aplicação e `status` reconhece a consulta do estado.
Adapte os padrões aos comandos do seu projeto, incluindo os argumentos usados
no banco de teste. Prefira padrões específicos: uma expressão como `.*`
aceitaria qualquer comando como comprovação.

As duas listas precisam conter pelo menos uma expressão válida e não vazia.
JSON inválido ou padrão inválido faz a validação falhar com o caminho do
arquivo no diagnóstico. Os comandos nativos de migrations continuam aceitos.
O arquivo da migration precisa existir e os comandos registrados precisam ter
saída zero; declarar um runner não executa migrations nem comprova que o banco
foi atualizado. O comentário `specsfy:evidence` deve refletir a execução real.

Ao atualizar a stack, `$specsfy-setup` no modo `stack` registra a presença
dessa configuração em `.specsfy/STACK.md` e preserva o conteúdo de
`migrations.json`.

## O que esperar

No modo `tests`:

- caso de teste ligado a uma condição de aceite da spec.
- comando e resultado registrados.
- distinção entre falha esperada e problema de ambiente.
- cobertura de sucesso, regra de negócio e limite.
- regressão depois do GREEN.

No modo `implement`:

- uma tarefa por vez.
- mudanças limitadas ao escopo aprovado.
- testes focais e regressão.
- documentação aplicável atualizada.
- status e checkboxes comprovados por evidência.

## Erros comuns

No modo `tests`:

- chamar erro de configuração de RED.
- escrever produção no passo `prepare`.
- criar testes que não correspondem às condições de aceite.
- considerar o Gherkin sozinho como teste executado.
- aprovar o plano sem prova focal.
- executar teste para descobrir se a conexão está correta.
- recriar ou limpar todo o banco para preparar a suíte.

No modo `implement`:

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

Com RED válido e tarefa pronta, a skill segue para o modo `implement`. Para
apenas reorganizar as tarefas da spec, volte ao
[`specsfy-05-tasks`](specsfy-05-tasks.md) sem alterar o código.

Depois de uma tarefa entregue, continue com a próxima ou veja o estado geral
com `specsfy progress`, descrito em
[Ver o progresso](../reference.md#ver-o-progresso). Uma necessidade nova segue
pelo [`specsfy-update-spec`](specsfy-update-spec.md), que atualiza a mesma
spec.
