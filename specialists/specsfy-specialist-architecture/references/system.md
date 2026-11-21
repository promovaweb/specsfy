# Padrões e referências de arquitetura

## Views do C4 Model, do mais alto ao mais baixo nível

- **Contexto**: o sistema como caixa única, atores e sistemas externos com
  que troca dados. Resposta a "o que é isto e quem usa".
- **Containers**: as unidades deployáveis/executáveis (serviço, banco, SPA,
  fila) e como se comunicam (protocolo, síncrono/assíncrono).
- **Componentes**: dentro de um container, os módulos principais e suas
  responsabilidades — nível onde a direção de dependência importa mais.
- **Código**: classes/funções — só vale a pena diagramar quando a
  complexidade local justifica, geralmente gerado a partir do código, não
  mantido à mão.

Views adicionais conforme a decisão: **Dados** (ownership, modelo de
consistência, ciclo de vida/retenção) e **Deployment** (processos, nodes,
rede, dependências de infraestrutura). arc42 oferece um template completo de
documento de arquitetura equivalente, organizado em 12 seções.

## Atributos de qualidade como cenário, não adjetivo

Formato SEI Quality Attribute Scenario: **estímulo** (o que acontece) +
**fonte** (quem/o que gera o estímulo) + **ambiente** (condição do sistema
no momento) + **artefato** (parte afetada) + **resposta** (o que o sistema
deve fazer) + **medida da resposta** (como verificar quantitativamente).

Exemplo: "Sob 200 requisições/s simultâneas (estímulo, fonte: tráfego real),
em operação normal (ambiente), o serviço de checkout (artefato) processa a
requisição (resposta) com p99 abaixo de 300ms e taxa de erro abaixo de 0.1%
(medida)." Sem as seis partes, o atributo não é verificável — vira opinião.

## Regra de dependência e acoplamento

- Dependências devem apontar das políticas voláteis (UI, framework, driver
  de banco) para as políticas estáveis (regras de negócio) — nunca o
  inverso. Regra central de Clean Architecture / Hexagonal / Ports & Adapters.
- Acoplamento por contrato explícito (interface, evento, schema versionado)
  é sustentável; acoplamento por implementação (import direto de detalhe
  interno de outro módulo) não escala além de um time.
- Coesão: o que muda pelo mesmo motivo deve estar junto; o que muda por
  motivos diferentes deve estar separado (Single Responsibility no nível de
  módulo, não só de classe).

## Monólito modular vs. serviços distribuídos

- Serviços distribuídos adicionam custo real e imediato: consistência
  eventual entre boundaries, latência de rede, observabilidade distribuída
  obrigatória, deployment e versionamento coordenados entre times.
- Esse custo só compensa quando há um cenário real que o exige: deployment
  independente por time, escala heterogênea entre partes do sistema, ou
  isolamento de falha entre domínios críticos.
- Um monólito modular com boundaries internos claros (módulos com
  interface, sem import cruzado de detalhe) entrega a maior parte do
  benefício de isolamento sem o custo de rede — é o ponto de partida
  padrão até o cenário provar o contrário.
- Team Topologies acrescenta o eixo humano: o boundary de serviço deve
  alinhar com o boundary de time capaz de mantê-lo de ponta a ponta
  (stream-aligned team); serviço sem time dono vira órfão operacional.

## Formato de ADR (Architecture Decision Record)

Contexto (forças em jogo) → Opções consideradas → Decisão → Consequências
(inclusive as negativas) → Evidência que embasou a escolha → Plano de
transição → Condição que justificaria revisar a decisão no futuro. Um ADR
não substitui diagrama (mostra estrutura) nem teste (prova comportamento) —
ele registra o raciocínio por trás da escolha estrutural.

## Fontes oficiais

- C4 Model: https://c4model.com/
- arc42 (template de documentação de arquitetura): https://docs.arc42.org/
- Architecture Decision Records: https://adr.github.io/
- SEI Quality Attribute Scenarios: https://www.sei.cmu.edu/library/applicability-of-general-scenarios-to-the-architecture-tradeoff-analysis-method/
- Team Topologies: https://teamtopologies.com/key-concepts
- The Clean Architecture (regra de dependência): https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- RFC 2119 (linguagem normativa em documentos técnicos): https://www.rfc-editor.org/rfc/rfc2119
