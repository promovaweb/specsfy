# Contrato do CLISPEC.md e das specs

Os dois documentos são Markdown puro. O binário não os lê, não os embute e
não tem command para editá-los: o agente cria e mantém os arquivos com as
skills `termfy-clispec` e `termfy-spec`. Não há front matter YAML, schema,
IDs de item nem script de verificação. A conferência com o código é feita
pela leitura, na revisão de `termfy-review`.

## Dois documentos

| Documento | Quantos | Conteúdo | Quem escreve |
| --- | --- | --- | --- |
| `CLISPEC.md` | um, na raiz | identidade, Purpose, Audiences, Out of scope, superfície entregue, índice das specs e Notes | `termfy-clispec`; a superfície e o índice mudam ao fechar cada spec |
| `specs/NNNN-slug.md` | um por evolução | status, Goal, Behavior, Design, Surface, Tasks, Tests e Notes | `termfy-spec` |

O starter kit não traz nenhum dos dois. O primeiro `CLISPEC.md` nasce da
entrevista de `termfy-clispec`, com a Surface preenchida pelo que o
esqueleto já entrega (commands, screens, tools, resources, prompts e
settings lidos do código); a pasta `specs/` nasce com a primeira spec.

## CLISPEC.md

```markdown
# My CLI

`mycli`: Query and update shop orders.

## Purpose

Quem opera a loja precisa consultar pedidos sem abrir o painel web.

## Audiences

| Público | Modo | Necessidade |
| --- | --- | --- |
| operador | TUI e CLI texto | ver pedidos abertos |
| CI | CLI `--json` | exportar pedidos do dia |

## Out of scope

- Criar ou cancelar pedidos.

## Surface

### Commands

| Command | Função | Options | `data` no `--json` | Exit codes | Credenciais |
| --- | --- | --- | --- | --- | --- |
| `orders list` | List shop orders. | `--status <open\|closed>` | `{ count, orders[] }` | 4, 5 | `shop.token` |

### Screens

| Screen | Função | Teclas |
| --- | --- | --- |
| `orders` | pedidos abertos com o detalhe do selecionado | `↑` `↓`, `Enter` |

### MCP

| Tipo | Nome | Função | Efeito |
| --- | --- | --- | --- |
| tool | `orders_list` | lista pedidos | `network` |

### Settings

| Key | Tipo | Padrão | Função |
| --- | --- | --- | --- |
| `shop.region` | `enum` (`br`, `us`) | `br` | região da API |

### Credentials

| Nome | Usada por | Como obter |
| --- | --- | --- |
| `shop.token` | `orders list`, `orders_list` | painel da loja, seção API |

## Specs

| ID | Título | Status |
| --- | --- | --- |
| 0001 | List orders | done |
| 0002 | Export orders | in_progress |

## Notes

- 2026-11-10: visão macro registrada em entrevista.
```

Regras:

- A linha logo abaixo do título traz o `bin` e a `description` do
  `package.json`, iguais aos do manifest.
- As seções ficam nesta ordem: Purpose, Audiences, Out of scope, Surface,
  Specs e Notes. Notes existe mesmo vazia.
- Surface descreve só o que já foi entregue. Omita subseções vazias. A
  subseção `### Storage` (tabela, colunas e tipos) entra só quando o
  binário tem banco SQLite.
- Os nomes (commands, options, keys, tools, screens) são os do código, em
  inglês. A prosa pode estar no idioma da pessoa.
- Trabalho pendente não entra no `CLISPEC.md`: ele fica nas specs.

## Spec

Cada spec fica em `specs/NNNN-slug.md`: número de quatro dígitos,
sequencial, e slug em kebab-case, em inglês. O título fica no idioma da
pessoa.

```markdown
# 0002 Export orders

Status: in_progress

## Goal

O CI precisa de um CSV diário dos pedidos. Importar CSV fica fora.

## Behavior

`orders export --since 2026-11-01` grava `orders-<data>.csv` na pasta atual
e imprime o caminho; `--json` devolve `{ file, count }`. Sem token, sai com 4.

## Design

O módulo `shop/orders.ts` ganha `exportOrders(since)`, usada pelo command. O
client HTTP de `shop/client.ts` pagina a listagem.

## Surface

- Adiciona o command `orders export`: Export orders to CSV;
  `--since <date>`; `data` `{ file, count }`; exit codes 4 e 5; credencial
  `shop.token`.
- Altera a credencial `shop.token`: usada por `orders list` e
  `orders export`.

## Tasks

- [x] `exportOrders` com paginação `#termfy-api`
- [ ] Command `orders export` `#termfy-cli`

## Tests

- [ ] `orders export --json` devolve `{ file, count }`
- [ ] Sem token, sai com exit code 4

## Notes

- 2026-11-12: formato de data do `--since` fica em ISO 8601.
```

Regras:

- `Status:` aceita `draft`, `in_progress`, `done` e `archived`. Uma spec
  parada por dependência externa continua `in_progress`, com o motivo
  datado em Notes.
- Surface lista o que a spec adiciona, altera ou remove, um item por
  entrada, com os mesmos campos das tabelas do `CLISPEC.md`. Spec sem
  mudança de superfície escreve `Nenhuma mudança de superfície.`
- Tasks e Tests usam checkbox GFM (`- [ ]` e `- [x]`). Cada tarefa leva a
  tag da skill responsável no fim (`#termfy-cli`, `#termfy-mcp`).
- Uma `draft` pode ter Behavior e Design curtas. Antes de `in_progress`,
  Goal, Behavior e Design precisam de texto, e Tasks de ao menos um item.

## Ciclo

| Passo | O que o agente faz |
| --- | --- |
| criar | escolhe o próximo número livre em `specs/`, grava o arquivo como `draft` e acrescenta a linha ao índice do `CLISPEC.md` |
| começar | troca `Status:` para `in_progress` na spec e no índice |
| avançar | marca `[x]` em cada tarefa e teste concluídos; item novo entra no fim da seção |
| fechar | com todos os itens marcados, aplica Surface às tabelas do `CLISPEC.md`, troca o status para `done` na spec e no índice e acrescenta `- AAAA-MM-DD: spec NNNN (título) closed.` às Notes do `CLISPEC.md` |
| arquivar | troca o status para `archived`, registra o motivo em Notes e descarta Surface |

## Conferência manual

Antes de fechar uma spec ou entregar uma revisão, confira lendo os
arquivos:

- cada linha de Surface do `CLISPEC.md` existe no código: command no
  registry (`src/cli/commands.ts`), screen em `src/tui/screens/index.ts`,
  tool, resource e prompt em `src/mcp/`, key em `SETTINGS_SCHEMA`;
- cada `getCredential("<nome>")` de `src/` aparece em Credentials;
- o índice tem uma linha por arquivo de `specs/`, com título e status
  iguais aos da spec;
- options, exit codes e `data` da tabela batem com o registry e com
  `docs/cli.md`.

`bun run validate` continua cobrindo o código e a documentação embutida
(`docs:check`, `opencli:check`); ele não lê `CLISPEC.md` nem `specs/`.
