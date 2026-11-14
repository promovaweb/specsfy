# Referência rápida

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | consulta rápida de arquivos, estados, gates, skills, comandos e termos |
| Autoridade | contrato central de `skills/Spec.md` e interface pública de `cli/` |

Use este capítulo como cola de consulta durante o trabalho. Ele resume o que
os outros capítulos explicam em detalhe e aponta onde aprofundar cada assunto.

## Onde fica cada coisa

| Caminho | O que guarda |
| --- | --- |
| `specs/inbox/` | capturas que ainda precisam de tratamento |
| `specs/inbox/processed/` | capturas já cobertas por specs aprovadas |
| `specs/backlog/<NNNN>-<slug>.md` | itens escolhidos para refinamento |
| `specs/<estado>/<NNNN>-<slug>/spec.md` | fonte única de uma entrega |
| `specs/<estado>/<NNNN>-<slug>/research/` | evidências de pesquisa indexadas pela spec |
| `specs.md` e `specs/milestones/MNN.md` | projeção de milestones, specs e backlog |
| `PROJECT.md` | história, finalidade, capacidades e limites do projeto |
| `INTERFACE.md` | mapa do design system e dos componentes reutilizáveis |
| `DESIGNSYSTEM.MD` | regras macro de interface, padrões de CRUD e exceções |
| `.specsfy/STACK.md` | tecnologias estruturais e suas evidências |
| `.specsfy/RULES.md` | regras confirmadas pela pessoa responsável |
| `.specsfy/DATABASE.md` | quadro completo de persistência |
| `.specsfy/PACKAGES.md` | pacotes npm e Composer com finalidade curta |
| `.specsfy/USER-PROFILE.md` | nível de conhecimento e respostas já confirmadas |
| `.specsfy/templates/custom/` | suas versões dos templates, nunca alteradas pelo CLI |
| `.agents/skills/` | skills instaladas no projeto |
| `docs/` | documentação técnica reconstruída do sistema |

O Specsfy nunca cria `plan.md`, `tasks.md`, `research.md` ou
`data-model.md`. Tudo o que governa a entrega fica na `spec.md`.

Aprofunde em [Informações permanentes do projeto](project-context.md) e na
[Referência do método](method-reference.md).

## Estados

```text
draft → defined → planned → in-progress → review → completed
Draft → Defined → Planned → Implementing → Reviewing → Complete
```

| Pasta | `Status` | Significa |
| --- | --- | --- |
| `draft` | `Draft` | definição em construção |
| `defined` | `Defined` | Definition Gate aprovado |
| `planned` | `Planned` | plano, tarefas e RED prontos |
| `in-progress` | `Implementing` | tarefas em execução |
| `review` | `Reviewing` | Delivery Gate aprovado |
| `completed` | `Complete` | aceite final e documentação atualizada |

Mova a spec com `specsfy specs transition <id> <pasta>`. O comando move o pacote
inteiro e atualiza o `Status` no mesmo ato.

## Atos e gates

| Ato | O que comprova | Gate | Validador |
| --- | --- | --- | --- |
| I · Definir | problema, escopo, histórias, requisitos e cenários BDD | Definition Gate | `specsfy gate spec <id>` |
| II · Projetar e provar | plano, tarefas e RED válido | Plan Gate | `specsfy gate tasks <id>` |
| III · Entregar e validar | GREEN, regressão e evidências | Delivery Gate | `specsfy gate trace <id> --full-chain` e `specsfy gate evidence <id> --delivery` |

Cada gate sai com código `0` quando aprova e `10` quando reprova.
`specsfy verify` roda a política inteira e serve de entrada para o CI.

O que reabre cada ato:

- mudança de comportamento reabre os atos I, II e III;
- mudança somente de plano reabre os atos II e III;
- um gate posterior nunca permanece aprovado sobre uma entrada invalidada.

## Effort

| Pontuação | Perfil | Situação típica |
| --- | --- | --- |
| 1–2 | `light` | ajuste atômico em padrão conhecido |
| 3–6 | `standard` | mudança local ou integração conhecida |
| 7–8 | `high` | mudança transversal, migração ou integração externa |
| 9–10 | `maximum` | arquitetura ou incerteza relevante |

Effort mede a capacidade de raciocínio e execução necessária, não prazo nem
prioridade. Atualize com
`specsfy specs effort <id> <1-10> --reason "<motivo>"` sempre que surgir informação
material.

## Identificadores

