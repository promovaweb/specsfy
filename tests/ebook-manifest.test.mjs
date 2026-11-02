/** Testa adulterações do manifesto e dos aliases sem regenerar os documentos. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyManifest } from '../.ebook/verify-artifacts.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'specsfy-manifest-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const payload = { version: '1.2.3', edition: 'v1.2.3', source_sha256: 'a'.repeat(64), artifacts: {} };
  const options = { version: payload.version, sourceSha: payload.source_sha256, manifest: join(root, 'build.json') };
  for (const kind of ['pdf', 'epub']) {
    const file = `Specsfy-Guia-do-Usuario-v1.2.3.${kind}`;
    options[kind] = join(root, file);
    writeFileSync(options[kind], kind);
    writeFileSync(join(root, `ebook-specsfy.${kind}`), kind);
    payload.artifacts[kind] = { file, sha256: createHash('sha256').update(kind).digest('hex') };
  }
  writeFileSync(options.manifest, JSON.stringify(payload));
  return { root, options, payload };
}

test('aceita versão, fontes, hashes e aliases coerentes', t => {
  assert.doesNotThrow(() => verifyManifest(fixture(t).options));
});
for (const key of ['version', 'edition', 'source_sha256']) {
  test('recusa divergência no campo ' + key, t => {
    const { options, payload } = fixture(t);
    payload[key] = 'divergente';
    writeFileSync(options.manifest, JSON.stringify(payload));
    assert.throws(() => verifyManifest(options), /desatualizado/);
  });
}
for (const kind of ['pdf', 'epub']) {
  test('recusa conteúdo alterado de ' + kind, t => {
    const { options } = fixture(t);
    writeFileSync(options[kind], 'alterado');
    assert.throws(() => verifyManifest(options), /hash/);
  });
  test('recusa alias diferente de ' + kind, t => {
    const { root, options } = fixture(t);
    writeFileSync(join(root, `ebook-specsfy.${kind}`), 'alterado');
    assert.throws(() => verifyManifest(options), /não corresponde/);
  });
}
