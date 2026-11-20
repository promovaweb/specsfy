# 0022 Aviso de versão instalada na TUI

Status: done

## Goal

Avisar na TUI, que segue rodando o código que carregou, que uma versão nova do
`specsfy` foi instalada, para a pessoa fechar e reabrir e passar a usar a versão
nova, sem consultar a versão instalada a cada conferência.

## Behavior

Um processo em execução nunca recarrega o próprio código. A TUI aberta continua
na versão que carregou, mesmo depois de um `specsfy upgrade`.

A cada 30 s a TUI confere a data de modificação do executável em uso e do
primeiro `specsfy` do `PATH`; no invólucro npm, esse é o script que o npm
reescreve no upgrade. Só quando um deles muda ela roda o `--version` do comando
que iniciaria um processo novo, o `specsfy` do `PATH` quando existe; nas outras
conferências o custo é um `stat`.

Quando a versão instalada é diferente da versão aberta, o cabeçalho mostra, em
amarelo, `• vX.Y.Z installed: press q and reopen`. Reinstalar a mesma versão
não mostra nada, e uma falha no `--version` é ignorada.

Rodar o `--version` do invólucro npm já baixa o binário novo, então reabrir é
imediato.

O aviso vale só no binário compilado. Com `bun src/...` (desenvolvimento,
testes e showcase) o check fica desligado. O servidor `specsfy mcp` também segue
na versão antiga até o agente reiniciar o MCP; comandos avulsos sempre usam a
versão instalada.

## Design

`src/domain/installed-version.ts` concentra o check: `specsfyOnPath` procura o
primeiro `specsfy` do `PATH` (`specsfy.cmd`, `specsfy.exe` e `specsfy` no
Windows), `runningCompiledBinary` recusa `bun` e `bun.exe` para desligar o
aviso em `bun src/...`, `systemInstalledVersionDeps` lê o `mtime` com `statSync`
e roda `--version` com `NO_COLOR=1` e teto de 120 s, e
`createInstalledVersionWatcher` guarda o baseline dos `mtime` na primeira
conferência, consulta a versão só depois de uma mudança e chama `onNewer` uma
vez por versão nova. `InstalledVersionDeps` é a costura que os testes trocam.

`src/tui/index.ts` monta o texto `updateNotice` com `theme.warn` no cabeçalho,
cria o watcher só quando `runningCompiledBinary()` é verdadeiro (ou quando o
teste injeta `installedVersion`), roda a primeira conferência no mount e repete
a cada `installedVersionInterval` (30 s por padrão). Em `destroy`, o timer é
limpo junto com o resto da TUI.

## Surface

- Cabeçalho da TUI: aviso `• vX.Y.Z installed: press q and reopen` em amarelo
  (`theme.warn`), ao lado da versão aberta.
- Nenhum command, option, tool, key ou setting novo. O intervalo de 30 s é
  fixo; `installedVersion` e `installedVersionInterval` existem em `TuiOptions`
  só para injetar o sistema nos testes.

## Tasks

- [x] Watcher de versão instalada em `src/domain/installed-version.ts` `#termfy-tui`
- [x] Aviso no cabeçalho da TUI e timer em `src/tui/index.ts` `#termfy-tui`
- [x] `docs/tui.md`, `docs/user/cli.md` e `CLISPEC.md` com o aviso `#termfy-docs`

## Tests

- [x] `tests/installed-version.test.ts`: o watcher só consulta a versão depois da
  mudança do arquivo e avisa uma vez, a reinstalação da mesma versão não avisa, a
  falha no `--version` é ignorada, `bun` não conta como binário compilado e o
  cabeçalho mostra `v9.9.9 installed: press q and reopen`

## Notes

- 2026-11-20: entrega da versão 0.37.0, registrada no `CHANGELOG.md`.
