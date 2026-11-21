/** Mantém os contratos de descoberta, planejamento e entrega de interfaces. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, read, readSpecialist, temporary, put, node } from '../../tests/helpers.mjs';

const fixtures = JSON.parse(read('tests/fixtures/interface-contract.json'));
const skill = name => read(`skills/${name}/SKILL.md`);
/** The setup keeps its full procedure in the reference of the `setup` mode. */
const setupText = () => skill("specsfy-setup") + read("skills/specsfy-setup/references/setup.md");
const includes = (text, terms) => terms.forEach(term => assert.ok(text.includes(term), term));
const interfaceSpec = content => '| Interface para pessoas | Sim |\n\n### 10. Interfaces e contratos\n\n#### Interface para pessoas\n\n- Há uma interface para pessoas.\n\n' + content;
const validate = (root, text) => {
  const result = node(join(ROOT, 'skills/specsfy-04-validate/scripts/validate_spec.mjs'), [put(root, 'spec.md', text), '--allow-draft', '--json']);
  assert.ok(result.stdout.trim(), result.stderr);
  return JSON.parse(result.stdout).errors;
};
const inspect = (script, root) => {
  const result = node(join(ROOT, `skills/specsfy-setup/scripts/${script}.mjs`), ['--project', root]);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
};

test('interface incompleta precisa declarar stack, fluxo e formulários', t => {
  const errors = validate(temporary(t), interfaceSpec('#### Telas e responsabilidades\n\n- Cadastro de clientes.\n'));
  for (const heading of ['Stack e convenções de interface', 'Fluxo de informação e navegação', 'Formulários e ações']) assert.ok(errors.includes(`Interface para pessoas: heading obrigatório ausente: ${heading}.`), errors.join('\n'));
});
test('spec Draft permite manter a existência de interface em aberto', t => {
  const root = temporary(t);
  for (const value of ['A definir', 'Pendente: o MVP não informa.']) assert.ok(!validate(root, `| Status | Draft |\n| Interface para pessoas | ${value} |\n`).includes('Interface para pessoas deve começar com Sim, Não ou Nao.'));
});
test('descrição completa satisfaz os contratos de interface', t => {
  const errors = validate(temporary(t), interfaceSpec(fixtures.complete));
  assert.deepEqual(errors.filter(error => error.startsWith('Interface para pessoas:')), []);
});
test('DataGrid exige revisão visual completa e contrato CRUD', t => {
  const errors = validate(temporary(t), interfaceSpec(fixtures.crud));
  for (const message of ['Revisão visual durante o desenvolvimento precisa conferir bordas, espaçamentos, margens, padding e tipografia.', 'Contrato CRUD precisa declarar PageHeader, DataGrid, ID, editar e apagar.']) assert.ok(errors.includes('Interface para pessoas: ' + message), errors.join('\n'));
});
test('interface exige o mapeamento de menus', t => {
  assert.ok(validate(temporary(t), interfaceSpec(fixtures.withoutMenu)).includes('Interface para pessoas: heading obrigatório ausente: Menus e navegação principal.'));
});
test('navegação direta pode justificar a ausência de menu principal', t => {
  assert.ok(!validate(temporary(t), interfaceSpec(fixtures.direct)).includes('Interface para pessoas: Menus e navegação principal precisa mapear menus, itens e destinos, ou declarar por que não há menu.'));
});
test('skills base exigem descoberta e entrega da interface', () => {
  const contracts = {
    'specsfy-02-backlog': ['telas, fluxo de informação', 'menus e navegação principal', 'stack e as telas existentes'],
    'specsfy-03-specify': ['Interface para pessoas: Sim', 'menus e navegação principal'],
    'specsfy-04-validate': ['menus e navegação principal'],
    'specsfy-05-tasks': ['telas, menus e navegação principal', 'menus e navegação principal'],
  };
  for (const [name, terms] of Object.entries(contracts)) includes(skill(name), terms);
  includes(read('skills/specsfy-06-implement/references/implement.md'), ['menus e navegação principal', 'CRUD somente como API']);
});
test('trabalho em tela exige o especialista de componentes antes de JSX', () => {
  const marker = '$specsfy-specialist-ui-components';
  for (const text of [skill('specsfy-05-tasks'), read('skills/specsfy-06-implement/references/implement.md'), read('skills/templates/Tasks.md'), read('specialists/specsfy-specialist-interface/SKILL.md')]) includes(text, [marker]);
  includes(read('skills/specsfy-06-implement/references/implement.md'), ['antes de escrever JSX ou TSX', 'não implemente a tela']);
});
test('spec com telas exige fase de interface no plano de tarefas', t => {
  const root = temporary(t), script = join(ROOT, 'skills/specsfy-05-tasks/scripts/validate_interface_tasks.mjs');
  const spec = put(root, 'spec.md', fixtures.phase);
  const complete = node(script, [spec]);
  assert.equal(complete.status, 0, complete.stderr);
  put(root, 'spec.md', fixtures.phase.replace('#### Fase de interface\n\n- [ ] T001 [CODE] Criar a lista em src/clients/List.tsx e atualizar INTERFACE.md — Refs: FR-001 — Depends: none\n\n', ''));
  const incomplete = node(script, [spec]);
  assert.equal(incomplete.status, 1, incomplete.stdout + incomplete.stderr);
  includes(incomplete.stderr, ['Fase de interface']);
});
test('inspeção identifica stack, rotas e componentes já existentes', t => {
  const root = temporary(t);
  put(root, 'package.json', JSON.stringify({ dependencies: { next: '1', react: '1', tailwindcss: '1', 'react-hook-form': '1' } }));
  put(root, 'components.json', '{}');
  put(root, 'src/app/clientes/page.tsx', 'export default function Page() {}');
  put(root, 'src/components/ClientForm.tsx', 'export function ClientForm() {}');
  const report = inspect('inspect_interface', root);
  for (const [field, item] of [['frameworks', 'next'], ['styling', 'tailwindcss'], ['components', 'shadcn/ui'], ['current_routes', 'src/app/clientes/page.tsx'], ['current_components', 'src/components/ClientForm.tsx']]) assert.ok(report[field].includes(item), field + ': ' + item);
});
test('setup mapeia instruções, aplicação, persistência, testes e documentação', t => {
  const root = temporary(t);
  const sources = { instructions: 'AGENTS.md', application: 'src/app/page.tsx', persistence: 'database/migrations/001.sql', tests: 'tests/clientes.test.ts', documentation: 'docs/arquitetura.md' };
  const contents = ['# Instruções\n', 'export default function Page() {}', 'create table clientes ();', "test('clientes', () => {});", '# Arquitetura\n'];
  Object.values(sources).forEach((path, index) => put(root, path, contents[index]));
  put(root, 'package.json', '{"dependencies":{"react":"1"}}');
  const report = inspect('inspect_project', root);
  for (const [group, path] of Object.entries(sources)) assert.ok(report.source_groups[group].includes(path), group + ': ' + path);
});
test('setup instala especialistas detectados a partir da stack', () => {
  includes(setupText(), ['specsfy skills detect --project <raiz>', 'npx skills add https://github.com/promovaweb/specsfy', 'specsfy-specialist-modeling', 'specsfy-specialist-architecture', 'specsfy-specialist-ui-components', '## Stack e especialistas instalados pelo setup']);
});
test('setup descobre CRUDs, menus e recompõe documentação do sistema', () => {
  const text = setupText();
  includes(text, ['## Cobertura funcional obrigatória no setup']);
  const normalized = text.split(/\s+/).join(' ');
  includes(normalized, ['criar, consultar, editar e apagar', 'menus do sistema', 'confirme com a pessoa', 'todo o sistema existente', '$specsfy-documentator']);
  includes(normalized.toLowerCase(), ['em toda execução completa do setup']);
});
test('contrato Laravel exige Octane com Open Swoole', () => {
  for (const text of [read('skills/Spec.md'), read('skills/templates/Spec.md'), setupText(), readSpecialist('laravel')]) includes(text, ['Laravel Octane', 'obrigatório', 'laravel/octane', 'Open Swoole']);
});
test('setup registra runtime e UI ausentes como pendência de stack anterior ao deploy', () => {
  const setup = setupText().split(/\s+/).join(' ');
  includes(setup, ['Pendências de stack', 'O setup pode ser aprovado',
    'laravel/octane', 'openswoole', '--server=swoole', 'shadcn/ui e ReUI',
    'tarefa de instalação', 'pré-condição do deploy']);
  for (const text of [
    read('skills/Spec.md'), read('skills/templates/Spec.md'),
    read('specialists/specsfy-specialist-laravel/SKILL.md'),
  ]) includes(text.split(/\s+/).join(' '), ['pendência de stack', 'pré-condição do deploy']);
  assert.ok(!setup.includes('antes de aprovar o setup'));
});
test('especialista de componentes documenta instalação ReUI pelo registry gratuito', () => {
  includes(readSpecialist('ui-components'), ['Componentes gratuitos ReUI', 'references/reui-setup.md']);
  includes(read('specialists/specsfy-specialist-ui-components/references/reui-setup.md'), ['npx shadcn@latest add', 'Laravel', '@reui', 'starter kit React oficial', 'Form Requests']);
});
test('ReUI define a composição de CRUDs compatíveis', () => {
  includes(read('specialists/specsfy-specialist-ui-components/references/reui-catalog-free.md'), ['## Mapa obrigatório para CRUDs', 'Data Grid', 'Filters']);
  includes(read('specialists/specsfy-specialist-ui-components/references/reui-components-free.md'), ['# Componentes gratuitos ReUI', 'Comércio', 'Planejamento']);
  includes(readSpecialist('ui-components').split(/\s+/).join(' '), ['Todo CRUD com interface React e Tailwind usa ReUI']);
});

