# Padrões e referências de arquitetura

## Índice das referências

| Modo | Arquivo | Conteúdo |
| --- | --- | --- |
| system | [system.md](system.md) | C4, cenários de atributo de qualidade, regra de dependência, monólito modular versus serviços distribuídos e formato de ADR |
| web-api | [web-api.md](web-api.md) | métodos, precondições, status, Problem Details, idempotência, paginação, autorização, webhooks, evolução e comprovação mínima |

## O que vale para os dois modos

- Toda escolha estrutural compara as mesmas opções pelos mesmos cenários. Sem
  cenário declarado, a comparação vira preferência pessoal.
- A opção mais simples que atende ao cenário vence por padrão. Complexidade
  distribuída, indireção e abstração pagam custo imediato.
- Estrutura implementada e estrutura desejada são registradas separadamente.
- Cada escolha tem dono, consequência (inclusive negativa) e condição de
  revisão.
- Contrato público é declarado em fonte versionada (ADR, OpenAPI, JSON Schema) e
  protegido por teste automatizado.
- Compatibilidade é provada contra a última versão publicada, não afirmada.
- Nenhum campo interno de persistência vira contrato por conveniência.
- Toda afirmação de escala, resiliência ou compatibilidade exige medição ou
  teste correspondente.

## Ordem de leitura do projeto

1. Instruções locais, spec e ADRs existentes.
2. Manifests, lockfiles e versões em uso.
3. Mapa real de módulos, serviços, filas, bancos e dependências externas.
4. Contratos publicados, consumidores conhecidos e política de compatibilidade.
5. Sinais de operação disponíveis e incidentes recentes.
6. Testes de arquitetura, contract tests e diff de contrato.

## Fontes primárias

- C4 Model: https://c4model.com/
- arc42, template de documentação de arquitetura: https://docs.arc42.org/
- Architecture Decision Records: https://adr.github.io/
- SEI Quality Attribute Scenarios: https://www.sei.cmu.edu/library/applicability-of-general-scenarios-to-the-architecture-tradeoff-analysis-method/
- Team Topologies: https://teamtopologies.com/key-concepts
- The Clean Architecture, regra de dependência: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- RFC 2119, linguagem normativa: https://www.rfc-editor.org/rfc/rfc2119
- HTTP Semantics, RFC 9110: https://www.rfc-editor.org/rfc/rfc9110
- Problem Details, RFC 9457: https://www.rfc-editor.org/rfc/rfc9457
- OpenAPI 3.1: https://spec.openapis.org/oas/v3.1.0
- JSON Schema: https://json-schema.org/specification
