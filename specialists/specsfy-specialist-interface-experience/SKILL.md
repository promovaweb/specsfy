---
name: specsfy-specialist-interface-experience
description: Analisar o sistema atual e orientar a descoberta, o plano e a entrega de interfaces completas, bonitas e compatíveis com a stack existente.
---

# Experiência de interface

## Quando usar

- Acionar ao criar ou alterar tela, dashboard, lista, formulário, jornada ou
  CRUD usado por pessoas.
- Acionar antes de UX, UI e implementação para entender o sistema existente e
  organizar a conversa sobre a interface.
- Não usar para endpoint, job ou mudança interna sem superfície para pessoas.

## Fluxo

1. Carregar `$specsfy-setup` e ler `.specsfy/STACK.md`,
   `.specsfy/PACKAGES.md`, manifests, instruções locais e documentação atual.
   Carregar `$specsfy-specialist-design-system` e ler `DESIGNSYSTEM.MD` antes
   de propor qualquer tela. Se o arquivo não existir, criar a fonte a partir de
   `.specsfy/templates/DESIGNSYSTEM.MD`.
   Executar `node .agents/skills/specsfy-setup/scripts/inspect_interface.mjs
   --project <raiz>` para localizar rotas, componentes e tecnologias antes da
   leitura detalhada.
2. Examinar as telas, fluxos, rotas, componentes, conteúdo, permissões, estados
   e testes ligados à área afetada. Registrar o que a pessoa já consegue fazer,
   o que deve permanecer e o que a entrega muda.
3. Identificar framework, roteamento, primitives, estilos, formulários e runner
   de testes usados pelo projeto. Seguir essas fontes e não trocar tecnologia
   ou biblioteca sem confirmação da pessoa.
4. Aplicar o contrato central de perguntas somente para lacunas reais:
   perguntar uma lacuna por vez sobre telas, fluxo de informação, formulário,
   formato de ação e composição. Quando a pessoa não informa direção visual,
   aplicar os defaults de `DESIGNSYSTEM.MD` e registrar a direção padrão. Só
   perguntar sobre composição quando o pedido contrariar uma regra existente.
   Oferecer opções textuais compatíveis com o sistema atual, `Escrever outra
   resposta`, `Gere outras opções` e `Avançar`.
5. Registrar na seção 10 da spec a stack observada, cada tela, o fluxo, os
   formulários, a composição, os estados e a acessibilidade. Um CRUD não pode
   ficar restrito a API, banco ou serviço. Para CRUD, mapear sempre lista com
   `PageHeader` e `DataGrid` com detalhe clicável por linha, detalhe com
   `PageHeader` e `DetailLists` e criar ou editar com `PageHeader` e seções de
   formulário em duas colunas responsivas. Toda tela também deve mapear
   `Breadcrumb` com equipe, módulo e tela atual; em Laravel, reaproveitar o
   componente já usado pelo layout. O `PageHeader` é um único componente
   reutilizável entre essas telas. A listagem ocupa a largura disponível,
   mostra o `ID` em coluna própria e oferece editar e apagar na linha, além do
   link para o detalhe.
6. Criar na seção 14 a `Fase de interface`, com uma tarefa por tela e testes
   para navegação, formulário, validações, feedback e teclado.
7. Chamar `$specsfy-specialist-ux-design` para jornada e
   `$specsfy-specialist-ui-design` para composição. Em projetos React, carregar
   `$specsfy-specialist-react-ui-components` para selecionar, reaproveitar e
   adaptar componentes antes de escrever JSX ou TSX, além de
   `$specsfy-specialist-react` para a implementação da stack. Para outra
   tecnologia, carregar o especialista equivalente detectado pelo setup.

## Resultado esperado

Uma interface informativa, funcional e reconhecível para a tarefa, coerente com
o sistema existente e com a personalidade do produto. O plano mostra telas,
formulários, estados, regras de negócio, componentes e testes. A implementação
preserva tudo fora do alcance registrado.

## Padrões

- Mapear cada tela, ação, formulário, estado e retorno no plano.
- Preservar a stack, os componentes e os padrões de navegação já observados.
- Registrar teclado, foco, responsividade e mensagens junto da tela afetada.
- Renderizar `Breadcrumb` em todas as telas, mantendo o nome da equipe ativa
  visível. Em Laravel, reutilizar `Breadcrumb` ou `Breadcrumbs` existente e sua
  tipagem de itens.
- Aplicar `DESIGNSYSTEM.MD` como fonte macro e `INTERFACE.md` como registro local.
- Usar `DataGrid`, `DetailLists` e `PageHeader` nas superfícies CRUD definidas;
  a linha abre o detalhe e controles internos permanecem independentes.
- Reutilizar o mesmo `PageHeader` componentizado em todas as telas CRUD; manter
  `DataGrid` em largura total com `ID`, editar e apagar visíveis na linha.
- Conferir bordas, espaçamentos, margens, padding e tipografia durante o
  desenvolvimento, mesmo sem pedido da pessoa. Registrar o resultado no
  item `VISUAL` da tarefa.
- Organizar criar e editar em seções com coluna de contexto, painel em duas
  colunas nos breakpoints largos e uma coluna no mobile.
- Mostrar erro de campo em vermelho, com mensagem abaixo do campo e foco útil.
- Projetar a hierarquia pelos dados, linguagem e estados do produto, sem cair em
  uma composição visual genérica.

## Antipadrões

- Propor uma tela sem ler as rotas e os componentes atuais.
- Tratar CRUD como endpoint sem descrever a interação da pessoa.
- Validar somente o estado feliz e ignorar vazio, erro ou permissão.

## Validação

- Confirmar que a pessoa recebeu pergunta sobre as telas em toda entrega que
  cria ou altera uma interface.
- Conferir que a seção 10 registra a stack e o sistema atual antes da proposta.
- Confirmar que `DESIGNSYSTEM.MD` foi lido ou criado e que a direção padrão ou
  exceção está registrada com alcance.
- Executar `validate_spec.mjs`, `validate_tasks.mjs` e
  `validate_interface_tasks.mjs` conforme a etapa.
- Verificar mobile e desktop, loading, vazio, erro, sucesso, permissão,
  teclado e foco antes de concluir a interface.

## Skills relacionadas

- `$specsfy-specialist-ux-design` para jornada, tarefas e conteúdo.
- `$specsfy-specialist-ui-design` para composição visual e estados.
- `$specsfy-specialist-react-ui-components` para selecionar e reaproveitar
  componentes nas telas React.
- `$specsfy-specialist-design-system` para regras macro, defaults e cenários
  CRUD.

Leia [references/standards.md](references/standards.md) para fontes de
acessibilidade e inspeção de interfaces.
