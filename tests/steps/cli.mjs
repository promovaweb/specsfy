/** Materializa os steps de progresso, navegação, execução de testes e atualização do CLI. */
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, read, temporary, put, node } from '../helpers.mjs';
const includes = (source, terms) => terms.forEach(term => assert.ok(source.includes(term), term));
const section = (source, start, end) => source.split(start)[1]?.split(end)[0] ?? '';
export const cliSteps = [
  ['uma spec concluída com o cabeçalho tabular canônico', ctx => { ctx.project = temporary(ctx.t); put(ctx.project, 'specs/specs/0001-entrega/spec.md', '# Especificação integrada: Entrega concluída\n\n| Campo | Valor |\n| --- | --- |\n| Formato | Specsfy/2.0 |\n| Status | Complete |\n| Definition Gate | Passed |\n| Plan Gate | Passed |\n| Delivery Gate | Passed |\n'); }],
  ['o CLI projeta o progresso da especificação', ctx => { const result = node(join(ROOT, 'cli/bin/specsfy'), ['progress', '--project', ctx.project, '--json']); assert.equal(result.status, 0, result.stdout + result.stderr); ctx.payload = JSON.parse(result.stdout); }],
  ['o status e os três gates são reconhecidos', ctx => { const spec = ctx.payload.specs[0]; assert.equal(spec.status, 'Complete'); for (const key of ['definition_gate', 'plan_gate', 'delivery_gate']) assert.equal(spec[key], 'Passed'); assert.equal(spec.passed_gates, 3); }],
  ['o resumo contabiliza a spec como concluída', ctx => assert.equal(ctx.payload.summary.completed_specs, 1)],
  ['a implementação da aba Specs do CLI', ctx => { ctx.tui = read('cli/src/tui.ts'); }],
  ['o contrato de visualização da spec é inspecionado', ctx => { ctx.markup = section(ctx.tui, 'private renderSpecs(', 'private openSpec('); }],
  ['a tabela preserva gates, tarefas, checklist e progresso', ctx => { includes(ctx.markup, ['blessed.list(']); includes(ctx.markup.toUpperCase(), ['SPEC', 'STATUS', 'GATES', 'TAREFAS', 'CHECKLIST', 'PROGRESSO']); }],
  ['a barra de espaço abre a spec destacada em um modal Markdown', ctx => includes(ctx.tui, ['list.key(["space"], open)', 'private openSpec(', 'renderMarkdown(spec.content)', 'this.openSpec(spec)'])],
  ['o modal informa como voltar para a listagem', ctx => includes(ctx.tui, ['Esc: voltar para a lista de specs'])],
  ['a implementação do runner de testes do CLI', ctx => { ctx.testing = read('cli/src/project-testing.ts'); ctx.app = read('cli/src/cli.ts'); ctx.tui = read('cli/src/tui.ts'); }],
  ['o contrato de execução de testes é inspecionado', ctx => { ctx.tests = section(ctx.tui, 'private renderTests(', 'private async runTests('); }],
  ['o CLI detecta Laravel com Pest sem executar comandos arbitrários', ctx => { includes(ctx.testing, ['["php", "artisan", "test"]', 'spawn(']); assert.ok(!ctx.testing.includes('shell:')); }],
  ['o comando specsfy test transmite a saída e preserva o exit code', ctx => includes(ctx.app, ['.command("test")', 'runProjectTests(options.project)', 'process.exitCode = result.exit_code'])],
  ['a TUI separa o resumo e os testes em subabas', ctx => includes(ctx.tests, ['label: " Resumo "', 'label: " Testes "', 'this.#testSummary'])],
  ['a saída detalhada permanece rolável e a execução é explícita', ctx => { assert.ok(!ctx.tests.includes('blessed.log(')); includes(ctx.tests, ['content: this.#testOutput.join("\\n")', 'scrollable: true', '" Executar testes ^X "']); includes(ctx.tui, ['runProjectTests(']); }],
  ['a implementação do auto updater do CLI', ctx => { ctx.updater = read('cli/src/updater.ts'); ctx.app = read('cli/src/cli.ts'); }],
  ['o contrato de atualização é inspecionado', ctx => assert.ok(ctx.updater)],
  ['dados e configurações globais usam ~/.specsfy/cli.json', ctx => includes(ctx.updater, ['".specsfy"', '"cli.json"'])],
  ['a versão mais recente deriva de tags semânticas do repositório', ctx => includes(ctx.updater, ['/repos/promovaweb/specsfy/tags', 'SEMANTIC_TAG'])],
  ['a atualização é delegada ao pacote npm oficial', ctx => includes(ctx.updater, ['NPM_PACKAGE_NAME = "@promovaweb/specsfy"', '"install", "--global"'])],
  ['aceitar a oferta atualiza e encerra enquanto recusar abre normalmente', ctx => includes(ctx.app, ['offerStartupUpdate(', 'if (shouldExit) return'])],
  ['a implementação da aba Skills do CLI', ctx => { ctx.tui = read('cli/src/tui.ts'); ctx.app = read('cli/src/cli.ts'); ctx.installer = read('cli/src/installer.ts'); }],
  ['o contrato de apresentação é inspecionado', ctx => { ctx.skills = section(ctx.tui, 'private renderSkills(', 'private renderAbout('); }],
  ['as skills aparecem em uma tabela com plano, nome, categoria e estado', ctx => includes(ctx.skills, ['blessed.list(', 'PLANO', 'SKILL', 'CATEGORIA', 'ESTADO'])],
  ['a skill destacada possui um painel de detalhes e uma ação explícita', ctx => includes(ctx.skills, ['label: " Detalhes "', 'toggleSelectedSkill'])],
  ['a decisão pode ser alternada por teclado ou mouse sem aplicação imediata', ctx => includes(ctx.tui, ['list.key(["space"], toggle)', 'screen.key(["C-e"]', 'toggleSelectedSkill', 'applySkills'])],
  ['a aba oferece uma ação para atualizar todas as skills instaladas', ctx => { includes(ctx.skills, ['Atualizar  ^R']); includes(ctx.tui, ['screen.key(["C-r"]', '.updateAll()']); }],
  ['o CLI oferece a atualização não interativa equivalente', ctx => { includes(ctx.app, ['.command("update")', 'installer.updateAll()']); includes(ctx.installer, ['async updateAll()']); }],
];
