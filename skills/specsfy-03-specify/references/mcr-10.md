# MCR-10 — Método Categorial de Requisitos

> Metodologia para conversar com usuários, analisar especificações e refinar histórias de usuário por meio das categorias de Aristóteles.

**Versão:** 1.0
**Data:** 24 de julho de 2026
**Status:** referência estável
**Público:** pessoas de produto, análise, design, engenharia e assistentes de IA
**Idioma:** português brasileiro

“Referência estável” significa que estrutura, vocabulário e protocolo estão
prontos para uso e versionamento. Não significa que a eficácia do método já foi
demonstrada cientificamente; as hipóteses de validação estão na seção 20.

---

## 1. Visão geral

O **MCR-10 — Método Categorial de Requisitos** é uma metodologia de descoberta, análise e refinamento de requisitos inspirada nas *Categorias* de Aristóteles.

Seu objetivo é transformar relatos incompletos, histórias de usuário, solicitações, transcrições e especificações preliminares em afirmações claras, rastreáveis e verificáveis.

O método parte de uma distinção fundamental: palavras e expressões isoladas podem nomear atores, objetos, atributos ou ações, mas ainda não constituem uma especificação verificável. Para que uma afirmação possa ser confirmada, negada ou testada, é necessário combinar esses elementos de maneira precisa.

O MCR-10 realiza essa passagem em três movimentos:

1. **Decompor:** separar a narrativa em termos, conceitos e afirmações menores.
2. **Categorizar:** analisar o conteúdo pelas dez categorias aristotélicas.
3. **Recompor:** transformar os elementos em regras, fluxos, critérios de aceitação e cenários verificáveis.

A metodologia pode ser usada por analistas, product managers, desenvolvedores, designers, equipes de produto ou assistentes de inteligência artificial.

O método é uma adaptação contemporânea. As categorias oferecem lentes para
examinar uma declaração; elas não substituem pesquisa com usuários, análise de
valor, engenharia, segurança ou decisão humana.

---

## 2. Objetivos

O MCR-10 foi criado para:

- reduzir ambiguidades antes que elas se transformem em comportamentos contraditórios;
- revelar atores, entidades, atributos, relações, limites, contextos, estados, permissões, ações e efeitos;
- ajudar o analista a formular perguntas relevantes sem transformar a conversa em um questionário mecânico;
- separar o que o usuário declarou daquilo que foi inferido pelo analista ou pela inteligência artificial;
- identificar decisões, hipóteses, conflitos e questões em aberto;
- transformar intenções em afirmações que possam ser confirmadas ou refutadas;
- produzir critérios de aceitação ligados às regras que lhes deram origem;
- manter rastreabilidade entre a fala do usuário, as decisões tomadas e a especificação final.

O método não substitui a decisão do usuário. Sua função é tornar visível o que foi dito, o que está implícito, o que permanece ambíguo e o que ainda precisa ser decidido.

---

## 3. Limites da metodologia

O MCR-10 não determina sozinho:

- a prioridade de negócio;
- a viabilidade técnica;
- o valor comercial de uma funcionalidade;
- a experiência ideal para o usuário;
- a política de segurança de uma organização;
- a solução arquitetural que deverá ser implementada.

Também não exige que as dez categorias estejam presentes em toda história. Quando uma categoria não for relevante, ela deve ser marcada como **não aplicável**, acompanhada de uma justificativa curta.

As categorias funcionam como lentes de investigação, e não como um formulário obrigatório.

### 3.1 Uso proporcional por fatia vertical

O rigor é constante, mas a profundidade varia com o risco:

| Perfil | Uso recomendado | Profundidade mínima |
| --- | --- | --- |
| Lite | correção pequena e reversível | finalidade, categorias críticas, uma afirmação e um cenário |
| Standard | feature comum | matriz aplicável, vocabulário, regras, falhas e Gherkin |
| Crítico | dinheiro, autorização, privacidade, irreversibilidade ou migração | matriz completa justificada, fontes, riscos, rollback e revisão humana |

Nenhum perfil permite inventar respostas ou omitir uma questão P1. O perfil
reduz documentação irrelevante, não a qualidade das decisões.

---

## 4. Fundamento conceitual

A metodologia parte de três conjuntos de distinções presentes nas *Categorias*
e acrescenta lentes modernas explicitamente identificadas. Há debate acadêmico
sobre se a lista classifica palavras, predicações ou entidades, sobre como foi
derivada e sobre sua exaustividade. O MCR-10 não depende de resolver esse debate:
usa as distinções como heurísticas de análise e verifica sua utilidade no
contexto de software.

### 4.1 Finalidade e intenção

Antes da análise categorial, identifique a finalidade prática da solicitação:

- qual problema observável motivou o pedido;
- quem percebe o problema;
- qual mudança faria a entrega ser considerada útil;
- como o usuário reconhecerá que o resultado foi alcançado;
- se a solução pedida é a intenção ou apenas uma hipótese de solução.

Finalidade não é apresentada como uma décima primeira categoria aristotélica.
Ela é uma lente adicional do MCR-10 para desenvolvimento de software. O método
não presume acesso à “intenção real” como estado mental: ele formula uma
interpretação operacional e pede confirmação ao usuário.

### 4.2 Termos homônimos, sinônimos e parônimos

Antes de analisar o comportamento solicitado, é necessário verificar se as pessoas envolvidas estão usando as mesmas palavras com o mesmo sentido.

#### Homonímia

Existe homonímia quando o mesmo termo é utilizado com definições diferentes.

