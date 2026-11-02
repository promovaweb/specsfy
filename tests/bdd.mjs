/** Executa os cenários Gherkin simples do repositório com steps explícitos em Node. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, read, node } from './helpers.mjs';

/** Aceita Scenario e steps sem tabelas; sintaxe adicional precisa de suporte explícito. */
export function parseFeature(source) {
  const scenarios = [];
  let current, feature = false;
  for (const [index, raw] of source.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('@')) continue;
    if (/^(Feature|Funcionalidade):\s*\S/.test(line)) { feature = true; continue; }
    const scenario = line.match(/^(?:Scenario|Cenário):\s*(.+)$/);
    if (scenario) { current = { name: scenario[1], steps: [] }; scenarios.push(current); continue; }
    const step = line.match(/^(?:Given|When|Then|And|But|Dado|Dada|Dados|Dadas|Quando|Então|E|Mas)\s+(.+)$/);
    if (step) {
      if (!current) throw new Error(`Step fora de cenário na linha ${index + 1}.`);
      current.steps.push(step[1]); continue;
    }
    if (current || /^(?:Background|Scenario Outline|Examples|Contexto|Esquema do Cenário|Exemplos):/.test(line)) throw new Error(`Sintaxe Gherkin sem suporte na linha ${index + 1}: ${line}`);
  }
  if (!feature || !scenarios.length || scenarios.some(scenario => !scenario.steps.length)) throw new Error('Feature precisa declarar cenários com steps.');
  return scenarios;
}

/** Recusa steps ausentes ou ambíguos e mantém um contexto próprio por cenário. */
export async function executeScenario(scenario, definitions, context) {
  for (const step of scenario.steps) {
    const matches = definitions.flatMap(([pattern, action]) => {
      if (typeof pattern === 'string') return pattern === step ? [{ action, args: [] }] : [];
      const match = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, '')).exec(step);
      return match ? [{ action, args: match.slice(1) }] : [];
    });
    assert.equal(matches.length, 1, `Step ${matches.length ? 'ambíguo' : 'ausente'}: ${step}`);
    await matches[0].action(context, ...matches[0].args);
  }
}

/** Registra cada cenário como um teste Node e vincula seus steps ao contexto. */
export function featureTests(path, definitions) {
  for (const scenario of parseFeature(read(path))) test(`BDD: ${scenario.name}`, async t => {
    await executeScenario(scenario, definitions, { t });
  });
}

/** Reutiliza contratos de terminal e processos, exigindo ao menos um teste executado. */
export function runContract(path, pattern) {
  const env = { ...process.env }; delete env.NODE_TEST_CONTEXT;
  const result = node('--test', ['--test-reporter=tap', '--test-name-pattern=' + pattern, join(ROOT, path)], { env });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /# pass [1-9]\d*\b/, 'O filtro precisa executar algum contrato.');
}
