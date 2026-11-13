# 0004 Gates e verificação

Status: done

## Goal

O CI e o agente rodam os gates do método com um comando e um exit code
estável: 0 aprovado, 10 reprovado. Substitui as chamadas diretas aos scripts
de validação.

## Behavior

`gate spec <spec> [--allow-draft]`, `gate tasks <spec> [--allow-draft]`, `gate interface <spec>`, `gate trace <spec> [--kinds]
[--full-chain] [--minimum-tests]`, `gate acceptance <spec>`, `gate evidence
<spec> [--delivery] [--task] [--attestation]`, `gate findings <spec>` e
`gate database [--command]`. `verify [--boundary local|git|ci]
[--attestation <arquivo>]` roda a política inteira; é a entrada do CI.

## Design

`src/cli/commands/gates.ts` com definições `gate: true` sobre
`validate_spec`, `validate_tasks`, `validate_interface_tasks`,
`check_traceability`, `verify_acceptance`, `verify_evidence`,
`review_findings`, `check_database_safety` e `verify_repo`. O `verify_repo`
chama os scripts com `node` dentro do projeto; o binário passa
`SPECSFY_SKILLS_DIR` e garante um `node` no `PATH` (o próprio binário com
`BUN_BE_BUN=1`) quando o Node.js não existir.

## Surface

- Adiciona os commands `gate spec|tasks|interface|trace|acceptance|evidence|findings|database`
  e `verify`; exit codes 6, 10.
- Adiciona as tools `gate_spec`, `gate_tasks`, `gate_interface`,
  `gate_trace`, `gate_acceptance`, `gate_evidence`, `gate_findings`,
  `gate_database` e `verify` (efeito `read`).
- Adiciona a setting `gate.timeoutSeconds`.

## Tasks

- [x] Definições dos gates `#termfy-cli`
- [x] `verify` sem dependência de Node.js `#termfy-cli`
- [x] Tools MCP `#termfy-mcp`
- [x] Testes com o projeto `example/` `#termfy-test`

## Tests

- [x] `gate spec` em spec válida sai com 0
- [x] `gate spec` em spec inválida sai com 10 e lista os problemas no `--json`
- [x] `verify --json` devolve `result`

## Notes

- 2026-11-13: `gate tasks` não expõe `--delivery`: o `validate_tasks.mjs` não
  lê essa flag e já repassa `--delivery` ao `verify_evidence` nas specs em
  Reviewing ou Complete. `gate acceptance` ganhou `--attestation`, que o script
  aceita.
