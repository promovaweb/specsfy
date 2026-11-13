# Diagnóstico do servidor MCP

Comece pela versão instalada, comando executado, cwd, variáveis necessárias
e método MCP que falhou. Registre somente informações sem segredos. Use as
[receitas de teste](examples/README.md) para separar defeito de handler,
transporte e configuração do cliente.

| Sintoma | Conferência e correção |
| --- | --- |
| Erro ao interpretar JSON | Procure banner, spinner ou log em stdout, inclusive em imports |
| Tool aparece no código, mas não no cliente | Confira `registerAll`, processo reiniciado pelo próprio teste e descoberta real |
| `mcp --list` diverge de `tools/list` | Compare os dois registros; catálogo não é validado pelo SDK |
| `isError: true` com entrada aparentemente válida | Confira schema, valores padrão e assinatura da versão instalada |
| Cliente rejeita saída estruturada | Compare objeto retornado e `outputSchema`, inclusive tipos e campos obrigatórios |
| Resource template aparece, instâncias não | Confira callback `list` e a diferença entre templates e resources |
| Prompt retorna erro | Confira strings em `arguments` e campos obrigatórios de `argsSchema` |
| Processo não termina | Feche Client e transporte em `finally`; procure timers, streams e trabalho pendente |
| Cancelamento não para HTTP | Encaminhe o signal ao fetch e confira se a biblioteca respeita abort |
| Funciona no shell, falha no agente | Use caminho absoluto, cwd explícito e ambiente mínimo necessário |
| Texto privado aparece no erro | Trate a mensagem na chamada do serviço; não deixe `error.message` chegar ao SDK |

## Inspector e cliente real

O Inspector ajuda a conferir descoberta e chamadas, mas não substitui testes
automatizados. O agente pode iniciá-lo no projeto com a ferramenta oficial,
conforme [mcp-tests.md](mcp-tests.md). Não desative autenticação do Inspector
nem publique o proxy de diagnóstico na rede para contornar configuração.

Ao corrigir uma falha, acrescente o caso à suíte do produto e relate versão,
entrada, saída esperada e resultado obtido. Se o problema exigir alteração
de protocolo ou transporte, atualize a spec antes de ampliar a implementação.
