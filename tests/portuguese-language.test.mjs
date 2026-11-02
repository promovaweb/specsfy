/** Preserva os filtros de idioma nas fontes autorais e na galeria React. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readdirSync,readFileSync,statSync} from 'node:fs';
import {join,relative,extname} from 'node:path';
import {ROOT,read} from './helpers.mjs';
const ignored=new Set(['.venv','__pycache__','node_modules','vendor']);
function files(path){if(!existsSync(path))return [];if(statSync(path).isFile())return [path];return readdirSync(path,{withFileTypes:true}).flatMap(entry=>ignored.has(entry.name)?[]:entry.isDirectory()?files(join(path,entry.name)):entry.isFile()?[join(path,entry.name)]:[]);}
const exampleSkills=existsSync(join(ROOT,'example/.agents/skills'))?readdirSync(join(ROOT,'example/.agents/skills')).filter(name=>name.startsWith('specsfy-')).map(name=>'example/.agents/skills/'+name):[];
const proseRoots=['README.md','AGENTS.md','docs','skills','specialists','brand','specsfy','.agents','cli/README.md','cli/AGENTS.md','example/.specsfy','example/docs',...exampleSkills];
const pythonRoots=['.agents','.ebook','cli','scripts','skills','specialists','tests',...exampleSkills];
const patterns=[/\b(?:the|this|these|those)\s+(?:user|project|system|application|feature|component|repository|workspace|skill|file|source|template|page|team|product|data|request|response)\b/i,/\b(?:use|uses|using|run|read|write|create|creates|return|returns|ensure|check|validate|build|install|select|click)\s+(?:the|this|these|those|an)\b/i,/\b(?:you|we)\s+(?:can|must|should|will|are|use|need|have|recommend|support)\b/i,/\b(?:get started|learn more|contact us|sign in|sign up|create account|privacy policy|all rights reserved|accept all|reject all|email address|first name|last name|full name|send message|view all|read more|start today)\b/i];
const data=JSON.parse(read('tests/fixtures/language-contract.json'));
const pythonFiles=()=>pythonRoots.flatMap(root=>files(join(ROOT,root))).filter(path=>path.endsWith('.py')&&!path.endsWith('/test_idioma_portugues.py'));
test('prosa autoral não contém frases comuns em inglês',()=>{
 const failures=[];for(const path of proseRoots.flatMap(root=>files(join(ROOT,root)))){
 if(!['.feature','.md','.txt','.tsx','.yaml','.yml'].includes(extname(path))||path.split('/').at(-1).startsWith('OFL-'))continue;
 let fenced=false;for(const [index,line] of readFileSync(path,'utf8').split(/\r?\n/).entries()){
 const stripped=line.trim();if(stripped.startsWith('```')){fenced=!fenced;continue;}if(fenced||/https?:\/\//.test(stripped))continue;
 if(patterns.some(pattern=>pattern.test(stripped)))failures.push(relative(ROOT,path)+':'+(index+1)+': '+stripped);
 }}assert.deepEqual(failures,[]);
});
test('strings multilinha remanescentes mantêm vocabulário português',()=>{
 const failures=[];
 for(const path of pythonFiles()){
 const source=readFileSync(path,'utf8');
 // Inclui todas as strings multilinha, cobrindo também docstrings de assinaturas divididas em várias linhas.
 const pattern=/"""([\s\S]*?)"""|'''([\s\S]*?)'''/g;
 for(const match of source.matchAll(pattern)){
 const doc=match[1]??match[2];if(!doc||doc.startsWith('SPECSFY:'))continue;
 const words=new Set(doc.toLowerCase().match(/[A-Za-zÀ-ÿ]+/g)??[]);
 const english=data.ENGLISH_DOCSTRING_WORDS.filter(word=>words.has(word)).length,portuguese=data.PORTUGUESE_DOCSTRING_WORDS.filter(word=>words.has(word)).length;
 if(english>=2&&english>portuguese)failures.push(relative(ROOT,path)+': '+doc.split('\n')[0]);
 }}assert.deepEqual(failures,[]);
});
test('copy de runtime Python remanescente não usa expressões inglesas vetadas',()=>{
 const pattern=/\b(?:baseline unavailable|dashboard de|use kebab-case)\b|approximation, not tokenizer output/i;
 assert.deepEqual(pythonFiles().filter(path=>pattern.test(readFileSync(path,'utf8'))).map(path=>relative(ROOT,path)),[]);
});
test('nomes exibidos das skills estão em português',()=>{
 const pattern=/\b(?:aux|code review|debugging|documentator|domain modeling|performance|react ui components|release|setup)\b/i,failures=[];
 for(const root of ['.agents','skills','specialists'])for(const path of files(join(ROOT,root)).filter(path=>path.endsWith('/openai.yaml')))for(const line of readFileSync(path,'utf8').split('\n'))if(line.includes('display_name:')&&pattern.test(line))failures.push(relative(ROOT,path)+': '+line);
 assert.deepEqual(failures,[]);
});
const gallery=()=>files(join(ROOT,'specialists/specsfy-specialist-react-ui-components/assets')).filter(path=>path.endsWith('.tsx'));
test('galeria React não contém placeholders em latim',()=>{
 const failures=[];for(const path of gallery())for(const phrase of data.LATIN_PLACEHOLDERS)if(readFileSync(path,'utf8').toLowerCase().includes(phrase))failures.push(relative(ROOT,path)+': '+phrase);assert.deepEqual(failures,[]);
});
test('copy visível da galeria React está em português',()=>{
 const visible=[/>\s*([^<{][^<{]*?)\s*</g,/\b(?:answer|description|eyebrow|heading|label|name|question|title)\s*:\s*["'`]([^"'`{}]+)["'`]/g,/\b(?:alt|aria-label|placeholder|title)\s*=\s*["'`]([^"'`{}]+)["'`]/g],english=/\b(?:article|business|comparison|every 24 hours|growth|language|optional|scale|submit|video|yes)\b/i,failures=[];
 for(const path of gallery())for(const pattern of visible)for(const match of readFileSync(path,'utf8').matchAll(pattern)){const value=match[1].split(/\s+/).join(' ');if(english.test(value))failures.push(relative(ROOT,path)+': '+value);}
 assert.deepEqual(failures,[]);
});
