---
name: specsfy-specialist-research
description: "Investigar questões técnicas em fontes primárias (modo sources: hierarquia de fontes, triangulação, síntese com fato, inferência e lacuna) e construir protótipos descartáveis (modo prototype: pergunta única, fidelidade mínima, experimento e descarte). Use quando uma escolha depende de comportamento real de API, comparação de tecnologias ou fato técnico incerto, ou quando só um artefato executável responde à pergunta. Não use para justificar uma escolha já tomada nem para promover protótipo a produção; para a causa de uma falha observada use `$specsfy-specialist-debugging`; para registrar a escolha estrutural use `$specsfy-specialist-architecture`; para rigor de fluxo e hierarquia visual use `$specsfy-specialist-interface`."
---

# Pesquisa

Reduza incerteza técnica com o menor artefato que responde à pergunta. O modo
sources confirma fatos em fonte primária, com versão, data e link. O modo
prototype constrói algo executável e descartável quando documento nenhum
resolve. Nos dois casos, o resultado é uma resposta explícita, com limitações e
próximo passo.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Escolha depende de fato técnico não confirmado, comparação de alternativas caras de reverter ou validade de comportamento na versão atual | sources | [Hierarquia de fontes, matriz de avaliação e síntese](references/sources.md) |
| Pergunta técnica, de interação ou visual que só um artefato executável responde, ou comparação direta entre alternativas concretas | prototype | [Fidelidade por pergunta, diferenças de produção e saída](references/prototypes.md) |

Não use para:

- Reconfirmar uma escolha já decidida só para produzir justificativa. Isso é
  viés de confirmação, não pesquisa.
- Investigar por que um comportamento observado diverge do documentado. Nesse
  caso o objetivo é diagnóstico de causa raiz e o especialista é
  `$specsfy-specialist-debugging`.
- Promover código de protótipo a produção. A fidelidade reduzida (sem cobertura,
  tratamento de erro e segurança) é deliberada e válida apenas enquanto o
  artefato é descartável.
