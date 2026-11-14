# Refinar ideias no backlog

O backlog recebe uma ideia que merece conversa, mas ainda não está pronta para
virar especificação. Nele, você esclarece o problema, o público afetado e o
efeito esperado sem definir arquitetura, tarefas ou código nessa etapa.

Para apenas guardar um texto sem responder perguntas, use a
[Inbox](inbox.md). Depois que uma entrada for promovida, a
`spec.md` governa a partir daí o comportamento, os gates, as tarefas e as
evidências da entrega.

## Estrutura

```text
specs/
├── inbox/
│   ├── processed/
│   │   └── 2026-06-10-091500-ideia-ja-especificada.md
│   └── 2026-07-28-143205-ideia.md
├── backlog/
│   └── 0001-ideia.md
└── specs/
    └── 0001-feature/
        ├── spec.md
        └── research/
```

O item começa leve e amadurece até produto, desenvolvimento e testes
compreenderem o comportamento esperado. Ele não contém tarefas ou gates e não
autoriza a implementação de forma direta.

## Organização do backlog

```text
Produto
└── Épico
    └── Funcionalidade
        ├── História ou requisito
        ├── Regra
        ├── Item técnico
        └── Melhoria
```

O épico representa um objetivo amplo, enquanto a funcionalidade delimita uma
capacidade do produto. Histórias e requisitos representam entregas menores e
verificáveis. Regras de negócio, itens técnicos e melhorias também pertencem ao
backlog quando tornam o comportamento viável ou o funcionamento possível.

Uma ideia pode começar sem a hierarquia completa, com `A esclarecer` no lugar
de uma relação inventada.

## Anatomia de um item

Logo abaixo do título, mantenha as metainformações em uma tabela, não em lista:

| Metainformação | Valor |
| --- | --- |
| ID | `BACKLOG-0001` |
| Status | `Captured` |
| Produto | A esclarecer |
| Épico | A esclarecer |
| Funcionalidade | A esclarecer |
| Tipo | A esclarecer |
| Prioridade | Não priorizado |
| Criado em | data ISO |
| Spec promovida | Nenhuma |

Conforme a conversa avança, o item pode registrar estas informações sem
preencher campos que ainda não foram esclarecidos:

- título, tipo e prioridade.
- produto, épico e funcionalidade.
- contexto do problema.
- objetivo ou história do usuário.
- comportamento esperado.
- regras de negócio.
- condições de aceite.
- segurança, privacidade, desempenho, volume e auditoria.
- dependências.
- situações de erro e exceções.
- dentro e fora de escopo.

A profundidade é adaptativa. Uma alteração simples exige menos detalhes,
enquanto autenticação, pagamentos, permissões, privacidade e processamento
assíncrono exigem análise cuidadosa. O melhor item não é o mais longo, mas
aquele que reduz a ambiguidade e permite verificar a entrega.

### Captura mínima e conversa

Ao receber a ideia, `$specsfy-02-backlog` reaproveita a descrição original e
confirma:

- problema percebido.
- pessoa afetada ou beneficiada.
- resultado ou valor esperado.
- contexto suficiente para distinguir a ideia.

Se algo estiver ausente, vago, contraditório ou ambíguo, a skill pergunta uma
lacuna relevante por vez e reavalia após cada resposta. Ela não usa questionário
fixo, não repete o que já foi explicado e não persiste placeholders nesses
campos. Quando você não souber responder, a skill registra a lacuna sem
inventar.

Esse é o mínimo de captura, não um refinamento profundo. Hierarquia, prioridade,
regras de negócio detalhadas, aceite e solução técnica podem ser refinados
depois.

### Duplicatas e referências

Antes de criar, a skill pesquisa termos da ideia em `specs/inbox/*.md`,
`specs/inbox/processed/*.md`, `specs/backlog/*.md`, `specs/<estado>/*/spec.md`
e `docs/**/*.md`. Ela separa possível duplicata de
backlog relacionado, spec relacionada ou documentação útil.

Uma possível duplicata exige confirmar se o item existente será atualizado ou
se há uma diferença real. Fontes úteis ficam em `Referências relacionadas`,
com o caminho e o tipo de relação. Elas não substituem o que você declarou.

## Padrões recorrentes

| Capacidade | Informações que o backlog deve tornar objetivas |
| --- | --- |
| Autenticação | cadastro, tentativas, sessão, mensagens e autorização |
| Notificações | propriedade, leitura, ações em lote e isolamento |
| Permissões | perfil, operação, alvo, validação e auditoria |
| PIX/pagamentos | estados, idempotência, webhook e dados sensíveis |
| Exportação | filtros, autorização, volume, fila e expiração |

Use a representação que reduz ambiguidade. Fluxos numerados ajudam em
integrações, matrizes ajudam em permissões e cenários demonstram resultados e
erros.

