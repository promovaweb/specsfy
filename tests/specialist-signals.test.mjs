/** The signal tables of the base skills come from the catalog triggers. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, read } from './helpers.mjs';
import { SIGNAL_FILES, signalsTable } from '../scripts/specialist-signals.mjs';

const catalog = JSON.parse(read('specialists/catalog.json'));

test('as tabelas de sinais das skills base coincidem com o catálogo', () => {
  const result = spawnSync(process.execPath, [join(ROOT, 'scripts/specialist-signals.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  for (const path of SIGNAL_FILES) assert.ok(read(path).includes(signalsTable(catalog)), path);
});
test('todo especialista tem sinais com palavras-chave e modos existentes', () => {
  for (const entry of catalog.skills) {
    assert.ok(entry.triggers?.length, `${entry.name}: triggers`);
    const skill = readFileSync(join(ROOT, 'specialists', entry.name, 'SKILL.md'), 'utf8');
    for (const trigger of entry.triggers) {
      assert.ok(trigger.signal && trigger.keywords?.length, `${entry.name}: ${trigger.signal}`);
      if (trigger.mode) assert.ok(skill.includes(`| ${trigger.mode} |`), `${entry.name}: modo ${trigger.mode} ausente na tabela Quando usar`);
    }
  }
});
test('modos do catálogo existem no especialista e têm seção no guia', () => {
  const inventory = JSON.parse(read('skills/inventory.json'));
  const absorbed = [];
  for (const entry of catalog.skills) {
    const slug = entry.name.replace('specsfy-specialist-', '');
    const skill = readFileSync(join(ROOT, 'specialists', entry.name, 'SKILL.md'), 'utf8');
    const guide = read(`docs/user/specialists/${slug}.md`);
    for (const mode of entry.modes ?? []) {
      assert.ok(skill.includes(`| ${mode.name} |`), `${entry.name}: modo ${mode.name}`);
      assert.match(guide, new RegExp(`^## ${mode.title.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}$`, 'm'), `${slug}.md: ## ${mode.title}`);
      if (mode.absorbs) absorbed.push(mode.absorbs);
    }
  }
  // Every merged specialist points to the mode that absorbed it (the site 301 uses the anchor).
  const renamed = Object.keys(inventory.renamed).filter(name => name.startsWith('specsfy-specialist-'));
  assert.deepEqual([...absorbed].sort(), renamed.sort());
});
