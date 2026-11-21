# Padrões e referências de modelagem

Revisado em 2026-11-20 contra: Domain-Driven Design Reference (Eric Evans), DDD Crew (context mapping e bounded context canvas), EventStorming, ADR, ISO/IEC 9075-1:2023 e a documentação atual do Laravel (migrations).

## Índice das referências

| Modo | Arquivo | Conteúdo |
| --- | --- | --- |
| domain | [domain.md](domain.md) | blocos táticos de DDD, bounded context, context map, artefatos, perguntas-guia e fontes primárias |
| data | [data.md](data.md) | ficha de entidade, campo e relação, ciclos de vida, migrations e conferência em base de teste |

## O que vale para os dois modos

- Modelo vive na fonte autorizada: seção de domínio e de dados da spec,
  `.specsfy/DATABASE.md`, glossário e ADR existentes. Um arquivo novo de modelo
  paralelo à spec é proibido.
- Vocabulário único por conceito dentro de um contexto. O mesmo termo em dois
  contextos pode ter modelo distinto, e isso precisa estar registrado.
- Toda afirmação sobre o modelo sai de fonte observada: código, migrations,
  schema, contrato, teste ou resposta confirmada pela pessoa. Nunca de
  suposição sobre o que o produto "deveria" guardar.
- Tecnologia é descoberta na stack e no lockfile do consumidor. A modelagem não
  escolhe banco nem biblioteca.
- Toda mudança persistente gera tarefa `[MIGRATION]` com arquivo versionado,
  aplicação em base de teste e consulta de estado registrada.
- Unicidade, consistência, retenção, exclusão e histórico são regra do produto,
  não detalhe decidido na implementação.
- Nenhum dado tem dois owners capazes de escrever concorrentemente sem
  coordenação explícita.
- Cada invariante tem cenário de exemplo e contraexemplo verificável.

## Ordem de leitura do projeto

1. Instruções locais e spec do projeto consumidor.
2. Stack e versões em manifests e lockfiles.
3. Migrations e schema aplicado.
4. Models, relações e casts.
5. Contratos, consultas e testes que dependem do modelo.
6. `docs/packages/` e `.specsfy/PACKAGES.md` quando a persistência envolver
   pacote de terceiro.

## Fontes primárias

- Domain-Driven Design Reference (Eric Evans): https://www.domainlanguage.com/ddd/reference/
- DDD Crew, context mapping: https://github.com/ddd-crew/context-mapping
- EventStorming (Alberto Brandolini): https://www.eventstorming.com/
- Architecture Decision Records: https://adr.github.io/
- SQL standard (ISO/IEC 9075-1:2023, SQL/Framework): https://www.iso.org/standard/76583.html
- PostgreSQL documentation: https://www.postgresql.org/docs/current/
- Laravel migrations: https://laravel.com/docs/migrations
