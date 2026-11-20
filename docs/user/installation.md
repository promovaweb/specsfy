# Instalação do Specsfy

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | instalação do CLI e do framework em um projeto consumidor |
| Autoridade | interfaces públicas de `cli/` e `skills/` |

## Instale o CLI

O `specsfy` é um binário compilado em Bun e não precisa de Node.js para rodar.
Até a 0.26, o CLI era escrito em Node.js e exigia Node.js 22.20; desde a
0.27.1, o Node.js só é usado pelo pacote npm e pelo lançador de
`get.specsfy.dev`, que pedem Node.js 18 ou superior. O pacote oficial
publicado no npm instala o comando no ambiente global do usuário:

```bash
npm install --global @promovaweb/specsfy
```

Na primeira execução, o pacote baixa o executável da plataforma da GitHub
Release da mesma versão e confere o SHA-256. Execute `specsfy --version` para
confirmar que o terminal localiza o comando:

```bash
specsfy --version
```

Uma resposta com o número da versão confirma a instalação. Se o terminal
mostrar `specsfy: command not found`, consulte o diretório global do npm e
confirme se o diretório de executáveis está no `PATH`:

```bash
npm prefix --global
specsfy --version
```

O download em `get.specsfy.dev` continua disponível para instalações mantidas
em `$HOME/.local/bin`. Ele entrega um lançador em Node.js que baixa e confere
o binário da versão na primeira execução:

```bash
mkdir -p "$HOME/.local/bin"
curl -fL get.specsfy.dev -o "$HOME/.local/bin/specsfy"
chmod +x "$HOME/.local/bin/specsfy"
```

