/** Confere o manual do exemplo contra os arquivos, comandos e rotas reais. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { test } from 'node:test';
import { ROOT } from '../../tests/helpers.mjs';
const root = join(ROOT, 'example'), readme = join(root, 'README.md');
const text = () => readFileSync(readme, 'utf8');
const includes = (source, terms) => terms.forEach(term => assert.ok(source.includes(term), term));

test('README descreve o papel, a arquitetura e as capacidades do exemplo', () => {
  const source = text();
  includes(source, ['## Papel no Specsfy', '## Capacidades demonstradas', '## Arquitetura', '## Persistência e dados', '## Rotas e jornadas', '## Preparar o ambiente', '## Executar', '## Qualidade e testes', '## Mapa de referências']);
  includes(source.toLowerCase(), ['autenticação', 'perfil', 'passkey', 'dois fatores', 'equipe', 'owner', 'admin', 'member', 'convite', 'documentação oficial', 'ambiente interno']);
});
test('README referencia as fontes executáveis e seus links locais existem', () => {
  const destinations = new Set([...text().matchAll(/\[[^\]]+\]\((?!https?:\/\/|mailto:)([^)]+)\)/g)].map(match => {
    const target = decodeURIComponent(match[1].trim().replace(/^<|>$/g, '')).split('#')[0];

    return target ? resolve(dirname(readme), target) : readme;
  }));

  for (const path of ['composer.json', 'package.json', '.env.example', 'routes/web.php', 'routes/settings.php', 'app/Models/User.php', 'app/Models/Team.php', 'database/migrations', 'resources/js/pages', 'tests']) {
assert.ok(destinations.has(join(root, path)), path);
}

  for (const path of destinations) {
assert.ok(existsSync(path), path);
}
});
test('rotas e comandos documentados existem nos registros da aplicação', () => {
  const source = text();
  const result = spawnSync('php', ['artisan', 'route:list', '--json'], { cwd: root, encoding: 'utf8', timeout: 60_000 });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const routes = new Set(JSON.parse(result.stdout).map(route => route.name).filter(Boolean));
  const documented = [...source.matchAll(/`route:([^`]+)`/g)].map(match => match[1]);
  assert.ok(documented.length); documented.forEach(name => assert.ok(routes.has(name), name));

  for (const [manifest, pattern] of [['composer.json', /`composer ([a-z][\w:-]+)`/g], ['package.json', /`npm run ([a-z][\w:-]+)`/g]]) {
    const scripts = JSON.parse(readFileSync(join(root, manifest), 'utf8')).scripts;
    const commands = [...source.matchAll(pattern)].map(match => match[1]);
    assert.ok(commands.length); commands.forEach(command => assert.ok(Object.hasOwn(scripts, command), command));
  }
});
