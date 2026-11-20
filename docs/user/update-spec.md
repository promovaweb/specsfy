# Atualizar uma especificação

Quando uma entrega já definida precisar mudar, use
`specsfy-update-spec`. A skill incorpora a nova instrução na mesma
`spec.md` e reconcilia as partes afetadas sem exigir que você escolha atos ou
gates manualmente.

## Descreva o que mudou

Durante ou depois da implementação, identifique a `spec.md` e diga diretamente
o que deve mudar. Você pode adicionar, remover, corrigir ou mudar
uma regra de negócio. A
skill usará esse arquivo para encontrar os requisitos, testes e tarefas
afetados:

```text
Use $specsfy-update-spec em
specs/<estado>/0001-pagina-boas-vindas/spec.md:
esqueci de pedir que o nome tenha no máximo 80 caracteres.
```

Se a spec já estiver clara na conversa, você pode usar uma instrução natural
sem mencionar atos ou gates:

```text
Quero adicionar uma regra à especificação atual.
Remova o comportamento de visitante.
Corrija o que acontece quando o nome estiver vazio.
Mude esta entrega para exigir autenticação.
```

A skill preserva a instrução, compara-a com a spec existente e informa
primeiro o resultado prático. Você não precisa escolher manualmente qual gate
ou etapa reabrir.

## O que acontece

| Tipo de mudança | Tratamento |
| --- | --- |
| correção interna sem efeito observável | mantém a spec |
| esclarecimento sem novo significado | ajusta o texto e preserva os gates |
| mudança de comportamento ou aceite | atualiza a spec e reabre o Ato I |
| mudança de solução, tarefas ou testes | atualiza a spec e reabre o Ato II |
| capacidade independente | encaminha para backlog ou nova spec |
| definição material ausente | pergunta e retoma depois da resposta |

Quando a mudança pertence à spec atual, a skill atualiza o arquivo, encaminha
as etapas invalidadas e retorna à implementação somente depois das novas
provas:

```text
mudança posterior → update-spec → validate ou tasks → implement (tests → implement)
                               ↘ backlog, se faltar uma definição
```

Testes e tarefas que continuam válidos são preservados, enquanto as provas
dependentes do comportamento anterior voltam a ficar pendentes. A implementação só é retomada
depois de existir novo RED válido e os gates necessários voltarem a `Passed`.

## Resultado esperado

- a nova instrução está incorporada à única `spec.md` normativa.
- IDs e definições ainda válidos foram preservados.
- os gates afetados foram reabertos.
- validação, tarefas e testes foram reconciliados.
- a etapa que recebeu a solicitação foi retomada automaticamente.

## Limites

- não cria `change-request.md`, `plan.md`, `tasks.md` ou outra fonte paralela.
- não transforma uma capacidade independente em aumento silencioso de escopo.
- não inventa uma definição material.
- não altera código antes de atualizar a spec e preparar novo RED.
- handoffs automáticos não autorizam deploy, publicação ou ação destrutiva.

## Quando usar outra skill

- criar a primeira versão de uma spec.
- capturar uma ideia ainda superficial.
- editar código quando a spec continua correta.

Depois da atualização, rode `specsfy progress`, descrito em
[Ver o progresso](reference.md#ver-o-progresso), para conferir o
estado geral, com a spec atualizada como única fonte normativa do
projeto.
