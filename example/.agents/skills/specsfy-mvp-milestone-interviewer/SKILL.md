---
name: specsfy-mvp-milestone-interviewer
description: Importe requisitos de desenvolvimento do MVP para a milestone 1.0, backlogs e specs Draft, preservando contexto de negócio somente na fonte.
---

# Explorar o MVP com requisitos de desenvolvimento

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

Esta skill é a orquestradora da entrada do MVP. Ela importa `MVP.md` como a
milestone 1.0, seleciona somente requisitos de desenvolvimento e cria um
backlog candidato para cada requisito selecionado. Contexto de negócio
permanece no arquivo de origem. Em seguida, carrega as skills responsáveis
para entrevistar cada backlog e somente avança quando cada etapa tiver
resultado confirmado.

## Carregar o contexto disponível

1. Resolva a raiz do projeto consumidor antes de ler qualquer arquivo. Se ela
   for um submódulo Git, descubra o superprojeto com
   `git -C <raiz> rev-parse --show-superproject-working-tree`. A saída não
   vazia acrescenta somente essa raiz pai à busca. Não percorra outros pais.
2. Leia `MVP.md` se existir como arquivo regular na raiz do consumidor. Quando
   ele estiver ausente e a raiz for um submódulo, leia `MVP.md` no
   superprojeto. O arquivo local tem prioridade. Preserve a fonte consultada e
   use-a como contexto declarado, sem substituir o que a pessoa disser.
3. Antes da primeira pergunta, execute uma única vez o importador:

   ```bash
   node \
     .agents/skills/specsfy-mvp-milestone-interviewer/scripts/importar_mvp.mjs \
     --root <raiz>
   ```

   O importador cria `specs/milestones/M01.md` a partir de `MVP.md` e só cria
   backlog e spec para temas classificáveis como entregas de software
   desenvolvíveis. Visão, público, princípios, contexto, métricas e outros
   registros sem comportamento a construir permanecem exclusivamente em
   `MVP.md`; não crie Inbox para eles nem os copie para a milestone.
   Antes de escrever os arquivos de desenvolvimento, ele aplica defaults
   somente quando encontra um rótulo explícito ou uma formulação inequívoca no
   trecho, como `Problema`,
   `Público`, `Resultado`, `Contexto` ou uma frase objetiva de capacidade.
   Registre esses defaults no backlog e no JSON de saída com sua base. Quando
   o trecho não sustentar uma resposta, preserve a lacuna em vez
   de criar um valor plausível. Cada backlog preserva um bloco de registros do
   trecho importado. O backlog fica `Captured` durante a criação, recebe a
   spec Draft ao final e passa a apontar para ela como `Promoted`; a spec
   mantém `Definition Gate: Pending`. Se `M01.md` existir, não sobrescreva
   nenhum arquivo e informe a pessoa responsável.
4. Leia `BRAND.md` seguindo a mesma ordem: raiz do consumidor e, somente como
   fallback de submódulo, superprojeto. Use-o para manter linguagem, público,
   proposta e limites de marca coerentes durante as perguntas. Não copie seu
   conteúdo para os artefatos derivados.
5. Registre `MVP.md` como fonte em cada backlog criado pelo importador. Não
   crie, mova nem altere arquivos de contexto.
6. Leia `PROJECT.md`, Inboxes, backlog e specs existentes apenas se ajudarem a
   evitar repetição ou contradição. Eles continuam separados da formulação
   recebida nesta sessão.
7. Trate o JSON retornado pelo importador como a fila ordenada de backlogs da
   sessão. Cada item terá `title`, `backlog` e `spec`. Temas contextuais não
   entram na fila porque permanecem somente em `MVP.md`.

Antes da importação, faça a mesma triagem de dados sensíveis usada pela Inbox.
Se a fonte tiver credencial, token, chave privada ou dado pessoal sensível,
não gere a milestone nem reproduza o valor em mensagens.

