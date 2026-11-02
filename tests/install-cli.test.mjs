/** Confere o instalador Shell com npm simulado; não instala pacotes globais. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, readFileSync, readlinkSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, delimiter } from 'node:path';
import { ROOT, temporary, put } from './helpers.mjs';

for (const published of [false, true]) {
  test('instala CLI ' + (published ? 'do npm' : 'do checkout a partir de outra pasta'), t => {
    const root = temporary(t), bin = join(root, 'bin'), commands = join(root, 'commands');
    const log = join(root, 'npm.log');
    const fakeNpm = put(commands, 'npm', `#!/usr/bin/env node
import { appendFileSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { dirname, join } from 'node:path';
const args = process.argv.slice(2);
if (args.join(' ') === 'prefix --global') console.log(dirname(process.env.SPECSFY_TEST_BIN));
else {
  appendFileSync(process.env.SPECSFY_TEST_LOG, args.join(' ') + '\\n');
  mkdirSync(process.env.SPECSFY_TEST_BIN, { recursive: true });
  const executable = join(process.env.SPECSFY_TEST_BIN, 'specsfy');
  writeFileSync(executable, '#!/usr/bin/env node\\nconsole.log("specsfy 0.4.0");\\n');
  chmodSync(executable, 0o755);
}
`);
    chmodSync(fakeNpm, 0o755);
    const skill = join(ROOT, '.agents/skills/specsfy-monorepo-documentator/SKILL.md');
    const link = join(ROOT, '.claude/skills/specsfy-monorepo-documentator');
    const before = readFileSync(skill, 'utf8'), target = readlinkSync(link);
    const result = spawnSync(join(ROOT, 'scripts/install-cli.sh'), published ? ['--npm'] : [], {
      cwd: root, encoding: 'utf8', timeout: 60_000,
      env: { ...process.env, PATH: commands + delimiter + process.env.PATH, SPECSFY_TEST_LOG: log, SPECSFY_TEST_BIN: bin },
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const invocation = readFileSync(log, 'utf8');
    assert.match(invocation, /install --global --force/);
    assert.ok(invocation.includes(published ? '@promovaweb/specsfy@latest' : join(ROOT, 'cli')));
    assert.match(result.stdout, /specsfy 0\.4\.0/);
    assert.equal(existsSync(join(ROOT, 'specs')), false);
    assert.equal(readFileSync(skill, 'utf8'), before);
    assert.equal(readlinkSync(link), target);
  });
}
