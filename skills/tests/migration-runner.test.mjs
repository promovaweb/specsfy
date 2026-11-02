/** Exercita runners declarados pelo projeto sem executar comandos de migrations. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const verifier = fileURLToPath(new URL('../specsfy-07-implement/scripts/verify_evidence.mjs', import.meta.url));
const custom = {
  apply: ['^node scripts/migrate\\.mjs apply$'],
  status: ['^node scripts/migrate\\.mjs status$'],
};

/** Monta um consumidor isolado e devolve a resposta pública do validador. */
function verify(t, config, commands, { missingFile = false, exit = 0 } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'specsfy-migration-runner-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'migrations'));
  if (!missingFile) writeFileSync(join(root, 'migrations/001.sql'), 'CREATE TABLE exemplo (id INT);');
  if (config !== undefined) {
    mkdirSync(join(root, '.specsfy'));
    writeFileSync(join(root, '.specsfy/migrations.json'), typeof config === 'string' ? config : JSON.stringify(config));
  }
  const evidence = { task: 'T001', refs: ['FR-001'], files: ['migrations/001.sql'], commands: commands.map(run => ({ run, exit })) };
  const spec = join(root, 'spec.md');
  writeFileSync(spec, '| Evidence Contract | 1 |\n- **FR-001**: Persistir cadastro.\n- [x] T001 [CODE] [MIGRATION] Criar migrations/001.sql — Refs: FR-001 — Depends: none\n<!-- specsfy:evidence ' + JSON.stringify(evidence) + ' -->\n');
  const result = spawnSync(process.execPath, [verifier, spec, root, '--json'], { encoding: 'utf8', cwd: root });
  assert.equal(result.stderr, '');
  return { code: result.status, ...JSON.parse(result.stdout) };
}

const customCommands = ['node scripts/migrate.mjs apply', 'node scripts/migrate.mjs status'];
const defaults = ['php artisan migrate --env=testing', 'php artisan migrate:status --env=testing'];

test('#52: aceita aplicação e consulta declaradas pelo consumidor', t => {
  const result = verify(t, custom, customCommands);
  assert.equal(result.code, 0, JSON.stringify(result));
});

test('#52: sem configuração, runner desconhecido continua recusado', t => {
  const result = verify(t, undefined, customCommands);
  assert.equal(result.code, 1);
  assert.ok(result.errors.some(error => error.includes('aplicação da migration ausente')));
  assert.ok(result.errors.some(error => error.includes('conferência da migration ausente')));
});

for (const config of [undefined, custom]) {
  test('#52: preserva comandos nativos ' + (config ? 'com configuração' : 'sem configuração'), t => {
    assert.equal(verify(t, config, defaults).code, 0);
  });
}

for (const commands of [[customCommands[0]], [customCommands[1]]]) {
  test('#52: exige aplicação e consulta separadamente: ' + commands[0], t => {
    assert.equal(verify(t, custom, commands).code, 1);
  });
}

for (const config of ['{', null, [], {}, { apply: ['['], status: ['status'] }, { apply: [''], status: ['status'] }, { apply: ['apply'], status: [] }, { apply: [42], status: ['status'] }]) {
  test('#52: configuração inválida falha com diagnóstico: ' + JSON.stringify(config), t => {
    const result = verify(t, config, defaults);
    assert.equal(result.code, 1, JSON.stringify(result));
    assert.ok(result.errors.some(error => error.includes('.specsfy/migrations.json')), JSON.stringify(result));
  });
}

for (const options of [{ missingFile: true }, { exit: 1 }]) {
  test('#52: runner configurado preserva arquivo existente e exit zero: ' + JSON.stringify(options), t => {
    assert.equal(verify(t, custom, customCommands, options).code, 1);
  });
}

test('#52: stack registra a configuração do runner e preserva seu conteúdo', t => {
  const root = mkdtempSync(join(tmpdir(), 'specsfy-migration-stack-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, '.specsfy'));
  const source = JSON.stringify(custom, null, 2) + '\n';
  writeFileSync(join(root, '.specsfy/migrations.json'), source);
  const updater = fileURLToPath(new URL('../specsfy-aux-stack/scripts/update_stack.mjs', import.meta.url));
  const first = spawnSync(process.execPath, [updater, '--project', root], { encoding: 'utf8' });
  assert.equal(first.status, 0, first.stderr);
  assert.match(readFileSync(join(root, '.specsfy/STACK.md'), 'utf8'), /Runner próprio.*\.specsfy\/migrations\.json/);
  assert.equal(readFileSync(join(root, '.specsfy/migrations.json'), 'utf8'), source);
  const second = spawnSync(process.execPath, [updater, '--project', root], { encoding: 'utf8' });
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.stdout, '');
});
