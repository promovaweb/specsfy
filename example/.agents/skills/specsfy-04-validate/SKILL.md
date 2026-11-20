---
name: specsfy-04-validate
description: "Audita se a spec.md da fatia segue o formato Specsfy/2.0 e está pronta para planejar, registra o Definition Gate na seção 13 e conduz o aceite final em review. Use quando o usuário pedir para validar, revisar, auditar ou checar uma spec, quando uma transição automática pedir prova do Definition Gate, nova validação após correção ou aceite da entrega. Não decide requisitos nem cria checklist, relatório ou plan.md: lacunas de decisão vão para specsfy-02-backlog, correções de spec aprovada para specsfy-update-spec e o planejamento para specsfy-05-tasks."
---

# Validar a especificação

Esta skill prova, com scripts e revisão semântica, que a `spec.md` está clara,
completa, consistente e testável antes do Ato II. Trate a spec como código em
linguagem natural: confira primeiro o formato rígido e depois o significado. O
resultado fica registrado no próprio arquivo, que continua sendo a única fonte
da verdade.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`. A pergunta típica
desta skill é qual spec validar quando houver várias e nenhum slug informado.

## Pronto quando

- `specsfy gate spec <spec>` roda sem falha estrutural (com `--allow-draft`
  durante a análise e sem ele quando o gate passa);
- o resultado é exatamente `READY` ou `NOT READY`, com contagens, cobertura
  mínima e os três achados mais importantes;
- `Gate do Ato I — Definição` na seção 13 registra resultado, data e achados, e
  os campos de `Status` e gates refletem esse resultado;
- em `READY`, a spec foi movida com `specsfy specs transition <id> defined`,
  equivalente a `specsfy specs transition <id> defined`, as capturas esgotadas
  saíram da fila e `$specsfy-05-tasks` foi carregada.

## Orquestrar a conversa

Ao concluir esta etapa ou detectar trabalho de outra etapa, anuncie
`Pendência detectada: <descrição> — ação: resolvendo nesta etapa` e resolva-a
quando pertencer ao próprio escopo. Quando houver troca de responsabilidade,
anuncie `Transição automática: $specsfy-04-validate → $<destino> — motivo:
<motivo> — resultado esperado: <resultado>` e carregue imediatamente a skill de
destino, sem pedir confirmação nem repetir o comando. Continue na mesma
conversa. Depois de uma correção necessária a esta etapa, anuncie `Retomada
automática: $<destino> → $specsfy-04-validate — pendência resolvida:
<resultado>` e retome-a imediatamente. Reavalie o estado após cada handoff para
evitar ciclos. Não peça confirmação para o handoff; ações sensíveis continuam
exigindo autorização específica.

## Executar a validação

Leia em paralelo a spec, o índice `Artefatos de pesquisa armazenados`, os
arquivos de `research/` e `references/quality-gates.md`. Os passos abaixo são
sequenciais.

1. Resolva a spec pelo identificador informado, que aceita número, nome da
   pasta, slug ou caminho de `specs/<estado>/<NNNN>-<slug>/spec.md`; se houver
   várias specs e nenhum identificador, pergunte qual validar.
2. Confirme `Formato: Specsfy/2.0`, os três atos na ordem, slug igual ao
   diretório e pacote restrito a `spec.md` e ao diretório opcional `research/`.
3. Para toda API ou documentação externa consultada, confirme uma evidência
   local em `research/` e seu índice em `Artefatos de pesquisa armazenados`.
   Esse material informa a spec; ele não é uma segunda fonte normativa.
4. Enquanto `Status` ou `Definition Gate` ainda estiverem pendentes, execute:

   ```bash
   specsfy gate spec <spec> --allow-draft
   ```

   Pelo MCP, use a tool `gate_spec`. Sem o binário instalado, rode o script
   equivalente:

   ```bash
   node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs \
     specs/<estado>/<NNNN>-<slug>/spec.md --allow-draft
   ```

5. Faça a revisão semântica com `references/quality-gates.md`. Um arquivo bem
   formatado não prova uma especificação correta.
6. Confira o campo `Interface para pessoas`. Se for `Sim`, exija na seção 10
   stack e convenções observadas, telas e responsabilidades, fluxo de
   informação e navegação, menus e navegação principal, formulários e ações,
   composição e disposição, estados e acessibilidade. Confirme que a tecnologia
   proposta segue as fontes da stack ou que a lacuna foi registrada para a
   pessoa. Um CRUD sem telas e formulário é `BLOCKER` e volta automaticamente
   para `$specsfy-02-backlog`.
7. Compare research, requisitos, BDD, plano técnico, modelo de dados,
   contratos, TDD, matriz e tarefas. Confirme no mínimo três `AC` distintos
   para a feature inteira e para cada `US`, `FR` e `NFR`.
8. Quando produto, arquitetura ou segurança forem materiais, leia
   `references/review-lenses.md`, registre os findings na seção 13 e execute
   `specsfy gate findings <spec>`. Pelo MCP, use a tool `gate_findings`. Um
   finding `P1 Open` mantém o gate pendente.
9. Confira o contexto persistente exigido pela mudança:

   | A definição altera | A Definition of Done precisa citar |
   | --- | --- |
   | stack | `.specsfy/STACK.md` |
   | persistência | `.specsfy/DATABASE.md` |
   | finalidade ou capacidade, de forma material | revisão de `PROJECT.md` |
   | regra nova confirmada | `.specsfy/RULES.md` |

10. No aceite final, execute `specsfy gate evidence <spec> --delivery` para
    cada tarefa `[MIGRATION]`. Pelo MCP, use a tool `gate_evidence`. Mantenha o
    Delivery Gate pendente quando a tarefa estiver aberta ou faltar o arquivo,
    o comando de aplicação ou a consulta de estado.

## Classificar achados

| Nível | Quando usar |
| --- | --- |
| `BLOCKER` | impede tarefa ou teste correto: requisito contraditório, sem comportamento observável, decisão de alto impacto ausente ou cenário principal sem cobertura |
| `WARNING` | aumenta retrabalho ou risco, mas ainda admite implementação segura |
| `NOTE` | melhoria editorial sem efeito material |

Para cada achado, cite a seção ou o ID, explique o impacto e proponha uma
correção concreta.

## Gate

Retorne exatamente um resultado:

- `READY`: nenhuma falha de formato e nenhum `BLOCKER` sem resolução.
- `NOT READY`: qualquer falha estrutural ou `BLOCKER`.

Inclua contagens, cobertura mínima `US/FR/NFR ↔ 3 ACs`, os três achados mais
importantes e a transição automática correspondente:

- `READY` → `$specsfy-05-tasks` para planejar a seção 14.
- `NOT READY` com decisão faltando → `$specsfy-02-backlog`. O refinamento do
  backlog executa seu ciclo completo, e esta validação só é retomada depois de
  fechar as lacunas ou registrar a saída explícita `avançar`. Após essa saída,
  registre `NOT READY` e não reabra o mesmo ciclo nesta retomada.
- `NOT READY` com correção já decidida → `$specsfy-update-spec` para uma spec
  anteriormente aprovada ou `$specsfy-03-specify` para a definição inicial.

Anuncie o motivo e carregue imediatamente a skill escolhida.

## Registrar no arquivo único

Registre o resultado sem alterar requisitos por conta própria:

1. atualize `Gate do Ato I — Definição` na seção 13 com resultado, data e
   achados;
2. em `READY`, defina `Definition Gate: Passed` e `Status: Defined`;
3. em `NOT READY`, defina `Definition Gate: Failed`, `Plan Gate: Pending`,
   `Delivery Gate: Pending` e mantenha `Status: Draft`;
4. quando o gate passar, execute novamente `specsfy gate spec <spec>` sem
   `--allow-draft`;
5. relate o resultado no chat.

Quando o Definition Gate passar, execute `specsfy specs transition <id> defined`,
equivalente a `specsfy specs transition <id> defined`.

### Retirar da fila as capturas esgotadas

Depois da transição, confira as capturas que deram origem à spec:

1. localize em `specs/inbox/` cada captura referenciada pela spec ou pelo
   backlog que a originou;
2. releia o texto original e compare com o que esta spec e outras specs com
   `Definition Gate: Passed` definem;
3. se o pedido estiver integralmente coberto, execute
   `specsfy inbox process <captura> --spec <id>`, repetindo `--spec` para cada
   spec que cobre a captura. O comando move o arquivo para
   `specs/inbox/processed/`, marca `Status: Processada`, registra as specs
   derivadas e atualiza os vínculos sem tocar no texto original;
4. se qualquer parte do pedido ainda não tiver spec aprovada, a captura
   permanece em `specs/inbox/`; registre no chat o que resta encaminhar.

O comando recusa a spec que estiver na pasta `draft`, tiver `Status: Draft` ou
não declarar `Status` e `Definition Gate: Passed` na primeira tabela de
metadados. Tabelas do corpo e exemplos não comprovam aprovação, e com uma spec
recusada nenhuma captura sai da fila. Use somente esse comando para mover uma
captura e não apague capturas, porque o histórico serve à busca de duplicatas.

### Aceite final em `review`

Use a mesma análise para o aceite final. Antes de concluir, chame
`$specsfy-interviewer` quando uma resposta puder mudar a entrega ou o Effort.
Com Delivery Gate passado, `Status: Complete` e a DoD comprovada, execute
`specsfy specs transition <id> completed`, equivalente a
`specsfy specs transition <id> completed`.

Se o usuário pedir correções, edite as seções de origem, preserve IDs e
revalide. Mantenha tudo na própria spec, sem criar outro arquivo de
especificação ou validação.

## Enforcement do repositório

Use o mesmo runner localmente e no CI:

```bash
specsfy verify --boundary local --timeout-seconds 300 --max-output-bytes 65536
```

Pelo MCP, use a tool `verify`. Sem o binário instalado, rode o script
equivalente:

```bash
node .agents/skills/specsfy-04-validate/scripts/verify_repo.mjs . \
  --boundary local --timeout-seconds 300 --max-output-bytes 65536
