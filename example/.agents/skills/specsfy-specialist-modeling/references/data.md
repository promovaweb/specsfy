# Padrões de modelagem de dados

## Ficha de entidade

Registre, para cada entidade observada no código ou confirmada pela pessoa:

1. nome no vocabulário do domínio e nome físico quando diferirem;
2. papel no produto e quem cria, consulta, altera e exclui;
3. identidade (chave natural ou surrogate) e regra de unicidade;
4. ciclo de vida: estados, transições permitidas e o que dispara cada uma;
5. volume esperado, crescimento e política de retenção;
6. relação com cada outra entidade, com cardinalidade e forma de carga.

## Ficha de campo

- tipo lógico e tipo físico, com unidade e formato;
- obrigatoriedade e valor padrão, incluindo o que significa ausência;
- origem do valor (entrada da pessoa, cálculo, integração, importação);
- quem pode ler e quem pode alterar;
- regra de validação e invariante que o campo sustenta;
- histórico: se guarda versão, auditoria ou apenas o valor atual;
- dado pessoal ou sensível, com base legal e política de retenção quando
  aplicável.

## Ficha de relação

- cardinalidade nos dois sentidos e obrigatoriedade de cada lado;
- ownership: qual lado responde pela consistência e qual apenas referencia;
- forma de carga esperada (eager, lazy, projeção) e o custo em consulta;
- comportamento na exclusão de cada lado (cascade, restrict, soft delete,
  anonimização);
- consultas, factories e testes que dependem da relação.

## Ciclo de vida e histórico

- Exclusão lógica só entra quando o produto precisa recuperar ou auditar o
  registro. Caso contrário, ela apenas esconde dado e complica toda consulta.
- Histórico de alteração tem dono, granularidade e prazo. "Guardar tudo para
  sempre" não é política de retenção.
- Estado derivado não é gravado sem necessidade comprovada. Quando for, precisa
  de regra de recálculo e de reconciliação.
- Retenção e anonimização são requisitos do produto, não parâmetro de
  infraestrutura decidido depois.

## Migrations e contratos persistentes

- Toda mudança ligada ao banco exige tarefa `[MIGRATION]` com arquivo
  versionado, aplicação em base de teste e consulta de estado registrada.
- Mudança incompatível em tabela grande segue `expand → migrar dado →
  contract`, com período de convivência entre schema antigo e novo.
- Migration preserva os dados existentes ou descreve explicitamente a conversão
  necessária, incluindo registros nulos e valores fora do domínio.
- Seeder e factory reproduzem estado de teste; migration não depende de dado
  específico de um ambiente para rodar.
- Contrato persistente (nome de tabela, coluna e tipo expostos a outro sistema)
  é versionado como contrato público, com depreciação declarada.

## Cenários mínimos

Derive, para cada entidade alterada: criação válida, criação com dado
obrigatório ausente, leitura pelo dono, leitura por outro tenant, atualização
concorrente, exclusão com relação dependente, entrada inválida e restauração
quando houver exclusão lógica.

## Conferência mínima

- Compare o schema atual, migrations, models, factories e testes.
- Registre chaves, relações, índices, nulabilidade, retenção e migração.
- Rode a migration em uma base descartável antes de aplicá-la no projeto.
- Compare o schema resultante com o esperado e confirme a consulta de estado da
  migration.

## Fontes oficiais

- [SQL standard overview](https://www.iso.org/standard/76583.html)
- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)
- [Laravel migrations](https://laravel.com/docs/12.x/migrations)
