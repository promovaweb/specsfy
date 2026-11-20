# Padrões de UI para sistemas e dashboards

<!-- markdownlint-disable MD013 -->

## Escolha de shell

| Necessidade dominante | Estrutura inicial | Comprovação para escolher |
| --- | --- | --- |
| alternar entre áreas estáveis | sidebar + header contextual | cinco ou mais destinos recorrentes |
| comparar coleção e item | master-detail ou rotas ligadas | retorno frequente ao mesmo recorte |
| acompanhar saúde e exceções | dashboard filtrável | perguntas e ações definidas por métrica |
| cumprir sequência obrigatória | workflow/stepper | etapas finitas e dependentes |
| editar configuração extensa | categorias + busca | grupos estáveis e baixa frequência |

Não use dashboard como sinônimo de home autenticada. Se não houver perguntas,
comparações ou exceções explícitas, escolha navegação orientada à tarefa.

## Design system e CRUD

Antes da composição, leia `DESIGNSYSTEM.MD` e aplique seus defaults. Para uma
superfície CRUD, use `PageHeader` em todas as páginas, `DataGrid` na lista,
`DetailLists` no detalhe e formulários em seções com duas colunas responsivas em
criar e editar. Labels ficam acima dos campos e a mensagem de erro aparece em
vermelho abaixo do campo. O shell renderiza `Breadcrumb` em toda tela, com a
equipe ativa, o módulo e a tela atual; em Laravel, reutilize o componente
existente.

## Hierarquia e densidade

- Ordene por tarefa e consequência de falha, não pelo tamanho disponível do
  componente.
- Use proximidade para formar grupos, alinhamento para comparação e contraste
  para prioridade; não dependa apenas de escala tipográfica.
- Mantenha a ação primária única por região. Ações secundárias podem coexistir
  quando não competem visualmente nem têm consequência semelhante.
- Em superfícies operacionais frequentes, privilegie escaneamento e comparação;
  em onboarding e escolhas raras, privilegie explicação e prevenção de erro.
- Permita que densidade altere espaço, não significado ou conjunto de ações.
- Separe cada seção de formulário em coluna de contexto e painel de campos;
  use duas colunas nos breakpoints largos e uma no mobile.
- Faça a linha do DataGrid abrir o detalhe por clique e teclado; reserve ações
  internas para uma camada acima do link da linha.

## Dados e componentes

| Componente | Contrato mínimo |
| --- | --- |
| KPI | nome, valor, unidade, período, comparação, origem e estado |
| chart | pergunta, escala honesta, legenda, período e alternativa textual |
| table | headers, ordenação, seleção, ações, paginação e vazio |
| filter | estado visível, contagem, limpar e URL quando compartilhável |
| form | label, ajuda, required, erro contextual, submit e preservação |
| destructive action | objeto afetado, consequência, confirmação proporcional e recuperação |

- Use tabela quando colunas precisam ser comparadas entre linhas.
- Use lista quando a leitura sequencial domina e cards quando cada entidade tem
  estrutura própria; cards idênticos não substituem uma tabela.
- Reserve cor semântica para estado. Não codifique séries de chart com tokens
  de erro, alerta e sucesso se as séries não têm esse significado.
- Mostre `0`, indisponível, atrasado e não autorizado como estados diferentes.

## Tokens e componentes

Defina tokens em camadas:

1. primitivos: escalas de cor, espaço, tipografia, radius e elevation;
2. semânticos: `surface`, `text-muted`, `border-danger`, `focus-ring`;
3. componente: somente quando a semântica não é compartilhável.

Uma variante nova precisa representar estado ou uso recorrente, não uma tela
isolada. Antes de criá-la, compare props, slots e tokens dos componentes
existentes e registre por que composição não resolve.

## Responsividade

- Defina breakpoints quando o conteúdo perde integridade, não por nomes de
  dispositivo.
- Preserve tarefa, ordem de leitura e ações; colapsar não pode esconder a única
  forma de concluir o fluxo.
- Troque tabelas por outra representação somente se o contrato de comparação
  continuar disponível.
- Teste o menor viewport suportado com conteúdo real e zoom. `overflow: hidden`
  não corrige layout.
- Reserve dimensões de mídia para evitar layout shift e mantenha texto legível
  sobre imagens em todas as variantes.

## Estados e casos extremos

| Estado | Pergunta de revisão |
| --- | --- |
| loading | estrutura preserva contexto sem prometer dado inexistente? |
| empty | explica por que está vazio e oferece próximo passo possível? |
| partial | distingue dados disponíveis, atrasados e falhos? |
| error | informa impacto, recuperação e preserva entrada? |
| offline | separa dado local, stale e ação que exige rede? |
| permission denied | evita vazar existência e mostra caminho autorizado? |

## Comprovação de revisão

- screenshots comparáveis dos estados críticos em viewport estreito e largo;
- mapa de tokens/componentes novos e justificativa de variantes;
- conteúdo curto, longo, traduzido e números extremos sem truncamento destrutivo;
- percurso completo por teclado com foco visível;
- zoom, reflow, contraste, forced colors e reduced motion quando aplicáveis;
- ação principal e consequência compreensíveis sem depender de cor ou posição.

<!-- markdownlint-enable MD013 -->

## Fontes oficiais

<!-- markdownlint-disable MD034 -->

- Material Design 3: https://m3.material.io/
- Carbon Design System: https://carbondesignsystem.com/
- USWDS Components: https://designsystem.digital.gov/components/overview/
- USWDS Design Tokens: https://designsystem.digital.gov/design-tokens/
- GOV.UK Design System: https://design-system.service.gov.uk/
- WAI-ARIA APG patterns: https://www.w3.org/WAI/ARIA/apg/patterns/
- Web Content Accessibility Guidelines 2.2: https://www.w3.org/TR/WCAG22/

<!-- markdownlint-enable MD034 -->
