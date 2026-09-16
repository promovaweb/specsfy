# Auditar a efetivação com `specsfy-08-operational-audit`

Use esta skill depois que uma SPEC estiver em `completed` para verificar se a
implementação ainda deixou alguma ação operacional, técnica ou de validação
diretamente causada pela entrega.

Ela responde a uma pergunta específica:

> A implementação terminou. Existe algo adicional que esta SPEC tornou
> necessário e que ainda falta efetivar ou validar?

A skill começa delimitando o escopo real da SPEC por rastreabilidade, tarefas,
commits e diff. Ela não presume que todo o working tree ou toda alteração recente
pertença à feature.

Depois aplica causalidade antes de criar qualquer pendência. Uma ação só conta
quando a própria SPEC criou a necessidade e essa ação é necessária para o
comportamento funcionar ou ser corretamente validado no ambiente aplicável.
Dívidas antigas de infraestrutura ficam separadas e não inflam a contagem da
feature.

## O que ela verifica

A auditoria cobre migrations, banco/backfill, seeds, cache/config, assets,
env/secrets, workers, processos persistentes, infraestrutura, deploy/release,
serviços externos, permissões, storage, revalidação automatizada pós-ação,
validação manual em runtime, observabilidade, backup/rollback, compatibilidade
de release, smoke tests e outras ações externas.

Também diferencia explicitamente:

- build validado de interface funcional em runtime;
- servidor local/dev de deploy;
- `git push` de promoção para ambiente;
- comando operacional bem-sucedido de validação efetiva da feature.

Os estados são:

- `NÃO NECESSÁRIO`;
- `JÁ CONCLUÍDO`;
- `PENDENTE`;
- `REQUER AUTORIZAÇÃO`;
- `INCERTO — PROCESSO NÃO DOCUMENTADO`.

`INCERTO` não significa apenas “produção é desconhecida”. Primeiro precisa
existir uma necessidade causal comprovada pela SPEC.

## Revalidação depois de ações operacionais

A skill não considera uma ação operacional concluída apenas porque o comando
retornou sucesso. Quando aplicável, ela exige um plano de validação proporcional
ao impacto.

Por exemplo, uma migration pode exigir:

1. confirmar o estado da migration;
2. executar testes focais;
3. executar a suíte completa quando houver risco transversal;
4. validar build/lint/type checks quando relacionados;
5. executar smoke test e confirmar o comportamento funcional.

Do mesmo modo, deploy, restart, reload ou publicação de assets podem exigir
health check, fluxo principal, falha controlada, autorização/isolamento e
observação de logs.

## Validação manual em runtime

Quando a SPEC altera interface, rota, formulário, autenticação, autorização,
navegação ou outro comportamento visível, a auditoria verifica se a aplicação
já foi validada em ambiente executável.

Essa validação pode confirmar renderização, carregamento de assets, interação
principal, erros controlados, autorização, isolamento, responsividade, foco e
teclado, conforme os critérios da SPEC.

Se a validação já está registrada nas evidências da entrega, ela é tratada como
`JÁ CONCLUÍDO` e não deve ser repetida sem causa nova.

## Limite de segurança

A skill é somente de auditoria. Ela não executa deploy, migrations, seeds,
restarts, rebuilds, limpeza de cache ou mudanças em banco, configuração,
infraestrutura ou serviços externos.

Quando encontra uma ação real, ela relata evidência, risco, ordem, validação
pós-execução e próxima ação. A execução deve ser encaminhada depois para a skill
ou especialista apropriado, com autorização explícita quando a ação for
sensível.

## Exemplo

Uma SPEC sem migration, env nova ou mudança de infraestrutura não recebe
pendências artificiais nessas categorias. Se ela alterou assets e o build já foi
validado, isso não prova que a interface foi testada em runtime nem que os
artefatos foram publicados; a auditoria cria pendência apenas quando existir uma
necessidade causal ainda não satisfeita.

O objetivo é reduzir falsos positivos e separar com clareza `Delivery Gate:
Passed` de qualquer validação ou trabalho operacional que realmente permaneça
fora da implementação concluída.
