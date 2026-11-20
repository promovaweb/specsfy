# Escolha do nível de teste

| Comportamento | Nível preferido | Evite |
| --- | --- | --- |
| Regra pura, transformação, validação | Unidade | subir servidor ou banco sem necessidade |
| Persistência, fila, cache, serviço interno | Integração | mockar o adaptador que precisa ser provado |
| Contrato HTTP/evento externo | Contrato ou integração | depender de produção |
| Jornada essencial visível ao usuário | Aceite/E2E | reproduzir toda regra interna no E2E |
| Desempenho, concorrência, resiliência | Teste especializado mensurável | afirmar apenas que “parece rápido” |
| Layout ou acessibilidade | DOM/acessibilidade e poucos fluxos E2E | screenshot como única evidência sem critério |

Use a menor camada que observa o resultado especificado. Um `AC` pode exigir mais de um nível quando cruza fronteiras, mas cada teste deve ter uma razão distinta.
