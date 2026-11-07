/** Verifica a geração documental a partir de projetos Laravel, React e Node. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, read, temporary, put, node } from '../../tests/helpers.mjs';

const expected = ['README.md', 'architecture.md', 'application.md', 'database.md', 'flows.md', 'testing.md', 'frontend.md', 'packages.md', 'integrations.md', 'decisions.md'].sort();
const builder = join(ROOT, 'skills/specsfy-documentator/scripts/build_documentation.mjs');
const run = (root, ...args) => node(builder, ['--project', root, ...args]);
const successful = result => assert.equal(result.status, 0, result.stdout + result.stderr);
const json = (root, path, value) => put(root, path, JSON.stringify(value));
const includes = (text, terms) => terms.forEach(term => assert.ok(text.includes(term), term));
const text = (root, path) => readFileSync(join(root, path), 'utf8');
const combined = root => readdirSync(join(root, 'docs')).filter(file => file.endsWith('.md')).map(file => text(root, `docs/${file}`)).join('\n');

test('gera documentação Laravel e React com diagramas e preserva notas humanas', t => {
  const root = temporary(t);
  json(root, 'composer.json', { require: { php: '^8.4', 'laravel/framework': '^12.0' }, 'require-dev': { 'pestphp/pest': '^4.0' }, scripts: { test: 'php artisan test' } });
  json(root, 'composer.lock', { packages: [{ name: 'laravel/framework', version: 'v12.0.0', source: { url: 'https://github.com/laravel/framework.git' } }], 'packages-dev': [{ name: 'pestphp/pest', version: 'v4.0.0', source: { url: 'https://github.com/pestphp/pest.git' } }] });
  json(root, 'package.json', { dependencies: { react: '^19.0', tailwindcss: '^4.0' }, devDependencies: { vite: '^7.0' }, scripts: { build: 'vite build' } });
  const sources = {
    'routes/web.php': "Route::get('/orders', [OrderController::class, 'index']);\n",
    'app/Http/Controllers/OrderController.php': '<?php class OrderController { public function index() {} }\n',
    'app/Models/Order.php': "<?php class Order extends Model { protected $fillable = ['total']; }\n",
    'resources/views/orders/index.blade.php': '<h1>Pedidos</h1>\n',
    'resources/js/Components/OrderTable.tsx': 'export function OrderTable(){ return <div className="grid gap-4"/> }\n',
    'resources/css/app.css': '@import "tailwindcss";\n@theme { --color-brand: #123456; }\n',
    'database/migrations/2026_create_orders_table.php': "<?php Schema::create('orders', function (Blueprint $table) {$table->id(); $table->foreignId('user_id');$table->decimal('total'); });\n",
    'tests/Feature/OrdersTest.php': "<?php test('lista pedidos', function () {});\n",
    '.env.example': 'DB_CONNECTION=pgsql\nSTRIPE_KEY=\n',
  };
  for (const [path, value] of Object.entries(sources)) put(root, path, value);
  successful(run(root));
  assert.deepEqual(readdirSync(join(root, 'docs')).filter(file => file.endsWith('.md')).sort(), expected);
  const output = combined(root);
  includes(output, ['flowchart', 'classDiagram', 'erDiagram', 'sequenceDiagram', 'OrderController', 'Order', 'orders/index.blade.php', 'OrderTable', 'Tailwind', '--color-brand', 'Pest', 'tests/Feature/OrdersTest.php', 'laravel/framework', 'https://github.com/laravel/framework', 'Serviços', 'Rotas e APIs', 'Páginas', 'Componentes', 'Testes', 'Outras fontes', ': relaciona']);
  for (const label of ['| Services |', '| Routes and APIs |', '| Pages |', '| Components |', '| Tests |', '| Other source |', ': relates']) assert.ok(!output.includes(label), label);
  appendFileSync(join(root, 'docs/application.md'), '\n## Nota humana\n\nPreservar esta explicação.\n');
  put(root, 'app/Services/OrderExporter.php', '<?php class OrderExporter {}\n');
  successful(run(root));
  includes(text(root, 'docs/application.md'), ['OrderExporter', 'Preservar esta explicação.']);
  successful(run(root, '--check'));
});

test('mapeia Next, React, testes e origem dos pacotes Node', t => {
  const root = temporary(t);
  json(root, 'package.json', { dependencies: { next: '^16.0', react: '^19.0', tailwindcss: '^4.0', 'acme-sdk': '^2.0' }, devDependencies: { vitest: '^4.0' }, scripts: { test: 'vitest run', build: 'next build' } });
  json(root, 'node_modules/acme-sdk/package.json', { name: 'acme-sdk', repository: { type: 'git', url: 'git+https://github.com/acme/sdk.git' } });
  for (const [path, source] of Object.entries({
    'app/page.tsx': 'export default function Page(){ return <Dashboard/> }\n',
    'app/api/orders/route.ts': 'export async function GET(){ return Response.json([]) }\n',
    'components/Dashboard.tsx': 'export function Dashboard(){ return <main className="mx-auto"/> }\n',
    'tests/dashboard.test.tsx': "import { test } from 'vitest'; test('painel', () => {});\n",
    'tailwind.config.ts': 'export default { theme: {} };\n',
  })) put(root, path, source);
  successful(run(root));
  includes(combined(root), ['Next.js', 'app/page.tsx', 'app/api/orders/route.ts', 'Dashboard', 'Vitest', 'vitest run', 'tailwind.config.ts', 'https://github.com/acme/sdk']);
  includes(text(root, 'docs/packages.md'), ['Categoria', 'Escopo', 'Versão', 'Fonte', 'GitHub', '| Terceiro | desenvolvimento | vitest |']);
});

test('registra pacotes diretos, transitivos e legados com descrições e atualização verificável', t => {
  const root = temporary(t);
  json(root, 'composer.json', { require: { 'laravel/framework': '^12.0' }, 'require-dev': { 'pestphp/pest': '^4.0' } });
  json(root, 'composer.lock', { packages: [{ name: 'laravel/framework', version: 'v12.0.0', description: 'The Laravel Framework.' }, { name: 'psr/log', version: '3.0.2', description: 'Common interface for logging libraries.' }], 'packages-dev': [{ name: 'pestphp/pest', version: 'v4.0.0', description: 'An elegant PHP testing framework.' }] });
  const manifest = { dependencies: { 'acme-sdk': '^2.0' }, devDependencies: { vitest: '^4.0' }, optionalDependencies: { fsevents: '^2.3' }, peerDependencies: { react: '^19.0' } };
  json(root, 'package.json', manifest);
  json(root, 'package-lock.json', { lockfileVersion: 3, packages: { '': {}, 'node_modules/acme-sdk': { version: '2.1.0' }, 'node_modules/nanoid': { version: '5.1.0' } } });
  json(root, 'node_modules/acme-sdk/package.json', { name: 'acme-sdk', description: 'Integra a aplicação com a API da Acme.' });
  json(root, 'node_modules/nanoid/package.json', { name: 'nanoid', description: 'Gera identificadores pequenos e únicos.' });
  json(root, 'apps/admin/package.json', { dependencies: { zod: '^4.0' } });
  json(root, 'apps/legacy/package.json', { dependencies: { 'legacy-root': '^1.0' } });
  json(root, 'apps/legacy/package-lock.json', { lockfileVersion: 1, dependencies: { 'legacy-root': { version: '1.2.0', dependencies: { 'legacy-child': { version: '2.0.0' } } } } });
  json(root, 'apps/legacy/node_modules/legacy-child/package.json', { name: 'legacy-child', description: 'Compatibiliza a integração legada.' });
  successful(run(root));
  const path = '.specsfy/PACKAGES.md';
  includes(text(root, path), ['laravel/framework', 'pestphp/pest', 'psr/log', 'acme-sdk', 'nanoid', 'vitest', 'fsevents', 'react', 'zod', 'legacy-root', 'legacy-child', 'Gerenciador', 'Escopo', 'Pacote', 'Versão', 'Finalidade', 'Fonte', 'The Laravel Framework.', 'An elegant PHP testing framework.', 'Common interface for logging libraries.', 'Integra a aplicação com a API da Acme.', 'Gera identificadores pequenos e únicos.', '| Composer | transitiva | psr/log |', '| npm | transitiva | nanoid |', '| npm | transitiva | legacy-child |', 'Compatibiliza a integração legada.', 'Finalidade não descrita nos metadados locais']);
  successful(run(root, '--check'));
  appendFileSync(join(root, path), '\n## Nota humana\n\nRevisar licença antes de atualizar.\n');
  successful(run(root));
  includes(text(root, path), ['Revisar licença antes de atualizar.']);
  manifest.dependencies.axios = '^1.0';
  json(root, 'package.json', manifest);
  const stale = run(root, '--check');
  assert.equal(stale.status, 1, stale.stdout + stale.stderr);
  includes(stale.stderr, ['.specsfy/PACKAGES.md']);
});

const git = (root, ...args) => assert.equal(spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' }).status, 0, args.join(' '));
const astroBuild = root => {
  put(root, '.teste/completo/_astro/index.Bx1.js', 'export function Saida(){}\n');
  put(root, '.teste/completo/_astro/index.Cy2.css', ':root { --gerado: 1px; }\n');
  put(root, '.astro/types.d.ts', 'declare module "astro:content" {}\n');
  put(root, '.astro/content.d.ts', 'export interface Gerado {}\n');
};
const excludes = (text, terms) => terms.forEach(term => assert.ok(!text.includes(term), term));

test('respeita o .gitignore e ignora saídas de build e teste fora da lista fixa', t => {
  const root = temporary(t);
  git(root, 'init', '-q');
  put(root, '.gitignore', '.teste/\n.astro/\n');
  json(root, 'package.json', { dependencies: { astro: '^5.0' } });
  put(root, 'src/pages/index.astro', '---\nconst titulo = "Início";\n---\n<h1>{titulo}</h1>\n');
  put(root, 'src/components/Cabecalho.astro', '<header>Cabeçalho</header>\n');
  git(root, 'add', 'package.json', '.gitignore', 'src/pages/index.astro');
  astroBuild(root);
  successful(run(root));
  const output = combined(root);
  includes(output, ['src/pages/index.astro', 'src/components/Cabecalho.astro']);
  excludes(output, ['.teste/', '.astro/', '_astro', 'types.d.ts', '--gerado']);
  put(root, '.teste/completo/_astro/outra.Dz3.js', 'export function Nova(){}\n');
  successful(run(root, '--check'));
});

test('usa a lista fixa como reserva quando o projeto não está no Git', t => {
  const root = temporary(t);
  json(root, 'package.json', { dependencies: { astro: '^5.0' } });
  put(root, 'src/pages/index.astro', '<h1>Início</h1>\n');
  put(root, 'dist/index.js', 'export function Construido(){}\n');
  put(root, 'node_modules/astro/index.js', 'export function Dependencia(){}\n');
  successful(run(root));
  const output = combined(root);
  includes(output, ['src/pages/index.astro']);
  excludes(output, ['dist/index.js', 'node_modules/astro', 'Construido', 'Dependencia']);
});

test('skill documental é independente e obrigatória após implementação', () => {
  includes(read('skills/specsfy-documentator/SKILL.md'), ['código existente', 'build_documentation.mjs']);
  for (const path of ['skills/specsfy-07-implement/SKILL.md', 'skills/Spec.md']) includes(read(path), ['$specsfy-documentator']);
});
