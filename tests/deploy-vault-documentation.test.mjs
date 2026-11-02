/** Confere as opções reais do parser Node e os exemplos do manual do Vault. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read } from './helpers.mjs';
import { commandOptions } from '../specialists/specsfy-specialist-deploy/assets/vault.mjs';

test('cada ação e opção do Vault possui documentação e cinco exemplos', () => {
  const guide = read('docs/user/deploy-vault.md');
  const blocks = [...guide.matchAll(/```bash\n([\s\S]*?)```/g)].map(match => match[1]);
  for (const action of ['configure-vault', 'run', 'secrets']) {
    assert.ok(guide.includes(`### Comando ${action}`));
    for (const option of Object.keys(commandOptions(action))) assert.ok(guide.includes('`--' + option), option);
    assert.ok(blocks.filter(block => block.includes(`./deploy ${action}`)).length >= 5, action);
  }
});
test('especialistas e guia técnico descrevem execução pelo agente', () => {
  for (const path of ['specialists/specsfy-specialist-deploy/SKILL.md', 'specialists/specsfy-specialist-ansible/SKILL.md', 'docs/develop/skills.md']) {
    const content = read(path);
    for (const term of ['--non-interactive', 'configure-vault']) assert.ok(content.includes(term), path + ': ' + term);
  }
});