Um requisito funcional descreve o que o sistema faz. Um requisito não
funcional define condições mensuráveis de qualidade e operação. Troque “o
sistema deve ser rápido” por um limite de latência, volume e ambiente
verificáveis.

## Ordenar o backlog

Mantenha o backlog realmente ordenado para que a próxima oportunidade fique
visível no arquivo para todos os responsáveis. Compare os itens pelos fatores
abaixo:

1. valor para o usuário e para o negócio.
2. exposição de segurança, privacidade e operação.
3. dependências e entregas desbloqueadas.
4. urgência.
5. esforço.
6. pontos ainda desconhecidos.

Prioridade é relativa, porque classificar tudo como alta não cria uma ordem.
Autenticação e autorização podem preceder melhorias visuais, assim como uma
infraestrutura de notificações pode preceder os eventos que dependem dela.

A tabela abaixo mostra como uma ordem real diferencia o que deve ser retomado
primeiro do que pode esperar:

| Ordem | Prioridade | Tipo | Item | Objetivo |
| --- | --- | --- | --- | --- |
| 1 | Alta | Épico | Gestão de usuários | Administrar acesso |
| 2 | Alta | História | Realizar login | Acessar áreas privadas |
| 3 | Alta | Regra | Controlar permissões | Restringir operações por perfil |
| 4 | Média | Técnico | Notificações em fila | Evitar lentidão nas requisições |
| 5 | Baixa | Melhoria | Preferências de notificação | Escolher canais |

Cada linha aponta para um item próprio. Por exemplo, “realizar login” deve
esclarecer cadastro ativo, comparação de e-mail, proteção da senha, tentativas
inválidas, sessão, permissões, resultados de sucesso e falha e o que ficou fora
do escopo. “Criar uma tela de login” não cobre esse comportamento.

## Fluxo

```text
input → inbox → backlog → spec
```

1. Use `$specsfy-02-backlog` quando a entrada ainda for geral. A skill pesquisa
   material relacionado, conversa até a captura mínima ficar clara e produz
   `specs/backlog/<NNNN>-<slug>.md`. A mesma skill pode organizar, priorizar e
   refinar o item progressivamente.
2. A mesma skill apresenta uma pergunta numerada por rodada e
   produz um brief enquanto houver escolhas materiais abertas.
3. Use `$specsfy-03-specify` somente quando houver intenção explícita de
   promover o material, com a fonte normativa criada em
   `specs/<estado>/<NNNN>-<slug>/spec.md`.
4. Depois da promoção, mantenha o backlog como proveniência, marque-o
   `Promoted` e registre o caminho da spec.

Ao concluir, a skill informa qual etapa assumirá o trabalho e executa
automaticamente o avanço ou o retorno, com o nome da skill, o motivo da troca
e o resultado esperado exibidos na conversa. Você acompanha essa transição sem
repetir comandos, mas nenhuma troca de skill autoriza a implementação.

Backlog e spec possuem sequências independentes. `BACKLOG-0004` pode originar
`SPEC-0002`, mas os números não precisam coincidir e não indicam prioridade.

## Estados do backlog

| Estado | Significado |
| --- | --- |
| `Captured` | ideia preservada com contexto mínimo |
| `Refining` | conversa ou pesquisa leve em andamento |
| `Ready for specification` | contexto suficiente para criar a especificação |
| `Promoted` | spec derivada criada e referenciada |

## Quando está refinado

O item está pronto para especificação quando os envolvidos conseguem responder
às
perguntas abaixo sem consultar suposições fora do arquivo:

- Qual problema será resolvido e qual público será beneficiado?
- Qual evento inicia o comportamento e qual resultado será produzido?
- Qual papel pode executar a ação?
- Quais regras de negócio, erros e exceções precisam ser respeitados?
- Como verificar objetivamente o resultado?
- Há implicações de segurança, privacidade, desempenho ou volume?
- O que ficou fora da entrega?
- Quais dependências ou definições continuam pendentes?

O agente identifica lacunas e pergunta uma por rodada. Definições que alteram
segurança, escopo, arquitetura ou
experiência não são inventadas silenciosamente. Esse diagnóstico prepara a
spec, mas ainda não autoriza desenvolvimento.

## Limites

- Não implementar diretamente de um backlog.
- Não exigir arquitetura, Gherkin ou plano técnico durante a captura inicial.
- Não apagar a formulação original ao resumir.
- Não promover automaticamente uma ideia.
- Não tratar o backlog como fonte normativa depois da promoção.

## Próximo passo

Quando o item estiver claro o bastante para uma conversa aprofundada, use
[`specsfy-02-backlog`](skills/specsfy-02-backlog.md). A promoção para
`spec.md` só acontece depois de refinamento suficiente e de uma instrução
explícita para criar a especificação.
