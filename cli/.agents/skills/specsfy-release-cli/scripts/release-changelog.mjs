#!/usr/bin/env node
/** Prepara a versão e mantém as notas da release idênticas à seção do changelog. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const UNRELEASED = '## [Unreleased]';

/** Aceita somente versões estáveis, comparáveis numericamente sem arredondamento. */
function stableVersion(version) {
  if (typeof version !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error(`versão estável inválida: ${version}`);
  }
  return version.split('.').map(BigInt);
}

/** Valida todas as fontes antes de gravar a versão e promover as notas. */
export function prepare(cli, version, date, notesFile) {
  const next = stableVersion(version);
  const parsedDate = new Date(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== date) {
    throw new Error(`data ISO inválida: ${date}`);
  }
  const paths = {
    framework: join(cli, '..', 'VERSION'), package: join(cli, 'package.json'),
    source: join(cli, 'src/version.ts'), changelog: join(cli, 'CHANGELOG.md'),
  };
  const read = path => readFileSync(path, 'utf8');
  const pkg = JSON.parse(read(paths.package));
  const source = read(paths.source);
  const matches = [...source.matchAll(/^export const VERSION = "(\d+\.\d+\.\d+)";$/gm)];
  if (matches.length !== 1 || pkg.version !== matches[0][1] || read(paths.framework).trim() !== pkg.version) {
    throw new Error('fontes de versão atuais divergem ou não são reconhecíveis');
  }
  const current = stableVersion(pkg.version);
  const firstDifference = next.findIndex((part, index) => part !== current[index]);
  if (firstDifference === -1 || next[firstDifference] < current[firstDifference]) {
    throw new Error(`a versão ${version} deve ser maior que ${pkg.version}`);
  }
  const changelog = read(paths.changelog);
  if (changelog.split(UNRELEASED).length !== 2) throw new Error('CHANGELOG.md deve conter uma única seção Unreleased');
  const escaped = version.replaceAll('.', '\\.');
  if (new RegExp(`^## \\[${escaped}\\](?: |$)`, 'm').test(changelog)) throw new Error(`a versão ${version} já existe no CHANGELOG.md`);
  const notes = read(notesFile).trim();
  if (!notes || /^## \[/m.test(notes)) throw new Error('as notas devem ter conteúdo e não podem declarar outra seção de versão');
  const updated = changelog.replace(UNRELEASED, () => `${UNRELEASED}\n\n## [${version}] - ${date}\n\n${notes}`);
  pkg.version = version;
  writeFileSync(paths.framework, version + '\n');
  writeFileSync(paths.package, JSON.stringify(pkg, null, 2) + '\n');
  writeFileSync(paths.source, source.replace(matches[0][0], () => `export const VERSION = "${version}";`));
  writeFileSync(paths.changelog, updated);
}

/** Extrai uma única seção, preservando o contrato de newline das notas remotas. */
export function releaseNotes(changelog, version) {
  stableVersion(version);
  const escaped = version.replaceAll('.', '\\.');
  const pattern = new RegExp(`^## \\[${escaped}\\] - \\d{4}-\\d{2}-\\d{2}\\r?\\n\\r?\\n(.*?)(?=^## \\[|(?![\\s\\S]))`, 'gms');
  const matches = [...readFileSync(changelog, 'utf8').matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`CHANGELOG.md deve conter exatamente uma seção para ${version}`);
  return matches[0][1].trim() + '\n';
}

/** Exige equivalência exata entre o corpo remoto e as notas versionadas. */
export function verifyReleaseBody(changelog, version, releaseJson) {
  const payload = JSON.parse(readFileSync(releaseJson, 'utf8'));
  if (!payload || typeof payload.body !== 'string') throw new Error('resposta do GitHub Release não contém body textual');
  if (payload.body !== releaseNotes(changelog, version)) throw new Error('o corpo do GitHub Release diverge da seção do CHANGELOG.md');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const command = process.argv[2];
    const required = {
      prepare: ['cli', 'version', 'date', 'notes-file'],
      extract: ['changelog', 'version', 'output'],
      verify: ['changelog', 'version', 'release-json'],
    }[command];
    if (!required) throw new Error('uso: release-changelog.mjs prepare|extract|verify [opções]');
    const { values } = parseArgs({ args: process.argv.slice(3), options: Object.fromEntries(required.map(name => [name, { type: 'string' }])) });
    for (const name of required) if (!values[name]) throw new Error(`opção obrigatória: --${name}`);
    if (command === 'prepare') prepare(resolve(values.cli), values.version, values.date, resolve(values['notes-file']));
    else if (command === 'extract') writeFileSync(resolve(values.output), releaseNotes(resolve(values.changelog), values.version));
    else verifyReleaseBody(resolve(values.changelog), values.version, resolve(values['release-json']));
  } catch (error) {
    console.error(`erro: ${error.message}`);
    process.exitCode = 2;
  }
}
