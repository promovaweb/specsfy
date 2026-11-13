# Gravidade e formato dos achados

Classifique pelo efeito demonstrável e pelas condições para reproduzi-lo.
Use a mesma escala em toda a revisão.

| Nível | Quando usar | Exemplo |
| --- | --- | --- |
| P0 | exposição de segredo real ou perda de dados com efeito imediato e amplo | valor do cofre devolvido por tool MCP sem controle |
| P1 | fluxo principal inutilizável ou proteção essencial ausente | texto em stdout interrompe JSON-RPC; operação destrutiva ignora confirmação |
| P2 | comportamento incorreto localizado ou contrato descumprido | exit code errado; item marcado sem teste pertinente; option sem description |
| P3 | problema de apresentação ou manutenção sem alterar o resultado principal | comentário em português; prosa fora das regras editoriais |

Um vazamento pode ser P0 ou P1 conforme o alcance confirmado. Um erro de docs
que orienta apagar dados pode ser P1. Não classifique apenas pela categoria.
Testes que não puderam rodar são limitações; não são automaticamente defeitos.

## Formato

```text
1. [P1] src/mcp/tools/config.ts:42 | Um log do callback escreve texto em stdout e invalida a conversa JSON-RPC. | Remover o log ou enviar diagnóstico sem segredos para stderr.
```

O exemplo ilustra o formato, não afirma uma falha existente. Use sempre a
linha real da versão revisada. Acrescente o comando de reprodução e o exit
code observado quando ajudarem a confirmar a falha. Não inclua valores reais
de tokens, chaves ou senhas. Para cada achado, indique a correção sem editar.

Agrupe ocorrências da mesma causa quando uma correção resolver todas.
Não transforme cada match de uma busca em um achado. Separe ao final os
resultados dos testes, as limitações e os pontos que exigem resposta da pessoa.
