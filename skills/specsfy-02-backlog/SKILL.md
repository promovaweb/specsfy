---
name: specsfy-02-backlog
description: "Transforma uma captura de `specs/inbox/`, uma oportunidade, um problema ou um item existente em backlog pronto para especificação, inclusive quando chamada por transição automática. Pesquisa duplicatas e referências, cria ou atualiza `specs/backlog/`, conduz perguntas adaptativas com o MCR-10 e entrega um brief testável. Para apenas guardar um texto sem perguntas use specsfy-01-inbox; para escrever spec.md use specsfy-03-specify; não cria tarefas, testes nem código."
---

# Refinar e aprofundar o backlog

Transforme uma entrada vaga em um item de backlog compreensível. Quando a
intenção exigir especificação, aprofunde as decisões até produzir um brief
testável. Esta é a segunda etapa sequencial do framework: reúne registro,
refinamento e descoberta sem transformar o backlog em fonte normativa.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

## Pronto quando

- duplicatas e referências foram pesquisadas e registradas;
- o item existe em `specs/backlog/<NNNN>-<slug>.md` com o `Status` correto;
- cada lacuna aplicável está decidida, não aplicável, resolvida por evidência
  ou registrada como aberta;
- o `Brief pronto para especificar` foi apresentado e a transição seguinte foi
  anunciada.

## Orquestrar a conversa

Ao concluir esta etapa ou detectar trabalho de outra etapa, anuncie
`Pendência detectada: <descrição> — ação: resolvendo nesta etapa` e resolva-a
quando pertencer ao próprio escopo. Quando houver troca de responsabilidade,
anuncie `Transição automática: $specsfy-02-backlog → $<destino> — motivo:
<motivo> — resultado esperado: <resultado>` e carregue imediatamente a skill
de destino, sem pedir confirmação nem repetir o comando. Continue na mesma
conversa.

Depois de uma correção necessária a esta etapa, anuncie `Retomada automática:
$<destino> → $specsfy-02-backlog — pendência resolvida: <resultado>` e retome-a
imediatamente. Reavalie o estado após cada handoff para evitar ciclos. O
handoff não exige confirmação; ações sensíveis continuam exigindo autorização
específica.

## Buscar duplicatas e referências

1. Extraia termos derivados do pedido do usuário, incluindo nomes do domínio e
   equivalentes evidentes já usados na conversa.
2. Antes de criar ou atualizar o item, pesquise esses termos em paralelo nas
   fontes abaixo:
   - `specs/inbox/*.md`, a fila ativa;
   - `specs/inbox/processed/*.md`, capturas já cobertas por specs aprovadas,
     úteis para histórico e duplicatas;
   - `specs/backlog/*.md`;
   - `specs/<estado>/*/spec.md`;
   - `docs/**/*.md`.
3. Leia somente resultados plausíveis e classifique cada relação:

   | Relação | Quando usar |
   | --- | --- |
   | **possível duplicata** | problema, pessoa, resultado e contexto substancialmente iguais |
   | **backlog relacionado** | item complementar, dependência ou precedente |
   | **spec relacionada** | comportamento definido ou entregue que limita o item |
   | **documentação relacionada** | vocabulário, regra ou contexto do projeto |

4. Apresente as correspondências materiais com seus caminhos. Diante de
   possível duplicata, confirme com o usuário se deve atualizar o item ou
   registrar uma diferença real.
5. Registre as fontes úteis em `Referências relacionadas`, com caminho relativo
   e tipo de relação. Uma decisão encontrada em fonte não vira declaração do
   usuário.

Repita a busca quando uma resposta mudar materialmente termos, problema,
pessoa, resultado ou contexto.

## Reaproveitar respostas confirmadas no MVP

Quando o backlog vier de uma milestone derivada de `MVP.md`, faça isto antes
da primeira pergunta:

1. leia `specs/milestones/M01.md` e a seção `Registros confirmados no MVP` do
   backlog; abra também o `MVP.md` original quando o caminho registrado
   estiver disponível;
2. extraia cada declaração que responde problema, pessoa, resultado, escopo,
   jornada, regra, dado, integração, limite ou critério de aceite;
3. converta a declaração em resposta normalizada no campo aplicável do backlog
   e mantenha o trecho e o caminho de origem como proveniência;
4. trate como respondida a questão cuja resposta esteja expressa no MVP, mesmo
   sem o mesmo rótulo da pergunta;
5. pergunte somente por lacuna real, ambiguidade relevante ou contradição entre
   o MVP, as fontes relacionadas e a conversa atual.

Não peça confirmação, escolha ou reformulação para uma resposta que o MVP já
declara. Uma síntese curta pode informar o que foi reaproveitado, sem abrir
nova rodada. Se uma leitura razoável admitir mais de um significado, apresente
apenas essa ambiguidade e cite os trechos que a provocam.

Um `Default aplicado automaticamente` registrado pela importação conta como
confirmado quando a base indicada for explícita ou inequívoca. Se uma pergunta
tiver uma única opção compatível com o MVP, aplique-a, registre a normalização
e siga para a próxima lacuna. Mostre opções apenas diante de escolha real, mais
de uma interpretação compatível ou sugestão que a fonte não permita confirmar.

