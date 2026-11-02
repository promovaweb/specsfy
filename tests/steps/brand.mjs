/** Confere os assets e a adoção da identidade existente sem gerar ou editar imagens. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, dirname } from 'node:path';
import { ROOT, read } from '../helpers.mjs';
const includes = (source, terms) => terms.forEach(term => assert.ok(source.includes(term), term));
export const brandSteps = [
  ['os novos arquivos SVG e PNG do logo', ctx => { ctx.svgPath = join(ROOT, 'brand/logo/icon.svg'); ctx.pngPath = join(ROOT, 'brand/logo/icon.png'); }],
  ['a construção vetorial é inspecionada', ctx => { ctx.svg = readFileSync(ctx.svgPath, 'utf8'); ctx.png = readFileSync(ctx.pngPath); ctx.xpath = expression => execFileSync('xmllint', ['--nonet', '--xpath', expression, '-'], { input: ctx.svg, encoding: 'utf8' }).trim(); }],
  ['o logo preserva as três camadas e o símbolo de código', ctx => { assert.equal(ctx.xpath('string(/*/@viewBox)'), '0 0 512 512'); const attributes = ctx.xpath('/*/*/@fill | /*/*/@stroke').toUpperCase(); includes(attributes, ['#A866FF', '#2AD5BE', '#C4B5FD', '#ECFDFB']); assert.equal(ctx.xpath('count(/*/*[local-name()="path"])'), '5'); }],
  ['o PNG preserva a prancheta quadrada de 512 pixels', ctx => { assert.deepEqual(ctx.png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])); assert.equal(ctx.png.readUInt32BE(16), 512); assert.equal(ctx.png.readUInt32BE(20), 512); }],
  ['o manual normativo LOGO.md', ctx => { ctx.manualPath = 'brand/logo/LOGO.md'; }],
  ['o contrato de identidade visual é inspecionado', ctx => { ctx.manual = read(ctx.manualPath); ctx.brandSources = ['README.md', 'guidelines.md', 'checklist.md', 'guide/brand-guide.md', 'style-guide.html', 'icons/icons.md'].map(path => read('brand/' + path)); }],
  ['variantes proteção tamanho restrições cores e acessibilidade estão definidos', ctx => { includes(ctx.manual, ['## Variantes', '## Proteção e tamanho', '## Restrições']); includes(ctx.brandSources[3], ['## Cores', '## Acessibilidade']); }],
  ['os guias de marca descrevem somente as variantes oficiais', ctx => { const sources = [ctx.manual, ...ctx.brandSources].join('\n'); includes(sources.toLowerCase(), ['três camadas', 'símbolo de código']); includes(ctx.manual, ['logo-light.svg', 'logo-dark.svg', 'icon-light.svg', 'icon-dark.svg', 'icon.svg', 'icon.png']); for (const asset of ['mark.svg', 'favicon.svg', 'logo/logo.md']) assert.ok(!sources.includes(asset), asset); }],
  ['os READMEs versionados encontrados recursivamente', ctx => { ctx.readmes = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' }).split('\0').filter(path => path === 'README.md' || path.endsWith('/README.md')); }],
  ['a adoção do novo logo nesses arquivos é inspecionada', ctx => { ctx.readmeContents = ctx.readmes.map(path => [path, read(path)]); }],
  ['todos os READMEs usam o SVG canônico com fallback PNG', ctx => { assert.ok(ctx.readmeContents.length); for (const [path, source] of ctx.readmeContents) { if (path === 'cli/README.md') { includes(source, ['srcset="https://promovaweb.com/opensource/specsfy/icon.svg"', 'src="https://promovaweb.com/opensource/specsfy/icon.png"']); continue; } const logo = relative(dirname(join(ROOT, path)), join(ROOT, 'brand/logo')).replaceAll('\\', '/'); includes(source, [`<source srcset="${logo}/icon.svg" type="image/svg+xml">`, `<img src="${logo}/icon.png" alt="Logo do Specsfy" width="128">`]); } }],
  ['a fonte Markdown do guia completo de marca', ctx => { ctx.guide = join(ROOT, 'brand/guide/brand-guide.md'); assert.ok(existsSync(ctx.guide)); }],
  ['o contrato de build do manual é inspecionado', ctx => { ctx.makefile = read('Makefile'); ctx.build = read('.pdf/build-brand-guide.sh'); }],
  ['o PDF canônico fica na raiz do repositório de marca', () => { assert.ok(existsSync(join(ROOT, 'brand/Specsfy-Manual-de-Marca.pdf'))); assert.ok(!existsSync(join(ROOT, 'brand/guide/Specsfy-Manual-de-Marca.pdf'))); }],
  ['o build rastreia LOGO.md SVG PNG HTML Markdown e CSS', ctx => { includes(ctx.makefile, ['brand/logo/LOGO.md', 'brand/logo/icon.svg', 'brand/logo/icon.png', 'brand/guide/brand-guide.md', 'brand/guide/template.html', 'brand/style-guide.html', '.pdf/build-brand-guide.sh', '.pdf/style.css']); includes(ctx.build, ['$BRAND_ROOT/logo/LOGO.md', '$BRAND_ROOT/logo/icon.svg', '$BRAND_ROOT/logo/icon.png']); }],
];
