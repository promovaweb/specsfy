# Especialistas para implementação

Detecte manifests e arquivos antes de propor:

- `artisan` → `specsfy-specialist-laravel`;
- `supabase/config.toml` → `specsfy-specialist-supabase`;
- `Dockerfile`/stack → `specsfy-specialist-docker`/`-docker-swarm`;
- `ansible.cfg` → `specsfy-specialist-ansible`;
- React/Astro/Next/Tailwind/shadcn → especialista de mesmo nome;
- risco transversal → segurança, acessibilidade, performance, observabilidade,
  arquitetura ou API.
- pacote Laravel recebido por URL GitHub ou alteração em Composer →
  `specsfy-specialist-laravel-package-manager`.

```bash
npx skills add https://github.com/promovaweb/specsfy --skill specsfy-specialist-<nome> --agent universal --copy --full-depth
```

Não instalar no `promovaweb/specsfy`, não adicionar pacote e não executar deploy como
efeito colateral.
Se o especialista estiver instalado, anuncie a transição automática e
carregue-o na mesma conversa. Se estiver ausente, peça autorização específica
antes de instalar.
