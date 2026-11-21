# Padrões e referências Laravel

Revisado em 2026-11-20 contra: docs oficiais do Laravel 13.x (releases, Octane, Eloquent, autorização, filas, migrations, database testing), Laravel 12.x (releases) e o código de `laravel/octane` 2.x (`config/octane.php`, `StartCommand`, `InstallCommand`) e `laravel/framework` 13.x.

## Índice das referências

| Modo | Arquivo | Conteúdo |
| --- | --- | --- |
| app | [standards.md](standards.md) | este arquivo: Eloquent, autorização, filas, migrations, segurança, operação, diagnóstico e fontes oficiais |
| packages | [packages.md](packages.md) | ficha por pacote, índice `docs/packages/README.md`, ordem das fontes e comandos Composer |

## Eloquent e N+1

- N+1 aparece quando um loop acessa uma relação lazy-loaded por item da
  coleção. Detecte contando queries (Debugbar, Telescope, `DB::listen`,
  `Model::preventLazyLoading()` em ambiente de teste/dev) e corrija com
  `with()`/`load()`/`withCount()`, nunca escondendo a query em um accessor.
- `expectsDatabaseQueryCount()` é a asserção nativa de teste para fixar o
  total de queries de um caso; para medir só um trecho, conte em `DB::listen`
  depois de semear os dados. `assertQueryCountLessThan()` não faz parte do
  framework, vem de pacote de terceiros.
- `chunkById`/`lazyById` para processar tabelas grandes sem carregar tudo em
  memória; `cursor()` quando o driver e o volume permitirem streaming sem
  hidratar toda a coleção.
- `select()` explícito quando a tabela é larga (colunas `text`/`json`
  grandes) e a listagem não precisa do model completo.
- Casts (`casts()` ou `$casts`) para tipos que a aplicação trata como valor —
  datas, enums, JSON, dinheiro em inteiro — evita comparação implícita
  incorreta e serialização manual espalhada.

## Autorização

- Policy por objeto: todo método de Policy recebe o model e checa ownership
  ou papel sobre aquele registro específico, nunca apenas "usuário
  autenticado existe".
- Gate/Policy roda no controller (`$this->authorize()`, middleware
  `can:`) e é reafirmado em qualquer segundo caminho de mutação (Job,
  Command, Nova/Filament action) que toque o mesmo dado.
- Form Request (`authorize()` + `rules()`) separa "quem pode" de "o que é
  válido"; um `authorize()` retornando sempre `true` é equivalente a não ter
  Policy e deve ser justificado explicitamente (rota pública).

## Filas e idempotência

- `ShouldBeUnique`/`ShouldBeUniqueUntilProcessing` com chave de negócio
  evita duplicar efeito quando o worker reentrega a mensagem.
- `$tries`, `$backoff` e `retryUntil()` explícitos; `failed(Throwable $e)`
  trata o efeito colateral definitivo (notificar, compensar, reverter) em
  vez de deixar a falha silenciosa na fila `failed_jobs`.
- Batch (`Bus::batch`) para orquestrar múltiplos jobs com `then`/`catch`
  quando a unidade de trabalho for composta.
- Webhook/job externo idempotente por chave de evento (ex.: `event_id` do
  provedor), não por horário ou payload completo.

## Migrations e dados

- `expand → migrar dado → contract`: adicionar coluna nova nullable, dual
  write/backfill, migrar leitura, só então remover a coluna antiga — nunca um
  `ALTER` único que renomeia/remove coluna lida em produção no mesmo deploy.
- Medir o lock esperado da DDL antes de rodar em tabela grande (ver
  `$specsfy-specialist-postgres` para o comportamento exato do Postgres);
  `Schema::table` com `ALTER COLUMN TYPE` reescreve a tabela em versões e
  situações que não suportam mudança de metadado apenas.
- Seeder/factory reproduz estado de teste; migration nunca depende de dado
  específico de um ambiente para rodar com sucesso.

## Segurança de aplicação

- `$fillable` (allowlist) preferível a `$guarded = []`; nunca
  `create($request->all())`/`update($request->all())` sem passar por Form
  Request validado.
- CSRF ativo em rotas de sessão web; rotas de API stateless usam Sanctum/
  Passport com token, não cookie de sessão sem proteção adicional.
- Rate limit (`throttle:`) em login, reset de senha e endpoints públicos
  sensíveis a abuso; usar por identidade + IP, não só IP.
- Segredos em `.env`/secret manager, nunca commitados; `config:cache` roda
  sobre `.env` resolvido, então mudar `.env` em produção exige `config:clear`
  ou novo `config:cache`.

## Operação

- Laravel Octane com Open Swoole e `laravel/octane` é o runtime HTTP
  obrigatório. Instale `openswoole` por PECL na imagem, execute
  `octane:start --server=swoole`, configure o healthcheck no processo Octane e
  recarregue os workers durante o deploy. (regra da casa)
