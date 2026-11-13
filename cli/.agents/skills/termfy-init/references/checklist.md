# Checklist do bootstrap

## Antes

- [ ] `bun --version` responde 1.4.4 ou superior.
- [ ] `git status --short` sem mudanças alheias ao trabalho.
- [ ] Nome do executável validado: `^[a-z][a-z0-9-]{1,39}$`.

## Depois do `bun run init`

- [ ] `package.json`: `name`, `bin`, `description`, bloco `termfy` e `repository` atualizados.
- [ ] `.env.example`: variáveis com o novo prefixo.
- [ ] `README.md`, `AGENTS.md`, `CHANGELOG.md` e `.github/workflows/*.yml` sem a palavra `termfy` fora de citações ao framework e ao starter kit.
- [ ] `bun run skills:check` confirma as skills do framework em `.agents/skills/` e no `skills-lock.json`.
- [ ] `bun run dev -- --version` imprime o nome do binário e a versão de `package.json`.
- [ ] `bun run dev -- about --json` traz `data.author`, `data.site` e `data.repository` preenchidos.
- [ ] O projeto ainda não tem `CLISPEC.md` nem `specs/`: `init` não cria nenhum dos dois.
- [ ] A `termfy-clispec` foi chamada em seguida, escreveu o `CLISPEC.md` com `bin` e `description` iguais aos de `package.json` e criou as specs iniciais em `specs/`.
- [ ] `bun run opencli` regenerou `docs/opencli.json` com a nova identidade.
- [ ] `bun run dev -- config path` aponta para `~/.<bin>/`.

## O que o bootstrap não faz

- Não altera `src/` nem `docs/`: ambos leem o manifesto em tempo de execução.
- Não cria credenciais nem settings.
- Não escreve o `CLISPEC.md` do produto nem as specs; isso fica com a `termfy-clispec` e a `termfy-spec`.
- Não faz commit. O primeiro commit é seu, com a mensagem `release: <bin> v<version>`, com a versão de `package.json`.

## Erros comuns

| Sintoma | Causa | Ação |
| --- | --- | --- |
| `--version` ainda mostra `termfy` | `package.json` não foi regravado | confira permissões e rode o bootstrap de novo |
| teste `cli.test.ts` falha em `--help` | comando removido do registro | registre de novo ou ajuste o teste |
| `opencli:check` falha | registro mudou | `bun run opencli` e commit do `docs/opencli.json` |

## Manutenção isolada

- [ ] O agente executou a instalação, atualização ou reparo solicitado.
- [ ] A origem no lock continua sendo o framework oficial.
- [ ] As skills de outras bibliotecas foram preservadas.
- [ ] Os links dos agentes e a faixa de compatibilidade foram conferidos.
- [ ] A identidade do produto, o `CLISPEC.md` e as specs de `specs/` foram preservados.
- [ ] O agente reabriu as instruções atualizadas.
