---
name: specsfy-specialist-{{slug}}
description: "{{Verbo(s) no infinitivo + domínio coberto e, se houver vários modos, seus nomes e escopos}}. Use para {{gatilhos positivos e concretos}}. Para {{caso fora do escopo}}, use {{nome da skill vizinha}}."
---

# {{Título humano do domínio}}

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| {{Sinal observável no pedido, no código ou no ambiente}} | {{modo-a}} | `references/{{modo-a}}.md` |
| {{Segundo sinal que exige outro modo}} | {{modo-b}} | `references/{{modo-b}}.md` |

<!-- Para um único modo, omita a coluna Modo e as subseções Modo no Fluxo. -->
<!-- Aponte Abra para standards.md quando ele concentrar a referência. -->

Não use para:

- {{Caso adjacente coberto por outra skill}}. Use
  `$specsfy-specialist-{{skill-vizinha}}`.

Combine com `$specsfy-specialist-{{skill-complementar}}` quando
{{condição que exige as duas}}.

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a linha `| Especialistas |` da tabela de
   metadados, a subseção `#### Especialistas` em `### 8. Plano técnico` e a
   seção que a fase está escrevendo. Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md` e os arquivos de contexto do domínio
   (`.specsfy/{{DATABASE}}.md`, `.specsfy/{{PACKAGES}}.md`,
   `{{INTERFACE}}.md`) quando a tarefa tocar dados, telas ou pacotes.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-{{slug}} ({{modo}})`. Sem indicação,
   escolha o modo pelo "Quando usar" acima.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. {{Item próprio do domínio: o artefato que este especialista confirma na
   spec, no `.specsfy/*.md` ou na tarefa e o que ele encaminha para a fase}}.

## Fluxo

1. Leia [references/standards.md](references/standards.md) e descubra
   {{versão, ambiente, workload ou configuração real do projeto}} antes de
   recomendar.
2. {{Passo de modelagem/decisão inicial específico do domínio}}.
3. {{Passo central que produz o artefato técnico — schema, componente,
   pipeline, teste, diagnóstico. Se variar por modo, encaminhe à subseção}}.
4. {{Passo de verificação intermediária com evidência observável}}.
5. {{Passo de integração com o restante do sistema/projeto consumidor}}.
6. {{Passo final de registro/comunicação do risco residual ou trade-off}}.

Ajuste o número de passos ao domínio; mantenha cada passo verificável e
específico o bastante para orientar uma decisão real, nunca um lembrete
genérico como "planeje com cuidado".

<!-- Crie uma subseção apenas para cada modo com passos próprios. -->

### Modo {{modo-a}}

1. {{Passo específico do modo com link para a referência aplicável}}.
2. {{Resultado esperado ou evidência própria do modo}}.

### Modo {{modo-b}}

1. {{Passo específico do modo com link para a referência aplicável}}.
2. {{Resultado esperado ou evidência própria do modo}}.

## Padrões

- {{Regra afirmativa concreta e testável}}.
- {{Regra afirmativa concreta e testável}}.
- {{Proibição explícita com o motivo técnico, quando não for óbvio}}.
- {{Regra sobre quando NÃO aplicar uma prática comum do domínio}}.
- {{Regra sobre limite, threshold ou condição de decisão}}.
- {{Convenção local obrigatória que a fonte oficial não exige}}. (regra da casa)

Cada item deve ser verificável olhando o código, a configuração ou o
resultado — nunca uma aspiração ("cuidar da performance") sem critério de
checagem.

## Antipadrões

- {{Erro comum observável e por que ele falha em produção/escala/manutenção}}.
- {{Erro comum observável e por que ele falha em produção/escala/manutenção}}.
- {{Confusão frequente com outra prática ou skill, e como diferenciá-la}}.

## Validação

- {{Comando, teste ou inspeção concreta que comprova o passo 3 do Fluxo}}.
- {{Caso de borda ou cenário adversarial que precisa de evidência antes de
  declarar pronto}}.
- {{Métrica, log ou saída que comprova ausência de regressão}}.
- Não declarar {{propriedade do domínio — seguro, íntegro, performático,
  acessível}} sem a evidência acima; linguagem absoluta sem prova é proibida.

## Skills relacionadas

- `$specsfy-specialist-{{skill-relacionada-1}}` para {{fronteira clara de
  responsabilidade}}.
- `$specsfy-specialist-{{skill-relacionada-2}}` quando {{condição}}.

Use `references/standards.md` como índice das referências por modo e das
fontes oficiais, com as regras comuns do domínio. Aprofunde decisões,
trade-offs, thresholds e comandos nas referências aplicáveis. Se o domínio
exigir catálogo, checklist ou fluxo de decisão extensos, adicione arquivos
em `references/` e linke cada um pelo nome no ponto do Fluxo em que ele se
aplica.
