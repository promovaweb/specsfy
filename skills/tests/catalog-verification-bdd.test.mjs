/** Liga o cenário de catálogo instalado aos contratos Node do verificador. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {ROOT,read,node} from '../../tests/helpers.mjs';
test('BDD: Validar catálogo base com especialistas instalados',()=>{
 const feature=read('skills/tests/features/verificacao_repositorio.feature');
 for(const text of ['Scenario: Validar catálogo base com especialistas instalados','Given um projeto com quatorze skills base e dois especialistas válidos','Then o catálogo completo é aceito sem enfraquecer as skills base'])assert.ok(feature.includes(text));
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const result=node('--test',['--test-reporter=tap','--test-name-pattern=verify_repo',join(ROOT,'skills/tests/lifecycle-contracts.test.mjs')],{env});
 assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/pass 3\b/);
});
