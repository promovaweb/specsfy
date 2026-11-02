/** Porta os contratos da PR #44 para execução Node pelo binário versionado. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { inboxFixture, processCapture, CAPTURE, CAPTURE_CONTENT, ORIGINAL } from './inbox-fixtures.mjs';
test('Inbox process arquiva captura com aprovação explícita e atualiza os vínculos', t => {
  const { root, spec } = inboxFixture(t), result = processCapture(root);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const payload = JSON.parse(result.stdout), target = join(root, 'specs/inbox/processed', CAPTURE);
  assert.equal(payload.status, 'Processada'); assert.equal(payload.to, 'specs/inbox/processed/' + CAPTURE);
  assert.deepEqual(payload.updated_references, ['specs/defined/0007-avisos-de-atraso/spec.md']);
  assert.ok(!existsSync(join(root, 'specs/inbox', CAPTURE)));
  const source = readFileSync(target, 'utf8');
  for (const text of ['| Status | Processada |', '| Spec derivada | specs/defined/0007-avisos-de-atraso/spec.md |', '| Processada em | ', ORIGINAL]) assert.ok(source.includes(text), text);
  assert.ok(readFileSync(spec, 'utf8').includes('specs/inbox/processed/' + CAPTURE));
});
for (const [label, folder, rows] of [
  ['gate pendente', 'draft', '| Status | Draft |\n| Definition Gate | Pending |\n'],
  ['pasta Draft com gate Passed', 'draft', '| Status | Defined |\n| Definition Gate | Passed |\n'],
  ['Status Draft com gate Passed', 'defined', '| Status | Draft |\n| Definition Gate | Passed |\n'],
  ['gate ausente', 'defined', '| Status | Defined |\n'],
  ['Status ausente', 'defined', '| Definition Gate | Passed |\n'],
  ['gate em exemplo cercado', 'defined', '| Status | Defined |\n\n## Exemplo\n\n```markdown\n| Definition Gate | Passed |\n```\n'],
  ['gate em tabela do corpo', 'defined', '| Status | Defined |\n\n## Histórico\n\n| Definition Gate | Passed |\n'],
]) test('Inbox process preserva captura e referências: ' + label, t => {
  const { root, spec } = inboxFixture(t, folder, rows), before = readFileSync(spec, 'utf8'), result = processCapture(root);
  assert.equal(result.status, 1, result.stdout + result.stderr); assert.match(result.stderr, /Definition Gate/);
  assert.equal(readFileSync(join(root, 'specs/inbox', CAPTURE), 'utf8'), CAPTURE_CONTENT);
  assert.equal(readFileSync(spec, 'utf8'), before);
  assert.ok(!existsSync(join(root, 'specs/inbox/processed')));
});
