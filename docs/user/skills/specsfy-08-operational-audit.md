# Auditar a efetivação com `specsfy-08-operational-audit`

Use esta skill depois que uma SPEC estiver em `completed` para verificar se a
implementação ainda deixou alguma ação operacional diretamente causada pela
entrega.

Ela responde a uma pergunta específica:

> A implementação terminou. Existe algo operacional que esta SPEC tornou
> necessário e que ainda falta efetivar?

A skill começa delimitando o escopo real da SPEC por rastreabilidade, tarefas,
commits e diff. Ela não presume que todo o working tree ou toda alteração recente
pertença à feature.

Depois aplica causalidade antes de criar qualquer pendência. Uma ação só conta
quando a própria SPEC criou a necessidade e essa ação é necessária para o
comportamento funcionar no ambiente aplicável. Dívidas antigas de infraestrutura
ficam separadas e não inflam a contagem da feature.

## O que ela verifica

A auditoria cobre migrations, banco/backfill, seeds, cache/config, assets,
env/secrets, workers, processos persistentes, infraestrutura, deploy/release,
serviços externos, permissões, storage, observabilidade, backup/rollback,
compatibilidade de release, smoke tests e outras ações externas.

Os estados são:

- `NÃO NECESSÁRIO`;
- `JÁ CONCLUÍDO`;
- `PENDENTE`;
- `REQUER AUTORIZAÇÃO`;
- `INCERTO — PROCESSO NÃO DOCUMENTADO`.

`INCERTO` não significa apenas “produção é desconhecida”. Primeiro precisa
existir uma necessidade causal comprovada pela SPEC.

## Limite de segurança

A skill é somente de auditoria. Ela não executa deploy, migrations, seeds,
restarts, rebuilds, limpeza de cache ou mudanças em banco, configuração,
infraestrutura ou serviços externos.

Quando encontra uma ação operacional real, ela relata evidência, risco e próxima
ação. A execução deve ser encaminhada depois para a skill ou especialista
apropriado, com autorização explícita quando a ação for sensível.

## Exemplo

Uma SPEC sem migration, env nova ou mudança de infraestrutura não recebe
pendências artificiais nessas categorias. Se ela alterou assets e o build já foi
validado, isso não prova que os artefatos foram publicados; a auditoria só cria
pendência de publicação quando existir promoção causalmente necessária para um
ambiente aplicável.

O objetivo é reduzir falsos positivos e separar com clareza `Delivery Gate:
Passed` de qualquer trabalho operacional que realmente permaneça fora do código.
