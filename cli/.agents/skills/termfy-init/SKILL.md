---
name: termfy-init
description: Prepara o starter kit do Termfy pelo agente e mantém suas skills instaladas, com conferência da identidade, dos três modos e da compatibilidade.
---

# Preparar o projeto e manter suas skills

Use esta skill para fazer o setup de um projeto derivado do Termfy ou para
instalar, atualizar e reparar suas skills. Conduza o trabalho pelo agente.
Execute os comandos necessários internamente; não transfira ao usuário uma
sequência de comandos para realizar o setup ou a manutenção.

## Escolha o modo

- **Setup:** o repositório foi criado a partir do starter kit e ainda precisa
  receber a identidade do produto. Siga os passos de setup.
- **Manutenção das skills:** o projeto já existe e a solicitação trata de
  instalar, atualizar ou reparar as skills. Siga somente a manutenção.
  Preserve a identidade, o `CLISPEC.md`, as specs, o código e o histórico
  de versões.

Informe o modo escolhido e os arquivos que pretende conferir. Pergunte
somente quando a solicitação não permitir distinguir os dois modos.

## Leia antes

- `AGENTS.md` do repositório.
- `docs/customize-template.md` e `docs/architecture.md`.
- `references/checklist.md` desta skill.

## Entrada do setup

Pergunte, se não vier no pedido: nome do executável (minúsculas, números e
hífen), título legível, descrição em uma frase, autor, URL do repositório e
site. O nome do executável define a pasta `~/.<bin>/`, o prefixo das
variáveis `<BIN>_HOME` e `<BIN>_MASTER_KEY` e o esquema das URIs MCP.

## Passos do setup

1. Rode `git status --short` e preserve mudanças locais.
2. Rode `bun install`.
3. Rode o bootstrap com todos os campos conhecidos:

   ```bash
   bun run init -- --name <bin> --title "<Título>" --description "<frase>" --author "<Autor>" --repository <url> --site <url>
   ```

   O script não mexe em `CLISPEC.md` nem em `specs/`: o starter kit não
   traz nenhum dos dois. O projeto novo começa sem specs, e a primeira
   criada pela `termfy-clispec` recebe o número 0001.

4. Execute a manutenção das skills descrita abaixo e retome o setup depois
   que a instalação e a compatibilidade forem conferidas.

5. O bootstrap não cria `CLISPEC.md` nem regenera `docs/opencli.json`.
   Rode `bun run opencli` e passe para a skill `termfy-clispec`, que
   entrevista a pessoa, escreve o primeiro `CLISPEC.md` com a visão macro
   do produto, alinha `bin` e `description` ao `package.json` e grava os
   arquivos das specs iniciais em `specs/`. A `termfy-spec` detalha depois a primeira
   spec. Sem `CLISPEC.md` e spec, as demais skills não têm o que
   implementar.
6. Confira a identidade nos três modos:

   ```bash
   bun run dev -- --version
   bun run dev -- about --json
   bun run dev -- mcp --list
   ```

   A TUI só abre em terminal interativo. Se o ambiente não tiver TTY, use o
   teste `tests/tui.test.ts`, que monta a interface no renderer de teste.

7. Rode `bun run validate`. O comando encadeia typecheck, testes, conferência
   das skills instaladas, conferência de `docs/opencli.json`, cobertura da
   documentação embutida e build. Ele não lê `CLISPEC.md` nem `specs/`; a
   conferência desses arquivos com o código é manual, feita pela
   `termfy-spec` e pela `termfy-review`.
8. Reescreva a seção inicial de `README.md` com o propósito do produto e
   apague o trecho sobre o template. Mantenha as seções de instalação, modos,
   configuração e release.
9. Relate o resultado do setup. Encaminhe publicação para `termfy-release`
   somente quando houver solicitação explícita; setup não autoriza commit,
   push, tag ou GitHub Release.

## Manutenção das skills

1. Confira o Git, a versão em `package.json`, `.agents/skills/` e
   `skills-lock.json`. Preserve alterações locais nas skills e informe
   qualquer arquivo que seria sobrescrito antes de prosseguir.
2. Leia os scripts `skills:install`, `skills:update` e `skills:check`
   do projeto. Confirme que a origem do Termfy é
   `https://github.com/promovaweb/termfy` e que há acesso ao repositório.
3. Antes da execução, confira se os scripts alcançam outras bibliotecas.
   Nesse caso, restrinja a operação ao Termfy usando as opções documentadas
   pela ferramenta instalada. Quando a instalação contiver somente Termfy,
   use `bun run skills:update` para atualizar ou `bun run skills:install`
   para instalar e reparar. Preserve as bibliotecas alheias à solicitação.
4. Execute `bun run skills:check` e leia os avisos de compatibilidade.
   Confira os links dos agentes, as origens no lock e o diff resultante.
   Não declare compatibilidade se a faixa do starter kit divergir.
5. Reabra os arquivos atualizados antes de continuar outra tarefa. Ao concluir
   uma manutenção isolada, relate as skills alteradas e encerre. Não execute
   o bootstrap, não renomeie o binário e não recrie o `CLISPEC.md` nem as
   specs.

## Marcos de progresso

Informe ao usuário quando: o bootstrap terminar, as skills estiverem
atualizadas, a `termfy-clispec` gravar o `CLISPEC.md`, `bun run validate`
passar e o README estiver reescrito. Em cada
marco, liste os arquivos alterados.

## Saída

Relate nome do binário, caminhos de dados, origem das skills instaladas
(`skills-lock.json` registra origem e hash, não uma versão SemVer), comandos
conferidos, testes executados e o que ficou pendente. Se apenas a preparação
terminou, informe isso; não declare o produto validado com
`bun run validate` falhando.

## Compatibilidade

Starter kit a partir da v0.9.0: specs em Markdown puro, sem command
`spec`, e o kit não traz `CLISPEC.md` nem `specs/`. Os caminhos citados
(`scripts/init.ts`, `docs/customize-template.md`, `tests/tui.test.ts`)
existem nessa faixa.
