/** Verifica os assets Node do deploy sem executar Ansible ou acessar servidores. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, chmodSync, mkdirSync, symlinkSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { ROOT, temporary, put, node } from '../../tests/helpers.mjs';
import { configure, defaultPasswordPath, externalPath } from '../specsfy-specialist-deploy/assets/vault.mjs';
import { inventoryHosts, roleFor, connectionStates } from '../specsfy-specialist-deploy/assets/check-hosts.mjs';

const scaffold = join(ROOT, 'specialists/specsfy-specialist-deploy/scripts/scaffold.mjs');
const successful = result => assert.equal(result.status, 0, result.stdout + result.stderr);
const includes = (text, terms) => terms.forEach(term => assert.ok(text.includes(term), term));
const text = (root, path) => readFileSync(join(root, path), 'utf8');

/** Simula somente a interface dos comandos externos; não implementa o Ansible Vault. */
const adapter = `#!/usr/bin/env node
import {readFileSync,appendFileSync,existsSync} from 'node:fs';
import {basename} from 'node:path';
import {spawnSync} from 'node:child_process';
const command=basename(process.argv[1]),args=process.argv.slice(2);
appendFileSync(process.env.MOCK_LOG,JSON.stringify({command,args,env:{ask:process.env.ANSIBLE_ASK_VAULT_PASS,ssh:process.env.ANSIBLE_SSH_ARGS,file:process.env.ANSIBLE_VAULT_PASSWORD_FILE,ids:process.env.ANSIBLE_VAULT_IDENTITY_LIST}})+'\\n');
if(command==='ansible-config'){
 let config=existsSync(process.env.ANSIBLE_CONFIG)?readFileSync(process.env.ANSIBLE_CONFIG,'utf8'):'';
 console.log(JSON.stringify([{name:'DEFAULT_VAULT_PASSWORD_FILE',value:process.env.ANSIBLE_VAULT_PASSWORD_FILE||config.match(/^vault_password_file\\s*=\\s*(.+)$/m)?.[1]||null},{name:'DEFAULT_VAULT_IDENTITY_LIST',value:process.env.ANSIBLE_VAULT_IDENTITY_LIST?.split(',').filter(Boolean)||[]}]));
 process.exit(0);
}
let source=args[args.indexOf('--vault-password-file')+1];
if(args.includes('--vault-id'))source=args[args.indexOf('--vault-id')+1].split('@').at(-1);
if(['ansible-playbook','ansible-vault','ansible-inventory'].includes(command)){
 let password='';
 try{password=(readFileSync(source,'utf8').startsWith('#!')?spawnSync(source,[],{encoding:'utf8'}).stdout:readFileSync(source,'utf8')).trim();}catch{}
 if(password!=='senha-ficticia-do-teste'){console.error('NÃO EXIBIR: segredo-ficticio');process.exit(4);}
}
if(command==='ansible-playbook'){
 const play=args[2];
 if(play.endsWith('check.json')){
  const data=JSON.parse(readFileSync(play,'utf8'));
  if(data[0].hosts!=='localhost'||data[0].gather_facts!==false||data[0].tasks.some(task=>task.no_log!==true)||!JSON.stringify(data).includes('vault_to_text=True'))process.exit(5);
 }else if(process.env.MOCK_WAIT){console.log('ESPERANDO CANCELAMENTO');setInterval(()=>{},1000);}
 else console.log('PLAY RECAP');
}else if(command==='ansible-inventory')console.log(process.env.MOCK_INVENTORY||JSON.stringify({swarm_managers:{hosts:['local']},_meta:{hostvars:{local:{ansible_host:'127.0.0.1',ansible_user:'tester'}}}}));
else if(command==='ansible')console.log(process.env.MOCK_PING||'local | SUCCESS => {}');
else if(command==='ansible-vault'){
 readFileSync(0,'utf8');
 if(process.env.MOCK_ENCRYPT_FAIL){console.error('NÃO EXIBIR: segredo-ficticio');process.exit(6);}
 console.log(args[args.indexOf('--stdin-name')+1]+': !vault |\\n  $ANSIBLE_VAULT;1.1;AES256\\n  ciphertext-ficticio');
}
`;

