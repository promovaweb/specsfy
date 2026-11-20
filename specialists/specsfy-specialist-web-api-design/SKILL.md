---
name: specsfy-specialist-web-api-design
description: Projetar e revisar APIs HTTP com recursos, métodos, status, erros, paginação, idempotência, concorrência, autenticação e evolução compatível. Use para REST, JSON APIs, webhooks ou OpenAPI; não aplicar estilo REST a RPC sem avaliar o contrato real.
---

# Design de APIs web

## Quando usar

- Acionar ao projetar ou revisar contratos HTTP, REST, JSON, webhooks ou
  descrições OpenAPI para consumidores internos ou externos.
- Acionar para escolhas de recursos, métodos, status, erros, paginação,
  idempotência, concorrência, autenticação e compatibilidade.
- Não acionar para RPC ou eventos como se fossem recursos HTTP sem primeiro
  confirmar o estilo do contrato real.
- Combinar com `$specsfy-specialist-application-security` para threat modeling,
  credenciais, abuso e trust boundaries.

## Fluxo

1. Descobrir consumidores, casos de uso, estilo existente, volume, latência,
   disponibilidade, trust boundaries e política de compatibilidade.
2. Modelar recursos, identidade, relações, invariantes e ownership sem expor
   tabelas ou objetos internos como contrato por conveniência.
3. Definir operações, schemas, headers, status e Problem Details; registrar a
   semântica de retry por operação usando
   [references/standards.md](references/standards.md).
4. Projetar autenticação, autorização por recurso/tenant, idempotência,
   precondições e concorrência antes de implementar handlers.
5. Especificar paginação, filtros, ordenação determinística, limites, rate
   limiting e comportamento diante de dados mutáveis.
6. Materializar OpenAPI/JSON Schema e contract tests positivos, negativos e de
   compatibilidade executados contra a implementação.
7. Definir logs, métricas, correlação, depreciação, migração e condições para
   remover comportamento antigo sem quebrar consumidores conhecidos.

## Padrões

- Usar semântica HTTP coerente e status específicos.
- Manter formato de erro estável, acionável e sem vazamento.
- Usar cursor quando dados mudam durante paginação extensa.
- Tornar criação/retry seguros com chave de idempotência quando necessário.
- Proteger webhooks com assinatura, timestamp, replay defense e reentrega.
- Evitar breaking changes silenciosas e campos com semântica ambígua.
- Não expor modelo de persistência como contrato por conveniência.

## Antipadrões

- Responder `200` para todo resultado e codificar falha apenas no body; caches,
  clientes e observabilidade perdem a semântica do protocolo.
- Repetir POST após timeout sem idempotência ou reconciliação; uma resposta
  perdida pode duplicar cobrança, pedido ou efeito externo.
- Paginar por offset em coleção grande e mutável sem ordenação estável; itens
  são duplicados ou omitidos entre páginas.
- Autorizar somente no endpoint/lista e não no recurso carregado; IDs válidos
  atravessam tenants ou escopos.
- Versionar a URL para toda mudança aditiva; multiplica contratos ativos sem
  resolver disciplina de compatibilidade.

## Validação

- Executar contract tests de request, response, headers e Problem Details
  contra exemplos válidos e inválidos da descrição.
- Provar autorização por recurso e tenant com identidade correta, identidade
  cruzada, credencial expirada e escopo insuficiente.
- Simular retry, duplicação, timeout após commit, corrida de atualização e
  paginação enquanto itens entram e saem.
- Fazer lint e validação estrutural de OpenAPI/JSON Schema e comparar breaking
  changes contra a última versão publicada.
- Não declarar compatibilidade ou idempotência sem comprovação de replay e teste
  automatizado do contrato observado pelo consumidor.

## Skills relacionadas

- `$specsfy-specialist-application-security` cobre threat modeling, OAuth,
  proteção de segredo, abuso e trust boundaries.
- `$specsfy-specialist-domain-modeling` define vocabulário e invariantes antes
  de expô-los como recursos.
- `$specsfy-specialist-typescript` modela tipos internos sem torná-los
  automaticamente a fonte pública do contrato.
- `$specsfy-specialist-observability` define telemetria e SLOs além dos campos
  de correlação do contrato.
- `$specsfy-specialist-performance-engineering` mede throughput e latência sem
  alterar semântica para ganhar benchmark.

Leia [references/standards.md](references/standards.md) para matrizes de método,
erros, idempotência, concorrência, paginação, webhooks e evolução compatível.
