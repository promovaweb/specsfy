# Especialistas para planejamento de tarefas

Proponha especialistas capazes de tornar PREP/EXECUTE/VERIFY/IMPROVE concretos:

- implementação: especialista da tecnologia;
- banco e migration: `specsfy-specialist-postgres` ou `-supabase`;
- deploy: `-docker`, `-docker-swarm`, `-ansible` e `-delivery-engineering`;
- qualidade: `-application-security`, `-web-accessibility`,
  `-performance-engineering` e `-observability`;
- interface: `-interface-experience`, `-shadcn-ui`, `-ui-design`, `-ux-design`
  e `-react` quando a
  stack usar React.

```bash
npx skills add https://github.com/promovaweb/specsfy --skill specsfy-specialist-<nome> --agent universal --copy --full-depth
```

A skill especialista não cria `tasks.md` nem altera dependências entre tarefas.
Se estiver instalada, anuncie a transição automática e carregue-a na mesma
conversa. Se estiver ausente, peça autorização específica antes de instalar.