- A documentação do Octane lista FrankenPHP, RoadRunner, Swoole e Open
  Swoole, mas `config/octane.php` e `octane:install` aceitam `frankenphp`,
  `roadrunner` e `swoole` (o driver swoole também reconhece a extensão
  `openswoole`), e o instalador usa `frankenphp` como padrão. A exigência de
  Open Swoole é regra deste catálogo, não uma obrigação do framework: confirme
  com `composer show laravel/octane` e com `config/octane.php` antes de trocar o
  servidor de um projeto existente.
- `octane:reload` recarrega os workers depois do deploy, `octane:status`
  confirma que o processo está de pé e `octane:stop` encerra o servidor. Em
  produção use Supervisor ou equivalente para reiniciar após crash.
- Revise singletons, estado estático e callbacks capturados: workers Octane
  persistem entre requisições e não podem carregar dados de um usuário para o
  próximo.
- `config:cache`, `route:cache`, `event:cache` (ou `php artisan optimize`, que
  agrupa config, eventos, rotas e views) reduzem I/O de boot; qualquer um deles
  fica obsoleto silenciosamente se o deploy não os regenerar após mudar
  config/rotas/listeners — automatizar no pipeline, não como passo manual
  esquecível.
- Workers (`queue:work`) precisam de supervisor/systemd que reinicie após
  deploy (`queue:restart` sinaliza, não mata) e após crash.
- `schedule:run` via cron único chamando o Scheduler do Laravel, nunca um
  cron por comando individual.
- Health check de aplicação inclui banco, cache e fila alcançáveis, não
  apenas "processo respondeu 200".

## Checklist por superfície

- HTTP: rotas estáveis, validação antes do domínio, autorização explícita e
  erros coerentes com o formato esperado pelo cliente (JSON:API, problem+json
  ou o padrão já adotado).
- Domínio: invariantes testáveis sem depender do transporte HTTP.
- Eloquent: colunas selecionadas, eager loading intencional, casts e
  transação (`DB::transaction`) ao redor de efeitos que precisam ser
  atômicos.
- Filas: payload serializável e mínimo (IDs, não models inteiros),
  idempotência, unicidade quando necessária, observabilidade (Horizon/tags).
- Dados: migration expand/contract para mudança incompatível e backup
  verificado antes de DDL destrutiva.
- Segurança: mass assignment controlado, escaping/Blade automático,
  CSRF, rate limit e secrets fora do código-fonte.
- Operação: config cacheável, health checks, workers reiniciáveis e deploy
  reversível.

## Comandos de diagnóstico

- `php artisan route:list` — confirma que a rota existe, o middleware
  aplicado e qual controller/action responde; use antes de investigar "rota
  não encontrada" ou autorização aplicada no middleware errado.
- `php artisan queue:failed` — lista jobs que esgotaram tentativas; combine
  com `php artisan queue:retry <id>`/`--all` depois de corrigir a causa raiz,
  nunca antes.
- `php artisan queue:work --once`/`--stop-when-empty` para reproduzir o
  processamento de um job isoladamente em diagnóstico, sem deixar um worker
  de longa duração rodando na sessão de investigação.
- `php artisan migrate:status` — confirma quais migrations já rodaram no
  ambiente antes de aplicar uma nova ou de investigar divergência de schema
  entre ambientes.
- `php artisan tinker` para inspecionar estado real (model, relação, config
  resolvida) no ambiente alvo em vez de assumir o comportamento a partir do
  código-fonte isolado.
- `php artisan config:clear`/`route:clear` quando o comportamento observado
  não bater com o código-fonte — sintoma comum de cache de config/rota
  desatualizado após deploy.

## Fontes oficiais

- [Documentação Laravel](https://laravel.com/docs)
- [Notas de versão e política de suporte](https://laravel.com/docs/releases)
- [Laravel Octane](https://laravel.com/docs/octane) e [seção Swoole/Open Swoole](https://laravel.com/docs/octane#swoole)
- [Ciclo de vida da requisição](https://laravel.com/docs/lifecycle)
- [Relacionamentos Eloquent e eager loading](https://laravel.com/docs/eloquent-relationships)
- [Testes de banco e `expectsDatabaseQueryCount`](https://laravel.com/docs/database-testing)
- [Autorização com Policies e Gates](https://laravel.com/docs/authorization)
- [Filas](https://laravel.com/docs/queues)
- [Banco e migrations](https://laravel.com/docs/migrations)
- [Testes](https://laravel.com/docs/testing)
- [Task scheduling](https://laravel.com/docs/scheduling)
- [OWASP Laravel Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Laravel_Cheat_Sheet.html)

Confirme a versão instalada em `composer.lock` antes de usar uma API — o
comportamento de casts, filas e autorização mudou entre versões majors.

Versões em 20/11/2026: Laravel 13 é a versão atual (PHP 8.3 a 8.5, lançada no
Q1 de 2026, correções de bug até o Q3 de 2027); Laravel 12 (PHP 8.2 a 8.5)
segue com correções de segurança até 24/02/2027; Laravel 11 encerrou o suporte
de segurança em 12/03/2026. Não trate uma versão sem suporte como base de
recomendação.
