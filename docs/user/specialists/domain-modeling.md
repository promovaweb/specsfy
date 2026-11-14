# Modelagem de Domínio

O especialista Modelagem de Domínio orienta o agente a descrever o negócio com
a linguagem usada no dia a dia do produto. Ele separa termos ambíguos, define
as invariantes e indica qual componente garante cada uma, para que spec,
código e interface usem as mesmas palavras.

## Quando usar

- Um termo do domínio é ambíguo ou dois módulos usam a mesma palavra com
  sentidos diferentes.
- Uma regra de negócio ou uma invariante não tem um responsável claro.
- Você vai criar uma entidade nova e ainda não sabe se ela é entidade, value
  object, evento ou projeção.

A topologia de serviços, banco e infraestrutura fica com o especialista
Arquitetura de Software. A modelagem de domínio informa essa escolha.

## Como ele trabalha

1. Identifica atores e objetivos, os comandos que eles emitem, os eventos já
   ocorridos e as regras de negócio que restringem cada transição.
2. Coleta os termos usados por especialistas do negócio e expõe sinônimos e
   colisões de sentido em relação aos nomes de tabela e classe.
3. Constrói cenários concretos com caminho principal, limite, falha e efeito
   do tempo, como um comando que chega atrasado, duplicado ou fora de ordem.
4. Formula cada invariante como uma afirmação verdadeira em qualquer estado e
   indica o componente capaz de garanti-la no momento da escrita.
5. Agrupa o comportamento que precisa mudar junto e com consistência imediata.
   Esse agrupamento define o limite do aggregate.
6. Testa cada limite proposto com um caso que o atravessa.
7. Atualiza o glossário, a relação entre bounded contexts e os ADRs na fonte
   oficial do projeto, sem criar um documento paralelo.

## Padrões aplicados

- Os nomes seguem o vocabulário do domínio. Termos técnicos como
  "Gerenciador", "Handler" ou "Processor" sozinhos não descrevem o negócio.
- Entidade tem identidade e ciclo de vida, value object é definido pelo valor
  e é imutável, evento é um fato já ocorrido e projeção é uma leitura
  derivada.
- Cada invariante fica junto do componente capaz de garanti-la de forma
  atômica.
- Consultas compostas usam projeções ou read models, sem aumentar um
  aggregate além do necessário para a consistência.
- Bounded contexts são separados quando o mesmo termo tem modelos legítimos e
  incompatíveis, como "Cliente" em Vendas e em Suporte.
- Eventos ficam no passado (`PagamentoConfirmado`) e comandos no imperativo
  (`ConfirmarPagamento`).
- Cada definição é validada com um exemplo que a satisfaz e um contraexemplo
  que a quebra.

## Erros que ele evita

- Entidades que só guardam campos enquanto as regras de negócio ficam
  espalhadas em serviços externos.
- O mesmo nome de classe em dois bounded contexts, como se tivesse o mesmo
  significado.
- Um aggregate que cobre um grafo inteiro de objetos e trava a concorrência
  sem necessidade do domínio.
- Um documento de modelo separado da spec e do código, que perde a
  sincronia na primeira mudança.

## Como conferir o resultado

- Spec, código, interface e nomes de coluna usam o mesmo termo para o mesmo
  conceito.
- Exemplos e contraexemplos exercitam cada invariante e cada transição
  relevante.
- Nenhum registro tem dois responsáveis capazes de escrever ao mesmo tempo sem
  coordenação explícita.
- Glossário, invariantes e limites estão registrados somente na fonte oficial
  do projeto.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-domain-modeling --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Arquitetura de Software](software-architecture.md) transforma um bounded
  context novo em limite de serviço ou de banco.
- [Modelagem de Dados](data-modeling.md) leva o modelo para entidades e
  migrations.
- [Prototipação](prototyping.md) testa suposições do domínio.
- [UX Design](ux-design.md) valida o vocabulário na jornada.
- [APIs Web](web-api-design.md) expõe o vocabulário em um contrato público.
- [Resolução de Conflitos Git](merge-conflict-resolution.md) preserva nomes e
  invariantes em conflitos.
- [Pesquisa Técnica](technical-research.md) confere como um sistema externo
  define o mesmo conceito.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-domain-modeling/SKILL.md),
com artefatos de modelagem e perguntas-guia no arquivo de referência da mesma
pasta.
