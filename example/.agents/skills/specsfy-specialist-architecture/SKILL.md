---
name: specsfy-specialist-architecture
description: "Analisar e evoluir arquitetura de software (modo system: boundaries, direção de dependência, atributos de qualidade mensuráveis, ADRs, custo operacional e migração) e projetar contratos HTTP (modo web-api: recursos, métodos, status, erros, paginação, idempotência, webhooks e evolução compatível). Use para modularização, coupling, escalabilidade, resiliência, REST, JSON APIs, OpenAPI ou escolhas caras de reverter. Não use para renomeação local sem impacto estrutural; para definir o boundary de um conceito de domínio use `$specsfy-specialist-modeling`; para diagnosticar latência use `$specsfy-specialist-observability`; para ameaças, OAuth e segredos use `$specsfy-specialist-application-security`."
---

# Arquitetura

Decida estrutura com cenário mensurável, não com adjetivo. O modo system trata
boundaries, direção de dependência e custo operacional de uma escolha cara de
reverter. O modo web-api trata o contrato HTTP que outros times e sistemas
consomem, com erro, idempotência e evolução compatível.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Serviço, fila, cache distribuído, boundary entre módulos, direção de dependência, atributo de qualidade, ADR ou migração estrutural | system | [C4, cenários de qualidade, acoplamento e ADR](references/system.md) |
| Contrato HTTP, REST, JSON, webhooks, OpenAPI, status, erro, paginação, idempotência ou compatibilidade | web-api | [Métodos, erros, idempotência, paginação e evolução](references/web-api.md) |

Não use para:

- Renomear, mover arquivo ou refatorar localmente sem impacto de boundary.
  Isso é manutenção, não escolha arquitetural.
- Inventar o boundary de um conceito de domínio ainda não modelado. Rode
  `$specsfy-specialist-modeling` no modo domain primeiro.
- Diagnosticar a causa de uma latência ou provar uma otimização. Use
  `$specsfy-specialist-observability` no modo performance.
- Fazer threat modeling, escolher fluxo OAuth ou tratar abuso e credencial. Use
  `$specsfy-specialist-application-security`.
- Aplicar estilo REST a RPC ou eventos sem antes confirmar o estilo real do
  contrato.

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a linha `| Especialistas |` da tabela de
   metadados, a subseção `#### Especialistas` em `### 8. Plano técnico` e a
   seção que a fase está escrevendo. Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md` antes de propor boundary, serviço ou contrato.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-architecture (system|web-api)`. Sem
   indicação, escolha o modo pelo "Quando usar" acima.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Registre a escolha na subseção `Arquitetura e módulos` da seção 8 e em
   `### 17. Decisões`, com o cenário de qualidade que comprova a escolha; ADR
   em arquivo separado só quando o projeto já mantiver esse diretório.

## Fluxo

1. Definir finalidade do sistema ou do contrato, consumidores e restrições
   reais (orçamento, prazo, time disponível, política de compatibilidade).
2. Mapear o estado observado: owners de dados, dependências existentes, fluxos
   de runtime críticos e onde a dor atual está.
3. Identificar as forças em conflito, as escolhas caras de reverter e as
   consequências de cada caminho.
4. Executar o fluxo do modo escolhido, comparando opções pelas mesmas regras e
   pelo custo operacional real de cada uma.
5. Registrar a escolha no artefato do projeto (ADR, OpenAPI, contract test) e
   verificar o resultado com teste, lint ou análise estática.
6. Comunicar a consequência operacional: migração, depreciação, rollback e o
   que ainda não foi comprovado.

### Modo system

1. Expressar cada atributo de qualidade como cenário mensurável: estímulo,
   ambiente, resposta esperada e medida (ex.: "sob 200 req/s, p99 < 300ms"),
   nunca como adjetivo solto.
2. Escolher a menor estrutura que satisfaz os cenários definidos: a opção mais
   simples que atende o atributo de qualidade vence por padrão.
3. Dar a cada módulo responsabilidade, dados e interface claros, e direcionar
   dependências das políticas voláteis para as estáveis.
4. Separar explicitamente a arquitetura implementada (o que existe hoje) da
   arquitetura desejada (para onde está migrando).
5. Definir plano de transição: compatibilidade durante a migração,
   observabilidade para detectar regressão e um caminho de rollback real.
6. Registrar a escolha em ADR com contexto, opções, decisão, consequências
   (inclusive negativas), plano de transição e condição de revisão.
7. Verificar os boundaries propostos por teste de dependência automatizado ou
   análise estática, quando possível.

### Modo web-api

1. Modelar recursos, identidade, relações, invariantes e ownership sem expor
   tabelas ou objetos internos como contrato por conveniência.
2. Definir operações, schemas, headers e status, com a semântica de retry
   registrada por operação.
3. Modelar erro com RFC 9457 (`type` estável, `title`, `status`, `detail`
   seguro, `instance`), sem stack trace, SQL ou segredo.
4. Projetar autenticação, autorização por recurso e tenant, idempotência,
   precondições e concorrência antes de implementar handlers.
5. Especificar paginação, filtros, ordenação determinística, limites, rate
   limiting e comportamento diante de dados mutáveis.
6. Materializar OpenAPI/JSON Schema e contract tests positivos, negativos e de
   compatibilidade executados contra a implementação.
