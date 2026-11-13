# Declarar uma chave de configuração

```ts
import type { SettingDefinition } from "../config/settings.ts";

export const extraSettings: readonly SettingDefinition[] = [
{
  key: "api.timeoutMs",
  type: "number",
  default: 10000,
  description: "Maximum API response wait time in milliseconds.",
},
{
  key: "output.language",
  type: "enum",
  default: "pt-BR",
  values: ["pt-BR", "en"],
  description: "Language of text messages.",
},
];
```

Acrescente essas definições a `SETTINGS_SCHEMA` em `src/config/settings.ts`.
`api.timeoutMs` e `output.language` são extensões do exemplo; implemente
o consumo dessas chaves no projeto.

## Tipos

| Tipo | Conversão em `config set` | Validação |
| --- | --- | --- |
| `string` | texto como veio | nenhuma |
| `number` | `Number(text)` | precisa ser finito |
| `boolean` | `true/false`, `yes/no`, `1/0`, `on/off` | fora disso falha com 3 |
| `enum` | texto como veio | precisa estar em `values` |

## Nomes

`group.key` em camelCase: `output.format`, `tui.initialTab`,
`api.timeoutMs`. Grupos existentes: `output`, `tui`, `telemetry`. Crie um
grupo novo quando o domínio for outro (`api`, `sync`, `editor`).

## Leitura no código

```ts
import { readSettings, getPath } from "../config/settings.ts";

const timeout = Number(getPath(readSettings(), "api.timeoutMs") ?? 10000);
```

`readSettings()` mescla o arquivo com os padrões. Se a chave não estiver
no arquivo, usa o padrão do esquema. A leitura não valida todos os valores
já gravados: um objeto pai substituído por um escalar pode ocultar a chave;
trate valores ausentes ou inválidos no consumidor.

## Documentação

Acrescente a linha na tabela de `docs/configuration.md`. O comando
`config schema` lê o esquema e já exibe a chave.
