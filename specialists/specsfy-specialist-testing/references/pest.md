# Pest e Laravel

## Estrutura

```
tests/
  Pest.php
  TestCase.php
  Unit/
  Feature/
phpunit.xml
```

- `tests/Pest.php` liga o `TestCase` e os helpers por diretório:

```php
uses(Tests\TestCase::class, Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');

uses(Tests\TestCase::class)->in('Unit');
```

- Ajuste a trait ao padrão do projeto. Quando a regra proíbe `RefreshDatabase`,
  use `DatabaseTransactions` e factory que cria somente o registro do caso.
- `phpunit.xml` define banco, fila, cache e driver de teste. Deixar a variável
  para o ambiente é como o teste toca banco real.
- `tests/Unit` roda sem subir framework; `tests/Feature` sobe aplicação e cobre
  rota, controller, policy e job.

```bash
./vendor/bin/pest --filter=rejeita_pedido_sem_cliente
./vendor/bin/pest tests/Feature/InvoiceTest.php
./vendor/bin/pest --group=slow
php artisan test --parallel
```

## Primeiro teste

```php
it('rejeita pedido sem cliente', function () {
    $response = $this->postJson('/api/orders', [
        'totalCents' => 15990,
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('customerId');
});
```

- `it` e `test` são equivalentes. O nome descreve a regra.
- `describe` agrupa casos do mesmo assunto.
- `expect($valor)->toBe()` para asserção de valor; `$response->assert*()` para
  resposta HTTP.
- `$this->get`, `$this->post`, `$this->postJson` e `$this->actingAs($user)`
  montam a requisição com sessão e autenticação reais do framework.

## Banco

```php
it('cria fatura com total do pedido', function () {
    $customer = Customer::factory()->create();
    $order = Order::factory()->for($customer)->create(['total_cents' => 15990]);

    $this->postJson("/api/orders/{$order->id}/invoice")->assertCreated();

    $this->assertDatabaseHas('invoice', [
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
- Nunca rode `migrate:fresh` contra banco compartilhado. O gate de banco do
  método existe para impedir isso.

## Dataset

```php
dataset('status inválido', [
    'vazio' => [''],
    'desconhecido' => ['unknown'],
    'nulo' => [null],
]);

it('rejeita status inválido', function (?string $status) {
    $this->postJson('/api/orders', ['status' => $status])
        ->assertStatus(422);
})->with('status inválido');
```

- Dataset nomeado no `Pest.php` reutiliza a matriz entre arquivos.
- `with([...])` inline serve variação local do arquivo.
- Cada linha aparece como caso separado no relatório, com o nome da chave.
- Dataset não substitui teste de integração quando a variação muda caminho de
  código, e não substitui asserção de efeito.

## Fake

```php
it('enfileira envio de email', function () {
    Queue::fake();
    $order = Order::factory()->create();

    $this->postJson("/api/orders/{$order->id}/pay")->assertOk();

    Queue::assertPushed(SendReceipt::class);
});
```

- `Event::fake`, `Queue::fake`, `Bus::fake`, `Mail::fake`,
  `Notification::fake`, `Storage::fake` e `Http::fake` cortam efeito externo.
- `Http::fake` com resposta específica testa o caminho de erro do cliente HTTP:

```php
Http::fake([
    'api.stripe.com/*' => Http::response(['error' => 'card_declined'], 402),
]);

$this->postJson('/api/orders/1/pay')->assertStatus(402);
```

- `Http::assertSent` confere a requisição enviada. Útil quando o contrato com o
  provedor é o comportamento testado.
- Fake demais esconde integração quebrada. O contrato real é provado no teste de
  ponta a ponta previsto pelo método.

## Autenticação e autorização

```php
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

```bash
php artisan test
php artisan test --parallel
php artisan test --parallel --processes=4
./vendor/bin/pest --coverage --min=80
./vendor/bin/pest --bail
```

- `--parallel` usa banco por processo; confirme que a configuração cria o banco de
  cada worker.
- `--coverage` exige driver de cobertura. Cobertura baixa em arquivo alterado é
  sinal, não meta isolada.
- `--bail` para investigação local; CI roda tudo e reporta.
- `--filter` aceita nome do teste ou trecho. `--group` usa anotação de grupo.

## Falhas comuns

| Sintoma | Causa provável | Verificação |
| --- | --- | --- |
| Teste passa isolado e falha na suíte | Dado compartilhado ou estado estático | Rode com `--order-by=random` |
| `SQLSTATE` de conexão | `.env.testing` ausente ou banco errado | `php artisan about --env=testing` |
| Massa duplicada | Factory sem sequência e unique colidindo | Use `->unique()` ou sequence |
| Fake não intercepta | Serviço resolvido fora do container | Resolva pelo container no código |
| Tempo alto por teste | Framework subindo em unidade | Mova caso para `Unit` |
| Cobertura não sobe | Código fora do caminho testado | Meça por arquivo alterado |
