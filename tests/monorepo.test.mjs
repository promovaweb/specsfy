/** Confere raiz Git única, endpoints e ausência de referências à distribuição antiga. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readdirSync,readFileSync} from 'node:fs';
import {join,extname,relative} from 'node:path';
import {ROOT,read} from './helpers.mjs';
const git=(...args)=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim();
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
test('origin aponta para o monorepo Promovaweb',()=>{assert.ok(git('remote','get-url','origin').includes('github.com/promovaweb/specsfy'));});
test('módulos compartilham uma única raiz Git',()=>{
 for(const name of ['brand','cli','docs','example','skills','specialists','specsfy'])assert.equal(git('-C',name,'rev-parse','--show-toplevel'),ROOT,name);
});
test('fontes não referenciam a distribuição antiga em múltiplos repositórios',()=>{
 const patterns=[/github\.com\/specsfy\//,/raw\.githubusercontent\.com\/specsfy\//,/api\.github\.com\/repos\/specsfy\//,/(?<![./])\bspecsfy\/(?:dev|brand|skills|docs|example|specsfy|specialists|cli)\b/,/oito repositórios|oito raízes Git|repositórios independentes/,/specsfy-hub-documentator|hub-documentation\.md|collect_hub_evidence\.py/,/raiz proprietária|raízes proprietárias/];
 const extensions=new Set(['.bash','.feature','.json','.mjs','.md','.py','.sh','.toml','.ts','.yaml','.yml']);
 const skipped=new Set(['.git','.venv','node_modules','vendor','__pycache__']);
 const violations=[];
 function scan(directory){for(const entry of readdirSync(directory,{withFileTypes:true})){
  if(skipped.has(entry.name))continue;
  const path=join(directory,entry.name);
  if(entry.isDirectory()){scan(path);continue;}
  if(!entry.isFile()||!extensions.has(extname(entry.name))||['monorepo.test.mjs','test_monorepo.py'].includes(entry.name))continue;
  const content=readFileSync(path,'utf8');for(const pattern of patterns)if(pattern.test(content))violations.push(relative(ROOT,path)+': '+pattern.source);
 }}
 scan(ROOT);assert.deepEqual(violations,[]);
});
test('CLI usa os endpoints de distribuição do monorepo',()=>{
 includes(read('cli/src/installer.ts'),['https://github.com/promovaweb/specsfy.git','BASE_DIRECTORY = "skills"','SPECIALISTS_DIRECTORY = "specialists"']);
 includes(read('cli/src/catalog.ts'),['api.github.com/repos/promovaweb/specsfy/','contents/specialists/catalog.json?ref=main','application/vnd.github.raw+json']);
 includes(read('cli/src/updater.ts'),['api.github.com/repos/promovaweb/specsfy/tags']);
 includes(read('cli/package.json'),['"homepage": "https://promovaweb.com/docs/specsfy/cli/"','"url": "git+https://github.com/promovaweb/specsfy.git"','"email": "contato@promovaweb.com"','"name": "@promovaweb/specsfy"']);
});
