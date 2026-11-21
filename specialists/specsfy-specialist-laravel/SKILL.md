---
name: specsfy-specialist-laravel
description: "Implementar, revisar e operar aplicações Laravel (modo app: domínio, HTTP, filas, autorização, dados e testes) e integrar pacotes Composer recebidos por URL do GitHub (modo packages: leitura do repositório, instalação autorizada e fichas em docs/packages/). O modo mcp publica servidores MCP por HTTP com laravel/mcp. Use quando o projeto tem `artisan` ou `laravel/framework` e a tarefa toca rotas, controllers, models, policies, form requests, jobs, migrations, Pest/PHPUnit, uma dependência Composer ou routes/ai.php. Não use para PHP sem Laravel, pacotes npm ou publicação no Packagist; para schema, índice e plano de query use `$specsfy-specialist-postgres`; para Postgres gerenciado por Supabase use `$specsfy-specialist-supabase`; para autenticação, upload e dado sensível use `$specsfy-specialist-application-security`; para comparar versões e fontes primárias use `$specsfy-specialist-research`."
---

# Laravel

Oriente a aplicação Laravel pelo contrato real do projeto: versões do
`composer.lock`, convenções já adotadas, boundary onde a regra de negócio vive
e pacotes Composer que a aplicação realmente usa. O modo app cobre o runtime.
O modo packages cobre a integração de dependências e o modo mcp cobre
servidores MCP publicados por HTTP.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Rotas, controllers, models, policies, form requests, jobs, eventos, cache, migrations, Pest/PHPUnit, N+1, fila travada ou autorização quebrada | app | [Padrões e checklist por superfície](references/standards.md) |
| URL do GitHub de um pacote Composer, ficha de uso ausente ou `composer.json`, `composer.lock` e `docs/packages/` fora de sincronia | packages | [Fichas, fontes e comandos Composer](references/packages.md) |
| Servidor MCP por HTTP com `laravel/mcp`, `routes/ai.php` ou `Mcp::web` | mcp | [Servidor MCP em Laravel](references/mcp.md) |

Não use para:

- PHP sem Laravel, pacotes npm ou publicação de uma biblioteca no Packagist. O
  modo packages cobre apenas dependências Composer de uma aplicação Laravel.
- Escolha pura de schema, índice ou plano de query. Use
  `$specsfy-specialist-postgres` e traga o resultado para o Eloquent.
- Postgres gerenciado por Supabase, onde a RLS substitui parte da autorização
  de aplicação. Use `$specsfy-specialist-supabase`.
- Autenticação, mass assignment, upload ou trilha de auditoria como assunto
  principal. Combine com `$specsfy-specialist-application-security`.
