# Arquitetura do CLI e da TUI

O módulo `cli/` distribui o framework, gerencia especialistas, projeta progresso
e oferece a interface terminal. A implementação usa TypeScript sobre Node.js e
não define requisitos nem aprova gates.

## Entradas

`cli/src/cli.ts` define:

```text
specsfy install
specsfy doctor
specsfy update
specsfy upgrade
specsfy skills
specsfy progress
specsfy milestones sync
specsfy test
specsfy tui
specsfy config
```

Sem subcomando, a aplicação abre a TUI.

## Componentes

| Módulo | Responsabilidade |
| --- | --- |
| `cli.ts` | parser Commander, despacho e saída não interativa |
| `installer.ts` | framework, skills, merge e proteção local |
| `prerequisites.ts` | diagnóstico de Node.js, executáveis e projeto |
| `catalog.ts` | catálogo remoto de especialistas |
| `skill-lock.ts` | seleção instalada, fingerprints e proteção |
| `progress.ts` | leitura e resumo das specs |
| `milestones.ts` | projeção de milestones, vínculos e índice `specs.md` |
| `backlog.ts` | projeção dos itens de backlog |
| `project-testing.ts` | detecção e execução do runner consumidor |
| `config.ts` | configuração por projeto |
| `updater.ts` | descoberta de tags e oferta de atualização |
| `github.ts` | headers e autenticação da API do GitHub |
| `tui.ts` | dashboard neo-blessed e interações |

## Instalação

`specsfy doctor` apresenta todos os requisitos do ambiente. Antes de qualquer
escrita, `specsfy install` exige Node.js 22.20 ou superior, Git, um projeto
legível e gravável e `npx` no `PATH`. A materialização de toda skill, base ou
especialista, usa `npx skills add`; o diagnóstico também informa a
disponibilidade do npm, usado por `upgrade`.

`SkillInstaller` valida que o destino é um projeto consumidor, obtém `skills/`
do monorepo e instala o conjunto `FRAMEWORK_SKILLS` por `npx skills add`. Esse
conjunto inclui setup,
três auxiliares, documentador e skills base, incluindo as entrevistas de MVP,
roadmap e governança de milestones.

Conteúdo gerenciado recebe fingerprints. Se a cópia local divergir do último
fingerprint registrado, atualização e remoção recusam a operação sem `--force`.

O instalador publica `Inbox.md`, `Backlog.md`, `Spec.md`, `Tasks.md`,
`Project.md`, `Stack.md`, `Rules.md`, `Database.md` e `UserProfile.md` em
`.specsfy/templates/`. Cada template possui digest próprio. Assim, uma
customização local em qualquer um deles impede somente uma substituição
explicitamente forçada.

O instalador também cria `.specsfy/templates/custom/`, sem registrar os
arquivos desse diretório no lock. Um arquivo
`.specsfy/templates/custom/<Nome>.md` prevalece sobre o homônimo gerenciado.
Atualizações, remoções e `--force` nunca alteram essa camada do usuário.

## Catálogo

`specialists/catalog.json` é a fonte executável. `Catalog.fetch()` usa a API de
conteúdo do GitHub e aceita override local por
`SPECSFY_SPECIALISTS_CATALOG`.

Como o repositório é privado, a autenticação procura:

1. `GH_TOKEN`.
2. `GITHUB_TOKEN`.
3. `gh auth token`.

O token permanece no ambiente ou no armazenamento do GitHub CLI e não é
gravado pelo Specsfy.

## Progresso

O scanner lê `specs/<estado>/*/spec.md`, com compatibilidade de leitura do layout
legado. Status, gates, tarefas e checklists são projeções. `--watch` recalcula
quando o fingerprint das fontes muda.

## Milestones

`specsfy milestones sync --project .` lê o campo `Milestones` das specs e do
backlog. O comando atualiza blocos gerados em `specs.md` e em
`specs/milestones/MNN.md`, preservando o restante do Markdown. Consulte
[Milestones](milestones.md) para o contrato, os limites de escrita e os
testes do módulo.

## Testes do consumidor

`project-testing.ts` reconhece runners suportados a partir do projeto
selecionado. O comando transmite a saída e preserva o exit code. A TUI separa
resumo e detalhes, mas usa o mesmo contrato.

