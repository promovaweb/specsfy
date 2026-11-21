# Design de interface

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="../../../../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../../../../brand/logo/icon.png" alt="Logo do Specsfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD013 -->

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | interface dos projetos consumidores |
| Autoridade | template, especialista e documento `DESIGNSYSTEM.MD` do consumidor |

## Papel

Registrar como o Specsfy orienta interfaces SaaS sem transformar cada tela em
uma composição genérica. O projeto consumidor mantém `DESIGNSYSTEM.MD` na raiz
como fonte das regras macro. `INTERFACE.md` mantém o registro local de
componentes e telas.

## Como usar

Leia este contexto ao criar ou revisar o template `DESIGNSYSTEM.MD`, os
especialistas de interface, o catálogo ou o instalador. No projeto consumidor,
leia `DESIGNSYSTEM.MD` antes de escolher a composição de uma tela.

## Precedência

1. Regras de negócio, permissões e comportamento da spec.
2. `DESIGNSYSTEM.MD` do projeto consumidor.
3. `INTERFACE.md` para componentes e composição local.
4. Catálogo e tokens da stack observada.

Uma direção visual explícita pode alterar um default. Registre a exceção com
alcance na fonte do consumidor. O catálogo de assets não substitui a fonte
macro.

## Padrões CRUD

- Lista, detalhe, criação e edição reutilizam o mesmo `PageHeader`, configurado
  por props ou configuração. A marcação do cabeçalho não é duplicada.
- Listas usam `DataGrid` em toda a largura disponível e exibem sempre uma
  coluna `ID`.
- A seção 10 da spec declara as operações incluídas em `Operações`.
  Quando listagem e detalhe estiverem no escopo, a linha de `DataGrid` abre o
  detalhe por clique e teclado. Controles internos ficam acima do link.
  `Editar` e `Apagar` são ações independentes quando declaradas.
- Todas as telas exibem `Breadcrumb` com a equipe ativa, o módulo e a tela
  atual. Em Laravel, a implementação existente do layout é reaproveitada.
- Detalhes usam `PageHeader` e `DetailLists`.
- Criar e editar usam `PageHeader` e seções em duas colunas responsivas, com
  coluna de contexto e painel de campos.
- Labels ficam acima dos campos.
- Falha de campo usa estado vermelho e mensagem abaixo do campo, com associação
  semântica e foco no primeiro erro.
- Estados de loading, vazio, erro, sucesso, permissão, parcial e não salvo são
  tratados quando o fluxo os possuir.

## Revisão visual durante o desenvolvimento

Toda tarefa que puder alterar a interface passa por revisão visual durante o
desenvolvimento, mesmo sem pedido específico. A conferência cobre bordas,
espaçamentos, margens, padding, tipografia, alinhamento, largura, overflow,
foco, zoom e conteúdo curto ou longo nos viewports e estados aplicáveis. O
resultado, o método, os viewports, os estados e os ajustes ficam no item
`VISUAL` da tarefa. Para tarefa sem interface, registre `Não aplicável` com o
motivo concreto.

## Padrões de dashboard e catálogo

- Dashboards começam com pergunta, `PageHeader`, período ou escopo e filtros.
- Indicadores `KPI` mostram valor, unidade, período, comparação e fonte.
- A visualização principal tem alternativa textual ou tabular e é seguida por
  lista ou `DataGrid` para investigação.
- Primitives shadcn/ui atendem controles fundamentais; blocos gratuitos ReUI
  aceleram composições compatíveis de CRUD e dashboard.
- `INTERFACE.md` registra origem, estados, acessibilidade e consumidores de cada
  primitive ou bloco reaproveitado.

## Owners

| Fonte | Owner | Conteúdo |
| --- | --- | --- |
| `skills/templates/DESIGNSYSTEM.MD` | framework | defaults comuns de interface, CRUD, dashboards e cenários canônicos |
| `specsfy-setup` | framework | criação do arquivo na raiz quando ausente e preservação do conteúdo local |
| `DESIGNSYSTEM.MD` | projeto consumidor | linguagem, exceções e regras macro locais |
| `INTERFACE.md` | projeto consumidor | componentes, blocos, telas e consumidores |
| `spec.md` | projeto consumidor | comportamento e aceite da entrega |
| `specialists/specsfy-specialist-*` | framework | orientação por etapa e tecnologia |

## Atualize quando

- um padrão macro de interface mudar.
- uma nova superfície CRUD entrar no contrato.
- um padrão comum de dashboard, primitive ou bloco de catálogo entrar no
  contrato.
- a relação entre `DESIGNSYSTEM.MD` e `INTERFACE.md` mudar.
- o instalador ou o catálogo alterar a disponibilidade das skills.
- um padrão macro, cenário CRUD ou owner da interface mudar.

## Validação

Use o contrato em `tests/features/interface_design_system.feature`, o teste
focal de design system, `npm run validate:skills`, `npm test` na raiz e os
testes do CLI. Confira também que o instalador publica o template e que o
catálogo resolve as dependências da interface.

## Não use para

- documentar uma tela específica do projeto consumidor.
- substituir a spec, `DESIGNSYSTEM.MD` ou `INTERFACE.md`.

## Fonte da verdade e precedência

O `AGENTS.md` do módulo orienta a execução. O template em
`skills/templates/DESIGNSYSTEM.MD` define os defaults publicados. O arquivo
`DESIGNSYSTEM.MD` do consumidor registra as regras ativas e as exceções com
alcance. A spec governa o comportamento da entrega e as fontes executáveis
comprovam o estado implementado.

<!-- markdownlint-enable MD013 -->
