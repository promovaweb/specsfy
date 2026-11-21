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

test('research ignora a orientação do template mantida na seção de artefatos', t => {
  const root = temporary(t);
  put(root, 'specs/draft/0001-exemplo/research/fonte/nota.md', '# Fonte\n\nTexto.\n');
  const spec = put(root, 'specs/draft/0001-exemplo/spec.md', [
    '### 2. Research', '', '#### Artefatos de pesquisa armazenados', '',
    '- `specs/draft/0001-exemplo/research/fonte/`: documentação oficial, consultada em 2026-11-20.',
    '- Toda fonte externa efetivamente consultada deve ter uma evidência local em `research/`; registre aqui o caminho e mantenha conclusões normativas no `spec.md`.', '',
    '#### Researchs executados', '',
    '- **R-001** [critical] Afirmação — Verdict: verified — Confidence: high — Evidence: research/fonte/nota.md — Budget: 1/3', '',
  ].join('\n'));
  const result = node(script('specsfy-03-specify', 'load_research'), [spec, '--json']);
  const payload = JSON.parse(result.stdout);
  assert.equal(result.status, 0, JSON.stringify(payload.errors));
  assert.deepEqual(payload.artifacts.map(item => item.path), ['specs/draft/0001-exemplo/research/fonte/nota.md']);
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
  const payload = JSON.parse(node(script('specsfy-06-implement', 'check_traceability'), [spec, root, '--json']).stdout);
  assert.ok(!JSON.stringify(payload).includes('.claude'), JSON.stringify(payload));
});

test('research aceita declaração de fontes locais sem artefatos externos', t => {
  const root = temporary(t);
  const spec = put(root, 'specs/defined/0001-exemplo/spec.md',
    '#### Artefatos de pesquisa armazenados\n\n- Nenhum artefato externo; somente código local foi consultado.\n');
  const result = node(script('specsfy-03-specify', 'load_research'), [spec, '--json']);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).artifacts, []);
});

test('a declaração de ausência de fonte externa não mascara índice inválido ou claim crítico sem evidência', t => {
  const root = temporary(t);
  mkdirSync(join(root, 'specs/defined/0001-exemplo/research/sem-arquivos'), { recursive: true });
  const index = '#### Artefatos de pesquisa armazenados\n\n- Nenhum artefato externo.\n';
  for (const extra of [
    '- `research/fonte-ausente.md`\n',
    '- `research/fonte-sem-fechar.md\n',
    '- [Fonte](research/fonte.md)\n',
    '- `research/sem-arquivos/`\n',
    '#### Researchs executados\n\n- **R-001** [critical] Afirmação — Verdict: verified — Confidence: high — Evidence: research/fonte.md — Budget: 1/3\n',
  ]) {
    const spec = put(root, 'specs/defined/0001-exemplo/spec.md', index + extra);
    const result = node(script('specsfy-03-specify', 'load_research'), [spec, '--json']);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.notDeepEqual(JSON.parse(result.stdout).errors, []);
  }
  const evidence = put(root, 'specs/defined/0001-exemplo/research/fonte.md', '# Fonte\n');
  const spec = put(root, 'specs/defined/0001-exemplo/spec.md', index + '- `research/fonte.md`\n');
  const result = node(script('specsfy-03-specify', 'load_research'), [spec, '--json']);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.ok(evidence.endsWith('/' + JSON.parse(result.stdout).artifacts[0].path));
});

test('research rejeita cada claim malformado mesmo com índice vazio ou outro claim válido', t => {
  const root = temporary(t);
  put(root, 'specs/defined/0001-exemplo/research/fonte.md', '# Fonte\n');
  const claim = (id, level, budget, file = 'fonte.md') =>
    `- **${id}** [${level}] Afirmação — Verdict: verified — Confidence: high — Evidence: research/${file} — Budget: ${budget}\n`;
  const validate = (index, claims) => {
    const spec = put(root, 'specs/defined/0001-exemplo/spec.md',
      '#### Artefatos de pesquisa armazenados\n\n' + index + '\n#### Researchs executados\n\n' + claims);
    const result = node(script('specsfy-03-specify', 'load_research'), [spec, '--json']);
    return { status: result.status, ...JSON.parse(result.stdout) };
  };
  const absent = validate('- Nenhum artefato externo.\n', claim('R-001', 'high', '1/x', 'ausente.md'));
  assert.equal(absent.status, 1, JSON.stringify(absent));
  assert.ok(absent.errors.some(error => error.includes('R-001') && error.includes('ResearchClaim')));
  const mixed = validate('- `research/fonte.md`\n',
    claim('R-001', 'low', '1/3') + claim('R-002', 'critical', '1/x') + claim('R-003', 'medium', '1/x'));
  assert.equal(mixed.status, 1, JSON.stringify(mixed));
  assert.deepEqual(mixed.claims.map(item => item.id), ['R-001']);
  for (const id of ['R-002', 'R-003']) {
    assert.ok(mixed.errors.some(error => error.includes(id) && error.includes('ResearchClaim')));
  }
  const local = validate('- Nenhum artefato externo.\n',
    '- **R-001**: O código local já trata a falha.\n- Orientação com `[critical]`.\n');
  assert.equal(local.status, 0, JSON.stringify(local));
});
