---
name: specsfy-specialist-testing
description: Escrever e executar testes nas três ferramentas da stack com isolamento, determinismo e falha diagnosticável. Use no modo pest para Pest e PHPUnit em Laravel, teste de feature e unit, dataset, factory, banco de teste, fake e parallel; no modo playwright para E2E, locator por papel, fixture, auth state, trace, retry e CI; no modo vitest para unit e componente em TypeScript e React com Testing Library, mock, fake timer e cobertura. Não decide o que testar nem substitui o BDD da spec, porque isso pertence a $specsfy-06-implement no modo tests; não use para revisar acessibilidade (`$specsfy-specialist-interface`), para a lógica do framework (`$specsfy-specialist-laravel`, `$specsfy-specialist-react`) nem para montar o pipeline de entrega (`$specsfy-specialist-delivery`).
---

# Testes

Cobre a ferramenta que executa o teste. O modo pest atende PHP e Laravel, o modo
playwright atende navegador de ponta a ponta e o modo vitest atende TypeScript e
componente React. O que testar, em que nível e com qual evidência de RED continua
sendo decisão do método.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Escrever teste de feature ou unit em Laravel com Pest, dataset, factory, banco de teste, fake de fila, evento e HTTP, ou executar suíte em paralelo | pest | [Pest e Laravel](references/pest.md) |
| Escrever E2E de navegador, escolher locator, montar fixture, reutilizar sessão autenticada, capturar trace ou rodar em CI com retry e shard | playwright | [Playwright e E2E](references/playwright.md) |
| Escrever unit ou teste de componente em TypeScript e React, simular rede, controlar timer, medir cobertura ou organizar projeto com Vitest | vitest | [Vitest e componente React](references/vitest.md) |

Não use para:

- Decidir escopo, nível, critério de aceite ou evidência RED do teste. Use
  `$specsfy-06-implement` no modo `tests`, que lê o Gherkin da spec e o
  `test-levels.md`; este especialista escreve e executa o teste na ferramenta
  escolhida.
- Revisar semântica, foco, contraste e leitor de tela. Use
  `$specsfy-specialist-interface`; aqui o teste chama a verificação, não define o
  padrão de acessibilidade.
- Corrigir a lógica de Eloquent, React, Next.js ou TypeScript. Use o especialista
  do framework; o teste apenas revela o comportamento.
- Montar pipeline, promoção e rollback de entrega. Use
  `$specsfy-specialist-delivery` e traga só o comando de teste que o pipeline
  executa.

Combine com `$specsfy-specialist-laravel` no modo pest e com
`$specsfy-specialist-react` ou `$specsfy-specialist-nextjs` no modo vitest ou
playwright, sempre que a falha estiver no código e não no teste.

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a subseção `#### Especialistas` em
   `### 8. Plano técnico`, a seção de critério de aceite e a tarefa `[TEST]` que
   está em execução. Leia também `.specsfy/STACK.md` e `.specsfy/RULES.md`.
   - Fonte de entrada por fase: em `specsfy-02-backlog`, sem spec, leia e
     registre no item de `specs/backlog/`; em specify e validate, leia a spec
     aberta (linha `| Especialistas |`, subseção `#### Especialistas`, seção
     em escrita) e escreva nela; em `specsfy-06-implement`, siga a tarefa
     indicada. Só `specsfy-05-tasks` escreve a seção 14: aqui apenas se indica
     o que a tarefa deve prever, sem criar tarefa.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-testing (pest)`, `(playwright)` ou
   `(vitest)`. Sem indicação, resolva a ferramenta pela stack: projeto com
   `artisan` ou `composer.json` usa Pest; projeto Node sem PHP usa o runner já
   declarado no `package.json`.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`. Quem exige RED, GREEN e rastreabilidade é o método.
5. Entregue o comando exato, o nome do teste e a saída que comprova o resultado,
   para que a fase registre a evidência na tabela `Evidência RED-GREEN-REFACTOR`.
   Antes de executar qualquer suíte que toque banco, confirme a proteção exigida
   pelo método com `specsfy gate database` e nunca rode comando destrutivo em
   banco de desenvolvimento.