```

- As fronteiras `local`, `git` e `ci` aplicam a mesma política. Não aceite um
  gate que passa em apenas uma fronteira, excede limites ou trunca diagnóstico
  sem marcar `truncated`.
- `--attestation PATH` é a única forma de persistir uma atestação. A atestação
  schema 2 liga commit, digest executável, checks aprovados, tarefas e hashes
  de arquivos; o digest cobre comandos, limites e os arquivos da política.
- `--self-test` executa canários em diretório temporário e não produz binding
  probatório.
- O contrato do catálogo exige as quatorze skills base, `specsfy-setup`,
  `specsfy-documentator` e as três `specsfy-aux-*`. Ele também valida cada
  `specsfy-specialist-*` instalada, sem impor um total máximo de especialistas.
- O Gherkin BDD é referência exclusiva da `spec.md`, e o enforcement não
  executa `.feature`. Os testes derivados rodam com Pest em projetos PHP,
  inclusive PHP + Node. Em projeto Node sem PHP, o runner exige um script
  `test:tdd`; quando ele falta, a falha orienta a skill a perguntar ao usuário
  e sugerir Vitest.

## Especialistas sob demanda

Leia [references/specialists.md](references/specialists.md) quando um gate
depender de revisão técnica específica. Recomende a instalação de forma
explícita; ela nunca acontece como efeito colateral da validação.
