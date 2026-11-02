/** Executa preparação de release e confere a sequência dos cenários BDD existentes. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {readFileSync} from 'node:fs';
import {read,temporary,put} from './helpers.mjs';
import {prepare,releaseNotes,verifyReleaseBody} from '../cli/.agents/skills/specsfy-release-cli/scripts/release-changelog.mjs';
const feature=read('tests/features/cli_release_skill.feature');
const skill=read('cli/.agents/skills/specsfy-release-cli/SKILL.md');
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
test('BDD: Preparar uma versão com uma única fonte para as notas',t=>{
 includes(feature,['Scenario: Preparar uma versão com uma única fonte para as notas']);
 const root=temporary(t),cli=join(root,'cli');
 put(root,'VERSION','0.6.0\n');put(root,'cli/package.json',JSON.stringify({name:'@promovaweb/specsfy',version:'0.6.0'}));put(root,'cli/src/version.ts','export const VERSION = "0.6.0";\n');
 const changelog=put(root,'cli/CHANGELOG.md','# Changelog\n\n## [Unreleased]\n\n## [0.6.0] - 2026-07-01\n\n- Primeira versão registrada.\n');
 const notes='### Added\n\n- Publicação automatizada.\n\n### Fixed\n\n- Notas consistentes.\n';
 prepare(cli,'0.7.0','2026-07-27',put(root,'notes.md',notes));
 assert.equal(readFileSync(join(root,'VERSION'),'utf8'),'0.7.0\n');assert.equal(JSON.parse(readFileSync(join(cli,'package.json'),'utf8')).version,'0.7.0');
 includes(readFileSync(join(cli,'src/version.ts'),'utf8'),['VERSION = "0.7.0"']);
 includes(readFileSync(changelog,'utf8'),['## [Unreleased]\n\n## [0.7.0] - 2026-07-27']);
 assert.equal(releaseNotes(changelog,'0.7.0'),notes);
 const remote=put(root,'remote.json',JSON.stringify({body:notes}));verifyReleaseBody(changelog,'0.7.0',remote);
 put(root,'remote.json',JSON.stringify({body:'notas divergentes\n'}));assert.throws(()=>verifyReleaseBody(changelog,'0.7.0',remote),/diverge/);
});
test('BDD: Publicar commit tag e GitHub Release',()=>{
 includes(feature,['Scenario: Publicar commit tag e GitHub Release']);
 includes(skill,['git remote get-url origin','git status --porcelain','git rev-parse origin/main','git tag -a vX.Y.Z','git push --atomic origin main vX.Y.Z','gh release create vX.Y.Z','--notes-file /caminho/release-notes.md','não recriar commit, tag ou versão']);
 const commit=skill.indexOf('git commit -m');for(const command of ['npm run build:executable','npm test']){assert.ok(skill.indexOf(command)>=0);assert.ok(skill.indexOf(command)<commit);}
 includes(read('docs/develop/context/flows/cli-release.md'),['mesma seção do changelog','não cria outra']);
});