- Registrar a decisão estrutural. Use `$specsfy-specialist-architecture`, que
  mantém o ADR e o cenário de qualidade.

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
   pertinente à fase. Consulte também `### 2. Research e esclarecimentos` na spec.
   Leia `.specsfy/STACK.md` e `.specsfy/RULES.md`.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-research (sources|prototype)`. Sem
   indicação, escolha o modo pelo "Quando usar" acima.
3. Devolva a conclusão e as dúvidas abertas no destino indicado no item 1,
   no próprio backlog, na spec ou na tarefa da fase.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Quando a fase trabalhar a seção de pesquisa da spec, guarde cada artefato
   em `research/` dentro da pasta da spec e cite-o como
   `R-00x` na seção 2, com versão, data e URL da fonte primária.

## Fluxo

1. Formular a pergunta específica, a escolha que ela vai suportar, o escopo e a
   recência necessária (comportamento de hoje ou histórico é suficiente?).
2. Definir de antemão que comprovação confirmaria ou refutaria cada alternativa.
   Sem isso, qualquer resultado parece confirmar a suposição inicial.
3. Escolher o modo: fonte primária quando a resposta pode ser documentada ou
   reproduzida sem construir nada; protótipo quando só a execução responde.
4. Descobrir versão, runtime e configuração reais do projeto consumidor antes de
   generalizar qualquer conclusão.
5. Executar o fluxo do modo escolhido e responder à pergunta de forma explícita.
6. Registrar o resultado no local autorizado pela spec do projeto, separando
   fato, inferência, consequência e lacuna, e encaminhar o aprendizado ao dono
   correto (spec, ADR, requisito, teste ou backlog).

### Modo sources

1. Priorizar, nesta ordem: especificação/standard, documentação oficial
   versionada, código-fonte e changelog oficiais, experimento reproduzível no
   ambiente alvo. Só então usar fonte secundária.
2. Verificar versão, data de publicação e aplicabilidade ao ambiente real
   observado no projeto: um comportamento documentado para outra versão não é
   comprovação para a versão em uso.
3. Triangular toda afirmação crítica para a escolha com uma segunda fonte
   independente. Executar experimento controlado quando a documentação não
   resolver a dúvida. (regra da casa)
4. Separar explicitamente fatos confirmados, inferências (prováveis mas não
   confirmadas), consequências possíveis e lacunas que permanecem sem
   comprovação.
5. Sintetizar com links diretos à fonte, próximos à afirmação específica que
   sustentam, com a implicação concreta para a escolha em jogo.

### Modo prototype

1. Formular uma única pergunta e a regra que decide a resposta antes de escrever
   qualquer código; sem isso, o protótipo vira exploração sem fim.
2. Definir o que precisa ser real (o mecanismo sob teste) e o que pode ser
   simulado ou mockado (tudo que não afeta a resposta à pergunta).
3. Escolher a fidelidade mínima suficiente, um tempo limite explícito e um local
   claramente descartável no repositório ou fora dele.
4. Construir mais de uma alternativa quando a comparação direta entre elas for
   mais informativa que testar uma só contra a expectativa.
5. Executar o cenário planejado e coletar comprovação observável, não impressão
   subjetiva de "parece que funciona".
6. Responder à pergunta original explicitamente (aceita, rejeitada ou ainda
   inconclusiva) e registrar as limitações do que foi testado.
7. Descartar o protótipo ou arquivá-lo explicitamente como não-produção, sem
   deixar nenhuma dependência de runtime apontando para ele.

## Padrões

- Não usar snippet de fórum, blog pessoal ou resposta de IA genérica como
  autoridade sobre comportamento de API quando existe fonte primária acessível:
  usar como pista para onde procurar a fonte primária, não como citação final.
- Citar a página e a seção específica da fonte próxima da afirmação, não um link
  genérico para a home da documentação.
- Sintetizar preservando o contexto necessário para a escolha; evitar transcrição
  extensa que apenas desloca o trabalho de leitura para depois.
- Registrar versão e data de qualquer fonte cujo comportamento pode mudar entre
  releases; sem isso, a conclusão expira silenciosamente.
- Verificar a vigência do documento citado antes de usá-lo: RFC obsoletado ou
  atualizado, Internet-Draft expirado ou versão substituída invalidam a
  conclusão mesmo quando o link ainda abre.
- Quando duas fontes conflitam, declarar o conflito explicitamente em vez de
  escolher uma silenciosamente sem justificar por que ela prevalece.
- Não criar um `research.md` paralelo à fonte normativa do projeto; a pesquisa é
  indexada e vive no local que a spec do projeto consumidor define.
- Tratar benchmark publicado por fornecedor da própria tecnologia como
  comprovação interessada: útil como ponto de partida, nunca como conclusão final
  sem reprodução independente.
- Não confundir uma demo convincente com uma arquitetura válida: um protótipo que
  "funciona na demo" não provou nada sobre concorrência, escala, erro ou
  segurança que não foi deliberadamente exercitado.
- Manter dados reais, credenciais de produção e integrações reais fora do
  protótipo, salvo quando a própria pergunta exige testar contra o sistema real
  (e mesmo assim, com escopo e autorização explícitos).
- Para protótipo de interface, usar conteúdo realista (não "lorem ipsum") e
  estados extremos (texto muito longo, lista vazia, erro): a pergunta sobre UI
  raramente é sobre o caminho feliz.
- Para protótipo de lógica/estado, expor as transições e invariantes numa
  interface mínima (CLI, teste executável) que as torne observáveis, em vez de
  escondê-las atrás de uma UI completa desnecessária à pergunta.
- Não gastar tempo com abstração, cobertura de teste ou acabamento visual fora do
  que a pergunta exige: isso é o oposto do propósito do protótipo.
- Marcar o código como descartável de forma que impeça import acidental por
  código de produção (diretório isolado, nome inequívoco, sem export público).
- Converter todo aprendizado relevante em requisito, escolha registrada ou teste
  no owner correto (spec, ADR, backlog): o protótipo em si não é fonte de
  verdade depois de descartado.

## Antipadrões

- Pesquisar depois de já ter decidido, buscando apenas confirmação: a pergunta
  formulada no passo 1 já sai enviesada ("por que X é melhor", em vez de "X ou Y,
  e sob qual regra").
- Citar "a documentação diz" sem link nem versão: torna a afirmação impossível de
  reverificar quando o comportamento mudar.
- Copiar benchmark de marketing de um fornecedor como se fosse medição neutra do
  ambiente do projeto.
- Resolver uma pergunta com múltiplas fontes conflitantes escolhendo a que
  confirma a preferência inicial, sem registrar que havia conflito.
- Deixar o protótipo "temporário" rodando em produção porque "funcionou", sem a
  validação completa (segurança, erro, escala) que o protótipo deliberadamente
  pulou; ele leva falhas invisíveis para produção.
- Testar várias perguntas ao mesmo tempo no mesmo protótipo: quando o resultado é
  ambíguo, não dá para saber qual variável causou o quê.
- Investir em polimento visual ou arquitetura "só por garantia" quando a pergunta
  era puramente sobre viabilidade técnica de um mecanismo.
- Herdar a dívida do protótipo silenciosamente: reaproveitar o arquivo do
  protótipo como base do código de produção sem reescrevê-lo com os padrões
  normais de qualidade.

## Validação

- Cada conclusão que sustenta a escolha tem comprovação direta e rastreável
  (link + versão + data), não apenas afirmação de memória.
- As fontes usadas correspondem à versão e ao runtime real do projeto consumidor,
  não a uma versão genérica ou desatualizada.
- Experimentos executados são reproduzíveis por outra pessoa e não alteram
  produção nem dado real.
- Lacunas e incerteza residual estão explícitas na síntese final, não escondidas
  atrás de uma conclusão mais confiante do que a comprovação permite.
- A regra de escolha do protótipo foi definida antes da execução. O resultado é
  reproduzível por outra pessoa que rode o mesmo cenário.
- A pergunta original tem resposta explícita: suposição aceita, rejeitada ou
  ainda inconclusiva (e, nesse caso, o que falta para decidir).
- As limitações do protótipo e as diferenças em relação ao que produção exigiria
  estão registradas explicitamente.
- Nenhum artefato do protótipo permanece conectado ao runtime final: verificado,
  não apenas assumido.
- Não apresentar uma suposição não triangulada como fato: linguagem que implica
  certeza sem a comprovação correspondente é proibida.
- Não declarar uma abordagem "viável para produção" só com base no protótipo:
  isso exige a implementação e validação completas descritas no padrão do
  projeto.

## Skills relacionadas

- `$specsfy-specialist-modeling` usa fontes externas para alinhar conceitos e
  recebe o aprendizado do protótipo como modelo, não como código descartável.
- `$specsfy-specialist-architecture` registra em ADR a escolha estrutural
  apoiada pela pesquisa e fornece o cenário de qualidade a comprovar.
- `$specsfy-specialist-laravel` confirma documentação, versão e instalação de um
  pacote Composer no modo packages.
- `$specsfy-specialist-interface` recebe o protótipo de interface e acrescenta
  rigor de fluxo, hierarquia visual e acessibilidade.
- `$specsfy-specialist-debugging` investiga por que o comportamento observado
  difere do documentado, quando o objetivo é causa raiz e não comparação.

Leia [references/standards.md](references/standards.md) para o padrão comum, o
índice dos modos e as fontes oficiais. Leia
[references/sources.md](references/sources.md) para a hierarquia de fontes, a
matriz de avaliação e o formato de síntese. Leia
[references/prototypes.md](references/prototypes.md) para fidelidade por tipo de
pergunta, diferenças entre protótipo e produção e formato de saída.
