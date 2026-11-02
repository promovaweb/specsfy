/** Confere o catálogo completo, as dependências e os limites entre especialistas. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read } from '../../tests/helpers.mjs';

const base = join(ROOT, 'specialists');
const expected = JSON.parse(read('tests/fixtures/specialist-catalog.json')).sort();
const catalog = JSON.parse(read('specialists/catalog.json')).skills;
const content = name => read(`specialists/${name}/SKILL.md`);
const headings = ['Quando usar', 'Fluxo', 'Padrões', 'Antipadrões', 'Validação', 'Skills relacionadas'];
const includes = (text, terms) => terms.forEach(term => assert.ok(text.includes(term), term));
const entry = name => catalog.find(item => item.name === name);

test('catálogo e diretórios contêm o conjunto completo de especialistas', () => {
  assert.deepEqual(catalog.map(item => item.name).sort(), expected);
  assert.deepEqual(readdirSync(base).filter(name => name.startsWith('specsfy-') && existsSync(join(base, name, 'SKILL.md'))).sort(), expected);
});
test('nomes exibidos seguem o padrão dos especialistas', () => {
  for (const name of expected) includes(read(`specialists/${name}/agents/openai.yaml`), ['display_name: "Specsfy - Especialista - ']);
});
test('cada especialista mantém nome, seções e referência oficial', () => {
  for (const name of expected) {
    const text = content(name);
    assert.equal(text.match(/^name:\s*(.+)$/m)?.[1].trim(), name);
    includes(read(`specialists/${name}/agents/openai.yaml`), [`$${name}`]);
    includes(text, [...headings.map(heading => `## ${heading}`), '[references/standards.md](references/standards.md)']);
    assert.match(read(`specialists/${name}/references/standards.md`), /https:\/\//);
  }
});
test('templates publicam o padrão de autoria e de referências', () => {
  includes(read('specialists/templates/SKILL.template.md'), [...headings.map(heading => `## ${heading}`), 'references/standards.md']);
  includes(read('specialists/templates/GUIDE.md'), ['## Estrutura de `references/`', '## Padrão de qualidade por seção']);
});
test('referências entre especialistas possuem correspondência recíproca', () => {
  for (const source of expected) {
    const related = content(source).split('## Skills relacionadas').slice(1).join('## Skills relacionadas');
    for (const target of new Set(related.match(/specsfy-specialist-[a-z0-9-]+/g))) {
      if (expected.includes(target)) includes(content(target), [source]);
    }
  }
});
test('metadados permitem descobrir e instalar as dependências', () => {
  for (const item of catalog) {
    for (const field of ['description', 'category', 'tags']) assert.ok(item[field]?.length, `${item.name}: ${field}`);
    for (const field of ['files', 'dependencies']) assert.ok(Array.isArray(item.detect[field]));
    assert.ok(Array.isArray(item.requires ?? []));
    for (const name of item.requires ?? []) assert.ok(expected.includes(name), name);
  }
});
test('especialistas de plataforma cobrem a cadeia de deploy versionado', () => {
  const contracts = {
    docker: ['independentes por família', 'modos de processo', 'SemVer'],
    'docker-swarm': ['ordem de dependência', 'migrations', 'convergência'],
    ansible: ['preflight', 'check mode', 'Docker Secrets'],
    'debian-server': ['sysctl.d', 'systemd', 'Docker'],
  };
  for (const [suffix, terms] of Object.entries(contracts)) {
    const name = `specsfy-specialist-${suffix}`;
    includes(content(name) + '\n' + read(`specialists/${name}/references/standards.md`), terms);
  }
});
test('especialistas delegam a orquestração completa ao deploy', () => {
  for (const suffix of ['ansible', 'delivery-engineering', 'docker', 'docker-swarm']) {
    const name = `specsfy-specialist-${suffix}`;
    assert.deepEqual(entry(name).requires ?? [], []);
    includes(content(name), ['$specsfy-specialist-deploy']);
  }
});
test('orquestrador de deploy instala a cadeia de servidor completa', () => {
  const name = 'specsfy-specialist-deploy';
  assert.deepEqual([...entry(name).requires].sort(), ['ansible', 'debian-server', 'docker', 'docker-swarm', 'versioning'].map(suffix => `specsfy-specialist-${suffix}`).sort());
  includes(content(name), ['SEMVER', 'Docker Engine', 'docker swarm init', 'Ansible']);
});
test('componentes React possuem apoio de UI e galeria completa', () => {
  const name = 'specsfy-specialist-react-ui-components';
  includes(content(name), ['$specsfy-specialist-ui-design']);
  includes(content('specsfy-specialist-ui-design'), [`$${name}`]);
  assert.deepEqual(entry(name).requires, ['specsfy-specialist-design-system', 'specsfy-specialist-ui-design']);
  const directory = join(base, name, 'assets/components');
  const groups = readdirSync(directory, { withFileTypes: true }).filter(item => item.isDirectory()).map(item => item.name);
  const populated = groups.filter(group => readdirSync(join(directory, group)).some(file => file.endsWith('.tsx')));
  assert.equal(groups.flatMap(group => readdirSync(join(directory, group)).filter(file => file.endsWith('.tsx'))).length, 231);
  assert.deepEqual(populated.sort(), ['actions-feedback', 'data-display', 'forms', 'hero', 'layout-navigation', 'marketing-company', 'marketing-content', 'marketing-conversion', 'marketing-features', 'marketing-proof', 'typography'].sort());
});
test('React e shadcn identificam a base de primitives do projeto', () => {
  includes(content('specsfy-specialist-react'), ['$specsfy-specialist-shadcn-ui']);
  includes(content('specsfy-specialist-react').toLowerCase(), ['base de primitives']);
  includes(content('specsfy-specialist-shadcn-ui'), ['Base UI', 'Radix', '[references/primitives.md](references/primitives.md)']);
  includes(read('specialists/specsfy-specialist-shadcn-ui/references/primitives.md'), ['@base-ui/react', 'radix-ui', '@radix-ui/react-', 'react-aria-components', 'não comprova que o componente usa Base UI']);
});
test('gerenciador de pacotes Laravel publica o contrato de contexto', () => {
  const name = 'specsfy-specialist-laravel-package-manager';
  assert.deepEqual(entry(name).requires, ['specsfy-specialist-laravel']);
  assert.ok(entry(name).detect.files.includes('artisan'));
  assert.ok(entry(name).detect.dependencies.includes('laravel/framework'));
  includes(content(name), ['URL do GitHub', 'composer.json', 'composer.lock', 'composer require', 'docs/packages/README.md', 'docs/packages/', '.specsfy/PACKAGES.md', 'pacotes já instalados']);
  for (const skill of ['specsfy-03-specify', 'specsfy-07-implement']) includes(read(`skills/${skill}/SKILL.md`), [name]);
});

/** Percorre arquivos reais sem seguir links para bibliotecas externas. */
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(item => {
    if (item.name === '.git') return [];
    const path = join(directory, item.name);
    return item.isDirectory() ? files(path) : item.isFile() ? [path] : [];
  });
}
test('especialistas não contêm referências à origem auditada', () => {
  const forbidden = ['matt' + 'pocock', 'matt' + ' pocock', 'matt' + '-pocock', 'ai' + 'hero'];
  for (const path of files(base)) {
    const buffer = readFileSync(path);
    // A conversão fatal preserva a exclusão dos arquivos binários do contrato original.
    let text;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(buffer).toLowerCase(); } catch { continue; }
    for (const term of forbidden) assert.ok(!text.includes(term), path);
  }
});
