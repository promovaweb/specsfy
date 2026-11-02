/** Preserva isolamento, concorrência e templates na criação de specs. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, temporary, put, node, read } from '../../tests/helpers.mjs';
const script=join(ROOT,'skills/specsfy-03-specify/scripts/iniciar_spec.mjs');
const template=read('skills/templates/Spec.md');
function initialize(cwd,title,args=[]) { return node(script,['--title',title,...args],{cwd}); }
function success(result) { assert.equal(result.status,0,result.stderr);return result.stdout.trim(); }

test('usa cwd, inclusive dentro de Git, ou raiz explícita',t=>{
  const current=temporary(t);
  assert.equal(success(initialize(current,'Current Project')),join(current,'specs/draft/0001-current-project/spec.md'));
  const gitRoot=temporary(t);execFileSync('git',['init','-q',gitRoot]);
  const nested=join(gitRoot,'nested/agent-workdir');mkdirSync(nested,{recursive:true});
  assert.ok(existsSync(success(initialize(nested,'Nested Project'))));
  assert.ok(!existsSync(join(gitRoot,'specs')));
  const outside=temporary(t),target=temporary(t);
  assert.equal(success(initialize(outside,'Explicit Root',['--root',target])),join(target,'specs/draft/0001-explicit-root/spec.md'));
  assert.ok(!existsSync(join(outside,'specs')));
});
test('preenche modelo canônico e recusa título e slug inválidos',t=>{
  const root=temporary(t),path=success(initialize(root,'Título com Acento',['--slug','slug-explicito']));
  const content=readFileSync(path,'utf8');
  for(const term of ['# Especificação integrada: Título com Acento','| Campo | Valor |','| --- | --- |','| ID | SPEC-0001 |','| Slug | 0001-slug-explicito |','| Atualizada em |'])assert.ok(content.includes(term),term);
  assert.ok(!content.includes('**ID**:'));assert.ok(!content.includes('{{'));
  assert.equal(content.split('## Ato ').length-1,3);
  assert.equal(content.split('\n').filter(line=>/^### \d{1,2}[. ]/.test(line)).length,18);
  const invalid=initialize(root,'!!!');assert.notEqual(invalid.status,0);assert.match(invalid.stderr,/erro:/i);
  assert.equal(readdirSync(join(root,'specs/draft')).length,1);
  const invalidSlug=initialize(root,'Another',['--slug','Not Valid']);assert.notEqual(invalidSlug.status,0);assert.match(invalidSlug.stderr,/kebab-case/);
});
test('aloca o próximo ID incremental e preserva pasta legada',t=>{
  const root=temporary(t);
  for(const name of ['0001-first','0003-third','legacy'])mkdirSync(join(root,'specs/draft',name),{recursive:true});
  const path=success(initialize(root,'Fourth'));
  assert.equal(path,join(root,'specs/draft/0004-fourth/spec.md'));
  assert.ok(readFileSync(path,'utf8').includes('| ID | SPEC-0004 |'));
  assert.ok(existsSync(join(root,'specs/draft/legacy')));
});
test('inicializações concorrentes recebem IDs distintos',async t=>{
  const root=temporary(t);
  const results=await Promise.all(['Alpha','Beta'].map(title=>new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[script,'--title',title],{cwd:root});
    let stderr='';child.stderr.on('data',chunk=>{stderr+=chunk;});child.on('error',reject);child.on('close',code=>resolve({code,stderr}));
  })));
  for(const result of results)assert.equal(result.code,0,result.stderr);
  assert.deepEqual(readdirSync(join(root,'specs/draft')).sort().map(name=>name.slice(0,4)),['0001','0002']);
});
test('IDs ordenam lexicograficamente',()=>{
  const names=[1,2,10,999,9999].map(n=>String(n).padStart(4,'0')+'-spec');
  assert.deepEqual([...names].reverse().sort(),names);
});
test('usa biblioteca padrão e relata raiz inválida',t=>{
  const source=read('skills/specsfy-03-specify/scripts/iniciar_spec.mjs');
  assert.ok(source.includes('from "node:fs/promises"'));assert.ok(!source.toLowerCase().includes('python3'));
  const root=temporary(t),file=put(root,'arquivo','fixture');
  const result=initialize(root,'Invalid Root',['--root',file]);
  assert.notEqual(result.status,0);assert.match(result.stderr,/erro:/i);assert.ok(result.stderr.includes(file));
});
test('prefere template instalado no consumidor',t=>{
  const root=temporary(t);
  put(root,'.specsfy/templates/Spec.md','# {{SPEC_NAME}}\n| Campo | Valor |\n| --- | --- |\n| ID | {{SPEC_ID}} |\n| Slug | {{SPEC_NUMBER}}-{{SPEC_SLUG}} |\n| Atualizada em | {{CURRENT_DATE}} |\ntemplate instalado\n');
  const content=readFileSync(success(initialize(root,'Template local')),'utf8');
  assert.ok(content.includes('template instalado'));assert.ok(content.includes('| ID | SPEC-0001 |'));
});
test('prefere template customizado ao instalado',t=>{
  const root=temporary(t);
  put(root,'.specsfy/templates/Spec.md',template.replace('# Especificação integrada:','# Template padrão:'));
  put(root,'.specsfy/templates/custom/Spec.md',template.replace('# Especificação integrada:','# Template customizado:'));
  const content=readFileSync(success(initialize(root,'Precedência customizada')),'utf8');
  assert.ok(content.includes('# Template customizado:'));assert.ok(!content.includes('# Template padrão:'));
});
