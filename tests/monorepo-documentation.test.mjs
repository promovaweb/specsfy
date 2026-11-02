/** Preserva rotas, exemplos e imagens da documentação oficial do monorepo. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,lstatSync,realpathSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {ROOT,read,temporary,node} from './helpers.mjs';
const skill='.agents/skills/specsfy-monorepo-documentator';
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
const git=()=>execFileSync('git',['status','--short'],{cwd:ROOT,encoding:'utf8'});
test('skill local compartilha fonte entre Codex e Claude',()=>{
 assert.ok(existsSync(join(ROOT,skill,'SKILL.md')));const link=join(ROOT,'.claude/skills/specsfy-monorepo-documentator');assert.ok(lstatSync(link).isSymbolicLink());assert.equal(realpathSync(link),realpathSync(join(ROOT,skill)));
});
test('coletor reconhece checkout atual e não grava arquivos',()=>{
 const before=git(),result=node(join(ROOT,skill,'scripts/collect-monorepo-evidence.mjs'),['--workspace',ROOT]);assert.equal(result.status,0,result.stderr);
 const payload=JSON.parse(result.stdout);assert.equal(payload.workspace,'promovaweb/specsfy');assert.equal(payload.remote,'https://github.com/promovaweb/specsfy');assert.equal(payload.modules.length,8);assert.deepEqual(payload.changes,before.trimEnd().split('\n').filter(Boolean));assert.equal(git(),before);
});
test('coletor recusa diretório externo',t=>{
 const result=node(join(ROOT,skill,'scripts/collect-monorepo-evidence.mjs'),['--workspace',temporary(t)]);assert.notEqual(result.status,0);assert.match(result.stderr,/representa o monorepo Specsfy/);
});
test('documentador local não substitui documentador do consumidor',()=>{
 includes(read(skill+'/SKILL.md'),['documenta a metodologia','monorepo']);includes(read('skills/specsfy-documentator/SKILL.md'),['Manter em `docs/`']);
 const installer=read('cli/src/installer.ts');assert.ok(!installer.includes('specsfy-monorepo-documentator'));includes(installer,['"specsfy-documentator"']);assert.ok(!existsSync(join(ROOT,'skills/specsfy-monorepo-documentator')));
});
test('documentação publica rotas técnicas e de usuário',()=>{
 for(const path of [skill+'/references/documentation-standard.md','docs/develop/documentation.md'])includes(read(path),['docs/user/','docs/develop/']);includes(read('docs/README.md'),['develop/README.md']);
});
test('guia canônico de instalação cobre CLI e framework',()=>{
 for(const path of [skill+'/SKILL.md',skill+'/references/documentation-standard.md'])includes(read(path),['docs/user/installation.md']);
 const installation=read('docs/user/installation.md');includes(installation,['Node.js 22.20','npm install --global @promovaweb/specsfy','get.specsfy.dev','curl -fL get.specsfy.dev','specsfy --version','specsfy install --project .','specsfy skills list','specsfy progress --project .','## Corrija falhas comuns','.agents/skills/specsfy-01-inbox','.specsfy/Spec.md']);
 for(const term of ['## Papel','### Pré-requisitos','gh auth login','uv tool install','git+https://github.com/promovaweb/specsfy','## Atualize quando','## Não use para','## Fonte da verdade e precedência','.specsfy/templates/Inbox.md'])assert.ok(!installation.includes(term),term);
 includes(read('docs/user/README.md'),['[Instalação](installation.md)']);includes(read('docs/user/cli.md'),['[guia de instalação](installation.md)']);
});
test('entrada pública e guias cobrem a jornada na ordem do fluxo',()=>{
 const entry=read('specsfy/README.md'),router=read('docs/user/README.md');
 includes(entry,['get.specsfy.dev','specsfy --version','specsfy install --project .','npm update --global @promovaweb/specsfy','specsfy skills update --project .','specsfy-01-inbox','specsfy-02-backlog','Ato I — Definir','Ato II — Projetar e provar','Ato III — Entregar','specsfy progress --project .','## Dicas para usar o CLI','specsfy --help','specsfy progress --project . --json','specsfy progress --project . --watch','Nada é instalado ou removido antes de **Aplicar**']);
 const flow=['$specsfy-01-inbox','$specsfy-02-backlog','$specsfy-03-specify','$specsfy-04-validate','$specsfy-05-tasks','$specsfy-06-tdd-bdd','$specsfy-07-implement','$specsfy-update-spec','$specsfy-progress','$specsfy-interviewer'];
 for(const text of [entry,read('docs/user/getting-started.md')]){
 includes(text,['specs/inbox/2026-07-28-143205-pagina-boas-vindas.md','specs/backlog/0001-pagina-boas-vindas.md','specs/<estado>/0001-pagina-boas-vindas/spec.md','READY','Reviewing',...flow]);for(const term of ['<?php','Route::','test('])assert.ok(!text.includes(term));const positions=flow.map(term=>text.indexOf(term));assert.deepEqual(positions,[...positions].sort((a,b)=>a-b));
 }
 const guides={'getting-started.md':['specsfy-01-inbox','Definition Gate'],'update-spec.md':['specsfy-update-spec','esqueci','adicionar','remover','corrigir','mudar'],'advanced-usage.md':['--detected','--specialist'],'../develop/modules.md':['specsfy/','docs/','skills/','specialists/','cli/','example/','brand/','promovaweb/specsfy'],'credits.md':['Promovaweb','Luiz Eduardo Oliveira Fonseca'],'laravel.md':['specsfy-specialist-laravel','artisan','composer.json'],'astro.md':['specsfy-specialist-astro','astro.config','package.json'],'nextjs.md':['specsfy-specialist-nextjs','next.config','package.json']};
 for(const [file,terms] of Object.entries(guides)){includes(router,[`](${file})`]);includes(read('docs/user/'+file),terms);}
});
test('download público usa a URL curta canônica',()=>{
 for(const path of ['README.md','cli/README.md','specsfy/README.md','skills/README.md','docs/user/installation.md']){const text=read(path);includes(text,['`get.specsfy.dev`']);assert.ok(!text.includes('https://get.specsfy.dev'));}
});
test('guia CLI publica imagens PNG e sequência fornecida',()=>{
 const screenshots=[['cli-dash.png','Dashboard Home'],['cli-backlogs.png','Backlogs'],['cli-specs.png','Specs'],['cli-skills.png','Skills']];
 for(const [file,alt] of screenshots){const bytes=readFileSync(join(ROOT,'docs/user/assets/cli',file));assert.deepEqual(bytes.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));includes(read('docs/user/cli.md'),[`![${alt}](assets/cli/${file})`]);}
 const stacked=screenshots.map(([file,alt])=>`![${alt}](https://promovaweb.com/docs/specsfy/cli/${file})`).join('\n\n');includes(read('cli/README.md'),[stacked]);includes(read('specsfy/README.md'),['![Dashboard Home do Specsfy](../docs/user/assets/cli/cli-dash.png)']);
});
