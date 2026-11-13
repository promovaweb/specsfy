<!-- markdownlint-disable MD013 -->

# Referência do método

Este capítulo explica os campos, estados e provas de uma entrega no Specsfy.
Use-o junto do [guia da metodologia](method.md) quando quiser interpretar uma
`spec.md`, a tela de progresso ou uma pergunta do agente com precisão.

## A spec como registro único

Cada entrega escolhida possui uma única fonte normativa:

```text
specs/<estado>/<NNNN>-<slug>/spec.md
```

`NNNN` mantém a sequência de criação e o `slug` identifica o assunto. A pasta
mostra o estado operacional. O campo `Status` no topo da spec é o espelho desse
estado. Use `specsfy specs transition` para alterar os dois juntos, pois mover a
pasta manualmente deixa o registro inconsistente.

A spec não é um relatório preenchido no final. Ela recebe a definição no Ato
I, o plano e o RED no Ato II, e as tarefas com seus resultados no Ato III.
Código, testes, pesquisa e documentação derivada podem ficar em outros
arquivos, mas a ligação entre eles permanece na spec.

## Leitura do sistema existente

Antes de uma skill propor tecnologia, telas ou implementação, o setup percorre
as fontes relevantes do projeto: instruções, manifests, configuração,
aplicação, rotas, persistência, integrações, interface, testes e documentação.
Ele usa essa leitura para preservar convenções, comportamento e fontes já
existentes. Quando houver muitas fontes, informa o conjunto lido antes de
avançar; uma sugestão não substitui a análise do código existente.

| Campo ou seção | O que registra | Como usar |
| --- | --- | --- |
| `Status` e pasta | posição da entrega no fluxo | identificar a próxima atividade permitida |
| `Effort` | capacidade de raciocínio e execução necessária | calibrar acompanhamento, não prazo |
| Gates | prova de prontidão de cada ato | impedir avanço prematuro |
| Seções 1–7 | problema, escopo, comportamento e requisitos | conferir o que será entregue |
| Seções 8–15 | plano, testes, tarefas e relações | conferir como a entrega será construída |
| Seções 16–18 | dependências, escolhas e conclusão | conferir limites e encerramento |

## Effort

`Effort` é uma escala inteira de 1 a 10 para a capacidade de raciocínio,
investigação, coordenação e execução pedida pela entrega no estado atual. Não
representa horas, dias, preço, quantidade de pessoas ou prazo prometido. Uma
tarefa curta pode ter Effort alto quando envolve autorização delicada, migração
difícil de reverter ou integração pouco conhecida. Uma tarefa longa pode ficar
em faixa menor quando segue uma convenção já comprovada e tem testes diretos.

O valor inicial é uma hipótese de trabalho. Ele pode mudar depois de uma
resposta confirmada, da leitura do repositório, de uma dependência descoberta ou
de um resultado de teste. O CLI guarda valor anterior, data e justificativa no
histórico da própria spec. Assim, a pessoa que retoma a entrega consegue ver o
motivo de cada recalibração.

### Faixas e perfis

| Effort | Perfil exibido | Situação típica | Acompanhamento |
| --- | --- | --- | --- |
| 1–2 | `light` | ajuste atômico em padrão conhecido | escopo e teste focal |
| 3–4 | `standard` | mudança local com testes diretos | requisitos, arquivos e variações |
| 5–6 | `standard` | vários arquivos ou integração conhecida | dependências, testes e ordem |
| 7–8 | `high` | mudança transversal, migração ou integração externa | contratos, dados, reversão e documentação |
| 9–10 | `maximum` | arquitetura ou incerteza relevante | descoberta progressiva e revisão frequente |

As faixas orientam o perfil exibido pelo progresso, mas não autorizam pular um
gate. Uma entrega de Effort 1 ainda precisa de definição, plano compatível e
prova de entrega. Uma entrega de Effort 9 pode ser dividida em entregas menores
quando seus comportamentos forem independentes.

### Quando atualizar

Atualize Effort quando um fato mudar a capacidade necessária: mais módulos,
dados existentes, integração externa, autorização, compatibilidade ou revisão
humana recorrente podem elevar a faixa. Escopo menor, padrão já comprovado ou
dependência removida podem reduzi-la. Não altere o número para comunicar
urgência, pressão comercial ou preferência por modelo.

