/** Preserva os cinco contratos de migrations anteriormente executados por unittest. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, temporary, put, node } from '../../tests/helpers.mjs';

const tasks = join(ROOT, 'skills/specsfy-05-tasks/scripts/validate_tasks.mjs');
const evidence = join(ROOT, 'skills/specsfy-07-implement/scripts/verify_evidence.mjs');
const checklist = ['PREP', 'EXECUTE', 'VERIFY', 'VISUAL', 'EVIDENCE', 'IMPROVE'].map(label => `  - [ ] **${label}**: Conferir contrato.\n`).join('');
const base = '| Formato | Specsfy/2.0 |\n| Status | Defined |\n| Definition Gate | Passed |\n| Plan Gate | Pending |\n#### US-001 — Cadastro\n#### AC-001 — Criação\n#### AC-002 — Validação\n#### AC-003 — Falha\n- **FR-001**: Persistir cliente.\n- **NFR-001**: Manter integridade.\n### 14. Tarefas\n';

for (const [description, expected, present] of [
  ['[CODE] [US-001] Criar tabela de clientes em app/Models/Cliente.php', 'sem uma tarefa [MIGRATION]', true],
  ['[CODE] [US-001] Consultar clientes no banco em app/Queries/ListarClientes.php', 'sem uma tarefa [MIGRATION]', false],
  ['[CODE] [MIGRATION] [US-001] Criar tabela em app/Models/Cliente.php', 'diretório de migrations', true],
]) {
  test('planejamento: ' + description, t => {
    const root = temporary(t);
    const spec = put(root, 'spec.md', base + `- [ ] T004 ${description} — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: none\n` + checklist);
    const result = node(tasks, [spec, '--allow-draft', '--json']);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.errors.some(error => error.includes(expected)), present, result.stdout);
  });
}

const completed = '| Evidence Contract | 1 |\n#### US-001 — Cadastro\n#### AC-001 — Criação\n- **FR-001**: Persistir cliente.\n### 14. Tarefas\n- [x] T004 [CODE] [MIGRATION] [US-001] Criar tabela em database/migrations/2026_create_clients.php — Refs: US-001, FR-001, AC-001 — Depends: none\n';

test('conclusão exige aplicação e consulta com saída zero', t => {
  const root = temporary(t);
  put(root, 'database/migrations/2026_create_clients.php', '<?php // migration\n');
  const record = { task: 'T004', refs: ['US-001', 'FR-001', 'AC-001'], files: ['database/migrations/2026_create_clients.php'], commands: [{ run: 'php artisan test', exit: 0 }] };
  const write = () => put(root, 'specs/completed/0001-clientes/spec.md', completed + `  <!-- specsfy:evidence ${JSON.stringify(record)} -->\n`);
  let result = node(evidence, [write(), root, '--json']);
  for (const text of ['aplicação da migration ausente', 'conferência da migration ausente']) assert.ok(JSON.parse(result.stdout).errors.some(error => error.includes(text)));
  record.commands = ['php artisan migrate --env=testing', 'php artisan migrate:status --env=testing'].map(run => ({ run, exit: 0 }));
  result = node(evidence, [write(), root, '--json']);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('delivery recusa migration aberta, aceita seu planejamento', t => {
  const root = temporary(t);
  const spec = put(root, 'spec.md', completed.replace('- [x]', '- [ ]'));
  const planning = node(evidence, [spec, root, '--json']);
  assert.equal(planning.status, 0, planning.stdout + planning.stderr);
  const delivery = node(evidence, [spec, root, '--json', '--delivery']);
  assert.ok(JSON.parse(delivery.stdout).errors.some(error => error.includes('migration planejada ainda não foi concluída')));
});
