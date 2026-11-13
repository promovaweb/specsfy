#!/usr/bin/env node
/** Valida o frontmatter e placeholders das skills usando YAML e Node.js. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { parseDocument } from 'yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const allowed = new Set(['name', 'description', 'license', 'allowed-tools', 'metadata']);

/** Retorna a primeira falha estrutural sem executar código ou comandos da skill. */
export function validateSkill(directory) {
  const file = join(directory, 'SKILL.md');
  if (!existsSync(file)) return { valid: false, message: 'SKILL.md ausente.' };
  const content = readFileSync(file, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { valid: false, message: 'Frontmatter YAML ausente ou inválido.' };
  let metadata;
  try {
    const document = parseDocument(match[1], { uniqueKeys: true });
    if (document.errors.length || document.warnings.length) return { valid: false, message: 'YAML inválido no frontmatter.' };
    metadata = document.toJS({ maxAliasCount: 100 });
  } catch { return { valid: false, message: 'YAML inválido no frontmatter.' }; }
  if (!metadata || Array.isArray(metadata) || typeof metadata !== 'object') return { valid: false, message: 'O frontmatter deve ser um mapa YAML.' };
  const unexpected = Object.keys(metadata).filter(key => !allowed.has(key));
  if (unexpected.length) return { valid: false, message: 'Propriedades não permitidas: ' + unexpected.join(', ') + '.' };
  if (typeof metadata.name !== 'string' || !metadata.name.trim()) return { valid: false, message: 'name deve ser um texto não vazio.' };
  const name = metadata.name.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) return { valid: false, message: 'name deve usar kebab-case e até 64 caracteres.' };
  if (typeof metadata.description !== 'string') return { valid: false, message: 'description deve ser um texto.' };
  const description = metadata.description.trim();
  if (description.startsWith('[TODO:')) return { valid: false, message: 'description contém placeholder inacabado.' };
  if (/[<>]/.test(description) || description.length > 1024) return { valid: false, message: 'description não pode conter < ou > nem exceder 1024 caracteres.' };
  let fenceMarker, fenceLength = 0;
  for (const line of content.slice(match[0].length).split(/\r?\n/)) {
    const fence = line.match(/^[ \t]*(?:(?:[-+*]|\d+[.)])[ \t]+)?(`{3,}|~{3,})(.*)$/);
    if (fence) {
      const marker = fence[1];
      if (!fenceMarker) { fenceMarker = marker[0]; fenceLength = marker.length; }
      else if (marker[0] === fenceMarker && marker.length >= fenceLength && !fence[2].trim()) { fenceMarker = undefined; fenceLength = 0; }
      continue;
    }
    if (!fenceMarker && /^[ ]{0,3}\[TODO:[^\n]*\][ \t]*$/.test(line)) return { valid: false, message: 'As instruções contêm placeholder inacabado.' };
  }
  return { valid: true, message: 'Skill válida.' };
}

/**
 * Descobre somente as bibliotecas publicadas e skills operacionais locais.
 * As skills `termfy*` de `cli/.agents/skills/` vêm do Termfy pelo
 * `npx skills`, com hash conferido em `cli/skills-lock.json`, e seguem o
 * contrato do repositório de origem; por isso ficam fora desta conferência.
 */
export function defaultDirectories() {
  const vendored = (base, name) => base === 'cli/.agents/skills' && name.startsWith('termfy');
  return ['skills', 'specialists', '.agents/skills', 'cli/.agents/skills'].flatMap(base => readdirSync(join(ROOT, base), { withFileTypes: true }).filter(entry => entry.isDirectory() && !vendored(base, entry.name) && existsSync(join(ROOT, base, entry.name, 'SKILL.md'))).map(entry => join(ROOT, base, entry.name)));
}

/** Recebe diretórios opcionais; sem argumentos confere todas as bibliotecas do projeto. */
export function main(args = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: { json: { type: 'boolean' } } });
  const results = (positionals.length ? positionals.map(path => resolve(path)) : defaultDirectories()).map(path => ({ path, ...validateSkill(path) }));
  if (values.json) process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  else for (const result of results) process.stdout.write(`${result.valid ? 'OK' : 'ERRO'}: ${result.path}: ${result.message}\n`);
  return results.every(result => result.valid) ? 0 : 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exitCode = main(); }
  catch { process.stderr.write('Não foi possível validar os diretórios informados.\n'); process.exitCode = 2; }
}
