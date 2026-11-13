/** Preserva contratos do design system e a proteção das customizações do consumidor. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,read,temporary,put,node} from './helpers.mjs';
const template=read('skills/templates/DESIGNSYSTEM.MD');
const specialist=read('specialists/specsfy-specialist-design-system/SKILL.md');
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
test('template declara composições CRUD e cenários canônicos',()=>{
 includes(template,['DataGrid','DetailLists','PageHeader','Breadcrumb','seções','duas colunas','grid-cols-2','mobile','vermelho','abaixo','Cenários canônicos']);
});
test('template declara dashboard e padrões de componentes',()=>{
 includes(template,['Dashboard canônico','KPI','shadcn/ui','ReUI','Skeleton','teclado','prefers-reduced-motion']);
});
test('DataGrid cobre navegação pela linha inteira e exceções de ações',()=>{
 const asset=read('specialists/specsfy-specialist-react-ui-components/assets/components/data-display/table.tsx');
 includes(template+asset,['linha inteira','teclado','ações internas','TableRowAction','data-row-link']);includes(asset,['data-row-action','absolute inset-0','relative z-10']);
 const row=asset.slice(asset.indexOf('export function TableRow('),asset.indexOf('export function TableRowAction')),cell=asset.slice(asset.indexOf('export function TableCell'));
 includes(row,['href?: string','TableRowContext.Provider','children,','{children}']);includes(cell,['<Link','tabIndex','z-0']);
});
test('CRUD reutiliza componentes e expõe ações de linha',()=>{
 includes(template.toLowerCase(),['PageHeader','reutiliz','component','DataGrid','largura total','ID','detalhe','editar','apagar'].map(term=>term.toLowerCase()));
});
test('implementação exige revisão visual mesmo sem solicitação',()=>{
 const text=['skills/Spec.md','skills/templates/Tasks.md','skills/specsfy-07-implement/SKILL.md'].map(read).join('\n');
 includes(text,['Revisão visual obrigatória','mesmo sem pedido','bordas','espaçamentos','margens','padding','tipografia']);
});
test('formulários de criação e edição usam seções e duas colunas',()=>{
 includes(template+specialist,['seções','duas colunas','coluna de contexto','grid-cols-2','mobile']);
});
test('Laravel reutiliza breadcrumb com a equipe atual',()=>{
 includes(read('example/resources/js/layouts/app-layout.tsx'),['usePage','currentTeam','currentTeam.name','dashboard(currentTeam.slug)','AppLayoutTemplate breadcrumbs={breadcrumbsWithTeam}']);
 includes(read('example/resources/js/components/breadcrumbs.tsx'),['export function Breadcrumbs']);includes(read('example/resources/js/components/ui/breadcrumb.tsx'),['aria-label="breadcrumb"']);
});
test('especialista declara defaults e exceções com alcance',()=>{
 includes(specialist,['DESIGNSYSTEM.MD','não informa direção visual','defaults','exceções','alcance','personalidade','hierarquia']);
});
test('catálogo, instalador e template de interface estão ligados',()=>{
 includes(read('cli/src/domain/installer.ts'),['"DESIGNSYSTEM.MD"']);includes(read('skills/templates/Interface.md'),['DESIGNSYSTEM.MD','Padrão de dashboard','ReUI']);
 const entries=new Map(JSON.parse(read('specialists/catalog.json')).skills.map(entry=>[entry.name,entry]));assert.ok(entries.has('specsfy-specialist-design-system'));
 for(const name of ['specsfy-specialist-interface-experience','specsfy-specialist-ui-design','specsfy-specialist-ux-design','specsfy-specialist-react-ui-components'])assert.ok(entries.get(name)?.requires?.includes('specsfy-specialist-design-system'),name);
});
test('setup cria o design system e preserva conteúdo local',t=>{
 const root=temporary(t);for(const name of ['Project.md','Stack.md','Rules.md','Database.md','Interface.md','DESIGNSYSTEM.MD'])put(root,'.specsfy/templates/'+name,read('skills/templates/'+name));
 const script=join(ROOT,'skills/specsfy-setup/scripts/setup_context.mjs');
 const first=node(script,['--project',root]);assert.equal(first.status,0,first.stderr);assert.equal(readFileSync(join(root,'DESIGNSYSTEM.MD'),'utf8'),template.trimEnd()+'\n');
 const local='# Direção local\n\nEste conteúdo pertence ao produto.\n';put(root,'DESIGNSYSTEM.MD',local);
 const second=node(script,['--project',root]);assert.equal(second.status,0,second.stderr);assert.equal(readFileSync(join(root,'DESIGNSYSTEM.MD'),'utf8'),local);
});
