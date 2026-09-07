---
name: specsfy-08-operational-audit
description: "Use depois que uma SPEC chegar a completed para auditar se existe alguma ação operacional adicional diretamente causada pela entrega. Delimita o escopo da SPEC, aplica causalidade, evita falsos positivos e não executa operações sem autorização."
---

# Auditar a efetivação operacional de uma feature concluída

Use esta skill somente depois que a SPEC estiver concluída no fluxo do Specsfy.
Ela não reabre gates, não implementa código e não substitui deploy, delivery
engineering ou especialistas de infraestrutura.

## Objetivo

Responder com precisão:

> A implementação da SPEC terminou. Existe alguma ação operacional diretamente
> causada por esta SPEC que ainda precisa ser realizada?

A auditoria não procura melhorias gerais, dívidas antigas ou boas práticas
abstratas. Ela identifica apenas o delta operacional causal da entrega.

## Modo de interação

Modo de interação: sem perguntas durante a auditoria. Se o processo operacional
necessário não estiver documentado, registre a incerteza no relatório em vez de
inventar uma resposta. Qualquer execução operacional posterior exige pedido ou
autorização explícita da pessoa.

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

Durante esta skill, não execute nenhuma ação operacional. Não altere arquivos,
não reabra a SPEC, não implemente código, não faça commit ou push, não faça
deploy, não execute migrations, seeds, restart, rebuild, limpeza de cache,
alteração de banco, variáveis, infraestrutura ou serviços externos.

Comandos de inspeção só podem ser usados quando forem comprovadamente somente
leitura e sem efeitos colaterais. Não consulte produção, infraestrutura remota
ou serviços externos apenas para confirmar estado sem autorização explícita.

## Regra de causalidade

Uma ação só é pendente desta feature quando ambas forem verdadeiras:

1. a SPEC criou ou alterou algo que exige essa ação;
2. a ação é necessária para que o comportamento implementado funcione no
   ambiente de destino.

Boa prática geral não é pendência da feature. Exemplos:

- SPEC sem migration → migrations = `NÃO NECESSÁRIO`;
- SPEC sem variável nova → env/secrets = `NÃO NECESSÁRIO`;
- SPEC sem alteração de Dockerfile/stack → infraestrutura = `NÃO NECESSÁRIO`
  para esta SPEC.

## Regra de evidência

Baseie conclusões apenas em evidência concreta da SPEC, tarefas, commits, diff,
migrations, seeders, configuração, scripts, lockfiles, frontend, jobs, CI/CD e
documentação factual do projeto.

Não invente comandos como `npm install`, `npm ci`, `docker build`,
`docker stack deploy`, `php artisan migrate`, `cache:clear`, `route:cache`,
`config:cache` ou restart de serviço sem evidência de que esse é o procedimento
real do projeto.

## Estados permitidos

Use exatamente um estado por categoria:

| Estado | Definição |
| --- | --- |
| `NÃO NECESSÁRIO` | a SPEC não criou necessidade operacional nessa categoria |
| `JÁ CONCLUÍDO` | a SPEC exigia a ação e há evidência de que ela foi realizada |
| `PENDENTE` | a SPEC exige a ação e ela ainda não foi realizada |
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
| 14 | Observabilidade pós-ativação | somente se houver ativação/deploy efetivamente pendente |
| 15 | Backup/rollback | mudança destrutiva, migration relevante, transformação de dados ou risco operacional específico |
| 16 | Compatibilidade de release | schema/código incompatíveis, payload de fila, API, sessão, cache ou rolling deploy |
| 17 | Smoke test | somente se houver ativação/deploy pendente |
| 18 | Outras ações externas | feature flag, cadastro externo, sincronização, reprocessamento ou ativação manual |

## Regra específica para deploy/release

Primeiro determine se há evidência de que a SPEC deve ser promovida para algum
ambiente. Diferencie implementação/versionamento do objetivo de ativação em
staging ou produção.

