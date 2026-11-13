# OpenCLI no Termfy

A OpenCLI Specification (https://opencli.org) descreve a interface de um CLI
em JSON para que pessoas e máquinas saibam invocá-lo sem ler o código. O
Termfy gera esse documento a partir do registro de comandos
(`src/cli/opencli.ts`) e o expõe de três formas:

- `<bin> --opencli` imprime o JSON;
- `bun run opencli` grava `docs/opencli.json`;
- `bun run opencli:check` falha quando o arquivo divergir do registro.

## Mapeamento

| Registro Termfy | OpenCLI |
| --- | --- |
| `Command.name` | `command.name` (raiz usa o nome do binário) |
| `description` | `description` |
| `arguments[]` | `arguments[]` com `required`, `arity` e `acceptedValues` |
| `options[]` | `options[]` com `aliases`, `arguments[]`, `recursive` |
| `default` | `metadata[{ name: "x-default" }]` |
| `subcommands[]` | `commands[]` |
| `exitCodes` | `exitCodes[]`; a raiz lista todos |
| `examples` | `examples[]` |
| `interactive` | `interactive` |
| `hidden` | omitido do documento |

`conventions.groupOptions` é `false`: o parser não agrupa flags curtas.

## Esquema

`opencli/schema-draft.json` é o JSON Schema oficial do rascunho 0.1. Objetos
raiz: `opencli`, `info` (`title`, `version`, `summary`, `description`,
`contact`, `license`), `conventions` e `command`.

## Uso por agentes

Um agente que precise operar o binário pode ler `--opencli` em vez de
`--help`: o JSON traz nomes, aliases, valores aceitos e códigos de saída sem
precisar interpretar texto formatado. A documentação em prosa continua em
`--skill`.
