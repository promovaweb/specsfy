# Fontes de documentação

## OpenAPI ou Swagger (JSON ou YAML)

A melhor fonte. Leia com `bun -e` ou `Bun.YAML.parse` e percorra:

- `info.title` e `info.version`: nome do serviço e versão da API, para a
  `## Notes`.
- `servers[].url`: base URL.
- `paths`: cada `path` e `method`, com `operationId`, `summary`,
  `parameters` (in: path, query, header), `requestBody` e `responses`.
- `components.securitySchemes` e `security`: autenticação.
- `components.schemas`: campos dos recursos, para descrever `data`.

Swagger 2.0 usa `host`, `basePath`, `schemes` e `securityDefinitions`;
converta mentalmente para o mesmo mapa.

## Coleção Postman

`item[]` aninhado, cada um com `request.method`, `request.url` e
`request.auth`. O agrupamento em pastas costuma ser o recurso. Variáveis
`{{baseUrl}}` e `{{token}}` indicam setting e credencial.

## Página de referência (HTML ou Markdown)

Baixe para `tmp/` e leia o texto. Procure títulos por recurso, blocos
`GET /...`, tabelas de parâmetros e a seção de autenticação. Marque em
`## Notes` tudo que a página não deixa claro (tipo de um parâmetro,
formato de erro, paginação).

## Texto colado ou PDF

Trate como página de referência. Quando a pessoa colar só exemplos de
`curl`, extraia method, path, headers e body de cada um; cada `curl` vira
um endpoint.

## O que registrar em `## Notes` em qualquer formato

- Fonte: arquivo, URL ou "texto colado", com data.
- Versão da API.
- Esquema de paginação (cursor, página, cabeçalho `Link`).
- Rate limit e cabeçalhos de retry.
- Formato de erro da API (campo de mensagem e de código).
- Endpoints deixados fora e por quê.
- Dúvidas abertas, uma por linha.
