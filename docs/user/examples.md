# Exemplos completos

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | guia de uso |
| Escopo | artefatos produzidos por uma entrega e mensagens prontas para cada etapa |
| Autoridade | templates de `skills/templates/` e aplicação interna de validação |

Este capítulo mostra, arquivo por arquivo, o que uma entrega produz. Os
trechos vêm da aplicação interna de validação do Specsfy, um sistema Laravel
com React usado para testar o método. A funcionalidade escolhida é um
diretório de usuários: uma pessoa autenticada consulta as contas do sistema
sem ver o e-mail de terceiros.

Os trechos foram encurtados para caber na página. Os nomes de seção, os
campos e o formato são os mesmos que você encontra no seu projeto.

## 1. A ideia original

Tudo começou com uma frase digitada sem revisão:

```text
quro desenvolver uma listagem de usuarios para gerenciar os usuarios do sistema
```

O Specsfy preserva o texto exatamente como foi escrito. O erro de digitação
fica no registro porque ele é a prova do pedido original. A interpretação
aparece em seções separadas, marcadas como inferência.

## 2. A captura na Inbox

Quando você pede para guardar a ideia, `specsfy-01-inbox` cria um arquivo em
`specs/inbox/` com este cabeçalho:

```text
# Inbox: Listagem de usuários

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-07-25 14:32:10 |
| Slug | listagem-usuarios |
| Origem | Input do usuário |
| Processamento | Análise inicial sem perguntas |
| Integridade do original | SHA-256 `9f2c…` |
| Backlog derivado | Nenhum |
| Spec derivada | Nenhuma |
```

Logo abaixo ficam o texto original, as fontes consultadas e a análise inicial:
problema, pessoas afetadas e valor esperado. Nenhuma pergunta é feita nessa
etapa.

## 3. O item de backlog

`specsfy-02-backlog` compara a captura com o que já existe, pergunta o
necessário e registra o item numerado
`specs/backlog/0001-listagem-gestao-usuarios.md`:

```text
# Backlog: Listagem para gestão de usuários

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0001 |
| Status | Promoted |
| Funcionalidade | Gestão de usuários |
| Tipo | Funcionalidade |
| Spec promovida | `specs/<estado>/0001-diretorio-global-usuarios/spec.md` |

## Problema percebido

Hoje não foi informada uma forma de visualizar os usuários do sistema para
apoiar sua gestão.

## Comportamento esperado

- Qualquer usuário autenticado acessa uma listagem de todos os usuários do
  sistema.
- As informações exibidas e as ações de gestão disponíveis ainda precisam ser
  definidas.
```

Repare que o backlog registra o que ainda não está claro, como as ações de
gestão. Ele não inventa a resposta.

## 4. Uma rodada de perguntas

Quando falta uma escolha que muda o comportamento, a skill faz uma pergunta
por vez, com opções numeradas:

```text
Pergunta 1. Quais informações de cada usuário a listagem deve mostrar?
1. Nome, estado de verificação, data de entrada e quantidade de equipes.
2. Nome e e-mail, para facilitar o contato.
3. Somente o nome, com link para um perfil público.
4. Escrever outra resposta
5. Gere outras opções
6. Avançar
```

Você pode responder `1`, combinar com texto, como `4: nome e cargo`, ou
escolher `Avançar` para encerrar, adiar ou retomar a área. A resposta é
registrada pelo texto completo da opção, nunca só pelo número.

## 5. O cabeçalho da spec

`specsfy-03-specify` cria a fonte única da entrega. O topo da `spec.md` é uma
tabela que os scripts e o CLI leem:

```text
# Especificação integrada: Diretório global de usuários

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0001 |
| Slug | 0001-diretorio-global-usuarios |
| Status | Draft |
| Effort | 3 |
| Effort updated at | 2026-07-25 |
| Effort rationale | Consulta paginada em módulo existente, sem migração. |
| ClickUp Task | |
| Milestones | M01 |
| Definition Gate | Pending |
| Plan Gate | Pending |
| Delivery Gate | Pending |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Atualizada em | 2026-07-25 |
```