## Garantir a captura mínima

1. Preserve a formulação original recebida na conversa ou em
   `specs/inbox/<data-hora>-<slug>.md`. Separe declaração, inferência e aberto.
2. Confirme se o contexto esclarece:
   - problema percebido;
   - pessoa afetada ou beneficiada;
   - resultado ou valor esperado;
   - contexto suficiente para distinguir a entrada de pedidos semelhantes.
3. Se algo estiver ausente, vago, contraditório ou ambíguo, escolha a lacuna
   real de maior impacto e monte exatamente uma pergunta numerada por rodada.
4. Reavalie as lacunas depois de cada resposta. Não transforme os itens em
   questionário fixo nem repita informação já fornecida.
5. Não crie nem atualize o arquivo enquanto algum item essencial continuar
   ausente ou ambíguo. Se a pessoa não souber responder, explique a lacuna sem
   inventar conteúdo.

A captura mínima não exige solução técnica, critérios completos de aceitação
nem prioridade; esses dados amadurecem no aprofundamento.

## Criar ou atualizar o item

1. Se a pessoa quiser apenas explorar sem registrar, converse e confirme antes
   de escrever.
2. Se existir item correspondente, atualize-o sem mudar o ID e preserve a
   formulação anterior.
3. Se a origem for `specs/inbox/`, registre esse caminho em
   `Referências relacionadas`. A captura continua na fila ativa até a
   validação da spec derivada, então não a altere, mova nem apague.
4. Para criar um item novo, execute:

   ```bash
   node <diretório-da-skill>/scripts/iniciar_backlog.mjs \
     --title "<título curto>" \
     --idea "<formulação original>" \
     --problem "<problema percebido>" \
     --person "<pessoa afetada ou beneficiada>" \
     --result "<resultado ou valor esperado>" \
     --context "<contexto que distingue a ideia>" \
     [--slug <slug>] [--root <raiz>]
   ```

5. Use o caminho absoluto impresso pelo script. Ele prefere
   `.specsfy/templates/custom/Backlog.md` e recorre a
   `.specsfy/templates/Backlog.md`.

## Organizar e priorizar

Leia `references/backlog-quality.md` ao estruturar, refinar, priorizar ou
avaliar prontidão.

- Classifique, quando conhecido, em Produto → Épico → Funcionalidade → item.
- Use tipos como épico, história, regra, técnico e melhoria sem confundir tipo
  com prioridade.
- Ordene por valor, risco, dependências, urgência, esforço, desbloqueios e
  incerteza. Prioridade alta em tudo deixa de informar.
- Aprofunde os campos conforme risco e complexidade. Autenticação, pagamentos,
  permissões, privacidade e operações assíncronas pedem mais cuidado.
- Prefira comportamento observável a solução de interface.
- Torne atributos de qualidade mensuráveis quando forem materiais.
- Use listas, fluxos, cenários ou matrizes quando reduzirem ambiguidade.

## Aprofundar para a especificação

Quando a pessoa pedir aprofundamento, promoção ou criação de uma spec:

1. Leia a entrada de `specs/inbox/`, o item de `specs/backlog/` ou a spec
   indicada. Se houver mais de um candidato, pergunte qual aprofundar.
2. Resuma em uma frase o problema, a pessoa e o resultado percebido.
3. Separe o que está decidido do que pode mudar escopo, experiência,
   segurança, dados, testes ou arquitetura.
4. Leia `references/discovery-map.md` para escolher perguntas relevantes, sem
   percorrer o mapa mecanicamente.
5. Leia `../specsfy-03-specify/references/mcr-10.md` e faça a análise
   categorial silenciosamente antes da primeira pergunta.
6. Leia `references/specialists.md` somente quando tecnologia ou disciplina
   exigir contexto adicional.

### Área Interface

Quando a entrega tiver interface para pessoas, leia o `Contrato de
experiência de interface` de `.specsfy/Spec.md` e trate `Interface` como área
própria da descoberta. Pedido de criar ou alterar tela, dashboard, lista,
formulário, fluxo visual ou CRUD ativa essa área, mesmo que a pessoa não use a
palavra “interface”.

1. Antes da pergunta, leia a stack e as telas existentes indicadas pelo
   contrato central. Em sistema existente, percorra a área afetada e registre
   navegação, componentes, conteúdo, permissões e estados que a nova entrega
   preserva ou altera. Ofereça opções compatíveis com isso em vez de sugerir
   uma biblioteca nova por padrão.
2. Pergunte sobre telas, fluxo de informação, menus e navegação principal,
   formulário, padrão de ação como painel lateral ou modal e composição. Não
   escolha o padrão no lugar da pessoa quando houver alternativas reais.
3. Carregue `$specsfy-specialist-interface-experience` antes de fechar essa
   área; ele coordena a análise do sistema atual e os especialistas seguintes.
   Carregue `$specsfy-specialist-ux-design` antes de fechar a jornada e
   `$specsfy-specialist-ui-design` antes de fechar a composição.
