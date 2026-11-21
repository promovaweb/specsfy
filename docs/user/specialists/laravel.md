# Laravel

O especialista Laravel orienta o agente em aplicações Laravel, do roteamento
aos testes, e na entrada de pacotes Composer no projeto. Ele segue as
convenções que o projeto já adota, roda o HTTP com Laravel Octane e Open Swoole,
protege o banco de desenvolvimento durante a suíte e mantém uma ficha de uso
para cada dependência em `docs/packages/`.

## Quando usar

- O repositório tem `artisan` e `laravel/framework` no `composer.json`.
- A tarefa altera rotas, controllers, models, policies, form requests, jobs,
  eventos, cache, configuração, migrations ou testes.
- Você quer revisar um pull request Laravel ou investigar consultas N+1, filas
  travadas, autorização quebrada ou uma migration arriscada.
- Você recebeu a URL GitHub de um pacote para uma aplicação Laravel, um pacote
  instalado ainda não tem ficha de uso ou o `composer.json`, o `composer.lock`
  e o `docs/packages/` estão fora de sincronia.
- Você precisa expor operações da aplicação a um cliente MCP por HTTP.

A escolha de schema, índice e plano de query fica com o especialista
[PostgreSQL](postgres.md). O resultado dessa análise volta para o Eloquent na
implementação. PHP sem Laravel, pacotes npm e publicação de bibliotecas no
Packagist ficam fora deste especialista.

## Como ele trabalha

1. Lê as instruções locais, o `composer.json` e o `composer.lock` para confirmar
   as versões do framework, do PHP e de pacotes como Sanctum, Horizon, Octane e
   Scout.
2. Identifica se a tarefa envolve a aplicação, um pacote Composer ou um
   servidor MCP por HTTP.
3. Confere os pacotes instalados nos manifests e em `.specsfy/PACKAGES.md`
   quando disponível. No modo app, consulta `docs/packages/` se o diretório
   existir ou o pedido envolver um pacote.
4. Registra a consequência operacional quando a ação exigir autorização
   externa.

## Aplicação Laravel

1. Trata Laravel Octane com Open Swoole como runtime obrigatório. O setup
   registra a ausência como pendência de stack. Instalar e configurar o
   runtime é pré-condição do deploy.
2. Acompanha a requisição da entrada até o domínio, a persistência, a resposta e
   os efeitos assíncronos. Também localiza onde as regras de negócio já vivem no
   projeto.
3. Segue as convenções existentes para Form Requests, Policies, Resources e
   Jobs.
4. Define autorização, validação, transação, idempotência e modo de falha,
   principalmente em jobs e webhooks.
5. Escreve o teste focal em Pest ou PHPUnit, implementa a menor fatia que o faz
   passar e depois refatora.
6. Para mudanças de schema, exige a tarefa `[MIGRATION]`, cria o arquivo com
   `php artisan make:migration` e confere com
   `php artisan migrate:status --env=testing`.
7. Inspeciona as queries geradas quando cardinalidade ou latência importam.
8. Executa testes, Larastan ou PHPStan e Pint, quando existem no projeto.
9. Verifica migrations em produção, workers, scheduler e cache de
   configuração.

## Pacotes Composer

1. Confirma a raiz do projeto e normaliza a URL para
   `github.com/<organização>/<repositório>`, recusando endereços que não apontam
   para um repositório identificável.
2. Consulta no repositório o `composer.json`, o README, a configuração, a versão
   publicada e os exemplos. Separa o que a fonte declara, o que o projeto mostra
   e o que ainda não foi confirmado.
3. Identifica o nome Composer, as versões de PHP e Laravel, os requisitos, os
   comandos de instalação e publicação e a forma de teste.
4. Interrompe o trabalho e explica a lacuna quando o repositório não expõe um
   pacote Composer compatível. Fora do Packagist, uma origem VCS exige a sua
   autorização específica.
5. Procura o pacote no manifest, no lockfile, em `vendor/composer/` e no código.
   Quando o pacote já está instalado, ele é reaproveitado sem outro
   `composer require`.
6. Com a instalação autorizada, executa `composer require <vendor/nome>` na
   raiz. O `--dev` aparece apenas quando o projeto trata o pacote como
   dependência de desenvolvimento. Comandos de pós-instalação copiados do README
   não rodam sem conferência de finalidade e autorização.
7. Cria ou atualiza a ficha `docs/packages/<vendor>-<nome>.md`, preservando notas
   escritas à mão fora da seção gerenciada.
8. Mantém o `docs/packages/README.md` como índice dos pacotes diretos, com
   versão, finalidade e link para cada ficha.

## Servidor MCP

No modo `mcp`, o agente usa o pacote oficial `laravel/mcp` para expor
operações da aplicação a clientes de IA. Ele registra a URL por
`Mcp::web` em `routes/ai.php`, declara os dados que cada ferramenta recebe
e devolve e aplica as políticas do Laravel antes de acessar os dados.

Para clientes que já recebem um token, ele pode usar Sanctum. Para clientes
que precisam descobrir o servidor de autorização e obter um token via
OAuth, usa o fluxo documentado com Passport. O agente confirma a execução
dos handlers com Pest ou PHPUnit e verifica a rota real com
`php artisan mcp:inspector mcp/catalog`, usando o caminho configurado
no seu projeto.