Registre o fato que mudou a estimativa. Uma justificativa como “passou de 4
para 7 porque inclui migração de dados existentes e compatibilidade com uma API
publicada” permite revisar o valor mais tarde. Depois da confirmação, use:

```bash
specsfy specs effort <id-da-spec> <1-10> --reason "<justificativa confirmada>"
```

O entrevistador pode conduzir essa atualização, mas não inventa justificativa
nem transforma Effort em autorização para implementar.

### Effort não é prioridade

Prioridade responde o que deve receber atenção antes. Effort responde quanta
capacidade a entrega exige. Um ajuste urgente pode ter Effort 2. Um estudo que
ficará para depois pode ter Effort 8. O backlog ordena itens por valor,
urgência, dependências, exposição operacional, esforço e informações ausentes.
A spec usa Effort para tornar a execução transparente.

## Estados e transições

O ciclo canônico é:

```text
draft → defined → planned → in-progress → review → completed
```

| Pasta | `Status` | O que já existe | O que ainda não vale |
| --- | --- | --- | --- |
| `draft` | `Draft` | intenção e definição em construção | tratar requisitos como aprovados |
| `defined` | `Defined` | Definition Gate aprovado | implementar ou declarar plano pronto |
| `planned` | `Planned` | plano, tarefas e RED compatíveis | editar código sem iniciar a execução |
| `in-progress` | `Implementing` | tarefas e verificações em execução | concluir com trabalho pendente |
| `review` | `Reviewing` | Delivery Gate aprovado | alterar sem retornar à etapa necessária |
| `completed` | `Complete` | aceite final e documentação atual | incluir nova solicitação por edição direta |

### O significado de cada estado

Em `draft`, o agente esclarece problema, resultado, atores, escopo, regras,
casos-limite e comportamento observável. Uma dúvida que muda produto, dados,
segurança, aceite ou plano impede o gate da definição. Pesquisa pode apoiar a
conversa, mas precisa ter conclusão e impacto registrados na spec.

Em `defined`, problema, limites, histórias, requisitos e cenários BDD permitem
planejar sem adivinhar o que será aceito. Uma mudança de comportamento retorna
a spec para `draft` e torna o gate da definição pendente novamente.

Em `planned`, há plano técnico, tarefas, dependências, contratos, plano de
teste e RED válido. Um RED não vale quando falha por sintaxe, fixture
incompleta, dependência ausente ou ambiente indisponível. Ele precisa apontar
a ausência do comportamento pretendido.

Em `in-progress`, cada tarefa segue a ordem registrada ou uma alteração
justificada. Uma tarefa de código percorre RED, GREEN e REFACTOR, registrando
comando, resultado, IDs cobertos e arquivos envolvidos. Descoberta que muda o
comportamento retorna ao primeiro ato cuja prova perdeu validade.

Em `review`, a entrega já passou pelo Delivery Gate e aguarda aceite final. Um
retorno de aceite pode levar a `in-progress` para correção técnica ou a um ato
anterior quando a definição também mudar. Em `completed`, o pacote preserva o
histórico. Uma solicitação nova inicia ou atualiza uma entrega ativa, em vez de
alterar diretamente a spec concluída.

### Retornos permitidos

| Origem | Destinos aceitos | Motivo de retorno |
| --- | --- | --- |
| `draft` | `draft`, `defined` | a definição ainda está aberta |
| `defined` | `draft`, `defined`, `planned` | requisito, escopo ou aceite mudou |
| `planned` | `defined`, `planned`, `in-progress` | plano revelou problema na definição ou RED precisa ser refeito |
| `in-progress` | `planned`, `in-progress`, `review` | tarefa, teste ou plano perdeu validade |
| `review` | `in-progress`, `review`, `completed` | aceite final encontrou trabalho pendente |
| `completed` | `completed` | entrega fechada não recebe edição direta |

Mudança apenas de estratégia técnica retorna a `planned`. Mudança de
comportamento retorna a `draft`. Uma comprovação vencida, como regressão
executada antes da última alteração, pede nova verificação. O método não repete
etapas por ritual: ele evita aprovar um resultado novo com uma prova antiga.

## Gates

Um gate fica `Pending` enquanto sua etapa não tem a comprovação exigida e fica
`Passed` quando as condições foram verificadas e registradas. Ele não é uma
estimativa de qualidade nem um botão de aprovação manual.

### Definition Gate

