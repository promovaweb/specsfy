# Showcase da TUI

Prints de todas as telas da TUI do Specsfy ficam em
`docs/user/assets/showcase/`, gerados a partir do projeto de demonstração de
[`cli/tests/fixtures/showcase-project/`](../../cli/tests/fixtures/showcase-project/),
nos temas `night` e `day`, numa tela de 140×40, em 20 prints. O projeto é uma
loja online com 8 specs em todos os estados, itens de backlog, capturas de
inbox, os milestones M01 e M02 e os arquivos de contexto (`PROJECT.md`,
`.specsfy/STACK.md` e `.specsfy/RULES.md`), construído por
[`cli/scripts/build-demo-project.ts`](../../cli/scripts/build-demo-project.ts)
a partir de uma spec real do [`example/`](../../example/). A raiz desse projeto
aparece nos prints como `~/projects/loja-online`.
As imagens saem do próprio código da TUI. Quando uma tela muda, o
`bun run validate` do CLI falha até que esta pasta seja atualizada. Pode
usar as imagens em material de divulgação: elas mostram sempre a TUI da versão
atual.

## Telas

| Tela | night | day |
| --- | --- | --- |
| Overview | ![Overview night](../user/assets/showcase/night-overview.png) | ![Overview day](../user/assets/showcase/day-overview.png) |
| Specs | ![Specs night](../user/assets/showcase/night-specs.png) | ![Specs day](../user/assets/showcase/day-specs.png) |
| Backlog | ![Backlog night](../user/assets/showcase/night-backlog.png) | ![Backlog day](../user/assets/showcase/day-backlog.png) |
| Milestones | ![Milestones night](../user/assets/showcase/night-milestones.png) | ![Milestones day](../user/assets/showcase/day-milestones.png) |
| Context | ![Context night](../user/assets/showcase/night-context.png) | ![Context day](../user/assets/showcase/day-context.png) |
| Gates | ![Gates night](../user/assets/showcase/night-gates.png) | ![Gates day](../user/assets/showcase/day-gates.png) |
| Tests | ![Tests night](../user/assets/showcase/night-tests.png) | ![Tests day](../user/assets/showcase/day-tests.png) |
| Skills | ![Skills night](../user/assets/showcase/night-skills.png) | ![Skills day](../user/assets/showcase/day-skills.png) |
| About | ![About night](../user/assets/showcase/night-about.png) | ![About day](../user/assets/showcase/day-about.png) |
| Help de teclas (`?`) | ![Help night](../user/assets/showcase/night-help.png) | ![Help day](../user/assets/showcase/day-help.png) |

O tema `terminal`, padrão de `tui.theme`, usa as cores do terminal de quem
abre a TUI. Por isso ele não tem print fixo aqui.

## Como atualizar

```bash
cd cli
bun run demo:build
bun run showcase
```

O `demo:build` regrava `tests/fixtures/showcase-project/` de forma
determinística, com as specs, o backlog e o inbox do projeto de demonstração.
O `showcase` monta a TUI no renderer de teste do OpenTUI, abre cada aba e o
help e grava duas coisas por tela:

| Arquivo | Conteúdo |
| --- | --- |
| `docs/user/assets/showcase/<tema>-<tela>.png` | a imagem, em resolução 2x |
| `cli/tests/showcase-frames/<tema>-<tela>.txt` | o quadro em texto, usado pela verificação |

Os prints night de Overview, Backlog, Specs e Skills também são copiados para
[`docs/user/assets/cli/`](../user/assets/cli/) com os nomes usados pelo guia do CLI e pelo site
(`cli-dash.png`, `cli-backlogs.png`, `cli-specs.png` e `cli-skills.png`).

Só as telas cujo quadro mudou ganham PNG novo, para não regravar todas as
imagens no histórico do Git a cada ajuste. Use `bun run showcase -- --all`
para gerar todas de novo, como antes de uma release.

`bun run showcase:check` compara a TUI atual com os quadros de `cli/tests/showcase-frames/` e
roda dentro de `bun run validate`. Versão, plataforma e runtime ficam de fora
da comparação, então uma release sozinha não exige prints novos.

Os prints não mostram nada da máquina de quem gerou: a raiz do projeto de
demonstração aparece como `~/projects/loja-online`, a pasta de dados como
`~/.specsfy` e o PID como `4242`. O catálogo de especialistas vem de
[`specialists/catalog.json`](../../specialists/catalog.json), sem rede.

As imagens usam o Playwright instalado para o ebook. Na primeira vez, na raiz
do monorepo:

```bash
cd .ebook
npm ci
npx playwright install chromium
```

O script fica em [`cli/scripts/showcase.ts`](../../cli/scripts/showcase.ts).
