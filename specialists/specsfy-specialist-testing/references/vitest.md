# Vitest e componente React

## Configuração

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
    restoreMocks: true,
  },
});
```

- Vitest lê `vite.config.*` por padrão. Configuração separada serve quando o teste
  precisa de ambiente diferente do build.
- `environment: 'jsdom'` ou `'happy-dom'` para componente. Função pura não precisa
  de DOM e roda mais rápido em `node`.
- `restoreMocks: true` evita mock vazando entre testes.
- `setupFiles` registra matcher de DOM e limpeza global.
- `projects` (ou workspace) separa unidade, componente e integração com
  configuração própria.

```bash
npx vitest
npx vitest run
npx vitest run src/order.test.ts
npx vitest run -t "rejeita pedido sem cliente"
npx vitest run --coverage
```

## Unidade

```ts
import { describe, expect, it } from 'vitest';
import { withDiscount } from './total';

describe('withDiscount', () => {
  it('aplica desconto percentual sobre o total', () => {
    expect(withDiscount(10000, 10)).toBe(9000);
  });

  it('recusa desconto acima de 100', () => {
    expect(() => withDiscount(10000, 120)).toThrow('desconto inválido');
  });
});
```

- `it` descreve a regra, `describe` agrupa o assunto.
- `toBe` compara valor primitivo; `toEqual` compara estrutura; `toStrictEqual`
  compara tipo e campo indefinido.
- `toThrow` verifica exceção. Teste que só espera "não lançar" não prova regra.
- `test.each` cobre matriz de entrada sem repetir corpo:

```ts
it.each([
  [0, 0],
  [100, 10],
  [-1, null],
])('calcula desconto de %i', (total, expected) => {
  expect(withDiscount(total, 10)).toBe(expected);
});
```

## Componente

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrderForm } from './OrderForm';

describe('OrderForm', () => {
  it('envia o total informado', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<OrderForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Total'), '159,90');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).toHaveBeenCalledWith({ totalCents: 15990 });
  });
});
```

- Consulte por papel e rótulo: `getByRole`, `getByLabelText`, `getByText`.
  `getByTestId` só quando não existe acesso semântico.
- `userEvent.setup()` antes da interação. `fireEvent` fica para evento que o
  usuário não consegue produzir.
- `await` em interação assíncrona. Sem `await`, a asserção roda antes do efeito.
- `findBy*` espera elemento aparecer; `queryBy*` verifica ausência sem lançar.
- `screen.debug()` imprime a árvore quando o seletor não encontra.
- Matcher de DOM (`toBeInTheDocument`, `toHaveValue`) vem de
  `@testing-library/jest-dom`, registrado no `setupFiles`.
- `cleanup` é automático no Testing Library moderno; chamada manual só quando o
  setup desliga a limpeza.

## Mock

```ts
import { vi } from 'vitest';

vi.mock('./mailer', () => ({
  sendReceipt: vi.fn().mockResolvedValue({ id: 'msg_1' }),
}));
```

- `vi.mock` é içado e substitui módulo inteiro. Prefira dependência injetada
  quando o desenho permite.
- `vi.fn()` cria dublê; `mockResolvedValue` e `mockRejectedValue` cobrem
  caminho assíncrono.
- `vi.spyOn(objeto, 'método')` observa sem substituir o módulo.
- Mock do próprio módulo sob teste invalida o teste: ele prova que o mock foi
  chamado.
- `vi.clearAllMocks`, `clearMocks` e `restoreMocks` definem o que acontece antes
  de cada teste. Escolha um e registre na configuração.

## Tempo

```ts
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('expira sessão depois de 30 minutos', () => {
  const session = createSession();
  vi.advanceTimersByTime(30 * 60 * 1000);
  expect(session.isExpired()).toBe(true);
});
```

- `useFakeTimers` controla `setTimeout`, `Date` e `performance` conforme a versão.
- `advanceTimersByTime` avança de forma síncrona; `runAllTimersAsync` quando a
  continuação é Promise.
- Timer falso e `userEvent` exigem configuração de avanço. Interação de usuário
  com timer falso sem ajuste trava o teste.
- Teste que depende de relógio real falha em fuso e em horário de verão.

## Rede

```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/orders', () => HttpResponse.json([{ id: 42 }]))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

- MSW intercepta no nível de rede, sem substituir o cliente HTTP do código.
- `onUnhandledRequest: 'error'` revela requisição não prevista, que passaria
  silenciosamente.
- `server.use()` sobrescreve handler no caso específico e volta ao padrão no
  `resetHandlers`.
- Teste de contrato confere método, caminho, cabeçalho e corpo enviados.
- `vi.mock` de módulo é mais simples para função pura de transformação; MSW é mais
  fiel para cliente HTTP.

## Cobertura e projeto

```bash
npx vitest run --coverage
npx vitest run --coverage.include 'src/order/**'
npx vitest run --shard=1/3
```

- Cobertura por arquivo alterado é mais útil que total do projeto.
- Linha coberta sem asserção não é teste.
- `--shard` divide por arquivo. Bom para suíte grande em CI.
- `projects` separa `node` e `jsdom`, cada um com include próprio.
- `browser mode` roda em navegador real quando o comportamento depende de layout,
  foco ou API de browser que `jsdom` não implementa.

## Falhas comuns

| Sintoma | Causa provável | Correção |
| --- | --- | --- |
| `not wrapped in act` | Atualização de estado fora de ato | Use `findBy*` ou `waitFor` |
| Elemento não encontrado | Consulta por classe ou texto quebrado | Consulte por papel e rótulo |
| Teste passa sozinho e falha na suíte | Mock ou estado global vazando | `restoreMocks` e limpeza |
| `Cannot find module` em CSS ou asset | Transformação não configurada | Ajuste `test.alias` ou `deps` |
| timer falso trava interação | `userEvent` sem avanço de timer | Configure `advanceTimers` |
| Cobertura baixa em componente | Caminho de erro não testado | Cubra erro e vazio |
| Falso positivo de acessibilidade | `jsdom` não calcula layout | Rode browser mode ou teste E2E |
