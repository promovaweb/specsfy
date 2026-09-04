# Guia de desenvolvimento da metodologia Specsfy

Este `AGENTS.md` governa o módulo `skills/`. Ele contém a metodologia
executável, as quatorze skills base, o setup, o documentador e as três skills auxiliares. Seus testes e fixtures pertencem a este
módulo. A raiz do monorepo não instala nem executa estas skills.

Leia também [`Spec.md`](Spec.md), contrato central do framework publicado pelo
CLI nos projetos consumidores.

Ao consumir um template, respeite a precedência
`.specsfy/templates/custom/<Nome>.md` sobre
`.specsfy/templates/<Nome>.md`. O diretório `custom/` pertence ao usuário e
nunca deve ser sobrescrito pelo instalador.

<!-- specsfy:framework:start -->
## Framework Specsfy

Leia e siga integralmente `{{SPECSFY_SPEC_PATH}}` antes de trabalhar com
backlogs, refinamentos do backlog, especificações, tarefas, testes ou implementação. Esse
arquivo contém o fluxo, os caminhos canônicos e os gates do framework.

- Preserve as instruções próprias deste projeto.
- O diretório do projeto é o caminho informado durante `$specsfy-setup`. Use-o
  em toda leitura e escrita posterior. Se ele estiver dentro de um Hub, não
  promova o trabalho para a raiz Git nem crie contexto, specs ou código fora
  desse caminho.
- Leia `PROJECT.md`, `DESIGNSYSTEM.MD`, `.specsfy/STACK.md`,
  `.specsfy/RULES.md`, `.specsfy/DATABASE.md`, `.specsfy/PACKAGES.md` e
  `.specsfy/USER-PROFILE.md` como contexto persistente antes de planejar
  mudanças.
- Antes de perguntar, consulte `.specsfy/USER-PROFILE.md`, a conversa atual e
  as fontes do projeto. Não repita uma pergunta cuja resposta já esteja
  confirmada; registre respostas novas no perfil com a fonte e o alcance.
- Quando `.specsfy/SPECKIT.md` existir, leia
  `.specify/memory/constitution.md` e cada fonte do GitHub Spec Kit listada na
  projeção. Preserve `.specify/` e os artefatos já existentes em `specs/`; o
  Specsfy não os migra nem os substitui.
- Antes de iniciar qualquer skill do framework, execute obrigatoriamente
  `$specsfy-setup` para verificar e reconciliar o contexto e os blocos
  reservados. A própria `$specsfy-setup` não se chama recursivamente. Em uma
  transição automática, execute-a de novo com a mesma raiz já confirmada antes
  de carregar a skill de destino. Execute `$specsfy-documentator` quando
  `PACKAGES.md` estiver ausente ou desatualizado.
- Execute o monitor de contexto no início, após cada tarefa e antes de concluir
  a entrega; resolva todo resultado `PENDING`.
- Use as skills `specsfy-aux-*` para manter stack, regras e banco sem apagar
  conteúdo humano.
- Toda tarefa que cria ou altera a estrutura do banco inclui uma tarefa
  `[MIGRATION]` com arquivo
  versionado. A implementação aplica a migration no banco de teste e consulta
  seu estado antes de concluir a tarefa ou o Delivery Gate.
- Execute `$specsfy-documentator` depois de cada implementação para reconstruir
  a documentação técnica completa em `docs/` e o registro de dependências em
  `.specsfy/PACKAGES.md`.
- Use `specs/inbox/` para capturas imediatas ainda não refinadas.
- Use `specs/backlog/` para itens refináveis ainda não promovidos.
- Use `specs/<estado>/<NNNN>-<slug>/spec.md` como fonte normativa de cada
  fatia, em uma única pasta de estado.
- Não crie `plan.md`, `tasks.md`, `research.md` ou outra fonte normativa
  paralela.
<!-- specsfy:framework:end -->

## Fonte da verdade

- Specs e research existem somente nos projetos consumidores que aplicam a
  metodologia. Testes desta raiz usam diretórios temporários, nunca o workspace
  pai.