O gate do Ato I exige problema e resultado observável, escopo incluído e fora
de escopo, atores, regras, histórias, requisitos funcionais e não funcionais,
três cenários BDD distintos para cada item principal e nenhuma lacuna P1 que
impeça o planejamento. Quando a entrega tem interface para pessoas, ele exige
também telas, fluxo de informação, menus e navegação principal, formulário,
composição, estados e acessibilidade descritos na seção 10. Um CRUD sem telas e formulário mantém o
gate pendente. Termo ambíguo, requisito sem forma de teste, história
sem aceite ou conflito entre seções mantêm o gate pendente.

### Plan Gate

O gate do Ato II exige plano técnico proporcional, contratos e dados aplicáveis,
tarefas com IDs e dependências, estratégia TDD derivada do BDD, RED válido,
plano de testes e ordem de execução. Uma lista de tarefas vaga, sem referências,
ou um teste sem cenário correspondente não torna o plano pronto.

### Delivery Gate

O gate do Ato III exige tarefas tratadas, GREEN para os testes derivados do
comportamento, aceite e regressão no estado atual, rastreabilidade entre
histórias, requisitos, cenários, testes e tarefas, registros dos comandos e
documentação atualizada quando a mudança a alcança. Um teste verde isolado não
fecha o gate, pois ele pode cobrir somente parte do comportamento.

## Anatomia completa da spec

A tabela inicial da spec identifica o formato, o ID, o slug, o estado, Effort,
o vínculo opcional com ClickUp, os três gates, a versão do contrato de
comprovação e a data de atualização. Não use essa tabela para esconder uma
mudança material: o detalhamento fica na seção que trata do assunto e a tabela
apenas torna o estado geral legível.

### Ato I: seções 1 a 7

| Seção | Finalidade | O que precisa ficar claro |
| --- | --- | --- |
| 1. Problema e resultado | separar a dor atual da mudança desejada | contexto observável, resultado esperado e métrica verificável |
| 2. Research e esclarecimentos | registrar o que foi investigado e o que ainda está aberto | pergunta, fonte, conclusão, impacto, dúvidas respondidas e dúvidas abertas |
| 3. Escopo e atores | delimitar quem participa e o que a entrega cobre | incluído, fora de escopo, objetivos e permissões dos atores |
| 4. Princípios e restrições | preservar regras já confirmadas pelo projeto | regras de governança, arquitetura, qualidade ou compatibilidade |
| 5. Histórias de usuário | explicar valor por ator | capacidade, valor, prioridade, requisito e teste independente |
| 6. Cenários BDD de aceite | tornar o comportamento observável | condição inicial, ação, resultado e IDs cobertos |
| 7. Requisitos | declarar obrigações do sistema | funções, qualidades mensuráveis, erros e casos-limite |

A seção 1 não deve antecipar a solução. “Criar uma tela” descreve uma possível
implementação, enquanto “permitir que uma pessoa recupere acesso sem revelar se
um e-mail existe” descreve o resultado e seu limite. A métrica de sucesso
precisa ter um alvo ou uma observação verificável, não uma impressão genérica.

A seção 2 diferencia pesquisa de escolha. Um R-001 pode registrar uma
documentação de API consultada e concluir que determinado endpoint exige
idempotência. A regra que a entrega adotará aparece depois na seção de
restrições, requisitos, plano ou escolhas. Se a fonte externa foi realmente
consultada, seu registro local em research/ preserva origem, versão ou data e o
ponto usado na conclusão.

Na seção 3, “fora de escopo” protege tanto o projeto quanto a expectativa de
quem acompanha a entrega. Por exemplo, uma entrega que permite solicitar troca
de senha pode deixar explícito que não inclui autenticação social, gestão de
perfis ou alteração do visual de todas as telas. Atores não são apenas pessoas:
um serviço externo, um job ou um administrador pode ter objetivo, permissão e
limite próprios.

Nas seções 5, 6 e 7, a mesma necessidade aparece em três níveis. A história
explica para quem a capacidade gera valor. O requisito declara a obrigação. O
cenário mostra um exemplo que pode ser aceito ou recusado. Essa diferença evita
história vaga, requisito sem teste e cenário que não representa valor.

### Ato II: seções 8 a 15

