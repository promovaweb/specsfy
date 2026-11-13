---
name: specsfy-interviewer
description: "Conversa com uma spec em draft, defined, planned, in-progress ou review para resolver lacunas, recalibrar Effort ou registrar respostas confirmadas antes da próxima transição. Use quando a spec já existe e precisa de esclarecimento da pessoa responsável. Não use para capturar Inbox sem perguntas (specsfy-01-inbox), refinar backlog (specsfy-02-backlog), executar implementação, aprovar gates ou mover pastas diretamente."
---

# Conversar com uma spec pelo estado atual

Resolva, por conversa, a lacuna que mais atrapalha a próxima etapa de uma spec
existente. A pasta de estado é o estado operacional e `Status` é seu espelho
verificável. A spec continua sendo a fonte normativa: registre apenas
respostas, escolhas e justificativas confirmadas pela pessoa responsável.

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

- cada resposta confirmada está registrada na seção adequada da spec;
- o Effort foi recalibrado com `specsfy specs effort` sempre que a nova informação
  mudou a capacidade necessária;
- a próxima responsabilidade foi entregue à skill correspondente, sem gate
  aprovado nem pasta movida por esta skill.

## Conduzir a conversa

1. Localize a `spec.md` pelo ID informado e confirme a pasta de estado. Leia em
   paralelo a spec, seus gates, tarefas, evidências e o contexto do projeto.
2. Identifique a lacuna real que mais afeta a próxima etapa e monte uma rodada
   conforme o contrato central.
3. Reavalie a spec depois de cada rodada. Não repita informação confirmada nem
   use perguntas como ritual.
4. Depois de confirmar a resposta, atualize a seção adequada da spec. Quando a
   nova informação mudar a capacidade necessária, ajuste também o Effort.
5. Entregue validação, implementação ou transição à skill correspondente. Esta
   skill não aprova gate, não executa tarefa e não move a spec.

## Adaptar o foco à pasta

| Pasta | Foco da conversa |
| --- | --- |
| `draft` | problema, atores, comportamento, regras, falhas e aceite |
| `defined` | ambiguidade que afeta plano, dados, segurança ou testes |
| `planned` | dependências, ordem de tarefas, estratégia de TDD e BDD |
| `in-progress` | mudança tardia, descoberta de execução e impacto no escopo |
| `review` | aceite observado, documentação, pendências de entrega e retorno |
| `completed` | não entreviste para alterar a entrega; inicie ou reabra a mudança pelo fluxo correto |

`inbox` não recebe perguntas. `backlog` continua sob responsabilidade de
`$specsfy-02-backlog`, que chama este protocolo de descoberta quando necessário.

## Atualizar Effort

Effort estima a capacidade de raciocínio e execução necessária, não prazo.
Escolha um inteiro de 1 a 10 e uma justificativa curta:

| Faixa | Situação típica |
| --- | --- |
| 1–2 | alteração atômica e padrão conhecido |
| 3–4 | mudança local e testes diretos |
| 5–6 | vários arquivos ou integração conhecida |
| 7–8 | mudança transversal, migração ou integração externa |
| 9–10 | arquitetura, alta incerteza ou revisão humana frequente |

Depois da confirmação, execute:

```bash
specsfy specs effort <id-da-spec> <1-10> --reason "<o que mudou a estimativa>"
```

O comando atualiza `Effort`, data, justificativa e histórico em `spec.md`. Não
vincule a estimativa ao nome de um modelo, porque modelos mudam e a faixa
continua válida: use-a para escolher o perfil de execução `light`, `standard`,
`high` ou `maximum`.

## Integrar ClickUpfy quando presente

Se o projeto contiver uma skill `clickupfy-*` e a spec tiver `ClickUp Task`,
carregue a skill ClickUpfy apropriada depois de uma transição ou ajuste de
Effort. Use o mapeamento configurado pelo projeto ou, quando ausente,
`draft`/`defined`/`planned` para `To Do`, `in-progress` para `In Progress`,
`review` para `In Review` e `completed` para `Complete`.

O estado local permanece canônico. Se a atualização remota não ocorrer,
registre a pendência na spec sem declarar sincronização concluída.

## Limites

- Não inventar respostas, Effort, vínculo de tarefa ou status remoto.
- Não alterar uma spec em `completed` como forma de iniciar mudança nova.
- Não mover pastas por comando do sistema; use `specsfy specs transition` somente na
  skill responsável depois de seus gates.
- Não exigir ClickUp para uma spec sem integração configurada.