Sem Node.js, baixe da [GitHub Release](https://github.com/promovaweb/specsfy/releases)
o executável da plataforma (`specsfy-linux-x64`, `specsfy-linux-arm64`,
`specsfy-darwin-x64`, `specsfy-darwin-arm64` ou `specsfy-windows-x64.exe`),
confira o hash no `SHA256SUMS` e coloque-o em um diretório do `PATH`. O script
`scripts/install-cli.sh` do repositório faz esse download e a conferência.

## Prepare o projeto consumidor

Abra a raiz do repositório que receberá a metodologia. Não execute a instalação
dentro do monorepo oficial do Specsfy: o CLI reconhece essa raiz e recusa a
operação.

```bash
cd caminho/do/projeto
specsfy doctor --project .
specsfy install --project .
```

O diagnóstico confere o runtime, o terminal, as configurações e, com
`--project`, o Git, o CLI de skills, o diretório do projeto, o
`skills-lock.json`, o token do GitHub e a checagem diária de release. As skills
são materializadas pelo CLI oficial `skills`, executado no runtime Bun embutido
no binário, sem Node.js nem `npx` na máquina. `install` repete as verificações
necessárias antes de escrever qualquer arquivo e reúne todas as correções na
mesma mensagem.

Quando o projeto estiver em um Hub, use o subdiretório escolhido pela pessoa em
`--project`, como `specsfy install --project apps/portal`. O setup confirma o
mesmo caminho e mantém nele os contextos, as specs e o trabalho de código.

O instalador publica as etapas numeradas a partir de
`.agents/skills/specsfy-01-inbox`, grava o contrato central em
`.specsfy/Spec.md` e adiciona templates, exemplos e registros técnicos em
`.specsfy/`, inclusive `.specsfy/templates/DESIGNSYSTEM.MD` para as
orientações gerais de interface. Ele também insere blocos gerenciados em `AGENTS.md` e
`CLAUDE.md`, preservando o conteúdo que já existe fora desses blocos.

Ao executar `$specsfy-setup`, o template também gera `DESIGNSYSTEM.MD` na raiz
do projeto quando o arquivo ainda não existe. O setup preserva um arquivo local
existente e deixa a aplicação pronta para registrar seus padrões de CRUD,
dashboard e interface.

O mesmo setup gera `.specsfy/USER-PROFILE.md` quando esse arquivo ainda não
existe. Na conversa, ele identifica o nível de conhecimento, consulta respostas
já registradas e adapta a explicação das próximas perguntas. O arquivo local e
as respostas confirmadas são preservados entre execuções.

Para personalizar um template sem impedir atualizações, copie-o para
`.specsfy/templates/custom/` com o mesmo nome. Essa versão tem precedência e
não é sobrescrita pelo instalador, inclusive com `--force`.

A instalação inclui as dez skills base, entre elas as de conversa e de
milestones, além do setup, do documentador do sistema e das três skills
auxiliares. Ela prepara os arquivos usados pelo agente, mas não cria uma spec
de produto nem altera o código da aplicação.

## Instalação no Windows e recuperação após falha

No Windows, o diagnóstico procura executáveis com as extensões do PATHEXT,
como git.exe. As variáveis `SPECSFY_SKILLS_CLI` (um executável que se comporta
como `skills`) e `SPECSFY_NPX_COMMAND` (um executável no estilo `npx`)
substituem o runtime embutido; um shim `.cmd` roda pelo `cmd.exe` com os
argumentos escapados, preservando caminhos com espaços.

Quando o instalador delegado falha, o Specsfy tenta restaurar o contrato,
os templates, as skills e os locks gerenciados que existiam antes da operação.
Se a restauração também falhar, a mensagem informa onde encontrar a cópia dos
arquivos anteriores. Preserve essa pasta e o log antes de repetir o comando.

A correção foi exercitada com simulação de plataforma. A confirmação em
Windows nativo depende do teste no computador que apresentou a falha.

## Confira os arquivos instalados

Na mesma raiz, liste o catálogo e consulte o progresso. O primeiro comando
mostra o catálogo de especialistas do framework, enquanto o segundo confirma
que consegue ler o diretório de specs:

```bash
specsfy skills list
specsfy progress --project .
```

O catálogo deve mostrar os especialistas do Specsfy. Em um projeto novo, o comando de
progresso pode retornar zero specs. Esse resultado confirma que o CLI leu o
repositório e ainda não encontrou arquivos em
`specs/<estado>/<NNNN>-<slug>/spec.md`.

O comando sem subcomando abre a interface visual no diretório atual. O nome do
projeto aparece no topo e as abas devem carregar mesmo quando ainda não houver
spec:

```bash
specsfy
```

O dashboard deve carregar as abas do projeto mesmo quando as tabelas ainda
estiverem vazias. Use `q`, `Esc` ou `Ctrl+C` para sair.

## Atualize sem perder customizações

Para atualizar o próprio CLI:

```bash
specsfy upgrade
specsfy --version
```

Pelo npm, o `specsfy upgrade` atualiza o pacote global com o npm. Na
instalação pelo arquivo de `get.specsfy.dev`, ele troca o próprio lançador; no
executável avulso, baixa o da plataforma, confere o `SHA256SUMS` e se
substitui. Depois de trocar o
binário, execute `specsfy update` em cada projeto. Ele compara o projeto com o
inventário de skills daquela versão: instala as skills base novas, atualiza as
que mudaram e remove as renomeadas e as aposentadas. Arquivos com alteração
sua são mantidos:

```bash
specsfy update --check --project .   # só mostra o que mudaria
specsfy update --project .
```

`specsfy skills update --project .` continua aceito para automações anteriores.

O Specsfy registra fingerprints dos arquivos gerenciados. Assim, uma atualização
normal substitui versões intactas e preserva arquivos customizados. Se o CLI
informar que encontrou alterações locais, revise a diferença. `--force`
descarta a customização protegida no arquivo indicado.

## Corrija falhas comuns

- **Comando ausente:** confira o resultado de `npm prefix --global` e o `PATH`
  usado pelo terminal.
- **Node.js incompatível:** o pacote npm e o lançador de `get.specsfy.dev`
  pedem Node.js 18 ou superior; confira com `node --version` ou use o
  executável da GitHub Release, que dispensa o Node.js.
- **Permissão negada:** execute novamente
  `chmod +x "$HOME/.local/bin/specsfy"` quando usar o download. Em instalações
  pelo npm, configure um diretório global gravável pelo seu usuário.
- **CLI de skills indisponível:** `doctor --project .` indica quando
  `SPECSFY_SKILLS_CLI` ou `SPECSFY_NPX_COMMAND` aponta para um arquivo que não
  é executável; corrija ou remova a variável.
- **Arquivo gerenciado customizado:** preserve sua versão ou compare as
  mudanças oficiais e só então repita o comando com `--force`.

Com o ambiente conferido, siga o [primeiro projeto](getting-started.md) para
criar uma entrega pequena e observar a primeira `spec.md`. O
[guia do CLI e da TUI](cli.md) detalha os comandos de atualização, progresso,
testes e configuração.
