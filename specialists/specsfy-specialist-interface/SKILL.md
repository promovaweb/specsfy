---
name: specsfy-specialist-interface
description: Planejar, projetar e validar interfaces com discovery (stack e telas atuais), system (design system SaaS), ux (pesquisa e jornadas), ui (layout e estados) e accessibility (WCAG, semântica, teclado e foco). Use para telas, CRUDs, dashboards e fluxos usados por pessoas. Para selecionar ou adaptar componentes React, use specsfy-specialist-ui-components; para contratos de API e arquitetura sem interface, use specsfy-specialist-architecture.
---

# Interface

Coordene a entrega de telas a partir das tarefas das pessoas, da stack
observada e do design system. Registre o comportamento na spec, as regras
macro em `DESIGNSYSTEM.MD` e os componentes e telas locais em `INTERFACE.md`.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Criar ou mudar uma tela, jornada, dashboard ou CRUD e mapear o sistema atual | discovery | [Inspeção de interfaces](references/discovery.md) |
| Criar, atualizar ou aplicar regras macro de SaaS, CRUD, estados e exceções | system | [Design system e cenários](references/system.md) |
| Investigar usabilidade, arquitetura da informação, fluxo, conteúdo ou onboarding | ux | [Métodos de pesquisa e UX](references/ux.md) |
| Definir ou revisar shell, hierarquia, densidade, tabelas, formulários e dashboards | ui | [Matrizes de composição e revisão](references/ui.md) |
| Implementar ou auditar WCAG, semântica, teclado, foco, mídia e tecnologias assistivas | accessibility | [Critérios e matriz de testes](references/accessibility.md) |

Não use para:

- Selecionar, instalar ou adaptar assets, composições ou primitives React.
  Use `$specsfy-specialist-ui-components` depois de definir a interface.
- Definir contratos de endpoint ou mudanças arquiteturais sem superfície para
  pessoas. Use `$specsfy-specialist-architecture`. Para jobs internos, use o
  especialista da stack, como `$specsfy-specialist-laravel`.
- Tratar uma preferência visual isolada como auditoria WCAG. Use o modo ui.
  Se a dúvida for o fluxo ou a tarefa, use o modo ux antes de ui.

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
   pertinente à fase.
   Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md` e, para tela nova ou alterada, `INTERFACE.md`.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-interface (<modo>)`, com `discovery`,
   `system`, `ux`, `ui` ou `accessibility`. Sem indicação, escolha o modo pelo
   "Quando usar" acima.
3. Devolva a conclusão e as dúvidas abertas no destino indicado no item 1,
   no próprio backlog, na spec ou na tarefa da fase.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Confirme telas, estados, permissões e testes em `INTERFACE.md` e
   `DESIGNSYSTEM.MD`, e, quando a fase trabalhar o plano técnico da spec,
   registre o resultado na subseção `Views e experiência` antes de escrever
   código de componente.

## Fluxo

1. Leia [references/standards.md](references/standards.md) e identifique área,
   público, tarefa e tipo de entrega. Para tela nova ou alterada, comece em
   discovery e aplique system antes de propor a solução.
2. Inspecione as fontes locais. Preserve framework, primitives, navegação e
   convenções existentes. Confirme com a pessoa qualquer troca da stack ou
   direção quando não houver uma base identificável.
3. Compare o pedido com o design system. Aplique os defaults na ausência de
   direção visual ou registre a exceção e seu alcance.
4. Use ux para decidir comportamento e ui para compor a superfície. Cubra
   acessibilidade desde a spec e use accessibility para implementar ou
   auditar os critérios afetados.
5. Registre decisões, estados, permissões e testes no artefato correspondente.
   Para implementar, carregue o especialista da tecnologia detectada.
6. Valide estados, comportamento e renderização e registre evidências e
   limitações. Preserve o funcionamento fora do alcance da entrega.

### Modo discovery

1. Carregue `$specsfy-setup` e leia instruções locais, `.specsfy/STACK.md`,
   `.specsfy/PACKAGES.md`, manifests e documentação. Rode o inspetor antes
   da leitura detalhada.

   ```bash
   node .agents/skills/specsfy-setup/scripts/inspect_interface.mjs \
     --project <raiz>
   ```

2. Examine rotas, fluxos, telas, conteúdo, permissões, estados e testes.
   Confirme framework, roteamento, primitives, estilos, formulários e runner
   de testes. Registre o que a pessoa já faz, o que permanece e o que muda.
3. Aplique o contrato central de perguntas. Reuse respostas já confirmadas e
   pergunte uma lacuna por vez sobre telas, informação, campos, validações e
   formato da ação. Ofereça opções textuais compatíveis, `Escrever outra
   resposta`, `Gere outras opções` e `Avançar`. Pergunte sobre composição
   quando houver conflito com regra existente ou lacuna de tarefa.