const crudSpec = (operations, controls, taskDescriptions = []) => '| Status | Defined |\n| Plan Gate | Pending |\n' + interfaceSpec(
  fixtures.complete + '\n#### Contrato CRUD\n\n' +
  (operations === null ? '' : `- **Operações**: ${operations}\n`) +
  controls + '\n\n### 14. Tarefas\n\n#### Fase de interface\n\n' +
  taskDescriptions.map((description, index) =>
    `- [ ] T00${index + 1} [CODE] ${description} em src/Products.tsx — Refs: FR-001 — Depends: none\n`).join(''),
);
const crudErrors = (root, operations, controls, tasks) =>
  validate(root, crudSpec(operations, controls, tasks)).filter(error => error.includes('Contrato CRUD'));

test('Contrato CRUD aceita listar e criar, leitura e CRUD completo conforme as operações incluídas', t => {
  const root = temporary(t);
  const list = '- **listar**: DataGrid com coluna ID visível — Tarefa: T001';
  const create = '- **criar**: Para criar, abra o formulário — Tarefa: T002';
  const detail = '- **consultar**: Link para a tela de detalhe — Tarefa: T001';
  const edit = '- **editar**: Ação de edição — Tarefa: T002';
  const remove = '- **apagar**: Botão de exclusão com confirmação — Tarefa: T002';
  const grid = 'Implementar DataGrid e link para o detalhe';
  const form = 'Implementar formulário de criação, ação de edição e botão de exclusão';
  for (const [operations, controls, tasks] of [
    ['listar, criar', [list, create], [grid, form]],
    ['listar, consultar', [list, detail], [grid]],
    ['consultar', [detail], ['Implementar link para o detalhe']],
    ['listar, consultar, criar, editar, apagar', [list, detail, create, edit, remove], [grid, form]],
    [null, ['DataGrid com ID e botões de editar e apagar.'], []],
  ]) {
    assert.deepEqual(crudErrors(root, operations, ['PageHeader.', ...controls].join('\n'), tasks), [], operations);
  }
});

