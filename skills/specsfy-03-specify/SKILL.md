---
name: specsfy-03-specify
description: "Use quando o usuário pede para promover uma entrada ou backlog já refinado, criar, iniciar ou consolidar uma especificação nova ou ainda em Draft em `spec.md`. Use também quando uma transição automática exigir criar ou completar a fonte normativa inicial. Inicializa specs em `specs/draft/` e aplica o MCR-10; para mudar spec aprovada use specsfy-update-spec, para captura sem perguntas use specsfy-01-inbox, para refinamento use specsfy-02-backlog e para revisão sem edição use specsfy-04-validate."
---

# Montar a especificação única

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

Crie ou atualize o pacote `specs/draft/<NNNN>-<slug>/`, no qual `spec.md` é a única fonte normativa de todo o fluxo SDD. Somente o diretório recebe o número; mantenha o arquivo sempre como `spec.md`. Consolide descoberta, research, esclarecimentos, produto, plano técnico, modelo de dados, contratos, TDD, BDD, validações, tarefas, decisões e conclusão em três atos explícitos. Evidências externas consultadas vivem em `research/`; não gere `plan.md`, `research.md`, `data-model.md`, `tasks.md`, checklists ou uma segunda especificação.

Antes de consolidar uma spec Laravel, leia `.specsfy/PACKAGES.md`,
`docs/packages/README.md` e as fichas de `docs/packages/`. Se a solicitação
trouxer uma URL GitHub de pacote ou depender de uma biblioteca Composer,
carregue `$specsfy-specialist-laravel-package-manager` para conferir se o
pacote já existe e registrar a necessidade sem duplicar dependências.

## Orquestrar a conversa

Ao concluir esta etapa ou detectar trabalho de outra etapa, anuncie
`Pendência detectada: <descrição> — ação: resolvendo nesta etapa` e resolva-a
quando pertencer ao próprio escopo. Quando houver troca de responsabilidade,
anuncie `Transição automática: $specsfy-03-specify → $<destino> — motivo:
<motivo> — resultado esperado: <resultado>` e carregue imediatamente a skill de
destino, sem pedir confirmação nem repetir o comando. Continue na mesma
conversa. Depois de uma correção necessária a esta etapa, anuncie `Retomada
automática: $<destino> → $specsfy-03-specify — pendência resolvida:
<resultado>` e retome-a imediatamente. Reavalie o estado após cada handoff para
evitar ciclos. Não peça confirmação para o handoff; ações sensíveis continuam
exigindo autorização específica.

## Preparar

1. Resolva a raiz do projeto pelo diretório informado pelo usuário ou por
   `Path.cwd()` quando ele não informar outro. Não procure nem promova o destino
   para uma raiz Git.
2. Ao criar uma spec, resolva o diretório desta skill e execute antes de
   escrever:

```bash
node <diretório-da-skill>/scripts/iniciar_spec.mjs \
  --title "<nome da especificação>" [--slug <slug>] [--root <raiz>]
```

3. Use o caminho absoluto impresso pelo script. Ele aloca o próximo ID local,
   prefere `.specsfy/templates/custom/Spec.md`, recorre ao template gerenciado
   `.specsfy/templates/Spec.md` e cria somente
   `specs/draft/<NNNN>-<slug>/spec.md`; nunca renomeie o arquivo para incluir o ID.
   Ao desenvolver este repositório, o script usa `skills/templates/Spec.md` como
   fallback; no projeto consumidor, template ausente exige `specsfy install`.
4. Ao atualizar, use o caminho da spec existente fornecido ou descoberto sob a
   raiz atual; não execute o inicializador novamente.
5. Leia a captura de origem em `specs/inbox/`, o item de backlog, o brief da
   refinamento do backlog, o pedido atual, a spec nesse caminho, seu `research/` e arquivos
   do repositório que revelem restrições reais.
6. Se não houver informação suficiente para identificar problema, ator e
   resultado, anuncie a pendência e carregue `$specsfy-02-backlog` para executar o ciclo.
   Retome esta skill ao final do ciclo e use o brief completo
   ou parcial produzido.
7. Leia `references/mcr-10.md` ao receber relato, história, transcrição ou
   especificação a refinar.
8. Leia `.specsfy/DATABASE.md` quando existir. Se a jornada depender de
   informações guardadas e o arquivo não explicar o que o produto precisa
   lembrar, quem usa essas informações ou quando elas deixam de ser
   necessárias, carregue `$specsfy-data-discovery` e retome esta skill depois
   do registro confirmado.

