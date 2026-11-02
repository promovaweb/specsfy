#!/usr/bin/env node
/** Coleta o estado Git e as fontes dos módulos, somente na raiz oficial. */
import { statSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const REMOTE = 'https://github.com/promovaweb/specsfy';
const MODULES = ['.', 'brand', 'skills', 'docs', 'example', 'specsfy', 'specialists', 'cli'];
const SOURCES = ['AGENTS.md', 'README.md', 'Spec.md', 'pyproject.toml', 'uv.lock', 'composer.json', 'composer.lock', 'package.json', 'package-lock.json'];

/** Normaliza os remotos HTTPS e SSH admitidos para o mesmo repositório. */
export function normalizeRemote(remote) {
  return remote.trim().replace(/\/$/, '').replace(/^git@github.com:/, 'https://github.com/').replace(/\.git$/, '');
}

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).replace(/\n+$/, '');
}

function isFile(path) {
  try { return statSync(path).isFile(); }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

/** Recusa remoto, raiz ou módulo divergente antes de expor o registro do checkout. */
export function collect(workspace) {
  const root = realpathSync(resolve(workspace));
  const gitRoot = realpathSync(git(root, 'rev-parse', '--show-toplevel'));
  if (gitRoot !== root) throw new Error(`raiz Git é ${gitRoot}; esperado ${root}`);
  const remote = normalizeRemote(git(root, 'remote', 'get-url', 'origin'));
  if (remote !== REMOTE) throw new Error(`remoto origin é ${remote}; esperado ${REMOTE}`);
  for (const module of MODULES) {
    const path = join(root, module);
    if (!statSync(path).isDirectory()) throw new Error(`módulo ausente: ${module}`);
    if (realpathSync(git(path, 'rev-parse', '--show-toplevel')) !== root) throw new Error(`${module}: raiz Git divergente`);
  }
  const tracked = git(root, 'ls-files', '-z').split('\0').filter(Boolean);
  const changes = git(root, 'status', '--short').split('\n').filter(Boolean);
  return {
    workspace: 'promovaweb/specsfy', root, remote,
    branch: git(root, 'branch', '--show-current'), head: git(root, 'rev-parse', 'HEAD'),
    dirty: changes.length > 0, changes, tracked_files: tracked.length,
    modules: MODULES.map(module => ({
      path: module,
      tracked_files: tracked.filter(path => module === '.' || path.startsWith(module + '/')).length,
      sources: SOURCES.filter(source => isFile(join(root, module, source))),
    })),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { workspace: { type: 'string' } } });
    if (!values.workspace) throw new Error('--workspace é obrigatório');
    console.log(JSON.stringify(collect(values.workspace), null, 2));
  } catch (error) { console.error(`Não representa o monorepo Specsfy: ${error.message}`); process.exitCode = 2; }
}
