# Guia completo do usuário

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="../../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../../brand/logo/icon.png" alt="Logo do Specsfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

Com o Specsfy, você transforma uma ideia em software testado sem espalhar
requisitos, planos e tarefas por vários arquivos. Você conversa normalmente
com o agente, enquanto as skills reúnem o trabalho em uma única especificação.
Nesse arquivo, você consegue conferir o que será entregue, quais testes
comprovam o comportamento e o que já foi concluído.

Este guia começa pela lógica da metodologia, prepara o ambiente e acompanha
uma entrega completa. Os capítulos seguintes explicam a rotina com o CLI, as
mudanças posteriores e os recursos avançados. Você não precisa conhecer a
implementação do framework para seguir esse percurso.

::: {.online-only}

## Leia online ou como ebook

Este mesmo percurso compõe a edição portátil vigente, com a mesma versão do
framework. Use o PDF para leitura e impressão ou o EPUB em leitores que
permitem ajustar fonte e tamanho:

- [PDF](../../ebook/ebook-specsfy.pdf), para leitura, compartilhamento e
  impressão.
- [EPUB](../../ebook/ebook-specsfy.epub), para leitores digitais com fonte e
  tamanho ajustáveis.

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

1. **Ato I (Definir):** entender e validar o que deve ser entregue.
2. **Ato II (Projetar e provar):** preparar tarefas e obter o RED, a falha
   esperada enquanto o comportamento ainda não existe.
3. **Ato III (Entregar e validar):** implementar, obter testes verdes e
   registrar evidências.

Para interpretar cada campo da spec, consulte a [Referência do
método](method-reference.md). Ela detalha Effort, estados, transições, gates,
IDs, pesquisa, tarefas e progresso.

### 2. Instale o Specsfy

Com o método entendido, siga a [Instalação](installation.md) para instalar o
CLI e preparar seu repositório. Ao final, `specsfy skills list` mostra os
especialistas do catálogo e `specsfy progress --project .` confirma que o CLI
consegue ler o projeto, mesmo que ainda não exista uma spec.

### 3. Faça a primeira entrega

Use [Primeiro projeto](getting-started.md) como tutorial guiado. Você começa
com uma mudança pequena, acompanha a criação da `spec.md` e termina conferindo
os testes e as evidências registradas, sem precisar decorar cada skill.

Depois do tutorial, veja o mesmo método aplicado a outras situações:

- [Casos de uso](use-cases.md): receitas para bug, CRUD com interface, MVP,
  mudança tardia, banco de dados, projeto existente e retomada de trabalho.
- [Exemplos completos](examples.md): cada arquivo produzido por uma entrega
  completa, do texto original aos testes, com mensagens prontas para cada
  etapa.

Para preservar uma ideia sem iniciar a especificação, escolha uma das entradas
abaixo de acordo com o que você quer fazer com ela agora, sem perder o texto
original:

- preserve um texto sem perguntas na [Inbox](inbox.md).
- refine e priorize uma proposta no [Backlog](backlog.md).
- organize o MVP e o roadmap com [Milestones](milestones.md).

### 4. Aprofunde o fluxo base

O índice de [Skills base](skills/README.md) reúne as 11 skills do framework.
Leia cada etapa do fluxo nesta ordem:

1. [Capturar uma entrada](skills/specsfy-01-inbox.md).
2. [Refinar no backlog](skills/specsfy-02-backlog.md).
3. [Criar a especificação](skills/specsfy-03-specify.md).
4. [Validar a definição](skills/specsfy-04-validate.md).
5. [Preparar as tarefas](skills/specsfy-05-tasks.md).
6. [Preparar os testes e implementar](skills/specsfy-06-implement.md), nos
   modos `tests` e `implement`.
