# Laravel

O especialista Laravel orienta o agente em aplicações Laravel, do roteamento
aos testes. Ele segue as convenções que o projeto já adota, roda o HTTP com
Laravel Octane e Open Swoole e protege o banco de desenvolvimento durante a
suíte de testes.

## Quando usar

- O repositório tem `artisan` e `laravel/framework` no `composer.json`.
- A tarefa altera rotas, controllers, models, policies, form requests, jobs,
  eventos, cache, configuração ou testes.
- Você quer revisar um pull request Laravel ou investigar consultas N+1, filas
  travadas, autorização quebrada ou uma migration arriscada.

A escolha de schema, índice e plano de query fica com o especialista
PostgreSQL. O resultado dessa análise volta para o Eloquent na implementação.

## Como ele trabalha

1. Lê o `composer.json` e o `composer.lock` para confirmar as versões do
   framework, do PHP e de pacotes como Sanctum, Horizon, Octane e Scout.
2. Trata Laravel Octane com Open Swoole como runtime obrigatório. Quando ele
   está ausente, a instalação e a configuração entram no trabalho.
3. Acompanha a requisição da entrada até o domínio, a persistência e a
   resposta. Também localiza onde as regras de negócio já vivem no projeto.
4. Segue as convenções existentes para Form Requests, Policies, Resources e
   Jobs.
5. Define autorização, validação, transação, idempotência e modo de falha,
   principalmente em jobs e webhooks.
6. Escreve o teste focal em Pest ou PHPUnit, implementa a menor fatia que o
   faz passar e depois refatora.
7. Para mudanças de schema, exige a tarefa `[MIGRATION]`, cria o arquivo com
   `php artisan make:migration` e confere com
   `php artisan migrate:status --env=testing`.
8. Inspeciona as queries geradas quando cardinalidade ou latência importam.
9. Executa testes, Larastan ou PHPStan e Pint, quando existem no projeto.
10. Verifica migrations em produção, workers, scheduler e cache de
    configuração.

## Padrões aplicados

- O HTTP roda com `--server=swoole`, a imagem instala a extensão `openswoole`
  e o estado é limpo a cada requisição.
- Singletons e propriedades estáticas não carregam informações de um usuário
  para outro nos workers persistentes.
- Controllers ficam finos, com validação em Form Requests e autorização em
  Policies ou Gates.
- Coleções que acessam relações em loop usam eager loading (`with`,
  `withCount`).
- Tabelas largas usam `select` e varreduras grandes usam `chunkById` ou
  `lazyById`.
- Jobs são idempotentes, com `ShouldBeUnique` ou lock, timeout, tentativas e
  `failed()`.
- Mudanças incompatíveis em tabelas grandes seguem expand, migração dos
  registros e contract.
- Policies e Gates rodam no servidor em cada ação e em cada objeto.
- Mass assignment usa `$fillable` e não recebe `$request->all()` sem
  validação.
- Uma abstração nova exige um segundo consumidor e um benefício verificável.

## Testes sem perder o banco de desenvolvimento

Pest e PHPUnit só rodam quando o `.env.testing` existe, com `APP_ENV=testing`
e um banco diferente do `.env`. Sem essa separação comprovada, o agente não
executa nenhum teste da suíte. Os testes usam `DatabaseTransactions` para
desfazer os próprios registros e factories para preparar o necessário. O agente não
executa `migrate:fresh`, `migrate:refresh`, `migrate:reset`,
`migrate:rollback`, `db:wipe` ou comandos que apagam ou recriam o banco, mesmo
quando um script existente sugere esses comandos.

## Erros que ele evita

- Model que mistura regras de negócio, efeitos externos e apresentação.
- Policy que autoriza qualquer usuário autenticado sem conferir a propriedade
  do objeto.
- Job que repete um efeito não idempotente, como enviar e-mail ou cobrar um
  cartão.
- Remover uma coluna no mesmo deploy do código que ainda a lê.
- Teste que limpa o banco inteiro e alcança a configuração de desenvolvimento.

## Como conferir o resultado

- Os testes cobrem caminho principal, autorização negada, validação, efeitos
  colaterais e falhas de dependências.
- O RED foi confirmado com o `.env.testing` apontando para um banco separado,
  com a implementação feita em seguida.
- A tarefa `[MIGRATION]` registra o arquivo em `database/migrations/`, o
  `php artisan migrate --env=testing` e o `migrate:status` com saída zero.
- O número de queries medido antes e depois da mudança prova a ausência de
  N+1.
- Filas, scheduler, caches e variáveis de ambiente foram conferidos no
  ambiente alvo.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-laravel --agent universal --copy --full-depth
```

## Especialistas relacionados

- [ReUI](reui.md) cuida das interfaces React e Tailwind com Inertia.
- [Gestor de pacotes Laravel](laravel-package-manager.md) instala pacotes
  Composer e mantém as fichas em `docs/packages/`.
- [Modelagem de Dados](data-modeling.md) define entidades e relações.
- [PostgreSQL](postgres.md) cuida de schema, índices e planos de query.
- [Supabase](supabase.md) entra quando o Postgres é gerenciado pelo Supabase.
- [Segurança de Aplicações](application-security.md) revisa autenticação,
  uploads e auditoria.
- [Redis](redis.md) entra quando cache, fila ou lock usam Redis.
- [Docker](docker.md) e [Docker Swarm](docker-swarm.md) empacotam e operam a
  aplicação.

O capítulo [Laravel](../laravel.md) mostra como o Specsfy se aplica a um
projeto Laravel do início ao deploy. Ele reúne setup, especialistas e testes
no mesmo percurso.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-laravel/SKILL.md),
com checklist por superfície no arquivo de referência da mesma pasta.
