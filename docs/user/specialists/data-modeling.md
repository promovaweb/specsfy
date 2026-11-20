# Modelagem de Dados

O especialista Modelagem de Dados orienta o agente a entender e evoluir as
informações que o produto guarda. A leitura começa pela stack e pelas
migrations, segue pelos models e pelos testes e só então chega a uma proposta
de alteração, sem escolher banco ou biblioteca por suposição.

## Quando usar

- A tarefa altera tabelas, schemas, models, migrations ou contratos
  persistentes.
- Você quer descrever relações e ciclos de vida das entidades antes de criar
  uma spec.

A escolha de biblioteca de banco depende do que o projeto já usa, por isso o
especialista não recomenda tecnologia sem ler a stack.

## Como ele trabalha

1. Identifica as entidades, seus papéis e as relações presentes no código.
2. Registra campos, tipos, obrigatoriedade, origem e ciclo de vida, além das
   permissões de consulta e alteração de cada informação.
3. Descreve unicidade, consistência, retenção, exclusão e histórico quando
   forem pertinentes.
4. Compara a proposta com os contratos e as consultas atuais.
5. Atualiza a seção de banco de dados da spec e encaminha as respostas
   confirmadas para `.specsfy/DATABASE.md` pelo modo `database` de
   `$specsfy-setup`.
6. Deriva cenários de criação, leitura, atualização, exclusão, autorização e
   entrada inválida.
7. Exige uma tarefa `[MIGRATION]` com arquivo versionado para toda mudança no
   banco e confere a aplicação em uma base de teste.

O especialista não inventa campos, relações ou tecnologia. Quando o sistema
atual não responde, você confirma o que o produto precisa guardar.

## Padrões aplicados

- Cada campo registra tipo, origem, presença e ciclo de vida.
- Cada relação informa a cardinalidade e a forma de carregamento.
- Cada migration preserva os registros existentes ou descreve a conversão.

## Erros que ele evita

- Criar campos sem uso no produto.
- Alterar uma relação sem conferir queries, factories e testes.
- Escolher tecnologia antes de ler a stack existente.

## Como conferir o resultado

- Os testes e validadores ligados ao modelo persistente passam.
- A migration roda em uma cópia do banco e o schema resultante é comparado.
- A tarefa registra o arquivo, o comando de aplicação e a consulta do estado
  da migration.
- O modelo só é declarado pronto com uma saída verificável do projeto.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-data-modeling --agent universal --copy --full-depth
```

## Especialistas relacionados

- [PostgreSQL](postgres.md) cobre os detalhes próprios do Postgres.
- [Laravel](laravel.md) cobre migrations e models Laravel.
- [Modelagem de Domínio](domain-modeling.md) define a linguagem e as
  invariantes do negócio.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-data-modeling/SKILL.md),
com fontes sobre modelagem, migrations e contratos persistentes no arquivo de
referência da mesma pasta.
