# Arquitetura

O especialista Arquitetura orienta o agente em escolhas estruturais difíceis de
reverter, como um serviço novo, uma fila, um cache distribuído ou a direção de
uma dependência entre módulos, e no desenho de contratos HTTP consumidos por
outros times. A comparação usa cenários mensuráveis de qualidade e fica com a
menor estrutura capaz de atender a todos eles.

## Quando usar

- Você vai introduzir um serviço, uma fila ou um cache distribuído.
- A tarefa muda o limite entre módulos ou a direção de uma dependência
  estrutural.
- Um atributo de qualidade, como latência, disponibilidade ou consistência,
  precisa orientar a escolha de forma explícita.
- Você vai projetar ou revisar um contrato HTTP, REST, JSON, webhook ou
  descrição OpenAPI para consumidores internos ou externos.
- A tarefa envolve recursos, métodos, status, erros, paginação, idempotência,
  concorrência, autenticação ou compatibilidade.

Renomear, mover arquivos ou refatorar localmente é manutenção. Quando o limite em
discussão é um conceito de negócio ainda não modelado, o especialista
[Modelagem](modeling.md) entra primeiro. A causa de uma latência fica com
[Observabilidade](observability.md), e ameaças, credenciais e abuso com
[Segurança de Aplicações](application-security.md).

## Como ele trabalha

1. Define a finalidade do sistema ou do contrato, os consumidores e as restrições
   de orçamento, prazo, equipe e compatibilidade.
2. Descreve o estado atual: responsáveis por cada base, dependências entre
   módulos, fluxos principais em runtime e os pontos de dor.
3. Identifica as forças em conflito, as escolhas caras de reverter e as
   consequências de cada caminho.
4. Compara as opções pelos mesmos cenários e pelo custo operacional de cada uma,
   incluindo rede, consistência distribuída e observabilidade.
5. Registra a escolha no artefato do projeto, como um ADR ou uma descrição
   OpenAPI, e verifica o resultado com teste, lint ou análise estática.
6. Comunica a consequência operacional: migração, depreciação, rollback e o que
   ainda não foi comprovado.

## Arquitetura de software

1. Expressa cada atributo de qualidade como um cenário com estímulo, ambiente,
   resposta e medida, como "sob 200 req/s, p99 abaixo de 300 ms".
2. Escolhe a menor estrutura que atende aos cenários.
3. Dá a cada módulo responsabilidade, dados e interface claros, com dependências
   apontando das partes voláteis para as estáveis.
4. Separa a arquitetura implementada da arquitetura desejada.
5. Define o plano de transição, com compatibilidade durante a migração,
   observabilidade e um rollback viável.
6. Registra a escolha em um ADR com contexto, opções, decisão, consequências,
   plano de transição e condição de revisão.
7. Verifica os limites com testes de dependência ou análise estática, quando
   possível.

## APIs web

1. Identifica consumidores, casos de uso, estilo existente, volume, latência,
   disponibilidade e política de compatibilidade.
2. Modela recursos, identidade, relações e invariantes sem expor tabelas ou
   objetos internos como contrato.
3. Define operações, schemas, headers e status, com a semântica de retry de cada
   operação.
4. Modela erros com RFC 9457, com `type` estável, `title`, `status`, `detail`
   seguro e `instance`, sem stack trace, SQL ou segredo.
5. Desenha autenticação, autorização por recurso e tenant, idempotência,
   precondições e concorrência antes dos handlers.
6. Especifica paginação, filtros, ordenação determinística, limites e rate
   limiting para coleções que mudam durante a leitura.
7. Escreve a descrição OpenAPI ou JSON Schema e os contract tests positivos,
   negativos e de compatibilidade.
8. Define logs, métricas, correlação, depreciação, migração e as condições para
   remover um comportamento antigo.

## Padrões aplicados

- Cada módulo tem responsabilidade, armazenamento e interface claros.
- As dependências apontam das partes voláteis para as estáveis. O módulo de
  negócio não depende de detalhes de framework ou infraestrutura.
- Serviço, fila, cache ou abstração nova exige um cenário consumidor mensurável.
- A arquitetura implementada e a arquitetura desejada são descritas
  separadamente.
- Cada atributo de qualidade vira um cenário mensurável.
- Escolhas fáceis de substituir ficam locais. Só as escolhas caras de mudar
  ganham um ADR.
- A evolução acontece por etapas verificáveis, como strangler fig e expand e
  contract, em vez de uma reescrita completa.
- A semântica HTTP é coerente, com status específicos.
- O formato de erro é estável, acionável e sem vazamento de informações
  internas.
- Coleções extensas que mudam durante a paginação usam cursor, com ordenação
  determinística e ID como desempate.
- Criação e retry usam uma chave de idempotência quando necessário.
- Webhooks têm assinatura, timestamp, proteção contra replay e reentrega.
- A depreciação aparece nos cabeçalhos `Deprecation` e `Sunset`, com link para a
  documentação da migração.
- Mudanças incompatíveis são declaradas. Campos ambíguos ficam fora do contrato.
- O modelo de persistência não vira contrato por conveniência.

## Erros que ele evita

- Adotar microsserviços sem um cenário de escala ou de deploy independente que
  justifique o custo.
- Módulos sem limites nem direção de dependência, chamando uns aos outros
  livremente.
- Projetar uma arquitetura para o futuro sem um cenário mensurável.
- Criar uma camada genérica de indireção com um único consumidor.
- Responder `200` para todo resultado e indicar a falha apenas no corpo.
- Repetir um POST depois de um timeout sem idempotência, o que pode duplicar uma
  cobrança ou outro efeito externo.
- Paginar por offset uma coleção grande e mutável sem ordenação estável.
- Autorizar só no endpoint ou na lista e esquecer o recurso carregado.
- Criar uma nova versão de URL para cada mudança aditiva.

## Como conferir o resultado

- Caminhos principais, modos de falha, consistência e capacidade foram avaliados
  contra os cenários definidos.
- Testes de arquitetura ou de dependência mantêm a direção escolhida, quando a
  ferramenta permite.
- A migração foi ensaiada, com rollback testado.
- Os impactos em segurança, banco de dados e operação fazem parte da escolha.
- Contract tests cobrem request, response, headers e Problem Details com
  exemplos válidos e inválidos.
- A autorização foi provada com identidade correta, identidade de outro tenant,
  credencial expirada e escopo insuficiente.
- Retry, duplicação, timeout depois do commit, atualização concorrente e
  paginação com itens entrando e saindo foram simulados.
- A descrição OpenAPI passou por lint e foi comparada com a última versão
  publicada em busca de mudanças incompatíveis.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-architecture --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Modelagem](modeling.md) define o vocabulário e os invariantes antes de expor
  recursos ou decidir um limite de serviço.
- [Pesquisa](research.md) reúne comprovação primária sobre limites,
  compatibilidade e capacidade externa.
- [Observabilidade](observability.md) mede o atributo de qualidade, define o
  sinal de saúde e diagnostica a latência do contrato.
- [Segurança de Aplicações](application-security.md) cobre ameaças, OAuth,
  segredos e trust boundaries.
- [Code Review](code-review.md) confere se o código respeita os limites
  escolhidos.
- [TypeScript](typescript.md) modela os tipos internos sem torná-los a fonte
  pública do contrato.
- [Interface](interface.md) trata a superfície para pessoas quando o mesmo
  sistema também é acessado por tela.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-architecture/SKILL.md),
com visões arquiteturais, formato de ADR e atributos de qualidade em
`references/system.md` e as matrizes de HTTP, erro, idempotência, paginação e
evolução em `references/web-api.md`.
