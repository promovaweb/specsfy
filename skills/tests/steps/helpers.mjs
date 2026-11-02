/** Compartilha fixtures descartáveis e processos reais entre os steps das skills. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, temporary, put, node } from '../../../tests/helpers.mjs';
export { ROOT, read, temporary, put, node, join, existsSync, readdirSync, assert };
export const text = (root, path) => readFileSync(join(root, path), 'utf8');
export const includes = (source, terms) => terms.forEach(term => assert.ok(source.includes(term), term));
export const success = result => assert.equal(result.status, 0, result.stdout + result.stderr);
export const normalized = source => source.split(/\s+/).join(' ');
export const skill = name => read(`skills/${name}/SKILL.md`);
export const run = (script, args = [], options = {}) => node(join(ROOT, 'skills', script), args, options);
export const section = (source, heading) => source.split(heading)[1]?.split('\n## ')[0] ?? '';

/** Percorre somente os arquivos e diretórios do projeto temporário do cenário. */
export function paths(root, directory = '') {
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? [path, ...paths(root, path)] : [path];
  });
}