| Seção | Finalidade | Perguntas que a seção responde |
| --- | --- | --- |
| 8. Plano técnico | tornar a implementação compreensível antes da execução | quais módulos, dados, contratos, arquivos e compatibilidades serão afetados? |
| 9. Modelo de dados | explicar persistência e ciclo de vida da informação | quais entidades, estados, transições, retenção e migrações existem? |
| 10. Interfaces e contratos | registrar superfícies de integração e a experiência para pessoas | quais telas, menus, formulários, fluxos, ações, APIs, eventos, entradas, saídas e falhas importam? |
| 11. Estratégia TDD | derivar testes executáveis do BDD | qual caso falha primeiro, por qual motivo e como ficará verde? |
| 12. Plano de testes e rastreabilidade | ligar requisito à comprovação | qual cenário, nível, arquivo ou comando cobre cada item? |
| 13. Validações | registrar os gates e achados | qual comando foi executado, qual resultado produziu e o que falta? |
| 14. Tarefas | dividir a entrega em ações verificáveis | o que fazer, em qual ordem, com quais referências e dependências? |
| 15. Ordem de execução | expor dependências reais | qual é o caminho crítico, o paralelismo e o menor conjunto entregável? |

O plano técnico é proporcional ao alcance. Uma alteração local pode registrar
um componente, teste e arquivo. Uma migração precisa explicar compatibilidade,
ordem, reversão e retenção. Quando uma categoria não se aplica, escreva “Não
aplicável” com a razão, em vez de deixar uma lacuna que pareça esquecimento.

Quando o cabeçalho declara `Interface para pessoas: Sim`, a seção 10 também
registra a stack e o sistema atual observados, a responsabilidade de cada tela,
os menus, seus itens e destinos, como a pessoa avança e retorna no fluxo, os
campos e validações dos formulários, o padrão de abertura de ações, a
disposição dos elementos e os estados de interface. O Specsfy analisa rotas,
telas, componentes, conteúdo, permissões e
testes antes de perguntar as lacunas reais. Assim, painel lateral, modal,
página ou outro padrão não vira uma escolha escondida do agente nem substitui
o que já existe sem confirmação.

Uma spec de interface também possui `Fase de interface` na seção 14. Cada tela
recebe tarefa própria com caminho, testes de navegação, formulário, validações,
feedback e teclado. O validador não aceita a fase ausente ou com menos tarefas
do que as telas registradas.

O modelo de dados descreve estados de domínio, não o estado da pasta da spec.
Por exemplo, um pagamento pode transitar de pendente para confirmado ou
cancelado, enquanto a spec que altera pagamentos pode estar em planned.
Mantenha as duas máquinas de estado separadas para não confundir o ciclo da
entrega com o ciclo da informação do produto.

A estratégia TDD e o plano de testes são complementares. A seção 11 explica a
sequência RED, GREEN e REFACTOR para o caso. A seção 12 permite localizar a
relação entre requisito, cenário BDD, nível de teste, arquivo e comando. O
marcador SPECSFY: no teste deve usar os IDs da spec. O resultado é uma cadeia
que uma pessoa consegue seguir nos dois sentidos.

A seção 13 registra o resultado de cada gate e os achados de revisão. Um achado
especializado usa identificador, severidade, estado, referências e
comprovação. Marcar um achado como aceito não o torna invisível: a spec precisa
mostrar o motivo, o responsável e o limite aceito.

Nas tarefas, [P] indica possibilidade de execução paralela apenas quando as
dependências realmente permitem. Depends: none não é enfeite: significa que a
tarefa pode começar sem outra tarefa da spec. A ordem de execução consolida
essa informação em caminho crítico, tarefas paralelas e estratégia de MVP.

### Ato III: seções 16 a 18

| Seção | Finalidade | O que registrar |
| --- | --- | --- |
| 16. Dependências, riscos e suposições | expor condições externas e hipóteses | dependência, consequência, mitigação e condição que ainda precisa de confirmação |
| 17. Decisões | preservar escolhas confirmadas | escolha, motivo, referências atingidas e ato que precisa ser revisto se ela mudar |
| 18. Definition of Done | fechar o contrato de entrega | critérios de conclusão, aceite, documentação e comprovações finais |

Dependências são itens fora do controle imediato da tarefa, como uma API,
aprovação, credencial fornecida por outra equipe ou migração prévia. Suposições
são premissas ainda não confirmadas. Registre ambas de forma explícita para que
um teste verde não esconda uma condição externa não atendida.

