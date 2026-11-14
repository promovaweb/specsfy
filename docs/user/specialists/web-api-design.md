# APIs Web

O especialista APIs Web orienta o agente no desenho e na revisão de contratos
HTTP, REST, JSON, webhooks e descrições OpenAPI. Ele trata erros, paginação,
idempotência e compatibilidade como parte do contrato e prova cada escolha com
testes executados contra a implementação.

## Quando usar

- Você vai projetar ou revisar um contrato HTTP para consumidores internos ou
  externos.
- A tarefa envolve recursos, métodos, status, erros, paginação, idempotência,
  concorrência, autenticação ou compatibilidade.
- O contrato tem ameaças, credenciais ou abuso a considerar. Nesse caso,
  combine com o especialista Segurança de Aplicações.

Antes de tratar RPC ou eventos como recursos HTTP, o agente confirma o estilo
real do contrato. Um contrato orientado a eventos segue outras convenções.

## Como ele trabalha

1. Identifica consumidores, casos de uso, estilo existente, volume, latência,
   disponibilidade e política de compatibilidade.
2. Modela recursos, identidade, relações e invariantes sem expor tabelas ou
   objetos internos como contrato.
3. Define operações, schemas, headers, status e Problem Details, com a
   semântica de retry de cada operação.
4. Desenha autenticação, autorização por recurso e tenant, idempotência,
   precondições e concorrência antes dos handlers.
5. Especifica paginação, filtros, ordenação determinística, limites e rate
   limiting para coleções que mudam durante a leitura.
6. Escreve a descrição OpenAPI ou JSON Schema e os contract tests positivos,
   negativos e de compatibilidade.
7. Define logs, métricas, correlação, depreciação, migração e as condições
   para remover um comportamento antigo.

## Padrões aplicados

- A semântica HTTP é coerente, com status específicos.
- O formato de erro é estável, acionável e sem vazamento de informações
  internas.
- Coleções extensas que mudam durante a paginação usam cursor.
- Criação e retry usam uma chave de idempotência quando necessário.
- Webhooks têm assinatura, timestamp, proteção contra replay e reentrega.
- Mudanças incompatíveis são declaradas. Campos ambíguos ficam fora do
  contrato.
- O modelo de persistência não vira contrato por conveniência.

## Erros que ele evita

- Responder `200` para todo resultado e indicar a falha apenas no corpo.
- Repetir um POST depois de um timeout sem idempotência, o que pode duplicar
  uma cobrança ou outro efeito externo.
- Paginar por offset uma coleção grande e mutável sem ordenação estável.
- Autorizar só no endpoint ou na lista e esquecer o recurso carregado.
- Criar uma nova versão de URL para cada mudança aditiva.

## Como conferir o resultado

- Contract tests cobrem request, response, headers e Problem Details com
  exemplos válidos e inválidos.
- A autorização foi provada com identidade correta, identidade de outro
  tenant, credencial expirada e escopo insuficiente.
- Retry, duplicação, timeout depois do commit, atualização concorrente e
  paginação com itens entrando e saindo foram simulados.
- A descrição OpenAPI passou por lint e foi comparada com a última versão
  publicada em busca de mudanças incompatíveis.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-web-api-design --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Astro](astro.md) implementa endpoints consumidos fora do próprio site.
- [Segurança de Aplicações](application-security.md) cobre ameaças, OAuth e
  segredos.
- [Modelagem de Domínio](domain-modeling.md) define vocabulário e invariantes
  antes de expô-los.
- [TypeScript](typescript.md) modela os tipos internos.
- [Observabilidade](observability.md) define telemetria e SLOs.
- [Performance](performance-engineering.md) mede throughput e latência sem
  mudar a semântica do contrato.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-web-api-design/SKILL.md),
com orientações sobre métodos, erros, idempotência e webhooks no arquivo de
referência da mesma pasta.