Em uma especificação, palavras como `usuário`, `cliente`, `conta`, `projeto`, `aprovação` e `administrar` podem assumir sentidos diferentes dependendo da pessoa ou do módulo.

Exemplo:

- para a equipe comercial, `cliente` pode ser a empresa contratante;
- para a equipe de suporte, `cliente` pode ser cada usuário atendido;
- para o sistema, `cliente` pode ser um registro de conta.

Quando houver homonímia, os conceitos devem ser separados, definidos ou renomeados.

#### Sinonímia ou predicação unívoca

No texto aristotélico, coisas são denominadas sinonimamente ou univocamente
quando compartilham nome e definição correspondente. Na análise de requisitos,
essa distinção ajuda a verificar se um termo canônico mantém o mesmo sentido
quando aplicado a diferentes casos.

O objetivo não é eliminar variações naturais da linguagem, mas confirmar que a
mesma palavra não muda silenciosamente de definição entre equipes, fluxos ou
documentos.

#### Equivalência terminológica

Quando palavras diferentes, como `workspace` e `espaço de trabalho`, representam
o mesmo conceito, o MCR-10 registra uma equivalência terminológica moderna. Essa
normalização é útil em software, mas não deve ser apresentada como a definição
aristotélica de sinonímia.

#### Paronímia

Os parônimos são termos derivados e relacionados, mas que não devem ser tratados como conceitos idênticos.

Exemplos:

- `aprovação`, `aprovar`, `aprovado` e `aprovador`;
- `permissão`, `permitido` e `autorizar`;
- `revogação`, `revogado` e `revogar`.

Na análise de requisitos, essa distinção ajuda a separar:

- uma entidade;
- uma ação;
- um estado;
- um atributo;
- o papel que executa a ação.

### 4.3 Expressões simples e afirmações

Termos como `manager`, `token`, `ativo`, `revogar` e `ontem` possuem significado, mas não são, isoladamente, requisitos que possam ser testados.

Quando os termos são combinados, surge uma afirmação:

> Um manager pode revogar o próprio token.

Essa afirmação já pode ser investigada:

- qualquer manager pode fazer isso?
- o token precisa estar ativo?
- a revogação é imediata?
- o manager pode revogar tokens de outros usuários?
- o que acontece com uma chamada em andamento?

O princípio operacional do MCR-10 é:

> Um requisito somente está suficientemente definido quando seus termos foram combinados em uma afirmação que possa ser confirmada, negada ou observada.

### 4.4 Tipo, instância e atributo

As relações aristotélicas de **ser dito de um sujeito** e **estar em um sujeito** ajudam a evitar dois erros comuns de modelagem:

1. confundir um tipo com uma instância;
2. transformar um atributo ou estado em uma entidade independente sem necessidade.

Na adaptação do MCR-10:

- **ser dito de** orienta relações de classificação: um `manager` é um tipo de `usuário`;
- **estar em** orienta propriedades dependentes: o estado `bloqueado` está em uma conta;
- a modelagem sugerida pelo analista permanece como hipótese até ser confirmada.

### 4.5 Adaptação moderna para software

O MCR-10 usa as categorias por analogia operacional. A tabela distingue o núcleo
da pergunta e sua aplicação moderna:

| Categoria | Pergunta nuclear | Adaptação moderna para software |
| --- | --- | --- |
| Substância | Quem ou o quê? | ator, entidade, agregado, value object, serviço externo e identidade |
| Quantidade | Quanto ou quantos? | cardinalidade, limites, volume, precisão, quota e capacidade |
| Qualidade | De que tipo ou qualidade? | atributos, invariantes, validação e requisitos não funcionais mensuráveis |
| Relação | Em relação a quê? | propriedade, associação, dependência, tenancy, hierarquia e autorização por recurso |
| Lugar | Onde? | canal, módulo, ambiente, região, dispositivo e fronteira de confiança |
| Tempo | Quando? | ordem, duração, expiração, timeout, retenção, concorrência e consistência temporal |
| Posição | Em qual disposição? | estado de ciclo de vida, etapa, ordenação e configuração; extensão moderna da postura |
| Posse ou ter | O que possui? | papel, permissão, credencial, plano, capability e recurso disponível; extensão moderna de “ter” |
| Ação | O que faz? | comando, evento, gatilho, entrada, idempotência, cancelamento e reversão |
| Afecção | O que recebe a ação? | resultado observável, mudança de estado, erro, efeito colateral, auditoria e compensação |

Finalidade, risco, privacidade, ética, observabilidade, evidência e
reversibilidade são preocupações transversais modernas. Elas devem ser
investigadas quando aplicáveis, sem serem atribuídas à lista original.

---

## 5. As dez categorias do MCR-10

### 5.1 Substância — Quem ou o quê?

A substância identifica aquilo sobre o qual se está falando.

Na análise de requisitos, ela corresponde a:

- atores;
- entidades;
- objetos do domínio;
- tipos;
- instâncias;
- conceitos centrais.

Perguntas orientadoras:

- Quem participa do comportamento?
- O que exatamente está sendo criado, alterado ou consultado?
- Quando o usuário diz `solicitação`, isso representa um tipo de processo ou um registro individual?
- Existem atores humanos e atores sistêmicos?
- Há uma entidade real ou apenas um atributo de outra entidade?

Sinais de risco:

- ator não identificado;
- conceito central sem definição;
- tipo confundido com instância;
- atributo tratado como entidade sem justificativa;
- duas entidades diferentes representadas pelo mesmo nome.

### 5.2 Quantidade — Quanto ou quantos?

A quantidade investiga limites, cardinalidade, volume, frequência, tamanho e precisão.

Ela inclui:

