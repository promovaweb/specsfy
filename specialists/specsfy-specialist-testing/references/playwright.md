# Playwright e E2E

## Configuração

Use a receita quando o plano pede teste automatizado no navegador e a stack
já tem Playwright, ou quando a spec registra a decisão de instalar o runner
em uma stack compatível. O exemplo pressupõe `@playwright/test` no lockfile
e um script `npm run dev` que serve a aplicação de teste em
`http://localhost:3000`, com a rota `/login` disponível e dados isolados.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const localURL = 'http://localhost:3000';
const baseURL = process.env.BASE_URL || localURL;
const authFile = 'tests/.auth/user.json';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'blob' : 'list',
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npm run dev',
    url: `${localURL}/login`,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts$/ },
    {
      name: 'chromium',
      testIgnore: /auth\.setup\.ts$/,
      use: { ...devices['Desktop Chrome'], storageState: authFile },
      dependencies: ['setup'],
    },
  ],
});
```

- Com `BASE_URL`, a aplicação de teste precisa estar iniciada e acessível no
  endereço indicado. Sem essa variável, `webServer` inicia o servidor e
  aguarda a rota local. Ao reutilizar porta local, confirme qual app está nela.
- Use a conta compartilhada desse exemplo só em testes que podem executar
  simultaneamente, inclusive entre shards, sem interferir na sessão ou nos dados.
- `retain-on-failure` preserva o trace de cada tentativa que falha, incluindo
  a inicial. `on-first-retry` grava a primeira repetição.
- Ignore `/tests/.auth/` no Git. Confira que o estado nunca foi versionado.
- Em uma execução pelo modo `tests`, obtenha `SAFE` para cada comando de teste.

```bash
npx playwright test
npx playwright test --ui
npx playwright test --headed --project=chromium
npx playwright test -g 'finaliza compra'
npx playwright test --reporter=html
npx playwright show-report
```

## Locator

Use os exemplos de ação e asserção dentro de um teste com `page` e `expect`
do Playwright. Ordem de preferência:

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
import { test as base, expect, type Page } from '@playwright/test';

class OrderPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/orders');
  }
}

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
  const { E2E_USER, E2E_PASSWORD } = process.env;
  if (!E2E_USER?.trim() || !E2E_PASSWORD?.trim()) {
    throw new Error('Defina E2E_USER e E2E_PASSWORD para a conta de teste.');
  }

  await page.goto('/login');
  await page.getByLabel('E-mail').fill(E2E_USER);
  await page.getByLabel('Senha').fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Painel' })).toBeVisible();
  await page.context().storageState({ path: 'tests/.auth/user.json' });
});
```

- Projeto `setup` roda antes e grava cookie e storage.
- `storageState` por projeto permite usuário anônimo, cliente e administrador.
- Sessão expira. Setup com dado de teste precisa renovar antes da suíte.
- Credenciais vêm de variáveis de ambiente. Na interface `--ui`, rode o
  projeto `setup` manualmente quando precisar renovar a sessão.
- Caso que altera estado no servidor usa conta por worker ou fixture que
  isola os dados por teste. Ao separar contas por worker, reserve uma conta
  por shard e índice paralelo em um ambiente compartilhado e grave o estado
  em caminho exclusivo. Veja a
  [receita oficial de autenticação por worker](https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker).

## Rede

Dentro de um caso com `page` e `expect`, supondo um formulário que envia o
pedido para `/api/orders` e exibe o ID da resposta:

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
find test-results -name trace.zip -exec npx playwright show-trace {} \;
```

- Trace inclui passos, capturas, DOM e tráfego de rede. Restrinja quem
  pode baixar os artefatos e limite o prazo de retenção.
- `--ui` permite linha do tempo e reexecução de passo.
- `DEBUG=pw:api` mostra chamada interna do Playwright.
- Falha de locator mostra a árvore de acessibilidade; leia antes de trocar o
  seletor.
- Falha intermitente: repita com `--repeat-each=5` e compare trace das execuções.

## CI

Exemplo para GitHub Actions em um repositório privado, com Node 24, lockfile
npm e a configuração acima. Cadastre `E2E_USER` e `E2E_PASSWORD` como
segredos de uma conta de teste. Use o workflow para casos que podem compartilhar
essa conta entre shards. Se estiver executando pelo modo `tests`, aplique o
gate de banco ao comando exato de cada shard antes da execução.

```yaml
name: Playwright
on: workflow_dispatch

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: '24'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --shard=${{ matrix.shard }}/4
        env:
          E2E_USER: ${{ secrets.E2E_USER }}
          E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
      - uses: actions/upload-artifact@v5
        if: ${{ !cancelled() }}
        with:
          name: blob-report-${{ github.run_attempt }}-${{ matrix.shard }}
          path: blob-report/
          if-no-files-found: error
          retention-days: 5

  merge:
    needs: test
    if: ${{ !cancelled() }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: '24'
      - run: npm ci
      - uses: actions/download-artifact@v5
        with:
          pattern: blob-report-${{ github.run_attempt }}-*
          path: all-blob-reports
          merge-multiple: true
      - name: Confere os quatro relatórios
        working-directory: all-blob-reports
        run: |
          shopt -s nullglob
          reports=(report-*.zip)
          test "${#reports[@]}" -eq 4
      - run: npx playwright merge-reports --reporter html ./all-blob-reports
        env:
          PLAYWRIGHT_HTML_OPEN: never
      - uses: actions/upload-artifact@v5
        with:
          name: playwright-report-${{ github.run_attempt }}
          path: playwright-report/
          retention-days: 5
```

- Cada shard publica `blob-report/` mesmo quando há teste vermelho. Se o
  job falhar antes de gerar o blob, a CI sinaliza a ausência e a consolidação
  exige os quatro relatórios da mesma tentativa. Ao repetir uma execução,
  reinicie todos os jobs para gerar o conjunto completo.
- O job de merge usa a mesma versão e o mesmo sistema operacional dos shards.
  O HTML consolidado inclui os anexos, sem precisar publicar um HTML por shard.
- Proteja blobs e HTML como artefatos sensíveis. Eles podem incluir DOM, tráfego
  e anexos de autenticação. Restrinja o acesso ao repositório e use retenção curta.
- Ajuste workers à CPU do runner. Contenção pode causar timeout.

Fontes: [webServer](https://playwright.dev/docs/test-webserver),
[sharding](https://playwright.dev/docs/test-sharding) e
[modos de trace](https://playwright.dev/docs/test-use-options#trace-modes).

## Falhas comuns

| Sintoma | Causa provável | Correção |
| --- | --- | --- |
| `strict mode violation` | Locator casa com mais de um elemento | Escopo com `filter` ou nome exato |
| Elemento visível mas clique falha | Sobreposição, animação ou `pointer-events` | Esperar estado estável ou corrigir a UI |
| Timeout intermitente | Espera fixa ou worker demais | Esperar sinal observável e reduzir worker |
| Sessão perdida | `storageState` expirado | Renovar no setup |
| Passa local e falha no CI | Fuso, locale, rede ou versão de navegador | Fixar `timezoneId`, `locale` e versão |
| Teste lento | Jornada longa repetida | Reaproveitar estado e reduzir escopo |
