# Skills especialistas

As skills base conduzem a metodologia. As
`specsfy-specialist-*` acrescentam orientação para a tecnologia encontrada no
projeto, como Laravel, Astro, Next.js, Postgres ou Redis. Assim, você instala
somente o conhecimento técnico usado pela aplicação.

## Detectar e instalar

O comando `detect` lê o projeto e mostra recomendações sem instalar arquivos.
O catálogo local só deve ser alterado depois que você revisar os nomes
retornados:

```bash
specsfy skills detect
```

Depois da revisão, informe ao comando `add` apenas os especialistas usados pela
aplicação. O CLI registra cada instalação no `skills-lock.json`, permitindo
conferir depois quais arquivos são gerenciados:

```bash
specsfy skills add \
  specsfy-specialist-laravel \
  specsfy-specialist-postgres \
  specsfy-specialist-redis
```

As skills base podem sugerir um especialista. Quando ele já estiver instalado,
a transição é anunciada e continua na mesma conversa. Quando estiver ausente, o
agente precisa de autorização específica para instalar. A transição entre
skills nunca instala o catálogo inteiro automaticamente.

## Catálogo por domínio

| Domínio | Especialistas |
| --- | --- |
| backend e dados | Laravel, Supabase, Postgres, Redis e APIs web |
| frontend | React, Astro, Next.js, TypeScript e Tailwind CSS |
| interface | shadcn/ui, UI, UX e acessibilidade web |
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
