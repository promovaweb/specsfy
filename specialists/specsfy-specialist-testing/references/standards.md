# Padrões e referências de teste

Reúne as regras que valem para Pest, Playwright e Vitest, o índice das
referências por modo e as fontes oficiais.

Revisado em 2026-11-20 contra: Pest 5 (documentação oficial, que registra o Pest
4 como versão que introduziu browser testing), PHPUnit, Playwright (requisito de
Node 22, 24 ou 26), Vitest 5.1.1 (que exige Vite 6.4 ou superior e Node 22.12 ou
superior), Testing Library e MSW.

## Fronteira com o método

| Pergunta | Responsável |
| --- | --- |
| Qual comportamento testar | `$specsfy-06-implement` no modo `tests`, a partir do Gherkin |
| Qual nível usar, unit, integração ou ponta a ponta | Método, com `test-levels.md` |
| Como provar RED e registrar evidência | Método, na tabela `Evidência RED-GREEN-REFACTOR` |
| Qual ferramenta e qual API usar | Este especialista |
| Como isolar banco, rede, relógio e autenticação | Este especialista |
| Como diagnosticar falha do teste | Este especialista, com `$specsfy-specialist-debugging` quando a causa for código |

O especialista não decide escopo, não cria critério de aceite e não marca gate.

## Versão antes de comando

```bash
./vendor/bin/pest --version
npx playwright --version
npx vitest --version
node --version
```

- Projeto PHP com Laravel usa Pest sobre PHPUnit. Os dois compartilham
  `phpunit.xml`.
- Projeto Node usa o runner já declarado. Introduzir Vitest onde existe outro
  runner é decisão da spec, não conveniência local.
- Versão de runner presa no lockfile. Atualização de major muda API de mock,
  configuração e relatório.
- Node fora da faixa suportada produz falha de instalação de navegador ou de
  transformação de módulo que parece bug de teste.

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
- Determinismo: sem dependência de relógio real, de rede real, de ordem de
  execução e de dado deixado por execução anterior.
- Isolamento de dado: transação, banco descartável ou factory com limpeza. Teste
  que depende de massa prévia é dependente de ordem.
- Espera por condição, nunca por tempo fixo.
- Efeito externo é substituído por fake no teste de unidade e de integração, e
  exercitado de verdade só no teste de ponta a ponta previsto.
- Falha precisa de diagnóstico: valor recebido, valor esperado, arquivo e linha.
- Suíte tem tempo declarado. Unidade em milissegundos, integração em segundos,
  ponta a ponta em minutos.
- Comando de teste é versionado no `package.json` ou `composer.json` e é o mesmo
  no terminal e no CI.
- Cobertura é sinal por arquivo alterado e por caminho de decisão. Percentual
  global sem contexto não mede qualidade.
- Teste instável tem dono e prazo. Retry não é correção.

## Escolher o nível

| Nível | Ferramenta típica | O que cobre | Custo |
| --- | --- | --- | --- |
| Unidade | Pest unit, Vitest | Regra pura, cálculo, transformação | Baixo |
| Integração de aplicação | Pest feature, Vitest com MSW | Rota, controller, repositório, componente com dependência | Médio |
| Componente | Vitest com Testing Library | Interação e estado visível do componente | Médio |
| Ponta a ponta | Playwright | Jornada no navegador, autenticação, navegação | Alto |
| Contrato externo | Pest com `Http::fake`, Vitest com MSW | Forma de requisição e resposta esperada | Baixo |

- Prefira o nível mais baixo que ainda prova a regra. E2E cobre jornada crítica,
  não cada variação.
- Regra que depende de navegador real, cookie e redirecionamento só o E2E prova.
- Regra de banco com transação e constraint só o teste de integração prova.
- Componente com foco, teclado e estado assíncrono pede teste de componente com
  consulta por papel.

## Banco de teste

- Banco separado, com nome explícito de ambiente de teste.
- Em Laravel, `.env.testing` com `APP_ENV=testing` e conexão diferente da de
  desenvolvimento.
- Antes de executar suíte que toca banco, rode a proteção do método:

```bash
specsfy gate database --project <raiz> --command "<comando-de-teste>"
```

- `PENDING` significa ambiente de teste mal configurado: corrija e repita.
  `IGNORED` significa comando destrutivo: não execute nem adapte.
- Prefira transação por teste e factory que cria só o registro do caso.
- `migrate:fresh`, `db:wipe` e `prisma migrate reset` não entram em fluxo de
  teste contra banco compartilhado.

## Falha e diagnóstico

- Rode o caso isolado antes da suíte. Falha que só aparece na suíte indica
  interação entre testes.
- Leia a primeira falha, não a cascata.
- Falha intermitente pede repetição controlada para medir a taxa:

```bash
npx playwright test --repeat-each=5
npx vitest run --retry.count=2
for i in 1 2 3; do ./vendor/bin/pest; done
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
