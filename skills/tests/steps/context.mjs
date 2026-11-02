/** Executa os contratos BDD de contexto auxiliar e documentação do consumidor. */
import { assert, temporary, put, text, run, success, includes, join, existsSync, readdirSync } from './helpers.mjs';
const scripts = { setup: 'specsfy-setup/scripts/setup_context.mjs', stack: 'specsfy-aux-stack/scripts/update_stack.mjs', database: 'specsfy-aux-database/scripts/update_database.mjs', monitor: 'specsfy-setup/scripts/monitor_context.mjs', docs: 'specsfy-documentator/scripts/build_documentation.mjs' };
const execute = (name, project, ...args) => run(scripts[name], ['--project', project, ...args]);
const setup = ctx => { ctx.result = execute('setup', ctx.project); success(ctx.result); };
const docs = ctx => { const result = execute('docs', ctx.project); success(result); ctx.docs = Object.fromEntries(readdirSync(join(ctx.project, 'docs')).filter(file => file.endsWith('.md')).map(file => [file, text(ctx.project, 'docs/' + file)])); };
const combined = ctx => Object.values(ctx.docs).join('\n');
export const contextSteps = [
  ['um projeto Laravel, Next ou Astro ainda sem contexto auxiliar', ctx => { ctx.project = temporary(ctx.t); put(ctx.project, 'composer.json', '{"require":{"laravel/framework":"^12.0"}}'); }],
  ['a skill specsfy-setup é executada', setup],
  ['PROJECT.md existe na raiz do projeto', ctx => assert.ok(existsSync(join(ctx.project, 'PROJECT.md')))],
  ['STACK.md, RULES.md, DATABASE.md e USER-PROFILE.md existem sob .specsfy', ctx => { for (const name of ['STACK.md', 'RULES.md', 'DATABASE.md', 'USER-PROFILE.md']) assert.ok(existsSync(join(ctx.project, '.specsfy', name)), name); }],
  ['os modelos refletem o stack observado', ctx => includes(text(ctx.project, '.specsfy/STACK.md'), ['Laravel'])],
  ['AGENTS.md e CLAUDE.md reservam um bloco para as diretrizes do framework', ctx => { for (const name of ['AGENTS.md', 'CLAUDE.md']) includes(text(ctx.project, name), ['<!-- specsfy:framework:start -->', '<!-- specsfy:framework:end -->']); }],
  ['o setup não inicia versionamento nem deploy sem pedido explícito', ctx => { for (const path of ['SEMVER', 'Dockerfile', 'compose.yaml', 'stack.yaml', 'deploy', 'ansible']) assert.ok(!existsSync(join(ctx.project, path)), path); }],
  ['arquivos auxiliares com dados adicionados pela pessoa', ctx => { ctx.project = temporary(ctx.t); put(ctx.project, 'package.json', '{"dependencies":{"next":"15.0.0"}}'); put(ctx.project, 'PROJECT.md', '# Projeto\n\nNota humana preservada.\n'); put(ctx.project, 'AGENTS.md', '# Instruções humanas\n'); put(ctx.project, '.specsfy/USER-PROFILE.md', '# Perfil de interação\n\n| Nível atual | experiente |\n'); }],
  ['setup ou uma skill specsfy-aux é executada novamente', ctx => { success(execute('setup', ctx.project)); success(execute('stack', ctx.project)); ctx.stackBefore = text(ctx.project, '.specsfy/STACK.md'); success(execute('setup', ctx.project)); success(execute('stack', ctx.project)); ctx.stackAfter = text(ctx.project, '.specsfy/STACK.md'); }],
  ['o conteúdo existente permanece no arquivo', ctx => includes(text(ctx.project, 'PROJECT.md'), ['Nota humana preservada.'])],
  ['o perfil de interação existente permanece com nível confirmado', ctx => includes(text(ctx.project, '.specsfy/USER-PROFILE.md'), ['| Nível atual | experiente |'])],
  ['somente observações novas e ausentes são acrescentadas', ctx => assert.equal(ctx.stackAfter, ctx.stackBefore)],
  ['instruções do usuário fora do bloco Specsfy permanecem intactas', ctx => { const agents = text(ctx.project, 'AGENTS.md'); assert.ok(agents.startsWith('# Instruções humanas')); includes(agents, ['<!-- specsfy:framework:start -->']); }],
  ['uma migration ou estrutura de banco criada no projeto', ctx => { ctx.project = temporary(ctx.t); put(ctx.project, 'database/migrations/2026_create_orders.php', "<?php Schema::create('orders', function ($table) {$table->id(); $table->string('status'); });"); put(ctx.project, '.specsfy/DATABASE.md', '# Banco\n\nDecisão humana.\n'); }],
  ['a skill mantenedora do banco é executada', ctx => { ctx.result = execute('database', ctx.project); success(ctx.result); }],
  ['DATABASE.md registra a estrutura em tabelas Markdown', ctx => includes(text(ctx.project, '.specsfy/DATABASE.md'), ['| Estrutura | Tipo | Campos | Relações | Fonte |', 'orders'])],
  ['as notas e decisões humanas continuam intactas', ctx => includes(text(ctx.project, '.specsfy/DATABASE.md'), ['Decisão humana.'])],
  ['mudanças em código da aplicação, manifests ou estruturas persistentes', ctx => { ctx.paths = ['package.json', 'app/Models/Order.php', 'database/migrations/2026_create_orders.php']; }],
  ['o monitor de contexto compara os caminhos alterados', ctx => { const result = execute('monitor', '/tmp/project', '--json', '--paths', ...ctx.paths); success(result); ctx.report = JSON.parse(result.stdout); }],
  ['ele exige STACK.md para mudanças estruturais de stack', ctx => assert.ok(ctx.report.pending.some(item => item.document === '.specsfy/STACK.md'))],
  ['exige DATABASE.md para mudanças de banco ou migration', ctx => assert.ok(ctx.report.pending.some(item => item.document === '.specsfy/DATABASE.md'))],
  ['exige revisão explícita de PROJECT.md para mudanças da aplicação', ctx => assert.equal(ctx.report.project_review_required, true)],
  ['a entrega não conclui enquanto uma obrigação documental estiver aberta', ctx => { assert.equal(ctx.report.status, 'pending'); assert.ok(ctx.report.pending.some(item => item.skill === 'specsfy-documentator')); }],
  ['uma constituição e artefatos do GitHub Spec Kit em specs', ctx => { ctx.project = temporary(ctx.t); ctx.specKitSources = { '.specify/memory/constitution.md': '# Constituição\n\nPreservar esta fonte.\n', 'specs/001-pedidos/spec.md': '# Pedidos\n\nEspecificação existente.\n', 'specs/001-pedidos/plan.md': '# Plano\n\nArtefato existente.\n' }; for (const [path, source] of Object.entries(ctx.specKitSources)) put(ctx.project, path, source); }],
  ['a projeção SPECKIT.md referencia a constituição e todos os artefatos', ctx => includes(text(ctx.project, '.specsfy/SPECKIT.md'), Object.keys(ctx.specKitSources))],
  ['as diretrizes do Specsfy exigem a leitura das fontes originais', ctx => includes(text(ctx.project, 'AGENTS.md'), ['.specify/memory/constitution.md', 'cada fonte do GitHub Spec Kit listada na\n  projeção'])],
  ['nenhum arquivo do GitHub Spec Kit é alterado ou removido', ctx => { for (const [path, source] of Object.entries(ctx.specKitSources)) assert.equal(text(ctx.project, path), source); }],
  ['uma aplicação Laravel existente com banco, rotas, testes e frontend', ctx => {
    ctx.project = temporary(ctx.t);
    const sources = {
      'composer.json': '{"require":{"laravel/framework":"^12.0"},"require-dev":{"pestphp/pest":"^4.0"}}',
      'package.json': '{"dependencies":{"react":"19.0.0","tailwindcss":"4.0.0"}}',
      'routes/web.php': "<?php Route::get('/orders', [OrderController::class, 'index']);",
      'app/Http/Controllers/OrderController.php': '<?php class OrderController {}',
      'app/Models/Order.php': '<?php class Order extends Model {}',
      'resources/views/orders.blade.php': '<div>Pedidos</div>',
      'resources/js/Orders.jsx': 'export function Orders(){ return <main /> }',
      'resources/css/app.css': "@import 'tailwindcss';",
      'database/migrations/2026_create_orders.php': "<?php Schema::create('orders', function ($table) {$table->id();});",
      'tests/Feature/OrdersTest.php': "<?php test('pedidos', fn () => true);",
    };
    for (const [path, source] of Object.entries(sources)) put(ctx.project, path, source);
  }],
  ['a skill specsfy-documentator constrói a documentação', docs],
  ['docs contém arquitetura aplicação banco fluxos testes frontend pacotes integrações e decisões', ctx => assert.deepEqual(Object.keys(ctx.docs).sort(), ['README.md', 'architecture.md', 'application.md', 'database.md', 'flows.md', 'testing.md', 'frontend.md', 'packages.md', 'integrations.md', 'decisions.md'].sort())],
  ['os mapas usam Mermaid para componentes fluxo classes e entidades', ctx => includes(combined(ctx), ['flowchart', 'classDiagram', 'erDiagram', 'sequenceDiagram'])],
  ['controllers models views React Tailwind e Pest são inventariados', ctx => includes(combined(ctx), ['OrderController', 'Order', 'orders.blade.php', 'React', 'Tailwind', 'Pest'])],
  ['uma aplicação Node existente com Next React Tailwind e Vitest', ctx => {
    ctx.project = temporary(ctx.t);
    const sources = {
      'package.json': '{"scripts":{"test":"vitest run"},"dependencies":{"next":"15.0.0","react":"19.0.0","tailwindcss":"4.0.0"},"devDependencies":{"vitest":"3.0.0"}}',
      'app/page.tsx': 'export default function Page(){ return <Dashboard /> }',
      'app/api/orders/route.ts': 'export async function GET() {}',
      'components/Dashboard.tsx': 'export function Dashboard(){ return <main /> }',
      'tests/dashboard.test.tsx': "import { test } from 'vitest'; test('painel', () => {});",
      'tailwind.config.ts': 'export default { theme: {} }',
    };
    for (const [path, source] of Object.entries(sources)) put(ctx.project, path, source);
  }],
  ['a documentação descreve páginas componentes APIs testes e comandos', ctx => includes(combined(ctx), ['app/page.tsx', 'Dashboard', 'app/api/orders/route.ts', 'Vitest', 'vitest run'])],
  ['cada pacote possui classificação versão fonte e coluna GitHub', ctx => includes(ctx.docs['packages.md'], ['Categoria', 'Escopo', 'Versão', 'Fonte', 'GitHub', 'Terceiro'])],
  ['.specsfy/PACKAGES.md inventaria todos os pacotes npm e Composer com finalidade', ctx => includes(text(ctx.project, '.specsfy/PACKAGES.md'), ['next', 'react', 'tailwindcss', 'vitest', 'Finalidade'])],
  ['uma documentação gerada com observações adicionadas pela equipe', ctx => { ctx.project = temporary(ctx.t); put(ctx.project, 'package.json', '{"dependencies":{"react":"19.0.0"}}'); put(ctx.project, 'src/App.tsx', 'export function App(){ return <main /> }'); docs(ctx); put(ctx.project, 'docs/README.md', text(ctx.project, 'docs/README.md') + '\nNota humana preservada.\n'); }],
  ['o documentador é executado novamente depois de uma implementação', ctx => { put(ctx.project, 'src/OrderExporter.ts', 'export class OrderExporter {}'); success(execute('docs', ctx.project)); }],
  ['os blocos detectados refletem o código atual', ctx => includes(text(ctx.project, 'docs/application.md'), ['OrderExporter'])],
  ['o conteúdo humano fora dos blocos permanece intacto', ctx => includes(text(ctx.project, 'docs/README.md'), ['Nota humana preservada.'])],
];
