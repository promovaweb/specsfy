/** Exercita rastreabilidade e predecessores TDD usando os validadores reais. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, read, temporary, put, node } from '../../tests/helpers.mjs';

const trace = join(ROOT, 'skills/specsfy-06-implement/scripts/check_traceability.mjs');
const tasks = join(ROOT, 'skills/specsfy-05-tasks/scripts/validate_tasks.mjs');
const header = '| Campo | Valor |\n| --- | --- |\n| Formato | Specsfy/2.0 |\n| Status | Defined |\n| Definition Gate | Passed |\n| Plan Gate | Pending |\n#### US-001 — Exemplo\n#### AC-001 — Exemplo\n#### AC-002 — Limite\n#### AC-003 — Falha\n- **FR-001**: Exemplo.\n- **NFR-001**: Exemplo. **Verificação**: Pest.\n### 14. Tarefas\n';
const checklist = '  - [ ] **PREP**: Confirmar baseline.\n  - [ ] **EXECUTE**: Produzir teste.\n  - [ ] **VERIFY**: Observar RED.\n  - [ ] **VISUAL**: Conferir bordas, espaçamentos, margens, padding e tipografia; Não aplicável porque a tarefa só produz teste.\n  - [ ] **EVIDENCE**: Registrar resultado.\n  - [ ] **IMPROVE**: Revisar aprendizado.\n';
const task = (id, acceptance) => `- [ ] ${id} [TEST] [TDD] [US-001] Derivar teste em tests/Feature/ExampleTest.php — Refs: US-001, FR-001, NFR-001, ${acceptance} — Depends: none\n`;
const validate = (root, text) => {
  const spec = put(root, 'spec.md', text);
  const result = node(tasks, [spec, '--allow-draft', '--json']);
  assert.ok(result.stdout.trim(), result.stderr);
  return JSON.parse(result.stdout);
};

test('marcadores TDD cobrem requisitos de aceitação derivados do BDD', t => {
  const root = temporary(t);
  const spec = put(root, 'specs/specs/0001-example/spec.md', '#### US-001 — Exemplo\n#### AC-001 — Exemplo\n- **FR-001**: Exemplo.\n');
  const path = 'tests/Feature/ExampleAcceptanceTest.php';
  put(root, path, "<?php\n" + ['estado', 'limite', 'falha'].map(name => `// SPECSFY: US-001 FR-001 AC-001\ntest('${name}', function () {});\n`).join(''));
  const result = node(trace, [spec, root, '--kinds', 'FR,AC', '--json']);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.ok(result.stdout.includes('"covered": 2'));
  assert.ok(result.stdout.includes(path));
});
test('arquivo feature isolado serve de referência sem comprovar cobertura', t => {
  const root = temporary(t);
  const spec = put(root, 'specs/specs/0001-example/spec.md', '#### AC-001 — Exemplo\n- **FR-001**: Exemplo.\n');
  put(root, 'tests/features/example.feature', '@FR-001 @AC-001\nFeature: Exemplo\n  Scenario: Exemplo\n    Given estado\n    When ação\n    Then resultado\n');
  const result = node(trace, [spec, root, '--kinds', 'FR,AC', '--json']);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.ok(result.stdout.includes('"covered": 0'));
});
test('plano aceita três predecessores Pest TDD antes da implementação', t => {
  const root = temporary(t);
  const predecessors = ['AC-001', 'AC-002', 'AC-003'].map((ac, index) => task(`T00${index + 1}`, ac) + checklist).join('');
  const result = validate(root, header + predecessors + '- [ ] T004 [CODE] [US-001] Implementar em app/Example.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T001, T002, T003\n' + checklist);
  assert.deepEqual(result.errors, []);
  assert.equal(result.counts.tdd, 3);
});
test('tarefas exigem revisão visual antes do registro do resultado', t => {
  const root = temporary(t);
  const incomplete = checklist.replace(/^.*\*\*VISUAL\*\*.*\n/m, '');
  const result = validate(root, header + ['AC-001', 'AC-002', 'AC-003'].map((ac, index) => task(`T00${index + 1}`, ac) + incomplete).join(''));
  assert.ok(result.errors.some(error => error.includes('VISUAL')), result.errors.join('\n'));
});
test('plano recusa menos de três predecessores TDD na feature e na história', t => {
  const root = temporary(t);
  const result = validate(root, header + task('T001', 'AC-001, AC-002, AC-003') + checklist + '- [ ] T002 [CODE] [US-001] Implementar em app/Example.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T001\n' + checklist);
  for (const message of ['A feature possui 1 predecessor(es) TDD; mínimo exigido: 3.', 'US-001 possui 1 predecessor(es) TDD; mínimo exigido: 3.']) assert.ok(result.errors.includes(message), result.errors.join('\n'));
});
test('caminho para feature não conta como tarefa TDD executável', t => {
  const result = validate(temporary(t), header + '- [ ] T001 [TEST] [US-001] Referenciar cenário em specs/example.feature — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none\n');
  assert.ok(result.errors.includes('A feature possui 0 predecessor(es) TDD; mínimo exigido: 3.'), result.errors.join('\n'));
});

test('projeto copiado sem .git valida evidência a partir da raiz do consumidor', t => {
  const root = temporary(t);
  const predecessors = ['AC-001', 'AC-002', 'AC-003']
    .map((ac, index) => task(`T00${index + 1}`, ac) + checklist).join('');
  const text = '| Evidence Contract | 1 |\n' + header + predecessors;
  const verifier = '.agents/skills/specsfy-06-implement/scripts/verify_evidence.mjs';
  put(root, verifier, read('skills/specsfy-06-implement/scripts/verify_evidence.mjs'));
  put(root, 'nested/project/' + verifier, read('skills/specsfy-06-implement/scripts/verify_evidence.mjs'));
  put(root, 'nested/project/.specsfy/STACK.md', '# Stack\n');
  for (const [path, options] of [
    ['specs/defined/0001-example/spec.md', []],
    ['specs/specs/0002-example/spec.md', []],
    ['nested/project/specs/defined/0001-example/spec.md', []],
    ['nested/project/work/feature/spec.md', []],
    ['export/feature/spec.md', ['--project', root]],
  ]) {
    const spec = put(root, path, text);
    const result = node(tasks, [...options, spec, '--allow-draft', '--json']);
    assert.equal(result.status, 0, result.stdout + result.stderr);
  }
});

test('regressão pós-código não satisfaz a cobertura TDD de um aceite', t => {
  const root = temporary(t);
  const predecessors = task('T001', 'AC-001') + checklist + task('T002', 'AC-002') + checklist;
  const code = '- [ ] T003 [CODE] Implementar em app/Example.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T001, T002\n' + checklist;
  const regression = '- [ ] T004 [TEST] Rodar regressão [TDD] do ciclo anterior em tests/Feature/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-003 — Depends: T003\n' + checklist;
  const result = validate(root, header + predecessors + code + regression);
  assert.equal(result.counts.tdd, 2);
  assert.equal(result.counts.regression, 1);
  assert.ok(result.errors.includes('AC-003 não possui tarefa TDD informada pelo BDD da spec.'));
});
