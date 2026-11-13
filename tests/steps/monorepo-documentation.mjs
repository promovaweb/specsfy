/** Preserva os steps de autoria local e dos percursos públicos do monorepo. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, lstatSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read } from '../helpers.mjs';
const local = '.agents/skills/specsfy-monorepo-documentator';
const includes = (source, terms) => terms.forEach(term => assert.ok(source.includes(term), term));
const expected = JSON.parse(read('tests/fixtures/documentation-bdd.json'));
const screenshots = [['cli-dash.png', 'Dashboard Home'], ['cli-backlogs.png', 'Backlogs'], ['cli-specs.png', 'Specs'], ['cli-skills.png', 'Skills']];
const base = ['specsfy-01-inbox', 'specsfy-02-backlog', 'specsfy-03-specify', 'specsfy-04-validate', 'specsfy-05-tasks', 'specsfy-06-tdd-bdd', 'specsfy-07-implement', 'specsfy-update-spec', 'specsfy-progress'];
export const monorepoDocumentationSteps = [
  ['a skill de documentação do monorepo', ctx => { ctx.skillPath = join(ROOT, local, 'SKILL.md'); ctx.claudePath = join(ROOT, '.claude/skills/specsfy-monorepo-documentator'); }],
  ['sua identidade e fronteiras são inspecionadas', ctx => { ctx.skill = read(local + '/SKILL.md'); ctx.collector = read(local + '/scripts/collect-monorepo-evidence.mjs'); ctx.installer = read('cli/src/domain/installer.ts'); }],
  ['ela é descoberta nas pastas padrão de Codex e Claude', ctx => { assert.ok(existsSync(ctx.skillPath)); assert.ok(lstatSync(ctx.claudePath).isSymbolicLink()); assert.equal(realpathSync(ctx.claudePath), realpathSync(join(ROOT, local))); }],
  ['ela valida a raiz Git única e os módulos', ctx => includes(ctx.collector, ['show-toplevel', 'brand', 'skills', 'docs', 'example', 'specsfy', 'specialists', 'cli'])],
  ['ela publica em docs', ctx => includes(ctx.skill, ['docs/'])],
  ['ela não é instalada pelo CLI em projetos consumidores', ctx => assert.ok(!ctx.installer.includes('specsfy-monorepo-documentator'))],
  ['a fonte da verdade distribuída do Specsfy', ctx => { ctx.root = ROOT; }],
  ['o contrato documental do monorepo é inspecionado', ctx => {
    ctx.skill = read(local + '/SKILL.md'); ctx.standard = read(local + '/references/documentation-standard.md'); ctx.guide = read('docs/develop/documentation.md');
    ctx.installation = read('docs/user/installation.md'); ctx.router = read('docs/user/README.md'); ctx.cli = read('docs/user/cli.md'); ctx.cliReadme = read('cli/README.md');
    ctx.entrypoint = read('specsfy/README.md'); ctx.basic = read('docs/user/getting-started.md');
  }],
  ['ele roteia arquitetura módulos dependências stack dados fluxos e testes', ctx => includes(ctx.standard, ['arquitetura', 'módulos', 'dependências', 'stack', 'dados', 'fluxos', 'testes'])],
  ['ele roteia instalação método CLI contexto especialistas e documentação do sistema', ctx => includes(ctx.standard, ['instalação', 'método', 'CLI', 'contexto', 'especialistas', 'documentação do sistema'])],
  ['a documentação oficial explica como executar a skill do monorepo', ctx => includes(ctx.guide, ['$specsfy-monorepo-documentator', 'monorepo'])],
  ['a skill exige um guia temático de instalação em specsfy docs', ctx => { for (const source of [ctx.skill, ctx.standard]) includes(source, ['docs/user/installation.md']); assert.ok(existsSync(join(ROOT, 'docs/user/installation.md'))); }],
  ['o guia instala o CLI e o framework no projeto consumidor', ctx => {
    includes(ctx.installation, ['Node.js 22.20', 'npm install --global @promovaweb/specsfy', '`get.specsfy.dev`', 'curl -fL get.specsfy.dev', 'specsfy install --project .', 'specsfy --version', 'specsfy skills list', 'specsfy progress --project .', '## Corrija falhas comuns', '.agents/skills/specsfy-01-inbox', '.specsfy/Spec.md']);
    for (const term of ['https://get.specsfy.dev', '## Papel', '### Pré-requisitos', 'gh auth login', 'uv tool install', 'git+https://github.com/promovaweb/specsfy', '## Atualize quando', '## Não use para', '## Fonte da verdade e precedência', '.specsfy/templates/Inbox.md']) assert.ok(!ctx.installation.includes(term), term);
  }],
  ['o portal e o guia operacional do CLI apontam para a instalação', ctx => { includes(ctx.router, ['[Instalação](installation.md)']); includes(ctx.cli, ['[guia de instalação](installation.md)']); }],
  ['a porta pública ensina instalação atualização e primeiro uso', ctx => includes(ctx.entrypoint, expected.public_basics)],
  ['os dois exemplos percorrem o fluxo principal até a projeção final', ctx => { for (const source of [ctx.entrypoint, ctx.basic]) { includes(source, expected.base_flow); const positions = expected.base_flow.map(term => source.indexOf(term)); assert.deepEqual(positions, [...positions].sort((a, b) => a - b)); } }],
  ['os exemplos mostram cada comando e seu resultado sem código de implementação', ctx => { includes(ctx.entrypoint, [...expected.public_journey, ...expected.public_results]); includes(ctx.basic, [...expected.basic_journey, ...expected.basic_results]); for (const source of [ctx.entrypoint, ctx.basic]) for (const code of ['<?php', 'Route::', 'test(']) assert.ok(!source.includes(code), code); }],
  ['a porta pública oferece dicas operacionais do CLI', ctx => includes(ctx.entrypoint, expected.cli_tips)],
  ['a documentação separa uso básico uso avançado repositórios e créditos', ctx => { for (const file of ['getting-started.md', 'update-spec.md', 'advanced-usage.md', '../develop/modules.md', 'credits.md']) { assert.ok(existsSync(join(ROOT, 'docs/user', file))); includes(ctx.router, [`](${file})`]); } }],
  ['Laravel Astro e Nextjs possuem guias temáticos verificáveis', ctx => { for (const [file, terms] of Object.entries({ 'laravel.md': ['specsfy-specialist-laravel', 'artisan', 'composer.json'], 'astro.md': ['specsfy-specialist-astro', 'astro.config', 'package.json'], 'nextjs.md': ['specsfy-specialist-nextjs', 'next.config', 'package.json'] })) { includes(ctx.router, [`](${file})`]); includes(read('docs/user/' + file), terms); } }],
  ['o guia do CLI incorpora as quatro capturas fornecidas', ctx => { for (const [file, alt] of screenshots) { assert.deepEqual(readFileSync(join(ROOT, 'docs/user/assets/cli', file)).subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])); includes(ctx.cli, [`![${alt}](assets/cli/${file})`]); } }],
  ['o README do módulo CLI empilha as quatro capturas verticalmente', ctx => includes(ctx.cliReadme, [screenshots.map(([file, alt]) => `![${alt}](https://promovaweb.com/docs/specsfy/cli/${file})`).join('\n\n')])],
  ['a porta pública apresenta a visão Home do dashboard', ctx => includes(ctx.entrypoint, ['![Dashboard Home do Specsfy](../docs/user/assets/cli/cli-dash.png)'])],
  ['a nova topologia documental é inspecionada', ctx => { ctx.userPortal = read('docs/user/README.md'); ctx.developPortal = read('docs/develop/README.md'); }],
  ['docs possui somente os percursos user e develop', () => assert.deepEqual(readdirSync(join(ROOT, 'docs'), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort(), ['develop', 'user'])],
  ['o percurso user oferece um guia geral simples para toda a jornada', ctx => includes(ctx.userPortal, ['Instalação', 'Primeiro projeto', 'Metodologia', 'CLI e TUI', 'Skills base', 'Especialistas', 'Documentação do sistema'])],
  ['cada skill base possui uma página de uso aprofundada com exemplo', () => { for (const name of base) includes(read(`docs/user/skills/${name}.md`), ['## Exemplo passo a passo', '## O que esperar']); }],
  ['o percurso develop explica metodologia arquitetura skills CLI e contribuição', ctx => { for (const file of ['methodology.md', 'contributing.md', 'skills.md', 'cli.md']) { assert.ok(existsSync(join(ROOT, 'docs/develop', file))); includes(ctx.developPortal, [`](${file})`]); } assert.ok(existsSync(join(ROOT, 'docs/develop/context/architecture/README.md'))); }],
  ['agentes e humanos encontram contexto técnico e validações no mesmo portal', ctx => includes(ctx.developPortal.toLowerCase(), ['agentes', 'humanos', 'contexto', 'testes', 'contribuir'])],
];
