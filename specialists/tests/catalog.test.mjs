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
test('especialistas do segundo ensaio escolhem a fonte antes de pedir a spec', () => {
  for (const name of expected.filter(name => !name.endsWith('-cloudflare') && !name.endsWith('-n8n'))) {
    const guidance = content(name).split('## No Specsfy\n\n')[1]?.split('\n## ')[0] ?? '';
    assert.match(guidance, /^1\. \*\*Fonte de entrada por fase\*\*/, name);
    assert.match(guidance, /specsfy-02-backlog.*\n.*decisões e sinais/, name);
    assert.match(guidance, /specsfy-03-specify.*specsfy-04-validate.*\n.*spec aberta/, name);
    assert.match(guidance, /specsfy-05-tasks.*sincronizar.*\n.*seção 14/, name);
    assert.match(guidance, /specsfy-06-implement.*tarefa.*passo carregado/, name);
  }
});
test('o link de detalhe depende de consultar no Contrato CRUD', () => {
  for (const source of [
    content('specsfy-specialist-interface'),
    read('specialists/specsfy-specialist-ui-components/references/reui-catalog-free.md'),
  ]) {
    assert.match(source, /`consultar`.*Contrato CRUD[^.]*linha[^.]*detalhe/s);
  }
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
  const stackNames = [
    'cloudflare', 'docker', 'laravel', 'mcp', 'mongodb', 'mysql', 'n8n', 'nextjs',
    'postgres', 'react', 'redis', 'supabase', 'tailwind-css', 'testing', 'typescript',
    'ui-components',
  ].map(name => `specsfy-specialist-${name}`);
  assert.deepEqual(catalog.filter(item => item.stack).map(item => item.name).sort(), stackNames);
  for (const item of catalog) {
    for (const field of ['description', 'category', 'tags']) assert.ok(item[field]?.length, `${item.name}: ${field}`);
    for (const markers of [item.detect.files, item.detect.dependencies, item.detect.images ?? []]) {
      assert.ok(Array.isArray(markers) && markers.every(marker => typeof marker === 'string' && marker.trim()), item.name);
    }
    assert.ok(item.stack === undefined || typeof item.stack === 'boolean', item.name);
    if (item.stack) assert.ok(item.aliases?.length, item.name);
    assert.ok(Array.isArray(item.aliases ?? []) && (item.aliases ?? []).every(alias => typeof alias === 'string' && alias.trim()), item.name);
    assert.ok(Array.isArray(item.requires ?? []));
    for (const name of item.requires ?? []) assert.ok(expected.includes(name), name);
  }
  assert.ok(entry('specsfy-specialist-n8n').detect.images.includes('n8nio/n8n'));
});
/** Text of a specialist folder (SKILL.md, references and scripts; assets are code samples). */
const folder = name => files(join(base, name)).filter(path => !path.includes('/assets/') && /\.(md|mjs|yaml)$/.test(path)).map(path => readFileSync(path, 'utf8')).join('\n');
test('especialistas de plataforma cobrem a cadeia de deploy versionado', () => {
  // docker absorveu docker-swarm; server absorveu ansible, debian-server e server-report.
  const contracts = {
    docker: ['independentes por família', 'modos de processo', 'SemVer', 'ordem de dependência', 'migrations', 'convergência'],
    server: ['preflight', 'check mode', 'Docker Secrets', 'sysctl.d', 'systemd', 'Docker'],
  };
  for (const [suffix, terms] of Object.entries(contracts)) includes(folder(`specsfy-specialist-${suffix}`), terms);
});
test('especialistas de plataforma delegam a orquestração completa ao delivery', () => {
  for (const suffix of ['docker', 'server']) includes(content(`specsfy-specialist-${suffix}`), ['$specsfy-specialist-delivery']);
  assert.deepEqual(entry('specsfy-specialist-docker').requires ?? [], []);
});
test('delivery instala a cadeia de servidor completa', () => {
  const name = 'specsfy-specialist-delivery';
  assert.deepEqual([...entry(name).requires].sort(), ['specsfy-specialist-docker', 'specsfy-specialist-server']);
  includes(folder(name), ['SEMVER', 'Docker Engine', 'docker swarm init', 'Ansible']);
  for (const path of ['scripts/semver.mjs', 'scripts/scaffold.mjs', 'assets/vault.mjs', 'assets/check-hosts.mjs']) assert.ok(existsSync(join(base, name, path)), path);
});
test('componentes de UI possuem apoio de interface e galeria completa', () => {
  const name = 'specsfy-specialist-ui-components';
  includes(content(name), ['$specsfy-specialist-interface']);
  includes(content('specsfy-specialist-interface'), [`$${name}`]);
  assert.ok(entry(name).requires.includes('specsfy-specialist-interface'));
  const directory = join(base, name, 'assets/components');
  const groups = readdirSync(directory, { withFileTypes: true }).filter(item => item.isDirectory()).map(item => item.name);
  const populated = groups.filter(group => readdirSync(join(directory, group)).some(file => file.endsWith('.tsx')));
  assert.equal(groups.flatMap(group => readdirSync(join(directory, group)).filter(file => file.endsWith('.tsx'))).length, 231);
  assert.deepEqual(populated.sort(), ['actions-feedback', 'data-display', 'forms', 'hero', 'layout-navigation', 'marketing-company', 'marketing-content', 'marketing-conversion', 'marketing-features', 'marketing-proof', 'typography'].sort());
});
test('React e shadcn identificam a base de primitives do projeto', () => {
  includes(content('specsfy-specialist-react'), ['$specsfy-specialist-ui-components']);
  includes(content('specsfy-specialist-react').toLowerCase(), ['base de primitives']);
  includes(content('specsfy-specialist-ui-components'), ['Base UI', 'Radix', '(references/shadcn-primitives.md)']);
  includes(read('specialists/specsfy-specialist-ui-components/references/shadcn-primitives.md'), ['@base-ui/react', 'radix-ui', '@radix-ui/react-', 'react-aria-components', 'não comprova que o componente usa Base UI']);
});
test('laravel publica o contrato de contexto dos pacotes', () => {
  const name = 'specsfy-specialist-laravel';
  assert.deepEqual(entry(name).detect.files, ['artisan']);
  assert.ok(entry(name).detect.dependencies.includes('laravel/framework'));
  includes(folder(name), ['URL do GitHub', 'composer.json', 'composer.lock', 'composer require', 'docs/packages/README.md', 'docs/packages/', '.specsfy/PACKAGES.md', 'pacotes já instalados']);
  for (const path of ['specsfy-03-specify/SKILL.md', 'specsfy-06-implement/references/implement.md']) includes(read(`skills/${path}`), [name]);
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
