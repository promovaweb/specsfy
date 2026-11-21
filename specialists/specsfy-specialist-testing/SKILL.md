---
name: specsfy-specialist-testing
description: Escrever e executar testes nas três ferramentas da stack com isolamento, determinismo e falha diagnosticável. Use no modo pest para PHP com Pest ou PHPUnit, com ou sem Laravel, teste de feature e unit, dataset, factory, banco de teste, fake e parallel; no modo playwright para E2E automatizado previsto no plano, com runner compatível confirmado ou instalação decidida na spec; no modo vitest para unit e componente em TypeScript e React com Testing Library, mock, fake timer e cobertura. Implemente o teste designado por $specsfy-06-implement no modo tests, no nível informado e com o runner instalado; não use para revisar acessibilidade (`$specsfy-specialist-interface`), para a lógica do framework (`$specsfy-specialist-laravel`, `$specsfy-specialist-react`) nem para montar o pipeline de entrega (`$specsfy-specialist-delivery`).
---

# Testes

Cobre a ferramenta que executa o teste. O modo pest atende PHP e Laravel, o modo
playwright atende navegador de ponta a ponta e o modo vitest atende TypeScript e
componente React. O que testar, em que nível e com qual evidência de RED continua
sendo decisão do método.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Escrever teste PHP com Pest ou PHPUnit, incluindo testes Laravel com factories, banco de teste e fakes, ou executar suíte em paralelo | pest | [Pest e Laravel](references/pest.md) |
| Escrever E2E automatizado previsto no plano, com Playwright confirmado na stack ou decisão explícita de instalar o runner em stack compatível | playwright | [Playwright e E2E](references/playwright.md) |
| Escrever unit ou teste de componente em TypeScript e React, simular rede, controlar timer, medir cobertura ou organizar projeto com Vitest | vitest | [Vitest e componente React](references/vitest.md) |

Não use para:

- Decidir escopo, nível, critério de aceite ou evidência RED do teste. Use
  `$specsfy-06-implement` no modo `tests`, que lê o Gherkin da spec e o
  `test-levels.md`; este especialista escreve e executa o teste na ferramenta
  escolhida.
- Revisar semântica, foco, contraste e leitor de tela ou verificar teclado
  manualmente. Use `$specsfy-specialist-interface` no modo `accessibility`.
- Corrigir a lógica de Eloquent, React, Next.js ou TypeScript. Use o especialista
  do framework; o teste apenas revela o comportamento.
- Montar pipeline, promoção e rollback de entrega. Use
  `$specsfy-specialist-delivery` e traga só o comando de teste que o pipeline
  executa.

Para um teste de comportamento da aplicação Laravel, combine
`testing/pest + laravel/app`. Use `$specsfy-specialist-testing` em `pest` para
o teste e `$specsfy-specialist-laravel` em `app` para comportamento, migrations
do framework e domínio. Para schema SQL, índices e plano de execução, use o
especialista da engine observada, como PostgreSQL ou MySQL.

## No Specsfy

1. **Fonte de entrada por fase**
   - Em `specsfy-02-backlog`, leia o item em `specs/backlog/` e registre ali
     as decisões e sinais do especialista, além das dúvidas abertas.
   - Em `specsfy-03-specify` e `specsfy-04-validate`, use a
     spec aberta e devolva a conclusão à seção trabalhada pela fase.
   - Em `specsfy-05-tasks`, ajude a sugerir e sincronizar especialistas e modos
     entre o cabeçalho, a seção 8 e as tarefas. Só essa fase escreve a seção 14.
   - Em `specsfy-06-implement`, limite-se à tarefa indicada e ao passo carregado.

   Nas fases com spec, leia a spec aberta indicada pela skill chamadora ou
   localizada por `specsfy status`. Consulte a linha `| Especialistas |`,
   a subseção `#### Especialistas` em `### 8. Plano técnico` e a seção
   pertinente à fase. Consulte os critérios de aceite (ACs) relevantes. Se receber
   apenas um ID inequívoco, use `specsfy specs show <id> --content`.
   Leia também `.specsfy/STACK.md` e `.specsfy/RULES.md`.
2. Em `$specsfy-06-implement` no modo `tests`, receba passo, tarefa, AC, nível
   e runner. Em `prepare`, a tarefa `[TEST] [TDD]` indicada ainda está aberta.
   Use o modo registrado como
   `Especialista: $specsfy-specialist-testing (pest)`, `(playwright)` ou
   `(vitest)`. Em caso de dúvida, confira configuração, scripts e lockfiles.
   Devolva divergências ao chamador para decisão.
