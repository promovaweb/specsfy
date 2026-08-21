---
name: specsfy-specialist-code-quality-review
description: Revisar o código recém-escrito contra os padrões registrados do próprio projeto, por severidade, com arquivo, linha e correção concreta em cada achado. Use ao terminar uma tarefa de implementação, antes de considerar o trabalho pronto, e sempre que código novo tocar tipos, fronteira servidor e cliente, validação de entrada, autorização, schema ou componente de interface; não use para avaliar risco de um diff já fechado em PR nem para desenhar decisão estrutural, use `$specsfy-specialist-code-review` e `$specsfy-specialist-software-architecture` nesses casos.
---

# Revisão de qualidade de código

Esta revisão acontece no fim da implementação, não no fim do fluxo. Ela compara
o que acabou de ser escrito com o que o projeto já decidiu sobre si mesmo, e o
resultado é uma lista ordenada por severidade, com localização exata e a
correção que a pessoa aplica sem precisar interpretar.

## Quando usar

- Acionar ao terminar uma tarefa de implementação, antes de declarar o trabalho
  pronto, sobre os arquivos que a tarefa criou ou alterou.
- Acionar também quando o código novo tocar tipo, fronteira entre servidor e
  cliente, validação de entrada externa, autorização, schema de banco ou
  componente de interface reaproveitável.
- Não acionar para avaliar o risco de um diff fechado, com base de comparação e
  histórico próprios: essa é a revisão de `$specsfy-specialist-code-review`,
  que julga a mudança inteira, e não a conformidade do que acabou de sair do
  editor.
- Não acionar para decidir estrutura, dependência ou fronteira de módulo: use
  `$specsfy-specialist-software-architecture` e volte quando existir código.

## Fluxo

1. Delimitar o alvo: os arquivos recém-criados ou alterados pela tarefa. Uma
   revisão que se espalha pelo repositório inteiro dilui a atenção e produz
   achados sobre código que ninguém tocou.
2. Ler os padrões que o projeto registrou sobre si mesmo antes de julgar, nas
   instruções de agente, nas regras e na spec da fatia. Sem essa leitura,
   "qualidade" vira preferência pessoal de quem revisa.
3. Descartar o que a automação já cobre. Formatação, ordenação de import e erro
   de tipo pertencem ao formatador, ao lint e ao compilador; repetir esses
   achados gasta o orçamento de atenção da revisão.
4. Percorrer as lentes de
   [references/standards.md](references/standards.md) sobre o alvo: tipos e
   contratos, fronteira entre servidor e cliente, validação de entrada externa,
   autorização e exposição de dado, estado e efeito na interface, persistência
   e complexidade acidental.
5. Confirmar cada achado no código real, incluindo quem chama e quem consome,
   antes de escrevê-lo. Achado não confirmado não entra no relatório.
6. Classificar por severidade e escrever cada item com arquivo, linha, condição
   que dispara a falha, consequência observável e a correção concreta.
7. Registrar também o que passou: o padrão bem aplicado, dito de forma
   específica, é o que faz a próxima tarefa repeti-lo.

## Padrões

- Ordenar o relatório por severidade, nunca pela ordem dos arquivos: crítico
  quando há vazamento de dado, falha de autorização ou quebra de contrato
  publicado; alto quando o comportamento correto depende de sorte; médio quando
  o padrão do projeto foi violado sem falha imediata; baixo quando é
  manutenção.
- Escrever cada achado com localização e correção. Achado sem `arquivo:linha`
  ou sem a mudança proposta é ruído, e quem implementou vai ter que descobrir
  os dois de novo.
- Tratar tipo dinâmico introduzido de propósito, entrada externa sem validação
  na fronteira em que chega e privilégio concedido além do necessário como
  achados de severidade alta ou crítica, nunca como observação de estilo.
- Verificar a fronteira entre servidor e cliente sempre que a linguagem
  permitir importar dos dois lados do mesmo módulo: segredo que atravessa a
  fronteira sai do processo e vai para quem abre o navegador.
- Exigir que a autorização seja verificada na camada que o projeto elegeu como
  dona dela e que essa camada esteja de fato no caminho da chamada nova.
- Recusar abstração criada para um único uso e componente duplicado quando o
  projeto já publica o equivalente; as duas decisões custam mais na segunda
  mudança do que economizam na primeira.
- Separar o que bloqueia a entrega do que é melhoria futura, e dizer qual é
  qual. Uma lista sem essa separação vira uma lista que ninguém aplica.
- Declarar explicitamente quando uma lente não encontrou nada, sem estender a
  frase para além do que foi olhado.

## Antipadrões

- Revisar contra o gosto de quem revisa em vez das regras que o projeto
  registrou. O resultado é uma discussão de preferência que nenhuma evidência
  resolve, e a próxima tarefa recebe o conselho oposto.
- Repetir o que o lint, o formatador e o compilador já apontam. Além de inútil,
  esconde o achado real no meio do ruído.
- Aprovar porque a suíte passou, sem olhar se o teste novo falharia sem a
  correção. Teste que passa antes e depois da mudança não prova nada.
- Apontar "parece inseguro" sem o vetor concreto: qual entrada, qual usuário,
  qual dado alcançado. Sem isso, quem implementou não tem o que corrigir.
- Revisar arquivo por arquivo sem montar o fluxo entre eles, e perder o efeito
  cruzado: a função que mudou de assinatura, o chamador que continuou igual, o
  privilégio que a rota nova herdou sem querer.

## Validação

- Reexecutar os gates que o projeto declara como obrigatórios antes de fechar a
  revisão, e citar o resultado de cada um no relatório.
- Confirmar cada achado no código real antes de publicá-lo, incluindo os
  chamadores fora do alvo que o comportamento alcança.
- Encerrar com a cobertura da revisão, o que foi olhado, e o risco residual, o
  que não foi possível confirmar e por quê.
- Não declarar o código "pronto", "seguro" ou "conforme" sem a evidência acima;
  linguagem absoluta sem prova é proibida.

## Skills relacionadas

- `$specsfy-specialist-code-review` avalia o diff fechado por contrato, risco
  operacional e efeito em quem consome; esta skill roda antes, sobre o código
  que acabou de ser escrito, e cobra os padrões do próprio projeto.
- `$specsfy-specialist-typescript` aprofunda contrato de tipo, strictness e
  narrowing quando o achado for de tipagem, e não de conformidade.
- `$specsfy-specialist-debugging` assume quando a revisão encontra um defeito
  que ninguém consegue explicar sem reprodução.

Leia [references/standards.md](references/standards.md) para as lentes de
revisão, a escala de severidade, o formato do relatório e as fontes oficiais.
