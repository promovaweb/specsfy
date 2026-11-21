---
name: specsfy-specialist-modeling
description: "Modelar o domínio e os dados persistidos (modo domain: linguagem compartilhada, invariantes, eventos, aggregates e bounded contexts; modo data: entidades, relações, ciclos de vida e contratos persistentes). Use quando termos, regras ou ownership estiverem ambíguos, quando for necessário decidir se algo é entidade, value object, evento ou projeção, e antes de alterar tabelas, schemas, models ou migrations. Não crie documento de modelo paralelo à spec e ao código; para topologia de serviços, infraestrutura e contrato HTTP use `$specsfy-specialist-architecture`; para schema, índice e plano de query use `$specsfy-specialist-postgres`; para migrations e models Laravel use `$specsfy-specialist-laravel`."
---

# Modelagem

Descreva o negócio e os dados que ele guarda com as palavras reais do produto.
O modo domain separa termos ambíguos, define invariantes e indica o componente
capaz de garantir cada uma. O modo data leva esse modelo a campos, relações,
ciclos de vida e contratos persistentes, sem escolher tecnologia por suposição.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Termo ambíguo, mesma palavra com sentidos diferentes, invariante sem owner, entidade nova ou dúvida entre entidade, value object, evento e projeção | domain | [Blocos táticos, context map e artefatos](references/domain.md) |
| Alteração de tabelas, schemas, models, migrations ou contratos persistentes, ou mapeamento de relações e ciclos de vida antes da spec | data | [Padrões de dados e conferência](references/data.md) |

Não use para:

- Decidir topologia de serviços, escolha de banco ou infraestrutura. Isso é
  `$specsfy-specialist-architecture`; a modelagem informa essa escolha e não a
  substitui.
- Escolher índice, tipo de coluna do Postgres ou ler `EXPLAIN`. Use
  `$specsfy-specialist-postgres`.
- Escrever a migration Laravel, o model Eloquent ou o teste de persistência.
  Use `$specsfy-specialist-laravel` com o modelo já definido aqui.
- Definir rótulos, jornada e conteúdo da tela. Use
  `$specsfy-specialist-interface`, que valida o vocabulário na jornada.

## No Specsfy

