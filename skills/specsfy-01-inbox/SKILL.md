---
name: specsfy-01-inbox
description: "Use quando o usuário enviar uma ideia, pensamento, necessidade, oportunidade ou texto livre para guardar, capturar, anotar ou retomar depois. Preserve o input integral, faça pré-processamento silencioso e crie imediatamente um arquivo timestampado em `specs/inbox/`. Não faça perguntas, não peça confirmação e não crie backlog, spec, tarefas, testes ou código."
---

# Registrar uma entrada na Inbox

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `sem perguntas`.
Não formule perguntas nesta skill. Registre pontos ausentes para uma etapa
posterior sem interromper a captura.

Registre imediatamente o texto recebido em `specs/inbox/`. Trate a Inbox como
uma entrada durável anterior ao backlog: ela preserva intenção e
organiza sinais úteis, mas não decide requisitos nem autoriza implementação.

## Não interromper a captura

- Não faça perguntas, mesmo quando a ideia estiver vaga, contraditória ou
  incompleta.
- Não peça confirmação antes de escrever.
- Não bloqueie a captura por duplicata, falta de contexto ou incerteza.
- Registre lacunas em `Pontos a revisar no futuro`; não tente resolvê-las com o
  usuário nesta etapa.
- Depois de salvar, informe somente o caminho, um resumo breve do que foi
  processado e o próximo passo opcional. Não inicie o próximo passo
  automaticamente.

## Preservar e pré-processar

1. Faça uma verificação silenciosa de credenciais, tokens, chaves privadas e
   dados pessoais sensíveis evidentes. Se encontrar algum, não grave o arquivo
   nem faça perguntas; informe que a política de privacidade exige remover o
   dado sensível e reenviar a ideia.
2. Use como texto original todo o input que expressa a ideia. Preserve sua
   formulação integral, sem “corrigi-la” ou substituir palavras.
3. Derive silenciosamente um título curto, concreto e fiel. Gere o slug a
   partir dele.
4. Separe a análise nas categorias:
   - **Declaração:** conteúdo explicitamente presente no texto original;
   - **Inferência:** interpretação plausível, sempre identificada como tal;
   - **A revisar:** lacuna, conflito ou decisão que poderá ser revista depois.
5. Extraia somente quando houver evidência:
   - resumo em uma frase;
   - problema ou oportunidade;
   - pessoas afetadas ou beneficiadas;
   - resultado ou valor esperado;
   - sinais de escopo, regra, restrição, canal ou solução mencionada;
   - riscos, dependências e relações evidentes;
   - possíveis direções de backlog ou spec, sem promovê-las.
   - informações que o sistema talvez precise guardar, consultar, compartilhar
     ou apagar, como sinal para conversa futura.
6. Use `Não identificado no texto original.` quando não houver base. Não
   invente stakeholder, prioridade, prazo, regra, solução ou critério de aceite.

## Criar o arquivo

Execute uma única vez:

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

O script usa `.specsfy/templates/custom/Inbox.md` quando presente e recorre a
`.specsfy/templates/Inbox.md` caso contrário. Ele cria
`specs/inbox/AAAA-MM-DD-HHMMSS-<slug>.md` e nunca sobrescreve uma captura
existente. Se o template estiver ausente, relate a instalação incompleta; não
crie um template paralelo dentro da skill.

## Ciclo da captura

A captura nasce com `Status: Capturada` e permanece em `specs/inbox/`, a fila
ativa, enquanto qualquer parte do pedido estiver sem destino. Ela só sai dali
quando specs com `Definition Gate: Passed` cobrirem o pedido inteiro: nesse
momento `$specsfy-04-validate` executa `specsfy inbox process`, que a move para
`specs/inbox/processed/` com `Status: Processada`, o texto original intacto e
as specs derivadas registradas. Esta skill nunca executa esse comando: capturar
e processar são atos de etapas diferentes.

## Orquestrar a conversa

Esta skill é uma exceção deliberada ao handoff automático do framework:
capturar é o resultado final do pedido e precisa ocorrer sem perguntas nem
transições. Após escrever, apenas sugira um destes próximos passos:

- manter a entrada na Inbox;
- usar `$specsfy-02-backlog` para refiná-la ou aprofundá-la.
- usar `$specsfy-data-discovery` quando a entrada indicar informações que o
  sistema precisará guardar. Essa conversa posterior registra somente o que
  for confirmado em `.specsfy/DATABASE.md`.

Somente carregue outra skill se o mesmo pedido também ordenar explicitamente
esse trabalho. Nesse caso, anuncie
`Transição automática: $specsfy-01-inbox → $<destino> — motivo: <motivo> —
resultado esperado: <resultado>` depois de a captura estar segura.

## Limites

- Não pesquisar duplicatas antes de salvar.
- Não alterar nem apagar capturas anteriores. Não mover uma captura para
  `specs/inbox/processed/`; essa saída pertence à validação, depois do
  Definition Gate.
- Não transformar inferência em declaração do usuário.
- Não criar `specs/backlog/`, qualquer pasta de estado de spec, tarefas, research, testes ou
  código.
- Não usar a ideia como fonte normativa de comportamento.
