/** Executa cada step dos cenários de catálogo e de operação do Vault. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read } from '../../tests/helpers.mjs';
import { featureTests, runContract } from '../../tests/bdd.mjs';

const base = join(ROOT, 'specialists');
const content = name => read(`specialists/${name}/SKILL.md`);
const includes = (text, terms) => terms.forEach(term => assert.ok(text.includes(term), term));
const headings = ['Quando usar', 'Fluxo', 'Padrões', 'Antipadrões', 'Validação', 'Skills relacionadas'];
const load = ctx => { ctx.catalog = JSON.parse(read('specialists/catalog.json')).skills; ctx.names = ctx.catalog.map(entry => entry.name); };
const names = suffixes => suffixes.map(suffix => 'specsfy-specialist-' + suffix);
const definitions = [
  ['o catálogo versionado de especialistas', load],
  ['uma skill especialista do catálogo', load],
  ['todas as skills usam o prefixo specsfy-specialist-', ctx => { assert.ok(ctx.names.length); assert.ok(ctx.names.every(name => name.startsWith('specsfy-specialist-'))); }],
  ['Laravel, Supabase, Postgres, Redis, Docker Swarm, Ansible, Debian Server, React, Astro e Nextjs estão disponíveis', ctx => names(['laravel', 'supabase', 'postgres', 'redis', 'docker-swarm', 'ansible', 'debian-server', 'react', 'astro', 'nextjs']).forEach(name => assert.ok(ctx.names.includes(name), name))],
  ['Shadcn, UI, UX e acessibilidade estão disponíveis separadamente', ctx => names(['design-system', 'shadcn-ui', 'ui-design', 'ux-design', 'web-accessibility']).forEach(name => assert.ok(ctx.names.includes(name), name))],
  ['seu nome, diretório e prompt padrão coincidem', ctx => { for (const name of ctx.names) { assert.equal(content(name).match(/^name:\s*(.+)$/m)?.[1].trim(), name); includes(read(`specialists/${name}/agents/openai.yaml`), ['$' + name]); } }],
  ['ela segue o template técnico completo', ctx => { for (const name of ctx.names) includes(content(name), [...headings.map(title => '## ' + title), '[references/standards.md](references/standards.md)']); }],
  ['ela publica referências técnicas com fontes primárias', ctx => { for (const name of ctx.names) includes(read(`specialists/${name}/references/standards.md`), ['https://']); }],
  ['o template de autoria de especialistas', ctx => { ctx.template = read('specialists/templates/SKILL.template.md'); ctx.guide = read('specialists/templates/GUIDE.md'); }],
  ['o template define todas as seções obrigatórias', ctx => includes(ctx.template, [...headings.map(title => '## ' + title), 'references/standards.md'])],
  ['o guia define a qualidade do corpo e das referências', ctx => includes(ctx.guide, ['## Padrão de qualidade por seção', '## Estrutura de `references/`'])],
  ['toda skill relacionada declara a fronteira recíproca', ctx => { for (const source of ctx.names) for (const target of new Set(content(source).split('## Skills relacionadas')[1]?.match(/specsfy-specialist-[a-z0-9-]+/g))) if (ctx.names.includes(target)) includes(content(target), [source]); }],
  ['todos os arquivos publicados no catálogo', ctx => { ctx.files = files(base); }],
  ['nenhuma referência ao repositório auditado permanece', ctx => { for (const path of ctx.files) { let text; try { text = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(path)).toLowerCase(); } catch { continue; } for (const term of ['matt' + 'pocock', 'matt' + ' pocock', 'matt' + '-pocock', 'ai' + 'hero']) assert.ok(!text.includes(term), path); } }],
  ['a skill de componentes React e a skill de UI orientam uso conjunto', ctx => { const [component, design, ui] = names(['react-ui-components', 'design-system', 'ui-design']); for (const name of [component, design, ui]) assert.ok(ctx.names.includes(name)); includes(content(component), ['$' + ui, '$' + design]); includes(content(ui), ['$' + component]); assert.deepEqual(ctx.catalog.find(entry => entry.name === component).requires, [design, ui]); }],
  ['as famílias de componentes React estão disponíveis como assets copiáveis', () => { const directory = join(base, 'specsfy-specialist-react-ui-components/assets/components'); const components = readdirSync(directory, { withFileTypes: true }).filter(item => item.isDirectory()).flatMap(group => readdirSync(join(directory, group.name)).filter(file => file.endsWith('.tsx')).map(file => [group.name, file])); assert.equal(components.length, 231); assert.equal(new Set(components.map(([group]) => group)).size, 11); }],
  ['o gestor de pacotes Laravel está disponível', ctx => { const name = 'specsfy-specialist-laravel-package-manager'; assert.ok(ctx.names.includes(name)); for (const path of ['SKILL.md', 'agents/openai.yaml', 'references/standards.md']) assert.ok(existsSync(join(base, name, path))); }],
  ['ele define instalação e documentação em docs/packages', () => includes(content('specsfy-specialist-laravel-package-manager'), ['URL do GitHub', 'composer require', 'docs/packages/README.md', 'docs/packages/'])],
  ['specify e implement consultam os pacotes já instalados', () => { for (const name of ['specsfy-03-specify', 'specsfy-07-implement']) includes(read(`skills/${name}/SKILL.md`), ['specsfy-specialist-laravel-package-manager', '.specsfy/PACKAGES.md']); }],
  ['a skill de deploy coordena SEMVER, Docker, servidor, Ansible e Swarm', ctx => assert.deepEqual([...ctx.catalog.find(entry => entry.name === 'specsfy-specialist-deploy').requires].sort(), names(['versioning', 'debian-server', 'docker', 'docker-swarm', 'ansible']).sort())],
  ['o gerador publica Compose local, stack de produção e playbook completo', () => { assert.ok(existsSync(join(base, 'specsfy-specialist-deploy/scripts/scaffold.mjs'))); includes(content('specsfy-specialist-deploy'), ['compose.yaml', 'stack.yaml', 'Docker Swarm', 'usuário `deploy`']); }],
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
