# Servidor MCP em Laravel

Use o pacote oficial `laravel/mcp`. A linha 1.x implementa a revisão
`2026-07-28` sem sessões e aceita clientes legados por handshake
`initialize` sem manter sessão de transporte. O exemplo usa Laravel MCP
1.2.1. Confirme PHP, Laravel e pacote no `composer.lock` antes de escolher
as APIs. [Laravel MCP](https://laravel.com/docs/mcp) e
[guia de atualização](https://github.com/laravel/mcp/blob/v1.2.1/UPGRADE.md).

## Instalação e classes

Se a instalação fizer parte da tarefa e o pacote ainda não estiver presente,
execute na aplicação Laravel:

```bash
composer require laravel/mcp
php artisan vendor:publish --tag=ai-routes
php artisan make:mcp-server CatalogServer
php artisan make:mcp-tool ProductCodeTool
```

O publish cria `routes/ai.php`. Preserve o arquivo se já existir. A classe
`Laravel\Mcp\Server` registra `$tools`, `$resources` e `$prompts`.
Gere classes `Laravel\Mcp\Server\Resource` com
`php artisan make:mcp-resource CatalogGuide` para contexto com URI e MIME.
Gere `Laravel\Mcp\Server\Prompt` com
`php artisan make:mcp-prompt DescribeProduct` para modelos de mensagem com
argumentos. Registre só as classes implementadas e autorizadas.

Em `app/Mcp/Servers/CatalogServer.php`:

```php
<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\ProductCodeTool;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('Catalog')]
#[Version('1.0.0')]
class CatalogServer extends Server
{
    protected array $tools = [ProductCodeTool::class];
}
```

Em `app/Mcp/Tools/ProductCodeTool.php`:

```php
<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('product-code')]
#[Description('Normaliza um código de produto para letras maiúsculas.')]
class ProductCodeTool extends Tool
{
    public function schema(JsonSchema $schema): array
    {
        return [
            'code' => $schema->string()->pattern('^[A-Za-z0-9_-]+$')->max(32)->required(),
        ];
    }

    public function outputSchema(JsonSchema $schema): array
    {
        return ['code' => $schema->string()->required()];
    }

    public function handle(Request $request): ResponseFactory
    {
        $data = $request->validate(['code' => 'required|alpha_dash:ascii|max:32']);

        return Response::structured(['code' => strtoupper($data['code'])]);
    }
}
```

Em `routes/ai.php`, registre a rota HTTP. Use este exemplo sem credenciais
somente num ambiente local isolado com o servidor em loopback.

```php
<?php

use App\Mcp\Servers\CatalogServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/catalog', CatalogServer::class);
```

No código real, descreva o mesmo domínio aceito por `schema()` e pela
validação de execução. Injete serviços no construtor e aplique Policies ou
Gates com `$request->user()` antes de ler ou alterar dados. Confira
`php artisan route:list -v --path=mcp`. Nas rotas registradas pelo pacote,
o middleware `ValidateOrigin` verifica a origem. Confira `APP_URL`,
`mcp.allowed_origins` e a política do ingress no ambiente real, sem wildcard.
A implementação 1.2.1 aceita origens de loopback; imponha uma lista mais
estrita no ingress ou middleware quando a política de produção pedir.

## Autenticação

| Cliente | Configuração | Evidência |
| --- | --- | --- |
| Cliente gerenciado que aceita token fornecido | Acrescente `->middleware('auth:sanctum')` ao registro e entregue bearer token com abilities mínimas. | O endpoint rejeita requisição sem token e a política bloqueia operações fora das permissões. |
| Cliente que precisa de descoberta, consentimento e emissão OAuth | Configure Passport e o guard `api`. Registre `Mcp::oauthRoutes()` em `routes/ai.php` e use `->middleware('auth:api')` na rota MCP. | O cliente descobre os metadados RFC 9728, obtém token e chama o recurso autorizado. |

Para Passport novo, siga a instalação oficial (chaves, guard, modelo
autenticável e login). Publique a tela com
`php artisan vendor:publish --tag=mcp-views` e registre
`Passport::authorizationView(fn ($parameters) => view('mcp.authorize', $parameters))`
no provider. O helper publica descoberta e por padrão registra DCR.
Desabilite DCR com `Mcp::oauthRoutes(registration: false)` quando os
clientes forem pré-registrados. Se DCR for necessário por compatibilidade,
aplique rate limiting e restrinja URIs de redirecionamento.

A integração com Passport anuncia `mcp:use` e PKCE S256.
Valide escopos e Policies da aplicação e teste se o emissor vincula o token
ao recurso solicitado. O helper de rotas não garante suporte a CIMD nem
substitui a validação de audiência. Para usar um emissor externo, verifique
issuer, validade, audiência e escopos no middleware e publique o documento
RFC 9728 que aponta para esse emissor. Exija HTTPS nas rotas publicadas.
[Passport](https://laravel.com/docs/passport),
[Sanctum](https://laravel.com/docs/sanctum) e
[autorização MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization).

## Validação

Com a aplicação rodando, abra `php artisan mcp:inspector mcp/catalog` ou
conecte o [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
via Streamable HTTP à URL completa. Liste tools, resources e prompts
registrados e teste com as credenciais do ambiente de teste.

Em um teste Laravel que estende `Tests\TestCase`, use o helper do pacote
para exercitar o handler. Exemplo em Pest:

```php
use App\Mcp\Servers\CatalogServer;
use App\Mcp\Tools\ProductCodeTool;

test('normaliza o código publicado pelo servidor', function () {
    CatalogServer::tool(ProductCodeTool::class, ['code' => 'ab-123'])
        ->assertOk()
        ->assertStructuredContentPath('code', 'AB-123');

    CatalogServer::tool(ProductCodeTool::class, ['code' => ''])
        ->assertHasErrors();
});
```

Use `Server::resource()`, `Server::prompt()` e `Server::actingAs($user)`
na subclasse concreta quando precisar exercitar outras primitivas ou
políticas. Testes HTTP à parte devem verificar guard, `Origin`, descoberta
OAuth, identidade entre tenants e o efeito do proxy nos cabeçalhos. Faça
um POST moderno de `server/discover` com `curl`. Envie `Content-Type:
application/json`, `Accept: application/json, text/event-stream`,
`MCP-Protocol-Version: 2026-07-28`, `Mcp-Method: server/discover` e um
corpo JSON-RPC com a versão e as capacidades em `params._meta`. Confira o resultado, o status
sem token e o 403 para uma origem fora da lista.
[Documentação de testes](https://laravel.com/docs/mcp#testing-servers).
