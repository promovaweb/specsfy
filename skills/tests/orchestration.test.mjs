/** Preserva destinos de handoff, retomada e autorizações do contrato central. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,read} from '../../tests/helpers.mjs';
const base=['specsfy-01-inbox','specsfy-02-backlog','specsfy-03-specify','specsfy-04-validate','specsfy-05-tasks','specsfy-06-tdd-bdd','specsfy-07-implement','specsfy-update-spec','specsfy-progress'];
const normalize=text=>text.split(/\s+/).join(' ');
const source=path=>read('skills/'+path);
const skill=name=>source(name+'/SKILL.md');
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
test('framework define handoffs bidirecionais automáticos',()=>{
 const text=source('Spec.md');includes(text,['## Orquestração conversacional','Transição automática:','Retomada automática:','Pendência detectada:']);
 includes(normalize(text),['sem pedir confirmação','mesma conversa','não peça que a pessoa repita o comando','retorno']);
});
test('skills base aceitam carregamento por handoff',()=>{
 for(const name of base.slice(1)){
  const text=skill(name),metadata=source(name+'/agents/openai.yaml');
  includes(text.split('---')[1],['transição automática']);
  includes(text,['## Orquestrar a conversa','Transição automática:','Pendência detectada:']);
  includes(normalize(text),['Retomada automática:','carregue imediatamente a skill de destino','sem pedir confirmação','mesma conversa']);
  includes(metadata,['transições','automáticas']);
 }
});
test('handoff automático mantém autorização de ações sensíveis',()=>{
 const text=normalize(source('Spec.md'));includes(text.toLowerCase(),['não peça confirmação para o handoff']);includes(text,['autorização específica','ações destrutivas','instalação de especialista']);
});
test('referências de especialistas distinguem carregamento e instalação',()=>{
 const references=readdirSync(join(ROOT,'skills')).filter(name=>existsSync(join(ROOT,'skills',name,'references/specialists.md')));
 assert.equal(references.length,7);
 for(const name of references)includes(normalize(source(name+'/references/specialists.md')),['transição automática','mesma conversa','instal','npx skills add']);
});
test('especialista ausente exige autorização e instalação por npx',()=>{
 includes(normalize(source('Spec.md')),['autorização específica','npx skills add https://github.com/promovaweb/specsfy']);
});
test('ausência de RED reabre plano antes de TDD automático',()=>{
 includes(normalize(source('Spec.md')),['Plan Gate já estiver `Passed`']);
 includes(normalize(skill('specsfy-07-implement')),['retorne automaticamente para `$specsfy-05-tasks`']);
 includes(normalize(skill('specsfy-05-tasks')),['`Defined`, `Planned` ou `Implementing`','reabra o Ato II','chame automaticamente `$specsfy-06-tdd-bdd`']);
});
test('cadeia principal e retornos críticos nomeiam seus destinos',()=>{
 const routes={'specsfy-01-inbox':'specsfy-02-backlog','specsfy-02-backlog':'specsfy-03-specify','specsfy-03-specify':'specsfy-04-validate','specsfy-04-validate':'specsfy-05-tasks','specsfy-05-tasks':'specsfy-06-tdd-bdd','specsfy-06-tdd-bdd':'specsfy-05-tasks','specsfy-07-implement':'specsfy-progress','specsfy-update-spec':'specsfy-04-validate'};
 for(const [name,destination] of Object.entries(routes))includes(skill(name),['$'+destination]);
 for(const name of ['specsfy-07-implement','specsfy-progress'])includes(normalize(skill(name)),['carregue automaticamente `$specsfy-update-spec`']);
 for(const name of ['specsfy-02-backlog','specsfy-04-validate','specsfy-05-tasks'])includes(skill(name),['$specsfy-update-spec']);
});
test('update-spec é a entrada de mudanças tardias',()=>{
 const text=skill('specsfy-update-spec');
 includes(text.split('---')[1],['esqueceu','adicionar','remover','corrigir','mudar','spec existente']);
 includes(normalize(text),['não cria uma spec nova','não implementa','$specsfy-02-backlog','$specsfy-04-validate','$specsfy-05-tasks']);
 includes(text,['analyze_change.mjs']);
});
