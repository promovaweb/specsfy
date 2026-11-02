/** Preserva alocação concorrente de specs, migrations e encaminhamentos conversacionais. */
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { runContract } from '../../../tests/bdd.mjs';
import { assert, temporary, read, text, skill, run, success, includes, normalized, paths, join, existsSync, readdirSync, ROOT } from './helpers.mjs';

const initialize = (cwd, title, root) => run('specsfy-03-specify/scripts/iniciar_spec.mjs', ['--title', title, ...(root ? ['--root', root] : [])], { cwd });
const empty = ctx => { ctx.project = temporary(ctx.t); assert.ok(!existsSync(join(ctx.project, 'specs'))); };
const loadContract = ctx => { ctx.contract = normalized([read('skills/Spec.md'), ...['specsfy-01-inbox', 'specsfy-02-backlog', 'specsfy-03-specify', 'specsfy-04-validate', 'specsfy-05-tasks', 'specsfy-06-tdd-bdd', 'specsfy-07-implement', 'specsfy-update-spec', 'specsfy-progress'].map(skill)].join('\n')); };
const evaluate = ctx => assert.ok(ctx.contract);
const migrationCheck = (ctx, pattern) => { runContract('skills/tests/migration-runner.test.mjs', pattern); ctx.migrationChecked = true; };

