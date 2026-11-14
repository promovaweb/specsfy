# Casos de uso do Specsfy

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | guia de uso |
| Escopo | situações recorrentes em projetos consumidores |
| Autoridade | metodologia executável de `skills/` e interface pública de `cli/` |

Este capítulo parte de situações reais do dia a dia e mostra qual caminho o
Specsfy segue em cada uma. Você não precisa decorar a ordem das skills: basta
descrever a situação ao agente, e ele anuncia cada transição. Use as receitas
abaixo para saber o que esperar, o que pedir e onde conferir o resultado.

Cada caso traz quatro partes:

- **Situação:** quando o caso se aplica.
- **Caminho:** a sequência de skills e comandos que o agente percorre.
- **Como pedir:** um exemplo de mensagem em linguagem natural.
- **O que fica registrado:** os arquivos que comprovam o trabalho.

## Escolha o caso pela situação

| Você quer... | Caso |
| --- | --- |
| guardar uma ideia sem parar o que está fazendo | [Anotar uma ideia durante uma reunião](#anotar-uma-ideia-durante-uma-reunião) |
| corrigir um defeito com prova de que ele não volta | [Corrigir um bug com teste de regressão](#corrigir-um-bug-com-teste-de-regressão) |
| criar uma funcionalidade com telas e formulários | [Criar um CRUD com interface](#criar-um-crud-com-interface) |
| começar um produto do zero | [Planejar um produto novo pelo MVP](#planejar-um-produto-novo-pelo-mvp) |
| mudar algo que já foi definido | [Incluir um pedido depois da definição](#incluir-um-pedido-depois-da-definição) |
| guardar informações novas no banco | [Mudar o banco de dados com segurança](#mudar-o-banco-de-dados-com-segurança) |
| adotar o método em um sistema que já existe | [Adotar o Specsfy em um projeto existente](#adotar-o-specsfy-em-um-projeto-existente) |
| acompanhar várias entregas ao mesmo tempo | [Acompanhar o andamento do projeto](#acompanhar-o-andamento-do-projeto) |
| retomar um trabalho parado há dias | [Retomar uma entrega interrompida](#retomar-uma-entrega-interrompida) |

## Anotar uma ideia durante uma reunião

**Situação:** surgiu uma ideia, um pedido de cliente ou uma observação, mas
você não quer discutir detalhes agora.

**Caminho:** `specsfy-01-inbox`. A skill não faz perguntas. Ela grava o texto
original com data, hora e hash de integridade, consulta o contexto do projeto
e registra uma análise inicial marcada como inferência.

**Como pedir:**

```text
Guarde na Inbox: o financeiro pediu para exportar o relatório mensal de
vendas em CSV, com filtro por vendedor.
```

**O que fica registrado:** um arquivo
`specs/inbox/AAAA-MM-DD-HHMMSS-exportar-relatorio-vendas.md`. O texto original
fica intacto, mesmo que tenha erros de digitação.

**Quando a ideia avança:** peça para refinar a entrada no backlog. Depois que
uma spec cobrir todo o pedido e passar no Definition Gate, a captura sai da
fila ativa e vai para `specs/inbox/processed/`. Nada é apagado.

## Corrigir um bug com teste de regressão

**Situação:** um comportamento está errado e você quer garantir que a correção
tenha um teste que falharia sem ela.

**Caminho:**

1. `specsfy-02-backlog` compara o relato com itens existentes e pergunta
   somente o que muda o comportamento, como o resultado correto esperado.
2. `specsfy-03-specify` cria a `spec.md` com o problema, o resultado esperado
   e cenários BDD que descrevem o comportamento correto.
3. `specsfy-04-validate` aprova o Definition Gate.
4. `specsfy-05-tasks` planeja a correção e chama `specsfy-06-tdd-bdd`.
5. `specsfy-06-tdd-bdd` cria o teste e observa o **RED**: o teste precisa
   falhar porque o defeito existe, e não por erro de sintaxe ou ambiente.
6. `specsfy-07-implement` corrige, obtém o **GREEN** e roda a regressão.

**Como pedir:**

```text
O desconto de 10% está sendo aplicado duas vezes quando o cupom é usado no
checkout. Quero corrigir com um teste que comprove o problema.
```

**O que fica registrado:** uma spec com Effort baixo, normalmente entre 1 e
3, tarefas marcadas, a falha observada antes da correção e o teste passando
depois dela. A evidência RED mostra a causa da falha, por exemplo: valor total
esperado 90,00, recebido 81,00.

**Cuidado:** um teste que já passa antes da correção não serve como RED. A
skill recusa essa prova e ajusta o caso até ele detectar o defeito.

## Criar um CRUD com interface

**Situação:** a entrega cria telas para listar, ver, criar, editar e apagar
registros, como um cadastro de clientes.

**Caminho:** o mesmo fluxo base, com o contrato de interface ativo. Antes de
aprovar a definição, o agente lê o design system do projeto
(`DESIGNSYSTEM.MD` e `INTERFACE.md`), percorre as telas existentes e pergunta
somente as lacunas: telas, navegação, campos, validações, estados de
carregamento, vazio, erro e permissão.

**Como pedir:**

```text
Quero um cadastro de clientes com listagem, detalhe, criação e edição.
Somente administradores podem apagar.
```

**O que o método exige de um CRUD:**

- um único `PageHeader` reutilizado na lista, no detalhe, na criação e na
  edição;
- a listagem em um `DataGrid` de largura total, com a coluna `ID` sempre
  visível;
- a linha inteira funcionando como link para o detalhe, por mouse e teclado;
- ações independentes de editar e apagar em cada linha, com confirmação antes
  de apagar e respeito à permissão.

**O que fica registrado:** a seção 10 da spec descreve telas, fluxo,
formulários, composição e estados. Cada tarefa com interface traz o item
`VISUAL` preenchido com viewport, estados percorridos e ajustes. Componentes
novos ou reaproveitados entram em `INTERFACE.md`.

Leia [Design system de interface](design-system.md) para entender as regras
macro e as exceções com alcance.

## Planejar um produto novo pelo MVP

**Situação:** você tem a visão de um produto e quer quebrá-la em entregas
demonstráveis antes de escrever código.

**Caminho:**

1. `specsfy-mvp-milestone-interviewer` conduz a conversa sobre o MVP e
   organiza marcos que podem ser demonstrados.
2. `specsfy-data-discovery` entra quando a conversa revela informações que o
   sistema precisa guardar.
3. A importação do `MVP.md` gera e refina um backlog por item e pode criar
   specs em `Draft`, sempre com `Definition Gate: Pending`.
4. `specsfy-milestone-governor` mantém `specs.md` e os arquivos
   `specs/milestones/MNN.md` alinhados com specs e backlog.
5. Depois do aceite do MVP, `specsfy-roadmap-milestone-interviewer` planeja a
   evolução.

**Como pedir:**

```text
Quero criar um sistema de agendamento para clínicas pequenas. Me ajude a
definir o MVP e os primeiros marcos.
```

**O que fica registrado:** o MVP com marcos, itens de backlog numerados,
specs em rascunho e a projeção em `specs.md`. Nenhuma spec gerada nessa etapa
autoriza implementação: cada uma precisa da sua intenção explícita para
avançar.

Leia [Milestones](milestones.md) para ver arquivos e sincronização.

## Incluir um pedido depois da definição

**Situação:** a spec já passou no Definition Gate, ou até já foi implementada,
e alguém pede uma mudança: um campo novo, uma regra diferente, uma remoção.

**Caminho:** `specsfy-update-spec`. A mudança volta para a mesma `spec.md`. A
skill classifica o impacto e reabre somente o que perdeu validade:

| Tipo de mudança | Atos reabertos | Próxima etapa |
| --- | --- | --- |
| muda o comportamento observável | I, II e III | `specsfy-04-validate` |
| muda apenas o plano técnico | II e III | `specsfy-05-tasks` |
| falta uma escolha que só você pode fazer | permanece em definição | `specsfy-02-backlog` |

**Como pedir:**

```text
Na spec 0003, além do e-mail, o usuário também precisa poder entrar com o
número do celular.
```

**O que fica registrado:** a spec atualizada, os gates afetados de volta para
`Pending` e uma nova rodada de testes para o comportamento incluído. Nenhum
`plan.md`, `tasks.md` ou arquivo paralelo é criado.

Leia [Mudanças posteriores](update-spec.md) para os detalhes.

## Mudar o banco de dados com segurança

**Situação:** a entrega cria tabela, campo, relação ou migration.

**Caminho:**

1. `specsfy-data-discovery` pergunta em linguagem simples o que o sistema
   precisa lembrar e registra as respostas confirmadas em
   `.specsfy/DATABASE.md`.
2. `specsfy-05-tasks` inclui uma tarefa `[MIGRATION]` com arquivo versionado.
3. `specsfy-07-implement` aplica a migration no **banco de teste** e registra
   uma consulta de estado.
4. `specsfy-aux-database` atualiza o quadro de persistência.

**Como pedir:**

```text
Os pedidos precisam guardar o código de rastreio e a transportadora.
```

**Proteções que nunca são desligadas:**

- nenhum teste roda no banco de desenvolvimento; em Laravel, o projeto precisa
  de `.env.testing` com `APP_ENV=testing` e um banco diferente do `.env`;
- comandos que apagam ou recriam banco são sempre recusados, como
  `migrate:fresh`, `db:wipe`, `DROP TABLE` e `TRUNCATE`, mesmo com autorização;
- testes Laravel usam `DatabaseTransactions`, nunca `RefreshDatabase`.

**O que fica registrado:** a migration versionada, `DATABASE.md` atualizado e
a evidência da migration aplicada no banco de teste.

## Adotar o Specsfy em um projeto existente

**Situação:** o sistema já existe, tem código e talvez nenhuma documentação, e
você quer começar a trabalhar com specs a partir de agora.

**Caminho:**

1. Instale com `specsfy install --project . --detected`. A opção `--detected`
   sugere especialistas pela stack encontrada.
2. Na primeira skill chamada, `specsfy-setup` reconcilia o contexto: cria ou
   atualiza `PROJECT.md`, `.specsfy/STACK.md`, `.specsfy/RULES.md`,
   `.specsfy/DATABASE.md` e o perfil em `.specsfy/USER-PROFILE.md`.
3. `specsfy-documentator` lê o projeto inteiro e reconstrói `docs/` com
   arquitetura, banco, fluxos, testes e integrações, além de
   `.specsfy/PACKAGES.md`.
4. Daqui em diante, cada mudança nova segue o fluxo base. O código antigo não
   precisa ganhar spec retroativa.

**Como pedir:**

```text
Acabei de instalar o Specsfy neste projeto. Prepare o contexto e gere a
documentação técnica do sistema atual.
```

**Projetos com GitHub Spec Kit:** quando existe
`.specify/memory/constitution.md`, o setup cria `.specsfy/SPECKIT.md` como uma
projeção da constituição e dos arquivos em `specs/`, sem alterar as fontes do
Spec Kit.

Leia [Informações permanentes do projeto](project-context.md) e
[Documentação do sistema](system-documentation.md).

## Acompanhar o andamento do projeto

**Situação:** há várias specs em estados diferentes e você quer saber o que
está pronto, o que está bloqueado e qual é o próximo trabalho.

**Caminho:** `specsfy-progress` na conversa, ou o CLI no terminal. Os dois
somente leem os arquivos; nada é alterado.

**Como pedir:**

```text
Qual é o estado das specs e o que falta para fechar o milestone M01?
```

**No terminal:**

```bash
specsfy status
specsfy progress --spec 0005 --json
specsfy progress --watch
specsfy milestones sync --project .
specsfy verify --boundary ci --json
specsfy
```

O último comando abre a TUI, com as abas Overview, Specs, Backlog, Gates,
Tests, Skills e About. O formato `--json` serve para scripts e dashboards, e
`specsfy verify` roda todos os gates como etapa da integração contínua. Quando houver
skills `clickupfy-*` instaladas, a transição de estado e o Effort também podem
ser sincronizados com uma tarefa do ClickUp; o estado local continua sendo a
referência.

## Retomar uma entrega interrompida

**Situação:** você parou no meio de uma entrega e não lembra em que ponto
estava.

**Caminho:** basta pedir para continuar. O agente relê a spec, os gates, as
tarefas e as evidências e escolhe a skill responsável pelo estado encontrado.
Se uma tarefa está pela metade, ela é retomada no item do checklist que falta
(`PREP`, `EXECUTE`, `VERIFY`, `VISUAL`, `EVIDENCE` ou `IMPROVE`).

**Como pedir:**

```text
Continue a spec 0005 de onde parou.
```

**O que esperar:** um anúncio como
`Transição automática: $specsfy-progress → $specsfy-07-implement` com o motivo
e o resultado esperado, seguido do trabalho na mesma conversa. Se a mesma
pendência se repetir sem mudança observável, o agente para e relata o impasse
em vez de girar em círculo.

## Combine os casos

Os casos acima se encaixam. Um produto novo começa pelo MVP, gera specs em
rascunho, cada spec segue o fluxo base, uma mudança de banco ativa as
proteções de dados, e um pedido tardio volta pela atualização da spec. Para
ver todos os arquivos produzidos por uma entrega completa, siga para os
[Exemplos completos](examples.md).

## Justificativa de tamanho

Os casos ficam em uma única página para que você compare caminhos lado a lado
e encontre a situação pela tabela inicial. Separar cada caso esconderia como
eles se combinam ao longo de um mesmo projeto.
