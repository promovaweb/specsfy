# Testes

O especialista Testes orienta o agente na ferramenta que executa o teste. O modo
**Pest** atende PHP e Laravel, o modo **Playwright** atende navegador de ponta a
ponta e o modo **Vitest** atende TypeScript e componente React.

A fronteira importa: o método Specsfy decide o que testar, em que nível e com
qual evidência de RED. Este especialista decide como escrever, isolar e executar
o teste na ferramenta escolhida.

## Quando usar

- Você vai escrever teste de feature ou unit em Laravel com Pest, dataset,
  factory, banco de teste ou fake de fila, evento e HTTP.
- A suíte PHP passa isolada e falha em paralelo, ou o banco de teste está mal
  configurado.
- Você vai escrever E2E de navegador, escolher locator, montar fixture,
  reaproveitar sessão autenticada, capturar trace ou rodar em CI.
- Um teste Playwright está intermitente, com timeout ou `strict mode violation`.
- Você vai escrever unit ou teste de componente em TypeScript e React, simular
  rede, controlar timer ou medir cobertura.
- Você precisa confirmar qual runner instalado atende ao teste definido no plano.

O agente confirma versão do runner, configuração, banco de teste e comando
declarado no projeto antes de escrever o primeiro teste. Não introduz um segundo
runner sem decisão registrada na spec.

## No Specsfy

O agente usa a spec indicada pela fase que pediu o teste e recebe o passo,
a tarefa, o critério de aceite (AC), o nível e o runner. O lockfile ajuda a
confirmar a ferramenta instalada. Um `composer.json` pode pertencer a um
projeto PHPUnit sem Laravel. Um projeto Laravel também pode usar Playwright.

No passo `prepare`, o agente devolve o ID da tarefa, o comando, o arquivo, o
nome do teste, o marcador `SPECSFY:` e a falha que demonstra o comportamento
ausente. O modo `tests` registra esse RED e conclui o checklist da tarefa
com o Plan Gate ainda pendente. Em `cycle`, o agente devolve a evidência das
execuções focais e de regressão. Em `verify`, devolve o resultado e as lacunas
da conferência de rastreabilidade e aceite. A fase responsável registra a saída.