7. [Atualizar a especificação](skills/specsfy-update-spec.md).
8. [Conversar com a spec](skills/specsfy-interviewer.md).
9. [Cuidar dos milestones](skills/specsfy-milestones.md).
10. [Descobrir informações a guardar](project-context.md#conversar-sobre-os-dados).

Para consultar o progresso sem alterar nada, leia
[Ver o progresso](reference.md#ver-o-progresso).

Essas páginas explicam quando usar cada skill, como descrever a tarefa em
linguagem natural, o resultado esperado, os erros comuns e o próximo passo.
O item 10 leva ao modo `data-discovery` da `specsfy-setup`, que conversa sobre
os dados que o sistema precisa guardar.
Quando uma delas precisar perguntar, você recebe uma pergunta numerada por
rodada. Ela traz três ou mais opções numeradas,
`Escrever outra resposta`, `Gere outras opções` e `Avançar` desde o início da
conversa. Cada área aceita no máximo oito perguntas, salvo quando você solicita
mais e informa quantas deseja responder.
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
- [Informações permanentes do projeto](project-context.md): stack, banco e
  convenções confirmadas.
- [Design system de interface](design-system.md): orientações gerais, padrões
  CRUD,
  estados e exceções com alcance.
- [Documentação do sistema](system-documentation.md): documentação técnica
  derivada da aplicação.
- [Mudanças posteriores](update-spec.md): como incorporar um novo requisito à
  mesma especificação.

### 6. Avance quando precisar

Os próximos guias são opcionais. Consulte-os quando a entrega exigir uma
integração ou tecnologia específica:

- [Especialistas](specialists.md), para conhecimento técnico adicional, com
  um guia para cada especialista do catálogo:
  - [Acessibilidade Web](specialists/web-accessibility.md)
  - [Ansible](specialists/ansible.md)
  - [APIs Web](specialists/web-api-design.md)
  - [Arquitetura de Software](specialists/software-architecture.md)
  - [Code Review](specialists/code-review.md)
  - [Componentes React](specialists/react-ui-components.md)
  - [Debian Server](specialists/debian-server.md)
  - [Debugging](specialists/debugging.md)
  - [Deploy](specialists/deploy.md)
  - [Design System](specialists/design-system.md)
  - [Docker](specialists/docker.md)
  - [Docker Swarm](specialists/docker-swarm.md)
  - [Engenharia de Entrega](specialists/delivery-engineering.md)
  - [Experiência de Interface](specialists/interface-experience.md)
  - [Gestor de pacotes Laravel](specialists/laravel-package-manager.md)
  - [Gitflow](specialists/gitflow.md)
  - [Laravel](specialists/laravel.md)
  - [Modelagem de Dados](specialists/data-modeling.md)
  - [Modelagem de Domínio](specialists/domain-modeling.md)
  - [Next.js](specialists/nextjs.md)
  - [Observabilidade](specialists/observability.md)
  - [Performance](specialists/performance-engineering.md)
  - [Pesquisa Técnica](specialists/technical-research.md)
  - [PostgreSQL](specialists/postgres.md)
  - [Prototipação](specialists/prototyping.md)
  - [React](specialists/react.md)
  - [Redis](specialists/redis.md)
  - [Relatório de servidor](specialists/server-report.md)
  - [Resolução de Conflitos Git](specialists/merge-conflict-resolution.md)
  - [ReUI](specialists/reui.md)
  - [Segurança de Aplicações](specialists/application-security.md)
  - [shadcn/ui](specialists/shadcn-ui.md)
  - [Supabase](specialists/supabase.md)
  - [Tailwind CSS](specialists/tailwind-css.md)
  - [TypeScript](specialists/typescript.md)
  - [UI Design](specialists/ui-design.md)
  - [UX Design](specialists/ux-design.md)
  - [Versionamento](specialists/versioning.md)
- [Como funciona o Deploy da aplicação](deploy.md), para ligar `SEMVER`, imagem, Ansible e
  Docker Swarm em um deploy verificável.
- [Servidores e comandos de deploy](deploy-operations.md), para cadastrar
  servidores, conferir conexões, sincronizar chaves públicas e usar os comandos
  curtos no Herdr.
- [Senha do Vault e deploy pela IA](deploy-vault.md), para configurar a senha
  fora do Git e alternar entre execução manual e automatizada.
- [Uso avançado](advanced-usage.md), para automação e integrações.
- aplicação em projetos [Laravel](laravel.md) ou [Next.js](nextjs.md).
- [Quadro técnico](../develop/modules.md), para conhecer os módulos do monorepo.
- [Referência rápida](reference.md), para consultar arquivos, estados, gates,
  IDs, skills, comandos, glossário e fontes externas em uma página.
- [Créditos](credits.md), para autoria e identidade do projeto.

Para contribuir ou modificar o próprio framework, continue no
[guia técnico](../develop/README.md), um percurso separado do uso em projetos
consumidores.

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

Em seguida, o agente valida a definição, monta as tarefas, prepara testes,
implementa e registra evidências nesse mesmo arquivo. Se depois você solicitar
um botão novo, a alteração retorna à mesma `spec.md`. O agente reabre somente
os atos cujas provas perderam validade, sem criar `plan.md`, `tasks.md` ou
outra fonte normativa.

Para começar esse percurso com orientação passo a passo, siga agora
[a Metodologia](method.md).
