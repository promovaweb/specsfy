/** Executa os contratos de processo que comprovam os cenários do ensaio. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFeature, runContract } from '../../tests/bdd.mjs';
import { read } from '../../tests/helpers.mjs';

const contracts = new Map([
  ['Validar evidências de uma cópia sem Git', [
    ['bdd-runners', 'projeto copiado sem .git'],
    ['github-regressions', 'raiz do projeto exportado'],
  ]],
  ['Separar TDD de regressão pós-código', [['bdd-runners', 'regressão pós-código']]],
  ['Validar as operações da interface', [['interface-contract', 'Contrato CRUD (aceita|exige)']]],
  ['Usar apenas fontes locais', [['script-robustness', 'research aceita declaração|não mascara índice inválido']]],
  ['Fechar setup com pré-condições de deploy', [['interface-contract', 'pendência de stack']]],
]);

const scenarios = parseFeature(read('skills/tests/features/ensaio_metodologia.feature'));
assert.deepEqual(scenarios.map(scenario => scenario.name), [...contracts.keys()]);
for (const { name } of scenarios) {
  test(`BDD: ${name}`, () => {
    for (const [file, pattern] of contracts.get(name)) {
      runContract(`skills/tests/${file}.test.mjs`, pattern);
    }
  });
}
