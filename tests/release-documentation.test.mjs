/** Preserva ownership e sequência atômica da release do CLI compilado em Bun. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read } from './helpers.mjs';

const skill = 'cli/.agents/skills/specsfy-release-cli';
test('skill de release pertence ao CLI e não ao framework instalado', () => {
  assert.ok(existsSync(join(ROOT, skill, 'SKILL.md')));
  const link = join(ROOT, 'cli/.claude/skills/specsfy-release-cli');
  assert.ok(lstatSync(link).isSymbolicLink());
  assert.equal(realpathSync(link), realpathSync(join(ROOT, skill)));
  for (const path of ['.agents/skills/specsfy-release-cli', 'skills/specsfy-release-cli']) assert.equal(existsSync(join(ROOT, path)), false);
});

test('skill documenta conferência remota, push atômico e retomada', () => {
  const source = read(skill + '/SKILL.md');
  for (const term of ['git remote get-url origin', 'git status --porcelain', 'git fetch origin main --tags', 'git rev-parse HEAD', 'git rev-parse origin/main', 'bun install --frozen-lockfile', 'bun test', 'bun run build:all', 'npm publish', 'cli/npm/package.json', 'SHA256SUMS', 'CLI Release', 'git tag -a', 'git push --atomic origin main', 'gh release create', '--notes-file', 'gh release view', 'release-changelog.mjs verify', 'release-changelog.mjs extract', 'git ls-remote origin', 'gh run list', 'não recriar', 'cli/']) assert.ok(source.includes(term), term);
});

test('workspace e CLI documentam ownership da publicação', () => {
  for (const path of ['AGENTS.md', 'README.md', 'docs/develop/context/architecture/modules.md']) {
    const source = read(path);
    assert.ok(source.includes('specsfy-release-cli'), path);
    assert.ok(source.includes('cli/.agents/skills/specsfy-release-cli'), path);
  }
  for (const path of ['cli/AGENTS.md', 'cli/README.md', 'docs/develop/context/architecture/dependencies.md', 'docs/develop/context/flows/cli-release.md']) {
    const source = read(path);
    assert.ok(source.includes('CHANGELOG.md'), path);
    assert.ok(source.includes('GitHub Release'), path);
  }
  assert.ok(existsSync(join(ROOT, 'cli/CHANGELOG.md')));
});
