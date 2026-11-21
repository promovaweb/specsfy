# Vitest e componente React

## Configuração

Para reproduzir os exemplos em React, confirme no lockfile `react`, `react-dom`
e as dependências de desenvolvimento `vite`, `@vitejs/plugin-react`, `vitest`,
`jsdom`, `@testing-library/react`, `@testing-library/dom`,
`@testing-library/jest-dom`, `@testing-library/user-event` e `msw` (receita de
rede). Use uma versão de `jsdom` compatível com o Node do projeto. Instale
`@vitest/coverage-v8` na mesma versão do Vitest para a receita de cobertura.

Se o projeto já tem Vite, adicione o bloco `test` à configuração existente.
Este arquivo mostra uma configuração única com a transformação JSX do plugin
React:

```ts
// vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: false,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
    restoreMocks: true,
  },
});
```

```ts
// tests/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);
```

Se precisar de um arquivo separado, `vitest.config.ts` tem precedência.
Use `mergeConfig` para manter plugins e aliases. Para um `vite.config.ts`
que exporta um objeto, a combinação fica assim:

```ts
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(viteConfig, defineConfig({
  test: { testTimeout: 10_000 },
}));
```

Os arquivos do exemplo usam ESM. Se o TypeScript verificar a configuração,
habilite `allowImportingTsExtensions` em um tsconfig com `noEmit`. Para um
Vite config que exporta função, avalie essa função com o ambiente recebido
pelo callback de `defineConfig` antes de chamar `mergeConfig`.
Use `node` para função pura, `jsdom` para os exemplos de componente e
`projects` em Vitest 5.x quando a suíte precisar de configurações por grupo.
Com `globals: false`, importe os hooks e APIs de teste em cada arquivo.

Depois de obter `SAFE` para cada execução no modo `tests`:

```bash
npx vitest run
npx vitest run src/total.test.ts
npx vitest run -t 'aplica desconto percentual sobre o total'
npx vitest run --coverage
```

## Unidade

O exemplo em `src/total.test.ts` usa a função `withDiscount` do projeto,
que aplica desconto percentual em centavos e rejeita taxa fora de 0 a 100.

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
- `it.each` cobre matriz de entrada sem repetir corpo. No mesmo arquivo:

```ts
it.each([
  [0, 0],
  [100, 90],
  [10000, 9000],
])('calcula o total com desconto para %i centavos', (total, expected) => {
  expect(withDiscount(total, 10)).toBe(expected);
});
```

## Componente

O exemplo em `src/OrderForm.test.tsx` usa um formulário com o campo `Total`
e o botão `Salvar`. O formulário chama `onSubmit` com o total em centavos.
Declare `jsdom` no início do arquivo.

```tsx
// @vitest-environment jsdom
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
- Com globals desativados, registre `afterEach(cleanup)` como no setup acima.

## Mock

```ts
import { vi } from 'vitest';

vi.mock('./mailer', () => ({
  sendReceipt: vi.fn().mockResolvedValue({ id: 'msg_1' }),
}));
```

- Use o bloco no teste do módulo que importa `./mailer`. A chamada
  `vi.mock` é içada e substitui o módulo inteiro. Prefira dependência injetada
  quando o desenho permite.
- `vi.fn()` cria dublê; `mockResolvedValue` e `mockRejectedValue` cobrem
  caminho assíncrono.
- `vi.spyOn(objeto, 'método')` observa sem substituir o módulo.
- Mock do próprio módulo sob teste invalida o teste: ele prova que o mock foi
  chamado.
- `vi.clearAllMocks()` e `clearMocks` limpam histórico e preservam a
  implementação.
- `vi.resetAllMocks()` e `mockReset` limpam histórico e reiniciam a
  implementação conforme o tipo de mock. Reconfigure respostas de dublês que
  o teste ainda usa.
- `vi.restoreAllMocks()` e `restoreMocks` restauram implementações originais
  de spies criados com `vi.spyOn`. Para automocks e `vi.fn()` de módulos
  mockados, limpe ou reinicie explicitamente o dublê conforme o caso.

## Tempo

Exemplo completo de timer falso combinado com interação assíncrona no Testing
Library:

```tsx
// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useState } from 'react';

function ExpirationButton() {
  const [expired, setExpired] = useState(false);

  return (
    <>
      <button onClick={() => setTimeout(() => setExpired(true), 30_000)}>
        Iniciar sessão
      </button>
      {expired && <p role="status">Sessão expirada</p>}
    </>
  );
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

it('expira sessão depois de 30 segundos', async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<ExpirationButton />);

  const click = user.click(screen.getByRole('button', { name: 'Iniciar sessão' }));
  // Execute o timer de finalização da Testing Library antes de aguardar o clique.
  await vi.advanceTimersByTimeAsync(1);
  await click;
  expect(screen.queryByRole('status')).not.toBeInTheDocument();

  await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
  expect(screen.getByRole('status')).toHaveTextContent('Sessão expirada');
});
```

- `useFakeTimers` controla o tempo simulado dentro do teste. Passe
  `advanceTimers` ao `userEvent.setup` para que a interação possa avançar.
- Para timers que agendam Promises, use a variante assíncrona de avanço. Para
  atualizações de React disparadas pelo timer, envolva o avanço em `act`.

## Rede
Esta receita usa MSW 3.x. Em projetos com MSW 2.x, a opção equivalente em
`server.listen()` se chama `onUnhandledRequest`.

```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';

const server = setupServer(
  http.get('https://shop.example.test/api/orders', () =>
    HttpResponse.json([{ id: 42 }])
  ),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('recebe a lista de pedidos da resposta simulada', async () => {
  const response = await fetch('https://shop.example.test/api/orders');
  expect(await response.json()).toEqual([{ id: 42 }]);
});
```

- MSW intercepta no nível de rede, sem substituir o cliente HTTP do código.
- `onUnhandledFrame: 'error'` revela requisição não prevista, que passaria
  silenciosamente.
- `server.use()` sobrescreve handler no caso específico e volta ao padrão no
  `resetHandlers`.
- Para provar o comportamento do seu cliente, chame o cliente no teste e
  confira método, caminho, cabeçalhos e corpo no handler. Integração com o
  provedor exige a fronteira real no ambiente de teste previsto.
- `vi.mock` de módulo é mais simples para função pura de transformação; MSW é mais
  fiel para cliente HTTP.

## Cobertura e projeto

```bash
npx vitest run --coverage
npx vitest run --coverage --coverage.include 'src/total.ts'
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
| Teste passa sozinho e falha na suíte | Mock ou estado global vazando | Limpe histórico, reinicie dublês ou restaure spies conforme a causa |
| `Cannot find module` em CSS ou asset | Transformação não configurada | Ajuste `test.alias` ou `deps` |
| timer falso trava interação | `userEvent` sem avanço de timer | Configure `advanceTimers` |
| Cobertura baixa em componente | Caminho de erro não testado | Cubra erro e vazio |
| Falso positivo de acessibilidade | `jsdom` não calcula layout | Rode browser mode ou teste E2E |


Fontes: [configuração](https://vitest.dev/config/),
[projects](https://vitest.dev/guide/projects),
[clearMocks](https://vitest.dev/config/clearmocks),
[mockReset](https://vitest.dev/config/mockreset),
[restoreMocks](https://vitest.dev/config/restoremocks),
[cleanup](https://testing-library.com/docs/react-testing-library/setup/#auto-cleanup-in-vitest)
[advanceTimers](https://testing-library.com/docs/user-event/options/#advancetimers)
e [migração do MSW 3](https://mswjs.io/docs/migrations/2.x-to-3.x).
