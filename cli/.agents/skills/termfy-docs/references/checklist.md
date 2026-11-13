# Checklist da documentação embutida

## Cobertura (o que `docs:check` confere)

- [ ] Cada command e subcommand do registry aparece em `docs/cli.md`.
- [ ] Cada screen de `src/tui/screens/index.ts` aparece em `docs/tui.md`.
- [ ] Cada tool, resource e prompt do catalog aparece em `docs/mcp.md`.
- [ ] Cada key de `SETTINGS_SCHEMA` aparece em `docs/configuration.md`.
- [ ] Cada exit code de `exit-codes.ts` aparece em `docs/exit-codes.md`.
- [ ] `docs/opencli.json` está alinhado ao registry (`opencli:check`).

## Conteúdo (o que a leitura confere)

- [ ] `docs/README.md` abre com a tabela dos três modos e o mapa dos
      arquivos; nada mais.
- [ ] `docs/cli.md`: convenções, options globais, envelope `--json` com um
      exemplo de sucesso e um de erro, tabela de commands e o passo a passo
      para adicionar um command.
- [ ] `docs/tui.md`: abas, teclas, tema, como criar uma screen, como testar.
- [ ] `docs/mcp.md`: configuração do cliente, tabelas de tools, resources e
      prompts, como listar sem iniciar, como testar, como adicionar.
- [ ] `docs/configuration.md`: arquivos e permissões, keys com tipo e padrão,
      cofre, master key, o que a cifra protege, variáveis de ambiente.
- [ ] `docs/exit-codes.md`: tabela completa, exemplo em shell e no código.
- [ ] Toda credencial consumida pelo binário tem nome e forma de obtenção.
- [ ] Todo command com efeito externo (grava, chama rede) diz isso.
- [ ] Nenhum segredo, token ou caminho pessoal real em exemplos.
- [ ] Fluxos, saídas, erros e exit codes descritos no Behavior da spec
      aberta aparecem na documentação como foram implementados.

## Forma

- [ ] Placeholders no lugar de `termfy`, `Termfy` e `TERMFY`.
- [ ] Exemplos começam pelo binário e cabem em uma linha.
- [ ] Tabelas com itens paralelos; prosa para explicar.
- [ ] Sem travessão como pontuação; sem clichês de abertura ou fechamento.
- [ ] Nomes de código em inglês, exatamente como no código.
