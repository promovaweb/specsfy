# Instruções para agentes

Este repositório é o binário `specsfy`, criado com o starter kit do
Termfy: um binário em Bun com três modos
no mesmo executável. Sem argumentos abre a TUI; com argumentos roda como CLI
com saída em texto ou `--json`; `<bin> mcp` vira servidor Model Context
Protocol via stdio. Ele é um template do GitHub; projetos derivados herdam
esta estrutura.

As skills que ensinam a evoluir este projeto vêm do framework
[`promovaweb/termfy`](https://github.com/promovaweb/termfy) e estão
instaladas em `.agents/skills/termfy-*` (com links em `.claude/skills/`),
registradas em `skills-lock.json`. Para setup ou manutenção das skills, use
`termfy-init` no modo correspondente. Execute os comandos internos pelo
agente; não transfira esse trabalho ao usuário.

## Idioma

- Todo o código é em inglês: nomes de arquivos, identificadores, comentários,
  mensagens do binário, commands, options, arguments, keys de configuração e
  campos do `--json`.
- Documentação para pessoas (`README.md`, `docs/`, `CHANGELOG.md`, este
  arquivo) é em português do Brasil, com os termos técnicos em inglês
  preservados (`build`, `stdin`, `flag`, `tool`, `resource`, `command`).
- Respostas ao usuário em português do Brasil.

## Especificação

O binário não lê nem edita specs: elas são Markdown puro, mantidas pelo
agente com as skills do framework. Projetos derivados criam dois tipos de
documento, que o esqueleto não traz prontos:

- `CLISPEC.md`, único, na raiz: a visão macro do binário (identidade,
  propósito, públicos, fora de escopo, superfície entregue e índice das
  specs). A skill `termfy-clispec` o escreve em entrevista com a pessoa.
- `specs/NNNN-slug.md`, um por evolução: status, mudanças de superfície,
  como o binário vai funcionar (`Behavior`), como o código deve ser feito
  (`Design`), tarefas e testes em checklist. A skill `termfy-spec` escreve
  cada spec em entrevista com a pessoa.

Antes de implementar qualquer command, screen ou tool, leia a spec aberta
que cobre o pedido; se nenhuma cobrir, rode a skill `termfy-spec` primeiro.
Siga o `Behavior` e o `Design` da spec, marque os itens da checklist ao
concluir cada entrega e, com tudo marcado, atualize a superfície e o índice
do `CLISPEC.md` e mude o status da spec para `done`.

## Ordem de leitura

1. Este arquivo.
2. `CLISPEC.md` e a spec aberta em `specs/`, quando existirem.
3. `docs/architecture.md` para entender as camadas.
4. A skill compatível com a tarefa em `.agents/skills/`. Quando a pessoa
   descrever a ferramenta em linguagem natural sem nomear uma skill, use
   `termfy`, a porta de entrada, que orquestra as demais na ordem do guia:
   - `termfy`: porta de entrada; conduz o ciclo inteiro;
   - `termfy-init`: personalizar este starter kit para um binário novo;
   - `termfy-brand`: nome, título, descrição, autor, links, créditos e paleta;
   - `termfy-clispec`: descrever o binário e manter o `CLISPEC.md`;
   - `termfy-spec`: escrever cada spec de evolução em `specs/`;
   - `termfy-database`: banco SQLite, só quando a pessoa pede armazenamento;
   - `termfy-api-import`: converter a documentação de uma API em spec;
   - `termfy-config`: settings, credenciais e variáveis;
   - `termfy-api`: client HTTP de serviço externo;
   - `termfy-cli`: commands, options, saída e exit codes;
   - `termfy-command-set`: família `recurso verbo` com tools e screen;
   - `termfy-mcp`: tools, resources e prompts;
   - `termfy-tui`: screens, tema e interação por teclado;
   - `termfy-test`: testes nos três modos;
   - `termfy-review`: auditoria da entrega, sem editar;
   - `termfy-docs`: melhorar a documentação embutida em `docs/`;
   - `termfy-release`: versão, changelog, tag e release;
   - `termfy-mcp-client`: configuração nos clientes de agente.
5. As `references/` indicadas pela skill. Citar uma referência não substitui
   abri-la.

## Regras que valem para toda mudança

- Toda option, argument, subcommand, tool e key de configuração nasce
  documentada: `description` no registry, linha na tabela de `docs/` e, quando
  for conceito novo, parágrafo em prosa. O `--skill` imprime `docs/` inteiro
  mais a referência gerada do registry, então `docs/` precisa continuar
  correto para quem lê o binário sem o repositório.
- Exit codes vêm de `src/app/exit-codes.ts`. Zero é sucesso. Não invente
  números em commands; acrescente a família na tabela.
- Segredos nunca passam por argument, log, erro, `--json` sem `--reveal`,
  tool MCP ou frame da TUI. Leia com `getCredential()`.
- Stdout recebe dados; stderr recebe progresso e avisos. Em `mcp`, stdout é
  do JSON-RPC.
- Um arquivo por command, por screen e por grupo de tools. Registro central
  em `src/cli/commands.ts`, `src/tui/screens/index.ts` e `src/mcp/server.ts`.
- Cores da TUI só em `src/tui/theme.ts`.
- Node e npm não entram no binário: o projeto usa Bun para rodar, testar e
  compilar. O `npx skills` é a única exceção, por ser a ferramenta oficial de
  distribuição de skills.
- Documente código novo ou alterado com cabeçalho explicando o propósito do
  arquivo e JSDoc em funções exportadas, em inglês.
- Não edite `.agents/skills/termfy-*`. Mudança de skill acontece no
  framework; aqui ela chega pela manutenção conduzida por `termfy-init`.

## Validação antes de concluir

```bash
bun run validate
```

Encadeia `typecheck`, `bun test`, `skills:check`, `opencli:check`,
`docs:check` e `build`. `docs:check` exige que todo command,
screen, tool, resource, prompt, key e exit code do código apareça em `docs/`.
Quando o registry de commands mudar, rode `bun run opencli` antes e revise o
diff de `docs/opencli.json`. Confira `git status --short` ao final e preserve mudanças que já
existiam.

## Publicação

Toda alteração publicada sai com versão em `package.json`, entrada em
`CHANGELOG.md`, tag `vX.Y.Z` e GitHub Release com binários. O fluxo está em
`docs/release.md`. Tags não são movidas.
