/** Preserva seleção de requisitos, drafts e pendências na importação do MVP. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,temporary,put,node} from '../../tests/helpers.mjs';
const importer=join(ROOT,'skills/specsfy-mvp-milestone-interviewer/scripts/importar_mvp.mjs');
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
function run(t,text){const root=temporary(t);put(root,'MVP.md',text);const result=node(importer,['--root',root]);assert.equal(result.status,0,result.stderr);const output=JSON.parse(result.stdout);return {root,output,read:path=>readFileSync(join(root,path),'utf8')};}
function counts(root,n){
 assert.equal(readdirSync(join(root,'specs/backlog')).filter(name=>name.endsWith('.md')).length,n);
 assert.equal(readdirSync(join(root,'specs/draft')).filter(name=>existsSync(join(root,'specs/draft',name,'spec.md'))).length,n);
 assert.ok(!existsSync(join(root,'specs/inbox')));
}
test('cada tema de desenvolvimento gera uma spec Draft',t=>{
 const {root,output}=run(t,'# MVP\n\n## Cadastro\n\nProblema: dados dispersos.\n\n## Consulta\n\nResultado: consultar registros.\n');
 assert.equal(output.items.length,2);counts(root,2);
 const actual=readdirSync(join(root,'specs/draft')).map(name=>join(root,'specs/draft',name,'spec.md')).sort();
 assert.deepEqual(output.items.map(item=>join(root,item.spec)).sort(),actual);
});
test('tema completo gera backlog promovido e draft válido sem implementar',t=>{
 const {root,output,read}=run(t,'# MVP\n\n## Cadastro de clientes\n\nProblema: a equipe perde tempo procurando dados espalhados.\n\nPúblico: pessoas responsáveis pelo atendimento.\n\nResultado: o sistema deve permitir consultar os dados em um único lugar.\n\nContexto: durante o atendimento de cada cliente.\n\nMenus: menu principal com Clientes para /clientes.\n');
 assert.equal(output.items.length,1);counts(root,1);
 const item=output.items[0],backlog=read(item.backlog),spec=read(item.spec);
 includes(backlog,['## Defaults aplicados automaticamente','| Status | Promoted |',`| Spec promovida | \`${item.spec}\` |`,'menu principal com Clientes para /clientes']);
 includes(spec,['a equipe perde tempo procurando dados espalhados','pessoas responsáveis pelo atendimento','#### Menus e navegação principal','menu principal com Clientes para /clientes','| Status | Draft |','| Definition Gate | Pending |','Pendente:']);
 const milestone=read(output.milestone);includes(milestone,['## Triagem da importação']);assert.ok(!milestone.includes('a equipe perde tempo procurando dados espalhados'));assert.ok(!existsSync(join(root,'src')));
 const validation=node(join(ROOT,'skills/specsfy-04-validate/scripts/validate_spec.mjs'),[join(root,item.spec),'--allow-draft']);assert.equal(validation.status,0,validation.stdout+validation.stderr);
});
test('campos não respondidos ficam pendentes',t=>{
 const {output,read}=run(t,'## Consulta de registros\n\nA aplicação deve consultar registros.\n');
 includes(read(output.items[0].spec),['Pendente: o MVP não declara o problema percebido','Pendente: o MVP não identifica a pessoa afetada','Pendente: o MVP não declara o resultado ou valor esperado','Pendente: o MVP não declara os menus ou a navegação principal','| Definition Gate | Pending |']);
});
test('temas de contexto ficam fora do backlog e das specs',t=>{
 const {root,output,read}=run(t,'# MVP\n\n## Visão do produto\n\nUma solução simples para organizar o trabalho.\n\n## Público-alvo\n\nEquipes pequenas.\n\n## Cadastro de clientes\n\nO sistema deve permitir cadastrar clientes.\n');
 assert.equal(output.items.length,1);assert.equal(output.items[0].title,'Cadastro de clientes');counts(root,1);
 const milestone=read('specs/milestones/M01.md');for(const term of ['Uma solução simples para organizar o trabalho.','Equipes pequenas.'])assert.ok(!milestone.includes(term));
});
test('importa somente requisito de desenvolvimento do MVP misto',t=>{
 const {root,output,read}=run(t,'# MVP\n\n## Modelo de negócio\n\nAssinatura mensal para equipes comerciais.\n\n## Cadastro de clientes\n\nO sistema deve permitir criar, consultar e editar clientes.\n');
 counts(root,1);assert.equal(output.items.length,1);assert.equal(output.items[0].title,'Cadastro de clientes');includes(read(output.items[0].backlog),['Cadastro de clientes']);
 for(const term of ['Modelo de negócio','Assinatura mensal'])assert.ok(!read(output.milestone).includes(term));
});
test('MVP exclusivamente comercial não cria backlog ou specs',t=>{
 const {root,output,read}=run(t,'# MVP\n\n## Público-alvo\n\nAgências de marketing de pequeno porte.\n\n## Modelo de negócio\n\nCobrança por assinatura mensal.\n\n## Métricas de sucesso\n\nCriar uma carteira com 100 clientes ativos.\n');
 assert.deepEqual(output.items,[]);for(const path of ['specs/inbox','specs/backlog','specs/draft'])assert.ok(!existsSync(join(root,path)));
 assert.ok(!read(output.milestone).includes('Agências de marketing'));
});
