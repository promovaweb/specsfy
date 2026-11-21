# Padrões e referências de teste

Reúne as regras que valem para Pest, Playwright e Vitest, o índice das
referências por modo e as fontes oficiais.

Em 20/11/2026, as versões consultadas foram Pest 5.3.7, Playwright 1.65.1
e Vitest 5.1.1. Use os manifests e lockfiles do projeto para confirmar as
versões efetivas antes de aplicar uma receita.

## Fronteira com o método

| Decisão ou entrega | Responsável |
| --- | --- |
| Passo, tarefa, AC, nível e runner | Fase chamadora, conforme Gherkin, `test-levels.md` e stack confirmada |
| API do runner, isolamento e diagnóstico | Especialista de testes |
| Registro da saída, da evidência e dos gates | Fase responsável no método |

Em `prepare`, a tarefa `[TEST] [TDD]` está aberta e o Plan Gate fica
`Pending`. Devolva ID da tarefa, comando, nome do caso, caminho do arquivo,
marcador `SPECSFY:` e saída da falha de comportamento. O modo `tests`
registra o RED e conclui o checklist antes do retorno a `$specsfy-05-tasks`.
Em `cycle`, devolva a evidência focal e de regressão solicitada. Em `verify`,
devolva resultados e lacunas da conferência de rastreabilidade e aceite.

## Versão antes de comando

Escolha o binário correspondente à suíte existente. Rode somente as linhas
cujos binários constam das dependências instaladas do projeto:

```bash
./vendor/bin/pest --version
./vendor/bin/phpunit --version
./node_modules/.bin/playwright --version
./node_modules/.bin/vitest --version
node --version
```

- `composer.json` por si só indica um projeto PHP, sem identificar Laravel
  ou o runner. Confirme dependências, scripts e configuração. Laravel pode
  combinar Pest ou PHPUnit com Playwright para E2E.
- Vitest 5.1.1 declara Node `^22.12.0 || ^24.0.0 || >=26.0.0`. Confira
  também as faixas de Vite, jsdom e dos plugins usados no projeto.
- O pacote `@playwright/test` 1.65.1 declara Node `>=20` no manifesto.
  A documentação de instalação lista as versões mais recentes das linhas
  22.x, 24.x e 26.x como suportadas. Use essa matriz para local e CI.

## Índice dos modos

| Modo | Abre | Conteúdo |
| --- | --- | --- |
| pest | [pest.md](pest.md) | Pest e PHPUnit em Laravel, feature, unit, dataset, factory, banco, fake e parallel |
| playwright | [playwright.md](playwright.md) | E2E, locator, fixture, auth state, trace, retry, shard e CI |
| vitest | [vitest.md](vitest.md) | unit e componente em TypeScript e React, mock, timer, MSW e cobertura |

## Regras comuns

- Teste prova comportamento observável. Se o teste só passa a existir porque o
  método interno mudou, ele está acoplado demais.
- Um teste tem um motivo claro para falhar. Nome e asserção dizem qual regra
  quebrou.
- Controle relógio, ordem de execução e dados deixados por execuções anteriores.
- Isolamento de dado: transação, banco descartável ou factory com limpeza. Teste
  que depende de massa prévia é dependente de ordem.
- Espera por condição, nunca por tempo fixo.
- Use fake para efeitos fora da fronteira sob teste. Quando a integração ou
  o contrato com o provedor for o objeto do AC, mantenha a fronteira real
  em ambiente isolado ou sandbox declarada.
- Falha precisa de diagnóstico: valor recebido, valor esperado, arquivo e linha.
- Suíte tem tempo declarado. Unidade em milissegundos, integração em segundos,
  ponta a ponta em minutos.
- Comando de teste é versionado no `package.json` ou `composer.json` e é o mesmo
  no terminal e no CI.
- Cobertura é sinal por arquivo alterado e por caminho de decisão. Percentual
  global sem contexto não mede qualidade.
- Teste instável tem dono e prazo. Retry não é correção.

## Implementar o nível recebido

| Nível | Ferramenta típica | O que cobre | Custo |
| --- | --- | --- | --- |
| Unidade | Pest unit, Vitest | Regra pura, cálculo, transformação | Baixo |
| Integração de aplicação | Pest feature, Vitest com MSW | Rota, controller, repositório, componente com dependência | Médio |
| Componente | Vitest com Testing Library | Interação e estado visível do componente | Médio |
| Ponta a ponta | Playwright | Jornada no navegador, autenticação, navegação | Alto |
| Contrato com provedor | Runner indicado e sandbox declarada | Compatibilidade com a contraparte real | Variável |
| Comportamento do cliente | Pest com `Http::fake`, Vitest com MSW | Requisição emitida e reação a resposta simulada | Baixo |

