/** Confere links locais, imagens e referências às skills em todas as fontes autorais. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync,existsSync,statSync} from 'node:fs';
import {join,relative,resolve,dirname,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT,read} from './helpers.mjs';
const ignored=new Set(['.git','.mypy_cache','.pytest_cache','.ruff_cache','.venv','__pycache__','build','dist','node_modules','vendor']);
function files(suffixes,directory=ROOT){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>ignored.has(entry.name)?[]:entry.isDirectory()?files(suffixes,join(directory,entry.name)):suffixes.includes(extname(entry.name))?[join(directory,entry.name)]:[]).sort();}
const htmlTargets=text=>[...text.matchAll(/\b(?:href|src|srcset|poster)=(["'])(.*?)\1/gi)].map(match=>match[2]);
function targets(text){return [...[...text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)].map(m=>m[1]),...[...text.matchAll(/^\s*\[[^\]]+\]:\s*(\S+)/gm)].map(m=>m[1]),...htmlTargets(text)];}
function local(source,raw){
 const target=raw.trim().replace(/^<|>$/g,'');
 if(target.startsWith('#'))return {path:source,anchor:decodeURIComponent(target.slice(1))};
 if(!target||target.includes('...')||/^[\/{\$]/.test(target)||/^[a-z][a-z\d+.-]*:/i.test(target))return null;
 const hash=target.indexOf('#'),base=hash<0?target:target.slice(0,hash);
 return {path:resolve(dirname(source),decodeURIComponent(base.split('?')[0])),anchor:hash<0?'':decodeURIComponent(target.slice(hash+1))};
}
function anchors(path){
 const text=readFileSync(path,'utf8');
 return new Set([...[...text.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].map(m=>m[1].replace(/<[^>]+>/g,'').toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu,'').replaceAll(' ','-')),...[...text.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1])]);
}
test('links e âncoras de todo Markdown autoral resolvem',()=>{
 const failures=[];
 for(const source of files(['.md']))for(const target of targets(readFileSync(source,'utf8'))){const result=local(source,target);if(!result)continue;
  if(!existsSync(result.path))failures.push(relative(ROOT,source)+' -> '+target);
  else if(result.anchor&&(!statSync(result.path).isFile()||!anchors(result.path).has(result.anchor)))failures.push(relative(ROOT,source)+' -> '+target+' (âncora)');
 }
 assert.deepEqual(failures,[]);
});
test('assets HTML, CSS e SVG resolvem',()=>{
 const failures=[];
 for(const source of files(['.html','.css','.svg'])){
 const text=readFileSync(source,'utf8');const all=[...htmlTargets(text),...[...text.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)].map(m=>m[2])];
 for(const target of all){const result=local(source,target);if(result&&!existsSync(result.path))failures.push(relative(ROOT,source)+' -> '+target);}
 }
 assert.deepEqual(failures,[]);
});
test('navegação interna não usa URLs remotas do Git',()=>{
 const pattern=/https:\/\/(?:raw\.githubusercontent\.com\/promovaweb\/specsfy\/main\/|github\.com\/promovaweb\/specsfy\/(?:blob|tree)\/main\/)/;
 assert.deepEqual(files(['.md','.html']).filter(path=>pattern.test(readFileSync(path,'utf8'))).map(path=>relative(ROOT,path)),[]);
});
test('imagens do repositório possuem assinatura e dimensões válidas',()=>{
 const failures=[];
 for(const path of files(['.gif','.jpeg','.jpg','.png','.svg','.webp']))try{
  const bytes=readFileSync(path),suffix=extname(path).toLowerCase();
  if(suffix==='.png'){assert.ok(bytes.length>=24);assert.deepEqual(bytes.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));assert.ok(bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(20)>0);}
  else if(['.jpg','.jpeg'].includes(suffix)){assert.equal(bytes.subarray(0,2).toString('hex'),'ffd8');assert.equal(bytes.subarray(-2).toString('hex'),'ffd9');}
  else if(suffix==='.gif')assert.ok(['GIF87a','GIF89a'].includes(bytes.subarray(0,6).toString()));
  else if(suffix==='.webp'){assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');}
  else assert.equal(execFileSync('xmllint',['--nonet','--xpath','local-name(/*)','-'],{input:bytes,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim(),'svg');
 }catch(error){failures.push(relative(ROOT,path)+': '+error.message);}
 assert.deepEqual(failures,[]);
});
test('referências de skills e catálogo de especialistas são coerentes',()=>{
 const roots=['.agents/skills','skills','specialists','cli/.agents/skills'];
 const available=new Set(),failures=[];
 for(const root of roots)for(const name of readdirSync(join(ROOT,root))){const path=join(ROOT,root,name),skill=join(path,'SKILL.md');if(!existsSync(skill)||!statSync(path).isDirectory())continue;available.add(name);
 if(!readFileSync(skill,'utf8').includes('name: '+name))failures.push(name+': frontmatter');
 const agent=join(path,'agents/openai.yaml');if(!existsSync(agent)||!readFileSync(agent,'utf8').includes('$'+name))failures.push(name+': openai.yaml');
 }
 assert.deepEqual(failures,[]);
 const unknown=new Set();for(const path of files(['.md','.yaml','.yml']))for(const match of readFileSync(path,'utf8').matchAll(/\$(specsfy-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(?![a-z0-9-])/g))if(!available.has(match[1]))unknown.add(match[1]);assert.deepEqual([...unknown],[]);
 const payload=JSON.parse(read('specialists/catalog.json')),names=new Set(payload.skills.map(entry=>entry.name));
 const directories=readdirSync(join(ROOT,'specialists')).filter(name=>existsSync(join(ROOT,'specialists',name,'SKILL.md')));
 assert.deepEqual([...names].sort(),directories.sort());
 const missing=new Set(payload.skills.flatMap(entry=>entry.requires??[]).filter(name=>!names.has(name)));assert.deepEqual([...missing],[]);
});
