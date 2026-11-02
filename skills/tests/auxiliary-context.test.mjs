/** Exercita criação, preservação e monitoramento dos contextos do consumidor. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { ROOT, read, temporary, put, node } from '../../tests/helpers.mjs';

const scripts = {
  setup: 'specsfy-setup/scripts/setup_context.mjs',
  stack: 'specsfy-aux-stack/scripts/update_stack.mjs',
  rules: 'specsfy-aux-rules/scripts/add_rule.mjs',
  database: 'specsfy-aux-database/scripts/update_database.mjs',
  data: 'specsfy-data-discovery/scripts/registrar_dados_conversados.mjs',
  monitor: 'specsfy-setup/scripts/monitor_context.mjs',
};
const run = (name, root, ...args) => node(join(ROOT, 'skills', scripts[name]), ['--project', root, ...args]);
const successful = result => assert.equal(result.status, 0, result.stdout + result.stderr);
const text = (root, path) => readFileSync(join(root, path), 'utf8');
const includes = (content, terms) => terms.forEach(term => assert.ok(content.includes(term), term));
const monitor = (...args) => run('monitor', '/tmp/project', '--check', ...args);

/** Captura bytes para detectar qualquer reescrita indevida na repetição do setup. */
function snapshot(root, directory = '') {
  return Object.fromEntries(readdirSync(join(root, directory), { withFileTypes: true }).flatMap(item => {
    const path = join(directory, item.name);
    return item.isDirectory() ? Object.entries(snapshot(root, path)) : item.isFile() ? [[path, readFileSync(join(root, path))]] : [];
  }));
}

