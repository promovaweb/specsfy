# Experiência de Interface

O especialista Experiência de Interface coordena a entrega de telas,
dashboards, listas, formulários e CRUDs. Ele lê o sistema atual e a stack,
conduz as perguntas sobre a interface e garante uma fase própria de interface
nas tarefas da spec. Os especialistas de UX, UI e componentes entram em
seguida.

## Quando usar

- Você vai criar ou alterar uma tela, um dashboard, uma lista, um formulário,
  uma jornada ou um CRUD usado no produto.
- A entrega envolve UX, UI e implementação sobre um sistema que ainda não foi
  examinado.

Endpoints, jobs e mudanças internas sem tela ficam fora deste especialista. Para
esses casos, use o especialista da tecnologia ou do domínio envolvido.

## Como ele trabalha

1. Carrega o `$specsfy-setup` e lê `.specsfy/STACK.md`, `.specsfy/PACKAGES.md`,
   os manifests e a documentação atual.
2. Carrega o especialista Design System e lê o `DESIGNSYSTEM.MD`. Quando o
   arquivo não existe, cria a partir do template do Specsfy.
3. Executa o inspetor de interface para localizar rotas, componentes e
   tecnologias:

   ```bash
   node .agents/skills/specsfy-setup/scripts/inspect_interface.mjs \
     --project <raiz>
   ```

4. Examina telas, fluxos, permissões, estados e testes da área afetada.
   Registra o que já funciona, o que permanece e o que a entrega muda.
5. Identifica framework, roteamento, primitives, estilos, formulários e runner
   de testes, mantendo a tecnologia atual até a sua confirmação de uma troca.
6. Pergunta apenas sobre lacunas reais, uma de cada vez, com opções
   compatíveis com o sistema atual e as alternativas `Escrever outra resposta`,
   `Gere outras opções` e `Avançar`. Sem direção visual sua, aplica os
   defaults do `DESIGNSYSTEM.MD`.
7. Registra na seção 10 da spec a stack observada, cada tela, o fluxo, os
   formulários, os estados e a acessibilidade.
8. Cria na seção 14 a `Fase de interface`, com uma tarefa e os testes
   correspondentes para cada tela.
9. Chama os especialistas de UX e de UI. Em projetos React, carrega
   Componentes React e React antes de escrever JSX ou TSX.

## Telas de um CRUD

Um CRUD não fica restrito a API, banco ou serviço. A seção 10 da spec descreve
as três telas que ele exige:

- Lista com `PageHeader` e `DataGrid` em largura total, com a coluna `ID`, os
  botões de editar e apagar e a linha clicável para o detalhe.
- Detalhe com `PageHeader` e `DetailLists`.
- Criar e editar com `PageHeader` e seções de formulário em duas colunas
  responsivas.

O `PageHeader` é o mesmo componente nas três telas. Cada tela também mostra o
`Breadcrumb` com o team ativo, o módulo e a tela atual. Em Laravel, o agente
reaproveita o componente do layout.

## Padrões aplicados

- Cada tela, ação, formulário, estado e retorno aparece no plano.
- A stack, os componentes e a navegação existentes são preservados.
- Teclado, foco, responsividade e mensagens ficam registrados junto da tela.
- O `DESIGNSYSTEM.MD` é a fonte das orientações gerais e o `INTERFACE.md`
  guarda o registro local.
- Bordas, espaçamentos e tipografia são conferidos durante o desenvolvimento,
  com o resultado no item `VISUAL` da tarefa.
- O erro de campo aparece em vermelho, com mensagem abaixo do campo.
- A hierarquia segue as informações, a linguagem e os estados do produto, sem
  composição genérica.

## Erros que ele evita

- Propor uma tela sem ler as rotas e os componentes atuais.
- Tratar um CRUD como endpoint sem descrever a interação na tela.
- Validar somente o caminho de sucesso e ignorar vazio, erro e permissão.

## Como conferir o resultado

- Você recebeu as perguntas sobre as telas em toda entrega que cria ou altera
  uma interface.
- A seção 10 registra a stack e o sistema atual antes da proposta.
- O `DESIGNSYSTEM.MD` foi lido ou criado, com a direção padrão ou a exceção
  registrada.
- `validate_spec.mjs`, `validate_tasks.mjs` e `validate_interface_tasks.mjs`
  rodaram conforme a etapa.
- Celular e desktop, carregamento, vazio, erro, sucesso, permissão, teclado e
  foco foram verificados.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-interface-experience \
  --agent universal --copy --full-depth
```

O catálogo instala junto os especialistas Design System, UX Design e UI
Design.

## Especialistas relacionados

- [Design System](design-system.md) define as orientações gerais, os defaults
  e os cenários de CRUD.
- [UX Design](ux-design.md) cuida da jornada, das tarefas e do conteúdo.
- [UI Design](ui-design.md) cuida da composição visual e dos estados.
- [Componentes React](react-ui-components.md) seleciona e reaproveita
  componentes nas telas React.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-interface-experience/SKILL.md),
com fontes de acessibilidade e de inspeção de interfaces no arquivo de
referência da mesma pasta.