## Preservar a sessão

1. Derive uma identificação estável no formato `DESC-AAAAMMDD-<slug>` a partir
   do primeiro tema recebido.
2. Depois de cada resposta da pessoa, capture o conteúdo semântico em outra
   Inbox com a mesma sessão e o próximo turno. Quando ela responder somente
   `1`, `2` ou `3`, substitua o número pelo texto integral da opção escolhida
   antes de montar `--input`, `--summary`, `--signals` e os demais campos. A
   entrada literal pode constar na rastreabilidade da interação, mas não pode
   ser usada como contexto da milestone. Nunca edite, reúna ou substitua uma
   captura anterior. Uma Inbox também registra cada hipótese de milestone
   apresentada para confirmação.
3. Informe `--sources` em toda chamada: liste o caminho de `MVP.md` e
   `BRAND.md` consultados, inclusive quando vierem do superprojeto, ou indique
   que estavam ausentes.
4. Aplique a triagem de dados sensíveis do `$specsfy-01-inbox` antes de cada
   escrita. Se ela impedir a captura, interrompa a conversa até receber texto
   seguro para registrar.
5. Escreva em Português do Brasil a análise, a síntese, os metadados e qualquer
   milestone gerada. Se a fonte ou a resposta literal estiver em outro idioma,
   preserve-a apenas como citação e registre sua interpretação em Português do
   Brasil.

Use o script da Inbox com os campos da captura e acrescente a sessão:

```bash
node .agents/skills/specsfy-01-inbox/scripts/capturar_inbox.mjs \
  --input "<texto integral da pessoa>" \
  --title "<tema da descoberta>" \
  --session "DESC-AAAAMMDD-<slug>" \
  --turn "<número sequencial>" \
  --sources "<situação de MVP.md e BRAND.md>" \
    [campos de análise da Inbox] [--root <raiz>]
```

## Resolver defaults antes de perguntar

Depois da importação, trate cada tema com esta ordem:

1. Releia o trecho original, os `Defaults aplicados automaticamente`, o
   backlog e a milestone `M01`.
2. Mantenha como resposta confirmada todo campo preenchido por declaração
   explícita do MVP ou por formulação inequívoca registrada pelo importador.
3. Se existir somente uma opção materialmente compatível com o MVP, aplique-a
   como default óbvio e registre a formulação normalizada e a fonte. Não peça
   confirmação para uma resposta que já está clara.
4. Se houver mais de uma leitura razoável, conflito entre fontes ou ausência de
   informação, não escolha em silêncio. Transforme somente esse ponto na
   próxima pergunta numerada, com a sugestão mais compatível primeiro.
5. Depois de cada resposta, reavalie todos os campos. Não repita pergunta já
   respondida nem abra uma pergunta para confirmar um default sustentado.

A pergunta só aparece quando o MVP não responde, quando a resposta exige uma
escolha real ou quando há ambiguidade ou contradição. O resultado da importação
deve deixar claro o que foi resolvido automaticamente e o que ainda precisa da
pessoa.

## Filtrar o que será desenvolvido

Antes de carregar `$specsfy-02-backlog`, classifique o tema:

1. `Desenvolvível`: descreve uma capacidade, tela, fluxo, integração, dado,
   automação, regra executável ou comportamento do sistema. Crie backlog e
   spec Draft.
2. `Contextual`: descreve visão, público, posicionamento, princípio, problema,
   métrica, premissa, contexto ou limite sem declarar uma entrega de software.
   Preserve-o em `MVP.md`; não crie Inbox, backlog ou spec.
3. Se houver dúvida entre os dois, só classifique como desenvolvível quando o
   próprio trecho trouxer verbo ou objeto de construção verificável, como
   `desenvolver`, `implementar`, `criar`, `permitir`, `cadastrar`, `consultar`
   ou `integrar`. Caso contrário, mantenha o tema contextual e registre o
   motivo.

