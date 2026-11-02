#!/usr/bin/env node
/** Configura a senha externa e executa Ansible com ou sem terminal interativo. */
import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, realpathSync, lstatSync, statSync, mkdirSync, chmodSync, openSync, writeFileSync, fsyncSync, closeSync, renameSync, rmSync, mkdtempSync, readFileSync, constants } from 'node:fs';
import { basename, dirname, join, resolve, relative, isAbsolute } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { emitKeypressEvents, createInterface } from 'node:readline';
import { parseArgs } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Isola checkouts pela raiz real, inclusive projetos com nomes iguais. */
export function defaultPasswordPath(project, env = process.env) {
  const root = existsSync(project) ? realpathSync(project) : resolve(project);
  const name = basename(root).replace(/[^a-zA-Z0-9_-]/g, '-') || 'projeto';
  const digest = createHash('sha256').update(root).digest('hex').slice(0, 16);
  const base = env.XDG_CONFIG_HOME ?? join(homedir(), '.config');
  if (!isAbsolute(base)) throw new Error('XDG_CONFIG_HOME deve ser um caminho absoluto.');
  return join(base, 'specsfy', 'vault', `${name}-${digest}`, 'password');
}

/** Lê uma linha sem eco, exige TTY e restaura o modo do terminal ao terminar. */
export function hiddenInput(prompt) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') throw new Error('Esta ação exige um terminal interativo.');
  return new Promise((accept, reject) => {
    const input = process.stdin, raw = input.isRaw;
    let value = '';
    emitKeypressEvents(input);
    const finish = error => {
      input.removeListener('keypress', onKey);
      input.setRawMode(Boolean(raw));
      input.pause();
      process.stdout.write('\n');
      if (error) reject(error);
      else if (!value || /[\r\n\0]/.test(value)) reject(new Error('Informe um valor não vazio em uma única linha.'));
      else accept(value);
    };
    const onKey = (character, key = {}) => {
      if (key.ctrl && ['c', 'd'].includes(key.name)) { const error = new Error('Operação cancelada.'); error.exitCode = 130; finish(error); }
      else if (key.name === 'return' || key.name === 'enter') finish();
      else if (key.name === 'backspace') value = [...value].slice(0, -1).join('');
      else if (!key.ctrl && !key.meta && character && !character.startsWith('\u001b')) value += character;
    };
    input.setRawMode(true);
    input.on('keypress', onKey);
    input.resume();
    process.stdout.write(prompt);
  });
}