- mínimo e máximo;
- quantidade por usuário ou conta;
- tamanho de arquivos ou campos;
- frequência de execução;
- paginação;
- lotes;
- quotas;
- limites financeiros;
- casas decimais;
- precisão.

Perguntas orientadoras:

- Quantos registros podem existir?
- Cada usuário pode ter um ou vários?
- Existe limite por conta, plano ou período?
- Há tamanho máximo?
- O processamento ocorre individualmente ou em lote?
- Qual volume a solução precisa suportar?

Sinais de risco:

- quantidade aparentemente ilimitada;
- limite não documentado;
- escala desconhecida;
- cobrança dependente de volume sem regra explícita;
- cardinalidade ambígua;
- comportamento diferente no primeiro, último ou único item.

### 5.3 Qualidade — Como é?

A qualidade descreve características, atributos e condições que tornam algo válido ou aceitável.

Ela pode representar:

- propriedades;
- formato;
- segurança;
- desempenho;
- disponibilidade;
- legibilidade;
- precisão;
- acessibilidade;
- integridade;
- critérios de validação.

Perguntas orientadoras:

- O que torna o resultado correto?
- O que significa `rápido`, `seguro`, `válido` ou `concluído`?
- Quais atributos são obrigatórios?
- Como reconhecer um resultado inválido?
- Existe um nível mínimo de qualidade?

Sinais de risco:

- expressões como `funcionar bem`;
- qualidade sem métrica;
- validação ausente;
- atributo obrigatório não identificado;
- expectativa subjetiva apresentada como critério de aceitação.

### 5.4 Relação — De quem, com quem ou com o quê?

A relação investiga vínculos entre os elementos.

Ela inclui:

- propriedade;
- pertencimento;
- dependência;
- hierarquia;
- associação;
- correlação;
- visibilidade;
- isolamento entre contas;
- relação entre origem e destino.

Perguntas orientadoras:

- A quem este registro pertence?
- Qual entidade depende de qual?
- Quem pode visualizar os dados de quem?
- Existe uma relação pai-filho?
- O vínculo é obrigatório ou opcional?
- A relação pode mudar depois da criação?

Sinais de risco:

- propriedade indefinida;
- dados sem conta ou usuário responsável;
- isolamento entre organizações não especificado;
- relação muitos-para-muitos tratada como relação simples;
- dependência escondida;
- exclusão de uma entidade sem regra para os elementos relacionados.

### 5.5 Lugar — Onde?

O lugar determina o contexto espacial ou operacional em que o comportamento acontece.

Ele pode representar:

- tela;
- módulo;
- menu;
- canal;
- ambiente;
- dispositivo;
- servidor;
- região;
- país;
- jurisdição;
- origem e destino de uma integração.

Perguntas orientadoras:

- Onde a ação acontece?
- Onde o resultado aparece?
- O comportamento existe no painel, na API, no MCP ou em todos?
- Ele funciona em ambiente de produção e teste?
- Existem diferenças entre web, aplicativo e dispositivos móveis?
- A região ou jurisdição altera o comportamento?

Sinais de risco:

- funcionalidade descrita sem indicar onde será acessada;
- produção e homologação tratados da mesma forma;
- comportamento multicanal não definido;
- dados disponíveis em um contexto e indevidamente expostos em outro.

### 5.6 Tempo — Quando?

O tempo investiga sequência, duração, validade, recorrência, retenção e prazo.

Ele inclui:

- ordem dos eventos;
- data e hora;
- fuso horário;
- expiração;
- timeout;
- recorrência;
- retenção;
- agendamento;
- validade;
- atrasos;
- concorrência.

Perguntas orientadoras:

- Quando o comportamento começa?
- Quando termina?
- O que precisa acontecer antes?
- A ação é imediata, agendada ou assíncrona?
- Existe expiração?
- Qual fuso horário deve ser usado?
- Por quanto tempo os dados permanecem disponíveis?
- O que acontece quando dois eventos ocorrem ao mesmo tempo?

Sinais de risco:

- uso de `imediatamente` sem definição;
- ausência de fuso;
- validade indefinida;
- retenção não especificada;
- eventos concorrentes sem regra;
- comportamento recorrente sem data de encerramento.

### 5.7 Posição — Em qual estado ou arranjo?

A posição descreve o estado, a etapa, a ordenação ou a configuração atual de algo.

Ela inclui:

- estado inicial;
- estado atual;
- estado de destino;
- posição em um fluxo;
- ordenação;
- disposição;
- configuração;
- pré-condições para uma transição.

Perguntas orientadoras:

- Em qual estado o objeto precisa estar?
- Para qual estado ele será movido?
- Quais transições são permitidas?
- A ordem dos itens altera o comportamento?
- O usuário pode retornar ao estado anterior?
- Existe um estado terminal?

Sinais de risco:

- transição impossível;
- estado inicial desconhecido;
- estado usado sem definição;
- reordenação ambígua;
- ação disponível em estados nos quais deveria ser bloqueada;
- ausência de regra para desfazer ou cancelar.

### 5.8 Posse — O que o ator possui?

A posse investiga recursos, capacidades e permissões disponíveis para o ator.

Ela inclui:

- papéis;
- permissões;
- credenciais;
- tokens;
- chaves;
- planos;
- saldo;
- licenças;
- recursos;
- dados disponíveis;
- capacidades habilitadas.

Perguntas orientadoras:

- Qual permissão o ator precisa possuir?
- A autorização vem do papel, da conta ou do recurso?
- O usuário precisa ter um token, plano ou saldo?
- A posse pode ser revogada?
- O recurso é exclusivo ou compartilhado?
- O que acontece quando o ator perde essa capacidade?

