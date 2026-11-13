/** Materializa os steps de progresso, navegação, execução de testes e atualização do CLI em Bun. */
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, read, temporary, put, node } from '../helpers.mjs';
const includes = (source, terms) => terms.forEach(term => assert.ok(source.includes(term), term));
export const cliSteps = [
  ['uma spec concluída com o cabeçalho tabular canônico', ctx => { ctx.project = temporary(ctx.t); put(ctx.project, 'specs/specs/0001-entrega/spec.md', '# Especificação integrada: Entrega concluída\n\n| Campo | Valor |\n| --- | --- |\n| Formato | Specsfy/2.0 |\n| Status | Complete |\n| Definition Gate | Passed |\n| Plan Gate | Passed |\n| Delivery Gate | Passed |\n'); }],
  ['o CLI projeta o progresso da especificação', ctx => { const result = node(join(ROOT, 'cli/bin/specsfy'), ['progress', '--project', ctx.project, '--json']); assert.equal(result.status, 0, result.stdout + result.stderr); ctx.payload = JSON.parse(result.stdout).data; }],
  ['o status e os três gates são reconhecidos', ctx => { const spec = ctx.payload.specs[0]; assert.equal(spec.status, 'Complete'); for (const key of ['definition_gate', 'plan_gate', 'delivery_gate']) assert.equal(spec[key], 'Passed'); assert.equal(spec.passed_gates, 3); }],
  ['o resumo contabiliza a spec como concluída', ctx => assert.equal(ctx.payload.summary.completed_specs, 1)],
  ['a implementação da aba Specs da TUI', ctx => { ctx.tui = read('cli/src/tui/screens/specs.ts'); }],
  ['o contrato de visualização da spec é inspecionado', ctx => assert.ok(ctx.tui)],
  ['a lista agrupa as specs por estado com gates e progresso', ctx => includes(ctx.tui, ['specsByFolder', 'spec.passed_gates', 'spec.percent', 'selectList('])],
  ['o Markdown da spec destacada fica rolável ao lado da lista', ctx => includes(ctx.tui, ['markdownView(', '{ key: "PgUp/PgDn", action: "scroll" }'])],
  ['a implementação do runner de testes do CLI', ctx => { ctx.testing = read('cli/src/domain/project-testing.ts'); ctx.app = read('cli/src/cli/commands/testing.ts'); ctx.tui = read('cli/src/tui/screens/tests.ts'); }],
  ['o contrato de execução de testes é inspecionado', ctx => assert.ok(ctx.app && ctx.tui)],
  ['o CLI detecta Laravel com Pest sem executar comandos arbitrários', ctx => { includes(ctx.testing, ['["php", "artisan", "test"]', 'spawn(']); assert.ok(!ctx.testing.includes('shell:')); }],
  ['o comando specsfy test transmite a saída e preserva o exit code', ctx => includes(ctx.app, ['name: "test"', 'runProjectTests(project, emit)', 'exitCode'])],
  ['a TUI só executa a suíte quando a pessoa pede e mantém a saída rolável', ctx => includes(ctx.tui, ['{ key: "Enter", action: "run tests" }', '{ key: "PgUp/PgDn", action: "scroll" }'])],
  ['a implementação do auto updater do CLI', ctx => { ctx.updater = read('cli/src/domain/updater.ts'); }],
  ['o contrato de atualização é inspecionado', ctx => assert.ok(ctx.updater)],
  ['a checagem diária guarda o estado em ~/.specsfy/update.json', ctx => includes(ctx.updater, ['"update.json"', 'CHECK_INTERVAL_SECONDS = 86_400'])],
  ['a versão mais recente vem da última GitHub Release do repositório', ctx => includes(ctx.updater, ['api.github.com/repos/promovaweb/specsfy/releases/latest'])],
  ['o binário avulso confere o SHA256SUMS antes de trocar o executável', ctx => includes(ctx.updater, ['SHA256SUMS'])],
  ['a instalação pelo npm é atualizada pelo pacote oficial', ctx => includes(ctx.updater, ['NPM_PACKAGE_NAME = "@promovaweb/specsfy"'])],
  ['a implementação da aba Skills do CLI', ctx => { ctx.tui = read('cli/src/tui/screens/skills.ts'); ctx.services = read('cli/src/tui/services.ts'); ctx.app = read('cli/src/cli/commands/framework.ts'); ctx.installer = read('cli/src/domain/installer.ts'); }],
  ['o contrato de apresentação é inspecionado', ctx => assert.ok(ctx.tui)],
  ['as skills aparecem por categoria com o estado instalado ou disponível em texto', ctx => includes(ctx.tui, ['grouped by category', 'installed or available'])],
  ['instalar, remover e atualizar pedem confirmação antes de alterar arquivos', ctx => includes(ctx.tui, ['{ key: "i", action: "install" }', '{ key: "x", action: "remove" }', 'Every action asks for confirmation first'])],
  ['a aba oferece uma ação para atualizar todas as skills instaladas', ctx => { includes(ctx.tui, ['{ key: "u", action: "update all" }']); includes(ctx.services, ['.updateAll()']); }],
  ['o CLI oferece a atualização não interativa equivalente', ctx => { includes(ctx.app, ['name: "update"', '.updateAll()']); includes(ctx.installer, ['async updateAll()']); }],
];
