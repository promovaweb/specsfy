/** Executa cada step dos cenários de catálogo e de operação do Vault. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, readSpecialist } from '../../tests/helpers.mjs';
import { featureTests, runContract } from '../../tests/bdd.mjs';

const base = join(ROOT, 'specialists');
const content = name => read(`specialists/${name}/SKILL.md`);
const includes = (text, terms) => terms.forEach(term => assert.ok(text.includes(term), term));
const headings = ['Quando usar', 'Fluxo', 'Padrões', 'Antipadrões', 'Validação', 'Skills relacionadas'];
const load = ctx => { ctx.catalog = JSON.parse(read('specialists/catalog.json')).skills; ctx.names = ctx.catalog.map(entry => entry.name); };
const names = suffixes => suffixes.map(suffix => 'specsfy-specialist-' + suffix);
const available = (ctx, suffixes) => names(suffixes).forEach(name => assert.ok(ctx.names.includes(name), name));
function mode(name, label, reference) {
  const specialist = `specsfy-specialist-${name}`;
  const path = `references/${reference}.md`;
  const rows = content(specialist).split('\n').filter(line => line.startsWith('|'));
  assert.ok(rows.some(row => row.includes(`| ${label} |`) && row.includes(`](${path})`)), `${specialist}: modo ${label} deve apontar para ${path}`);
  assert.ok(existsSync(join(base, specialist, path)), `${specialist}/${path}`);
}
const definitions = [
  ['o catálogo versionado de especialistas', load],
  ['uma skill especialista do catálogo', load],
  ['todas as skills usam o prefixo specsfy-specialist-', ctx => { assert.ok(ctx.names.length); assert.ok(ctx.names.every(name => name.startsWith('specsfy-specialist-'))); }],
  ['Laravel, Supabase, Postgres, Redis, Docker, servidores, React e Nextjs estão no catálogo, com suporte a Swarm, Ansible e Debian', ctx => {
    available(ctx, ['laravel', 'supabase', 'postgres', 'redis', 'docker', 'server', 'react', 'nextjs']);
    mode('docker', 'swarm', 'swarm');
    mode('server', 'ansible', 'ansible');
    mode('server', 'debian', 'debian');
  }],
  ['shadcn/ui, design system, UI, UX e acessibilidade têm modos próprios em componentes e interface', ctx => {
    available(ctx, ['ui-components', 'interface']);
    mode('ui-components', 'shadcn', 'shadcn-primitives');
    for (const label of ['system', 'ui', 'ux', 'accessibility']) mode('interface', label, label);
  }],
  ['seu nome, diretório e prompt padrão coincidem', ctx => { for (const name of ctx.names) { assert.equal(content(name).match(/^name:\s*(.+)$/m)?.[1].trim(), name); includes(read(`specialists/${name}/agents/openai.yaml`), ['$' + name]); } }],
  ['ela segue o template técnico completo', ctx => { for (const name of ctx.names) includes(content(name), [...headings.map(title => '## ' + title), '[references/standards.md](references/standards.md)']); }],
  ['ela publica referências técnicas com fontes primárias', ctx => { for (const name of ctx.names) includes(read(`specialists/${name}/references/standards.md`), ['https://']); }],
  ['o template de autoria de especialistas', ctx => { ctx.template = read('specialists/templates/SKILL.template.md'); ctx.guide = read('specialists/templates/GUIDE.md'); }],
  ['o template define todas as seções obrigatórias', ctx => includes(ctx.template, [...headings.map(title => '## ' + title), 'references/standards.md'])],
  ['o guia define a qualidade do corpo e das referências', ctx => includes(ctx.guide, ['## Padrão de qualidade por seção', '## Estrutura de `references/`'])],
  ['toda skill relacionada declara a fronteira recíproca', ctx => { for (const source of ctx.names) for (const target of new Set(content(source).split('## Skills relacionadas')[1]?.match(/specsfy-specialist-[a-z0-9-]+/g))) if (ctx.names.includes(target)) includes(content(target), [source]); }],
  ['todos os arquivos publicados no catálogo', ctx => { ctx.files = files(base); }],
  ['nenhuma referência ao repositório auditado permanece', ctx => { for (const path of ctx.files) { let text; try { text = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(path)).toLowerCase(); } catch { continue; } for (const term of ['matt' + 'pocock', 'matt' + ' pocock', 'matt' + '-pocock', 'ai' + 'hero']) assert.ok(!text.includes(term), path); } }],
  ['os especialistas de componentes e interface orientam uso conjunto', ctx => {
    available(ctx, ['ui-components', 'interface']);
    includes(readSpecialist('ui-components'), ['$specsfy-specialist-interface']);
    includes(readSpecialist('interface'), ['$specsfy-specialist-ui-components']);
    const component = ctx.catalog.find(entry => entry.name === 'specsfy-specialist-ui-components');
    assert.deepEqual([...component.requires].sort(), names(['react', 'tailwind-css', 'interface']).sort());
  }],
  ['as famílias de componentes React estão disponíveis como assets copiáveis', () => { const directory = join(base, 'specsfy-specialist-ui-components/assets/components'); const components = readdirSync(directory, { withFileTypes: true }).filter(item => item.isDirectory()).flatMap(group => readdirSync(join(directory, group.name)).filter(file => file.endsWith('.tsx')).map(file => [group.name, file])); assert.equal(components.length, 231); assert.equal(new Set(components.map(([group]) => group)).size, 11); }],
  ['o especialista Laravel oferece um modo para gerenciar pacotes', ctx => {
    available(ctx, ['laravel']);
    for (const path of ['SKILL.md', 'agents/openai.yaml', 'references/standards.md']) assert.ok(existsSync(join(base, 'specsfy-specialist-laravel', path)), path);
    mode('laravel', 'packages', 'packages');
  }],
  ['esse modo define instalação e documentação em docs/packages', () => includes(readSpecialist('laravel'), ['URL do GitHub', 'composer require', 'docs/packages/README.md', 'docs/packages/'])],
  ['specify e implement consultam os pacotes já instalados', () => { for (const path of ['specsfy-03-specify/SKILL.md', 'specsfy-06-implement/references/implement.md']) includes(read(`skills/${path}`), ['specsfy-specialist-laravel', '.specsfy/PACKAGES.md']); }],
  ['o especialista de entrega coordena deploy e SEMVER com Docker, Swarm, servidor e Ansible', ctx => {
    const delivery = ctx.catalog.find(entry => entry.name === 'specsfy-specialist-delivery');
    assert.deepEqual([...delivery.requires].sort(), names(['server', 'docker']).sort());
    mode('delivery', 'deploy', 'deploy');
    mode('delivery', 'versioning', 'versioning');
    mode('docker', 'swarm', 'swarm');
    mode('server', 'debian', 'debian');
    mode('server', 'ansible', 'ansible');
  }],
  ['o gerador publica Compose local, stack de produção e playbook completo', () => { assert.ok(existsSync(join(base, 'specsfy-specialist-delivery/scripts/scaffold.mjs'))); includes(readSpecialist('delivery'), ['compose.yaml', 'stack.yaml', 'Docker Swarm', 'usuário `deploy`']); }],
  ['o modo pipeline integra testes, publicação, promoção e rollback', () => {
    mode('delivery', 'pipeline', 'pipeline');
    runContract('specialists/tests/deploy-node.test.mjs', '^(scaffold inclui workflow|scaffold preserva workflow|pipeline separa publicação)');
  }],
  ['o deploy manual usa entrada oculta mesmo com uma fonte externa', () => runContract('specialists/tests/deploy-node.test.mjs', '^deploy manual usa prompt oculto')],
  ['o configurador grava fora do projeto e pede confirmação para substituir', () => runContract('specialists/tests/deploy-node.test.mjs', '^(configurador no terminal|configuração externa grava)')],
  ['o deploy aceita arquivo, script, configuração nativa e identidade', () => runContract('specialists/tests/deploy-node.test.mjs', '^modo automático respeita ambiente')],
  ['uma senha incorreta ou identidade com prompt interrompe o deploy', () => runContract('specialists/tests/deploy-node.test.mjs', '^senha incorreta e identidade prompt')],
];

/** Reúne somente arquivos reais dentro do catálogo, sem seguir links externos. */
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(item => item.name === '.git' ? [] : item.isDirectory() ? files(join(directory, item.name)) : item.isFile() ? [join(directory, item.name)] : []);
}
featureTests('specialists/tests/features/catalogo_especialistas.feature', definitions);
featureTests('specialists/tests/features/deploy_vault.feature', definitions);
