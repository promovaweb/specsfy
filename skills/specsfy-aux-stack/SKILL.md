---
name: specsfy-aux-stack
description: "Cria ou atualiza .specsfy/STACK.md de forma aditiva a partir de manifests, lockfiles e configurações, sempre com a fonte executável de cada linha. Use quando o monitor de contexto apontar stack pendente, quando framework, linguagem, runtime, pacote estrutural, ferramenta de teste ou persistência mudar, ou depois de adicionar Laravel, Next.js, Astro ou outra dependência estrutural. Não use para o mapa de dados (use specsfy-aux-database) nem para o registro completo de pacotes (use specsfy-documentator)."
---

# Manter o stack

Esta skill mantém em `.specsfy/STACK.md` as tecnologias estruturais do
projeto, a responsabilidade de cada uma e a fonte que comprova a linha. O
objetivo é dar aos agentes um mapa curto e confiável, não copiar a árvore de
dependências.

## Pronto quando

- O bloco `specsfy:stack` reflete os manifests, lockfiles e configurações
  presentes.
- Toda linha acrescentada à mão cita sua fonte na coluna `Evidência`.
- Conteúdo humano fora do bloco continua intacto.
- `monitor_context.mjs --check` não aponta mais `.specsfy/STACK.md`.

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

1. Leia em paralelo as instruções locais, `PROJECT.md` e o `STACK.md`
   existente.
2. Atualize o bloco detectado:

   ```bash
   node .agents/skills/specsfy-aux-stack/scripts/update_stack.mjs \
     --project <raiz>
   ```

3. Confira cada linha contra os manifests, lockfiles e configurações
   presentes.
4. Acrescente à mão somente fatos sustentados por uma fonte executável e cite
   essa fonte na coluna `Evidência`.
5. Se a mudança também alterou persistência, carregue `$specsfy-aux-database`.
6. Confirme que o stack deixou de aparecer como pendência:

   ```bash
   node .agents/skills/specsfy-setup/scripts/monitor_context.mjs \
     --project <raiz> --check
   ```

   Devolva o handoff somente quando `.specsfy/STACK.md` não estiver mais
   pendente.

## Limites

- Escolhas, notas e linhas humanas ficam fora do bloco `specsfy:stack` e
  nunca são removidas.
- Registre tecnologias estruturais e sua responsabilidade; não copie árvores
  inteiras de dependências.
