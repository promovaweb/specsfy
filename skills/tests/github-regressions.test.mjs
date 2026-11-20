/** Reproduções Node.js dos relatos de GitHub, sempre em projetos temporários. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, symlinkSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skills = process.env.SPECSFY_TEST_SKILLS_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..');
const script = (skill, name) => join(skills, skill, 'scripts', name + '.mjs');
function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), 'specsfy-github-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function put(root, path, content) {
  const target = join(root, path); mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content); return target;
}
function run(path, args, cwd) {
  return spawnSync(process.execPath, [path, ...args], { encoding: 'utf8', cwd });
}

test('#47: review encontra comprovação na raiz nos dois layouts de specs', (t) => {
  const root = temporary(t);
  put(root, 'config/database.php', '<?php');
  const content = '- **FR-001**: Validar conexão.\n- **FIND-SEC-001** [P2] [Resolved] Conexão isolada — Refs: FR-001 — Evidence: config/database.php:1 — Effect: Confere o destino — Suggestion: Preservar teste\n';
  for (const layout of ['specs/completed/0001-banco/spec.md', 'specs/0002-banco/spec.md']) {
    const spec = put(root, layout, content);
    const result = run(script('specsfy-04-validate', 'review_findings'), [spec, '--json'], root);
    assert.equal(result.status, 0, result.stdout + result.stderr);
  }
});

test('#43: atualizar stack preserva pipes escapados e texto humano', (t) => {
  const root = temporary(t);
  const row = '| Banco | PostgreSQL, credencial `PG \\| Main` | `workflow.json` |';
  put(root, '.specsfy/STACK.md', '# Contexto humano\n\n<!-- specsfy:stack:start -->\n| Camada | Tecnologia | Evidência |\n| --- | --- | --- |\n' + row + '\n<!-- specsfy:stack:end -->\n');
  const result = run(script('specsfy-setup', 'update_stack'), ['--project', root], root);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(readFileSync(join(root, '.specsfy/STACK.md'), 'utf8').includes(row));
  assert.equal(run(script('specsfy-setup', 'update_stack'), ['--project', root], root).stdout, '');
});

test('#36 / PR #12: setup instalado em caminho com espaços e acentos é idempotente', (t) => {
  const root = temporary(t);
  const installation = join(root, 'instalação com espaços');
  cpSync(join(skills, 'specsfy-setup'), join(installation, 'specsfy-setup'), { recursive: true });
  cpSync(join(skills, 'templates'), join(installation, 'templates'), { recursive: true });
  const consumer = join(root, 'consumidor'); mkdirSync(consumer);
  const setup = join(installation, 'specsfy-setup/scripts/setup_context.mjs');
  const first = run(setup, ['--project', consumer], root);
  assert.equal(first.status, 0, first.stdout + first.stderr);
  assert.ok(readFileSync(join(consumer, 'AGENTS.md'), 'utf8').includes('specsfy:framework:start'));
  const second = run(setup, ['--project', consumer], root);
  assert.equal(second.status, 0, second.stderr); assert.equal(second.stdout, '');
});

test('#35: inspetor ignora ambientes virtuais e reconhece código e rotas no Hub', (t) => {
  const root = temporary(t);
  put(root, 'manager/package.json', '{"dependencies":{"react":"1"}}');
  put(root, 'manager/src/App.tsx', 'export const App = () => <Route path="/" />;');
  put(root, 'worker/venv_test/tests/test_noise.py', 'pass');
  put(root, '.agents/skills/example/src/fake.ts', 'export const fake = true;');
  const result = run(script('specsfy-setup', 'inspect_project'), ['--project', root], root);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.source_groups.application, ['manager/src/App.tsx']);
  assert.deepEqual(payload.source_groups.routes, ['manager/src/App.tsx']);
  assert.equal(payload.totals.tests, 0);
});

test('#37: monitor descobre repositório filho sem promover a raiz confirmada', (t) => {
  const root = temporary(t);
  const child = join(root, 'manager'); mkdirSync(child);
  execFileSync('git', ['init', '--quiet', child]);
  put(child, 'src/App.tsx', 'export const App = () => null;');
  const result = run(script('specsfy-setup', 'monitor_context'), ['--project', root, '--check', '--json'], root);
  assert.equal(result.status, 1, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.ok(payload.changed_paths.includes('manager/src/App.tsx'));
  assert.ok(payload.application_changes.includes('manager/src/App.tsx'));
  assert.equal(payload.status, 'pending');
});


test('#33 / PR #38: verify usa a política Draft sem afrouxar estados definidos', (t) => {
  const root = temporary(t);
  mkdirSync(join(root, '.agents'));
  symlinkSync(skills, join(root, '.agents/skills'), 'dir');
  put(root, 'specs/draft/0001-futura/spec.md', readFileSync(join(skills, 'examples/Spec.md'), 'utf8').replace('Dependências, falhas possíveis e suposições', 'Dependências, riscos e suposições'));
  const result = run(script('specsfy-04-validate', 'verify_repo'), [root, '--json'], root);
  const payload = JSON.parse(result.stdout);
  const validation = payload.checks.find((item) => item.name.startsWith('spec:'));
  assert.ok(validation.command.includes('--allow-draft'));
  assert.equal(validation.status, 'passed', validation.detail);
});

test('#21 / PRs #8, #22, #24, #50: prosa portuguesa não vira marcador pendente', (t) => {
  const root = temporary(t);
  const base = readFileSync(join(skills, 'examples/Spec.md'), 'utf8')
    .replace('| Status | Draft |', '| Status | Defined |')
    .replace('| Definition Gate | Pending |', '| Definition Gate | Passed |');
  for (const sentence of ['Todo texto usa o método correto.', 'MÉTODO útil', ' TODO: corrigir', 'FIXME', '[needs clarification: falta]']) {
    const spec = put(root, 'spec.md', base + '\n' + sentence);
    const result = run(script('specsfy-04-validate', 'validate_spec'), [spec, '--json'], root);
    const errors = JSON.parse(result.stdout).errors;
    assert.equal(errors.includes('Marcadores não resolvidos.'), /TODO:|FIXME|needs clarification/.test(sentence), sentence);
  }
});

test('#11 e #21 / PR #40: a spec só recebe marcadores dos testes declarados, inclusive mjs e cjs', (t) => {
  const root = temporary(t);
  const definitions = '#### US-001 Exemplo\n#### AC-001 Aceite\n- **FR-001**: Responder.\n- **NFR-001**: Rápido.\n';
  const spec = put(root, 'specs/completed/0001-a/spec.md', definitions + '- [x] T001 [TEST] [TDD] Caso em tests/a.test.mjs e tests/a.test.cjs — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none\n');
  const marker = '// SPECSFY: US-001 FR-001 NFR-001 AC-001\n';
  put(root, 'tests/a.test.mjs', marker.repeat(2)); put(root, 'tests/a.test.cjs', marker);
  const arguments_ = [spec, root, '--json'];
  const before = JSON.parse(run(script('specsfy-06-implement', 'check_traceability'), arguments_, root).stdout);
  put(root, 'tests/b.test.ts', marker.repeat(3) + '// SPECSFY: FR-999\n');
  const result = run(script('specsfy-06-implement', 'check_traceability'), arguments_, root);
  const after = JSON.parse(result.stdout);
  assert.equal(result.status, 0, result.stdout);
  assert.equal(after.files_scanned, 2);
  assert.deepEqual(after.case_counts, before.case_counts);
  assert.deepEqual(after.orphan_markers, []);
});

test('#25: stack registra manifests aninhados e ignora diretório descartado pelo Git', (t) => {
  const root = temporary(t);
  execFileSync('git', ['init', '--quiet', root]);
  put(root, '.gitignore', 'descartado/\n');
  put(root, 'package.json', '{"name":"raiz"}');
  put(root, 'episodes/editor/package.json', '{"dependencies":{"react":"1","typescript":"1"}}');
  put(root, 'worker/pyproject.toml', '[project]\nname="worker"\n');
  put(root, 'descartado/package.json', '{"dependencies":{"astro":"1"}}');
  const result = run(script('specsfy-setup', 'update_stack'), ['--project', root], root);
  assert.equal(result.status, 0, result.stderr);
  const stack = readFileSync(join(root, '.specsfy/STACK.md'), 'utf8');
  assert.ok(stack.includes('React') && stack.includes('Python') && stack.includes('episodes/editor/package.json'), stack);
  assert.ok(!stack.includes('Astro'));
});

test('#16: documentador inspeciona aplicação completa e identifica PHPUnit', (t) => {
  const root = temporary(t);
  put(root, 'composer.json', '{"require-dev":{"phpunit/phpunit":"^11"}}');
  put(root, 'composer.lock', '{"packages-dev":[{"name":"phpunit/phpunit","version":"11.5.0"}]}');
  put(root, '.agents/skills/example/Fake.tsx', 'export class ArtefatoDaSkill {}');
  for (let index = 0; index < 260; index++) put(root, `app/Modulo${String(index).padStart(3,'0')}.php`, '<?php class Modulo' + index + ' {}');
  const result = run(script('specsfy-documentator', 'build_documentation'), ['--project', root], root);
  assert.equal(result.status, 0, result.stderr);
  const application = readFileSync(join(root, 'docs/application.md'), 'utf8');
  assert.ok(application.includes('Modulo259.php'));
  assert.ok(!application.includes('ArtefatoDaSkill'));
  assert.ok(readFileSync(join(root, 'docs/testing.md'), 'utf8').includes('PHPUnit'));
  assert.equal(run(script('specsfy-documentator', 'build_documentation'), ['--project', root, '--check'], root).status, 0);
});


test('#25: setup confirma tecnologias dos repositórios filhos', (t) => {
  const root = temporary(t);
  put(root, 'manager/package.json', '{"dependencies":{"next":"1","react":"1"}}');
  put(root, 'worker/pyproject.toml', '[project]\nname="worker"\n');
  const result = run(script('specsfy-setup', 'setup_context'), ['--project', root], root);
  assert.equal(result.status, 0, result.stderr);
  const stack = readFileSync(join(root, '.specsfy/STACK.md'), 'utf8');
  assert.ok(stack.includes('Next.js') && stack.includes('Python'), stack);
});


for (const [migrationStatus, expected] of [['Ran', 'safe'], ['Pending', 'ignored'], ['unavailable', 'pending'], ['empty', 'ignored']]) {
  test('#46: migration histórica com estado ' + migrationStatus + ' resulta em ' + expected, (t) => {
    const root = temporary(t);
    put(root, 'artisan', '<?php');
    put(root, '.env', 'APP_ENV=local\nDB_CONNECTION=sqlite\nDB_DATABASE=development.sqlite\n');
    put(root, '.env.testing', 'APP_ENV=testing\nDB_CONNECTION=sqlite\nDB_DATABASE=:memory:\n');
    put(root, 'database/migrations/2026_01_01_000001_remove_legacy.php', '<?php public function up() { Schema::table("users", fn ($table) => $table->dropColumn("legacy")); } public function down() {}');
    const php = put(root, 'bin/php', '#!/usr/bin/env node\n' + (migrationStatus === 'unavailable'
      ? 'process.exit(2);\n'
      : migrationStatus === 'empty' ? 'process.exit(0);\n' : 'if(process.argv.slice(2).join(" ")!=="artisan migrate:status --env=testing --no-ansi")process.exit(4);console.log("  2026_01_01_000001_remove_legacy ........ [1] ' + migrationStatus + '");\n'));
    chmodSync(php, 0o755);
    const result = spawnSync(process.execPath, [script('specsfy-setup', 'check_database_safety'), '--project', root, '--command', 'php artisan migrate --env=testing', '--json'], {
      encoding: 'utf8', env: { ...process.env, PATH: join(root, 'bin') + delimiter + process.env.PATH },
    });
    assert.equal(JSON.parse(result.stdout).status, expected, result.stdout + result.stderr);
  });
}


test('PR #9: arquivo local é aceito e caminho externo é recusado', (t) => {
  const root = temporary(t);
  put(root, 'src/service.ts', 'export const result = true;');
  const record = {task:'T001', refs:['FR-001'], files:['src/service.ts'], commands:[{run:'npm test', exit:0}]};
  const content = (item) => '| Evidence Contract | 1 |\n- **FR-001**: Responder.\n- [x] T001 [CODE] Implementar src/service.ts — Refs: FR-001 — Depends: none\n<!-- specsfy:evidence ' + JSON.stringify(item) + ' -->\n';
  const spec = put(root, 'spec.md', content(record));
  const verifier = script('specsfy-06-implement', 'verify_evidence');
  assert.equal(run(verifier,[spec,root,'--json'],root).status,0);
  put(root, 'spec.md', content({...record, files:['../externo.ts']}));
  assert.equal(run(verifier,[spec,root,'--json'],root).status,1);
});

test('PR #19: inspeção da interface não esgota rotas e componentes com arquivos anteriores', (t) => {
  const root = temporary(t);
  for(let index=0;index<90;index++) put(root,'aaa/file'+index+'.txt','x');
  put(root,'src/pages/index.tsx','export default () => null;');
  put(root,'src/components/Button.tsx','export default () => null;');
  const result = run(script('specsfy-setup','inspect_interface'),['--project',root],root);
  assert.equal(result.status,0,result.stderr);
  assert.ok(result.stdout.includes('src/pages/index.tsx') && result.stdout.includes('src/components/Button.tsx'),result.stdout);
});


test('o exemplo canônico Draft continua válido após a mudança do título da seção 16', (t) => {
  const root = temporary(t);
  const spec = put(root,'spec.md',readFileSync(join(skills,'examples/Spec.md'),'utf8'));
  const result = run(script('specsfy-04-validate','validate_spec'),[spec,'--allow-draft','--json'],root);
  assert.equal(result.status,0,result.stdout+result.stderr);
});

test('PR #50: criar índice exige uma tarefa de migration', (t) => {
  const root = temporary(t);
  const spec = put(root,'spec.md','| Formato | Specsfy/2.0 |\n| Status | Defined |\n| Definition Gate | Passed |\n| Plan Gate | Pending |\n- **FR-001**: Responder.\n### 14. Tarefas\n- [ ] T001 [CODE] Criar índice em app/Example.php — Refs: FR-001 — Depends: none\n');
  const result = run(script('specsfy-05-tasks','validate_tasks'),[spec,'--allow-draft','--json'],root);
  const errors = JSON.parse(result.stdout).errors;
  assert.ok(errors.some(message=>message.includes('alteração estrutural de banco') && message.includes('[MIGRATION]')),result.stdout);
});

test('PR #40: um caminho declarado não inclui outro arquivo com o mesmo sufixo', (t) => {
  const root = temporary(t);
  const spec = put(root,'spec.md','- **FR-001**: Responder.\n- [x] T001 [TEST] [TDD] Caso em project/tests/a.test.ts — Refs: FR-001 — Depends: none\n');
  put(root,'project/tests/a.test.ts','// SPECSFY: FR-001\n'.repeat(3));
  put(root,'tests/a.test.ts','// SPECSFY: FR-999\n');
  const result = run(script('specsfy-06-implement','check_traceability'),[spec,root,'--json'],root);
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).files,['project/tests/a.test.ts']);
});

test('#48: inspetor normaliza separadores do Windows antes de classificar', { skip: process.platform === 'win32' }, (t) => {
  const root = temporary(t);
  // No Linux, a barra invertida é um caractere comum do nome: o arquivo reproduz o caminho relativo do Windows.
  put(root, 'tests\\Feature\\IniciarTest.php', '<?php test("inicia", fn () => true);');
  put(root, 'src\\Iniciar.php', '<?php final class Iniciar {}');
  put(root, 'routes\\web.php', '<?php Route::get("/", fn () => "ok");');
  const result = run(script('specsfy-setup', 'inspect_project'), ['--project', root], root);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.source_groups.tests, ['tests/Feature/IniciarTest.php']);
  assert.ok(payload.source_groups.application.includes('src/Iniciar.php'), JSON.stringify(payload.source_groups));
  assert.ok(payload.source_groups.routes.includes('routes/web.php'), JSON.stringify(payload.source_groups));
  assert.ok(Object.values(payload.source_groups).flat().every((path) => !path.includes('\\')));
});

test('#43: aceitação lê comando com pipe escapado sem deslocar a evidência', (t) => {
  const root = temporary(t);
  const spec = put(root, 'specs/completed/0001-pipe/spec.md', [
    '#### AC-001 Exporta relatório', '',
    '### 12. Plano de testes e rastreabilidade', '',
    '| Requisito | AC | Nível | Comando | Evidência |',
    '| --- | --- | --- | --- | --- |',
    '| FR-001 | AC-001 | Integração | `npm test \\| tee saida.log` | Passed em 2026-11-20 |', '',
    '### 13. Tarefas', '',
  ].join('\n'));
  const result = run(script('specsfy-06-implement', 'verify_acceptance'), [spec, root, '--json'], root);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.results['AC-001'].command, '`npm test \\| tee saida.log`');
  assert.match(payload.results['AC-001'].evidence, /^Passed/);
});

test('#43: dados conversados migram linha antiga com pipe escapado para o formato atual', (t) => {
  const root = temporary(t);
  put(root, '.specsfy/DATABASE.md', [
    '# Banco de dados', '',
    '<!-- specsfy:conversation-data:start -->',
    '## Informações a guardar confirmadas', '',
    '| Informação | Para que serve | O que guardar | Ligações | Quem usa | Quando muda ou sai | Fontes |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    '| Credencial | Acessar o banco | nome `PG \\| Main` | Nenhuma | Equipe | Ao trocar a senha | conversa |',
    '<!-- specsfy:conversation-data:end -->', '',
  ].join('\n'));
  const result = run(script('specsfy-setup', 'registrar_dados_conversados'), ['--project', root, '--nome', 'Pedido', '--para-que-serve', 'Acompanhar pedidos', '--o-que-guardar', 'itens', '--formato-sugerido', 'texto', '--ligacoes', 'cliente', '--acesso', 'equipe', '--ciclo-de-vida', 'enquanto houver atendimento', '--fontes', 'conversa'], root);
  assert.equal(result.status, 0, result.stderr);
  const database = readFileSync(join(root, '.specsfy/DATABASE.md'), 'utf8');
  assert.ok(database.includes('| Credencial | Acessar o banco | nome `PG \\| Main` | A confirmar | Nenhuma | Equipe | Ao trocar a senha | conversa |'), database);
});