4. Quando a stack React e Tailwind usar ReUI, todo CRUD declarado na
   descoberta deve registrar Data Grid ou List, Filters, Form, Dialog ou Sheet
   e os estados ReUI aplicáveis; carregue `$specsfy-specialist-reui` antes de
   fechar a área.

## Conduzir a descoberta adaptativa

Execute um ciclo com no máximo oito perguntas por área:

1. Antes de cada rodada, releia a entrada, as decisões confirmadas, o
   contexto acumulado e as novas respostas, junto dos registros do MVP.
2. Reclassifique lacunas e dependências. Continue enquanto existir lacuna
   aplicável e restarem perguntas no limite; encerre quando cada uma estiver
   decidida, não aplicável ou resolvida por evidência.
3. Escolha a lacuna real com maior `impacto × incerteza` e apresente a rodada
   conforme o contrato central.
4. Registre a resposta original, a decisão normalizada e seus efeitos. Volte
   ao primeiro passo em vez de seguir uma fila fixa.

Ao alcançar oito perguntas, apresente síntese, registre as lacunas abertas e
pare. Reabra o ciclo somente quando a pessoa pedir explicitamente mais
perguntas e informar quantas quer responder.

Inclua `Avançar` em cada pergunta desde a primeira rodada. Se a pessoa
escolher essa opção:

- na rodada seguinte, confirme se ela encerra definitivamente as perguntas
  daquela área, responde depois ou volta a responder agora;
- faça a confirmação como a única pergunta numerada da rodada;
- ao encerrar, registre `Área encerrada pelo usuário: <área>` e não pergunte
  novamente, salvo reabertura explícita;
- ao adiar, registre `Área adiada pelo usuário: <área>` e preserve os pontos
  não respondidos para retomada;
- não preencha respostas por inferência;
- permita o handoff solicitado, mantendo `Status: Draft` e
  `Definition Gate: Pending` quando restarem lacunas aplicáveis.

Durante a conversa:

- ofereça pelo menos três opções numeradas quando reduzirem o esforço e
  recomende uma com justificativa curta;
- aceite respostas livres e use-as na reanálise;
- preserve termos originais e diferencie declaração, inferência, hipótese,
  decisão, conflito e aberto;
- confirme a intenção operacional por síntese;
- não recite as dez categorias nem transforme cada uma em pergunta.

A cobertura final precisa bastar para problema, atores, resultado, escopo,
jornadas, falhas, limites, regras, dados, segurança, privacidade, desempenho,
acessibilidade, restrições existentes e sinais objetivos de aceite e sucesso.

Para interface usada por pessoas, cubra também telas, navegação, fluxo de
informação, menus e navegação principal, campos e validações do formulário,
padrão de abertura de cada ação, disposição dos elementos, estados e uso por
teclado. Registre as respostas textuais e a stack observada no backlog, para
que a spec não reduza um CRUD a endpoints nem troque a tecnologia usada pelo
projeto.

Quando a jornada depender de informações guardadas, consultadas,
compartilhadas ou apagadas, anuncie a transição automática para
`$specsfy-data-discovery` antes de declarar o brief pronto. Retome o backlog
com o registro confirmado em `.specsfy/DATABASE.md` como contexto, sem
converter a conversa em desenho técnico.

## Manter o item

Use exatamente `specs/backlog/<NNNN>-<slug>.md` com o `Status` da fase:

| Status | Quando |
| --- | --- |
| `Status: Captured` | item apenas registrado |
| `Status: Refining` | refinamento ou descoberta em curso |
| `Status: Ready for specification` | brief suficiente |
| `Status: Promoted` | spec derivada já existe |

Mantenha as metainformações na tabela abaixo do título. Não invente
prioridade, prazo, stakeholder, solução ou evidência. `Pronto para
desenvolvimento` é diagnóstico, não autorização de implementação.

## Encerrar

Apresente um `Brief pronto para especificar` com:

1. Problema e objetivo.
2. Atores.
3. Escopo e fora de escopo.
4. Jornadas e regras essenciais.
5. Critérios de aceite em Given/When/Then.
6. Restrições técnicas e de qualidade.
7. Suposições.
8. Decisões abertas ou `Nenhuma lacuna aplicável`.
9. Vocabulário ambíguo e inferências confirmadas.

Atualize o item de backlog quando a pessoa autorizar esse registro. Com o
brief suficiente ou a escolha de `avançar`:

- se a etapa foi chamada por mudança tardia em spec aprovada, retorne
  automaticamente para `$specsfy-update-spec`;
- para criar ou consolidar a definição inicial, chame `$specsfy-03-specify`.

No caso de `avançar`, entregue brief parcial e informe as lacunas que impedem
o Definition Gate.

## Limites

- Não alterar, mover nem apagar entradas de Inbox. Virar backlog não retira a
  captura da fila ativa.
- Não criar `spec.md`, tarefas, research, testes ou código.
- Não inventar stakeholders, integrações, restrições ou decisões.
- Não transformar hipótese técnica em requisito.
- Não mover nem apagar item existente sem confirmação.
