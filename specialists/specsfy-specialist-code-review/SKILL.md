---
name: specsfy-specialist-code-review
description: Revisar diffs, branches e PRs por contrato, correção, segurança, arquitetura, testes e impacto operacional, relatando achados por severidade com localização e comprovação. Use quando o usuário pedir code review, segunda opinião sobre uma mudança ou avaliação de impacto de um diff; é somente leitura salvo pedido explícito para corrigir; não use para desenhar a arquitetura do zero, use `$specsfy-specialist-architecture` para isso.
---

# Revisão de código

## Quando usar

- Acionar quando houver um diff, branch ou PR concreto para avaliar antes de
  mergear ou publicar.
- Acionar também quando o pedido for "segunda opinião" sobre uma mudança já
  escrita, mesmo sem PR aberto.
- Não acionar para desenhar uma escolha estrutural nova do zero: use
  `$specsfy-specialist-architecture`; a revisão avalia o que já foi
  decidido e escrito, não substitui a escolha.
- Combinar com `$specsfy-specialist-application-security` quando o diff tocar
  autenticação, autorização, dados sensíveis ou entrada externa e com
  `$specsfy-specialist-modeling` quando o achado for sobre nomes,
  invariantes ou fronteiras de domínio confusas.

## No Specsfy

1. **Fonte de entrada por fase**
   - Em `specsfy-02-backlog`, leia o item em `specs/backlog/` e registre ali
     as decisões e sinais do especialista, além das dúvidas abertas.
   - Em `specsfy-03-specify` e `specsfy-04-validate`, use a
     spec aberta e devolva a conclusão à seção trabalhada pela fase.
   - Em `specsfy-05-tasks`, ajude a sugerir e sincronizar especialistas e modos
     entre o cabeçalho, a seção 8 e as tarefas. Só essa fase escreve a seção 14.
   - Em `specsfy-06-implement`, limite-se à tarefa indicada e ao passo carregado.

   Nas fases com spec, leia a spec aberta indicada pela skill chamadora ou
   localizada por `specsfy status`. Consulte a linha `| Especialistas |`,
   a subseção `#### Especialistas` em `### 8. Plano técnico` e a seção
   pertinente à fase.
   Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md` antes de julgar o diff, porque eles definem a stack e
   as regras que o código deve seguir.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-code-review`. Sem indicação, confirme
   pelo "Quando usar" acima qual diff ou PR está sob revisão.
3. Devolva a conclusão e as dúvidas abertas no destino indicado no item 1,
   no próprio backlog, na spec ou na tarefa da fase.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Quando a fase fornecer uma spec, revise o diff contra os cenários BDD da
   seção 6 e os requisitos da seção 7. Devolva cada achado com
   `arquivo:linha`, impacto e correção provável no destino do item 1.
   Encaminhe a correção à fase responsável.

## Fluxo

1. Fixar a base de comparação e o escopo exato do diff; revisar um diff sem
   base clara produz achados sobre código que a mudança não tocou.
2. Ler spec, issue, condições de aceite e instruções do repositório aplicáveis
   antes de julgar; sem isso, "correto" vira opinião pessoal.
3. Mapear cada arquivo alterado para o comportamento e o boundary que ele
   afeta (dado, permissão, contrato de API, config, dependência).
4. Avaliar corretude, casos de borda, segurança, concorrência e efeito
   operacional antes de estilo: estilo só impede o merge quando a automação
   não o cobre.
5. Inspecionar os testes pela comprovação que fornecem: eles falhariam sem a
   correção, ou só cobrem a linha sem provar o comportamento?
6. Confirmar cada achado suspeito lendo o código real e os chamadores/
   consumidores antes de reportar: reduz falso positivo.
7. Relatar por severidade, com localização exata (`arquivo:linha`), condição
   que dispara a falha, impacto e correção provável.

## Padrões

- Priorizar bugs e falhas concretas; não transformar preferência de estilo em
  bloqueador.
- Aprovar a mudança que melhora a saúde do código do sistema, mesmo quando
  ainda há espaço para melhorias pontuais.
- Cada achado descreve condição de entrada, consequência observável e a
  comprovação que comprova (linha, teste, log).
- Considerar compatibilidade com clientes existentes, concorrência, plano de
  rollback e observabilidade da mudança, não só o caminho feliz.
- Verificar se o teste adicionado falharia sem a correção real: teste que
  passa antes e depois da mudança não prova nada.
- Distinguir escopo ausente do PR (bloqueador de merge) de melhoria futura
  opcional (comentário, não impedimento de merge).
- Não repetir achado que lint, formatter ou type checker automatizado já
  cobre; aponte só o que a automação não vê.
- Declarar explicitamente "nenhum achado nesta lente" quando for o caso, sem
  linguagem que implique ausência de falhas além do observado.

## Antipadrões

- Recusar o merge por gosto pessoal de nome de variável ou formatação quando o
  projeto já tem linter configurado para isso: desperdiça o orçamento de
  atenção da revisão nos achados que importam.
- Aprovar porque "os testes passam", sem checar se o teste novo de fato
  cobre o comportamento da mudança (teste tautológico ou sem asserção real).
- Revisar arquivo por arquivo sem montar o fluxo entre eles: perde efeitos
  cruzados, como uma função que muda de assinatura sem todos os chamadores
  ajustados.
- Reportar "parece inseguro" sem apontar o vetor concreto: achado de
  segurança sem trust boundary e entrada específica não é acionável.

## Validação

- Revisar o diff completo, incluindo arquivos de configuração, migrations e
  chamadores/consumidores fora do diff que o comportamento afeta.
- Conferir cada achado relatado contra o estado real do código e da suíte de
  testes antes de publicar: achado não confirmado não entra no relatório.
- Ordenar a lista final por severidade (probabilidade × impacto), não pela
  ordem dos arquivos no diff.
- Resumir cobertura da revisão (o que foi olhado) e pontos pendentes (o que não
  foi possível confirmar) ao final.
- Não declarar um diff "seguro" ou "correto" sem a comprovação acima:
  linguagem absoluta sem prova é proibida.

## Skills relacionadas

- `$specsfy-specialist-debugging` fornece reprodução e causa raiz quando o
  review encontra um defeito ainda não explicado.
- `$specsfy-specialist-typescript` aprofunda contratos de tipo e
  `$specsfy-specialist-interface` aprofunda semântica, teclado e WCAG
  quando essas falhas aparecem no diff.
- `$specsfy-specialist-application-security` quando o diff tocar identidade,
  autorização, dado sensível ou entrada externa: a revisão de segurança
  aprofunda o que esta skill só sinaliza.
- `$specsfy-specialist-architecture` quando o achado for sobre
  acoplamento, boundary ou escolha estrutural que o diff expõe, não apenas
  sobre o diff em si.
- `$specsfy-specialist-git` quando a revisão precisar
  ser refeita após uma resolução de conflito, já que a resolução pode mudar
  o comportamento resultante.

Leia [references/standards.md](references/standards.md) para as lentes de
revisão, a escala de severidade, o formato de achado e as fontes oficiais de
referência.
