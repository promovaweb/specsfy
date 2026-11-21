# Padrões e referências de pesquisa técnica

## Hierarquia de fontes, da mais à menos autoritativa

1. **Especificação e standard** (RFC, W3C TR, ECMA, ISO) ou fonte
   proprietária de quem controla o comportamento (ex.: docs de um vendor
   para uma API só dele).
2. **Documentação oficial versionada** do projeto/framework/serviço em
   questão, na versão que o ambiente alvo realmente usa.
3. **Código-fonte, testes e changelog oficiais** — quando a documentação é
   ambígua ou omissa, o comportamento real está no código e nos testes que
   o exercitam.
4. **Experimento reproduzível no ambiente alvo** — quando nenhuma fonte
   documental resolve a dúvida, um experimento controlado no mesmo runtime,
   versão e configuração do projeto é a próxima melhor evidência.
5. **Fonte secundária com metodologia explícita** (post técnico, talk,
   artigo) — só serve como evidência quando descreve como o autor chegou à
   conclusão (ambiente, versão, medição) de forma verificável; sem isso, é
   opinião, não evidência.

Uma fonte de nível inferior nunca sobrepõe uma de nível superior sem uma
razão explícita (ex.: a documentação oficial está desatualizada e o
changelog mais recente contradiz).

## Vigência do documento citado

- **RFC**: confira o cabeçalho da própria RFC. Um RFC pode ser obsoletado ou
  atualizado por outro (`Obsoletes`/`Updates`), e o link correto passa a ser o
  do substituto. A [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
  substituiu as RFCs 7231, 7232, 7233 e 7235 e parte da RFC 7230. A
  [RFC 9112](https://www.rfc-editor.org/rfc/rfc9112.html) substituiu o restante
  da RFC 7230. A [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html)
  substituiu a RFC 7234. A RFC 9457 substituiu a RFC 7807.
- **Internet-Draft**: não é padrão publicado e expira em seis meses. Use como
  fonte de trabalho, diga que é draft, informe o número (`-08`, `-12`) e a data,
  e revalide antes de apoiar uma escolha durável. Verifique se virou RFC.
- **Documentação de projeto**: a versão faz parte da citação. Página sem versão
  não comprova comportamento de uma versão específica, ainda que descreva o
  comportamento atual.
- **Versão de software**: SemVer descreve a intenção da mudança, não garante
  compatibilidade de comportamento; confirme no changelog e nos testes.

## Matriz de avaliação de uma fonte

- **Autoridade**: quem controla de fato o comportamento descrito — o mesmo
  projeto/vendor, ou um terceiro reproduzindo de fora?
- **Atualidade**: qual versão exata e qual data de publicação? O
  comportamento descrito ainda vale para a versão em uso no projeto?
- **Aplicabilidade**: a fonte descreve o mesmo runtime, configuração, escala
  e modo de uso do projeto, ou uma condição diferente o suficiente para
  invalidar a generalização?
- **Reprodutibilidade**: outra pessoa, com a mesma fonte e o mesmo ambiente,
  chegaria à mesma conclusão?
- **Incentivo**: existe interesse comercial, seleção de dados favorável, ou
  benchmark patrocinado por quem vende a tecnologia comparada?

Uma fonte que falha em "aplicabilidade" ou tem alto "incentivo" não é
descartada automaticamente, mas exige triangulação com uma segunda fonte
independente antes de sustentar uma conclusão importante. (regra da casa)

## Formato de síntese

Pergunta → Decisão suportada → Conclusão (fato / inferência / lacuna,
rotulado explicitamente) → Evidência (link direto à seção específica +
versão + data) → Conflito entre fontes, se houver, e como foi resolvido →
Implicação prática para a decisão → Lacunas residuais que permanecem sem
resposta.

Nunca apresentar "inferência" com a mesma confiança textual de "fato" — o
rótulo precisa aparecer na síntese, não só existir na cabeça de quem
pesquisou.

## Fontes oficiais para localizar fontes primárias

- RFC Editor: https://www.rfc-editor.org/
- W3C Technical Reports: https://www.w3.org/TR/
- ECMA International (ECMAScript e outros standards): https://ecma-international.org/publications-and-standards/standards/
- NIST Publications: https://www.nist.gov/publications
- Crossref metadata (localizar publicação e DOI): https://www.crossref.org/documentation/retrieve-metadata/
- GitHub Releases (changelog oficial de projetos open source): https://docs.github.com/repositories/releasing-projects-on-github
- Semantic Versioning (interpretar o que uma mudança de versão garante): https://semver.org/
