<p align="center">
  <a href="https://github.com/promovaweb/specsfy">
    <picture>
      <source srcset="../brand/logo/icon.svg" type="image/svg+xml">
      <img src="../brand/logo/icon.png" alt="Logo do Specsfy" width="128">
    </picture>
  </a>
</p>

<h1 align="center">Specsfy</h1>

<p align="center">
  Transforme uma ideia em software testado a partir de uma especificação única, conduzida por agentes de IA.
</p>

<p align="center">Um projeto da <a href="https://promovaweb.com">Promovaweb</a></p>

<p align="center">
  <a href="https://github.com/promovaweb/specsfy/releases/latest"><img alt="GitHub Release" src="https://img.shields.io/github/v/release/promovaweb/specsfy"></a>
  <a href="https://www.npmjs.com/package/@promovaweb/specsfy"><img alt="npm" src="https://img.shields.io/npm/v/@promovaweb/specsfy"></a>
</p>

<p align="center">
  <a href="https://promovaweb.com/discord"><img alt="Discord: obter ajuda e conversar com a Comunidade" src="https://img.shields.io/badge/Discord-Obter%20ajuda%20e%20conversar%20com%20a%20Comunidade-5865F2?style=for-the-badge&logo=discord&logoColor=white"></a>
</p>

<p align="center">
  <a href="https://promovaweb.com/docs/specsfy/">Documentação</a> ·
  <a href="https://promovaweb.com/discord">Discord</a> ·
  <a href="https://promovaweb.com/planos?utm_source=github&utm_medium=readme&utm_campaign=specsfy">Planos da Promovaweb</a> ·
  <a href="../cli/CHANGELOG.md">Changelog</a>
</p>

Esta é a porta de entrada para o usuário final. O texto conduz a instalação e a
primeira entrega completa. O [README do monorepo](../README.md) apresenta o
projeto em uma página. A documentação oficial fica em
[`../docs/`](../docs/README.md).

Specsfy é uma metodologia prática para desenvolver software a partir de uma
especificação única, executável e rastreável. A metodologia vive em
[`../skills/`](../skills/). O CLI e a TUI vivem em [`../cli/`](../cli/). A
identidade visual vive em [`../brand/`](../brand/).

![Dashboard Home do Specsfy](../docs/user/assets/cli/cli-dash.png)

A TUI transforma specs, tarefas, checklists e gates em uma visão operacional.
Veja as demais telas e comandos no [guia do CLI](../docs/user/cli.md).

## O que você precisa

