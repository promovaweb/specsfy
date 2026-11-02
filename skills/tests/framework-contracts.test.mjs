/** Preserva os contratos documentais do framework e de suas perguntas em Node.js. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read } from '../../tests/helpers.mjs';

const questioning = ['specsfy-02-backlog','specsfy-03-specify','specsfy-04-validate','specsfy-05-tasks','specsfy-06-tdd-bdd','specsfy-07-implement','specsfy-aux-rules','specsfy-interviewer','specsfy-milestone-governor','specsfy-mvp-milestone-interviewer','specsfy-roadmap-milestone-interviewer','specsfy-setup','specsfy-update-spec','specsfy-data-discovery'];
const silent = ['specsfy-01-inbox','specsfy-aux-database','specsfy-aux-stack','specsfy-documentator','specsfy-progress'];
const names = readdirSync(join(ROOT, 'skills')).filter(name => existsSync(join(ROOT, 'skills', name, 'SKILL.md')));
const source = path => read('skills/' + path);
const includes = (text, terms) => { for (const term of terms) assert.ok(text.includes(term), term); };

test('todas as skills declaram seu modo de interação', () => {
  assert.deepEqual([...names].sort(), [...questioning, ...silent].sort());
  for (const name of questioning) includes(source(name + '/SKILL.md'), ['Modo de interação: `perguntas`.', 'Contrato de perguntas numeradas']);
  for (const name of silent) includes(source(name + '/SKILL.md'), ['Modo de interação: `sem perguntas`.']);
});
test('contrato central preserva opções e encerramento por área', () => {
  includes(source('Spec.md'), ['## Contrato de perguntas numeradas','exatamente uma pergunta numerada por rodada','pelo menos três opções numeradas','`Escrever outra resposta`','`Gere outras opções`','`Avançar`','desde a primeira rodada','Pergunta 1','encerrar definitivamente','responder depois','Área encerrada pelo usuário','Área adiada pelo usuário','Português do Brasil','texto completo da opção','no máximo oito perguntas por área']);
});
test('skills não mantêm o protocolo anterior de perguntas', () => {
  for (const name of questioning) for (const term of ['pelo menos três perguntas numeradas','A partir da 11ª pergunta','Antes disso, não ofereça essa saída']) assert.ok(!source(name + '/SKILL.md').includes(term), name + ': ' + term);
});
test('arquivos normativos e exemplo mantêm estrutura carregável', () => {
  includes(source('Spec.md'), ['specs/backlog/', 'specs/specs/']);
  const template = source('templates/Spec.md'), example = source('examples/Spec.md');
  includes(template, ['{{SPEC_NAME}}', '| Campo | Valor |']);
  assert.ok(!template.includes('**Formato**:'));
  assert.ok(!example.includes('{{'));
  includes(example, ['| Campo | Valor |']);
  assert.ok(!example.includes('**Formato**:'));
  assert.equal(example.split('## Ato ').length - 1, 3);
  assert.equal(example.split('\n').filter(line => /^### \d{1,2}[. ]/.test(line)).length, 18);
  includes(source('AGENTS.md'), ['<!-- specsfy:framework:start -->', '{{SPECSFY_SPEC_PATH}}']);
  includes(source('CLAUDE.md'), ['@Spec.md']);
});
test('framework aponta para contexto e setup canônicos', () => {
  const spec = source('Spec.md').replace(/\s+/g, ' ');
  includes(spec, ['PROJECT.md','.specsfy/STACK.md','.specsfy/RULES.md','.specsfy/DATABASE.md','$specsfy-setup','$specsfy-aux-database','Antes de iniciar qualquer skill do framework','não se chama recursivamente','transição automática']);
  for (const path of ['AGENTS.md', 'specsfy-setup/references/framework-instructions.md']) includes(source(path), ['Antes de iniciar qualquer skill do framework']);
});
test('todas as skills operacionais carregam setup no início e no handoff', () => {
  assert.ok(names.length > 1);
  for (const name of names.filter(name => name !== 'specsfy-setup')) includes(source(name + '/SKILL.md'), ['## Preparação obrigatória', 'Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup`', 'Em handoff automático, carregue-o de novo']);
});
test('contrato de testes deriva da stack do consumidor', () => {
  const tdd = source('specsfy-06-tdd-bdd/SKILL.md');
  includes(tdd, ['PHP', 'Pest', 'Node', 'Vitest', 'SPECSFY:', 'referência']);
  assert.ok(!tdd.includes('Cucumber.js'));
  assert.ok(!source('specsfy-05-tasks/SKILL.md').includes('[BDD]'));
  assert.ok(!source('specsfy-04-validate/scripts/verify_repo.mjs').includes('shutil.which("behave")'));
  for (const path of ['AGENTS.md','README.md']) assert.ok(!source(path).includes('behave behave'));
});

test('catálogo usa namespace explícito e não contém diretórios antigos', () => {
  const legacy = ['idea','backlog','interview','specify','validate','tasks','tdd-bdd','implement','update-spec','progress','discuss'].map(name => 'specsfy-base-' + name);
  assert.deepEqual([...names].sort(), [...questioning,...silent].sort());
  for (const name of legacy) { assert.ok(!names.includes(name)); assert.ok(!existsSync(join(ROOT,'skills',name))); }
});
test('nome no frontmatter coincide com pasta e prompt OpenAI', () => {
  for (const name of names) {
    assert.equal(/^name:\s*(.+)$/m.exec(source(name+'/SKILL.md'))?.[1]?.trim(), name);
    assert.ok(source(name+'/agents/openai.yaml').includes('$'+name),name);
  }
});
test('nomes exibidos das sete skills centrais preservam numeração', () => {
  const central=names.filter(name=>/^specsfy-0[1-7]-/.test(name)).sort();
  assert.equal(central.length,7);
  central.forEach((name,index)=>assert.ok(source(name+'/agents/openai.yaml').includes(`display_name: "Specsfy - ${String(index+1).padStart(2,'0')} - `),name));
});
test('guia de usuário explica as respostas e o encerramento de área', () => {
  const text=read('docs/user/skills/README.md').split(/\s+/).join(' ');
  includes(text,['Pergunta 1','três respostas sugeridas','Escrever outra resposta','Gere outras opções','Avançar','primeira rodada','encerrar definitivamente','responder depois','reabra']);
});
test('documentação técnica lista todos os modos de interação', () => {
  const text=read('docs/develop/skills.md');
  includes(text,['## Modos de interação',...names.map(name=>'`'+name+'`')]);
});
test('contrato e documentação usam as mesmas opções de resposta', () => {
  const terms=['Pergunta 1','Escrever outra resposta','Gere outras opções','Avançar','Área encerrada pelo usuário','Área adiada pelo usuário'];
  includes(source('Spec.md'),terms);
  includes(read('docs/develop/skills.md'),terms);
});
