# Skills especialistas

As skills base conduzem a metodologia. As
`specsfy-specialist-*` acrescentam orientação para a tecnologia encontrada no
projeto, como Laravel, Astro, Next.js, Postgres ou Redis. Assim, você instala
somente o conhecimento técnico usado pela aplicação.

Na interface, cada uma usa o padrão `Specsfy - Especialista - Nome`, como
`Specsfy - Especialista - Laravel`. O identificador de comando continua
`specsfy-specialist-laravel`.

Para criar ou alterar interfaces, use
`specsfy-specialist-interface-experience` antes dos especialistas de UX e UI.
Ela examina a stack e o sistema atual, organiza as perguntas sobre telas e
garante uma fase específica de interface nas tarefas.

## Detectar e instalar

O comando `detect` lê o projeto e mostra recomendações sem instalar arquivos.
O catálogo local só deve ser alterado depois que você revisar os nomes
retornados:

```bash
specsfy skills detect
```

Depois da revisão, instale apenas os especialistas usados pela aplicação. A
instalação sempre usa `npx skills add` e registra cada escolha no
`skills-lock.json`, permitindo conferir depois quais arquivos são gerenciados:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-laravel \
  --skill specsfy-specialist-postgres \
  --skill specsfy-specialist-redis \
  --agent universal --copy --full-depth
```

As skills base podem sugerir um especialista. Quando ele já estiver instalado,
a transição é anunciada e continua na mesma conversa. Quando estiver ausente, o
agente informa o especialista, a finalidade e as dependências, avisa que usará
`npx skills add` e pede autorização específica para instalar. A transição entre
skills nunca instala o catálogo inteiro automaticamente.

## Instalação no setup

Ao iniciar o setup, você autoriza o Specsfy a detectar e instalar os
especialistas diretamente ligados à stack encontrada, além de um núcleo comum
para modelar dados, domínio e arquitetura. Ele mostra os itens e usa `npx
skills add` no projeto atual. Tecnologias sem sinal no código não entram na
instalação.

| Stack encontrada | Especialista |
| --- | --- |
| Laravel, Supabase, PostgreSQL ou Redis | Laravel, Supabase, PostgreSQL ou Redis correspondente |
| React, Astro, Next.js ou TypeScript | especialista correspondente |
| Tailwind CSS ou shadcn/ui | Tailwind CSS ou shadcn/ui correspondente |
| Docker, Swarm ou Ansible | especialista de plataforma correspondente |
| OpenAPI, OpenTelemetry, Prometheus ou CI/CD | API, observabilidade ou entrega correspondente |
| Todo projeto | Modelagem de Dados, Modelagem de Domínio e Arquitetura de Software |

## Instalação manual

Você pode instalar qualquer especialista do catálogo fora do setup. Essa opção
serve para uma necessidade pontual que a stack ainda não revela, como revisão,
acessibilidade ou pesquisa técnica:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-web-accessibility --agent universal --copy --full-depth
```

O setup não remove especialistas instalados manualmente. Eles permanecem no
projeto e podem ser usados quando a entrega precisar deles.

## Catálogo por domínio

| Domínio | Especialistas |
| --- | --- |
| backend e dados | Laravel, Supabase, Postgres, Redis e APIs web |
| frontend | React, Astro, Next.js, TypeScript e Tailwind CSS |
| interface | experiência de interface, shadcn/ui, UI, UX e acessibilidade web |
| plataforma | Docker, Docker Swarm, Ansible e engenharia de entrega |
| agentes | Hermes Agent (autoria de skills/plugins e operação do runtime) |
| qualidade | segurança, observabilidade e performance |
| design técnico | arquitetura e modelagem de domínio |
| engenharia | code review, debugging, prototipação, pesquisa e conflitos Git |

Cada especialista explica o fluxo de trabalho e as validações próprias da sua
tecnologia. Uma mudança em Eloquent pode combinar Laravel e Postgres, por
exemplo, mas uma alteração isolada em uma página Astro não precisa carregar
orientações de todo o catálogo.

## Relação com as bases

- `specsfy-02-backlog` identifica a necessidade.
- `specsfy-03-specify` registra requisitos e atributos de qualidade.
- `specsfy-04-validate` seleciona lentes de revisão.
- `specsfy-05-tasks` usa checklists técnicos para decompor trabalho.
- `specsfy-06-tdd-bdd` preserva RED/GREEN.
- `specsfy-07-implement` executa de acordo com a stack.
- `specsfy-update-spec` revisa requisitos e atributos de qualidade
  afetados por uma mudança posterior.
- `specsfy-progress` identifica a orientação técnica aplicável e executa a
  transição automática.

A presença de um especialista não aprova gates. O Plan Gate ainda exige um RED
válido, e o Delivery Gate depende dos testes e das evidências registradas na
spec.