| Prefixo | Representa | Exemplo |
| --- | --- | --- |
| `SPEC-` | a especificação | `SPEC-0001` |
| `BACKLOG-` | item de backlog | `BACKLOG-0001` |
| `US-` | história de usuário | `US-001` |
| `FR-` | requisito funcional | `FR-002` |
| `NFR-` | requisito não funcional | `NFR-001` |
| `AC-` | cenário BDD de aceite | `AC-003` |
| `T` | tarefa | `T004` |
| `R-` | pesquisa registrada | `R-001` |

O marcador `SPECSFY:` no teste liga o caso aos IDs que ele comprova, por
exemplo `// SPECSFY: US-001 FR-001 AC-001`.

Mínimos de cobertura:

- três cenários `AC` distintos para a feature e para cada `US`, `FR` e `NFR`,
  contando somente os IDs declarados em `**Cobre**`;
- três casos TDD executáveis para a feature e para cada `US`, `FR` e `NFR`,
  cada um com seu próprio marcador.

## Checklist de cada tarefa

| Item | Pergunta que responde |
| --- | --- |
| `PREP` | o contexto, os arquivos e as dependências foram conferidos? |
| `EXECUTE` | a mudança foi feita? |
| `VERIFY` | os testes focais e a regressão passaram? |
| `VISUAL` | bordas, espaçamentos e tipografia foram conferidos, ou não há interface? |
| `EVIDENCE` | comandos e resultados foram registrados na spec? |
| `IMPROVE` | o que ficou melhor ou o que foi aprendido? |

## Skills

| Skill | Use quando |
| --- | --- |
| `specsfy-01-inbox` | quiser guardar uma ideia sem perguntas |
| `specsfy-02-backlog` | quiser refinar uma ideia e decidir o comportamento |
| `specsfy-03-specify` | quiser criar a spec de uma entrega |
| `specsfy-04-validate` | precisar aprovar a definição |
| `specsfy-05-tasks` | precisar planejar as tarefas |
| `specsfy-06-tdd-bdd` | precisar preparar ou verificar testes |
| `specsfy-07-implement` | for implementar a entrega |
| `specsfy-update-spec` | algo mudar depois da definição |
| `specsfy-progress` | quiser consultar o estado sem alterar nada |
| `specsfy-interviewer` | quiser conversar sobre a spec antes de avançar |
| `specsfy-mvp-milestone-interviewer` | for definir o MVP de um produto |
| `specsfy-roadmap-milestone-interviewer` | for planejar a evolução após o MVP |
| `specsfy-milestone-governor` | precisar manter os milestones alinhados |
| `specsfy-data-discovery` | o sistema precisar guardar informações novas |

Skills de apoio, chamadas pelo próprio fluxo:

| Skill | Papel |
| --- | --- |
| `specsfy-setup` | prepara e reconcilia o contexto antes de qualquer skill |
| `specsfy-documentator` | reconstrói `docs/` e `.specsfy/PACKAGES.md` após cada implementação |
| `specsfy-aux-stack` | atualiza `.specsfy/STACK.md` após mudança de tecnologia |
| `specsfy-aux-rules` | registra regras confirmadas em `.specsfy/RULES.md` |
| `specsfy-aux-database` | atualiza `.specsfy/DATABASE.md` quando o banco muda |

Aprofunde no índice de [Skills base](skills/README.md).

## Comandos do CLI

| Comando | Faz |
| --- | --- |
| `specsfy` | abre a TUI, com as abas Overview, Specs, Backlog, Gates, Tests, Skills e About |
| `specsfy --skill` | imprime a documentação embutida do framework |
| `specsfy install --project .` | instala skills, templates e blocos gerenciados |
| `specsfy doctor --project .` | confere runtime, terminal, configuração, Git e token do GitHub |
| `specsfy update` | atualiza skills, templates e blocos gerenciados do projeto |
| `specsfy upgrade` | substitui o próprio binário pela última release |
| `specsfy skills list` | lista o catálogo do framework e dos especialistas |
| `specsfy skills detect` | recomenda especialistas pela stack |
| `specsfy skills install <nome>` | instala um especialista |
| `specsfy status` | resume specs por estado, gates, tarefas, backlog e inbox |
| `specsfy progress --spec <id>` | projeta o progresso de uma spec |
| `specsfy specs list` | lista as specs com estado, gates e tarefas |
| `specsfy specs new --title "<título>"` | cria uma spec em `specs/draft/` pelo template |
| `specsfy specs transition <id> <pasta>` | move a spec de estado |
| `specsfy specs effort <id> <1-10> --reason "<motivo>"` | registra o Effort |
| `specsfy specs change <id>` | projeta o impacto de um pedido tardio, sem editar |
| `specsfy tasks next <id>` | mostra a próxima tarefa pronta |
| `specsfy inbox capture` | grava uma captura na Inbox |
| `specsfy inbox process` | retira da fila capturas cobertas por specs aprovadas |
| `specsfy gate <gate> <id>` | roda um gate: `spec`, `tasks`, `interface`, `trace`, `acceptance`, `evidence`, `findings` ou `database` |
| `specsfy verify` | roda a política inteira, para o CI |
| `specsfy context setup` | cria os arquivos de contexto que ainda não existem |
| `specsfy docs build` | reconstrói `docs/` e `.specsfy/PACKAGES.md` |
| `specsfy milestones sync` | atualiza `specs.md` e os milestones |
| `specsfy test` | roda a suíte com o runner da stack e a proteção do banco |
| `specsfy mcp` | inicia o servidor MCP para o agente |
| `specsfy config list` | mostra as preferências |

