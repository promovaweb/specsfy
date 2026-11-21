/** Verifica que o CI do exemplo prepara o CLI usado pelo gate de banco. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parse} from 'yaml';
import {read} from './helpers.mjs';

test('o job do exemplo compila o Specsfy antes dos testes do Composer', () => {
  const {steps} = parse(read('.github/workflows/specsfy.yml')).jobs.example;
  const setup = steps.findIndex(step => step.uses?.startsWith('oven-sh/setup-bun@'));
  const build = steps.findIndex(step =>
    step['working-directory'] === 'cli' &&
    /^bun install --frozen-lockfile\nbun run build$/m.test(step.run ?? '')
  );
  const check = steps.findIndex(step => step.run?.includes('composer ci:check'));

  assert.ok(setup >= 0 && setup < build && build < check,
    'O runner deve instalar o Bun e compilar o CLI antes do Composer');
  assert.match(steps[check].run, /PATH="\$GITHUB_WORKSPACE\/cli\/dist:\$PATH" composer ci:check/);
});