Sinais de risco:

- autorização presumida;
- papel usado como única regra sem verificar o recurso;
- credencial sem expiração ou revogação;
- recurso necessário indisponível;
- acesso mantido após perda de permissão.

### 5.9 Ação — O que é feito?

A ação identifica o gatilho, o comando e a operação executada.

Ela inclui:

- quem inicia;
- qual verbo representa o comportamento;
- quais dados são fornecidos;
- qual evento dispara o processo;
- repetição;
- cancelamento;
- reversão;
- idempotência.

Perguntas orientadoras:

- Quem inicia a ação?
- O que exatamente significa `administrar`, `processar`, `aprovar` ou `sincronizar`?
- Quais dados são necessários?
- A ação pode ser repetida?
- Pode ser cancelada?
- Pode ser desfeita?
- O sistema também pode iniciar a ação automaticamente?

Sinais de risco:

- verbo genérico;
- ação sem gatilho;
- operação sem entrada;
- ausência de regra para repetição;
- cancelamento indefinido;
- duplicidade causada por reprocessamento.

### 5.10 Afecção ou efeito recebido — O que é afetado?

A categoria tradicionalmente chamada de `paixão` é apresentada no MCR-10 como **afecção** ou **efeito recebido**, evitando o sentido emocional corrente da palavra.

Ela observa aquilo que recebe ou sofre a ação.

Inclui:

- alvo afetado;
- resultado;
- mudança de estado;
- efeito colateral;
- notificação;
- falha;
- compensação;
- auditoria;
- efeitos em outros sistemas.

Perguntas orientadoras:

- O que muda depois da ação?
- Quem é afetado?
- Qual resultado deve ser observado?
- O que acontece quando a operação falha?
- Existe compensação ou rollback?
- Quem precisa ser notificado?
- O que deve ser registrado?
- Outros módulos ou integrações são afetados?

Sinais de risco:

- ação sem alvo;
- resultado descrito apenas como intenção;
- efeitos colaterais invisíveis;
- falha sem comportamento esperado;
- ausência de auditoria em ação sensível;
- atualização parcial sem compensação.

---

## 6. Fronteiras entre categorias próximas

Alguns elementos podem parecer pertencer a mais de uma categoria. O objetivo não é forçar uma classificação única, mas compreender o papel de cada informação.

| Fronteira | Regra de distinção | Exemplo |
| --- | --- | --- |
| Qualidade × Posição | Qualidade descreve uma característica; posição descreve estado ou arranjo no fluxo. | `prioridade alta` pode ser qualidade; `aguardando aprovação` é posição. |
| Relação × Posse | Relação descreve vínculo; posse descreve capacidade ou recurso disponível. | `tarefa pertence ao projeto` versus `usuário possui permissão para editar`. |
| Ação × Afecção | Ação observa quem produz a mudança; afecção observa quem recebe a mudança. | `manager revoga o token` versus `token torna-se inválido`. |
| Lugar × Posição | Lugar indica o contexto onde algo ocorre; posição indica o estado ou ordem. | `na tela de usuários` versus `na etapa de validação`. |
| Substância × Qualidade | Substância identifica a entidade; qualidade representa uma característica que depende dela. | `conta` versus `conta bloqueada`. |
| Relação × Quantidade | Relação identifica o vínculo; quantidade define quantos vínculos são permitidos. | `token pertence ao usuário` e `usuário pode possuir até três tokens`. |

Uma mesma passagem pode ser associada a várias categorias quando isso ajudar a compreender dependências diferentes.

---

## 7. Ciclo de aplicação

O MCR-10 é executado em seis movimentos.

### Movimento 1 — Capturar a formulação original

Preserve o texto ou a fala do usuário antes de normalizá-lo.

Registre:

- a solicitação original;
- quem forneceu a informação;
- em qual contexto;
- qual problema motivou a conversa;
- quais documentos ou regras foram mencionados.

Não comece reescrevendo a história. Uma redação mais elegante pode esconder ambiguidades importantes.

### Movimento 2 — Isolar os termos simples

Extraia da narrativa:

- substantivos;
- verbos;
- atributos;
- estados;
- qualificadores;
- quantificadores;
- relações;
- referências de lugar;
- referências de tempo.

Exemplo:

> Como manager, quero gerar um token MCP para administrar os módulos permitidos.

Termos isolados:

- `manager`;
- `gerar`;
- `token MCP`;
- `administrar`;
- `módulos`;
- `permitidos`.

### Movimento 3 — Desambiguar o vocabulário

Investigue:

- palavras iguais com definições diferentes;
- termos diferentes que parecem representar o mesmo conceito;
- termos derivados que indicam entidade, ação, atributo ou estado;
- confusão entre tipo e instância;
- confusão entre entidade e propriedade.

O resultado desta etapa é um glossário provisório.

### Movimento 4 — Distribuir pelas categorias

Associe os trechos da narrativa às dez categorias.

Para cada item, registre:

- o conteúdo encontrado;
- o trecho de origem;
- o status da informação;
- as lacunas;
- as categorias relacionadas;
- o risco da indefinição.

### Movimento 5 — Recompor em afirmações

Combine os elementos em afirmações atômicas.

Uma estrutura útil é:

```text
[Sujeito]
+ [ação ou predicado]
+ [objeto ou atributo]
+ [condição de lugar, tempo ou estado]
+ [limite ou qualidade]
+ [efeito observável]
```

Exemplo:

> Um manager autenticado pode revogar o próprio token MCP na área de configurações. Após a confirmação, novas chamadas realizadas com esse token devem ser rejeitadas e a revogação deve ser registrada.