function fixture(t, args = []) {
  const base = temporary(t), project = join(base, 'projeto com espaço');
  put(project, 'SEMVER', '1.2.3\n');
  successful(node(scaffold, ['--project', project, '--image', 'example/app', ...args]));
  const bin = join(base, 'bin');
  for (const name of ['ansible-config', 'ansible-inventory', 'ansible-playbook', 'ansible-vault', 'ansible']) chmodSync(put(bin, name, adapter), 0o755);
  const password = put(base, 'senha', 'senha-ficticia-do-teste\n');
  chmodSync(password, 0o600);
  put(project, 'ansible/inventory.yml', 'all:\n  hosts:\n    local:\n      ansible_connection: local\n');
  put(project, 'ansible/group_vars/all/vault.yml', 'vault_probe: !vault |\n  $ANSIBLE_VAULT;1.1;AES256\n  ciphertext-ficticio\n');
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('ANSIBLE_')));
  Object.assign(env, { PATH: bin + ':' + process.env.PATH, XDG_CONFIG_HOME: join(base, 'config'), ANSIBLE_CONFIG: put(base, 'ansible.cfg', '[defaults]\n'), MOCK_LOG: put(base, 'calls.jsonl', '') });
  const run = (...arguments_) => spawnSync(join(project, 'deploy'), arguments_, { cwd: project, env, encoding: 'utf8', timeout: 30_000, stdio: ['ignore', 'pipe', 'pipe'] });
  const calls = () => text(base, 'calls.jsonl').trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  return { base, project, password, env, run, calls };
}

test('scaffold gera exclusivamente os dois utilitários Node de deploy', t => {
  const { project } = fixture(t);
  for (const path of ['ansible/vault.mjs', 'ansible/check-hosts.mjs']) assert.ok(existsSync(join(project, path)), path);
  for (const path of ['ansible/vault.py', 'ansible/check-hosts.py']) assert.ok(!existsSync(join(project, path)), path);
});

test('consulta de hosts distingue papéis e estados de conexão', () => {
  const data = { swarm_managers: { hosts: ['app01'] }, swarm_workers: { hosts: ['app02'] }, _meta: { hostvars: {} } };
  assert.deepEqual(inventoryHosts(data), ['app01', 'app02']);
  assert.equal(roleFor('app01', data), 'manager'); assert.equal(roleFor('app02', data), 'worker');
  assert.equal(roleFor('outro', data), 'não definido');
  assert.deepEqual(connectionStates('app01 | SUCCESS => {}\napp02 | UNREACHABLE! => {}\n'), { app01: 'conectado', app02: 'inacessível' });
});

