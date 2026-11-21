# Design system de interface

`DESIGNSYSTEM.MD` é o documento do projeto consumidor que guarda as orientações
gerais de interface. Ele orienta cada tela nova junto das regras de domínio,
das permissões, dos estados e das telas relacionadas.

## Onde fica

Depois de `specsfy install`, o template fica disponível em
`.specsfy/templates/DESIGNSYSTEM.MD`. Ao executar o setup, o Specsfy cria
`DESIGNSYSTEM.MD` na raiz somente se ele ainda não existir. O arquivo é humano,
pertence ao projeto e fica sob a manutenção da skill especialista, não do lock
do CLI.

Instale a skill quando for criar ou revisar uma interface:

```bash
specsfy skills install specsfy-specialist-interface
```

O mesmo especialista cobre a descoberta de interface, o design system, o UI, o
UX e a acessibilidade web. Os componentes visuais prontos ficam com
`specsfy-specialist-ui-components`.

## Como funciona

Antes de projetar uma tela, o agente lê `DESIGNSYSTEM.MD`. Sem uma direção
visual sua, os defaults do arquivo são aplicados e registrados como direção
padrão da entrega. Uma solicitação diferente entra em `Exceções da entrega`
com alcance definido. Uma exceção de tela não muda o
produto inteiro.

`INTERFACE.md` continua registrando componentes, blocos, telas, props, eventos,
estados e consumidores locais. Ele aponta para o design system e não repete as
orientações gerais.

## Defaults para CRUD

| Tela | Composição padrão |
| --- | --- |
| Lista | `PageHeader` compartilhado + resumo útil + `DataGrid` em largura total |
| Detalhe | `PageHeader` compartilhado + `DetailLists` |
| Criar | `PageHeader` compartilhado + seções de formulário em duas colunas responsivas |
| Editar | `PageHeader` compartilhado + seções de formulário em duas colunas responsivas |

O `PageHeader` é um componente único, configurado por props ou configuração
para título, descrição, breadcrumb e ações. Lista, detalhe, criação e edição
reutilizam essa mesma implementação; não duplicam sua marcação.

A lista mostra o `ID` em uma coluna visível do `DataGrid`. Cada linha
inteira é o link para o detalhe, com suporte a mouse e teclado. Os botões
`Editar` e `Apagar` ficam na própria linha como ações independentes e não
disparam a navegação do detalhe. A permissão e a confirmação da ação destrutiva
também fazem parte do contrato.

Formulários usam labels visíveis acima dos campos. Quando um campo falha, ele
fica com estado visual vermelho e mostra a mensagem abaixo do campo. O foco vai
para o primeiro erro, os outros valores permanecem preenchidos e o resumo de
erros oferece links quando há várias falhas.

Toda tela também exibe um `Breadcrumb` no shell global. A trilha mantém o nome
do team ativo visível entre a área inicial e o módulo, seguida do título da
tela atual. Em Laravel, o padrão deve reaproveitar o `Breadcrumb` ou
`Breadcrumbs` que já existir no layout, suas rotas e sua tipagem, sem criar uma
segunda implementação.

As linhas do `DataGrid` abrem o detalhe inteiro por clique ou teclado. Botões,
checkboxes e menus da linha permanecem ações independentes, acima do link de
detalhe.

Criar e editar são divididos em seções. Cada seção tem uma explicação à esquerda e
um painel de campos à direita; os campos relacionados usam duas colunas em telas
largas e uma coluna no mobile. Campos longos, uploads e erros podem ocupar toda
a largura.

## Defaults para dashboards e blocos

Dashboards começam com `PageHeader`, período ou escopo, filtros, indicadores
`KPI` contextualizados, uma visualização principal e uma lista ou `DataGrid`
para investigação. Use primitives do `shadcn/ui` para controles fundamentais e
blocos gratuitos do ReUI para composições comuns de CRUD e dashboard quando
forem compatíveis com a stack. Registre origem, estados, acessibilidade e
consumidores em `INTERFACE.md`.

## Cenários a cobrir

Uma entrega de interface registra os cenários do template que se aplicam a ela:

- lista com registros e lista vazia;
- detalhe com status, ações e relações relevantes;
- criação e edição válidas;
- criação ou edição com erro de campo;
- ausência de permissão;
- falha de carregamento;
- alteração pendente ao sair da tela;
- ação destrutiva e seu resultado.

Para cada cenário, descreva pré-condição, ação, resposta, estado visual, foco,
mensagem e próximo passo. A personalidade do produto vem das informações
exibidas, da linguagem, dos tokens, do ritmo e da hierarquia, não de uma
decoração genérica.

## Revisão visual durante o desenvolvimento

Toda tarefa que altera interface passa por uma revisão visual durante o
desenvolvimento, mesmo sem uma solicitação específica. Confira bordas, espaçamentos,
margens, padding e tipografia, incluindo família, peso, tamanho, altura de
linha, espaçamento entre letras, hierarquia e quebra de texto. Confira também
alinhamento, largura, overflow, foco, zoom e conteúdo curto ou longo nos
viewports e estados aplicáveis.

Registre no item `VISUAL` da tarefa o método usado, os viewports, os estados,
os ajustes feitos e o resultado. Quando a tarefa não tem interface, registre
`Não aplicável` e o motivo concreto.

## Quando não usar

O `DESIGNSYSTEM.MD` não lista props ou arquivos de um componente, assim como o
`INTERFACE.md` não substitui as orientações gerais. Uma tela CRUD também não
deve ser criada sem consultar a fonte, tratar os estados e registrar as
exceções ao default.

## Conferência

Antes de concluir uma tela, confira:

- `DESIGNSYSTEM.MD` existe e foi lido.
- A tela exibe `Breadcrumb` com team, módulo e tela atual. Em Laravel, o
  componente existente foi reaproveitado.
- A composição corresponde à superfície CRUD.
- Loading, vazio, erro, sucesso, permissão e alteração pendente foram cobertos
  quando aplicáveis.
- A direção padrão ou a exceção tem alcance registrado.
- `INTERFACE.md` recebeu os componentes e telas locais.