- Mecanismos base vivem somente em
  `specsfy-<NN>-<responsabilidade>/` nesta raiz.
- Contexto técnico opcional pertence a
  [`specialists/`](../specialists/).
- Código, testes e documentos publicados por uma skill são artefatos derivados;
  requisitos, tarefas, gates e evidências permanecem na spec.

Não crie `plan.md`, `tasks.md`, `research.md`, `data-model.md` ou outra fonte
normativa paralela.

## Limites entre os módulos

| Conteúdo | Responsável |
| --- | --- |
| metodologia, skills, scripts, referências e assets | `skills/` |
| testes, fixtures e validação das skills | `skills/` |
| orquestração e testes autônomos do workspace | `promovaweb/specsfy` |
| documentação final para o usuário | `docs/` |
| visão geral pública | `specsfy/` |
| identidade visual e verbal | `brand/` |
| especialistas técnicos opcionais | `specialists/` |
| CLI, TUI e instalação | `cli/` |

Links entre módulos usam caminhos relativos; links públicos usam
`https://github.com/promovaweb/specsfy`. Commits transversais podem incluir os
módulos necessários para manter o monorepo coerente.

## Três atos

Antes do Ato I, `specsfy-01-inbox` captura sem perguntas em `specs/inbox/` e
`specsfy-02-backlog` pode transformar uma captura em item refinável em
`specs/backlog/`. Nenhum desses registros é gate ou autorização para
implementar.

### Ato I — Definir

Descobrir problema, finalidade, atores, linguagem, regras, limites e efeitos.
Aplicar BDD como descoberta e escrever Gherkin. O ato termina sem dúvida P1 e
com `Definition Gate: Passed`.

Skills: `specsfy-02-backlog`, `specsfy-03-specify` e `specsfy-04-validate`.

### Ato II — Projetar e provar

Definir plano técnico, persistência, contratos, falhas, rollback e tarefas. Usar o BDD
da spec para escrever TDD e observar RED antes de alterar a implementação. O ato termina com
`Plan Gate: Passed`.

Skills: `specsfy-05-tasks` e `specsfy-06-tdd-bdd` no modo `prepare`.

### Ato III — Entregar e validar

Executar cada tarefa no ciclo `RED → GREEN → REFACTOR`, rodar aceite, regressão
e rastreabilidade e registrar evidência. O ato termina com
`Delivery Gate: Passed` e `Status: Complete`.

Skills: `specsfy-07-implement`, `specsfy-06-tdd-bdd`,
`specsfy-update-spec`, `specsfy-documentator` e
`specsfy-progress`.

Mudança de comportamento reabre os Atos I–III. Mudança de plano reabre os Atos
II–III.

O estado canônico é:

```text
Draft → Defined → Planned → Implementing → Reviewing → Complete
```

## Responsabilidade das skills

| Skill | Responsabilidade | Não deve fazer |
| --- | --- | --- |
| `specsfy-01-inbox` | preservar e pré-processar imediatamente um input | perguntar, criar backlog, spec, tarefas ou código |
| `specsfy-02-backlog` | refinar entradas, registrar backlog e descobrir decisões | criar spec, tarefas ou código |
| `specsfy-03-specify` | consolidar `spec.md` e research | implementar ou criar backlog externo |
| `specsfy-04-validate` | auditar prontidão da definição | decidir requisitos |
| `specsfy-06-tdd-bdd` | usar BDD da spec para criar TDD e provar RED/GREEN | executar Gherkin ou inventar comportamento |
| `specsfy-05-tasks` | manter tarefas nas seções 14–15 | criar `tasks.md` ou código |
| `specsfy-07-implement` | executar tarefa pronta e registrar evidência | trabalhar sem TDD RED |
| `specsfy-update-spec` | incorporar pedido tardio e reabrir somente os atos afetados | criar nova spec ou implementar a mudança |
| `specsfy-progress` | projetar estado global sem escrita | alterar gates ou checkboxes |
| `specsfy-setup` | garantir contexto persistente e blocos do framework | sobrescrever arquivos de contexto existentes |
| `specsfy-documentator` | reconstruir `docs/` e `.specsfy/PACKAGES.md` a partir do projeto | inventar decisões, relações, finalidades ou URLs |
| `specsfy-aux-stack` | mapear stack com evidência executável | copiar toda a árvore de dependências |
| `specsfy-aux-rules` | registrar regras confirmadas | inventar ou decidir regras |
| `specsfy-aux-database` | manter quadro tabular da persistência | copiar registros, segredos ou substituir schemas |

