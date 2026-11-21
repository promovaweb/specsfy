# Padrões para APIs HTTP

## Recursos, métodos e precondições

| Intenção | Método/contrato | Propriedade relevante |
| --- | --- | --- |
| ler representação | `GET` | safe, idempotente e cacheável conforme headers |
| substituir estado conhecido | `PUT` | idempotente; representação completa definida |
| alterar parcialmente | `PATCH` | formato e idempotência precisam ser declarados |
| criar/processar comando | `POST` | proteger retry quando efeito não é naturalmente idempotente |
| remover | `DELETE` | efeito pretendido idempotente, resposta pode variar |

Use `If-Match` com ETag ou precondição equivalente quando duas edições não podem
sobrescrever uma à outra silenciosamente. Responda `412 Precondition Failed`
quando a precondição recebida falhar e `428 Precondition Required` somente se a
política do servidor exigir requisição condicional.

## Status e erros

- `201 Created`: recurso criado e `Location` quando houver URI própria.
- `202 Accepted`: processamento ainda não terminou; exponha forma de acompanhar.
- `204 No Content`: sucesso sem representação; não envie body.
- `400 Bad Request`: sintaxe ou request genericamente inválido.
- `401 Unauthorized`: autenticação ausente/inválida, com desafio quando cabível.
- `403 Forbidden`: identidade conhecida sem autorização suficiente.
- `404 Not Found`: recurso ausente ou ocultado por política consistente.
- `409 Conflict`: conflito com estado atual que o cliente pode tratar.
- `422 Unprocessable Content`: conteúdo entendido, mas semanticamente inválido.
- `429 Too Many Requests`: limite excedido; informe retry quando possível.

Modele erros com RFC 9457 usando `type` estável, `title`, `status`, `detail`
seguro e `instance` quando útil. Extensões carregam código de domínio, campos
inválidos e correlação; não coloque stack trace, SQL ou segredo.

## Idempotência e retry

Para uma operação POST com efeito externo:

1. cliente gera chave de idempotência de alta entropia por intenção;
2. servidor vincula chave a identidade, operação e hash/fingerprint do payload;
3. repetição equivalente recebe o resultado previamente materializado;
4. repetição com payload diferente falha explicitamente;
5. concorrência sobre a mesma chave é serializada ou rejeitada;
6. retenção e expiração da chave são documentadas.

Teste o caso em que o commit ocorreu e a resposta se perdeu. Retry de transporte
não pode significar duplicação de efeito.

## Paginação, filtro e ordenação

- Ordene por chave determinística e única; acrescente ID como desempate.
- Cursor deve representar posição/ordenação, ser opaco para o consumidor e ser
  validado contra filtros incompatíveis.
- Defina `limit` default e máximo, direção e comportamento de cursor inválido.
- Não forneça total exato se o custo ou consistência não sustentam a promessa;
  diferencie estimativa quando existir.
- Defina sintaxe, tipos e allowlist de filtros; não exponha expressão SQL.
- Teste inserção, remoção e atualização entre páginas.

Offset é aceitável para coleção pequena/estável ou navegação por página cuja
inconsistência seja tolerada. Não o escolha apenas por simplicidade do banco.

## Autorização e exposição

- Autorize o recurso carregado e a ação concreta, não só o endpoint.
- Inclua tenant/organização no lookup ou aplique política equivalente antes de
  serializar.
- Use allowlist de campos de request/response para impedir mass assignment e
  exposição acidental.
- Diferencie autenticação, autorização, entitlement e ownership.
- Normalize erros de recursos secretos quando diferença entre 403/404 vazar
  existência de forma relevante.

## Webhooks

- Assine o corpo bruto com segredo e algoritmo versionado.
- Inclua ID do evento e timestamp; valide tolerância e proteja replay.
- Consumidor deduplica pelo ID e processa de forma idempotente.
- Entrega tem timeout curto, retry com backoff e política de expiração.
- Ordenação não é presumida sem garantia explícita; payload inclui versão e
  identidade suficiente para reconciliar.
- Rotação de segredo aceita janela controlada de chaves.

## Evolução compatível

Geralmente aditivos:

- endpoint/operação nova;
- campo opcional novo em resposta quando clientes toleram desconhecidos;
- valor novo apenas quando consumidores tratam enum aberto.

Potencialmente breaking:

- remover/renomear campo ou operação;
- tornar opcional obrigatório ou restringir formato;
- mudar unidade, timezone, ordenação ou semântica de `null`;
- adicionar enum quando clientes usam switch exaustivo;
- alterar regra de autorização, retry ou consistência.

Publique depreciação, telemetria de uso, alternativa, prazo e canal de migração.
Compare OpenAPI estruturalmente e rode contract tests de consumidores antes de
remover.

## Evidência mínima

- OpenAPI 3.1 e JSON Schemas validam exemplos positivos e negativos;
- testes cobrem status, headers, Problem Details e limites;
- replay e concorrência provam idempotência;
- testes cruzados provam isolamento por tenant/recurso;
- paginação permanece coerente sob mutação;
- diff de contrato classifica mudanças compatíveis e breaking;
- logs correlacionam request sem registrar segredo ou payload sensível.

## Fontes primárias

- HTTP Semantics, RFC 9110: https://www.rfc-editor.org/rfc/rfc9110
- HTTP Caching, RFC 9111: https://www.rfc-editor.org/rfc/rfc9111
- Problem Details, RFC 9457: https://www.rfc-editor.org/rfc/rfc9457
- Conditional Requests, RFC 9110: https://www.rfc-editor.org/rfc/rfc9110#section-13
- OpenAPI 3.1: https://spec.openapis.org/oas/v3.1.0
- JSON Schema: https://json-schema.org/specification
- OAuth 2.0 Security BCP, RFC 9700: https://www.rfc-editor.org/rfc/rfc9700
- Idempotency-Key draft: https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/
- CloudEvents: https://cloudevents.io/
