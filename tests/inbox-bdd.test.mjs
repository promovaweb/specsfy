/** Executa os steps da fila Inbox com o binário Node versionado. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { featureTests } from './bdd.mjs';
import { inboxFixture, processCapture, CAPTURE, CAPTURE_CONTENT, ORIGINAL } from './inbox-fixtures.mjs';
const steps = [
  ['uma captura na Inbox referenciada por uma spec com Definition Gate aprovado', ctx => Object.assign(ctx, inboxFixture(ctx.t))],
  ['uma captura na Inbox referenciada por uma spec em Draft', ctx => Object.assign(ctx, inboxFixture(ctx.t, 'draft', '| Status | Draft |\n| Definition Gate | Pending |\n'))],
  ['o CLI processa a captura indicando essa spec', ctx => { ctx.result = processCapture(ctx.root); assert.equal(ctx.result.status, 0, ctx.result.stderr); ctx.payload = JSON.parse(ctx.result.stdout); }],
  ['o CLI tenta processar a captura indicando essa spec', ctx => { ctx.result = processCapture(ctx.root); }],
  ['a captura passa para specs/inbox/processed/ com Status Processada', ctx => { assert.ok(!existsSync(join(ctx.root, 'specs/inbox', CAPTURE))); assert.equal(ctx.payload.status, 'Processada'); assert.equal(ctx.payload.to, 'specs/inbox/processed/' + CAPTURE); assert.ok(readFileSync(join(ctx.root, ctx.payload.to), 'utf8').includes('| Status | Processada |')); }],
  ['o texto original é preservado e a spec derivada fica registrada', ctx => { const source = readFileSync(join(ctx.root, ctx.payload.to), 'utf8'); for (const text of [ORIGINAL, '| Spec derivada | specs/defined/0007-avisos-de-atraso/spec.md |', '| Processada em | ']) assert.ok(source.includes(text), text); }],
  ['as referências à captura na spec apontam para o novo caminho', ctx => { const source = readFileSync(ctx.spec, 'utf8'); assert.ok(source.includes('specs/inbox/processed/' + CAPTURE)); assert.ok(!source.includes('specs/inbox/' + CAPTURE)); assert.deepEqual(ctx.payload.updated_references, ['specs/defined/0007-avisos-de-atraso/spec.md']); }],
  ['o comando recusa citando o Definition Gate', ctx => { assert.equal(ctx.result.status, 1); assert.match(ctx.result.stderr, /Definition Gate/); }],
  ['a captura continua em specs/inbox/ sem alteração', ctx => { assert.equal(readFileSync(join(ctx.root, 'specs/inbox', CAPTURE), 'utf8'), CAPTURE_CONTENT); assert.ok(!existsSync(join(ctx.root, 'specs/inbox/processed'))); }],
];
featureTests('tests/features/cli_inbox.feature', steps);