- `JÁ CONCLUÍDO`: há evidência de que a versão está ativa no ambiente-alvo;
- `PENDENTE`: ambiente e processo são conhecidos e a versão ainda não foi promovida;
- `REQUER AUTORIZAÇÃO`: deploy comprovadamente necessário e dependente de autorização;
- `INCERTO — PROCESSO NÃO DOCUMENTADO`: promoção necessária, mas mecanismo real ausente;
- `NÃO NECESSÁRIO`: o objetivo atual era implementar/versionar e não há obrigação comprovada de promover agora.

`git push` não significa deploy, mas também não assuma que toda SPEC precisa de
deploy imediato.

## Assets

Se a SPEC alterou assets, diferencie build validado de artefato publicado. Um
`npm run build` verde prova o build naquele contexto; não prova que os assets já
estão ativos em um ambiente. Só crie pendência de publicação quando a promoção
for causalmente necessária e houver ambiente-alvo aplicável.

## Dívidas globais

Backup global, criptografia, observabilidade, hardening ou documentação de deploy
preexistentes não entram na contagem da feature. Se forem relevantes, registre
em seção separada `PENDÊNCIAS GLOBAIS NÃO CRIADAS PELA SPEC`. Só bloqueiam a
feature quando houver relação causal comprovada.

## Não duplicar causas

Uma causa raiz não deve virar várias pendências. Se um único processo de release
não documentado explica dúvidas sobre assets, rollout e smoke test, conte a
causa uma vez e registre as demais como consequências dependentes.

## Contagem e consistência

Conte os estados diretamente da tabela final e confira novamente antes de
responder. O resumo deve corresponder exatamente ao checklist.

## Relatório final

### A. RESUMO

Informe caminho da SPEC, status, como o escopo foi delimitado, commits
considerados, implementação, operacionalização, contagens de `PENDENTE`,
`REQUER AUTORIZAÇÃO` e `INCERTO`, bloqueio confirmado e causa principal.

### B. CHECKLIST

Produza tabela com `Categoria | Estado | Evidência causal | Próxima ação` para
as 18 categorias.

### C. AÇÕES REALMENTE PENDENTES

Somente itens `PENDENTE` ou `REQUER AUTORIZAÇÃO`. Para cada um, informe ação,
evidência causal, ambiente, risco, comando somente se comprovado pelo projeto,
validação e rollback quando aplicável.

### D. INCERTEZAS REAIS

Somente itens `INCERTO — PROCESSO NÃO DOCUMENTADO`. Informe necessidade
comprovada, informação faltante, onde obtê-la e qual decisão depende dela.

### E. PENDÊNCIAS GLOBAIS NÃO CRIADAS PELA SPEC

Opcional e fora das contagens da feature.

### F. ORDEM DE EXECUÇÃO

Somente se houver `PENDENTE` ou `REQUER AUTORIZAÇÃO`. Use a ordem real das
dependências, nunca uma sequência genérica.

### G. AUTORIZAÇÃO

Liste apenas ações comprovadamente necessárias que dependem de autorização.

### H. CONCLUSÃO

Escolha exatamente uma:

1. `FEATURE COMPLETA — NENHUMA AÇÃO OPERACIONAL ADICIONAL NECESSÁRIA`
2. `FEATURE IMPLEMENTADA — AÇÕES OPERACIONAIS PENDENTES`
3. `FEATURE IMPLEMENTADA — PROCESSO OPERACIONAL PRECISA SER IDENTIFICADO`
4. `FEATURE IMPLEMENTADA — BLOQUEADA PARA ATIVAÇÃO`
5. `FEATURE NÃO ESTÁ REALMENTE CONCLUÍDA`

## Limite da skill

Esta skill audita e relata. Quando houver ação operacional comprovada, encaminhe
a execução para a skill/especialista apropriado somente após autorização
explícita. Não transforme auditoria em deploy automático.