Para Laravel, `runProjectTests` valida `.env.testing`, compara o destino efetivo
com o `.env` e procura `RefreshDatabase` ou `DatabaseMigrations` antes de criar
o processo do Artisan. Qualquer pendência lança erro e mantém o runner sem
execução. O teste desse contrato usa diretórios temporários e um executável PHP
fictício, sem conexão com banco.

O painel detalhado usa uma caixa rolável com o conteúdo acumulado. O componente
`blessed.log` não deve ser usado nessa tela porque agenda a rolagem depois da
renderização e tenta acessar o widget anterior quando uma nova linha recria a
aba.

## Atualização

`specsfy update` atualiza todas as skills Specsfy registradas no projeto.
`specsfy skills update` usa a mesma função para preservar compatibilidade.
Ambos executam o preflight do instalador antes de baixar as origens.

`specsfy upgrade` força uma nova consulta ao registro npm e só atualiza quando a
versão publicada supera `VERSION`. Assim, uma tag de desenvolvimento mais
recente que a publicação disponível não provoca downgrade.

`updater.ts` consulta o registro npm, usa tags semânticas estáveis apenas para
proveniência, respeita intervalo e ETag, oferece consentimento e atualiza a
instalação detectada:

```text
npm install --global @promovaweb/specsfy@latest
```

Quando o processo atual é o executável avulso `bin/specsfy`, o updater baixa
`https://get.specsfy.dev`, confirma a versão com `--version` e substitui o
arquivo atomicamente. Se o caminho for um symlink, resolve o arquivo apontado
antes da troca para preservar o comando exposto no `PATH`. A recusa ou uma
falha de atualização registra a versão adiada no cache; o aviso reaparece
somente depois do intervalo configurado. `specsfy upgrade` usa consulta forçada
e ignora esse adiamento.

Falha de rede não impede a abertura. Configurações e metadados ficam em
`~/.specsfy/cli.json` com permissão `0600`. O cache inclui a versão e o horário
do último adiamento, além das versões e ETags consultadas. Credenciais não são
persistidas.

## Artefato versionado

`scripts/build-executable.mjs` constrói `cli/bin/specsfy` e
`cli/bin/specsfy.build.json`. O executável Node é distribuído publicamente por
`get.specsfy.dev`. O fingerprint usa modos equivalentes aos preservados pelo
Git para produzir o mesmo resultado localmente e no CI.

Toda mudança em `cli/` reconstrói e versiona esses artefatos.

## Testes

`SpecsfyTui.start()` aceita um `screen` do neo-blessed, um catálogo conhecido e
a opção de desligar o polling. A suíte monta o mesmo renderer usado pelo
executável em terminais virtuais de `80x24`, `129x44` e `160x50`. O buffer
resultante confirma as seis abas, os painéis e os textos visíveis. Eventos de
teclado e mouse conferem foco, filtros, busca, seleção de skills e o modal de
spec. Os atalhos de controle também são enviados como bytes de terminal. Essa
cobertura inclui os nomes `linefeed` e `backspace`, usados pelo neo-blessed para
`Ctrl+J` e `Ctrl+H`, e impede combinações indistinguíveis de `Tab` e `Enter`.
O modal mantém o foco entre seu conteúdo e o botão **Fechar Esc**. No
fechamento, a implementação remove os controles do overlay da pilha de foco do
neo-blessed antes de destruir os widgets e devolve o foco à lista de specs.
As regressões usam também o byte Escape enviado por um TTY real.

`TUI_THEME`, em `tui.ts`, centraliza cores semânticas derivadas da paleta dark
de `brand/tokens.json`. A suíte calcula a razão de contraste dos pares usados
em texto, borda, seleção e foco. Texto principal e foco devem alcançar `7:1`, a
seleção deve alcançar `4.5:1` e a borda deve alcançar `3:1`. As cores
hexadecimais também evitam a variação introduzida por nomes configuráveis da
paleta de 16 cores do terminal.

```bash
cd cli
npm ci
npm run build:executable
npm run check
node dist/main.js --help
./bin/specsfy --version
```

Mudanças de interface atualizam também
[`docs/user/cli.md`](../user/cli.md) e a
[`referência pública dos comandos`](../user/cli-reference.md). A regressão
compara os comandos registrados no Commander com as seções dessa referência e
exige cinco exemplos por comando ou subcomando.

Os prints de todas as telas da TUI e o fluxo para atualizá-los estão em
[`showcase.md`](showcase.md).