test('scaffold gera a cadeia Compose, Swarm, secrets e Ansible com a versão canônica', t => {
  const { project } = fixture(t);
  for (const path of ['deploy', 'Dockerfile', '.dockerignore', 'docker/entrypoint.sh', 'compose.yaml', 'stack.yaml', 'ansible/deploy.yml', 'ansible/requirements.yml', 'ansible/secrets.yml', 'ansible/keys.yml', 'ansible/sync-keys.yml', 'ansible/inventory.example.yml', 'ansible/group_vars/all.yml', 'ansible/vault-fields.txt', 'ansible/create-vault.sh', 'ansible/vault.mjs', 'ansible/check-hosts.mjs', 'ansible/templates/stack.yaml.j2']) assert.ok(existsSync(join(project, path)), path);
  includes(text(project, 'compose.yaml'), ['octane:start', '--server=swoole']);
  includes(text(project, 'Dockerfile'), ['pecl install openswoole']);
  const stack = text(project, 'stack.yaml');
  includes(stack, ['example/app:1.2.3', 'external: true', 'cloudflare/cloudflared:2026.8.3', '"--token-file"', '/run/secrets/cloudflare_tunnel_token']);
  for (const marker of ['"--token",', 'DB_PASSWORD=', 'password: "']) assert.ok(!stack.includes(marker));
  const playbook = text(project, 'ansible/deploy.yml') + text(project, 'ansible/secrets.yml');
  includes(playbook, ['community.docker.docker_swarm', 'hosts: "swarm_managers[0]"', 'hosts: "swarm_managers[1:]"', 'hosts: swarm_workers', 'swarm_join_tokens.Manager', 'swarm_join_tokens.Worker', 'community.docker.docker_secret', 'vault_', 'community.docker.docker_stack', 'no_log: true', 'deploy_user', 'ansible.builtin.import_tasks: keys.yml']);
  includes(text(project, 'ansible/group_vars/all.yml'), ['deploy_user: deploy', 'app_version: "1.2.3"', 'cloudflare_tunnel_token']);
  includes(text(project, 'ansible/vault-fields.txt'), ['vault_cloudflare_tunnel_token']);
  includes(text(project, 'ansible/templates/stack.yaml.j2'), ['cloudflare/cloudflared:2026.8.3']);
  includes(text(project, 'deploy'), ['check-hosts.mjs', 'check-hosts)', '"$base_dir/ansible/vault.mjs"', '"$base_dir/ansible/create-vault.sh"', 'sync-keys.yml']);
  includes(text(project, 'ansible/keys.yml'), ["query('ansible.builtin.fileglob'", 'ansible.posix.authorized_key', 'exclusive: false']);
  assert.ok(!text(project, 'ansible/keys.yml').includes('id_rsa\n'));
  includes(text(project, 'ansible/check-hosts.mjs'), ['SERVIDOR', 'ENDEREÇO', 'PORTA', 'USUÁRIO', 'PAPEL', 'ESTADO', 'ansible-inventory']);
  includes(text(project, 'ansible/create-vault.sh'), ['"$base_dir/vault.mjs" secrets']);
  includes(text(project, 'ansible/vault.mjs'), ['ansible/deploy.yml', 'encrypt_string', 'vault-fields.txt', 'hiddenInput']);
  for (const path of ['docker/entrypoint.sh', 'ansible/create-vault.sh', 'deploy']) {
    successful(spawnSync('bash', ['-n', join(project, path)], { encoding: 'utf8' }));
    successful(spawnSync('shellcheck', [join(project, path)], { encoding: 'utf8' }));
  }
});
test('scaffold recusa sobrescrita de arquivos humanos', t => {
  const root = temporary(t);
  put(root, 'SEMVER', '2.3.4\n'); put(root, 'compose.yaml', 'conteudo humano\n');
  assert.notEqual(node(scaffold, ['--project', root, '--image', 'example/app']).status, 0);
  assert.equal(text(root, 'compose.yaml'), 'conteudo humano\n');
});
test('proxy externo dispensa cloudflared e o respectivo campo secreto', t => {
  const { project } = fixture(t, ['--proxy', 'external']);
  for (const path of ['stack.yaml', 'ansible/group_vars/all.yml', 'ansible/vault-fields.txt']) assert.ok(!text(project, path).includes('cloudflare'));
  includes(text(project, 'stack.yaml'), ['example/app:1.2.3']);
});
test('modo automático sem fonte termina antes de consultar servidores', t => {
  const f = fixture(t), result = f.run('run', '--non-interactive');
  assert.notEqual(result.status, 0); includes(result.stderr, ['configure-vault']);
  assert.ok(!result.stdout.includes('SERVIDOR'));
  assert.deepEqual(f.calls().map(call => call.command), ['ansible-config']);
});
test('fonte explícita é propagada e preflight precede inventário e conexões', t => {
  const f = fixture(t), result = f.run('run', '--non-interactive', '--vault-password-file', f.password);
  successful(result);
  includes(result.stdout, ['SERVIDOR', '127.0.0.1', 'manager', 'conectado', 'PLAY RECAP']);
  const calls = f.calls();
  assert.deepEqual(calls.map(call => call.command), ['ansible-playbook', 'ansible-inventory', 'ansible-inventory', 'ansible', 'ansible-playbook']);
  assert.ok(calls[0].args[2].endsWith('check.json'));
  for (const call of calls) {
    assert.equal(call.env.ask, 'False'); assert.equal(call.env.file, ''); assert.equal(call.env.ids, '');
    assert.ok(call.env.ssh.startsWith('-o BatchMode=yes '));
    assert.ok(call.args.includes(f.password));
  }
});
test('modo automático respeita ambiente, ansible.cfg, script e identidade explícita', t => {
  for (const kind of ['environment', 'config', 'script', 'identity']) {
    const f = fixture(t); let args = [];
    if (kind === 'environment') f.env.ANSIBLE_VAULT_PASSWORD_FILE = f.password;
    if (kind === 'config') put(f.base, 'ansible.cfg', '[defaults]\nvault_password_file = ' + f.password + '\n');
    if (kind === 'script') {
      const script = put(f.base, 'cofre', '#!' + process.execPath + '\nprocess.stdout.write("senha-ficticia-do-teste\\n");\n');
      chmodSync(script, 0o700); f.env.ANSIBLE_VAULT_PASSWORD_FILE = script;
    }
    if (kind === 'identity') args = ['--vault-id', 'producao@' + f.password];
    successful(f.run('run', '--non-interactive', ...args));
  }
});
test('senha incorreta e identidade prompt não acionam fallback ou conexões', t => {
  for (const kind of ['password', 'prompt']) {
    const f = fixture(t); put(f.base, 'senha', 'outra-senha\n');
    const args = kind === 'password' ? ['--vault-password-file', f.password] : ['--vault-id', 'producao@prompt'];
    const result = f.run('run', '--non-interactive', ...args);
    assert.notEqual(result.status, 0); assert.ok(!result.stdout.includes('SERVIDOR'));
    for (const secret of ['outra-senha', 'segredo-ficticio', 'Vault password:']) assert.ok(!result.stderr.includes(secret));
    assert.ok(!f.calls().some(call => call.command === 'ansible-inventory'));
  }
});
test('configuração externa grava com permissões 600 e diretório 700', async t => {
  const f = fixture(t);
  // Define somente o ambiente deste teste; os testes deste arquivo não usam concorrência.
  const previous = process.env.XDG_CONFIG_HOME; process.env.XDG_CONFIG_HOME = f.env.XDG_CONFIG_HOME;
  try {
    await configure(f.project, undefined, false, { isTTY: true, hiddenInput: async () => 'senha-ficticia-do-teste' });
    const path = defaultPasswordPath(f.project);
    assert.equal(statSync(path).mode & 0o777, 0o600);
    assert.equal(statSync(join(path, '..')).mode & 0o777, 0o700);
    assert.ok(!path.startsWith(f.project + '/'));
    successful(f.run('run', '--non-interactive'));
  } finally { if (previous === undefined) delete process.env.XDG_CONFIG_HOME; else process.env.XDG_CONFIG_HOME = previous; }
});
test('configuração recusa caminhos internos e links e preserva sobrescrita recusada', async t => {
  const f = fixture(t), link = join(f.base, 'link'); symlinkSync(f.password, link);
  const io = { isTTY: true, hiddenInput: async () => 'nova-senha', confirm: async () => 'n' };
  for (const path of [join(f.project, 'senha'), link]) await assert.rejects(configure(f.project, path, false, io));
  await configure(f.project, f.password, false, io);
  assert.equal(text(f.base, 'senha'), 'senha-ficticia-do-teste\n');
});
test('configuração recusa divergência entre senhas e valores vazios ou multilinha', async t => {
  const f = fixture(t);
  const answers = ['nova', 'diferente'];
  await assert.rejects(configure(f.project, f.password, false, { isTTY: true, confirm: async () => 's', hiddenInput: async () => answers.shift() }), /não coincidem/);
  for (const value of ['', 'duas\nlinhas', 'com\0nulo']) await assert.rejects(configure(f.project, f.password, false, { isTTY: true, confirm: async () => 's', hiddenInput: async () => value }), /única linha/);
  assert.equal(text(f.base, 'senha'), 'senha-ficticia-do-teste\n');
});
test('modo manual exige terminal mesmo com fonte externa configurada', t => {
  const f = fixture(t); f.env.ANSIBLE_VAULT_PASSWORD_FILE = f.password;
  const result = f.run('run');
  assert.notEqual(result.status, 0); includes(result.stderr, ['terminal']);
  assert.equal(f.calls().length, 0);
});
test('fonte explícita prevalece sobre configuração inválida e flags desconhecidas falham', t => {
  const f = fixture(t); f.env.ANSIBLE_VAULT_PASSWORD_FILE = join(f.base, 'inexistente');
  successful(f.run('run', '--non-interactive', '--vault-password-file', f.password));
  const invalid = f.run('run', '--non-interative'); assert.equal(invalid.status, 2);
  assert.ok(!invalid.stdout.includes('SERVIDOR'));
});
test('caminhos locais isolam projetos homônimos e fonte inválida não usa cadastro local', async t => {
  const f = fixture(t), previous = process.env.XDG_CONFIG_HOME; process.env.XDG_CONFIG_HOME = f.env.XDG_CONFIG_HOME;
  try {
    await configure(f.project, undefined, false, { isTTY: true, hiddenInput: async () => 'senha-ficticia-do-teste' });
    assert.notEqual(defaultPasswordPath(f.project), defaultPasswordPath(join(f.base, 'outro/projeto com espaço')));
    f.env.ANSIBLE_VAULT_PASSWORD_FILE = join(f.base, 'inexistente');
    const result = f.run('run', '--non-interactive'); assert.notEqual(result.status, 0);
    assert.ok(!result.stdout.includes('SERVIDOR'));
  } finally { if (previous === undefined) delete process.env.XDG_CONFIG_HOME; else process.env.XDG_CONFIG_HOME = previous; }
});
test('cofre completo é preservado sem solicitar terminal ou senha', t => {
  const f = fixture(t), path = 'ansible/group_vars/all/vault.yml';
  put(f.project, 'ansible/vault-fields.txt', 'vault_probe\n');
  const before = text(f.project, path), result = f.run('secrets');
  successful(result); includes(result.stdout, ['já contém todos os campos']);
  assert.equal(text(f.project, path), before); assert.equal(f.calls().length, 0);
});
test('consulta de hosts sinaliza host inacessível e inventário vazio', t => {
  const f = fixture(t); f.env.MOCK_PING = 'local | UNREACHABLE! => {}';
  let result = f.run('check-hosts', '--vault-password-file', f.password);
  assert.equal(result.status, 1); includes(result.stdout, ['inacessível']);
  f.env.MOCK_INVENTORY = '{"_meta":{"hostvars":{}}}';
  result = f.run('check-hosts', '--vault-password-file', f.password);
  assert.equal(result.status, 1); includes(result.stdout, ['SERVIDOR']);
});