Veja o [exemplo técnico](../../../specialists/specsfy-specialist-laravel/references/mcp.md)
e o guia [MCP](mcp.md) para o contrato do protocolo.

## O que fica em `docs/packages/`

- `README.md` é o índice dos pacotes Composer diretos, com produção e
  desenvolvimento em listas separadas.
- `<vendor>-<nome>.md` explica nome Composer, versão do lockfile, URL GitHub,
  finalidade, instalação, configuração, uso local, testes e fontes consultadas.
- `.specsfy/PACKAGES.md` continua como a relação completa, incluindo as
  dependências transitivas.

## Testes sem perder o banco de desenvolvimento

Pest e PHPUnit só rodam quando o `.env.testing` existe, com `APP_ENV=testing` e
um banco diferente do `.env`. Sem essa separação comprovada, o agente não executa
nenhum teste da suíte. Os testes usam `DatabaseTransactions` para desfazer os
próprios registros e factories para preparar o necessário. O agente não executa
`migrate:fresh`, `migrate:refresh`, `migrate:reset`, `migrate:rollback`,
`db:wipe` ou comandos que apagam ou recriam o banco, mesmo quando um script
existente sugere esses comandos.

## Padrões aplicados

- O HTTP roda com `--server=swoole`, a imagem instala a extensão `openswoole` e o
  estado é limpo a cada requisição.
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
- Mudanças incompatíveis em tabelas grandes seguem expand, migração dos registros
  e contract.
- Policies e Gates rodam no servidor em cada ação e em cada objeto.
- Mass assignment usa `$fillable` e não recebe `$request->all()` sem validação.
- Uma abstração nova exige um segundo consumidor e um benefício verificável.
- A versão instalada de um pacote vem do `composer.lock`. Tags do GitHub e
  restrições do manifest não definem a versão.
- O nome da ficha converte a `/` do nome Composer em `-` e a mesma ficha
  acompanha as mudanças de versão.
- Cada ficha aponta o ponto de entrada usado pela aplicação, como provider,
  facade, middleware, command ou config.
- Comandos de instalação, publicação e teste aparecem com o motivo e o arquivo
  que deve mudar.
- Segredos, valores de `.env` e trechos extensos de terceiros ficam fora de
  `docs/packages/`.

## Erros que ele evita

- Model que mistura regras de negócio, efeitos externos e apresentação.
- Policy que autoriza qualquer usuário autenticado sem conferir a propriedade do
  objeto.
- Job que repete um efeito não idempotente, como enviar e-mail ou cobrar um
  cartão.
- Remover uma coluna no mesmo deploy do código que ainda a lê.
- Teste que limpa o banco inteiro e alcança a configuração de desenvolvimento.
- Instalar sem ler o manifest e o lockfile, com versão incompatível ou
  dependência repetida.
- Tratar qualquer repositório PHP como pacote Laravel.
- Executar `php artisan vendor:publish`, migrations ou scripts do pacote sem
  confirmar o efeito e a autorização.
- Criar uma ficha genérica copiada do README.

## Como conferir o resultado

- Os testes cobrem caminho principal, autorização negada, validação, efeitos
  colaterais e falhas de dependências.
- O RED foi confirmado com o `.env.testing` apontando para um banco separado,
  com a implementação feita em seguida.
- A tarefa `[MIGRATION]` registra o arquivo em `database/migrations/`, o
  `php artisan migrate --env=testing` e o `migrate:status` com saída zero.
- O número de queries medido antes e depois da mudança prova a ausência de N+1.
- Filas, scheduler, caches e variáveis de ambiente foram conferidos no ambiente
  alvo.
- URL, nome Composer, versão e requisitos aparecem em fontes primárias ou nos
  arquivos locais.
- `composer validate --strict` passa e `composer show <vendor/nome>` confirma o
  pacote instalado.
- Os testes, o formatter e a análise estática do projeto rodam sem um runner
  novo.
- O índice lista cada dependência direta e cada link aponta para uma ficha
  existente.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-laravel --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Interface](interface.md) decide telas e fluxos em projetos com Inertia antes
  do componente React.
- [Modelagem](modeling.md) define entidades, relações e ciclo de vida.
- [PostgreSQL](postgres.md) cuida de schema, índices e planos de query.
- [Supabase](supabase.md) entra quando o Postgres é gerenciado pelo Supabase.
- [Segurança de Aplicações](application-security.md) revisa autenticação,
  uploads e auditoria.
- [Redis](redis.md) entra quando cache, fila ou lock usam Redis.
- [Docker](docker.md) empacota e opera a aplicação em produção.
- [Observabilidade](observability.md) instrumenta filas, workers e sinais da
  aplicação.
- [Pesquisa](research.md) compara documentação e versões quando o repositório
  deixa dúvidas.

O capítulo [Laravel](../laravel.md) mostra como o Specsfy se aplica a um projeto
Laravel do início ao deploy. Ele reúne setup, especialistas e testes no mesmo
percurso.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-laravel/SKILL.md),
com o checklist por superfície em `references/standards.md` e o contrato das
fichas em `references/packages.md`.
