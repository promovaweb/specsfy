/** Preserva topologia, classificação, alcance e ownership dos contextos técnicos. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readdirSync,readFileSync,statSync,lstatSync,realpathSync} from 'node:fs';
import {join,resolve,dirname,relative} from 'node:path';
import {ROOT,read} from './helpers.mjs';
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
function files(directory,suffix='.md',skip=new Set()) {return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>skip.has(entry.name)?[]:entry.isDirectory()?files(join(directory,entry.name),suffix,skip):entry.name.endsWith(suffix)?[join(directory,entry.name)]:[]);}
const docs=files(join(ROOT,'docs'));
const fixture=JSON.parse(read('tests/fixtures/context-contract.json'));
const text=path=>readFileSync(path,'utf8');
function links(path){return [...text(path).matchAll(/\[[^\]]+\]\((?!https?:\/\/|mailto:)([^)]+)\)/g)].map(m=>{const [target,anchor='']=m[1].trim().replace(/^<|>$/g,'').split('#');return {path:target?resolve(dirname(path),target):path,anchor};});}
function anchors(path){return new Set([...text(path).matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].map(m=>m[1].toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu,'').replace(/[\s-]+/g,'-').replace(/^-|-$/g,'')));}
test('árvore mínima existe sem folhas preventivas',()=>{
 for(const path of fixture.minimum)assert.ok(docs.includes(join(ROOT,path)),path);
 for(const path of ['architecture/integrations.md','data/migrations.md'])assert.ok(!existsSync(join(ROOT,'docs/develop/context',path)));
});
test('contextos declaram classificação, finalidade e conteúdo específico',()=>{
 for(const path of [...files(join(ROOT,'docs/develop/context')),...files(join(ROOT,'docs/develop/decisions'))]){
 const content=text(path);assert.match(content,/^# .+/);includes(content,['## Classificação','## Papel','## Como usar','## Atualize quando','## Não use para','## Fonte da verdade e precedência']);
 const classification={};for(const field of ['Natureza','Escopo','Autoridade']){const match=content.match(new RegExp('^\\|\\s*'+field+'\\s*\\|\\s*([^|]+?)\\s*\\|$','m'));assert.ok(match,path+': '+field);classification[field]=match[1].trim();assert.ok(classification[field]);}
 assert.ok(['índice','normativo','descritivo','histórico'].includes(classification.Natureza.toLowerCase()));includes(content,fixture.headings[relative(ROOT,path).replaceAll('\\','/')]??[]);
 }
});
test('todos os documentos são alcançáveis a partir do portal',()=>{
 const reached=new Set(),queue=[join(ROOT,'docs/README.md')];while(queue.length){const path=queue.shift();if(reached.has(path)||!existsSync(path)||!path.endsWith('.md'))continue;reached.add(path);for(const link of links(path))if(link.path.startsWith(join(ROOT,'docs')+'/')&&existsSync(link.path)&&statSync(link.path).isFile())queue.push(link.path);}
 assert.deepEqual([...reached].sort(),[...docs].sort());
});
test('links locais resolvem arquivos e âncoras dos contextos',()=>{
 for(const path of docs)for(const link of links(path)){assert.ok(existsSync(link.path),relative(ROOT,path)+' -> '+link.path);if(link.anchor){assert.ok(statSync(link.path).isFile());assert.ok(anchors(link.path).has(link.anchor),relative(ROOT,path)+' -> '+link.anchor);}}
});
test('índices hierárquicos encaminham para folhas exatas',()=>{
 const router=read('docs/develop/context/README.md');for(const domain of ['architecture','engineering','data']){includes(router,[`](${domain}/README.md)`]);includes(read(`docs/develop/context/${domain}/README.md`),['Leia quando','Atualize quando']);}
 assert.deepEqual([...router.matchAll(/\]\(((?:architecture|engineering|data)\/(?!README\.md)[^)]+\.md)\)/g)],[]);
});
test('rotas de agentes são exatas e README apresenta o projeto',()=>{
 const agents=read('AGENTS.md'),readme=read('README.md');includes(agents,['docs/develop/context/README.md']);includes(readme,['docs/README.md']);assert.ok(!/`docs\/develop\/context\/(?:architecture|engineering|data)\/`/.test(agents));includes(readme.toLowerCase(),['apresentação']);
 const project=read('docs/develop/context/project.md');includes(project,['## Limites normativos']);assert.ok(!project.includes('## Capacidades'));
});
test('portal docs encaminha públicos sem instruções operacionais',()=>{
 includes(read('docs/README.md'),['](user/README.md)','](develop/README.md)']);assert.ok(!read('docs/README.md').includes('## Roteamento por tipo de alteração'));includes(read('docs/develop/context/README.md'),['## Roteamento por tipo de alteração']);
});
test('documentos respeitam limite rígido e justificam extensão',()=>{
 for(const path of docs){const content=text(path),lines=content.trimEnd().split(/\r?\n/).length;assert.ok(lines<=400,relative(ROOT,path)+': '+lines);if(lines>250)includes(content,['## Justificativa de tamanho']);}
});
test('contextos não contêm marcadores editoriais pendentes',()=>{
 for(const path of docs)for(const marker of ['TO'+'DO','T'+'BD','[preencher]','Última atualização'])assert.ok(!text(path).includes(marker),relative(ROOT,path)+': '+marker);
});
test('ADRs aparecem no índice de decisões',()=>{
 const index=read('docs/develop/decisions/README.md');for(const name of readdirSync(join(ROOT,'docs/develop/decisions')).filter(name=>/^ADR-.*\.md$/.test(name)))includes(index,[name]);
});
test('contextos apontam para fontes executáveis',()=>{
 includes(read('docs/develop/context/engineering/packages.md').toLowerCase(),['manifests e lockfiles']);includes(read('docs/develop/context/data/persistence.md').toLowerCase(),['schemas e migrations']);includes(read('docs/develop/context/flows/README.md'),['specs/<estado>/<NNNN>-<slug>/spec.md']);
});
test('módulos mantêm responsabilidades e exclusões na raiz',()=>{
 const entries={'README.md':['monorepo','módulos'],'brand/README.md':['marca','fonte normativa'],'skills/README.md':['metodologia executável','skills'],'specialists/README.md':['catálogo oficial','opcionais'],'cli/README.md':['cli e tui','progresso'],'docs/README.md':['documentação','usuário','develop'],'specsfy/README.md':['porta de entrada','usuário final']};for(const [path,terms] of Object.entries(entries))includes(read(path).toLowerCase(),terms);
 includes(read('AGENTS.md').toLowerCase(),['fronteiras git','skills/agents.md']);includes(read('specsfy/README.md'),['../docs/','../skills/','../brand/']);includes(read('skills/README.md'),['specsfy-02-backlog']);includes(read('docs/README.md'),['user/README.md','develop/README.md']);
 includes(read('docs/develop/context/architecture/modules.md'),['promovaweb/specsfy','brand/','skills/','docs/','example/','specsfy/','specialists/','cli/']);includes(read('docs/develop/context/architecture/dependencies.md'),['https://github.com/promovaweb/specsfy']);
 const ignores=new Set(read('.gitignore').split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!line.startsWith('#')));
 for(const name of ['brand','skills','docs','specsfy','specialists','cli']){assert.ok(!ignores.has('/'+name+'/'));assert.ok(!existsSync(join(ROOT,name,'.git')));}
 const skip=new Set(['.venv','dist','node_modules','vendor']);for(const name of ['brand','cli','docs','example','skills','specialists','specsfy'])assert.deepEqual(files(join(ROOT,name),'.gitignore',skip),[]);
 for(const pattern of ['/brand/guide/build/','/cli/.venv/','/cli/dist/','/example/vendor/','/example/node_modules/','/example/storage/logs/*'])assert.ok(ignores.has(pattern),pattern);
 for(const path of ['.gitmodules','specs'])assert.ok(!existsSync(join(ROOT,path)));
 assert.ok(statSync(join(ROOT,'skills')).isDirectory());
});
test('raiz mantém somente sua skill operacional local',()=>{
 assert.deepEqual(readdirSync(join(ROOT,'.agents/skills')),['specsfy-monorepo-documentator']);
 const source=join(ROOT,'.agents/skills/specsfy-monorepo-documentator'),link=join(ROOT,'.claude/skills/specsfy-monorepo-documentator');assert.ok(existsSync(join(source,'SKILL.md')));assert.ok(lstatSync(link).isSymbolicLink());assert.equal(realpathSync(link),realpathSync(source));
 // Fixtures de testes podem executar scripts das skills; instruções e workflows não operam o checkout como consumidor.
 for(const path of ['AGENTS.md','README.md',...files(join(ROOT,'.github/workflows'),'.yml').map(path=>relative(ROOT,path))])assert.ok(!/skills\/specsfy-(?!monorepo-documentator)[^/\s]+\/scripts\//.test(read(path)),path);
});
