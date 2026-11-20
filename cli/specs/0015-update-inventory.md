# 0015 Update pelo inventário de skills

Status: done

## Goal

Fazer o `specsfy update` manter o projeto sempre de acordo com o inventário
de skills do framework, pelo CLI `skills`, para que criar, renomear ou
aposentar uma skill chegue aos projetos sem passo manual.

## Behavior

`skills/inventory.json` lista as skills do framework com a categoria, os
nomes trocados (`renamed`, do nome antigo para a skill atual) e as skills
aposentadas (`retired`). `specsfy update` clona o repositório na tag
`v<versão>` do binário, lê o inventário do clone e reconcilia o projeto:
instala as skills do framework que faltam, atualiza as que mudaram, remove as
renomeadas e as aposentadas, atualiza os especialistas instalados e os
arquivos gerenciados. Sem essa tag no repositório, ou com `--latest`, usa a
branch padrão. Skill com alteração local é mantida e listada em `kept`;
`--force` a substitui ou remove. `--check` não escreve nada, mostra o plano
e sai com 10 quando há diferença. Projeto sem nenhuma skill do framework não
é alterado. `install` aceita `--latest` e usa a mesma tag. `upgrade`
lembra de rodar `update`; `doctor --project` e a aba Skills avisam, sem
rede, quando os nomes instalados diferem do inventário do binário.

## Design

`src/domain/inventory.ts` valida o arquivo (`parseInventory`), embute o da
versão do binário (`EMBEDDED_INVENTORY`) e compara nomes
(`inventoryDrift`). Um `renamed` aponta sempre para uma skill atual ou
para um especialista. `SkillInstaller.reconcile(check)` monta o
`UpdatePlan` e executa com `skills add` e `skills remove`, dentro do
rollback de instalação. As listas `FRAMEWORK_SKILLS`, `BASE_SKILLS`,
`AUXILIARY_SKILLS` e `RENAMED_BASE_SKILLS` passam a derivar do inventário.

## Surface

- Altera os commands `update` e `skills update`: options `--check` e
  `--latest`, exit code 10 e os campos `check`, `in_sync` e `plan` no
  `--json`.
- Altera o command `install`: option `--latest`.
- Altera a tool `framework_update`: inputs `check` e `latest`.
- Altera o command `doctor`: check `inventory` com `--project`.
- Altera a screen `skills`: linha `Inventory`.

## Tasks

- [x] `skills/inventory.json` e `src/domain/inventory.ts` `#termfy-config`
- [x] `SkillInstaller.reconcile` com plano, tag do binário e `kept` `#termfy-cli`
- [x] `update --check`, `--latest` e relatório em texto `#termfy-cli`
- [x] Tool `framework_update`, `doctor --project`, aba Skills e aviso do `upgrade` `#termfy-mcp`
- [x] Documentação de usuário, de desenvolvimento e embutida `#termfy-docs`

## Tests

- [x] `tests/domain/inventory.test.ts`: validação do arquivo, pastas do
  framework e drift por nomes
- [x] `tests/framework/framework.test.ts`: skill faltando, `--check` com
  exit 10 sem escrita, renomeada, aposentada, alteração local mantida e
  `--force`, tag do binário e `--latest`, projeto sem framework e relatório
  em texto
- [x] Update real, com o CLI `skills` embutido, numa cópia do `example/`

## Notes

- 2026-11-20: pedido do Luiz para o `update` manter as skills de acordo com
  o inventário usando o `npx skills`. Prepara a consolidação das skills base.
