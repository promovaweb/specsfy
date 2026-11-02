/** Preserva a orquestração e a sequência documental pública durante a migração Node. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,read} from './helpers.mjs';
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
const normalize=text=>text.split(/\s+/).join(' ');
const skill=name=>read(`skills/${name}/SKILL.md`);

test('contrato e guias publicam a mesma política de handoff',()=>{
  includes(read('skills/Spec.md'),['## Orquestração conversacional']);
  includes(read('skills/README.md'),['## Orquestração conversacional']);
  includes(read('docs/user/README.md'),['## Conversa contínua entre etapas']);
  includes(read('docs/develop/context/flows/README.md'),['avanço','retorno','retomada','automaticamente','mesma conversa']);
});
test('skills base aplicam transição e retomada na mesma conversa',()=>{
  for(const name of ['specsfy-02-backlog','specsfy-03-specify','specsfy-04-validate','specsfy-05-tasks','specsfy-06-tdd-bdd','specsfy-07-implement','specsfy-update-spec','specsfy-progress']){
    const content=skill(name);includes(content,['## Orquestrar a conversa','Transição automática:','Pendência detectada:']);
    includes(normalize(content),['Retomada automática:','sem pedir confirmação','carregue imediatamente a skill de destino','mesma conversa']);
  }
});
test('mudança tardia usa uma entrada pública e executável',()=>{
  for(const text of [skill('specsfy-07-implement'),read('docs/user/advanced-usage.md'),read('specsfy/README.md')])includes(text,['$specsfy-update-spec']);
  includes(skill('specsfy-update-spec'),['esqueceu','reabr']);
});
test('ciclo do backlog é consistente com os guias públicos',()=>{
  for(const path of ['skills/Spec.md','skills/specsfy-02-backlog/SKILL.md','docs/user/skills/specsfy-02-backlog.md','docs/user/method.md']){
    const text=normalize(read(path)).toLowerCase();
    includes(text,['no máximo oito perguntas por área','`avançar`','encerr']);
    assert.ok(text.includes('exatamente uma pergunta numerada')||text.includes('uma pergunta numerada por rodada'),path);
    assert.ok(text.includes('responder depois')||text.includes('responde depois'),path);
  }
  includes(normalize(skill('specsfy-02-backlog')),['contexto acumulado e as novas respostas','Área encerrada pelo usuário','Área adiada pelo usuário','Definition Gate: Pending']);
});

const pedagogicalOrder = JSON.parse(read('tests/fixtures/pedagogical-order.json'));
const readingOrder=()=>read('docs/user/reading-order.txt').split(/\r?\n/).filter(line=>line&&!line.startsWith('#'));
function pages(directory,prefix='docs/user'){
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?pages(join(directory,entry.name),prefix+'/'+entry.name):entry.name.endsWith('.md')?[prefix+'/'+entry.name]:[]);
}
test('ordem de leitura cobre cada página e preserva o percurso pedagógico',()=>{
  assert.deepEqual(readingOrder(),pedagogicalOrder);
  assert.deepEqual(pages(join(ROOT,'docs/user')).sort(),[...new Set(readingOrder())].sort());
});
test('portal ensina a mesma sequência e oferece os links',()=>{
  const text=read('docs/user/README.md');
  const stages=['## Percurso pedagógico','### 1. Entenda a metodologia','### 2. Instale o Specsfy','### 3. Faça a primeira entrega','### 4. Aprofunde o fluxo base','### 5. Opere o projeto no dia a dia','### 6. Avance quando precisar'];
  const positions=stages.map(stage=>{assert.ok(text.includes(stage),stage);return text.indexOf(stage);});
  assert.deepEqual(positions,[...positions].sort((a,b)=>a-b));
  for(const path of readingOrder().slice(1))assert.ok(text.includes(']('+path.replace('docs/user/','')+')'),path);
});
test('ebook consome ordem mantida pelo guia de usuário',()=>{
  includes(read('.ebook/build-ebook.sh'),['ORDER_FILE="$DOCS_ROOT/reading-order.txt"']);
  includes(read('Makefile'),['docs/user/reading-order.txt']);
  includes(read('ebook/README.md'),['../docs/user/reading-order.txt']);
});
test('documentador está instalado e recebe handoff após implementação',()=>{
  includes(read('cli/src/installer.ts'),['"specsfy-documentator"']);
  includes(skill('specsfy-07-implement'),['$specsfy-documentator','Depois de cada tarefa']);
  includes(read('skills/Spec.md'),['$specsfy-documentator']);
});
test('documentador publica contrato de reconstrução completa',()=>{
  const builder=read('skills/specsfy-documentator/scripts/build_documentation.mjs');
  const source=skill('specsfy-documentator');
  includes(source+builder+read('docs/user/system-documentation.md'),['arquitetura','banco','fluxos','testes','React','Tailwind','pacotes','GitHub']);
  includes(builder,['flowchart','classDiagram','erDiagram','sequenceDiagram']);includes(source,['--check']);
});
test('monitor exige documentação para mudanças de aplicação ou banco',()=>{
  includes(read('skills/specsfy-setup/scripts/monitor_context.mjs'),['documentation_review_required','specsfy-documentator','"docs/"']);
});

test('documentação oficial e exemplo têm responsabilidades explícitas',()=>{
 const sources={workspace:'README.md',project:'docs/develop/context/project.md',architecture:'docs/develop/context/architecture/README.md',modules:'docs/develop/context/architecture/modules.md',dependencies:'docs/develop/context/architecture/dependencies.md',stack:'docs/develop/context/engineering/stack.md',testing:'docs/develop/context/engineering/testing.md',persistence:'docs/develop/context/data/persistence.md'};
 const texts=Object.fromEntries(Object.entries(sources).map(([name,path])=>[name,read(path).toLowerCase()]));
 includes(texts.workspace,['example/']);includes(texts.project,['documentação oficial','usuários']);
 for(const name of ['architecture','modules','dependencies','stack','testing','persistence'])includes(texts[name],['example/']);
 includes(texts.architecture,['aplicação interna']);
});
test('toda alteração exige documentação na mesma entrega',()=>{
 for(const path of ['AGENTS.md','docs/develop/context/engineering/conventions.md'])includes(read(path).toLowerCase(),['toda criação ou alteração','mesma entrega','documentação']);
});
