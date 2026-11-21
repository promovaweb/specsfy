# Pesquisa

O especialista Pesquisa orienta o agente a reduzir incerteza técnica com o menor
artefato que responde à pergunta. Ele confirma fatos em fontes primárias, com
versão, data e link, e constrói protótipos descartáveis quando documento nenhum
resolve. Nos dois casos, o resultado é uma resposta explícita, com limitações e
próximo passo, e nada vira fonte normativa paralela à spec do projeto.

## Quando usar

- Uma escolha de arquitetura, biblioteca ou abordagem depende de um fato que
  ainda não foi confirmado em fonte primária.
- Você quer comparar alternativas antes de uma escolha difícil de reverter.
- Você precisa verificar se um comportamento continua válido na versão atual de
  uma dependência.
- Uma pergunta específica só pode ser respondida com confiança por algo
  executável, ou você quer comparar duas ou mais alternativas concretas.

A pesquisa não serve para justificar uma escolha já feita. Esse uso produz viés
de confirmação no lugar de uma comparação honesta. Quando a dúvida é por que um
comportamento observado difere do documentado, o especialista
[Debugging](debugging.md) investiga a causa raiz. A decisão estrutural fica
registrada com a [Arquitetura](architecture.md).

## Como ele trabalha

1. Formula a pergunta, a escolha que ela apoia, o escopo e a recência
   necessária.
2. Define com antecedência qual comprovação confirmaria ou descartaria cada
   alternativa.
3. Escolhe o modo: fonte primária quando a resposta pode ser documentada ou
   reproduzida sem construir nada, protótipo quando só a execução responde.
4. Confere versão, runtime e configuração reais do projeto antes de generalizar
   qualquer conclusão.
5. Responde à pergunta de forma explícita e separa fatos confirmados,
   inferências, consequências possíveis e lacunas.
6. Registra o resultado no local autorizado pela spec do projeto e encaminha o
   aprendizado ao dono correto: spec, ADR, requisito, teste ou backlog.

## Pesquisa técnica

1. Consulta as fontes nesta ordem:
   1. especificação ou padrão
   2. documentação oficial versionada
   3. código-fonte e changelog oficiais
   4. experimento reproduzível no ambiente alvo
   5. fontes secundárias, por último
2. Confere a versão, a data e a aplicabilidade de cada fonte ao ambiente do
   projeto.
3. Confirma cada afirmação importante com uma segunda fonte independente ou com
   um experimento controlado.
4. Sintetiza a resposta com links diretos ao lado de cada afirmação e a
   implicação para a escolha.

## Prototipação

1. Formula uma única pergunta e a condição que decide a resposta antes de
   escrever código.
2. Define o que precisa ser real (o mecanismo testado) e o que pode ser
   simulado.
3. Escolhe a fidelidade mínima, um prazo explícito e um local descartável.
4. Constrói mais de uma alternativa quando a comparação direta informa melhor.
5. Executa o cenário planejado e coleta comprovação observável.
6. Responde à pergunta como aceita, rejeitada ou inconclusiva e registra as
   limitações do teste.
7. Descarta o protótipo ou o arquiva como código fora de produção, sem
   dependências de runtime apontando para ele.

## Padrões aplicados

- Fóruns, blogs pessoais e respostas genéricas de IA servem como pistas para a
  fonte primária e não como citação final.
- A citação aponta a página e a seção específicas.
- A síntese preserva o necessário para a escolha, sem transcrições longas.
- Fontes que mudam entre releases trazem versão e data.
- Um RFC obsoletado, um Internet-Draft expirado ou uma versão substituída não
  sustentam a conclusão, mesmo que o link ainda abra.
- Fontes em conflito aparecem como conflito declarado.
- A pesquisa fica no local definido pela spec do projeto, sem um `research.md`
  paralelo.
- Benchmarks publicados pelo próprio fornecedor são tratados como ponto de
  partida até uma reprodução independente.
- Uma demonstração convincente não prova concorrência, escala, erro ou segurança
  que não foram exercitados.
- Registros de produção, credenciais e integrações reais ficam fora do protótipo,
  salvo quando a pergunta exige esse teste, com escopo e autorização.
- Protótipos de interface usam conteúdo realista e estados extremos, como texto
  longo, lista vazia e erro.
- Protótipos de lógica expõem transições e invariantes em uma interface mínima,
  como uma CLI ou um teste executável.
- Abstração, cobertura de testes e acabamento visual entram apenas quando a
  pergunta exige.
- O código fica em um diretório isolado, com nome inequívoco e sem export
  público, para impedir imports acidentais.
- O aprendizado vira requisito, escolha registrada ou teste na spec, em um ADR ou
  no backlog.

## Erros que ele evita

- Pesquisar depois de decidir, buscando só confirmação.
- Dizer que a documentação afirma algo sem link nem versão.
- Copiar um benchmark de marketing como se fosse uma medição neutra.
- Resolver um conflito entre fontes escolhendo a que confirma a preferência
  inicial.
- Deixar um protótipo temporário em produção porque funcionou na demonstração.
- Testar várias perguntas no mesmo protótipo.
- Investir em acabamento quando a pergunta era sobre a viabilidade de um
  mecanismo.
- Reaproveitar o arquivo do protótipo como base do código de produção.

## Como conferir o resultado

- Cada conclusão tem comprovação rastreável, com link, versão e data.
- As fontes correspondem à versão e ao runtime do projeto.
- Os experimentos podem ser reproduzidos e não alteram a produção.
- Lacunas e incertezas aparecem de forma explícita na síntese.
- A condição de escolha do protótipo foi definida no início e o resultado pode ser
  reproduzido com o mesmo cenário.
- A pergunta tem resposta explícita. Se ela ficou inconclusiva, o registro diz o
  que falta para decidir.
- As limitações do protótipo e as diferenças em relação à produção estão
  registradas.
- Nenhum artefato do protótipo continua ligado ao runtime final, conforme
  verificado no código.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-research --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Modelagem](modeling.md) usa fontes externas para alinhar conceitos e recebe o
  aprendizado do protótipo como modelo.
- [Arquitetura](architecture.md) registra em ADR a escolha estrutural apoiada
  pela pesquisa.
- [Laravel](laravel.md) confirma versões e instalação de pacotes Composer.
- [Interface](interface.md) recebe o protótipo de interface e acrescenta rigor de
  fluxo, hierarquia visual e acessibilidade.
- [Debugging](debugging.md) entra quando a dúvida é por que um comportamento
  observado difere do documentado.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-research/SKILL.md),
com a hierarquia de fontes e o formato de síntese em `references/sources.md` e os
níveis de fidelidade por tipo de pergunta em `references/prototypes.md`.
