# Manter o stack

Este modo mantém em `.specsfy/STACK.md` as tecnologias estruturais do
projeto, a responsabilidade de cada uma e a fonte que comprova a linha. O
objetivo é dar aos agentes um mapa curto e confiável, não copiar a árvore de
dependências.

Referência do modo `stack` de `$specsfy-setup`. O mapa de dados fica com o
modo `database` e o registro completo de pacotes fica com
`$specsfy-documentator`.

## Pronto quando

- O bloco `specsfy:stack` reflete os manifests, lockfiles e configurações
  presentes.
- Toda linha acrescentada à mão cita sua fonte na coluna `Evidência`.
- Conteúdo humano fora do bloco continua intacto.
- `specsfy context monitor --check` não aponta mais `.specsfy/STACK.md`.

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

1. Leia em paralelo as instruções locais, `PROJECT.md` e o `STACK.md`
   existente.
2. Atualize o bloco detectado:

   ```bash
   specsfy context stack --project <raiz>
   ```

   Pelo MCP, use a tool `context_stack`. Sem o binário instalado, rode o script
   equivalente:

   ```bash
   node .agents/skills/specsfy-setup/scripts/update_stack.mjs \
     --project <raiz>
   ```

3. Confira cada linha contra os manifests, lockfiles e configurações
   presentes.
4. Acrescente à mão somente fatos sustentados por uma fonte executável e cite
   essa fonte na coluna `Evidência`.
5. Se a mudança também alterou persistência, siga o modo `database`
   ([database.md](database.md)).
6. Confirme que o stack deixou de aparecer como pendência:

   ```bash
   specsfy context monitor --project <raiz> --check
   ```

   Pelo MCP, use a tool `context_monitor`. Sem o binário instalado, rode o
   script equivalente:

   ```bash
   node .agents/skills/specsfy-setup/scripts/monitor_context.mjs \
     --project <raiz> --check
   ```

   Em uma cópia sem Git, recupere de `BASELINE` informando `--paths` com
   as alterações conhecidas ou `--paths '[]'` para uma lista vazia
   confirmada. Siga [Monitorar e resolver pendências](setup.md#monitorar-e-resolver-pendências).

   Devolva o handoff somente quando `.specsfy/STACK.md` não estiver mais
   pendente.

## Limites

- Escolhas, notas e linhas humanas ficam fora do bloco `specsfy:stack` e
  nunca são removidas.
- Registre tecnologias estruturais e sua responsabilidade; não copie árvores
  inteiras de dependências.
