# Especialistas para TDD orientado pelo BDD

Use o especialista da tecnologia para escolher seam, fixture e comandos
compatíveis. Acrescente conforme o risco:

- acessibilidade: `specsfy-specialist-web-accessibility`;
- segurança: `specsfy-specialist-application-security`;
- performance/carga: `specsfy-specialist-performance-engineering`;
- dados/concorrência: `specsfy-specialist-postgres`, `-supabase` ou `-redis`;
- deploy/falhas: `-docker-swarm`, `-ansible` ou `-delivery-engineering`.

```bash
npx skills add https://github.com/promovaweb/specsfy --skill specsfy-specialist-<nome> --agent universal --copy --full-depth
```

Nenhum especialista pode substituir RED observado ou inventar comportamento.
Se estiver instalado, anuncie a transição automática e carregue-o na mesma
conversa. Se estiver ausente, peça autorização específica antes de instalar.
