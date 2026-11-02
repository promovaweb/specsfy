/** Verifica projeções de versão isoladas, incluindo divergências e arquivos ausentes. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { checkVersionAlignment } from '../scripts/check-version-alignment.mjs';

/** Cria um pacote publicável mínimo com todas as projeções da versão. */
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'specsfy-version-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (path, content) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof content === 'string' ? content : JSON.stringify(content));
  };
  put('VERSION', '1.2.3\n');
  put('cli/src/version.ts', 'export const VERSION = "1.2.3";\n');
  put('cli/package.json', { version: '1.2.3' });
  put('cli/package-lock.json', { version: '1.2.3', packages: { '': { version: '1.2.3' } } });
  put('cli/bin/specsfy.build.json', { version: '1.2.3' });
  const artifacts = {};
  for (const extension of ['pdf', 'epub']) {
    const file = `Specsfy-Guia-do-Usuario-v1.2.3.${extension}`;
    artifacts[extension] = { file };
    put('ebook/' + file, 'fixture');
  }
  put('ebook/build.json', { version: '1.2.3', edition: 'v1.2.3', artifacts });
  return { root, put };
}

test('aceita projeções alinhadas', t => {
  assert.deepEqual(checkVersionAlignment(fixture(t).root), { version: '1.2.3', errors: [] });
});
for (const path of ['cli/package.json', 'cli/package-lock.json', 'cli/bin/specsfy.build.json', 'ebook/build.json']) {
  test('recusa projeção divergente: ' + path, t => {
    const { root, put } = fixture(t);
    put(path, { version: '1.2.2' });
    assert.ok(checkVersionAlignment(root).errors.some(error => error.startsWith(path + ':')));
  });
}
test('recusa versão da raiz inválida', t => {
  const { root, put } = fixture(t);
  put('VERSION', '01.2.3');
  assert.throws(() => checkVersionAlignment(root), /SemVer/);
});
test('recusa fonte TypeScript sem declaração', t => {
  const { root, put } = fixture(t);
  put('cli/src/version.ts', '');
  assert.throws(() => checkVersionAlignment(root), /não declara VERSION/);
});
test('recusa arquivo de ebook ausente', t => {
  const { root } = fixture(t);
  rmSync(join(root, 'ebook/Specsfy-Guia-do-Usuario-v1.2.3.pdf'));
  assert.ok(checkVersionAlignment(root).errors.some(error => error.includes('pdf: artefato atual ausente')));
});
