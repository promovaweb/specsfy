# Checklist de Qualidade de Interface

<!-- markdownlint-disable MD013 -->

Use antes de finalizar uma tela ou componente.

## Estrutura

- A tela tem um objetivo principal claro.
- A hierarquia visual guia o usuário na ordem certa.
- A primeira área visível comunica produto, oferta e ação sem depender de texto escondido.
- Seções repetidas variam o ritmo visual sem parecer aleatórias.
- Contêineres, largura máxima e espaçamento vertical estão consistentes.

## Design system e CRUD

- `DESIGNSYSTEM.MD` foi lido antes da escolha dos assets.
- Toda tela renderiza `Breadcrumb` com equipe, módulo e título atual; Laravel
  reutiliza o componente existente do shell.
- Toda superfície CRUD tem `PageHeader` com contexto, título e ação principal
  quando aplicável.
- Todas as telas CRUD reutilizam o mesmo `PageHeader`, variando props ou
  configuração sem duplicar a marcação.
- Listas usam `DataGrid` em largura total, com a coluna `ID` visível, para
  comparação, filtros, ordenação e paginação.
- A linha inteira do `DataGrid` abre o detalhe por clique e teclado; as ações de
  editar e apagar permanecem independentes dentro da linha.
- Detalhes usam `DetailLists` para organizar atributos e status.
- Criar e editar usam seções com coluna de contexto e painel em duas colunas
  responsivas; no mobile, os campos refluem para uma coluna.
- Labels ficam acima dos campos e não dependem de placeholder.
- Erros de campo usam estado visual vermelho, mensagem abaixo do campo, foco e
  associação semântica.
- Exceções ao design system têm alcance registrado no documento do projeto.
- Dados, linguagem e estados do produto dão personalidade à composição.

## Responsividade

- A versão móvel não tem rolagem horizontal indesejada.
- Grades viram uma coluna quando necessário.
- Texto longo cabe dentro de botões, cartões e colunas.
- Imagens usam `aspect-*`, `object-cover` ou dimensões estáveis.
- Barras de navegação, rodapés e formulários continuam utilizáveis em telas pequenas.

## Acessibilidade

- Entradas têm um `label` associado.
- Botões ou links formados apenas por ícone têm `sr-only` ou `aria-label`.
- SVG decorativo usa `aria-hidden="true"`.
- Imagens informativas têm um `alt` útil; imagens decorativas usam `alt=""`.
- Regiões semânticas fazem sentido: `header`, `main`, `section`, `article`,
  `footer`, `nav`, `form`.
- Foco e estados interativos são visíveis.

## Dados e Estado

- Listas usam chaves estáveis.
- Dados simulados são fáceis de substituir.
- Links `href="#"` foram trocados quando rotas reais existem.
- Formulários têm estados de erro e sucesso quando a ação importa.
- Listas, detalhes e formulários cobrem loading, vazio, erro, sucesso e
  ausência de permissão quando esses estados fazem parte do fluxo.
- Ações destrutivas pedem confirmação quando aplicável.

## Visual

- Durante o desenvolvimento, a revisão visual ocorre mesmo sem pedido
  específico e confere bordas, espaçamentos, margens, padding e tipografia.
- O modo escuro foi preservado quando existia na referência.
- As cores não formam uma paleta monótona sem contraste.
- CTAs principais usam uma cor consistente.
- Cartões não ficam aninhados sem necessidade.
- O texto não sobrepõe imagens de forma ilegível.
- Imagens externas são adequadas ao domínio ou foram substituídas por recursos
  reais.

## Integração

- Imports correspondem às dependências do projeto.
- Componentes locais existentes foram preferidos quando há um design system.
- `Link`, `Button`, `Input`, `Avatar` ou adaptadores locais foram usados se o
  aplicativo já os possui.
- Nenhuma biblioteca nova foi introduzida sem necessidade.

## Validação

- Se existe um aplicativo executável, rode lint, verificação de tipos, testes ou
  servidor de desenvolvimento conforme o projeto.
- Para uma UI significativa, verifique capturas de tela em desktop e dispositivo
  móvel quando possível.
- Se não foi possível validar, registre isso na resposta final.

<!-- markdownlint-enable MD013 -->
