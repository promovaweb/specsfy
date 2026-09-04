# Usar Specsfy com Laravel

`$specsfy-specialist-laravel` acrescenta verificações próprias do Laravel ao
fluxo do Specsfy. A spec continua governando a mudança, e o especialista segue
as convenções e a versão comprovadas pelo projeto.

## Confirmar a detecção

O catálogo detecta Laravel por `artisan`, `composer.json` ou pela dependência
`laravel/framework`. Confirme a versão e as extensões em `composer.json` e
`composer.lock`. Uma API só deve orientar a implementação quando existir na
versão usada pela aplicação.

## Instalação

Na raiz do projeto, `--detected` instala o framework e o especialista quando o
catálogo reconhece Laravel:

```bash
specsfy install --project . --detected
```

Para revisar a recomendação sem instalar arquivos, use `skills detect`. A saída
deve incluir `specsfy-specialist-laravel` quando `artisan` ou a dependência do
framework for encontrada:

```bash
specsfy skills detect --project .
```

Quando o nome já estiver confirmado, `npx skills add` instala somente o
especialista Laravel e registra os arquivos gerenciados:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-laravel --agent universal --copy --full-depth
```

Para adotar um pacote Laravel a partir de um repositório GitHub, instale também
o gestor de pacotes:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-laravel-package-manager --agent universal --copy --full-depth
```

Depois, peça ao agente:

```text
Use $specsfy-specialist-laravel-package-manager com https://github.com/organizacao/pacote.
Leia a documentação, confira se o pacote já está instalado e, com autorização,
instale-o e documente seu uso.
```

O especialista lê `composer.json`, `composer.lock`, `.specsfy/PACKAGES.md` e
as fichas atuais antes de executar Composer. Para cada dependência direta, ele
mantém uma ficha em `docs/packages/<vendor>-<nome>.md` e atualiza
`docs/packages/README.md` com versão, finalidade e links. Pacotes já instalados
são reaproveitados; dependências transitivas continuam relacionadas em
`.specsfy/PACKAGES.md`.

## Aplicar na spec

1. Capture ou promova a ideia pelo [primeiro projeto](getting-started.md).
2. Peça ao agente para usar `$specsfy-specialist-laravel` na fatia ativa.
3. Confirme a versão, extensões, convenções locais e o caminho da requisição.
4. Na definição e no plano, registre autorização e validação. Quando a mudança
   alcançar persistência ou execução assíncrona, inclua transações,
   idempotência, filas, falhas e uma tarefa `[CODE] [MIGRATION]` separada.
   Essa tarefa aponta para o arquivo em `database/migrations/` e inclui os
   comandos de aplicação e consulta do estado.
5. Derive testes para caminho feliz, autorização, validação, efeitos e falhas.
6. Antes de qualquer teste, crie `.env.testing` com `APP_ENV=testing` e um
   `DB_DATABASE` ou `DB_URL` explícito, diferente do destino usado pelo `.env`.
7. Implemente controllers finos e mantenha as regras na camada já adotada pelo
   projeto. Inspecione as consultas e o N+1 quando a quantidade de relações
   puder aumentar o tempo da resposta.
8. Confira o ambiente e o comando antes de executar os checks:

```bash
node .agents/skills/specsfy-setup/scripts/check_database_safety.mjs \
  --project . --command "php artisan test"
```

Somente a saída `SAFE` permite continuar. `PENDING` encerra a etapa até a
configuração ser corrigida. `IGNORED` descarta o comando, sem pedir autorização
para forçá-lo.

Quando houver uma migration planejada, aplique-a no banco de teste protegido e
confirme o resultado antes de concluir a tarefa:

```bash
php artisan migrate --env=testing
php artisan migrate:status --env=testing
```

O registro da tarefa precisa conter o caminho exato da migration e a saída com
exit code zero dos dois comandos. Criar um model, alterar uma consulta ou fazer
os testes passarem não substitui essa conferência.

1. Em Laravel com Pest, o CLI oferece:

```bash
specsfy test --project .
```

O CLI detecta `artisan` e `pestphp/pest`, chama `php artisan test` e preserva o
exit code. Ele não recebe uma string arbitrária de shell. A verificação anterior
continua obrigatória antes desse comando.

## O que o especialista acrescenta

- contratos HTTP, Form Requests, policies, resources e bindings.
- Eloquent, eager loading, casts e transações conscientes.
- jobs idempotentes, tentativas, backoff e tratamento de falha.
- migrations compatíveis com volume, locks, rollback e deploy misto.
- verificação de queues, scheduler, cache, configuração e ambiente.
- leitura, instalação autorizada e documentação de pacotes Composer recebidos
  por URL GitHub.

## Resultado esperado

A spec continua sendo a fonte normativa, enquanto os testes e a implementação
consideram as falhas possíveis do Laravel observado no projeto e na versão
instalada.

## Limites

- não aplique a skill a PHP sem Laravel.
- não presuma APIs pela versão mais recente da documentação.
- não execute migration, deploy ou comando operacional fora da autorização
  registrada na tarefa e do ambiente de teste protegido.
- não execute teste sem `.env.testing` separado do banco de desenvolvimento.
- não use `RefreshDatabase`, `DatabaseMigrations`, `migrate:fresh`,
  `migrate:refresh`, `migrate:reset`, `migrate:rollback` ou `db:wipe`; use
  `DatabaseTransactions`, factories e limpeza limitada aos registros criados
  pelo próprio caso.
- não confie apenas na validação ou autorização da interface.

Não use esse especialista para PHP sem Laravel nem para fixar uma versão que o
projeto não comprova. O código, `composer.json`, `composer.lock`, os testes e a
configuração local permanecem como evidência do estado da aplicação.
