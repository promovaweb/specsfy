---
name: specsfy-specialist-domain-modeling
description: Descobrir e refinar linguagem ubíqua de domínio, invariantes, eventos, aggregates e bounded contexts a partir de cenários concretos, evitando anemic domain model. Use quando termos, regras ou ownership de dados estiverem ambíguos, dois times usarem a mesma palavra com sentido diferente, ou uma escolha de modelo for necessária; não criar documentação paralela à fonte autorizada; não use para escolha de infraestrutura ou deployment, use `$specsfy-specialist-software-architecture` para isso.
---

# Modelagem de domínio

## Quando usar

- Acionar quando um termo do domínio for ambíguo, dois contextos usarem a
  mesma palavra com sentidos diferentes, ou uma regra/invariante não tiver
  owner claro.
- Acionar também antes de desenhar uma entidade nova quando não estiver
  claro se ela é entidade, value object, evento ou apenas uma projeção.
- Não acionar para decidir topologia de serviços, banco ou infraestrutura:
  isso é `$specsfy-specialist-software-architecture`; a modelagem de domínio
  informa essa escolha, não a substitui.
- Combinar com `$specsfy-specialist-software-architecture` quando um bounded
  context novo implicar um boundary de serviço ou de dados novo.

## Fluxo

1. Identificar atores, seus objetivos, os comandos que emitem, os fatos que
   já ocorreram (eventos) e as regras que restringem transições.
2. Coletar os termos reais usados pelas pessoas do domínio (não os nomes de
   tabela ou classe já existentes) e expor sinônimos e colisões de sentido.
3. Construir cenários concretos: caminho feliz, limite, falha e efeito do
   tempo (o que muda se o comando chegar tarde, duplicado ou fora de ordem).
4. Formular cada invariante como uma afirmação sempre verdadeira e atribuir
   o owner (o componente/agregado capaz de garanti-la no momento da escrita).
5. Agrupar comportamento pelo que precisa mudar junto e ser consistente
   imediatamente: isso define o limite do aggregate, não a conveniência de
   consulta.
6. Testar cada boundary proposto contra um caso que o atravessa: um dado
   correto no meio já quebra a fronteira, o boundary está no lugar errado.
7. Atualizar glossário, mapa de contexto e ADR na fonte autorizada do
   projeto, nunca criar um documento de modelo paralelo.

## Padrões

- Nomear pelo vocabulário do domínio (linguagem ubíqua), nunca pela camada
  técnica ("Gerenciador", "Handler", "Processor" sozinhos não são domínio).
- Distinguir entidade (identidade + ciclo de vida), value object (definido
  pelo valor, imutável), evento (fato já ocorrido, nome no passado) e
  projeção (leitura derivada, não fonte de verdade) pelo comportamento que
  cada um exige, não pela conveniência de implementação.
- Manter cada invariante junto do componente capaz de garanti-la
  atomicamente: invariante que depende de dois agregados sem coordenação é
  invariante quebrada sob concorrência.
- Não agrandar um aggregate para facilitar uma consulta; consultas
  compostas usam projeção/read model, não um aggregate maior que o
  necessário para consistência.
- Separar bounded contexts quando o mesmo termo tem modelos legítimos e
  incompatíveis (ex.: "Cliente" no contexto de Vendas vs. "Cliente" no
  contexto de Suporte podem ter atributos e ciclo de vida diferentes).
- Nomear eventos no passado ("PedidoConfirmado") e comandos no imperativo
  ("ConfirmarPedido"): a diferença de tempo verbal comunica se algo já
  aconteceu ou está sendo solicitado.
- Validar cada definição com um exemplo que a satisfaz e um contraexemplo
  que a quebraria: uma definição sem contraexemplo geralmente é vaga
  demais para implementar.

## Antipadrões

- **Anemic domain model**: entidades que são só sacos de campos (getters/
  setters) enquanto toda a regra vive em serviços externos, perde a
  garantia de invariante no ponto de mutação e espalha a regra por múltiplos
  callers que podem esquecê-la.
- Usar o mesmo nome de campo/classe em dois bounded contexts assumindo que
  significam a mesma coisa: força um dos dois a distorcer seu modelo para
  caber no vocabulário do outro.
- Aggregate que cobre o "gráfico de objetos inteiro" para nunca ter que unir
  dados depois: cria contenção de escrita e trava concorrência que nada no
  domínio exige.
- Documentar o modelo em um arquivo à parte da fonte autorizada (spec,
  código): o documento diverge do sistema real na primeira mudança não
  sincronizada.

## Validação

- A linguagem usada em spec, código, UI e nomes de coluna/tabela é a mesma
  para o mesmo conceito e distinta quando o conceito é distinto entre
  contextos.
- Existem cenários (exemplo + contraexemplo) que exercitam cada invariante e
  cada transição relevante do modelo.
- Nenhum dado tem dois owners capazes de escrever de forma concorrente e
  inconsistente sem coordenação explícita.
- As escolhas de modelo (glossário, invariante, boundary) estão registradas
  apenas na fonte autorizada do projeto, sem cópia paralela desatualizável.
- Não declarar um modelo "correto" sem os cenários acima: um modelo sem
  contraexemplo testado é uma suposição, não uma validação.

## Skills relacionadas

- `$specsfy-specialist-merge-conflict-resolution` preserva intenção quando
  conflitos atingem nomes e invariantes do modelo.
- `$specsfy-specialist-prototyping` testa suposições do domínio sem promover o
  protótipo a fonte normativa.
- `$specsfy-specialist-ux-design` valida o vocabulário na jornada e
  `$specsfy-specialist-web-api-design` o expõe como contrato público sem
  transferir ownership.
- `$specsfy-specialist-software-architecture` quando um bounded context
  novo implicar um boundary de serviço, banco ou deployment.
- `$specsfy-specialist-technical-research` quando a escolha de modelo
  depender de como um sistema externo já define o mesmo conceito.

Leia [references/standards.md](references/standards.md) para artefatos de
modelagem, perguntas-guia e as fontes primárias de DDD e event storming.