/** Recusa destinos internos ao worktree e links simbólicos no caminho. */
export function externalPath(project, value, env = process.env) {
  const path = value ? resolve(value === '~' ? homedir() : value.startsWith('~/') ? join(homedir(), value.slice(2)) : value) : defaultPasswordPath(project, env);
  for (let part = path;; part = dirname(part)) {
    try { if (lstatSync(part).isSymbolicLink()) throw new Error('A senha externa não pode usar links simbólicos.'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (part === dirname(part)) break;
  }
  const git = spawnSync('git', ['-C', project, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  const repository = git.status === 0 ? realpathSync(git.stdout.trim()) : realpathSync(project);
  const local = relative(repository, path);
  if (!local || (!local.startsWith('..' + '/') && local !== '..' && !isAbsolute(local))) throw new Error('Salve a senha fora do repositório do projeto.');
  if (existsSync(path) && (!statSync(path).isFile() || statSync(path).uid !== process.getuid())) throw new Error('O destino deve ser um arquivo regular do seu usuário.');
  return path;
}

/** Publica bytes com permissão 600 por rename no mesmo sistema de arquivos. */
function atomicWrite(path, content) {
  const directory = mkdtempSync(join(dirname(path), '.vault-'));
  const temporary = join(directory, 'value');
  try {
    const descriptor = openSync(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL, 0o600);
    try { writeFileSync(descriptor, content); fsyncSync(descriptor); } finally { closeSync(descriptor); }
    renameSync(temporary, path);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

/** Confirma sobrescrita com eco normal; a senha passa apenas por hiddenInput. */
async function confirm(prompt) {
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try { return await new Promise(accept => terminal.question(prompt, accept)); }
  finally { terminal.close(); }
}

/** Grava a senha externa somente após confirmação; io permite exercitar o contrato. */
export async function configure(project, value, showPath, io = {}) {
  const path = externalPath(project, value);
  if (showPath) { process.stdout.write(path + '\n'); return; }
  if (!(io.isTTY ?? process.stdin.isTTY)) throw new Error('Execute ./deploy configure-vault em um terminal interativo.');
  if (existsSync(path) && (await (io.confirm ?? confirm)(`Substituir a senha em ${path}? [s/N] `)).trim().toLowerCase() !== 's') {
    process.stdout.write('Configuração existente preservada.\n'); return;
  }
  const prompt = io.hiddenInput ?? hiddenInput;
  const password = await prompt('Senha atual do Ansible Vault: ');
  if (!password || /[\r\n\0]/.test(password)) throw new Error('Informe um valor não vazio em uma única linha.');
  if (await prompt('Repita a senha do Ansible Vault: ') !== password) throw new Error('As senhas não coincidem; nenhum arquivo foi alterado.');
  const previous = process.umask(0o077);
  try {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    externalPath(project, path);
    if (statSync(dirname(path)).uid !== process.getuid()) throw new Error('A pasta de destino deve pertencer ao seu usuário.');
    chmodSync(dirname(path), 0o700);
    atomicWrite(path, password + '\n');
  } finally { process.umask(previous); }
  process.stdout.write(`Senha configurada fora do repositório: ${path}\n`);
  if (value) process.stdout.write('Use esse caminho em --vault-password-file ou ANSIBLE_VAULT_PASSWORD_FILE.\n');
}

/** Consulta a resolução oficial do Ansible sem publicar o dump de configuração. */
export function nativeSources() {
  const result = spawnSync('ansible-config', ['dump', '--format', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30_000, detached: true });
  if (result.error || result.status !== 0) throw new Error('Não foi possível ler a configuração do Ansible.');
  let entries;
  try { entries = JSON.parse(result.stdout); } catch { throw new Error('Não foi possível ler a configuração do Ansible.'); }
  const config = Object.fromEntries(entries.map(item => [item.name ?? item.option, item.value]));
  return [config.DEFAULT_VAULT_PASSWORD_FILE, config.DEFAULT_VAULT_IDENTITY_LIST ?? []];
}

/** Prioriza fonte explícita, configuração nativa e cadastro local, nessa ordem. */
export function sourceArguments(project, passwordFile, identities = []) {
  const [file, ids] = passwordFile || identities.length ? [passwordFile, identities] : nativeSources();
  const args = file ? ['--vault-password-file', file] : [];
  for (const identity of ids) {
    if (identity.split('@').at(-1) === 'prompt') throw new Error('Vault ID com prompt não é aceito neste modo; configure uma fonte externa.');
    args.push('--vault-id', identity);
  }
  if (!args.length) {
    const path = defaultPasswordPath(project);
    if (!existsSync(path)) throw new Error('Fonte de senha ausente. Execute ./deploy configure-vault no terminal.');
    externalPath(project, path);
    if (!statSync(path).isFile() || (statSync(path).mode & 0o077)) throw new Error('O arquivo da senha local deve ter permissão 600.');
    args.push('--vault-password-file', path);
  }
  return args;
}

/** Desativa perguntas nativas e fontes herdadas após resolver a fonte da senha. */
export function automatedEnv() {
  return { ...process.env, ANSIBLE_ASK_PASS: 'False', ANSIBLE_BECOME_ASK_PASS: 'False', ANSIBLE_ASK_VAULT_PASS: 'False', ANSIBLE_VAULT_PASSWORD_FILE: '', ANSIBLE_VAULT_IDENTITY_LIST: '', ANSIBLE_SSH_ARGS: '-o BatchMode=yes ' + (process.env.ANSIBLE_SSH_ARGS ?? '') };
}

/** Encaminha cancelamento ao grupo filho e aguarda sua saída antes de limpar a senha. */
function childProcess(command, args, env, { quiet = false, input, capture = false } = {}) {
  return new Promise((accept, reject) => {
    const child = spawn(command, args, { env, stdio: [input === undefined ? 'ignore' : 'pipe', capture ? 'pipe' : quiet ? 'ignore' : 'inherit', quiet ? 'ignore' : 'inherit'], detached: true });
    let interrupted = false, output = '';
    const cancel = signal => {
      interrupted = true;
      if (child.pid) { try { process.kill(-child.pid, signal); } catch {} }
    };
    const interrupt = () => cancel('SIGINT'), terminate = () => cancel('SIGTERM');
    process.on('SIGINT', interrupt); process.on('SIGTERM', terminate);
    const cleanup = () => { process.removeListener('SIGINT', interrupt); process.removeListener('SIGTERM', terminate); };
    child.stdout?.on('data', data => { output += data; });
    if (input !== undefined) { child.stdin.on('error', () => {}); child.stdin.end(input); }
    child.once('error', () => { cleanup(); reject(new Error('Não foi possível executar a ferramenta solicitada.')); });
    child.once('close', status => {
      cleanup();
      if (interrupted) { const error = new Error('Operação cancelada.'); error.exitCode = 130; reject(error); }
      else accept({ status, stdout: output });
    });
  });
}

/** Executa sem shell ou terminal controlador; falhas de abertura omitem detalhes. */
async function execute(command, args, env, quiet = false) {
  const result = await childProcess(command, args, env, { quiet });
  if (result.status !== 0) throw new Error(quiet ? 'Falha ao abrir o Vault ou carregar o inventário; confira a fonte da senha e a configuração do Ansible.' : `A etapa ${basename(command)} terminou com código ${result.status ?? 1}.`);
}

/** Mantém a senha manual em arquivo temporário 600 somente durante a operação. */
async function withCredentials(project, args, manual, action) {
  if (!manual) return action(sourceArguments(project, args['vault-password-file'], args['vault-id']));
  const password = await hiddenInput('Senha do Ansible Vault: ');
  const directory = mkdtempSync(join(tmpdir(), 'specsfy-vault-'));
  try {
    const path = join(directory, 'password');
    writeFileSync(path, password + '\n', { flag: 'wx', mode: 0o600 });
    return await action(['--vault-password-file', path]);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

/** Força a descriptografia local antes de permitir conexões aos servidores. */
export async function validateVault(project, source, env) {
  const vault = join(project, 'ansible/group_vars/all/vault.yml');
  if (!existsSync(vault) || !statSync(vault).isFile()) throw new Error('Vault ausente. Cadastre os valores com ./deploy secrets no terminal.');
  const play = [{ hosts: 'localhost', connection: 'local', gather_facts: false, tasks: [
    { 'ansible.builtin.include_vars': { file: vault, name: 'specsfy_vault' }, no_log: true },
    { 'ansible.builtin.assert': { that: ['(specsfy_vault | to_json(vault_to_text=True)) | length > 2'] }, no_log: true },
  ] }];
  const directory = mkdtempSync(join(tmpdir(), 'specsfy-vault-check-'));
  try {
    const check = join(directory, 'check.json');
    writeFileSync(check, JSON.stringify(play));
    await execute('ansible-playbook', ['-i', 'localhost,', check, ...source], env, true);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

/** Valida o Vault e o inventário antes das conexões e do playbook de deploy. */
export async function runDeploy(project, args) {
  const inventory = process.env.ANSIBLE_INVENTORY ?? join(project, 'ansible/inventory.yml');
  if (!existsSync(inventory) || !statSync(inventory).isFile()) throw new Error(`Inventário ausente: ${inventory}`);
  if (!args['non-interactive'] && (args['vault-password-file'] || args['vault-id'].length)) throw new Error('Use --non-interactive ao informar uma fonte externa para run.');
  await withCredentials(project, args, !args['non-interactive'], async source => {
    const env = automatedEnv();
    await validateVault(project, source, env);
    await execute('ansible-inventory', ['-i', inventory, '--list', ...source], env, true);
    await execute(process.execPath, [join(project, 'ansible/check-hosts.mjs'), '--inventory', inventory, ...source], env);
    await execute('ansible-playbook', ['-i', inventory, join(project, 'ansible/deploy.yml'), ...source], env);
  });
}

/** Acrescenta campos ausentes e publica somente o YAML criptografado completo. */
export async function createSecrets(project, args) {
  const base = join(project, 'ansible'), vault = join(base, 'group_vars/all/vault.yml');
  const original = existsSync(vault) ? readFileSync(vault, 'utf8') : '';
  const fields = readFileSync(join(base, 'vault-fields.txt'), 'utf8').split(/\r?\n/);
  if (fields.at(-1) === '') fields.pop();
  if (fields.some(field => !/^vault_[a-z0-9_]+$/.test(field))) throw new Error('Nome de variável inválido em vault-fields.txt.');
  const missing = [...new Set(fields)].filter(field => !new RegExp(`^${field}:`, 'm').test(original));
  if (!missing.length) { process.stdout.write(`Vault já contém todos os campos: ${vault}\n`); return; }
  if (!process.stdin.isTTY) throw new Error('Cadastre os campos ausentes com ./deploy secrets em um terminal interativo.');
  let manual = !(args['vault-password-file'] || args['vault-id'].length);
  if (manual) { const [file, ids] = nativeSources(); manual = !(file || ids.length || existsSync(defaultPasswordPath(project))); }
  await withCredentials(project, args, manual, async source => {
    const env = automatedEnv();
    if (original.trim()) await validateVault(project, source, env);
    let updated = original;
    for (const field of missing) {
      const value = await hiddenInput(`Valor de ${field}: `);
      const result = await childProcess('ansible-vault', ['encrypt_string', ...source, '--stdin-name', field], env, { input: value, quiet: true, capture: true });
      if (result.status !== 0) throw new Error('Não foi possível criptografar o campo; o Vault foi preservado.');
      updated += (updated && !updated.endsWith('\n') ? '\n' : '') + result.stdout + '\n';
    }
    mkdirSync(dirname(vault), { recursive: true });
    atomicWrite(vault, updated);
  });
  process.stdout.write(`Vault atualizado: ${vault}\n`);
}

/** Retorna as opções públicas de cada ação para o parser e a conferência do manual. */
export function commandOptions(action) {
  const options = { 'vault-password-file': { type: 'string' } };
  if (action === 'configure-vault') options['show-path'] = { type: 'boolean' };
  else if (['run', 'secrets'].includes(action)) {
    options['vault-id'] = { type: 'string', multiple: true, default: [] };
    if (action === 'run') options['non-interactive'] = { type: 'boolean' };
  } else return null;
  return options;
}

/** Expõe caminhos e opções; a interface nunca aceita a senha como argumento. */
export async function main(argv = process.argv.slice(2), project = dirname(dirname(fileURLToPath(import.meta.url)))) {
  const [action, ...args] = argv, options = commandOptions(action);
  if (!options) { process.stderr.write('Informe configure-vault, run ou secrets.\n'); return 2; }
  let values;
  try { ({ values } = parseArgs({ args, options })); }
  catch { process.stderr.write('Opção inválida; confira os argumentos do comando.\n'); return 2; }
  if (action === 'configure-vault') await configure(project, values['vault-password-file'], values['show-path']);
  else if (action === 'run') await runDeploy(project, values);
  else await createSecrets(project, values);
  return 0;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exitCode = await main(); }
  catch (error) {
    // Erros do sistema e subprocessos podem conter valores; só publica mensagens próprias.
    process.stderr.write((error.code ? 'Não foi possível concluir a ação; confira terminal, arquivos e ferramentas instaladas.' : error.message) + '\n');
    process.exitCode = error.exitCode ?? 1;
  }
}