/** Mantém os dois processos ativos ao mesmo tempo, capturando erros sem shell. */
function concurrentSpec(root, title) {
  return new Promise((accept, reject) => {
    const child = spawn(process.execPath, [join(ROOT, 'skills/specsfy-03-specify/scripts/iniciar_spec.mjs'), '--title', title], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', data => { stdout += data; }); child.stderr.on('data', data => { stderr += data; });
    child.once('error', reject); child.once('close', status => accept({ status, stdout, stderr }));
  });
}
export const executionSteps = [
  ['um diretório de trabalho sem pasta specs', empty], ['um diretório de trabalho sem specs', empty],
  [/^o agente inicia a spec "([^"]+)"$/, (ctx, title) => { ctx.result = initialize(ctx.project, title); }],
  ['o arquivo specs/draft/0001-minha-primeira-feature/spec.md é criado nesse diretório', ctx => { success(ctx.result); ctx.spec = 'specs/draft/0001-minha-primeira-feature/spec.md'; assert.ok(existsSync(join(ctx.project, ctx.spec))); assert.ok(!existsSync(join(ctx.project, 'specs/draft/0001-minha-primeira-feature/0001-spec.md'))); }],
  ['o cabeçalho é uma tabela com ID, título, slug e data preenchidos', ctx => { const source = text(ctx.project, ctx.spec); includes(source, ['| Campo | Valor |', '| --- | --- |', '| ID | SPEC-0001 |', '# Especificação integrada: Minha Primeira Feature', '| Slug | 0001-minha-primeira-feature |', '| Atualizada em |']); assert.ok(!source.includes('**ID**:')); assert.ok(!source.includes('{{')); }],
  ['o arquivo preserva os três atos e as dezoito seções', ctx => { const source = text(ctx.project, ctx.spec); assert.equal(source.split('## Ato ').length - 1, 3); assert.equal(source.split('\n').filter(line => /^### \d{1,2}[. ]/.test(line)).length, 18); }],
  ['o agente está fora do diretório do projeto alvo', ctx => { ctx.outside = temporary(ctx.t); ctx.project = temporary(ctx.t); }],
  ['o agente inicia uma spec informando a raiz do projeto alvo', ctx => { ctx.result = initialize(ctx.outside, 'Raiz Explicita', ctx.project); }],
  ['a spec é criada somente sob a raiz informada', ctx => { success(ctx.result); assert.ok(existsSync(join(ctx.project, 'specs/draft/0001-raiz-explicita/spec.md'))); assert.ok(!existsSync(join(ctx.outside, 'specs'))); }],
  ['um projeto com specs convertidas 0001-primeira, 0003-terceira e legado', ctx => { ctx.project = temporary(ctx.t); for (const name of ['0001-primeira', '0003-terceira', 'legado']) mkdirSync(join(ctx.project, 'specs/draft', name), { recursive: true }); }],
  ['o agente inicia uma nova spec', ctx => { ctx.result = initialize(ctx.project, 'Quarta'); }],
  ['a nova spec recebe o ID SPEC-0004', ctx => { success(ctx.result); ctx.spec = 'specs/draft/0004-quarta/spec.md'; includes(text(ctx.project, ctx.spec), ['| ID | SPEC-0004 |']); }],
  ['seu diretório começa com 0004-', ctx => assert.ok(ctx.spec.split('/').at(-2).startsWith('0004-'))],
  ['duas inicializações no mesmo projeto vazio', empty],
  ['ambas alocam um identificador', async ctx => { ctx.results = await Promise.all(['Alpha', 'Beta'].map(title => concurrentSpec(ctx.project, title))); }],
  ['os diretórios criados possuem os IDs 0001 e 0002 sem duplicidade', ctx => { ctx.results.forEach(success); assert.deepEqual(readdirSync(join(ctx.project, 'specs/draft')).sort().map(name => name.slice(0, 4)), ['0001', '0002']); }],
  ['o agente tenta iniciar uma spec com título sem caracteres alfanuméricos', ctx => { ctx.result = initialize(ctx.project, '!!!'); }],
  ['o comando termina com erro acionável', ctx => { assert.notEqual(ctx.result.status, 0); includes(ctx.result.stderr.toLowerCase(), ['erro:']); }],
  ['nenhum spec.md parcial é criado', ctx => assert.deepEqual(paths(ctx.project).filter(path => path.endsWith('/spec.md') || path === 'spec.md'), [])],
  ['os validadores de tarefas e comprovação do Specsfy', ctx => { ctx.tasks = read('skills/specsfy-05-tasks/scripts/validate_tasks.mjs'); ctx.evidence = read('skills/specsfy-07-implement/scripts/verify_evidence.mjs'); }],
  ['o contrato de migrations planejadas é inspecionado', ctx => { ctx.migrationContract = ctx.tasks + '\n' + ctx.evidence; }],
  ['toda alteração estrutural do banco exige uma tarefa MIGRATION', ctx => includes(ctx.tasks, ['SCHEMA_CHANGE_TASK', 'sem uma tarefa [MIGRATION]', 'MIGRATION_PATH'])],
  ['a conclusão exige arquivo aplicação e consulta de estado', ctx => includes(ctx.evidence, ['migration planejada ainda não foi concluída', 'migration não aparece nos arquivos produzidos', 'comando de aplicação da migration ausente', 'comando de conferência da migration ausente'])],
  ['um projeto com apply e status válidos em .specsfy/migrations.json', ctx => { ctx.migration = 'valid'; }],
  ['uma tarefa MIGRATION registra arquivo existente e ambos os comandos com saída zero', ctx => { assert.equal(ctx.migration, 'valid'); migrationCheck(ctx, '^#52: aceita aplicação e consulta'); }],
  ['o contrato estrito aceita a conclusão sem executar o runner', ctx => assert.equal(ctx.migrationChecked, true)],
  ['um projeto com .specsfy/migrations.json inválido', ctx => { ctx.migration = 'invalid'; }],
  ['o contrato estrito de comprovação é verificado', ctx => { assert.equal(ctx.migration, 'invalid'); migrationCheck(ctx, '^#52: configuração inválida'); }],
  ['o resultado informa o arquivo de configuração e termina com falha', ctx => assert.equal(ctx.migrationChecked, true)],
  ['um projeto com .specsfy/migrations.json', ctx => { ctx.migration = 'stack'; }],
  ['a stack é atualizada duas vezes', ctx => { assert.equal(ctx.migration, 'stack'); migrationCheck(ctx, '^#52: stack registra'); }],
  ['STACK.md registra o runner e a segunda execução não altera os arquivos', ctx => assert.equal(ctx.migrationChecked, true)],
  ...['uma skill base concluiu sua responsabilidade', 'uma etapa posterior encontra uma pendência de uma etapa anterior', 'uma transição automática exige uma ação sensível', 'as quatorze skills base instaladas'].map(step => [step, loadContract]),
  ...['ela identifica a próxima etapa responsável', 'ela identifica a skill responsável pela correção', 'a skill responsável é carregada', 'o estado canônico exige outra responsabilidade'].map(step => [step, evaluate]),
  ['anuncia a transição, o motivo e a pendência ou resultado esperado', ctx => includes(ctx.contract, ['Transição automática:', 'motivo', 'Pendência detectada:'])],
  ['carrega automaticamente a skill de destino sem pedir confirmação', ctx => includes(ctx.contract, ['sem pedir confirmação', 'carregue imediatamente a skill de destino'])],
  ['continua na mesma conversa sem pedir o comando novamente', ctx => includes(ctx.contract, ['mesma conversa', 'não peça que a pessoa repita o comando'])],
  ['anuncia a pendência e executa o retorno', ctx => includes(ctx.contract, ['Pendência detectada:', 'retorno'])],
  ['após a correção retoma automaticamente a etapa que detectou a pendência', ctx => includes(ctx.contract, ['Retomada automática:'])],
  ['a cadeia principal chama inbox, backlog, specify, validate, tasks, tdd-bdd, implement e progress', ctx => includes(ctx.contract, ['specsfy-02-backlog', 'specsfy-03-specify', 'specsfy-04-validate', 'specsfy-05-tasks', 'specsfy-06-tdd-bdd', 'specsfy-07-implement', 'specsfy-progress'].map(name => '$' + name))],
  ['mudança tardia chama update-spec automaticamente', () => includes(normalized(skill('specsfy-07-implement')), ['carregue automaticamente `$specsfy-update-spec`'])],
  ['ausência de especificação chama specify automaticamente', () => includes(normalized(skill('specsfy-progress')), ['carregue automaticamente `$specsfy-update-spec`'])],
  ['o handoff não pede confirmação', ctx => includes(ctx.contract.toLowerCase(), ['não peça confirmação para o handoff'])],
  ['a ação sensível continua exigindo autorização específica', ctx => includes(ctx.contract, ['autorização específica'])],
];
