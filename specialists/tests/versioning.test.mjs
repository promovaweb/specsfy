/** Exercita o especialista SemVer em arquivos de projetos temporários. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,temporary,put,node} from '../../tests/helpers.mjs';
const script=join(ROOT,'specialists/specsfy-specialist-versioning/scripts/semver.mjs');
const run=(project,...args)=>node(script,[...args,'--project',project]);
test('inicializa e consulta SEMVER na raiz',t=>{
 const root=temporary(t),initialized=run(root,'init','--initial','1.2.3'),current=run(root,'current');
 assert.equal(initialized.status,0,initialized.stderr);assert.equal(readFileSync(join(root,'SEMVER'),'utf8'),'1.2.3\n');assert.equal(current.stdout.trim(),'1.2.3');
});
test('incrementa patch, minor e major em sequência',t=>{
 const root=temporary(t);put(root,'SEMVER','1.2.3\n');
 for(const [level,expected] of [['patch','1.2.4'],['minor','1.3.0'],['major','2.0.0']]){const result=run(root,'bump',level);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout.trim(),expected);}
 assert.equal(readFileSync(join(root,'SEMVER'),'utf8'),'2.0.0\n');
});
test('recusa versão inválida sem alterar arquivo',t=>{
 const root=temporary(t);put(root,'SEMVER','latest\n');assert.notEqual(run(root,'bump','patch').status,0);assert.equal(readFileSync(join(root,'SEMVER'),'utf8'),'latest\n');
});
test('verifica a versão esperada',t=>{
 const root=temporary(t);put(root,'SEMVER','3.4.5\n');const accepted=run(root,'verify','3.4.5');assert.equal(accepted.status,0,accepted.stderr);assert.notEqual(run(root,'verify','3.4.4').status,0);
});
test('gera tag Docker com a versão canônica e porta do registry',t=>{
 const root=temporary(t);put(root,'SEMVER','3.4.5\n');const result=run(root,'docker-tag','registry.example:5000/equipe/app');assert.equal(result.status,0,result.stderr);assert.equal(result.stdout.trim(),'registry.example:5000/equipe/app:3.4.5');
});
test('recusa tag Docker divergente do SEMVER',t=>{
 const root=temporary(t);put(root,'SEMVER','3.4.5\n');const accepted=run(root,'verify-docker-tag','registry.example:5000/equipe/app:3.4.5');assert.equal(accepted.status,0,accepted.stderr);assert.notEqual(run(root,'verify-docker-tag','registry.example:5000/equipe/app:latest').status,0);
});
