/** Preserva os contratos de adoção dos logos e tokens canônicos sem alterar o design. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {join,relative,dirname} from 'node:path';
import {ROOT,read} from './helpers.mjs';
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
const removed=['mark.svg','favicon.svg','logo/logo.md'];
test('READMEs rastreados adotam logo canônico com fallback PNG',()=>{
// cli/docs/ e cli/template/ são documentação embutida no binário e stubs do Termfy, sem logo; os READMEs publicados do cli usam a URL pública do ícone.
 const files=execFileSync('git',['ls-files','-z'],{cwd:ROOT,encoding:'utf8'}).split('\0').filter(path=>(path.endsWith('/README.md')||path==='README.md')&&!/^cli\/(\.agents\/skills\/termfy|docs\/|template\/)/.test(path));assert.ok(files.length);
 for(const path of files){const text=read(path);if(path==='cli/README.md'||path==='cli/npm/README.md'){includes(text,['srcset="https://promovaweb.com/opensource/specsfy/icon.svg"','src="https://promovaweb.com/opensource/specsfy/icon.png"']);continue;}
 const logo=relative(dirname(join(ROOT,path)),join(ROOT,'brand/logo')).replaceAll('\\','/');includes(text,[`<source srcset="${logo}/icon.svg" type="image/svg+xml">`,`<img src="${logo}/icon.png" alt="Logo do Specsfy" width="128">`]);for(const asset of removed)assert.ok(!text.includes(asset),path+': '+asset);
 }
});
test('marca mantém vetor acessível e PNG de 512x512',()=>{
 const svg=read('brand/logo/icon.svg');
 const xpath=expression=>execFileSync('xmllint',['--nonet','--xpath',expression,'-'],{input:svg,encoding:'utf8'}).trim();
 for(const [field,expected] of Object.entries({width:'512',height:'512',viewBox:'0 0 512 512',role:'img'}))assert.equal(xpath(`string(/*/@${field})`),expected);
 assert.equal(xpath('string(/*/*[local-name()="title"])'),'Ícone principal do Specsfy');includes(xpath('string(/*/*[local-name()="desc"])'),['Camadas de especificação e código']);includes(svg,['#00161E','#A866FF','#2AD5BE','#C4B5FD']);
 const png=readFileSync(join(ROOT,'brand/logo/icon.png'));assert.deepEqual(png.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));assert.equal(png.readUInt32BE(16),512);assert.equal(png.readUInt32BE(20),512);
 for(const ext of ['svg','png'])assert.ok(!existsSync(join(ROOT,'brand/icons/icon.'+ext)));
});
test('manual e fontes de marca descrevem identidade canônica',()=>{
 includes(read('brand/logo/LOGO.md'),['# Sistema de logo do Specsfy','## Variantes','## Proteção e tamanho','## Restrições','512','três camadas','código','`icon.svg`','`icon.png`','28 px','12,5%','petróleo','violeta']);
 for(const path of ['README.md','guidelines.md','checklist.md','guide/brand-guide.md','style-guide.html','icons/icons.md']){const text=read('brand/'+path);includes(text.toLowerCase(),['camadas']);assert.ok(['icon.svg','logo-light.svg','brand/logo/'].some(term=>text.includes(term)),path);for(const asset of removed)assert.ok(!text.includes(asset),path+': '+asset);}
});
test('paleta e tokens seguem as cores canônicas',()=>{
 const palette=read('brand/colors/palette.md');includes(palette,['#00161E','#FFFFFF','petróleo','logo']);includes(read('brand/colors/tokens.css'),['@import "../global.css"']);const tokens=JSON.parse(read('brand/colors/tokens.json'));assert.equal(tokens.families.primary['950'],'#00161E');assert.equal(tokens.light.background,'#FFFFFF');
 for(const color of ['Midnight Mirage','Nuit Blanche','Picture Book Green','Mantis','First Colors of Spring','Praxeti White'])assert.ok(!palette.includes(color));
});
test('build do manual rastreia fontes atuais do logo',()=>{
 assert.ok(existsSync(join(ROOT,'brand/Specsfy-Manual-de-Marca.pdf')));assert.ok(!existsSync(join(ROOT,'brand/guide/Specsfy-Manual-de-Marca.pdf')));
 includes(read('.pdf/build-brand-guide.sh'),['OUT_PDF="$BRAND_ROOT/Specsfy-Manual-de-Marca.pdf"','$BRAND_ROOT/logo/LOGO.md','$BRAND_ROOT/logo/icon.svg','$BRAND_ROOT/logo/icon.png']);
 includes(read('Makefile'),['brand/logo/LOGO.md','brand/logo/icon.svg','brand/logo/icon.png','brand/guide/brand-guide.md','brand/guide/template.html','brand/style-guide.html','.pdf/build-brand-guide.sh','.pdf/style.css']);includes(read('README.md'),['make brand-guide']);includes(read('.pdf/style.css'),['@page','--brand-black: #00161E','--brand-white: #F2F8F9','Manrope','JetBrains Mono']);
});