## Aplicar o MCR-10

1. Preserve a formulação original e identifique finalidade, ator e resultado.
2. Analise termos ambíguos, equivalências terminológicas e derivações.
3. Use substância, quantidade, qualidade, relação, lugar, tempo, posição, posse,
   ação e afecção como lentes adaptativas, não como questionário.
4. Distinga cada declaração da pessoa de inferência, hipótese, decisão, conflito
   ou questão aberta produzida durante a análise.
5. Se existir lacuna aplicável, carregue `$specsfy-02-backlog` para executar o
   ciclo limitado a oito perguntas por área e retome esta skill ao final do
   ciclo. Se a pessoa
   escolher `avançar`, aplique a confirmação e o registro definidos no contrato
   central. Mantenha `Status: Draft` e `Definition Gate: Pending` quando
   restarem pontos aplicáveis; não promova a spec a `Defined` e não reabra o
   mesmo ciclo nesta retomada.
6. Recombine decisões em afirmações com sujeito, condição, ação e efeito
   observável; derive regras, histórias, Gherkin, limites e falhas.
7. Registre o resultado nas seções existentes de `spec.md`; não gere relatório
   MCR separado nem copie a referência para o pacote da fatia.

## Escrever

- Grave sempre em `<raiz>/specs/draft/<NNNN>-<slug>/spec.md`; o ID pertence ao
  diretório e o arquivo permanece exatamente `spec.md`.
- Use `<raiz>/specs/draft/<NNNN>-<slug>/research/` somente para cópias, snapshots, contratos, schemas, exemplos e notas de proveniência realmente consultados. Não coloque código de produção, testes ou documentos normativos nesse diretório.
- Ao pesquisar uma API ou documentação externa, armazene a evidência permitida em `research/` e indexe caminho, origem, versão/data, licença e impacto em `Artefatos de pesquisa armazenados`. Se licença ou termos impedirem a cópia, armazene metadados, URL, data de acesso, checksum/versão quando disponível e notas próprias, sem reproduzir conteúdo protegido.
- Fora de `spec.md` e `research/`, não crie outra entrada no pacote da feature.
- Ao promover `specs/backlog/<NNNN>-<slug>.md`, registre esse caminho na spec e
  atualize o item para `Status: Promoted` com o caminho da spec criada. O backlog
  preserva proveniência, mas deixa de governar o comportamento.
- Ao derivar diretamente de `specs/inbox/<data-hora>-<slug>.md`, registre o
  caminho na spec e preserve a captura sem alteração. A análise inicial é
  contexto, não requisito confirmado. A captura continua em `specs/inbox/`
  enquanto a spec estiver em Draft; ela só passa para `specs/inbox/processed/`
  quando `$specsfy-04-validate` aprovar o Definition Gate e confirmar que as
  specs cobrem o pedido inteiro.
- Preserve o cabeçalho como uma tabela Markdown de duas colunas, `Campo` e
  `Valor`; não converta seus metadados em linhas `**Campo**: valor`.
- Na tabela, declare `ID` como `SPEC-NNNN` e `Slug` como
  `<NNNN>-<slug>` e mantenha o slug igual ao diretório pai.
- Preserve exatamente os três atos e as 18 seções do template resolvido:
  `.specsfy/templates/custom/Spec.md` quando existir ou
  `.specsfy/templates/Spec.md` caso contrário.
- Substitua o conteúdo editorial restante do modelo durante o refinamento; não
  deixe seus exemplos ou placeholders na spec promovida para `Defined`.
- Ao atualizar, edite o arquivo existente e preserve IDs e decisões ainda válidas.
- Numere novos itens sem reutilizar ou renumerar IDs removidos:
  - histórias: `US-001`;
  - requisitos funcionais: `FR-001`;
  - requisitos não funcionais: `NFR-001`;
  - cenários de aceite: `AC-001`;
  - decisões: `DEC-001`.
- Escreva cada requisito como comportamento verificável.
- Escreva cada cenário com Given/When/Then e associe-o a pelo menos um requisito.
- Defina no mínimo três `AC` distintos para a feature inteira e para cada
  `US`, `FR` e `NFR`. Conte cobertura somente quando o `AC` declarar o ID em
  `**Cobre**`; use caminho feliz, variação/regra crítica e falha ou limite
  material para ampliar contexto sem duplicar cenários equivalentes.
