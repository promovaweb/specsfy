---
name: specsfy-08-operational-audit
description: "Use depois que uma SPEC chegar a completed para auditar ações adicionais diretamente causadas pela entrega, incluindo revalidação automatizada, build e validação manual em runtime. Delimita escopo, aplica causalidade, evita falsos positivos e não executa operações sem autorização."
---

# Auditar a efetivação pós-feature

Use esta skill somente depois que a SPEC estiver concluída no fluxo do Specsfy.
Ela não reabre gates, não implementa código e não substitui deploy, delivery
engineering ou especialistas de infraestrutura.

## Objetivo

Responder com precisão:

> A implementação da SPEC terminou. Existe alguma ação operacional, técnica ou
> de validação diretamente causada por esta SPEC que ainda precisa ser realizada
> para que a feature esteja efetivamente pronta e validada?

A auditoria distingue:

1. implementação concluída;
2. validação técnica concluída;
3. validação funcional em runtime concluída;
4. operacionalização concluída;
5. deploy/ativação, quando fizer parte do objetivo real.

Ela não procura melhorias gerais, dívidas antigas ou boas práticas abstratas.

## Modo de interação

Modo de interação: sem perguntas durante a auditoria. Se um processo necessário
não estiver documentado, registre a incerteza em vez de inventar uma resposta.
Qualquer execução posterior exige pedido ou autorização explícita da pessoa.

## Passo 0 — delimitar o escopo da SPEC

Antes de avaliar qualquer categoria, determine quais mudanças pertencem à SPEC.
Use, nesta ordem:

1. artefatos e rastreabilidade registrados pelo Specsfy;
2. a SPEC concluída e suas tarefas/evidências;
3. commits explicitamente associados à entrega;
4. diff desses commits contra a base anterior;
5. branch da feature contra a branch-base, quando aplicável.

Não presuma que todo o working tree, todo o branch ou toda alteração recente
pertence à SPEC. Separe mudanças anteriores, paralelas ou locais não relacionadas.
Se o escopo não puder ser delimitado com confiança, declare a limitação e não
atribua arquivos à SPEC por inferência silenciosa.

## Regras absolutas

Durante esta skill, não execute nenhuma ação. Não altere arquivos, não reabra a
SPEC, não implemente código, não faça commit ou push, não faça deploy, não
execute migrations ou seeds, não reinicie processos, não faça rebuild
operacional, não limpe caches, não altere banco, variáveis, infraestrutura,
serviços externos ou artefatos publicados.

Comandos de inspeção só podem ser usados quando forem comprovadamente somente
leitura e sem efeitos colaterais. Não consulte produção, infraestrutura remota
ou serviços externos apenas para confirmar estado sem autorização explícita.

## Regra de causalidade

Uma ação só é pendente desta feature quando ambas forem verdadeiras:

1. a SPEC criou ou alterou algo que exige essa ação;
2. a ação é necessária para que o comportamento implementado funcione ou seja
   corretamente validado no ambiente aplicável.

Boa prática geral não é pendência da feature. Exemplos:

- SPEC sem migration → migrations = `NÃO NECESSÁRIO`;
- SPEC sem variável nova → env/secrets = `NÃO NECESSÁRIO`;
- SPEC sem alteração de Dockerfile/stack → infraestrutura = `NÃO NECESSÁRIO`;
- SPEC sem interface, rota ou fluxo visível → validação manual em runtime pode
  ser `NÃO NECESSÁRIO`.

## Regra de evidência

Baseie conclusões apenas em evidência concreta da SPEC, tarefas, commits, diff,
migrations, seeders, configuração, scripts, package manager, lockfiles,
frontend, jobs, CI/CD, scripts de desenvolvimento, build, deploy e documentação
factual do projeto.

Não invente comandos como `npm install`, `npm ci`, `npm run build`,
`npm run dev`, `php artisan serve`, `docker build`, `docker stack deploy`,
`php artisan migrate`, `php artisan db:seed`, `cache:clear`, `route:cache`,
`config:cache`, `queue:restart` ou restart de serviço sem evidência de que esse é
o procedimento real do projeto.

