---
name: specsfy-07-behavioral-audit
description: "Gate complementar de auditoria comportamental. Use para verificar se requisitos sensíveis (criptografia, fiscal, pagamentos, prazos legais, integrações externas e infraestrutura) possuem cobertura real de caminhos tristes (sad path, exceções, status 4xx/5xx) e não apenas checagens rasas (assertFileExists, mocks estáticos)."
---

# Auditoria Comportamental de Testes e Requisitos Sensíveis

## Visão Geral

O `specsfy-07-behavioral-audit` roda **após** a verificação de rastreabilidade documental (`check_traceability.mjs`) e **antes** de marcar `Delivery Gate: Passed`.

Enquanto o `check_traceability.mjs` valida que os marcadores `SPECSFY:` existem para todos os IDs, o `behavioral_audit.mjs` inspeciona se os testes vinculados a **requisitos sensíveis** de fato exercitam cenários de falha esperada (*sad path*, rejeições, exceções, status HTTP 4xx/5xx) e alerta sobre asserções rasas ou incompletas.

## Uso

```bash
node .agents/skills/specsfy-07-behavioral-audit/scripts/behavioral_audit.mjs <spec.md> <tests_dir> [--min-sad-path N]
