---
name: specsfy-specialist-prototyping
description: Construir protótipos descartáveis para responder uma pergunta técnica, de interação ou visual específica, com a fidelidade mínima suficiente e sem herdar dívida técnica para produção. Use para spikes, provas de conceito e exploração de alternativas antes de uma escolha cara; não promover código de protótipo a produção sem reimplementação e validação completa; não use quando a pergunta já tem resposta documentada, use `$specsfy-specialist-technical-research` para isso.
---

# Prototipação

## Quando usar

- Acionar quando existe uma pergunta técnica, de interação ou visual
  específica que só um artefato executável (não um documento) consegue
  responder com confiança.
- Acionar também para comparar duas ou mais alternativas concretas antes de
  uma escolha cara de reverter.
- Não acionar quando a pergunta já tem resposta documentada em fonte
  primária: nesse caso `$specsfy-specialist-technical-research` resolve
  mais rápido e sem o custo de construir algo.
- Não promover o código do protótipo diretamente a produção: a fidelidade
  reduzida do protótipo (sem cobertura, sem tratamento de erro, sem
  segurança) é uma escolha deliberada válida apenas enquanto ele é
  descartável.

## Fluxo

1. Formular uma única pergunta e a regra que decide a resposta antes de
   escrever qualquer código, sem isso, o protótipo vira exploração sem
   fim.
2. Definir o que precisa ser real (o mecanismo sob teste) e o que pode ser
   simulado ou mockado (tudo que não afeta a resposta à pergunta).
3. Escolher a fidelidade mínima suficiente, um tempo limite explícito e um
   local claramente descartável no repositório ou fora dele.
4. Construir mais de uma alternativa quando a comparação direta entre elas
   for mais informativa que testar uma só contra a expectativa.
5. Executar o cenário planejado e coletar comprovação observável, não
   impressão subjetiva de "parece que funciona".
6. Responder à pergunta original explicitamente (aceita, rejeitada ou ainda
   inconclusiva) e registrar as limitações do que foi testado.
7. Descartar o protótipo ou arquivá-lo explicitamente como não-produção,
   sem deixar nenhuma dependência de runtime apontando para ele.

## Padrões

- Não confundir uma demo convincente com uma arquitetura válida: um
  protótipo que "funciona na demo" não provou nada sobre concorrência,
  escala, erro ou segurança que não foi deliberadamente exercitado.
- Manter dados reais, credenciais de produção e integrações reais fora do
  protótipo, salvo quando a própria pergunta exige testar contra o sistema
  real (e mesmo assim, com escopo e autorização explícitos).
- Para protótipo de interface, usar conteúdo realista (não "lorem ipsum")
  e estados extremos (texto muito longo, lista vazia, erro): a pergunta
  sobre UI raramente é sobre o caminho feliz.
- Para protótipo de lógica/estado, expor as transições e invariantes numa
  interface mínima (CLI, teste executável) que as torne observáveis, em vez
  de escondê-las atrás de uma UI completa desnecessária à pergunta.
- Não gastar tempo com abstração, cobertura de teste ou acabamento visual
  fora do que a pergunta exige: isso é o oposto do propósito do
  protótipo.
- Marcar o código como descartável de forma que impeça import acidental por
  código de produção (diretório isolado, nome inequívoco, sem export
  público).
- Converter todo aprendizado relevante em requisito, escolha registrada ou
  teste no owner correto (spec, ADR, backlog): o protótipo em si não é
  fonte de verdade depois de descartado.

## Antipadrões

- Deixar o protótipo "temporário" rodando em produção porque "funcionou",
  sem a validação completa (segurança, erro, escala) que o protótipo
  deliberadamente pulou, ele leva falhas invisíveis para produção.
- Testar várias perguntas ao mesmo tempo no mesmo protótipo: quando o
  resultado é ambíguo, não dá para saber qual variável causou o quê.
- Investir em polimento visual ou arquitetura "só por garantia" quando a
  pergunta era puramente sobre viabilidade técnica de um mecanismo.
- Herdar a dívida do protótipo silenciosamente: reaproveitar o arquivo do
  protótipo como base do código de produção sem reescrevê-lo com os
  padrões normais de qualidade.

## Validação

- A regra de escolha foi definida antes da execução. O resultado é
  reproduzível por outra pessoa que rode o mesmo cenário.
- A pergunta original tem resposta explícita: suposição aceita, rejeitada ou
  ainda inconclusiva (e, nesse caso, o que falta para decidir).
- As limitações do protótipo e as diferenças em relação ao que produção
  exigiria estão registradas explicitamente.
- Nenhum artefato do protótipo permanece conectado ao runtime final:
  verificado, não apenas assumido.
- Não declarar uma abordagem "viável para produção" só com base no
  protótipo: isso exige a implementação e validação completas descritas
  no padrão do projeto.

## Skills relacionadas

- `$specsfy-specialist-technical-research` quando a pergunta puder ser
  respondida por fonte primária sem precisar construir nada.
- `$specsfy-specialist-domain-modeling` quando o protótipo revelar um
  conceito de domínio ainda não modelado: o aprendizado vira modelo, não
  fica preso ao código descartável.
- `$specsfy-specialist-ux-design` ou `$specsfy-specialist-ui-design` quando
  o protótipo for de interface e precisar de rigor de fluxo ou hierarquia
  visual além da pergunta pontual.

Leia [references/standards.md](references/standards.md) para níveis de
fidelidade por tipo de pergunta, formato de saída e fontes oficiais.
