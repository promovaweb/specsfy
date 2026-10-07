# Persistência e dados

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | armazenamento, ownership e invariantes |
| Autoridade | política transversal de persistência |

## Papel

Explicar armazenamentos, ownership, isolamento e invariantes transversais sem
copiar schemas ou migrations.

## Como usar

Leia antes de introduzir banco, arquivo persistente, cache ou estado durável.
Combine com o [índice de dados](README.md) e [privacidade](privacy.md).

## Atualize quando

- um armazenamento for criado ou removido.
- ownership, isolamento ou fonte de verdade mudar.
- uma nova invariante transversal de dados surgir.

## Não use para

- reproduzir tabelas e campos.
- definir modelo exclusivo de uma feature.
- tratar cache como fonte de verdade sem decisão explícita.

## Fonte da verdade e precedência

Schemas e migrations são fontes executáveis da estrutura persistida. Models e
testes demonstram invariantes. Este documento registra somente decisões
transversais. A spec da fatia governa cada mudança.

## Armazenamentos

O Specsfy não possui banco de dados de runtime. O estado normativo é Markdown
versionado no Git:

- `specs/inbox/` preserva inputs timestampados e sua análise inicial; é a fila
  ativa.
- `specs/inbox/processed/` preserva, sem alteração do texto original, as
  capturas integralmente cobertas por specs com Definition Gate aprovado.
- backlog preserva itens escolhidos para refinamento ainda não promovidos.
- specs mantêm decisões e progresso por fatia.
- research preserva evidência consultada.
- código e testes são artefatos derivados.
- o histórico de alteração pertence ao Git e aos ADRs.

Em projetos consumidores, `.specsfy/DATABASE.md` é um mapa derivado e tabular
da persistência observada. Schemas e migrations continuam sendo a fonte
executável. A skill `specsfy-aux-database` reconcilia o mapa sempre que banco,
tabela, campo, relação ou migration muda e preserva notas humanas.
O monitor de contexto trata essa reconciliação como obrigatória na mesma
entrega e impede o Delivery Gate enquanto `DATABASE.md` estiver pendente.

`example/` é uma aplicação interna de validação e possui persistência própria,
sem alterar essa invariante do método. Seu ambiente padrão usa SQLite para
usuários, sessões, passkeys, equipes, memberships, convites, cache e filas.
Migrations e models em `example/` são as fontes executáveis desse
schema. O arquivo de banco local é ignorado pelo Git e nunca é fonte normativa.

## Propriedade e isolamento

- Cada spec pertence a um único slug.
- Cada captura possui data, hora, slug e hash do input original. Colisões nunca
  sobrescrevem o arquivo anterior.
- Cada backlog possui ID próprio e mantém a formulação original da ideia.
- Capturas usam timestamp. Backlog e spec usam sequências independentes.
- Research pertence à spec do mesmo diretório.
- Uma skill possui seus mecanismos reutilizáveis.
- Evidência de uma fatia não valida automaticamente outra fatia.
- Dados do aplicativo `example/` pertencem ao ambiente local de validação e não
  são incorporados aos repositórios de documentação ou metodologia.

## Invariantes de dados

- O slug declarado corresponde ao diretório da spec.
- Pacotes de spec contêm somente `spec.md` e research opcional.
- IDs não são renumerados nem reutilizados.
- Gates e tarefas permanecem coerentes com o estado canônico.
- Caches Python não são artefatos versionados das skills.
- Fixtures e seeders de `example/` usam dados sintéticos. Credenciais, passkeys
  e dados pessoais reais não são registrados como evidência.