Quase todos aceitam `--project <caminho>` e `--json`, e
`specsfy <comando> --help` mostra as opções. A lista completa, com os códigos
de saída, está na [Referência dos comandos](cli-reference.md).

## Mensagens de transição

O agente usa formatos fixos para que você acompanhe o fluxo:

```text
Pendência detectada: <descrição> — ação: resolvendo nesta etapa
Transição automática: $<origem> → $<destino> — motivo: <motivo> — resultado esperado: <resultado>
Retomada automática: $<destino> → $<origem> — pendência resolvida: <resultado>
```

Uma transição nunca autoriza sozinha ações destrutivas, publicação, deploy ou
instalação de especialista. Cada uma dessas ações pede sua autorização.

## Proteções que não podem ser desligadas

- nenhum teste roda no banco de desenvolvimento;
- comandos que apagam ou recriam banco são sempre recusados, como
  `migrate:fresh`, `migrate:refresh`, `db:wipe`, `DROP TABLE` e `TRUNCATE`;
- testes Laravel usam `DatabaseTransactions` e exigem `.env.testing` com banco
  separado;
- conteúdo fora dos blocos `specsfy:*:start` e `specsfy:*:end` pertence a você
  e não é alterado pelo CLI.

## Glossário

| Termo | Significado |
| --- | --- |
| BDD | descrição do comportamento em cenários `Given`, `When`, `Then`, legíveis por qualquer pessoa |
| TDD | prática de escrever o teste antes do código e vê-lo falhar primeiro |
| RED | falha do teste antes da implementação, causada pela ausência do comportamento |
| GREEN | o mesmo teste passando depois da implementação |
| REFACTOR | melhoria do código mantendo os testes verdes |
| Gate | ponto de controle que só passa com prova registrada |
| Effort | escala de 1 a 10 da capacidade necessária para a entrega |
| Rastreabilidade | ligação entre requisito, cenário, teste, tarefa e evidência |
| Especialista | skill técnica opcional para uma tecnologia ou disciplina |
| MVP | menor conjunto de entregas que demonstra o valor do produto |
| Milestone | marco demonstrável que agrupa specs e itens de backlog |

## Referências externas

O método combina práticas consolidadas. Estas fontes ajudam a entender os
conceitos por trás de cada etapa:

| Assunto | Fonte | Endereço |
| --- | --- | --- |
| BDD e Gherkin | documentação oficial do Cucumber | `https://cucumber.io/docs/gherkin/` |
| Especificação por exemplos | Gojko Adzic, *Specification by Example* | `https://gojko.net/books/specification-by-example/` |
| TDD | Kent Beck, *Test-Driven Development: By Example* | `https://www.oreilly.com/library/view/test-driven-development/0321146530/` |
| Versionamento | Semantic Versioning 2.0.0 | `https://semver.org/lang/pt-BR/` |
| Skills de agentes | formato aberto `SKILL.md` | `https://agentskills.io/` |
| Pest | documentação oficial | `https://pestphp.com/docs/` |
| Vitest | documentação oficial | `https://vitest.dev/guide/` |
| Spec Kit | repositório do GitHub Spec Kit | `https://github.com/github/spec-kit` |

O Specsfy usa essas ideias como base, mas a regra que vale no seu projeto é a
registrada no contrato instalado em `.specsfy/Spec.md` e na `spec.md` de cada
entrega.

## Justificativa de tamanho

A referência rápida reúne em uma página o que os demais capítulos explicam em
detalhe. Dividi-la anularia sua função de consulta única durante o trabalho.
