---
name: specsfy-specialist-ux-design
description: Investigar, estruturar e validar experiências com pesquisa, arquitetura da informação, jornadas, fluxos, formulários, onboarding e recuperação de erros. Use para problemas de usabilidade, fluxo, descoberta, conteúdo ou validação com usuários; não reduza UX a acabamento visual.
---

# Design de experiência

## Quando usar

- Acionar para investigar comportamento, estruturar jornadas, arquitetura da
  informação, formulários, onboarding, conteúdo e recuperação de erros.
- Acionar quando há dúvida sobre o problema, a sequência, a linguagem ou a
  capacidade de uma pessoa concluir uma tarefa.
- Não acionar para acabamento visual isolado; usar
  `$specsfy-specialist-ui-design` quando intenção e fluxo já estão validados.
- Combinar com `$specsfy-specialist-prototyping` quando uma suposição precisar
  de artefato descartável antes de implementação.

## Fluxo

1. Carregar `$specsfy-specialist-design-system` e ler `DESIGNSYSTEM.MD` antes
   de propor a solução. Quando a entrega criar ou mudar uma interface para
   pessoas, conduzir a descoberta. Perguntar, pelo contrato central, que
   telas existem, como a informação percorre o fluxo, quais campos e
   validações entram no formulário e como cada ação abre: página, painel
   lateral, modal, área expandida ou outro formato. Se a pessoa não informar
   direção visual, aplicar os defaults do `DESIGNSYSTEM.MD`; perguntar sobre
   composição somente quando houver conflito ou lacuna de tarefa. Reaproveitar
   contexto já confirmado e perguntar somente o que falta.
2. Ler a stack e as telas existentes antes de sugerir um fluxo
   visual. A jornada deve usar a tecnologia e os padrões observados; se a
   camada de interface não estiver clara, encaminhar a pergunta para a pessoa.
   Examinar o sistema atual para identificar o que a pessoa já vê, faz e espera
   em cada tela afetada antes de propor uma alteração.
3. Formular a suposição de comportamento antes de escolher método; definir
   público, contexto, frequência e consequência de falha.
4. Mapear material existente e marcar separadamente fato observado,
   inferência, suposição e preferência interna.
5. Selecionar método proporcional à pergunta e ao impacto de falha usando
   [references/standards.md](references/standards.md); definir recrutamento,
   consentimento, roteiro e regra de parada.
6. Mapear jornada atual com entradas, escolhas, esperas, erros, canais,
   dependências e handoffs; não apagar exceções críticas.
7. Prototipar na fidelidade mínima que torne a suposição testável sem simular
   comportamento que altere o resultado.
8. Conduzir sessões com tarefas e prompts neutros, registrando sucesso, erro,
   tempo, hesitação, compreensão e citações relevantes.
9. Sintetizar achados por comprovação, severidade, alcance e impacto; separar
   claramente achado, interpretação, recomendação e questão aberta.

Não escolher painel lateral, modal ou outro padrão por preferência interna.
Registrar a resposta textual da pessoa e encaminhar a composição para
`$specsfy-specialist-ui-design`. Para CRUD, cobrir lista com linha clicável,
vazio, detalhe, criação e edição em seções de duas colunas responsivas, erro de
campo, ausência de permissão e falha de carregamento.

## Padrões

- Usar linguagem do domínio e revelar complexidade progressivamente.
- Manter status do sistema, próximo passo e possibilidade de recuperação visíveis.
- Pedir informação no momento necessário e explicar o motivo.
- Evitar confirmação para ações triviais; oferecer undo quando mais seguro.
- Preservar dados após erro e apontar correção no contexto.
- Projetar onboarding como caminho para valor, não tour obrigatório.
- Não usar dark patterns, urgência artificial ou consentimento ambíguo.
- Usar a hierarquia de dados e linguagem do produto para dar personalidade à
  experiência, mantendo `PageHeader`, `DataGrid`, `DetailLists` e formulários
  em seções de duas colunas responsivas nos defaults do sistema.
- Manter `Breadcrumb` em todas as telas, com a equipe ativa, o módulo e a tela
  atual. Em Laravel, reaproveitar o componente que o shell já renderiza.

## Antipadrões

- Perguntar “você gostou?” ou apresentar a solução antes da tarefa; mede
  cortesia e racionalização, não capacidade de uso.
- Transformar uma única sessão ou fala em regra universal; sem recorrência,
  contexto e triangulação, a comprovação não sustenta abrangência.
- Recrutar apenas colegas ou especialistas quando o produto serve iniciantes;
  o vocabulário e os atalhos observados deixam de representar o público.
- Entregar uma lista de soluções sem rastrear cada item ao achado; preferência
  da equipe passa a parecer conclusão de pesquisa.
- Medir apenas tempo sem distinguir abandono, sucesso assistido e erro crítico;
  o número mascara a qualidade real da conclusão.

## Validação

- Demonstrar que cada pergunta de pesquisa tem método, participante e
  comprovação compatíveis com a escolha que pretende orientar.
- Rastrear achados até notas ou gravações consentidas e recomendações até
  achados; anonimizar dados conforme política do projeto.
- Incluir públicos, dispositivos, contextos e tecnologias assistivas
  relevantes ao impacto da tarefa, registrando lacunas de recrutamento.
- Revalidar mudanças estruturais com as mesmas tarefas críticas e comparar
  sucesso independente, erro e compreensão.
- Não declarar uma experiência “intuitiva” ou validada sem comprovação observada
  e limites explícitos da amostra.

## Skills relacionadas

- `$specsfy-specialist-reui` para a composição React depois de validar jornada
  e tarefas.
- `$specsfy-specialist-interface-experience` para organizar telas, ações e
  estados da interface durante a descoberta.
- `$specsfy-specialist-ui-design` materializa hierarquia visual e estados
  depois que tarefa e fluxo estão definidos.
- `$specsfy-specialist-design-system` define defaults, exceções por alcance e
  cenários CRUD antes da arquitetura de informação.
- `$specsfy-specialist-prototyping` cria o artefato mínimo para testar uma
  suposição de interação.
- `$specsfy-specialist-web-accessibility` avalia conformidade e uso com
  tecnologias assistivas além do recorte de pesquisa.
- `$specsfy-specialist-domain-modeling` alinha vocabulário e invariantes quando
  a experiência atravessa regras complexas do domínio.

Leia [references/standards.md](references/standards.md) para escolher método,
estruturar pesquisa, avaliar formulários, conteúdo, onboarding e serviços.
