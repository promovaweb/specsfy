/** Confere execução sequencial e recusas do runner Gherkin mínimo. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFeature, executeScenario } from './bdd.mjs';
test('runner Gherkin preserva cenários e executa steps sequencialmente', async () => {
  const scenarios = parseFeature('# comentário\n@teste\nFeature: Soma\n  Descrição livre\n  Scenario: Primeiro\n    Given valor 2\n    When somar 3\n    Then total 5\n  Scenario: Segundo\n    Then total 0\n');
  assert.equal(scenarios.length, 2);
  const context = {}, definitions = [[/^valor (\d+)$/, (ctx, value) => { ctx.value = Number(value); }], [/^somar (\d+)$/, async (ctx, value) => { await Promise.resolve(); ctx.value += Number(value); }], [/^total (\d+)$/, (ctx, value) => assert.equal(ctx.value ?? 0, Number(value))]];
  await executeScenario(scenarios[0], definitions, context);
  await executeScenario(scenarios[1], definitions, {});
});
test('runner recusa steps ausentes e ambíguos', async () => {
  const scenario = { steps: ['executar'] };
  await assert.rejects(executeScenario(scenario, [], {}), /ausente/);
  await assert.rejects(executeScenario(scenario, [['executar', () => {}], [/executar/, () => {}]], {}), /ambíguo/);
});
test('runner recusa sintaxe sem suporte e cenários vazios', () => {
  for (const source of ['Feature: Exemplo\nBackground: Contexto\nGiven base', 'Feature: Exemplo\nScenario: Vazio', 'Feature: Exemplo\nScenario Outline: Dados', 'Feature: Exemplo\nScenario: Tabela\nThen resultado\n| campo | valor |', 'Then sem cenário']) assert.throws(() => parseFeature(source));
});
