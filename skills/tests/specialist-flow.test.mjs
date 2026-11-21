import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, node, put, read, temporary } from '../../tests/helpers.mjs';

const feature = read('skills/tests/features/especialistas_no_fluxo.feature');
const references = [
  'specsfy-02-backlog/references/specialists.md',
  'specsfy-03-specify/references/specialists.md',
  'specsfy-04-validate/references/specialists.md',
  'specsfy-05-tasks/references/specialists.md',
  'specsfy-06-implement/references/specialists-implement.md',
  'specsfy-06-implement/references/specialists-tests.md',
  'specsfy-update-spec/references/specialists.md',
];

test('A mesma demanda recebe a mesma indicação em cada fase', t => {
  assert.ok(feature.includes('Scenario: ' + t.name));
  const tables = references.map(path => {
    const content = read('skills/' + path);
    const table = content.match(/^\| Sinal na demanda, na spec ou no código \| Especialista \| Modo \|\n(?:\|[^\n]+\|\n)+/m);
    assert.ok(table, path);
    assert.match(content, /--skill specsfy-specialist-<nome> --agent universal --copy --full-depth/);
    return table[0];
  });
  for (const table of tables) assert.equal(table, tables[0]);
  const catalog = JSON.parse(read('specialists/catalog.json')).skills;
  const names = [...tables[0].matchAll(/^\| [^|]+ \| `([a-z-]+)` \|/gm)].map(match => match[1]);
  assert.deepEqual([...new Set(names)].sort(), catalog.map(skill => skill.name.replace('specsfy-specialist-', '')).sort());
  for (const name of new Set(names)) {
    const specialist = read(`specialists/specsfy-specialist-${name}/SKILL.md`);
    const modes = [...specialist.matchAll(/^### Modo (\S+)$/gm)].map(match => match[1]);
    const rows = tables[0].split('\n').filter(line => line.includes('| `' + name + '` |'));
    for (const row of rows) {
      const mode = row.split('|')[3].trim().replaceAll('`', '');
      assert.ok((modes.length ? modes : ['padrão']).includes(mode), row);
    }
  }
});

test('Uma tarefa especializada preserva o contrato da seção 14', t => {
  assert.ok(feature.includes('Scenario: ' + t.name));
  const spec = read('skills/templates/Spec.md');
  assert.match(spec, /^\| Especialistas \| \|$/m);
  assert.match(spec, /^### 8\. Plano técnico\n(?:(?!### ).*\n)*?#### Especialistas\n\n\| Especialista \| Modo \| Sinal que o puxou \| Fases \|$/m);

  const annotation = 'Especialista: $specsfy-specialist-ui-components (components)';
  const tasks = read('skills/templates/Tasks.md');
  const task = tasks.match(/^- \[ \] T006 .+\n(?: {2}[-<].*\n)+/m)?.[0];
  assert.ok(task?.includes(annotation));
  assert.match(spec, /^  - Especialista: \$specsfy-specialist-ui-components \(components\)$/m);
  const path = put(temporary(t), 'spec.md', [
    spec.slice(0, spec.indexOf('## Ato I')).replace('| Especialistas | |', '| Especialistas | ui-components |')
      .replace('| Status | Draft |', '| Status | Planned |').replaceAll('Gate | Pending |', 'Gate | Passed |'),
    spec.slice(spec.indexOf('### 8.'), spec.indexOf('### 9.')).replace(
      '| --- | --- | --- | --- |',
      '| --- | --- | --- | --- |\n| ui-components | components | Tela React | tasks, implement |',
    ),
    '### 14. Tarefas\n',
    task.replace('Depends: T005', 'Depends: none'),
    '### 15. Ordem de execução',
  ].join('\n'));
  const result = node(join(ROOT, 'skills/specsfy-06-implement/scripts/next_task.mjs'), [path, '--json']);
  assert.equal(result.status, 0, result.stderr);
  const ready = JSON.parse(result.stdout).ready[0];
  assert.equal(ready.id, 'T006');
  assert.equal(ready.progress.total, 6);
  assert.equal(ready.next_item.key, 'PREP');
});
