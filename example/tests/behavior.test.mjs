/** Executa os cenários do exemplo por contratos Pest reais e documentação Node. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { featureTests, runContract } from '../../tests/bdd.mjs';
import { ROOT, node } from '../../tests/helpers.mjs';
const root = join(ROOT, 'example');
const cases = [
  ['UserDirectoryTest.php', ['existem dezesseis usuários com nomes conhecidos', 'uma pessoa não autenticada consulta usuários']],
  ['UserSearchTest.php', ['existem usuários com nomes semelhantes e diferentes', 'nenhum usuário corresponde ao termo informado']],
  ['UserProfileTest.php', ['um usuário participa de equipes com papéis diferentes', 'não existe usuário com o identificador solicitado']],
  ['TeamDirectoryTest.php', ['existem equipes pessoais e compartilhadas com membros', 'o contrato cobre o estado sem equipes']],
  ['TeamDetailTest.php', ['uma equipe possui owner admin e member', 'existe uma equipe sem membros']],
];
const actions = ['uma pessoa autenticada abre o diretório de usuários', 'ela abre o diretório global de usuários', 'uma pessoa autenticada busca parte de um nome em caixa diferente', 'uma pessoa autenticada realiza a busca de usuário', 'outra pessoa autenticada abre seu perfil público', 'uma pessoa autenticada abre esse perfil inexistente', 'uma pessoa autenticada abre o diretório de equipes', 'uma pessoa autenticada consulta o diretório vazio de equipes', 'uma pessoa autenticada abre o detalhe da equipe', 'uma pessoa autenticada abre o detalhe da equipe vazia'];
const outcomes = ['recebe quinze usuários ordenados por nome e sem e-mails', 'é redirecionada para o login sem receber dados do diretório', 'recebe somente os nomes correspondentes e o filtro normalizado', 'recebe uma página vazia com o termo preservado', 'vê nome estado e equipes com os papéis sem ver e-mail', 'recebe uma resposta de usuário não encontrado', 'vê todas as equipes ordenadas com tipo e contagem de membros', 'vê um estado vazio de equipes sem erro', 'vê o resumo e membros ordenados com seus papéis', 'vê um estado vazio de membros sem dados pessoais'];
const steps = [
  ...cases.flatMap(([file, givens]) => givens.map(step => [step, ctx => {
 ctx.test = 'tests/Feature/Directory/' + file; assert.ok(existsSync(join(root, ctx.test)));
}])),
  ...actions.map(step => [step, ctx => {
    const command = `php artisan test --compact ${ctx.test}`;
    const safety = node(join(ROOT, 'skills/specsfy-setup/scripts/check_database_safety.mjs'), ['--project', root, '--command', command]);
    assert.equal(safety.status, 0, safety.stdout + safety.stderr); assert.match(safety.stdout, /SAFE/);
    ctx.result = spawnSync('php', ['artisan', 'test', '--compact', ctx.test], { cwd: root, encoding: 'utf8', timeout: 60_000 });
  }]),
  ...outcomes.map(step => [step, ctx => assert.equal(ctx.result.status, 0, ctx.result.stdout + ctx.result.stderr)]),
  ['a documentação operacional da aplicação', ctx => {
 ctx.readme = join(root, 'README.md'); assert.ok(existsSync(ctx.readme));
}],
  ['o contrato documental local é executado', ctx => {
 runContract('example/tests/documentation.test.mjs', '.'); ctx.documentationPassed = true;
}],
  ['capacidades fontes rotas e comandos são verificáveis', ctx => assert.equal(ctx.documentationPassed, true)],
];

for (const file of readdirSync(join(root, 'tests/features')).filter(file => file.endsWith('.feature'))) {
featureTests('example/tests/features/' + file, steps);
}
