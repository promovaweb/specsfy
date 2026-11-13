---
name: specsfy-01-inbox
description: "Captura uma ideia, necessidade, oportunidade ou texto livre em `specs/inbox/` sem perguntas. Use quando o usuário quiser guardar, anotar, capturar ou retomar depois um pensamento: preserva o input integral, faz pré-processamento silencioso e cria um arquivo timestampado. Não use para refinar a ideia (use specsfy-02-backlog) nem para criar spec, tarefas, testes ou código."
---

# Registrar uma entrada na Inbox

Grave o texto recebido em `specs/inbox/` no mesmo turno, sem conversa. A Inbox
é uma entrada durável anterior ao backlog: preserva a intenção e organiza
sinais úteis, mas não decide requisitos nem autoriza implementação.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `sem perguntas`.
Não faça perguntas e não peça confirmação, mesmo diante de ideia vaga,
contraditória ou incompleta: o valor da captura está em não interromper quem
pensou nela. Lacunas viram itens de `Pontos a revisar no futuro`. Duplicata,
falta de contexto ou incerteza não impedem a gravação.

## Pronto quando

- existe um novo `specs/inbox/AAAA-MM-DD-HHMMSS-<slug>.md` criado pelo comando;
- o texto original está integral, sem correções;
- a análise separa declaração, inferência e pontos a revisar;
- a resposta traz somente o caminho, um resumo breve do que foi processado e o
  próximo passo opcional, sem iniciá-lo.

## Preservar e pré-processar

Faça estes passos em silêncio, na ordem:

1. Verifique credenciais, tokens, chaves privadas e dados pessoais sensíveis
   evidentes. Se encontrar algum, não grave o arquivo e não pergunte: informe
   que a política de privacidade exige remover o dado sensível e reenviar a
   ideia.
2. Use como texto original todo o input que expressa a ideia, com a formulação
   integral. Não corrija nem substitua palavras.
3. Derive um título curto, concreto e fiel; o slug sai dele.
4. Classifique o conteúdo:
   - **Declaração:** o que está explícito no texto original;
   - **Inferência:** interpretação plausível, sempre identificada como tal;
   - **A revisar:** lacuna, conflito ou decisão que poderá ser revista depois.
5. Extraia apenas o que tiver base no texto:
   - resumo em uma frase;
   - problema ou oportunidade;
   - pessoas afetadas ou beneficiadas;
   - resultado ou valor esperado;
   - sinais de escopo, regra, restrição, canal ou solução mencionada;
   - riscos, dependências e relações evidentes;
   - possíveis direções de backlog ou spec, sem promovê-las;
   - informações que o sistema talvez precise guardar, consultar, compartilhar
     ou apagar, como sinal para conversa futura.
6. Sem base, escreva `Não identificado no texto original.`. Não invente
   stakeholder, prioridade, prazo, regra, solução ou critério de aceite.

## Criar o arquivo

Execute uma única vez:

```bash
specsfy inbox capture \
  --input "<texto original integral>" \
  --title "<título derivado>" \
  --summary "<resumo>" \
  --problem "<problema ou oportunidade>" \
  --people "<pessoas afetadas>" \
  --value "<resultado ou valor>" \
  --signals "<sinais extraídos>" \
  --data "<sinais sobre informações que talvez precisem ser guardadas>" \
  --risks "<riscos ou dependências>" \
  --directions "<direções futuras possíveis>" \
  --review "<pontos a revisar futuramente>" \
  [--project <raiz>]
```

Pelo MCP, use a tool `inbox_capture`. Sem o binário instalado, rode o script
equivalente:

```bash
node <diretório-da-skill>/scripts/capturar_inbox.mjs \
  --input "<texto original integral>" \
  --title "<título derivado>" \
  --summary "<resumo>" \
  --problem "<problema ou oportunidade>" \
  --people "<pessoas afetadas>" \
  --value "<resultado ou valor>" \
  --signals "<sinais extraídos>" \
  --data "<sinais sobre informações que talvez precisem ser guardadas>" \
  --risks "<riscos ou dependências>" \
  --directions "<direções futuras possíveis>" \
  --review "<pontos a revisar futuramente>" \
  [--root <raiz>]
```

O comando resolve o template em `.specsfy/templates/custom/Inbox.md` e, na
ausência dele, em `.specsfy/templates/Inbox.md`. Ele cria
`specs/inbox/AAAA-MM-DD-HHMMSS-<slug>.md` e não sobrescreve capturas
existentes. Se nenhum template existir, relate a instalação incompleta em vez
de criar um template paralelo dentro da skill.

## Ciclo da captura

A captura nasce com `Status: Capturada` e fica em `specs/inbox/`, a fila
ativa, enquanto alguma parte do pedido estiver sem destino. Quando specs com
`Definition Gate: Passed` cobrirem o pedido inteiro, `$specsfy-04-validate`
executa `specsfy inbox process`, que move a captura para
`specs/inbox/processed/` com `Status: Processada`, o texto original intacto e
as specs derivadas registradas. Capturar e processar pertencem a etapas
diferentes; esta skill não executa esse comando.

## Orquestrar a conversa

Esta skill é uma exceção deliberada ao handoff automático do framework: a
captura é o resultado final do pedido. Depois de gravar, apenas sugira um
destes próximos passos:

- manter a entrada na Inbox;
- usar `$specsfy-02-backlog` para refiná-la ou aprofundá-la;
- usar `$specsfy-data-discovery` quando a entrada indicar informações que o
  sistema precisará guardar. Essa conversa posterior registra somente o que
  for confirmado em `.specsfy/DATABASE.md`.

Carregue outra skill apenas se o mesmo pedido também ordenar esse trabalho de
forma explícita. Nesse caso, com a captura já gravada, anuncie
`Transição automática: $specsfy-01-inbox → $<destino> — motivo: <motivo> —
resultado esperado: <resultado>`.

## Limites

- Não pesquisar duplicatas antes de salvar.
- Não alterar nem apagar capturas anteriores. Não mover uma captura para
  `specs/inbox/processed/`; essa saída pertence à validação, depois do
  Definition Gate.
- Não transformar inferência em declaração do usuário.
- Não criar `specs/backlog/`, pastas de estado de spec, tarefas, research,
  testes ou código.
- Não usar a ideia como fonte normativa de comportamento.
