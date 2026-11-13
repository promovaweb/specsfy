# Mapeamento de API para CLI

## Endpoints para commands

| Padrão na API | Command | Arguments | Options típicas |
| --- | --- | --- | --- |
| `GET /resources` | `resources list` | | `--limit`, `--page` ou `--cursor`, filtros de query |
| `GET /resources/{id}` | `resources show` | `<id>` | `--fields` quando a API aceita |
| `POST /resources` | `resources create` | | `--<field>` por campo ou `--input <file>` |
| `PUT` ou `PATCH /resources/{id}` | `resources update` | `<id>` | mesmos do create |
| `DELETE /resources/{id}` | `resources delete` | `<id>` | `--yes` (interactive quando sem `--yes`) |
| `POST /resources/{id}/action` | `resources <action>` | `<id>` | parâmetros do body |
| `GET /resources/{id}/children` | `resources children` | `<id>` | paginação |
| `GET /search?q=` | `search` | `<query>` | filtros |

Recurso aninhado (`/shops/{shopId}/orders`) vira `orders list --shop <id>`
quando o pai é um filtro, ou `shops orders <shopId>` quando a API trata o
pai como obrigatório em toda chamada. Prefira a primeira forma.

## Parâmetros para options e arguments

| Na API | No CLI |
| --- | --- |
| path param | argument obrigatório, na ordem do path |
| query param | option `--kebab-case`, mesmo nome |
| enum | `values` da option |
| default documentado | `default` da option |
| required query param | option com `required: true` na description |
| body com até cinco campos | uma option por campo |
| body com mais campos ou aninhado | `--input <file>` com JSON, mais `--input -` para stdin |
| header de negócio (`X-Tenant`) | setting `service.<header>` ou option, conforme varie por chamada |

## Respostas para `data`

- Lista: `{ count, items[] }` ou o nome do recurso (`{ count, orders[] }`),
  mais `nextCursor` ou `page` quando houver paginação.
- Item: `{ <resource> }` com os campos que a API devolve, sem renomear.
- Escrita: `{ <resource> }` criado ou atualizado; `delete` devolve
  `{ id, deleted: true }`.
- Erros HTTP: 401 e 403 → exit code 4 quando a causa é credencial, senão 5;
  404 → 6; 429 e 5xx → 5 com `details.status`.

## Autenticação para credenciais

| Esquema | Credencial | Como o client usa |
| --- | --- | --- |
| Bearer token | `service.token` | `Authorization: Bearer` |
| API key em header | `service.api_key` | header com o nome da doc |
| API key em query | `service.api_key` | query param; registre em Notes que a key aparece na URL |
| Basic | `service.username` e `service.password` | `Authorization: Basic` |
| OAuth2 client credentials | `service.client_id` e `service.client_secret` | token obtido pelo client e guardado em memória |
| OAuth2 authorization code | fora de escopo nesta skill; registre em Notes | |

## Servers para settings

`servers[0].url` vira `service.baseUrl` (string). Ambientes alternativos
(sandbox) entram como valor documentado em `description`, não como key
separada.

## Tools MCP

Uma tool por command de leitura, com o mesmo nome em `snake_case`
(`orders_list`, `orders_show`), efeito `network`. Commands de escrita só
viram tool quando a pessoa pedir, com efeito `write` e descrição que
avisa o efeito.

## Screens

Uma aba por recurso principal, com `listPanel` dos itens e detalhe ao
`Enter`. Não crie aba para recurso secundário.