test('entradas de produto encaminham a descoberta dos dados', () => {
  for (const name of ['specsfy-01-inbox', 'specsfy-02-backlog', 'specsfy-mvp-milestone-interviewer', 'specsfy-03-specify']) includes(read(`skills/${name}/SKILL.md`), ['$specsfy-data-discovery', 'DATABASE.md']);
});
test('registra dados confirmados sem substituir o conteúdo detectado', t => {
  const root = temporary(t);
  put(root, '.specsfy/DATABASE.md', '# Banco de dados\n\n## Inventário detectado\n\nFonte do código.\n');
  successful(run('data', root, '--nome', 'Pedido', '--para-que-serve', 'Acompanhar o que cada cliente pediu.', '--o-que-guardar', 'cliente, itens escolhidos, endereço de entrega e situação', '--formato-sugerido', 'escolha entre opções para a situação e texto livre para observações', '--ligacoes', 'Um pedido pertence a um cliente.', '--acesso', 'A equipe de atendimento consulta; o cliente vê somente os próprios pedidos.', '--ciclo-de-vida', 'Manter enquanto houver atendimento e apagar conforme a regra aprovada.', '--fontes', 'specs/inbox/2026-08-20-120000-pedidos.md'));
  includes(text(root, '.specsfy/DATABASE.md'), ['## Informações a guardar confirmadas', '| Informação | Para que serve | O que guardar | Formato sugerido |', 'Pedido', 'cliente, itens escolhidos', 'escolha entre opções para a situação', 'Fonte do código.']);
});
test('setup usa templates centrais para todos os contextos', () => {
  for (const name of ['Project.md', 'Stack.md', 'Rules.md', 'Database.md', 'UserProfile.md']) {
    assert.ok(existsSync(join(ROOT, 'skills/templates', name)), name);
    includes(read('skills/' + scripts.setup), ['join(project, ".specsfy", "templates", name)']);
  }
});
test('setup cria e preserva o perfil informado pela pessoa', t => {
  const root = temporary(t), path = '.specsfy/USER-PROFILE.md';
  successful(run('setup', root));
  const before = text(root, path).replace('| Nível atual | A confirmar |', '| Nível atual | experiente |');
  put(root, path, before);
  successful(run('setup', root));
  assert.equal(text(root, path), before);
});
test('setup conserva a subpasta selecionada como raiz e repete sem alterações', t => {
  const hub = temporary(t), root = join(hub, 'apps/portal');
  mkdirSync(root, { recursive: true });
  successful(run('setup', root));
  for (const path of ['PROJECT.md', '.specsfy/STACK.md']) assert.ok(existsSync(join(root, path)), path);
  for (const path of ['SEMVER', 'Dockerfile', 'compose.yaml', 'stack.yaml', 'deploy', 'ansible']) assert.ok(!existsSync(join(root, path)), path);
  for (const path of ['PROJECT.md', 'specs']) assert.ok(!existsSync(join(hub, path)), path);
  const before = snapshot(root), repeated = run('setup', root);
  successful(repeated);
  assert.equal(repeated.stdout, '');
  assert.deepEqual(snapshot(root), before);
  includes(text(root, 'AGENTS.md').toLowerCase().split(/\s+/).join(' '), ['diretório do projeto', 'não promova']);
});
test('monitor exige stack e documentação de banco na mesma alteração', () => {
  const paths = ['package.json', 'database/migrations/2026_07_27_create_orders.php'];
  const pending = monitor('--paths', ...paths);
  assert.equal(pending.status, 1);
  includes(pending.stdout, ['.specsfy/STACK.md', '.specsfy/DATABASE.md', '.specsfy/PACKAGES.md']);
  successful(monitor('--paths', ...paths, '.specsfy/STACK.md', '.specsfy/DATABASE.md', '.specsfy/PACKAGES.md', 'docs/database.md'));
});
test('monitor exige registro de pacotes quando manifests mudam', () => {
  const pending = monitor('--json', '--paths', 'package.json', '.specsfy/STACK.md');
  assert.equal(pending.status, 1);
  includes(pending.stdout, ['"document": ".specsfy/PACKAGES.md"', '"skill": "specsfy-documentator"']);
  successful(monitor('--paths', 'package.json', '.specsfy/STACK.md', '.specsfy/PACKAGES.md', 'docs/packages.md'));
});
test('monitor exige revisão de projeto após alteração de aplicação', () => {
  const path = 'app/Http/Controllers/OrdersController.php';
  const pending = monitor('--json', '--paths', path);
  assert.equal(pending.status, 1);
  includes(pending.stdout, ['"project_review_required": true']);
  successful(monitor('--acknowledge-project-no-change', '--paths', path, 'docs/application.md'));
});
test('monitor lê arquivos alterados e novos pelo Git', t => {
  const root = temporary(t);
  const initialized = spawnSync('git', ['init', '--quiet'], { cwd: root, encoding: 'utf8' });
  successful(initialized);
  put(root, 'package.json', '{}');
  const pending = run('monitor', root, '--check');
  assert.equal(pending.status, 1);
  includes(pending.stdout, ['.specsfy/STACK.md']);
  for (const path of ['.specsfy/STACK.md', '.specsfy/PACKAGES.md', 'docs/packages.md']) put(root, path, '# Pacotes\n');
  successful(run('monitor', root, '--check'));
});
test('monitor reconhece fontes Astro, Next e persistência genérica', () => {
  const result = monitor('--json', '--paths', 'src/pages/index.astro', 'src/db/schema.ts', 'lib/orders.ts');
  assert.equal(result.status, 1);
  includes(result.stdout, ['"project_review_required": true', '.specsfy/DATABASE.md', 'specsfy-documentator']);
});
test('monitor exige documentação do sistema ao alterar aplicação e banco', () => {
  const args = ['--acknowledge-project-no-change', '--paths', 'app/Models/Order.php', '.specsfy/DATABASE.md'];
  const pending = monitor('--json', ...args);
  assert.equal(pending.status, 1);
  includes(pending.stdout, ['"documentation_review_required": true', '"skill": "specsfy-documentator"']);
  successful(monitor(...args, 'docs/application.md', 'docs/database.md'));
});
test('skills de entrega exigem os encaminhamentos do monitor de contexto', () => {
  for (const name of ['specsfy-05-tasks', 'specsfy-07-implement', 'specsfy-progress']) includes(read(`skills/${name}/SKILL.md`), ['monitor_context.mjs']);
  for (const path of ['skills/specsfy-07-implement/SKILL.md', 'skills/Spec.md']) includes(read(path), ['monitor_context.mjs', '$specsfy-aux-stack', '$specsfy-aux-database']);
});
test('setup adapta Laravel, Next e Astro preservando regras e instruções locais', t => {
  const variants = [
    ['composer.json', '{"require":{"laravel/framework":"^12.0"}}', 'Laravel', 'database/migrations'],
    ['package.json', '{"dependencies":{"next":"^16.0","react":"^19.0"}}', 'Next.js', 'Server Components'],
    ['package.json', '{"dependencies":{"astro":"^5.0"}}', 'Astro', 'ilhas'],
  ];
  for (const [manifest, payload, framework, hint] of variants) {
    const root = temporary(t);
    put(root, manifest, payload);
    put(root, '.specsfy/RULES.md', '# Regras do sistema\n\n- Regra humana intocável.\n');
    put(root, 'AGENTS.md', '# Instruções humanas\n\nPreservar agentes locais.\n');
    put(root, 'CLAUDE.md', '# Claude local\n\nPreservar Claude local.\n');
    successful(run('setup', root));
    const paths = ['PROJECT.md', '.specsfy/STACK.md', '.specsfy/RULES.md', '.specsfy/DATABASE.md', '.specsfy/USER-PROFILE.md', 'AGENTS.md', 'CLAUDE.md'];
    const before = Object.fromEntries(paths.map(path => [path, text(root, path)]));
    includes(before['.specsfy/STACK.md'], [framework]);
    includes(['PROJECT.md', '.specsfy/RULES.md', '.specsfy/DATABASE.md'].map(path => before[path]).join('\n'), [hint]);
    includes(before['.specsfy/RULES.md'], ['Regra humana intocável.']);
    includes(before['AGENTS.md'], ['Preservar agentes locais.', '<!-- specsfy:framework:start -->', '`.specsfy/STACK.md`']);
    includes(before['CLAUDE.md'], ['Preservar Claude local.', '<!-- specsfy:framework:start -->', '@.specsfy/Spec.md']);
    successful(run('setup', root));
    assert.deepEqual(Object.fromEntries(paths.map(path => [path, text(root, path)])), before);
  }
});
test('setup projeta o Spec Kit com hashes sem modificar fontes ou notas locais', t => {
  const root = temporary(t), feature = 'specs/001-checkout/';
  const sources = {
    '.specify/memory/constitution.md': Buffer.from('# Constituicao do projeto\n\n## I. Qualidade\n'),
    [feature + 'spec.md']: Buffer.from('# Checkout recorrente\n\n## Requisitos\n'),
    [feature + 'plan.md']: Buffer.from('# Plano do checkout\n'),
    [feature + 'tasks.md']: Buffer.from('# Tarefas do checkout\n'),
    [feature + 'contracts/openapi.yaml']: Buffer.from('openapi: 3.1.0\n'),
    [feature + 'fixture.bin']: Buffer.from([0, 1, ...Buffer.from('spec-kit'), 255]),
  };
  const hash = buffer => createHash('sha256').update(buffer).digest('hex');
  for (const [path, buffer] of Object.entries(sources)) put(root, path, buffer);
  successful(run('setup', root));
  const bridge = '.specsfy/SPECKIT.md', projection = text(root, bridge);
  for (const [path, buffer] of Object.entries(sources)) {
    includes(projection, ['`' + path + '`', hash(buffer)]);
    assert.deepEqual(readFileSync(join(root, path)), buffer);
  }
  includes(projection, ['Checkout recorrente', '| Constituição |', 'arquivo binário']);
  includes(text(root, 'AGENTS.md'), ['`.specsfy/SPECKIT.md`', '`.specify/memory/constitution.md`']);
  const note = '# Nota local\n\nPreservar esta observacao.\n\n';
  put(root, bridge, note + projection);
  sources[feature + 'spec.md'] = Buffer.from('# Checkout recorrente\n\n## Requisitos revistos\n');
  put(root, feature + 'spec.md', sources[feature + 'spec.md']);
  successful(run('setup', root));
  const refreshed = text(root, bridge);
  assert.ok(refreshed.startsWith(note));
  includes(refreshed, [hash(sources[feature + 'spec.md'])]);
  for (const marker of ['<!-- specsfy:speckit:start -->', '<!-- specsfy:speckit:end -->']) assert.equal(refreshed.split(marker).length - 1, 1);
  for (const [path, buffer] of Object.entries(sources)) assert.deepEqual(readFileSync(join(root, path)), buffer);
});
test('setup não cria projeção Spec Kit sem constituição', t => {
  const root = temporary(t);
  put(root, 'specs/001-native/spec.md', '# Spec nativa\n');
  successful(run('setup', root));
  assert.ok(!existsSync(join(root, '.specsfy/SPECKIT.md')));
});
test('setup prefere o template de contexto customizado', t => {
  const root = temporary(t);
  put(root, '.specsfy/templates/custom/Project.md', read('skills/templates/Project.md').replace('# Projeto', '# Contexto customizado do projeto'));
  successful(run('setup', root));
  includes(text(root, 'PROJECT.md'), ['# Contexto customizado do projeto']);
});
test('referência do setup coincide com o bloco de instruções publicado', () => {
  const start = '<!-- specsfy:framework:start -->', end = '<!-- specsfy:framework:end -->';
  const block = text => {
    assert.ok(text.includes(start) && text.includes(end));
    return (start + text.split(start)[1].split(end)[0] + end).trim();
  };
  assert.equal(block(read('skills/AGENTS.md')), block(read('skills/specsfy-setup/references/framework-instructions.md')));
});
test('atualização da stack preserva escolhas locais e acrescenta tecnologias detectadas', t => {
  const root = temporary(t), path = '.specsfy/STACK.md';
  put(root, 'package.json', '{"dependencies":{"next":"^16.0","react":"^19.0"}}');
  put(root, path, '# Stack\n\n## Inventário detectado\n\n<!-- specsfy:stack:start -->\n| Camada | Tecnologia | Evidência |\n| --- | --- | --- |\n| Serviço | Busca proprietária | Decisão humana |\n<!-- specsfy:stack:end -->\n\n## Decisão humana\n\nUsar arquitetura hexagonal.\n');
  successful(run('stack', root));
  includes(text(root, path), ['Usar arquitetura hexagonal.', '| Serviço | Busca proprietária | Decisão humana |', '| Framework | Next.js |', '| Biblioteca | React |']);
});
test('helper de regras acrescenta sem substituir ou duplicar', t => {
  const root = temporary(t), path = '.specsfy/RULES.md';
  put(root, path, '# Regras\n\n## Segurança\n\n- Nunca registrar tokens.\n');
  for (let count = 0; count < 2; count++) successful(run('rules', root, '--section', 'Segurança', '--rule', 'Validar todo input externo.'));
  includes(text(root, path), ['Nunca registrar tokens.']);
  assert.equal(text(root, path).split('Validar todo input externo.').length - 1, 1);
});
test('banco mapeia migrations Laravel e conserva notas sem copiar senhas', t => {
  const root = temporary(t), path = '.specsfy/DATABASE.md';
  put(root, '.env.example', 'DB_CONNECTION=pgsql\nDB_PASSWORD=do-not-copy\n');
  put(root, 'database/migrations/2026_07_27_000000_create_orders_table.php', "<?php\nSchema::create('orders', function (Blueprint $table) {\n    $table->id();\n    $table->foreignId('user_id');\n    $table->decimal('total', 10, 2);\n});\n");
  put(root, path, '# Banco de dados\n\n## Decisões\n\nPedidos usam soft delete.\n');
  successful(run('database', root));
  const content = text(root, path);
  includes(content, ['Pedidos usam soft delete.', '| orders |', 'user_id', 'total', '2026_07_27_000000_create_orders_table.php', '| Principal | PostgreSQL | `.env.example` (`DB_CONNECTION`) |']);
  assert.ok(!content.includes('do-not-copy'));
});
