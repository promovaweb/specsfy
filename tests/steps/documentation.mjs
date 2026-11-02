/** Executa os steps de navegação documental, contexto e documentação do consumidor. */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync, lstatSync, realpathSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { ROOT, read } from '../helpers.mjs';

const includes = (source, terms) => terms.forEach(term => assert.ok(source.includes(term), term));
const text = path => readFileSync(path, 'utf8');
const docs = join(ROOT, 'docs'), develop = join(docs, 'develop'), context = join(develop, 'context');
const domains = ['architecture', 'engineering', 'data'];
const headings = ['Classificação', 'Papel', 'Como usar', 'Atualize quando', 'Não use para', 'Fonte da verdade e precedência'];
const modules = ['brand', 'cli', 'docs', 'example', 'skills', 'specialists', 'specsfy'];

/** Percorre arquivos reais, excluindo dependências e saídas geradas. */
function files(directory, suffix = '.md') {
  const skip = new Set(['.venv', 'dist', 'node_modules', 'vendor']);
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => skip.has(entry.name) ? [] : entry.isDirectory() ? files(join(directory, entry.name), suffix) : entry.isFile() && entry.name.endsWith(suffix) ? [join(directory, entry.name)] : []);
}
function links(path) {
  return [...text(path).matchAll(/\[[^\]]+\]\((?!https?:\/\/|mailto:)([^)]+)\)/g)].map(match => {
    const [target, anchor = ''] = match[1].trim().replace(/^<|>$/g, '').split('#');
    return { destination: target ? resolve(dirname(path), target) : path, anchor };
  });
}
function anchors(path) {
  return new Set([...text(path).matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].map(match => match[1].toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu, '').replace(/[\s-]+/g, '-').replace(/^-|-$/g, '')));
}
function validLinks(path) {
  for (const { destination, anchor } of links(path)) {
    assert.ok(existsSync(destination), `${path} -> ${destination}`);
    if (anchor) { assert.ok(statSync(destination).isFile()); assert.ok(anchors(destination).has(anchor), `${path} -> ${destination}#${anchor}`); }
  }
}
function size(path) {
  const source = text(path), lines = source.trimEnd().split(/\r?\n/).length;
  assert.ok(lines <= 400, `${path}: ${lines}`);
  if (lines > 250) includes(source, ['## Justificativa de tamanho']);
}

