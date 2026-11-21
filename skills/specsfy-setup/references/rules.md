# Manter regras do projeto

Este modo transforma convenções confirmadas em regras verificáveis em
`.specsfy/RULES.md`. Só entra no arquivo o que a pessoa declarou ou confirmou;
inferências e sugestões ficam na conversa até serem aceitas.

Referência do modo `rules` de `$specsfy-setup`. Requisitos e condições de
aceite de uma feature ficam com `$specsfy-03-specify`, e instruções gerais
do agente ficam em `AGENTS.md`.

## Pronto quando

- Cada regra nova foi confirmada pela pessoa e tem verbo e limite claros.
- Ordem, comentários e regras anteriores continuam intactos.
- Conflitos encontrados foram sinalizados, sem escolha silenciosa.
- `specsfy context monitor --check` não aponta mais a revisão de regras, ou a
  justificativa de nenhuma regra nova foi registrada e reconhecida.

## Preparação obrigatória

Antes de executar este modo, siga o modo `setup` de `$specsfy-setup` na
raiz do projeto, pelo caminho curto quando o contexto já foi reconciliado
nesta conversa. Em handoff automático, repita o caminho curto antes desta
etapa. Reutilize a raiz confirmada na conversa e não prossiga se o setup
apontar uma pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

## Executar

1. Leia em paralelo as instruções locais, `PROJECT.md` e todo o `RULES.md`
   existente.
2. Separe regra declarada, inferência e sugestão.
3. Se a formulação não estiver confirmada, escolha uma pergunta real e
   aplique o contrato de perguntas numeradas.
4. Formule a regra de modo verificável, com verbo e limite claros.
5. Registre:

   ```bash
   specsfy context rule \
     --project <raiz> \
     --section "<tema>" \
     --rule "<regra confirmada>"
   ```

   Pelo MCP, use a tool `context_rule`. Sem o binário instalado, rode o script
   equivalente:

   ```bash
   node .agents/skills/specsfy-setup/scripts/add_rule.mjs \
     --project <raiz> \
     --section "<tema>" \
     --rule "<regra confirmada>"
   ```

6. Revise o resultado e confirme que ordem, comentários e regras anteriores
   foram preservados.
7. Sinalize conflitos entre regras e deixe a escolha para a pessoa.
8. Confira o monitor antes de devolver o handoff:

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

   Se nenhuma regra nova for necessária, registre a justificativa na tarefa e
   reconheça explicitamente a revisão.

## Limites

- `RULES.md` não substitui `AGENTS.md`, uma spec ou critérios de aceite.
- Não registre segredo, token ou dado pessoal.
