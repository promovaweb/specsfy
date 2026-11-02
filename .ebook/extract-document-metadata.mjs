#!/usr/bin/env node
/** Extrai a classificação documental para o manifesto, fora do texto do ebook. */
import { readFileSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

/** Lê a tabela de dois campos situada após o heading canônico. */
export function classificationFrom(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const start = lines.indexOf('## Classificação');
  if (start < 0) return {};
  const rows = {};
  for (const line of lines.slice(start + 1)) {
    const stripped = line.trim();
    if (!stripped.startsWith('|')) {
      if (Object.keys(rows).length) break;
      continue;
    }
    const cells = stripped.replace(/^\|+|\|+$/g, '').split('|').map(cell => cell.trim());
    if (cells.length !== 2) continue;
    const [field, value] = cells;
    if (field.toLowerCase() === 'campo' || /^[-:]*$/.test(field)) continue;
    rows[field.toLowerCase()] = value;
  }
  return rows;
}

/** Exige páginas dentro da raiz e usa caminhos portáveis como chaves. */
export function extractMetadata(root, pages) {
  const extracted = {};
  for (const page of pages) {
    const key = relative(resolve(root), resolve(page));
    if (isAbsolute(key) || /^\.\.(?:[\\/]|$)/.test(key)) throw new Error(`página fora da raiz: ${page}`);
    const metadata = classificationFrom(page);
    if (Object.keys(metadata).length) extracted[key.replaceAll('\\', '/')] = Object.fromEntries(Object.entries(metadata).sort());
  }
  return Object.fromEntries(Object.entries(extracted).sort());
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values, positionals } = parseArgs({ options: { root: { type: 'string' } }, allowPositionals: true });
    if (!values.root || !positionals.length) throw new Error('uso: extract-document-metadata.mjs --root RAIZ PÁGINAS...');
    console.log(JSON.stringify(extractMetadata(values.root, positionals), null, 2));
  } catch (error) { console.error(`Erro: ${error.message}`); process.exitCode = 2; }
}
