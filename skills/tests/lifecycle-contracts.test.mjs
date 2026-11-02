/** Porta contratos de atualização, backlog e catálogo sem alterar suas expectativas. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, read, temporary, put, node } from '../../tests/helpers.mjs';

const skillText = name => read(`skills/${name}/SKILL.md`);
const normalized = text => text.split(/\s+/).join(' ');
const backlog = skillText('specsfy-02-backlog');
const mcr = read('skills/specsfy-03-specify/references/mcr-10.md');
const specify = skillText('specsfy-03-specify');
const update = skillText('specsfy-update-spec');

test('backlog reanalisa contexto e limita perguntas por área', () => {
  for (const source of [backlog, mcr]) for (const term of ['no máximo oito perguntas por área', 'contexto acumulado e as novas respostas', 'enquanto existir lacuna aplicável']) assert.ok(normalized(source).includes(term), term);
});
test('Avançar aparece desde a primeira pergunta', () => {
  for (const source of [backlog, mcr]) for (const term of ['desde a primeira rodada', '`Avançar`']) assert.ok(source.includes(term), term);
});
test('Avançar registra encerramento ou adiamento sem passar o gate', () => {
  for (const term of ['encerra definitivamente', 'responde depois', 'Área encerrada pelo usuário', 'Área adiada pelo usuário', 'Status: Draft', 'Definition Gate: Pending']) assert.ok(backlog.includes(term), term);
});
test('specify e update delegam perguntas materiais ao backlog', () => {
  assert.ok(normalized(specify).includes('carregue `$specsfy-02-backlog` para executar o ciclo'));
  for (const source of [specify, update]) assert.ok(normalized(source).includes('retome esta skill ao final do ciclo'));
});
test('Avançar não reabre imediatamente a mesma conversa', () => {
  for (const source of [specify, update, skillText('specsfy-04-validate')]) assert.ok(normalized(source).includes('não reabra o mesmo ciclo'));
});
test('update-spec preserva nome e metadados canônicos', () => {
  assert.ok(update.includes('name: specsfy-update-spec'));
  const metadata = read('skills/specsfy-update-spec/agents/openai.yaml');
  assert.ok(metadata.includes('display_name: "Specsfy - Atualizar especificação"'));
  assert.ok(metadata.includes('$specsfy-update-spec'));
});
test('analisador reabre somente os atos afetados pela alteração', t => {
  const root = temporary(t);
  const original = '### 3. Escopo e atores\n\nOriginal\n\n### 10. Plano técnico\n\nPlano original\n\n### 11. Estratégia TDD\n\nTeste original\n';
  const spec = put(root, 'spec.md', original);
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { stdio: 'pipe' });
  git('init', '--quiet'); git('add', 'spec.md');
  git('-c', 'user.email=test@specsfy.local', '-c', 'user.name=Specsfy Test', 'commit', '--quiet', '-m', 'base');
  for (const [before, after, act, gates] of [
    ['Original', 'Com novo comportamento', 'Ato I', ['Definition Gate', 'Plan Gate', 'Delivery Gate']],
    ['Plano original', 'Plano revisado', 'Ato II', ['Plan Gate', 'Delivery Gate']],
    ['Teste original', 'Teste reexecutado', 'Nenhum', []],
  ]) {
    put(root, 'spec.md', original.replace(before, after));
    const result = node(join(ROOT, 'skills/specsfy-update-spec/scripts/analyze_change.mjs'), [spec, '--json'], { cwd: root });
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.reopen_from, act);
    assert.deepEqual(payload.invalidated_gates, gates);
  }
});

const verify = join(ROOT, 'skills/specsfy-04-validate/scripts/verify_repo.mjs');
test('verify_repo aceita catálogo base junto com especialistas', t => {
  const root = temporary(t);
  const names = ['specsfy-01-inbox', 'specsfy-02-backlog', 'specsfy-03-specify', 'specsfy-04-validate', 'specsfy-05-tasks', 'specsfy-06-tdd-bdd', 'specsfy-07-implement', 'specsfy-update-spec', 'specsfy-progress', 'specsfy-interviewer', 'specsfy-mvp-milestone-interviewer', 'specsfy-roadmap-milestone-interviewer', 'specsfy-milestone-governor', 'specsfy-data-discovery', 'specsfy-specialist-example-0', 'specsfy-specialist-example-1', 'specsfy-setup', 'specsfy-documentator', 'specsfy-aux-stack', 'specsfy-aux-rules', 'specsfy-aux-database'];
  for (const name of names) {
    put(root, `.agents/skills/${name}/SKILL.md`, `---\nname: ${name}\ndescription: Skill de teste.\n---\n`);
    put(root, `.agents/skills/${name}/agents/openai.yaml`, 'interface:\n  display_name: Test\n');
  }
  const result = JSON.parse(node(verify, [root, '--json']).stdout).checks[0];
  assert.equal(result.status, 'passed', result.detail);
  assert.equal(result.detail, '21 skills válidas');
});
test('verify_repo aceita catálogo do checkout fonte', () => {
  const result = JSON.parse(node(verify, [join(ROOT, 'skills'), '--json']).stdout).checks.at(-1);
  assert.equal(result.status, 'passed', result.detail);
  assert.match(result.detail, /skills válidas/);
});
test('verify_repo executa seus validadores com Node', () => {
  const source = read('skills/specsfy-04-validate/scripts/verify_repo.mjs');
  assert.ok(source.includes('["node", scripts.validate, spec]'));
  assert.ok(!source.toLowerCase().includes('python3'));
});
