/** Liga os nove cenários do ebook aos contratos de artefatos e retenção em Node. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,read,node} from './helpers.mjs';
const feature=read('tests/features/ebook_usuario.feature');
const scenarios=[
 ['Gerar os dois formatos a partir da fonte oficial','ebook.test.mjs','SemVer controla|ordem editorial contém'],
 ['Controlar a edição com versionamento semântico','version-alignment.test.mjs','aceita projeções alinhadas'],
 ['Manter somente as cinco edições mais recentes','ebook-utilities.test.mjs','retém cinco edições'],
 ['Exigir rebuild após qualquer mudança nos docs do usuário','ebook.test.mjs','manifesto comprova'],
 ['Aplicar o sistema visual oficial','ebook.test.mjs','fontes visuais reutilizam'],
 ['Ensinar em uma sequência pedagógica única','documentation-contracts.test.mjs','ordem de leitura|portal ensina|ebook consome'],
 ['Ocultar o frontmatter documental nos formatos de leitura','ebook.test.mjs','formatos de leitura omitem'],
 ['Manter a navegação dentro do próprio ebook','ebook.test.mjs','PDF e EPUB mantêm links'],
 ['Explicar a metodologia sem exigir conhecimento prévio','ebook.test.mjs','método explica'],
];
for(const [scenario,file,pattern] of scenarios)test('BDD: '+scenario,()=>{
 assert.ok(feature.includes('Scenario: '+scenario));
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const result=node('--test',['--test-reporter=tap','--test-name-pattern='+pattern,join(ROOT,'tests',file)],{env});
 assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/pass [1-9]/);
 if(scenario==='Controlar a edição com versionamento semântico'){
  const version=read('VERSION').trim(),manifest=JSON.parse(read('ebook/build.json'));assert.equal(manifest.version,version);assert.equal(manifest.edition,'v'+version);
 }
 if(scenario==='Exigir rebuild após qualquer mudança nos docs do usuário'){
  const manifest=JSON.parse(read('ebook/build.json')),sources=new Set(manifest.sources);
  function walk(directory,prefix){for(const entry of readdirSync(directory,{withFileTypes:true})){const path=prefix+'/'+entry.name;if(entry.isDirectory())walk(join(directory,entry.name),path);else assert.ok(sources.has(path),path);}}
  walk(join(ROOT,'docs/user'),'docs/user');
 }
});
