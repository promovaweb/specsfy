<p align="center">
  <a href="https://github.com/promovaweb/specsfy">
    <picture>
      <source srcset="brand/logo/icon.svg" type="image/svg+xml">
      <img src="brand/logo/icon.png" alt="Logo do Specsfy" width="128">
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
  <a href="https://github.com/promovaweb/specsfy/actions/workflows/specsfy.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/promovaweb/specsfy/specsfy.yml"></a>
  <a href="LICENSE"><img alt="Licença" src="https://img.shields.io/github/license/promovaweb/specsfy"></a>
</p>

<p align="center">
  <a href="https://promovaweb.com/discord"><img alt="Discord: obter ajuda e conversar com a Comunidade" src="https://img.shields.io/badge/Discord-Obter%20ajuda%20e%20conversar%20com%20a%20Comunidade-5865F2?style=for-the-badge&logo=discord&logoColor=white"></a>
</p>

<p align="center">
  <a href="https://promovaweb.com/docs/specsfy/">Documentação</a> ·
  <a href="https://promovaweb.com/discord">Discord</a> ·
  <a href="https://promovaweb.com/planos?utm_source=github&utm_medium=readme&utm_campaign=specsfy">Planos da Promovaweb</a> ·
  <a href="cli/CHANGELOG.md">Changelog</a>
</p>

## O que é

Specsfy é uma metodologia executável para levar uma ideia até software testado.
A pessoa conversa com o agente. As skills organizam requisitos, testes e tarefas
em uma especificação única. Cada etapa entrega um resultado conferível antes da
próxima. O mesmo identificador acompanha a história do pedido até a
verificação.