### Movimento 6 — Testar e consolidar

Para cada afirmação:

- formule sua negação;
- procure exceções;
- investigue limites;
- verifique autorização;
- analise estados anteriores e posteriores;
- identifique falhas;
- procure efeitos colaterais;
- determine como observar o resultado.

Depois disso, converta as decisões confirmadas em:

- regras;
- fluxos;
- histórias refinadas;
- critérios de aceitação;
- cenários;
- questões em aberto.

---

## 8. Status das informações

Toda informação deve receber um status.

| Status | Significado |
| --- | --- |
| Declarado | Foi afirmado diretamente pelo usuário ou pela fonte. |
| Inferido | Foi deduzido a partir de outras informações, mas ainda não confirmado. |
| Hipótese | É uma possibilidade proposta para orientar a conversa. |
| Decisão | Foi explicitamente confirmada por uma pessoa autorizada. |
| Conflito | Contradiz outra afirmação, regra ou fonte. |
| Aberto | Ainda depende de resposta ou decisão. |
| Não aplicável | A categoria não interfere no caso, com justificativa registrada. |

Uma inferência nunca deve ser apresentada como fato declarado.

Exemplo:

```markdown
- **Trecho original:** “Cada manager terá seu token.”
- **Afirmação normalizada:** cada manager possui um token MCP individual.
- **Status:** declarado.
- **Questão aberta:** o usuário pode possuir mais de um token ativo?
```

---

## 9. Protocolo de conversa

### 9.1 Primeiro compreender, depois perguntar

O método não deve começar com dez perguntas correspondentes às dez categorias.

Antes da primeira pergunta:

1. leia ou escute a solicitação;
2. extraia o que já está explícito;
3. identifique as lacunas;
4. apresente uma síntese curta;
5. escolha as perguntas de maior impacto.

Exemplo:

> Entendi que o manager precisa de uma credencial MCP vinculada aos módulos que pode administrar. Antes de escrever os critérios, precisamos decidir a quem o token pertence, quantos tokens podem existir e de onde vêm as permissões dos módulos.

### 9.2 Usar a linguagem do usuário

As perguntas devem aproveitar os termos utilizados na conversa.

Prefira:

> Quando você diz `cliente`, está falando da empresa contratante ou de cada conta atendida?

Evite:

> Defina a substância correspondente ao conceito de cliente.

Os conceitos filosóficos orientam o analista. Eles não precisam aparecer na conversa quando não ajudarem o usuário.

### 9.3 Fazer uma pergunta numerada por rodada

Em cada rodada, apresente uma pergunta real, numerada como `Pergunta 1`, e
espere a resposta antes de formular a próxima. Se houver outras lacunas,
reordene-as depois da resposta, sem antecipá-las na mesma rodada.

Abaixo de cada pergunta, ofereça pelo menos três opções numeradas, seguidas das
opções numeradas `Escrever outra resposta` e `Avançar`. Não apresente opção sem
número.

Isso permite:

- manter a conversa fluida;
- incorporar respostas progressivamente;
- evitar perguntas que se tornariam desnecessárias;
- confirmar o entendimento antes de aprofundar;
- reduzir respostas superficiais causadas por questionários longos.

### 9.4 Priorizar as perguntas

As perguntas são classificadas em três níveis. Essa prioridade mede risco de
descoberta; ela não substitui a prioridade de produto de histórias ou backlog.

#### P1 — Bloqueadora

Uma resposta P1 muda a estrutura do produto, a regra central ou o risco da solução.

Exemplos:

- quem é o ator;
- a quem os dados pertencem;
- quem possui autorização;
- qual é o efeito principal;
- quem pode acessar o quê;
- o que acontece com dados, dinheiro ou ações irreversíveis.

#### P2 — Necessária

Uma resposta P2 permite implementar e testar o comportamento com segurança.

Exemplos:

- limites;
- estados;
- ordem temporal;
- expiração;
- exceções;
- falhas;
- cancelamento;
- auditoria.

#### P3 — Aperfeiçoamento

Uma resposta P3 melhora a experiência ou a operação sem redefinir o comportamento central.

Exemplos:

- microcopy;
- preferências visuais;
- ordenação secundária;
- otimizações não críticas;
- detalhes de apresentação.

Dentro da mesma prioridade, pergunte primeiro sobre a lacuna que afeta mais decisões posteriores.

### 9.5 Estrutura de uma rodada

Cada rodada deve conter:

1. **Síntese:** o que foi entendido.
2. **Decisões:** o que já foi confirmado.
3. **Lacunas:** os próximos pontos aplicáveis ainda não definidos.
4. **Pergunta:** uma formulação concreta e numerada.
5. **Opções:** no mínimo três sugestões numeradas por pergunta, mais escrita
   livre e avanço.
6. **Registro:** respostas originais e escolhas normalizadas.
7. **Atualização:** categorias e regras afetadas.

### 9.6 Perguntas com hipóteses

Uma hipótese pode reduzir o esforço do usuário, desde que seja apresentada de forma explícita.

Exemplo:

> Estou entendendo que cada token pertence exclusivamente ao usuário que o criou. É isso ou o token representa a conta inteira?

A hipótese não deve ser incorporada à especificação até ser confirmada.

### 9.7 Ciclo adaptativo e saída explícita

O refinamento do backlog faz no máximo oito perguntas por área. Depois de cada
rodada, reanalise o contexto acumulado e as novas respostas: entrada original,
evidências do repositório, escolhas confirmadas, respostas anteriores e
dependências afetadas. Reclassifique as lacunas e formule a próxima rodada
enquanto existir lacuna aplicável e restarem perguntas no limite.
Uma fila anterior é apenas uma hipótese de análise e deve ser
descartada quando a resposta mudar o contexto.

