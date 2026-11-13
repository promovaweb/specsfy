/** Exercita preparação e conferência da release sem Git, rede ou artefatos reais. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { prepare, releaseNotes, verifyReleaseBody } from '../cli/.agents/skills/specsfy-release-cli/scripts/release-changelog.mjs';

/** Cria fontes coerentes e captura seus bytes para testar recusas sem escrita. */
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'specsfy-release-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const cli = join(root, 'cli');
  mkdirSync(join(cli, 'npm'), { recursive: true });
  const files = {
    VERSION: '1.2.3\n',
    'cli/package.json': '{"name":"teste","version":"1.2.3"}\n',
    'cli/npm/package.json': '{"name":"@promovaweb/specsfy","version":"1.2.3"}\n',
    'cli/CHANGELOG.md': '# Changelog\n\n## [Unreleased]\n\n## [1.2.3] - 2026-10-01\n\nAnterior.\n',
    'notes.md': '### Corrigido\n\n- Preserva $& e caracteres acentuados.\n',
  };
  for (const [path, content] of Object.entries(files)) writeFileSync(join(root, path), content);
  return { root, cli, files, notes: join(root, 'notes.md'), changelog: join(cli, 'CHANGELOG.md') };
}

test('prepara versão maior sem alterar as notas ou a seção anterior', t => {
  const f = fixture(t);
  prepare(f.cli, '1.10.0', '2026-11-02', f.notes);
  assert.equal(readFileSync(join(f.root, 'VERSION'), 'utf8'), '1.10.0\n');
  assert.equal(JSON.parse(readFileSync(join(f.cli, 'package.json'))).version, '1.10.0');
  assert.equal(JSON.parse(readFileSync(join(f.cli, 'npm/package.json'))).version, '1.10.0');
  assert.equal(releaseNotes(f.changelog, '1.10.0'), f.files['notes.md']);
  assert.equal(releaseNotes(f.changelog, '1.2.3'), 'Anterior.\n');
});

for (const [version, date] of [['1.2.3','2026-11-02'], ['1.2.2','2026-11-02'], ['01.3.0','2026-11-02'], ['1.3.0-rc.1','2026-11-02'], ['latest','2026-11-02'], ['1.3.0','2026-02-30'], ['1.3.0','2026-13-01']]) {
  test('recusa versão ou data inválida sem escrita: ' + version + ' ' + date, t => {
    const f = fixture(t);
    assert.throws(() => prepare(f.cli, version, date, f.notes));
    for (const [path, content] of Object.entries(f.files)) assert.equal(readFileSync(join(f.root, path), 'utf8'), content);
  });
}

test('recusa versões atuais divergentes', t => {
  const f = fixture(t);
  writeFileSync(join(f.root, 'VERSION'), '1.2.2\n');
  assert.throws(() => prepare(f.cli, '1.3.0', '2026-11-02', f.notes), /divergem/);
});

test('recusa seção de destino duplicada', t => {
  const f = fixture(t);
  writeFileSync(f.changelog, f.files['cli/CHANGELOG.md'] + '\n## [1.3.0] - 2026-11-01\n\nJá existe.\n');
  assert.throws(() => prepare(f.cli, '1.3.0', '2026-11-02', f.notes), /já existe/);
});

for (const notes of ['', '## [2.0.0]\nOutro conteúdo']) {
  test('recusa notas vazias ou seção embutida: ' + JSON.stringify(notes), t => {
    const f = fixture(t);
    writeFileSync(f.notes, notes);
    assert.throws(() => prepare(f.cli, '1.3.0', '2026-11-02', f.notes), /notas/);
  });
}

test('exige uma seção única na extração', t => {
  const f = fixture(t);
  assert.throws(() => releaseNotes(f.changelog, '2.0.0'), /exatamente uma/);
  writeFileSync(f.changelog, f.files['cli/CHANGELOG.md'] + '\n## [1.2.3] - 2026-11-01\n\nDuplicada.\n');
  assert.throws(() => releaseNotes(f.changelog, '1.2.3'), /exatamente uma/);
});

test('compara exatamente o corpo remoto, incluindo newline', t => {
  const f = fixture(t);
  const remote = join(f.root, 'remote.json');
  writeFileSync(remote, JSON.stringify({ body: 'Anterior.\n' }));
  assert.doesNotThrow(() => verifyReleaseBody(f.changelog, '1.2.3', remote));
  writeFileSync(remote, JSON.stringify({ body: 'Anterior.' }));
  assert.throws(() => verifyReleaseBody(f.changelog, '1.2.3', remote), /diverge/);
  writeFileSync(remote, '{}');
  assert.throws(() => verifyReleaseBody(f.changelog, '1.2.3', remote), /body textual/);
});
