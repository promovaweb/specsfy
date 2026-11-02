/** Preserva as verificações dos quatro cenários de perguntas numeradas em Node. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,read} from '../../tests/helpers.mjs';
const feature=read('skills/tests/features/perguntas_numeradas.feature');
const contract=read('skills/Spec.md');
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
function scenario(name,check){test('BDD: '+name,()=>{includes(feature,['Scenario: '+name]);check();});}
scenario('Exibir uma rodada completa de perguntas',()=>{
 includes(contract,['exatamente uma pergunta numerada por rodada','Pergunta 1','pelo menos três opções numeradas','`Escrever outra resposta`','`Gere outras opções`','`Avançar`','desde a primeira rodada']);
});
scenario('Limitar uma área de conversa',()=>{
 includes(contract,['apresente uma síntese','pare o ciclo']);
 includes(contract.split(/\s+/).join(' '),['pedir explicitamente','quantas perguntas quer responder']);
});
scenario('Confirmar o destino da área depois de avançar',()=>{
 includes(contract,['encerrar definitivamente','responder depois','voltar a responder agora','Área encerrada pelo usuário','Área adiada pelo usuário']);
 includes(contract.split(/\s+/).join(' '),['não volte ao assunto','reabrir explicitamente']);
});
scenario('Classificar todas as skills pelo modo de interação',()=>{
 const questioning=['specsfy-02-backlog','specsfy-03-specify','specsfy-04-validate','specsfy-05-tasks','specsfy-06-tdd-bdd','specsfy-07-implement','specsfy-aux-rules','specsfy-interviewer','specsfy-milestone-governor','specsfy-mvp-milestone-interviewer','specsfy-roadmap-milestone-interviewer','specsfy-setup','specsfy-update-spec','specsfy-data-discovery'];
 const silent=['specsfy-01-inbox','specsfy-aux-database','specsfy-aux-stack','specsfy-documentator','specsfy-progress'];
 const names=readdirSync(join(ROOT,'skills')).filter(name=>existsSync(join(ROOT,'skills',name,'SKILL.md')));
 assert.deepEqual(names.sort(),[...questioning,...silent].sort());
 for(const name of questioning)includes(read(`skills/${name}/SKILL.md`),['Modo de interação: `perguntas`.','Contrato de perguntas numeradas']);
 for(const name of silent)includes(read(`skills/${name}/SKILL.md`),['Modo de interação: `sem perguntas`.']);
});
