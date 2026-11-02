/** Confere a edição real do ebook, fontes, navegação, metadados e capa. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,read} from './helpers.mjs';
import {verifyNavigation} from '../.ebook/verify-artifacts.mjs';
const version=read('VERSION').trim(),stem=join(ROOT,`ebook/Specsfy-Guia-do-Usuario-v${version}`);
const run=(command,args)=>execFileSync(command,args,{encoding:'utf8',maxBuffer:64*1024*1024});
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
const epubNames=()=>run('unzip',['-Z1',stem+'.epub']).trim().split('\n');
const epubText=()=>epubNames().filter(name=>name.endsWith('.xhtml')).map(name=>run('unzip',['-p',stem+'.epub',name])).join('\n');
test('CI instala ferramentas de inspeção antes dos testes Node',()=>{
 const workflow=read('.github/workflows/specsfy.yml'),dependency='sudo apt-get install -y libxml2-utils poppler-utils';includes(workflow,[dependency]);
 assert.ok(workflow.indexOf(dependency)<workflow.indexOf('npm run test:integration'));
});
test('guia portátil exige pt-BR e identidade própria',()=>{
 const metadata=read('.ebook/metadata.yaml'),template=read('.ebook/template.html'),build=read('.ebook/build-ebook.sh'),readme=read('ebook/README.md');
 includes(metadata,['lang: "pt-BR"','identifier: "urn:specsfy:guia-do-usuario"']);assert.ok(!metadata.includes('github.com/promovaweb/specsfy'));
 includes(template,['<html lang="pt-BR">']);assert.ok(!template.includes('Fonte editorial: docs/user/'));
 includes(build,['deve declarar lang:','deve declarar lang="pt-BR"']);includes(readme,['Português do Brasil','experiência autocontida','citação nominal','online-only']);
});
test('retenção ocorre depois da conferência de integridade',()=>{
 const build=read('.ebook/build-ebook.sh');assert.ok(build.includes('check_manifest\nnode "$RETENTION_SCRIPT" \\\n  --ebook-root "$EBOOK_ROOT" \\\n  --keep 5 \\\n  --protect-version "$VERSION"'));
});
test('SemVer controla os dois formatos publicados',()=>{
 assert.match(version,/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);for(const ext of ['pdf','epub'])assert.ok(existsSync(stem+'.'+ext));
});
test('ordem editorial contém cada página exatamente uma vez',()=>{
 const ordered=read('docs/user/reading-order.txt').split(/\r?\n/).filter(line=>line&&!line.startsWith('#'));
 function pages(directory,prefix){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?pages(join(directory,entry.name),prefix+'/'+entry.name):entry.name.endsWith('.md')?[prefix+'/'+entry.name]:[]);}
 const actual=pages(join(ROOT,'docs/user'),'docs/user');assert.equal(ordered.length,actual.length);assert.deepEqual([...new Set(ordered)].sort(),actual.sort());
});
test('capítulo de deploy liga SemVer ao runtime',()=>{
 includes(read('docs/user/deploy.md'),['SEMVER','specsfy-specialist-versioning','Docker','Ansible','Docker Swarm','rollback']);includes(read('docs/user/reading-order.txt'),['docs/user/deploy.md']);
});
test('manifesto comprova fontes, hashes, aliases e metadados documentais',()=>{
 const result=spawnSync(join(ROOT,'.ebook/build-ebook.sh'),['--check'],{cwd:ROOT,encoding:'utf8',timeout:60000});assert.equal(result.status,0,result.stdout+result.stderr);
 const manifest=JSON.parse(read('ebook/build.json'));assert.match(manifest.source_sha256,/^[0-9a-f]{64}$/);assert.deepEqual(Object.keys(manifest.artifacts).sort(),['epub','pdf']);
 for(const artifact of Object.values(manifest.artifacts))assert.match(artifact.sha256,/^[0-9a-f]{64}$/);
 assert.deepEqual(Object.keys(manifest.document_metadata['docs/user/installation.md']).sort(),['autoridade','escopo','natureza']);
});
test('Makefile rastreia fontes recursivas e ferramentas Node do ebook',()=>{
 includes(read('Makefile'),['.PHONY: brand-guide ebook verify-ebook','EBOOK_DOC_SOURCES','find docs/user -type f','.ebook/extract-document-metadata.mjs','.ebook/prune-editions.mjs','.ebook/strip-document-metadata.lua','ebook:','./.ebook/build-ebook.sh','verify-ebook:','./.ebook/build-ebook.sh --check']);
});
test('fontes visuais reutilizam o sistema de marca vigente',()=>{
 const text=['pdf.css','epub.css','template.html','metadata.yaml'].map(path=>read('.ebook/'+path)).join('\n');
 includes(text,['brand/logo/icon.svg','Inter','Manrope','#000000','#FFFFFF','Especifique. Comprove. Entregue.']);
});
test('formatos de leitura omitem classificação e instruções de download',()=>{
 includes(read('docs/user/installation.md'),['## Classificação']);
 for(const text of [run('pdftotext',[stem+'.pdf','-']),epubText()])for(const forbidden of ['Classificação','Leia online ou como ebook','pasta do ebook'])assert.ok(!text.includes(forbidden),forbidden);
});
test('EPUB contém XML válido, navegação, identificação e capa de 1600x2560',()=>{
 assert.equal(run('unzip',['-p',stem+'.epub','mimetype']),'application/epub+zip');
 const names=epubNames();assert.ok(names.includes('META-INF/container.xml'));assert.ok(names.some(name=>name.endsWith('nav.xhtml')));
 for(const name of names.filter(name=>/\.(xhtml|opf|ncx|xml)$/.test(name)))execFileSync('xmllint',['--nonet','--noout','-'],{input:run('unzip',['-p',stem+'.epub',name]),stdio:['pipe','pipe','pipe']});
 const opf=run('unzip',['-p',stem+'.epub','EPUB/content.opf']);
 const xpath=expression=>execFileSync('xmllint',['--nonet','--xpath',expression,'-'],{input:opf,encoding:'utf8'}).trim();
 const cover=xpath('string(//*[local-name()="item" and contains(@properties,"cover-image")]/@href)');assert.ok(cover);
 const bytes=execFileSync('unzip',['-p',stem+'.epub','EPUB/'+cover]);assert.deepEqual(bytes.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));assert.equal(bytes.readUInt32BE(16),1600);assert.equal(bytes.readUInt32BE(20),2560);
 assert.ok(xpath('string(//*[local-name()="title"])').includes('v'+version));assert.equal(xpath('string(//*[local-name()="identifier"])'),'urn:specsfy:guia-do-usuario');
});
test('PDF e EPUB mantêm links internos e âncoras existentes',()=>{
 assert.match(run('pdftohtml',['-xml','-hidden','-i',stem+'.pdf','-stdout']),/href=/);
 assert.match(epubText(),/<a\b[^>]*href=/);verifyNavigation(stem+'.pdf',stem+'.epub');
});
test('método explica jornada e provas técnicas',()=>{
 const text=read('docs/user/method.md');includes(text,['### Escolha o destino da ideia','### Ato I — Definir o que precisa mudar','### Ato II — Planejar e preparar o RED','### Ato III — Entregar e conferir o resultado','Uma **ideia**','O **backlog**','A **spec**','Um **gate**','BDD','TDD','Se a necessidade mudar']);
 for(const label of ['**Objetivo:**','**Sua participação:**','**Prova técnica:**'])assert.ok(text.split(label).length-1>=3,label);
});
