---
name: specsfy-specialist-software-architecture
description: Analisar e evoluir arquitetura com boundaries, direção de dependência, atributos de qualidade mensuráveis, ADRs, custo operacional, migração e trade-offs entre monólito modular e serviços distribuídos. Use para modularização, coupling, escalabilidade, resiliência ou escolhas caras de reverter; não use para renomeação local sem impacto estrutural nem para escolher a fronteira de um único domínio, use `$specsfy-specialist-domain-modeling` para isso primeiro.
---

# Arquitetura de software

## Quando usar

- Acionar para escolha com custo alto de reverter: introduzir um serviço,
  uma fila, um cache distribuído, mudar o boundary entre módulos ou a
  direção de uma dependência estrutural.
- Acionar também quando um atributo de qualidade (latência, disponibilidade,
  consistência, capacidade) precisar virar regra explícita de escolha.
- Não acionar para renomear, mover arquivo ou refatorar localmente sem
  impacto de boundary: isso é manutenção, não escolha arquitetural.
- Rodar `$specsfy-specialist-domain-modeling` primeiro quando o boundary em
  disputa for de um conceito de domínio ainda não modelado: a arquitetura
  decide onde colocar um boundary já definido pelo domínio, não o inventa.

## Fluxo

1. Definir finalidade do sistema, restrições reais (orçamento, prazo, time
   disponível) e cenários de atributo de qualidade mensuráveis (não
   adjetivos como "escalável").
2. Mapear o estado observado: owners de dados, dependências existentes entre
   módulos/serviços, fluxos de runtime críticos e onde a dor atual está.
3. Identificar as forças em conflito, as escolhas que seriam caras de
   reverter depois e as consequências de cada caminho.
4. Comparar opções pelas mesmas regras (os cenários do passo 1) e pelo
   custo operacional real de cada uma: rede, consistência distribuída,
   observabilidade adicional, times a coordenar.
5. Escolher a menor estrutura que satisfaz os cenários definidos: a opção
   mais simples que atende o atributo de qualidade vence por padrão.
6. Definir plano de transição: compatibilidade durante a migração,
   observabilidade para detectar regressão e um caminho de rollback real.
7. Registrar a escolha (ADR) e verificar os boundaries propostos por teste
   de dependência automatizado ou análise estática, quando possível.

## Padrões

- Dar a cada módulo responsabilidade, dados e interface claros: um módulo
  sem contrato explícito vira acoplamento implícito para quem o consome.
- Direcionar dependências das políticas voláteis para as estáveis (regra de
  dependência): módulo de negócio não deve depender de detalhe de
  framework/infra; o inverso é o padrão saudável.
- Evitar introduzir serviço, fila, cache ou camada de abstração sem um
  cenário consumidor real e mensurável que a justifique: abstração
  especulativa cria custo permanente por benefício hipotético.
- Separar explicitamente a arquitetura implementada (o que existe hoje) da
  arquitetura desejada (para onde está migrando): tratá-las como a mesma
  coisa esconde dívida e trabalho pendente.
- Expressar todo atributo de qualidade como cenário mensurável: estímulo,
  ambiente, resposta esperada, medida (ex.: "sob 200 req/s, p99 < 300ms"),
  nunca como adjetivo solto.
- Manter escolhas facilmente substituíveis como locais e reversíveis.
  Tornar explícitas (ADR) apenas as escolhas realmente caras de mudar depois.
- Evoluir arquitetura por seams verificáveis e incrementais (strangler fig,
  expand/contract) em vez de reescrita completa: reescrita total raramente
  entrega no prazo e perde conhecimento acumulado no sistema atual.

## Antipadrões

- Adotar microsserviços porque "é o padrão da indústria" sem um cenário de
  escala, time ou deployment independente que o justifique: o custo de
  consistência distribuída e operação multiplicada é real e imediato; o
  benefício é hipotético até que o cenário apareça.
- Big ball of mud: módulos sem fronteira nem direção de dependência
  definida, onde qualquer parte pode chamar qualquer outra diretamente.
- Big design up front sem cenário de qualidade mensurável: arquitetura
  "para o futuro" sem estímulo concreto que a justifique tende a resolver o
  problema errado e travar escolhas reversíveis cedo demais.
- Adicionar uma camada de indireção genérica "para flexibilidade futura"
  quando existe apenas um consumidor real hoje: paga o custo de
  complexidade antes de haver qualquer comprovação de que a flexibilidade
  será usada.

## Validação

- Caminhos críticos, modos de falha, requisitos de consistência e
  capacidade foram avaliados contra os cenários definidos, não só o caminho
  feliz.
- Existem testes de arquitetura ou de dependência (quando a linguagem/
  ferramenta permitir) que travam a direção de dependência decidida.
- Há ensaio da migração: compatibilidade durante a transição, plano de
  rollback testado, não apenas descrito.
- Impactos em segurança, dados e operação foram revisados como parte da
  escolha, não como reflexão posterior.
- Não declarar uma arquitetura "escalável" ou "resiliente" sem o cenário
  mensurável e a comprovação que o comprova: linguagem absoluta sem prova é
  proibida.

## Skills relacionadas

- `$specsfy-specialist-technical-research` reúne comprovação primária quando a
  escolha depende de capacidade, limite ou compatibilidade externa.
- `$specsfy-specialist-domain-modeling` para decidir o boundary de um
  conceito de domínio antes de decidir o boundary de serviço/módulo.
- `$specsfy-specialist-delivery-engineering` para o plano de rollout e
  rollback de uma migração arquitetural.
- `$specsfy-specialist-performance-engineering` quando o atributo de
  qualidade em disputa for latência ou capacidade sob carga real.
- `$specsfy-specialist-code-review` para verificar que o código implementado
  respeita os boundaries decididos aqui.

Leia [references/standards.md](references/standards.md) para views
arquiteturais, formato de ADR, atributos de qualidade e fontes primárias.
