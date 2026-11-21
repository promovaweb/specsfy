# Pest e Laravel

## Estrutura

Confirme o runner no `composer.lock` e a configuração no `phpunit.xml`.
Os exemplos usam Pest com Laravel. Em uma suíte PHPUnit sem Pest, preserve
`PHPUnit\Framework\TestCase` e a configuração existente. Os casos Laravel
pressupõem as rotas, os modelos e as factories do domínio do projeto.

Em Laravel, exija `.env.testing` com `APP_ENV=testing` e banco diferente do
configurado no `.env`. Confira a conexão efetiva, inclusive variáveis de
ambiente, `phpunit.xml` e cache de configuração. Obtenha `SAFE` para cada
comando focal, suíte ou regressão, mesmo para Unit. Siga
[a proteção do banco](standards.md#banco-de-teste).

Migre o schema do banco de teste antes dos testes que usam transação. Para o
preparo em Laravel, confira a conexão efetiva em `testing`, valide o comando
`php artisan migrate --env=testing` no gate e execute somente com `SAFE`.
No fluxo Specsfy, use `DatabaseTransactions` e factories do caso. O método
veda `RefreshDatabase`, `DatabaseMigrations` e equivalentes destrutivos.

```php
<?php
// tests/Pest.php

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(DatabaseTransactions::class)
    ->in('Feature');
```

- `tests/Unit` usa a base padrão do runner e roda sem subir Laravel.
- `tests/Feature` usa a base de aplicação e cobre rota, controller, policy
  e job. Se só parte de Feature usa banco, aplique a trait nesses arquivos.
- Garanta que `phpunit.xml` mantenha `APP_ENV=testing` e que seus valores
  de teste para banco, fila e cache não redirecionem ao desenvolvimento.

## Primeiro teste

Em `tests/Feature/OrderValidationTest.php`, supondo uma API que valida
`customerId` na criação do pedido:

```php
it('rejeita pedido sem cliente', function () {
    $response = $this->postJson('/api/orders', [
        'totalCents' => 15990,
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('customerId');
});
```

Após obter `SAFE` para o comando focal:

```bash
./vendor/bin/pest --filter='rejeita pedido sem cliente'
```

- `it` e `test` são equivalentes. Em ambos, escreva um nome que descreva a regra.
- `describe` agrupa casos do mesmo assunto.
- `expect($valor)->toBe()` para asserção de valor; `$response->assert*()` para
  resposta HTTP.
- `$this->get`, `$this->post`, `$this->postJson` e `$this->actingAs($user)`
  montam a requisição com sessão e autenticação reais do framework.

## Banco

```php
use App\Models\Customer;
use App\Models\Order;

it('cria fatura com total do pedido', function () {
    $customer = Customer::factory()->create();
    $order = Order::factory()->for($customer)->create(['total_cents' => 15990]);

    $this->postJson("/api/orders/{$order->id}/invoice")->assertCreated();

    $this->assertDatabaseHas('invoices', [
        'order_id' => $order->id,
        'total_cents' => 15990,
    ]);
});
```

- Factory é a fonte de massa. Estado nomeado (`->pending()`, `->paid()`) deixa o
  caso legível.
- `->for($customer)` cria a relação. `->count(3)` cria vários quando o caso
  precisa.
- `assertDatabaseHas` prova escrita; `assertDatabaseMissing` prova ausência.
- `assertDatabaseCount` compara quantidade quando a regra é sobre volume.
- Teste que depende de registro criado por outro teste é dependente de ordem.
- A transação desfaz escritas da conexão coberta pela trait. Confira conexões
  adicionais e processos externos quando fizerem parte do teste.

## Dataset

```php
use App\Models\Customer;

dataset('status inválido', [
    'vazio' => [''],
    'desconhecido' => ['unknown'],
    'nulo' => [null],
]);

it('rejeita status inválido', function (?string $status) {
    $customer = Customer::factory()->create();

    $this->postJson('/api/orders', [
        'customerId' => $customer->id,
        'totalCents' => 15990,
        'status' => $status,
    ])->assertUnprocessable()->assertJsonValidationErrors('status');
})->with('status inválido');
```

- Dataset nomeado no `Pest.php` reutiliza a matriz entre arquivos.
- `with([...])` inline serve variação local do arquivo.
- Cada linha aparece como caso separado no relatório, com o nome da chave.
- Dataset não substitui teste de integração quando a variação muda caminho de
  código, e não substitui asserção de efeito.

## Fake

```php
use App\Jobs\SendReceipt;
use App\Models\Order;
use Illuminate\Support\Facades\Queue;

it('enfileira envio de email', function () {
    Queue::fake();
    $order = Order::factory()->create();

    $this->postJson("/api/orders/{$order->id}/pay")->assertOk();

    Queue::assertPushed(SendReceipt::class);
});
```

- `Event::fake`, `Queue::fake`, `Bus::fake`, `Mail::fake`,
  `Notification::fake`, `Storage::fake` e `Http::fake` cortam efeito externo.
- Para testar a recusa de um pagamento, configure o ambiente de teste do
  cliente para `https://payments.example.test`. O exemplo pressupõe que
  a rota envia o total do pedido no corpo da requisição ao provedor.

```php
use App\Models\Order;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

it('retorna a recusa do pagamento', function () {
    $order = Order::factory()->create(['total_cents' => 15990]);
    $url = 'https://payments.example.test/v1/charges';

    Http::preventStrayRequests();
    Http::fake([
        $url => Http::response(['error' => 'card_declined'], 402),
    ]);

    $this->postJson("/api/orders/{$order->id}/pay")->assertStatus(402);

    Http::assertSent(fn (Request $request) =>
        $request->method() === 'POST'
        && $request->url() === $url
        && $request['amount'] === 15990
    );
});
```

- Uma URL fora dos padrões do fake pode ir para a rede por padrão.
  `Http::preventStrayRequests()` faz esse desvio falhar no teste.
- O fake verifica como o cliente envia a requisição e reage à resposta
  simulada. Quando o AC exige compatibilidade com o provedor, execute a
  integração real em sandbox declarada.

## Autenticação e autorização

```php
use App\Models\Order;
use App\Models\User;

it('impede cliente de ver pedido de outro cliente', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $order = Order::factory()->for($owner)->create();

    $this->actingAs($other)
        ->getJson("/api/orders/{$order->id}")
        ->assertForbidden();
});
```

- `actingAs` usa o guard padrão. Guard diferente recebe o segundo argumento.
- Teste de policy precisa de usuário com papel diferente. Teste que usa o mesmo
  usuário não prova autorização.
- Sanctum, Passport e sessão por cookie têm setup próprio; `actingAs` não cobre
  todos.

## Unidade

```php
use App\Domain\Orders\TotalCalculator;

it('calcula total com desconto', function () {
    $calculator = new TotalCalculator();

    expect($calculator->withDiscount(10000, 10))->toBe(9000);
});
```

- Unidade não sobe framework nem banco. Rápida e específica.
- Dependência externa entra por construtor, com dublê simples.
- `Mockery` e `createMock` servem quando a dependência é interface grande.
- Não teste detalhe privado nem método protegido.

## Arquitetura

```php
arch('controllers não usam model direto')
    ->expect('App\Http\Controllers')
    ->not->toUse('App\Models');
```

- Teste de arquitetura protege regra estrutural que revisão manual esquece.
- Use com parcimônia: regra demais vira obstáculo sem valor.
- `arch()` não substitui revisão de código.

## Execução

Obtenha `SAFE` para cada linha que for executar:

```bash
php artisan test
./vendor/bin/pest --coverage
./vendor/bin/pest --bail
```

Para execução paralela no Laravel 13, confirme `brianium/paratest` compatível
no lockfile. Pest 5.3.7 já o declara como dependência. Em uma suíte PHPUnit
pura, siga o comando de ParaTest configurado pelo projeto.

Para o exemplo abaixo, confira o destino efetivo de cada processo antes do
`SAFE`. Com uma conexão padrão em banco persistente, Laravel deriva os sufixos
`_test_1` a `_test_4` do nome do banco de teste e pode criar e migrar esses
bancos ao usar `DatabaseTransactions`. Confira isolamento, permissões e
conexões adicionais. Se algum banco por processo não estiver confirmado,
use a execução sequencial após obter `SAFE` para ela.

```bash
php artisan test --parallel --processes=4
```

- `--coverage` exige driver de cobertura, como PCOV ou Xdebug habilitado
  para cobertura.
- `--bail` interrompe na primeira falha para investigação local.
- `--filter` aceita o nome do teste ou um trecho. `--group` seleciona um
  grupo declarado na suíte.

## Falhas comuns

| Sintoma | Causa provável | Verificação |
| --- | --- | --- |
| Teste passa isolado e falha na suíte | Dado compartilhado ou estado estático | Rode com `--order-by=random` |
| `SQLSTATE` de conexão | `.env.testing` ausente ou banco errado | `php artisan about --env=testing` |
| Massa duplicada | Factory sem sequência e unique colidindo | Use `->unique()` ou sequence |
| Fake não intercepta | Serviço resolvido fora do container | Resolva pelo container no código |
| Tempo alto por teste | Framework subindo em unidade | Mova caso para `Unit` |
| Cobertura não sobe | Código fora do caminho testado | Meça por arquivo alterado |