4. Na seção 10 da spec, ou no item de `specs/backlog/` quando a spec ainda não
   existe, registre stack observada, cada tela, fluxo, formulário, composição,
   ações, estados, mensagens, retornos, teclado, foco e responsividade. Mapeie
   as telas das operações incluídas no Contrato CRUD.
5. Indique à fase `specsfy-05-tasks` a `Fase de interface`, com uma tarefa por
   tela e testes de navegação, formulários, validação, feedback e teclado, sem
   criar tarefa fora dela. Encaminhe aos modos ux e ui. Em React, carregue
   `$specsfy-specialist-ui-components` antes de escrever JSX ou TSX e
   `$specsfy-specialist-react` para a stack.

### Modo system

1. Leia `DESIGNSYSTEM.MD` na raiz do consumidor. Se estiver ausente, copie
   `.specsfy/templates/DESIGNSYSTEM.MD` e preencha somente o que foi confirmado.
   Depois leia `INTERFACE.md`, stack, manifests, rotas, telas e regras do domínio.
2. Identifique produto, módulo, superfície e fluxo. Registre a direção
   padrão aplicada ou a exceção, a regra substituída e seu alcance.
3. Atualize a fonte macro somente para regras de alcance compatível. Use
   `INTERFACE.md` para o registro local e consulte os componentes já
   documentados antes de criar uma variante ou token.
4. Mapeie os cenários canônicos em [system.md](references/system.md) antes de
   encaminhar a entrega. Informe fontes lidas, regras, exceções e cobertura.

Esses defaults não significam aparência genérica. A personalidade vem da
hierarquia dos dados, linguagem do domínio, tipografia, tokens, ritmo, estados,
contraste e uso do shell. A composição deve informar e orientar a tarefa.

### Modo ux

1. Confirme público, frequência, contexto e consequência de falha. Formule
   a suposição antes de escolher método. Separe observações, inferências,
   suposições e preferências internas.
2. Mapeie jornada atual, entradas, escolhas, esperas, erros, canais,
   dependências, handoffs e exceções críticas. Esclareça a camada de
   interface com a pessoa se a stack observada não responder.
3. Escolha método proporcional à pergunta e ao impacto. Defina recrutamento,
   consentimento, roteiro e regra de parada. Prototipe na menor fidelidade
   que permita testar sem simular comportamento que distorça o resultado.
   Combine com `$specsfy-specialist-research` quando precisar desse artefato
   descartável e com `$specsfy-specialist-modeling` para vocabulário e
   invariantes complexos do domínio.
4. Use tarefas e prompts neutros. Registre sucesso, erro, tempo, hesitação,
   compreensão e citações relevantes. Sintetize por evidência, severidade,
   alcance e impacto, distinguindo achado, interpretação, recomendação e
   questão aberta.
5. Registre a resposta textual sobre como a ação abre, por exemplo página,
   painel lateral, modal ou área expandida. Encaminhe ao modo ui com tarefa,
   telas, fluxo de informação, campos, validações e estados.

### Modo ui

1. Confirme a jornada e a abertura das ações antes da composição. Inspecione
   tokens, componentes, breakpoints e screenshots; volte a ux se faltar
   uma resposta sobre comportamento ou tarefa.
2. Ordene informação e ações por tarefa, frequência, dispositivo, densidade
   e consequência do erro. Mapeie dados, unidades, permissões e estados,
   incluindo partial e offline quando aplicáveis.
3. Escolha shell, navegação e grid pela arquitetura da informação. Mapeie
   agrupamento, contraste, escala e espaço para tokens semânticos. Defina
   os casos extremos em cada breakpoint antes de escolher componentes.
4. Implemente ou especifique a composição com dados, linguagem e estados do
   produto. Verifique variantes, tipografia e espaçamentos já publicados e
   justifique qualquer duplicação.

### Modo accessibility

1. Confirme política, nível WCAG, navegadores, tecnologias assistivas, público
   e tarefas críticas. Distinga conformidade de usabilidade.
2. Liste barreiras por estrutura, percepção, teclado, foco, formulários,
   conteúdo dinâmico, mídia e autenticação. Corrija HTML e comportamento
   nativos primeiro e inspecione nome, papel, valor, estado e relações.
3. Percorra abertura, fechamento, navegação e atualizações assíncronas.
   Confira ordem lógica, foco visível e não encoberto e anúncios úteis.
4. Combine automação, inspeção manual e tecnologia assistiva representativa.
   Registre critério, impacto, reprodução, correção, cobertura e limitações.

## Padrões

