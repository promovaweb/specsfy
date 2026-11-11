---
name: specsfy-aux-database
description: "Mantém .specsfy/DATABASE.md como mapa tabular e completo da persistência: bancos, schemas, tabelas, campos, relações, índices e migrations, conferido contra o código. Use quando o monitor de contexto apontar persistência pendente, quando banco, tabela, coleção, model persistente, coluna, índice, relação, schema ou migration for criado ou alterado, ou ao auditar se o mapa corresponde ao código. Não use para descobrir com a pessoa quais dados guardar (use specsfy-data-discovery) nem para o stack (use specsfy-aux-stack)."
---

# Manter o mapa de dados

Esta skill garante que `.specsfy/DATABASE.md` mostre a estrutura de dados que
o código realmente implementa, ao lado do que a conversa definiu. Uma mudança
de dados só está completa quando o mapa a reflete.

## Pronto quando

- O bloco `specsfy:database` corresponde a schemas, migrations, models e
  configurações presentes.
- Relações, índices, constraints, ownership, retenção e finalidade estão
  preenchidos ou marcados como desconhecidos, nunca inventados.
- Os testes relevantes à mudança de dados estão verdes.
- `monitor_context.mjs --check` não aponta mais `.specsfy/DATABASE.md`.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `sem perguntas`.
Não formule perguntas nesta skill. Quando faltar informação confirmada,
sinalize o campo pendente para a etapa conversacional responsável.

## Executar

1. Leia em paralelo as instruções locais, `PROJECT.md`, `STACK.md` e todo o
   `DATABASE.md`.
2. Inspecione schemas, migrations, models persistentes e configurações sem
   revelar valores de ambiente ou credenciais.
3. Atualize o bloco detectado:

   ```bash
   node .agents/skills/specsfy-aux-database/scripts/update_database.mjs \
     --project <raiz>
   ```

4. Confira o resultado contra as fontes executáveis.
5. Complete à mão o que não pode ser inferido com segurança: relações,
   índices, constraints, ownership, retenção e finalidade. Marque como
   desconhecido o que nenhuma fonte sustentar.
6. Confirme que a persistência deixou de aparecer como pendência:

   ```bash
   node .agents/skills/specsfy-setup/scripts/monitor_context.mjs \
     --project <raiz> --check
   ```

## Conversa e código

Quando `$specsfy-data-discovery` tiver registrado respostas confirmadas,
preserve a seção `Informações a guardar confirmadas` e compare-a com o que o
código revela. A conversa descreve o produto; este mapa mostra também o que já
foi implementado, e divergências ficam visíveis em vez de corrigidas em
silêncio.

## Limites

- Preserve todo conteúdo fora do bloco `specsfy:database`.
- Use tabelas Markdown, que facilitam busca e comparação.
- Não copie dados de produção, strings de conexão, senhas, tokens ou valores
  de `.env`.