Se duas skills puderem responder ao mesmo gatilho, ajuste `description` e os
limites antes de publicar.

## Estrutura de uma skill

```text
specsfy-<NN>-<nome>/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── scripts/
├── references/
└── assets/
```

- `SKILL.md` tem frontmatter com `name` e `description`, menos de 500 linhas e
  instruções imperativas.
- `agents/openai.yaml` contém prompt padrão que menciona `$<nome>`.
- Detalhes extensos ficam em referências de um nível com gatilho de leitura.
- Scripts usam Node.js 22 e módulos padrão, retornam códigos úteis e não fazem
  rede, instalação global ou ação destrutiva por padrão.
- Assets são templates ou materiais usados na saída, nunca uma segunda fonte.

## Criar ou alterar uma skill

1. Escreva o cenário BDD e o teste TDD de contrato nesta raiz.
2. Use specs somente como fixtures temporárias quando o comportamento exigir.
3. Execute ambos e registre RED causado pelo comportamento ausente.
4. Para skill nova, inicialize nesta raiz:

   ```bash
   python3 /home/luizeof/.codex/skills/.system/skill-creator/scripts/init_skill.py \
     <nome> --path .
   ```

5. Faça a menor alteração que satisfaz o contrato.
6. Execute testes focais, refatore e repita a regressão desta raiz.
7. Registre a evidência no contrato e na documentação afetada.
8. Valide a skill e os limites Git.

Não existe implementação pequena demais para TDD orientado pelo BDD da spec.
Ajuste a profundidade do teste à consequência possível, mas não pule RED.

## MCR-10

`specsfy-02-backlog` e `specsfy-03-specify` usam a referência canônica
`specsfy-03-specify/references/mcr-10.md`.

Antes de perguntar:

1. preserve a formulação original;
2. distinga pedido literal e finalidade;
3. identifique termos ambíguos, equivalentes e derivados;
4. analise silenciosamente as dez categorias aplicáveis;
5. separe declaração, inferência, hipótese, decisão, conflito e aberto;
6. selecione uma lacuna real de maior impacto para a rodada numerada.

As categorias são lentes adaptativas, não um questionário. Finalidade,
evidência, privacidade, observabilidade, reversibilidade e consequências de
falha são preocupações adicionais do método.

Toda skill que formular perguntas aplica o `Contrato de perguntas numeradas`
de `Spec.md`: exatamente uma pergunta por rodada, três ou mais opções
numeradas, `Escrever outra resposta`, `Gere outras opções` e `Avançar` desde a
primeira rodada, até o máximo de oito perguntas por área. Cada `SKILL.md`
declara seu modo de interação.

## Validação

No diretório `skills/`:

```bash
uv run --quiet --with pyyaml python \
  /home/luizeof/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  specsfy-<NN>-<nome>
```

Ainda nesta raiz:

```bash
Execute os testes focais declarados pelo módulo alterado.
```

Os arquivos em `tests/features/` preservam BDD como referência e não são
executados. A prova automatizada pertence aos testes unitários derivados.

Não crie caches ou artefatos transitórios durante as validações.

## Condições de publicação

- frontmatter e metadata válidos;
- gatilhos positivos e limites negativos claros;
- referências com origem, data e distinção entre fonte e adaptação;
- ausência de placeholders, caches e links quebrados;
- RED válido nos testes TDD informados pelo BDD, com GREEN atual;
- regressão completa e rastreabilidade aprovadas;
- tarefas e seis itens de checklist concluídos, incluindo a revisão `VISUAL`;
- nenhum arquivo pertencente a outro repositório no diff.
