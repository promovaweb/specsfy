# 0010 Skills chamam o binário

Status: draft

## Goal

As skills base do framework passam a orientar o agente a usar o `specsfy`
(commands ou tools MCP) em vez de `node scripts/<arquivo>.mjs`. Os scripts
continuam nas skills como alternativa quando o binário não está instalado.

## Behavior

Cada `SKILL.md` que cita um script mostra primeiro o command equivalente do
`specsfy` e a tool MCP, e mantém o script como alternativa. A documentação
do usuário (`docs/user/`) descreve o novo CLI.

## Design

Edição de `skills/*/SKILL.md`, `skills/AGENTS.md`, `skills/CLAUDE.md` e
`docs/user/cli*.md`. Nenhum script muda.

## Surface

Nenhuma mudança de superfície.

## Tasks

- [ ] Atualizar as skills base `#termfy-docs`
- [ ] Atualizar `docs/user/cli.md` e `cli-reference.md` `#termfy-docs`

## Tests

- [ ] `npm test` do framework continua verde

## Notes
