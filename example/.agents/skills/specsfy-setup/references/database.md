# Manter o mapa de dados

Este modo garante que `.specsfy/DATABASE.md` mostre a estrutura de dados que
o código realmente implementa, ao lado do que a conversa definiu. Uma mudança
de dados só está completa quando o mapa a reflete.

Referência do modo `database` de `$specsfy-setup`. Descobrir com a pessoa
quais dados guardar é trabalho do modo `data-discovery`, e o stack fica com
o modo `stack`.

## Pronto quando

- O bloco `specsfy:database` corresponde a schemas, migrations, models e
  configurações presentes.
- Relações, índices, constraints, ownership, retenção e finalidade estão
  preenchidos ou marcados como desconhecidos, nunca inventados.
- Os testes relevantes à mudança de dados estão verdes.
- `specsfy context monitor --check` não aponta mais `.specsfy/DATABASE.md`.

## Preparação obrigatória

Antes de executar este modo, siga o modo `setup` de `$specsfy-setup` na
raiz do projeto, pelo caminho curto quando o contexto já foi reconciliado
nesta conversa. Em handoff automático, repita o caminho curto antes desta
etapa. Reutilize a raiz confirmada na conversa e não prossiga se o setup
apontar uma pendência.

## Modo de interação

Modo de interação: `sem perguntas`.
Não formule perguntas neste modo. Quando faltar informação confirmada,
sinalize o campo pendente para a etapa conversacional responsável.

## Executar

1. Leia em paralelo as instruções locais, `PROJECT.md`, `STACK.md` e todo o
   `DATABASE.md`.
2. Inspecione schemas, migrations, models persistentes e configurações sem
   revelar valores de ambiente ou credenciais.
3. Atualize o bloco detectado:

   ```bash
   specsfy context database --project <raiz>
   ```

   Pelo MCP, use a tool `context_database`. Sem o binário instalado, rode o
   script equivalente:

   ```bash
   node .agents/skills/specsfy-setup/scripts/update_database.mjs \
     --project <raiz>
   ```

4. Confira o resultado contra as fontes executáveis.
5. Complete à mão o que não pode ser inferido com segurança: relações,
   índices, constraints, ownership, retenção e finalidade. Marque como
   desconhecido o que nenhuma fonte sustentar.
6. Confirme que a persistência deixou de aparecer como pendência:

   ```bash
   specsfy context monitor --project <raiz> --check
   ```

   Pelo MCP, use a tool `context_monitor`. Sem o binário instalado, rode o
   script equivalente:

   ```bash
   node .agents/skills/specsfy-setup/scripts/monitor_context.mjs \
     --project <raiz> --check
   ```

## Conversa e código

Quando o modo `data-discovery` tiver registrado respostas confirmadas,
preserve a seção `Informações a guardar confirmadas` e compare-a com o que o
código revela. A conversa descreve o produto; este mapa mostra também o que já
foi implementado, e divergências ficam visíveis em vez de corrigidas em
silêncio.

## Limites

- Preserve todo conteúdo fora do bloco `specsfy:database`.
- Use tabelas Markdown, que facilitam busca e comparação.
- Não copie dados de produção, strings de conexão, senhas, tokens ou valores
  de `.env`.
