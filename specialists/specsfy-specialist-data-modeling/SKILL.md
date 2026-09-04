---
name: specsfy-specialist-data-modeling
description: Modelar dados, entidades, relações, ciclos de vida, qualidade e contratos persistentes antes de implementar mudanças.
---

# Modelar os dados do produto

Use esta skill para entender e evoluir dados persistentes, sem escolher banco ou
biblioteca por suposição. Leia a stack, o sistema atual, migrations, schemas,
models, contratos e testes antes de propor alteração.

## Trabalho

1. Identifique as entidades, seus papéis e as relações observadas no código.
2. Registre campos, tipos, obrigatoriedade, origem, ciclo de vida e quem pode
   consultar ou alterar cada informação.
3. Descreva unicidade, consistência, retenção, exclusão, histórico e migração
   quando forem pertinentes.
4. Atualize a seção de dados da spec e encaminhe respostas confirmadas para
   `$specsfy-aux-database` e `.specsfy/DATABASE.md`.
5. Derive cenários para criação, leitura, atualização, exclusão, autorização e
   dados inválidos. A implementação usa o especialista do banco detectado.

Não invente campos, relações ou tecnologia. A pessoa confirma o que o produto
precisa guardar quando o sistema atual não responder.

## Quando usar

- Use ao alterar tabelas, schemas, models, migrations ou contratos persistentes.
- Use também ao mapear relações e ciclos de vida antes de criar uma spec.
- Não use para escolher uma biblioteca de banco sem dados do projeto.

## Fluxo

1. Ler stack, migrations, schemas, models e testes existentes.
2. Separar entidades, relações, campos e estados observados.
3. Registrar regras de unicidade, retenção, exclusão e histórico.
4. Comparar a proposta com os contratos e consultas atuais.
5. Encaminhar a confirmação para a skill de banco do projeto.
6. Exigir uma tarefa `[MIGRATION]` com arquivo versionado para qualquer mudança
   ligada ao banco e conferir sua aplicação em uma base de teste.

## Padrões

- Cada campo registra tipo, origem, presença e ciclo de vida.
- Cada relação informa cardinalidade e forma de carga.
- Toda migration preserva dados existentes ou descreve a conversão necessária.

## Antipadrões

- Criar campos sem uso observado no produto.
- Alterar uma relação sem conferir queries, factories e testes.
- Escolher tecnologia antes de ler o stack existente.

## Validação

- Rode os testes e validadores ligados ao modelo persistente.
- Confira a migration em uma cópia do banco e compare o schema resultante.
- Confirme o arquivo, o comando de aplicação e a consulta do estado da
  migration antes de encerrar a tarefa.
- Não declare o modelo pronto sem uma saída verificável do projeto.

## Skills relacionadas

- `$specsfy-aux-database` para manter o mapa persistente do projeto.
- `$specsfy-specialist-postgres` para detalhes próprios do Postgres.
- `$specsfy-specialist-laravel` para migrations e models Laravel.

Leia [references/standards.md](references/standards.md) para fontes de
modelagem, migrations e contratos persistentes.
