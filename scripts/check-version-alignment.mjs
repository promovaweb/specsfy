#!/usr/bin/env node
/** Confere VERSION e todas as projeções publicáveis sem executar os artefatos. */
import { readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Retorna divergências de versão, edição e nomes dos arquivos publicados. */
export function checkVersionAlignment(root) {
  const read = path => readFileSync(join(root, path), 'utf8');
  const json = path => JSON.parse(read(path));
  const expected = read('VERSION').trim();
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(expected)) {
    throw new Error('VERSION não contém uma versão SemVer estável');
  }
  const match = read('cli/src/version.ts').match(/export const VERSION = "([^"]+)";/);
  if (!match) throw new Error('cli/src/version.ts não declara VERSION');
  const lock = json('cli/package-lock.json');
  const ebook = json('ebook/build.json');
  const versions = {
    'cli/package.json': json('cli/package.json').version,
    'cli/package-lock.json': lock.version,
    'cli/package-lock.json#packages[empty]': lock.packages?.['']?.version,
    'cli/src/version.ts': match[1],
    'cli/bin/specsfy.build.json': json('cli/bin/specsfy.build.json').version,
    'ebook/build.json': ebook.version,
    'ebook/build.json#edition': ebook.edition,
  };
  const errors = [];
  for (const [path, actual] of Object.entries(versions)) {
    const wanted = path.endsWith('#edition') ? `v${expected}` : expected;
    if (actual !== wanted) errors.push(`${path}: ${actual} (esperado ${wanted})`);
  }
  for (const extension of ['pdf', 'epub']) {
    const file = `Specsfy-Guia-do-Usuario-v${expected}.${extension}`;
    let exists = false;
    try { exists = statSync(join(root, 'ebook', file)).isFile(); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (ebook.artifacts?.[extension]?.file !== file || !exists) {
      errors.push(`ebook/${file}: artefato atual ausente ou divergente`);
    }
  }
  return { version: expected, errors };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const result = checkVersionAlignment(root);
    if (result.errors.length) {
      console.error('Versões do Specsfy fora de sincronia:\n' + result.errors.map(error => `- ${error}`).join('\n'));
      process.exitCode = 1;
    } else console.log(`Versão única do Specsfy confirmada: ${result.version}`);
  } catch (error) {
    console.error(`erro: ${error.message}`);
    process.exitCode = 2;
  }
}
