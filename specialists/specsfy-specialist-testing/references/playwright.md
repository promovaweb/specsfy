# Playwright e E2E

## Configuração

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['blob'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});
```

- `baseURL` evita URL absoluta espalhada no teste e permite rodar contra staging.
- `trace: 'on-first-retry'` guarda evidência sem pesar toda execução que passa.
- `retries` em CI e zero local: retry em máquina local esconde corrida.
- Projeto `setup` gera `storageState` uma vez; os testes de jornada reaproveitam.
- `tests/.auth/` entra no `.gitignore`. Sessão real não vai para o repositório.

```bash
npx playwright test
npx playwright test --ui
npx playwright test --headed --project=chromium
npx playwright test -g "finaliza compra"
npx playwright show-report
```

## Locator

Ordem de preferência:

| Locator | Uso | Robustez |
| --- | --- | --- |
| `getByRole('button', { name: 'Finalizar' })` | Elemento com papel e nome acessível | Alta, muda só se o comportamento muda |
| `getByLabel('E-mail')` | Campo de formulário com rótulo | Alta |
| `getByText('Pedido criado')` | Texto visível e único | Média, sensível a tradução |
| `getByPlaceholder(...)` | Campo sem rótulo | Média |
| `getByTestId('order-row')` | Texto dinâmico ou repetido | Boa quando o test id é estável |
| `locator('div.css-abc')` | Estrutura e classe | Baixa, quebra em refatoração visual |

```ts
await page.getByRole('link', { name: 'Pedidos' }).click();
await page.getByLabel('E-mail').fill('ana@example.com');
await page.getByLabel('Senha').fill('senha-de-teste');
await page.getByRole('button', { name: 'Entrar' }).click();
await expect(page.getByRole('heading', { name: 'Painel' })).toBeVisible();
```

- Locator resolve no momento da ação. `page.$` e `elementHandle` não têm espera
  automática.
- Filtre dentro de um escopo: `page.getByRole('row').filter({ hasText: '42' })`.
- `nth()` serve quando a ordem é parte do comportamento, não como contorno.
- `strict` é o padrão: locator que casa com dois elementos falha. Isso é bom e
  aponta ambiguidade real.

## Asserção

- Use asserção de espera do Playwright: `toBeVisible`, `toHaveText`,
  `toHaveURL`, `toHaveCount`, `toBeEnabled`, `toContainText`.
- `expect(locator).toHaveText()` espera até o timeout configurado e repete. Não
  precisa de espera manual.
- Não use `expect(await locator.textContent()).toBe(...)` para estado que ainda
  vai mudar. A espera automática se perde.
- `waitForTimeout` é proibido como sincronização. Se a tela demora, espere o
  sinal que representa "pronto", como resposta de rede ou elemento final.

```ts
await expect(page.getByRole('status')).toHaveText('Pedido criado');
await expect(page).toHaveURL(/\/orders\/\d+$/);
await expect(page.getByRole('row')).toHaveCount(3);
```

## Fixture

```ts
import { test as base, expect } from '@playwright/test';

type Fixtures = { orderPage: OrderPage };

export const test = base.extend<Fixtures>({
  orderPage: async ({ page }, use) => {
    const orderPage = new OrderPage(page);
    await orderPage.goto();
    await use(orderPage);
  },
});

export { expect };
```

- Fixture prepara estado e devolve controle com `use()`. Código depois de `use()`
  é limpeza.
- Fixture com `{ scope: 'worker' }` compartilha por worker, útil para dado caro.
- Page Object concentra locator e ação de uma tela. Não esconda asserção dentro
  dele.
- Fixture não substitui teste explícito: o caso ainda diz o que espera.

## Autenticação

```ts
// tests/e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('autentica usuário de teste', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(process.env.E2E_USER!);
  await page.getByLabel('Senha').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Painel' })).toBeVisible();
  await page.context().storageState({ path: 'tests/.auth/user.json' });
});
```

- Projeto `setup` roda antes e grava cookie e storage.
- `storageState` por projeto permite usuário anônimo, cliente e administrador.
- Sessão expira. Setup com dado de teste precisa renovar antes da suíte.
- Credencial de teste vem de variável de ambiente, nunca do arquivo versionado.

## Rede

```ts
await page.route('**/api/orders', async route => {
  await route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({ id: 42 }),
  });
});

await page.goto('/orders/new');
await page.getByRole('button', { name: 'Salvar' }).click();
await expect(page.getByText('Pedido 42 criado')).toBeVisible();
```

- `page.route` simula resposta determinística para erro, lentidão e borda.
- Interceptar tudo esconde integração real. Use em caso específico.
- `route.continue()` segue para a rede; `route.abort()` simula falha.
- Teste de integração real usa ambiente com backend e dado descartável, não mock.

## Trace e diagnóstico

```bash
npx playwright test --trace on
npx playwright show-trace test-results/<teste>/trace.zip
```

- Trace mostra passo, captura de tela, DOM e rede de cada ação.
- `--ui` permite linha do tempo e reexecução de passo.
- `DEBUG=pw:api` mostra chamada interna do Playwright.
- Falha de locator mostra a árvore de acessibilidade; leia antes de trocar o
  seletor.
- Falha intermitente: repita com `--repeat-each=5` e compare trace das execuções.

## CI

```yaml
- run: npm ci
- run: npx playwright install --with-deps
- run: npx playwright test --shard=${{ matrix.shard }}/4
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: report-${{ matrix.shard }}
    path: |
      playwright-report/
      test-results/
```

- `install --with-deps` instala navegador e biblioteca de sistema. Sem isso, o
  job falha por dependência ausente.
- Shard divide por teste, não por arquivo manual. Relatório blob é mesclado
  depois com `npx playwright merge-reports`.
- Artefato em `if: always()` garante trace da execução que falhou.
- Worker conta pela CPU do runner. Worker demais gera timeout por contenção.
- Servidor de aplicação sobe no CI com `webServer` no config ou passo explícito, e
  o teste espera a porta responder.

## Falhas comuns

| Sintoma | Causa provável | Correção |
| --- | --- | --- |
| `strict mode violation` | Locator casa com mais de um elemento | Escopo com `filter` ou nome exato |
| Elemento visível mas clique falha | Sobreposição, animação ou `pointer-events` | Esperar estado estável ou corrigir a UI |
| Timeout intermitente | Espera fixa ou worker demais | Esperar sinal observável e reduzir worker |
| Sessão perdida | `storageState` expirado | Renovar no setup |
| Passa local e falha no CI | Fuso, locale, rede ou versão de navegador | Fixar `timezoneId`, `locale` e versão |
| Teste lento | Jornada longa repetida | Reaproveitar estado e reduzir escopo |
