/** Preserva os percursos de usuário e desenvolvimento e sua cobertura pública. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,read} from './helpers.mjs';
const includes=(text,terms)=>{for(const term of terms)assert.ok(text.includes(term),term);};
const user=path=>read('docs/user/'+path),develop=path=>read('docs/develop/'+path);
const base=['specsfy-01-inbox','specsfy-02-backlog','specsfy-03-specify','specsfy-04-validate','specsfy-05-tasks','specsfy-06-tdd-bdd','specsfy-07-implement','specsfy-update-spec','specsfy-progress','specsfy-interviewer','specsfy-mvp-milestone-interviewer','specsfy-data-discovery','specsfy-roadmap-milestone-interviewer','specsfy-milestone-governor'];
test('docs contém somente as árvores user e develop',()=>{
 assert.deepEqual(readdirSync(join(ROOT,'docs'),{withFileTypes:true}).filter(entry=>entry.isDirectory()).map(entry=>entry.name).sort(),['develop','user']);assert.ok(existsSync(join(ROOT,'docs/README.md')));
});
test('portal do usuário cobre a jornada completa',()=>{
 const portal=user('README.md');
 const routes={'Instalação':'installation.md','Primeiro projeto':'getting-started.md','Metodologia':'method.md','Inbox':'inbox.md','CLI e TUI':'cli.md','Informações permanentes do projeto':'project-context.md','Especialistas':'specialists.md','Documentação do sistema':'system-documentation.md','Mudanças posteriores':'update-spec.md','Laravel':'laravel.md','Astro':'astro.md','Next.js':'nextjs.md','Skills base':'skills/README.md','Milestones':'milestones.md'};
 for(const [label,target] of Object.entries(routes)){includes(portal,[label,`](${target})`]);assert.ok(existsSync(join(ROOT,'docs/user',target)));}
 includes(portal.toLowerCase(),['ideia','especificação','teste','implementação','progresso','exemplo']);
});
test('referência do método explica os contratos transversais',()=>{
 includes(user('method-reference.md'),['## A spec como registro único','## Effort','### Faixas e perfis','### Quando atualizar','### Effort não é prioridade','## Estados e transições','### Retornos permitidos','## Gates','### Definition Gate','### Plan Gate','### Delivery Gate','## Anatomia completa da spec','### Ato I: seções 1 a 7','### Ato II: seções 8 a 15','### Ato III: seções 16 a 18','## Identificadores e rastreabilidade','## Tarefas, pesquisa e progresso','## Dúvidas frequentes']);
});
test('guia de documentação explica geração e manutenção',()=>{
 includes(user('system-documentation.md'),['## O que esta documentação explica','## O que é gerado e o que é preservado','## Como ler cada documento','## Procedimento depois de uma mudança','## Situações que impedem a conclusão','docs/architecture.md','docs/database.md','docs/flows.md','docs/testing.md','docs/integrations.md','.specsfy/PACKAGES.md']);
});
test('cada comando público do CLI tem rota documental',()=>{
 const cli=read('cli/src/cli.ts');
 const routes={install:'installation.md',skills:'cli.md',transition:'cli.md',migrate:'cli.md',effort:'method-reference.md',progress:'cli.md',milestones:'milestones.md',test:'cli.md',tui:'cli.md',config:'cli.md'};
 for(const [command,route] of Object.entries(routes)){includes(cli,[`.command("${command}")`]);includes(user(route),['specsfy '+command]);}
});
test('glossário define o vocabulário transversal',()=>{
 includes(develop('context/glossary.md'),['Estado operacional','Status','Transição','Effort','Definition Gate','Plan Gate','Delivery Gate','Rastreabilidade','Projeção de progresso','Contexto persistente','Documentação reconstruída'].map(term=>`| ${term} |`));
});
test('cada skill base tem página aprofundada e acessível',()=>{
 const index=user('skills/README.md');
 for(const name of base){includes(index,[`](${name}.md)`]);includes(user('skills/'+name+'.md'),['`'+name+'`','## Quando usar','## Como descrever a tarefa','## Exemplo passo a passo','## O que esperar','## Erros comuns','## Próximo passo','```text']);}
});
test('percurso develop explica como modificar o framework',()=>{
 const required={'README.md':['agentes','humanos','contribuir'],'methodology.md':['Specsfy/2.0','Ato I','Ato II','Ato III','Definition Gate','Plan Gate','Delivery Gate'],'contributing.md':['RED','GREEN','owner','regressão','documentação'],'skills.md':['SKILL.md','description','agents/openai.yaml','handoff'],'cli.md':['cli/src/','TypeScript','catálogo','GitHub','fingerprint']};
 for(const [path,terms] of Object.entries(required))includes(develop(path),terms);
 for(const path of ['context/README.md','context/documentation.md','context/architecture/modules.md','context/architecture/dependencies.md','context/engineering/testing.md','context/data/privacy.md','context/flows/README.md','decisions/README.md'])assert.ok(existsSync(join(ROOT,'docs/develop',path)),path);
});
test('AGENTS e contextos governam os dois públicos',()=>{
 includes(read('AGENTS.md'),['docs/README.md','apenas o roteador','conteúdo temático','docs/user/','linguagem simples','docs/develop/','agentes e humanos','atualize os dois percursos']);
 includes(develop('context/README.md'),['documentation.md']);includes(develop('context/documentation.md'),['docs/README.md','docs/user/','docs/develop/','uma página por skill base','linguagem simples','agentes e humanos','ambos os percursos']);
});
