/** Preserva cobertura mínima BDD/TDD por história, requisito e feature. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {ROOT,temporary,put,node} from '../../tests/helpers.mjs';
const validate=join(ROOT,'skills/specsfy-04-validate/scripts/validate_spec.mjs');
const trace=join(ROOT,'skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs');
function acceptance(id,covers){return `#### ${id} — Contexto ${id}\n\n**Cobre**: ${covers}\n\n\`\`\`gherkin\n${covers.split(', ').map(item=>'@'+item).join(' ')} @${id}\nFeature: Cobertura contextual\n\n  Scenario: Exemplo ${id}\n    Given um estado conhecido\n    When uma ação acontece\n    Then um resultado é observado\n\`\`\`\n`;}
function errors(t,text){const root=temporary(t),spec=put(root,'spec.md',text);return JSON.parse(node(validate,[spec,'--allow-draft','--json']).stdout).errors;}
test('história exige três cenários BDD distintos',t=>{
 const text='#### US-001 — História\n'+acceptance('AC-001','US-001, FR-001')+acceptance('AC-002','US-001, FR-001')+acceptance('AC-003','US-002, FR-001')+'- **FR-001**: Requisito.\n';
 assert.ok(errors(t,text).includes('US-001 possui 2 cenários BDD; mínimo exigido: 3.'));
});
test('cada requisito funcional e não funcional exige três cenários',t=>{
 const text='#### US-001 — História\n'+acceptance('AC-001','US-001, FR-001, NFR-001')+acceptance('AC-002','US-001, FR-001, NFR-001')+acceptance('AC-003','US-001, FR-002, NFR-002')+'- **FR-001**: Requisito.\n- **FR-002**: Requisito.\n- **NFR-001**: Qualidade. **Verificação**: teste.\n- **NFR-002**: Qualidade. **Verificação**: teste.\n';
 const result=errors(t,text);for(const id of ['FR-001','NFR-001'])assert.ok(result.includes(`${id} possui 2 cenários BDD; mínimo exigido: 3.`));
});
test('três cenários satisfazem cobertura BDD da história e requisitos',t=>{
 const covers='US-001, FR-001, NFR-001';
 const result=errors(t,'#### US-001 — História\n'+['AC-001','AC-002','AC-003'].map(id=>acceptance(id,covers)).join('')+'- **FR-001**: Requisito.\n- **NFR-001**: Qualidade. **Verificação**: teste.\n');
 assert.ok(!result.some(error=>/^(US-001|FR-001|NFR-001) possui \d+ cenários BDD/.test(error)),JSON.stringify(result));
});
function traceFixture(t,content){
 const root=temporary(t);
 const spec=put(root,'specs/specs/0001-example/spec.md','#### US-001 — Example\n#### AC-001 — Example\n#### AC-002 — Example\n#### AC-003 — Example\n- **FR-001**: Example.\n- **NFR-001**: Example. **Verificação**: teste.\n');
 put(root,'tests/example.test.mjs',content);
 const result=node(trace,[spec,root,'--json']);return {code:result.status,...JSON.parse(result.stdout)};
}
const marker=id=>`// SPECSFY: US-001 FR-001 NFR-001 ${id}\n`;
test('dois marcadores TDD deixam um caso faltante por item',t=>{
 const result=traceFixture(t,marker('AC-001')+'function first() {}\n'+marker('AC-002')+'function second() {}\n');
 assert.equal(result.code,1);for(const id of ['US-001','FR-001','NFR-001'])assert.equal(result.insufficient_cases[id],1);
});
test('três marcadores distintos satisfazem a cobertura TDD',t=>{
 const result=traceFixture(t,['AC-001','AC-002','AC-003'].map((id,index)=>marker(id)+`function case${index}() {}\n`).join(''));
 assert.equal(result.code,0,JSON.stringify(result));assert.equal(result.required_cases,3);assert.equal(result.feature_cases,3);
});
test('um marcador compartilhado conta como um caso TDD',t=>{
 const result=traceFixture(t,marker('AC-001 AC-002 AC-003')+'function first() {}\nfunction second() {}\nfunction third() {}\n');
 assert.equal(result.code,1);assert.equal(result.feature_cases,1);
});
