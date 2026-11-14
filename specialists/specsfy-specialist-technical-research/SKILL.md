---
name: specsfy-specialist-technical-research
description: Investigar questões técnicas em fontes primárias, código-fonte, padrões e experimentos reproduzíveis, produzindo síntese rastreável com fato, inferência e lacuna separados. Use quando uma escolha depende de comportamento real de API, comparação de tecnologias ou fato tecnicamente incerto; salve a pesquisa somente no local autorizado pela spec do projeto consumidor, nunca em `research.md` paralelo.
---

# Pesquisa técnica

## Quando usar

- Acionar quando uma escolha de arquitetura, biblioteca ou abordagem
  depende de um fato técnico que ninguém confirmou com fonte primária.
- Acionar também para comparar alternativas antes de uma escolha cara de
  reverter, ou para verificar se um comportamento assumido ainda é válido
  na versão atual de uma dependência.
- Não acionar para reconfirmar uma escolha já decidida só para produzir
  justificativa: isso é viés de confirmação, não pesquisa.
- Combinar com `$specsfy-specialist-software-architecture` quando a pesquisa
  embasar diretamente uma escolha estrutural registrável em ADR.

## Fluxo

1. Formular a pergunta específica, a escolha que ela vai suportar, o escopo
   e a recência necessária (comportamento de hoje, ou histórico é
   suficiente?).
2. Definir de antemão que comprovação confirmaria ou refutaria cada
   alternativa, sem isso, qualquer resultado parece confirmar a suposição
   inicial.
3. Priorizar, nesta ordem: especificação/standard, documentação oficial
   versionada, código-fonte e changelog oficiais, experimento reproduzível
   no ambiente alvo. Só então usar fonte secundária.
4. Verificar versão, data de publicação e aplicabilidade ao ambiente real
   observado no projeto: um comportamento documentado para outra versão
   não é comprovação para a versão em uso.
5. Triangular toda afirmação crítica para a escolha com uma segunda fonte
   independente. Executar experimento controlado quando a documentação
   não resolver a dúvida.
6. Separar explicitamente fatos confirmados, inferências (prováveis mas não
   confirmadas), consequências possíveis e lacunas que permanecem sem comprovação.
7. Sintetizar com links diretos à fonte, próximos à afirmação específica que
   sustentam, com a implicação concreta para a escolha em jogo.

## Padrões

- Não usar snippet de fórum, blog pessoal ou resposta de IA genérica como
  autoridade sobre comportamento de API quando existe fonte primária
  acessível: usar como pista para onde procurar a fonte primária, não como
  citação final.
- Citar a página e a seção específica da fonte próxima da afirmação, não um
  link genérico para a home da documentação.
- Sintetizar preservando o contexto necessário para a escolha; evitar
  transcrição extensa que apenas desloca o trabalho de leitura para depois.
- Registrar versão e data de qualquer fonte cujo comportamento pode mudar
  entre releases, sem isso, a conclusão expira silenciosamente.
- Quando duas fontes conflitam, declarar o conflito explicitamente em vez de
  escolher uma silenciosamente sem justificar por que ela prevalece.
- Não criar um `research.md` paralelo à fonte normativa do projeto; a
  pesquisa é indexada e vive no local que a spec do projeto consumidor
  define.
- Tratar benchmark publicado por fornecedor da própria tecnologia como
  comprovação interessada: útil como ponto de partida, nunca como conclusão
  final sem reprodução independente.

## Antipadrões

- Pesquisar depois de já ter decidido, buscando apenas confirmação: a
  pergunta formulada no passo 1 já sai enviesada ("por que X é melhor",
  em vez de "X ou Y, e sob qual regra").
- Citar "a documentação diz" sem link nem versão: torna a afirmação
  impossível de reverificar quando o comportamento mudar.
- Copiar benchmark de marketing de um fornecedor como se fosse medição
  neutra do ambiente do projeto.
- Resolver uma pergunta com múltiplas fontes conflitantes escolhendo a que
  confirma a preferência inicial, sem registrar que havia conflito.

## Validação

- Cada conclusão que sustenta a escolha tem comprovação direta e rastreável
  (link + versão + data), não apenas afirmação de memória.
- As fontes usadas correspondem à versão e ao runtime real do projeto
  consumidor, não a uma versão genérica ou desatualizada.
- Experimentos executados são reproduzíveis por outra pessoa e não alteram
  produção nem dado real.
- Lacunas e incerteza residual estão explícitas na síntese final, não
  escondidas atrás de uma conclusão mais confiante do que a comprovação
  permite.
- Não apresentar uma suposição não triangulada como fato: linguagem que
  implica certeza sem a comprovação correspondente é proibida.

## Skills relacionadas

- `$specsfy-specialist-domain-modeling` usa fontes externas para alinhar
  conceitos sem substituir o vocabulário validado do domínio.
- `$specsfy-specialist-prototyping` transforma incerteza técnica em experimento
  descartável com suposição e condição de parada.
- `$specsfy-specialist-software-architecture` quando a pesquisa embasar uma
  escolha estrutural registrável em ADR.
- `$specsfy-specialist-laravel-package-manager` quando a pesquisa precisar
  confirmar documentação, versão ou instalação de um pacote Composer Laravel.
- `$specsfy-specialist-debugging` quando a "pesquisa" for, na verdade,
  investigar por que um comportamento observado diverge do documentado:
  nesse caso o diagnóstico de causa raiz é o objetivo, não a comparação de
  alternativas.

Leia [references/standards.md](references/standards.md) para a hierarquia de
fontes, a matriz de avaliação de comprovação e o formato de síntese.
