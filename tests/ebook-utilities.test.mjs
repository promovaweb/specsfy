/** Confere extração e retenção em arquivos temporários, sem gerar PDF ou EPUB. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractMetadata } from '../.ebook/extract-document-metadata.mjs';
import { pruneEditions } from '../.ebook/prune-editions.mjs';

function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), 'specsfy-ebook-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test('extrai classificação e ignora páginas sem tabela', t => {
  const root = temporary(t);
  writeFileSync(join(root, 'guia.md'), '# Guia\n\n## Classificação\n\n| Campo | Valor |\n| --- | --- |\n| Natureza | guia |\n| Escopo | instalação |\n\n| Outra | fora |\n');
  writeFileSync(join(root, 'outro.md'), '# Outro\n');
  assert.deepEqual(extractMetadata(root, [join(root, 'guia.md'), join(root, 'outro.md')]), { 'guia.md': { escopo: 'instalação', natureza: 'guia' } });
  assert.throws(() => extractMetadata(root, [join(root, '..', 'fora.md')]), /fora da raiz/);
});

for (const protect of [undefined, '1.0.0']) {
  test('retém cinco edições com ordenação SemVer e proteção ' + protect, t => {
    const root = temporary(t);
    for (const version of ['1.0.0', '1.1.0', '1.2.0', '1.10.0', '2.0.0', '2.1.0']) {
      for (const ext of ['pdf', 'epub']) writeFileSync(join(root, `Specsfy-Guia-do-Usuario-v${version}.${ext}`), 'fixture');
    }
    writeFileSync(join(root, 'README.md'), 'preservar');
    writeFileSync(join(root, 'Specsfy-Guia-do-Usuario-v01.0.0.pdf'), 'preservar');
    const result = pruneEditions(root, 5, protect);
    assert.equal(result.retained.length, 5);
    assert.deepEqual(result.removed, [protect ? '1.1.0' : '1.0.0']);
    assert.equal(result.removedFiles, 2);
    assert.equal(readFileSync(join(root, 'README.md'), 'utf8'), 'preservar');
    assert.equal(readdirSync(root).length, 12);
    assert.equal(pruneEditions(root, 5, protect).removedFiles, 0);
  });
}

test('recusa parâmetros inválidos sem remover artefatos', t => {
  const root = temporary(t);
  writeFileSync(join(root, 'Specsfy-Guia-do-Usuario-v1.0.0.pdf'), 'fixture');
  for (const keep of [0, -1, 1.5, NaN]) assert.throws(() => pruneEditions(root, keep), /inteiro/);
  assert.throws(() => pruneEditions(root, 5, 'x'), /SemVer/);
  assert.equal(readdirSync(root).length, 1);
});
