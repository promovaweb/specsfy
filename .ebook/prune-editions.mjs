#!/usr/bin/env node
/** Remove somente artefatos SemVer antigos, preservando a edição vigente. */
import { readdirSync, statSync, unlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const SEMVER = '(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)';
const artifactPattern = new RegExp(`^Specsfy-Guia-do-Usuario-v${SEMVER}\\.(pdf|epub)$`);

/** Lê as edições do diretório e seleciona a vigente e suas antecessoras por SemVer. */
export function planEditions(root, keep = 2, protectVersion) {
  if (!Number.isSafeInteger(keep) || keep < 1) throw new Error('--keep deve ser um inteiro maior que zero');
  if (protectVersion !== undefined && !new RegExp(`^${SEMVER}$`).test(protectVersion)) throw new Error('--protect-version exige SemVer estável');
  const groups = new Map();
  for (const file of readdirSync(root)) {
    const match = file.match(artifactPattern);
    if (!match || !statSync(join(root, file)).isFile()) continue;
    const version = match.slice(1, 4).join('.');
    if (!groups.has(version)) groups.set(version, []);
    groups.get(version).push(file);
  }
  const versions = [...groups.keys()].sort((left, right) => {
    const a = left.split('.').map(BigInt), b = right.split('.').map(BigInt);
    for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i] ? -1 : 1;
    return 0;
  });
  const currentIndex = protectVersion === undefined ? 0 : versions.indexOf(protectVersion);
  if (currentIndex === -1) throw new Error(`Edição vigente ausente: ${protectVersion}`);
  const retained = versions.slice(currentIndex, currentIndex + keep);
  const removed = versions.filter(version => !retained.includes(version));
  return { retained, removed, groups };
}

/** Remove ambos os formatos das edições fora da retenção. */
export function pruneEditions(root, keep = 2, protectVersion) {
  const { retained, removed, groups } = planEditions(root, keep, protectVersion);
  let removedFiles = 0;
  for (const version of removed) for (const file of groups.get(version)) { unlinkSync(join(root, file)); removedFiles++; }
  return { retained, removed, removedFiles };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { 'ebook-root': { type: 'string' }, keep: { type: 'string', default: '2' }, 'protect-version': { type: 'string' } } });
    if (!values['ebook-root']) throw new Error('--ebook-root é obrigatório');
    const result = pruneEditions(resolve(values['ebook-root']), Number(values.keep), values['protect-version']);
    console.log(`Retenção do ebook: ${result.retained.length} edição(ões) mantida(s), ${result.removed.length} removida(s) (${result.removedFiles} arquivo(s)).`);
  } catch (error) { console.error(`Erro: ${error.message}`); process.exitCode = 2; }
}