Não transforme uma descrição de produto em backlog apenas porque ela pode
ajudar uma futura implementação. O backlog representa uma entrega que será
desenvolvida nesta importação.

## Orquestrar as skills da descoberta

Para cada item da fila retornada pelo importador, execute esta sequência sem
pular responsabilidades:

1. Anuncie `Transição automática: $specsfy-mvp-milestone-interviewer para
   $specsfy-02-backlog; motivo: entrevistar o backlog derivado do MVP;
   resultado esperado: backlog refinado com respostas confirmadas` e carregue
   `$specsfy-02-backlog` para o caminho do backlog candidato.
2. Leia primeiro os registros do MVP que acompanham esse backlog e use-os para
   preencher respostas já declaradas. Faça entrevista adaptativa somente para
   lacunas, ambiguidades ou contradições restantes. Preserve uma pergunta por
   rodada, resolva escolhas numéricas no texto da opção e respeite o limite de
   oito perguntas por área.
3. Se o backlog ou a entrevista indicar informação a guardar ausente ou ambígua,
   anuncie a transição para `$specsfy-data-discovery`, conclua a entrevista de
   dados e retome o backlog com `.specsfy/DATABASE.md` como contexto.
4. Após cada backlog, retome esta skill, registre a situação do item na síntese
   da sessão e prossiga para o próximo backlog da fila. Como esta skill foi
   chamada para importar o MVP, carregue `$specsfy-03-specify` ao terminar o
   refinamento automático de cada backlog e crie uma spec Draft baseada nele.
   A seção 10 deve manter a área de menus e navegação principal: use o que o
   MVP declarar e marque `Pendente` quando essa informação não existir. Não
   implemente código, não execute tarefas e não promova o Definition Gate.
5. Quando a fila terminar, confirme que cada tema desenvolvível possui backlog
   e spec Draft e que nenhum tema contextual gerou artefato no Specsfy.
   Execute `specsfy milestones sync --project <raiz>` e carregue
   `$specsfy-milestone-governor` para conferir vínculos e progresso de `M01`.
   A geração automática de Drafts não autoriza implementação nem validação
   final.

## Conduzir uma conversa adaptativa

1. Comece por finalidade, pessoa atendida e problema observável.
2. Releia todas as Inboxes da sessão depois de cada captura. Mostre uma síntese
   curta que separe formulação recebida e hipótese da conversa.
3. Monte a rodada conforme o contrato central: uma pergunta numerada, opções
   específicas, `Escrever outra resposta` e `Avançar`.
4. Explore apenas o necessário para entender jornada, dados indispensáveis,
   papéis, regras, integrações, limites, demonstração e validação. Para cada
   informação a guardar não clara, carregue `$specsfy-data-discovery` e conclua
   essa descoberta antes de tratar o próximo ponto. Não aplique formulário
   fixo nem repita uma resposta já preservada.
5. Quando a pessoa encerrar ou adiar uma área, capture a formulação dela e
   indique a Inbox correspondente na síntese. Não preencha lacunas por conta
   própria.

## Encerrar e tratar depois

Ao encerrar, informe a identificação da sessão, `M01`, a lista ordenada de
backlogs e specs Draft geradas, as respostas confirmadas e os pontos marcados
como `Pendente`. Informe também que os demais temas continuam no `MVP.md`. A
geração de specs encerra a importação; implementação, validação final e
promoção de gate ficam para outra etapa autorizada.

## Limites

- Não invente respostas, objetivo, condição de saída, fora de escopo ou
  vínculos de uma milestone.
- Não sobrescreva a milestone 1.0 ou backlogs existentes.
- Não pule a entrevista de nenhum backlog gerado pelo importador.
- Não implemente código durante a importação nem marque um gate como Passed.
- Não trate Inbox como fonte normativa.
- Não use o entrevistador de roadmap para ampliar o MVP sem confirmação.
