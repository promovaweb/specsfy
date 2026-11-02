/** Liga os três cenários BDD existentes às reproduções executáveis em Node.js. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {ROOT,read,node} from '../../tests/helpers.mjs';
const feature=read('skills/tests/features/cobertura_minima_spec.feature');
const scenarios=[
 ['Rejeitar definição com menos de três cenários por história','história exige três cenários BDD distintos'],
 ['Rejeitar definição com menos de três cenários por requisito','cada requisito funcional e não funcional exige três cenários'],
 ['Rejeitar entrega com menos de três casos TDD rastreáveis','dois marcadores TDD|um marcador compartilhado'],
];
for(const [scenario,pattern] of scenarios)test('BDD: '+scenario,()=>{
 assert.ok(feature.includes('Scenario: '+scenario),'Cenário Gherkin ausente');
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const result=node('--test',['--test-reporter=tap','--test-name-pattern='+pattern,join(ROOT,'skills/tests/minimum-coverage.test.mjs')],{env});
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/pass [1-9]/);
});
