# Interface

O especialista Interface ajuda você a planejar, projetar e conferir telas,
dashboards, formulários e CRUDs. Ele parte das tarefas que as pessoas precisam
realizar e do que já funciona no projeto. A spec descreve a entrega,
`DESIGNSYSTEM.MD` guarda as regras gerais e `INTERFACE.md` registra as telas e
os componentes locais.

## Quando usar

- Use **Discovery** para entender as telas e a stack atuais antes de propor
  uma entrega.
- Use **Design System** para definir regras de várias telas ou registrar uma
  exceção visual com alcance explícito.
- Use **UX** para descobrir se as pessoas encontram e concluem uma tarefa.
- Use **UI** para compor ou revisar a hierarquia, o layout, a densidade e os
  estados das telas.
- Use **Acessibilidade** para corrigir ou auditar barreiras de uso e requisitos
  da WCAG.

Para escolher ou adaptar componentes React, combine com
[Componentes de UI](ui-components.md). Para contratos de API ou mudanças
arquiteturais sem telas, use [Arquitetura](architecture.md).

## Como ele trabalha

O agente examina a área afetada, aplica o design system e pergunta sobre as
lacunas que impedem a tarefa de avançar. Os modos entram conforme o pedido.
Uma entrega de tela nova normalmente passa de Discovery e Design System para
UX e UI, com critérios de acessibilidade mapeados desde a spec.

Por exemplo, peça “Reorganize a lista de pedidos para que a equipe encontre
pedidos atrasados e volte do detalhe sem perder os filtros”. O agente
confere a rota e os filtros atuais, registra o retorno do detalhe na spec e
verifica a lista com dados, vazia e sem permissão.

## Discovery

O agente usa `$specsfy-setup` e lê a stack, os pacotes, as rotas, as telas
e os testes. Ele roda o inspetor para localizar tecnologias e componentes.

```bash
node .agents/skills/specsfy-setup/scripts/inspect_interface.mjs \
  --project <raiz>
```

Depois, registra o que a pessoa já consegue fazer e o que precisa mudar. As
perguntas tratam de uma lacuna por vez, como campos do formulário ou se uma
ação abre em página, painel lateral, modal ou área expandida.

A seção 10 da spec registra stack, telas, fluxo, formulários, estados e
acessibilidade. A seção 14 registra a `Fase de interface`, com uma tarefa por
tela e verificações de navegação, formulário, validação, feedback e teclado.

## Design System

Se `DESIGNSYSTEM.MD` ainda não existir, o agente cria o arquivo a partir do
template gerenciado e incorpora o que já foi confirmado. Ele aplica os
defaults do projeto ou registra a regra substituída e o alcance da exceção.
O documento mantém política, estados, cenários e histórico.

Em um CRUD, o mesmo `PageHeader` aparece na lista, no detalhe e nos
formulários. A lista usa `DataGrid` em largura total com a coluna `ID`, link
para o detalhe na linha e ações independentes de editar e apagar. O detalhe
usa `DetailLists` para organizar atributos e status. Criar e editar usam
seções com uma coluna de contexto e um painel com duas colunas de campos em
telas largas e uma no celular.

Todas as telas mostram `Breadcrumb` com a equipe ativa, o módulo e a tela
atual. Em Laravel, o agente reaproveita o componente e os tipos do layout.
Os campos têm labels, ajuda quando necessária e erro em vermelho abaixo do
controle, com a mensagem associada ao campo e foco no primeiro erro. Vários
erros aparecem também em um resumo com links para correção. Os valores
digitados são preservados.

O agente verifica lista com dados e vazia, detalhe, criação e edição
válidas e inválidas, falta de permissão e falha de carregamento. Alteração
pendente e ações destrutivas entram quando fizerem parte do fluxo.

## UX

O agente formula a pergunta sobre o comportamento, identifica o público e
escolhe como investigar. Entrevista contextual e observação ajudam a
entender o fluxo atual. Um teste de tarefa mostra onde as pessoas hesitam,
erram, pedem ajuda ou abandonam o percurso. Quando for preciso testar uma
interação antes de implementá-la, use um protótipo simples com
[Pesquisa](research.md).

As sessões usam instruções neutras, recrutamento adequado e registro
consentido. O agente liga recomendações a achados verificáveis e registra
os limites da amostra. Também mantém status, próximo passo e recuperação
visíveis, usa a linguagem do domínio e conduz o onboarding ao primeiro
resultado útil. Para decisões sobre vocabulário e regras do domínio,
combine com [Modelagem](modeling.md).

## UI

O agente usa a jornada definida, a stack e os tokens do projeto para
organizar a tela. A tabela ajuda a comparar registros, a lista favorece
leitura sequencial e os cards cabem quando as entidades têm estruturas
distintas. Ao voltar de um detalhe, filtros e posição são preservados.

Um dashboard parte da pergunta que precisa responder. Ele mostra período ou
escopo e filtros, uma faixa curta de indicadores com unidade, comparação e
fonte, a tendência ou distribuição e um caminho para investigar os dados.
Gráficos têm alternativa textual ou tabular. O agente confere os estados
de carregamento, vazio, erro, atualização, dados parciais e falta de
permissão quando aplicáveis.

Durante o desenvolvimento, compara bordas, espaçamentos, margens, padding e
tipografia em estados e tamanhos de tela relevantes. O item `VISUAL` da
tarefa registra como a revisão foi feita e o que precisou de ajuste.

## Acessibilidade

O agente confirma o nível da WCAG, o escopo da auditoria, os navegadores e
as tecnologias assistivas. Ele corrige primeiro o HTML nativo e verifica
o nome, o papel, o valor e o estado de cada controle. Modais precisam
funcionar por teclado, manter o foco no conteúdo aberto e devolvê-lo ao
gatilho ao fechar.

A conferência inclui aumento de texto a 200%, reflow com largura
equivalente a 320 CSS px, contraste, espaçamento, visibilidade do foco e,
quando aplicável, tamanho dos alvos, orientação, forced colors e reduced
motion. O agente combina ferramentas automáticas com inspeção da árvore
de acessibilidade, teste manual e leitor de tela nos fluxos principais.
Cada achado inclui o critério, o impacto, como reproduzir e como verificar
a correção.

## Como conferir o resultado

- A spec cobre as telas e os caminhos de sucesso, erro e recuperação.
  `validate_spec.mjs`, `validate_tasks.mjs` e
  `validate_interface_tasks.mjs` são usados conforme a etapa.
- As regras gerais e as exceções foram registradas. Componentes locais têm
  origem, estados e consumidores documentados.
- O item `VISUAL` vem antes de `EVIDENCE`. Capturas de tela ou inspeção
  equivalente mostram os estados e viewports críticos com conteúdo real.
- Achados de UX e declarações de conformidade indicam as evidências, o
  escopo e as limitações. O fluxo crítico funciona por teclado.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-interface --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Componentes de UI](ui-components.md) adapta exemplos TSX, ReUI e shadcn/ui
  aos requisitos da interface.
- [React](react.md) e [Next.js](nextjs.md) orientam a implementação na stack.
- [Tailwind CSS](tailwind-css.md) aplica tokens e variantes da interface.
- [Code Review](code-review.md) amplia a revisão para outras falhas.

## Referência técnica

O agente segue as instruções do
[SKILL.md de Interface](../../../specialists/specsfy-specialist-interface/SKILL.md).
Cada modo tem uma referência para métodos, regras e validações.