test('Contrato CRUD exige controles e tarefas das operações declaradas, com fallback legado', t => {
  const root = temporary(t);
  const list = 'PageHeader.\n- **listar**: DataGrid com coluna ID visível — Tarefa: T001';
  const errors = crudErrors(root, 'listar, criar', list, ['Implementar DataGrid com ID']);
  assert.ok(errors.some(error => error.includes('criar') && error.includes('formulário') && error.includes('tarefa')), errors.join('\n'));
  assert.ok(errors.every(error => !/apagar|editar/.test(error)));
  assert.notDeepEqual(crudErrors(root, null, list), []);
  assert.notDeepEqual(crudErrors(root, 'listar, inventar', list), []);
  assert.notDeepEqual(crudErrors(root, '', list), []);
  const controls = list + '\n- **criar**: Formulário de criação — Tarefa: T002';
  assert.deepEqual(crudErrors(root, 'listar, criar', controls), []);
  const planned = crudSpec('listar, criar', controls).replace('Defined', 'Planned').replace('Pending', 'Passed');
  assert.ok(validate(root, planned).some(error => error.includes('Contrato CRUD') && error.includes('T002')));
});

test('Contrato CRUD vincula cada controle afirmativo à tarefa de interface da seção 14', t => {
  const root = temporary(t);
  const positive = 'PageHeader.\n- **criar**: Para criar produtos, use o formulário — Tarefa: T001';
  const negative = 'PageHeader.\n- **criar**: Não haverá botão para criar nem formulário de criação — Tarefa: T001';
  const ui = ['Implementar o formulário para criar produtos'];
  assert.deepEqual(crudErrors(root, 'criar', positive, ui), []);
  assert.notDeepEqual(crudErrors(root, 'criar', negative, ui), []);
  for (const endpoint of ['Implementar endpoint para criar produtos', 'Implementar endpoint de criação de produtos']) {
    assert.notDeepEqual(crudErrors(root, 'criar', positive, [endpoint]), []);
  }
  const edit = 'PageHeader.\n- **editar**: Formulário para editar produtos — Tarefa: T001';
  assert.notDeepEqual(crudErrors(root, 'editar', edit, ui), []);
  assert.notDeepEqual(crudErrors(root, 'criar', positive.replace('T001', 'T999'), ui), []);
  assert.notDeepEqual(crudErrors(root, 'criar', positive + '\n' + positive.split('\n')[1], ui), []);
  assert.notDeepEqual(crudErrors(root, 'criar', positive + '\n- **editar**: Botão para editar — Tarefa: T001', ui), []);

  const malformed = crudSpec('criar', positive, ui).replace('— Refs: FR-001', '— Ref: FR-001');
  assert.ok(validate(root, malformed).some(error => error.includes('Contrato CRUD') && error.includes('T001')));
  const unnumbered = crudSpec('criar', positive, ui).replace('### 14. Tarefas', '### Tarefas');
  assert.deepEqual(validate(root, unnumbered).filter(error => error.includes('Contrato CRUD')), []);
});
