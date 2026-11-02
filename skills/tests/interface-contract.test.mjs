/** Mantém os contratos de descoberta, planejamento e entrega de interfaces. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, read, temporary, put, node } from '../../tests/helpers.mjs';

const fixtures = JSON.parse(read('tests/fixtures/interface-contract.json'));
const skill = name => read(`skills/${name}/SKILL.md`);
const specialist = name => read(`specialists/specsfy-specialist-${name}/SKILL.md`);
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
    'specsfy-07-implement': ['menus e navegação principal', 'CRUD somente como API'],
  };
  for (const [name, terms] of Object.entries(contracts)) includes(skill(name), terms);
});
test('trabalho em tela exige o especialista de componentes antes de JSX', () => {
  const marker = '$specsfy-specialist-react-ui-components';
  for (const text of [skill('specsfy-05-tasks'), skill('specsfy-07-implement'), read('skills/templates/Tasks.md'), specialist('interface-experience')]) includes(text, [marker]);
  includes(skill('specsfy-07-implement'), ['antes de escrever JSX ou TSX', 'não implemente a tela']);
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
  includes(skill('specsfy-setup'), ['specsfy skills detect --project <raiz>', 'npx skills add https://github.com/promovaweb/specsfy', 'specsfy-specialist-data-modeling', 'specsfy-specialist-domain-modeling', 'specsfy-specialist-software-architecture', 'specsfy-specialist-react-ui-components', 'specsfy-specialist-reui', '## Stack e especialistas instalados pelo setup']);
});
test('setup descobre CRUDs, menus e recompõe documentação do sistema', () => {
  const text = skill('specsfy-setup');
  includes(text, ['## Cobertura funcional obrigatória no setup']);
  const normalized = text.split(/\s+/).join(' ');
  includes(normalized, ['criar, consultar, editar e apagar', 'menus do sistema', 'confirme com a pessoa', 'todo o sistema existente', '$specsfy-documentator']);
  includes(normalized.toLowerCase(), ['em toda execução completa do setup']);
});
test('contrato Laravel exige Octane com Open Swoole', () => {
  for (const text of [read('skills/Spec.md'), read('skills/templates/Spec.md'), skill('specsfy-setup'), specialist('laravel')]) includes(text, ['Laravel Octane', 'obrigatório', 'laravel/octane', 'Open Swoole']);
});
test('especialista ReUI documenta instalação pelo registry gratuito', () => {
  includes(specialist('reui'), ['componentes gratuitos', 'references/setup.md']);
  includes(read('specialists/specsfy-specialist-reui/references/setup.md'), ['npx shadcn@latest add', 'Laravel', '@reui', 'starter kit React oficial', 'Form Requests']);
});
test('ReUI define a composição de CRUDs compatíveis', () => {
  includes(specialist('reui'), ['Todo CRUD com interface React e Tailwind usa ReUI']);
  includes(read('specialists/specsfy-specialist-reui/references/catalog-free.md'), ['## Mapa obrigatório para CRUDs', 'Data Grid', 'Filters']);
  includes(read('specialists/specsfy-specialist-reui/references/components-free.md'), ['# Componentes gratuitos ReUI', 'Comércio', 'Planejamento']);
});
