# 0024 Ajustes do segundo ensaio

Status: done

## Goal

Selecionar a próxima tarefa RED, diagnosticar uma spec isoladamente e manter
as referências e recomendações coerentes ao longo do fluxo.

## Behavior

- Sugestões e avisos de sinal agrupam ocorrências pelo par especialista e
  modo. Cada sinal inclui evidência com número da linha e trecho da spec.
  A declaração de um par vem da seção de especialistas ou das anotações
  das tarefas. Um nome sozinho não declara um modo.
- A busca inclui a justificativa da seção de especialistas e o conteúdo das
  tarefas. Ignora seções fora de escopo, trechos negados e blocos de código.
  Reconhece contratos Inertia/HTTP, descoberta da interface existente e
  tarefas de componentes React. Regressões planejadas, condições de deploy
  e métricas de aceite não acionam os modos operacionais correspondentes.
- `tasks next <spec> --phase red` seleciona só a primeira tarefa aberta com
  `[TEST]` e `[TDD]`, em ordem da seção 14, com dependências concluídas.
  Aplica-se a Defined com Definition Gate aprovado e Plan Gate pendente.
  A seleção padrão continua sujeita ao Plan Gate.
- `verify --spec <id>` aplica a política por estado à spec resolvida e
  restringe os avisos de especialistas a ela. Sem a opção, a política
  verifica o projeto inteiro.
- `inbox process` preserva vínculos existentes em specs, backlog e
  documentos de contexto ao mover a captura para a fila processada.

## Design

Usar o registry compartilhado pelo CLI e MCP. Filtrar a política de
verificação antes de executar os checks por spec. Manter os números de
linha do Markdown no cruzamento de sinais e reutilizar a ordem e as
dependências calculadas pelo domínio de tarefas. Estender a atualização
de referências do inbox aos documentos Markdown do contexto.

## Surface

- `specialists suggest`, `skills suggest` e `verify` com sinais agrupados e evidência.
- `tasks next --phase red` e `verify --spec <id>` no CLI e MCP.
- `inbox process` com atualização das referências de contexto.

## Tasks

- [x] Agrupar os sinais e atualizar a leitura de declarações e evidências.
- [x] Adicionar a seleção RED e a verificação focal.
- [x] Atualizar referências da captura nos documentos de contexto.
- [x] Atualizar a documentação do CLI e gerar o OpenCLI.

## Tests

- [x] Cobrir sinais, declarações, evidências e exclusões do ensaio.
- [x] Cobrir dependências RED e política focal sem regressão dos padrões.
- [x] Cobrir referências no mapa de dados e em outros arquivos de contexto.
- [x] Executar `bun run validate`.

## Notes

- A spec de cupons do segundo ensaio selecionou T001 em RED e passou no
  diagnóstico focal. Os três modos esperados apareceram com evidência e
  nenhuma sugestão ficou sem declaração nessa spec.
- `bun run validate` passou com 361 testes, um skip de Fish, os 20 quadros
  do showcase conferidos e o smoke test do binário compilado.
