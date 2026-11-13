/** Materializa os steps de Inbox, backlog e importação de MVP em projetos isolados. */
import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { assert, temporary, put, read, text, skill, run, success, includes, normalized, section, paths, join, existsSync, readdirSync } from './helpers.mjs';

const templates = ['Inbox.md', 'Backlog.md', 'Spec.md', 'Tasks.md', 'Project.md', 'Stack.md', 'Rules.md', 'Database.md', 'UserProfile.md'];
const mvp = ctx => { ctx.mvpSkill = skill('specsfy-mvp-milestone-interviewer'); };
const git = (cwd, ...args) => success(spawnSync('git', args, { cwd, encoding: 'utf8' }));
export const captureSteps = [
  ['o contrato central e as skills de inbox, backlog, especificação e validação', ctx => { ctx.contract = read('skills/Spec.md'); ctx.lifecycle = Object.fromEntries(['specsfy-01-inbox', 'specsfy-02-backlog', 'specsfy-03-specify', 'specsfy-04-validate'].map(name => [name, skill(name)])); }],
  ['a saída da Inbox é inspecionada', ctx => { ctx.lifecycleNormalized = Object.fromEntries(Object.entries(ctx.lifecycle).map(([name, source]) => [name, normalized(source).toLowerCase()])); }],
  ['a estrutura canônica declara specs/inbox/processed/', ctx => includes(ctx.contract, ['│   ├── processed/', '`specs/inbox/processed/`'])],
  ['a captura permanece na Inbox até o Definition Gate das specs que a cobrem', ctx => { for (const name of ['specsfy-01-inbox', 'specsfy-03-specify']) { includes(ctx.lifecycle[name], ['`specs/inbox/processed/`']); includes(ctx.lifecycleNormalized[name], ['definition gate']); } includes(ctx.lifecycleNormalized['specsfy-01-inbox'], ['não mover']); }],
  ['só a validação move a captura, pelo CLI, depois de specsfy specs transition para defined', ctx => { const source = ctx.lifecycle['specsfy-04-validate']; const first = source.indexOf('`specsfy specs transition <id> defined`'), second = source.indexOf('`specsfy inbox process <captura> --spec <id>`'); assert.ok(first >= 0 && second > first); includes(ctx.lifecycleNormalized['specsfy-04-validate'], ['parte do pedido']); assert.ok(!ctx.lifecycle['specsfy-02-backlog'].includes('`specsfy inbox process`')); }],
  ['a busca por duplicatas do backlog inclui as capturas processadas', ctx => { includes(ctx.lifecycle['specsfy-02-backlog'], ['`specs/inbox/processed/*.md`']); includes(ctx.lifecycleNormalized['specsfy-02-backlog'], ['não alterar, mover nem apagar entradas de inbox']); }],
  ['um projeto consumidor inicializado para a Inbox', ctx => { ctx.project = temporary(ctx.t); put(ctx.project, '.specsfy/templates/Inbox.md', read('skills/templates/Inbox.md')); ctx.skill = skill('specsfy-01-inbox'); }],
  ['o agente recebe somente o texto da entrada', ctx => {
    ctx.original = 'Quero avisar clientes quando uma entrega atrasar, talvez por e-mail.';
    ctx.result = run('specsfy-01-inbox/scripts/capturar_inbox.mjs', ['--input', ctx.original, '--title', 'Avisar clientes sobre atrasos', '--summary', 'Notificar clientes afetados por atrasos.', '--problem', 'Clientes ficam sem contexto quando a entrega atrasa.', '--people', 'Clientes com entrega em andamento.', '--value', 'Reduzir incerteza durante atrasos.', '--signals', 'Canal sugerido: e-mail.', '--review', 'Definir gatilho e conteúdo.', '--root', ctx.project]);
    success(ctx.result); ctx.created = ctx.result.stdout.trim();
  }],
  ['ele não faz perguntas nem solicita confirmação', ctx => includes(normalized(ctx.skill).toLowerCase(), ['não faça perguntas', 'não peça confirmação'])],
  ['cria specs/inbox/data-hora-slug.md a partir do template instalado', ctx => { assert.ok(ctx.created.startsWith(join(ctx.project, 'specs/inbox') + '/')); assert.ok(ctx.created.endsWith('-avisar-clientes-sobre-atrasos.md')); assert.ok(existsSync(ctx.created)); }],
  ['preserva o texto original e separa análise, inferências e pontos a revisar', ctx => includes(text(ctx.project, ctx.created.slice(ctx.project.length + 1)), [ctx.original, '## Análise inicial', '**Inferência:**', '## Pontos a revisar no futuro'])],
  ['não cria backlog, spec, tarefas ou código', ctx => { assert.deepEqual(paths(join(ctx.project, 'specs')).sort(), ['inbox', 'inbox/' + ctx.created.split('/').at(-1)].sort()); }],
  ['uma instalação base do Specsfy', ctx => { ctx.project = temporary(ctx.t); }],
  ['o CLI publica os arquivos estruturais no projeto consumidor', ctx => { ctx.changed = templates.map(name => put(ctx.project, '.specsfy/templates/' + name, read('skills/templates/' + name))); mkdirSync(join(ctx.project, '.specsfy/templates/custom')); }],
  ['.specsfy/templates contém Inbox.md, Backlog.md, Spec.md, Tasks.md, Project.md, Stack.md, Rules.md, Database.md e UserProfile.md', ctx => { assert.deepEqual(readdirSync(join(ctx.project, '.specsfy/templates'), { withFileTypes: true }).filter(entry => entry.isFile()).map(entry => entry.name).sort(), [...templates].sort()); for (const name of templates) assert.ok(ctx.changed.includes(join(ctx.project, '.specsfy/templates', name))); }],
  ['cria .specsfy/templates/custom sem gerenciar seu conteúdo', ctx => { const custom = join(ctx.project, '.specsfy/templates/custom'); assert.ok(existsSync(custom)); assert.ok(!ctx.changed.includes(custom)); }],
  ['um projeto consumidor com MVP.md e BRAND.md na raiz', ctx => { ctx.project = temporary(ctx.t); put(ctx.project, 'MVP.md', '# Produto\n\n## Cadastro de clientes\n\nO sistema deve permitir cadastrar clientes.\n'); put(ctx.project, 'BRAND.md', '# Marca\n\nLinguagem clara para equipes de atendimento.\n'); mvp(ctx); }],
  ['o entrevistador de MVP inicia a descoberta', ctx => { ctx.result = run('specsfy-mvp-milestone-interviewer/scripts/importar_mvp.mjs', ['--root', ctx.project]); success(ctx.result); ctx.imported = JSON.parse(ctx.result.stdout); }],
  ['ele importa MVP.md como a Milestone 1.0 sem sobrescrever uma existente', ctx => { includes(text(ctx.project, 'specs/milestones/M01.md'), ['# Milestone 1.0']); includes(ctx.mvpSkill.toLowerCase(), ['não sobrescreva a milestone 1.0']); }],
  ['cria backlog e spec Draft apenas para cada requisito de desenvolvimento', ctx => { assert.ok(ctx.imported.items.length); assert.ok(!existsSync(join(ctx.project, 'specs/inbox'))); for (const item of ctx.imported.items) for (const name of ['backlog', 'spec']) assert.ok(item[name] && existsSync(join(ctx.project, item[name]))); }],
  ['entrevista cada backlog antes de qualquer promoção', ctx => { includes(normalized(ctx.mvpSkill).toLowerCase(), ['entrevistar cada backlog', 'somente avança quando cada etapa tiver resultado confirmado']); for (const item of ctx.imported.items) if (item.backlog) includes(text(ctx.project, item.backlog), ['$specsfy-02-backlog']); }],
  ['um projeto consumidor instalado como submódulo Git de um Hub', ctx => {
    const root = temporary(ctx.t), source = join(root, 'consumer-source'); ctx.parent = join(root, 'hub');
    for (const path of [source, ctx.parent]) { mkdirSync(path); git(path, 'init', '-q'); git(path, 'config', 'user.email', 'tests@example.com'); git(path, 'config', 'user.name', 'Specsfy tests'); }
    put(source, 'README.md', '# Consumidor\n'); git(source, 'add', 'README.md'); git(source, 'commit', '-qm', 'inicializa consumidor');
    git(ctx.parent, '-c', 'protocol.file.allow=always', 'submodule', 'add', source, 'consumer'); git(ctx.parent, 'commit', '-qm', 'adiciona consumidor'); ctx.project = join(ctx.parent, 'consumer');
  }],
  ['MVP.md e BRAND.md estão somente na raiz do Hub', ctx => { put(ctx.parent, 'MVP.md', '# Produto\n\n## Consultar clientes\n\nO sistema deve consultar clientes.\n'); put(ctx.parent, 'BRAND.md', '# Marca\n\nComunicação direta.\n'); git(ctx.parent, 'add', 'MVP.md', 'BRAND.md'); git(ctx.parent, 'commit', '-qm', 'adiciona contexto do hub'); mvp(ctx); }],
  ['ele consulta os arquivos da raiz do Hub', ctx => includes(normalized(ctx.mvpSkill).toLowerCase(), ['superprojeto', 'mvp.md', 'brand.md'])],
  ['importa o MVP como a Milestone 1.0 sem criar Inboxes no projeto consumidor', ctx => { includes(text(ctx.project, 'specs/milestones/M01.md'), ['MVP.md']); assert.ok(!existsSync(join(ctx.project, 'specs/inbox'))); }],
  ['um projeto consumidor vazio para backlog', ctx => { ctx.project = temporary(ctx.t); }],
  [/^o agente registra a ideia "([^"]+)"$/, (ctx, title) => { ctx.result = run('specsfy-02-backlog/scripts/iniciar_backlog.mjs', ['--title', title, '--idea', `Quero registrar a ideia: ${title}.`, '--problem', 'A equipe não possui uma visão consolidada do andamento.', '--person', 'Pessoas responsáveis pelo produto.', '--result', 'Acompanhar o andamento das entregas.', '--context', 'Durante a revisão semanal do produto.', '--root', ctx.project]); }],
  ['o arquivo specs/backlog/0001-painel-de-acompanhamento.md é criado', ctx => { success(ctx.result); ctx.backlog = text(ctx.project, 'specs/backlog/0001-painel-de-acompanhamento.md'); }],
  ['suas metainformações aparecem em uma tabela no topo', ctx => { const lines = ctx.backlog.split('\n'); assert.equal(lines[2], '| Metainformação | Valor |'); assert.equal(lines[3], '| --- | --- |'); includes(ctx.backlog, ['| ID | BACKLOG-0001 |']); assert.ok(!ctx.backlog.includes('**ID**:')); }],
  ['nenhuma especificação convertida é criada', ctx => assert.ok(!existsSync(join(ctx.project, 'specs/specs')))],
  ['uma ideia de backlog com informações essenciais ausentes ou ambíguas', ctx => { ctx.skill = skill('specsfy-02-backlog'); }],
  ['o agente avalia se a ideia está minimamente completa', ctx => { ctx.minimum = section(ctx.skill, '## Garantir a captura mínima'); }],
  ['ele apresenta exatamente uma pergunta numerada por rodada', ctx => includes(normalized(ctx.minimum), ['lacuna real de maior impacto'])],
  ['reavalia o que falta depois de cada resposta', ctx => includes(ctx.minimum, ['Reavalie as lacunas depois de cada resposta'])],
  ['só persiste o backlog quando problema, pessoa, resultado e contexto estão claros', ctx => includes(ctx.minimum, ['problema percebido', 'pessoa afetada ou beneficiada', 'resultado ou valor esperado', 'contexto suficiente para distinguir a entrada', 'Não crie nem atualize o arquivo enquanto algum item essencial'])],
  ['um pedido para registrar uma ideia de backlog', ctx => { ctx.skill = skill('specsfy-02-backlog'); }],
  ['o agente procura material relacionado', ctx => { ctx.search = section(ctx.skill, '## Buscar duplicatas e referências'); }],
  ['ele pesquisa termos do pedido em backlogs, specs e documentação', ctx => includes(ctx.search, ['termos derivados do pedido do usuário', '`specs/backlog/*.md`', '`specs/<estado>/*/spec.md`', '`docs/**/*.md`'])],
  ['confirma com o usuário antes de criar uma possível duplicata', ctx => includes(ctx.search, ['possível duplicata', 'confirme com o usuário'])],
  ['preserva referências relevantes no item', ctx => includes(ctx.search, ['Referências relacionadas'])],
  ['uma ideia de backlog que depende de informações lembradas pelo sistema', ctx => { ctx.data = skill('specsfy-data-discovery'); }],
  ['o agente identifica a necessidade de entender essas informações', ctx => { ctx.backlogSkill = skill('specsfy-02-backlog'); }],
  ['ele transita para specsfy-data-discovery antes de concluir o brief', ctx => includes(normalized(ctx.backlogSkill).toLowerCase(), ['$specsfy-data-discovery', 'retome o backlog com o registro confirmado'])],
  ['registra somente respostas confirmadas em .specsfy/DATABASE.md', ctx => includes(normalized(ctx.data).toLowerCase(), ['somente respostas confirmadas', '.specsfy/database.md'])],
];
