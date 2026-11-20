# Padrões e referências de modelagem de domínio

## Blocos de construção táticos (DDD)

- **Entidade**: tem identidade estável ao longo do tempo, mesmo quando seus
  atributos mudam. Duas entidades são iguais se têm a mesma identidade,
  nunca pelos valores dos campos.
- **Value object**: definido inteiramente pelo seu valor, imutável, sem
  identidade própria. Duas instâncias com o mesmo valor são intercambiáveis
  (ex.: `Dinheiro(100, "BRL")`, `Endereço`).
- **Aggregate**: cluster de entidades e value objects tratado como uma
  unidade de consistência transacional. O **aggregate root** é o único ponto
  de entrada para mutação; nada fora do aggregate referencia diretamente um
  membro interno dele.
- **Domain event**: registro imutável de um fato que já ocorreu no domínio,
  nomeado no passado, usado para comunicar mudança entre aggregates ou
  bounded contexts sem acoplamento direto de escrita.
- **Domain service**: comportamento que não pertence naturalmente a uma
  entidade ou value object porque envolve mais de um agregado — usar como
  exceção, não como destino padrão de toda regra.
- **Repository**: abstração de persistência por aggregate root, não por
  tabela — o resto do domínio nunca deve montar consultas cross-aggregate
  diretamente.

## Bounded context e context map

- Um **bounded context** é a fronteira dentro da qual um termo tem exatamente
  um significado. Fora dela, o mesmo termo pode (e frequentemente deve) ter
  outro modelo.
- Padrões de relação entre contextos (context mapping): **Partnership**
  (times coordenam como iguais), **Customer-Supplier** (um depende do
  contrato do outro), **Conformist** (aceita o modelo do outro sem
  influência), **Anticorruption Layer** (traduz na fronteira para proteger o
  modelo próprio de um modelo externo ruim ou legado), **Shared Kernel**
  (parte do modelo é literalmente compartilhada — usar com cautela, cria
  acoplamento de mudança).
- Use Anticorruption Layer sempre que integrar com um sistema legado ou
  externo cujo modelo violaria as invariantes do contexto atual.

## Artefatos de modelagem

- **Glossário**: termo, definição, contexto em que vale, sinônimos
  rejeitados (e por quê) e um exemplo de uso real.
- **Cenário** (formato Given/When/Then ou equivalente): estado inicial,
  comando/evento disparador, regra aplicada, evento resultante, novo estado.
- **Context map**: contextos identificados e o padrão de relação entre cada
  par (dos listados acima).
- **Event storming**: sessão colaborativa que mapeia eventos de domínio em
  ordem cronológica antes de desenhar comandos e aggregates — útil quando o
  domínio ainda não tem modelo nenhum ou está sendo redesenhado.
- **ADR**: decisão estrutural pontual e suas consequências — não é
  substituto do glossário nem repositório de todo o conhecimento de domínio.

## Perguntas-guia para toda decisão de modelo

- Quem decide, e quem é o owner capaz de garantir isso na escrita?
- O que precisa ser consistente imediatamente (mesmo aggregate) versus o que
  pode ser consistente eventualmente (evento + projeção)?
- O que muda sempre junto, na mesma transação?
- Que fato já ocorreu, de forma irreversível, que merece virar evento?
- Qual bounded context dá significado a este termo especificamente?
- Que exemplo concreto quebraria esta definição se ela estiver errada ou
  incompleta?

## Fontes oficiais e primárias

- Domain-Driven Design Reference (Eric Evans): https://www.domainlanguage.com/ddd/reference/
- Implementing Domain-Driven Design (Vaughn Vernon) — resumo e padrões:
  https://www.informit.com/store/implementing-domain-driven-design-9780321834577
- DDD Crew — Context Mapping (padrões e cartas): https://github.com/ddd-crew/context-mapping
- DDD Crew — Bounded Context Canvas: https://github.com/ddd-crew/bounded-context-canvas
- EventStorming (Alberto Brandolini): https://www.eventstorming.com/
- Architecture Decision Records: https://adr.github.io/