7. Definir logs, métricas, correlação, depreciação, migração e condições para
   remover comportamento antigo sem quebrar consumidores conhecidos.

## Padrões

- Dar a cada módulo responsabilidade, dados e interface claros: um módulo sem
  contrato explícito vira acoplamento implícito para quem o consome.
- Direcionar dependências das políticas voláteis para as estáveis (regra de
  dependência): módulo de negócio não deve depender de detalhe de
  framework/infra; o inverso é o padrão saudável.
- Evitar introduzir serviço, fila, cache ou camada de abstração sem um cenário
  consumidor real e mensurável que a justifique: abstração especulativa cria
  custo permanente por benefício hipotético.
- Separar explicitamente a arquitetura implementada da desejada: tratá-las como
  a mesma coisa esconde dívida e trabalho pendente.
- Expressar todo atributo de qualidade como cenário mensurável, nunca como
  adjetivo solto.
- Manter escolhas facilmente substituíveis como locais e reversíveis. Tornar
  explícitas (ADR) apenas as escolhas realmente caras de mudar depois.
- Evoluir arquitetura por seams verificáveis e incrementais (strangler fig,
  expand/contract) em vez de reescrita completa: reescrita total raramente
  entrega no prazo e perde conhecimento acumulado no sistema atual.
- Usar semântica HTTP coerente e status específicos.
- Manter formato de erro estável, acionável e sem vazamento.
- Usar cursor quando dados mudam durante paginação extensa, com ordenação
  determinística e ID como desempate.
- Tornar criação/retry seguros com chave de idempotência quando necessário.
- Proteger webhooks com assinatura, timestamp, replay defense e reentrega.
- Evitar breaking changes silenciosas e campos com semântica ambígua.
- Não expor modelo de persistência como contrato por conveniência.

## Antipadrões

- Adotar microsserviços porque "é o padrão da indústria" sem um cenário de
  escala, time ou deployment independente que o justifique: o custo de
  consistência distribuída e operação multiplicada é real e imediato; o
  benefício é hipotético até que o cenário apareça.
- Big ball of mud: módulos sem fronteira nem direção de dependência definida,
  onde qualquer parte pode chamar qualquer outra diretamente.
- Big design up front sem cenário de qualidade mensurável: arquitetura "para o
  futuro" sem estímulo concreto tende a resolver o problema errado e travar
  escolhas reversíveis cedo demais.
- Adicionar uma camada de indireção genérica "para flexibilidade futura" quando
  existe apenas um consumidor real hoje: paga o custo de complexidade antes de
  haver qualquer comprovação de que a flexibilidade será usada.
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

- Caminhos críticos, modos de falha, requisitos de consistência e capacidade
  foram avaliados contra os cenários definidos, não só o caminho feliz.
- Existem testes de arquitetura ou de dependência (quando a linguagem/
  ferramenta permitir) que travam a direção de dependência decidida.
- Há ensaio da migração: compatibilidade durante a transição, plano de rollback
  testado, não apenas descrito.
- Impactos em segurança, dados e operação foram revisados como parte da
  escolha, não como reflexão posterior.
- Executar contract tests de request, response, headers e Problem Details
  contra exemplos válidos e inválidos da descrição.
- Provar autorização por recurso e tenant com identidade correta, identidade
  cruzada, credencial expirada e escopo insuficiente.
- Simular retry, duplicação, timeout após commit, corrida de atualização e
  paginação enquanto itens entram e saem.
- Fazer lint e validação estrutural de OpenAPI/JSON Schema e comparar breaking
  changes contra a última versão publicada.
- Não declarar uma arquitetura "escalável" ou "resiliente" sem o cenário
  mensurável que o comprova: linguagem absoluta sem prova é proibida.
- Não declarar compatibilidade ou idempotência sem comprovação de replay e
  teste automatizado do contrato observado pelo consumidor.

## Skills relacionadas

- `$specsfy-specialist-modeling` define o vocabulário e os invariantes antes de
  decidir onde colocar o boundary de serviço ou de expor o recurso.
- `$specsfy-specialist-research` reúne comprovação primária quando a escolha
  depende de capacidade, limite ou compatibilidade externa.
- `$specsfy-specialist-observability` mede o atributo de qualidade, define o
  sinal de saúde e diagnostica a latência do contrato.
- `$specsfy-specialist-application-security` cobre threat modeling, OAuth,
  proteção de segredo, abuso e trust boundaries.
- `$specsfy-specialist-code-review` verifica que o código implementado respeita
  os boundaries decididos aqui.
- `$specsfy-specialist-typescript` modela tipos internos sem torná-los
  automaticamente a fonte pública do contrato.
- `$specsfy-specialist-interface` trata a superfície para pessoas quando o
  mesmo sistema também é acessado por tela.

Leia [references/standards.md](references/standards.md) para o padrão comum, o
índice dos modos e as fontes primárias. Leia
[references/system.md](references/system.md) para views do C4, formato de
cenário de qualidade, regra de dependência, monólito modular versus serviços e
formato de ADR. Leia [references/web-api.md](references/web-api.md) para
matrizes de método, status, erros, idempotência, concorrência, paginação,
webhooks e evolução compatível.
