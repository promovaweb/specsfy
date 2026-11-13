---
name: termfy-review
description: Audita entregas Termfy contra a spec aberta (Behavior, Design, Surface, Tasks e Tests), faz a conferência manual do CLISPEC.md e das specs contra o código e as regras do starter kit e relata achados por gravidade sem editar arquivos.
---

# Revisar uma entrega

Use esta skill para auditar código, documentação e o andamento da spec
aberta. A saída é um relatório. Não implemente correções, não marque itens
da spec nem feche a spec. A revisão é o momento da conferência manual:
nenhum script lê `CLISPEC.md` ou `specs/`, então o confronto com o código
acontece aqui, pela leitura dos arquivos.

## Leia antes

- `AGENTS.md`, `CLISPEC.md` e `docs/architecture.md`.
- A spec sob revisão em `specs/NNNN-slug.md`: Status, Goal, Behavior,
  Design, Surface, Tasks, Tests e Notes.
- O contrato dos dois documentos, na seção "Conferência manual" da
  referência `spec-contract.md` de `termfy-spec`.
- O diff da entrega e os arquivos completos que ele altera, incluindo testes.
- `src/cli/registry.ts`, `src/app/exit-codes.ts`, `src/app/errors.ts`,
  `src/config/credentials.ts`, `src/mcp/server.ts` e `src/tui/theme.ts`.
- [checklist.md](references/checklist.md) para executar as verificações.
- [severity.md](references/severity.md) para ordenar e escrever os achados.

## Regras

1. Não edite arquivos, não gere OpenCLI, não faça build, commit ou instalação.
   Execute apenas consultas e verificações sem alteração do repositório.
   Testes podem criar fixtures temporárias isoladas; confira sua limpeza.
2. Compare o comportamento ao Behavior da spec e o código ao Design dela:
   arquivos, camadas, funções compartilhadas e dependências combinadas.
   Desvio sem registro em `## Notes` da spec é achado. Não trate
   preferência pessoal de estilo como defeito.
3. Um item `[x]` em Tasks ou Tests precisa de teste verde que exercite a
   entrega no código atual. Cada item de Surface precisa de tarefa e
   teste. Diga se a spec está pronta para fechar: Goal, Behavior e Design
   com texto, todos os itens marcados e a conferência manual sem
   divergências. Não presuma aprovação a
   partir de um resultado antigo ou de um teste sem assertions pertinentes.
4. Confira descriptions, exit codes, segredos, stdout do MCP, cores da TUI,
   documentação e idioma conforme `references/checklist.md`.
5. Buscas apontam candidatos. Leia o contexto e siga chamadas antes de relatar
   vazamento ou violação. Não copie um segredo encontrado para o relatório.
6. Não chame serviços externos para reproduzir falhas. Use testes locais e
   fixtures sintéticas. Não use a pasta real de configuração do usuário.
7. Se uma checagem não puder executar, registre a limitação e seu impacto.
   Não declare a entrega aprovada enquanto faltar confirmação essencial.
8. Faça a conferência manual do `CLISPEC.md` e das specs contra o código,
   conforme `references/checklist.md`: Surface contra registry, screens,
   `src/mcp/`, `SETTINGS_SCHEMA` e `docs/cli.md`; cada
   `getCredential("<nome>")` de `src/` contra Credentials; as tabelas das
   migrations contra `### Storage`; o índice contra os arquivos de `specs/`.
   Cada divergência é achado.

## Passos

1. Rode `git status --short`, leia o diff e fixe os arquivos e itens sob revisão.
2. Execute as consultas de `references/checklist.md`, registrando comandos,
   exit codes e testes relacionados a cada item concluído.
3. Confira o código alcançado por CLI, MCP e TUI, além das linhas alteradas.
   Inspecione cada candidato apontado pelas buscas.
4. Classifique os achados com `references/severity.md` e proponha a menor
   correção suficiente, sem executá-la.
5. Confira `git status --short` novamente. Se testes gerarem alterações,
   informe os caminhos; não reverta trabalho da pessoa nem limpe arquivos à força.

## Marcos

Escopo lido; Behavior, Design e testes confrontados; conferência manual do
`CLISPEC.md` e das specs feita; prontidão para fechar a spec informada; verificações concluídas ou limitações
registradas; achados localizados e ordenados; repositório sem edições da revisão.

## Saída

Entregue uma lista ordenada de P0 a P3. Cada item contém gravidade,
`arquivo:linha`, comportamento observado, consequência e correção sugerida.
Depois liste verificações e resultados, os itens da spec ainda pendentes e
se ela pode ser fechada pelo fluxo de `termfy-spec`. Se não houver achados, diga isso e
cite o que foi conferido, sem prometer ausência de falhas fora do escopo.

## Compatibilidade

Starter kit a partir da v0.9.0, com specs em Markdown puro e sem command
`spec`. Caminhos usados incluem `specs/`,
`src/cli/commands.ts`, `src/cli/registry.ts`, `src/app/exit-codes.ts`,
`src/app/errors.ts`, `src/config/credentials.ts`, `src/mcp/server.ts`,
`src/tui/theme.ts`, `src/tui/screens/index.ts`, `src/mcp/`, `tests/` e
`docs/cli.md`.
