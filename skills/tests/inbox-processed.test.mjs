/** Preserva os contratos das skills adicionados pela PR #44 sem usar Python. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read } from '../../tests/helpers.mjs';
const skill = name => read(`skills/${name}/SKILL.md`);
const includes = (text, terms) => terms.forEach(term => assert.ok(text.includes(term), term));
const normalized = text => text.split(/\s+/).join(' ').toLowerCase();
test('contrato central declara a pasta de capturas processadas', () => {
  const source = read('skills/Spec.md'); includes(source, ['│   ├── processed/', '`specs/inbox/processed/`', '`specsfy inbox process`']); includes(normalized(source), ['definition gate']);
});
test('captura descreve a saída futura sem mover entradas anteriores', () => {
  const source = skill('specsfy-01-inbox'); includes(source, ['`specs/inbox/processed/`', '`specsfy inbox process`']); includes(normalized(source), ['definition gate', 'não alterar nem apagar capturas anteriores', 'não mover']);
});
test('backlog busca histórico sem mover capturas', () => {
  const source = skill('specsfy-02-backlog'); includes(source, ['`specs/inbox/processed/*.md`']); includes(normalized(source), ['não alterar, mover nem apagar entradas de inbox']);
});
test('especificação mantém a captura ativa até a aprovação da definição', () => {
  const source = skill('specsfy-03-specify'); includes(source, ['`specs/inbox/processed/`']); includes(normalized(source), ['definition gate']);
});
test('validação só processa a captura integralmente coberta após a transição', () => {
  const source = skill('specsfy-04-validate'); includes(source, ['`specsfy inbox process <captura> --spec <id>`', '`specsfy specs transition <id> defined`', 'permanece em `specs/inbox/`']); assert.ok(source.indexOf('`specsfy specs transition <id> defined`') < source.indexOf('`specsfy inbox process <captura> --spec <id>`')); includes(normalized(source), ['integralmente', 'parte do pedido']);
});
