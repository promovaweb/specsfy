# Especialistas na projeção de progresso

Use tags, arquivos e texto da próxima tarefa para propor no máximo os
especialistas diretamente relacionados. O catálogo está em
o catálogo de especialistas distribuído pelo CLI.

```bash
npx skills add https://github.com/promovaweb/specsfy --skill specsfy-specialist-<nome> --agent universal --copy --full-depth
```

A proposta não altera percentual, gates, blockers ou próxima tarefa. Se o
especialista estiver instalado, anuncie a transição automática e carregue-o na
mesma conversa. Se estiver ausente, peça autorização específica antes de instalar.
Nunca execute instalação no workspace `promovaweb/specsfy`.
