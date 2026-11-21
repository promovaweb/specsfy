---
name: specsfy-setup
description: Cuida do contexto persistente de um projeto Specsfy em cinco modos. Modo setup, prepara, reconcilia e monitora PROJECT.md, DESIGNSYSTEM.MD, INTERFACE.md, STACK, RULES, DATABASE, PACKAGES e USER-PROFILE, confere a proteção do banco de testes, instala os especialistas detectados e preserva projetos com GitHub Spec Kit. Modo stack, atualiza .specsfy/STACK.md pelos manifests. Modo rules, formula e registra regras duráveis em .specsfy/RULES.md. Modo database, mantém .specsfy/DATABASE.md como mapa da persistência conferido contra o código. Modo data-discovery, conversa em linguagem cotidiana sobre as informações que o produto precisa guardar. Use no início de qualquer skill Specsfy, para configurar o projeto, quando o monitor apontar PENDING, quando framework, pacote estrutural, banco, tabela ou migration mudar, quando a pessoa quiser adicionar uma regra ou quando backlog, MVP ou spec dependerem de dados ambíguos. Não use para registrar ideias (specsfy-01-inbox) nem refinar backlog (specsfy-02-backlog).
---

# Contexto do projeto

Esta skill reúne o trabalho com o contexto persistente do projeto: a
preparação e o monitor, o mapa do stack, as regras duráveis, o mapa de dados e
a conversa sobre as informações que o produto guarda. Identifique o modo pelo
pedido, leia a referência do modo por inteiro e siga somente ela.

Garanta que o projeto tem um contexto persistente correto antes de qualquer
outra skill trabalhar. Nenhum modo cria telas, rotas, persistência, backlog,
specs, tarefas ou código.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

Os modos `setup`, `rules` e `data-discovery` perguntam. Os modos `stack` e
`database` não formulam perguntas: quando faltar informação confirmada,
sinalizam o campo pendente para a etapa conversacional responsável.

## Escolher o modo

| Modo | Quando o pedido indica | Leia e siga |
| --- | --- | --- |
| `setup` | início de qualquer skill Specsfy, projeto ainda sem contexto, pedido para configurar o Specsfy ou monitor com `PENDING` | [references/setup.md](references/setup.md) |
| `stack` | monitor com stack pendente, ou framework, linguagem, runtime, pacote estrutural, ferramenta de teste ou persistência mudou | [references/stack.md](references/stack.md) |
| `rules` | monitor com revisão de regras, a pessoa quer adicionar uma regra, uma convenção recorrente precisa virar instrução explícita, ou há conflitos e duplicatas a revisar | [references/rules.md](references/rules.md) |
| `database` | monitor com persistência pendente, banco, tabela, coleção, model persistente, coluna, índice, relação, schema ou migration criado ou alterado, ou conferência do mapa contra o código | [references/database.md](references/database.md) |
| `data-discovery` | backlog, importação do MVP ou spec dependem de informações lembradas pelo sistema que ainda estão ausentes ou ambíguas | [references/data-discovery.md](references/data-discovery.md) |

1. Quando outra skill carrega `$specsfy-setup` sem nomear um modo, o modo é
   `setup`. É essa a execução obrigatória antes de qualquer skill do
   framework, e ela não se chama recursivamente.
2. Os modos `stack`, `rules`, `database` e `data-discovery` começam pelo modo
   `setup`, no caminho curto quando o contexto já foi reconciliado nesta
   conversa. Depois dele, leia a referência do modo pedido.
3. Se o pedido admitir mais de uma leitura razoável, pergunte qual modo a
   pessoa quer, pelo `Contrato de perguntas numeradas`.
4. Um modo pode encaminhar a outro: o `setup` resolve pendências do monitor
   pelos modos `stack`, `rules` e `database`, o `stack` passa ao `database`
   quando a persistência também mudou, e o `database` preserva o que o
   `data-discovery` confirmou. Ao trocar de modo, leia a referência do novo
   modo antes de continuar.

## Commands e scripts

| Ação | Modo | Command | Tool MCP | Script alternativo |
| --- | --- | --- | --- | --- |
| ler as fontes do projeto | `setup` | `specsfy context inspect --project <raiz>` | `context_inspect` | `inspect_project.mjs` |
| reconciliar o contexto | `setup` | `specsfy context setup --project <raiz>` | `context_setup` | `setup_context.mjs` |
| localizar fontes de interface | `setup` | `specsfy context interface --project <raiz>` | `context_interface` | `inspect_interface.mjs` |
| monitorar pendências | todos | `specsfy context monitor --project <raiz> --check` | `context_monitor` | `monitor_context.mjs` |
| conferir o banco de testes | `setup` | `specsfy gate database --project <raiz>` | `gate_database` | `check_database_safety.mjs` |
| estimar o contexto de uma spec | `setup` | `specsfy context usage <spec> --json` | `context_usage` | `analyze_context.mjs` |
| atualizar o stack | `stack` | `specsfy context stack --project <raiz>` | `context_stack` | `update_stack.mjs` |
| registrar uma regra | `rules` | `specsfy context rule --project <raiz> --section "<tema>" --rule "<regra>"` | `context_rule` | `add_rule.mjs` |
| atualizar o mapa de dados | `database` | `specsfy context database --project <raiz>` | `context_database` | `update_database.mjs` |
| registrar dados confirmados | `data-discovery` | `specsfy context data --project <raiz> --name "<informação>"` | `context_data` | `registrar_dados_conversados.mjs` |

Os scripts ficam em `.agents/skills/specsfy-setup/scripts/`. Use um script
somente quando o binário `specsfy` não estiver instalado. A sincronização com
GitHub Spec Kit (`sync_speckit_context.mjs`) roda dentro do
`specsfy context setup`.

## Regras que valem em todos os modos

- Reutilize a raiz confirmada na conversa e passe-a em `--project <raiz>` a
  cada command. Contexto, specs, testes e código ficam dentro dessa raiz.
- Nunca substitua um arquivo de contexto existente. Conteúdo humano fora dos
  blocos `specsfy:*:start` e `specsfy:*:end` continua intacto.
- Registre no contexto o que a fonte executável sustenta, o que a pessoa
  confirmou e escolhas expressamente delegadas, com fonte e alcance. Hipótese
  e sugestão ficam na conversa.
- Não registre segredo, token, string de conexão, valor de `.env`, dado de
  produção nem dado pessoal sensível.
- Em Laravel, nenhum teste roda antes de `specsfy gate database` retornar
  `SAFE`, e comandos que apagam banco ou schema são sempre ignorados.
- Feche cada modo com `specsfy context monitor --project <raiz> --check` e
  resolva todo `PENDING` antes de devolver o controle. Em cópia sem Git,
  siga a recuperação de `BASELINE` descrita em
  [Monitorar e resolver pendências](references/setup.md#monitorar-e-resolver-pendências).
- No modo `setup`, registre Laravel Octane com Open Swoole ausente e, em
  Laravel com React, ausência de shadcn/ui ou ReUI em `Pendências de stack`.
  Aprove o setup quando os demais critérios passarem e encaminhe a instalação
  ao planejamento como pré-condição do deploy.
- Os limites completos de cada modo estão na referência correspondente.