- Comparar versões, changelogs e documentação de terceiros. Use
  `$specsfy-specialist-research` e registre a conclusão aqui.

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a linha `| Especialistas |` da tabela de
   metadados, a subseção `#### Especialistas` em `### 8. Plano técnico` e a
   seção que a fase está escrevendo. Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md`. Ao tocar migrations, models ou dado persistido, leia
   também `.specsfy/DATABASE.md`; ao receber pacote Composer, leia
   `.specsfy/PACKAGES.md`.
   - Fonte de entrada por fase: em `specsfy-02-backlog`, sem spec, leia e
     registre no item de `specs/backlog/`; em specify e validate, leia a spec
     aberta (linha `| Especialistas |`, subseção `#### Especialistas`, seção em
     escrita) e escreva nela; só `specsfy-05-tasks` escreve a seção 14, então
     apenas indique o que a tarefa deve prever; em `specsfy-06-implement`, siga
     a tarefa indicada.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-laravel (app|packages|mcp)`. Sem indicação,
   escolha o modo pelo "Quando usar" acima.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. No modo packages, registre a ficha em `docs/packages/` e alinhe
   `.specsfy/PACKAGES.md` antes de fechar a tarefa; no modo app, leve
   migrations e models para as subseções `Migrations` e `Models` da seção 8.
   No modo mcp, registre a rota HTTP, a revisão, o guard e as operações
   expostas.

## Fluxo

1. Ler as instruções locais, `composer.json` e `composer.lock` para confirmar
   versão do framework, do PHP e dos pacotes relevantes (Sanctum, Horizon,
   Octane, Scout) antes de supor comportamento por memória.
2. Identificar se o pedido trata da aplicação em execução, da integração de
   uma dependência ou de um servidor MCP por HTTP.
3. Ler `.specsfy/PACKAGES.md`, `docs/packages/README.md` e as fichas existentes
   antes de propor pacote, comando ou abstração. Considerar o que já está
   instalado.
4. Executar o fluxo do modo escolhido e registrar a consequência operacional
   quando a ação exigir autorização externa.

### Modo app

1. Tratar Laravel Octane com Open Swoole e o pacote `laravel/octane` como
   runtime obrigatório. No setup, registrar ausência como pendência de stack.
   Incluir instalação e configuração como pré-condição do deploy.
   (regra da casa)
2. Mapear a requisição do ponto de entrada até domínio, persistência, efeitos
   assíncronos e resposta, identificando o boundary onde a regra de negócio já
   vive no projeto (Action, Service, Model rico).
3. Localizar convenções irmãs (como o projeto organiza Form Requests, Policies,
   Resources e Jobs) e seguir o padrão existente em vez de introduzir um novo.
4. Definir autorização, validação, transação, idempotência e modo de falha
   antes de escrever código, especialmente para jobs e webhooks.
5. Escrever o teste focal (Pest ou PHPUnit conforme o projeto), implementar a
   menor fatia que o torna verde e então refatorar.
6. Se a tarefa criar ou alterar schema, tabela, coluna, índice, relação ou
   model persistente, exigir a tarefa `[MIGRATION]`, criar o arquivo com
   `php artisan make:migration`, aplicar no banco de teste e conferir com
   `php artisan migrate:status --env=testing`.
7. Inspecionar as queries geradas (`DB::listen`, Telescope, Debugbar ou
   `EXPLAIN` via `$specsfy-specialist-postgres`) quando cardinalidade ou
   latência importarem.
8. Executar testes, análise estática (Larastan/PHPStan) e formatter (Pint)
   disponíveis no projeto antes de considerar a tarefa concluída.
9. Verificar impacto operacional (migration em produção, workers, scheduler,
   cache de config) e registrar a consequência no item correspondente.

### Modo packages

1. Confirmar a raiz do projeto e normalizar a URL HTTPS do GitHub para
   `github.com/<organização>/<repositório>`. Aceitar somente segmentos com
   letras minúsculas, números, ponto, sublinhado ou hífen; recusar URLs que não
   apontem para um repositório GitHub identificável.
2. Consultar no repositório informado o `composer.json`, o README, a
   documentação de configuração, a versão publicada e os exemplos de uso.
   Registrar separadamente o que a fonte declara, o que o projeto local mostra
   e o que ainda não foi confirmado.
3. Identificar o nome Composer, a versão do PHP, as versões do Laravel, os
   requisitos adicionais, o comando de instalação, os arquivos de configuração,
   os comandos de publicação e a forma de teste. Se o repositório não expuser
   um pacote Composer compatível, parar antes de alterar o projeto e explicar a
   lacuna.
4. Quando o pacote não estiver publicado no Packagist, conferir `repositories`
   no manifest e pedir autorização específica antes de acrescentar uma origem
   VCS.
5. Procurar o pacote em `composer.json`, `composer.lock`, `vendor/composer/` e
   no código. Se ele já estiver instalado, reutilizá-lo e não executar outro
   `composer require`.
6. Quando o pacote ainda não existir e a solicitação atual autorizar a
   instalação, executar na raiz do projeto `composer require <vendor/nome>`.
   Usar `--dev` somente quando o próprio projeto tratar o pacote como
   dependência de desenvolvimento. Não executar comandos de pós-instalação
   copiados do README sem conferir finalidade e autorização.
7. Criar ou atualizar `docs/packages/<vendor>-<nome>.md` com nome Composer,
   versão do lockfile, URL GitHub, finalidade, instalação, configuração, uso
   observado no projeto, testes e fontes consultadas. Preservar notas humanas
   fora da seção gerenciada.
8. Criar ou atualizar `docs/packages/README.md` como índice dos pacotes
   Composer declarados pelo projeto, com versão, finalidade curta e link para
   cada ficha. Apontar para `.specsfy/PACKAGES.md` quando a pessoa precisar da
   relação completa, incluindo dependências transitivas.

### Modo mcp

1. Ler [references/mcp.md](references/mcp.md), confirmar `laravel/mcp` no
   `composer.lock` e verificar as revisões usadas pelos clientes.
2. Registrar `Mcp::web` em `routes/ai.php`. Implementar as classes
   Server, Tool, Resource e Prompt que o contrato exige.
3. Configurar Sanctum para bearer tokens fornecidos ao cliente ou Passport
   para descoberta OAuth. Aplicar Policies ou Gates por operação e objeto.
4. Exercitar as primitivas nos testes do pacote e confirmar transporte e
   autenticação pela rota HTTP com o Inspector.

## Padrões

- Executar HTTP com Laravel Octane, Open Swoole e `--server=swoole`. Instalar a
  extensão `openswoole` na imagem e limpar estado por requisição; singletons e
  propriedades estáticas não podem transportar dados entre usuários nos
  workers persistentes. (regra da casa)
- Manter controllers finos: validação em Form Requests, autorização em
  Policies/Gates, regra de negócio no boundary já adotado pelo projeto.
- Tratar Eloquent como acesso a dados: eager load explícito (`with`,
  `withCount`) sempre que uma coleção acessar relação em loop; nunca escrever
  N+1 e justificar "está rápido o bastante por enquanto".
- Selecionar colunas (`select`) quando a tabela for larga ou a listagem não
  precisar do model completo; preferir `chunkById`/`lazyById` para varreduras
  grandes em vez de carregar tudo em memória.
- Projetar jobs idempotentes: `ShouldBeUnique`/lock quando duplicidade for
  possível, timeout e tentativas explícitos, `failed()` tratando o efeito
  colateral de falha definitiva.
- Migrations compatíveis com o volume real: `expand → migrar dado → contract`
  para mudança incompatível em tabela grande; nunca um único `ALTER` bloqueante
  sem medir o lock esperado.
- Nunca confiar em validação do cliente nem autorizar somente na UI:
  Policy/Gate roda no servidor em toda ação e em todo objeto, não só na rota
  de criação.
- Proteger mass assignment com `$fillable` (ou `$guarded` deliberado) e nunca
  passar `$request->all()` direto para `create`/`update` sem validação prévia.
- Não criar abstração, evento, pacote ou camada extra sem um segundo
  consumidor real e benefício verificável: três controllers parecidos não
  justificam um framework interno.
- Exigir `.env.testing` com `APP_ENV=testing` e banco diferente do `.env` antes
  de executar Pest ou PHPUnit. Se essa separação não estiver comprovada, não
  executar nenhum teste. Usar `DatabaseTransactions` para desfazer os registros
  criados pelo próprio caso e factories para preparar somente o necessário.
  (regra da casa)
- Tomar `composer.lock` como fonte da versão instalada; nunca derivar versão da
  tag mais recente do GitHub ou de uma restrição do manifest.
- Nomear a ficha pelo nome Composer normalizado, com `/` convertido em `-`, e
  continuar atualizando a mesma ficha quando a versão mudar.
- Separar dependências de produção e de desenvolvimento no índice e não
  transformar uma dependência transitiva em escolha do projeto.
- Informar em cada ficha o ponto de entrada real usado pela aplicação
  (provider, facade, middleware, command, migration, config ou classe) quando
  esse ponto existir no código local.
- Acompanhar cada comando de instalação, publicação e teste com a razão para
  executá-lo e o arquivo que deve mudar.
- Manter segredos, valores de `.env`, código inteiro de pacote e documentação
  extensa de terceiros fora de `docs/packages/`.

- No modo mcp, declarar schema de entrada e de saída de tools estruturadas.
  Validar os argumentos e reaproveitar serviços e políticas do domínio.

## Antipadrões

- Model "gordo" que mistura regra de negócio, efeito colateral externo e
  apresentação no mesmo método: sintoma de que o boundary do projeto não foi
  seguido.
- Policy que autoriza pela presença do usuário autenticado, sem checar
  ownership do objeto: abre acesso cross-tenant mesmo com `auth` middleware
  presente.
- Job que reprocessa efeito não idempotente (enviar e-mail, cobrar cartão) sem
  chave de deduplicação: reentrega do worker duplica o efeito.
- Migration com `Schema::table` renomeando ou removendo coluna usada em
  produção no mesmo deploy que o código que a lê: quebra a janela de deploy
  misto.
- Teste que depende de limpeza global do banco e pode alcançar a configuração
  de desenvolvimento.
- Instalar antes de ler o `composer.json` e o lockfile: introduz versão
  incompatível ou repete uma dependência já presente.
- Tratar qualquer repositório PHP como pacote Laravel: mistura biblioteca
  genérica, aplicação e extensão sem identificar o contrato Composer.
- Executar `php artisan vendor:publish`, migrations ou scripts do pacote sem
  confirmar o efeito e a autorização: esses comandos podem alterar arquivos,
  banco ou configuração.
- Criar ficha genérica baseada somente no README: a documentação deixa de
  explicar como o pacote aparece no projeto consumidor.

- Configurar `Mcp::local` para um pedido HTTP ou publicar `Mcp::web` sem
  autenticação em produção. O primeiro só atende por stdio e o segundo
  expõe operações a todo chamador que alcance a rota.

## Validação

- Cobrir caminho feliz, autorização negada, validação, efeitos colaterais e
  falhas relevantes (job falho, dependência externa indisponível).
- Rodar a suíte com `DatabaseTransactions` e factories depois de comprovar que
  `.env.testing` aponta para um banco separado. Confirmar RED antes de
  implementar.
- Ignorar `migrate:fresh`, `migrate:refresh`, `migrate:reset`,
  `migrate:rollback`, `db:wipe`, o trait que recria o banco a cada teste fora de banco descartável e
  qualquer comando que apague ou recrie o banco, mesmo quando a tarefa ou um
  script existente sugerir sua execução. (regra da casa)
- Antes de concluir `[MIGRATION]`, confirmar o arquivo em
  `database/migrations/`, executar `php artisan migrate --env=testing` e
  registrar `php artisan migrate:status --env=testing` com saída zero.
- Inspecionar queries geradas quando a tela lista uma coleção com relação:
  contar queries antes/depois (`expectsDatabaseQueryCount`, contador em
  `DB::listen`, Debugbar ou Telescope) para provar ausência de N+1.
- Verificar queues, scheduler, cache de config/rotas e variáveis de ambiente
  no ambiente alvo antes de declarar a tarefa pronta para deploy. Confirmar
  imagem, healthcheck do processo Octane e política de tag quando a aplicação
  roda em contêiner.
- Não declarar "seguro" ou "idempotente" sem teste que exercite o cenário
  adversarial correspondente (replay do job, payload malformado, usuário sem
  permissão).
- Confirmar que URL, nome Composer, versão e requisitos aparecem em fontes
  primárias ou nos arquivos locais correspondentes.
- Executar `composer validate --strict` e conferir `composer show <vendor/nome>`
  quando o pacote estiver instalado.
- Rodar os testes, formatter e análise estática já disponíveis no projeto; não
  introduzir um runner novo só para validar o pacote.
- Conferir que `docs/packages/README.md` lista cada dependência direta do
  `composer.json`, que cada link aponta para uma ficha existente e que a ficha
  informa quando a finalidade ainda não foi confirmada.
- No modo mcp, rodar `php artisan route:list -v --path=mcp` e testar os
  handlers com Pest ou PHPUnit. Usar `mcp:inspector` no endpoint HTTP para
  conferir credenciais, saída estruturada e acesso negado.
- Verificar links, comandos, nomes de configuração e exemplos contra a versão
  instalada. Não declarar compatibilidade, segurança ou funcionamento sem uma
  fonte ou teste correspondente.

## Skills relacionadas

- `$specsfy-specialist-mcp` para contrato Streamable HTTP, revisão do
  protocolo, descoberta OAuth e interoperabilidade entre stacks.
- `$specsfy-specialist-interface` para telas e fluxos em projetos Laravel com
  Inertia, incluindo a decisão de composição antes do componente React.
- `$specsfy-specialist-modeling` para entidades, relações e ciclo de vida antes
  de criar migrations ou models.
- `$specsfy-specialist-postgres` para modelagem de schema, índice e plano de
  query por trás do Eloquent.
- `$specsfy-specialist-supabase` quando o Postgres do projeto for gerenciado
  por Supabase.
- `$specsfy-specialist-application-security` para autenticação, mass
  assignment, upload e trilha de auditoria.
- `$specsfy-specialist-redis` quando cache, fila ou lock usar Redis como
  driver.
- `$specsfy-specialist-observability` para instrumentar filas, workers e
  sinais do modo app.
- `$specsfy-specialist-mysql` quando migration, Eloquent ou transação rodar em
  MySQL: o dialeto e o plano de query ficam lá, a aplicação continua aqui.
- `$specsfy-specialist-testing` quando a tarefa for escrever ou executar o
  teste Pest que comprova o comportamento implementado aqui.
- `$specsfy-specialist-research` para comparar documentação, versões e fontes
  primárias quando o repositório não esclarecer uma dúvida.

Leia [references/standards.md](references/standards.md) para o checklist por
superfície (HTTP, domínio, Eloquent, filas, dados, segurança, operação),
comandos de diagnóstico e fontes oficiais da versão instalada. Leia
[references/packages.md](references/packages.md) para o contrato das fichas, a
ordem das fontes e os comandos Composer aplicáveis.