1. **Fonte de entrada por fase**
   - Em `specsfy-02-backlog`, leia o item em `specs/backlog/` e registre ali
     as decisões e sinais do especialista, além das dúvidas abertas.
   - Em `specsfy-03-specify` e `specsfy-04-validate`, use a
     spec aberta e devolva a conclusão à seção trabalhada pela fase.
   - Em `specsfy-05-tasks`, ajude a sugerir e sincronizar especialistas e modos
     entre o cabeçalho, a seção 8 e as tarefas. Só essa fase escreve a seção 14.
   - Em `specsfy-06-implement`, limite-se à tarefa indicada e ao passo carregado.

   Nas fases com spec, leia a spec aberta indicada pela skill chamadora ou
   localizada por `specsfy status`. Consulte a linha `| Especialistas |`,
   a subseção `#### Especialistas` em `### 8. Plano técnico` e a seção
   pertinente à fase.
   Leia também `.specsfy/STACK.md`,
   `.specsfy/RULES.md` e, por tratar dado persistido,
   `.specsfy/DATABASE.md`.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-modeling (domain|data)`. Sem indicação,
   escolha o modo pelo "Quando usar" acima.
3. Devolva a conclusão e as dúvidas abertas no destino indicado no item 1,
   no próprio backlog, na spec ou na tarefa da fase.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Atualize `.specsfy/DATABASE.md` pela skill `$specsfy-setup` no modo
   `database` quando couber à fase. Quando a fase trabalhar o modelo de dados
   na spec, registre entidades, invariantes e transições na seção 9.

## Fluxo

1. Ler a fonte da fase indicada em «No Specsfy». Na fase 02, comece pelo
   item de backlog e suas capturas de origem. Consulte código, migrations,
   schemas, models e testes existentes antes de propor conceito, campo ou
   relação.
2. Identificar se o pedido é sobre significado e consistência (domain) ou sobre
   o que fica persistido e como evolui (data). Em dúvida, resolver o domínio
   primeiro.
3. Coletar os termos reais usados pelas pessoas do domínio, não os nomes de
   tabela ou classe já existentes, e expor sinônimos e colisões de sentido.
4. Registrar vocabulário, decisões e dúvidas no item de backlog durante a
   fase 02. Nas fases seguintes, use a seção de domínio e dados da spec e,
   quando aplicável, `.specsfy/DATABASE.md`, glossário e ADR existentes.
   Preserve essas fontes como o registro do modelo.
5. Executar o fluxo do modo escolhido e encaminhar a implementação ao
   especialista da stack e do banco detectados.

### Modo domain

1. Identificar atores, seus objetivos, os comandos que emitem, os fatos que já
   ocorreram (eventos) e as regras que restringem transições.
2. Construir cenários concretos: caminho feliz, limite, falha e efeito do tempo
   (o que muda se o comando chegar tarde, duplicado ou fora de ordem).
3. Formular cada invariante como uma afirmação sempre verdadeira e atribuir o
   owner (o componente/agregado capaz de garanti-la no momento da escrita).
4. Agrupar comportamento pelo que precisa mudar junto e ser consistente
   imediatamente: isso define o limite do aggregate, não a conveniência de
   consulta.
5. Testar cada boundary proposto contra um caso que o atravessa: se um dado
   correto no meio já quebra a fronteira, o boundary está no lugar errado.
6. Separar bounded contexts quando o mesmo termo tem modelos legítimos e
   incompatíveis, e registrar o padrão de relação entre eles no context map.
7. Atualizar glossário, mapa de contexto e ADR na fonte autorizada do projeto.

### Modo data

1. Identificar as entidades, seus papéis e as relações observadas no código.
2. Registrar campos, tipos, obrigatoriedade, origem, ciclo de vida e quem pode
   consultar ou alterar cada informação.
3. Descrever unicidade, consistência, retenção, exclusão, histórico e migração
   quando forem pertinentes.
4. Comparar a proposta com os contratos e as consultas atuais.
5. Atualizar a seção de dados da spec e encaminhar respostas confirmadas para o
   modo `database` de `$specsfy-setup` e `.specsfy/DATABASE.md`.
6. Derivar cenários para criação, leitura, atualização, exclusão, autorização e
   dados inválidos.
7. Exigir uma tarefa `[MIGRATION]` com arquivo versionado para qualquer mudança
   ligada ao banco e conferir sua aplicação em uma base de teste.

Não invente campos, relações ou tecnologia. A pessoa confirma o que o produto
precisa guardar quando o sistema atual não responder.

## Padrões

- Nomear pelo vocabulário do domínio (linguagem ubíqua), nunca pela camada
  técnica ("Gerenciador", "Handler", "Processor" sozinhos não são domínio).
- Distinguir entidade (identidade + ciclo de vida), value object (definido pelo
  valor, imutável), evento (fato já ocorrido, nome no passado) e projeção
  (leitura derivada, não fonte de verdade) pelo comportamento que cada um exige,
  não pela conveniência de implementação.
- Manter cada invariante junto do componente capaz de garanti-la atomicamente:
  invariante que depende de dois agregados sem coordenação é invariante quebrada
  sob concorrência.
- Não agrandar um aggregate para facilitar uma consulta; consultas compostas
  usam projeção/read model, não um aggregate maior que o necessário para
  consistência.
- Separar bounded contexts quando o mesmo termo tem modelos legítimos e
  incompatíveis (ex.: "Cliente" em Vendas e "Cliente" em Suporte podem ter
  atributos e ciclo de vida diferentes).
- Nomear eventos no passado ("PedidoConfirmado") e comandos no imperativo
  ("ConfirmarPedido"): a diferença de tempo verbal comunica se algo já
  aconteceu ou está sendo solicitado.
- Validar cada definição com um exemplo que a satisfaz e um contraexemplo que a
  quebraria: uma definição sem contraexemplo geralmente é vaga demais para
  implementar.
- Registrar cada campo com tipo, origem, presença e ciclo de vida, e cada
  relação com cardinalidade e forma de carga.
- Garantir que toda migration preserve dados existentes ou descreva a conversão
  necessária.
- Tratar unicidade, retenção e histórico como regra do produto, não como
  detalhe de banco decidido depois.
- Preservar nomes, invariantes e limites durante a resolução de conflito de
  merge: conflito não é justificativa para renomear ou fundir conceitos do
  modelo.

## Antipadrões

- **Anemic domain model**: entidades que são só sacos de campos (getters/
  setters) enquanto toda a regra vive em serviços externos; perde a garantia de
  invariante no ponto de mutação e espalha a regra por múltiplos callers que
  podem esquecê-la.
- Usar o mesmo nome de campo/classe em dois bounded contexts assumindo que
  significam a mesma coisa: força um dos dois a distorcer seu modelo para caber
  no vocabulário do outro.
- Aggregate que cobre o "gráfico de objetos inteiro" para nunca ter que unir
  dados depois: cria contenção de escrita e trava concorrência que nada no
  domínio exige.
- Documentar o modelo em um arquivo à parte da fonte autorizada (spec, código):
  o documento diverge do sistema real na primeira mudança não sincronizada.
- Criar campos sem uso observado no produto ou escolher tecnologia antes de ler
  a stack existente.
- Alterar uma relação sem conferir queries, factories e testes que dependem
  dela.

## Validação

- A linguagem usada em spec, código, interface e nomes de coluna/tabela é a
  mesma para o mesmo conceito e distinta quando o conceito é distinto entre
  contextos.
- Existem cenários (exemplo + contraexemplo) que exercitam cada invariante e
  cada transição relevante do modelo.
- Nenhum dado tem dois owners capazes de escrever de forma concorrente e
  inconsistente sem coordenação explícita.
- As escolhas de modelo (glossário, invariante, boundary, campo, relação) estão
  registradas apenas na fonte autorizada do projeto, sem cópia paralela
  desatualizável.
- Rodar os testes e validadores ligados ao modelo persistente.
- Conferir a migration em uma cópia do banco e comparar o schema resultante.
- Confirmar o arquivo, o comando de aplicação e a consulta do estado da
  migration antes de encerrar a tarefa.
- Não declarar um modelo "correto" sem os cenários acima: um modelo sem
  contraexemplo testado é uma suposição, não uma validação.
- Não declarar o modelo de dados pronto sem uma saída verificável do projeto.

## Skills relacionadas

- `$specsfy-specialist-architecture` decide onde colocar um boundary já definido
  pelo domínio e expõe o vocabulário no contrato público.
- `$specsfy-specialist-research` confere como um sistema externo define o mesmo
  conceito e testa suposições com protótipo descartável.
- `$specsfy-specialist-laravel` escreve migrations, models e testes com o modelo
  já validado.
- `$specsfy-specialist-postgres` escolhe schema físico, índice e plano de query.
- `$specsfy-specialist-interface` valida o vocabulário na jornada e nos rótulos
  da tela.
- `$specsfy-specialist-code-review` confere se o código preserva nomes,
  invariantes e boundaries decididos aqui.
- `$specsfy-specialist-git` preserva nomes e invariantes quando um conflito de
  merge atinge o modelo.
- `$specsfy-specialist-mysql` e `$specsfy-specialist-mongodb` materializam o
  mesmo modelo em tabela relacional ou em documento, sem mudar entidades,
  relações e invariantes decididos aqui.

Leia [references/standards.md](references/standards.md) para o padrão comum, o
índice dos modos e as fontes primárias. Leia
[references/domain.md](references/domain.md) para blocos táticos de DDD, context
mapping, artefatos e perguntas-guia. Leia
[references/data.md](references/data.md) para o contrato dos campos, relações,
migrations e a conferência mínima.
