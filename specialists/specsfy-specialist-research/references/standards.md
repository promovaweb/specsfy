# Padrões e referências de pesquisa

Revisado em 2026-11-20 contra: RFC Editor (BCP 14, RFC 2119 e RFC 8174),
W3C Technical Reports, ECMA International, NIST Publications, Crossref,
GitHub Releases, Semantic Versioning 2.0.0, GOV.UK Service Manual e SAFe
(spikes).

## Índice das referências

| Modo | Arquivo | Conteúdo |
| --- | --- | --- |
| sources | [sources.md](sources.md) | hierarquia de fontes, matriz de avaliação, formato de síntese e onde localizar fonte primária |
| prototype | [prototypes.md](prototypes.md) | fidelidade por tipo de pergunta, diferenças entre protótipo e produção e formato de saída |

## O que vale para os dois modos

- A pergunta e a regra de decisão são definidas antes de buscar fonte ou
  escrever código. Sem regra, o resultado vira confirmação da preferência.
- A comprovação é declarada antes da coleta: o que confirmaria, o que refutaria
  e o que deixaria a pergunta inconclusiva.
- Versão, data e ambiente do projeto consumidor acompanham toda conclusão que
  pode mudar entre releases.
- A vigência do documento é verificada antes da citação: RFC obsoletado,
  Internet-Draft expirado ou versão substituída invalidam a conclusão.
- Fato, inferência, consequência e lacuna aparecem rotulados de forma explícita.
- O resultado vive no local autorizado pela spec do projeto. Nunca criar
  `research.md`, `plan.md` ou fonte normativa paralela.
- O aprendizado é encaminhado ao dono correto: spec, ADR, requisito, teste ou
  backlog.
- Nenhum artefato descartável permanece ligado ao runtime de produção.
- Toda afirmação de viabilidade, compatibilidade ou ganho tem comprovação
  reproduzível; "parece funcionar" não é resultado.

## Ordem de leitura do projeto

1. Instruções locais e spec do projeto consumidor.
2. Manifests, lockfiles, versões e runtime em uso.
3. Documentação oficial versionada da dependência envolvida.
4. Código-fonte, testes e changelog oficiais.
5. ADRs existentes e decisões que a pesquisa precisa respeitar.
6. Local autorizado para registrar a pesquisa.

## Fontes oficiais para localizar fontes primárias

- RFC Editor: https://www.rfc-editor.org/
- W3C Technical Reports: https://www.w3.org/TR/
- ECMA International: https://ecma-international.org/publications-and-standards/standards/
- NIST Publications: https://www.nist.gov/publications
- Crossref metadata: https://www.crossref.org/documentation/retrieve-metadata/
- GitHub Releases: https://docs.github.com/repositories/releasing-projects-on-github
- Semantic Versioning: https://semver.org/
- GOV.UK Service Manual, making prototypes: https://www.gov.uk/service-manual/design/making-prototypes
- Scaled Agile Framework, spikes: https://framework.scaledagile.com/spikes
