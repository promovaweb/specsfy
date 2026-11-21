# Modelagem

O especialista Modelagem orienta o agente a descrever o negócio com a linguagem
usada no dia a dia do produto e a levar esse modelo até os dados persistidos. Ele
separa termos ambíguos, define invariantes, indica qual componente garante cada
uma e registra campos, relações e ciclos de vida antes de qualquer migration.
Spec, código e interface passam a usar as mesmas palavras.

## Quando usar

- Um termo do domínio é ambíguo ou dois módulos usam a mesma palavra com
  sentidos diferentes.
- Uma regra de negócio ou uma invariante não tem um responsável claro.
- Você vai criar uma entidade nova e ainda não sabe se ela é entidade, value
  object, evento ou projeção.
- A tarefa altera tabelas, schemas, models, migrations ou contratos
  persistentes.
- Você quer descrever relações e ciclos de vida das entidades antes de criar uma
  spec.

A topologia de serviços, o banco e a infraestrutura ficam com o especialista
[Arquitetura](architecture.md). A modelagem informa essa escolha e não a
substitui. Índice, tipo de coluna e plano de query ficam com o
[PostgreSQL](postgres.md), e a migration Laravel com o [Laravel](laravel.md).

## Como ele trabalha

1. Lê a spec, o código, as migrations, os schemas, os models e os testes
   existentes antes de propor conceito, campo ou relação.
2. Identifica se o pedido é sobre significado e consistência ou sobre o que fica
   persistido e como evolui. Em dúvida, resolve o domínio primeiro.
3. Coleta os termos usados por especialistas do negócio e expõe sinônimos e
   colisões de sentido em relação aos nomes de tabela e classe.
4. Registra as escolhas apenas na fonte oficial do projeto: seções da spec,
   `.specsfy/DATABASE.md`, glossário e ADRs existentes. Nunca cria um documento
   de modelo paralelo.
5. Encaminha a implementação ao especialista da stack e do banco detectados.

## Modelagem de domínio

1. Identifica atores e objetivos, os comandos que eles emitem, os eventos já
   ocorridos e as regras de negócio que restringem cada transição.
2. Constrói cenários concretos com caminho principal, limite, falha e efeito do
   tempo, como um comando que chega atrasado, duplicado ou fora de ordem.
3. Formula cada invariante como uma afirmação verdadeira em qualquer estado e
   indica o componente capaz de garanti-la no momento da escrita.
4. Agrupa o comportamento que precisa mudar junto e com consistência imediata.
   Esse agrupamento define o limite do aggregate.
5. Testa cada limite proposto com um caso que o atravessa. Se um dado correto no
   meio já quebra a fronteira, o limite está no lugar errado.
6. Separa bounded contexts quando o mesmo termo tem modelos legítimos e
   incompatíveis, como "Cliente" em Vendas e em Suporte, e registra o padrão de
   relação entre eles.
7. Atualiza o glossário, a relação entre bounded contexts e os ADRs na fonte
   oficial do projeto.

## Modelagem de dados

1. Identifica as entidades, seus papéis e as relações presentes no código.
2. Registra campos, tipos, obrigatoriedade, origem e ciclo de vida, além das
   permissões de consulta e alteração de cada informação.
3. Descreve unicidade, consistência, retenção, exclusão e histórico quando forem
   pertinentes.
4. Compara a proposta com os contratos e as consultas atuais.
5. Atualiza a seção de banco de dados da spec e encaminha as respostas
   confirmadas para `.specsfy/DATABASE.md` pelo modo `database` de
   `$specsfy-setup`.
6. Deriva cenários de criação, leitura, atualização, exclusão, autorização e
   entrada inválida.
7. Exige uma tarefa `[MIGRATION]` com arquivo versionado para toda mudança no
   banco e confere a aplicação em uma base de teste.

O especialista não inventa campos, relações ou tecnologia. Quando o sistema
atual não responde, você confirma o que o produto precisa guardar.

## Padrões aplicados

- Os nomes seguem o vocabulário do domínio. Termos técnicos como "Gerenciador",
  "Handler" ou "Processor" sozinhos não descrevem o negócio.
- Entidade tem identidade e ciclo de vida, value object é definido pelo valor e
  é imutável, evento é um fato já ocorrido e projeção é uma leitura derivada.
- Cada invariante fica junto do componente capaz de garanti-la de forma atômica.
- Consultas compostas usam projeções ou read models, sem aumentar um aggregate
  além do necessário para a consistência.
- Bounded contexts são separados quando o mesmo termo tem modelos legítimos e
  incompatíveis.
- Eventos ficam no passado (`PagamentoConfirmado`) e comandos no imperativo
  (`ConfirmarPagamento`).
- Cada definição é validada com um exemplo que a satisfaz e um contraexemplo que
  a quebra.
- Cada campo registra tipo, origem, presença e ciclo de vida.
- Cada relação informa a cardinalidade e a forma de carregamento.
- Cada migration preserva os registros existentes ou descreve a conversão.
- Unicidade, retenção e histórico são regra do produto, não detalhe decidido na
  implementação.

## Erros que ele evita

- Entidades que só guardam campos enquanto as regras de negócio ficam espalhadas
  em serviços externos.
- O mesmo nome de classe em dois bounded contexts, como se tivesse o mesmo
  significado.
- Um aggregate que cobre um grafo inteiro de objetos e trava a concorrência sem
  necessidade do domínio.
- Um documento de modelo separado da spec e do código, que perde a sincronia na
  primeira mudança.
- Criar campos sem uso no produto.
- Alterar uma relação sem conferir queries, factories e testes.
- Escolher tecnologia antes de ler a stack existente.

## Como conferir o resultado

- Spec, código, interface e nomes de coluna usam o mesmo termo para o mesmo
  conceito.
- Exemplos e contraexemplos exercitam cada invariante e cada transição
  relevante.
- Nenhum registro tem dois responsáveis capazes de escrever ao mesmo tempo sem
  coordenação explícita.
- Glossário, invariantes e limites estão registrados somente na fonte oficial do
  projeto.
- Os testes e validadores ligados ao modelo persistente passam.
- A migration roda em uma cópia do banco e o schema resultante é comparado.
- A tarefa registra o arquivo, o comando de aplicação e a consulta do estado da
  migration.
- O modelo só é declarado pronto com uma saída verificável do projeto.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-modeling --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Arquitetura](architecture.md) transforma um bounded context novo em limite de
  serviço e expõe o vocabulário no contrato HTTP.
- [Pesquisa](research.md) confere como um sistema externo define o mesmo
  conceito e testa suposições com protótipo descartável.
- [Laravel](laravel.md) escreve migrations, models e testes com o modelo já
  validado.
- [PostgreSQL](postgres.md) escolhe schema físico, índice e plano de query.
- [Interface](interface.md) valida o vocabulário na jornada e nos rótulos.
- [Code Review](code-review.md) confere se o código preserva nomes, invariantes
  e limites.
- [Git](git.md) preserva nomes e invariantes quando um conflito de merge atinge
  o modelo.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-modeling/SKILL.md),
com os blocos táticos e o context map em `references/domain.md` e o contrato de
campos, relações e migrations em `references/data.md`.
