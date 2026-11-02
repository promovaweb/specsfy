/** Confere o progresso da skill com resíduos e exemplos de código na spec. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, temporary, put, node } from '../../tests/helpers.mjs';

test('#51: skill conta checklist da tarefa e localiza resíduos', t => {
  const root = temporary(t);
  put(root, 'specs/completed/0001-exemplo/spec.md', '| Formato | Specsfy/2.0 |\n| Status | Complete |\n| Definition Gate | Passed |\n| Plan Gate | Passed |\n| Delivery Gate | Passed |\n### 14. Tarefas\n  - [ ] **PREP**: Rascunho.\n- [x] T001 [DOC] Documentar docs/a.md — Refs: FR-001 — Depends: none\n  - [x] **PREP**: Preparado.\n  - [ ] **VERIFY**: Conferir.\n```markdown\n- [ ] T002 [DOC] Exemplo docs/b.md — Refs: FR-001 — Depends: none\n```\n### 15. Evidências\n  - [ ] **PREP**: Outro rascunho.\n');
  const result = node(join(ROOT, 'skills/specsfy-progress/scripts/progress.mjs'), [root, '--json']);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout), spec = report.specs[0];
  assert.equal(spec.tasks.total, 1);
  assert.deepEqual(spec.checklists, { complete: 1, total: 2, percent: 50 });
  assert.deepEqual(spec.orphan_checklist_lines, [7, 15]);
  assert.equal(spec.other_checkboxes.total, 2);
  assert.equal(report.summary.orphan_checklist_items, 2);
});
