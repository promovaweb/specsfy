/** Porta os contratos de progress, runner e updater para processos Node isolados. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync } from 'node:fs';
import { join, delimiter } from 'node:path';
import { ROOT, temporary, put, node, read } from './helpers.mjs';

const CLI = join(ROOT, 'cli/bin/specsfy');

test('progress projeta a tabela canônica e os três gates', t => {
  const root = temporary(t);
  put(root, 'specs/specs/0001-entrega/spec.md', '# Especificação integrada: Entrega concluída\n\n| Campo | Valor |\n| --- | --- |\n| Formato | Specsfy/2.0 |\n| Status | Complete |\n| Definition Gate | Passed |\n| Plan Gate | Passed |\n| Delivery Gate | Passed |\n');
  const result = node(CLI, ['progress', '--project', root, '--json']);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const payload = JSON.parse(result.stdout), spec = payload.specs[0];
  assert.equal(spec.status, 'Complete');
  for (const key of ['definition_gate', 'plan_gate', 'delivery_gate']) assert.equal(spec[key], 'Passed');
  assert.equal(spec.passed_gates, 3);
  assert.ok(!('content' in spec));
  assert.equal(payload.summary.completed_specs, 1);
});

test('test detecta Pest e usa o banco de teste separado', t => {
  const root = temporary(t), commands = temporary(t);
  put(root, 'artisan', '<?php\n');
  put(root, 'composer.json', JSON.stringify({ 'require-dev': { 'pestphp/pest': '^4.7' } }));
  put(root, '.env', 'APP_ENV=local\nDB_CONNECTION=mysql\nDB_DATABASE=produto_dev\n');
  put(root, '.env.testing', 'APP_ENV=testing\nDB_DATABASE=produto_test\n');
  const php = put(commands, 'php', '#!/usr/bin/env node\nif (process.argv[2] !== "artisan" || process.argv[3] !== "test") process.exit(9);\nconsole.log("1 passed");\n');
  chmodSync(php, 0o755);
  const result = node(CLI, ['test', '--project', root], { env: { ...process.env, PATH: commands + delimiter + process.env.PATH } });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /1 passed/);
});

test('updater mantém cache próprio e delega atualização global ao npm', () => {
  const source = read('cli/src/updater.ts');
  for (const expected of ['join(home, ".specsfy", "cli.json")', 'NPM_PACKAGE_NAME = "@promovaweb/specsfy"', '["install", "--global",']) assert.ok(source.includes(expected), expected);
});
