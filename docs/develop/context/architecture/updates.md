# Atualização remota do CLI

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | descoberta, consentimento e instalação de versões do CLI |
| Autoridade | limites de rede, cache, confiança e fallback do updater |

## Papel

Definir como o CLI descobre a versão distribuída, oferece uma atualização e
escolhe entre npm e executável avulso sem tornar rede ou GitHub requisitos para
abrir a aplicação.

## Como usar

Leia ao alterar a origem das versões, o cache global, o comando do npm, o
prompt inicial, o intervalo de consulta ou a forma de publicação.

## Atualize quando

- a API, o repositório ou o formato de tag mudar.
- o nome do pacote ou mecanismo de atualização mudar.
- dados globais, timeout, consentimento ou fallback mudar.

## Não use para

- atualizar skills ou dependências do projeto consumidor.
- instalar versão sem consentimento explícito.
- guardar token, conteúdo de projeto ou dado pessoal no cache.

## Fonte da verdade e precedência

O código e os testes de `cli/` implementam esta política. O registro npm
define a versão distribuída. Tags selecionam a proveniência quando coincidem
com essa versão. O cache apenas reduz consultas e nunca autoriza uma
instalação.

## Fluxo

1. Ao abrir a TUI interativa, o CLI lê ou cria `~/.specsfy/cli.json`.
2. Se o intervalo venceu, consulta a versão `latest` do registro npm com
   timeout curto.
3. Consulta as tags estáveis `vMAJOR.MINOR.PATCH` do GitHub para associar a
   versão publicada ao SHA quando houver correspondência.
4. Se a versão for superior, pede consentimento no terminal.
5. Ao aceitar, executa `npm install --global @promovaweb/specsfy@latest` quando
   o processo veio do npm. Para um executável avulso, baixa
   `https://get.specsfy.dev`, valida `--version` e substitui o arquivo atual.
6. Depois que o npm conclui, o CLI encerra para que a próxima abertura use o
   ambiente atualizado.
7. Recusa ou falha registra o adiamento da versão no cache e abre a aplicação
   atual normalmente; a mesma versão só volta a ser oferecida depois do
   intervalo configurado.

## Cache e privacidade

O JSON global tem permissão `0600`, preserva chaves desconhecidas e separa
configurações de dados efêmeros. Ele pode guardar habilitação, intervalo,
horário, ETags, versão publicada, tag, commit, versão adiada, horário do
adiamento e erro recente. Não guarda credenciais, telemetria nem conteúdo do
projeto.

A credencial existe somente no ambiente do processo ou no armazenamento
governado pelo GitHub CLI. O Specsfy não a imprime nem a copia para seu cache.

## Distribuição e publicação

O pacote instalável é definido por `cli/package.json`, expõe o comando
`specsfy` e inclui suas dependências no lockfile. O download público do
executável usa `get.specsfy.dev`. A instalação gerenciada usa
`npm install --global @promovaweb/specsfy` e a atualização usa
`specsfy upgrade`, que escolhe npm ou o executável avulso e só prossegue quando
encontra uma versão publicada superior. Uma tag atualizável aponta para o
commit cuja versão do pacote corresponde ao nome `v<versão>`, verificado pelo
CI antes da GitHub Release. A publicação no npm é feita depois, pela máquina
local.

O executável Node versionado continua sendo um artefato de distribuição e
validação do repositório. Ele contém as dependências do CLI e usa o runtime
Node.js instalado na máquina.
