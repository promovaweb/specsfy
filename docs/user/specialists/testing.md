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
- Você precisa escolher a ferramenta de teste para a stack do projeto.

O agente confirma versão do runner, configuração, banco de teste e comando
declarado no projeto antes de escrever o primeiro teste. Não introduz um segundo
runner sem decisão registrada na spec.

## Como ele trabalha

1. Descobre versão, configuração, ambiente de CI e comando de teste do projeto.
2. Recebe do método o comportamento e o nível do teste.
3. Escolhe o modo pela ferramenta que o projeto já usa.
4. Escreve o teste pelo comportamento observável, com nome que descreve a regra.
5. Executa o caso focal, observa a falha esperada e registra a saída literal.
6. Roda a suíte relacionada e entrega comando, arquivo, nome e saída.

## Pest

O modo Pest cobre teste PHP e Laravel.

- `tests/Unit` roda sem framework; `tests/Feature` sobe aplicação e cobre rota,
  controller, policy e job.
- `tests/Pest.php` liga `TestCase` e trait de banco por diretório.
- `.env.testing` com `APP_ENV=testing` e banco separado é pré-requisito.
- Factory cria só o registro do caso, com estado nomeado.
- `DatabaseTransactions` quando a regra do projeto proíbe `RefreshDatabase`.
- Dataset nomeado cobre matriz de entrada, com um caso por linha no relatório.
- `Event::fake`, `Queue::fake`, `Http::fake` e `Storage::fake` cortam efeito
  externo.
- Teste de autorização usa usuário com papel diferente.
- `--parallel` exige banco por worker configurado.

Os exemplos de feature, dataset, fake, paralelo e o diagnóstico de falha estão em
[pest.md](../../../specialists/specsfy-specialist-testing/references/pest.md).

## Playwright

O modo Playwright cobre jornada no navegador.

- `baseURL` evita URL absoluta no teste.
- Locator por papel, rótulo ou texto. Classe CSS é última opção.
- Asserção de espera do Playwright, sem `waitForTimeout`.
- Fixture prepara e limpa estado com `use()`.
- Projeto `setup` grava `storageState` e os testes reaproveitam a sessão.
- `storageState` fica fora do Git.
- `trace: 'on-first-retry'` guarda evidência sem pesar toda execução.
- Retry em CI e zero local.
- CI instala navegador com `--with-deps`, divide por shard e publica relatório
  sempre.
- `page.route` simula erro e borda em caso específico, sem interceptar tudo.

A configuração completa, o setup de autenticação, o exemplo de rota e a tabela de
falhas estão em
[playwright.md](../../../specialists/specsfy-specialist-testing/references/playwright.md).

## Vitest

O modo Vitest cobre unidade e componente em TypeScript.

- Configuração separada quando o teste precisa de ambiente diferente do build.
- `jsdom` ou `happy-dom` para componente; função pura roda em `node`.
- `restoreMocks` evita mock vazando entre testes.
- `toBe`, `toEqual` e `toStrictEqual` têm semântica diferente.
- Componente é consultado por papel e rótulo, com `userEvent.setup()`.
- `await` na interação assíncrona, e `findBy*` para esperar elemento.
- `vi.mock` substitui módulo; mock do próprio módulo sob teste invalida o teste.
- Timer falso exige ajuste para interagir com `userEvent`.
- MSW intercepta rede sem substituir o cliente HTTP.
- Cobertura é lida por arquivo alterado e por caminho de decisão.

Os exemplos de unidade, componente, mock, timer, MSW e cobertura estão em
[vitest.md](../../../specialists/specsfy-specialist-testing/references/vitest.md).

## Erros que ele evita

- `sleep` e `waitForTimeout` como sincronização.
- Snapshot de página inteira como prova de comportamento.
- Mock do módulo sob teste.
- E2E para cada variação de unidade.
- Teste que depende de dado criado por outro teste.
- Teste sem asserção.
- Banco de teste apontando para o banco de desenvolvimento.
- Retry escondendo corrida em teste de unidade.
- Sessão real versionada no repositório.
- Cobertura perseguida com teste vazio.

## Como conferir o resultado

- Saída do caso focal com nome e resultado.
- Falha esperada observada quando o método pede RED.
- Suíte relacionada verde, sem reduzir cobertura do arquivo alterado.
- Execução repetida mantendo o mesmo resultado, ou instabilidade registrada.
- Banco de desenvolvimento intacto, com contagem antes e depois.
- Trace e relatório disponíveis no artefato da execução que falhou.
- Mesmo comando no terminal e no CI, com a mesma versão de runner.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-testing --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Laravel](laravel.md) define aplicação, Eloquent, fila e regra de negócio.
- [React](react.md) define componente, hook e estado.
- [Next.js](nextjs.md) define rota, cache e fronteira server/client.
- [TypeScript](typescript.md) define tipo e configuração do projeto.
- [Interface](interface.md) define acessibilidade e semântica que o teste chama.
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