## Estados permitidos

Use exatamente um estado por categoria:

| Estado | Definição |
| --- | --- |
| `NÃO NECESSÁRIO` | a SPEC não criou necessidade adicional nessa categoria |
| `JÁ CONCLUÍDO` | a SPEC exigia a ação/validação e há evidência de que ela foi realizada |
| `PENDENTE` | a SPEC exige a ação/validação e ela ainda não foi realizada |
| `REQUER AUTORIZAÇÃO` | a necessidade está comprovada e a execução modifica ambiente, dados ou infraestrutura |
| `INCERTO — PROCESSO NÃO DOCUMENTADO` | a necessidade está comprovada, mas o procedimento real não está documentado |

Nunca use `INCERTO` apenas porque o funcionamento geral de produção é desconhecido.
Primeiro deve existir uma necessidade causal criada pela SPEC.

## Categorias

Avalie cada categoria somente além de `NÃO NECESSÁRIO` quando houver evidência
causal concreta:

| # | Categoria | Evidência que pode torná-la necessária |
| --- | --- | --- |
| 1 | Migrations | migration criada/alterada, schema, constraint ou índice alterado |
| 2 | Banco/backfill/dados | backfill, transformação, atualização, recálculo ou reprocessamento |
| 3 | Seeds | seeder, lookup, role/permissão inicial ou dado obrigatório novo |
| 4 | Cache/config | mudança que comprovadamente exige reconstrução/recarga operacional |
| 5 | Assets/frontend | CSS/JS/assets processados por build |
| 6 | Env/secrets | variável, secret, token, endpoint, flag, chave ou credencial nova/alterada |
| 7 | Workers/queues/scheduler | job, listener, queue, consumer, scheduler ou cron alterado |
| 8 | Processos persistentes | Octane, Horizon, RoadRunner, Swoole, WebSocket, daemon ou processo residente afetado |
| 9 | Infraestrutura | Dockerfile, compose, stack, k8s, proxy, volumes, rede, storage ou CI/CD alterado |
| 10 | Deploy/release | promoção para ambiente-alvo comprovadamente necessária |
| 11 | Serviços externos | API, webhook, OAuth, SaaS, DNS, SMTP, pagamento, storage ou integração externa |
| 12 | Permissões/IAM | configuração operacional/externa de acesso |
| 13 | Storage/filesystem | diretório, symlink, volume, bucket, mount ou permissão nova |
| 14 | Validação automatizada pós-ação | ação operacional alterou estado e exige nova prova automatizada |
| 15 | Validação manual em runtime | interface, rota ou comportamento visível precisa ser provado executando a aplicação |
| 16 | Observabilidade pós-ativação | somente se houver ativação/deploy efetivamente pendente |
| 17 | Backup/rollback | mudança destrutiva, migration relevante, transformação de dados ou risco operacional específico |
| 18 | Compatibilidade de release | schema/código incompatíveis, payload de fila, API, sessão, cache ou rolling deploy |
| 19 | Smoke test | somente se houver runtime/deploy/ativação a validar |
| 20 | Outras ações externas | feature flag, cadastro externo, sincronização, reprocessamento ou ativação manual |

## Migrations

Se a SPEC criou ou alterou migrations, determine qual migration, ambiente,
dependência funcional, risco de lock/perda de dados, compatibilidade, ordem com
deploy, necessidade de backup e validação posterior. Se não houve migration:
`NÃO NECESSÁRIO`. Não peça `migrate:status` apenas por precaução.

## Revalidação após migration

Migration aplicada com sucesso não prova a feature. Quando aplicável, a sequência
é:

```text
migration aplicada
→ confirmar estado da migration
→ testes focais
→ suíte completa
→ build/lint/type checks, quando relacionados
→ smoke test
→ confirmação funcional
```

