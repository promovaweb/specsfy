# 0023 Especialistas na spec

Status: done

## Goal

Encontrar especialistas relevantes para uma spec e identificar declarações que
precisam de revisão ou instalação antes de executar o trabalho.

## Behavior

O CLI lê os especialistas da tabela de metadados, da subseção Especialistas do
plano técnico e das anotações da seção Tarefas. Os títulos das seções
funcionam com ou sem numeração. Nomes curtos e nomes completos aparecem uma
vez com o prefixo `specsfy-specialist-`.

`specsfy specialists suggest <spec>` e `specsfy skills suggest <spec>` aceitam
número, slug, nome da pasta ou caminho da spec. Cada trigger com ao menos uma
palavra-chave encontrada no Markdown gera uma sugestão com nome, modo opcional,
sinal e estados de declaração e instalação. A busca ignora caixa e acentos,
respeita limites de palavras e aceita espaços consecutivos em expressões.
Marcações de exemplo em blocos de código e as três fontes de declaração ficam
fora da busca, inclusive as justificativas da tabela de modos. A inspeção do
shell ou das telas existentes indica `interface/discovery`. Contratos e
respostas Inertia indicam `architecture/web-api`. O sinal de rollback para
`delivery/deploy` exige contexto de publicação. A instalação é verificada pela presença de `SKILL.md` em
`.agents/skills/<nome>/`. Depois de ler a spec, o comando retorna 0 mesmo com
uma lista vazia. A saída em texto segue o formato `especialista (modo) <- sinal`
com os dois estados, e `--json` retorna os mesmos dados.

Para um especialista com `stack: true`, uma sugestão nova exige detecção no
projeto ou um alias declarado em `.specsfy/STACK.md`. Entradas negativas,
pendentes e alternativas não confirmam a tecnologia. Interface e Arquitetura
continuam elegíveis por sinal, ainda que o catálogo declare marcadores para
`skills detect`.

`verify` registra avisos por spec para nomes desconhecidos no catálogo, nomes
declarados sem instalação e triggers encontrados sem declaração. Os avisos
aparecem em stderr no modo texto e em `data.warnings` no JSON e no MCP.
A atestação, os resultados e o código de saída dos gates continuam sob controle
da política existente. `--self-test` não lê specs para gerar avisos.
A detecção de stack roda uma vez para as specs verificadas. Quando a varredura
falha, `verify` e `suggest` emitem um aviso e usam as declarações disponíveis
em `.specsfy/STACK.md`.

A prévia da aba Specs mostra a linha `Especialistas` com os nomes curtos e
`(!)` ao lado de cada instalação ausente. A linha usa a largura disponível
e as teclas e o rodapé existentes continuam acessíveis.

## Design

O catálogo valida `detect`, `stack`, `aliases`, `modes` e `triggers`.
O marcador `detect.images` lê imagens de serviços Compose. Para a análise
da spec, o catálogo padrão é embutido a partir da fonte do monorepo. O arquivo
indicado por `SPECSFY_SPECIALISTS_CATALOG` ou o repositório personalizado em
`catalog.repository` podem fornecer o catálogo pelo carregador existente. Se
essa consulta falhar, a análise usa o catálogo embutido e informa a origem da
falha. Listagem, detecção e instalação mantêm o fluxo de download existente.

Um módulo em `src/domain/` concentra a leitura de declarações, o cruzamento de
triggers e a conferência de instalação. O registry usa uma definição para as
duas entradas do CLI e a tool MCP. O adaptador de `verify` acrescenta os avisos
à resposta, usando os caminhos das specs verificadas pelo script. A TUI usa a
mesma leitura na prévia, com a proteção existente contra leituras atrasadas.

## Surface

- `specialists suggest <spec>` e `skills suggest <spec>`. Consulta somente
  leitura, com `--project <dir>` e `--json`. Retorna `project`, `spec`,
  `suggestions` e avisos opcionais de catálogo e detecção. Usa os códigos
  existentes para argumento inválido ou spec ausente ou ilegível.
- `specialists_suggest` (MCP, read). Recebe `spec` e `project` opcional.
  Retorna os dados do comando.
- `verify` (CLI e MCP). Acrescenta `data.warnings` com avisos informativos.
- Aba Specs. Linha `Especialistas` no detalhe da seleção.

## Tasks

- [x] Ler declarações, catálogo e instalação, e cruzar palavras-chave. `#termfy-cli`
- [x] Implementar `specialists suggest` e `skills suggest` com
  `specialists_suggest` pelo mesmo registry. `#termfy-cli`
- [x] Acrescentar avisos ao `verify` em CLI, MCP e TUI. `#termfy-cli`
- [x] Mostrar especialistas na aba Specs e atualizar o showcase. `#termfy-tui`
- [x] Atualizar as referências do CLI, guias de usuário e OpenCLI. `#termfy-docs`

## Tests

- [x] O parser reúne as três fontes de declaração e aceita specs antigas.
- [x] `specialists suggest` resolve a fixture por ID, slug e caminho, cruza
  palavras e expressões normalizadas e informa declaração e instalação em texto
  e JSON. A tool `specialists_suggest` retorna os mesmos dados.
- [x] `verify` informa os três avisos em múltiplas specs com o gate aprovado.
- [x] A descoberta e o contrato Inertia produzem evidências sem as declarações
  dos modos. `verify` aponta o rollback de deploy e ignora o da migration.
- [x] Catálogo inválido e falha na detecção geram avisos e preservam a
  análise, o resultado da política e a atestação.
- [x] Aliases positivos, títulos sem número e marcadores de Laravel e n8n
  funcionam com `specialists suggest`.
- [x] A aba Specs mostra a linha e a marca de instalação ausente em um frame
  com rodapé acessível.
- [x] `bun run validate` completa todas as verificações do CLI.

## Notes

- 2026-11-20: `bun run validate` passou com 346 testes aprovados e um teste
  de completion para Fish ignorado. O binário compilado também executou
  `specialists suggest` com o catálogo embutido e listou `specialists_suggest`
  no MCP.