Ofereça `Avançar` em cada pergunta desde a primeira rodada. Na rodada seguinte,
pergunte se a pessoa quer encerrar definitivamente as perguntas daquela área,
responder depois ou voltar a responder agora. Inclua essa confirmação entre as
pergunta numerada da rodada seguinte.

Se a pessoa encerrar a área, registre
`Área encerrada pelo usuário: <área>` no artefato aplicável e não volte ao
assunto sem reabertura explícita. Se ela responder depois, registre
`Área adiada pelo usuário: <área>` e preserve os pontos abertos para retomada.
Não normalize ausência de resposta como escolha confirmada, não declare
conclusão plena e não aprove o Definition Gate enquanto houver lacuna
aplicável.

---

## 10. Protocolo para analisar especificações e histórias

Quando a entrada já estiver escrita, o método deve produzir primeiro um diagnóstico.

### Etapa 1 — Segmentação

Divida o texto em afirmações atômicas, preservando a passagem original.

### Etapa 2 — Extração

Identifique:

- atores;
- entidades;
- ações;
- atributos;
- quantidades;
- relações;
- lugares;
- tempos;
- estados;
- recursos;
- efeitos.

### Etapa 3 — Vocabulário

Localize:

- termos sem definição;
- termos com mais de um sentido;
- nomes diferentes para o mesmo conceito;
- termos derivados usados como equivalentes;
- classificações e atributos possivelmente confundidos.

### Etapa 4 — Classificação

Associe cada trecho às categorias relevantes.

### Etapa 5 — Status

Marque cada afirmação como:

- declarada;
- inferida;
- hipótese;
- decisão;
- conflito;
- aberta.

### Etapa 6 — Teste lógico

Procure:

- negação;
- exceção;
- condição de falha;
- contradição;
- limite;
- ausência de efeito observável;
- consequência não mencionada.

### Etapa 7 — Cobertura

Avalie quais categorias aplicáveis estão:

- ausentes;
- apenas mencionadas;
- definidas;
- verificáveis.

### Etapa 8 — Consolidação

Somente depois do diagnóstico, gere:

- resumo;
- glossário;
- regras;
- decisões;
- escopo;
- questões;
- histórias refinadas;
- critérios de aceitação.

---

## 11. Registro de afirmações

Cada afirmação relevante deve possuir um registro rastreável.

```yaml
id: RQ-012
trecho_de_origem: "Cada manager terá seu token."
formulacao_normalizada: "Cada manager possui um token MCP individual."
categorias:
  - substancia
  - quantidade
  - relacao
  - posse
status: declarado
fonte: "Refinamento do backlog com o responsável pelo produto"
dependencias:
  - "Definir se pode existir mais de um token ativo"
teste: "Consultar os tokens vinculados a dois managers diferentes"
risco: P1
```

Campos mínimos:

| Campo | Descrição |
| --- | --- |
| ID | Identificador estável. |
| Trecho de origem | Fala, documento ou passagem que originou a afirmação. |
| Formulação normalizada | Afirmação atômica sem alteração do sentido. |
| Categorias | Categorias relacionadas. |
| Status | Declarado, inferido, hipótese, decisão, conflito ou aberto. |
| Fonte | Pessoa, documento, regra ou evidência. |
| Dependências | Decisões necessárias ou afirmações relacionadas. |
| Teste | Como confirmar, refutar ou observar o comportamento. |
| Risco | P1, P2 ou P3. |

---

## 12. Cobertura

A cobertura é um instrumento de visibilidade, não uma nota absoluta de qualidade.

| Pontuação | Estado | Critério |
| ---: | --- | --- |
| N/A | Não aplicável | A irrelevância foi justificada. |
| 0 | Ausente | A categoria é relevante, mas não aparece. |
| 1 | Mencionada | Existe referência, porém vaga, contraditória ou não operacional. |
| 2 | Definida | A regra está explícita e coerente. |
| 3 | Verificável | Possui condição, efeito observável e tratamento da exceção relevante. |

A cobertura percentual pode ser calculada por:

```text
soma dos pontos obtidos
────────────────────────────────────────── × 100
3 × quantidade de categorias aplicáveis
```

Uma cobertura alta não elimina bloqueios. Uma única questão P1 pode impedir o refinamento mesmo quando todas as outras categorias estiverem bem definidas.

---

## 13. Gatilhos de risco

O método deve sinalizar:

- termo central com mais de uma definição;
- ator sem papel ou limite de autorização;
- entidade sem proprietário;
- ação sem gatilho;
- ação sem alvo;
- efeito principal não observável;
- quantidade ilimitada em fluxo com custo ou cobrança;
- prazo relativo sem duração ou fuso;
- transição sem estado inicial;
- falha sem comportamento esperado;
- operação sensível sem auditoria;
- comportamento irreversível sem confirmação;
- conflito entre duas afirmações;
- critério de aceitação que apenas repete a história;
- inferência apresentada como decisão.

---

## 14. Estrutura da saída

Ao concluir a análise, o MCR-10 pode produzir as seguintes seções.

### Entendimento

Resumo do problema, da intenção e do resultado esperado.

### Vocabulário

Definições canônicas, termos ambíguos e conceitos relacionados.

### Atores e entidades

Tipos, instâncias, atributos e relações principais.

### Matriz categorial

Conteúdo encontrado, lacunas e status em cada categoria.

### Regras e decisões

