---
name: specsfy-specialist-code-review
description: Revisar diffs, branches e PRs por contrato, correção, segurança, arquitetura, testes e risco operacional, relatando achados por severidade com localização e evidência. Use quando o usuário pedir code review, segunda opinião sobre uma mudança ou avaliação de risco de um diff; é somente leitura salvo pedido explícito para corrigir; não use para desenhar a arquitetura do zero, use `$specsfy-specialist-software-architecture` para isso.
---

# Revisão de código

## Quando usar

- Acionar quando houver um diff, branch ou PR concreto para avaliar antes de
  mergear ou publicar.
- Acionar também quando o pedido for "segunda opinião" sobre uma mudança já
  escrita, mesmo sem PR aberto.
- Não acionar para desenhar uma decisão estrutural nova do zero — use
  `$specsfy-specialist-software-architecture`; a revisão avalia o que já foi
  decidido e escrito, não substitui a decisão.
- Combinar com `$specsfy-specialist-application-security` quando o diff tocar
  autenticação, autorização, dados sensíveis ou entrada externa, e com
  `$specsfy-specialist-domain-modeling` quando o achado for sobre nomes,
  invariantes ou fronteiras de domínio confusas.

## Fluxo

1. Fixar a base de comparação e o escopo exato do diff; revisar um diff sem
   base clara produz achados sobre código que a mudança não tocou.
2. Ler spec, issue, critérios de aceite e instruções do repositório aplicáveis
   antes de julgar; sem isso, "correto" vira opinião pessoal.
3. Mapear cada arquivo alterado para o comportamento e o boundary que ele
   afeta (dado, permissão, contrato de API, config, dependência).
4. Avaliar corretude, casos de borda, segurança, concorrência e efeito
   operacional antes de estilo — estilo só bloqueia quando automação não o
   cobre.
5. Inspecionar os testes pela evidência que fornecem: eles falhariam sem a
   correção, ou só cobrem a linha sem provar o comportamento?
6. Confirmar cada achado suspeito lendo o código real e os chamadores/
   consumidores antes de reportar — reduz falso positivo.
7. Relatar por severidade, com localização exata (`arquivo:linha`), condição
   que dispara a falha, impacto e correção provável.

## Padrões

- Priorizar bugs e risco concreto; não transformar preferência de estilo em
  bloqueador.
- Cada achado descreve condição de entrada, consequência observável e a
  evidência que comprova (linha, teste, log).
- Considerar compatibilidade com clientes existentes, concorrência, plano de
  rollback e observabilidade da mudança, não só o caminho feliz.
- Verificar se o teste adicionado falharia sem a correção real — teste que
  passa antes e depois da mudança não prova nada.
- Distinguir escopo ausente do PR (bloqueador de merge) de melhoria futura
  opcional (comentário, não bloqueio).
- Não repetir achado que lint, formatter ou type checker automatizado já
  cobre; aponte só o que a automação não vê.
- Declarar explicitamente "nenhum achado nesta lente" quando for o caso, sem
  linguagem que implique ausência de risco além do observado.

## Antipadrões

- Bloquear por gosto pessoal de nome de variável ou formatação quando o
  projeto já tem linter configurado para isso — desperdiça o orçamento de
  atenção da revisão nos achados que importam.
- Aprovar porque "os testes passam", sem checar se o teste novo de fato
  cobre o comportamento da mudança (teste tautológico ou sem asserção real).
- Revisar arquivo por arquivo sem montar o fluxo entre eles — perde efeitos
  cruzados, como uma função que muda de assinatura sem todos os chamadores
  ajustados.
- Reportar "parece inseguro" sem apontar o vetor concreto — achado de
  segurança sem trust boundary e entrada específica não é acionável.

## Validação

- Revisar o diff completo, incluindo arquivos de configuração, migrations e
  chamadores/consumidores fora do diff que o comportamento afeta.
- Conferir cada achado relatado contra o estado real do código e da suíte de
  testes antes de publicar — achado não confirmado não entra no relatório.
- Ordenar a lista final por severidade (probabilidade × impacto), não pela
  ordem em que os arquivos aparecem no diff.
- Resumir cobertura da revisão (o que foi olhado) e risco residual (o que não
  foi possível confirmar) ao final.
- Não declarar um diff "seguro" ou "correto" sem a evidência acima —
  linguagem absoluta sem prova é proibida.

## Skills relacionadas

- `$specsfy-specialist-debugging` fornece reprodução e causa raiz quando o
  review encontra um defeito ainda não explicado.
- `$specsfy-specialist-typescript` aprofunda contratos de tipo e
  `$specsfy-specialist-web-accessibility` aprofunda semântica, teclado e WCAG
  quando esses riscos aparecem no diff.
- `$specsfy-specialist-application-security` quando o diff tocar identidade,
  autorização, dado sensível ou entrada externa — a revisão de segurança
  aprofunda o que esta skill só sinaliza.
- `$specsfy-specialist-code-quality-review` roda antes, sobre o código que
  acabou de ser escrito, cobrando os padrões que o próprio projeto
  registrou; esta skill julga o diff fechado por risco e contrato.
- `$specsfy-specialist-software-architecture` quando o achado for sobre
  acoplamento, boundary ou decisão estrutural que o diff expõe, não apenas
  sobre o diff em si.
- `$specsfy-specialist-merge-conflict-resolution` quando a revisão precisar
  ser refeita após uma resolução de conflito, já que a resolução pode mudar
  o comportamento resultante.

Leia [references/standards.md](references/standards.md) para as lentes de
revisão, a escala de severidade, o formato de achado e as fontes oficiais de
referência.
