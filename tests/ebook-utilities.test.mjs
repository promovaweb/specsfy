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

for (const [current, retained] of [
  [undefined, ['2.0.0', '1.10.0']],
  ['1.10.0', ['1.10.0', '1.9.0']],
]) {
  test('retém duas edições por SemVer a partir de ' + (current ?? 'a maior'), t => {
    const root = temporary(t);
    const versions = ['1.2.0', '1.9.0', '1.10.0', '2.0.0'];
    const editions = version => ['epub', 'pdf'].map(ext => `Specsfy-Guia-do-Usuario-v${version}.${ext}`);
    const extras = ['README.md', 'ebook-specsfy.pdf', 'Specsfy-Guia-do-Usuario-v01.0.0.pdf'];
    for (const file of [...versions.flatMap(editions), ...extras]) writeFileSync(join(root, file), 'fixture');

    const result = pruneEditions(root, undefined, current);
    assert.deepEqual(result.retained, retained);
    assert.equal(result.removedFiles, 4);
    assert.deepEqual(readdirSync(root).sort(), [...retained.flatMap(editions), ...extras].sort());
    assert.equal(pruneEditions(root, undefined, current).removedFiles, 0);
  });
}

test('recusa parâmetros inválidos sem remover artefatos', t => {
  const root = temporary(t);
  writeFileSync(join(root, 'Specsfy-Guia-do-Usuario-v1.0.0.pdf'), 'fixture');
  for (const keep of [0, -1, 1.5, NaN]) assert.throws(() => pruneEditions(root, keep), /inteiro/);
  assert.throws(() => pruneEditions(root, 5, 'x'), /SemVer/);
  assert.throws(() => pruneEditions(root, 2, '2.0.0'), /ausente/);
  assert.equal(readdirSync(root).length, 1);
});