## Fluxo

1. Leia [references/standards.md](references/standards.md) e descubra versão do
   runner, configuração, banco de teste, ambiente de CI e comando declarado no
   projeto antes de escrever o primeiro teste.
2. Receba do método o comportamento e o nível do teste. Se o pedido chegar sem
   esse recorte, registre a dúvida e não invente comportamento.
3. Escolha o modo pela ferramenta que o projeto já usa. Não introduza um segundo
   runner sem decisão registrada na spec.
4. Escreva o teste pelo comportamento observável, com nome que descreve a regra e
   uma asserção principal.
5. Execute o teste focal, observe a falha esperada quando o método pedir RED, e
   registre a saída literal.
6. Rode a suíte relacionada e confirme que nenhum teste vizinho quebrou.
7. Entregue comando, arquivo, nome do teste e saída para a spec.

### Modo pest

1. Confirme Pest e PHPUnit instalados, `phpunit.xml`, `tests/Pest.php` e o banco
   de teste em `.env.testing` com `APP_ENV=testing`.
2. Escolha entre teste de unidade e teste de aplicação: unidade não sobe
   framework, aplicação usa `$this->get`, `$this->post` e `actingAs`.
3. Isole dado com factory e `DatabaseTransactions`, com factory que cria só o
   registro do caso. Não use `RefreshDatabase` quando a regra do projeto proíbe.
4. Use dataset para variação de entrada, `Event::fake`, `Queue::fake`,
   `Http::fake` e `Storage::fake` para cortar efeito externo. Detalhe em
   [references/pest.md](references/pest.md).
5. Rode o teste focal com `--filter`, depois a suíte, e confirme que o banco de
   desenvolvimento não foi tocado.

### Modo playwright

1. Confirme `playwright.config.ts`, `baseURL`, projeto de navegador e o script de
   teste no `package.json`.
2. Escreva locator por papel, rótulo ou texto, com `getByRole` como primeira
   escolha. `getByTestId` entra quando o texto é dinâmico ou traduzido.
3. Use asserção de espera do próprio Playwright. Remova `waitForTimeout` e espera
   fixa.
4. Reaproveite autenticação com projeto de setup e `storageState`, e mantenha o
   arquivo de estado fora do Git.
5. Configure trace em primeira tentativa, retry em CI e relatório como artefato.
   Detalhe em [references/playwright.md](references/playwright.md).

### Modo vitest

1. Confirme versão do Vitest, configuração de `test`, ambiente (`jsdom` ou
   `happy-dom`) e script de execução.
2. Teste unidade por função pura e componente por comportamento visível ao
   usuário, com Testing Library e consulta por papel.
3. Use `vi.mock`, `vi.fn`, `vi.useFakeTimers` e MSW com escopo mínimo. Mockar o
   próprio módulo sob teste invalida o teste.
4. Meça cobertura do arquivo alterado, não só o total do projeto, e trate
   cobertura como sinal, não como meta.
5. Execute `vitest run` com filtro, depois a suíte, em CI e local com o mesmo
   comando. Detalhe em [references/vitest.md](references/vitest.md).

## Padrões

- Nome do teste descreve a regra e o resultado esperado, no formato
  "rejeita pedido sem cliente" e não "testa validação".
- Um comportamento por teste, com uma asserção principal. Várias asserções são
  aceitáveis quando descrevem o mesmo efeito.
- Teste atravessa a interface pública do módulo. Teste que chama método privado
  trava a implementação.
- Determinismo é obrigatório: sem relógio real, sem rede real e sem ordem
  aleatória quando o resultado depende dela.
- Dado de teste nasce do próprio teste ou de factory explícita, com estado
  inicial conhecido. Teste que depende de massa criada por outro teste é
  dependente de ordem.
- Espera é sempre por condição observável, nunca por tempo fixo.
- Teste de banco usa banco separado, com nome que identifica ambiente de teste.
- Falha mostra o valor recebido e o esperado, suficiente para diagnóstico sem
  abrir o código.