Antes de cada teste focal, suíte ou regressão, o comando exato precisa obter
`SAFE` no [gate de banco](../cli-reference.md#specsfy-gate),
mesmo para casos que parecem independentes de banco.

## Fluxo

### Modo pest

Confirme o runner PHP e siga a [receita Pest](#pest).

### Modo playwright

Confirme que o plano prevê navegador automatizado e siga a
[receita Playwright](#playwright).

### Modo vitest

Confirme o ambiente de execução e siga a [receita Vitest](#vitest).

## Pest

Para testar comportamento da aplicação Laravel, use
`testing/pest + laravel/app`. O primeiro modo implementa o teste com o runner
instalado. O segundo trata o comportamento da aplicação, o domínio e as
migrations do framework. Para schema SQL, índices ou planos de execução,
encaminhe à skill da engine em uso.

Em Laravel, use `.env.testing` com `APP_ENV=testing` e banco separado do
desenvolvimento. Confirme que a configuração efetiva aponta para esse banco.
O método veda `RefreshDatabase`, `DatabaseMigrations`, `migrate:fresh` e
equivalentes destrutivos no fluxo de testes. Use `DatabaseTransactions` com
schema já migrado e factories que criem só os dados do caso.

- `tests/Unit` roda sem subir a aplicação Laravel. Em `tests/Feature`, a
  configuração do Pest vincula os casos à base `Tests\TestCase`.
- Dataset nomeado cobre variações de entrada e identifica cada caso no relatório.
- Com fake HTTP parcial, use `Http::preventStrayRequests()`, cubra URLs
  específicas e confira a requisição enviada. Integração que precisa provar
  compatibilidade com o provedor usa uma sandbox declarada.
- Para rodar em paralelo, confira a versão de ParaTest no lockfile e o banco
  de cada processo antes de obter `SAFE` para o comando.

Veja [configuração e exemplos de Pest e Laravel](../../../specialists/specsfy-specialist-testing/references/pest.md).

## Playwright

Use quando o plano prevê teste automatizado de navegador e o Playwright já está
confirmado na stack ou há decisão explícita de instalar o runner em uma stack
compatível. A verificação manual de teclado cabe a `interface/accessibility`.

- Use `baseURL` e configure `webServer` para iniciar o app de teste ou declare
  o endereço de um ambiente já iniciado.
- Localize elementos por papel, rótulo ou texto e espere uma condição observável.
- Valide as credenciais no projeto de setup e mantenha o `storageState` fora
  do Git. Compartilhe sessão só em testes que podem rodar simultaneamente com
  a mesma conta sem interferência. Para mutações, isole os dados com fixtures
  ou use uma conta por worker, inclusive entre shards.
- Use `trace: 'retain-on-failure'` para guardar o trace da falha original,
  mesmo com retries. `on-first-retry` grava a primeira repetição.
- Publique um blob por shard e reúna todos com `merge-reports`. Restrinja
  acesso e retenção dos artefatos, que podem conter DOM e tráfego.

Veja [configuração, autenticação e CI de Playwright](../../../specialists/specsfy-specialist-testing/references/playwright.md).

## Vitest

- Use `node` para funções puras e `jsdom` compatível com o Node para
  componentes. Preserve a transformação JSX do projeto. Se usar
  `vitest.config.ts` separado, use `mergeConfig` para aproveitar plugins e
  aliases do Vite. Use `projects` no Vitest 5.x para separar ambientes.
- Em `tests/setup.ts`, importe `@testing-library/jest-dom/vitest` e registre
  `afterEach(cleanup)` com globals desativados. Importe as APIs de teste
  quando usar esse modo.
- `clearMocks` limpa chamadas. `mockReset` também reinicia implementações.
  `restoreMocks` restaura spies de `vi.spyOn`. Automocks e `vi.fn()`
  exigem a limpeza ou o reset adequado ao caso.
- Aguarde cada interação de usuário. Com timer falso, configure
  `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`.
- Na cobertura com V8, use `@vitest/coverage-v8` na versão do Vitest e
  confira os arquivos e caminhos de decisão alterados.

Veja [configuração e exemplos de Vitest](../../../specialists/specsfy-specialist-testing/references/vitest.md).

## Padrões

- Dê ao caso um nome que explicite a regra e o resultado esperado.
- Use dados próprios do teste e preserve a fronteira que o AC precisa provar.
- Use o mesmo comando e a mesma versão do runner no terminal e no CI.

## Antipadrões

- `sleep` e `waitForTimeout` para sincronização.
- Snapshot de página inteira como prova de comportamento.
- Mock do módulo sob teste ou da fronteira que o cenário precisa provar.
- E2E para cada variação de unidade.
- Teste que depende de dado criado por outro caso.
- Banco de teste apontando para desenvolvimento.
- Retry escondendo corrida ou sessão real versionada no Git.
- Cobertura perseguida com teste sem asserção.

## Validação

- Saída do caso focal com nome, resultado e marcador de rastreabilidade.
- Falha de comportamento observada quando o método pede RED.
- Suíte relacionada verde e cobertura avaliada nos arquivos alterados.
- Execução repetida com o mesmo resultado ou instabilidade registrada.
- `SAFE` para cada comando, com destinos por processo conferidos em paralelo.
- Trace da falha original acessível no relatório consolidado de CI.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-testing --agent universal --copy --full-depth
```

## Skills relacionadas

- [Laravel](laravel.md) define aplicação, migrations do framework e domínio.
- [PostgreSQL](postgres.md) e [MySQL](mysql.md) tratam schema SQL, índices e
  planos de execução conforme a engine.
- [React](react.md) define componente, hook e estado.
- [Next.js](nextjs.md) define rota, cache e fronteira server/client.
- [TypeScript](typescript.md) define tipo e configuração do projeto.
- [Interface](interface.md) trata acessibilidade, incluindo teclado manual.
- [Delivery](delivery.md) monta pipeline e promoção.
- [Debugging](debugging.md) investiga a causa quando a falha não é do teste.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-testing/SKILL.md),
com o índice e as regras comuns em
[standards.md](../../../specialists/specsfy-specialist-testing/references/standards.md),
o PHP em
[pest.md](../../../specialists/specsfy-specialist-testing/references/pest.md),
o navegador em
[playwright.md](../../../specialists/specsfy-specialist-testing/references/playwright.md)
e o TypeScript em
[vitest.md](../../../specialists/specsfy-specialist-testing/references/vitest.md).