3. Devolva a saída à fase chamadora para registro no destino do item 1.
   No passo `prepare`, o modo `tests` registra o RED, conclui o checklist
   da tarefa e retorna a `$specsfy-05-tasks` com o Plan Gate ainda `Pending`.
   Estado e gates permanecem sob responsabilidade do método.
4. Antes de cada comando focal, suíte ou regressão, obtenha `SAFE` para o
   comando exato com `specsfy gate database`, mesmo se o teste parecer
   independente de banco. Siga a [proteção obrigatória](references/standards.md#banco-de-teste).

## Fluxo

1. Leia [references/standards.md](references/standards.md) e a referência do
   modo. Confirme versão, configuração, ambiente e comando do runner instalado.
2. Escreva o teste conforme o AC e no nível recebido. Dê ao caso um nome que
   descreva o comportamento observável e coloque o marcador `SPECSFY:` com os
   IDs da spec junto à definição do teste. Preserve a fronteira que o AC prova.
3. Em `prepare`, devolva ID da tarefa, comando exato, nome, arquivo, marcador
   e saída literal da falha de comportamento que comprova RED. Corrija falhas
   de sintaxe, importação, fixture ou ambiente antes de entregar o retorno.
4. Em `cycle`, devolva os resultados focais e das suítes relacionadas para o
   registro de RED, GREEN e REFACTOR. Em `verify`, devolva os resultados e
   lacunas solicitados para a conferência de rastreabilidade e aceite.

### Modo pest

1. Confirme o runner e a configuração no `composer.lock` e no `phpunit.xml`.
   Use a API de Pest quando instalado ou preserve o estilo da suíte PHPUnit
   existente. Confirme Laravel pelo framework instalado e pelo bootstrap.
2. Implemente o nível recebido. Unidade roda sem carregar a aplicação Laravel.
   Para Feature, use a base do framework e os helpers de HTTP/autenticação.
3. Em Laravel, exija `.env.testing` com `APP_ENV=testing` e banco separado.
   Use `DatabaseTransactions` em schema já migrado, com factories restritas
   ao caso. A proteção do método veda `RefreshDatabase`, `DatabaseMigrations`
   e equivalentes destrutivos no fluxo de testes.
4. Use datasets para variar entradas e fakes para efeitos fora da fronteira
   do teste. Com fake HTTP parcial, habilite `Http::preventStrayRequests()`,
   restrinja o padrão e confira a requisição enviada.
5. Execute o teste focal com `--filter` e a suíte correspondente após obter
   `SAFE` para cada comando. Em paralelo, confira a compatibilidade de
   ParaTest e os bancos por processo. Veja [references/pest.md](references/pest.md).

### Modo playwright

1. Confirme o plano de teste automatizado no navegador e o runner compatível.
   Se ele ainda não estiver instalado, a spec precisa registrar essa decisão.
   Confira `playwright.config.ts`, `baseURL`, servidor de teste, projeto de
   navegador e o script no `package.json`.
2. Escreva locator por papel, rótulo ou texto, com `getByRole` como primeira
   escolha. `getByTestId` entra quando o texto é dinâmico ou traduzido.
3. Use asserção de espera do próprio Playwright. Remova `waitForTimeout` e espera
   fixa.
4. Reaproveite `storageState` só em casos que podem executar simultaneamente
   com a mesma conta sem interferência. Separe conta por worker ou dados por
   fixture quando houver mutação de estado. Mantenha o estado fora do Git.
5. Use `retain-on-failure` para preservar o trace da tentativa que falhou,
   inclusive a inicial. Em CI, publique um blob protegido por shard e gere
   um relatório com todos os blobs.
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
- Controle relógio, dados e ordem. Preserve a fronteira real que o teste deve
  provar e use uma sandbox declarada ao integrar com um provedor externo.
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
- Resultado `SAFE` registrado para cada comando focal, suíte e regressão,
  incluindo os bancos por processo quando houver paralelismo.
- E2E com trace da falha original acessível no relatório consolidado de CI,
  sob acesso restrito e retenção definida.
- Mesmo comando executa local e em CI, com a mesma versão de runner.
- Não declare suíte confiável ou cobertura suficiente sem essas evidências;
  execução verde não mede qualidade do teste.

## Skills relacionadas

- `$specsfy-specialist-laravel` define aplicação, Eloquent, fila e regra de
  negócio e migrations do framework; aqui se implementa o teste designado.
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
