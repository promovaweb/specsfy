/** Exercita a identificação do monorepo em repositórios locais descartáveis. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { collect, normalizeRemote } from '../.agents/skills/specsfy-monorepo-documentator/scripts/collect-monorepo-evidence.mjs';

/** Cria um Git com identidade exclusiva do teste, sem alterar configuração global. */
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'specsfy-collector-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { stdio: 'pipe' });
  git('init', '--quiet');
  git('remote', 'add', 'origin', 'https://github.com/promovaweb/specsfy.git');
  for (const module of ['brand', 'skills', 'docs', 'example', 'specsfy', 'specialists', 'cli']) mkdirSync(join(root, module));
  writeFileSync(join(root, 'README.md'), '# Teste\n');
  git('add', 'README.md');
  git('-c', 'user.name=Teste', '-c', 'user.email=teste@example.invalid', 'commit', '--quiet', '-m', 'fixture');
  return { root, git };
}

test('normaliza SSH e HTTPS', () => {
  assert.equal(normalizeRemote('git@github.com:promovaweb/specsfy.git'), 'https://github.com/promovaweb/specsfy');
  assert.equal(normalizeRemote('https://github.com/promovaweb/specsfy.git/'), 'https://github.com/promovaweb/specsfy');
});
test('coleta fontes e estado sem escrita', t => {
  const { root } = fixture(t);
  const result = collect(root);
  assert.equal(result.dirty, false);
  assert.equal(result.tracked_files, 1);
  assert.equal(result.modules.length, 8);
  assert.deepEqual(result.modules[0].sources, ['README.md']);
  writeFileSync(join(root, 'README.md'), '# Alterado\n');
  assert.equal(collect(root).dirty, true);
});
test('recusa subdiretório e remoto de outro projeto', t => {
  const { root, git } = fixture(t);
  assert.throws(() => collect(join(root, 'cli')), /raiz Git/);
  git('remote', 'set-url', 'origin', 'https://github.com/promovaweb/outro');
  assert.throws(() => collect(root), /remoto origin/);
});
test('recusa módulo com Git independente', t => {
  const { root } = fixture(t);
  execFileSync('git', ['init', '--quiet', join(root, 'cli')]);
  assert.throws(() => collect(root), /raiz Git divergente/);
});
