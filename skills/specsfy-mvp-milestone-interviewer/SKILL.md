---
name: specsfy-mvp-milestone-interviewer
description: Importa MVP.md como a milestone 1.0, cria backlog e spec Draft somente para requisitos de desenvolvimento, mantém o contexto de negócio apenas na fonte e orquestra a entrevista de cada backlog importado. Use quando o projeto tiver um MVP.md a transformar em M01, backlogs e specs Draft. Não use para evolução depois do MVP aceito (specsfy-roadmap-milestone-interviewer), para conferir vínculos de marcos (specsfy-milestone-governor), para implementar ou para aprovar gates.
---

# Explorar o MVP com requisitos de desenvolvimento

Esta skill orquestra a entrada do MVP. Ela importa `MVP.md` como a milestone
1.0, seleciona somente requisitos de desenvolvimento e cria um backlog
candidato para cada um. O contexto de negócio permanece no arquivo de origem.
Em seguida, carrega as skills responsáveis para entrevistar cada backlog e
somente avança quando cada etapa tiver resultado confirmado.

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

- `specs/milestones/M01.md` existe e nenhum arquivo preexistente foi
  sobrescrito.
- Cada tema desenvolvível tem backlog refinado e spec Draft com
  `Definition Gate: Pending`.
- Nenhum tema contextual gerou backlog, spec ou Inbox.
- `specsfy milestones sync --project <raiz>` rodou e
  `$specsfy-milestone-governor` conferiu os vínculos de `M01`.
- O relato final lista sessão, backlogs, specs, respostas confirmadas e pontos
  `Pendente`.

## Carregar o contexto disponível

1. **Resolver a raiz.** Antes de ler qualquer arquivo, resolva a raiz do
   projeto consumidor. Se ela for um submódulo Git, descubra o superprojeto com
   `git -C <raiz> rev-parse --show-superproject-working-tree`. Saída não vazia
   acrescenta somente essa raiz pai à busca; outros pais ficam fora.
2. **Localizar as fontes.** Procure `MVP.md` e `BRAND.md` como arquivos
   regulares na raiz do consumidor e, só se ausentes e a raiz for submódulo,
   no superprojeto. O arquivo local tem prioridade. Essas leituras podem ser
   feitas em paralelo. `MVP.md` é contexto declarado e não substitui o que a
   pessoa disser. `BRAND.md` mantém linguagem, público, proposta e limites de
   marca coerentes nas perguntas, sem ser copiado para artefatos derivados.
3. **Triar dados sensíveis.** Aplique a mesma triagem da Inbox. Se a fonte
   tiver credencial, token, chave privada ou dado pessoal sensível, não gere a
   milestone nem reproduza o valor em mensagens.
4. **Importar uma única vez,** antes da primeira pergunta:

   ```bash
   node \
     .agents/skills/specsfy-mvp-milestone-interviewer/scripts/importar_mvp.mjs \
     --root <raiz>
   ```

5. **Ler o resultado.** Trate o JSON retornado como a fila ordenada de
   backlogs da sessão; cada item traz `title`, `backlog` e `spec`. Leia
   `PROJECT.md`, Inboxes, backlog e specs existentes só quando ajudarem a
   evitar repetição ou contradição. Não crie, mova nem altere arquivos de
   contexto.

### O que o importador faz

- Cria `specs/milestones/M01.md` a partir de `MVP.md`. Se `M01.md` já existir,
  não sobrescreve nenhum arquivo; informe a pessoa responsável.
- Cria backlog e spec somente para temas classificáveis como entregas de
  software desenvolvíveis. Visão, público, princípios, contexto, métricas e
  outros registros sem comportamento a construir permanecem só em `MVP.md`,
  sem Inbox e sem cópia para a milestone.
- Aplica defaults apenas diante de rótulo explícito ou formulação inequívoca no
  trecho, como `Problema`, `Público`, `Resultado`, `Contexto` ou uma frase
  objetiva de capacidade, e registra cada default com sua base no backlog e no
  JSON. Sem sustentação no trecho, preserva a lacuna em vez de criar valor
  plausível.
- Cada backlog guarda um bloco de registros do trecho importado e cita
  `MVP.md` como fonte. O backlog nasce `Captured`, recebe a spec Draft ao final
  e passa a apontar para ela como `Promoted`; a spec mantém
  `Definition Gate: Pending`.

## Filtrar o que será desenvolvido

Antes de carregar `$specsfy-02-backlog`, classifique o tema:

| Classe | Quando | Resultado |
| --- | --- | --- |
| `Desenvolvível` | descreve capacidade, tela, fluxo, integração, dado, automação, regra executável ou comportamento do sistema | backlog e spec Draft |
| `Contextual` | descreve visão, público, posicionamento, princípio, problema, métrica, premissa, contexto ou limite sem entrega de software | permanece em `MVP.md`, sem Inbox, backlog ou spec |

Na dúvida, classifique como desenvolvível somente se o próprio trecho trouxer
verbo ou objeto de construção verificável, como `desenvolver`, `implementar`,
`criar`, `permitir`, `cadastrar`, `consultar` ou `integrar`. Caso contrário,
mantenha contextual e registre o motivo. Uma descrição de produto não vira
backlog só porque pode ajudar uma implementação futura.

## Resolver defaults antes de perguntar

Para cada tema importado:

1. Releia o trecho original, os `Defaults aplicados automaticamente`, o
   backlog e a milestone `M01`.
2. Campo preenchido por declaração explícita do MVP ou formulação inequívoca
   registrada pelo importador conta como resposta confirmada.
3. Se só existir uma opção materialmente compatível com o MVP, aplique-a como
   default óbvio e registre formulação normalizada e fonte, sem pedir
   confirmação.
