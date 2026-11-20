---
name: specsfy-aux-rules
description: "Ajuda a descobrir, formular e registrar regras duráveis do projeto em .specsfy/RULES.md, sem alterar nem remover regras existentes. Use quando o monitor de contexto apontar revisão de regras, quando o usuário quiser adicionar uma regra, quando uma convenção recorrente precisar virar instrução explícita, ou ao revisar conflitos e duplicatas. Não use para requisitos ou critérios de aceite de uma feature (use specsfy-03-specify) nem para instruções gerais do agente em AGENTS.md."
---

# Manter regras do projeto

Esta skill transforma convenções confirmadas em regras verificáveis em
`.specsfy/RULES.md`. Só entra no arquivo o que a pessoa declarou ou confirmou;
inferências e sugestões ficam na conversa até serem aceitas.

## Pronto quando

- Cada regra nova foi confirmada pela pessoa e tem verbo e limite claros.
- Ordem, comentários e regras anteriores continuam intactos.
- Conflitos encontrados foram sinalizados, sem escolha silenciosa.
- `specsfy context monitor --check` não aponta mais a revisão de regras, ou a
  justificativa de nenhuma regra nova foi registrada e reconhecida.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

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
   node .agents/skills/specsfy-aux-rules/scripts/add_rule.mjs \
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

   Se nenhuma regra nova for necessária, registre a justificativa na tarefa e
   reconheça explicitamente a revisão.

## Limites

- `RULES.md` não substitui `AGENTS.md`, uma spec ou critérios de aceite.
- Não registre segredo, token ou dado pessoal.