Ao final da entrega, o mesmo cabeçalho mostra `Status: Complete` e os três
gates como `Passed`.

## 6. História, cenário e requisitos

O Ato I descreve o que precisa mudar. Cada item recebe um identificador que
liga requisito, cenário, teste e tarefa:

```text
#### US-001 — Consultar usuários (P1)

Como pessoa autenticada, quero ver as contas existentes, para localizar uma
pessoa sem conhecer previamente sua equipe.

**Requisitos**: FR-001, FR-002, FR-003, NFR-001, NFR-002
```

O cenário BDD descreve o comportamento em linguagem que qualquer pessoa da
equipe consegue revisar:

```gherkin
@US-001 @FR-001 @FR-002 @AC-001
Feature: Diretório global de usuários

  Scenario: Pessoa autenticada consulta a primeira página
    Given existem dezesseis usuários com nomes conhecidos
    When uma pessoa autenticada abre o diretório de usuários
    Then recebe quinze usuários ordenados por nome e sem e-mails

  Scenario: Visitante tenta consultar usuários
    Given uma pessoa não autenticada
    When ela abre o diretório de usuários
    Then é redirecionada para o login sem receber dados do diretório
```

Os requisitos dizem o que o sistema deve fazer, inclusive nos casos-limite:

```text
- FR-001: o sistema deve permitir o acesso ao diretório somente a uma pessoa
  autenticada.
- FR-002: o sistema deve fornecer nome, estado de verificação, data de entrada
  e quantidade de equipes de cada usuário, sem fornecer seu e-mail.
- FR-003: o sistema deve ordenar usuários por nome e ID e paginar o resultado
  em 15 itens.

Erros e casos-limite:
- Sem autenticação → redirecionar para a rota de login.
- Sem usuários retornáveis → exibir "Nenhum usuário encontrado".
- Dois nomes iguais → desempatar por ID para manter a paginação estável.
```

O Gherkin fica somente dentro da `spec.md`, como contrato de referência. O
Specsfy não cria arquivos `.feature`: a prova executável é o teste TDD.

## 7. O teste com rastreabilidade

`specsfy-06-tdd-bdd` transforma cada cenário em testes do runner do projeto.
Cada caso recebe um marcador `SPECSFY:` com os IDs que ele comprova. Em um
projeto PHP, com Pest:

```php
// SPECSFY: US-001 FR-001 AC-001
it('redireciona visitante para o login', function () {
    $this->get(route('directory.users.index'))
        ->assertRedirect(route('login'));
});

// SPECSFY: US-001 FR-002 FR-003 AC-001
it('lista quinze usuários por página, sem e-mail', function () {
    User::factory()->count(16)->create();

    $this->actingAs(User::first())
        ->get(route('directory.users.index'))
        ->assertInertia(fn ($page) => $page
            ->has('users.data', 15)
            ->missing('users.data.0.email'));
});
```

Em um projeto Node sem PHP, a skill pergunta qual runner adotar e recomenda
Vitest. O marcador segue o mesmo formato:

```ts
// SPECSFY: US-001 FR-003 AC-001
it("ordena por nome e desempata por ID", () => {
  expect(sortUsers(fixture).map((user) => user.id)).toEqual([3, 1, 2]);
});
```

Antes da implementação, esses testes precisam falhar pelo motivo certo. No
exemplo, o RED registrado foi: rota `directory.users.index` ausente. Um teste
que falha por erro de sintaxe ou banco indisponível não vale como RED.

## 8. Uma tarefa com checklist

O Ato II registra as tarefas dentro da própria spec. Cada tarefa traz os seis
itens obrigatórios, nesta ordem:

