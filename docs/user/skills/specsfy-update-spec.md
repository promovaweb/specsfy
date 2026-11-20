# Incorporar mudanças com `specsfy-update-spec`

Esta skill atualiza uma spec que já foi definida, planejada, iniciada ou
concluída. A nova necessidade entra na mesma fonte, onde somente os atos com
provas que perderam validade são reabertos.

## Quando usar

Use quando uma entrega existente precisar incorporar algo esquecido, adicionar
ou remover comportamento, corrigir uma definição ou mudar uma regra de negócio
já registrada.

Para criar a primeira versão da spec, use specify. A update-spec depende de uma
fonte existente para comparar a nova instrução com requisitos, testes, tarefas
e gates já registrados.

## Como descrever a tarefa

```text
Use $specsfy-update-spec para adicionar expiração de 30 minutos à
specs/<estado>/0004-recuperar-senha/spec.md.
```

Para remover um comportamento, identifique a exigência e o arquivo `spec.md`
que deve ser revisto. Assim, a skill consegue localizar testes e tarefas que
ficariam incompatíveis com a remoção:

```text
Remova a exigência de SMS da spec 0004 e ajuste o trabalho afetado.
```

## Exemplo passo a passo

1. A skill preserva literalmente a nova instrução.
2. Lê requisitos, testes, tarefas, gates e evidências atuais.
3. Classifica a mudança:

```text
Mudança de definição: altera comportamento e condição de aceite.
Atos reabertos: I, II e III.
```

Com o impacto identificado, a skill atualiza a mesma `spec.md` e invalida
somente os gates que perderam validade. Depois, retoma refinamento, validação,
tarefas, testes e implementação na ordem necessária. A nova evidência é
registrada sem apagar o histórico relevante.

Se a mudança abrir escolhas materiais, o refinamento do backlog apresenta
exatamente uma pergunta numerada por rodada e reavalia o contexto após a
resposta. A pergunta oferece três ou mais opções numeradas, `Escrever outra
resposta`, `Gere outras opções` e `Avançar` desde a primeira rodada. O ciclo
faz no máximo oito perguntas por área. O
avanço abre uma confirmação para encerrar definitivamente as perguntas daquela
área, responder depois ou retomar agora. O encerramento é respeitado até você
reabrir a área. O adiamento preserva os pontos e mantém o Ato I reaberto, sem
iniciar outra vez o mesmo ciclo nessa retomada.

## O que esperar

- instrução original preservada.
- impacto explicado na retomada.
- nenhuma spec duplicada.
- trabalho já válido mantido.
- transições automáticas até o estado coerente.

## Erros comuns

- editar apenas o código e deixar a spec antiga.
- reabrir todos os gates sem analisar impacto.
- manter teste ou tarefa que contradiz a nova instrução.
- esconder a mudança em notas soltas.
- criar uma segunda especificação para a mesma entrega.

## Próximo passo

A própria skill encaminha para a etapa reaberta. Depois da atualização, rode
`specsfy progress`, descrito em
[Ver o progresso](../reference.md#ver-o-progresso), para revisar o estado
geral de todas as specs do projeto.
