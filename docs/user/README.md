# Guia completo do usuário

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="../../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../../brand/logo/icon.png" alt="Logo do Specsfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

O Specsfy ajuda você a transformar uma ideia em software testado sem espalhar
requisitos, planos e tarefas por vários arquivos. Você conversa normalmente
com o agente, e as skills organizam o trabalho em uma única especificação.
Nesse arquivo, você consegue conferir o que será entregue, quais testes
comprovam o comportamento e o que já foi concluído.

Este guia começa pela lógica da metodologia, prepara o ambiente e acompanha
uma entrega completa. Os capítulos seguintes explicam a rotina com o CLI, as
mudanças posteriores e os recursos avançados. Você não precisa conhecer a
implementação do framework para seguir esse percurso.

::: {.online-only}

## Leia online ou como ebook

Este mesmo percurso compõe a edição portátil **v1.8.0**. Use o PDF para leitura
e impressão ou o EPUB em leitores que permitem ajustar fonte e tamanho:

- [PDF](../../ebook/Specsfy-Guia-do-Usuario-v1.8.0.pdf), para leitura,
  compartilhamento e impressão.
- [EPUB](../../ebook/Specsfy-Guia-do-Usuario-v1.8.0.epub), para leitores
  digitais com fonte e tamanho ajustáveis.

Os dois formatos são reconstruídos a partir destas páginas. O
[manifesto da edição](../../ebook/build.json) informa a versão vigente e os
hashes usados para conferir se o PDF e o EPUB correspondem ao mesmo build.

:::

## Percurso pedagógico

Siga a ordem abaixo na primeira leitura. Quando já conhecer o método, use os
links para voltar diretamente à tarefa que precisa executar.

### 1. Entenda a metodologia

Comece pela [Metodologia](method.md). Cada entrega mantém o problema, os
requisitos, os exemplos de comportamento, o plano técnico, as tarefas, os
testes e as evidências em uma única `spec.md`. O capítulo mostra como esse
arquivo muda ao longo do trabalho e o que comprova a passagem entre os atos.

Os três atos ligam cada fase a uma evidência verificável na `spec.md`:

1. **Ato I — Definir:** entender e validar o que deve ser entregue.
2. **Ato II — Projetar e provar:** preparar tarefas e obter o RED, a falha
   esperada antes da implementação.
3. **Ato III — Entregar e validar:** implementar, obter testes verdes e
   registrar evidências.

Para interpretar cada campo da spec, consulte a [Referência do
método](method-reference.md). Ela detalha Effort, estados, transições, gates,
IDs, pesquisa, tarefas e progresso.

### 2. Instale o Specsfy

Com o método entendido, siga a [Instalação](installation.md) para instalar o
CLI e preparar seu repositório. Ao final, `specsfy skills list` mostra as
skills disponíveis e `specsfy progress --project .` confirma que o CLI
consegue ler o projeto, mesmo que ainda não exista uma spec.

### 3. Faça a primeira entrega

Use [Primeiro projeto](getting-started.md) como tutorial guiado. Você começa
com uma mudança pequena, acompanha a criação da `spec.md` e termina conferindo
os testes e as evidências registradas, sem precisar decorar cada skill.

Para preservar uma ideia sem iniciar a especificação, escolha uma destas
entradas:

- preserve um texto sem perguntas na [Inbox](inbox.md).
- refine e priorize uma proposta no [Backlog](backlog.md).
- organize o MVP e o roadmap com [Milestones](milestones.md).

### 4. Aprofunde o fluxo base

O índice de [Skills base](skills/README.md) apresenta o fluxo completo. Leia
cada etapa nesta ordem:

