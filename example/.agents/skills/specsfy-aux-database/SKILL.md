---
name: specsfy-aux-database
description: Monitorar e manter a documentação completa da persistência em .specsfy/DATABASE.md, com inventário tabular de bancos, schemas, tabelas, campos, relações e migrations. Use quando o monitor de contexto apontar persistência pendente, sempre que banco, tabela, coleção, model persistente, coluna, índice, relação, schema ou migration for criado ou alterado, e ao auditar se o mapa de dados corresponde ao código. Preserva notas e decisões humanas fora do inventário detectado.
---

# Manter o mapa de dados

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `sem perguntas`.
Não formule perguntas nesta skill. Quando faltar informação confirmada,
sinalize o campo pendente para a etapa conversacional responsável.

1. Ler instruções locais, `PROJECT.md`, `STACK.md` e todo o `DATABASE.md`.
2. Inspecionar schemas, migrations, models persistentes e configurações sem
   revelar valores de ambiente ou credenciais.
3. Executar `node scripts/update_database.mjs --project <raiz>`.
4. Conferir o inventário detectado contra as fontes executáveis.
5. Completar relações, índices, constraints, ownership, retenção e finalidade
   que não possam ser inferidos com segurança; marcar desconhecidos em vez de
   inventar.
6. Preservar todo conteúdo fora do bloco `specsfy:database`.
7. Considerar a mudança de dados incompleta até `DATABASE.md` refletir a nova
   estrutura e os testes relevantes estarem verdes.
8. Executar `$specsfy-setup` em modo de monitoramento antes de devolver o
   handoff e exigir que `.specsfy/DATABASE.md` deixe de aparecer como pendência.

Quando `$specsfy-data-discovery` registrar respostas confirmadas, preserve a
seção `Informações a guardar confirmadas` e compare-a com o que o código
revela. A conversa descreve o produto; este mapa continua mostrando também o
que já foi implementado.

Usar tabelas Markdown para permitir busca e comparação. Nunca copiar dados de
produção, strings de conexão, senhas, tokens ou valores de `.env`.
