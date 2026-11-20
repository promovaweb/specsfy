# Atualização remota do CLI

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | descoberta, consentimento e instalação de versões do CLI |
| Autoridade | limites de rede, cache, confiança e fallback do updater |

## Papel

Definir como o CLI descobre a versão distribuída e troca a instalação em uso,
entre wrapper npm, launcher, executável avulso e código-fonte, sem tornar rede
ou GitHub requisitos para abrir a aplicação.

## Como usar

Leia ao alterar a origem das versões, o cache global, a detecção da origem da
instalação, o intervalo de consulta ou a forma de publicação.

## Atualize quando

- a API, o repositório, o formato de tag ou o nome dos assets mudar.
- o nome do pacote npm ou o mecanismo de troca do executável mudar.
- dados globais, intervalo, verificação de integridade ou fallback mudar.

## Não use para

- atualizar skills ou dependências do projeto consumidor.
- instalar versão sem um command explícito de quem usa.
- guardar token, conteúdo de projeto ou dado pessoal no cache.

## Fonte da verdade e precedência

O código e os testes de `cli/` implementam esta política, em
`cli/src/domain/updater.ts` e `cli/tests/domain/updater.test.ts`. A última
GitHub Release de `promovaweb/specsfy` define a versão distribuída. O cache
apenas reduz consultas e nunca autoriza uma troca.

## Fluxo

1. `specsfy upgrade` consulta `releases/latest` da API do GitHub, com o token
   de `github.token`, `GH_TOKEN`, `GITHUB_TOKEN` ou `gh auth token` quando
   houver.
2. Com `--check`, ou quando a versão publicada não supera a atual, o command
   só informa as duas versões.
3. Caso contrário, a origem da instalação decide a troca:
   - wrapper npm (`SPECSFY_NPM_WRAPPER=1`): executa
     `npm install --global @promovaweb/specsfy@latest` numa instalação global;
     o wrapper baixa o binário novo na próxima execução.
   - launcher de `https://get.specsfy.dev` (`SPECSFY_LAUNCHER`): baixa o
     launcher da versão nova e substitui o arquivo.
   - executável avulso: baixa `specsfy-<os>-<arch>` da release, confere o
     SHA-256 em `SHA256SUMS` e `--version` e troca o arquivo atomicamente,
     resolvendo symlinks antes da troca.
   - código-fonte (`bun run src/main.ts`): recusa e orienta atualizar o
     checkout com Git.
4. `SPECSFY_DOWNLOAD_URL` aponta para um espelho com o mesmo layout da
   GitHub Release.

A checagem diária do `doctor` e a tool MCP `update_check` comparam versões
sem trocar nada. Falha de rede não impede a abertura da TUI nem dos commands
de leitura.

## Cache e privacidade

`~/.specsfy/update.json` guarda somente o horário e a versão da última
checagem, com permissão `0600`, e é reaproveitado por um dia. A key
`update.check` de `settings.json` desliga a checagem diária. O cache não
guarda credenciais, telemetria nem conteúdo do projeto.

O token vem do cofre cifrado do Specsfy, do ambiente do processo ou do
armazenamento governado pelo GitHub CLI. O Specsfy não o imprime nem o copia
para o cache.

## Distribuição e publicação

O workflow `CLI Release` compila, a partir da tag `v<versão>`, os executáveis
de linux-x64, linux-arm64, darwin-x64, darwin-arm64 e windows-x64 com
`bun build --compile` e publica a GitHub Release com `SHA256SUMS`. O pacote
npm `@promovaweb/specsfy`, definido em `cli/npm/package.json`, é só um
wrapper que baixa o binário da plataforma; a publicação no npm é feita
depois, pela máquina local. O launcher `cli/bin/specsfy` servido por
`get.specsfy.dev` é gerado a partir desse wrapper por `bun run launcher`.

O executável compilado não depende de Bun nem de Node.js na máquina que o
executa.
