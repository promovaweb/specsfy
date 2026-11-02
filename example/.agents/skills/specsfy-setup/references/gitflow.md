# Especialista de branch sob demanda

O setup não escolhe modelo de branch por iniciativa própria. `git branch -a` já
existente, uma branch chamada `develop` ou qualquer outro sinal do repositório
não autorizam propor Gitflow. A escolha do modelo de branch pertence à pessoa
que conduz o projeto.

- Carregar `$specsfy-specialist-gitflow` somente quando a pessoa pedir
  Gitflow explicitamente nesta conversa, ou quando `RULES.md` já registrar
  essa escolha de uma tarefa anterior.
- Ao carregar, registrar a convenção confirmada (branches permanentes,
  prefixos de `feature/`, `release/`, `hotfix/` e política de merge) em
  `.specsfy/RULES.md` via `$specsfy-aux-rules`, para que o setup não precise
  perguntar de novo na próxima execução.
- Se a pessoa não mencionar Gitflow nem indicar essa preferência, seguir o
  setup normalmente sem branch model nenhum declarado. A ausência de menção
  não é uma lacuna a resolver por inferência.

Instale no projeto consumidor:

```bash
npx skills add https://github.com/promovaweb/specsfy --skill specsfy-specialist-gitflow --agent universal --copy --full-depth
```

Se a skill já estiver instalada, anuncie a transição automática e carregue-a
na mesma conversa. Se estiver ausente, peça autorização específica antes de
instalar e continue automaticamente depois.