4. Mais de uma leitura razoável, conflito entre fontes ou ausência de
   informação vira a próxima pergunta numerada, com a sugestão mais compatível
   primeiro. Não escolha em silêncio.
5. Depois de cada resposta, reavalie todos os campos. Não repita pergunta já
   respondida nem confirme default sustentado.

O resultado precisa deixar claro o que foi resolvido automaticamente e o que
ainda depende da pessoa.

## Orquestrar as skills da descoberta

Para cada item da fila, em sequência e sem pular responsabilidades. O objetivo
é entrevistar cada backlog antes de qualquer promoção:

1. Anuncie
   `Transição automática: $specsfy-mvp-milestone-interviewer → $specsfy-02-backlog — motivo: entrevistar o backlog derivado do MVP — resultado esperado: backlog refinado com respostas confirmadas`
   e carregue `$specsfy-02-backlog` com o caminho do backlog candidato.
2. Use primeiro os registros do MVP que acompanham o backlog para preencher o
   que já foi declarado. A entrevista adaptativa cobre só lacunas,
   ambiguidades ou contradições restantes.
3. Se houver informação a guardar ausente ou ambígua, anuncie a transição para
   `$specsfy-data-discovery`, conclua a entrevista de dados e retome o backlog
   com `.specsfy/DATABASE.md` como contexto.
4. Ao terminar o refinamento do backlog, retome esta skill, registre a situação
   do item na síntese da sessão e carregue `$specsfy-03-specify` para criar a
   spec Draft baseada nele. A seção 10 mantém a área de menus e navegação
   principal: use o que o MVP declarar e marque `Pendente` quando faltar. Não
   implemente código, não execute tarefas e não promova o Definition Gate.
5. Passe ao próximo item da fila.

Quando a fila terminar, confirme que cada tema desenvolvível tem backlog e spec
Draft e que nenhum tema contextual gerou artefato. Execute
`specsfy milestones sync --project <raiz>` e carregue
`$specsfy-milestone-governor` para conferir vínculos e progresso de `M01`. A
geração automática de Drafts não autoriza implementação nem validação final.

## Conduzir uma conversa adaptativa

1. Comece por finalidade, pessoa atendida e problema observável.
2. Depois de cada captura, releia as Inboxes da sessão e mostre uma síntese
   curta que separe formulação recebida e hipótese da conversa.
3. Monte cada rodada pelo contrato central: uma pergunta numerada, opções
   específicas, `Escrever outra resposta`, `Gere outras opções` e `Avançar`,
   com no máximo oito perguntas por área.
4. Explore só o necessário para entender jornada, dados indispensáveis,
   papéis, regras, integrações, limites, demonstração e validação. Cada
   informação a guardar pouco clara passa por `$specsfy-data-discovery` antes
   do próximo ponto. Não aplique formulário fixo nem repita resposta já
   preservada.
5. Quando a pessoa encerrar ou adiar uma área, capture a formulação dela e
   indique a Inbox correspondente na síntese, sem preencher lacunas por conta
   própria.

## Preservar a sessão

As respostas da conversa ficam registradas em Inboxes de sessão, separadas dos
temas importados. Essas capturas servem de rastreabilidade da entrevista; os
temas contextuais do MVP continuam sem Inbox.

1. Derive uma identificação estável `DESC-AAAAMMDD-<slug>` a partir do primeiro
   tema recebido.
2. Depois de cada resposta, capture o conteúdo semântico em nova Inbox com a
   mesma sessão e o próximo turno. Quando a pessoa responder só `1`, `2` ou
   `3`, substitua o número pelo texto integral da opção escolhida antes de
   montar `--input`, `--summary`, `--signals` e os demais campos. A entrada
   literal pode constar na rastreabilidade, mas não serve de contexto da
   milestone. Cada hipótese de milestone apresentada para confirmação também
   gera uma Inbox. Capturas anteriores nunca são editadas, reunidas ou
   substituídas.
3. Informe `--sources` em toda chamada com o caminho de `MVP.md` e `BRAND.md`
   consultados, inclusive do superprojeto, ou indique que estavam ausentes.
4. Aplique antes de cada escrita a triagem de dados sensíveis do
   `$specsfy-01-inbox`. Se ela impedir a captura, pause a conversa até receber
   texto seguro.
5. Escreva em Português do Brasil a análise, a síntese, os metadados e qualquer
   milestone gerada. Fonte ou resposta em outro idioma fica só como citação,
   com a interpretação em Português do Brasil.

```bash
node .agents/skills/specsfy-01-inbox/scripts/capturar_inbox.mjs \
  --input "<texto integral da pessoa>" \
  --title "<tema da descoberta>" \
  --session "DESC-AAAAMMDD-<slug>" \
  --turn "<número sequencial>" \
  --sources "<situação de MVP.md e BRAND.md>" \
    [campos de análise da Inbox] [--root <raiz>]
```

## Encerrar e tratar depois

Ao encerrar, informe a identificação da sessão, `M01`, a lista ordenada de
backlogs e specs Draft geradas, as respostas confirmadas e os pontos marcados
como `Pendente`, e lembre que os demais temas continuam em `MVP.md`. A geração
de specs encerra a importação; implementação, validação final e promoção de
gate ficam para outra etapa autorizada.

## Limites

- Não invente respostas, objetivo, condição de saída, fora de escopo ou
  vínculos de uma milestone.
- Não sobrescreva a milestone 1.0 nem backlogs existentes.
- Não pule a entrevista de nenhum backlog gerado pelo importador.
- Não implemente código durante a importação nem marque gate como Passed.
- Não trate Inbox como fonte normativa.
- Não use o entrevistador de roadmap para ampliar o MVP sem confirmação.
