/** Confere a transição de cobertura insuficiente para completa e o mínimo documentado. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {ROOT,temporary,put,node,read} from './helpers.mjs';
const validate=join(ROOT,'skills/specsfy-04-validate/scripts/validate_spec.mjs');
const trace=join(ROOT,'skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs');
test('Definition Gate distingue três ACs de dois ACs por item',t=>{
 const root=temporary(t),covers='US-001, FR-001, NFR-001';
 const valid='#### US-001 — História\n'+['AC-001','AC-002','AC-003'].map(id=>`#### ${id} — Exemplo\n\n**Cobre**: ${covers}\n`).join('')+'- **FR-001**: Requisito.\n- **NFR-001**: Qualidade. **Verificação**: teste.\n';
 const errors=text=>JSON.parse(node(validate,[put(root,'spec.md',text),'--allow-draft','--json']).stdout).errors;
 const diagnostic='US-001 possui 2 cenários BDD; mínimo exigido: 3.';
 assert.ok(!errors(valid).includes(diagnostic));assert.ok(errors(valid.replace(covers,'US-002, FR-002')).includes(diagnostic));
});
test('terceiro marcador transforma rastreabilidade de GAPS em OK',t=>{
 const root=temporary(t),spec=put(root,'specs/specs/0001-example/spec.md','#### US-001 — Example\n#### AC-001 — Example\n#### AC-002 — Example\n#### AC-003 — Example\n- **FR-001**: Example.\n- **NFR-001**: Example. **Verificação**: teste.\n');
 const markers=n=>Array.from({length:n},(_,i)=>`// SPECSFY: US-001 FR-001 NFR-001 AC-00${i+1}\nfunction case${i}() {}\n`).join('');
 put(root,'tests/example.test.mjs',markers(2));
 const red=node(trace,[spec,root,'--json']);assert.equal(red.status,1);assert.equal(JSON.parse(red.stdout).feature_cases_missing,1);
 put(root,'tests/example.test.mjs',markers(3));const green=node(trace,[spec,root,'--json']);assert.equal(green.status,0,green.stdout+green.stderr);
});
test('template, framework e documentação publicam o mesmo mínimo',()=>{
 const template=read('skills/templates/Spec.md');for(const id of ['AC-001','AC-002','AC-003'])assert.ok(template.includes(id));
 for(const path of ['skills/Spec.md','docs/develop/context/engineering/testing.md']){const text=read(path);assert.ok(text.includes('três'));assert.ok(text.includes('SPECSFY:'));}
});
