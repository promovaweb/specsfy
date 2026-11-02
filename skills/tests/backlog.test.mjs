/** Preserva os contratos de refinamento e criação isolada de itens de backlog. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,read,temporary,put,node} from '../../tests/helpers.mjs';
const skill=read('skills/specsfy-02-backlog/SKILL.md'),template=read('skills/templates/Backlog.md');
const script=join(ROOT,'skills/specsfy-02-backlog/scripts/iniciar_backlog.mjs');
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
const defaults={title:'Painel de acompanhamento',idea:'Precisamos de um painel de acompanhamento.',problem:'A equipe não enxerga o andamento das entregas.',person:'Pessoas responsáveis pelo produto.',result:'Visualizar rapidamente o andamento das entregas.',context:'Durante o acompanhamento semanal do produto.'};
function create(root,overrides={}) {return node(script,[...Object.entries({...defaults,...overrides}).flatMap(([key,value])=>['--'+key,value]),'--root',root]);}
test('refinamento exige diálogo e campos essenciais',()=>{
  includes(skill,['## Garantir a captura mínima','problema percebido','pessoa afetada ou beneficiada','resultado ou valor esperado','contexto suficiente para distinguir a entrada','Reavalie as lacunas depois de cada resposta','Não crie nem atualize o arquivo enquanto algum item essencial']);
  includes(skill.split(/\s+/).join(' '),['lacuna real de maior impacto']);
  includes(template,['## Pessoa afetada ou beneficiada','## Contexto']);
});
test('busca duplicatas e referências antes de criar item',()=>{
  includes(skill,['## Buscar duplicatas e referências','termos derivados do pedido do usuário','`specs/backlog/*.md`','`specs/<estado>/*/spec.md`','`docs/**/*.md`','possível duplicata','confirme com o usuário']);
  includes(template,['## Referências relacionadas']);
});
test('reaproveita respostas confirmadas do MVP',()=>{
  includes(skill,['## Reaproveitar respostas confirmadas no MVP','specs/milestones/M01.md','Registros confirmados no MVP','converta a declaração em resposta normalizada','Não peça confirmação, escolha ou reformulação']);
  includes(skill.split(/\s+/).join(' ').toLowerCase(),['pergunte somente por lacuna real']);
});
test('template usa tabela de metadados',()=>{
  const lines=template.split('\n');assert.equal(lines[0],'# Backlog: {{BACKLOG_NAME}}');assert.equal(lines[2],'| Metainformação | Valor |');assert.equal(lines[3],'| --- | --- |');
  for(const field of ['ID','Status','Produto','Épico','Funcionalidade','Tipo','Prioridade','Criado em','Spec promovida']){assert.ok(template.includes(`| ${field} |`));assert.ok(!template.includes(`**${field}**:`));}
});
test('recusa problema vazio sem criar backlog',t=>{
  const root=temporary(t),result=create(root,{problem:''});
  assert.equal(result.status,1);assert.match(result.stderr,/o problema percebido não pode ficar vazio/);assert.ok(!existsSync(join(root,'specs/backlog')));
});
test('cria item numerado e mantém spec ausente',t=>{
  const root=temporary(t),result=create(root);assert.equal(result.status,0,result.stderr);
  const expected=join(root,'specs/backlog/0001-painel-de-acompanhamento.md');assert.equal(result.stdout.trim(),expected);
  const content=readFileSync(expected,'utf8');
  includes(content,['| ID | BACKLOG-0001 |','| Status | Captured |','| Produto |','| Épico |','| Funcionalidade |','| Prioridade |',defaults.problem,defaults.person,defaults.result,defaults.context,'## Comportamento esperado','## Regras de negócio','## Critérios de aceitação','## Qualidades e operação','## Dependências','## Situações de erro','## Pronto para desenvolvimento']);
  assert.ok(!existsSync(join(root,'specs/draft')));
});
test('IDs do backlog são independentes dos IDs de specs',t=>{
  const root=temporary(t);put(root,'specs/backlog/0003-anterior.md','# anterior\n');mkdirSync(join(root,'specs/specs/0099-feature'),{recursive:true});
  const result=create(root,{title:'Próxima ideia',idea:'Registrar a próxima ideia.',problem:'A ideia ainda não está preservada.',person:'Pessoa responsável pelo produto.',result:'Preservar a ideia para retomada.',context:'No planejamento do produto.'});
  assert.equal(result.status,0,result.stderr);assert.ok(existsSync(join(root,'specs/backlog/0004-proxima-ideia.md')));
});
test('template customizado tem precedência',t=>{
  const root=temporary(t);put(root,'.specsfy/templates/Backlog.md',template.replace('# Backlog:','# Template padrão:'));put(root,'.specsfy/templates/custom/Backlog.md',template.replace('# Backlog:','# Template customizado:'));
  const result=create(root,{title:'Precedência customizada',idea:'Usar um template customizado.',problem:'O template padrão não representa o projeto.',person:'Equipe do projeto.',result:'Aplicar a estrutura local.',context:'Durante a criação do backlog.'});
  assert.equal(result.status,0,result.stderr);const content=readFileSync(result.stdout.trim(),'utf8');assert.ok(content.includes('# Template customizado:'));assert.ok(!content.includes('# Template padrão:'));
});