Esta apresentação mostra como instalar e usar o produto. O monorepo
[`promovaweb/specsfy`](https://github.com/promovaweb/specsfy) reúne a
metodologia, o CLI, os especialistas e a documentação em módulos com
responsabilidades próprias.

| Modo | Como se usa | Para quem |
| --- | --- | --- |
| Skills | `$specsfy-*` dentro do agente | conduzir a especificação e a entrega |
| CLI | `specsfy <comando>` | terminal, scripts e CI |
| TUI | `specsfy` | acompanhar specs, gates e tarefas |
| MCP | `specsfy mcp` | agentes que acessam o projeto por ferramentas |

## Instalação

Requisitos: Node.js 22.20 ou superior e npm.

```bash
npm install --global @promovaweb/specsfy
specsfy --version
```

O pacote npm baixa e confere o executável da plataforma na primeira execução.
Para instalar sem npm, baixe de `get.specsfy.dev` o lançador em Node.js, que
faz o mesmo download na primeira execução:

```bash
mkdir -p "$HOME/.local/bin"
curl -fL get.specsfy.dev -o "$HOME/.local/bin/specsfy"
chmod +x "$HOME/.local/bin/specsfy"
```

Cada [GitHub Release](https://github.com/promovaweb/specsfy/releases) publica os
cinco executáveis e o `SHA256SUMS`. O executável compilado não depende de
Node.js nem de Bun. Baixe o da sua plataforma, confira o hash e coloque-o em um
diretório do `PATH`.

Para atualizar o CLI e as skills do projeto:

```bash
specsfy upgrade
specsfy update --project .
```

`upgrade` troca o próprio binário. `update` atualiza skills, templates e blocos
gerenciados no projeto consumidor.

## Primeiros passos

```bash
cd caminho/do/projeto
specsfy doctor --project .
specsfy install --project .
specsfy skills list
specsfy progress --project .
```

`doctor` confere o runtime, o terminal e as configurações. Com `--project`,
ele também confere Git, o CLI de skills e o token do GitHub do projeto. `install` publica as skills base em `.agents/skills/`, grava
`.specsfy/Spec.md` e reconcilia os blocos gerenciados de `AGENTS.md` e
`CLAUDE.md`. Uma instalação nova pode mostrar zero specs. Isso confirma que o
CLI lê o projeto.

A primeira spec nasce na conversa com o agente:

```text
Use $specsfy-setup para preparar este projeto.
Use $specsfy-01-inbox para capturar: criar uma página /boas-vindas que cumprimente a pessoa pelo nome.
```

O agente grava a captura em `specs/inbox/`. A skill `$specsfy-setup` lê o
projeto antes de perguntar e registra o perfil de interação em
`.specsfy/USER-PROFILE.md`.

Em um projeto iniciado com o [GitHub Spec Kit](https://github.com/github/spec-kit),
`$specsfy-setup` lê `.specify/memory/constitution.md` e os arquivos de
`specs/`. A skill publica uma ponte de leitura em `.specsfy/SPECKIT.md` e
preserva os artefatos originais nos mesmos caminhos.

## Uso

Abra a TUI no projeto:

```bash
specsfy
specsfy tui --project .
```

Consulte o estado e o progresso:

```bash
specsfy status
specsfy progress --project .
specsfy progress --project . --json
specsfy progress --project . --watch
```

Trabalhe com specs, tarefas e gates:

```bash
specsfy specs list
specsfy specs show 0001 --content
specsfy tasks next 0001
specsfy gate spec 0001
specsfy gate tasks 0001
specsfy verify --boundary local
```

`gate` aprova com código `0` e reprova com `10`. `verify` executa a política
inteira, inclusive a verificação usada no CI. O progresso apenas lê: ele projeta
checkboxes e gates sem alterar a fonte normativa da spec.

Instale especialistas por stack quando precisar:

```bash
specsfy install --project . --detected
specsfy skills install specsfy-specialist-laravel --project .
```

Uma recomendação do agente não instala o especialista. A pessoa confirma a
instalação.

## Uso com agentes

O `install` publica as skills em `.agents/skills/`, no formato universal.
[Claude Code](https://github.com/anthropics/claude-code),
[Codex](https://github.com/openai/codex) e
[OpenCode](https://github.com/anomalyco/opencode) leem a mesma metodologia a
partir do projeto. A key `skills.agents` aceita outros alvos separados por
vírgula:

```bash
specsfy config set skills.agents universal,claude-code,codex,opencode
```

O contrato fica em `.specsfy/Spec.md`. As skills ficam em `.agents/skills/`.

Para expor o projeto por MCP, adicione o servidor ao cliente:

```json
{
  "mcpServers": {
    "specsfy": { "command": "specsfy", "args": ["mcp"] }
  }
}
```

No Claude Code, o caminho curto é `claude mcp add specsfy -- specsfy mcp`. As
ferramentas de leitura consultam specs, gates e progresso. As ferramentas de
escrita alteram arquivos do projeto e não pedem confirmação. Comece por
`project_status` e confirme o efeito antes de alterar. `specsfy mcp --list`
mostra todas as ferramentas, resources e prompts.

## Saída para scripts

Comandos de leitura aceitam `--json`:

```bash
specsfy progress --project . --json
specsfy gate spec 0001 --json
```

| Código | Significado |
| --- | --- |
| `0` | sucesso |
| `1` | falha geral, sem classificação específica |
| `3` | configuração inválida ou diagnóstico com requisito reprovado |
| `2` | uso inválido de argumentos, opções ou subcomando |
| `6` | recurso não encontrado, como o projeto ou a spec |
| `10` | gate ou validação reprovada |

`specsfy --help` lista todos os códigos. A
[referência dos comandos](docs/user/cli-reference.md) detalha as opções.

## Documentação

A documentação publicada fica em
[promovaweb.com/docs/specsfy](https://promovaweb.com/docs/specsfy/). No
repositório, [`docs/README.md`](docs/README.md) separa o percurso de uso do
percurso de desenvolvimento.

- [Guia do usuário](docs/user/README.md): instalação, primeira entrega e rotina
  com o CLI.
- [Referência dos comandos](docs/user/cli-reference.md): argumentos, opções e
  códigos de saída.
- [Casos de uso](docs/user/use-cases.md): receitas por situação, do bug ao MVP.
- [Exemplos completos](docs/user/examples.md): os arquivos de uma entrega real e
  mensagens prontas para cada etapa.
- [Referência rápida](docs/user/reference.md): arquivos, estados, gates, IDs,
  skills, comandos e glossário em uma página.
- [Deploy](docs/user/deploy.md): release, servidores e produção em Docker Swarm
  com o especialista `specsfy-specialist-deploy`.
- [Edição em PDF e EPUB](ebook/): o mesmo guia do usuário em formato portátil.
- [Tutorial completo](specsfy/README.md): uma primeira entrega passo a passo, da
  captura à verificação.

A aplicação interna em [`example/`](example/) valida o framework em um projeto
real. O manual de marca em `brand/Specsfy-Manual-de-Marca.pdf` é gerado a partir
de `brand/` com `make brand-guide`.

## Feito com

| Projeto | Para quê |
| --- | --- |
| [Bun](https://github.com/oven-sh/bun) | compilação do binário |
| [Node.js](https://github.com/nodejs/node) | lançador do pacote npm e instalação |
| [Termfy](https://github.com/promovaweb/termfy) | framework de CLI, TUI e MCP da Promovaweb |
| [OpenTUI](https://github.com/anomalyco/opentui) | componentes da TUI |
| [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk) | servidor MCP |
| [skills](https://github.com/vercel-labs/skills) | instalação de skills no projeto |

## Comunidade e suporte

- **Discord:** [obter ajuda e conversar com a Comunidade](https://promovaweb.com/discord).
- **Bugs e pedidos:** abra uma [issue](https://github.com/promovaweb/specsfy/issues)
  com a versão, o sistema operacional e o passo a passo para reproduzir.
- **Novidades:** acompanhe o [CHANGELOG](cli/CHANGELOG.md) e as
  [releases](https://github.com/promovaweb/specsfy/releases).

## Contribuir

Leia o [CONTRIBUTING.md](CONTRIBUTING.md) antes de alterar o código. Ele
descreve o ambiente, os comandos de validação e o fluxo de release. A release
do CLI segue a skill `specsfy-release-cli`, em
`cli/.agents/skills/specsfy-release-cli/`.

## Promovaweb

O Specsfy é mantido pela [Promovaweb](https://promovaweb.com), comunidade de
co-working digital onde profissionais aprendem a construir, automatizar e gerir
negócios de tecnologia e IA com aulas ao vivo, Co-works e revisão de projetos
reais.

Quer usar o Specsfy em projetos de verdade, com acompanhamento? Conheça os
[planos da Promovaweb](https://promovaweb.com/planos?utm_source=github&utm_medium=readme&utm_campaign=specsfy).

## Licença

Distribuído sob a [GNU AGPL 3.0](LICENSE). A licença não concede o uso do
nome e do logo do Specsfy nem da marca Promovaweb (AGPL 3.0, seção 7, item e).