export const documentationSteps = [
  ['o repositório Specsfy e o contrato vigente da biblioteca de contexto', ctx => { ctx.root = ROOT; }],
  ['a biblioteca de contexto é inspecionada', ctx => { ctx.contextFiles = [...files(context), ...files(join(develop, 'decisions'))]; }],
  ['cada documento explica seu papel, classificação e regras de uso', ctx => { assert.ok(ctx.contextFiles.length); for (const path of ctx.contextFiles) includes(text(path), [...headings.map(heading => '## ' + heading), ...['Natureza', 'Escopo', 'Autoridade'].map(field => '| ' + field + ' |')]); }],
  ['os contextos respeitam a política de tamanho e os links locais', ctx => { for (const path of ctx.contextFiles) { size(path); validLinks(path); } }],
  ['as portas de entrada e os índices hierárquicos da biblioteca', ctx => { ctx.entrypoints = ['AGENTS.md', 'README.md', 'docs/develop/context/README.md', ...domains.map(domain => `docs/develop/context/${domain}/README.md`)]; }],
  ['uma pessoa ou agente procura orientação para uma mudança', ctx => { ctx.sources = Object.fromEntries(ctx.entrypoints.map(path => [path, read(path)])); }],
  ['encontra arquivos exatos de leitura e atualização por tipo de alteração', ctx => { includes(ctx.sources['AGENTS.md'], ['docs/develop/context/README.md']); includes(ctx.sources['README.md'], ['docs/README.md']); for (const domain of domains) { assert.ok(!ctx.sources['AGENTS.md'].includes('`docs/develop/context/' + domain + '/`')); includes(ctx.sources['docs/develop/context/README.md'], [domain + '/README.md']); includes(ctx.sources[`docs/develop/context/${domain}/README.md`], ['Leia quando', 'Atualize quando']); } }],
  ['encontra a precedência entre contexto, especificação e fonte executável', ctx => includes(ctx.sources['docs/develop/context/README.md'], ['specs/<estado>/<NNNN>-<slug>/spec.md', 'fontes executáveis', 'AGENTS.md'])],
  ['a árvore de documentação e seus índices', ctx => { ctx.portal = join(docs, 'README.md'); ctx.documents = files(docs); }],
  ['o contrato percorre links e decisões arquiteturais', ctx => { ctx.reached = new Set(); const queue = [ctx.portal]; while (queue.length) { const path = queue.shift(); if (ctx.reached.has(path) || !existsSync(path) || !statSync(path).isFile() || !path.endsWith('.md')) continue; ctx.reached.add(path); for (const { destination } of links(path)) if (destination.startsWith(docs + '/') && existsSync(destination) && statSync(destination).isFile()) queue.push(destination); } ctx.adrs = files(join(develop, 'decisions')).filter(path => path.split('/').at(-1).startsWith('ADR-')); }],
  ['todo documento é alcançável a partir do portal', ctx => assert.deepEqual(ctx.documents.filter(path => !ctx.reached.has(path)), [])],
  ['cada arquivo, âncora e ADR referenciado existe', ctx => { ctx.documents.forEach(validLinks); includes(read('docs/develop/decisions/README.md'), ctx.adrs.map(path => path.split('/').at(-1))); }],
  ['os contextos vigentes do Specsfy', ctx => { ctx.architecture = read('docs/develop/context/architecture/README.md'); ctx.data = read('docs/develop/context/data/README.md'); }],
  ['a estrutura progressiva é inspecionada', ctx => { ctx.preventive = ['architecture/integrations.md', 'data/migrations.md'].map(path => join(context, path)); }],
  ['assuntos sem conteúdo independente permanecem no índice do domínio', ctx => { ctx.preventive.forEach(path => assert.ok(!existsSync(path))); includes(ctx.architecture, ['Integrações']); includes(ctx.data, ['Migrations']); }],
  ['arquivos acima do limiar exigem justificativa em vez de divisão automática', () => files(docs).forEach(size)],
  ['o guia geral e o roteador operacional da documentação', ctx => { ctx.general = join(docs, 'README.md'); ctx.operational = join(context, 'README.md'); }],
  ['uma pessoa consulta como documentar uma mudança', ctx => { ctx.generalText = text(ctx.general); ctx.operationalText = text(ctx.operational); }],
  ['encontra organização, autoridades e destinos para cada informação', ctx => includes(ctx.generalText, ['](user/README.md)', '](develop/README.md)', '## Fonte da verdade'])],
  ['encontra critérios de criação e manutenção sem duplicar o roteador', ctx => { includes(ctx.generalText, ['docs/develop/context/']); const heading = '## Roteamento por tipo de alteração'; assert.ok(!ctx.generalText.includes(heading)); includes(ctx.operationalText, [heading]); }],
  ['o monorepo e seus módulos públicos', ctx => { ctx.modulePaths = ['README.md', ...['brand', 'skills', 'specialists', 'cli', 'docs', 'specsfy'].map(name => name + '/README.md')]; }],
  ['uma pessoa ou agente consulta suas portas de entrada', ctx => { ctx.moduleSources = Object.fromEntries(ctx.modulePaths.map(path => [path, read(path).toLowerCase()])); }],
  ['cada módulo declara público responsabilidade e ownership', ctx => { const terms = { 'README.md': ['monorepo', 'módulos'], 'brand/README.md': ['marca', 'fonte normativa'], 'skills/README.md': ['metodologia executável', 'skills'], 'specialists/README.md': ['catálogo oficial', 'opcionais'], 'cli/README.md': ['cli e tui', 'progresso'], 'docs/README.md': ['documentação', 'usuário', 'develop'], 'specsfy/README.md': ['porta de entrada', 'usuário final'] }; for (const [path, expected] of Object.entries(terms)) includes(ctx.moduleSources[path], expected); includes(read('AGENTS.md').toLowerCase(), ['fronteiras git', 'skills/agents.md']); }],
  ['a metodologia documentação identidade e visão geral possuem módulos próprios', () => { includes(read('docs/develop/context/architecture/modules.md'), ['promovaweb/specsfy', ...modules.map(name => name + '/')]); includes(read('docs/develop/context/architecture/dependencies.md'), ['https://github.com/promovaweb/specsfy']); assert.ok(!existsSync(join(ROOT, '.gitmodules'))); }],
  ['a raiz centraliza as regras de gitignore de todos os módulos', () => { includes(read('.gitignore'), ['/brand/guide/build/', '/cli/.venv/', '/cli/dist/', '/example/vendor/', '/example/node_modules/', '/example/storage/logs/*']); for (const name of modules) assert.deepEqual(files(join(ROOT, name), '.gitignore'), []); }],
  ['a raiz mantém só as skills locais operacionais e não instala as skills do projeto', () => {
    assert.ok(!existsSync(join(ROOT, 'specs'))); assert.deepEqual(readdirSync(join(ROOT, '.agents/skills')), ['specsfy-monorepo-documentator']);
    const source = join(ROOT, '.agents/skills/specsfy-monorepo-documentator'), link = join(ROOT, '.claude/skills/specsfy-monorepo-documentator');
    assert.ok(existsSync(join(source, 'SKILL.md'))); assert.ok(lstatSync(link).isSymbolicLink()); assert.equal(realpathSync(link), realpathSync(source));
    // Os testes podem executar validadores; instruções e workflows não instalam o método no checkout.
    for (const path of [join(ROOT, 'AGENTS.md'), join(ROOT, 'README.md'), ...files(join(ROOT, '.github/workflows'), '.yml'), ...files(join(ROOT, '.github/workflows'), '.yaml')]) assert.ok(!/skills\/specsfy-(?!monorepo-documentator)[^/\s]+\/scripts\//.test(text(path)), path);
  }],
  ['os repositórios integrados do framework Specsfy', ctx => { ctx.root = ROOT; }],
  ['o contrato do documentador é inspecionado', ctx => { ctx.documentator = read('skills/specsfy-documentator/SKILL.md'); ctx.installer = read('cli/src/installer.ts'); ctx.guide = read('docs/user/system-documentation.md'); }],
  ['a instalação inclui a skill de documentação', ctx => includes(ctx.installer, ['"specsfy-documentator"'])],
  ['a skill cobre arquitetura aplicação banco fluxos testes frontend pacotes integrações e decisões', ctx => includes(ctx.documentator, ['arquitetura', 'aplicação', 'banco', 'fluxos', 'testes', 'frontend', 'pacotes', 'integrações', 'decisões'])],
  ['a documentação oficial explica a projeção reconstruível no consumidor', ctx => includes(ctx.guide, ['<projeto>/docs/', 'reconstrói'])],
  ['o fluxo de implementação e monitoramento do Specsfy', ctx => { ctx.implementation = read('skills/specsfy-07-implement/SKILL.md'); ctx.monitor = read('skills/specsfy-setup/scripts/monitor_context.mjs'); ctx.builder = read('skills/specsfy-documentator/scripts/build_documentation.mjs'); }],
  ['aplicação ou persistência muda', ctx => assert.ok(ctx.implementation)],
  ['a implementação faz handoff obrigatório para o documentador', ctx => includes(ctx.implementation, ['$specsfy-documentator', 'Depois de cada tarefa `[CODE]`'])],
  ['o monitor bloqueia entrega sem mudança em docs', ctx => includes(ctx.monitor, ['documentation_review_required', 'specsfy-documentator'])],
  ['o builder oferece verificação de documentação atual', ctx => includes(ctx.builder, ['"--check"'])],
];
