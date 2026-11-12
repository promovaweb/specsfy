/** Robustez dos scripts das skills diante de texto livre, caminhos com link simbólico e worktrees aninhadas. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, temporary, put, node } from '../../tests/helpers.mjs';

const script = (skill, name) => join(ROOT, 'skills', skill, 'scripts', `${name}.mjs`);

test('texto do usuário com $& e $` entra literal no template', t => {
  const root = temporary(t);
  put(root, '.specsfy/templates/Inbox.md', read('skills/templates/Inbox.md'));
  const idea = 'Cobrar R$& 10 e manter o trecho $` e $\' como foram escritos.';
  const result = node(script('specsfy-01-inbox', 'capturar_inbox'), ['--input', idea, '--title', 'Preço com cifrão', '--root', root]);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(readFileSync(result.stdout.trim(), 'utf8').includes(idea));
});

test('research lê todas as linhas da seção, não só a primeira', t => {
  const root = temporary(t);
  put(root, 'specs/draft/0001-exemplo/research/fonte.md', '# Fonte\n\nTexto.\n');
  const claim = (id, criticality, verdict) => `- **${id}** [${criticality}] Afirmação ${id} — Verdict: ${verdict} — Confidence: high — Evidence: research/fonte.md — Budget: 1/3`;
  const spec = put(root, 'specs/draft/0001-exemplo/spec.md', [
    '### 2. Research', '', '#### Artefatos de pesquisa armazenados', '', '- `research/fonte.md`', '',
    '#### Researchs executados', '', claim('R-001', 'low', 'verified'), claim('R-002', 'critical', 'refuted'), '',
  ].join('\n'));
  const result = node(script('specsfy-03-specify', 'load_research'), [spec, '--json']);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.claims.map(item => item.id), ['R-001', 'R-002']);
  assert.equal(result.status, 1);
  assert.ok(payload.errors.some(error => error.startsWith('R-002: critical claim')), JSON.stringify(payload.errors));
});

test('analisador de mudança aceita spec aberta por um link simbólico do repositório', t => {
  const root = temporary(t);
  const repo = join(root, 'repo'); mkdirSync(repo);
  const original = '### 3. Escopo e atores\n\nOriginal\n';
  put(repo, 'spec.md', original);
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: 'pipe' });
  git('init', '--quiet'); git('add', 'spec.md');
  git('-c', 'user.email=test@specsfy.local', '-c', 'user.name=Specsfy Test', 'commit', '--quiet', '-m', 'base');
  put(repo, 'spec.md', original.replace('Original', 'Com novo comportamento'));
  const alias = join(root, 'atalho'); symlinkSync(repo, alias, 'dir');
  const result = node(script('specsfy-update-spec', 'analyze_change'), [join(alias, 'spec.md'), '--json'], { cwd: alias });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(JSON.parse(result.stdout).reopen_from, 'Ato I');
});

test('rastreabilidade ignora cópias do repositório em .claude/worktrees', t => {
  const root = temporary(t);
  const spec = put(root, 'specs/specs/0001-example/spec.md', '#### US-001 — Example\n#### AC-001 — Example\n- **FR-001**: Example.\n');
  put(root, 'tests/example.test.mjs', '// SPECSFY: US-001 FR-001 AC-001\n');
  put(root, '.claude/worktrees/outra/tests/example.test.mjs', '// SPECSFY: US-001 FR-001 AC-001\n');
  const payload = JSON.parse(node(script('specsfy-06-tdd-bdd', 'check_traceability'), [spec, root, '--json']).stdout);
  assert.ok(!JSON.stringify(payload).includes('.claude'), JSON.stringify(payload));
});