- Preserve o nível informado pelo método. Se ele não cobrir a fronteira do AC,
  devolva a divergência ao chamador.
- Regra que depende de navegador real, cookie e redirecionamento só o E2E prova.
- Regra de banco com transação e constraint só o teste de integração prova.
- Componente com interações e estado assíncrono pode usar consulta por papel.
  Foco ou layout que dependa da implementação do navegador requer navegador real.

## Banco de teste

- Banco separado, com nome explícito de ambiente de teste.
- Em Laravel, `.env.testing` com `APP_ENV=testing` e conexão diferente da de
  desenvolvimento.
- Antes de cada comando focal, suíte ou regressão, obtenha `SAFE` para o
  comando exato e seu ambiente, inclusive para testes que parecem independentes
  de banco. Em paralelo, confira também o destino de cada processo.

```bash
# Exemplo na raiz de um projeto Pest Laravel, com o ambiente de teste configurado.
specsfy gate database --project "$PWD" --command "./vendor/bin/pest --filter='rejeita pedido sem cliente'"
```

- Com `PENDING`, mantenha a execução pendente e corrija o ambiente.
  Com `IGNORED`, descarte o comando destrutivo.
- Em Laravel, use `DatabaseTransactions` com schema migrado e factories
  restritas aos dados do caso. O método veda `RefreshDatabase`,
  `DatabaseMigrations` e equivalentes destrutivos no fluxo de testes,
  incluindo `migrate:fresh` e `db:wipe`.

## Falha e diagnóstico

- Rode o caso isolado antes da suíte. Falha que só aparece na suíte indica
  interação entre testes.
- Leia a primeira falha, não a cascata.
- Após obter `SAFE` para o comando escolhido, repita o caso para medir a
  taxa de falhas intermitentes:

```bash
npx playwright test --repeat-each=5
npx vitest run --retry.count=2
./vendor/bin/pest --filter='rejeita pedido sem cliente'
# Repita o comando focal com o mesmo ambiente previamente verificado.
```

- Repetir confirma instabilidade, não corrige. A correção elimina a corrida ou a
  dependência de estado.
- Falha de snapshot pede revisão da diferença, nunca atualização cega com `-u`.
- Falha de timeout em E2E pede trace e captura de rede, não aumento de timeout.

## Fontes oficiais

- Pest, primeiros testes: https://pestphp.com/docs/writing-tests
- Pest, expectations: https://pestphp.com/docs/expectations
- Pest, datasets: https://pestphp.com/docs/datasets
- Pest, browser testing: https://pestphp.com/docs/browser-testing
- PHPUnit: https://docs.phpunit.de/
- Laravel, testes: https://laravel.com/docs/testing
- Laravel, banco de teste: https://laravel.com/docs/database-testing
- Playwright, instalação: https://playwright.dev/docs/intro
- Playwright, locators: https://playwright.dev/docs/locators
- Playwright, fixtures: https://playwright.dev/docs/test-fixtures
- Playwright, autenticação: https://playwright.dev/docs/auth
- Playwright, trace viewer: https://playwright.dev/docs/trace-viewer
- Playwright, CI: https://playwright.dev/docs/ci
- Vitest, guia: https://vitest.dev/guide/
- Vitest, CLI: https://vitest.dev/guide/cli
- Vitest, cobertura: https://vitest.dev/guide/coverage
- Vitest, browser mode: https://vitest.dev/guide/browser/
- Testing Library, React: https://testing-library.com/docs/react-testing-library/intro/
- Testing Library, user event: https://testing-library.com/docs/user-event/intro
- MSW: https://mswjs.io/docs/
- Pest, configuração: https://pestphp.com/docs/configuring-tests
- Pest 5.3.7, dependências: https://github.com/pestphp/pest/blob/v5.3.7/composer.json
- Laravel, requisições HTTP sem fake: https://laravel.com/docs/13.x/http-client#preventing-stray-requests
- Playwright 1.65.1, manifesto: https://registry.npmjs.org/@playwright%2Ftest/1.65.1
- Vitest 5.1.1, manifesto: https://registry.npmjs.org/vitest/5.1.1
