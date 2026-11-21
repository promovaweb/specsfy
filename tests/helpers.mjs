/** Utilitários de testes: projetos descartáveis e processos com saída capturada. */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const read = path => readFileSync(join(ROOT, path), 'utf8');

/** Lê o corpo e as referências autorais de um especialista. */
export function readSpecialist(name) {
  const directory = `specialists/specsfy-specialist-${name}`;
  const references = join(directory, 'references');
  const files = readdirSync(join(ROOT, references), { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => join(references, entry.name));
  return [join(directory, 'SKILL.md'), ...files].map(read).join('\n');
}

/** Remove somente a árvore temporária criada pelo próprio teste. */
export function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), 'specsfy-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

/** Grava uma fixture, criando os diretórios intermediários necessários. */
export function put(root, path, content) {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  return target;
}

/** Executa arquivos Node diretamente, sem shell e com prazo máximo por processo. */
export function node(script, args = [], options = {}) {
  return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 60_000, ...options });
}