- Inclua fora de escopo, erros, limites, segurança e acessibilidade quando relevantes.
- Quando o cabeçalho declarar `Interface para pessoas: Sim`, preencha na seção
  10 as nove partes do template com stack e convenções locais, telas, fluxo de
  informação, menus e navegação principal, formulários e ações, composição,
  blocos React e componentes shadcn/ui/ReUI, estados e acessibilidade. Use
  `INTERFACE.md`, `.specsfy/STACK.md`, manifests, telas e código existente como fonte da stack
  e do sistema atual; registre o que será preservado e alterado. Não proponha
  biblioteca incompatível nem reestruture uma tela existente sem esse exame.
  Carregue
  `$specsfy-specialist-ux-design`, `$specsfy-specialist-ui-design` e o
  especialista da stack de interface. Não aceite uma descrição de CRUD que
  tenha somente API, banco ou serviço.
  Em Laravel com React, registre explicitamente shadcn/ui e ReUI, todos os
  blocos React previstos, suas responsabilidades, arquivos, componentes de
  origem e regra de reuso. A página apenas compõe esses blocos.
- Quando não houver interface, declare `Interface para pessoas: Não` e explique
  por que a entrega não será usada por uma pessoa em uma tela.
- Mantenha a seção técnica concreta o bastante para permitir tarefas com caminhos de arquivo, sem confundir escolha interna com resultado do usuário.
- Registre defaults reversíveis em `Suposições`; peça esclarecimento apenas quando opções plausíveis mudarem materialmente escopo, dados, segurança, UX ou testes.
- Não deixe placeholders, exemplos do template, `TBD`, `TODO` ou marcadores de clarificação em um arquivo marcado como `Defined`.
- Mantenha tarefas futuras na seção `14. Tarefas`; skills posteriores atualizam a mesma seção, nunca outro arquivo.
- Use os metadados `Definition Gate`, `Plan Gate` e `Delivery Gate` para expressar prontidão sem criar relatórios separados.

## Respeitar specs já aprovadas

Se a spec já obteve `Definition Gate: Passed` e a pessoa pedir para adicionar,
remover, corrigir ou mudar algo, anuncie a pendência e carregue automaticamente
`$specsfy-update-spec`. Essa skill classifica o impacto, atualiza a fonte
normativa e invalida somente os gates afetados. Retome esta skill apenas se a
mudança retornar a spec ao estado de definição inicial.

## Preservar rastreabilidade

Para cada `FR` e `NFR`, aponte no mínimo três cenários `AC` e mantenha o método
de verificação explícito dos NFRs. Para cada história, identifique os requisitos
que entregam seu valor e ao menos três `AC`. Use os mesmos IDs mais tarde nos
casos TDD e na seção 14.

## Controlar research

- Antes do planejamento, carregue somente as evidências indexadas e valide
  claims com:

```bash
node .agents/skills/specsfy-03-specify/scripts/load_research.mjs \
  specs/<estado>/<NNNN>-<slug>/spec.md
```

- Para pesquisa material, registre `R-ID`, criticalidade, claim, veredito,
  confiança, evidência local e orçamento na seção 2. Claim `critical` ainda não
  verificado bloqueia o handoff; claim refutado permanece registrado. IDs devem
  ser únicos, gasto não pode superar o limite e a âncora Markdown citada precisa
  existir no arquivo local.
## Autovalidar

Enquanto o arquivo estiver em Draft, execute a validação estrutural intermediária:

```bash
node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/<estado>/<NNNN>-<slug>/spec.md --allow-draft
```

Corrija falhas estruturais em no máximo três ciclos. A skill `specsfy-04-validate` faz a revisão semântica, registra o resultado na seção 13 e promove `Definition Gate: Passed` e `Status: Defined`. Até lá, mantenha `Status: Draft`, `Definition Gate: Pending` e relate decisões bloqueantes.

## Relatar

Informe:

- caminho `specs/<estado>/<NNNN>-<slug>/spec.md`;
- caminhos de research armazenados ou a declaração de que não houve fonte externa;
- status;
- contagem de `US`, `FR`, `NFR` e `AC`;
- suposições relevantes;
- transição automática para `$specsfy-04-validate`, com motivo e resultado
  esperado.

## Especialistas sob demanda

Leia [references/specialists.md](references/specialists.md) quando requisitos,
NFRs, dados ou decisões técnicas exigirem conhecimento especializado. Registre
o requisito na spec e proponha carregar o especialista. Se ele não estiver
instalado, peça autorização específica antes de instalar.
