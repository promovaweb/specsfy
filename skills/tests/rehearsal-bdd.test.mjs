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
  ['Preservar predecessores TDD de planos legados', [['bdd-runners', 'plano aprovado sem tag TDD']]],
  ['Contar os mínimos por aceite principal', [['bdd-runners', 'mínimos TDD contam']]],
  ['Validar as operações da interface', [['interface-contract', 'Contrato CRUD (aceita|exige|vincula)']]],
  ['Usar apenas fontes locais', [['script-robustness', 'research aceita declaração|não mascara índice inválido|research rejeita cada claim']]],
  ['Fechar setup com pré-condições de deploy', [['interface-contract', 'pendência de stack']]],
  ['Distinguir baseline de lista vazia conhecida', [['github-regressions', 'lista explicitamente vazia']]],
  ['Compartilhar declarações entre spec e findings', [['github-regressions', 'mesmas declarações']]],
  ['Mapear o menu na seção de navegação', [['interface-contract', 'mapeamento do menu exige rótulo']]],
  ['Planejar provas de aceite que dependem da migration', [
    ['framework-contracts', 'provas de aceite que dependem da migration'],
  ]],
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
