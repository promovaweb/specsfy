# Contrato de um comando

Um comando é um objeto `Command` (ver `src/cli/registry.ts`).

| Campo | Obrigatório | Uso |
| --- | --- | --- |
| `name` | sim | minúsculas, sem espaços; aparece em `--help` e no OpenCLI |
| `description` | sim | uma linha, começa com verbo no presente |
| `longDescription` | não | parágrafos para o `--help` do próprio comando |
| `aliases` | não | nomes alternativos; evite mais de um |
| `arguments` | não | posicionais; só o último pode ser `variadic` |
| `options` | não | `--name` longo; `aliases` para curtos; `argument` quando recebe valor |
| `subcommands` | não | comandos agrupadores não têm `run` |
| `examples` | recomendado quando há `run` | linhas completas começando pelo binário |
| `exitCodes` | quando há famílias adicionais | famílias além de 0, 1 e 2 |
| `interactive` | quando há interação | metadado OpenCLI; `run` verifica TTY |
| `hidden` | não | some do `--help` e do OpenCLI |
| `run` | sim em comandos finais | `(ctx) => Result \| Promise<Result>` |

## Contexto

`ctx.args` traz os posicionais validados; `ctx.options` traz as opções pelo
nome longo sem o prefixo `--` (`--no-color` vira `ctx.options["no-color"]`);
`ctx.json` indica o formato; `ctx.stderr` recebe progresso; `ctx.interactive`
diz se stdin e stdout são TTY. `OptionDefinition.default` é metadado; o
parser não o aplica a `ctx.options`. Resolva o padrão em `run`, por exemplo
`Number(ctx.options.limit ?? 10)`.

## Resultado

Exemplo para um arquivo em `src/cli/commands/`:

```ts
import type { Result } from "../registry.ts";
import { table } from "../format.ts";
import { ExitCode } from "../../app/exit-codes.ts";

export function keyValueResult(key: string, value: string): Result {
  return {
    data: { key, value },
    text: () => table([[key, value]]),
    code: ExitCode.SUCCESS,
  };
}
```

## Códigos de saída por situação

| Situação | Atalho | Código |
| --- | --- | --- |
| argumento ou opção inválida depois do parse | `error.usage` | 2 |
| chave de configuração inexistente ou inválida | `error.config` | 3 |
| credencial ausente, cofre ilegível | `error.credentials` | 4 |
| HTTP fora de 2xx, timeout, DNS | `error.network` | 5 |
| arquivo ou registro inexistente | `error.notFound` | 6 |
| EACCES, EPERM | `error.permission` | 7 |
| TUI sem TTY | `error.noTty` | 8 |
| transporte MCP | `error.mcp` | 9 |
| cancelamento pelo usuário | `error.interrupted` | 130 |

Para erros de sistema de arquivos, `classifyFsError(e, fallback, context)`
converte `code` do Node em família.

## Nomes

- Comandos, subcomandos e aliases em inglês (`list`, `get`, `set`, `remove`,
  `about`). Declare cada alias no registro antes de documentá-lo.
- Opções em inglês, inclusive as do domínio do produto (`--status`,
  `--json`, `--yes`, `--stdin`, `--reveal`).
- Chaves de `data` em camelCase inglês (`count`, `file`).
