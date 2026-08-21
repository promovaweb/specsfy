---
name: specsfy-specialist-hermes
description: "Autorar skills e plugins do Hermes Agent e configurar/operar modelos, providers, gateway, cron, memória e o CLI. Use quando o projeto contém `.hermes.md`, `HERMES.md` ou diretório `.hermes/` e a tarefa toca SKILL.md, frontmatter, `references/`, `scripts/`, `config.yaml`, plugins, cron ou comandos `hermes`; não use para revisão genérica de código — combine com `specsfy-specialist-code-review` quando a tarefa for auditar a qualidade de um diff comum."
---

# Hermes Agent

## Quando usar

- Acionar quando o repositório tem `.hermes.md`, `HERMES.md` ou um diretório
  `.hermes/`, e a tarefa autorar/editar SKILL.md (frontmatter, `references/`,
  `templates/`, `scripts/`), plugins, cron jobs, ou configurar modelos,
  providers, gateway, memória ou toolsets do Hermes Agent.
- Acionar também para instalar/atualizar o Hermes, diagnosticar com
  `hermes doctor`, ajustar `config.yaml` via CLI, subir o gateway ou operar
  skills/toolsets/plugins.
- Não acionar para revisão genérica de um diff de código comum — usar
  `$specsfy-specialist-code-review` e trazer de volta só a parte de
  skill/config do Hermes.
- Combinar com `$specsfy-specialist-code-review` quando a mudança misturar
  código de aplicação com artefatos do Hermes; cada skill audita a sua
  fronteira sem duplicar a norma da outra.

## Fluxo

1. Descobrir o estado real antes de recomendar: `hermes --version`, o
   `$HERMES_HOME` efetivo (ou `~/.hermes` quando não houver profile ativo) e os
   arquivos já presentes (`config.yaml`, `.env`, `skills/`, `plugins/`). Nunca
   assumir caminho, provider ou versão por memória.
2. Confirmar o alvo da mudança — artefato de skill (SKILL.md + `references/`/
   `templates/`/`scripts/`), plugin, cron job ou configuração (`model`,
   `gateway`, `memory`, `approvals`, `delegation`).
3. Aplicar a edição na camada correta: settings em `config.yaml` SEMPRE via
   `hermes config set <seção>.<chave> <valor>`; segredos só em `.env`;
   artefatos de skill em arquivos versionados. Nunca editar `config.yaml` à mão.
4. Verificar a consistência antes de declarar pronto: frontmatter parseia como
   YAML, `description` ≤ 60 caracteres com ponto final, `name`/`version`/
   `platforms`/`metadata.hermes` presentes, e todo `related_skills` aponta para
   uma skill existente.
5. Validar em runtime com o comando real do ecossistema (`hermes config check`,
   `hermes doctor`, `hermes skills check`, `hermes mcp test`, `hermes cron
   list`, `hermes gateway status`).
6. Registrar na spec o risco residual — por exemplo, mudança de toolset ou de
   model que só faz efeito após `/reset` (novo sessão), preservando o prompt
   cache.

## Padrões

- Settings em `config.yaml`, segredos em `.env` (ou `$HERMES_HOME/.env`) — nunca
  colocar credencial em `config.yaml` nem setting em `.env`.
- Configurar pelo CLI, não por edição manual: `hermes config set
  <seção>.<chave> <valor>`; indentação errada corrompe o arquivo e quebra o
  gateway ao vivo.
- Resolver caminhos de profile por `$HERMES_HOME`, nunca hardcodar `~/.hermes`
  quando houver profile ativo.
- Manter `description` de SKILL.md com no máximo 60 caracteres, uma frase,
  terminada em ponto, sem palavras de marketing e sem repetir o `name` — é o
  gatilho que roda em toda sessão e o índice do sistema trunca aos 57 caracteres.
- Referências longas fora do corpo: conteúdo extenso vai em `references/*.md`,
  `templates/` e `scripts/`, referenciado por caminho relativo, nunca inline.
- Autor humano primeiro no campo `author` de skills contribuídas (ex.
  `Nome (handle), Hermes Agent`), nunca `Hermes Agent` sozinho.
- Sem caminhos locais de máquina em artefatos versionados (skills/plugins):
  usar caminhos relativos ao repo.
- Não quebrar o prompt cache no meio de uma conversa: mudanças de toolsets,
  system prompt ou contexto passado exigem `/reset` (sessão nova), não edição
  a quente.
- Cron jobs que devem notificar a pessoa precisam de `deliver` apontando para
  um canal conectado ao gateway; `deliver` default/origin não entrega nada no
  CLI.

## Antipadrões

- Editar `config.yaml` com `write_file`/`patch` em vez de `hermes config set` —
  sintoma: gateway que deixa de subir após um recuo de indentação.
- Gravar API key ou token em `config.yaml` ou em SKILL.md versionado — expõe o
  segredo no Git e viola a separação settings/secrets.
- `description` genérica ou com o gatilho enterrado além do caractere 57 — a
  skill deixa de rotear e o agente nunca a carrega.
- `related_skills` apontando para skill que não existe no repo — quebra a
  validação e deixa referência órfã.
- Toolset desabilitado no meio de uma tarefa para "economizar contexto" — muda
  o system prompt e invalida o cache; a troca é por `/reset`, não a quente.
- Chamar o especialista para revisar código comum de aplicação que não é
  skill/plugin/config do Hermes — desperdiça a fronteira e desvia a skill de
  code review.

## Validação

- `hermes doctor --fix` — dependências e config consistentes antes de declarar
  o ambiente pronto.
- `hermes config check` — seções ausentes de um config antigo; falha revela
  chave esquecida após migração.
- `hermes skills check` (ou o validador de frontmatter) — `name`, `description`
  ≤ 60 com ponto final, `version`, `platforms` e `metadata.hermes` presentes e
  YAML válido.
- `hermes mcp test <nome>` — servidor MCP alcançável antes de declarar a
  integração funcionando.
- `hermes gateway status` e `hermes cron list` — gateway e jobs reais, não
  supostos.
- Não declarar uma skill "publicável" ou um gateway "operando" sem a evidência
  acima; linguagem absoluta sem prova é proibida.

## Skills relacionadas

- `$specsfy-specialist-code-review` para auditar a qualidade de um diff comum;
  a fronteira deste especialista é a autoria/configuração dos artefatos do
  Hermes (skill, plugin, cron, config), não a revisão de código em geral.

Leia [references/standards.md](references/standards.md) para caminhos,
referência de comandos do CLI, seções de `config.yaml`, toolsets, regras de
frontmatter de skill e fontes oficiais do Hermes Agent.