A seção 17 não substitui um ADR para uma escolha arquitetural transversal nem
substitui as seções de requisito e plano. Ela conserva a escolha da entrega e
mostra o que precisa ser reavaliado quando a escolha for revista. O histórico é
mais útil quando registra alternativas descartadas e seu motivo, sem reescrever
o passado como se a escolha atual sempre tivesse sido conhecida.

A Definition of Done é o fechamento da entrega concreta. Ela reúne gates,
testes, aceite, regressão, rastreabilidade, documentação e pendências tratadas.
Não use uma lista genérica copiada de outra spec. Cada item precisa corresponder
ao comportamento, aos dados e às integrações daquela entrega.

## Identificadores e rastreabilidade

| Prefixo | Representa | Uso |
| --- | --- | --- |
| `US-001` | história de usuário | valor para um ator |
| `FR-001` | requisito funcional | comportamento obrigatório |
| `NFR-001` | requisito não funcional | condição mensurável de qualidade ou operação |
| `AC-001` | cenário BDD de aceite | caminho principal, regra ou limite |
| `T001` | tarefa | ação que atende referências declaradas |
| `R-001` | pesquisa | pergunta, conclusão, fonte e impacto |
| `FIND-*` | achado de revisão | tipo, severidade, estado e referência |

Cada história principal possui três cenários distintos. Em geral, um cobre o
caminho principal, outro uma regra crítica e outro uma falha ou limite. O
cenário declara os IDs cobertos. O teste TDD usa o marcador `SPECSFY:` com os
mesmos IDs. Essa cadeia mostra requisito sem teste e teste sem comportamento
definido.

## Tarefas, pesquisa e progresso

Uma tarefa registra ID, tipo, história relacionada, ação, caminho, referências
e dependências. O checklist abaixo dela deixa seis movimentos auditáveis:

| Movimento | Pergunta respondida |
| --- | --- |
| `PREP` | escopo, referências, dependências e baseline estão claros? |
| `EXECUTE` | qual entrega foi produzida no caminho declarado? |
| `VERIFY` | qual verificação focal confirmou o resultado? |
| `VISUAL` | a interface respeita bordas, espaçamentos, margens, padding e tipografia, ou por que a revisão não se aplica? |
| `EVIDENCE` | qual comando, resultado e IDs permitem conferir o trabalho? |
| `IMPROVE` | houve melhoria de processo ou há motivo registrado para não aplicá-la? |

Pesquisa responde uma pergunta, mas não aprova sozinha uma regra de produto.
Registre pergunta, conclusão, fonte, localizador e impacto. Fonte externa
consultada requer registro local em `research/`, enquanto a conclusão
normativa fica na spec, ligada ao escopo, requisito ou plano.

`specsfy progress` lê as specs sem alterá-las. Ele mostra estado, Effort,
perfil, gates e contagens. Sua porcentagem é uma projeção, não uma aprovação:
com checklists, ela usa itens concluídos sobre itens totais, e sem checklists,
gates aprovados sobre gates totais. Use a porcentagem para localizar trabalho
pendente. Use gates, resultados de teste e leitura da spec para confirmar um
avanço.

## Dúvidas frequentes

| Dúvida | Resposta |
| --- | --- |
| Posso implementar com Definition Gate aprovado? | Não. Falta o plano e o RED do Ato II. |
| Testes verdes permitem mover para `completed`? | Não. Falta aceite final em `review` e documentação aplicável. |
| Effort 10 significa dez dias? | Não. É a maior faixa de capacidade necessária. |
| RED de ambiente quebrado vale? | Não. O RED precisa indicar ausência do comportamento. |
| Pesquisa é requisito aprovado? | Não. A conclusão precisa ser incorporada e confirmada na spec. |
| Porcentagem de progresso aprova a entrega? | Não. Ela apenas projeta itens ou gates concluídos. |

Retorne ao [guia da metodologia](method.md) para a jornada ou à página da skill
que corresponde ao estado atual da sua spec.

## Justificativa de tamanho

Este capítulo reúne contratos que antes apareciam em páginas diferentes ou em
menções breves: Effort, estados, transições, gates, seções da spec,
rastreabilidade, tarefas, pesquisa e progresso. Mantê-los próximos permite
comparar o significado de cada campo sem exigir leitura do código ou salto entre
vários guias. As páginas das skills continuam explicando como executar cada
etapa, enquanto esta referência preserva os conceitos compartilhados.
