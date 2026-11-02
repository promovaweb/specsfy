/** Impede reintrodução de scripts Python e de etapas Python no CI do workspace. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';
import { ROOT } from './helpers.mjs';
const ignored = new Set(['.git', 'node_modules', 'vendor', '.venv', '__pycache__']);
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => ignored.has(entry.name) ? [] : entry.isDirectory() ? files(join(directory, entry.name)) : entry.isFile() ? [join(directory, entry.name)] : []);
}
test('fontes do workspace não incluem scripts Python', () => {
  assert.deepEqual(files(ROOT).filter(path => path.endsWith('.py')).map(path => relative(ROOT, path)), []);
});
test('workflows e wrappers Shell executam ferramentas nativas sem Python', () => {
  for (const path of files(join(ROOT, '.github/workflows')).filter(path => /\.ya?ml$/.test(path))) {
    const workflow = parse(readFileSync(path, 'utf8'));
    for (const job of Object.values(workflow.jobs)) for (const step of job.steps ?? []) assert.ok(!/setup-python|setup-uv|\bpython[23]?\b|\buv run\b|\bbehave\b|\bweasyprint\b/i.test(JSON.stringify(step)), relative(ROOT, path));
  }
  for (const path of files(ROOT).filter(path => path.endsWith('.sh'))) assert.ok(!/^\s*(?:exec\s+)?(?:python[23]?|weasyprint|uv\s+run)\b/m.test(readFileSync(path, 'utf8')), relative(ROOT, path));
});
