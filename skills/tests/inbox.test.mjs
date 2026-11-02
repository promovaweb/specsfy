/** Porta captura de Inbox e importação de MVP com projetos descartáveis. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { ROOT, read, temporary, put, node } from '../../tests/helpers.mjs';
const script = join(ROOT, 'skills/specsfy-01-inbox/scripts/capturar_inbox.mjs');
const importer = join(ROOT, 'skills/specsfy-mvp-milestone-interviewer/scripts/importar_mvp.mjs');
const template = read('skills/templates/Inbox.md');
const includes = (text, terms) => { for (const term of terms) assert.ok(text.includes(term), term); };
function fixture(t) { const root = temporary(t); put(root, '.specsfy/templates/Inbox.md', template); return root; }
function capture(root, args) {
  const result = node(script, [...args, '--root', root]);
  assert.equal(result.status, 0, result.stderr);
  const path = result.stdout.trim();
  return { path, content: readFileSync(path, 'utf8') };
}
test('Inbox captura sem perguntas e preserva o texto original', () => {
  const skill = read('skills/specsfy-01-inbox/SKILL.md').split(/\s+/).join(' ').toLowerCase();
  includes(skill, ['não faça perguntas','não peça confirmação','texto original','declaração','inferência','a revisar']);
  includes(template, ['## Texto original','## Análise inicial','## Pontos a revisar no futuro','Informações que talvez precisem ser guardadas']);
});
test('captura gera timestamp, slug e seções pré-processadas', t => {
  const root = fixture(t), idea = 'Quero um modo de avisar clientes quando uma entrega atrasar, talvez por e-mail.';
  const result = capture(root, ['--input', idea, '--title','Avisar clientes sobre atrasos','--summary','Notificar clientes afetados por atrasos de entrega.','--problem','Clientes não recebem contexto quando a entrega atrasa.','--people','Clientes com entrega em andamento.','--value','Reduzir incerteza durante atrasos.','--signals','Canal sugerido no texto: e-mail.','--review','Definir gatilho, destinatários e conteúdo da notificação.']);
  assert.match(basename(result.path), /^\d{4}-\d{2}-\d{2}-\d{6}-avisar-clientes-sobre-atrasos\.md$/);
  assert.equal(dirname(result.path), join(root, 'specs/inbox'));
  includes(result.content, [idea,'Notificar clientes afetados','Clientes não recebem contexto','Clientes com entrega','Reduzir incerteza','Canal sugerido','Definir gatilho','Não identificado no texto original.']);
  assert.match(result.content, /\| Capturada em \| \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  for (const path of ['specs/backlog','specs/draft']) assert.ok(!existsSync(join(root, path)));
});
test('capturas consecutivas nunca sobrescrevem uma ideia', t => {
  const root = fixture(t), args = ['--input','Uma ideia curta.','--title','Ideia curta'];
  assert.notEqual(capture(root,args).path, capture(root,args).path);
  assert.equal(readdirSync(join(root,'specs/inbox')).filter(name => name.endsWith('.md')).length, 2);
});
test('template customizado tem precedência sobre o instalado', t => {
  const root = fixture(t);
  put(root,'.specsfy/templates/Inbox.md',template.replace('# Inbox:', '# Template padrão:'));
  put(root,'.specsfy/templates/custom/Inbox.md',template.replace('# Inbox:', '# Template customizado:'));
  const { content } = capture(root,['--input','Capturar com template customizado.','--title','Precedência customizada']);
  assert.ok(content.includes('# Template customizado:'));
  assert.ok(!content.includes('# Template padrão:'));
});
test('captura registra sessão, turno e fontes da conversa', t => {
  const root = fixture(t);
  const { content } = capture(root,['--input','Quero validar a primeira jornada do produto.','--title','Descoberta do produto','--session','DESC-20260820-produto','--turn','2','--sources','- `MVP.md`: presente e consultado.\n- `BRAND.md`: presente e consultado.']);
  includes(content,['DESC-20260820-produto','| Turno da conversa | 2 |','`MVP.md`: presente e consultado.','`BRAND.md`: presente e consultado.']);
});
test('entrevista do MVP consulta contexto e preserva milestone confirmada', () => {
  const source = read('skills/specsfy-mvp-milestone-interviewer/SKILL.md');
  const normalized = source.split(/\s+/).join(' ').toLowerCase();
  includes(normalized,['`mvp.md`','`brand.md`','fila ordenada de backlogs','`specs/milestones/m01.md`','milestone 1.0','não sobrescreva a milestone 1.0','texto integral da opção escolhida','informação a guardar ausente ou ambígua','superprojeto']);
  includes(source,['$specsfy-01-inbox','$specsfy-02-backlog','$specsfy-data-discovery','$specsfy-milestone-governor','$specsfy-03-specify','Português do Brasil','--show-superproject-working-tree']);
});
test('MVP gera milestone e backlogs entrevistáveis sem Inbox', t => {
  const root = temporary(t);
  put(root,'MVP.md','# Produto\n\n## Captar pedidos\n\nReceber pedidos de clientes.\n\n## Acompanhar pedidos\n\nMostrar o andamento de cada pedido.\n');
  const result = node(importer,['--root',root]);
  assert.equal(result.status,0,result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.milestone,'specs/milestones/M01.md');
  assert.equal(payload.items.length,2);
  const milestone = readFileSync(join(root,payload.milestone),'utf8');
  includes(milestone,['# Milestone 1.0','Requisitos de desenvolvimento importados: 2.']);
  assert.ok(!milestone.includes('Receber pedidos de clientes.'));
  assert.ok(!existsSync(join(root,'specs/inbox')));
  const themes = ['Receber pedidos de clientes.','Mostrar o andamento de cada pedido.'];
  for (const [index,item] of payload.items.entries()) {
    const text = readFileSync(join(root,item.backlog),'utf8');
    includes(text,['specs/milestones/M01.md','## Registros confirmados no MVP',themes[index],'Pergunte somente sobre lacuna, ambiguidade ou contradição']);
    for (const term of ['A esclarecer na entrevista a partir','A esclarecer com a pessoa responsável pelo MVP.']) assert.ok(!text.includes(term));
  }
});
test('importação não sobrescreve a primeira milestone', t => {
  const root=temporary(t);
  put(root,'MVP.md','# Produto\n\nPrimeira jornada.\n');
  put(root,'specs/milestones/M01.md','Conteúdo existente.\n');
  const result=node(importer,['--root',root]);
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/não será sobrescrita/);
  assert.ok(!existsSync(join(root,'specs/inbox')));
  assert.equal(readFileSync(join(root,'specs/milestones/M01.md'),'utf8'),'Conteúdo existente.\n');
});