- Aplique a matriz SaaS de [system.md](references/system.md). Lista com
  `DataGrid` em largura total, coluna `ID` e as ações das operações incluídas
  declaradas no Contrato CRUD da spec (campo `Operações:`); uma tela só de
  listagem e cadastro não ganha editar/apagar. Detalhe com `DetailLists`.
  Todas as telas CRUD reutilizam o mesmo `PageHeader`. Use `Breadcrumb` com
  equipe ativa, módulo e tela atual e reaproveite o componente do layout
  Laravel. (regra da casa)
- Quando `consultar` constar no Contrato CRUD, faça a linha abrir o detalhe
  por clique e teclado, com ações independentes. Sem `consultar`, mantenha a
  linha informativa e deixe o foco nos controles disponíveis.
  Em criar e editar, use seções com contexto e campos em duas colunas largas
  e uma no mobile. Use labels visíveis, erro associado abaixo do campo e
  preservação da entrada.
- Preserve posição e filtros ao voltar do detalhe. Mostre próxima ação e
  recuperação no contexto. Explique a consequência de ações destrutivas e
  ofereça undo quando mais seguro. Revele complexidade e solicite informações
  no momento em que servem à tarefa. Faça onboarding conduzir ao primeiro valor.
- Use tabela para comparar, lista para ler e cards para entidades distintas.
  Faça dashboards responderem uma pergunta com escopo, período, unidade,
  origem, comparação, atualização e caminho para o detalhe.
- Use elementos nativos sempre que representarem a interação. Modais mantêm
  o foco dentro do contexto, fecham de forma previsível e devolvem foco.
  Anuncie atualizações relevantes e ofereça texto ou tabela para gráficos.

## Antipadrões

- Projetar sem inspecionar rotas, telas e componentes ou tratar CRUD como
  endpoint sem interação planejada.
- Generalizar uma sessão, induzir resposta, recrutar um público incompatível
  ou medir apenas tempo. Mantenha os antipadrões de pesquisa em
  [ux.md](references/ux.md).
- Duplicar cabeçalhos, esconder ID ou ações frequentes, usar cards para
  comparação densa ou transformar exceção de uma tela em regra global.
- Usar placeholder como label, erro só por cor ou toast, ícone sem nome
  acessível ou acionar algo somente por hover, gesto ou ponteiro preciso.
- Mascarar reflow com overflow oculto, trocar texto visível por `aria-label`
  desnecessário ou mover foco em cada atualização assíncrona.

## Validação

- Confira a descoberta com a pessoa, reutilizando informações confirmadas,
  e a presença da stack e das telas na seção 10 e das tarefas na seção 14.
  Execute `validate_spec.mjs`, `validate_tasks.mjs` e
  `validate_interface_tasks.mjs` conforme a etapa.
- Revise `DESIGNSYSTEM.MD`, escopo das exceções, registro local, composição
  CRUD e cenários da [matriz SaaS](references/system.md).
- Durante o desenvolvimento, confira bordas, espaçamentos, margens, padding
  e tipografia em viewports e estados relevantes, mesmo sem pedido. Registre
  método, resultado e ajustes no item `VISUAL` antes de `EVIDENCE`, ou
  justifique a ausência de interface. Use screenshots, DOM ou inspeção
  equivalente. Confira tradução expandida, valores extremos, data, moeda e
  timezone. Revise com `$specsfy-specialist-ui-components` se adaptou assets.
- Exercite caminho nominal e estados adversos. Faça a tarefa inteira por
  teclado e confira foco, contraste, zoom de texto a 200%, reflow a 320 CSS
  px, espaçamento, orientação, forced colors e reduced motion. Combine
  axe/linter, árvore de acessibilidade e leitor de tela.
- Rastreie recomendações aos achados e achados às notas consentidas.
  Revalide tarefas críticas após mudanças estruturais e registre limites da
  amostra. Use as matrizes dos modos para completar cada verificação.
- Execute testes e validadores do consumidor quando houver implementação.
  Para manutenção da skill no monorepo, use
  `node scripts/validate-skills.mjs specsfy-specialist-interface` a partir da
  raiz. Sustente afirmações de usabilidade, responsividade e WCAG com evidência,
  escopo, limitações e exceções aplicáveis.

## Skills relacionadas

- `$specsfy-specialist-ui-components` adapta assets, composições ReUI e
  primitives shadcn/ui depois das decisões de interface.
- `$specsfy-specialist-react` e `$specsfy-specialist-nextjs` implementam na
  stack, incluindo a fronteira server/client e o roteamento em Next.js.
- `$specsfy-specialist-tailwind-css` traduz tokens, variantes, contraste,
  reflow, forced colors e reduced motion em utilitários da stack.
- `$specsfy-specialist-laravel` implementa telas Inertia e preserva o layout,
  a tipagem do breadcrumb e as regras do backend.
- `$specsfy-specialist-code-review` amplia a revisão além de acessibilidade.
- `$specsfy-specialist-testing` executa o teste de navegação, formulário e
  teclado que comprova os estados e a semântica definidos aqui.
