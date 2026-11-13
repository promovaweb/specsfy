# Instalação do Specsfy

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | instalação do CLI e do framework em um projeto consumidor |
| Autoridade | interfaces públicas de `cli/` e `skills/` |

## Instale o CLI

O Specsfy requer Node.js 22.20 ou uma versão mais recente. O pacote oficial
publicado no npm instala o comando no ambiente global do usuário:

```bash
npm install --global @promovaweb/specsfy
```

Execute `specsfy --version` para confirmar que o terminal localiza o comando e
que o Node.js consegue abrir o aplicativo:

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

## Prepare o projeto consumidor

Abra a raiz do repositório que receberá a metodologia. Não execute a instalação
dentro do monorepo oficial do Specsfy, porque o CLI reconhece essa raiz como
ambiente de desenvolvimento e recusa a operação:

```bash
cd caminho/do/projeto
specsfy doctor --project .
specsfy install --project .
```

O diagnóstico confere Node.js 22.20 ou superior, Git, npm, o diretório do
projeto e o `npx`. Toda materialização usa `npx skills add`, inclusive quando
o CLI foi instalado pelo npm. `install` repete as verificações necessárias
antes de escrever qualquer arquivo e reúne todas as correções na mesma
mensagem.

Quando o projeto estiver em um Hub, use o subdiretório escolhido pela pessoa em
`--project`, como `specsfy install --project apps/portal`. O setup confirma o
mesmo caminho e mantém nele os contextos, as specs e o trabalho de código.

O instalador publica as etapas numeradas a partir de
`.agents/skills/specsfy-01-inbox`, grava o contrato central em
`.specsfy/Spec.md` e adiciona templates, exemplos e registros técnicos em
`.specsfy/`, inclusive `.specsfy/templates/DESIGNSYSTEM.MD` para as regras
macro de interface. Ele também insere blocos gerenciados em `AGENTS.md` e
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
nunca é sobrescrita pelo instalador, inclusive com `--force`.

A instalação inclui as quatorze skills base, entre elas as quatro de conversa e
milestones, além do setup, do documentador do sistema e das três skills
auxiliares. Ela prepara os arquivos usados pelo agente, mas não cria uma spec
de produto nem altera o código da aplicação.

## Instalação no Windows e recuperação após falha

No Windows, o diagnóstico procura executáveis com as extensões do PATHEXT,
como git.exe. A instalação chama o entrypoint JavaScript do npx pelo Node,
para preservar caminhos com espaços sem passar os argumentos por um shell.
Se o npm estiver incompleto, repare sua instalação antes de tentar novamente.

Quando o instalador delegado falha, o Specsfy tenta restaurar as regras,
os templates, as skills e os locks gerenciados que existiam antes da operação.
Se a restauração também falhar, a mensagem informa onde encontrar a cópia dos
arquivos anteriores. Preserve essa pasta e o log antes de repetir o comando.

A correção foi exercitada com simulação de plataforma. A confirmação em
Windows nativo depende do teste no computador que apresentou a falha.

## Confira os arquivos instalados

Na mesma raiz, liste o catálogo e consulte o progresso. O primeiro comando deve
mostrar as skills instaladas, e o segundo deve conseguir ler o diretório de
specs:

```bash
specsfy skills list
specsfy progress --project .
```

O catálogo deve mostrar as skills do Specsfy. Em um projeto novo, o comando de
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
estiverem vazias. Use `Ctrl+Q` para sair.

## Atualize sem perder customizações

Para atualizar o próprio CLI instalado pelo npm:

```bash
specsfy upgrade
specsfy --version
```

Na instalação pelo arquivo de `get.specsfy.dev`, o `specsfy upgrade` troca
o próprio lançador pela versão nova. Para atualizar
as skills já instaladas, execute `specsfy update`. O CLI compara os
fingerprints e preserva os arquivos customizados:

```bash
specsfy update --project .
```

`specsfy skills update --project .` continua aceito para automações anteriores.

O Specsfy registra fingerprints dos arquivos gerenciados. Uma atualização
normal substitui versões intactas e preserva arquivos customizados. Se o CLI
informar que encontrou alterações locais, revise a diferença. `--force`
descarta a customização protegida no arquivo indicado.

## Corrija falhas comuns

- **Comando ausente:** confira o resultado de `npm prefix --global` e o `PATH`
  usado pelo terminal.
- **Node.js incompatível:** execute `node --version`. O aplicativo requer
  Node.js 22.20 ou uma versão mais recente.
- **Permissão negada:** execute novamente
  `chmod +x "$HOME/.local/bin/specsfy"` quando usar o download. Em instalações
  pelo npm, configure um diretório global gravável pelo seu usuário.
- **Mensagem `npx não encontrado`:** instale ou repare o npm e disponibilize
  `npx` no `PATH`.
- **Arquivo gerenciado customizado:** preserve sua versão ou compare as
  mudanças oficiais e só então repita o comando com `--force`.

Com o ambiente conferido, siga o [primeiro projeto](getting-started.md) para
criar uma entrega pequena e observar a primeira `spec.md`. O
[guia do CLI e da TUI](cli.md) detalha os comandos de atualização, progresso,
testes e configuração.
