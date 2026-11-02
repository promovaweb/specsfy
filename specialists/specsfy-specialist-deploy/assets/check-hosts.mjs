#!/usr/bin/env node
/** Exibe os hosts do inventário e testa cada conexão pelo Ansible. */
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

/** Reúne os hosts declarados diretamente nos grupos do inventário. */
export function inventoryHosts(data) {
  return [...new Set(Object.values(data).flatMap(group => Array.isArray(group?.hosts) ? group.hosts : []))].sort();
}
/** Converte a saída compacta do módulo ping em estados legíveis. */
export function connectionStates(output) {
  const states = {};
  for (const line of output.split(/\r?\n/)) {
    const separator = line.indexOf(' | ');
    if (separator < 0) continue;
    states[line.slice(0, separator)] = line.slice(separator + 3).startsWith('SUCCESS') ? 'conectado' : 'inacessível';
  }
  return states;
}
/** Obtém o papel do host pelos grupos de managers e workers. */
export function roleFor(host, data) {
  if (data.swarm_managers?.hosts?.includes(host)) return 'manager';
  if (data.swarm_workers?.hosts?.includes(host)) return 'worker';
  return 'não definido';
}
/** Carrega o inventário, testa os hosts e retorna o estado da tabela exibida. */
export function main(args = process.argv.slice(2)) {
  const { values } = parseArgs({ args, options: {
    inventory: { type: 'string' },
    'vault-password-file': { type: 'string' },
    'vault-id': { type: 'string', multiple: true, default: [] },
  } });
  if (!values.inventory) throw new Error('Informe --inventory.');
  const source = values['vault-password-file'] ? ['--vault-password-file', values['vault-password-file']] : [];
  for (const identity of values['vault-id']) source.push('--vault-id', identity);
  const execute = (command, arguments_) => spawnSync(command, arguments_, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 });
  const loaded = execute('ansible-inventory', ['-i', values.inventory, '--list', ...source]);
  if (loaded.error) throw new Error('Não foi possível executar ansible-inventory.');
  if (loaded.status !== 0) {
    process.stderr.write(loaded.stderr.trim() + '\n');
    return loaded.status ?? 1;
  }
  const data = JSON.parse(loaded.stdout), hosts = inventoryHosts(data);
  const tested = execute('ansible', ['all', '-i', values.inventory, '-m', 'ping', '-o', ...source]);
  if (tested.error) throw new Error('Não foi possível executar ansible.');
  const states = connectionStates(tested.stdout + '\n' + tested.stderr);
  const headings = ['SERVIDOR', 'ENDEREÇO', 'PORTA', 'USUÁRIO', 'PAPEL', 'ESTADO'];
  const rows = hosts.map(host => {
    const vars = data._meta?.hostvars?.[host] ?? {};
    return [host, String(vars.ansible_host ?? host), String(vars.ansible_port ?? 22), String(vars.ansible_user ?? '-'), roleFor(host, data), states[host] ?? 'inacessível'];
  });
  const widths = headings.map((heading, index) => Math.max(heading.length, ...rows.map(row => row[index].length)));
  const format = row => row.map((value, index) => value.padEnd(widths[index])).join('  ');
  process.stdout.write([format(headings), widths.map(width => '-'.repeat(width)).join('  '), ...rows.map(format)].join('\n') + '\n');
  return hosts.length && rows.every(row => row.at(-1) === 'conectado') ? 0 : 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exitCode = main(); }
  catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