/** Abre um PTY pelo utilitário do sistema e responde só após cada prompt aparecer. */
async function terminal(fixture, arguments_, answers) {
  const quote = value => "'" + value.replaceAll("'", "'\\''") + "'";
  const command = [join(fixture.project, 'deploy'), ...arguments_].map(quote).join(' ');
  const child = spawn('script', ['-q', '-e', '-c', command, '/dev/null'], { cwd: fixture.project, env: fixture.env, detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
  let output = '', offset = 0;
  const pending = [...answers];
  return new Promise((accept, reject) => {
    const timer = setTimeout(() => {
      try { process.kill(-child.pid, 'SIGKILL'); } catch {}
      reject(new Error('O comando não terminou no terminal de teste: ' + output));
    }, 15_000);
    const receive = data => {
      output += data.toString();
      if (pending.length && output.slice(offset).includes(pending[0][0])) {
        const [, answer] = pending.shift(); offset = output.length;
        child.stdin.write(answer + '\n');
      }
    };
    child.stdout.on('data', receive); child.stderr.on('data', receive);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', status => {
      clearTimeout(timer);
      if (pending.length) reject(new Error('Prompts pendentes: ' + output));
      else accept({ status, stdout: output, stderr: '' });
    });
  });
}
test('deploy manual usa prompt oculto mesmo com fonte externa configurada', async t => {
  const f = fixture(t); f.env.ANSIBLE_VAULT_PASSWORD_FILE = join(f.base, 'inexistente');
  const result = await terminal(f, ['run'], [['Senha do Ansible Vault: ', 'senha-ficticia-do-teste']]);
  successful(result); includes(result.stdout, ['PLAY RECAP']);
  for (const secret of ['senha-ficticia-do-teste', 'segredo-ficticio']) assert.ok(!result.stdout.includes(secret));
  const calls = f.calls(); assert.ok(!calls.some(call => call.command === 'ansible-config'));
  for (const call of calls) {
    const path = call.args[call.args.indexOf('--vault-password-file') + 1];
    assert.ok(!existsSync(path), 'Arquivo temporário deve ser removido após a operação');
  }
});
test('configurador no terminal oculta senha e respeita confirmação de sobrescrita', async t => {
  const f = fixture(t);
  const result = await terminal(f, ['configure-vault'], [['Senha atual do Ansible Vault: ', 'senha-ficticia-do-teste'], ['Repita a senha do Ansible Vault: ', 'senha-ficticia-do-teste']]);
  successful(result); assert.ok(!result.stdout.includes('senha-ficticia-do-teste'));
  const shown = f.run('configure-vault', '--show-path'); successful(shown);
  const path = shown.stdout.trim();
  assert.equal(readFileSync(path, 'utf8'), 'senha-ficticia-do-teste\n');
  successful(await terminal(f, ['configure-vault'], [['[s/N] ', 'n']]));
  assert.equal(readFileSync(path, 'utf8'), 'senha-ficticia-do-teste\n');
});
test('cadastro de campo reutiliza fonte externa e preserva valores já criptografados', async t => {
  const f = fixture(t), path = 'ansible/group_vars/all/vault.yml';
  put(f.project, 'ansible/vault-fields.txt', 'vault_probe\nvault_novo\n');
  const before = text(f.project, path); f.env.ANSIBLE_VAULT_PASSWORD_FILE = f.password;
  const result = await terminal(f, ['secrets'], [['Valor de vault_novo: ', 'novo-valor-ficticio']]);
  successful(result);
  for (const marker of ['Senha do Ansible Vault:', 'novo-valor-ficticio']) assert.ok(!result.stdout.includes(marker));
  assert.ok(text(f.project, path).startsWith(before)); includes(text(f.project, path), ['vault_novo: !vault']);
  assert.ok(!text(f.project, path).includes('novo-valor-ficticio'));
});
test('falha de criptografia preserva o Vault e remove arquivos temporários', async t => {
  const f = fixture(t), path = 'ansible/group_vars/all/vault.yml';
  put(f.project, 'ansible/vault-fields.txt', 'vault_probe\nvault_novo\n');
  const before = text(f.project, path); f.env.ANSIBLE_VAULT_PASSWORD_FILE = f.password; f.env.MOCK_ENCRYPT_FAIL = '1';
  const result = await terminal(f, ['secrets'], [['Valor de vault_novo: ', 'novo-valor-ficticio']]);
  assert.notEqual(result.status, 0); assert.equal(text(f.project, path), before);
  assert.ok(!result.stdout.includes('novo-valor-ficticio')); assert.ok(!result.stdout.includes('segredo-ficticio'));
  assert.deepEqual(readdirSync(join(f.project, 'ansible/group_vars/all')).filter(name => name.startsWith('.vault-')), []);
});
test('cancelamento do playbook encerra o processo filho e remove a senha temporária', async t => {
  const f = fixture(t); f.env.MOCK_WAIT = '1';
  const result = await terminal(f, ['run'], [['Senha do Ansible Vault: ', 'senha-ficticia-do-teste'], ['ESPERANDO CANCELAMENTO', '\u0003']]);
  assert.equal(result.status, 130, result.stdout); includes(result.stdout, ['Operação cancelada.']);
  for (const call of f.calls()) {
    const path = call.args[call.args.indexOf('--vault-password-file') + 1];
    assert.ok(!existsSync(path));
  }
});