Se o projeto possui suíte automatizada completa aplicável e a ação alterou
schema, prefira recomendar também a suíte completa, além dos testes focais. Use
somente comandos comprovados pelo projeto.

## Testes automatizados pós-ação

Determine se alguma ação operacional exige reexecução de testes, por exemplo
migration, seed, configuração, dependência, restart, rebuild de assets ou deploy.
Diferencie teste focal, suíte relacionada e suíte completa. Não considere a ação
concluída apenas porque o comando operacional retornou código zero.

## Assets e build

Se a SPEC alterou frontend, diferencie source alterado, build validado, artefato
gerado, publicação necessária e ambiente que precisa carregá-lo. Build verde não
prova interface funcional em runtime nem publicação no ambiente.

Só recomende `npm run build` ou equivalente quando o próprio projeto comprovar o
comando. O build deve provar compilação e geração dos artefatos esperados.

## Validação manual em runtime

Se a SPEC criou ou alterou interface, formulário, rota, autenticação,
autorização, navegação, fluxo HTTP, assets ou comportamento visível, determine
se é necessária validação manual em ambiente executável.

Quando aplicável, confirme:

- aplicação inicia sem erro;
- rota principal responde;
- tela renderiza corretamente;
- assets carregam;
- interação principal funciona;
- erro/estado alternativo relevante funciona;
- autorização e isolamento funcionam, quando aplicável;
- logout funciona, quando aplicável;
- não há erro visual ou de runtime relevante;
- responsividade, foco e teclado, quando fizerem parte do aceite.

Se essa validação já está registrada na SPEC, use `JÁ CONCLUÍDO` e não peça
repetição sem causa nova.

## Diferenciar runtime local de deploy

Servidor local/dev serve para validar a feature; não é deploy. Staging/produção
é ambiente operacional e pode exigir release, rollout, restart e smoke test.
Não trate `php artisan serve`, `npm run dev` ou equivalente como promoção de
produção.

Se a validação manual exige subir a aplicação, determine o mecanismo real pelos
scripts/documentação do projeto. Se a necessidade é comprovada, mas o mecanismo
não está documentado, use `INCERTO — PROCESSO NÃO DOCUMENTADO`.

## Cache/config

Não recomende limpeza ou rebuild genérico. Só considere necessário quando houver
evidência de que o cache é usado, a SPEC exige reconstrução e o processo não faz
isso automaticamente. Avalie impacto em rate limiting, sessão, locks, filas e
dados operacionais antes de sugerir qualquer ação.

## Deploy/release

Primeiro determine se há evidência de que a SPEC deve ser promovida para algum
ambiente. Diferencie implementação/versionamento, validação local e ativação em
staging/produção.

- `JÁ CONCLUÍDO`: há evidência de que a versão está ativa no ambiente-alvo;
- `PENDENTE`: ambiente e processo são conhecidos e a versão ainda não foi promovida;
- `REQUER AUTORIZAÇÃO`: deploy comprovadamente necessário e dependente de autorização;
- `INCERTO — PROCESSO NÃO DOCUMENTADO`: promoção necessária, mas mecanismo real ausente;
- `NÃO NECESSÁRIO`: o objetivo atual era implementar/versionar/validar e não há obrigação comprovada de promover agora.

`git push`, build e servidor local não significam deploy.

## Revalidação após deploy/restart/build

Se houver deploy, restart, reload, publicação de assets ou rebuild, determine
health check, smoke test, happy path, falha controlada, autorização/isolation,
logs e rollback quando aplicável. Não considere o release validado apenas porque
o rollout terminou tecnicamente.

## Smoke test

Quando houver runtime/deploy a validar, proponha smoke tests mínimos ligados aos
ACs críticos: health, fluxo principal, falha controlada, autenticação,
autorização, isolamento, rota/formulário novo ou integração alterada. Não repita
a suíte completa como smoke test.

## Dívidas globais

Backup global, criptografia, observabilidade, hardening ou documentação de deploy
preexistentes não entram na contagem da feature. Se forem relevantes, registre
em `PENDÊNCIAS GLOBAIS NÃO CRIADAS PELA SPEC`. Só bloqueiam a feature quando
houver relação causal comprovada.