- Suíte rápida é requisito de uso: teste de unidade em milissegundos, integração
  em segundos, E2E em minutos e só para jornada crítica.
- Teste instável é corrigido ou removido com justificativa. Retry não transforma
  teste frágil em confiável.
- Seletor de E2E usa papel, rótulo ou texto visível. Classe CSS e estrutura de
  `div` mudam sem mudar comportamento.
- Cobertura é lida por arquivo alterado e por caminho de decisão, não por
  percentual global isolado.
- Comando de teste é o mesmo no terminal e no CI. Script que só existe na máquina
  de quem escreveu não comprova nada.

## Antipadrões

- `sleep` ou `waitForTimeout` como sincronização: deixa a suíte lenta e ainda
  falha de forma intermitente em máquina carregada.
- Snapshot de página ou de componente inteiro: qualquer mudança visual gera
  revisão cega e o teste deixa de proteger comportamento.
- Mock do próprio módulo sob teste, com asserção sobre a chamada interna: prova
  que o mock foi chamado, não que a regra funciona.
- E2E para cada variação de unidade: a suíte fica lenta, instável e cara, sem
  cobrir mais regra.
- Teste que compartilha registro criado por outro teste e depende da ordem de
  execução.
- Teste sem asserção ou com asserção que aceita qualquer valor.
- Banco de teste apontando para o banco de desenvolvimento ou comando destrutivo
  executado sem a proteção do método.
- Retry em teste de unidade para esconder corrida.
- `storageState` de sessão real versionado no Git.
- Cobertura perseguida com teste sem asserção.

## Validação

- Saída do teste focal com o nome do caso e o resultado, anexada à spec.
- Falha esperada observada quando o método pede RED, com a mensagem que aponta o
  comportamento ausente.
- Suíte relacionada verde depois da mudança, sem reduzir cobertura do arquivo
  alterado.
- Teste repetido em execução paralela ou repetida não muda de resultado; quando
  muda, a instabilidade está registrada com dono e prazo.
- Banco de desenvolvimento intacto depois da execução, comprovado pelo gate de
  banco do método e pela contagem antes e depois.
- E2E com trace ou relatório disponível no artefato de CI da execução que falhou.
- Mesmo comando executa local e em CI, com a mesma versão de runner.
- Não declare suíte confiável ou cobertura suficiente sem essas evidências;
  execução verde não mede qualidade do teste.

## Skills relacionadas

- `$specsfy-specialist-laravel` define aplicação, Eloquent, fila e regra de
  negócio; este especialista escreve e executa o teste Pest que a prova.
- `$specsfy-specialist-react` define componente, hook e estado; aqui se testa o
  comportamento visível com Testing Library.
- `$specsfy-specialist-nextjs` define rota, cache e fronteira server/client; aqui
  se testa a jornada no navegador e a unidade do módulo.
- `$specsfy-specialist-typescript` define tipo e configuração do projeto; o teste
  aproveita o mesmo contrato de tipo.
- `$specsfy-specialist-interface` define acessibilidade e semântica; o teste E2E
  pode chamar a verificação automatizada, sem substituir a revisão.
- `$specsfy-specialist-delivery` monta pipeline e promoção; aqui se entrega o
  comando e o artefato que o pipeline consome.
- `$specsfy-specialist-debugging` investiga a causa quando o teste revela falha
  que não é do próprio teste.
- `$specsfy-specialist-mcp` define o contrato Streamable HTTP e as primitivas;
  aqui se testa a chamada, a saída estruturada e a recusa de acesso.

O método que decide o que testar é `$specsfy-06-implement` no modo `tests`, com o
Gherkin da spec e a tabela de níveis. Este especialista não substitui essa
decisão e não registra gate.

Leia [references/standards.md](references/standards.md) para o índice dos modos,
as regras comuns e as fontes oficiais, [references/pest.md](references/pest.md)
para Pest e Laravel, [references/playwright.md](references/playwright.md) para
E2E de navegador e [references/vitest.md](references/vitest.md) para Vitest e
componente React.
