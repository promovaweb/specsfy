# Padrões e referências de revisão de código

## Lentes de revisão, em ordem de prioridade

1. **Contrato**: a mudança faz o que a spec/issue pede? Cobre os critérios de
   aceite, não apenas o caminho feliz descrito no título do PR?
2. **Correção**: estados possíveis, tratamento de erro, limites (vazio,
   nulo, máximo, negativo) e concorrência (duas requisições, duas escritas).
3. **Segurança**: trust boundary cruzado, identidade usada para autorizar
   (não só autenticar), dado sensível em log ou resposta.
4. **Design**: ownership do dado/comportamento, acoplamento introduzido,
   direção de dependência (módulo estável sendo puxado por módulo volátil).
5. **Operação**: migration reversível, config nova documentada, telemetria
   suficiente para diagnosticar em produção, plano de rollback.
6. **Evidência**: o teste novo falha sem a correção? Tipos e checks
   estáticos cobrem o caso, ou dependem de disciplina manual?

Revise nessa ordem: um achado crítico de correção importa mais que qualquer
achado de estilo, mesmo que o estilo seja mais fácil de apontar.

## Tamanho de PR e profundidade de revisão

- PRs grandes (regra prática: acima de ~400 linhas de diff efetivo,
  ignorando arquivos gerados/lockfile) reduzem a taxa de detecção de defeito
  por revisor — a atenção não escala linearmente com o tamanho do diff.
  Quando o PR for grande demais para revisar com confiança, isso é, em si,
  um achado a reportar, não algo a absorver silenciosamente revisando
  superficialmente.
- Separe lockfiles, arquivos gerados e formatação automática do diff
  "efetivo" antes de estimar profundidade necessária.
- Revisão de PR pequeno e focado permite lente completa (as 6 acima); PR
  grande força priorização — declare explicitamente qual lente foi aplicada
  com profundidade e qual foi só verificada superficialmente.

## Severidade

- **Crítica**: exploração de segurança, perda ou corrupção de dado,
  indisponibilidade ampla provável. Bloqueia merge sempre.
- **Alta**: comportamento incorreto relevante para o usuário ou o negócio,
  sem mitigação existente. Bloqueia merge por padrão.
- **Média**: falha de escopo limitado ou dívida técnica com impacto
  concreto e localizável. Pode virar follow-up explícito com owner e prazo.
- **Baixa**: robustez, legibilidade ou manutenção com benefício demonstrável,
  não apenas preferência. Comentário, nunca bloqueio.

## Formato de achado

Cada achado reportado precisa das quatro partes abaixo — a ausência de
qualquer uma torna o achado não acionável:

- **Localização**: `arquivo:linha` ou intervalo exato.
- **Condição**: a entrada, sequência ou estado que dispara o problema.
- **Consequência**: o que quebra, e para quem (usuário, operação, outro
  sistema) — não apenas "está errado".
- **Evidência ou correção provável**: teste que reproduz, log observado, ou
  uma direção concreta de correção (não precisa ser o diff completo da
  correção).

Feedback de estilo/preferência usa o mesmo formato, mas rotulado como `nit`
(seguindo Conventional Comments) para deixar claro que não bloqueia.

## Revisão de teste como parte da revisão

- Um teste que passa antes e depois da mudança não prova a mudança — verifique
  mentalmente (ou rode) o teste contra o código anterior; se ele já passava,
  ele não cobre o comportamento novo.
- Teste que só chama a função sem asserção sobre o resultado relevante conta
  como ausência de teste, não como cobertura.
- Prefira teste que expressa o comportamento do domínio (dado X, quando Y,
  então Z) a teste que espelha a implementação linha a linha — este último
  quebra a cada refactor sem detectar regressão real.

## Fontes oficiais

- Google Engineering Practices (revisão de código): https://google.github.io/eng-practices/review/
- Google Engineering Practices (como enviar um CL para revisão): https://google.github.io/eng-practices/review/developer/
- OWASP Code Review Guide: https://owasp.org/www-project-code-review-guide/
- Conventional Comments (rótulos de comentário): https://conventionalcomments.org/
- SEI CERT Coding Standards (critérios objetivos de correção por linguagem): https://cmu-sei.github.io/secure-coding-standards/