Afirmações confirmadas, acompanhadas de sua origem.

### Escopo

O que está incluído, o que está excluído e quais são as dependências.

### Fluxos e estados

Gatilhos, ações, transições, efeitos e falhas.

### Questões em aberto

Perguntas P1, P2 e P3 ainda não respondidas.

### Histórias refinadas

Histórias menores quando a solicitação original contiver mais de uma intenção.

### Critérios de aceitação

Cenários observáveis, utilizando Given/When/Then quando essa estrutura aumentar a precisão.

### Cobertura e riscos

Pontuação por categoria aplicável e bloqueios remanescentes.

### Rastreabilidade

Ligação entre trechos originais, decisões, regras e critérios.

---

## 15. Exemplo de aplicação

### Entrada

> Como manager, quero gerar um token MCP para administrar os módulos permitidos.

### Análise inicial

| Categoria | Conteúdo encontrado | Lacuna |
| --- | --- | --- |
| Substância | manager, token MCP, módulo | O token pertence ao usuário ou à conta? |
| Quantidade | um token é mencionado | Pode existir mais de um token ativo? |
| Qualidade | não definida | Quais requisitos de segurança e exibição do segredo? |
| Relação | manager relacionado aos módulos | Quem define os módulos permitidos? |
| Lugar | não definido | A configuração ocorre em qual tela ou servidor? |
| Tempo | não definido | O token expira? Quando a revogação produz efeito? |
| Posição | estados implícitos | Quais estados existem: ativo, expirado e revogado? |
| Posse | manager precisa de autorização | Qual permissão habilita geração e revogação? |
| Ação | gerar e administrar | O que `administrar` inclui? |
| Afecção | token criado e módulos acessíveis | O segredo aparece uma vez? Há auditoria? |

### Síntese para o usuário

> Entendi que o manager precisa de uma credencial MCP vinculada aos módulos que pode administrar. Antes de escrevermos os critérios, precisamos fechar três decisões que alteram a identidade, a autorização e a estrutura dos tokens.

### Fila inicial de perguntas candidatas

1. Cada token pertence exclusivamente a um usuário ou pode representar uma conta ou equipe?
2. O manager poderá ter um único token ativo ou vários tokens nomeados?
3. As permissões serão herdadas do papel do usuário ou configuradas individualmente no token?

Pergunte primeiro sobre propriedade. Depois da resposta, recalcule as lacunas:
a decisão pode alterar ou eliminar as perguntas seguintes. A lista é uma fila de
análise, não um questionário a ser enviado em lote.

### Afirmação demonstrativa após as decisões

> Cada token MCP pertence a um único usuário admin ou manager, possui um conjunto explícito de módulos autorizados e pode estar ativo, expirado ou revogado. Um token revogado deve ser rejeitado em novas chamadas e a revogação deve ser registrada.

Essa afirmação ainda deverá ser testada:

- a rejeição é imediata?
- chamadas em andamento são interrompidas?
- o admin pode revogar o token de outro usuário?
- qual informação deve ser armazenada na auditoria?
- o token expirado pode ser reativado?

---

## 16. Critérios de conclusão

Uma especificação está suficientemente refinada quando:

- os termos centrais possuem definição operacional;
- atores, entidades, ação, alvo e efeito principal estão explícitos;
- tipo, instância, atributo e estado não estão confundidos;
- propriedade e autorização estão definidas ou justificadamente marcadas como não aplicáveis;
- limites relevantes estão definidos;
- o contexto de execução está definido;
- regras temporais relevantes estão definidas;
- estados e transições estão definidos;
- falhas e exceções de maior risco foram tratadas;
- efeitos colaterais foram identificados;
- inferências aplicáveis foram confirmadas, refutadas ou marcadas como não
  aplicáveis;
- não existe questão aplicável sem resposta;
- os critérios permitem observar sucesso e falha;
- cada decisão importante pode ser ligada à sua fonte.

Escolher `avançar` abre a confirmação de encerramento da área, adiamento ou
retomada imediata. Encerrar uma área impede novas perguntas sobre ela até uma
reabertura explícita. Adiar preserva os pontos abertos. A definição permanece
em Draft e o Definition Gate permanece Pending enquanto houver lacuna
aplicável.

---

## 17. Regras para uso por inteligência artificial

Um assistente que utilize o MCR-10 deve:

1. preservar a formulação original do usuário;
2. extrair o que já está definido antes de perguntar;
3. não repetir perguntas respondidas;
4. marcar toda inferência;
5. não inventar decisões para completar a especificação;
6. usar as categorias de forma adaptativa;
7. fazer uma pergunta numerada por rodada e esperar a resposta;
8. priorizar autorização, propriedade, dados, dinheiro, irreversibilidade e efeito principal;
9. atualizar a análise incrementalmente;
10. permitir que o usuário corrija uma definição;
11. recalcular regras dependentes quando uma decisão mudar;
12. manter rastreabilidade entre origem, decisão e critério;
13. gerar uma versão resumida ou completa conforme a necessidade;
14. tratar categorias não aplicáveis de maneira explícita;
15. analisar antes de reescrever.
16. executar o refinamento do backlog com no máximo oito perguntas por área;
17. reanalisar o contexto acumulado e as novas respostas depois de cada rodada;
18. continuar enquanto existir lacuna aplicável;
19. oferecer pelo menos três opções numeradas, `Escrever outra resposta`,
    `Gere outras opções` e `Avançar` em cada pergunta desde a primeira rodada;
20. confirmar se a pessoa encerra a área, responde depois ou retoma agora;
21. registrar e respeitar áreas encerradas ou adiadas.

