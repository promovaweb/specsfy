---
name: specsfy-aux-rules
description: Monitorar e ajudar a descobrir, formular e registrar regras duráveis em .specsfy/RULES.md sem alterar ou remover regras existentes. Use quando o monitor de contexto apontar revisão de regras; quando o usuário quiser adicionar regras do projeto; quando uma convenção recorrente precisar virar instrução explícita; ou ao revisar conflitos e duplicatas. Não inventa regras nem promove preferências sem confirmação.
---

# Manter regras do projeto

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

1. Ler instruções locais, `PROJECT.md` e todo o `RULES.md` existente.
2. Distinguir regra declarada, inferência e sugestão.
3. Quando a formulação não estiver confirmada, selecionar uma pergunta real e
   aplicar o contrato central de perguntas numeradas.
4. Formular regras verificáveis, com verbo e limite claros.
5. Executar:

   ```bash
   node scripts/add_rule.mjs \
     --project <raiz> \
     --section "<tema>" \
     --rule "<regra confirmada>"
   ```

6. Revisar o resultado e preservar ordem, comentários e regras anteriores.
7. Sinalizar conflitos sem escolher silenciosamente qual regra prevalece.
8. Executar `$specsfy-setup` em modo de monitoramento antes de devolver o
   handoff. Se nenhuma regra nova for necessária, registrar a justificativa na
   evidência da tarefa e reconhecer explicitamente a revisão.

Não usar `RULES.md` como substituto de `AGENTS.md`, de uma spec ou de critérios
de aceite. Não registrar segredo, token ou dado pessoal.