## Não duplicar causas

Uma causa raiz não deve virar várias pendências. Se um único processo de release
não documentado explica dúvidas sobre assets, rollout e smoke test, conte a causa
uma vez e registre as demais como consequências dependentes.

## Contagem e consistência

Conte os estados diretamente da tabela final e confira novamente antes de
responder. O resumo deve corresponder exatamente ao checklist.

## Relatório final

### A. RESUMO

Informe caminho da SPEC, status, como o escopo foi delimitado, commits
considerados, implementação, validação automatizada, validação manual em
runtime, operacionalização, contagens de `PENDENTE`, `REQUER AUTORIZAÇÃO` e
`INCERTO`, bloqueio confirmado e causa principal.

### B. CHECKLIST

Produza tabela com `Categoria | Estado | Evidência causal | Próxima ação` para
as 20 categorias.

### C. AÇÕES REALMENTE PENDENTES

Somente itens `PENDENTE` ou `REQUER AUTORIZAÇÃO`. Para cada um, informe ação,
evidência causal, ambiente, risco, comando somente se comprovado pelo projeto,
dependências, ordem, rollback, validação pós-execução, comando de teste somente
se comprovado e critério de sucesso.

### D. INCERTEZAS REAIS

Somente itens `INCERTO — PROCESSO NÃO DOCUMENTADO`. Informe necessidade
comprovada, informação faltante, onde obtê-la e qual decisão depende dela.

### E. PENDÊNCIAS GLOBAIS NÃO CRIADAS PELA SPEC

Opcional e fora das contagens da feature.

### F. ORDEM DE EXECUÇÃO

Somente se houver `PENDENTE` ou `REQUER AUTORIZAÇÃO`. Use a ordem real das
dependências e inclua as validações entre as ações; nunca use sequência genérica.

### G. AUTORIZAÇÃO

Liste apenas ações comprovadamente necessárias que dependem de autorização,
com ambiente, risco, efeito e validação posterior.

### H. PLANO DE VALIDAÇÃO PÓS-AÇÃO

Se houver ação pendente, produza tabela com `Ação | Validação obrigatória |
Comando comprovado | Critério de sucesso`. Inclua, quando aplicável, estado da
migration, testes focais, suíte completa, lint, análise estática, type checks,
build, runtime, teste manual, smoke test, health check, logs e critérios de
rollback.

### I. VALIDAÇÃO MANUAL DA FEATURE

Se a SPEC possuir interface ou fluxo visível, informe ambiente recomendado,
como iniciar a aplicação somente se comprovado, URL/rota, estados, comportamento
esperado e evidência que deve ser registrada. Se já houve validação manual na
SPEC, use `JÁ CONCLUÍDO`.

### J. CONCLUSÃO

Escolha exatamente uma:

1. `FEATURE COMPLETA — NENHUMA AÇÃO OU VALIDAÇÃO ADICIONAL NECESSÁRIA`
2. `FEATURE IMPLEMENTADA — VALIDAÇÕES PÓS-IMPLEMENTAÇÃO PENDENTES`
3. `FEATURE IMPLEMENTADA — AÇÕES OPERACIONAIS PENDENTES`
4. `FEATURE IMPLEMENTADA — PROCESSO OPERACIONAL PRECISA SER IDENTIFICADO`
5. `FEATURE IMPLEMENTADA — BLOQUEADA PARA ATIVAÇÃO`
6. `FEATURE NÃO ESTÁ REALMENTE CONCLUÍDA`

## Limite da skill

Esta skill audita e relata. Não considere build verde como prova de interface
funcional, servidor local como deploy, `git push` como deploy ou comando técnico
bem-sucedido como prova suficiente de efetivação. Toda ação relevante deve ter
validação proporcional ao impacto. Quando houver ação comprovada, encaminhe a
execução para a skill/especialista apropriado somente após autorização explícita.