- Node.js 22.20 ou superior, com o npm disponível.
- o comando [`skills`](https://github.com/vercel-labs/skills) ou `npx`.
- um projeto existente ou recém-criado no qual o Specsfy será aplicado.

O monorepo [`promovaweb/specsfy`](https://github.com/promovaweb/specsfy) não é
um projeto consumidor. O CLI recusa o bootstrap nessa raiz.

## Instalação passo a passo

### 1. Instale o CLI

Baixe o executável pela URL oficial `get.specsfy.dev` ou mantenha a instalação
e as atualizações gerenciadas pelo npm:

```bash
npm install --global @promovaweb/specsfy
```

Confirme a instalação:

```bash
specsfy --version
```

Se o comando não for encontrado, confira o diretório global de binários do npm
no `PATH`, abra um novo terminal e repita a verificação.

### 2. Entre no projeto

```bash
cd caminho/do/projeto
```

### 3. Instale o framework

```bash
specsfy install --project .
```

O comando instala as skills base, setup, documentação e contexto auxiliar em
`.agents/skills/`, publica o contrato em `.specsfy/Spec.md` e reconcilia blocos
gerenciados em `AGENTS.md` e `CLAUDE.md`. Os templates ficam juntos em
`.specsfy/templates/`, inclusive `DESIGNSYSTEM.MD` para regras macro de
interface e `UserProfile.md` para o perfil de interação. Personalizações
homônimas ficam em `.specsfy/templates/custom/`, têm precedência e não são
sobrescritas pelo CLI. Ele não cria uma spec de produto.

Ao executar `$specsfy-setup`, o agente consulta o perfil, a conversa e os
arquivos do projeto antes de perguntar. Ele registra o nível de conhecimento e
as respostas confirmadas em `.specsfy/USER-PROFILE.md`, não repete assuntos já
respondidos e adapta a explicação: iniciantes recebem mais contexto, enquanto
pessoas experientes podem responder diretamente com detalhes técnicos.

### 4. Verifique o projeto

```bash
specsfy skills list
specsfy progress --project .
```

Uma instalação nova ainda pode mostrar zero specs. Isso confirma que o CLI
consegue ler o projeto. A primeira spec é criada durante o fluxo de uso.

## Veja o Specsfy trabalhando

Vamos criar uma página de boas-vindas em um projeto Laravel que já usa Pest.
Este exemplo mostra as nove skills que conduzem uma fatia, da captura à
projeção final. As outras quatro skills base atendem conversas sobre uma spec e
o planejamento e acompanhamento de milestones, explicados no
[guia de milestones](../docs/user/milestones.md).

### 1. Capture uma entrada — `$specsfy-01-inbox`

Envie:

```text
Use $specsfy-01-inbox para capturar:
criar uma página /boas-vindas que cumprimente a pessoa pelo nome.
```

Sem fazer perguntas, o agente cria algo como:

```text
Entrada capturada em
specs/inbox/2026-07-28-143205-pagina-boas-vindas.md
```

### 2. Refine no backlog — `$specsfy-02-backlog`

Envie:

```text
Use $specsfy-02-backlog para refinar esta entrada:
criar uma página /boas-vindas que cumprimente a pessoa pelo nome.
```

Você verá algo assim:

```text
Backlog registrado em specs/backlog/0001-pagina-boas-vindas.md
```

#### Refinar a partir de texto livre

```text
Use $specsfy-02-backlog para aprofundar este texto:
quero uma página /boas-vindas que cumprimente a pessoa pelo nome.
```

#### Refinar a partir do backlog

```text
Use $specsfy-02-backlog em specs/backlog/0001-pagina-boas-vindas.md
```

O agente reavalia cada rodada e continua enquanto houver lacunas aplicáveis,
sem um limite máximo. Cada rodada traz pelo menos três perguntas numeradas.
Cada pergunta oferece três ou mais opções numeradas, `Escrever outra resposta`
e `Avançar` desde a primeira rodada. O avanço encerra o refinamento do campo
atual, mas mantém a definição pendente. Neste exemplo:

```text
Agente: O que deve aparecer quando nenhum nome for informado?
Você: Olá, visitante!

Brief pronto para especificar.
```

### 3. Crie a especificação — `$specsfy-03-specify`

#### Especificar a partir de texto livre

```text
Use $specsfy-03-specify para criar uma especificação a partir deste texto:
a página /boas-vindas mostra Olá e o nome informado.
Sem nome, usa visitante.
```

#### Especificar a partir do backlog

```text
Use $specsfy-03-specify para promover specs/backlog/0001-pagina-boas-vindas.md
```

Resultado:

```text
Especificação criada em
specs/<estado>/0001-pagina-boas-vindas/spec.md
```

Ela registra dois resultados esperados: com `?nome=Ana`, mostrar `Olá, Ana!`.
Sem nome, mostrar `Olá, visitante!`.

### 4. Confira a especificação — `$specsfy-04-validate`

Envie:

```text
Use $specsfy-04-validate em specs/<estado>/0001-pagina-boas-vindas/spec.md
```

Resultado:

```text
READY
Definition Gate: Passed
```

`READY` significa que a ideia está clara o bastante para virar trabalho.

### 5. Divida o trabalho — `$specsfy-05-tasks`

Envie:

```text
Use $specsfy-05-tasks em specs/<estado>/0001-pagina-boas-vindas/spec.md
```

Resultado:

```text
2 tarefas preparadas.
```

### 6. Prepare a verificação — `$specsfy-06-tdd-bdd`

Envie:

```text
Use $specsfy-06-tdd-bdd em specs/<estado>/0001-pagina-boas-vindas/spec.md
para preparar a verificação.
```

Resultado:

```text
Verificação preparada.
```

### 7. Implemente — `$specsfy-07-implement`

Envie:

```text
Use $specsfy-07-implement em specs/<estado>/0001-pagina-boas-vindas/spec.md
```

Resultado:

```text
Implementação concluída.
Página /boas-vindas criada.
Verificação aprovada.
```

### 8. Altere a especificação — `$specsfy-update-spec`

Depois de implementar, imagine que você lembrou de uma regra:

```text
Use $specsfy-update-spec em
specs/<estado>/0001-pagina-boas-vindas/spec.md:
o nome deve ter no máximo 80 caracteres.
```

Resultado:

```text
Pedido incorporado na especificação 0001-pagina-boas-vindas.
Etapas afetadas retomadas automaticamente.
Implementação atualizada.
```

A mudança continua na mesma spec e volta apenas às etapas necessárias.

### 9. Veja o progresso — `$specsfy-progress`

Envie:

```text
Use $specsfy-progress para mostrar o resultado final.
```

Resultado:

```text
Reviewing · 3/3 etapas · nenhuma pendência
```

Você também pode abrir a mesma visão pelo CLI:

```bash
specsfy progress --project .
specsfy progress --project . --json
specsfy tui --project .
```

### 10. Converse antes da próxima etapa — `$specsfy-interviewer`

Quando uma lacuna puder alterar o plano, a execução ou o aceite, o
entrevistador lê a mesma spec e apresenta pelo menos três perguntas numeradas
por rodada, com opções numeradas, escrita livre e avanço. Ele registra as
respostas confirmadas e também recalibra `Effort` de 1 a 10 com uma
justificativa. Não aprova gates nem move a spec sem a skill responsável.

Pronto: uma ideia pequena atravessou `Ato I — Definir`,
`Ato II — Projetar e provar` e `Ato III — Entregar`. Depois que você autoriza a
jornada completa, o agente também pode passar de um comando ao próximo
automaticamente.

## Atualização

Atualize o pacote global do CLI:

```bash
npm update --global @promovaweb/specsfy
```

Depois, atualize as skills Specsfy instaladas no projeto:

```bash
specsfy skills update --project .
```

Alterações locais em conteúdo gerenciado são preservadas e impedem a
substituição. Revise o conflito antes de usar `--force`, porque essa opção
descarta a customização protegida.

## Dicas para usar o CLI

- Descubra comandos e opções sem sair do terminal:

  ```bash
  specsfy --help
  specsfy skills --help
  ```

- `--project .` usa o diretório atual. Troque `.` por outro caminho para
  inspecionar ou operar um projeto sem entrar nele:

  ```bash
  specsfy progress --project caminho/do/projeto
  ```

- Para automações, solicite um snapshot em JSON. Durante o desenvolvimento,
  `--watch` emite outro snapshot somente quando as specs mudam:

  ```bash
  specsfy progress --project . --json
  specsfy progress --project . --watch
  ```

- Use `specsfy skills detect --project .` para consultar especialistas
  recomendados sem instalá-los. Na aba **Skills** da TUI, alterações também
  permanecem como um plano. Nada é instalado ou removido antes de **Aplicar**.

- Trate o progresso como leitura: o CLI projeta checkboxes e gates, mas não
  aprova gates nem altera a fonte normativa da spec.

## Uso por stack

O framework base é independente de linguagem. Especialistas acrescentam
orientação técnica sem alterar os três atos:

- [Laravel](../docs/user/laravel.md).
- [Astro](../docs/user/astro.md).
- [Next.js](../docs/user/nextjs.md).

Você pode instalar recomendações detectadas:

```bash
specsfy install --project . --detected
```

Ou escolher uma explicitamente:

```bash
specsfy skills install specsfy-specialist-laravel --project .
```

Instalar especialista é uma ação explícita. Uma recomendação do agente não o
instala automaticamente.

## Próximos guias

- [Instalação completa](../docs/user/installation.md)
- [Uso básico](../docs/user/getting-started.md)
- [Atualizar uma especificação](../docs/user/update-spec.md)
- [Uso avançado](../docs/user/advanced-usage.md)
- [CLI, TUI e atualização](../docs/user/cli.md)
- [Design system de interface](../docs/user/design-system.md)
- [Módulos do monorepo](../docs/develop/modules.md)
- [Documentação completa](../docs/README.md)

## O que o Specsfy garante

Cada fatia atravessa:

```text
Draft → Defined → Planned → Implementing → Reviewing → Complete
```

Os mesmos IDs conectam histórias, requisitos, condições de aceite, testes,
tarefas e resultados:

```text
US → FR/NFR → AC → teste BDD/TDD → tarefa → resultado
```

O Specsfy não substitui julgamento de produto, pesquisa, segurança ou
engenharia. Ele também não impõe arquitetura nem gerenciador de projetos. Seu
contrato é tornar o plano e a conclusão rastreáveis.

## Comunidade e suporte

- **Discord:** [obter ajuda e conversar com a Comunidade](https://promovaweb.com/discord).
- **Bugs e pedidos:** abra uma
  [issue](https://github.com/promovaweb/specsfy/issues) com a versão, o sistema
  operacional e o passo a passo para reproduzir.
- **Novidades:** acompanhe o [CHANGELOG](../cli/CHANGELOG.md) e as
  [releases](https://github.com/promovaweb/specsfy/releases).

## Promovaweb

O Specsfy é mantido pela [Promovaweb](https://promovaweb.com), comunidade de
co-working digital onde profissionais aprendem a construir, automatizar e gerir
negócios de tecnologia e IA com aulas ao vivo, Co-works e revisão de projetos
reais.

Quer usar o Specsfy em projetos de verdade, com acompanhamento? Conheça os
[planos da Promovaweb](https://promovaweb.com/planos?utm_source=github&utm_medium=readme&utm_campaign=specsfy).

A autoria e os créditos completos ficam em
[`../docs/user/credits.md`](../docs/user/credits.md). O projeto reconhece o
[GitHub Spec Kit](https://github.github.com/spec-kit/), o
[OpenSpec](https://openspec.dev/) e o livro
[*Categorias*, de Aristóteles](https://classics.mit.edu/Aristotle/categories.html)
como inspirações. Essas referências não são dependências nem indicam
equivalência entre os métodos.

Contato: [contato@promovaweb.com](mailto:contato@promovaweb.com).
