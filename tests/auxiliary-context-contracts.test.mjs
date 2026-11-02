/** Mantém instalador, guias e blocos publicados alinhados ao contexto auxiliar. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,read} from './helpers.mjs';
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
test('catálogo, instalador e documentação publicam o mesmo contexto',()=>{
 const names=['specsfy-setup','specsfy-aux-stack','specsfy-aux-rules','specsfy-aux-database'];
 const installer=read('cli/src/installer.ts'),guide=read('docs/user/project-context.md'),framework=read('skills/Spec.md');
 for(const name of names){assert.ok(existsSync(join(ROOT,'skills',name,'SKILL.md')));includes(installer,['"'+name+'"']);includes(guide,['$'+name]);}
 for(const path of ['PROJECT.md','DESIGNSYSTEM.MD','.specsfy/USER-PROFILE.md','.specsfy/STACK.md','.specsfy/RULES.md','.specsfy/DATABASE.md','.specify/memory/constitution.md','.specsfy/SPECKIT.md']){includes(framework,[path]);includes(guide,[path]);}
 const setup=read('skills/specsfy-setup/SKILL.md'),script=read('skills/specsfy-setup/scripts/setup_context.mjs');
 includes(script,['sync_speckit_context.mjs','join(project, "DESIGNSYSTEM.MD")','join(project, ".specsfy", "USER-PROFILE.md")']);
 includes(setup,['Nunca','escrever, mover, renomear ou remover','Nas execuções obrigatórias seguintes']);includes(setup.toLowerCase(),['pergunta novamente','iniciante','experiente']);
 includes(framework,['Antes de iniciar qualquer skill do framework']);includes(guide,['antes de iniciar cada skill']);
});
test('referência e AGENTS publicam blocos idênticos',()=>{
 const pattern=/<!-- specsfy:framework:start -->[\s\S]*?<!-- specsfy:framework:end -->/;
 const agents=read('skills/AGENTS.md').match(pattern),reference=read('skills/specsfy-setup/references/framework-instructions.md').match(pattern);
 assert.ok(agents);assert.ok(reference);assert.equal(agents[0].trim(),reference[0].trim());
});
test('skills de execução compartilham o monitor de contexto',()=>{
 const source=read('skills/specsfy-setup/scripts/monitor_context.mjs');
 includes(source,['.specsfy/STACK.md','.specsfy/RULES.md','.specsfy/DATABASE.md','.specsfy/USER-PROFILE.md','PROJECT.md']);
 for(const name of ['specsfy-05-tasks','specsfy-07-implement','specsfy-progress'])includes(read(`skills/${name}/SKILL.md`),['monitor_context.mjs']);
});