---

## 18. Prompt operacional

```text
Analise a solicitação preservando as palavras do usuário.

Distinga o pedido literal da finalidade e formule o resultado desejado como uma
interpretação a ser confirmada, nunca como leitura da mente do usuário.

Primeiro, extraia os termos simples e identifique ambiguidades, incluindo nomes
iguais com sentidos diferentes, conceitos equivalentes e termos derivados que
não devem ser confundidos.

Depois, distribua o conteúdo aplicável entre substância, quantidade, qualidade,
relação, lugar, tempo, posição, posse, ação e afecção ou efeito recebido.

Para cada item, registre o trecho de origem e marque-o como declarado, inferido,
hipótese, decisão, conflito ou questão aberta.

Recombine os elementos em afirmações com sujeito, condição, ação ou predicado e
efeito observável. Teste cada afirmação por negação, exceção, falha e limite.

Antes de reescrever a especificação, apresente uma síntese e faça exatamente
uma pergunta numerada por rodada. Ofereça pelo menos três opções numeradas,
`Escrever outra resposta`, `Gere outras opções` e `Avançar`. Priorize
identidade,
autorização, propriedade, dados, custo, irreversibilidade e efeito principal.
Depois de `Avançar`, confirme encerramento da área, adiamento ou retomada
imediata. Registre a escolha e não reabra uma área encerrada sem pedido
explícito.

Não invente respostas.

Ao final, gere entendimento, vocabulário, atores e entidades, matriz categorial,
regras confirmadas, escopo, fluxos, questões abertas, histórias refinadas,
critérios de aceitação, cobertura, riscos e rastreabilidade.
```

---

## 19. Referências e fidelidade conceitual

Fontes:

**Aristóteles. *Categorias; Da Interpretação*. Tradução e notas de Ricardo Santos. Imprensa Nacional-Casa da Moeda, 2016.**

- Aristóteles, *Categories*, tradução de E. M. Edghill, em *The Works of
  Aristotle* (1928), texto e numeração Bekker:
  <https://en.wikisource.org/wiki/The_Works_of_Aristotle/Categories>
- Paul Studtmann, “Aristotle’s Categories”, *Stanford Encyclopedia of
  Philosophy*, arquivo Spring 2021:
  <https://plato.stanford.edu/archives/spr2021/entries/aristotle-categories/>
- “Aristotle’s Logic”, seção 7.3, *Stanford Encyclopedia of Philosophy*:
  <https://plato.stanford.edu/entries/aristotle-logic/>

Passagens utilizadas:

- *Categorias*, capítulo 1, 1a1–15: homônimos, sinônimos e parônimos;
- *Categorias*, capítulo 2, 1a16–1b9: expressões com e sem combinação, `ser dito de` e `estar em` um sujeito;
- *Categorias*, capítulo 4, 1b25–2a10: enumeração das dez categorias e passagem da expressão isolada à afirmação.

As fontes foram consultadas em 24 de julho de 2026. A tradução portuguesa acima
é a referência bibliográfica indicada no material original; os links públicos
permitem conferir a enumeração, os exemplos e o debate interpretativo.

O MCR-10 é uma adaptação metodológica contemporânea. Ele não atribui a
Aristóteles uma teoria de requisitos, produto, conversação ou desenvolvimento de
software. Termos como autorização, tenancy, observabilidade, feature flag,
rollback e TDD pertencem exclusivamente à adaptação moderna.

---

## 20. Aprendizados, validação e evolução

### Aprendizados incorporados

- As categorias melhoram cobertura sem provar completude; uma questão P1 ainda
  pode bloquear uma matriz com pontuação alta.
- A finalidade precisa preceder as categorias porque um pedido pode descrever
  uma solução sem revelar o problema.
- Posição, posse e afecção exigem tradução cuidadosa para software; estado,
  autorização e efeitos são extensões operacionais, não equivalências históricas.
- Separar declaração, inferência e decisão reduz a chance de uma redação fluente
  transformar suposição do agente em requisito.
- A conversa é mais útil quando as categorias orientam o raciocínio silencioso e
  apenas a lacuna de maior valor aparece para o usuário.

### Hipóteses a validar

O método ainda deve ser avaliado em histórias reais. Compare, antes e depois:

- ambiguidades materiais descobertas antes da implementação;
- quantidade de perguntas feitas e respostas que alteraram o comportamento;
- defeitos de requisito encontrados em desenvolvimento ou produção;
- concordância entre dois analistas sobre categorias, status e prioridades;
- tempo até uma história possuir Gherkin testável;
- satisfação do usuário com a fidelidade da síntese.

### Possibilidades de aprimoramento

1. Criar exemplos calibrados por domínio: SaaS multi-tenant, pagamentos,
   integrações, IA, dados sensíveis e sistemas assíncronos.
2. Testar consistência entre avaliadores e refinar fronteiras que produzirem
   classificações divergentes sem benefício prático.
3. Automatizar extração e matriz sem automatizar decisões ou pontuação final.
4. Vincular registros MCR diretamente a `US`, `FR`, `AC`, testes e tarefas.
5. Criar padrões de risco que elevem automaticamente perguntas de autorização,
   privacidade, dinheiro e irreversibilidade para P1.
6. Medir perguntas evitadas pela análise adaptativa, não premiar quantidade de
   perguntas ou cobertura percentual isolada.
7. Revisar linguagem, acessibilidade e vieses para que o método funcione com
   usuários técnicos e não técnicos.

Qualquer evolução deve preservar a formulação original, a proveniência das
afirmações e a decisão humana sobre intenção e comportamento.
