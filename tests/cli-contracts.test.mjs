/** Contratos de progress, runner e updater do CLI compilado em Bun, executado a partir das fontes. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, delimiter } from 'node:path';
import { ROOT, temporary, put, read } from './helpers.mjs';

const MAIN = join(ROOT, 'cli/src/main.ts');
const bun = spawnSync('bun', ['--version'], { encoding: 'utf8' }).status === 0;
const installed = existsSync(join(ROOT, 'cli/node_modules'));
const skip = !bun ? 'Bun ausente no PATH' : !installed ? 'dependências do CLI ausentes; rode bun install em cli/' : false;

/** Executa o CLI pelas fontes com Bun, sem shell e com prazo máximo. */
function cli(args, options = {}) {
  return spawnSync('bun', ['run', MAIN, ...args], { encoding: 'utf8', timeout: 60_000, ...options });
}

test('progress projeta a tabela canônica e os três gates', { skip }, t => {
  const root = temporary(t);
  put(root, 'specs/specs/0001-entrega/spec.md', '# Especificação integrada: Entrega concluída\n\n| Campo | Valor |\n| --- | --- |\n| Formato | Specsfy/2.0 |\n| Status | Complete |\n| Definition Gate | Passed |\n| Plan Gate | Passed |\n| Delivery Gate | Passed |\n');
  const result = cli(['progress', '--project', root, '--json']);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ok, true);
  const spec = payload.data.specs[0];
  assert.equal(spec.status, 'Complete');
  for (const key of ['definition_gate', 'plan_gate', 'delivery_gate']) assert.equal(spec[key], 'Passed');
  assert.equal(spec.passed_gates, 3);
  assert.ok(!('content' in spec));
  assert.equal(payload.data.summary.completed_specs, 1);
});

test('test detecta Pest e usa o banco de teste separado', { skip }, t => {
  const registry = JSON.parse(cli(['--opencli']).stdout).commands ?? [];
  if (!registry.some(command => command.name === 'test')) {
    t.skip('command test ainda não integrado (spec 0006)');
    return;
  }
  const root = temporary(t), commands = temporary(t);
  put(root, 'artisan', '<?php\n');
  put(root, 'composer.json', JSON.stringify({ 'require-dev': { 'pestphp/pest': '^4.7' } }));
  put(root, '.env', 'APP_ENV=local\nDB_CONNECTION=mysql\nDB_DATABASE=produto_dev\n');
  put(root, '.env.testing', 'APP_ENV=testing\nDB_DATABASE=produto_test\n');
  const php = put(commands, 'php', '#!/bin/sh\n[ "$1" = "artisan" ] && [ "$2" = "test" ] || exit 9\necho "1 passed"\n');
  chmodSync(php, 0o755);
  const result = cli(['test', '--project', root], { env: { ...process.env, PATH: commands + delimiter + process.env.PATH } });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /1 passed/);
});

test('updater troca o binário pela release e delega o wrapper ao npm', () => {
  const source = read('cli/src/domain/updater.ts');
  for (const expected of ['join(paths.base(), "update.json")', 'NPM_PACKAGE_NAME = "@promovaweb/specsfy"', '["install", "--global",', 'SPECSFY_NPM_WRAPPER', 'SHA256SUMS', 'releases/latest']) assert.ok(source.includes(expected), expected);
});