1. [Capturar uma entrada](skills/specsfy-01-inbox.md).
2. [Refinar no backlog](skills/specsfy-02-backlog.md).
3. [Criar a especificação](skills/specsfy-03-specify.md).
4. [Validar a definição](skills/specsfy-04-validate.md).
5. [Preparar as tarefas](skills/specsfy-05-tasks.md).
6. [Preparar TDD e BDD](skills/specsfy-06-tdd-bdd.md).
7. [Implementar](skills/specsfy-07-implement.md).
8. [Atualizar a especificação](skills/specsfy-update-spec.md).
9. [Consultar o progresso](skills/specsfy-progress.md).
10. [Conversar com a spec](skills/specsfy-interviewer.md).
11. [Entrevistar o MVP](skills/specsfy-mvp-milestone-interviewer.md).
12. [Descobrir informações a guardar](skills/specsfy-data-discovery.md).
13. [Planejar o roadmap](skills/specsfy-roadmap-milestone-interviewer.md).
14. [Governar milestones](skills/specsfy-milestone-governor.md).

Essas páginas explicam quando usar cada skill, como descrever a tarefa em
linguagem natural, o resultado esperado, os erros comuns e o próximo passo.
Quando uma delas precisar perguntar, você recebe uma pergunta numerada por
rodada. Ela traz três ou mais opções numeradas,
`Escrever outra resposta`, `Gere outras opções` e `Avançar` desde o início da
conversa. Cada área aceita no máximo oito perguntas, salvo se você pedir mais e
informar quantas deseja responder.
Depois de avançar, você informa se quer encerrar definitivamente as perguntas
daquela área, responder depois ou retomar agora. O encerramento é respeitado
até você reabrir a área; o adiamento preserva os pontos para retomada.

No setup, o perfil persistente em `.specsfy/USER-PROFILE.md` registra o nível
de conhecimento e as respostas já confirmadas. O agente consulta esse arquivo,
a conversa e as fontes do projeto antes de perguntar novamente.

### 5. Opere o projeto no dia a dia

Depois da primeira entrega, escolha os guias ligados à sua rotina:

- [CLI e TUI](cli.md): interface visual e acompanhamento.
- [Referência dos comandos](cli-reference.md): parâmetros, efeitos, saídas e
  exemplos do CLI.
- [Informações permanentes do projeto](project-context.md): stack, regras,
  banco e convenções.
- [Design system de interface](design-system.md): regras macro, padrões CRUD,
  estados e exceções com alcance.
- [Documentação do sistema](system-documentation.md): documentação técnica
  derivada da aplicação.
- [Mudanças posteriores](update-spec.md): como incorporar um novo requisito à
  mesma especificação.

### 6. Avance quando precisar

Os próximos guias são opcionais. Consulte-os quando a entrega exigir uma
integração ou tecnologia específica:

- [Especialistas](specialists.md), para conhecimento técnico adicional.
- [Da versão ao servidor](deploy.md), para ligar `SEMVER`, imagem, Ansible e
  Docker Swarm em um deploy verificável.
- [Uso avançado](advanced-usage.md), para automação e integrações.
- aplicação em projetos [Laravel](laravel.md), [Astro](astro.md) ou
  [Next.js](nextjs.md).
- [Quadro técnico](../develop/modules.md), para conhecer os módulos do monorepo.
- [Créditos](credits.md), para autoria e identidade do projeto.

Se você pretende contribuir ou modificar o próprio framework, continue no
[guia técnico](../develop/README.md). Ele é um percurso separado do uso em
projetos consumidores.

## Conversa contínua entre etapas

Quando uma etapa depende de outra skill, o agente anuncia a transição, explica
o que falta e retoma o trabalho na mesma conversa. Você acompanha a mudança de
etapa sem repetir a instrução inicial nem escolher manualmente cada skill.

## A ideia central em um exemplo

Imagine uma página de boas-vindas. Você pode preservar a ideia, refiná-la no
backlog e promovê-la até chegar a:

```text
specs/<estado>/0001-pagina-boas-vindas/spec.md
```

Em seguida, o agente valida a definição, organiza tarefas, prepara testes,
implementa e registra evidências nesse mesmo arquivo. Se depois você solicitar
um botão novo, a alteração retorna à mesma `spec.md`. O agente reabre somente
os atos cujas provas perderam validade, sem criar `plan.md`, `tasks.md` ou
outra fonte normativa.

Para começar esse percurso com orientação passo a passo, siga agora
[a Metodologia](method.md).
