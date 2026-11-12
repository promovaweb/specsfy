/** Preserva os cenários de isolamento e recusa de operações destrutivas do banco. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, read, temporary, put, node } from '../../tests/helpers.mjs';

function fixture(t, testing) {
  const root = temporary(t);
  put(root, 'artisan', '<?php\n');
  put(root, '.env', 'APP_ENV=local\nDB_CONNECTION=mysql\nDB_HOST=127.0.0.1\nDB_PORT=3306\nDB_DATABASE=produto_dev\nDB_USERNAME=dev\nDB_PASSWORD=segredo-dev\n');
  if (testing !== undefined) put(root, '.env.testing', testing);
  return root;
}
function check(root, command) {
  const result = node(join(ROOT, 'skills/specsfy-setup/scripts/check_database_safety.mjs'), ['--project', root, '--json', ...(command ? ['--command', command] : [])]);
  return { ...result, payload: JSON.parse(result.stdout) };
}
const separate = 'APP_ENV=testing\nDB_CONNECTION=mysql\nDB_HOST=127.0.0.1\nDB_PORT=3306\nDB_DATABASE=produto_test\n';

test('Laravel exige .env.testing e não expõe a senha', t => {
  const result = check(fixture(t));
  assert.equal(result.status, 1);
  assert.equal(result.payload.status, 'pending');
  assert.match(result.payload.errors.join(' '), /\.env.testing/);
  assert.ok(!result.stdout.includes('segredo-dev'));
});
for (const testing of [separate.replace('produto_test', 'produto_dev'), 'APP_ENV=testing\nDB_DATABASE=produto_dev\n']) {
  test('recusa destino de desenvolvimento mesmo com conexão herdada: ' + testing, t => {
    const result = check(fixture(t, testing));
    assert.equal(result.status, 1);
    assert.match(result.stdout, /banco de desenvolvimento/);
  });
}
for (const testing of [
  'APP_ENV=testing\nDB_URL=mysql://root:outra-senha@127.0.0.1:3306/produto_dev\n',
  'APP_ENV=testing\nDB_CONNECTION=mariadb\nDB_HOST=localhost\nDB_DATABASE=produto_dev\n',
]) {
  test('recusa o banco de desenvolvimento escrito de outra forma: ' + testing, t => {
    const result = check(fixture(t, testing));
    assert.equal(result.status, 1);
    assert.match(result.stdout, /banco de desenvolvimento/);
    assert.ok(!result.stdout.includes('outra-senha'));
  });
}
test('aceita DB_URL que aponta para outro banco', t => {
  const result = check(fixture(t, 'APP_ENV=testing\nDB_URL=mysql://root:x@127.0.0.1:3306/produto_test\n'));
  assert.equal(result.status, 0, result.stdout);
});
test('recusa nome de banco herdado do .env', t => {
  const result = check(fixture(t, 'APP_ENV=testing\n'));
  assert.equal(result.status, 1);
  assert.match(result.stdout, /sem herdar o .env/);
});
test('aceita banco de teste explicitamente separado', t => {
  const result = check(fixture(t, separate));
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.payload.status, 'safe');
});
test('recusa migrate:fresh mesmo no banco de teste', t => {
  const result = check(fixture(t, separate), 'php artisan migrate:fresh --env=testing');
  assert.equal(result.status, 3);
  assert.equal(result.payload.status, 'ignored');
});
test('recusa suíte com RefreshDatabase', t => {
  const root = fixture(t, separate);
  put(root, 'tests/Pest.php', '<?php\nuse Illuminate\\Foundation\\Testing\\RefreshDatabase;\n');
  const result = check(root, 'php artisan test');
  assert.equal(result.status, 3);
  assert.match(result.stdout, /RefreshDatabase/);
});
test('recusa alias Composer que executa comando destrutivo', t => {
  const root = fixture(t, 'APP_ENV=testing\nDB_DATABASE=produto_test\n');
  put(root, 'composer.json', JSON.stringify({ scripts: { test: 'php artisan migrate:fresh && php artisan test' } }));
  const result = check(root, 'composer test');
  assert.equal(result.status, 3);
  assert.match(result.stdout, /script test/);
});
for (const destructive of [false, true]) {
  test('migration com remoção em ' + (destructive ? 'up é recusada' : 'down é aceita'), t => {
    const root = fixture(t, 'APP_ENV=testing\nDB_DATABASE=produto_test\n');
    put(root, 'database/migrations/items.php', destructive
      ? "<?php\npublic function up(): void { Schema::dropIfExists('items'); }\npublic function down(): void {}\n"
      : "<?php\npublic function up(): void { Schema::create('items'); }\npublic function down(): void { Schema::dropIfExists('items'); }\n");
    const result = check(root, 'php artisan migrate --env=testing');
    assert.equal(result.status, destructive ? 3 : 0, result.stdout);
  });
}
test('skills centrais aplicam a proteção de banco', () => {
  for (const name of ['specsfy-setup','specsfy-05-tasks','specsfy-06-tdd-bdd','specsfy-07-implement']) assert.ok(read(`skills/${name}/SKILL.md`).includes('check_database_safety.mjs'), name);
  const specialist = read('specialists/specsfy-specialist-laravel/SKILL.md');
  for (const term of ['.env.testing', 'DatabaseTransactions']) assert.ok(specialist.includes(term));
  assert.ok(!specialist.includes('RefreshDatabase'));
});
