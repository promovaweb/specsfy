# Design System

O especialista Design System mantém o arquivo `DESIGNSYSTEM.MD` do seu
projeto. Esse documento descreve a linguagem visual e o shell da aplicação,
além da composição das telas, dos estados e das regras de negócio que aparecem
na interface. Os especialistas de UX, UI, experiência de interface e
componentes React partem dele.

## Quando usar

- Você vai criar ou revisar uma tela, um fluxo CRUD, uma navegação, um
  formulário ou um componente global.
- O `DESIGNSYSTEM.MD` ainda não existe, está desatualizado ou entra em
  conflito com uma tela já projetada.

O catálogo de componentes, props e arquivos locais fica no `INTERFACE.md`.
Esse arquivo aponta para as escolhas do design system sem copiá-las. Assim,
cada documento mantém o próprio escopo.

## Como ele trabalha

O agente lê primeiro o `DESIGNSYSTEM.MD` da raiz do projeto. Quando ele não
existe, copia o template `.specsfy/templates/DESIGNSYSTEM.MD` e preenche só o
que já foi confirmado, sem texto genérico nas lacunas. Depois disso, consulta
o `INTERFACE.md` e o `.specsfy/STACK.md` junto com as rotas e as permissões
ligadas à entrega.

1. Identifica o produto, o módulo, a superfície e o fluxo afetado.
2. Compara a solicitação com o documento e preserva as orientações ativas.
3. Sem uma direção visual sua, aplica os defaults do documento e registra essa
   escolha como direção padrão da entrega.
4. Com uma direção diferente, registra a exceção, o alcance e a orientação que
   ela substitui, sem estender a exceção de uma tela ao produto inteiro.
5. Atualiza o documento apenas com orientações válidas para todo o produto e
   leva componentes e telas específicas para o `INTERFACE.md`.
6. Levanta os cenários de cada superfície para orientar UX, UI e
   implementação.
7. Informa os arquivos lidos, a orientação aplicada, as exceções e os
   cenários cobertos.

Em toda entrega visual, o agente revisa o acabamento da tela nos viewports e
estados relevantes. A conferência passa por bordas, espaçamentos e tipografia,
com o método e os ajustes registrados no item `VISUAL` da tarefa.

## Defaults para aplicações SaaS

Sem uma direção visual contrária, o especialista aplica estas composições:

- Lista de CRUD com `PageHeader`, um resumo útil e `DataGrid`, com busca,
  filtros, ordenação e paginação conforme o volume.
- Detalhe com `PageHeader` e `DetailLists`, incluindo status, próxima ação e
  relações.
- Criar e editar com `PageHeader` e seções de formulário em duas colunas
  responsivas.
- Labels visíveis acima dos campos, texto de apoio e valores preservados no
  envio.
- Erro de campo em vermelho, com mensagem abaixo do campo e foco no primeiro
  erro.
- Resumo no início do formulário quando houver vários erros.
- Estados de carregamento, vazio, erro, sucesso, sem permissão e alteração
  pendente.
- `Breadcrumb` em todas as telas, com o team ativo (o tenant selecionado)
  antes do módulo e do título atual.
- Linha inteira do `DataGrid` clicável, com equivalente de teclado e botões
  internos independentes.
- O mesmo `PageHeader` em todas as telas do CRUD, com a coluna `ID` e os
  botões de editar e apagar na linha.

Esses defaults não deixam a interface genérica. A identidade do produto vem da
hierarquia das informações e da linguagem do domínio, somadas à tipografia, aos
tokens e ao ritmo da página.

## Dashboards

Um dashboard segue esta ordem:

1. `PageHeader` com período ou escopo e filtros.
2. Uma faixa curta de indicadores com valor, unidade, comparação e fonte.
3. A tendência principal.
4. Uma lista detalhada ou um `DataGrid` para investigação.

Cada indicador declara os estados de carregamento, vazio, erro e atualização.
Os gráficos têm uma alternativa em texto ou em tabela.

Primitives do shadcn/ui cobrem os controles básicos. Os blocos gratuitos do
ReUI cobrem as composições de CRUD e dashboard, adaptados aos tokens, às
permissões e à linguagem do produto.

## Formulários e breadcrumb

Criar e editar usam seções independentes, com a descrição da seção à esquerda
e o painel de campos à direita. Os campos relacionados ocupam duas colunas nas
telas largas e uma coluna no celular. O rodapé mantém as ações de cancelar e de
confirmar perto do resultado da ação.

O `Breadcrumb` fica no shell global e mostra o team ativo, o módulo e a tela
atual. Em Laravel, o agente reaproveita o componente `Breadcrumb` ou
`Breadcrumbs` do layout e seus tipos de rota, com o team e a tela atual
visíveis também no celular.

## Cenários cobertos em cada entrega

- Lista com registros e lista vazia.
- Detalhe com status e ações.
- Criação e edição válidas.
- Criação ou edição com erro de campo.
- Ausência de permissão e falha de carregamento.
- Alteração pendente ao sair da tela, quando houver edição.
- Resultado de uma ação destrutiva, quando houver exclusão ou cancelamento.

Para cada cenário, a spec registra a pré-condição e a ação, a resposta e o
estado visual, além do foco, da mensagem e do próximo passo.

## Erros que ele evita

- Parede de cards quando você precisa comparar registros.
- Formulário sem seções em um domínio com grupos de informação distintos.
- Duas colunas no celular ou um campo distante da própria mensagem de erro.
- Placeholder usado como único label.
- Erro indicado só por cor, ícone ou toast distante do campo.
- Dashboard com números sem período, unidade ou próxima ação.
- Bloco do ReUI ou primitive do shadcn/ui sem adaptação aos tokens do produto.
- Exceção de uma tela registrada como orientação global.
- CRUD com cabeçalho duplicado, `DataGrid` estreito ou `ID` oculto.

## Como conferir o resultado

- O `DESIGNSYSTEM.MD` existe na raiz, com classificação, política, defaults,
  estados, cenários e histórico.
- A lista usa `DataGrid` e `PageHeader`, enquanto o detalhe usa
  `DetailLists`.
- Todas as telas têm `Breadcrumb` com o team ativo, o módulo e a tela atual.
- Os formulários usam seções, com duas colunas nas telas largas e uma no
  celular.
- Os erros de campo aparecem em vermelho abaixo do campo, com associação
  semântica.
- A direção padrão ou a exceção está registrada com o alcance.
- O `INTERFACE.md` registra os primitives e blocos usados, com origem, estados
  e consumidores.
- Cada tarefa tem o item `VISUAL` concluído antes de `EVIDENCE`.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-design-system --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Experiência de Interface](interface-experience.md) coordena a entrega de
  telas e carrega este especialista primeiro.
- [UX Design](ux-design.md) define fluxos e arquitetura da informação.
- [UI Design](ui-design.md) define tokens, hierarquia e composição visual.
- [Componentes React](react-ui-components.md) escolhe primitives e composições
  compatíveis.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-design-system/SKILL.md),
com o template do `DESIGNSYSTEM.MD` e o arquivo de referência na mesma pasta.
