/** Exercita o validador Node com YAML real, nomes inválidos e cercas Markdown. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, temporary, put, node } from './helpers.mjs';
import { validateSkill, defaultDirectories } from '../scripts/validate-skills.mjs';
const valid = '---\nname: exemplo-valido\ndescription: Orienta a manutenção do exemplo.\n---\n# Exemplo\n';
function check(t, content) { const root = temporary(t); put(root, 'SKILL.md', content); return validateSkill(root); }
test('validador aceita campos opcionais e descrição YAML multilinha', t => {
  assert.equal(check(t, '---\nname: exemplo-valido\ndescription: >\n  Orienta o uso\n  do exemplo.\nlicense: MIT\nallowed-tools: Read\nmetadata:\n  dominio: testes\n---\n# Exemplo\n').valid, true);
});
test('validador recusa arquivo ausente, YAML inválido, chaves duplicadas e mapa inválido', t => {
  assert.equal(validateSkill(temporary(t)).valid, false);
  for (const content of ['# Sem frontmatter\n', '---\nname: [\n---\n', '---\n- item\n---\n', '---\nname: um\nname: dois\ndescription: Texto\n---\n', '---\nfalse\n---\n', '---\nname: nome\ndescription: !tag-desconhecida texto\n---\n']) assert.equal(check(t, content).valid, false, content);
});
test('validador exige nomes e descrições com tipos e limites válidos', t => {
  for (const replacement of ['name: 12', 'name: ""', 'name: Nome-Invalido', 'name: -nome', 'name: nome-', 'name: dois--hifens', 'name: ' + 'a'.repeat(65)]) assert.equal(check(t, valid.replace('name: exemplo-valido', replacement)).valid, false, replacement);
  for (const replacement of ['description: 12', 'description: "<texto>"', 'description: ' + 'a'.repeat(1025), 'description: "[TODO: preencher]"']) assert.equal(check(t, valid.replace('description: Orienta a manutenção do exemplo.', replacement)).valid, false, replacement.slice(0, 50));
  assert.equal(check(t, valid.replace('description:', 'campo-desconhecido:')).valid, false);
});
test('placeholder isolado fora de código falha e exemplos cercados são preservados', t => {
  assert.equal(check(t, valid + '\n[TODO: preencher]\n').valid, false);
  for (const code of ['```text\n[TODO: exemplo]\n```', '~~~~text\n```\n[TODO: exemplo]\n~~~~', '- ```text\n  [TODO: exemplo]\n  ```']) assert.equal(check(t, valid + '\n' + code + '\n').valid, true);
});
test('CLI retorna JSON e código de falha para a skill informada', t => {
  const root = temporary(t); put(root, 'SKILL.md', valid);
  const script = join(ROOT, 'scripts/validate-skills.mjs');
  let result = node(script, [root, '--json']); assert.equal(result.status, 0, result.stderr); assert.equal(JSON.parse(result.stdout)[0].valid, true);
  put(root, 'SKILL.md', '# Sem frontmatter'); result = node(script, [root]); assert.equal(result.status, 1); assert.match(result.stdout, /ERRO/);
});
test('descoberta inclui skills base, especialistas e operações locais', () => {
  const paths = defaultDirectories();
  for (const path of ['skills/specsfy-setup', 'specialists/specsfy-specialist-deploy', '.agents/skills/specsfy-monorepo-documentator', 'cli/.agents/skills/specsfy-release-cli']) assert.ok(paths.includes(join(ROOT, path)), path);
});