```text
- [x] T002 [US-001] Implementar a rota e a página do diretório
      — Refs: US-001, FR-001, FR-002, FR-003, AC-001 — Depends: T001
  - [x] PREP: rota, controller e componentes existentes conferidos.
  - [x] EXECUTE: rota autenticada, query paginada e página criadas.
  - [x] VERIFY: testes focais verdes; regressão completa verde.
  - [x] VISUAL: 1440 px e 390 px; estados com dados, vazio e nome longo;
        espaçamento da tabela ajustado ao DESIGNSYSTEM.MD.
  - [x] EVIDENCE: comandos e saídas registrados na seção 11.
  - [x] IMPROVE: seleção explícita de colunas para não carregar o e-mail.
```

Uma tarefa sem interface marca `VISUAL` como `Não aplicável` e explica o
motivo. O percentual de progresso conta somente as tarefas e esses itens.

## 9. A evidência RED, GREEN e REFACTOR

A seção 11 guarda a prova de cada ciclo:

```text
| IDs | Teste TDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- |
| FR-001, FR-002, FR-003, AC-001 | tests/Feature/Directory/UserDirectoryTest.php | rota directory.users.index ausente | Pest: 2/2 | suíte completa verde; build passou |
```

Essa tabela é o que permite a qualquer pessoa conferir, meses depois, por que
a entrega foi aceita.

## 10. Os gates

Cada ato termina com um gate registrado na seção 13, com o comando executado e
o achado:

```text
#### Gate do Ato I — Definição
- Resultado: Passed
- Comando: specsfy gate spec 0001
- Achados: 1 US, 3 FR, 2 NFR e cenários válidos; nenhuma falha estrutural.
```

Os validadores dos outros atos seguem o mesmo padrão:
`specsfy gate tasks` para o Plan Gate, `specsfy gate trace --full-chain` para
conferir a cadeia entre requisito, cenário e teste e
`specsfy gate evidence --delivery` para o Delivery Gate. Cada gate sai com
código `0` quando aprova e `10` quando reprova.

## 11. O resultado no terminal

Com a entrega concluída, o CLI mostra o estado sem alterar nada:

```bash
specsfy status
```

Para um painel ou uma integração contínua, use o formato JSON, que traz o
progresso da spec, os gates e as tarefas:

```bash
specsfy progress --spec 0001 --json
```

## Mensagens prontas para cada etapa

Copie, troque o conteúdo entre `< >` e cole na conversa com o agente. Você não
precisa usar o nome da skill: descrever o objetivo também funciona.

| Etapa | Mensagem |
| --- | --- |
| capturar | `Guarde na Inbox: <texto da ideia>` |
| refinar | `Refine a captura <arquivo> no backlog` |
| especificar | `Crie a spec a partir do backlog 0004` |
| validar | `Valide a definição da spec 0004` |
| planejar | `Prepare as tarefas e o RED da spec 0004` |
| implementar | `Implemente a spec 0004` |
| mudar depois | `Na spec 0004, <mudança desejada>` |
| conversar | `Quero discutir a spec 0004 antes de seguir` |
| consultar | `Qual é o estado das specs e o próximo trabalho?` |
| MVP | `Quero definir o MVP de <produto>` |
| dados | `O sistema precisa guardar <informação>` |
| documentar | `Reconstrua a documentação técnica do sistema` |
| continuar | `Continue a spec 0004 de onde parou` |

## Exemplos por stack

Os guias de stack mostram como confirmar a detecção, instalar o especialista
e aplicar suas convenções na spec:

- [Laravel](laravel.md), com Pest, `.env.testing` e proteção do banco.
- [Astro](astro.md), com `astro check`, build de produção e preview.
- [Next.js](nextjs.md), com o especialista da stack.

Para consultar rapidamente estados, gates, arquivos e comandos, siga para a
[Referência rápida](reference.md).

## Justificativa de tamanho

O capítulo acompanha uma única entrega, arquivo por arquivo. Manter todos os
trechos na mesma página mostra como cada artefato nasce do anterior e como os
identificadores ligam requisito, teste, tarefa e evidência.
