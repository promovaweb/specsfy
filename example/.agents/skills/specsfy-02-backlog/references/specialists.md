# Especialistas sob demanda

Especialistas vivem no catálogo distribuído pelo CLI e usam o prefixo
`specsfy-specialist-`. Proponha somente os necessários à decisão:

- stack detectada: Laravel, Supabase, Postgres, Redis, Docker/Swarm, Ansible,
  React, Astro, Next.js, TypeScript ou Tailwind CSS;
- interface: `ui-design`, `ux-design`, `shadcn-ui` e `web-accessibility`;
- risco transversal: `application-security`, `software-architecture`,
  `web-api-design`, `observability` ou `performance-engineering`;
- descoberta complexa: `domain-modeling`, `prototyping` ou `technical-research`.

Instale no projeto consumidor:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-<nome> --agent universal --copy --full-depth
```

Se a skill já estiver instalada, anuncie a transição automática e carregue-a na
mesma conversa. Se estiver ausente, avise que usará `npx skills add`, peça
autorização específica antes de instalar e continue automaticamente depois. Nunca instale no workspace
`promovaweb/specsfy` nem carregue especialista sem relação com a tarefa.
