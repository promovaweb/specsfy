# Receitas MCP para o Termfy

Estas receitas usam o SDK e o Zod instalados no starter kit, sem API externa
ou cofre. Servem para adaptar e testar contratos antes de integrar uma
funcionalidade ao produto. Leia [o contrato](../tool-contract.md) e
[compatibilidade](../sources-and-compatibility.md) antes de copiar.

| Arquivo | Finalidade |
| --- | --- |
| [tasks-tools.ts](tasks-tools.ts) | Tools `tasks_list` e `tasks_get`, schemas, projeção pública e cancelamento |
| [resources-prompts.ts](resources-prompts.ts) | Resource fixo, template com tópicos permitidos e prompt de revisão |
| [recipe-server.ts](recipe-server.ts) | Montagem isolada e fixture com três tarefas |
| [stdio-server.ts](stdio-server.ts) | Entrada do subprocesso de teste |
| [recipes.test.ts](recipes.test.ts) | Contratos pelo Client, transporte em memória e stdio real |

## Adaptar ao produto

1. Leia a spec e escolha somente as interfaces previstas.
2. Para experimentar os arquivos juntos, copie-os para uma pasta própria
   dentro de `template/`, como `template/mcp-recipes/`. Os imports de tipos
   relativos pressupõem essa profundidade.
3. Ao mover para `src/mcp/tools/` ou `src/mcp/resources/`, ajuste o import de
   `Registrar` para `../server.ts`. Reutilize serviços do domínio.
4. Chame os registradores em `registerAll`. Use `manifest.bin` como scheme
   dos resources. Não copie a identidade fictícia `recipe` para o produto.
5. Atualize `docs/mcp.md`, testes, catálogo e itens da spec. Deixe a
   configuração dos agentes com `termfy-mcp-client`.

`list()` representa um snapshot estável e síncrono. Para HTTP, adapte a
interface, use await, encaminhe AbortSignal e trate exceções também na lista.
O cursor decimal não atende automaticamente uma coleção mutável. A receita
`get()` já demonstra o tratamento de falhas e prazo local.

## Chamadas para explorar

| Operação | Entrada | Resultado esperado |
| --- | --- | --- |
| `tasks_list` | `{}` | Três tarefas da fixture |
| `tasks_list` | `{"limit": 2}` | Duas tarefas e cursor `"2"` |
| `tasks_list` | `{"limit": 2, "cursor": "2"}` | Última tarefa sem continuação |
| `tasks_get` | `{"id": "a"}` | Tarefa `Check docs` |
| `tasks_get` | `{"id": "missing"}` | `isError` com código `NOT_FOUND` |
| Resource | `recipe://task-guide/limits` | Markdown com limite da página |
| Prompt `review_tasks` | `{"focus": "documentation"}` | Mensagem de revisão sem executar operações |

## Validar

Pela raiz do Hub:

```bash
npm run validar:termfy-mcp
```

O comando compila todas as receitas e executa a suíte com Node.js. Não exige
um cliente de desktop nem credenciais. A suíte não cobre o binário completo,
HTTP remoto, escrita, notificações de progresso ou Tasks duráveis. Acrescente
esses testes quando a spec os exigir.
