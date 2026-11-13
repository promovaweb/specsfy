/** Confere o instalador Shell do binário com uma release local; não acessa a rede. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmodSync, existsSync, readFileSync, readlinkSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, temporary, put } from './helpers.mjs';

/** Nome do binário publicado para a máquina que executa o teste. */
function asset() {
  const os = { linux: 'linux', darwin: 'darwin', win32: 'windows' }[process.platform];
  return `specsfy-${os}-${process.arch}${os === 'windows' ? '.exe' : ''}`;
}

/** Cria uma release local com binário, SHA256SUMS e metadados da última versão. */
function release(t, { checksum } = {}) {
  const root = temporary(t), mirror = join(root, 'mirror');
  const binary = '#!/bin/sh\necho "specsfy 1.2.3"\n';
  const sum = checksum ?? createHash('sha256').update(binary).digest('hex');
  chmodSync(put(mirror, `v1.2.3/${asset()}`, binary), 0o755);
  put(mirror, 'v1.2.3/SHA256SUMS', `${'f'.repeat(64)}  specsfy-outro\n${sum}  ${asset()}\n`);
  put(mirror, 'latest.json', JSON.stringify({ tag_name: 'v1.2.3', name: 'Specsfy CLI v1.2.3' }));
  return { root, mirror };
}

function install(root, mirror, args = []) {
  return spawnSync(join(ROOT, 'scripts/install-cli.sh'), args, {
    cwd: root, encoding: 'utf8', timeout: 60_000,
    env: {
      ...process.env,
      HOME: root,
      SPECSFY_DOWNLOAD_URL: pathToFileURL(mirror).href,
      SPECSFY_RELEASES_API: pathToFileURL(join(mirror, 'latest.json')).href,
    },
  });
}

for (const pinned of [false, true]) {
  test('instala o binário da plataforma ' + (pinned ? 'na versão informada' : 'da última release'), { skip: process.platform === 'win32' }, t => {
    const { root, mirror } = release(t);
    const skill = join(ROOT, '.agents/skills/specsfy-monorepo-documentator/SKILL.md');
    const link = join(ROOT, '.claude/skills/specsfy-monorepo-documentator');
    const before = readFileSync(skill, 'utf8'), target = readlinkSync(link);
    const destination = join(root, 'bin');
    const result = install(root, mirror, [...(pinned ? ['--version', '1.2.3'] : []), '--dir', destination]);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /specsfy 1\.2\.3/);
    assert.ok(statSync(join(destination, 'specsfy')).mode & 0o111);
    assert.equal(existsSync(join(ROOT, 'specs')), false);
    assert.equal(readFileSync(skill, 'utf8'), before);
    assert.equal(readlinkSync(link), target);
  });
}

test('recusa binário com checksum divergente sem gravar o destino', { skip: process.platform === 'win32' }, t => {
  const { root, mirror } = release(t, { checksum: '0'.repeat(64) });
  const result = install(root, mirror, ['--version', '1.2.3', '--dir', join(root, 'bin')]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /checksum divergente/);
  assert.equal(existsSync(join(root, 'bin/specsfy')), false);
});

test('recusa versão inválida e argumento desconhecido com exit 2', t => {
  const { root, mirror } = release(t);
  assert.equal(install(root, mirror, ['--version', 'latest']).status, 2);
  assert.equal(install(root, mirror, ['--npm']).status, 2);
});
