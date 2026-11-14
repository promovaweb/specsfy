# Pesquisa Técnica

O especialista Pesquisa Técnica orienta o agente a confirmar fatos técnicos em
fontes primárias antes de uma escolha. A pesquisa registra versão, data e link
de cada fonte e separa os fatos confirmados das inferências e das lacunas.

## Quando usar

- Uma escolha de arquitetura, biblioteca ou abordagem depende de um fato que
  ainda não foi confirmado em fonte primária.
- Você quer comparar alternativas antes de uma escolha difícil de reverter.
- Você precisa verificar se um comportamento continua válido na versão atual
  de uma dependência.

A pesquisa não serve para justificar uma escolha já feita. Esse uso produz
viés de confirmação no lugar de uma comparação honesta.

## Como ele trabalha

1. Formula a pergunta, a escolha que ela apoia, o escopo e a recência
   necessária.
2. Define com antecedência qual comprovação confirmaria ou descartaria cada
   alternativa.
3. Consulta as fontes nesta ordem:
   1. especificação ou padrão
   2. documentação oficial versionada
   3. código-fonte e changelog oficiais
   4. experimento reproduzível no ambiente alvo
   5. fontes secundárias, por último
4. Confere a versão, a data e a aplicabilidade de cada fonte ao ambiente do
   projeto.
5. Confirma cada afirmação importante com uma segunda fonte independente ou
   com um experimento controlado.
6. Separa fatos confirmados, inferências, consequências possíveis e lacunas.
7. Sintetiza a resposta com links diretos ao lado de cada afirmação e a
   implicação para a escolha.

## Padrões aplicados

- Fóruns, blogs pessoais e respostas genéricas de IA servem como pistas para a
  fonte primária e não como citação final.
- A citação aponta a página e a seção específicas.
- A síntese preserva o necessário para a escolha, sem transcrições longas.
- Fontes que mudam entre releases trazem versão e data.
- Fontes em conflito aparecem como conflito declarado.
- A pesquisa fica no local definido pela spec do projeto, sem um
  `research.md` paralelo.
- Benchmarks publicados pelo próprio fornecedor são tratados como ponto de
  partida até uma reprodução independente.

## Erros que ele evita

- Pesquisar depois de decidir, buscando só confirmação.
- Dizer que a documentação afirma algo sem link nem versão.
- Copiar um benchmark de marketing como se fosse uma medição neutra.
- Resolver um conflito entre fontes escolhendo a que confirma a preferência
  inicial.

## Como conferir o resultado

- Cada conclusão tem comprovação rastreável, com link, versão e data.
- As fontes correspondem à versão e ao runtime do projeto.
- Os experimentos podem ser reproduzidos e não alteram a produção.
- Lacunas e incertezas aparecem de forma explícita na síntese.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-technical-research \
  --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Modelagem de Domínio](domain-modeling.md) usa fontes externas para alinhar
  conceitos.
- [Prototipação](prototyping.md) transforma uma incerteza técnica em
  experimento descartável.
- [Arquitetura de Software](software-architecture.md) registra em ADR a
  escolha estrutural apoiada pela pesquisa.
- [Gestor de pacotes Laravel](laravel-package-manager.md) confirma versões e
  instalação de pacotes Composer.
- [Debugging](debugging.md) entra quando a dúvida é por que um comportamento
  observado difere do documentado.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-technical-research/SKILL.md),
com a hierarquia de fontes e o formato de síntese no arquivo de referência da
mesma pasta.
