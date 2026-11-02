/** Liga o cenário de fronteiras documentais ao contrato executável em Node. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {ROOT,read,node} from './helpers.mjs';
test('BDD: Distinguir documentação oficial de documentação interna',()=>{
 const feature=read('tests/features/aplicacao_exemplo.feature');
 for(const phrase of ['Scenario: Distinguir documentação oficial de documentação interna','Then docs é apresentado como documentação oficial para usuários','And example é apresentado como aplicação interna com owner próprio'])assert.ok(feature.includes(phrase));
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const result=node('--test',['--test-reporter=tap','--test-name-pattern=documentação oficial e exemplo têm responsabilidades explícitas',join(ROOT,'tests/documentation-contracts.test.mjs')],{env});
 assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/pass 1\b/);
});
